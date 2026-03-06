import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Employee from '../models/Employee';
import EmployeeDocument from '../models/EmployeeDocument';
import OnboardingChecklist from '../models/OnboardingChecklist';
import OffboardingChecklist from '../models/OffboardingChecklist';
import CompanySettings from '../models/CompanySettings';
import { FLResource } from '../models/FLResource';
import Project from '../models/Project';
import { ModulePermission } from '../models/ModulePermission';
import { employeeValidation } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

const router = express.Router();
const notificationService = new NotificationService();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    // Generate unique filename: employeeId_timestamp.extension
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `profile_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: function (_req, file, cb) {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Helper to normalize employee data - ensures profilePhoto is always set
const normalizeEmployee = (emp: any) => {
  const obj = emp.toObject ? emp.toObject() : emp;
  // Ensure profilePhoto is set - use avatar as fallback
  if (!obj.profilePhoto && obj.avatar) {
    obj.profilePhoto = obj.avatar;
  }
  // Also sync avatar from profilePhoto if needed
  if (!obj.avatar && obj.profilePhoto) {
    obj.avatar = obj.profilePhoto;
  }
  return obj;
};

/**
 * GET /employees/my-module-permissions
 * Returns the module permissions for the currently authenticated user.
 * Safe: employeeId is read from the verified JWT — not a user-supplied param.
 */
router.get('/my-module-permissions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID not found in token' });
    }
    const permissions = await ModulePermission.find({ employeeId });
    return res.json({ success: true, data: permissions });
  } catch (error) {
    console.error('Failed to fetch module permissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch module permissions' });
  }
});

// Get all employees
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find();
    const normalizedEmployees = employees.map(normalizeEmployee);
    res.json({ success: true, data: normalizedEmployees });
  } catch (_error) {
    console.error('Failed to read employees:', _error);
    res.status(500).json({ success: false, message: 'Failed to read employees' });
  }
});

// Get active employees
router.get('/active', async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find({ status: 'active' });
    const normalizedEmployees = employees.map(normalizeEmployee);
    res.json({ success: true, data: normalizedEmployees });
  } catch (error) {
    console.error('Failed to read active employees:', error);
    res.status(500).json({ success: false, message: 'Failed to read active employees' });
  }
});

// Get next employee ID
router.get('/utils/next-id', async (req: Request, res: Response) => {
  try {
    const hireType = req.query.workerType as string || req.query.hireType as string;

    // Determine prefix based on hire type
    let prefix = 'ACUA'; // Default for Permanent
    if (hireType === 'Contract') {
      prefix = 'ACUC'; // Contract
    } else if (hireType === 'Intern') {
      prefix = 'ACUI'; // Intern
    } else if (hireType === 'Permanent') {
      prefix = 'ACUA'; // Permanent
    } else if (hireType === 'Management') {
      prefix = 'ACUM'; // Management
    }

    // Find all employees with the same prefix
    const employees = await Employee.find();
    let maxId = 0;

    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      if (empId && empId.startsWith(prefix)) {
        // Extract numeric part
        const numericPart = empId.replace(prefix, '');
        const idNum = parseInt(numericPart);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    });

    // Generate next ID with 4-digit padding (e.g., ACUA1201, ACUM0001)
    const nextId = `${prefix}${String(maxId + 1).padStart(4, '0')}`;
    res.json({ success: true, data: { nextEmployeeId: nextId } });
  } catch (error) {
    console.error('Failed to generate next ID:', error);
    res.status(500).json({ success: false, message: 'Failed to generate next ID' });
  }
});

// Validate email uniqueness
router.get('/validate/email', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const excludeId = req.query.excludeId as string;

    if (!email) {
      return res.json({ exists: false });
    }

    const query: any = { email: { $regex: new RegExp(`^${email}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingEmployee = await Employee.findOne(query);
    res.json({ exists: !!existingEmployee });
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Validate PAN number uniqueness
router.get('/validate/pan', async (req: Request, res: Response) => {
  try {
    const panNumber = req.query.panNumber as string;
    const excludeId = req.query.excludeId as string;

    if (!panNumber) {
      return res.json({ exists: false });
    }

    const query: any = { panNumber: { $regex: new RegExp(`^${panNumber}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingEmployee = await Employee.findOne(query);
    res.json({ exists: !!existingEmployee });
  } catch (error) {
    console.error('PAN validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Get company settings (legal entities, locations, tax ID configs)
router.get('/company-settings', async (_req: Request, res: Response) => {
  try {
    let settings = await CompanySettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await CompanySettings.create({
        legalEntities: [
          'Acuvate Software Private Limited',
          'Acuvate UK Limited',
          'Acuvate Inc. (USA)'
        ],
        locations: [
          { name: 'India - Bangalore', country: 'India' },
          { name: 'India - Hyderabad', country: 'India' },
          { name: 'India - Mumbai', country: 'India' },
          { name: 'USA - San Francisco, CA', country: 'USA' },
          { name: 'USA - New York, NY', country: 'USA' },
          { name: 'USA - Austin, TX', country: 'USA' },
          { name: 'UK - London', country: 'UK' },
          { name: 'Remote', country: 'Remote' }
        ],
        taxIdConfigs: [
          {
            country: 'India',
            fieldName: 'panNumber',
            fieldLabel: 'PAN Number',
            placeholder: 'ABCDE1234F',
            pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
            maxLength: 10
          },
          {
            country: 'USA',
            fieldName: 'ssn',
            fieldLabel: 'Social Security Number (SSN)',
            placeholder: '123-45-6789',
            pattern: '^\\d{3}-\\d{2}-\\d{4}$',
            maxLength: 11
          },
          {
            country: 'UK',
            fieldName: 'nin',
            fieldLabel: 'National Insurance Number (NIN)',
            placeholder: 'AB123456C',
            pattern: '^[A-Z]{2}\\d{6}[A-Z]{1}$',
            maxLength: 9
          },
          {
            country: 'Remote',
            fieldName: 'taxId',
            fieldLabel: 'Tax Identification Number',
            placeholder: 'Enter tax ID',
            maxLength: 20
          }
        ],
        departments: [],
        designations: [],
        businessUnits: [],
        updatedBy: 'SYSTEM'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company settings'
    });
  }
});

// Validate PAN uniqueness and generate employee ID
router.post('/check-pan', async (req: Request, res: Response) => {
  try {
    const { panNumber, excludeId } = req.body;

    if (!panNumber) {
      return res.json({
        exists: false,
        message: 'PAN number is required'
      });
    }

    // Check if PAN already exists
    const query: any = { panNumber: panNumber.toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingEmployee = await Employee.findOne(query);

    if (existingEmployee) {
      return res.json({
        exists: true,
        message: `This PAN is already registered with employee ${existingEmployee.firstName} ${existingEmployee.lastName} (${existingEmployee.employeeId})`,
        existingEmployee: {
          employeeId: existingEmployee.employeeId,
          firstName: existingEmployee.firstName,
          lastName: existingEmployee.lastName,
          name: existingEmployee.name
        }
      });
    }

    // Generate next employee ID if PAN is available
    const employees = await Employee.find();
    let maxId = 0;
    const prefix = 'EMP';

    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      if (empId && empId.startsWith(prefix)) {
        const numericPart = empId.replace(prefix, '');
        const idNum = parseInt(numericPart);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    });

    const nextEmployeeId = `${prefix}${String(maxId + 1).padStart(6, '0')}`;

    res.json({
      exists: false,
      message: 'PAN number is available',
      employeeId: nextEmployeeId
    });
  } catch (error) {
    console.error('PAN validation error:', error);
    res.status(500).json({
      success: false,
      message: 'PAN validation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get workforce statistics for HR dashboard
router.get('/stats/workforce', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Start of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    // Start of current year
    const startOfYear = new Date(currentYear, 0, 1);

    // Get all employees
    const allEmployees = await Employee.find();

    // Calculate total headcount (all employees regardless of status)
    const totalHeadcount = allEmployees.length;

    // Calculate active employees
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active').length;

    // Calculate new hires MTD (joined this month)
    const newHiresMTD = allEmployees.filter(emp => {
      if (!emp.dateOfJoining) return false;
      const joinDate = new Date(emp.dateOfJoining);
      return joinDate >= startOfMonth && joinDate <= now;
    }).length;

    // Calculate new hires YTD (joined this year)
    const newHiresYTD = allEmployees.filter(emp => {
      if (!emp.dateOfJoining) return false;
      const joinDate = new Date(emp.dateOfJoining);
      return joinDate >= startOfYear && joinDate <= now;
    }).length;

    // Calculate exits MTD (last working day in current month or status inactive this month)
    const exitsMTD = allEmployees.filter(emp => {
      const empAny = emp as any;
      if (empAny.offboardingStatus?.lastWorkingDay) {
        const exitDate = new Date(empAny.offboardingStatus.lastWorkingDay);
        return exitDate >= startOfMonth && exitDate <= now;
      }
      return false;
    }).length;

    // Calculate exits YTD (last working day in current year or status inactive this year)
    const exitsYTD = allEmployees.filter(emp => {
      const empAny = emp as any;
      if (empAny.offboardingStatus?.lastWorkingDay) {
        const exitDate = new Date(empAny.offboardingStatus.lastWorkingDay);
        return exitDate >= startOfYear && exitDate <= now;
      }
      return false;
    }).length;

    // Calculate attrition rate: (Exits YTD / Average Headcount) * 100
    // Average Headcount = (Starting Headcount + Current Headcount) / 2
    const startingHeadcount = totalHeadcount - newHiresYTD + exitsYTD;
    const averageHeadcount = (startingHeadcount + totalHeadcount) / 2;
    const attritionRate = averageHeadcount > 0 ? ((exitsYTD / averageHeadcount) * 100) : 0;

    // Calculate trends (compare with last month)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);

    const lastMonthActiveCount = allEmployees.filter(emp => {
      if (emp.status !== 'active') {
        // Check if they were active last month
        const empAny = emp as any;
        if (empAny.offboardingStatus?.lastWorkingDay) {
          const exitDate = new Date(empAny.offboardingStatus.lastWorkingDay);
          return exitDate > endOfLastMonth;
        }
        return false;
      }
      // Check if they joined before end of last month
      if (emp.dateOfJoining) {
        const joinDate = new Date(emp.dateOfJoining);
        return joinDate <= endOfLastMonth;
      }
      return true;
    }).length;

    const headcountChange = totalHeadcount - (totalHeadcount - newHiresMTD + exitsMTD);
    const activeChange = activeEmployees - lastMonthActiveCount;

    res.json({
      success: true,
      data: {
        totalHeadcount,
        activeEmployees,
        newHiresMTD,
        newHiresYTD,
        exitsMTD,
        exitsYTD,
        attritionRate: parseFloat(attritionRate.toFixed(2)),
        trends: {
          headcountChange,
          activeChange
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch workforce stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workforce statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get per-employee allocation details (project-level) for RMG Employee Directory tooltip
router.get('/allocations/details', async (_req: Request, res: Response) => {
  try {
    const today = new Date();

    const flResources = await FLResource.find({
      status: 'Active',
      requestedFromDate: { $lte: today },
      requestedToDate: { $gte: today },
    }).lean();

    // Group by employeeId
    const detailsMap = new Map<string, Array<{
      projectId: string;
      projectName: string;
      utilizationPercentage: number;
      fromDate: string;
      toDate: string;
      billable: boolean;
    }>>();

    // Collect unique project ObjectId references
    const projectObjectIds = [...new Set(
      flResources.map((r: any) => r.projectId?.toString()).filter(Boolean)
    )];

    // Fetch matching projects once
    const projects = await Project.find({ _id: { $in: projectObjectIds } })
      .select('_id projectId projectName')
      .lean();

    const projectMap = new Map<string, any>();
    projects.forEach((p: any) => projectMap.set(p._id.toString(), p));

    flResources.forEach((resource: any) => {
      if (!resource.employeeId) return;
      const empId = resource.employeeId;
      if (!detailsMap.has(empId)) detailsMap.set(empId, []);

      const proj = resource.projectId
        ? projectMap.get(resource.projectId.toString())
        : null;

      detailsMap.get(empId)!.push({
        projectId: proj?.projectId || '',
        projectName: proj?.projectName || resource.flName || 'Unknown Project',
        utilizationPercentage: resource.utilizationPercentage || 0,
        fromDate: resource.requestedFromDate
          ? new Date(resource.requestedFromDate).toISOString().split('T')[0]
          : '',
        toDate: resource.requestedToDate
          ? new Date(resource.requestedToDate).toISOString().split('T')[0]
          : '',
        billable: resource.billable ?? true,
      });
    });

    const result = Array.from(detailsMap.entries()).map(([employeeId, projects]) => ({
      employeeId,
      projects,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to fetch allocation details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch allocation details' });
  }
});

// Get employee allocations for RMG Employee Directory
// Returns aggregated allocation data from FLResource collection
router.get('/allocations/summary', async (_req: Request, res: Response) => {
  try {
    const today = new Date();

    // Get all active FLResources within current date range
    const flResources = await FLResource.find({
      status: 'Active',
      requestedFromDate: { $lte: today },
      requestedToDate: { $gte: today }
    }).lean();

    // Aggregate allocation by employeeId
    const allocationMap = new Map<string, number>();

    flResources.forEach((resource: any) => {
      if (resource.employeeId && resource.utilizationPercentage) {
        const currentAllocation = allocationMap.get(resource.employeeId) || 0;
        allocationMap.set(
          resource.employeeId,
          currentAllocation + resource.utilizationPercentage
        );
      }
    });

    // Convert to array format
    const allocations = Array.from(allocationMap.entries()).map(([employeeId, allocation]) => ({
      employeeId,
      allocation: Math.min(allocation, 100), // Cap at 100%
    }));

    res.json({
      success: true,
      data: allocations,
      timestamp: today.toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch employee allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee allocations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get employee by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: normalizeEmployee(employee) });
  } catch (error) {
    console.error('Failed to read employee:', error);
    res.status(500).json({ success: false, message: 'Failed to read employee' });
  }
});

// Add employee
// Helper function to get employee ID prefix based on hire type
function getEmployeeIdPrefix(hireType: string): string {
  const prefixMap: { [key: string]: string } = {
    'Contract': 'ACUC',       // ACUvate Contract
    'Permanent': 'ACUA',      // ACUvate (Permanent)
    'Full-Time': 'ACUA',      // Map Full-Time to Permanent
    'Part-Time': 'ACUA',      // Map Part-Time to Permanent
    'Intern': 'ACUI',         // ACUvate Intern
    'Management': 'ACUM',     // ACUvate Management
    'Consultant': 'ACUC',     // Map Consultant to Contract
  };

  return prefixMap[hireType] || 'ACUA'; // Default to Permanent
}

// Helper function to generate unique employee ID based on hire type
async function generateEmployeeIdByHireType(hireType: string): Promise<string> {
  try {
    // Get prefix based on hire type
    const prefix = getEmployeeIdPrefix(hireType);

    // Find the last employee with this prefix
    const lastEmployee = await Employee.findOne({
      employeeId: { $regex: `^${prefix}` }
    })
      .sort({ employeeId: -1 }) // Sort descending to get highest number
      .select('employeeId')
      .lean();

    let sequenceNumber = 1;

    if (lastEmployee && lastEmployee.employeeId) {
      // Extract number from ID (e.g., "ACUC0005" → 5)
      const lastId = lastEmployee.employeeId;
      const numberPart = lastId.replace(prefix, ''); // Remove prefix
      const lastSequence = parseInt(numberPart, 10);

      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }

    // Pad with zeros to make 4 digits (0001, 0002, ..., 9999)
    const paddedNumber = sequenceNumber.toString().padStart(4, '0');

    return `${prefix}${paddedNumber}`;

  } catch (error) {
    console.error('Error generating employee ID:', error);
    throw new Error('Failed to generate employee ID');
  }
}

router.post('/', employeeValidation.create, async (req: Request, res: Response) => {
  try {
    const employeeData = { ...req.body };

    // Remove employeeId from request data - it will be generated
    delete employeeData.employeeId;
    delete employeeData.id;

    // 1. Check if PAN already exists (if provided)
    if (employeeData.panNumber) {
      const existingPAN = await Employee.findOne({
        panNumber: employeeData.panNumber
      });
      if (existingPAN) {
        return res.status(400).json({
          success: false,
          message: `PAN Number ${employeeData.panNumber} already exists in the system`,
          field: 'panNumber'
        });
      }
    }

    // 2. Check if Email already exists
    const existingEmail = await Employee.findOne({
      email: employeeData.email
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email ${employeeData.email} already exists in the system`,
        field: 'email'
      });
    }

    // 3. Generate unique Employee ID based on hire type
    const hireType = employeeData.workerType || employeeData.employmentType || 'Full-Time';
    const generatedEmployeeId = await generateEmployeeIdByHireType(hireType);
    employeeData.employeeId = generatedEmployeeId;
    employeeData.id = generatedEmployeeId; // For backward compatibility

    // Construct full name from firstName, middleName, lastName if name is not provided
    if (!employeeData.name && (employeeData.firstName || employeeData.lastName)) {
      employeeData.name = [
        employeeData.firstName,
        employeeData.middleName,
        employeeData.lastName
      ].filter(Boolean).join(' ');
    }

    // Handle password hashing and login access
    if (employeeData.password) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(employeeData.password, 10);
      employeeData.password = hashedPassword;
      // Enable login access when password is provided
      employeeData.hasLoginAccess = true;
      // Set default role if not provided
      if (!employeeData.role) {
        employeeData.role = 'EMPLOYEE';
      }
    } else {
      // No password, no login access
      employeeData.hasLoginAccess = false;
    }

    // Populate reporting manager details if reportingManagerId is provided
    if (employeeData.reportingManagerId) {
      const reportingManager = await Employee.findOne({ employeeId: employeeData.reportingManagerId });
      if (reportingManager) {
        employeeData.reportingManager = {
          id: reportingManager.employeeId,
          name: reportingManager.name,
          email: reportingManager.email
        };
      }
    }

    // Populate dotted line manager details if dottedLineManagerId is provided
    if (employeeData.dottedLineManagerId) {
      const dottedLineManager = await Employee.findOne({ employeeId: employeeData.dottedLineManagerId });
      if (dottedLineManager) {
        employeeData.dottedLineManager = {
          id: dottedLineManager.employeeId,
          name: dottedLineManager.name,
          email: dottedLineManager.email
        };
      }
    }

    // Assign leave plan if not provided - based on employment type or status
    if (!employeeData.leavePlan) {
      if (employeeData.employmentType === 'Consultant' || employeeData.workerType === 'Consultant') {
        employeeData.leavePlan = 'Consultant';
      } else if (employeeData.status === 'Confirmed' || employeeData.confirmationDate) {
        employeeData.leavePlan = 'Confirmation';
      } else if (employeeData.employmentType === 'Probation' || employeeData.status === 'Probation') {
        employeeData.leavePlan = 'Probation';
      } else {
        // Default to Acuvate plan for regular full-time employees
        employeeData.leavePlan = 'Acuvate';
      }
    }

    const newEmployee = new Employee(employeeData);
    await newEmployee.save();

    // Send targeted notification about new employee
    // TODO: Implement notifyEmployeeAdded method in NotificationService
    // await notificationService.notifyEmployeeAdded({
    //   employeeId: newEmployee.employeeId,
    //   name: newEmployee.name,
    //   designation: newEmployee.designation,
    //   department: newEmployee.department,
    //   reportingManagerId: newEmployee.reportingManagerId,
    //   dottedLineManagerId: newEmployee.dottedLineManagerId
    // });

    // Return success with generated Employee ID and key details
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employeeId: newEmployee.employeeId,
        _id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        designation: newEmployee.designation,
        dateOfJoining: newEmployee.dateOfJoining,
        hireType: hireType
      }
    });
  } catch (error) {
    console.error('Failed to add employee:', error);
    // Log the actual error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    res.status(500).json({ success: false, message: 'Failed to add employee', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Mark employee as inactive
router.patch('/:id/inactive', async (req: Request, res: Response) => {
  try {
    // Build query to handle both MongoDB IDs and custom employee IDs
    const query: any = { $or: [{ id: req.params.id }, { employeeId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.unshift({ _id: req.params.id });
    }

    const employee = await Employee.findOneAndUpdate(
      query,
      { status: 'inactive' },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to mark employee inactive:', error);
    res.status(500).json({ success: false, message: 'Failed to mark employee inactive' });
  }
});

// Activate employee
router.patch('/:id/activate', async (req: Request, res: Response) => {
  try {
    // Build query to handle both MongoDB IDs and custom employee IDs
    const query: any = { $or: [{ id: req.params.id }, { employeeId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.unshift({ _id: req.params.id });
    }

    const employee = await Employee.findOneAndUpdate(
      query,
      { status: 'active' },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to activate employee:', error);
    res.status(500).json({ success: false, message: 'Failed to activate employee' });
  }
});

// Update employee
router.put('/:id', authenticateToken, employeeValidation.update, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const updateData = { ...req.body };

    // Handle password hashing if password is being updated
    if (updateData.password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
      // Enable login access when password is provided
      updateData.hasLoginAccess = true;
      // Set default role if not provided
      if (!updateData.role) {
        updateData.role = 'EMPLOYEE';
      }
    }

    // Populate reporting manager details if reportingManagerId is provided
    if (updateData.reportingManagerId) {
      const reportingManager = await Employee.findOne({ employeeId: updateData.reportingManagerId });
      if (reportingManager) {
        updateData.reportingManager = {
          id: reportingManager.employeeId,
          name: reportingManager.name,
          email: reportingManager.email
        };
      }
    }

    // Populate dotted line manager details if dottedLineManagerId is provided
    if (updateData.dottedLineManagerId) {
      const dottedLineManager = await Employee.findOne({ employeeId: updateData.dottedLineManagerId });
      if (dottedLineManager) {
        updateData.dottedLineManager = {
          id: dottedLineManager.employeeId,
          name: dottedLineManager.name,
          email: dottedLineManager.email
        };
      }
    }

    // Build query to handle both MongoDB IDs and custom employee IDs
    const query: any = { $or: [{ id: req.params.id }, { employeeId: req.params.id }] };

    // Only include _id in query if the param is a valid MongoDB ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.unshift({ _id: req.params.id });
    }

    const employee = await Employee.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Send targeted notification about employee update
    // TODO: Implement notifyEmployeeUpdated method in NotificationService
    // await notificationService.notifyEmployeeUpdated({
    //   employeeId: employee.employeeId,
    //   name: employee.name,
    //   reportingManagerId: employee.reportingManagerId,
    //   dottedLineManagerId: employee.dottedLineManagerId
    // });

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update employee:', error);
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', employeeValidation.delete, async (req: Request, res: Response) => {
  try {
    // Build query to handle both MongoDB IDs and custom employee IDs
    const query: any = { $or: [{ id: req.params.id }, { employeeId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.unshift({ _id: req.params.id });
    }

    const employee = await Employee.findOneAndDelete(query);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
});

// Bulk upload
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const employees = req.body.employees || [];

    // Process each employee to assign leave plan if not provided
    const processedEmployees = employees.map((emp: any) => {
      if (!emp.leavePlan) {
        if (emp.employmentType === 'Consultant' || emp.workerType === 'Consultant') {
          emp.leavePlan = 'Consultant';
        } else if (emp.status === 'Confirmed' || emp.confirmationDate) {
          emp.leavePlan = 'Confirmation';
        } else if (emp.employmentType === 'Probation' || emp.status === 'Probation') {
          emp.leavePlan = 'Probation';
        } else {
          emp.leavePlan = 'Acuvate';
        }
      }
      return emp;
    });

    const result = await Employee.insertMany(processedEmployees);
    res.status(201).json({ success: true, data: result, count: result.length });
  } catch (error) {
    console.error('Failed to bulk upload employees:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk upload employees' });
  }
});

// ==================== EMPLOYEE PROFILE ENHANCEMENTS ====================

// Get employee profile with full details
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Fetch related data
    const documents = await EmployeeDocument.find({
      employeeId: employee.employeeId,
      isActive: true
    });

    const onboarding = await OnboardingChecklist.findOne({
      employeeId: employee.employeeId
    });

    const offboarding = await OffboardingChecklist.findOne({
      employeeId: employee.employeeId
    });

    res.json({
      success: true,
      data: {
        employee: normalizeEmployee(employee),
        documents,
        onboarding,
        offboarding
      }
    });
  } catch (error) {
    console.error('Failed to fetch employee profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee profile' });
  }
});

