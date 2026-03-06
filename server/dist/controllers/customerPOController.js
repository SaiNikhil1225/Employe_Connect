"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerPOStats = exports.deleteCustomerPO = exports.updateCustomerPO = exports.createCustomerPO = exports.getCustomerPOById = exports.getActiveCustomerPOs = exports.getCustomerPOs = void 0;
const CustomerPO_1 = __importDefault(require("../models/CustomerPO"));
const FinancialLine_1 = __importDefault(require("../models/FinancialLine"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Project_1 = __importDefault(require("../models/Project"));
/**
 * Auto-update project status to 'Active' if the project has
 * at least one active PO OR at least one active FL.
 * If neither exists, revert to 'Draft' (only if currently 'Active').
 */
const syncProjectStatus = async (projectId) => {
    if (!projectId)
        return;
    try {
        const [activeFLCount, activePOCount] = await Promise.all([
            FinancialLine_1.default.countDocuments({ projectId, status: 'Active' }),
            CustomerPO_1.default.countDocuments({ projectId, status: 'Active' }),
        ]);
        const project = await Project_1.default.findById(projectId);
        if (!project)
            return;
        if (activeFLCount > 0 || activePOCount > 0) {
            // Has active FL or PO → make project Active
            if (project.status !== 'Active') {
                project.status = 'Active';
                await project.save();
            }
        }
        else if (project.status === 'Active') {
            // Lost all active FLs and POs → revert to Draft
            project.status = 'Draft';
            await project.save();
        }
    }
    catch (err) {
        console.error('syncProjectStatus error:', err);
    }
};
// Get all customer POs with filters
const getCustomerPOs = async (req, res) => {
    try {
        const { status, customerId, projectId, bookingEntity, search } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (customerId)
            query.customerId = customerId;
        if (projectId)
            query.projectId = projectId;
        if (bookingEntity)
            query.bookingEntity = bookingEntity;
        if (search) {
            query.$or = [
                { contractNo: { $regex: search, $options: 'i' } },
                { poNo: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } }
            ];
        }
        const pos = await CustomerPO_1.default.find(query)
            .populate('customerId', 'customerName customerNo')
            .populate('projectId', 'projectName projectId')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: pos });
    }
    catch (error) {
        console.error('Failed to fetch customer POs:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customer POs';
        res.status(500).json({ success: false, message });
    }
};
exports.getCustomerPOs = getCustomerPOs;
// Get active customer POs
const getActiveCustomerPOs = async (req, res) => {
    try {
        const pos = await CustomerPO_1.default.find({ status: 'Active' })
            .populate('customerId', 'customerName customerNo')
            .populate('projectId', 'projectName projectId')
            .sort({ poNo: 1 });
        res.json({ success: true, data: pos });
    }
    catch (error) {
        console.error('Failed to fetch active customer POs:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch active customer POs';
        res.status(500).json({ success: false, message });
    }
};
exports.getActiveCustomerPOs = getActiveCustomerPOs;
// Get customer PO by ID
const getCustomerPOById = async (req, res) => {
    try {
        const po = await CustomerPO_1.default.findById(req.params.id)
            .populate('customerId', 'customerName customerNo')
            .populate('projectId', 'projectName projectId');
        if (!po) {
            return res.status(404).json({ success: false, message: 'Customer PO not found' });
        }
        res.json({ success: true, data: po });
    }
    catch (error) {
        console.error('Failed to fetch customer PO:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customer PO';
        res.status(500).json({ success: false, message });
    }
};
exports.getCustomerPOById = getCustomerPOById;
// Create new customer PO
const createCustomerPO = async (req, res) => {
    try {
        // Validate customer exists
        if (req.body.customerId) {
            const customer = await Customer_1.default.findById(req.body.customerId);
            if (!customer) {
                return res.status(400).json({ success: false, message: 'Customer not found' });
            }
            req.body.customerName = customer.customerName;
        }
        // Validate project exists
        if (req.body.projectId) {
            const project = await Project_1.default.findById(req.body.projectId);
            if (!project) {
                return res.status(400).json({ success: false, message: 'Project not found' });
            }
            // Validate poValidityDate <= project endDate
            if (req.body.poValidityDate && project.projectEndDate) {
                const poValidity = new Date(req.body.poValidityDate);
                const projectEnd = new Date(project.projectEndDate);
                if (poValidity > projectEnd) {
                    return res.status(400).json({
                        success: false,
                        message: 'PO validity date must be on or before the project end date'
                    });
                }
            }
        }
        const po = new CustomerPO_1.default(req.body);
        await po.save();
        const populatedPO = await CustomerPO_1.default.findById(po._id)
            .populate('customerId', 'customerName customerNo')
            .populate('projectId', 'projectName projectId');
        // Auto-update project status if PO is Active
        await syncProjectStatus(req.body.projectId);
        res.status(201).json({ success: true, data: populatedPO });
    }
    catch (error) {
        console.error('Failed to create customer PO:', error);
        const message = error instanceof Error ? error.message : 'Failed to create customer PO';
        res.status(500).json({ success: false, message });
    }
};
exports.createCustomerPO = createCustomerPO;
// Update customer PO
const updateCustomerPO = async (req, res) => {
    try {
        // Validate project if being updated
        if (req.body.projectId) {
            const project = await Project_1.default.findById(req.body.projectId);
            if (!project) {
                return res.status(400).json({ success: false, message: 'Project not found' });
            }
            // Validate poValidityDate >= project endDate
            if (req.body.poValidityDate && project.projectEndDate) {
                const poValidity = new Date(req.body.poValidityDate);
                const projectEnd = new Date(project.projectEndDate);
                if (poValidity < projectEnd) {
                    return res.status(400).json({
                        success: false,
                        message: 'PO validity date must be greater than or equal to project end date'
                    });
                }
            }
        }
        const po = await CustomerPO_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('customerId', 'customerName customerNo')
            .populate('projectId', 'projectName projectId');
        if (!po) {
            return res.status(404).json({ success: false, message: 'Customer PO not found' });
        }
        // Auto-update project status
        const projectId = po.projectId?._id || po.projectId;
        await syncProjectStatus(projectId?.toString());
        res.json({ success: true, data: po });
    }
    catch (error) {
        console.error('Failed to update customer PO:', error);
        const message = error instanceof Error ? error.message : 'Failed to update customer PO';
        res.status(500).json({ success: false, message });
    }
};
exports.updateCustomerPO = updateCustomerPO;
// Delete customer PO
const deleteCustomerPO = async (req, res) => {
    try {
        const po = await CustomerPO_1.default.findByIdAndDelete(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'Customer PO not found' });
        }
        // Auto-update project status after PO deletion
        const projectId = po.projectId?.toString();
        await syncProjectStatus(projectId);
        res.json({ success: true, message: 'Customer PO deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete customer PO:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete customer PO';
        res.status(500).json({ success: false, message });
    }
};
exports.deleteCustomerPO = deleteCustomerPO;
// Get customer PO stats
const getCustomerPOStats = async (req, res) => {
    try {
        const [total, active, closed, expired, totalAmount] = await Promise.all([
            CustomerPO_1.default.countDocuments(),
            CustomerPO_1.default.countDocuments({ status: 'Active' }),
            CustomerPO_1.default.countDocuments({ status: 'Closed' }),
            CustomerPO_1.default.countDocuments({ status: 'Expired' }),
            CustomerPO_1.default.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: null, total: { $sum: '$poAmount' } } }
            ])
        ]);
        res.json({
            success: true,
            data: {
                total,
                active,
                closed,
                expired,
                totalActiveAmount: totalAmount[0]?.total || 0
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch customer PO stats:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch stats';
        res.status(500).json({ success: false, message });
    }
};
exports.getCustomerPOStats = getCustomerPOStats;
//# sourceMappingURL=customerPOController.js.map