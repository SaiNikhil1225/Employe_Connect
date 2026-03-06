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
exports.getFinancialLineStats = exports.deleteFinancialLine = exports.updateFinancialLine = exports.createFinancialLine = exports.getFinancialLineById = exports.getActiveFinancialLines = exports.getFinancialLines = void 0;
const FinancialLine_1 = __importStar(require("../models/FinancialLine"));
const CustomerPO_1 = __importDefault(require("../models/CustomerPO"));
const Project_1 = __importDefault(require("../models/Project"));
/**
 * Auto-update project status to 'Active' if the project has
 * at least one active FL OR at least one active PO.
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
// Generate FL number
const generateFLNumber = async () => {
    const year = new Date().getFullYear();
    const count = await FinancialLine_1.default.countDocuments({
        flNo: new RegExp(`^FL-${year}-`)
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `FL-${year}-${sequence}`;
};
// Get all financial lines with filters
const getFinancialLines = async (req, res) => {
    try {
        // Sync FL statuses based on dates before querying
        await (0, FinancialLine_1.syncFLStatusesByDate)();
        const { status, locationType, contractType, projectId, search } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (locationType)
            query.locationType = locationType;
        if (contractType)
            query.contractType = contractType;
        if (projectId)
            query.projectId = projectId;
        if (search) {
            query.$or = [
                { flNo: { $regex: search, $options: 'i' } },
                { flName: { $regex: search, $options: 'i' } }
            ];
        }
        console.log('getFinancialLines - Query:', query);
        const fls = await FinancialLine_1.default.find(query)
            .populate('projectId', 'projectName projectId')
            .sort({ createdAt: -1 });
        console.log('getFinancialLines - Found FLs:', fls.length);
        res.json({ success: true, data: fls });
    }
    catch (error) {
        console.error('Failed to fetch financial lines:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        const message = error instanceof Error ? error.message : 'Failed to fetch financial lines';
        res.status(500).json({ success: false, message });
    }
};
exports.getFinancialLines = getFinancialLines;
// Get active financial lines
const getActiveFinancialLines = async (req, res) => {
    try {
        // Sync FL statuses by date first
        await (0, FinancialLine_1.syncFLStatusesByDate)();
        const fls = await FinancialLine_1.default.find({ status: 'Active' })
            .populate('projectId', 'projectName projectId')
            .populate('customerPOId', 'poNo contractNo')
            .sort({ flNo: 1 });
        res.json({ success: true, data: fls });
    }
    catch (error) {
        console.error('Failed to fetch active financial lines:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch active financial lines';
        res.status(500).json({ success: false, message });
    }
};
exports.getActiveFinancialLines = getActiveFinancialLines;
// Get financial line by ID
const getFinancialLineById = async (req, res) => {
    try {
        const fl = await FinancialLine_1.default.findById(req.params.id)
            .populate('projectId', 'projectName projectId projectStartDate projectEndDate billingType projectCurrency');
        if (!fl) {
            return res.status(404).json({ success: false, message: 'Financial line not found' });
        }
        res.json({ success: true, data: fl });
    }
    catch (error) {
        console.error('Failed to fetch financial line:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch financial line';
        res.status(500).json({ success: false, message });
    }
};
exports.getFinancialLineById = getFinancialLineById;
// Create new financial line
const createFinancialLine = async (req, res) => {
    try {
        console.log('Creating financial line with data:', JSON.stringify(req.body, null, 2));
        // Generate FL number if not provided
        if (!req.body.flNo) {
            req.body.flNo = await generateFLNumber();
        }
        // Validate project exists
        if (req.body.projectId) {
            const project = await Project_1.default.findById(req.body.projectId);
            if (!project) {
                console.error('Project not found:', req.body.projectId);
                return res.status(400).json({ success: false, message: 'Project not found' });
            }
            // Validate schedule dates within project dates
            if (req.body.scheduleStart && req.body.scheduleFinish) {
                const scheduleStart = new Date(req.body.scheduleStart);
                const scheduleFinish = new Date(req.body.scheduleFinish);
                const projectStart = new Date(project.projectStartDate);
                const projectEnd = new Date(project.projectEndDate);
                if (scheduleStart < projectStart || scheduleStart > projectEnd) {
                    return res.status(400).json({
                        success: false,
                        message: 'Schedule start date must be within project dates'
                    });
                }
                if (scheduleFinish < projectStart || scheduleFinish > projectEnd) {
                    return res.status(400).json({
                        success: false,
                        message: 'Schedule finish date must be within project dates'
                    });
                }
            }
            // Inherit contract type from project if not provided
            if (!req.body.contractType) {
                req.body.contractType = project.billingType;
            }
            // Inherit currency from project if not provided
            if (!req.body.currency) {
                req.body.currency = project.projectCurrency;
            }
        }
        // Validate payment milestones sum equals total funding (for non-T&M contracts)
        if (req.body.paymentMilestones && req.body.paymentMilestones.length > 0) {
            const totalMilestoneAmount = req.body.paymentMilestones.reduce((sum, m) => sum + m.amount, 0);
            if (Math.abs(totalMilestoneAmount - req.body.totalFunding) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Sum of milestone amounts ($${totalMilestoneAmount}) must equal total funding ($${req.body.totalFunding})`
                });
            }
        }
        // Validate revenue planning sum doesn't exceed total funding
        if (req.body.revenuePlanning && req.body.revenuePlanning.length > 0) {
            const totalPlannedRevenue = req.body.revenuePlanning.reduce((sum, r) => sum + r.plannedRevenue, 0);
            if (totalPlannedRevenue > req.body.totalFunding) {
                return res.status(400).json({
                    success: false,
                    message: 'Total planned revenue cannot exceed total funding'
                });
            }
        }
        console.log('Creating FL with data:', {
            flNo: req.body.flNo,
            projectId: req.body.projectId,
            flName: req.body.flName,
            effort: req.body.effort,
            totalFunding: req.body.totalFunding,
            fundingCount: req.body.funding?.length,
            milestonesCount: req.body.paymentMilestones?.length,
        });
        const fl = new FinancialLine_1.default(req.body);
        await fl.save();
        console.log('Financial line saved successfully to DB:', fl._id, fl.flNo);
        const populatedFL = await FinancialLine_1.default.findById(fl._id)
            .populate('projectId', 'projectName projectId');
        console.log('Financial line populated and ready to return:', populatedFL?.flNo);
        // Auto-update project status if FL is Active
        await syncProjectStatus(req.body.projectId);
        res.status(201).json({ success: true, data: populatedFL });
    }
    catch (error) {
        console.error('Failed to create financial line:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        const message = error instanceof Error ? error.message : 'Failed to create financial line';
        res.status(500).json({ success: false, message });
    }
};
exports.createFinancialLine = createFinancialLine;
// Update financial line
const updateFinancialLine = async (req, res) => {
    try {
        // Validate project dates if being updated
        if (req.body.projectId) {
            const project = await Project_1.default.findById(req.body.projectId);
            if (!project) {
                return res.status(400).json({ success: false, message: 'Project not found' });
            }
        }
        // Recalculate funding value if rates changed
        if (req.body.unitRate && req.body.fundingUnits) {
            req.body.fundingValue = req.body.unitRate * req.body.fundingUnits;
        }
        const fl = await FinancialLine_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('projectId', 'projectName projectId');
        if (!fl) {
            return res.status(404).json({ success: false, message: 'Financial line not found' });
        }
        // Auto-update project status
        const projectId = fl.projectId?._id || fl.projectId;
        await syncProjectStatus(projectId?.toString());
        res.json({ success: true, data: fl });
    }
    catch (error) {
        console.error('Failed to update financial line:', error);
        const message = error instanceof Error ? error.message : 'Failed to update financial line';
        res.status(500).json({ success: false, message });
    }
};
exports.updateFinancialLine = updateFinancialLine;
// Delete financial line
const deleteFinancialLine = async (req, res) => {
    try {
        const fl = await FinancialLine_1.default.findByIdAndDelete(req.params.id);
        if (!fl) {
            return res.status(404).json({ success: false, message: 'Financial line not found' });
        }
        // Auto-update project status after FL deletion
        const projectId = fl.projectId?.toString();
        await syncProjectStatus(projectId);
        res.json({ success: true, message: 'Financial line deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete financial line:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete financial line';
        res.status(500).json({ success: false, message });
    }
};
exports.deleteFinancialLine = deleteFinancialLine;
// Get financial line stats
const getFinancialLineStats = async (req, res) => {
    try {
        const [total, active, draft, closed, totalFunding] = await Promise.all([
            FinancialLine_1.default.countDocuments(),
            FinancialLine_1.default.countDocuments({ status: 'Active' }),
            FinancialLine_1.default.countDocuments({ status: 'Draft' }),
            FinancialLine_1.default.countDocuments({ status: 'Closed' }),
            FinancialLine_1.default.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: null, total: { $sum: '$fundingValue' } } }
            ])
        ]);
        res.json({
            success: true,
            data: {
                total,
                active,
                draft,
                closed,
                totalActiveFunding: totalFunding[0]?.total || 0
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch financial line stats:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch stats';
        res.status(500).json({ success: false, message });
    }
};
exports.getFinancialLineStats = getFinancialLineStats;
//# sourceMappingURL=financialLineController.js.map