import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import Employee from '../models/Employee';
import EmployeeDocument from '../models/EmployeeDocument';
import OnboardingChecklist from '../models/OnboardingChecklist';
import OffboardingChecklist from '../models/OffboardingChecklist';
import CompanySettings from '../models/CompanySettings';
import { FLResource } from '../models/FLResource';
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

// Get all employees
router.get('/', async (_req: Request, res: Response) => {
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
      if (emp.lastWorkingDay) {
        const exitDate = new Date(emp.lastWorkingDay);
        return exitDate >= startOfMonth && exitDate <= now;
      }
      return false;
    }).length;
    
    // Calculate exits YTD (last working day in current year or status inactive this year)
    const exitsYTD = allEmployees.filter(emp => {
      if (emp.lastWorkingDay) {
        const exitDate = new Date(emp.lastWorkingDay);
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
        if (emp.lastWorkingDay) {
          const exitDate = new Date(emp.lastWorkingDay);
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

    // Clean up empty strings for optional fields to avoid schema validation errors
    if (!employeeData.panNumber || employeeData.panNumber.trim() === '') {
      delete employeeData.panNumber; // Remove so sparse unique index doesn't conflict
    }
    if (!employeeData.previousCTC || employeeData.previousCTC === '') {
      delete employeeData.previousCTC;
    } else {
      employeeData.previousCTC = parseFloat(employeeData.previousCTC);
    }
    if (!employeeData.currentCTC || employeeData.currentCTC === '') {
      delete employeeData.currentCTC;
    } else {
      employeeData.currentCTC = parseFloat(employeeData.currentCTC);
    }
    
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
    
    // Populate L2 manager details if l2ManagerId is provided
    if (employeeData.l2ManagerId) {
      const l2Manager = await Employee.findOne({ employeeId: employeeData.l2ManagerId });
      if (l2Manager) {
        employeeData.l2Manager = {
          id: l2Manager.employeeId,
          name: l2Manager.name,
          email: l2Manager.email
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

    // Sanitize arrays - remove empty or incomplete items that would fail subdoc validation
    if (Array.isArray(employeeData.emergencyContacts)) {
      employeeData.emergencyContacts = employeeData.emergencyContacts.filter(
        (c: any) => c && c.name && c.relationship && c.phoneNumber
      );
      if (employeeData.emergencyContacts.length === 0) delete employeeData.emergencyContacts;
    }
    if (Array.isArray(employeeData.dependents)) {
      employeeData.dependents = employeeData.dependents.filter(
        (d: any) => d && d.name && d.relationship
      );
      if (employeeData.dependents.length === 0) delete employeeData.dependents;
    }

    // Ensure role is set
    if (!employeeData.role) {
      employeeData.role = 'EMPLOYEE';
    }

    // Ensure name is set (final fallback to displayName or email prefix)
    if (!employeeData.name) {
      employeeData.name = employeeData.displayName || 
                          `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim() ||
                          (employeeData.email ? employeeData.email.split('@')[0] : 'Unknown');
    }

    // Remove empty string fields that could conflict with schema validation
    const numericFields = ['salary', 'experience', 'previousExperience', 'activeTicketCount', 'maxCapacity'];
    numericFields.forEach(field => {
      if (employeeData[field] === '' || employeeData[field] === null) {
        delete employeeData[field];
      } else if (employeeData[field] !== undefined) {
        const parsed = parseFloat(employeeData[field]);
        if (isNaN(parsed)) delete employeeData[field];
        else employeeData[field] = parsed;
      }
    });

    const newEmployee = new Employee(employeeData);
    await newEmployee.save();
    
    // Send targeted notification about new employee (non-blocking)
    try {
      if (typeof (notificationService as any).notifyEmployeeAdded === 'function') {
        await (notificationService as any).notifyEmployeeAdded({
          employeeId: newEmployee.employeeId,
          name: newEmployee.name,
          designation: newEmployee.designation,
          department: newEmployee.department,
          reportingManagerId: newEmployee.reportingManagerId,
          dottedLineManagerId: newEmployee.dottedLineManagerId
        });
      }
    } catch (notifError) {
      console.warn('Non-critical: failed to send new employee notification:', notifError);
    }
    
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
      // If it's a Mongoose ValidationError, log each field error
      const mongoError = error as any;
      if (mongoError.errors) {
        console.error('Validation errors:');
        Object.entries(mongoError.errors).forEach(([field, err]: [string, any]) => {
          console.error(`  - ${field}: ${err.message}`);
        });
      }
    }
    
    // Return detailed error for debugging
    const mongoError = error as any;
    const fieldErrors = mongoError.errors
      ? Object.entries(mongoError.errors).map(([field, err]: [string, any]) => ({
          field,
          message: err.message
        }))
      : [];

    res.status(500).json({ 
      success: false, 
      message: fieldErrors.length > 0 
        ? `Validation failed: ${fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
        : 'Failed to add employee',
      error: error instanceof Error ? error.message : 'Unknown error',
      fieldErrors
    });
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
    
    console.log('PUT /employees/:id Authorization Debug:');
    console.log('  Requesting User:', JSON.stringify(requestingUser, null, 2));
    console.log('  Target Employee ID:', targetEmployeeId);
    
    // Check if user is editing their own profile
    // Compare against both employeeId and MongoDB _id
    const isOwnProfile = 
      requestingUser.employeeId === targetEmployeeId || 
      requestingUser.id === targetEmployeeId ||
      requestingUser._id === targetEmployeeId;
    
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
    console.log('  Is Own Profile:', isOwnProfile);
    console.log('  Is HR Admin:', isHRAdmin);
    
    if (!isOwnProfile && !isHRAdmin) {
      console.log('  Authorization DENIED: Not own profile and not HR admin');
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to edit this profile' 
      });
    }
    
    console.log('  Authorization GRANTED');
    
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
    
    // Populate L2 manager details if l2ManagerId is provided
    if (updateData.l2ManagerId) {
      const l2Manager = await Employee.findOne({ employeeId: updateData.l2ManagerId });
      if (l2Manager) {
        updateData.l2Manager = {
          id: l2Manager.employeeId,
          name: l2Manager.name,
          email: l2Manager.email
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
    
    // Note: notifyEmployeeUpdated not implemented - commenting out to prevent errors
    // await notificationService.notifyEmployeeUpdated({
    //   employeeId: employee.employeeId,
    //   name: employee.name,
    //   reportingManagerId: employee.reportingManagerId,
    //   dottedLineManagerId: employee.dottedLineManagerId
    // });
    
    res.json({ success: true, data: employee });
  } catch (error: any) {
    console.error('Failed to update employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update employee' 
    });
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

// ==================== BULK UPLOAD (Advanced - BulkUploadModal) ====================

// In-memory multer for file uploads
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /bulk-upload/template - Download Excel template
router.get('/bulk-upload/template', async (_req: Request, res: Response) => {
  try {
    // Fetch company settings for dynamic dropdown values
    const settings = await CompanySettings.findOne();
    const legalEntityList: string[] = (settings?.legalEntities ?? []).filter(Boolean);
    const locationList: string[]    = (settings?.locations ?? []).map((l: any) => (typeof l === 'object' && l !== null ? l.name : l)).filter(Boolean);

    // Build safe formulae strings (max 255 chars each; fallback to placeholder)
    const toFormulae = (arr: string[], fallback: string) => {
      if (!arr.length) return `"${fallback}"`;
      const joined = arr.join(',');
      return joined.length <= 250 ? `"${joined}"` : `"${arr.slice(0, 10).join(',')}"`;
    };
    const leFormulae  = toFormulae(legalEntityList, 'Acuvate Software');
    const locFormulae = toFormulae(locationList, 'Hyderabad,Mumbai,Remote');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EmployeeConnect';
    workbook.created = new Date();

    // ── Sheet 1: Employee Data ──────────────────────────────────────────
    // Columns in exact same order as the Add Employee form (Step 1 → 5)
    // Total: 40 columns (ReportingManagerId and Status removed)
    const ws = workbook.addWorksheet('Employee Data', {
      views: [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }],
    });

    // STEP 1 – Basic Information  (col 1–10)
    // STEP 2 – Employment Details (col 11–20)
    // STEP 3 – Contact Information(col 21–24)
    // STEP 4 – Family & Personal  (col 25–32)
    // STEP 5 – Bank & Salary      (col 33–40)
    const columns = [
      // ── STEP 1: Basic Information ──────────────────────────────────
      { header: 'LegalEntity',           key: 'legalEntity',           width: 22 }, // 1  ★ dropdown
      { header: 'Location',              key: 'location',              width: 18 }, // 2  ★ dropdown
      { header: 'FirstName',             key: 'firstName',             width: 16 }, // 3  ★
      { header: 'MiddleName',            key: 'middleName',            width: 16 }, // 4
      { header: 'LastName',              key: 'lastName',              width: 16 }, // 5  ★
      { header: 'Email',                 key: 'email',                 width: 30 }, // 6  ★
      { header: 'Password',              key: 'password',              width: 18 }, // 7
      { header: 'Gender',                key: 'gender',                width: 12 }, // 8  ★ dropdown
      { header: 'DateOfBirth',           key: 'dateOfBirth',           width: 14 }, // 9  ★
      { header: 'PanNumber',             key: 'panNumber',             width: 16 }, // 10
      // ── STEP 2: Employment Details ─────────────────────────────────
      { header: 'Designation',           key: 'designation',           width: 24 }, // 11 ★
      { header: 'Department',            key: 'department',            width: 18 }, // 12 ★ dropdown
      { header: 'SubDepartment',         key: 'subDepartment',         width: 18 }, // 13
      { header: 'BusinessUnit',          key: 'businessUnit',          width: 24 }, // 14 ★ dropdown
      { header: 'HireType',              key: 'hireType',              width: 14 }, // 15 ★ dropdown
      { header: 'WorkerType',            key: 'workerType',            width: 16 }, // 16 ★ dropdown
      { header: 'DateOfJoining',         key: 'dateOfJoining',         width: 14 }, // 17 ★
      { header: 'ContractDuration',      key: 'contractDuration',      width: 18 }, // 18   dropdown
      { header: 'LeavePlan',             key: 'leavePlan',             width: 18 }, // 19   dropdown
      { header: 'HolidayPlan',           key: 'holidayPlan',           width: 14 }, // 20   dropdown
      // ── STEP 3: Contact Information ────────────────────────────────
      { header: 'Phone',                 key: 'phone',                 width: 20 }, // 21
      { header: 'WorkPhone',             key: 'workPhone',             width: 20 }, // 22
      { header: 'ResidenceNumber',       key: 'residenceNumber',       width: 20 }, // 23
      { header: 'PersonalEmail',         key: 'personalEmail',         width: 28 }, // 24
      // ── STEP 4: Family & Personal Details ──────────────────────────
      { header: 'MaritalStatus',         key: 'maritalStatus',         width: 14 }, // 25   dropdown
      { header: 'BloodGroup',            key: 'bloodGroup',            width: 12 }, // 26   dropdown
      { header: 'Nationality',           key: 'nationality',           width: 14 }, // 27
      { header: 'PhysicallyHandicapped', key: 'physicallyHandicapped', width: 22 }, // 28   dropdown
      { header: 'FatherName',            key: 'fatherName',            width: 18 }, // 29
      { header: 'MotherName',            key: 'motherName',            width: 18 }, // 30
      { header: 'SpouseName',            key: 'spouseName',            width: 18 }, // 31
      { header: 'SpouseGender',          key: 'spouseGender',          width: 14 }, // 32   dropdown
      // ── STEP 5: Bank & Salary Details ──────────────────────────────
      { header: 'SalaryPaymentMode',     key: 'salaryPaymentMode',     width: 20 }, // 33   dropdown
      { header: 'BankName',              key: 'bankName',              width: 18 }, // 34
      { header: 'AccountNumber',         key: 'accountNumber',         width: 20 }, // 35
      { header: 'IFSCCode',              key: 'ifscCode',              width: 14 }, // 36
      { header: 'NameOnAccount',         key: 'nameOnAccount',         width: 20 }, // 37
      { header: 'Branch',                key: 'branch',                width: 16 }, // 38
      { header: 'PreviousCTC',           key: 'previousCTC',           width: 14 }, // 39
      { header: 'CurrentCTC',            key: 'currentCTC',            width: 14 }, // 40
    ];
    ws.columns = columns;

    // Required columns — matches Add Employee form validation exactly
    const REQUIRED_COLS = new Set([
      'LegalEntity', 'Location', 'FirstName', 'LastName', 'Email',
      'Gender', 'DateOfBirth', 'Designation', 'Department',
      'BusinessUnit', 'HireType', 'WorkerType', 'DateOfJoining',
    ]);

    // Section colour map — colour per step
    const STEP_COLORS: Record<string, string> = {
      'LegalEntity': '7B2D2D', 'Location': '7B2D2D',
      'FirstName': '7B2D2D', 'MiddleName': '1E3A5F', 'LastName': '7B2D2D',
      'Email': '7B2D2D', 'Password': '1E3A5F', 'Gender': '7B2D2D',
      'DateOfBirth': '7B2D2D', 'PanNumber': '1E3A5F',
      'Designation': '7B2D2D', 'Department': '7B2D2D', 'SubDepartment': '1E3A5F',
      'BusinessUnit': '7B2D2D', 'HireType': '7B2D2D', 'WorkerType': '7B2D2D',
      'DateOfJoining': '7B2D2D', 'ContractDuration': '1E3A5F', 'LeavePlan': '1E3A5F',
      'HolidayPlan': '1E3A5F',
      'Phone': '1E537A', 'WorkPhone': '1E537A', 'ResidenceNumber': '1E537A', 'PersonalEmail': '1E537A',
      'MaritalStatus': '2D4A7B', 'BloodGroup': '2D4A7B', 'Nationality': '2D4A7B',
      'PhysicallyHandicapped': '2D4A7B', 'FatherName': '2D4A7B', 'MotherName': '2D4A7B',
      'SpouseName': '2D4A7B', 'SpouseGender': '2D4A7B',
      'SalaryPaymentMode': '1A5C3E', 'BankName': '1A5C3E', 'AccountNumber': '1A5C3E',
      'IFSCCode': '1A5C3E', 'NameOnAccount': '1A5C3E', 'Branch': '1A5C3E',
      'PreviousCTC': '1A5C3E', 'CurrentCTC': '1A5C3E',
    };

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.height = 22;
    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      const isRequired = REQUIRED_COLS.has(col.header);
      cell.value     = col.header;
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: STEP_COLORS[col.header] || '1E3A5F' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border    = {
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        right:  { style: 'thin',   color: { argb: 'FFAAAAAA' } },
      };
      if (isRequired) {
        cell.note = { texts: [{ text: '★ REQUIRED FIELD' }] } as any;
      }
    });

    // Sample data row (Row 2) — light blue italic
    const sampleLe  = legalEntityList[0] ?? 'Acuvate Software';
    const sampleLoc = String(locationList[0] ?? 'Hyderabad');
    ws.addRow({
      legalEntity:           sampleLe,
      location:              sampleLoc,
      firstName:             'John',
      middleName:            '',
      lastName:              'Doe',
      email:                 'john.doe@company.com',
      password:              'Pass@1234',
      gender:                'Male',
      dateOfBirth:           '1990-05-20',
      panNumber:             'ABCDE1234F',
      designation:           'Software Engineer',
      department:            'Engineering',
      subDepartment:         '',
      businessUnit:          'Technology',
      hireType:              'Permanent',
      workerType:            'Full-Time',
      dateOfJoining:         '2024-01-15',
      contractDuration:      '',
      leavePlan:             'Acuvate',
      holidayPlan:           'India',
      phone:                 '+91 9876543210',
      workPhone:             '',
      residenceNumber:       '',
      personalEmail:         '',
      maritalStatus:         'Single',
      bloodGroup:            'O+',
      nationality:           'Indian',
      physicallyHandicapped: 'No',
      fatherName:            '',
      motherName:            '',
      spouseName:            '',
      spouseGender:          '',
      salaryPaymentMode:     'Bank Transfer',
      bankName:              'HDFC Bank',
      accountNumber:         '',
      ifscCode:              '',
      nameOnAccount:         '',
      branch:                '',
      previousCTC:           800000,
      currentCTC:            1200000,
    });

    const sampleRow = ws.getRow(2);
    sampleRow.height = 18;
    sampleRow.eachCell((cell) => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
      cell.font      = { color: { argb: 'FF1E3A5F' }, italic: true, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // ── Dropdown validations (rows 3–1001) ─────────────────────────────
    // Column numbers after removing ReportingManagerId (was 21) and Status (was 42):
    //  1=LegalEntity  2=Location  8=Gender  12=Department  14=BusinessUnit
    // 15=HireType  16=WorkerType  18=ContractDuration  19=LeavePlan  20=HolidayPlan
    // 25=MaritalStatus  26=BloodGroup  28=PhysicallyHandicapped  32=SpouseGender
    // 33=SalaryPaymentMode
    const DR_S = 3, DR_E = 1001;
    const dropdowns: { col: number; vals: string }[] = [
      { col: 1,  vals: leFormulae },
      { col: 2,  vals: locFormulae },
      { col: 8,  vals: '"Male,Female,Other"' },
      { col: 12, vals: '"Engineering,Product,Design,Marketing,Sales,Finance,HR,Operations"' },
      { col: 14, vals: '"Technology,Marketing & Sales,Finance & Operations,Human Resources"' },
      { col: 15, vals: '"Contract,Permanent,Intern,Management"' },
      { col: 16, vals: '"Permanent,Full-Time,Part-Time,Contract,Consultant,Intern,Management"' },
      { col: 18, vals: '"1 Month,3 Months,6 Months,1 Year,2 Years,Custom"' },
      { col: 19, vals: '"Probation,Acuvate,Confirmation,Consultant,UK"' },
      { col: 20, vals: '"India,USA,UK,Remote"' },
      { col: 25, vals: '"Single,Married,Divorced,Widowed"' },
      { col: 26, vals: '"A+,A-,B+,B-,AB+,AB-,O+,O-"' },
      { col: 28, vals: '"Yes,No"' },
      { col: 32, vals: '"Male,Female,Other"' },
      { col: 33, vals: '"Bank Transfer,Cash,Cheque"' },
    ];
    for (const { col, vals } of dropdowns) {
      for (let r = DR_S; r <= DR_E; r++) {
        ws.getCell(r, col).dataValidation = {
          type: 'list', allowBlank: true, formulae: [vals],
          showErrorMessage: true, errorStyle: 'warning',
          errorTitle: 'Invalid Value', error: 'Please choose from the dropdown list.',
        };
      }
    }

    // Alternate row banding (cols A–AN = 40 columns)
    ws.addConditionalFormatting({
      ref: `A3:AN${DR_E}`,
      rules: [{ type: 'expression', priority: 1, formulae: ['MOD(ROW(),2)=0'],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFF0F4FF' } } } } as any],
    });

    // ── Sheet 2: Instructions ───────────────────────────────────────────
    const info = workbook.addWorksheet('Instructions', {
      views: [{ showGridLines: false }],
    });
    info.columns = [
      { header: '', key: 'c1', width: 3  },
      { header: '', key: 'c2', width: 26 },
      { header: '', key: 'c3', width: 14 },
      { header: '', key: 'c4', width: 60 },
      { header: '', key: 'c5', width: 36 },
    ];

    const addInfoTitle = (row: number, text: string) => {
      info.mergeCells(`A${row}:E${row}`);
      const c = info.getCell(`A${row}`);
      c.value = text;
      c.font  = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
      c.alignment = { indent: 1, vertical: 'middle' };
      info.getRow(row).height = 32;
    };
    const addInfoNote = (row: number, text: string) => {
      info.mergeCells(`A${row}:E${row}`);
      const c = info.getCell(`A${row}`);
      c.value = text;
      c.font  = { italic: true, size: 10, color: { argb: 'FF555555' } };
      c.alignment = { indent: 1, vertical: 'middle', wrapText: true };
      info.getRow(row).height = 18;
    };
    const addSectionHdr = (row: number, text: string, color: string) => {
      info.mergeCells(`A${row}:E${row}`);
      const c = info.getCell(`A${row}`);
      c.value = text;
      c.font  = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      c.alignment = { indent: 1, vertical: 'middle' };
      info.getRow(row).height = 20;
    };
    const addColHdr = (row: number) => {
      const r = info.getRow(row);
      r.values = ['', 'Column Name', 'Type', 'Valid Values / Format', 'Notes'];
      r.height = 18;
      r.eachCell((c, ci) => {
        if (ci === 1) return;
        c.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    };
    type IR = [string, string, string, string, boolean];
    const addRows = (startRow: number, rows: IR[]) => {
      rows.forEach(([col, type, vals, notes, req], i) => {
        const r = info.getRow(startRow + i);
        r.values = ['', col, type, vals, notes];
        r.height = 16;
        r.eachCell((c, ci) => {
          if (ci === 1) return;
          c.alignment = { vertical: 'middle', wrapText: ci === 4 };
          c.fill = { type: 'pattern', pattern: 'solid',
            fgColor: { argb: req ? 'FFFFF3F3' : (i % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF') } };
          c.border = { bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } } };
        });
        const tc = r.getCell(3);
        tc.font = { bold: true, size: 10,
          color: { argb: req ? 'FFB91C1C' : type.startsWith('Dropdown') ? 'FF1D4ED8' : 'FF374151' } };
      });
    };

    let ir = 1;
    addInfoTitle(ir++, 'Employee Bulk Upload — Column Reference');
    addInfoNote(ir++, 'Fill employee data from Row 3 in the "Employee Data" sheet. Row 2 is a sample — delete it before uploading. ★ = Required field.');
    ir++; // blank
    addSectionHdr(ir++, 'STEP 1 — Basic Information', 'FF7B2D2D');
    addColHdr(ir++);
    addRows(ir, [
      ['LegalEntity',  'Dropdown ★', 'Loaded from company settings (Super Admin)',              'REQUIRED — choose from dropdown', true],
      ['Location',     'Dropdown ★', 'Loaded from company settings (Super Admin)',              'REQUIRED — choose from dropdown', true],
      ['FirstName',    'Text ★',     'Employee first name',                                     'REQUIRED', true],
      ['MiddleName',   'Text',        'Optional middle name',                                    '',         false],
      ['LastName',     'Text ★',     'Employee last name',                                      'REQUIRED', true],
      ['Email',        'Email ★',    'Unique work email — e.g. john@company.com',               'REQUIRED — must be unique', true],
      ['Password',     'Text',        'Login password — e.g. Pass@1234',                        'Leave blank to skip',       false],
      ['Gender',       'Dropdown ★', 'Male  /  Female  /  Other',                               'REQUIRED',                  true],
      ['DateOfBirth',  'Date ★',     'YYYY-MM-DD  (e.g. 1990-05-20)',                           'REQUIRED — ISO date',       true],
      ['PanNumber',    'Text',        '10 chars — e.g. ABCDE1234F',                             'PAN / Tax ID',              false],
    ]); ir += 10;
    ir++;
    addSectionHdr(ir++, 'STEP 2 — Employment Details', 'FF1E3A5F');
    addColHdr(ir++);
    addRows(ir, [
      ['Designation',        'Text ★',      'Job title — e.g. Software Engineer',                  'REQUIRED',                 true],
      ['Department',         'Dropdown ★',  'Engineering / Product / Design / Marketing / Sales / Finance / HR / Operations', 'REQUIRED', true],
      ['SubDepartment',      'Text',         'Optional sub-department',                             '',                        false],
      ['BusinessUnit',       'Dropdown ★',  'Technology / Marketing & Sales / Finance & Operations / Human Resources',        'REQUIRED', true],
      ['HireType',           'Dropdown ★',  'Contract / Permanent / Intern / Management',           'REQUIRED — sets employee ID prefix', true],
      ['WorkerType',         'Dropdown ★',  'Permanent / Full-Time / Part-Time / Contract / Consultant / Intern / Management', 'REQUIRED', true],
      ['DateOfJoining',      'Date ★',      'YYYY-MM-DD  (e.g. 2024-01-15)',                       'REQUIRED — ISO date',     true],
      ['ContractDuration',   'Dropdown',    '1 Month / 3 Months / 6 Months / 1 Year / 2 Years / Custom', '',                 false],
      ['LeavePlan',          'Dropdown',    'Probation / Acuvate / Confirmation / Consultant / UK', 'Auto-set if blank',      false],
      ['HolidayPlan',        'Dropdown',    'India / USA / UK / Remote',                           'Auto-set from Location if blank', false],
    ]); ir += 10;
    ir++;
    addSectionHdr(ir++, 'STEP 3 — Contact Information', 'FF1E537A');
    addColHdr(ir++);
    addRows(ir, [
      ['Phone',           'Text', '+91 9876543210 (with country code)', '', false],
      ['WorkPhone',       'Text', 'Work / office phone',                '', false],
      ['ResidenceNumber', 'Text', 'Home / residence phone',             '', false],
      ['PersonalEmail',   'Text', 'Personal (non-work) email address',  '', false],
    ]); ir += 4;
    ir++;
    addSectionHdr(ir++, 'STEP 4 — Family & Personal Details', 'FF2D4A7B');
    addColHdr(ir++);
    addRows(ir, [
      ['MaritalStatus',         'Dropdown', 'Single / Married / Divorced / Widowed', '', false],
      ['BloodGroup',            'Dropdown', 'A+ / A- / B+ / B- / AB+ / AB- / O+ / O-', '', false],
      ['Nationality',           'Text',      'e.g. Indian',                           '', false],
      ['PhysicallyHandicapped', 'Dropdown', 'Yes / No',                               '', false],
      ['FatherName',            'Text',      'Father name',                            '', false],
      ['MotherName',            'Text',      'Mother name',                            '', false],
      ['SpouseName',            'Text',      'Applicable only if married',             '', false],
      ['SpouseGender',          'Dropdown', 'Male / Female / Other',                  'Applicable only if married', false],
    ]); ir += 8;
    ir++;
    addSectionHdr(ir++, 'STEP 5 — Bank & Salary Details', 'FF1A5C3E');
    addColHdr(ir++);
    addRows(ir, [
      ['SalaryPaymentMode', 'Dropdown', 'Bank Transfer / Cash / Cheque',          '', false],
      ['BankName',          'Text',      'e.g. HDFC Bank',                         'Required if SalaryPaymentMode ≠ Cash', false],
      ['AccountNumber',     'Text',      'Bank account number',                    '', false],
      ['IFSCCode',          'Text',      '11 chars — e.g. HDFC0001234',            '', false],
      ['NameOnAccount',     'Text',      'Name as on bank account',                '', false],
      ['Branch',            'Text',      'Bank branch name',                       '', false],
      ['PreviousCTC',       'Number',    'Annual CTC in ₹ at previous org — e.g. 800000',  '', false],
      ['CurrentCTC',        'Number',    'Annual CTC in ₹ at current org — e.g. 1200000',  '', false],
    ]); ir += 8;

    // ── Serialize & send ────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="Employee_Bulk_Upload_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Failed to generate template:', error);
    res.status(500).json({ success: false, error: 'Failed to generate template' });
  }
});

// POST /bulk-upload/validate - Validate uploaded Excel
router.post('/bulk-upload/validate', memUpload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[];

    const errors: any[] = [];
    const seenEmails = new Set<string>();
    let validRows = 0;
    let warningRows = 0;
    const leavePlanDistribution: Record<string, number> = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      let rowHasError = false;

      const firstName = String(row.FirstName || '').trim();
      const lastName = String(row.LastName || '').trim();
      const email = String(row.Email || '').trim().toLowerCase();
      const department = String(row.Department || '').trim();
      const designation = String(row.Designation || '').trim();

      // Skip instruction/guide rows (first row of the template has ★ markers)
      if (firstName.startsWith('★') || firstName.toLowerCase() === 'firstname') continue;

      if (!firstName) { errors.push({ row: rowNum, field: 'FirstName', value: '', message: 'First name is required', severity: 'error' }); rowHasError = true; }
      if (!lastName) { errors.push({ row: rowNum, field: 'LastName', value: '', message: 'Last name is required', severity: 'error' }); rowHasError = true; }
      if (!email) {
        errors.push({ row: rowNum, field: 'Email', value: '', message: 'Email is required', severity: 'error' }); rowHasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ row: rowNum, field: 'Email', value: email, message: 'Invalid email format', severity: 'error' }); rowHasError = true;
      } else if (seenEmails.has(email)) {
        errors.push({ row: rowNum, field: 'Email', value: email, message: 'Duplicate email in file', severity: 'error' }); rowHasError = true;
      } else {
        // Check DB
        const exists = await Employee.findOne({ email });
        if (exists) { errors.push({ row: rowNum, field: 'Email', value: email, message: 'Email already exists in system', severity: 'error' }); rowHasError = true; }
        seenEmails.add(email);
      }
      if (!department) { errors.push({ row: rowNum, field: 'Department', value: '', message: 'Department is required', severity: 'error' }); rowHasError = true; }
      if (!designation) { errors.push({ row: rowNum, field: 'Designation', value: '', message: 'Designation is required', severity: 'error' }); rowHasError = true; }

      if (!rowHasError) {
        validRows++;
        const workerType = String(row.WorkerType || 'Full-Time');
        let plan = 'Acuvate';
        if (workerType === 'Consultant') plan = 'Consultant';
        leavePlanDistribution[plan] = (leavePlanDistribution[plan] || 0) + 1;
      } else {
        warningRows++;
      }
    }

    res.json({
      totalRows: rows.length,
      validRows,
      errorRows: warningRows,
      warningRows: 0,
      autoGenerated: validRows,
      errors,
      leavePlanDistribution,
    });
  } catch (error) {
    console.error('Bulk validate error:', error);
    res.status(500).json({ error: 'Failed to validate file' });
  }
});

// POST /bulk-upload/process - Create employees from Excel (SSE streaming)
router.post('/bulk-upload/process', memUpload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[];

    // Filter valid rows (skip those missing required fields or with duplicate emails)
    const seenEmails = new Set<string>();
    const validRows: Record<string, any>[] = [];
    for (const row of rows) {
      const firstName = String(row.FirstName || '').trim();
      const lastName = String(row.LastName || '').trim();
      const email = String(row.Email || '').trim().toLowerCase();
      const department = String(row.Department || '').trim();
      const designation = String(row.Designation || '').trim();
      // Skip instruction/guide rows (template row 1 has ★ markers)
      if (firstName.startsWith('★') || firstName.toLowerCase() === 'firstname') continue;
      if (!firstName || !lastName || !email || !department || !designation) continue;
      if (seenEmails.has(email)) continue;
      const exists = await Employee.findOne({ email });
      if (exists) continue;
      seenEmails.add(email);
      validRows.push(row);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let created = 0;
    for (const row of validRows) {
      const firstName = String(row.FirstName || '').trim();
      const lastName = String(row.LastName || '').trim();
      const workerType = String(row.WorkerType || 'Full-Time').trim();
      const name = [firstName, String(row.MiddleName || '').trim(), lastName].filter(Boolean).join(' ');

      const hireTypeFromFile = String(row.HireType || '').trim();
      const prefix = ['Contract', 'Consultant'].includes(workerType) ? 'ACUC'
        : workerType === 'Intern' ? 'ACUI'
        : workerType === 'Management' ? 'ACUM'
        : hireTypeFromFile === 'Contract' ? 'ACUC'
        : hireTypeFromFile === 'Intern' ? 'ACUI'
        : hireTypeFromFile === 'Management' ? 'ACUM'
        : 'ACUA';

      const lastEmp = await Employee.findOne({ employeeId: { $regex: `^${prefix}` } })
        .sort({ employeeId: -1 }).select('employeeId').lean();
      let seq = 1;
      if (lastEmp?.employeeId) {
        const n = parseInt(lastEmp.employeeId.replace(prefix, ''), 10);
        if (!isNaN(n)) seq = n + 1;
      }
      const employeeId = `${prefix}${seq.toString().padStart(4, '0')}`;

      const prevCTC = row.PreviousCTC !== '' ? parseFloat(String(row.PreviousCTC)) : undefined;
      const currCTC = row.CurrentCTC !== '' ? parseFloat(String(row.CurrentCTC)) : undefined;

      let leavePlan = 'Acuvate';
      if (workerType === 'Consultant') leavePlan = 'Consultant';

      const str = (v: any) => String(v || '').trim() || undefined;

      // Use LeavePlan from file if provided, otherwise auto-detect
      const leavePlanFromFile = String(row.LeavePlan || '').trim();
      const resolvedLeavePlan = leavePlanFromFile || leavePlan;

      const empData: any = {
        employeeId,
        id: employeeId,
        name,
        firstName,
        middleName: str(row.MiddleName),
        lastName,
        email: String(row.Email || '').trim().toLowerCase(),
        department: String(row.Department || '').trim(),
        designation: String(row.Designation || '').trim(),
        workerType,
        hireType:           str(row.HireType),
        subDepartment:      str(row.SubDepartment),
        contractDuration:   str(row.ContractDuration),
        leavePlan:          resolvedLeavePlan,
        holidayPlan:        str(row.HolidayPlan) || 'India',
        location:           str(row.Location),
        dateOfJoining:      str(row.DateOfJoining),
        businessUnit:       str(row.BusinessUnit),
        reportingManagerId: str(row.ReportingManagerId),
        phone:              str(row.Phone),
        workPhone:          str(row.WorkPhone),
        residenceNumber:    str(row.ResidenceNumber),
        personalEmail:      str(row.PersonalEmail),
        gender:             str(row.Gender),
        dateOfBirth:        str(row.DateOfBirth),
        legalEntity:        str(row.LegalEntity),
        panNumber:          str(row.PanNumber),
        maritalStatus:      str(row.MaritalStatus),
        bloodGroup:         str(row.BloodGroup),
        nationality:        str(row.Nationality),
        physicallyHandicapped: str(row.PhysicallyHandicapped),
        fatherName:         str(row.FatherName),
        motherName:         str(row.MotherName),
        spouseName:         str(row.SpouseName),
        spouseGender:       str(row.SpouseGender),
        salaryPaymentMode:  str(row.SalaryPaymentMode),
        bankName:           str(row.BankName),
        accountNumber:      str(row.AccountNumber),
        ifscCode:           str(row.IFSCCode),
        nameOnAccount:      str(row.NameOnAccount),
        branch:             str(row.Branch),
        status: (String(row.Status || 'active').trim().toLowerCase() === 'active' ? 'active' : 'inactive'),
        role: 'EMPLOYEE',
        hasLoginAccess: false,
      };
      if (prevCTC !== undefined && !isNaN(prevCTC)) empData.previousCTC = prevCTC;
      if (currCTC !== undefined && !isNaN(currCTC)) empData.currentCTC = currCTC;

      // Handle password
      const rawPassword = String(row.Password || '').trim();
      if (rawPassword) {
        const bcrypt = require('bcryptjs');
        empData.password = await bcrypt.hash(rawPassword, 10);
      }

      // Remove empty string fields
      Object.keys(empData).forEach(k => { if (empData[k] === '' || empData[k] === undefined) delete empData[k]; });

      await new Employee(empData).save();
      created++;

      res.write(`data: ${JSON.stringify({ created, total: validRows.length, current: name })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ created, total: validRows.length, current: 'Done', done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Bulk process error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to process employees' })}\n\n`);
    res.end();
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
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
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
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
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
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
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
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
    if (!isOwnProfile && !isHRAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to edit this profile' 
      });
    }
    
    const updateData: any = {};
    if (req.body.mobileNumber !== undefined) updateData.mobileNumber = req.body.mobileNumber;
    if (req.body.alternateNumber !== undefined) updateData.alternateNumber = req.body.alternateNumber;
    if (req.body.personalEmail !== undefined) updateData.personalEmail = req.body.personalEmail;
    if (req.body.workEmail !== undefined) updateData.email = req.body.workEmail; // workEmail maps to email field
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update contact information' 
    });
  }
});

// Update education history
router.patch('/:id/education-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Authorization check: user can only edit their own profile or must be HR admin
    const requestingUser = (req as any).user;
    const targetEmployeeId = req.params.id;
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
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
    
    const isOwnProfile = requestingUser.employeeId === targetEmployeeId || requestingUser.id === targetEmployeeId || requestingUser._id === targetEmployeeId;
    const isHRAdmin = ['HR', 'SUPER_ADMIN', 'IT_ADMIN', 'ADMIN'].includes(requestingUser.role);
    
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


