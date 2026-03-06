"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pipController_1 = require("../controllers/pipController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Start a new PIP for an employee
router.post('/start', pipController_1.startPIP);
// Get all PIPs for a specific employee
router.get('/employee/:employeeId', pipController_1.getEmployeePIPs);
// Get active PIP count (for dashboard)
router.get('/active-count', pipController_1.getActivePIPCount);
// Get all PIPs (for admin/HR)
router.get('/', pipController_1.getAllPIPs);
// Acknowledge PIP by employee
router.patch('/:pipId/acknowledge', pipController_1.acknowledgePIP);
// Update PIP status
router.patch('/:pipId/status', pipController_1.updatePIPStatus);
exports.default = router;
//# sourceMappingURL=pip.js.map