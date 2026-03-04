import express, { Request, Response } from 'express';
import Project from '../models/Project';
import Customer from '../models/Customer';
import FinancialLine, { syncFLStatusesByDate } from '../models/FinancialLine';
import CustomerPO from '../models/CustomerPO';

const router = express.Router();

/**
 * Sync a single project's status based on active FL or PO presence.
 * Project → Active when it has ≥1 active FL OR ≥1 active PO.
 * Project → Draft when it was Active but lost both.
 */
async function syncProjectStatus(projectId: string) {
  try {
    const [activeFLs, activePOs] = await Promise.all([
      FinancialLine.countDocuments({ projectId, status: 'Active' }),
      CustomerPO.countDocuments({ projectId, status: 'Active' }),
    ]);

    const project = await Project.findById(projectId);
    if (!project) return;

    if (activeFLs > 0 || activePOs > 0) {
      if (project.status !== 'Active') {
        project.status = 'Active';
        await project.save();
        console.log(`Project ${project.projectId} auto-set to Active (${activeFLs} active FLs, ${activePOs} active POs)`);
      }
    } else if (project.status === 'Active') {
      project.status = 'Draft';
      await project.save();
      console.log(`Project ${project.projectId} reverted to Draft (${activeFLs} active FLs, ${activePOs} active POs)`);
    }
  } catch (err) {
    console.error('syncProjectStatus error:', err);
  }
}

/**
 * Sync ALL project statuses in one pass.
 */
async function syncAllProjectStatuses() {
  try {
    // First sync FL statuses based on dates
    await syncFLStatusesByDate();

    const projects = await Project.find();
    let updated = 0;
    for (const project of projects) {
      const [activeFLs, activePOs] = await Promise.all([
        FinancialLine.countDocuments({ projectId: project._id, status: 'Active' }),
        CustomerPO.countDocuments({ projectId: project._id, status: 'Active' }),
      ]);

      const shouldBeActive = activeFLs > 0 || activePOs > 0;

      if (shouldBeActive && project.status !== 'Active') {
        project.status = 'Active';
        await project.save();
        updated++;
      } else if (!shouldBeActive && project.status === 'Active') {
        project.status = 'Draft';
        await project.save();
        updated++;
      }
    }
    return updated;
  } catch (err) {
    console.error('syncAllProjectStatuses error:', err);
    return 0;
  }
}

// Helper function to update customer status based on active project count
async function updateCustomerStatusBasedOnProjects(customerId: string) {
  if (!customerId) return;
  
  try {
    // Count ALL projects for this customer (regardless of status)
    const projectCount = await Project.countDocuments({
      customerId: customerId
    });
    
    // Update customer status based on project count
    // Customer is Active if they have ANY project assigned
    const newStatus = projectCount > 0 ? 'Active' : 'Inactive';
    await Customer.findByIdAndUpdate(customerId, { status: newStatus });
    
    console.log(`Customer ${customerId} status updated to ${newStatus} (${projectCount} total projects)`);
  } catch (error) {
    console.error('Failed to update customer status:', error);
  }
}

// Get next project ID
router.get('/next-id', async (req: Request, res: Response) => {
  try {
    const lastProject = await Project.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastProject && lastProject.projectId) {
      const match = lastProject.projectId.match(/P(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const nextId = `P${String(nextNumber).padStart(3, '0')}`;
    res.json({ success: true, data: nextId });
  } catch (error) {
    console.error('Failed to generate next project ID:', error);
    res.status(500).json({ success: false, message: 'Failed to generate next project ID' });
  }
});

// Get all projects (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, region, billingType, customerId, search, searchScope } = req.query;
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (region) query.region = region;
    if (billingType) query.billingType = billingType;
    if (customerId) query.customerId = customerId;
    
    // Enhanced search with scope
    if (search) {
      const searchStr = search as string;
      const scope = searchScope as string;
      
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

    const projects = await Project.find(query)
      .populate('customerId', 'customerName customerNo')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Get active projects only
router.get('/active', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ status: 'active' }).sort({ name: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Failed to fetch active projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active projects' });
  }
});

// Get project stats (aggregated counts by status, region, billing type)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Auto-sync all project statuses before computing stats
    await syncAllProjectStatuses();

    const [total, byStatus, byRegion, byBillingType] = await Promise.all([
      Project.countDocuments(),
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Project.aggregate([
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Project.aggregate([
        { $group: { _id: '$billingType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
    ]);

    res.json({
      success: true,
      data: { total, byStatus, byRegion, byBillingType }
    });
  } catch (error) {
    console.error('Failed to fetch project stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project stats' });
  }
});

// Sync all project statuses based on active FL + PO
router.post('/sync-statuses', async (req: Request, res: Response) => {
  try {
    const updated = await syncAllProjectStatuses();
    res.json({ success: true, message: `${updated} project(s) updated`, updated });
  } catch (error) {
    console.error('Failed to sync project statuses:', error);
    res.status(500).json({ success: false, message: 'Failed to sync project statuses' });
  }
});

// Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// Get project by project ID
router.get('/by-project-id/:projectId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Creating project with data:', JSON.stringify(req.body, null, 2));
    const project = new Project(req.body);
    await project.save();
    console.log('Project created successfully:', project.projectId);
    
    // Update customer status to Active when a new project is created
    const customerId = project.customerId?.toString();
    if (customerId) {
      await updateCustomerStatusBasedOnProjects(customerId);
    }
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // Get the project before update to check if customerId changes
    const existingProject = await Project.findById(req.params.id);
    const oldCustomerId = existingProject?.customerId?.toString();
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    console.error('Failed to update project:', error);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const customerId = project.customerId?.toString();
    
    await Project.findByIdAndDelete(req.params.id);
    
    // Update customer status based on remaining projects
    if (customerId) {
      await updateCustomerStatusBasedOnProjects(customerId);
    }
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

// Update project status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Update customer status based on project status change
    const customerId = project.customerId?.toString();
    if (customerId) {
      await updateCustomerStatusBasedOnProjects(customerId);
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Failed to update project status:', error);
    res.status(500).json({ success: false, message: 'Failed to update project status' });
  }
});

export default router;

