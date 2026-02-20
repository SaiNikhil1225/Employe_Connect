import express, { Request, Response } from 'express';
import ConfigMaster from '../models/ConfigMaster';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Validate config type
const VALID_TYPES = ['revenue-type', 'client-type', 'lead-source', 'billing-type', 'project-currency'];

const validateType = (type: string): boolean => {
  return VALID_TYPES.includes(type);
};

// Get all config items by type
router.get('/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    const { status, activeOnly } = req.query;
    const query: Record<string, unknown> = { type };

    // Filter by status if provided
    if (status) {
      query.status = status;
    } else if (activeOnly === 'true') {
      query.status = 'Active';
    }

    const configs = await ConfigMaster.find(query)
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Failed to fetch configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configurations'
    });
  }
});

// Get single config item
router.get('/:type/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    
    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    const config = await ConfigMaster.findOne({ _id: id, type });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Failed to fetch configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration'
    });
  }
});

// Create new config item (RMG/SUPER_ADMIN only)
router.post('/:type', authenticateToken, authorizeRoles('RMG', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { name, description, status } = req.body;

    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check for duplicate name (case-insensitive)
    const configModel = ConfigMaster as unknown as { nameExists: (type: string, name: string) => Promise<boolean> };
    const exists = await configModel.nameExists(type, name.trim());
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `A ${type} with this name already exists`
      });
    }

    // Create new config
    const config = new ConfigMaster({
      type,
      name: name.trim(),
      description: description?.trim() || '',
      status: status || 'Active',
      createdBy: req.user?.employeeId || req.user?.email || '',
      updatedBy: req.user?.employeeId || req.user?.email || ''
    });

    await config.save();

    res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: config
    });
  } catch (error) {
    console.error('Failed to create configuration:', error);
    
    // Handle mongoose duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A configuration with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create configuration'
    });
  }
});

// Update config item (RMG/SUPER_ADMIN only)
router.put('/:type/:id', authenticateToken, authorizeRoles('RMG', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { name, description, status } = req.body;

    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if config exists
    const config = await ConfigMaster.findOne({ _id: id, type });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // Check for duplicate name (excluding current record)
    const configModel = ConfigMaster as unknown as { nameExists: (type: string, name: string, id?: string) => Promise<boolean> };
    const exists = await configModel.nameExists(type, name.trim(), id);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `A ${type} with this name already exists`
      });
    }

    // Update config
    config.name = name.trim();
    config.description = description?.trim() || '';
    config.status = status || config.status;
    config.updatedBy = req.user?.employeeId || req.user?.email || '';

    await config.save();

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Failed to update configuration:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A configuration with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update configuration'
    });
  }
});

// Delete config item (RMG/SUPER_ADMIN only)
router.delete('/:type/:id', authenticateToken, authorizeRoles('RMG', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    const config = await ConfigMaster.findOneAndDelete({ _id: id, type });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete configuration'
    });
  }
});

// Bulk update status (RMG/SUPER_ADMIN only)
router.patch('/:type/bulk-status', authenticateToken, authorizeRoles('RMG', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { ids, status } = req.body;

    if (!validateType(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration type'
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const result = await ConfigMaster.updateMany(
      { _id: { $in: ids }, type },
      { 
        status,
        updatedBy: req.user?.employeeId || req.user?.email || ''
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} configuration(s) updated successfully`
    });
  } catch (error) {
    console.error('Failed to bulk update configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update configurations'
    });
  }
});

export default router;
