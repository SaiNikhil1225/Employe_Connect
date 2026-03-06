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
const Project_1 = __importDefault(require("../models/Project"));
const Customer_1 = __importDefault(require("../models/Customer"));
const FinancialLine_1 = __importStar(require("../models/FinancialLine"));
const CustomerPO_1 = __importDefault(require("../models/CustomerPO"));
const router = express_1.default.Router();
/**
 * Sync a single project's status based on active FL or PO presence.
 * Project → Active when it has ≥1 active FL OR ≥1 active PO.
 * Project → Draft when it was Active but lost both.
 */
async function syncProjectStatus(projectId) {
    try {
        const [activeFLs, activePOs] = await Promise.all([
            FinancialLine_1.default.countDocuments({ projectId, status: 'Active' }),
            CustomerPO_1.default.countDocuments({ projectId, status: 'Active' }),
        ]);
        const project = await Project_1.default.findById(projectId);
        if (!project)
            return;
        if (activeFLs > 0 || activePOs > 0) {
            if (project.status !== 'Active') {
                project.status = 'Active';
                await project.save();
                console.log(`Project ${project.projectId} auto-set to Active (${activeFLs} active FLs, ${activePOs} active POs)`);
            }
        }
        else if (project.status === 'Active') {
            project.status = 'Draft';
            await project.save();
            console.log(`Project ${project.projectId} reverted to Draft (${activeFLs} active FLs, ${activePOs} active POs)`);
        }
    }
    catch (err) {
        console.error('syncProjectStatus error:', err);
    }
}
/**
 * Sync ALL project statuses in one pass.
 */
