"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegularization = exports.getEnhancedLogs = exports.getEnhancedTeamStats = exports.getEnhancedEmployeeStats = void 0;
const attendanceKPIService_1 = require("../services/attendanceKPIService");
const date_fns_1 = require("date-fns");
const AttendanceLog_1 = __importDefault(require("../models/AttendanceLog"));
/**
 * Get enhanced employee KPIs
 * GET /api/attendance/enhanced-stats
 */
const getEnhancedEmployeeStats = async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;
        const userId = employeeId || req.user?.employeeId;
        if (!userId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }
        const start = startDate ? new Date(startDate) : (0, date_fns_1.subDays)(new Date(), 30);
        const end = endDate ? new Date(endDate) : new Date();
        const kpis = await (0, attendanceKPIService_1.calculateEmployeeKPIs)(userId, { startDate: start, endDate: end });
        res.json({
            success: true,
            data: kpis
        });
    }
    catch (error) {
        console.error('Error fetching enhanced employee stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enhanced stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getEnhancedEmployeeStats = getEnhancedEmployeeStats;
/**
 * Get enhanced team KPIs (for managers/HR)
 * GET /api/attendance/enhanced-team-stats
 */
const getEnhancedTeamStats = async (req, res) => {
    try {
        const { department, employeeIds, startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : (0, date_fns_1.subDays)(new Date(), 30);
        const end = endDate ? new Date(endDate) : new Date();
        const filters = {};
        if (department)
            filters.department = department;
        if (employeeIds) {
            filters.employeeIds = employeeIds.split(',');
        }
        const kpis = await (0, attendanceKPIService_1.calculateTeamKPIs)(filters, { startDate: start, endDate: end });
        res.json({
            success: true,
            data: kpis
        });
    }
    catch (error) {
        console.error('Error fetching enhanced team stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getEnhancedTeamStats = getEnhancedTeamStats;
/**
 * Get enhanced attendance logs with shift-based validation
 * GET /api/attendance/enhanced-logs
 */
const getEnhancedLogs = async (req, res) => {
    try {
        const { employeeId, department, status, startDate, endDate, page = 1, limit = 30 } = req.query;
        const start = startDate ? new Date(startDate) : (0, date_fns_1.subDays)(new Date(), 30);
        const end = endDate ? new Date(endDate) : new Date();
        const filters = {};
        if (employeeId)
            filters.employeeId = employeeId;
        if (department)
            filters.department = department;
        if (status)
            filters.status = status;
        const logs = await (0, attendanceKPIService_1.getEnhancedAttendanceLogs)(filters, { startDate: start, endDate: end });
        // Apply pagination
        const startIndex = (+page - 1) * +limit;
        const endIndex = startIndex + +limit;
        const paginatedLogs = logs.slice(startIndex, endIndex);
        res.json({
            success: true,
            data: {
                logs: paginatedLogs,
                pagination: {
                    total: logs.length,
                    page: +page,
                    limit: +limit,
                    pages: Math.ceil(logs.length / +limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching enhanced logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getEnhancedLogs = getEnhancedLogs;
/**
 * Validate shift-based regularization eligibility
 * POST /api/attendance/validate-regularization
 */
const validateRegularization = async (req, res) => {
    try {
        const { employeeId, date } = req.body;
        if (!employeeId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and date are required'
            });
        }
        const targetDate = new Date(date);
        const log = await AttendanceLog_1.default.findOne({
            employeeId,
            date: { $gte: (0, date_fns_1.startOfDay)(targetDate), $lte: (0, date_fns_1.endOfDay)(targetDate) }
        }).lean();
        if (!log) {
            return res.json({
                success: true,
                data: {
                    canRegularize: true,
                    reason: 'No attendance record found',
                    shift: 'General',
                    requiresRegularization: true
                }
            });
        }
        const validation = (0, attendanceKPIService_1.canRegularizeAttendance)(log);
        res.json({
            success: true,
            data: {
                ...validation,
                shift: log.shift || 'General',
                effectiveHours: log.effectiveHours,
                lateMinutes: log.lateMinutes || 0,
                requiresRegularization: validation.canRegularize
            }
        });
    }
    catch (error) {
        console.error('Error validating regularization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate regularization',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.validateRegularization = validateRegularization;
//# sourceMappingURL=attendanceEnhancedController.js.map