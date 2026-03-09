import express, { Request, Response } from 'express';
import Holiday, { HolidayStatus } from '../models/Holiday';
import Country from '../models/Country';
import Region from '../models/Region';
import Client from '../models/Client';
import Department from '../models/Department';
import HolidayType from '../models/HolidayType';
import ObservanceType from '../models/ObservanceType';
import HolidayGroup from '../models/HolidayGroup';
import Employee from '../models/Employee';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// ============================================
//  HOLIDAY CRUD OPERATIONS
// ============================================

/**
 * GET /api/holidays
 * Get all holidays with filters and pagination
 * Query params: status, country, region, client, groupId, year, page, limit
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      status,
      countryId,
      regionId,
      clientId,
      groupId,
      year,
      page = 1,
      limit = 20
    } = req.query;

    const query: any = { isActive: true };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by country (legacy support)
    if (countryId) {
      query.countryId = countryId;
    }

    // Filter by region (legacy support)
    if (regionId) {
      query.regionId = regionId;
    }

    // Filter by client (legacy support)
    if (clientId) {
      query.clientId = clientId;
    }

    // Filter by group (primary filtering method)
    if (groupId) {
      query.groupIds = groupId;
    }

    // Filter by year
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const holidays = await Holiday.find(query)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name code')
      .populate('departmentId', 'name')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Holiday.countDocuments(query);

    res.json({
      success: true,
      data: {
        holidays,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
});

/**
 * GET /api/holidays/:id
 * Get single holiday by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const holiday = await Holiday.findById(req.params.id)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name code')
      .populate('departmentId', 'name')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error('Failed to fetch holiday:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holiday' });
  }
});

/**
 * POST /api/holidays
 * Create new holiday (as DRAFT)
 * Access: SUPER_ADMIN, HR_ADMIN
 */
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HR_ADMIN'), async (req: Request, res: Response) => {
  try {
    const holidayData = {
      ...req.body,
      status: HolidayStatus.DRAFT,
      createdBy: req.user?.id,
      isActive: true
    };

    const holiday = new Holiday(holidayData);
    await holiday.save();

    const populatedHoliday = await Holiday.findById(holiday._id)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name code')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populatedHoliday });
  } catch (error) {
    console.error('Failed to create holiday:', error);
    res.status(500).json({ success: false, message: 'Failed to create holiday' });
  }
});

/**
 * PUT /api/holidays/:id
 * Update existing holiday
 * Access: SUPER_ADMIN, HR_ADMIN
 */
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HR_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow changing status via this endpoint (use publish endpoint)
    delete updateData.status;
    delete updateData.publishedAt;
    delete updateData.approvedBy;

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name code')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .populate('createdBy', 'name email');

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    console.error('Failed to update holiday:', error);
    res.status(500).json({ success: false, message: 'Failed to update holiday' });
  }
});

/**
 * POST /api/holidays/:id/publish
 * Publish a draft holiday
 * Access: SUPER_ADMIN, HR_ADMIN
 */
router.post('/:id/publish', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HR_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    if (holiday.status === HolidayStatus.PUBLISHED) {
      return res.status(400).json({ success: false, message: 'Holiday is already published' });
    }

    holiday.status = HolidayStatus.PUBLISHED;
    holiday.publishedAt = new Date();
    (holiday as any).approvedBy = req.user?.id;

    await holiday.save();

    const populatedHoliday = await Holiday.findById(holiday._id)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name code')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    res.json({ success: true, data: populatedHoliday });
  } catch (error) {
    console.error('Failed to publish holiday:', error);
    res.status(500).json({ success: false, message: 'Failed to publish holiday' });
  }
});

/**
 * DELETE /api/holidays
 * Bulk delete holidays by IDs
 * Access: SUPER_ADMIN only
 */
router.delete('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    await Holiday.updateMany({ _id: { $in: ids } }, { isActive: false });
    res.json({ success: true, message: `${ids.length} holiday(s) deleted successfully` });
  } catch (error) {
    console.error('Failed to bulk delete holidays:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete holidays' });
  }
});

/**
 * DELETE /api/holidays/:id
 * Soft delete holiday (set isActive to false)
 * Access: SUPER_ADMIN only
 */
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Failed to delete holiday:', error);
    res.status(500).json({ success: false, message: 'Failed to delete holiday' });
  }
});

/**
 * GET /api/holidays/employee/visible
 * Get holidays visible to the authenticated employee
 * Based on employee's country, region, client, and holiday group
 */
