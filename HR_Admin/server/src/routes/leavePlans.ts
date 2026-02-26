import express, { Request, Response } from 'express';
import LeavePlan from '../models/LeavePlan';
import Employee from '../models/Employee';
import LeaveBalance from '../models/LeaveBalance';
import LeaveBalanceAdjustment from '../models/LeaveBalanceAdjustment';

const router = express.Router();

// Middleware to check if user is HR (you may need to adjust based on your auth middleware)
const isHR = (req: Request, res: Response, next: any) => {
  // Add your HR check logic here
  // Example: if (req.user?.role !== 'hr') return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

// Get all leave plans with employee counts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const plans = await LeavePlan.find({ isActive: true }).sort({ planName: 1 });
    
    // Get employee count for each plan
    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const count = await Employee.countDocuments({ leavePlan: plan.planName });
        const planObject = plan.toObject();
        return {
          ...planObject,
          leaveTypes: planObject.leaveTypes || [], // Ensure leaveTypes is always an array
          employeeCount: count
        };
      })
    );

    res.json({ success: true, data: plansWithCounts });
  } catch (error) {
    console.error('Failed to fetch leave plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave plans' });
  }
});

// Get specific leave plan by ID or name
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by name
    let plan = await LeavePlan.findById(identifier);
    if (!plan) {
      plan = await LeavePlan.findOne({ planName: identifier, isActive: true });
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    const employeeCount = await Employee.countDocuments({ leavePlan: plan.planName });

    const planObject = plan.toObject();
    res.json({
      success: true,
      data: {
        ...planObject,
        leaveTypes: planObject.leaveTypes || [], // Ensure leaveTypes is always an array
        employeeCount
      }
    });
  } catch (error) {
    console.error('Failed to fetch leave plan:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave plan' });
  }
});

// Get employees assigned to a leave plan
router.get('/:planName/employees', async (req: Request, res: Response) => {
  try {
    const { planName } = req.params;
    const currentYear = new Date().getFullYear();

    // Get employees with this leave plan
    const employees = await Employee.find({ leavePlan: planName })
      .select('employeeId name email department designation leavePlan')
      .lean();

    // Get leave balances for these employees
    const employeeIds = employees.map(emp => emp.employeeId);
    const balances = await LeaveBalance.find({
      employeeId: { $in: employeeIds },
      year: currentYear
    }).lean();

    // Merge employee data with balances
    const employeesWithBalances = employees.map(emp => {
      const balance = balances.find(b => b.employeeId === emp.employeeId);
      return {
        ...emp,
        leaveBalance: balance ? {
          ...balance,
          leaveTypes: balance.leaveTypes || [] // Ensure leaveTypes is always an array
        } : null
      };
    });

    res.json({ success: true, data: employeesWithBalances });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
});

// Create new leave plan
router.post('/', isHR, async (req: Request, res: Response) => {
  try {
    const plan = new LeavePlan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    console.error('Failed to create leave plan:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Leave plan with this name already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create leave plan' });
  }
});

// Update leave plan
router.put('/:id', isHR, async (req: Request, res: Response) => {
  try {
    const plan = await LeavePlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Failed to update leave plan:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave plan' });
  }
});

// Add leave type to plan
router.post('/:planId/leave-types', isHR, async (req: Request, res: Response) => {
  try {
    const plan = await LeavePlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    // Check if leave type already exists
    const existingType = plan.leaveTypes.find((lt: any) => lt.type === req.body.type);
    if (existingType) {
      return res.status(400).json({ success: false, message: 'Leave type already exists in this plan' });
    }

    plan.leaveTypes.push(req.body);
    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Failed to add leave type:', error);
    res.status(500).json({ success: false, message: 'Failed to add leave type' });
  }
});

