import { Request, Response } from 'express';
import AttendanceLog from '../models/AttendanceLog';
import RegularizationRequest from '../models/RegularizationRequest';
import WFHRequest from '../models/WFHRequest';
import AttendancePolicy from '../models/AttendancePolicy';
import Employee from '../models/Employee';
import { startOfDay, endOfDay, subDays, differenceInMinutes, format, parse } from 'date-fns';

// Helper function to check if user is admin
const isAdmin = (req: Request): boolean => {
  const role = req.user?.role;
  return role === 'HR' || role === 'SUPER_ADMIN' || role === 'RMG';
};

// Helper function to calculate hours
const calculateHours = (checkIn: Date, checkOut: Date, breakMinutes: number = 60): { effective: number; gross: number } => {
  const totalMinutes = differenceInMinutes(checkOut, checkIn);
  const grossHours = totalMinutes / 60;
  const effectiveHours = (totalMinutes - breakMinutes) / 60;
  
  return {
    effective: Math.max(0, Math.round(effectiveHours * 10) / 10),
    gross: Math.max(0, Math.round(grossHours * 10) / 10)
  };
};

// Get attendance stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, includeTeam } = req.query;
    const userId = employeeId as string || req.user?.employeeId;
    
    const start = startDate ? new Date(startDate as string) : subDays(new Date(), 7);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Get logs for the user
    const logs = await AttendanceLog.find({
      employeeId: userId,
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    });
    
    const totalDays = logs.length;
    const presentDays = logs.filter(l => l.status === 'present' || l.status === 'wfh' || l.status === 'late').length;
    const lateDays = logs.filter(l => l.isLate).length;
    const totalHours = logs.reduce((sum, l) => sum + (l.effectiveHours || 0), 0);
    const onTimeDays = presentDays - lateDays;
    
    const stats: any = {
      me: {
        avgHoursPerDay: totalDays > 0 ? parseFloat((totalHours / totalDays).toFixed(1)) : 0,
        onTimeArrivalPercentage: presentDays > 0 ? Math.round((onTimeDays / presentDays) * 100) : 0,
        totalDays,
        presentDays,
        lateDays
      }
    };
    
    // If team stats requested
    if (includeTeam === 'true') {
      const employee = await Employee.findOne({ employeeId: userId });
      
      if (employee && employee.department) {
        const teamLogs = await AttendanceLog.find({
          department: employee.department,
          date: { $gte: startOfDay(start), $lte: endOfDay(end) }
        });
        
        const teamSize = await Employee.countDocuments({ department: employee.department, status: 'active' });
        const teamTotalDays = teamLogs.length;
        const teamPresentDays = teamLogs.filter(l => l.status === 'present' || l.status === 'wfh' || l.status === 'late').length;
        const teamLateDays = teamLogs.filter(l => l.isLate).length;
        const teamTotalHours = teamLogs.reduce((sum, l) => sum + (l.effectiveHours || 0), 0);
        const teamOnTimeDays = teamPresentDays - teamLateDays;
        
        stats.myTeam = {
          avgHoursPerDay: teamTotalDays > 0 ? parseFloat((teamTotalHours / teamTotalDays).toFixed(1)) : 0,
          onTimeArrivalPercentage: teamPresentDays > 0 ? Math.round((teamOnTimeDays / teamPresentDays) * 100) : 0,
          totalEmployees: teamSize,
          presentToday: teamPresentDays
        };
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error });
  }
};

