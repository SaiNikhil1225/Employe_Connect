import express, { Request, Response } from 'express';
import Leave from '../models/Leave';
import Attendance from '../models/Attendance';
import LeaveBalance from '../models/LeaveBalance';
import Employee from '../models/Employee';
import { authenticateToken } from '../middleware/auth';
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns';

const router = express.Router();

// Helper function to check if user is HR admin
const isHRAdmin = (req: Request): boolean => {
  const user = req.user as any;
  const role = user?.role?.toUpperCase();
  return role === 'HR' || role === 'SUPER_ADMIN' || role === 'RMG';
};

// GET /api/leave-attendance/kpis - Get KPI statistics
router.get('/kpis', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const isAdmin = isHRAdmin(req);
    const currentUserId = req.user?.employeeId;

    // Date range for filtering (default to current month)
    const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());
    const today = format(new Date(), 'yyyy-MM-dd');

    // Build employee filter based on role
    let employeeFilter: any = { status: 'active' };
    
    // For non-admin users, only return their own data
    if (!isAdmin) {
      employeeFilter.employeeId = currentUserId;
    }

    // Get all active employees (or just the current user)
    const employees = await Employee.find(employeeFilter);
    const employeeIds = employees.map(emp => emp.employeeId);
    const totalEmployees = employees.length;

    // Present today count (from attendance)
    const presentToday = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      date: today,
      status: { $in: ['Present', 'Late'] }
    });

    // On leave today count
    const onLeaveToday = await Leave.countDocuments({
      employeeId: { $in: employeeIds },
      startDate: { $lte: new Date(today) },
      endDate: { $gte: new Date(today) },
      status: 'approved'
    });

    // Attendance rate calculation (for the selected date range)
    const totalWorkingDays = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(end, 'yyyy-MM-dd') },
      status: { $ne: 'Weekend' }
    });

    const presentDays = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(end, 'yyyy-MM-dd') },
      status: { $in: ['Present', 'Late', 'Half Day'] }
    });

    const attendanceRate = totalWorkingDays > 0 
      ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
      : '0.0';

    // Leave utilization rate (approved leaves in date range)
    const approvedLeaves = await Leave.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          status: 'approved',
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: '$days' }
        }
      }
    ]);

    const totalLeaveDays = approvedLeaves.length > 0 ? approvedLeaves[0].totalDays : 0;
    
    // Get average leave balance to calculate utilization
    const leaveBalances = await LeaveBalance.find({
      employeeId: { $in: employeeIds }
    });

    const totalAvailableLeaves = leaveBalances.reduce((sum, balance: any) => {
      const leaveTypesArray = balance.leaveTypes || [];
      const totalForEmployee = leaveTypesArray.reduce((empSum: number, leaveType: any) => {
        return empSum + (leaveType.available || 0);
      }, 0);
      return sum + totalForEmployee;
    }, 0);

    const leaveUtilizationRate = totalAvailableLeaves > 0
      ? ((totalLeaveDays / totalAvailableLeaves) * 100).toFixed(1)
      : '0.0';

    // Late arrivals MTD (Month to Date)
    const monthStart = startOfMonth(new Date());
    const lateArrivalsMTD = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      date: { $gte: format(monthStart, 'yyyy-MM-dd'), $lte: today },
      status: 'Late'
    });

    // Overtime hours MTD (from attendance work hours)
    const overtimeData = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          date: { $gte: format(monthStart, 'yyyy-MM-dd'), $lte: today },
          workHours: { $gt: 8 } // Considering 8 hours as standard work day
        }
      },
      {
        $group: {
          _id: null,
          totalOvertime: { $sum: { $subtract: ['$workHours', 8] } }
        }
      }
    ]);

    const overtimeHoursMTD = overtimeData.length > 0 
      ? overtimeData[0].totalOvertime.toFixed(1)
      : '0.0';

    res.json({
      totalEmployees,
      presentToday,
      onLeaveToday,
      attendanceRate: parseFloat(attendanceRate),
      leaveUtilizationRate: parseFloat(leaveUtilizationRate),
      lateArrivalsMTD,
      overtimeHoursMTD: parseFloat(overtimeHoursMTD)
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ message: 'Error fetching KPI statistics', error });
  }
});

