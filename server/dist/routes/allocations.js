"use strict";
/**
 * DEPRECATED: This allocations table/route is no longer used.
 * Allocation tracking is now handled through FL Resources (flResources.ts)
 *
 * This file is kept for backward compatibility and reference only.
 * To remove: Delete this file and remove the route registration from server.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Allocation_1 = __importDefault(require("../models/Allocation"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Get all allocations (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { employeeId, projectId, status, billable } = req.query;
        const query = {};
        if (employeeId)
            query.employeeId = employeeId;
        if (projectId)
            query.projectId = projectId;
        if (status)
            query.status = status;
        if (billable !== undefined)
            query.billable = billable === 'true';
        const allocations = await Allocation_1.default.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        console.error('Failed to fetch allocations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch allocations' });
    }
});
// Get active allocations only
router.get('/active', async (req, res) => {
    try {
        const allocations = await Allocation_1.default.find({ status: 'active' }).sort({ employeeId: 1 });
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        console.error('Failed to fetch active allocations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active allocations' });
    }
});
// Get allocations by employee ID
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const allocations = await Allocation_1.default.find({
            employeeId: req.params.employeeId,
            status: 'active'
        }).sort({ allocation: -1 });
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        console.error('Failed to fetch employee allocations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch employee allocations' });
    }
});
// Get allocations by project ID
router.get('/project/:projectId', async (req, res) => {
    try {
        const allocations = await Allocation_1.default.find({
            projectId: req.params.projectId,
            status: 'active'
        }).sort({ allocation: -1 });
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        console.error('Failed to fetch project allocations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project allocations' });
    }
});
// Get allocation by ID
router.get('/:id', async (req, res) => {
    try {
        const allocation = await Allocation_1.default.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.json({ success: true, data: allocation });
    }
    catch (error) {
        console.error('Failed to fetch allocation:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch allocation' });
    }
});
// Create new allocation
router.post('/', validation_1.allocationValidation.create, async (req, res) => {
    try {
        // Check if employee already has an allocation to this project
        const existing = await Allocation_1.default.findOne({
            employeeId: req.body.employeeId,
            projectId: req.body.projectId,
            status: 'active'
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Employee is already allocated to this project'
            });
        }
        const allocation = new Allocation_1.default(req.body);
        await allocation.save();
        res.status(201).json({ success: true, data: allocation });
    }
    catch (error) {
        console.error('Failed to create allocation:', error);
        res.status(500).json({ success: false, message: 'Failed to create allocation' });
    }
});
// Update allocation
router.put('/:id', validation_1.allocationValidation.update, async (req, res) => {
    try {
        const allocation = await Allocation_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.json({ success: true, data: allocation });
    }
    catch (error) {
        console.error('Failed to update allocation:', error);
        res.status(500).json({ success: false, message: 'Failed to update allocation' });
    }
});
// Delete allocation
router.delete('/:id', async (req, res) => {
    try {
        const allocation = await Allocation_1.default.findByIdAndDelete(req.params.id);
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.json({ success: true, message: 'Allocation deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete allocation:', error);
        res.status(500).json({ success: false, message: 'Failed to delete allocation' });
    }
});
// Update allocation status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allocation = await Allocation_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.json({ success: true, data: allocation });
    }
    catch (error) {
        console.error('Failed to update allocation status:', error);
        res.status(500).json({ success: false, message: 'Failed to update allocation status' });
    }
});
// Get employee utilization (total allocation percentage)
router.get('/employee/:employeeId/utilization', async (req, res) => {
    try {
        const allocations = await Allocation_1.default.find({
            employeeId: req.params.employeeId,
            status: 'active'
        });
        const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
        const isBillable = allocations.some(alloc => alloc.billable);
        res.json({
            success: true,
            data: {
                employeeId: req.params.employeeId,
                totalAllocation,
                isFullyAllocated: totalAllocation >= 100,
                isBillable,
                allocations: allocations.length
            }
        });
    }
    catch (error) {
        console.error('Failed to calculate utilization:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate utilization' });
    }
});
exports.default = router;
//# sourceMappingURL=allocations.js.map