// Get daily timings
export const getTimings = async (req: Request, res: Response) => {
  try {
    const { employeeId, date } = req.params;
    const targetDate = new Date(date);
    
    const log = await AttendanceLog.findOne({
      employeeId,
      date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
    });
    
    if (!log || !log.hasTimeEntry) {
      return res.json({
        date: format(targetDate, 'yyyy-MM-dd'),
        dayOfWeek: format(targetDate, 'EEEE'),
        checkIn: null,
        checkOut: null,
        totalHours: '0h 0m',
        breakDuration: '0 min',
        workingHours: '0h 0m',
        progress: {
          total: 540,
          worked: 0,
          break: 0,
          remaining: 540
        }
      });
    }
    
    const totalMinutes = log.grossHours * 60;
    const workedMinutes = log.effectiveHours * 60;
    const breakMinutes = log.breakDuration;
    
    res.json({
      date: format(targetDate, 'yyyy-MM-dd'),
      dayOfWeek: format(targetDate, 'EEEE'),
      checkIn: log.checkInTime ? format(log.checkInTime, 'h:mm a') : null,
      checkOut: log.checkOutTime ? format(log.checkOutTime, 'h:mm a') : null,
      totalHours: `${Math.floor(log.grossHours)}h ${Math.round((log.grossHours % 1) * 60)}m`,
      breakDuration: `${breakMinutes} min`,
      workingHours: `${Math.floor(log.effectiveHours)}h ${Math.round((log.effectiveHours % 1) * 60)}m`,
      progress: {
        total: totalMinutes,
        worked: workedMinutes,
        break: breakMinutes,
        remaining: Math.max(0, 540 - totalMinutes)
      }
    });
  } catch (error) {
    console.error('Error fetching timings:', error);
    res.status(500).json({ message: 'Failed to fetch timings', error });
  }
};

