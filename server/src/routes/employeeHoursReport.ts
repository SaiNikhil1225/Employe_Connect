import express, { Request, Response, Router } from 'express';
import TimesheetEntry from '../models/TimesheetEntry';
import { FLResource } from '../models/FLResource';
import Project from '../models/Project';
import Employee from '../models/Employee';

const router: Router = express.Router();

// Helper function to convert time string (HH:MM) to decimal hours
function convertHoursToDecimal(timeString: string | null | undefined): number {
  if (!timeString || typeof timeString !== 'string') return 0;
  try {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours + minutes / 60;
  } catch (error) {
    console.error('Error converting hours:', timeString, error);
    return 0;
  }
}

interface ReportFilters {
  role: 'EMPLOYEE' | 'MANAGER' | 'RMG';
  employeeId?: string;
  managerId?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  department?: string;
}

interface EmployeeHoursData {
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  allocationHours: number;
  actualBillableHours: number;
  actualNonBillableHours: number;
  billableApprovedHours: number;
  nonBillableApprovedHours: number;
  actualHours: number;
  approvedHours: number;
  pendingApprovedHours: number;
  rejectedHours: number;
  revisionRequestedHours: number;
}

interface ReportSummary {
  totalAllocationHours: number;
  totalActualBillableHours: number;
  totalActualNonBillableHours: number;
  totalBillableApprovedHours: number;
  totalNonBillableApprovedHours: number;
  totalActualHours: number;
  totalApprovedHours: number;
  employeeCount: number;
}

