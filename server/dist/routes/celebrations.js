"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Celebration_1 = __importDefault(require("../models/Celebration"));
const Employee_1 = __importDefault(require("../models/Employee"));
const router = express_1.default.Router();
// Get all celebrations with filters
router.get('/', async (req, res) => {
    try {
        const { eventType, status, department, location, dateFrom, dateTo, milestone } = req.query;
        const query = {};
        if (eventType && eventType !== 'all')
            query.eventType = eventType;
        if (status && status !== 'all')
            query.status = status;
        if (department && department !== 'all')
            query.department = department;
        if (location && location !== 'all')
            query.location = location;
        if (dateFrom || dateTo) {
            query.eventDate = {};
            if (dateFrom)
                query.eventDate.$gte = new Date(dateFrom);
            if (dateTo)
                query.eventDate.$lte = new Date(dateTo);
        }
        if (milestone) {
            const milestoneNum = parseInt(milestone);
            if (!isNaN(milestoneNum)) {
                query.milestoneYears = milestoneNum;
            }
        }
        const celebrations = await Celebration_1.default.find(query).sort({ eventDate: 1 });
        // Validate that all celebration employees exist in the database
        const employeeIds = [...new Set(celebrations.map(c => c.employeeId))];
        const existingEmployees = await Employee_1.default.find({
            employeeId: { $in: employeeIds }
        }).select('employeeId name department location');
        const existingEmployeeIds = new Set(existingEmployees.map(e => e.employeeId));
        // Filter celebrations to only include those with existing employees
        const validCelebrations = celebrations.filter(c => existingEmployeeIds.has(c.employeeId));
        // Log if any invalid celebrations were filtered out
        const filteredCount = celebrations.length - validCelebrations.length;
        if (filteredCount > 0) {
            console.log(`⚠️  Filtered out ${filteredCount} celebrations with non-existent employees`);
        }
        res.json({ success: true, data: validCelebrations });
    }
    catch (error) {
        console.error('Failed to fetch celebrations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch celebrations' });
    }
});
// Get upcoming birthdays (next N days)
router.get('/birthdays/upcoming', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const employees = await Employee_1.default.find({ status: 'active' }).sort({ name: 1 });
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + days);
        const upcomingBirthdays = employees
            .filter(emp => {
            if (!emp.dateOfBirth)
                return false;
            const dob = new Date(emp.dateOfBirth);
            const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            return thisYearBirthday >= today && thisYearBirthday <= endDate;
        })
            .map(emp => {
            const dob = new Date(emp.dateOfBirth);
            const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
                employeeId: emp.employeeId,
                name: emp.name,
                department: emp.department,
                location: emp.location,
                birthdayDate: thisYearBirthday,
                daysUntil,
                email: emp.email,
                phone: emp.phone,
                profilePhoto: emp.profilePhoto
            };
        })
            .sort((a, b) => a.daysUntil - b.daysUntil);
        res.json({ success: true, data: upcomingBirthdays });
    }
    catch (error) {
        console.error('Failed to fetch upcoming birthdays:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming birthdays' });
    }
});
// Get current month birthdays count
router.get('/birthdays/month', async (req, res) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth();
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const employees = await Employee_1.default.find({ status: 'active' });
        const monthBirthdays = employees.filter(emp => {
            if (!emp.dateOfBirth)
                return false;
            const dob = new Date(emp.dateOfBirth);
            return dob.getMonth() === month;
        });
        // Breakdown by weeks
        const weeks = [0, 0, 0, 0];
        monthBirthdays.forEach(emp => {
            const dob = new Date(emp.dateOfBirth);
            const day = dob.getDate();
            const weekIndex = Math.floor((day - 1) / 7);
            if (weekIndex < 4)
                weeks[weekIndex]++;
        });
        res.json({
            success: true,
            data: {
                total: monthBirthdays.length,
                weeks,
                byDepartment: monthBirthdays.reduce((acc, emp) => {
                    acc[emp.department] = (acc[emp.department] || 0) + 1;
                    return acc;
                }, {}),
                employees: monthBirthdays.map(emp => ({
                    employeeId: emp.employeeId,
                    name: emp.name,
                    department: emp.department,
                    location: emp.location,
                    birthdayDate: new Date(year, month, new Date(emp.dateOfBirth).getDate()),
                    profilePhoto: emp.profilePhoto
                }))
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch month birthdays:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch month birthdays' });
    }
});
// Get upcoming anniversaries
router.get('/anniversaries/upcoming', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const employees = await Employee_1.default.find({ status: 'active' }).sort({ name: 1 });
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + days);
        const upcomingAnniversaries = employees
            .filter(emp => {
            if (!emp.dateOfJoining)
                return false;
            const doj = new Date(emp.dateOfJoining);
            const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
            return thisYearAnniversary >= today && thisYearAnniversary <= endDate;
        })
            .map(emp => {
            const doj = new Date(emp.dateOfJoining);
            const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
            const yearsOfService = today.getFullYear() - doj.getFullYear();
            const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let milestoneType = '';
            if (yearsOfService === 1)
                milestoneType = '1 Year';
            else if (yearsOfService === 5)
                milestoneType = '5 Years';
            else if (yearsOfService === 10)
                milestoneType = '10 Years';
            else if (yearsOfService === 15)
                milestoneType = '15 Years';
            else if (yearsOfService === 20)
                milestoneType = '20 Years';
            else if (yearsOfService >= 25)
                milestoneType = '25+ Years';
            else
                milestoneType = `${yearsOfService} Years`;
            return {
                employeeId: emp.employeeId,
                name: emp.name,
                department: emp.department,
                location: emp.location,
                anniversaryDate: thisYearAnniversary,
                yearsOfService,
                milestoneType,
                daysUntil,
                email: emp.email,
                phone: emp.phone,
                profilePhoto: emp.profilePhoto
            };
        })
            .sort((a, b) => a.daysUntil - b.daysUntil);
        res.json({ success: true, data: upcomingAnniversaries });
    }
    catch (error) {
        console.error('Failed to fetch upcoming anniversaries:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming anniversaries' });
    }
});
// Get anniversary milestones
router.get('/anniversaries/milestones', async (req, res) => {
    try {
        const employees = await Employee_1.default.find({ status: 'active' });
        const today = new Date();
        const milestones = [1, 5, 10, 15, 20, 25];
        const milestoneCounts = {};
        employees.forEach(emp => {
            if (!emp.dateOfJoining)
                return;
            const doj = new Date(emp.dateOfJoining);
            const yearsOfService = today.getFullYear() - doj.getFullYear();
            if (milestones.includes(yearsOfService)) {
                const key = `${yearsOfService} Years`;
                if (!milestoneCounts[key]) {
                    milestoneCounts[key] = { count: 0, employees: [] };
                }
                milestoneCounts[key].count++;
                milestoneCounts[key].employees.push({
                    employeeId: emp.employeeId,
                    name: emp.name,
                    department: emp.department,
                    yearsOfService
                });
            }
        });
        res.json({ success: true, data: milestoneCounts });
    }
    catch (error) {
        console.error('Failed to fetch milestones:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch milestones' });
    }
});
// Create new celebration event
// Create new celebration
router.post('/create', async (req, res) => {
    try {
        // Validate required fields
        const { employeeId, employeeName, eventType, eventTitle, eventDate, createdBy } = req.body;
        if (!employeeId || !employeeName || !eventType || !eventTitle || !eventDate || !createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: employeeId, employeeName, eventType, eventTitle, eventDate, createdBy'
            });
        }
        // Validate that the employee exists in the database
        const employee = await Employee_1.default.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: `Employee with ID ${employeeId} not found in database. Please verify the employee exists.`
            });
        }
        const celebration = new Celebration_1.default(req.body);
        await celebration.save();
        res.json({ success: true, data: celebration, message: 'Celebration created successfully' });
    }
    catch (error) {
        console.error('Failed to create celebration:', error);
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: `Validation error: ${validationErrors.join(', ')}`
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create celebration'
        });
    }
});
// Update celebration
router.put('/:id/update', async (req, res) => {
    try {
        const celebration = await Celebration_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: celebration });
    }
    catch (error) {
        console.error('Failed to update celebration:', error);
        res.status(500).json({ success: false, message: 'Failed to update celebration' });
    }
});
// Delete celebration
router.delete('/:id/delete', async (req, res) => {
    try {
        await Celebration_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Celebration deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete celebration:', error);
        res.status(500).json({ success: false, message: 'Failed to delete celebration' });
    }
});
// Mark as celebrated
router.post('/:id/mark-celebrated', async (req, res) => {
    try {
        const { celebratedBy } = req.body;
        const celebration = await Celebration_1.default.findByIdAndUpdate(req.params.id, {
            status: 'celebrated',
            celebratedDate: new Date(),
            celebratedBy
        }, { new: true });
        res.json({ success: true, data: celebration });
    }
    catch (error) {
        console.error('Failed to mark as celebrated:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as celebrated' });
    }
});
// Get statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const [upcomingBirthdaysCount, monthBirthdaysCount, upcomingAnniversariesCount, totalEvents] = await Promise.all([
            Employee_1.default.countDocuments({
                status: 'active',
                dateOfBirth: {
                    $exists: true,
                    $ne: null
                }
            }),
            Employee_1.default.countDocuments({
                status: 'active',
                dateOfBirth: {
                    $exists: true,
                    $ne: null
                }
            }),
            Employee_1.default.countDocuments({
                status: 'active',
                dateOfJoining: {
                    $exists: true,
                    $ne: null
                }
            }),
            Celebration_1.default.countDocuments()
        ]);
        res.json({
            success: true,
            data: {
                upcomingBirthdays: 0, // Will be calculated on frontend
                monthBirthdays: 0, // Will be calculated on frontend
                upcomingAnniversaries: 0, // Will be calculated on frontend
                totalEvents
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});
exports.default = router;
//# sourceMappingURL=celebrations.js.map