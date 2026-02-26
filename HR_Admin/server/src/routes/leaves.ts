import express, { Request, Response } from 'express';
import Leave from '../models/Leave';
import LeaveBalance from '../models/LeaveBalance';
import LeavePlan from '../models/LeavePlan';
import Employee from '../models/Employee';
import { leaveValidation } from '../middleware/validation';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;
    const query: Record<string, unknown> = {};

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    const leaves = await Leave.find(query).sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Failed to read leaves:', error);
    res.status(500).json({ success: false, message: 'Failed to read leaves' });
  }
});

// Get leaves by user ID (supports both userId and employeeId)
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const leaves = await Leave.find({
      employeeId: req.params.userId
    }).sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Failed to read user leaves:', error);
    res.status(500).json({ success: false, message: 'Failed to read user leaves' });
  }
});

// Get pending leaves
router.get('/pending', async (_req: Request, res: Response) => {
  try {
    const leaves = await Leave.find({ status: 'pending' }).sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Failed to read pending leaves:', error);
    res.status(500).json({ success: false, message: 'Failed to read pending leaves' });
  }
});

// Helper function to calculate quarterly accrual
const calculateQuarterlyAccrual = (annualAllocation: number, quarterlyRate: number, currentDate: Date = new Date()): number => {
  const month = currentDate.getMonth(); // 0-11
  let completedQuarters = 0;
  
  if (month >= 0 && month <= 2) completedQuarters = 1;  // Q1: Jan-Mar
  else if (month >= 3 && month <= 5) completedQuarters = 2;  // Q2: Apr-Jun
  else if (month >= 6 && month <= 8) completedQuarters = 3;  // Q3: Jul-Sep
  else completedQuarters = 4;  // Q4: Oct-Dec
  
  return completedQuarters * quarterlyRate;
};

