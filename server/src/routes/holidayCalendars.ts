import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { HolidayCalendar } from '../models/HolidayCalendar';
import Employee from '../models/Employee';

const router = express.Router();

const asyncHandler = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

router.use(authenticateToken);
router.use(authorizeRoles('SUPER_ADMIN'));

/**
 * GET /api/holiday-calendars
 * List all holiday calendars with optional filters
 */
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const { year, country, isActive } = req.query;
        const filter: Record<string, unknown> = {};
        if (year) filter.year = Number(year);
        if (country) filter.country = country as string;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const calendars = await HolidayCalendar.find(filter).sort({ year: -1, country: 1 }).lean();

        // Attach employee count per calendar
        const employeeCounts = await Employee.aggregate([
            { $match: { holidayCalendarId: { $ne: null } } },
            { $group: { _id: '$holidayCalendarId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(employeeCounts.map((e) => [String(e._id), e.count]));

        const enriched = calendars.map((cal) => ({
            ...cal,
            employeeCount: countMap.get(String(cal._id)) || 0,
        }));

        res.json({ success: true, data: enriched });
    })
);

/**
 * POST /api/holiday-calendars
 * Create a new holiday calendar
 */
router.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, year, country, state, client, bannerImage, holidays, isActive } = req.body;

        if (!title || !year || !country) {
            return res.status(400).json({ success: false, message: 'title, year, and country are required' });
        }

        const calendar = new HolidayCalendar({
            title,
            year,
            country,
            state,
            client,
            bannerImage,
            holidays: holidays || [],
            isActive: isActive !== undefined ? isActive : true,
        });

        await calendar.save();
        res.status(201).json({ success: true, data: calendar, message: 'Holiday calendar created' });
    })
);

/**
 * GET /api/holiday-calendars/:id
 * Get a single calendar with holidays array
 */
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const calendar = await HolidayCalendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }
        res.json({ success: true, data: calendar });
    })
);

/**
 * PUT /api/holiday-calendars/:id
 * Update calendar metadata and/or holidays array
 */
router.put(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, year, country, state, client, bannerImage, holidays, isActive } = req.body;

        const calendar = await HolidayCalendar.findByIdAndUpdate(
            req.params.id,
            { title, year, country, state, client, bannerImage, holidays, isActive },
            { new: true, runValidators: true }
        );

        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }
        res.json({ success: true, data: calendar, message: 'Holiday calendar updated' });
    })
);

/**
 * DELETE /api/holiday-calendars/:id
 * Delete a calendar (only if no employees are assigned)
 */
router.delete(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const assignedCount = await Employee.countDocuments({ holidayCalendarId: req.params.id });
        if (assignedCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${assignedCount} employee(s) are still assigned to this calendar. Reassign them first.`,
            });
        }
        const calendar = await HolidayCalendar.findByIdAndDelete(req.params.id);
        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }
        res.json({ success: true, message: 'Holiday calendar deleted' });
    })
);

/**
 * GET /api/holiday-calendars/:id/employees
 * List employees assigned to this calendar
 */
router.get(
    '/:id/employees',
    asyncHandler(async (req: Request, res: Response) => {
        const employees = await Employee.find(
            { holidayCalendarId: req.params.id },
            'employeeId name email department designation location'
        ).sort({ name: 1 });
        res.json({ success: true, data: employees });
    })
);

/**
 * POST /api/holiday-calendars/:id/assign
 * Assign this calendar to one or more employees by employeeId array
 */
router.post(
    '/:id/assign',
    asyncHandler(async (req: Request, res: Response) => {
        const { employeeIds } = req.body as { employeeIds: string[] };
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ success: false, message: 'employeeIds array is required' });
        }

        const calendar = await HolidayCalendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }

        const result = await Employee.updateMany(
            { employeeId: { $in: employeeIds } },
            { $set: { holidayCalendarId: calendar._id } }
        );
        res.json({ success: true, message: `Assigned calendar to ${result.modifiedCount} employee(s)` });
    })
);

/**
 * POST /api/holiday-calendars/:id/assign-by-location
 * Bulk-assign to all employees matching a location
 */
router.post(
    '/:id/assign-by-location',
    asyncHandler(async (req: Request, res: Response) => {
        const { location } = req.body as { location: string };
        if (!location) {
            return res.status(400).json({ success: false, message: 'location is required' });
        }

        const calendar = await HolidayCalendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }

        const result = await Employee.updateMany(
            { location },
            { $set: { holidayCalendarId: calendar._id } }
        );
        res.json({ success: true, message: `Assigned calendar to ${result.modifiedCount} employee(s) in location "${location}"` });
    })
);

/**
 * POST /api/holiday-calendars/:id/assign-by-dept
 * Bulk-assign to all employees matching a department
 */
router.post(
    '/:id/assign-by-dept',
    asyncHandler(async (req: Request, res: Response) => {
        const { department } = req.body as { department: string };
        if (!department) {
            return res.status(400).json({ success: false, message: 'department is required' });
        }

        const calendar = await HolidayCalendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).json({ success: false, message: 'Calendar not found' });
        }

        const result = await Employee.updateMany(
            { department },
            { $set: { holidayCalendarId: calendar._id } }
        );
        res.json({ success: true, message: `Assigned calendar to ${result.modifiedCount} employee(s) in department "${department}"` });
    })
);

/**
 * DELETE /api/holiday-calendars/:id/unassign/:empId
 * Remove calendar assignment from a single employee
 */
router.delete(
    '/:id/unassign/:empId',
    asyncHandler(async (req: Request, res: Response) => {
        const employee = await Employee.findOneAndUpdate(
            { employeeId: req.params.empId, holidayCalendarId: req.params.id },
            { $set: { holidayCalendarId: null } },
            { new: true }
        );
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found or not assigned to this calendar' });
        }
        res.json({ success: true, message: `Calendar unassigned from ${employee.name}` });
    })
);

export default router;