// Update employee medical information
router.patch('/:id/medical-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      { medicalInfo: req.body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update medical info:', error);
    res.status(500).json({ success: false, message: 'Failed to update medical information' });
  }
});

// Add/Update emergency contacts
router.patch('/:id/emergency-contacts', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      { emergencyContacts: req.body.contacts },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update emergency contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to update emergency contacts' });
  }
});

// Add/Update family members
router.patch('/:id/family-members', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      { familyMembers: req.body.members },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update family members:', error);
    res.status(500).json({ success: false, message: 'Failed to update family members' });
  }
});

// Update contact information
router.patch('/:id/contact-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this profile' });
    }

    const updateData: any = {};
    if (req.body.mobileNumber !== undefined) updateData.mobileNumber = req.body.mobileNumber;
    if (req.body.alternateNumber !== undefined) updateData.alternateNumber = req.body.alternateNumber;
    if (req.body.personalEmail !== undefined) updateData.personalEmail = req.body.personalEmail;
    if (req.body.workEmail !== undefined) updateData.email = req.body.workEmail;
    if (req.body.residenceNumber !== undefined) updateData.residenceNumber = req.body.residenceNumber;

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error: any) {
    console.error('Failed to update contact info:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to update contact information' });
  }
});

// Update education history
router.patch('/:id/education-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      { educationHistory: req.body.educationHistory },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update education history:', error);
    res.status(500).json({ success: false, message: 'Failed to update education history' });
  }
});