// GET /api/leave-attendance/leave-breakdown - Get leave breakdown by type
router.get('/leave-breakdown', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const isAdmin = isHRAdmin(req);
    const currentUserId = req.user?.employeeId;

    const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

    // Build employee filter
    let employeeFilter: any = {};
    if (!isAdmin) {
      employeeFilter.employeeId = currentUserId;
    }

    const employees = await Employee.find({ ...employeeFilter, status: 'active' });
    const employeeIds = employees.map(emp => emp.employeeId);

    const leaveBreakdown = await Leave.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          status: 'approved',
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$days' }
        }
      },
      {
        $project: {
          leaveType: '$_id',
          count: 1,
          totalDays: 1,
          _id: 0
        }
      },
      {
        $sort: { totalDays: -1 }
      }
    ]);

    // Calculate total and percentages
    const totalLeaves = leaveBreakdown.reduce((sum, item) => sum + item.totalDays, 0);
    
    const breakdown = leaveBreakdown.map(item => ({
      ...item,
      percentage: totalLeaves > 0 ? ((item.totalDays / totalLeaves) * 100).toFixed(1) : '0.0'
    }));

    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching leave breakdown:', error);
    res.status(500).json({ message: 'Error fetching leave breakdown', error });
  }
});

// GET /api/leave-attendance/monthly-trend - Get monthly attendance and leave trend
router.get('/monthly-trend', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const isAdmin = isHRAdmin(req);
    const currentUserId = req.user?.employeeId;
    
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Build employee filter
    let employeeFilter: any = {};
    if (!isAdmin) {
      employeeFilter.employeeId = currentUserId;
    }

    const employees = await Employee.find({ ...employeeFilter, status: 'active' });
    const employeeIds = employees.map(emp => emp.employeeId);

    // Get monthly attendance data
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds }
        }
      },
      {
        $addFields: {
          dateObj: {
            $dateFromString: {
              dateString: '$date',
              format: '%Y-%m-%d'
            }
          }
        }
      },
      {
        $match: {
          dateObj: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$dateObj' },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Late'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get monthly leave data
    const leaveTrend = await Leave.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          status: 'approved',
          startDate: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDate' },
          totalLeaves: { $sum: '$days' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Combine and format data for all 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = monthNames.map((month, index) => {
      const monthNumber = index + 1;
      const attendance = attendanceTrend.find(a => a._id === monthNumber) || { present: 0, absent: 0, late: 0 };
      const leave = leaveTrend.find(l => l._id === monthNumber) || { totalLeaves: 0 };

      return {
        month,
        present: attendance.present,
        absent: attendance.absent,
        late: attendance.late,
        leaves: leave.totalLeaves
      };
    });

    res.json(trend);
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ message: 'Error fetching monthly trend', error });
  }
});

// GET /api/leave-attendance/late-arrivals - Get late arrival details
router.get('/late-arrivals', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit = '10' } = req.query;
    const isAdmin = isHRAdmin(req);
    const currentUserId = req.user?.employeeId;

    const start = startDate ? format(new Date(startDate as string), 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = endDate ? format(new Date(endDate as string), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

    // Build employee filter
    let employeeFilter: any = {};
    if (!isAdmin) {
      employeeFilter.employeeId = currentUserId;
    }

    const employees = await Employee.find({ ...employeeFilter, status: 'active' });
    const employeeIds = employees.map(emp => emp.employeeId);

    const lateArrivals = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          date: { $gte: start, $lte: end },
          status: 'Late'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          employeeId: 1,
          employeeName: { $ifNull: ['$employee.name', 'Unknown'] },
          department: { $ifNull: ['$employee.department', 'N/A'] },
          date: 1,
          checkIn: 1,
          notes: 1
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    res.json(lateArrivals);
  } catch (error) {
    console.error('Error fetching late arrivals:', error);
    res.status(500).json({ message: 'Error fetching late arrivals', error });
  }
});