router.get('/employee/visible', authenticateToken, async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.id;

    // Fetch employee details (you'll need to implement this based on your Employee model)
    // For now, assuming employee details are passed or available
    const { countryId, regionId, clientId, groupId, year } = req.query;

    const query: any = {
      status: HolidayStatus.PUBLISHED,
      isActive: true
    };

    // Build visibility query with fallback hierarchy
    const visibilityConditions: any[] = [];

    // Global holidays (no country/region/client/group specified)
    visibilityConditions.push({
      countryId: null,
      regionId: null,
      clientId: null,
      $or: [
        { groupIds: { $exists: false } },
        { groupIds: { $size: 0 } }
      ]
    });

    // Group-based holidays (primary filtering method)
    if (groupId) {
      visibilityConditions.push({
        groupIds: groupId
      });
    }

    // Country-level holidays (legacy support)
    if (countryId) {
      visibilityConditions.push({
        countryId,
        regionId: null,
        clientId: null
      });
    }

    // Region-level holidays (legacy support)
    if (regionId) {
      visibilityConditions.push({
        countryId,
        regionId,
        clientId: null
      });
    }

    // Client-level holidays (legacy support)
    if (clientId) {
      visibilityConditions.push({
        countryId,
        regionId,
        clientId
      });
    }

    query.$or = visibilityConditions;

    // Filter by year if provided
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const holidays = await Holiday.find(query)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .populate('clientId', 'name')
      .populate('groupIds', 'name description')
      .populate('typeId', 'name')
      .populate('observanceTypeId', 'name')
      .sort({ date: 1 });

    res.json({ success: true, data: holidays });
  } catch (error) {
    console.error('Failed to fetch visible holidays:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
});

// ============================================
//  CONFIGURATION ENDPOINTS
// ============================================

// Country CRUD
router.get('/config/countries', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // Return all countries (both active and inactive) for configuration management
    const countries = await Country.find().sort({ name: 1 });
    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch countries' });
  }
});

router.post('/config/countries', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, code, regionId, isActive } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Country name and code are required' });
    }

    const country = new Country({
      name,
      code,
      regionId: regionId || undefined, // Store geographical region as string
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id
    });

    await country.save();
    res.status(201).json({ success: true, data: country });
  } catch (error: any) {
    console.error('Failed to create country:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Country name or code already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create country' });
  }
});

// Region CRUD
router.get('/config/regions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { countryId } = req.query;
    const query: any = {}; // Return all regions for configuration management
    if (countryId) query.countryId = countryId;

    const regions = await Region.find(query)
      .populate('countryId', 'name code')
      .sort({ name: 1 });
    res.json({ success: true, data: regions });
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch regions' });
  }
});

router.post('/config/regions', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, countryId } = req.body;

    // Validate required fields
    if (!name || !countryId) {
      return res.status(400).json({ success: false, message: 'Region name and country are required' });
    }

    const region = new Region({
      ...req.body,
      createdBy: req.user?.id
    });
    await region.save();
    res.status(201).json({ success: true, data: region });
  } catch (error: any) {
    console.error('Failed to create region:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Region name already exists for this country' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create region' });
  }
});

// Client CRUD
router.get('/config/clients', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { regionId, countryId } = req.query;
    const query: any = {}; // Return all clients for configuration management
    if (regionId) query.regionId = regionId;
    if (countryId) query.countryId = countryId;

    const clients = await Client.find(query)
      .populate('countryId', 'name code')
      .populate('regionId', 'name')
      .sort({ name: 1 });
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clients' });
  }
});

router.post('/config/clients', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, code, countryId, regionId } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Client name and code are required' });
    }
    if (!countryId) {
      return res.status(400).json({ success: false, message: 'Country is required' });
    }
    // regionId is now optional

    const client = new Client({
      ...req.body,
      createdBy: req.user?.id
    });
    await client.save();
    res.status(201).json({ success: true, data: client });
  } catch (error: any) {
    console.error('Failed to create client:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Client code already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
});

// Department CRUD
router.get('/config/departments', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

router.post('/config/departments', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const department = new Department({
      ...req.body,
      createdBy: req.user?.id
    });
    await department.save();
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    console.error('Failed to create department:', error);
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
});

// Holiday Type CRUD
router.get('/config/holiday-types', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // Return all types (both active and inactive) for configuration management
    const types = await HolidayType.find().sort({ name: 1 });
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Failed to fetch holiday types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holiday types' });
  }
});

router.post('/config/holiday-types', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const type = new HolidayType({
      ...req.body,
      createdBy: req.user?.id
    });
    await type.save();
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    console.error('Failed to create holiday type:', error);
    res.status(500).json({ success: false, message: 'Failed to create holiday type' });
  }
});

// Observance Type CRUD
router.get('/config/observance-types', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const types = await ObservanceType.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Failed to fetch observance types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch observance types' });
  }
});

