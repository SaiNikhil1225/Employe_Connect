import { Request, Response } from 'express';
import PIP from '../models/PIP';

// Start a new PIP for an employee
export const startPIP = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employeeId,
      employeeName,
      reason,
      evaluationProcess,
      improvementPlan,
      startDate,
      endDate,
      tasks,
      attachments,
      initiatedBy,
      initiatedByName,
      notes,
    } = req.body;

    if (!employeeId || !employeeName || !reason || !evaluationProcess || !improvementPlan || !startDate || !endDate || !initiatedBy || !initiatedByName) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const pip = new PIP({
      employeeId,
      employeeName,
      reason,
      evaluationProcess,
      improvementPlan,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'active',
      tasks: tasks || [],
      attachments: attachments || [],
      initiatedBy,
      initiatedByName,
      notes,
    });

    await pip.save();
    res.status(201).json({ success: true, data: pip });
  } catch (error) {
    console.error('Failed to start PIP:', error);
    res.status(500).json({ success: false, message: 'Failed to start PIP' });
  }
};

// Get all PIPs for a specific employee
export const getEmployeePIPs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const pips = await PIP.find({ employeeId }).sort({ createdAt: -1 });
    res.json({ success: true, data: pips });
  } catch (error) {
    console.error('Failed to get employee PIPs:', error);
    res.status(500).json({ success: false, message: 'Failed to get PIPs' });
  }
};

// Get active PIP count (for dashboard)
export const getActivePIPCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await PIP.countDocuments({ status: 'active' });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Failed to get active PIP count:', error);
    res.status(500).json({ success: false, message: 'Failed to get PIP count' });
  }
};

// Get all PIPs (admin/HR view)
export const getAllPIPs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, employeeId } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    const pips = await PIP.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: pips });
  } catch (error) {
    console.error('Failed to get all PIPs:', error);
    res.status(500).json({ success: false, message: 'Failed to get PIPs' });
  }
};

// Employee acknowledges the PIP
export const acknowledgePIP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pipId } = req.params;
    const { employeeId } = req.body;

    const pip = await PIP.findById(pipId);
    if (!pip) {
      res.status(404).json({ success: false, message: 'PIP not found' });
      return;
    }

    (pip as any).acknowledgedBy = employeeId;
    (pip as any).acknowledgedAt = new Date();
    await pip.save();

    res.json({ success: true, data: pip });
  } catch (error) {
    console.error('Failed to acknowledge PIP:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge PIP' });
  }
};

// Update PIP status (complete, fail, cancel)
export const updatePIPStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pipId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['active', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const pip = await PIP.findById(pipId);
    if (!pip) {
      res.status(404).json({ success: false, message: 'PIP not found' });
      return;
    }

    pip.status = status;
    if (notes) (pip as any).notes = notes;
    if (status === 'completed' || status === 'failed') {
      (pip as any).completedAt = new Date();
    }

    await pip.save();
    res.json({ success: true, data: pip });
  } catch (error) {
    console.error('Failed to update PIP status:', error);
    res.status(500).json({ success: false, message: 'Failed to update PIP status' });
  }
};
