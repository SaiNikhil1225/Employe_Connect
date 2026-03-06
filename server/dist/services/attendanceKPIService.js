"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIFTS = void 0;
exports.calculateEmployeeKPIs = calculateEmployeeKPIs;
exports.calculateTeamKPIs = calculateTeamKPIs;
exports.canRegularizeAttendance = canRegularizeAttendance;
exports.getEnhancedAttendanceLogs = getEnhancedAttendanceLogs;
const AttendanceLog_1 = __importDefault(require("../models/AttendanceLog"));
const RegularizationRequest_1 = __importDefault(require("../models/RegularizationRequest"));
const WFHRequest_1 = __importDefault(require("../models/WFHRequest"));
const Employee_1 = __importDefault(require("../models/Employee"));
const date_fns_1 = require("date-fns");
// Shift definitions matching frontend
exports.SHIFTS = {
    General: { startTime: '10:00', endTime: '19:00', workingHours: 8, graceMinutes: 60 },
    USA: { startTime: '14:00', endTime: '23:00', workingHours: 8, graceMinutes: 60 },
    UK: { startTime: '14:00', endTime: '23:00', workingHours: 8, graceMinutes: 60 },
    MiddleEast: { startTime: '12:00', endTime: '21:00', workingHours: 8, graceMinutes: 60 }
};
/**
 * Calculate expected working days in a date range (excluding weekends)
 */
function calculateExpectedWorkingDays(startDate, endDate) {
    const daysInRange = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
    const workingDays = daysInRange.filter(day => !(0, date_fns_1.isWeekend)(day));
    return workingDays.length;
}
/**
 * Calculate Employee Attendance KPIs
 */
async function calculateEmployeeKPIs(employeeId, dateRange) {
    const { startDate, endDate } = dateRange;
    // Calculate expected working days (excluding weekends)
    const expectedWorkingDays = calculateExpectedWorkingDays(startDate, endDate);
    // Get all logs in date range
    const logs = await AttendanceLog_1.default.find({
        employeeId,
        date: { $gte: (0, date_fns_1.startOfDay)(startDate), $lte: (0, date_fns_1.endOfDay)(endDate) }
    });
    console.log(`[KPI Service] Calculating KPIs for ${employeeId}`);
    console.log(`[KPI Service] Found ${logs.length} logs in date range`);
    console.log(`[KPI Service] Expected working days: ${expectedWorkingDays}`);
    // Get regularization and WFH requests
    const [regularizationRequests, wfhRequests] = await Promise.all([
        RegularizationRequest_1.default.countDocuments({
            employeeId,
            createdAt: { $gte: startDate, $lte: endDate }
        }),
        WFHRequest_1.default.countDocuments({
            employeeId,
            fromDate: { $gte: startDate },
            toDate: { $lte: endDate }
        })
    ]);
    // Count present days (including present, wfh, late, half-day)
    const presentDays = logs.filter(log => log.status === 'present' || log.status === 'wfh' || log.status === 'late' || log.status === 'half-day').length;
    // Calculate late arrivals dynamically
    // Consider late if: has checkIn time AND (isLate flag is true OR check-in after 10:30 AM IST)
    const lateArrivalFrequency = logs.filter(log => {
        if (!log.checkInTime)
            return false;
        // Use stored isLate flag OR check if check-in is after 10:30 AM
        if (log.isLate)
            return true;
        // Check if check-in time is after 10:30 AM (local time)
        const checkInHour = new Date(log.checkInTime).getUTCHours() + 5.5; // Convert UTC to IST
        const checkInMinute = new Date(log.checkInTime).getUTCMinutes();
        const checkInTimeInMinutes = (checkInHour * 60) + checkInMinute;
        const lateThreshold = (10 * 60) + 30; // 10:30 AM in minutes
        return checkInTimeInMinutes > lateThreshold;
    }).length;
    // Calculate early logouts dynamically
    // Consider early logout if: has checkOut time AND (isEarlyLogout flag is true OR effectiveHours < 8)
    const earlyLogoutFrequency = logs.filter(log => {
        if (!log.checkOutTime)
            return false;
        // Use stored isEarlyLogout flag OR check if effective hours < 8
        if (log.isEarlyLogout)
            return true;
        // Check if worked less than 8 hours (considering minimum working hours)
        return (log.effectiveHours || 0) < 8;
    }).length;
    console.log(`[KPI Service] Late arrivals: ${lateArrivalFrequency}`);
    console.log(`[KPI Service] Early logouts: ${earlyLogoutFrequency}`);
    // Count on-time check-ins (not late)
    const daysWithCheckIns = logs.filter(log => log.checkInTime).length;
    const onTimeCheckIns = daysWithCheckIns - lateArrivalFrequency;
    // Calculate rates using expected working days
    const attendanceRate = expectedWorkingDays > 0
        ? Math.round((presentDays / expectedWorkingDays) * 100)
        : 0;
    // Punctuality rate: on-time check-ins out of days with actual check-ins
    const punctualityRate = daysWithCheckIns > 0
        ? Math.round((onTimeCheckIns / daysWithCheckIns) * 100)
        : 0;
    console.log(`[KPI Service] Attendance rate: ${attendanceRate}%`);
    console.log(`[KPI Service] Punctuality rate: ${punctualityRate}%`);
    return {
        attendanceRate,
        punctualityRate,
        lateArrivalFrequency,
        earlyLogoutFrequency,
        totalRequests: regularizationRequests + wfhRequests,
        totalWorkingDays: expectedWorkingDays,
        totalDaysPresent: presentDays,
        onTimeCheckIns
    };
}
/**
 * Calculate Manager/HR Team KPIs
 */
