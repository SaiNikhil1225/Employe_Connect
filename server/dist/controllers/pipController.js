"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePIPStatus = exports.acknowledgePIP = exports.getAllPIPs = exports.getActivePIPCount = exports.getEmployeePIPs = exports.startPIP = void 0;
const PIP_1 = __importDefault(require("../models/PIP"));
// Start a new PIP for an employee
const startPIP = async (req, res) => {
    try {
        const { employeeId, employeeName, reason, evaluationProcess, improvementPlan, startDate, endDate, tasks, attachments, initiatedBy, initiatedByName, notes, } = req.body;
        if (!employeeId || !employeeName || !reason || !evaluationProcess || !improvementPlan || !startDate || !endDate || !initiatedBy || !initiatedByName) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const pip = new PIP_1.default({
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
    }
    catch (error) {
        console.error('Failed to start PIP:', error);
        res.status(500).json({ success: false, message: 'Failed to start PIP' });
    }
};
exports.startPIP = startPIP;
// Get all PIPs for a specific employee
const getEmployeePIPs = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const pips = await PIP_1.default.find({ employeeId }).sort({ createdAt: -1 });
        res.json({ success: true, data: pips });
    }
    catch (error) {
        console.error('Failed to get employee PIPs:', error);
        res.status(500).json({ success: false, message: 'Failed to get PIPs' });
    }
};
exports.getEmployeePIPs = getEmployeePIPs;
// Get active PIP count (for dashboard)
const getActivePIPCount = async (_req, res) => {
    try {
        const count = await PIP_1.default.countDocuments({ status: 'active' });
        res.json({ success: true, count });
    }
    catch (error) {
        console.error('Failed to get active PIP count:', error);
        res.status(500).json({ success: false, message: 'Failed to get PIP count' });
    }
};
exports.getActivePIPCount = getActivePIPCount;
// Get all PIPs (admin/HR view)
const getAllPIPs = async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (employeeId)
            filter.employeeId = employeeId;
        const pips = await PIP_1.default.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: pips });
    }
    catch (error) {
        console.error('Failed to get all PIPs:', error);
        res.status(500).json({ success: false, message: 'Failed to get PIPs' });
    }
};
exports.getAllPIPs = getAllPIPs;
// Employee acknowledges the PIP
const acknowledgePIP = async (req, res) => {
    try {
        const { pipId } = req.params;
        const { employeeId } = req.body;
        const pip = await PIP_1.default.findById(pipId);
        if (!pip) {
            res.status(404).json({ success: false, message: 'PIP not found' });
            return;
        }
        pip.acknowledgedBy = employeeId;
        pip.acknowledgedAt = new Date();
        await pip.save();
        res.json({ success: true, data: pip });
    }
    catch (error) {
        console.error('Failed to acknowledge PIP:', error);
        res.status(500).json({ success: false, message: 'Failed to acknowledge PIP' });
    }
};
exports.acknowledgePIP = acknowledgePIP;
// Update PIP status (complete, fail, cancel)
const updatePIPStatus = async (req, res) => {
    try {
        const { pipId } = req.params;
        const { status, notes } = req.body;
        const validStatuses = ['active', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        const pip = await PIP_1.default.findById(pipId);
        if (!pip) {
            res.status(404).json({ success: false, message: 'PIP not found' });
            return;
        }
        pip.status = status;
        if (notes)
            pip.notes = notes;
        if (status === 'completed' || status === 'failed') {
            pip.completedAt = new Date();
        }
        await pip.save();
        res.json({ success: true, data: pip });
    }
    catch (error) {
        console.error('Failed to update PIP status:', error);
        res.status(500).json({ success: false, message: 'Failed to update PIP status' });
    }
};
exports.updatePIPStatus = updatePIPStatus;
//# sourceMappingURL=pipController.js.map