/**
 * GET /api/employee-hours-report
 * Get employee hours report with role-based filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      role,
      employeeId,
      managerId,
      month,
      startDate,
      endDate,
      projectId,
      department,
    } = req.query as Record<string, string>;

    console.log('📊 Employee Hours Report - Request received:', {
      role,
      employeeId,
      managerId,
      month,
      startDate,
      endDate,
      projectId,
      department,
    });

    // Validate required parameters
    if (!role) {
      return res.status(400).json({ message: 'role is required' });
    }

    // Determine date range
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      dateFilter = {
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
      };
    }

    // Determine which employees to include based on role
    let employeeIds: string[] = [];

    console.log('🔍 Determining employees for role:', role);

    if (role === 'EMPLOYEE') {
      // Employee can only see their own report
      if (!employeeId) {
        return res.status(400).json({ message: 'employeeId required for EMPLOYEE role' });
      }
      employeeIds = [employeeId];
      console.log('✅ EMPLOYEE role - employee ID:', employeeId);
    } else if (role === 'MANAGER') {
      // Manager sees employees in their projects
      if (!managerId) {
        return res.status(400).json({ message: 'managerId required for MANAGER role' });
      }

      console.log('🔍 Finding projects for manager:', managerId);
      // Find projects managed by this manager (as Project Manager or Delivery Manager)
      const managedProjects = await Project.find({
        $or: [
          { 'projectManager.employeeId': managerId },
          { 'deliveryManager.employeeId': managerId }
        ]
      });
      console.log('✅ Found managed projects:', managedProjects.length);

      const projectIds = managedProjects.map((p) => p._id);

      // Get all resources allocated to these projects
      const flResources = await FLResource.find({
        projectId: { $in: projectIds },
      });
      console.log('✅ Found FL resources:', flResources.length);

      employeeIds = [...new Set(flResources.map((r: any) => r.employeeId).filter((id): id is string => !!id))];
      console.log('✅ Unique employee IDs:', employeeIds.length);
    } else if (role === 'RMG') {
      // RMG can see all employees or filter by project/department
      console.log('🔍 RMG role - checking filters');
      if (projectId) {
        console.log('🔍 Finding project:', projectId);
        const project = await Project.findOne({ projectId });
        if (project) {
          console.log('✅ Project found:', project.projectName);
          const flResources = await FLResource.find({ projectId: project._id });
          console.log('✅ FL resources for project:', flResources.length);
          employeeIds = [...new Set(flResources.map((r: any) => r.employeeId).filter((id): id is string => !!id))];
        } else {
          console.log('⚠️ Project not found:', projectId);
        }
      } else {
        // Get all employees (will be filtered by department later if needed)
        console.log('🔍 Fetching all employees');
        const allEmployees = await Employee.find({}).select('employeeId').limit(1000); // Limit to prevent memory issues
        console.log('✅ Total employees:', allEmployees.length);
        employeeIds = allEmployees.map((e) => e.employeeId).filter(Boolean);
      }
    } else {
      console.log('⚠️ Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role' });
    }

    console.log('📋 Employee IDs to process:', employeeIds.length);

    // Apply department filter if specified (RMG only)
    if (role === 'RMG' && department && department !== 'all') {
      console.log('🔍 Applying department filter:', department);
      const deptEmployees = await Employee.find({ department }).select('employeeId');
      const deptEmployeeIds = deptEmployees.map((e) => e.employeeId).filter(Boolean);
      console.log('✅ Employees in department:', deptEmployeeIds.length);
      employeeIds = employeeIds.filter((id) => deptEmployeeIds.includes(id));
      console.log('✅ Filtered employee IDs:', employeeIds.length);
    }

    if (employeeIds.length === 0) {
      console.log('⚠️ No employees to process, returning empty result');
      return res.json({
        employees: [],
        summary: {
          totalAllocationHours: 0,
          totalActualBillableHours: 0,
          totalActualNonBillableHours: 0,
          totalBillableApprovedHours: 0,
          totalNonBillableApprovedHours: 0,
          totalActualHours: 0,
          totalApprovedHours: 0,
          employeeCount: 0,
        },
        filters: { role, employeeId, managerId, month, startDate, endDate, projectId, department },
      });
    }

    // Build allocation date filter for FLResource
    let allocationDateFilter: any = {};
    if (startDate && endDate) {
      allocationDateFilter = {
        $or: [
          { requestedFromDate: { $lte: new Date(endDate) }, requestedToDate: { $gte: new Date(startDate) } },
        ],
      };
    }

    // Fetch data for each employee
    const employeeReports: EmployeeHoursData[] = [];

    console.log('🔄 Processing employee data...');
    let processedCount = 0;

    for (const empId of employeeIds) {
      try {
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`⏳ Processed ${processedCount}/${employeeIds.length} employees`);
        }

        // Get employee details
        const employee = await Employee.findOne({ employeeId: empId });
        if (!employee) {
          console.log(`⚠️ Employee not found: ${empId}`);
          continue;
        }

      // Get allocations
      let allocationQuery: any = { employeeId: empId };
      if (Object.keys(allocationDateFilter).length > 0) {
        allocationQuery = { ...allocationQuery, ...allocationDateFilter };
      }
      if (projectId) {
        const project = await Project.findOne({ projectId });
        if (project) {
          allocationQuery.projectId = project._id;
        }
      }

      const allocations = await FLResource.find(allocationQuery);
      const allocationHours = allocations.reduce((total: number, alloc: any) => {
        try {
          const hours = parseFloat(String(alloc.totalAllocation || '0'));
          return total + (isNaN(hours) ? 0 : hours);
        } catch {
          console.error('Error parsing allocation hours:', alloc.totalAllocation);
          return total;
        }
      }, 0);

      // Get timesheet entries
      let timesheetQuery: any = { employeeId: empId };
      if (Object.keys(dateFilter).length > 0) {
        timesheetQuery = { ...timesheetQuery, ...dateFilter };
      }
      if (projectId) {
        timesheetQuery.projectId = projectId;
      }

      const entries = await TimesheetEntry.find(timesheetQuery);

      // Calculate hours by type and status
      const actualBillableHours = entries
        .filter((e) => e.billable === 'Billable')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const actualNonBillableHours = entries
        .filter((e) => e.billable === 'Non-Billable')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const billableApprovedHours = entries
        .filter((e) => e.billable === 'Billable' && e.approvalStatus === 'approved')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const nonBillableApprovedHours = entries
        .filter((e) => e.billable === 'Non-Billable' && e.approvalStatus === 'approved')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const approvedHours = entries
        .filter((e) => e.approvalStatus === 'approved')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const pendingApprovedHours = entries
        .filter((e) => e.approvalStatus === 'pending')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const rejectedHours = entries
        .filter((e) => e.approvalStatus === 'rejected')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const revisionRequestedHours = entries
        .filter((e) => e.approvalStatus === 'revision_requested')
        .reduce((sum, e) => sum + convertHoursToDecimal(e.hours), 0);

      const actualHours = actualBillableHours + actualNonBillableHours;

      employeeReports.push({
        employeeId: empId,
        employeeName: employee.name || 'Unknown',
        email: employee.email || 'N/A',
        department: employee.department || 'Unknown',
        allocationHours: allocationHours || 0,
        actualBillableHours: actualBillableHours || 0,
        actualNonBillableHours: actualNonBillableHours || 0,
        billableApprovedHours: billableApprovedHours || 0,
        nonBillableApprovedHours: nonBillableApprovedHours || 0,
        actualHours: actualHours || 0,
        approvedHours: approvedHours || 0,
        pendingApprovedHours: pendingApprovedHours || 0,
        rejectedHours: rejectedHours || 0,
        revisionRequestedHours: revisionRequestedHours || 0,
      });
      } catch (empError: unknown) {
        const error = empError as Error;
        console.error(`❌ Error processing employee ${empId}:`, error.message);
        console.error(`❌ Stack:`, error.stack);
        // Continue processing other employees
        continue;
      }
    }

    console.log('✅ Employee reports generated:', employeeReports.length);

    // Calculate summary
    const summary: ReportSummary = {
      totalAllocationHours: employeeReports.reduce((sum, emp) => sum + emp.allocationHours, 0),
      totalActualBillableHours: employeeReports.reduce((sum, emp) => sum + emp.actualBillableHours, 0),
      totalActualNonBillableHours: employeeReports.reduce((sum, emp) => sum + emp.actualNonBillableHours, 0),
      totalBillableApprovedHours: employeeReports.reduce((sum, emp) => sum + emp.billableApprovedHours, 0),
      totalNonBillableApprovedHours: employeeReports.reduce((sum, emp) => sum + emp.nonBillableApprovedHours, 0),
      totalActualHours: employeeReports.reduce((sum, emp) => sum + emp.actualHours, 0),
      totalApprovedHours: employeeReports.reduce((sum, emp) => sum + emp.approvedHours, 0),
      employeeCount: employeeReports.length,
    };

    console.log('✅ Summary calculated:', summary);
    console.log('✅ Sending response with', employeeReports.length, 'employee reports');

    res.json({
      employees: employeeReports,
      summary,
      filters: { role, employeeId, managerId, month, startDate, endDate, projectId, department },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Error generating employee hours report:', err);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Error details:', {
      message: err.message,
      name: err.name,
    });
    res.status(500).json({ 
      message: 'Error generating report', 
      error: err.message,
      details: err.toString(),
    });
  }
});

/**
 * GET /api/employee-hours-report/projects
 * Get available projects based on role
 */
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { role, managerId } = req.query as Record<string, string>;

    let projects;
    if (role === 'MANAGER' && managerId) {
      // Manager only sees their projects (as Project Manager or Delivery Manager)
      projects = await Project.find({
        $or: [
          { 'projectManager.employeeId': managerId },
          { 'deliveryManager.employeeId': managerId }
        ]
      });
    } else if (role === 'RMG') {
      // RMG sees all projects
      projects = await Project.find({});
    } else {
      return res.status(400).json({ message: 'Invalid role or missing managerId' });
    }

    const projectList = projects.map((p) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      projectCode: p.projectId || p.projectName,
    }));

    res.json(projectList);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
});

/**
 * GET /api/employee-hours-report/departments
 * Get all unique departments (RMG only)
 */
router.get('/departments', async (_req: Request, res: Response) => {
  try {
    const departments = await Employee.distinct('department');
    res.json(departments.filter((d) => d)); // Filter out null/undefined
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Error fetching departments', error: err.message });
  }
});

export default router;