// Update leave type in plan
router.put('/:planId/leave-types/:leaveTypeId', isHR, async (req: Request, res: Response) => {
  try {
    const plan = await LeavePlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    const leaveType = plan.leaveTypes.id(req.params.leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    Object.assign(leaveType, req.body);
    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Failed to update leave type:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave type' });
  }
});

// Delete leave type from plan
router.delete('/:planId/leave-types/:leaveTypeId', isHR, async (req: Request, res: Response) => {
  try {
    const plan = await LeavePlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Leave plan not found' });
    }

    const leaveType = plan.leaveTypes.id(req.params.leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    (leaveType as any).remove();
    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Failed to delete leave type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete leave type' });
  }
});

// Allocate leave to employee
router.post('/allocate', isHR, async (req: Request, res: Response) => {
  try {
    const { employeeId, year, leaveType, days, reason, adjustedBy, adjustedByName } = req.body;
    const currentYear = year || new Date().getFullYear();

    // Get employee's leave plan
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Get or create leave balance
    let balance = await LeaveBalance.findOne({ employeeId, year: currentYear });
    
    if (!balance) {
      // Initialize balance from leave plan
      const plan = await LeavePlan.findOne({ planName: employee.leavePlan });
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Leave plan not found' });
      }

      balance = new LeaveBalance({
        employeeId,
        year: currentYear,
        leavePlan: employee.leavePlan,
        leaveTypes: plan.leaveTypes.map((lt: any) => ({
          type: lt.type,
          allocated: lt.type === leaveType ? days : lt.annualAllocation,
          accrued: lt.type === leaveType ? days : lt.annualAllocation,
          used: 0,
          pending: 0,
          available: lt.type === leaveType ? days : lt.annualAllocation,
          carriedForward: 0
        }))
      });
    } else {
      // Update existing balance
      let leaveTypeBalance = balance.leaveTypes.find((lt: any) => lt.type === leaveType);
      
      if (!leaveTypeBalance) {
        // Add new leave type to balance
        balance.leaveTypes.push({
          type: leaveType,
          allocated: days,
          accrued: days,
          used: 0,
          pending: 0,
          available: days,
          carriedForward: 0
        } as any);
      } else {
        // Save before state
        const balanceBefore = {
          allocated: leaveTypeBalance.allocated,
          accrued: leaveTypeBalance.accrued,
          used: leaveTypeBalance.used,
          pending: leaveTypeBalance.pending,
          available: leaveTypeBalance.available
        };

        // Update allocation
        leaveTypeBalance.allocated += days;
        leaveTypeBalance.accrued += days;
        leaveTypeBalance.available = leaveTypeBalance.accrued + (leaveTypeBalance.carriedForward || 0) - leaveTypeBalance.used - leaveTypeBalance.pending;

        // Create audit trail
        const adjustment = new LeaveBalanceAdjustment({
          employeeId,
          year: currentYear,
          leaveType,
          adjustmentType: 'Allocate',
          days,
          reason,
          adjustedBy,
          adjustedByName,
          balanceBefore,
          balanceAfter: {
            allocated: leaveTypeBalance.allocated,
            accrued: leaveTypeBalance.accrued,
            used: leaveTypeBalance.used,
            pending: leaveTypeBalance.pending,
            available: leaveTypeBalance.available
          }
        });
        await adjustment.save();
      }
    }

    await balance.save();

    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Failed to allocate leave:', error);
    res.status(500).json({ success: false, message: 'Failed to allocate leave' });
  }
});

// Adjust leave balance (add/deduct)
router.post('/adjust', isHR, async (req: Request, res: Response) => {
  try {
    const { employeeId, year, leaveType, adjustmentType, days, reason, adjustedBy, adjustedByName } = req.body;
    const currentYear = year || new Date().getFullYear();

    const balance = await LeaveBalance.findOne({ employeeId, year: currentYear });
    if (!balance) {
      return res.status(404).json({ success: false, message: 'Leave balance not found' });
    }

    const leaveTypeBalance = balance.leaveTypes.find((lt: any) => lt.type === leaveType);
    if (!leaveTypeBalance) {
      return res.status(404).json({ success: false, message: 'Leave type not found in balance' });
    }

    // Save before state
    const balanceBefore = {
      allocated: leaveTypeBalance.allocated,
      accrued: leaveTypeBalance.accrued,
      used: leaveTypeBalance.used,
      pending: leaveTypeBalance.pending,
      available: leaveTypeBalance.available
    };

    // Apply adjustment
    if (adjustmentType === 'Add') {
      leaveTypeBalance.allocated += days;
      leaveTypeBalance.accrued += days;
    } else if (adjustmentType === 'Deduct') {
      leaveTypeBalance.allocated = Math.max(0, leaveTypeBalance.allocated - days);
      leaveTypeBalance.accrued = Math.max(0, leaveTypeBalance.accrued - days);
    }

    // Recalculate available
    leaveTypeBalance.available = leaveTypeBalance.accrued + (leaveTypeBalance.carriedForward || 0) - leaveTypeBalance.used - leaveTypeBalance.pending;
    leaveTypeBalance.available = Math.max(0, leaveTypeBalance.available);

    // Create audit trail
    const adjustment = new LeaveBalanceAdjustment({
      employeeId,
      year: currentYear,
      leaveType,
      adjustmentType,
      days,
      reason,
      adjustedBy,
      adjustedByName,
      balanceBefore,
      balanceAfter: {
        allocated: leaveTypeBalance.allocated,
        accrued: leaveTypeBalance.accrued,
        used: leaveTypeBalance.used,
        pending: leaveTypeBalance.pending,
        available: leaveTypeBalance.available
      }
    });
    await adjustment.save();

    await balance.save();

    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Failed to adjust leave:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust leave' });
  }
});