// GET /api/leave-attendance/leave-requests - Get leave requests with filters (for HR admin)
router.get('/leave-requests', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, employeeId, department, location, leaveType, employmentType } = req.query;
    const isAdmin = isHRAdmin(req);
    const currentUserId = req.user?.employeeId;

    // Build match query
    let matchQuery: any = {};

    // For non-admin users, show only their leave requests
    if (!isAdmin) {
      matchQuery.employeeId = currentUserId;
    } else if (employeeId) {
      matchQuery.employeeId = employeeId;
    }

    if (status) {
      matchQuery.status = status;
    }

    if (leaveType) {
      matchQuery.leaveType = leaveType;
    }

    if (startDate || endDate) {
      matchQuery.startDate = {};
      if (startDate) matchQuery.startDate.$gte = new Date(startDate as string);
      if (endDate) matchQuery.startDate.$lte = new Date(endDate as string);
    }

    // Build aggregation pipeline to join with employee data
    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add employee filters if provided
    if (department || location || employmentType) {
      const employeeMatch: any = {};
      if (department) employeeMatch['employee.department'] = department;
      if (location) employeeMatch['employee.location'] = location;
      if (employmentType) employeeMatch['employee.employmentType'] = employmentType;
      pipeline.push({ $match: employeeMatch });
    }

    // Project the final shape
    pipeline.push({
      $project: {
        _id: 1,
        employeeId: 1,
        employeeName: { $ifNull: ['$employee.name', 'Unknown'] },
        department: { $ifNull: ['$employee.department', 'N/A'] },
        location: { $ifNull: ['$employee.location', 'N/A'] },
        employmentType: { $ifNull: ['$employee.employmentType', 'N/A'] },
        designation: { $ifNull: ['$employee.designation', 'N/A'] },
        leavePlan: 1,
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        days: 1,
        reason: 1,
        status: 1,
        appliedOn: 1,
        approvedBy: 1,
        approvedOn: 1,
        rejectedBy: 1,
        rejectedOn: 1,
        rejectionReason: 1
      }
    });

    // Sort and limit
    pipeline.push(
      { $sort: { appliedOn: -1 } },
      { $limit: 200 }
    );

    const leaveRequests = await Leave.aggregate(pipeline);

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error });
  }
});