// Get attendance logs
export const getLogs = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, status, page = 1, limit = 30 } = req.query;
    const userId = employeeId as string || req.user?.employeeId;
    
    const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const query: any = {
      employeeId: userId,
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    };
    
    if (status) {
      query.status = status;
    }
    
    const logs = await AttendanceLog.find(query)
      .sort({ date: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    
    const total = await AttendanceLog.countDocuments(query);
    
    res.json({
      logs,
      pagination: {
        total,
        page: +page,
        limit: +limit,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs', error });
  }
};

// Submit regularization request
export const submitRegularization = async (req: Request, res: Response) => {
  try {
    const { date, requestType, reason, proposedCheckIn, proposedCheckOut } = req.body;
    const employeeId = req.user?.employeeId;
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get existing log
    const log = await AttendanceLog.findOne({
      employeeId,
      date: { $gte: startOfDay(new Date(date)), $lte: endOfDay(new Date(date)) }
    });
    
    const request = new RegularizationRequest({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: new Date(date),
      requestType,
      reason,
      proposedCheckIn: proposedCheckIn ? new Date(proposedCheckIn) : undefined,
      proposedCheckOut: proposedCheckOut ? new Date(proposedCheckOut) : undefined,
      originalCheckIn: log?.checkInTime,
      originalCheckOut: log?.checkOutTime,
      status: 'pending'
    });
    
    await request.save();
    
    // Update attendance log
    if (log) {
      log.regularizationStatus = 'pending';
      log.regularizationRequestId = request._id as any;
      await log.save();
    }
    
    res.status(201).json({ message: 'Regularization request submitted', data: request });
  } catch (error) {
    console.error('Error submitting regularization:', error);
    res.status(500).json({ message: 'Failed to submit regularization', error });
  }
};

// Submit WFH request
export const submitWFHRequest = async (req: Request, res: Response) => {
  try {
    const { date, reason } = req.body;
    const employeeId = req.user?.employeeId;
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const request = new WFHRequest({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: new Date(date),
      reason,
      status: 'pending'
    });
    
    await request.save();
    
    res.status(201).json({ message: 'WFH request submitted', data: request });
  } catch (error) {
    console.error('Error submitting WFH request:', error);
    res.status(500).json({ message: 'Failed to submit WFH request', error });
  }
};

// Web clock-in
export const webClockIn = async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    console.log('[Clock-In] EmployeeId:', employeeId);
    
    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    
    console.log('[Clock-In] Searching for logs between:', todayStart.toISOString(), 'and', todayEnd.toISOString());
    
    // Get all logs for today to check cumulative hours
    const allLogsToday = await AttendanceLog.find({
      employeeId,
      date: { $gte: todayStart, $lte: todayEnd }
    }).sort({ checkInTime: 1 });
    
    console.log('[Clock-In] Found', allLogsToday.length, 'log(s) for today');
    
    // Check if already clocked in (has session without checkout)
    const openSession = allLogsToday.find(log => log.checkInTime && !log.checkOutTime);
    if (openSession) {
      console.log('[Clock-In] Open session found:', openSession._id);
      return res.status(400).json({ message: 'Already clocked in. Please clock out first before starting a new session.' });
    }
    
    // Calculate cumulative hours from completed sessions
    const MAX_WORK_HOURS = 8;
    const completedSessions = allLogsToday.filter(log => log.checkInTime && log.checkOutTime);
    const cumulativeHours = completedSessions.reduce((sum, log) => sum + (log.effectiveHours || 0), 0);
    
    console.log('[Clock-In] Cumulative hours from', completedSessions.length, 'completed session(s):', cumulativeHours.toFixed(2));
    
    // Check if already reached 8 hours limit
    if (cumulativeHours >= MAX_WORK_HOURS) {
      console.log('[Clock-In] ERROR: Already reached max hours for today');
      return res.status(400).json({ 
        message: `You have already worked ${cumulativeHours.toFixed(1)} hours today. Maximum ${MAX_WORK_HOURS} hours per day allowed.`,
        cumulativeHours: cumulativeHours.toFixed(2),
        maxHours: MAX_WORK_HOURS
      });
    }
    
    const policy = await AttendancePolicy.findOne({ isActive: true });
    const checkInTime = new Date();
    
    // Check if late (only for first session of the day)
    let isLate = false;
    let lateMinutes = 0;
    
    if (policy && completedSessions.length === 0) {
      const standardTime = parse(policy.standardCheckIn, 'h:mm a', now);
      const graceTime = new Date(standardTime.getTime() + policy.graceMinutes * 60000);
      
      if (checkInTime > graceTime) {
        isLate = true;
        lateMinutes = differenceInMinutes(checkInTime, graceTime);
      }
    }
    
    // Create new log for this session
    const log = new AttendanceLog({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: todayStart,
      checkInTime,
      hasTimeEntry: true,
      isLate,
      lateMinutes,
      status: isLate ? 'late' : 'present',
      workLocation: 'office'
    });
    
    await log.save();
    console.log('[Clock-In] Created new session log with _id:', log._id, 'Session #:', completedSessions.length + 1);
    
    const remainingHours = MAX_WORK_HOURS - cumulativeHours;
    
    res.json({ 
      message: `Clocked in successfully. Session #${completedSessions.length + 1}`,
      data: log,
      sessionNumber: completedSessions.length + 1,
      cumulativeHours: cumulativeHours.toFixed(2),
      remainingHours: remainingHours.toFixed(2)
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Failed to clock in', error });
  }
};

// Web clock-out
export const webClockOut = async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    console.log('[Clock-Out] EmployeeId:', employeeId);
    
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    
    console.log('[Clock-Out] Searching for logs between:', todayStart.toISOString(), 'and', todayEnd.toISOString());
    
    // Get all logs for today
    const allLogsToday = await AttendanceLog.find({
      employeeId,
      date: { $gte: todayStart, $lte: todayEnd }
    }).sort({ checkInTime: 1 });
    
    console.log('[Clock-Out] Found', allLogsToday.length, 'log(s) for today');
    
    // Find the open session (has checkIn but no checkOut)
    const openSession = allLogsToday.find(log => log.checkInTime && !log.checkOutTime);
    
    if (!openSession) {
      console.log('[Clock-Out] ERROR: No open session found');
      return res.status(400).json({ 
        message: 'No check-in found for today. Please clock in first.',
        debug: {
          employeeId,
          searchRange: { start: todayStart.toISOString(), end: todayEnd.toISOString() },
          totalLogs: allLogsToday.length
        }
      });
    }
    
    console.log('[Clock-Out] Open session found:', openSession._id);
    
    if (!openSession.checkInTime) {
      return res.status(400).json({ message: 'Check-in time missing for open session. Please contact support.' });
    }
    
    // Calculate cumulative hours from other completed sessions
    const completedSessions = allLogsToday.filter(log => 
      log.checkInTime && 
      log.checkOutTime && 
      String(log._id) !== String(openSession._id)
    );
    const cumulativeHours = completedSessions.reduce((sum, log) => sum + (log.effectiveHours || 0), 0);
    
    console.log('[Clock-Out] Cumulative hours from', completedSessions.length, 'other completed session(s):', cumulativeHours.toFixed(2));
    
    let checkOutTime = new Date();
    const checkInTime: Date = openSession.checkInTime;
    
    // Calculate duration for this session
    const durationMinutes = differenceInMinutes(checkOutTime, checkInTime);
    const durationHours = durationMinutes / 60;
    
    console.log('[Clock-Out] Check-in time:', checkInTime.toISOString());
    console.log('[Clock-Out] Original check-out time:', checkOutTime.toISOString());
    console.log('[Clock-Out] This session duration:', durationHours.toFixed(2), 'hours');
    
    const MAX_WORK_HOURS = 8;
    const policy = await AttendancePolicy.findOne({ isActive: true });
    const breakMinutes = policy?.breakDuration || 60;
    
    // Calculate hours for this session
    let hours = calculateHours(checkInTime, checkOutTime, breakMinutes);
    let wasAutoCapped = false;
    let cappedReason = '';
    
    // Check if total hours (cumulative + this session) would exceed max
    const projectedTotal = cumulativeHours + hours.effective;
    
    if (projectedTotal > MAX_WORK_HOURS) {
      // Cap this session to not exceed 8 hours total
      const allowedHoursForThisSession = MAX_WORK_HOURS - cumulativeHours;
      
      if (allowedHoursForThisSession <= 0) {
        return res.status(400).json({ 
          message: `Maximum ${MAX_WORK_HOURS} hours already reached. Cannot clock out this session.`,
          cumulativeHours: cumulativeHours.toFixed(2)
        });
      }
      
      // Calculate exact checkout time to reach the allowed hours
      const allowedMinutes = (allowedHoursForThisSession * 60) + breakMinutes;
      checkOutTime = new Date(checkInTime.getTime() + (allowedMinutes * 60 * 1000));
      
      hours = calculateHours(checkInTime, checkOutTime, breakMinutes);
      wasAutoCapped = true;
      cappedReason = `Session capped to ${allowedHoursForThisSession.toFixed(1)}h to not exceed ${MAX_WORK_HOURS}h daily limit`;
      
      console.log('[Clock-Out] Auto-capped. Adjusted check-out time:', checkOutTime.toISOString());
      console.log('[Clock-Out] Allowed hours for this session:', allowedHoursForThisSession.toFixed(2));
    }
    
    openSession.checkOutTime = checkOutTime;
    openSession.effectiveHours = hours.effective;
    openSession.grossHours = hours.gross;
    openSession.breakDuration = breakMinutes;
    
    await openSession.save();
    
    const newCumulativeHours = cumulativeHours + hours.effective;
    const remainingHours = Math.max(0, MAX_WORK_HOURS - newCumulativeHours);
    
    console.log('[Clock-Out] SUCCESS: Clocked out at', checkOutTime.toISOString());
    console.log('[Clock-Out] This session effective hours:', hours.effective.toFixed(2));
    console.log('[Clock-Out] Total cumulative hours:', newCumulativeHours.toFixed(2));
    console.log('[Clock-Out] Remaining hours:', remainingHours.toFixed(2));
    
    const responseMessage = wasAutoCapped 
      ? `Clocked out successfully. ${cappedReason}`
      : `Clocked out successfully. Session #${completedSessions.length + 1} completed.`;
    
    res.json({ 
      message: responseMessage,
      data: openSession,
      sessionNumber: completedSessions.length + 1,
      sessionHours: hours.effective.toFixed(2),
      cumulativeHours: newCumulativeHours.toFixed(2),
      remainingHours: remainingHours.toFixed(2),
      autoCapped: wasAutoCapped,
      maxHoursReached: newCumulativeHours >= MAX_WORK_HOURS
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ message: 'Failed to clock out', error });
  }
};

// Admin: Get team stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { date, department, designation } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    
    const query: any = {
      date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
    };
    
    if (department) {
      query.department = department;
    }
    
    const logs = await AttendanceLog.find(query);
    
    const totalEmployees = await Employee.countDocuments({ 
      status: 'active',
      ...(department && { department }),
      ...(designation && { designation })
    });
    
    const presentToday = logs.filter(l => l.status === 'present' || l.status === 'late').length;
    const absentToday = logs.filter(l => l.status === 'absent').length;
    const onLeaveToday = logs.filter(l => l.status === 'leave').length;
    const wfhToday = logs.filter(l => l.status === 'wfh').length;
    const lateArrivals = logs.filter(l => l.isLate).length;
    const lateArrivalPercentage = presentToday > 0 ? parseFloat(((lateArrivals / presentToday) * 100).toFixed(1)) : 0;
    
    res.json({
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      wfhToday,
      lateArrivals,
      lateArrivalPercentage
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats', error });
  }
};

// Admin: Get team logs
export const getTeamLogs = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { startDate, endDate, department, designation, employeeName, status, page = 1, limit = 30 } = req.query;
    
    const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const query: any = {
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    };
    
    if (department) query.department = department;
    if (status) query.status = status;
    if (employeeName) query.employeeName = { $regex: employeeName, $options: 'i' };
    
    const logs = await AttendanceLog.find(query)
      .sort({ date: -1, employeeName: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    
    const total = await AttendanceLog.countDocuments(query);
    
    res.json({
      logs,
      pagination: {
        total,
        page: +page,
        limit: +limit,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (error) {
    console.error('Error fetching team logs:', error);
    res.status(500).json({ message: 'Failed to fetch team logs', error });
  }
};

// Get regularization requests
export const getRegularizationRequests = async (req: Request, res: Response) => {
  try {
    const { status, employeeId } = req.query;
    const userId = employeeId as string || req.user?.employeeId;
    
    const query: any = {};
    
    if (!isAdmin(req)) {
      query.employeeId = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const requests = await RegularizationRequest.find(query).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching regularization requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
};

// Approve regularization
export const approveRegularization = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { id } = req.params;
    const request = await RegularizationRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'approved';
    request.approvedBy = req.user?.employeeId;
    request.approvedAt = new Date();
    await request.save();
    
    // Update attendance log
    const log = await AttendanceLog.findOne({
      employeeId: request.employeeId,
      date: { $gte: startOfDay(request.date), $lte: endOfDay(request.date) }
    });
    
    if (log) {
      log.regularizationStatus = 'approved';
      
      if (request.proposedCheckIn) {
        log.checkInTime = request.proposedCheckIn;
      }
      if (request.proposedCheckOut) {
        log.checkOutTime = request.proposedCheckOut;
      }
      
      if (log.checkInTime && log.checkOutTime) {
        const hours = calculateHours(log.checkInTime, log.checkOutTime, log.breakDuration);
        log.effectiveHours = hours.effective;
        log.grossHours = hours.gross;
      }
      
      log.updatedBy = req.user?.employeeId;
      await log.save();
    }
    
    res.json({ message: 'Regularization approved', data: request });
  } catch (error) {
    console.error('Error approving regularization:', error);
    res.status(500).json({ message: 'Failed to approve regularization', error });
  }
};

// Reject regularization
export const rejectRegularization = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await RegularizationRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'rejected';
    request.rejectedBy = req.user?.employeeId;
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    // Update attendance log
    const log = await AttendanceLog.findOne({
      employeeId: request.employeeId,
      date: { $gte: startOfDay(request.date), $lte: endOfDay(request.date) }
    });
    
    if (log) {
      log.regularizationStatus = 'rejected';
      await log.save();
    }
    
    res.json({ message: 'Regularization rejected', data: request });
  } catch (error) {
    console.error('Error rejecting regularization:', error);
    res.status(500).json({ message: 'Failed to reject regularization', error });
  }
};

// Get WFH requests
export const getWFHRequests = async (req: Request, res: Response) => {
  try {
    const { status, employeeId } = req.query;
    const userId = employeeId as string || req.user?.employeeId;
    
    const query: any = {};
    
    if (!isAdmin(req)) {
      query.employeeId = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const requests = await WFHRequest.find(query).sort({ date: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
};

// Approve WFH request
export const approveWFHRequest = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { id } = req.params;
    const request = await WFHRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'approved';
    request.approvedBy = req.user?.employeeId;
    request.approvedAt = new Date();
    await request.save();
    
    // Update or create attendance log
    let log = await AttendanceLog.findOne({
      employeeId: request.employeeId,
      date: { $gte: startOfDay(request.date), $lte: endOfDay(request.date) }
    });
    
    if (!log) {
      log = new AttendanceLog({
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        department: request.department,
        date: request.date,
        status: 'wfh',
        workLocation: 'wfh',
        hasTimeEntry: false
      });
    } else {
      log.status = 'wfh';
      log.workLocation = 'wfh';
    }
    
    await log.save();
    
    res.json({ message: 'WFH request approved', data: request });
  } catch (error) {
    console.error('Error approving WFH request:', error);
    res.status(500).json({ message: 'Failed to approve WFH request', error });
  }
};

// Reject WFH request
export const rejectWFHRequest = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await WFHRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'rejected';
    request.rejectedBy = req.user?.employeeId;
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    res.json({ message: 'WFH request rejected', data: request });
  } catch (error) {
    console.error('Error rejecting WFH request:', error);
    res.status(500).json({ message: 'Failed to reject WFH request', error });
  }
};

// Bulk approve
export const bulkApprove = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { requestIds, requestType } = req.body;
    
    if (requestType === 'regularization') {
      await RegularizationRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: 'approved', approvedBy: req.user?.employeeId, approvedAt: new Date() }
      );
    } else if (requestType === 'wfh') {
      await WFHRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: 'approved', approvedBy: req.user?.employeeId, approvedAt: new Date() }
      );
    }
    
    res.json({ message: `${requestIds.length} requests approved successfully` });
  } catch (error) {
    console.error('Error bulk approving:', error);
    res.status(500).json({ message: 'Failed to approve requests', error });
  }
};