// Add/Update banking information
router.patch('/:id/banking-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;

    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN'].includes(requestingUser.role);

    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this profile'
      });
    }

    const updateData: any = {};

    if (req.body.primary) {
      updateData.bankName = req.body.primary.bankName;
      updateData.accountNumber = req.body.primary.accountNumber;
      updateData.ifscCode = req.body.primary.ifscCode;
      updateData.nameOnAccount = req.body.primary.nameOnAccount;
      updateData.branch = req.body.primary.branch;
    }

    if (req.body.secondary) {
      updateData.secondaryBankName = req.body.secondary.bankName;
      updateData.secondaryAccountNumber = req.body.secondary.accountNumber;
      updateData.secondaryIfscCode = req.body.secondary.ifscCode;
    }

    const employee = await Employee.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { employeeId: req.params.id }] },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to update banking info:', error);
    res.status(500).json({ success: false, message: 'Failed to update banking information' });
  }
});

// Add education record
router.post('/:id/education', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!employee.educationHistory) {
      employee.educationHistory = [] as any;
    }

    employee.educationHistory.push(req.body);
    await employee.save();

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to add education record:', error);
    res.status(500).json({ success: false, message: 'Failed to add education record' });
  }
});

// Add work history record
router.post('/:id/work-history', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!employee.workHistory) {
      employee.workHistory = [] as any;
    }

    employee.workHistory.push(req.body);
    await employee.save();

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to add work history:', error);
    res.status(500).json({ success: false, message: 'Failed to add work history record' });
  }
});