async function syncAllProjectStatuses() {
    try {
        // First sync FL statuses based on dates
        await (0, FinancialLine_1.syncFLStatusesByDate)();
        const projects = await Project_1.default.find();
        let updated = 0;
        for (const project of projects) {
            const [activeFLs, activePOs] = await Promise.all([
                FinancialLine_1.default.countDocuments({ projectId: project._id, status: 'Active' }),
                CustomerPO_1.default.countDocuments({ projectId: project._id, status: 'Active' }),
            ]);
            const shouldBeActive = activeFLs > 0 || activePOs > 0;
            if (shouldBeActive && project.status !== 'Active') {
                project.status = 'Active';
                await project.save();
                updated++;
            }
            else if (!shouldBeActive && project.status === 'Active') {
                project.status = 'Draft';
                await project.save();
                updated++;
            }
        }
        return updated;
    }
    catch (err) {
        console.error('syncAllProjectStatuses error:', err);
        return 0;
    }
}
// Helper function to update customer status based on active project count
async function updateCustomerStatusBasedOnProjects(customerId) {
    if (!customerId)
        return;
    try {
        // Count ALL projects for this customer (regardless of status)
        const projectCount = await Project_1.default.countDocuments({
            customerId: customerId
        });
        // Update customer status based on project count
        // Customer is Active if they have ANY project assigned
        const newStatus = projectCount > 0 ? 'Active' : 'Inactive';
        await Customer_1.default.findByIdAndUpdate(customerId, { status: newStatus });
        console.log(`Customer ${customerId} status updated to ${newStatus} (${projectCount} total projects)`);
    }
    catch (error) {
        console.error('Failed to update customer status:', error);
    }
}
// Get next project ID
router.get('/next-id', async (req, res) => {
    try {
        const lastProject = await Project_1.default.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;
        if (lastProject && lastProject.projectId) {
            const match = lastProject.projectId.match(/P(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        const nextId = `P${String(nextNumber).padStart(3, '0')}`;
        res.json({ success: true, data: nextId });
    }
    catch (error) {
        console.error('Failed to generate next project ID:', error);
        res.status(500).json({ success: false, message: 'Failed to generate next project ID' });
    }
});
// Get all projects (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { status, region, billingType, customerId, search, searchScope } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (region)
            query.region = region;
        if (billingType)
            query.billingType = billingType;
        if (customerId)
            query.customerId = customerId;
        // Enhanced search with scope
        if (search) {
            const searchStr = search;
            const scope = searchScope;
            switch (scope) {
                case 'name':
                    query.projectName = { $regex: searchStr, $options: 'i' };
                    break;
                case 'id':
                    query.projectId = { $regex: searchStr, $options: 'i' };
                    break;
                case 'manager':
                    query.$or = [
                        { 'projectManager.name': { $regex: searchStr, $options: 'i' } },
                        { 'deliveryManager.name': { $regex: searchStr, $options: 'i' } }
                    ];
                    break;
                default: // 'all' or undefined
                    query.$or = [
                        { projectName: { $regex: searchStr, $options: 'i' } },
                        { projectId: { $regex: searchStr, $options: 'i' } },
                        { accountName: { $regex: searchStr, $options: 'i' } },
                        { 'projectManager.name': { $regex: searchStr, $options: 'i' } },
                        { 'deliveryManager.name': { $regex: searchStr, $options: 'i' } }
                    ];
            }
        }
        const projects = await Project_1.default.find(query)
            .populate('customerId', 'customerName customerNo')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        console.error('Failed to fetch projects:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
});
// Get active projects only
router.get('/active', async (req, res) => {
    try {
        const projects = await Project_1.default.find({ status: 'active' }).sort({ name: 1 });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        console.error('Failed to fetch active projects:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active projects' });
    }
});
// Get project stats (aggregated counts by status, region, billing type)
router.get('/stats', async (req, res) => {
    try {
        // Auto-sync all project statuses before computing stats
        await syncAllProjectStatuses();
        const [total, byStatus, byRegion, byBillingType] = await Promise.all([
            Project_1.default.countDocuments(),
            Project_1.default.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Project_1.default.aggregate([
                { $group: { _id: '$region', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Project_1.default.aggregate([
                { $group: { _id: '$billingType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
        ]);
        res.json({
            success: true,
            data: { total, byStatus, byRegion, byBillingType }
        });
    }
    catch (error) {
        console.error('Failed to fetch project stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project stats' });
    }
});
// Sync all project statuses based on active FL + PO
router.post('/sync-statuses', async (req, res) => {
    try {
        const updated = await syncAllProjectStatuses();
        res.json({ success: true, message: `${updated} project(s) updated`, updated });
    }
    catch (error) {
        console.error('Failed to sync project statuses:', error);
        res.status(500).json({ success: false, message: 'Failed to sync project statuses' });
    }
});
// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error('Failed to fetch project:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
});
// Get project by project ID
router.get('/by-project-id/:projectId', async (req, res) => {
    try {
        const project = await Project_1.default.findOne({ projectId: req.params.projectId });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error('Failed to fetch project:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
});
// Create new project
router.post('/', async (req, res) => {
    try {
        console.log('Creating project with data:', JSON.stringify(req.body, null, 2));
        const project = new Project_1.default(req.body);
        await project.save();
        console.log('Project created successfully:', project.projectId);
        // Update customer status to Active when a new project is created
        const customerId = project.customerId?.toString();
        if (customerId) {
            await updateCustomerStatusBasedOnProjects(customerId);
        }
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        console.error('Failed to create project:', error);
        // Send more detailed error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
        res.status(500).json({
            success: false,
            message: errorMessage,
            details: error instanceof Error ? error.stack : undefined
        });
    }
});
// Update project
router.put('/:id', async (req, res) => {
    try {
        // Get the project before update to check if customerId changes
        const existingProject = await Project_1.default.findById(req.params.id);
        const oldCustomerId = existingProject?.customerId?.toString();
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        // Update customer status for both old and new customer if they differ
        const newCustomerId = project.customerId?.toString();
        if (oldCustomerId) {
            await updateCustomerStatusBasedOnProjects(oldCustomerId);
        }
        if (newCustomerId && newCustomerId !== oldCustomerId) {
            await updateCustomerStatusBasedOnProjects(newCustomerId);
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error('Failed to update project:', error);
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
});
// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        const customerId = project.customerId?.toString();
        await Project_1.default.findByIdAndDelete(req.params.id);
        // Update customer status based on remaining projects
        if (customerId) {
            await updateCustomerStatusBasedOnProjects(customerId);
        }
        res.json({ success: true, message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete project:', error);
        res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
});
// Update project status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        // Update customer status based on project status change
        const customerId = project.customerId?.toString();
        if (customerId) {
            await updateCustomerStatusBasedOnProjects(customerId);
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error('Failed to update project status:', error);
        res.status(500).json({ success: false, message: 'Failed to update project status' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map