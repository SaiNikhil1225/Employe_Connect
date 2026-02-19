import express from 'express';
import { FLResource } from '../models/FLResource';

const router = express.Router();

// Get all FL resources with optional filters
router.get('/', async (req, res) => {
  try {
    const { projectId, financialLineId, status, search } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    if (financialLineId) {
      query.financialLineId = financialLineId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    
    const resources = await FLResource.find(query).sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching FL resources:', error);
    res.status(500).json({ message: 'Failed to fetch FL resources' });
  }
});

// Get a single FL resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await FLResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching FL resource:', error);
    res.status(500).json({ message: 'Failed to fetch FL resource' });
  }
});

// Create a new FL resource
router.post('/', async (req, res) => {
  try {
    const resourceData = req.body;
    
    // Validation
    if (!resourceData.jobRole) {
      return res.status(400).json({ message: 'Job Role is required' });
    }
    
    if (!resourceData.requestedFromDate || !resourceData.requestedToDate) {
      return res.status(400).json({ message: 'Requested From and To dates are required' });
    }
    
    if (!resourceData.financialLineId) {
      return res.status(400).json({ message: 'Financial Line ID is required' });
    }

    // Validate dates
    const fromDate = new Date(resourceData.requestedFromDate);
    const toDate = new Date(resourceData.requestedToDate);
    if (fromDate > toDate) {
      return res.status(400).json({ message: 'Requested To Date must be after From Date' });
    }

    // Validate utilization if billable
    if (resourceData.billable && !resourceData.utilizationPercentage) {
      return res.status(400).json({ message: 'Utilization is mandatory when billable' });
    }
    
    const newResource = new FLResource(resourceData);
    await newResource.save();
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating FL resource:', error);
    res.status(500).json({ message: 'Failed to create FL resource' });
  }
});

// Update an FL resource
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const resource = await FLResource.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error updating FL resource:', error);
    res.status(500).json({ message: 'Failed to update FL resource' });
  }
});

// Delete an FL resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await FLResource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting FL resource:', error);
    res.status(500).json({ message: 'Failed to delete FL resource' });
  }
});

// Get resources by Financial Line ID
router.get('/by-fl/:flId', async (req, res) => {
  try {
    const resources = await FLResource.find({ financialLineId: req.params.flId }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching FL resources:', error);
    res.status(500).json({ message: 'Failed to fetch FL resources' });
  }
});

// Get resources by Project ID
router.get('/by-project/:projectId', async (req, res) => {
  try {
    const resources = await FLResource.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching project resources:', error);
    res.status(500).json({ message: 'Failed to fetch project resources' });
  }
});

// Get resources by Employee ID (for allocation tracking)
router.get('/by-employee/:employeeId', async (req, res) => {
  try {
    const resources = await FLResource.find({ 
      employeeId: req.params.employeeId,
      status: 'Active' // Only active allocations
    }).sort({ requestedFromDate: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching employee resources:', error);
    res.status(500).json({ message: 'Failed to fetch employee resources' });
  }
});

export default router;