// Add certification
router.post('/:id/certifications', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!employee.certifications) {
      employee.certifications = [] as any;
    }

    employee.certifications.push(req.body);
    await employee.save();

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to add certification:', error);
    res.status(500).json({ success: false, message: 'Failed to add certification' });
  }
});

// Assign/Update asset
router.post('/:id/assets', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!employee.assetsAssigned) {
      employee.assetsAssigned = [] as any;
    }

    employee.assetsAssigned.push(req.body);
    await employee.save();

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to assign asset:', error);
    res.status(500).json({ success: false, message: 'Failed to assign asset' });
  }
});

// Return asset
router.patch('/:id/assets/:assetId/return', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ id: req.params.id }, { employeeId: req.params.id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const asset = employee.assetsAssigned?.find((a: any) => a.assetId === req.params.assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    asset.status = 'returned';
    asset.returnDate = new Date();
    asset.condition = req.body.condition || asset.condition;
    asset.notes = req.body.notes || asset.notes;

    await employee.save();

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Failed to return asset:', error);
    res.status(500).json({ success: false, message: 'Failed to return asset' });
  }
});

// Disable login for employee
router.patch('/:id/disable-login', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update account status to inactive
    employee.isActive = false;
    employee.hasLoginAccess = false;
    await employee.save();

    res.json({
      success: true,
      message: `Login disabled for ${employee.name}`,
      data: employee
    });
  } catch (error) {
    console.error('Failed to disable login:', error);
    res.status(500).json({ success: false, message: 'Failed to disable login' });
  }
});

