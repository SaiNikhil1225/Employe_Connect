import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as attendanceController from '../controllers/attendanceController';

const router = express.Router();

// Employee routes
router.get('/stats', authenticateToken, attendanceController.getStats);
router.get('/timings/:employeeId/:date', authenticateToken, attendanceController.getTimings);
router.get('/logs', authenticateToken, attendanceController.getLogs);
router.post('/regularize', authenticateToken, attendanceController.submitRegularization);
router.post('/wfh-request', authenticateToken, attendanceController.submitWFHRequest);
router.post('/clock-in', authenticateToken, attendanceController.webClockIn);
router.post('/clock-out', authenticateToken, attendanceController.webClockOut);

// Admin routes
router.get('/admin/stats', authenticateToken, attendanceController.getAdminStats);
router.get('/admin/team-logs', authenticateToken, attendanceController.getTeamLogs);
router.get('/regularization-requests', authenticateToken, attendanceController.getRegularizationRequests);
router.patch('/regularization-requests/:id/approve', authenticateToken, attendanceController.approveRegularization);
router.patch('/regularization-requests/:id/reject', authenticateToken, attendanceController.rejectRegularization);
router.get('/wfh-requests', authenticateToken, attendanceController.getWFHRequests);
router.patch('/wfh-requests/:id/approve', authenticateToken, attendanceController.approveWFHRequest);
router.patch('/wfh-requests/:id/reject', authenticateToken, attendanceController.rejectWFHRequest);
router.post('/bulk-approve', authenticateToken, attendanceController.bulkApprove);
router.post('/bulk-reject', authenticateToken, attendanceController.bulkReject);
router.post('/manual-entry', authenticateToken, attendanceController.addManualEntry);
router.get('/export', authenticateToken, attendanceController.exportData);

// Policy routes
router.get('/policy', authenticateToken, attendanceController.getAttendancePolicy);

export default router;