// Bulk reject
export const bulkReject = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { requestIds, requestType, rejectionReason } = req.body;
    
    if (requestType === 'regularization') {
      await RegularizationRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: 'rejected', rejectedBy: req.user?.employeeId, rejectedAt: new Date(), rejectionReason }
      );
    } else if (requestType === 'wfh') {
      await WFHRequest.updateMany(
        { _id: { $in: requestIds } },
        { status: 'rejected', rejectedBy: req.user?.employeeId, rejectedAt: new Date(), rejectionReason }
      );
    }
    
    res.json({ message: `${requestIds.length} requests rejected successfully` });
  } catch (error) {
    console.error('Error bulk rejecting:', error);
    res.status(500).json({ message: 'Failed to reject requests', error });
  }
};

// Add manual entry
export const addManualEntry = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { employeeId, date, checkInTime, checkOutTime, status, breakDuration = 60 } = req.body;
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    let log = await AttendanceLog.findOne({
      employeeId,
      date: { $gte: startOfDay(new Date(date)), $lte: endOfDay(new Date(date)) }
    });
    
    const checkIn = checkInTime ? new Date(checkInTime) : undefined;
    const checkOut = checkOutTime ? new Date(checkOutTime) : undefined;
    
    let hours = { effective: 0, gross: 0 };
    if (checkIn && checkOut) {
      hours = calculateHours(checkIn, checkOut, breakDuration);
    }
    
    if (log) {
      log.checkInTime = checkIn;
      log.checkOutTime = checkOut;
      log.status = status;
      log.effectiveHours = hours.effective;
      log.grossHours = hours.gross;
      log.breakDuration = breakDuration;
      log.hasTimeEntry = !!(checkIn && checkOut);
      log.updatedBy = req.user?.employeeId;
      await log.save();
    } else {
      log = new AttendanceLog({
        employeeId,
        employeeName: employee.name,
        department: employee.department,
        date: new Date(date),
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status,
        effectiveHours: hours.effective,
        grossHours: hours.gross,
        breakDuration,
        hasTimeEntry: !!(checkIn && checkOut),
        createdBy: req.user?.employeeId
      });
      await log.save();
    }
    
    res.json({ message: 'Manual entry added successfully', data: log });
  } catch (error) {
    console.error('Error adding manual entry:', error);
    res.status(500).json({ message: 'Failed to add manual entry', error });
  }
};

// Export data
export const exportData = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { format: exportFormat, startDate, endDate, employeeIds } = req.query;
    
    const start = startDate ? new Date(startDate as string) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const query: any = {
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    };
    
    if (employeeIds) {
      const ids = (employeeIds as string).split(',');
      query.employeeId = { $in: ids };
    }
    
    const logs = await AttendanceLog.find(query).sort({ date: -1, employeeName: 1 });
    
    // For now, return JSON
    // Implement Excel/CSV export using libraries like xlsx or fast-csv
    res.json({
      format: exportFormat,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Failed to export data', error });
  }
};

// Get attendance policy
export const getAttendancePolicy = async (req: Request, res: Response) => {
  try {
    const policy = await AttendancePolicy.findOne({ isActive: true });
    
    if (!policy) {
      return res.status(404).json({ message: 'No active policy found' });
    }
    
    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ message: 'Failed to fetch policy', error });
  }
};