// Bulk allocate leave to multiple employees
router.post('/bulk-allocate', isHR, async (req: Request, res: Response) => {
  try {
    const { employeeIds, year, leaveType, days, reason, adjustedBy, adjustedByName } = req.body;
    const currentYear = year || new Date().getFullYear();

    const results = {
      success: [],
      failed: []
    };

    for (const employeeId of employeeIds) {
      try {
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
          results.failed.push({ employeeId, reason: 'Employee not found' });
          continue;
        }

        let balance = await LeaveBalance.findOne({ employeeId, year: currentYear });
        
        if (!balance) {
          const plan = await LeavePlan.findOne({ planName: employee.leavePlan });
          if (!plan) {
            results.failed.push({ employeeId, reason: 'Leave plan not found' });
            continue;
          }

          balance = new LeaveBalance({
            employeeId,
            year: currentYear,
            leavePlan: employee.leavePlan,
            leaveTypes: plan.leaveTypes.map((lt: any) => ({
              type: lt.type,
              allocated: lt.type === leaveType ? days : lt.annualAllocation,
              accrued: lt.type === leaveType ? days : lt.annualAllocation,
              used: 0,
              pending: 0,
              available: lt.type === leaveType ? days : lt.annualAllocation,
              carriedForward: 0
            }))
          });
        } else {
          let leaveTypeBalance = balance.leaveTypes.find((lt: any) => lt.type === leaveType);
          
          if (!leaveTypeBalance) {
            balance.leaveTypes.push({
              type: leaveType,
              allocated: days,
              accrued: days,
              used: 0,
              pending: 0,
              available: days,
              carriedForward: 0
            } as any);
          } else {
            const balanceBefore = {
              allocated: leaveTypeBalance.allocated,
              accrued: leaveTypeBalance.accrued,
              used: leaveTypeBalance.used,
              pending: leaveTypeBalance.pending,
              available: leaveTypeBalance.available
            };

            leaveTypeBalance.allocated += days;
            leaveTypeBalance.accrued += days;
            leaveTypeBalance.available = leaveTypeBalance.accrued + (leaveTypeBalance.carriedForward || 0) - leaveTypeBalance.used - leaveTypeBalance.pending;

            const adjustment = new LeaveBalanceAdjustment({
              employeeId,
              year: currentYear,
              leaveType,
              adjustmentType: 'Allocate',
              days,
              reason,
              adjustedBy,
              adjustedByName,
              balanceBefore,
              balanceAfter: {
                allocated: leaveTypeBalance.allocated,
                accrued: leaveTypeBalance.accrued,
                used: leaveTypeBalance.used,
                pending: leaveTypeBalance.pending,
                available: leaveTypeBalance.available
              }
            });
            await adjustment.save();
          }
        }

        await balance.save();
        results.success.push({ employeeId, message: 'Successfully allocated' });
      } catch (error) {
        results.failed.push({ employeeId, reason: 'Processing error' });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Failed to bulk allocate:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk allocate leave' });
  }
});

// Get adjustment history for employee
router.get('/adjustments/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const adjustments = await LeaveBalanceAdjustment.find({
      employeeId,
      year: currentYear
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: adjustments });
  } catch (error) {
    console.error('Failed to fetch adjustments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch adjustment history' });
  }
});

export default router;
