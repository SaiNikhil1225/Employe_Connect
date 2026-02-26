import express, { Request, Response } from 'express';
import PIP from '../models/PIP';
import Employee from '../models/Employee';
import notificationService from '../services/notificationService';

const router = express.Router();

// Get all PIPs (for HR/Admin)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const pips = await PIP.find().sort({ initiatedAt: -1 });
    res.json({ success: true, data: pips });
  } catch (error) {
    console.error('Failed to fetch PIPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch PIPs' });
  }
});

// Get PIPs by employee ID with enriched data
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const pips = await PIP.find({ 
      employeeId: req.params.employeeId 
    }).sort({ initiatedAt: -1 });
    
    // Enrich with additional data
    const enrichedPips = await Promise.all(pips.map(async (pip) => {
      // Get initiator details
      const initiator = await Employee.findOne({ employeeId: pip.initiatedBy });
      
      // Get reporting manager details
      const reportingManager = await Employee.findOne({ employeeId: pip.reportingManagerId });
      
      // Calculate days remaining
      const today = new Date();
      const endDate = new Date(pip.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate progress
      const completedTasks = pip.tasks.filter(t => t.completed).length;
      const totalTasks = pip.tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...pip.toObject(),
        raisedBy: initiator ? {
          id: initiator.employeeId,
          name: initiator.name,
          email: initiator.email,
          avatar: initiator.profilePhoto,
          role: initiator.role
        } : null,
        reportingManager: reportingManager ? {
          id: reportingManager.employeeId,
          name: reportingManager.name,
          email: reportingManager.email,
          avatar: reportingManager.profilePhoto
        } : null,
        daysRemaining,
        completedTasks,
        totalTasks,
        progress
      };
    }));
    
    res.json({ success: true, data: enrichedPips });
  } catch (error) {
    console.error('Failed to fetch employee PIPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee PIPs' });
  }
});

// Get PIPs by reporting manager
router.get('/manager/:managerId', async (req: Request, res: Response) => {
  try {
    const pips = await PIP.find({ 
      reportingManagerId: req.params.managerId 
    }).sort({ initiatedAt: -1 });
    
    res.json({ success: true, data: pips });
  } catch (error) {
    console.error('Failed to fetch manager PIPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch manager PIPs' });
  }
});

