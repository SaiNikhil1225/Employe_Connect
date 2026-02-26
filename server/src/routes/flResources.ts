import express from 'express';
import mongoose from 'mongoose';
import { FLResource } from '../models/FLResource';
import Project from '../models/Project';
import TimesheetEntry from '../models/TimesheetEntry';

const router = express.Router();

// Get all FL resources with optional filters
router.get('/', async (req, res) => {
  try {
    const { projectId, financialLineId, status, search } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (projectId) {
      // Convert projectId string to ObjectId for query
      if (mongoose.Types.ObjectId.isValid(projectId as string)) {
        query.projectId = new mongoose.Types.ObjectId(projectId as string);
      } else {
        console.warn(`⚠️ Invalid projectId format in query: ${projectId}`);
      }
    }
    
    if (financialLineId) {
      // Convert financialLineId string to ObjectId for query
      if (mongoose.Types.ObjectId.isValid(financialLineId as string)) {
        query.financialLineId = new mongoose.Types.ObjectId(financialLineId as string);
      } else {
        console.warn(`⚠️ Invalid financialLineId format in query: ${financialLineId}`);
      }
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
    
    const resources = await FLResource.find(query)
      .populate('projectId', 'name projectId projectName') // Populate project details (both name and projectName)
      .sort({ createdAt: -1 });
    
    // Transform to include projectName in flat structure
    const transformedResources = resources.map((resource: any) => {
      const resourceObj = resource.toObject();
      const populatedProject = resource.projectId; // This is the populated Project document
      
      return {
        ...resourceObj,
        // Use populated project data if available
        projectName: populatedProject?.projectName || populatedProject?.name || resourceObj.projectName,
        projectId: populatedProject?.projectId || resourceObj.projectId, // Keep string projectId like "PRJ-001"
        projectOid: populatedProject?._id?.toString() || resourceObj.projectOid || resourceObj.projectId, // Store ObjectId separately
      };
    });
    
    res.json({ success: true, data: transformedResources });
  } catch (error) {
    console.error('Error fetching FL resources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch FL resources' });
  }
});

// Get resources by Employee ID (timesheet frontend expects this path)
// IMPORTANT: This must come BEFORE /:id route to avoid conflicts
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const resources = await FLResource.find({ 
      employeeId: req.params.employeeId
      // Note: Not filtering by status to show all allocations
    })
    .populate('projectId', 'name projectId projectName') // Populate project details (both name and projectName)
    .sort({ requestedFromDate: -1 });
    
    console.log(`📊 FL Resources for employee ${req.params.employeeId}:`, resources.length);
    
    // Transform to include projectName in flat structure
    const transformedResources = resources.map((resource: any) => {
      const resourceObj = resource.toObject();
      const populatedProject = resource.projectId; // This is the populated Project document
      
      return {
        ...resourceObj,
        // Use populated project data if available
        projectName: populatedProject?.projectName || populatedProject?.name || resourceObj.projectName,
        projectId: populatedProject?.projectId || resourceObj.projectId, // Keep string projectId like "PRJ-001"
        projectOid: populatedProject?._id?.toString() || resourceObj.projectOid || resourceObj.projectId, // Store ObjectId separately
      };
    });
    
    res.json({ success: true, data: transformedResources });
  } catch (error) {
    console.error('Error fetching employee resources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee resources' });
  }
});

// Get resources by Project ID (timesheet frontend expects this path)
// IMPORTANT: This must come BEFORE /:id route to avoid conflicts
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    let projectObjectId: mongoose.Types.ObjectId;
    
    // Check if projectId is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      // It's an ObjectId, use it directly
      projectObjectId = new mongoose.Types.ObjectId(projectId);
      console.log(`📊 Querying FL Resources by ObjectId: ${projectId}`);
    } else {
      // It's a string projectId (like "PRJ-001"), look up the Project first
      console.log(`🔍 Looking up Project by string projectId: ${projectId}`);
      const project = await Project.findOne({ projectId: projectId });
      
      if (!project) {
        console.warn(`⚠️ Project not found with projectId: ${projectId}`);
        return res.json({ success: true, data: [] }); // Return empty array instead of error
      }
      
      projectObjectId = project._id as mongoose.Types.ObjectId;
      console.log(`✅ Found Project ObjectId: ${projectObjectId}`);
    }
    
    // Query FL Resources using the ObjectId
    const resources = await FLResource.find({ 
      projectId: projectObjectId 
    })
    .populate('projectId', 'name projectId projectName') // Populate project details (both name and projectName)
    .sort({ createdAt: -1 });
    
    console.log(`📊 FL Resources for project ${projectId}:`, resources.length);
    
    // Transform to include projectName in flat structure
    const transformedResources = resources.map((resource: any) => {
      const resourceObj = resource.toObject();
      const populatedProject = resource.projectId; // This is the populated Project document
      
      return {
        ...resourceObj,
        // Use populated project data if available
        projectName: populatedProject?.projectName || populatedProject?.name || resourceObj.projectName,
        projectId: populatedProject?.projectId || resourceObj.projectId, // Keep string projectId like "PRJ-001"
        projectOid: populatedProject?._id?.toString() || resourceObj.projectOid || resourceObj.projectId, // Store ObjectId separately
      };
    });
    
    res.json({ success: true, data: transformedResources });
  } catch (error) {
    console.error('Error fetching project resources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project resources' });
  }
});

