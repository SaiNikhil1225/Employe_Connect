import express, { Request, Response } from 'express';
import ExitRequest from '../models/ExitRequest';
import Employee from '../models/Employee';
import notificationService from '../services/notificationService';

const router = express.Router();

// Get all exit requests (for HR/Admin)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const requests = await ExitRequest.find().sort({ initiatedAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Failed to fetch exit requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exit requests' });
  }
});

// Get exit requests by reporting manager (for approvals)
router.get('/pending/:managerId', async (req: Request, res: Response) => {
  try {
    const requests = await ExitRequest.find({
      reportingManagerId: req.params.managerId,
      approvalStatus: 'Pending'
    }).sort({ initiatedAt: -1 });
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Failed to fetch pending exit requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending exit requests' });
  }
});

// Get exit request by employee ID
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const request = await ExitRequest.findOne({ 
      employeeId: req.params.employeeId 
    }).sort({ initiatedAt: -1 });
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exit request not found' 
      });
    }
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Failed to fetch exit request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exit request' });
  }
});

// Create new exit request
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { 
      employeeId,
      exitReason,
      discussionHeld,
      discussionSummary,
      resignationReason,
      resignationNoticeDate,
      terminationReason,
      terminationNoticeDate,
      lastWorkingDayOption,
      customLastWorkingDay,
      okToRehire,
      initiatedBy,
      initiatedByName
    } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if exit request already exists
    const existingRequest = await ExitRequest.findOne({ 
      employeeId,
      approvalStatus: { $in: ['Pending', 'Approved'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'An active exit request already exists for this employee' 
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

    // Calculate last working day
    const noticeDate = exitReason === 'resign' ? resignationNoticeDate : terminationNoticeDate;
    let calculatedLastWorkingDay: Date;
    
    if (lastWorkingDayOption === 'other' && customLastWorkingDay) {
      calculatedLastWorkingDay = new Date(customLastWorkingDay);
    } else {
      // Calculate 90 days from notice date
      const date = new Date(noticeDate);
      date.setDate(date.getDate() + 90);
      calculatedLastWorkingDay = date;
    }

    // Create exit request
    const exitRequest = new ExitRequest({
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      designation: employee.designation,
      exitReason,
      discussionHeld,
      discussionSummary,
      resignationReason: exitReason === 'resign' ? resignationReason : undefined,
      resignationNoticeDate: exitReason === 'resign' ? resignationNoticeDate : undefined,
      terminationReason: exitReason === 'terminate' ? terminationReason : undefined,
      terminationNoticeDate: exitReason === 'terminate' ? terminationNoticeDate : undefined,
      lastWorkingDayOption,
      customLastWorkingDay: lastWorkingDayOption === 'other' ? customLastWorkingDay : undefined,
      calculatedLastWorkingDay,
      okToRehire,
      reportingManagerId: reportingManager.employeeId,
      reportingManagerName: reportingManager.name,
      approvalStatus: 'Pending',
      initiatedBy,
      initiatedByName,
      initiatedAt: new Date()
    });

    await exitRequest.save();

    // Send notification to reporting manager
    try {
      await notificationService.createNotification({
        userId: reportingManager._id.toString(),
        type: 'exit_request',
        title: 'Exit Request Approval Required',
        message: `${employee.name} has submitted an exit request (${exitReason === 'resign' ? 'Resignation' : 'Termination'}). Please review and approve.`,
        priority: 'high',
        actionUrl: `/approvals/exit-requests/${exitRequest._id}`,
        metadata: {
          requestNumber: exitRequest.requestNumber,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          exitReason: exitReason
        }
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({ 
      success: true, 
      data: exitRequest,
      message: `Exit request initiated successfully. Sent to ${reportingManager.name} for approval.`
    });
  } catch (error) {
    console.error('Failed to initiate exit request:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate exit request' });
  }
});

// Approve/Reject exit request
router.patch('/:requestId/approve', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { approverId, approverName, status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be either Approved or Rejected' 
      });
    }

    const exitRequest = await ExitRequest.findById(requestId);
    if (!exitRequest) {
      return res.status(404).json({ success: false, message: 'Exit request not found' });
    }

    // Verify approver is the reporting manager
    if (exitRequest.reportingManagerId !== approverId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the reporting manager can approve this request' 
      });
    }

    if (exitRequest.approvalStatus !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Exit request has already been ${exitRequest.approvalStatus.toLowerCase()}` 
      });
    }

    // Update exit request
    exitRequest.approvalStatus = status as 'Approved' | 'Rejected';
    exitRequest.approvedBy = approverId;
    exitRequest.approvedByName = approverName;
    exitRequest.approvedAt = new Date();
    exitRequest.rejectionReason = status === 'Rejected' ? rejectionReason : undefined;
    exitRequest.lastModifiedBy = approverId;
    exitRequest.lastModifiedAt = new Date();

    await exitRequest.save();

    // If approved, initiate offboarding process
    if (status === 'Approved') {
      // You can trigger offboarding checklist creation here
      // For now, just update employee status
      await Employee.findOneAndUpdate(
        { employeeId: exitRequest.employeeId },
        {
          'offboardingStatus.status': 'initiated',
          'offboardingStatus.initiatedDate': new Date(),
          'offboardingStatus.lastWorkingDay': exitRequest.calculatedLastWorkingDay
        }
      );
    }

    // Send notification to initiator
    try {
      const employee = await Employee.findOne({ employeeId: exitRequest.employeeId });
      const initiator = await Employee.findOne({ employeeId: exitRequest.initiatedBy });
      
      if (initiator) {
        await notificationService.createNotification({
          userId: initiator._id.toString(),
          type: 'exit_request',
          title: `Exit Request ${status}`,
          message: `Your exit request for ${employee?.name} has been ${status.toLowerCase()} by ${approverName}.`,
          priority: status === 'Approved' ? 'high' : 'medium',
          actionUrl: `/hr/exit-requests/${exitRequest._id}`,
          metadata: {
            requestNumber: exitRequest.requestNumber,
            employeeId: exitRequest.employeeId,
            status: status
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({ 
      success: true, 
      data: exitRequest,
      message: `Exit request ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Failed to process exit request approval:', error);
    res.status(500).json({ success: false, message: 'Failed to process exit request approval' });
  }
});

export default router;
