import express, { Request, Response } from 'express';
import Leave from '../models/Leave';
import LeaveBalance from '../models/LeaveBalance';
import { LeavePolicy } from '../models/LeavePolicy';
import Employee from '../models/Employee';
import { leaveValidation } from '../middleware/validation';
import { checkModulePermission } from '../middleware/permissions';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper function to calculate allocated leaves based on distribution
const calculateAllocation = (totalAllocation: number, distribution: string, currentDate: Date): number => {
  const month = currentDate.getMonth(); // 0-11
  
  switch (distribution) {
    case 'QUARTERLY':
      const quarter = Math.floor(month / 3) + 1;
      return (totalAllocation / 4) * quarter;
    case 'HALF_YEARLY':
      const half = month < 6 ? 1 : 2;
      return (totalAllocation / 2) * half;
    case 'ANNUAL':
    default:
      return totalAllocation;
  }
};

router.get('/', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'view' }), async (req: Request, res: Response) => {
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
router.get('/user/:userId', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'view' }), async (req: Request, res: Response) => {
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
router.get('/pending', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'view' }), async (_req: Request, res: Response) => {
  try {
    const leaves = await Leave.find({ status: 'pending' }).sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Failed to read pending leaves:', error);
    res.status(500).json({ success: false, message: 'Failed to read pending leaves' });
  }
});

// Get leave balance for a user
router.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();

    // Get employee to fetch their country/location
    const employee = await Employee.findOne({ employeeId: req.params.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Get leave policies for employee's location (using location as country)
    const employeeCountry = employee.location || 'India'; // Default to India
    const policies = await LeavePolicy.find({ 
      country: employeeCountry, 
      isActive: true 
    });

    // Try to get existing balance record for current year
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let leaveBalance: any = await LeaveBalance.findOne({
      employeeId: req.params.userId,
      year: currentYear
    });

    // If no balance found, create default one with policy-based allocations
    if (!leaveBalance) {
      const policyMap: any = {};
      const currentDate = new Date();
      
      // Build balance from policies
      policies.forEach(policy => {
        const allocated = calculateAllocation(policy.allocation, policy.distribution, currentDate);
        policyMap[policy.leaveType] = {
          total: allocated,
          used: 0,
          remaining: allocated
        };
      });

      // Create balance with dynamic fields or fallback to defaults
      leaveBalance = new LeaveBalance({
        employeeId: req.params.userId,
        year: currentYear,
        earnedLeave: policyMap['Earned Leave'] || { total: 15, used: 0, remaining: 15 },
        sabbaticalLeave: policyMap['Sabbatical Leave'] || { total: 5, used: 0, remaining: 5 },
        compOff: policyMap['Comp Off'] || { total: 0, used: 0, remaining: 0 },
        paternityLeave: policyMap['Paternity Leave'] || { total: 5, used: 0, remaining: 5 }
      });
      await leaveBalance.save();
    }

    // Calculate and update used leaves from approved leave records
    const approvedLeaves = await Leave.find({
      employeeId: req.params.userId,
      status: 'approved',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    // Reset used counts
    leaveBalance.earnedLeave.used = 0;
    leaveBalance.sabbaticalLeave.used = 0;
    leaveBalance.compOff.used = 0;
    leaveBalance.paternityLeave.used = 0;

    // Calculate used days
    approvedLeaves.forEach((leave) => {
      const days = leave.days || 0;
      switch (leave.leaveType) {
        case 'Earned Leave':
          leaveBalance.earnedLeave.used += days;
          break;
        case 'Sabbatical Leave':
          leaveBalance.sabbaticalLeave.used += days;
          break;
        case 'Comp Off':
          leaveBalance.compOff.used += days;
          break;
        case 'Paternity Leave':
          leaveBalance.paternityLeave.used += days;
          break;
      }
    });

    // Update remaining balances
    leaveBalance.earnedLeave.remaining = leaveBalance.earnedLeave.total - leaveBalance.earnedLeave.used;
    leaveBalance.sabbaticalLeave.remaining = leaveBalance.sabbaticalLeave.total - leaveBalance.sabbaticalLeave.used;
    leaveBalance.compOff.remaining = leaveBalance.compOff.total - leaveBalance.compOff.used;
    leaveBalance.paternityLeave.remaining = leaveBalance.paternityLeave.total - leaveBalance.paternityLeave.used;

    await leaveBalance.save();

    // Format response to match frontend expectation
    const balance = {
      userId: req.params.userId,
      earnedLeave: {
        total: leaveBalance.earnedLeave.total,
        used: leaveBalance.earnedLeave.used,
        remaining: leaveBalance.earnedLeave.remaining,
      },
      sabbaticalLeave: {
        total: leaveBalance.sabbaticalLeave.total,
        used: leaveBalance.sabbaticalLeave.used,
        remaining: leaveBalance.sabbaticalLeave.remaining,
      },
      compOff: {
        total: leaveBalance.compOff.total,
        used: leaveBalance.compOff.used,
        remaining: leaveBalance.compOff.remaining,
      },
      paternityLeave: {
        total: leaveBalance.paternityLeave.total,
        used: leaveBalance.paternityLeave.used,
        remaining: leaveBalance.paternityLeave.remaining,
      },
      maternityLeave: {
        total: leaveBalance.maternityLeave.total,
        used: leaveBalance.maternityLeave.used,
        remaining: leaveBalance.maternityLeave.remaining,
      },
      sickLeave: {
        total: leaveBalance.sickLeave.total,
        used: leaveBalance.sickLeave.used,
        remaining: leaveBalance.sickLeave.remaining,
      },
    };

    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Failed to read leave balance:', error);
    res.status(500).json({ success: false, message: 'Failed to read leave balance' });
  }
});

// Get leave policies for an employee (based on their location/country)
router.get('/policies/:userId', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const employeeCountry = employee.location || 'India';
    const policies = await LeavePolicy.find({ 
      country: employeeCountry, 
      isActive: true 
    }).select('leaveType allocation distribution carryForward maxCarryForward encashable requiresApproval minDaysNotice maxConsecutiveDays description');

    res.json({ success: true, data: policies });
  } catch (error) {
    console.error('Failed to fetch leave policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave policies' });
  }
});

