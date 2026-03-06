import express from 'express';
import {
  startPIP,
  getEmployeePIPs,
  getActivePIPCount,
  acknowledgePIP,
  updatePIPStatus,
  getAllPIPs,
} from '../controllers/pipController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Start a new PIP for an employee
router.post('/start', startPIP);

// Get all PIPs for a specific employee
router.get('/employee/:employeeId', getEmployeePIPs);

// Get active PIP count (for dashboard)
router.get('/active-count', getActivePIPCount);

// Get all PIPs (for admin/HR)
router.get('/', getAllPIPs);

// Acknowledge PIP by employee
router.patch('/:pipId/acknowledge', acknowledgePIP);

// Update PIP status
router.patch('/:pipId/status', updatePIPStatus);

export default router;
