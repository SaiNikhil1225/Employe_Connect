import type { Request, Response } from 'express';
import FinancialLine from '../models/FinancialLine';
import Project from '../models/Project';

// Generate FL number
const generateFLNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await FinancialLine.countDocuments({
    flNo: new RegExp(`^FL-${year}-`)
  });
  const sequence = String(count + 1).padStart(4, '0');
  return `FL-${year}-${sequence}`;
};

// Get all financial lines with filters
export const getFinancialLines = async (req: Request, res: Response) => {
  try {
    const { status, locationType, contractType, projectId, search } = req.query;
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (locationType) query.locationType = locationType;
    if (contractType) query.contractType = contractType;
    if (projectId) query.projectId = projectId;
    
    if (search) {
      query.$or = [
        { flNo: { $regex: search, $options: 'i' } },
        { flName: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('getFinancialLines - Query:', query);

    const fls = await FinancialLine.find(query)
      .populate('projectId', 'projectName projectId')
      .sort({ createdAt: -1 });

    console.log('getFinancialLines - Found FLs:', fls.length);

    res.json({ success: true, data: fls });
  } catch (error: unknown) {
    console.error('Failed to fetch financial lines:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch financial lines';
    res.status(500).json({ success: false, message });
  }
};

// Get active financial lines
export const getActiveFinancialLines = async (req: Request, res: Response) => {
  try {
    const fls = await FinancialLine.find({ status: 'Active' })
      .populate('projectId', 'projectName projectId')
      .populate('customerPOId', 'poNo contractNo')
      .sort({ flNo: 1 });
    
    res.json({ success: true, data: fls });
  } catch (error: unknown) {
    console.error('Failed to fetch active financial lines:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch active financial lines';
    res.status(500).json({ success: false, message });
  }
};

// Get financial line by ID
export const getFinancialLineById = async (req: Request, res: Response) => {
  try {
    const fl = await FinancialLine.findById(req.params.id)
      .populate('projectId', 'projectName projectId projectStartDate projectEndDate billingType projectCurrency');
    
    if (!fl) {
      return res.status(404).json({ success: false, message: 'Financial line not found' });
    }
    
    res.json({ success: true, data: fl });
  } catch (error: unknown) {
    console.error('Failed to fetch financial line:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch financial line';
    res.status(500).json({ success: false, message });
  }
};

// Create new financial line
export const createFinancialLine = async (req: Request, res: Response) => {
  try {
    console.log('Creating financial line with data:', JSON.stringify(req.body, null, 2));
    
    // Generate FL number if not provided
    if (!req.body.flNo) {
      req.body.flNo = await generateFLNumber();
    }

    // Validate project exists
    if (req.body.projectId) {
      const project = await Project.findById(req.body.projectId);
      if (!project) {
        console.error('Project not found:', req.body.projectId);
        return res.status(400).json({ success: false, message: 'Project not found' });
      }

      // Validate schedule dates within project dates
      if (req.body.scheduleStart && req.body.scheduleFinish) {
        const scheduleStart = new Date(req.body.scheduleStart);
        const scheduleFinish = new Date(req.body.scheduleFinish);
        const projectStart = new Date(project.projectStartDate);
        const projectEnd = new Date(project.projectEndDate);

        if (scheduleStart < projectStart || scheduleStart > projectEnd) {
          return res.status(400).json({
            success: false,
            message: 'Schedule start date must be within project dates'
          });
        }

        if (scheduleFinish < projectStart || scheduleFinish > projectEnd) {
          return res.status(400).json({
            success: false,
            message: 'Schedule finish date must be within project dates'
          });
        }
      }

      // Inherit contract type from project if not provided
      if (!req.body.contractType) {
        req.body.contractType = project.billingType;
      }

      // Inherit currency from project if not provided
      if (!req.body.currency) {
        req.body.currency = project.projectCurrency;
      }
    }

    // Validate payment milestones sum equals total funding (for non-T&M contracts)
    if (req.body.paymentMilestones && req.body.paymentMilestones.length > 0) {
      const totalMilestoneAmount = req.body.paymentMilestones.reduce(
        (sum: number, m: { amount: number }) => sum + m.amount,
        0
      );
      
      if (Math.abs(totalMilestoneAmount - req.body.totalFunding) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Sum of milestone amounts ($${totalMilestoneAmount}) must equal total funding ($${req.body.totalFunding})`
        });
      }
    }

    // Validate revenue planning sum doesn't exceed total funding
    if (req.body.revenuePlanning && req.body.revenuePlanning.length > 0) {
      const totalPlannedRevenue = req.body.revenuePlanning.reduce(
        (sum: number, r: { plannedRevenue: number }) => sum + r.plannedRevenue,
        0
      );
      
      if (totalPlannedRevenue > req.body.totalFunding) {
        return res.status(400).json({
          success: false,
          message: 'Total planned revenue cannot exceed total funding'
        });
      }
    }

    console.log('Creating FL with data:', {
      flNo: req.body.flNo,
      projectId: req.body.projectId,
      flName: req.body.flName,
      effort: req.body.effort,
      totalFunding: req.body.totalFunding,
      fundingCount: req.body.funding?.length,
      milestonesCount: req.body.paymentMilestones?.length,
    });

    const fl = new FinancialLine(req.body);
    await fl.save();
    
    console.log('Financial line saved successfully to DB:', fl._id, fl.flNo);
    
    const populatedFL = await FinancialLine.findById(fl._id)
      .populate('projectId', 'projectName projectId');
    
    console.log('Financial line populated and ready to return:', populatedFL?.flNo);
    
    res.status(201).json({ success: true, data: populatedFL });
  } catch (error: unknown) {
    console.error('Failed to create financial line:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const message = error instanceof Error ? error.message : 'Failed to create financial line';
    res.status(500).json({ success: false, message });
  }
};

// Update financial line
export const updateFinancialLine = async (req: Request, res: Response) => {
  try {
    // Validate project dates if being updated
    if (req.body.projectId) {
      const project = await Project.findById(req.body.projectId);
      if (!project) {
        return res.status(400).json({ success: false, message: 'Project not found' });
      }
    }

    // Recalculate funding value if rates changed
    if (req.body.unitRate && req.body.fundingUnits) {
      req.body.fundingValue = req.body.unitRate * req.body.fundingUnits;
    }

    const fl = await FinancialLine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'projectName projectId');

    if (!fl) {
      return res.status(404).json({ success: false, message: 'Financial line not found' });
    }

    res.json({ success: true, data: fl });
  } catch (error: unknown) {
    console.error('Failed to update financial line:', error);
    const message = error instanceof Error ? error.message : 'Failed to update financial line';
    res.status(500).json({ success: false, message });
  }
};

// Delete financial line
export const deleteFinancialLine = async (req: Request, res: Response) => {
  try {
    const fl = await FinancialLine.findByIdAndDelete(req.params.id);
    
    if (!fl) {
      return res.status(404).json({ success: false, message: 'Financial line not found' });
    }
    
    res.json({ success: true, message: 'Financial line deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete financial line:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete financial line';
    res.status(500).json({ success: false, message });
  }
};

// Get financial line stats
export const getFinancialLineStats = async (req: Request, res: Response) => {
  try {
    const [total, active, draft, closed, totalFunding] = await Promise.all([
      FinancialLine.countDocuments(),
      FinancialLine.countDocuments({ status: 'Active' }),
      FinancialLine.countDocuments({ status: 'Draft' }),
      FinancialLine.countDocuments({ status: 'Closed' }),
      FinancialLine.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: '$fundingValue' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        draft,
        closed,
        totalActiveFunding: totalFunding[0]?.total || 0
      }
    });
  } catch (error: unknown) {
    console.error('Failed to fetch financial line stats:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    res.status(500).json({ success: false, message });
  }
};