router.put('/:id', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'modify' }), async (req: Request, res: Response) => {
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

router.post('/', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'add' }), leaveValidation.create, async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, leaveType, days } = req.body;
    
    // Get employee to fetch their country/location
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Get leave policy for this leave type and employee's location
    const employeeCountry = employee.location || 'India';
    const policy = await LeavePolicy.findOne({ 
      leaveType, 
      country: employeeCountry, 
      isActive: true 
    });

    // If policy exists, validate against it
    if (policy) {
      // Check minimum days notice
      if (policy.minDaysNotice) {
        const daysUntilLeave = Math.floor(
          (new Date(startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilLeave < policy.minDaysNotice) {
          return res.status(400).json({
            success: false,
            message: `This leave type requires at least ${policy.minDaysNotice} days notice. You are applying ${daysUntilLeave} days in advance.`
          });
        }
      }

      // Check maximum consecutive days
      if (policy.maxConsecutiveDays && days > policy.maxConsecutiveDays) {
        return res.status(400).json({
          success: false,
          message: `This leave type allows maximum ${policy.maxConsecutiveDays} consecutive days. You are requesting ${days} days.`
        });
      }

      // Set requiresApproval based on policy
      req.body.requiresApproval = policy.requiresApproval;
    }
    
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
router.patch('/:id/approve', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'modify' }), async (req: Request, res: Response) => {
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
router.patch('/:id/reject', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'modify' }), async (req: Request, res: Response) => {
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
router.patch('/:id/cancel', authenticateToken, checkModulePermission({ module: 'LEAVE', action: 'modify' }), async (req: Request, res: Response) => {
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

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
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

