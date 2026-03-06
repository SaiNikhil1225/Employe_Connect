import { Request, Response } from 'express';
import { calculateEmployeeKPIs, calculateTeamKPIs, getEnhancedAttendanceLogs, canRegularizeAttendance } from '../services/attendanceKPIService';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import AttendanceLog from '../models/AttendanceLog';

/**
 * Get enhanced employee KPIs
 * GET /api/attendance/enhanced-stats
 */
export const getEnhancedEmployeeStats = async (req: Request, res: Response) => {
    try {
        const { employeeId, startDate, endDate } = req.query;
        const userId = (employeeId as string) || req.user?.employeeId;

        if (!userId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
        const end = endDate ? new Date(endDate as string) : new Date();

        const kpis = await calculateEmployeeKPIs(userId, { startDate: start, endDate: end });

        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        console.error('Error fetching enhanced employee stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enhanced stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get enhanced team KPIs (for managers/HR)
 * GET /api/attendance/enhanced-team-stats
 */
export const getEnhancedTeamStats = async (req: Request, res: Response) => {
    try {
        const { department, employeeIds, startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
        const end = endDate ? new Date(endDate as string) : new Date();

        const filters: any = {};
        if (department) filters.department = department as string;
        if (employeeIds) {
            filters.employeeIds = (employeeIds as string).split(',');
        }

        const kpis = await calculateTeamKPIs(filters, { startDate: start, endDate: end });

        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        console.error('Error fetching enhanced team stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get enhanced attendance logs with shift-based validation
 * GET /api/attendance/enhanced-logs
 */
export const getEnhancedLogs = async (req: Request, res: Response) => {
    try {
        const { employeeId, department, status, startDate, endDate, page = 1, limit = 30 } = req.query;

        const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
        const end = endDate ? new Date(endDate as string) : new Date();

        const filters: any = {};
        if (employeeId) filters.employeeId = employeeId as string;
        if (department) filters.department = department as string;
        if (status) filters.status = status as string;

        const logs = await getEnhancedAttendanceLogs(filters, { startDate: start, endDate: end });

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
    } catch (error) {
        console.error('Error fetching enhanced logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Validate shift-based regularization eligibility
 * POST /api/attendance/validate-regularization
 */
export const validateRegularization = async (req: Request, res: Response) => {
    try {
        const { employeeId, date } = req.body;

        if (!employeeId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and date are required'
            });
        }

        const targetDate = new Date(date);
        const log = await AttendanceLog.findOne({
            employeeId,
            date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
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

        const validation = canRegularizeAttendance(log);

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
    } catch (error) {
        console.error('Error validating regularization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate regularization',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