// Get leave balance for a user
router.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const { userId } = req.params;

    // Get employee to check their leave plan
    const employee = await Employee.findOne({ employeeId: userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeLeavePlan = employee.leavePlan || 'Acuvate';

    // Get the leave plan configuration
    const leavePlan = await LeavePlan.findOne({ planName: employeeLeavePlan });
    if (!leavePlan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    // Try to get existing balance record for current year
    let leaveBalance = await LeaveBalance.findOne({
      employeeId: userId,
      year: currentYear
    });

    // If no balance found, initialize from leave plan
    if (!leaveBalance) {
      // Create new balance based on plan with proper accrual calculation
      leaveBalance = new LeaveBalance({
        employeeId: userId,
        year: currentYear,
        leavePlan: employeeLeavePlan,
        leaveTypes: leavePlan.leaveTypes.map((lt: any) => {
          let accruedAmount = 0;
          
          // Calculate accrued based on accrual type
          if (lt.accrualType === 'quarterly') {
            accruedAmount = calculateQuarterlyAccrual(lt.annualAllocation, lt.accrualRate, currentDate);
          } else if (lt.accrualType === 'monthly') {
            const currentMonth = currentDate.getMonth() + 1;
            accruedAmount = Math.min(currentMonth * lt.accrualRate, lt.annualAllocation);
          } else if (lt.accrualType === 'yearly' || lt.accrualType === 'on-demand') {
            accruedAmount = lt.annualAllocation;
          }
          
          return {
            type: lt.type,
            allocated: lt.annualAllocation,
            accrued: accruedAmount,
            used: 0,
            pending: 0,
            available: accruedAmount,
            carriedForward: 0,
            carryForwardExpiry: null
          };
        })
      });
      await leaveBalance.save();
    } else {
      // Update accrued amounts for existing balance based on current date
      leaveBalance.leaveTypes.forEach((lt: any) => {
        const planLeaveType = leavePlan.leaveTypes.find((plt: any) => plt.type === lt.type);
        if (planLeaveType) {
          if (planLeaveType.accrualType === 'quarterly') {
            lt.accrued = calculateQuarterlyAccrual(planLeaveType.annualAllocation, planLeaveType.accrualRate, currentDate);
          } else if (planLeaveType.accrualType === 'monthly') {
            const currentMonth = currentDate.getMonth() + 1;
            lt.accrued = Math.min(currentMonth * planLeaveType.accrualRate, planLeaveType.annualAllocation);
          }
        }
      });
    }

    // Calculate pending leaves
    const pendingLeaves = await Leave.find({
      employeeId: userId,
      status: 'pending',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    // Calculate approved/used leaves
    const approvedLeaves = await Leave.find({
      employeeId: userId,
      status: 'approved',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    // Reset and recalculate
    leaveBalance.leaveTypes.forEach((lt: any) => {
      lt.used = 0;
      lt.pending = 0;
    });

    // Calculate used days
    approvedLeaves.forEach((leave) => {
      const days = leave.days || 0;
      const ltBalance = leaveBalance.leaveTypes.find((lt: any) => lt.type === leave.leaveType);
      if (ltBalance) {
        ltBalance.used += days;
      }
    });

    // Calculate pending days
    pendingLeaves.forEach((leave) => {
      const days = leave.days || 0;
      const ltBalance = leaveBalance.leaveTypes.find((lt: any) => lt.type === leave.leaveType);
      if (ltBalance) {
        ltBalance.pending += days;
      }
    });

    // Update available balances
    leaveBalance.leaveTypes.forEach((lt: any) => {
      lt.available = (lt.accrued || lt.allocated) + (lt.carriedForward || 0) - lt.used - lt.pending;
    });

    await leaveBalance.save();

    res.json({ success: true, data: leaveBalance });
  } catch (error) {
    console.error('Failed to read leave balance:', error);
    res.status(500).json({ success: false, message: 'Failed to read leave balance' });
  }
});

// Get all leave plans
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await LeavePlan.find({ isActive: true });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Failed to read leave plans:', error);
    res.status(500).json({ success: false, message: 'Failed to read leave plans' });
  }
});

// Get specific leave plan
router.get('/plans/:planName', async (req: Request, res: Response) => {
  try {
    const plan = await LeavePlan.findOne({ planName: req.params.planName, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Failed to read leave plan:', error);
    res.status(500).json({ success: false, message: 'Failed to read leave plan' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to read leave:', error);
    res.status(500).json({ success: false, message: 'Failed to read leave' });
  }
});

router.post('/', leaveValidation.create, async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    
    // Check for overlapping leaves (prevent duplicate applications)
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $nin: ['rejected', 'cancelled'] },
      $or: [
        // New leave starts within existing leave
        { startDate: { $lte: newStart }, endDate: { $gte: newStart } },
        // New leave ends within existing leave
        { startDate: { $lte: newEnd }, endDate: { $gte: newEnd } },
        // New leave encompasses existing leave
        { startDate: { $gte: newStart }, endDate: { $lte: newEnd } }
      ]
    });
    
    if (overlappingLeave) {
      return res.status(400).json({ 
        success: false, 
        message: 'Leave dates overlap with an existing leave request. You already have a leave from ' +
          new Date(overlappingLeave.startDate).toLocaleDateString() + ' to ' + 
          new Date(overlappingLeave.endDate).toLocaleDateString()
      });
    }
    
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to create leave:', error);
    res.status(500).json({ success: false, message: 'Failed to create leave' });
  }
});

router.put('/:id', leaveValidation.update, async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {  new: true , runValidators: true });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to update leave:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave' });
  }
});

// Approve leave
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approvedBy } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.status !== 'pending' && leave.status !== 'in_review') {
      return res.status(400).json({ success: false, message: 'Leave is not in a pending state' });
    }

    leave.status = 'approved';
    leave.approvedBy = approvedBy;
    leave.approvedOn = new Date();
    await leave.save();

    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to approve leave:', error);
    res.status(500).json({ success: false, message: 'Failed to approve leave' });
  }
});

// Reject leave
router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { rejectedBy, rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.status !== 'pending' && leave.status !== 'in_review') {
      return res.status(400).json({ success: false, message: 'Leave is not in a pending state' });
    }

    leave.status = 'rejected';
    leave.rejectedBy = rejectedBy;
    leave.rejectedOn = new Date();
    leave.rejectionReason = rejectionReason || 'No reason provided';
    await leave.save();

    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to reject leave:', error);
    res.status(500).json({ success: false, message: 'Failed to reject leave' });
  }
});

// Cancel leave
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { cancellationReason, cancelledBy } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    if (leave.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Leave is already cancelled' });
    }

    leave.status = 'cancelled';
    leave.cancelledOn = new Date();
    leave.cancelledBy = cancelledBy || leave.employeeId;
    leave.cancellationReason = cancellationReason || 'Cancelled by employee';
    await leave.save();

    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Failed to cancel leave:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel leave' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    res.json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    console.error('Failed to delete leave:', error);
    res.status(500).json({ success: false, message: 'Failed to delete leave' });
  }
});

export default router;