async function calculateTeamKPIs(filters, dateRange) {
    const { startDate, endDate } = dateRange;
    const { department, employeeIds } = filters;
    // Calculate expected working days for the period
    const expectedWorkingDays = calculateExpectedWorkingDays(startDate, endDate);
    // Build query for team employees
    const employeeQuery = { status: 'active' };
    if (department)
        employeeQuery.department = department;
    if (employeeIds)
        employeeQuery.employeeId = { $in: employeeIds };
    const teamEmployees = await Employee_1.default.find(employeeQuery);
    const teamEmployeeIds = teamEmployees.map(e => e.employeeId);
    const totalEmployees = teamEmployeeIds.length;
    if (totalEmployees === 0) {
        return {
            totalEmployees: 0,
            totalWorkingDays: expectedWorkingDays,
            lateArrivalPercentage: 0,
            earlyLogoutPercentage: 0,
            totalRequests: 0,
            avgAttendanceRate: 0,
            presentToday: 0,
            absentToday: 0,
            wfhToday: 0
        };
    }
    // Get all logs for team in date range
    const logs = await AttendanceLog_1.default.find({
        employeeId: { $in: teamEmployeeIds },
        date: { $gte: (0, date_fns_1.startOfDay)(startDate), $lte: (0, date_fns_1.endOfDay)(endDate) }
    });
    // Today's stats
    const today = new Date();
    const todayLogs = await AttendanceLog_1.default.find({
        employeeId: { $in: teamEmployeeIds },
        date: { $gte: (0, date_fns_1.startOfDay)(today), $lte: (0, date_fns_1.endOfDay)(today) }
    });
    const presentToday = todayLogs.filter(log => log.status === 'present' || log.status === 'late').length;
    const absentToday = todayLogs.filter(log => log.status === 'absent').length;
    const wfhToday = todayLogs.filter(log => log.status === 'wfh').length;
    // Count logs with check-ins for accurate late/early percentages
    const logsWithCheckIns = logs.filter(log => log.checkInTime);
    const totalCheckInInstances = logsWithCheckIns.length;
    // Late and early logout instances
    const totalLateInstances = logs.filter(log => log.isLate).length;
    const totalEarlyLogoutInstances = logs.filter(log => log.isEarlyLogout).length;
    // Calculate percentages based on actual check-ins
    const lateArrivalPercentage = totalCheckInInstances > 0
        ? Math.round((totalLateInstances / totalCheckInInstances) * 100)
        : 0;
    const earlyLogoutPercentage = totalCheckInInstances > 0
        ? Math.round((totalEarlyLogoutInstances / totalCheckInInstances) * 100)
        : 0;
    // Total requests
    const [regularizationRequests, wfhRequests] = await Promise.all([
        RegularizationRequest_1.default.countDocuments({
            employeeId: { $in: teamEmployeeIds },
            createdAt: { $gte: startDate, $lte: endDate }
        }),
        WFHRequest_1.default.countDocuments({
            employeeId: { $in: teamEmployeeIds },
            fromDate: { $gte: startDate },
            toDate: { $lte: endDate }
        })
    ]);
    // Calculate average attendance rate
    const presentDays = logs.filter(log => log.status === 'present' || log.status === 'wfh' || log.status === 'late' || log.status === 'half-day').length;
    // Average attendance rate: total present days / (expected working days × total employees)
    const totalExpectedAttendanceDays = expectedWorkingDays * totalEmployees;
    const avgAttendanceRate = totalExpectedAttendanceDays > 0
        ? Math.round((presentDays / totalExpectedAttendanceDays) * 100)
        : 0;
    return {
        totalEmployees,
        totalWorkingDays: expectedWorkingDays,
        lateArrivalPercentage,
        earlyLogoutPercentage,
        totalRequests: regularizationRequests + wfhRequests,
        avgAttendanceRate,
        presentToday,
        absentToday,
        wfhToday
    };
}
/**
 * Check if employee can regularize based on shift timing
 */