router.post('/config/observance-types', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const type = new ObservanceType({
      ...req.body,
      createdBy: req.user?.id
    });
    await type.save();
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    console.error('Failed to create observance type:', error);
    res.status(500).json({ success: false, message: 'Failed to create observance type' });
  }
});

// Holiday Group CRUD
router.get('/config/holiday-groups', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // Return all groups (both active and inactive) for configuration management
    const groups = await HolidayGroup.find()
      .populate('employeeIds', 'name email')
      .sort({ name: 1 });
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Failed to fetch holiday groups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holiday groups' });
  }
});

router.post('/config/holiday-groups', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const group = new HolidayGroup({
      ...req.body,
      createdBy: req.user?.id
    });
    await group.save();
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error('Failed to create holiday group:', error);
    res.status(500).json({ success: false, message: 'Failed to create holiday group' });
  }
});

// ===== PUT ROUTES FOR CONFIG UPDATES =====

// Update Country
router.put('/config/countries/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    res.json({ success: true, data: country });
  } catch (error) {
    console.error('Failed to update country:', error);
    res.status(500).json({ success: false, message: 'Failed to update country' });
  }
});

// Update Region
router.put('/config/regions/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }
    res.json({ success: true, data: region });
  } catch (error) {
    console.error('Failed to update region:', error);
    res.status(500).json({ success: false, message: 'Failed to update region' });
  }
});

// Update Client
router.put('/config/clients/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Failed to update client:', error);
    res.status(500).json({ success: false, message: 'Failed to update client' });
  }
});

// Update Holiday Type
router.put('/config/types/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const type = await HolidayType.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!type) {
      return res.status(404).json({ success: false, message: 'Holiday type not found' });
    }
    res.json({ success: true, data: type });
  } catch (error) {
    console.error('Failed to update holiday type:', error);
    res.status(500).json({ success: false, message: 'Failed to update holiday type' });
  }
});

// Assign employee to a holiday group (HR Admin / Super Admin / IT Admin)
// Removes employee from any previous group, adds to the new one, updates employee.holidayGroupId
router.patch('/config/groups/set-employee-group', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HR', 'IT_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { employeeId, groupId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    // Remove employee from all existing groups
    await HolidayGroup.updateMany(
      { employeeIds: employeeId },
      { $pull: { employeeIds: employeeId } }
    );

    if (groupId && groupId !== 'none') {
      // Add employee to the new group
      await HolidayGroup.findByIdAndUpdate(groupId, { $addToSet: { employeeIds: employeeId } });
      // Persist groupId on the employee document for quick lookup
      await Employee.findByIdAndUpdate(employeeId, { holidayGroupId: groupId });
    } else {
      // Clear group assignment from employee
      await Employee.findByIdAndUpdate(employeeId, { $unset: { holidayGroupId: '' } });
    }

    res.json({ success: true, message: 'Holiday group assignment updated' });
  } catch (error) {
    console.error('Failed to set employee holiday group:', error);
    res.status(500).json({ success: false, message: 'Failed to update holiday group assignment' });
  }
});

// Update Holiday Group
router.put('/config/groups/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const group = await HolidayGroup.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!group) {
      return res.status(404).json({ success: false, message: 'Holiday group not found' });
    }
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Failed to update holiday group:', error);
    res.status(500).json({ success: false, message: 'Failed to update holiday group' });
  }
});

// ===== DELETE ROUTES FOR CONFIG ENTITIES =====

// Delete Country
router.delete('/config/countries/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    res.json({ success: true, message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Failed to delete country:', error);
    res.status(500).json({ success: false, message: 'Failed to delete country' });
  }
});

// Delete Region
router.delete('/config/regions/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const region = await Region.findByIdAndDelete(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }
    res.json({ success: true, message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Failed to delete region:', error);
    res.status(500).json({ success: false, message: 'Failed to delete region' });
  }
});

// Delete Client
router.delete('/config/clients/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Failed to delete client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client' });
  }
});

// Delete Holiday Type
router.delete('/config/types/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const type = await HolidayType.findByIdAndDelete(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Holiday type not found' });
    }
    res.json({ success: true, message: 'Holiday type deleted successfully' });
  } catch (error) {
    console.error('Failed to delete holiday type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete holiday type' });
  }
});

// Delete Holiday Group
router.delete('/config/groups/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const group = await HolidayGroup.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Holiday group not found' });
    }
    res.json({ success: true, message: 'Holiday group deleted successfully' });
  } catch (error) {
    console.error('Failed to delete holiday group:', error);
    res.status(500).json({ success: false, message: 'Failed to delete holiday group' });
  }
});

export default router;

