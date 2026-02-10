import express, { Request, Response } from 'express';
import Project from '../models/Project';

const router = express.Router();

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
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
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
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
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
      {  new: true , runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Failed to update project status:', error);
    res.status(500).json({ success: false, message: 'Failed to update project status' });
  }
});

export default router;

