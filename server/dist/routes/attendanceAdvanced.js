"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const attendanceController = __importStar(require("../controllers/attendanceController"));
const enhancedController = __importStar(require("../controllers/attendanceEnhancedController"));
const router = express_1.default.Router();
// Employee routes
router.get('/stats', auth_1.authenticateToken, attendanceController.getStats);
router.get('/timings/:employeeId/:date', auth_1.authenticateToken, attendanceController.getTimings);
router.get('/logs', auth_1.authenticateToken, attendanceController.getLogs);
router.post('/regularize', auth_1.authenticateToken, attendanceController.submitRegularization);
router.post('/wfh-request', auth_1.authenticateToken, attendanceController.submitWFHRequest);
router.post('/clock-in', auth_1.authenticateToken, attendanceController.webClockIn);
router.post('/clock-out', auth_1.authenticateToken, attendanceController.webClockOut);
// Enhanced KPI routes
router.get('/enhanced-stats', auth_1.authenticateToken, enhancedController.getEnhancedEmployeeStats);
router.get('/enhanced-team-stats', auth_1.authenticateToken, enhancedController.getEnhancedTeamStats);
router.get('/enhanced-logs', auth_1.authenticateToken, enhancedController.getEnhancedLogs);
router.post('/validate-regularization', auth_1.authenticateToken, enhancedController.validateRegularization);
// Admin routes
router.get('/admin/stats', auth_1.authenticateToken, attendanceController.getAdminStats);
router.get('/admin/team-logs', auth_1.authenticateToken, attendanceController.getTeamLogs);
router.get('/regularization-requests', auth_1.authenticateToken, attendanceController.getRegularizationRequests);
router.patch('/regularization-requests/:id/approve', auth_1.authenticateToken, attendanceController.approveRegularization);
router.patch('/regularization-requests/:id/reject', auth_1.authenticateToken, attendanceController.rejectRegularization);
router.get('/wfh-requests', auth_1.authenticateToken, attendanceController.getWFHRequests);
router.patch('/wfh-requests/:id/approve', auth_1.authenticateToken, attendanceController.approveWFHRequest);
router.patch('/wfh-requests/:id/reject', auth_1.authenticateToken, attendanceController.rejectWFHRequest);
router.post('/bulk-approve', auth_1.authenticateToken, attendanceController.bulkApprove);
router.post('/bulk-reject', auth_1.authenticateToken, attendanceController.bulkReject);
router.post('/manual-entry', auth_1.authenticateToken, attendanceController.addManualEntry);
router.get('/export', auth_1.authenticateToken, attendanceController.exportData);
// Policy routes
router.get('/policy', auth_1.authenticateToken, attendanceController.getAttendancePolicy);
exports.default = router;
//# sourceMappingURL=attendanceAdvanced.js.map