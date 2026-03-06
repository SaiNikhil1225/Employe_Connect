"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Timesheet_1 = __importDefault(require("../models/Timesheet"));
const TimesheetEntry_1 = __importDefault(require("../models/TimesheetEntry"));
const timesheetTransformers_1 = require("../utils/timesheetTransformers");
const router = express_1.default.Router();
// Get timesheet for a specific week
// Now uses date-based entries internally but returns week-based format
router.get('/week/:employeeId/:weekStartDate', async (req, res) => {
    try {
        const { employeeId, weekStartDate } = req.params;
        const weekStart = new Date(weekStartDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        // Find all date-based entries for this week
        const entries = await TimesheetEntry_1.default.find({
            employeeId,
            date: { $gte: weekStart, $lte: weekEnd }
        }).sort({ date: 1 });
        if (entries.length === 0) {
            return res.json(null);
        }
        // Transform to week-based format for UI compatibility
        const rows = (0, timesheetTransformers_1.dateEntriesToWeekRows)(weekStart, entries);
        const totalHours = (0, timesheetTransformers_1.calculateTotalHours)(entries);
        const status = (0, timesheetTransformers_1.determineOverallStatus)(entries);
        const weekEndDateStr = weekEnd.toISOString().split('T')[0];
        res.json({
            employeeId,
            employeeName: entries[0]?.employeeName,
            weekStartDate,
            weekEndDate: weekEndDateStr,
            rows,
            status,
            totalHours,
            submittedAt: entries[0]?.submittedAt
        });
    }
    catch (error) {
        console.error('Error fetching timesheet:', error);
        res.status(500).json({ message: 'Failed to fetch timesheet' });
    }
});
// Get all timesheets for an employee
// Now uses date-based entries grouped by week
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status } = req.query;
        const query = { employeeId };
        if (status) {
            query.approvalStatus = status === 'approved' ? 'approved' :
                status === 'rejected' ? 'rejected' : 'pending';
        }
        // Get all entries, sorted by date
        const entries = await TimesheetEntry_1.default.find(query)
            .sort({ date: -1 })
            .limit(500);
        if (entries.length === 0) {
            return res.json([]);
        }
        // Group entries by week
        const weekMap = new Map();
        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            // Calculate Monday of the week
            const dayOfWeek = entryDate.getDay();
            const diff = entryDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const monday = new Date(entryDate.setDate(diff));
            const mondayStr = monday.toISOString().split('T')[0];
            if (!weekMap.has(mondayStr)) {
                weekMap.set(mondayStr, []);
            }
            weekMap.get(mondayStr).push(entry);
        });
        // Convert each week's entries to timesheet format
        const timesheets = Array.from(weekMap.entries()).map(([weekStartDate, weekEntries]) => {
            const weekStart = new Date(weekStartDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const rows = (0, timesheetTransformers_1.dateEntriesToWeekRows)(weekStart, weekEntries);
            const totalHours = (0, timesheetTransformers_1.calculateTotalHours)(weekEntries);
            const weekStatus = (0, timesheetTransformers_1.determineOverallStatus)(weekEntries);
            return {
                _id: `week-${weekStartDate}`,
                employeeId,
                employeeName: weekEntries[0]?.employeeName,
                weekStartDate,
                weekEndDate: weekEnd.toISOString().split('T')[0],
                rows,
                status: weekStatus,
                totalHours,
                submittedAt: weekEntries[0]?.submittedAt
            };
        });
        res.json(timesheets);
    }
    catch (error) {
        console.error('Error fetching timesheets:', error);
        res.status(500).json({ message: 'Failed to fetch timesheets' });
    }
});
// Save timesheet as draft
// Updated to use date-based storage (kept for backward compatibility)
router.post('/draft', async (req, res) => {
    try {
        const { employeeId, employeeName, weekStartDate, weekEndDate, rows } = req.body;
        if (!employeeId || !employeeName || !weekStartDate || !rows) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const weekStart = new Date(weekStartDate);
        // Transform week-based rows to date-based entries
        const entries = (0, timesheetTransformers_1.weekRowsToDateEntries)(employeeId, employeeName, weekStart, rows);
        if (entries.length === 0) {
            // If no hours, just return success (don't save empty timesheet)
            return res.json({
                employeeId,
                employeeName,
                weekStartDate,
                weekEndDate,
                rows: [],
                status: 'draft',
                totalHours: 0
            });
        }
        // Set status to draft instead of submitted
        entries.forEach(entry => {
            entry.status = 'draft';
            entry.approvalStatus = 'pending';
            entry.submittedAt = null;
        });
        // Bulk upsert entries
        const bulkOps = entries.map(entry => ({
            updateOne: {
                filter: {
                    employeeId: entry.employeeId,
                    date: entry.date,
                    projectId: entry.projectId,
                    udaId: entry.udaId
                },
                update: { $set: entry },
                upsert: true
            }
        }));
        await TimesheetEntry_1.default.bulkWrite(bulkOps);
        // Calculate total hours
        const totalHours = (0, timesheetTransformers_1.calculateTotalHours)(entries);
        res.status(201).json({
            employeeId,
            employeeName,
            weekStartDate,
            weekEndDate,
            rows,
            status: 'draft',
            totalHours
        });
    }
    catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ message: 'Failed to save draft' });
    }
});
// Submit timesheet for approval
// Now stores as date-based entries internally but returns week-based format
router.post('/submit', async (req, res) => {
    try {
        const { employeeId, employeeName, weekStartDate, weekEndDate, rows } = req.body;
        if (!employeeId || !employeeName || !weekStartDate || !rows) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: 'Cannot submit empty timesheet' });
        }
        const weekStart = new Date(weekStartDate);
        // Transform week-based rows to date-based entries
        const entries = (0, timesheetTransformers_1.weekRowsToDateEntries)(employeeId, employeeName, weekStart, rows);
        if (entries.length === 0) {
            return res.status(400).json({ message: 'No hours entered' });
        }
        // Bulk upsert entries (update if exists, insert if new)
        const bulkOps = entries.map(entry => ({
            updateOne: {
                filter: {
                    employeeId: entry.employeeId,
                    date: entry.date,
                    projectId: entry.projectId,
                    udaId: entry.udaId
                },
                update: { $set: entry },
                upsert: true
            }
        }));
        await TimesheetEntry_1.default.bulkWrite(bulkOps);
        // Calculate total hours
        const totalHours = (0, timesheetTransformers_1.calculateTotalHours)(entries);
        // Return response in week-based format (compatible with existing UI)
        res.status(201).json({
            employeeId,
            employeeName,
            weekStartDate,
            weekEndDate,
            rows,
            status: 'submitted',
            totalHours,
            submittedAt: new Date()
        });
    }
    catch (error) {
        console.error('Error submitting timesheet:', error);
        res.status(500).json({
            message: 'Failed to submit timesheet',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Approve timesheet
router.put('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;
        const timesheet = await Timesheet_1.default.findById(id);
        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }
        if (timesheet.status !== 'submitted') {
            return res.status(400).json({ message: 'Only submitted timesheets can be approved' });
        }
        timesheet.status = 'approved';
        timesheet.approvedAt = new Date();
        timesheet.approvedBy = approvedBy;
        await timesheet.save();
        res.json(timesheet);
    }
    catch (error) {
        console.error('Error approving timesheet:', error);
        res.status(500).json({ message: 'Failed to approve timesheet' });
    }
});
// Reject timesheet
router.put('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionReason } = req.body;
        const timesheet = await Timesheet_1.default.findById(id);
        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }
        if (timesheet.status !== 'submitted') {
            return res.status(400).json({ message: 'Only submitted timesheets can be rejected' });
        }
        timesheet.status = 'rejected';
        timesheet.rejectedAt = new Date();
        timesheet.rejectedBy = rejectedBy;
        timesheet.rejectionReason = rejectionReason;
        await timesheet.save();
        res.json(timesheet);
    }
    catch (error) {
        console.error('Error rejecting timesheet:', error);
        res.status(500).json({ message: 'Failed to reject timesheet' });
    }
});
// Delete timesheet (recall)
// Now deletes date-based entries for the week
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // If ID is in format 'week-YYYY-MM-DD', extract the week start date
        if (id.startsWith('week-')) {
            const weekStartDate = id.replace('week-', '');
            const weekStart = new Date(weekStartDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            // Delete all entries for this week
            const result = await TimesheetEntry_1.default.deleteMany({
                date: { $gte: weekStart, $lte: weekEnd }
            });
            return res.json({
                message: 'Timesheet deleted successfully',
                deletedCount: result.deletedCount
            });
        }
        // Fallback: Try to find in old Timesheet collection
        const timesheet = await Timesheet_1.default.findById(id);
        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }
        // Only allow deleting drafts
        if (timesheet.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft timesheets can be deleted' });
        }
        await Timesheet_1.default.findByIdAndDelete(id);
        res.json({ message: 'Timesheet deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting timesheet:', error);
        res.status(500).json({ message: 'Failed to delete timesheet' });
    }
});
exports.default = router;
//# sourceMappingURL=timesheets.js.map