// GET /api/leave-attendance/employee-details - Get all employee details with leave and attendance data
router.get('/employee-details', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const isAdmin = isHRAdmin(req);

    console.log('Employee details request from user:', {
      employeeId: user?.employeeId,
      role: user?.role,
      permissions: user?.permissions,
      isAdmin: isAdmin
    });

    if (!isAdmin) {
      console.log('User is not admin, access denied');
      return res.status(403).json({ 
        message: 'Access denied. HR admin privileges required.',
        details: {
          role: user?.role,
          hasCanEditEmployees: user?.permissions?.canEditEmployees
        }
      });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());
    const today = format(new Date(), 'yyyy-MM-dd');

    console.log('Fetching employee details from', start, 'to', end);

    // Get all active employees
    const employees = await Employee.find({ status: 'active' }).lean();
    console.log(`Found ${employees.length} active employees`);

    if (employees.length === 0) {
      return res.json([]);
    }

    // Build employee details with leave and attendance data
    const employeeDetails = await Promise.all(
      employees.map(async (employee) => {
        try {
          const employeeId = employee.employeeId;

          // Get attendance data for today
          const todayAttendance = await Attendance.findOne({
            employeeId,
            date: today
          });

          // Get leave data for today
          const onLeaveToday = await Leave.findOne({
            employeeId,
            startDate: { $lte: new Date(today) },
            endDate: { $gte: new Date(today) },
            status: 'approved'
          });

          // Get attendance stats for the date range
          const attendanceStats = await Attendance.aggregate([
            {
              $match: {
                employeeId,
                date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(end, 'yyyy-MM-dd') },
                status: { $ne: 'Weekend' }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]);

          const presentDays = attendanceStats.find(s => ['Present', 'Late', 'Half Day'].includes(s._id))?.count || 0;
          const absentDays = attendanceStats.find(s => s._id === 'Absent')?.count || 0;
          const lateDays = attendanceStats.find(s => s._id === 'Late')?.count || 0;
          const totalWorkingDays = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);

          // Get leave stats for the date range
          const leaveStats = await Leave.aggregate([
            {
              $match: {
                employeeId,
                status: 'approved',
                startDate: { $gte: start },
                endDate: { $lte: end }
              }
            },
            {
              $group: {
                _id: '$leaveType',
                count: { $sum: 1 },
                totalDays: { $sum: '$days' }
              }
            }
          ]);

          const totalLeaveDays = leaveStats.reduce((sum, stat) => sum + stat.totalDays, 0);

          // Get leave balance
          const leaveBalance: any = await LeaveBalance.findOne({ employeeId });

          // Calculate attendance rate
          const attendanceRate = totalWorkingDays > 0
            ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
            : '0.0';

          // Extract leave balances by type
          const leaveBalanceData: any = {};
          if (leaveBalance && leaveBalance.leaveTypes && leaveBalance.leaveTypes.length > 0) {
            leaveBalance.leaveTypes.forEach((lt: any) => {
              leaveBalanceData[lt.type] = {
                allocated: lt.allocated || 0,
                available: lt.available || 0,
                used: lt.used || 0,
                pending: lt.pending || 0
              };
            });
          }

          return {
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            department: employee.department || 'N/A',
            designation: employee.designation || 'N/A',
            location: employee.location || 'N/A',
            employmentType: employee.employmentType || 'N/A',
            reportingManager: employee.reportingManager,
            dateOfJoining: employee.dateOfJoining,
            todayStatus: onLeaveToday 
              ? `On Leave (${onLeaveToday.leaveType})` 
              : todayAttendance?.status || 'Not Marked',
            presentDays,
            absentDays,
            lateDays,
            totalLeaveDays,
            attendanceRate: parseFloat(attendanceRate),
            leaveBalance: Object.keys(leaveBalanceData).length > 0 ? leaveBalanceData : null,
            leaveBreakdown: leaveStats.map(stat => ({
              leaveType: stat._id,
              count: stat.count,
              totalDays: stat.totalDays
            }))
          };
        } catch (empError) {
          console.error(`Error processing employee ${employee.employeeId}:`, empError);
          // Return minimal data for this employee if there's an error
          return {
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            department: employee.department || 'N/A',
            designation: employee.designation || 'N/A',
            location: employee.location || 'N/A',
            employmentType: employee.employmentType || 'N/A',
            reportingManager: employee.reportingManager,
            dateOfJoining: employee.dateOfJoining,
            todayStatus: 'Error Loading',
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            totalLeaveDays: 0,
            attendanceRate: 0,
            leaveBalance: null,
            leaveBreakdown: []
          };
        }
      })
    );

    console.log(`Returning ${employeeDetails.length} employee details`);
    res.json(employeeDetails);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ message: 'Error fetching employee details', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PATCH /api/leave-attendance/leave-requests/:id - Update leave request status (HR admin only)
router.patch('/leave-requests/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const isAdmin = isHRAdmin(req);

    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied. HR admin privileges required.' });
    }

    const { id } = req.params;
    const { status, rejectionReason, remarks } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    // Update leave request
    const updateData: any = {
      status,
      remarks
    };

    if (status === 'approved') {
      updateData.approvedBy = req.user?.employeeId;
      updateData.approvedOn = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedBy = req.user?.employeeId;
      updateData.rejectedOn = new Date();
      updateData.rejectionReason = rejectionReason;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(updatedLeave);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Error updating leave request', error });
  }
});

export default router;
