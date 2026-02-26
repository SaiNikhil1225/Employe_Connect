import express, { Request, Response } from 'express';
import HiringRequest from '../models/HiringRequest';
import Employee from '../models/Employee';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Helper to get user from request
const getUser = async (userId: string) => {
  return await Employee.findById(userId);
};

// Create hiring request
router.post('/requests', authorizeRoles('MANAGER', 'HR', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    console.log('Creating hiring request - User ID:', userId);
    console.log('Request user object:', req.user);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }
    
    const user = await getUser(userId);
    
    console.log('Found user:', user ? user.name : 'NOT FOUND');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hiringRequest = new HiringRequest({
      ...req.body,
      hiringManagerId: userId,
      hiringManagerName: user.name,
      department: user.department || req.body.department,
      designation: user.designation || req.body.designation,
      contactEmail: user.email,
      contactPhone: user.phone || req.body.contactPhone,
      createdBy: userId,
      lastModifiedBy: userId,
      activityLog: [{
        action: 'Created',
        performedBy: userId,
        performedByName: user.name,
        timestamp: new Date()
      }]
    });

    await hiringRequest.save();
    res.status(201).json({ success: true, data: hiringRequest });
  } catch (error: any) {
    console.error('Error creating hiring request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create hiring request' });
  }
});

// Get hiring manager's own requests
router.get('/requests/my-requests', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { status, startDate, endDate } = req.query;

    const filter: any = { hiringManagerId: userId };

    if (status) {
      filter.status = { $in: (status as string).split(',') };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const requests = await HiringRequest.find(filter)
      .sort({ createdAt: -1 })
      .select('-hrNotes'); // Don't send HR notes to hiring managers

    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch requests' });
  }
});

// Get all requests (HR only)
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    // Check if user is HR or ADMIN
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. HR or Admin role required.' });
    }

    const { status, department, employmentType, startDate, endDate, search } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = { $in: (status as string).split(',') };
    }

    if (department) {
      filter.department = department;
    }

    if (employmentType) {
      filter.employmentType = { $in: (employmentType as string).split(',') };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (search) {
      filter.$or = [
        { jobTitle: new RegExp(search as string, 'i') },
        { requestNumber: new RegExp(search as string, 'i') },
        { hiringManagerName: new RegExp(search as string, 'i') }
      ];
    }

    const requests = await HiringRequest.find(filter)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch requests' });
  }
});

// Get request by ID
router.get('/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const userRole = (req as any).user?.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check access: own request or HR/Admin
    if (request.hiringManagerId !== userId && !['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Remove HR notes if not HR/Admin
    const responseData = request.toObject();
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      delete responseData.hrNotes;
    }

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('Error fetching request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch request' });
  }
});

// Update request (only drafts)
router.patch('/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const userRole = (req as any).user?.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check access and status
    if (request.hiringManagerId !== userId && !['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'Draft' && !['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Can only edit draft requests' });
    }

    const user = await getUser(userId);
    
    Object.assign(request, req.body);
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Updated',
      performedBy: userId,
      performedByName: user?.name || 'Unknown',
      timestamp: new Date(),
      notes: req.body.updateNotes
    });

    await request.save();
    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update request' });
  }
});

// Delete request (only drafts)
router.delete('/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const userRole = (req as any).user?.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check access and status
    if (request.hiringManagerId !== userId && !['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'Draft' && !['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Can only delete draft requests' });
    }

    await request.deleteOne();
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete request' });
  }
});

// Submit request to HR
router.post('/requests/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.hiringManagerId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Can only submit draft requests' });
    }

    const user = await getUser(userId);

    request.status = 'Submitted';
    request.submittedAt = new Date();
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Submitted to HR',
      performedBy: userId,
      performedByName: user?.name || 'Unknown',
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to HR team

    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error submitting request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit request' });
  }
});

// Update status (HR only)
router.patch('/requests/:id/status', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. HR or Admin role required.' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const user = await getUser(userId);
    const oldStatus = request.status;
    request.status = status;
    request.lastModifiedBy = userId;

    if (status === 'Open' && !request.openedAt) {
      request.openedAt = new Date();
    }

    request.activityLog.push({
      action: `Status changed from ${oldStatus} to ${status}`,
      performedBy: userId,
      performedByName: user?.name || 'Unknown',
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to hiring manager

    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
});

// Assign recruiter (HR only)
router.patch('/requests/:id/assign', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. HR or Admin role required.' });
    }

    const { id } = req.params;
    const { recruiterId } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const request = await HiringRequest.findById(id);
    const recruiter = await getUser(recruiterId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    const user = await getUser(userId);

    request.hrAssignedTo = recruiterId;
    request.hrAssignedToName = recruiter.name;
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: `Assigned to ${recruiter.name}`,
      performedBy: userId,
      performedByName: user?.name || 'Unknown',
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to assigned recruiter

    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error assigning recruiter:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to assign recruiter' });
  }
});

// Close request (HR only)
router.post('/requests/:id/close', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. HR or Admin role required.' });
    }

    const { id } = req.params;
    const { closureReason, closureType } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!closureReason) {
      return res.status(400).json({ success: false, message: 'Closure reason is required' });
    }

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const user = await getUser(userId);

    request.status = 'Closed';
    request.closureReason = closureReason;
    request.closureType = closureType;
    request.closedAt = new Date();
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Closed',
      performedBy: userId,
      performedByName: user?.name || 'Unknown',
      timestamp: new Date(),
      notes: closureReason
    });

    await request.save();

    // TODO: Send notification to hiring manager

    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error closing request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to close request' });
  }
});

// Get statistics (HR only)
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!['HR', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. HR or Admin role required.' });
    }

    const total = await HiringRequest.countDocuments();
    const draft = await HiringRequest.countDocuments({ status: 'Draft' });
    const submitted = await HiringRequest.countDocuments({ status: 'Submitted' });
    const open = await HiringRequest.countDocuments({ status: 'Open' });
    const inProgress = await HiringRequest.countDocuments({ status: 'In Progress' });
    const closed = await HiringRequest.countDocuments({ status: 'Closed' });

    // Get department-wise breakdown
    const byDepartment = await HiringRequest.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get employment type breakdown
    const byEmploymentType = await HiringRequest.aggregate([
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    // Average time to close (in days)
    const closedRequests = await HiringRequest.find({ 
      status: 'Closed',
      submittedAt: { $exists: true },
      closedAt: { $exists: true }
    });

    let avgTimeToClose = 0;
    if (closedRequests.length > 0) {
      const totalDays = closedRequests.reduce((sum, req) => {
        const days = Math.floor(((req.closedAt as Date).getTime() - (req.submittedAt as Date).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgTimeToClose = Math.round(totalDays / closedRequests.length);
    }

    res.json({
      success: true,
      data: {
        total,
        byStatus: { draft, submitted, open, inProgress, closed },
        byDepartment,
        byEmploymentType,
        avgTimeToClose
      }
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch statistics' });
  }
});

export default router;