// Helper function to convert "HH:MM" format to decimal hours
function convertTimeStringToHours(timeString: string): number {
  if (!timeString || timeString === '0' || timeString === '0:0') return 0;
  
  const parts = timeString.split(':');
  if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours + (minutes / 60);
}

// Helper function to calculate working days between two dates
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  // Set time to start of day for accurate comparison
  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Count weekdays only (Monday = 1 to Friday = 5)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// Get resources with calculated hours (allocated, actual, approved)
// MUST come before /:id route to avoid route matching conflicts
router.get('/with-hours', async (req, res) => {
  try {
    const { projectId, financialLineId, status, search, startDate, endDate } = req.query;
    
    console.log('📊 /with-hours endpoint called with params:', { projectId, financialLineId, status, startDate, endDate });
    
    const query: Record<string, unknown> = {};
    
    // Handle projectId - need to convert to ObjectId for FLResource query
    // but also keep the string version for timesheet queries
    let projectObjectId: mongoose.Types.ObjectId | undefined;
    let projectStringId: string | undefined;
    
    if (projectId) {
      if (mongoose.Types.ObjectId.isValid(projectId as string)) {
        projectObjectId = new mongoose.Types.ObjectId(projectId as string);
        query.projectId = projectObjectId;
        
        // Look up the project to get the string projectId for timesheet queries
        try {
          const project = await Project.findById(projectObjectId);
          if (project) {
            projectStringId = project.projectId; // String like "PRJ-001"
            console.log(`✅ Found project: ${projectStringId} (ObjectId: ${projectObjectId})`);
          } else {
            console.warn(`⚠️ No project found for ObjectId: ${projectId}`);
          }
        } catch (err) {
          console.warn('Could not find project for ObjectId:', projectId, err);
        }
      } else {
        // It's already a string projectId, look up the ObjectId
        projectStringId = projectId as string;
        const project = await Project.findOne({ projectId: projectStringId });
        if (project) {
          projectObjectId = project._id as mongoose.Types.ObjectId;
          query.projectId = projectObjectId;
          console.log(`✅ Found project ObjectId for string projectId: ${projectStringId}`);
        } else {
          console.warn(`⚠️ No project found for string projectId: ${projectStringId}`);
        }
      }
    }
    
    if (financialLineId) {
      if (mongoose.Types.ObjectId.isValid(financialLineId as string)) {
        query.financialLineId = new mongoose.Types.ObjectId(financialLineId as string);
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { resourceName: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    
    console.log('🔍 Query:', JSON.stringify(query, null, 2));
    
    const resources = await FLResource.find(query)
      .populate('projectId', 'name projectId projectName')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${resources.length} FL resources`);
    
    // Calculate hours for each resource
    const resourcesWithHours = await Promise.all(
      resources.map(async (resource: any) => {
        const resourceObj = resource.toObject();
        
        // 1. Calculate Allocated Hours
        // Based on allocation % and date range
        let allocatedHours = 0;
        if (resource.utilizationPercentage && resource.requestedFromDate && resource.requestedToDate) {
          const allocationStartDate = new Date(resource.requestedFromDate);
          const allocationEndDate = new Date(resource.requestedToDate);
          
          // Apply date filter if provided
          const effectiveStartDate = startDate 
            ? new Date(Math.max(allocationStartDate.getTime(), new Date(startDate as string).getTime()))
            : allocationStartDate;
          const effectiveEndDate = endDate
            ? new Date(Math.min(allocationEndDate.getTime(), new Date(endDate as string).getTime()))
            : allocationEndDate;
          
          // Calculate working days in the allocation period
          const workingDays = calculateWorkingDays(effectiveStartDate, effectiveEndDate);
          
          // Standard hours per day = 8
          // Allocated hours = (Working days * 8 * Allocation%) / 100
          allocatedHours = (workingDays * 8 * (resource.utilizationPercentage || 0)) / 100;
        }
        
        // 2. Calculate Actual Hours from Timesheet
        // Sum all submitted or approved timesheet entries
        let actualHours = 0;
        if (resource.employeeId && projectStringId) {
          const timesheetQuery: Record<string, unknown> = {
            employeeId: resource.employeeId,
            projectId: projectStringId, // Use string projectId for timesheets
            status: { $in: ['submitted', 'approved'] },
          };
          
          // Apply date filter
          if (startDate || endDate || resource.requestedFromDate || resource.requestedToDate) {
            const timesheetStartDate = startDate
              ? new Date(startDate as string)
              : resource.requestedFromDate
              ? new Date(resource.requestedFromDate)
              : undefined;
            const timesheetEndDate = endDate
              ? new Date(endDate as string)
              : resource.requestedToDate
              ? new Date(resource.requestedToDate)
              : undefined;
            
            if (timesheetStartDate || timesheetEndDate) {
              timesheetQuery.date = {};
              if (timesheetStartDate) {
                (timesheetQuery.date as any).$gte = timesheetStartDate;
              }
              if (timesheetEndDate) {
                (timesheetQuery.date as any).$lte = timesheetEndDate;
              }
            }
          }
          
          const timesheetEntries = await TimesheetEntry.find(timesheetQuery);
          actualHours = timesheetEntries.reduce((sum, entry) => {
            return sum + convertTimeStringToHours(entry.hours);
          }, 0);
          
          if (timesheetEntries.length > 0) {
            console.log(`   📊 Found ${timesheetEntries.length} submitted/approved timesheet entries for ${resource.resourceName || 'resource'} (${actualHours} hrs)`);
          }
        }
        
        // 3. Calculate Approved Hours
        // Only count manager-approved timesheets (via timesheet approval workflow)
        let approvedHours = 0;
        if (resource.employeeId && projectStringId) {
          const approvedQuery: Record<string, unknown> = {
            employeeId: resource.employeeId,
            projectId: projectStringId, // Use string projectId for timesheets
            approvalStatus: 'approved', // Only check approval status from manager approval
          };
          
          // Apply date filter
          if (startDate || endDate || resource.requestedFromDate || resource.requestedToDate) {
            const approvedStartDate = startDate
              ? new Date(startDate as string)
              : resource.requestedFromDate
              ? new Date(resource.requestedFromDate)
              : undefined;
            const approvedEndDate = endDate
              ? new Date(endDate as string)
              : resource.requestedToDate
              ? new Date(resource.requestedToDate)
              : undefined;
            
            if (approvedStartDate || approvedEndDate) {
              approvedQuery.date = {};
              if (approvedStartDate) {
                (approvedQuery.date as any).$gte = approvedStartDate;
              }
              if (approvedEndDate) {
                (approvedQuery.date as any).$lte = approvedEndDate;
              }
            }
          }
          
          const approvedEntries = await TimesheetEntry.find(approvedQuery);
          approvedHours = approvedEntries.reduce((sum, entry) => {
            return sum + convertTimeStringToHours(entry.hours);
          }, 0);
          
          if (approvedEntries.length > 0) {
            console.log(`   ✅ Found ${approvedEntries.length} approved timesheet entries for ${resource.resourceName || 'resource'} (${approvedHours} hrs)`);
          }
        }
        
        // Return resource with calculated hours
        const populatedProject = resource.projectId;
        return {
          ...resourceObj,
          projectName: populatedProject?.projectName || populatedProject?.name || resourceObj.projectName,
          projectId: populatedProject?.projectId || resourceObj.projectId,
          projectOid: populatedProject?._id?.toString() || resourceObj.projectOid || resourceObj.projectId,
          allocatedHours: Math.round(allocatedHours * 100) / 100, // Round to 2 decimals
          actualHours: Math.round(actualHours * 100) / 100,
          approvedHours: Math.round(approvedHours * 100) / 100,
        };
      })
    );
    
    console.log(`✅ Successfully calculated hours for ${resourcesWithHours.length} resources`);
    res.json({ success: true, data: resourcesWithHours });
  } catch (error) {
    console.error('❌ Error fetching FL resources with hours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch FL resources with hours',
      error: error instanceof Error ? error.message : String(error)
    });
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