// Start new PIP
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { 
      employeeId,
      reason,
      attachments,
      evaluationProcess,
      improvementPlan,
      startDate,
      endDate,
      tasks,
      initiatedBy,
      initiatedByName
    } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check for active PIP
    const existingPIP = await PIP.findOne({ 
      employeeId,
      status: { $in: ['Pending', 'Acknowledged', 'Active'] }
    });
    
    if (existingPIP) {
      console.log('Existing active PIP found:', {
        pipNumber: existingPIP.pipNumber,
        status: existingPIP.status,
        startDate: existingPIP.startDate,
        endDate: existingPIP.endDate
      });
      return res.status(400).json({ 
        success: false, 
        message: `Employee already has an active PIP (${existingPIP.pipNumber} - ${existingPIP.status}). Please complete or cancel it before creating a new one.` 
      });
    }

    // Get reporting manager
    const reportingManagerId = employee.reportingManagerId || employee.reportingManager?.id;
    if (!reportingManagerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee does not have a reporting manager assigned' 
      });
    }

    const reportingManager = await Employee.findOne({ employeeId: reportingManagerId });
    if (!reportingManager) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reporting manager not found' 
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get initiator details
    const initiator = await Employee.findOne({ employeeId: initiatedBy });

    // Create PIP
    const pip = new PIP({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      designation: employee.designation,
      reason,
      attachments: attachments || [],
      evaluationProcess,
      improvementPlan,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
      tasks: tasks.map((task: any) => ({
        name: task.name,
        startDate: new Date(task.startDate),
        completed: false
      })),
      reportingManagerId: reportingManager.employeeId,
      reportingManagerName: reportingManager.name,
      initiatedBy,
      initiatedByName,
      initiatedByRole: initiator?.role,
      initiatedByAvatar: initiator?.profilePhoto,
      approvalStatus: 'Approved',
      approvedAt: new Date(),
      status: 'Pending',
      initiatedAt: new Date()
    });

    await pip.save();

    // Send notifications
    try {
      // Notify the employee
      await notificationService.createNotification({
        userId: employee._id.toString(),
        role: employee.role,
        type: 'system',
        title: 'Performance Improvement Plan Started',
        description: `You have been placed under a Performance Improvement Plan (${pip.pipNumber}). Please review and acknowledge.`,
        link: `/performance`,
        meta: {
          pipNumber: pip.pipNumber,
          pipId: String(pip._id),
          duration: duration,
          startDate: startDate
        }
      });

      // Notify the reporting manager
      await notificationService.createNotification({
        userId: reportingManager._id.toString(),
        role: reportingManager.role,
        type: 'system',
        title: 'PIP Started - Team Member',
        description: `${employee.name} has been placed under a Performance Improvement Plan (${pip.pipNumber}).`,
        link: `/performance`,
        meta: {
          pipNumber: pip.pipNumber,
          employeeId: employee.employeeId,
          employeeName: employee.name
        }
      });

      // Notify HR SPOC for the employee's department
      const hrSpoc = await Employee.find({ 
        role: { $in: ['HR', 'SUPER_ADMIN'] },
        department: employee.department, // Same department as employee
        isActive: true
      });

      // If no HR in same department, notify any HR/SUPER_ADMIN
      const hrToNotify = hrSpoc.length > 0 ? hrSpoc : await Employee.find({
        role: { $in: ['HR', 'SUPER_ADMIN'] },
        isActive: true
      }).limit(1);

      for (const hr of hrToNotify) {
        await notificationService.createNotification({
          userId: hr._id.toString(),
          role: hr.role,
          type: 'system',
          title: 'New PIP Started',
          description: `Performance Improvement Plan started for ${employee.name} (${pip.pipNumber}).`,
          link: `/performance`,
          meta: {
            pipNumber: pip.pipNumber,
            employeeId: employee.employeeId,
            employeeName: employee.name,
            department: employee.department
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to send notifications:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({ 
      success: true, 
      data: pip,
      message: `PIP started successfully for ${employee.name}. Notifications sent.`
    });
  } catch (error) {
    console.error('Failed to start PIP:', error);
    res.status(500).json({ success: false, message: 'Failed to start PIP' });
  }
});

// Acknowledge PIP (by employee)
router.patch('/:pipId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { pipId } = req.params;
    const { employeeId } = req.body;

    const pip = await PIP.findById(pipId);
    if (!pip) {
      return res.status(404).json({ success: false, message: 'PIP not found' });
    }

    // Verify employee
    if (pip.employeeId !== employeeId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the employee can acknowledge their PIP' 
      });
    }

    if (pip.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `PIP has already been ${pip.status.toLowerCase()}` 
      });
    }

    // Update PIP status
    pip.status = 'Acknowledged';
    pip.acknowledgedAt = new Date();
    pip.lastModifiedBy = employeeId;
    pip.lastModifiedAt = new Date();

    await pip.save();

    // Notify reporting manager and HR
    try {
      const reportingManager = await Employee.findOne({ 
        employeeId: pip.reportingManagerId 
      });
      
      if (reportingManager) {
        await notificationService.createNotification({
          userId: reportingManager._id.toString(),
          role: reportingManager.role,
          type: 'system',
          title: 'PIP Acknowledged',
          description: `${pip.employeeName} has acknowledged their Performance Improvement Plan (${pip.pipNumber}).`,
          link: `/performance`,
          meta: {
            pipNumber: pip.pipNumber,
            employeeId: pip.employeeId
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to send acknowledgement notification:', notifError);
    }

    res.json({ 
      success: true, 
      data: pip,
      message: 'PIP acknowledged successfully'
    });
  } catch (error) {
    console.error('Failed to acknowledge PIP:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge PIP' });
  }
});

// Update task status
router.patch('/:pipId/tasks/:taskIndex', async (req: Request, res: Response) => {
  try {
    const { pipId, taskIndex } = req.params;
    const { completed } = req.body;

    const pip = await PIP.findById(pipId);
    if (!pip) {
      return res.status(404).json({ success: false, message: 'PIP not found' });
    }

    const index = parseInt(taskIndex);
    if (index < 0 || index >= pip.tasks.length) {
      return res.status(400).json({ success: false, message: 'Invalid task index' });
    }

    pip.tasks[index].completed = completed;
    if (completed) {
      pip.tasks[index].completedDate = new Date();
    } else {
      pip.tasks[index].completedDate = undefined;
    }

    await pip.save();

    res.json({ 
      success: true, 
      data: pip,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update PIP status (Complete, Cancel, or set to Active)
router.patch('/:pipId/status', async (req: Request, res: Response) => {
  try {
    const { pipId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Acknowledged', 'Active', 'Completed', 'Failed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const pip = await PIP.findById(pipId);
    if (!pip) {
      return res.status(404).json({ success: false, message: 'PIP not found' });
    }

    pip.status = status;
    await pip.save();

    res.json({ 
      success: true, 
      data: pip,
      message: `PIP status updated to ${status}`
    });
  } catch (error) {
    console.error('Failed to update PIP status:', error);
    res.status(500).json({ success: false, message: 'Failed to update PIP status' });
  }
});

// Delete/Remove a PIP (for admin cleanup)
router.delete('/:pipId', async (req: Request, res: Response) => {
  try {
    const { pipId } = req.params;

    const pip = await PIP.findByIdAndDelete(pipId);
    if (!pip) {
      return res.status(404).json({ success: false, message: 'PIP not found' });
    }

    res.json({ 
      success: true, 
      message: `PIP ${pip.pipNumber} deleted successfully`
    });
  } catch (error) {
    console.error('Failed to delete PIP:', error);
    res.status(500).json({ success: false, message: 'Failed to delete PIP' });
  }
});

export default router;