function canRegularizeAttendance(log) {
    // Cannot regularize if already pending or approved
    if (log.regularizationStatus === 'pending') {
        return { canRegularize: false, reason: 'Regularization request already pending' };
    }
    if (log.regularizationStatus === 'approved') {
        return { canRegularize: false, reason: 'Attendance already regularized and approved' };
    }
    // Allow regularization for absent/missing records
    if (!log.checkInTime || log.status === 'absent') {
        return { canRegularize: true, reason: 'Missing attendance record' };
    }
    const shift = log.shift || 'General';
    const shiftInfo = exports.SHIFTS[shift];
    const delayMinutes = log.lateMinutes || 0;
    const workedMinimumHours = log.effectiveHours >= shiftInfo.workingHours;
    // Case 1: On time and completed minimum hours → No regularization
    if (delayMinutes <= shiftInfo.graceMinutes && workedMinimumHours) {
        return { canRegularize: false, reason: 'Attendance is regular' };
    }
    // Case 2: Late by > grace period → Needs regularization
    if (delayMinutes > shiftInfo.graceMinutes) {
        return {
            canRegularize: true,
            reason: `Late by ${delayMinutes} minutes (Grace: ${shiftInfo.graceMinutes} min)`
        };
    }
    // Case 3: Worked < minimum hours → Needs regularization
    if (!workedMinimumHours) {
        return {
            canRegularize: true,
            reason: `Worked ${log.effectiveHours.toFixed(1)}h (Required: ${shiftInfo.workingHours}h)`
        };
    }
    return { canRegularize: false, reason: 'Attendance is regular' };
}
/**
 * Enhanced attendance aggregation with shift-based validation
 */
async function getEnhancedAttendanceLogs(filters, dateRange) {
    const { startDate, endDate } = dateRange;
    const query = {
        date: { $gte: (0, date_fns_1.startOfDay)(startDate), $lte: (0, date_fns_1.endOfDay)(endDate) }
    };
    if (filters.employeeId)
        query.employeeId = filters.employeeId;
    if (filters.department)
        query.department = filters.department;
    if (filters.status)
        query.status = filters.status;
    const logs = await AttendanceLog_1.default.find(query)
        .sort({ date: -1 })
        .lean();
    // Enhance each log with regularization eligibility
    const enhancedLogs = logs.map(log => {
        const { canRegularize, reason } = canRegularizeAttendance(log);
        return {
            ...log,
            canRegularize,
            regularizationReason: reason,
            shiftTiming: log.shift ? `${log.shift}: ${exports.SHIFTS[log.shift].startTime} - ${exports.SHIFTS[log.shift].endTime} IST` : undefined
        };
    });
    return enhancedLogs;
}
//# sourceMappingURL=attendanceKPIService.js.map