// Upload profile picture
router.post('/:id/profile-picture', upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      // Clean up uploaded file if employee not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Delete old profile picture if exists
    if (employee.profilePhoto) {
      const oldFilePath = path.join(__dirname, '../../uploads/profile-pictures', path.basename(employee.profilePhoto));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate URL for the uploaded file
    const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update employee with new profile picture
    employee.profilePhoto = fileUrl;
    employee.avatar = fileUrl; // Keep both fields in sync
    await employee.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePhoto: fileUrl,
        employee: normalizeEmployee(employee)
      }
    });
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
});

// Delete profile picture
router.delete('/:id/profile-picture', async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete file if exists
    if (employee.profilePhoto) {
      const filePath = path.join(__dirname, '../../uploads/profile-pictures', path.basename(employee.profilePhoto));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove profile picture from employee
    employee.profilePhoto = undefined;
    employee.avatar = undefined;
    await employee.save();

    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: normalizeEmployee(employee)
    });
  } catch (error) {
    console.error('Failed to delete profile picture:', error);
    res.status(500).json({ success: false, message: 'Failed to delete profile picture' });
  }
});

// Enable login for employee
router.patch('/:id/enable-login', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update account status to active
    employee.isActive = true;
    employee.hasLoginAccess = true;
    await employee.save();

    res.json({
      success: true,
      message: `Login enabled for ${employee.name}`,
      data: employee
    });
  } catch (error) {
    console.error('Failed to enable login:', error);
    res.status(500).json({ success: false, message: 'Failed to enable login' });
  }
});

export default router;


