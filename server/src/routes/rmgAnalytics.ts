import express from 'express';
import { Request, Response } from 'express';
import { FLResource } from '../models/FLResource';
import Employee from '../models/Employee';
import Project from '../models/Project';

const router = express.Router();

// Type definitions
interface ResourceUtilizationSummary {
  totalResources: number;
  utilizedResources: number;
  overallUtilization: number;
  billableUtilization: number;
  nonBillableUtilization: number;
  benchStrength: number;
}

interface DepartmentBreakdown {
  department: string;
  totalResources: number;
  utilization: number;
  billableHours: number;
  nonBillableHours: number;
  benchCount: number;
}

interface TrendDataPoint {
  date: string;
  utilization: number;
  billable: number;
  nonBillable: number;
}

interface TopPerformer {
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  startDate: Date;
  endDate: Date;
  utilization: number;
  projectId: string;
  projectName: string;
  billablePercentage: number;
}

interface BenchResource {
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  utilization: number;
  skills: string[];
  availableSince: Date | null;
}

interface UserAllocation {
  employeeId: string;
  totalAllocation: number;
  billableAllocation: number;
  nonBillableAllocation: number;
}

interface EmployeeAllocation {
  employee: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  totalAllocation: number;
  allocations: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * GET /api/rmg-analytics/resource-utilization
 * Get resource utilization metrics and analytics
 * 
 * @access Private (RMG, SUPER_ADMIN)
 * @queryparam {string} startDate - Start date (YYYY-MM-DD)
 * @queryparam {string} endDate - End date (YYYY-MM-DD)
 * @queryparam {string} [department] - Filter by department
 * @queryparam {string} [role] - Filter by role/designation
 * @queryparam {boolean} [billable] - Filter by billable status
 */
router.get('/resource-utilization', async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      department,
      role,
      billable
    } = req.query;

    // For querying: use provided dates or no date filter
    let queryStart: Date | undefined = undefined;
    let queryEnd: Date | undefined = undefined;
    if (startDate) queryStart = new Date(startDate as string);
    if (endDate) queryEnd = new Date(endDate as string);

    // For response/calculations: use provided dates or default to current month
    const responseEnd = endDate ? new Date(endDate as string) : new Date();
    const responseStart = startDate 
      ? new Date(startDate as string) 
      : new Date(responseEnd.getFullYear(), responseEnd.getMonth(), 1);

    console.log('=== Resource Utilization Query Debug ===');
    console.log('Query Date Range:', { queryStart, queryEnd });
    console.log('Response Date Range:', { responseStart, responseEnd });
    console.log('Filters:', { department, role, billable });

    // Build FL resource filter
    const flResourceFilter: Record<string, unknown> = {
      status: 'Active'
    };

    // Only add date overlap filter if either start or end is provided
    if (queryStart || queryEnd) {
      flResourceFilter.$or = [
        {
          requestedFromDate: { $lte: queryEnd || new Date('9999-12-31') },
          requestedToDate: { $gte: queryStart || new Date('1900-01-01') }
        }
      ];
    }

    if (billable !== undefined) {
      flResourceFilter.billable = billable === 'true';
    }

    if (department) {
      flResourceFilter.department = department;
    }

    if (role) {
      flResourceFilter.jobRole = role;
    }

    console.log('FL Resource Filter:', JSON.stringify(flResourceFilter, null, 2));

    // Fetch FL resources for the period
    const flResources = await FLResource.find(flResourceFilter).lean();
    
    console.log('FL Resources Found:', flResources.length);
    if (flResources.length > 0) {
      console.log('Sample FL Resource:', JSON.stringify(flResources[0], null, 2));
    }

    // Get unique employee IDs from FL resources
    const employeeIds = [...new Set(flResources.map(r => r.employeeId).filter(Boolean))];
    const allocatedEmployeeIds = new Set(employeeIds);

    console.log('Employee IDs from FL Resources:', employeeIds);


    // Fetch only employees with FL resources (for utilization)
    const employeeFilter: Record<string, unknown> = {
      employeeId: { $in: employeeIds },
      status: 'active'
    };
    const employees = await Employee.find(employeeFilter).lean();

    // Fetch all active employees for global headcount and bench calculation
    const allActiveEmployeesQuery1 = await Employee.find({ status: 'active', isActive: true }).lean();
    const allActiveEmployeesQuery2 = await Employee.find({ status: 'active' }).lean();
    const allActiveEmployeesQuery3 = await Employee.countDocuments({ status: 'active', isActive: true });
    const allActiveEmployeesQuery4 = await Employee.countDocuments({});
    console.log('Query Results:');
    console.log('  - With status=active AND isActive=true:', allActiveEmployeesQuery1.length);
    console.log('  - With status=active only:', allActiveEmployeesQuery2.length);
    console.log('  - Count with status=active AND isActive=true:', allActiveEmployeesQuery3);
    console.log('  - Total count:', allActiveEmployeesQuery4);
    
    const allActiveEmployees = allActiveEmployeesQuery2; // Use the working query
    const globalEmployeeCount = allActiveEmployees.length;
    
    // Fetch project data for project names
    const projectIds = [...new Set(flResources.map(r => r.projectId).filter(Boolean))];
    const projects = await Project.find({ _id: { $in: projectIds } }).lean();
    const projectMap = new Map(projects.map(p => [p._id.toString(), p]));
    
    console.log('Employees Found:', employees.length);
    console.log('Global Employee Count:', globalEmployeeCount);
    console.log('Projects Found:', projects.length);
    console.log('Project IDs to fetch:', projectIds.map(id => id.toString()));
    if (projects.length > 0) {
      console.log('Sample Project:', JSON.stringify(projects[0], null, 2));
      console.log('ProjectMap keys:', Array.from(projectMap.keys()));
    }
    console.log('=== End Debug ===\n');

    // Calculate utilization for each employee
    const employeeUtilization = new Map();
    const departmentMap = new Map();

    // Initialize departmentMap with ALL active employees
    allActiveEmployees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          totalEmployees: 0,
          allocatedEmployees: 0,
          totalUtilization: 0,
          billableHours: 0,
          nonBillableHours: 0,
          benchCount: 0
        });
      }
      const deptStats = departmentMap.get(dept);
      deptStats.totalEmployees++;
    });

    // Calculate utilization for employees with allocations
    employees.forEach(emp => {
      const empAllocations = flResources.filter(a => a.employeeId === emp.employeeId);
      const totalAllocation = empAllocations.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      const billableAllocation = empAllocations
        .filter(a => a.billable)
        .reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      const nonBillableAllocation = empAllocations
        .filter(a => !a.billable)
        .reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);

      employeeUtilization.set(emp.employeeId, {
        employee: emp,
        totalAllocation: Math.min(totalAllocation, 100),
        billableAllocation,
        nonBillableAllocation,
        allocationCount: empAllocations.length
      });

      // Track department stats for allocated employees
      const dept = emp.department || 'Unassigned';
      const deptStats = departmentMap.get(dept);
      if (deptStats) {
        deptStats.allocatedEmployees++;
        deptStats.totalUtilization += totalAllocation;
        deptStats.billableHours += billableAllocation;
        deptStats.nonBillableHours += nonBillableAllocation;
      }
    });

    // Calculate bench count for each department
    departmentMap.forEach((stats, dept) => {
      stats.benchCount = stats.totalEmployees - stats.allocatedEmployees;
    });

    // Calculate summary metrics
    const totalResources = globalEmployeeCount;
    const utilizedResources = allocatedEmployeeIds.size;
    
    const totalUtilizationSum = Array.from(employeeUtilization.values())
      .reduce((sum: number, u: UserAllocation) => sum + u.totalAllocation, 0);
    
    const overallUtilization = totalResources > 0 
      ? Math.round((totalUtilizationSum / (totalResources * 100)) * 100 * 100) / 100
      : 0;

    const totalBillableSum = Array.from(employeeUtilization.values())
      .reduce((sum: number, u: UserAllocation) => sum + u.billableAllocation, 0);
    
    const billableUtilization = totalResources > 0 
      ? Math.round((totalBillableSum / (totalResources * 100)) * 100 * 100) / 100
      : 0;

    const totalNonBillableSum = Array.from(employeeUtilization.values())
      .reduce((sum: number, u: UserAllocation) => sum + u.nonBillableAllocation, 0);
    
    const nonBillableUtilization = totalResources > 0 
      ? Math.round((totalNonBillableSum / (totalResources * 100)) * 100 * 100) / 100
      : 0;

    const benchStrength = totalResources - utilizedResources;
    const summary: ResourceUtilizationSummary = {
      totalResources,
      utilizedResources,
      overallUtilization,
      billableUtilization,
      nonBillableUtilization,
      benchStrength
    };

    // Department breakdown
    const departmentBreakdown: DepartmentBreakdown[] = Array.from(departmentMap.entries())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(([dept, stats]: [string, any]) => ({
        department: dept,
        totalResources: stats.totalEmployees,
        utilization: stats.totalEmployees > 0
          ? Math.round((stats.totalUtilization / (stats.totalEmployees * 100)) * 100 * 100) / 100
          : 0,
        billableHours: Math.round(stats.billableHours * 100) / 100,
        nonBillableHours: Math.round(stats.nonBillableHours * 100) / 100,
        benchCount: stats.benchCount
      }))
      .sort((a, b) => b.utilization - a.utilization);

    // Generate trend data (daily aggregation)
    const trendData: TrendDataPoint[] = [];
    const daysDiff = Math.ceil((responseEnd.getTime() - responseStart.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const currentDate = new Date(responseStart);
      currentDate.setDate(responseStart.getDate() + i);
      
      trendData.push({
        date: currentDate.toISOString().split('T')[0],
        utilization: overallUtilization,
        billable: billableUtilization,
        nonBillable: nonBillableUtilization
      });
    }

    // Active allocations - show ALL FL resources (each allocation separately)
    const topPerformers: TopPerformer[] = flResources.map(flResource => {
      // Try to find employee record, fallback to FL resource data
      const employee = employees.find(e => e.employeeId === flResource.employeeId);
      const project = flResource.projectId ? projectMap.get(flResource.projectId.toString()) : null;
      
      // Debug: Log project mapping
      if (flResource.projectId) {
        console.log('Looking for project:', flResource.projectId.toString(), 'Found:', project ? project.name : 'NOT FOUND');
      }
      
      return {
        employeeId: flResource.employeeId || 'N/A',
        name: employee ? employee.name : flResource.resourceName,
        department: employee ? employee.department : flResource.department,
        designation: employee ? employee.designation : flResource.jobRole,
        startDate: flResource.requestedFromDate,
        endDate: flResource.requestedToDate,
        utilization: flResource.utilizationPercentage || 0,
        projectId: project ? project.projectId : 'N/A',
        projectName: project ? project.name : flResource.flName,
        billablePercentage: flResource.billable ? 100 : 0
      };
    });

    // Bench resources - ALL employees without active FL resources
    const benchResources: BenchResource[] = allActiveEmployees
      .filter(emp => !allocatedEmployeeIds.has(emp.employeeId))
      .map(emp => ({
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        utilization: 0,
        skills: emp.skills || [],
        availableSince: emp.dateOfJoining || null
      }));

    res.json({
      success: true,
      data: {
        period: {
          start: responseStart.toISOString().split('T')[0],
          end: responseEnd.toISOString().split('T')[0]
        },
        summary,
        departmentBreakdown,
        trendData,
        topPerformers,
        benchResources
      }
    });

  } catch (error) {
    console.error('Error fetching resource utilization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource utilization data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rmg-analytics/allocation-efficiency
 * Get allocation efficiency metrics
 * 
 * @access Private (RMG, SUPER_ADMIN)
 * @queryparam {string} startDate - Start date (YYYY-MM-DD)
 * @queryparam {string} endDate - End date (YYYY-MM-DD)
 * @queryparam {string} [projectId] - Filter by project
 * @queryparam {string} [department] - Filter by department
 */
router.get('/allocation-efficiency', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, projectId, department } = req.query;

    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(end.getFullYear(), end.getMonth(), 1);

    // Build filters
    const flResourceFilter: Record<string, unknown> = {
      status: 'Active',
      $or: [
        {
          requestedFromDate: { $lte: end },
          requestedToDate: { $gte: start }
        }
      ]
    };

    if (projectId) {
      flResourceFilter.projectId = projectId;
    }

    const flResources = await FLResource.find(flResourceFilter).lean();
    const employeeIds = [...new Set(flResources.map(a => a.employeeId).filter(Boolean))];
    
    const employeeFilter: Record<string, unknown> = {
      employeeId: { $in: employeeIds },
      status: 'active'
    };

    if (department) {
      employeeFilter.department = department;
    }

    const employees = await Employee.find(employeeFilter).lean();
    const projects = await Project.find({ status: 'active' }).lean();

    // Calculate allocation per employee
    const employeeAllocations = new Map();
    employees.forEach(emp => {
      const empAllocs = flResources.filter(a => a.employeeId === emp.employeeId);
      const totalAllocation = empAllocs.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      
      employeeAllocations.set(emp.employeeId, {
        employee: emp,
        totalAllocation,
        allocations: empAllocs
      });
    });

    // Over-allocated resources (>100%)
    const overAllocated = Array.from(employeeAllocations.values())
      .filter((ea: EmployeeAllocation) => ea.totalAllocation > 100)
      .map((ea: EmployeeAllocation) => ({
        employeeId: ea.employee.employeeId,
        name: ea.employee.name,
        department: ea.employee.department,
        allocation: ea.totalAllocation,
        excess: ea.totalAllocation - 100,
        projectCount: ea.allocations.length
      }));

    // Under-allocated resources (<50%)
    const underAllocated = Array.from(employeeAllocations.values())
      .filter((ea: EmployeeAllocation) => ea.totalAllocation < 50)
      .map((ea: EmployeeAllocation) => ({
        employeeId: ea.employee.employeeId,
        name: ea.employee.name,
        department: ea.employee.department,
        allocation: ea.totalAllocation,
        available: 100 - ea.totalAllocation,
        projectCount: ea.allocations.length
      }));

    // Optimal allocation (50-100%)
    const optimalCount = Array.from(employeeAllocations.values())
      .filter((ea: EmployeeAllocation) => ea.totalAllocation >= 50 && ea.totalAllocation <= 100)
      .length;

    const optimalRate = employees.length > 0
      ? Math.round((optimalCount / employees.length) * 100 * 100) / 100
      : 0;

    // Project-wise allocation summary
    const projectSummary = projects.map(proj => {
      const projAllocs = flResources.filter(a => a.projectId?.toString() === proj.projectId);
      const resourceCount = new Set(projAllocs.map(a => a.employeeId).filter(Boolean)).size;
      const totalAllocation = projAllocs.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      const avgAllocation = resourceCount > 0 ? totalAllocation / resourceCount : 0;

      return {
        projectId: proj.projectId,
        projectName: proj.name,
        resourceCount,
        totalAllocation: Math.round(totalAllocation * 100) / 100,
        avgAllocation: Math.round(avgAllocation * 100) / 100,
        status: proj.status
      };
    }).filter(p => p.resourceCount > 0);

    // Capacity vs allocation
    const totalCapacity = employees.length * 100;
    const totalAllocated = Array.from(employeeAllocations.values())
      .reduce((sum: number, ea: EmployeeAllocation) => sum + ea.totalAllocation, 0);
    const utilizationRate = totalCapacity > 0
      ? Math.round((totalAllocated / totalCapacity) * 100 * 100) / 100
      : 0;

    res.json({
      success: true,
      data: {
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        summary: {
          totalResources: employees.length,
          overAllocatedCount: overAllocated.length,
          underAllocatedCount: underAllocated.length,
          optimalCount,
          optimalRate,
          totalCapacity,
          totalAllocated: Math.round(totalAllocated * 100) / 100,
          utilizationRate
        },
        overAllocated,
        underAllocated,
        projectSummary
      }
    });

  } catch (error) {
    console.error('Error fetching allocation efficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocation efficiency data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rmg-analytics/cost-summary
 * Get cost analysis with real salary/rate calculations
 * 
 * @access Private (RMG, SUPER_ADMIN)
 */
router.get('/cost-summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, projectId, department } = req.query;

    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(end.getFullYear(), end.getMonth(), 1);

    // Calculate days in period
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const monthsInPeriod = daysInPeriod / 30; // Approximate months

    // Get all active employees
    const employeeFilter: Record<string, unknown> = {
      status: 'active',
      isActive: true
    };
    if (department) {
      employeeFilter.department = department;
    }
    const employees = await Employee.find(employeeFilter).lean();

    // Get FL resources for the period
    const flResourceFilter: Record<string, unknown> = {
      status: 'Active',
      requestedFromDate: { $lte: end },
      requestedToDate: { $gte: start }
    };
    const flResources = await FLResource.find(flResourceFilter).lean();

    // Get projects
    const projectFilter: Record<string, unknown> = { status: { $in: ['active', 'on-hold', 'completed'] } };
    if (projectId) {
      projectFilter.projectId = projectId;
    }
    const projects = await Project.find(projectFilter).lean();

    // Calculate costs per employee
    interface EmployeeCost {
      employeeId: string;
      name: string;
      department: string;
      monthlySalary: number;
      periodCost: number;
      allocations: typeof flResources;
      billableAllocation: number;
      nonBillableAllocation: number;
      billableCost: number;
      nonBillableCost: number;
      isBench: boolean;
    }

    const employeeCosts = new Map<string, EmployeeCost>();

    employees.forEach(emp => {
      const empAllocs = flResources.filter(a => a.employeeId === emp.employeeId);
      const billableAllocs = empAllocs.filter(a => a.billable !== false);
      const nonBillableAllocs = empAllocs.filter(a => a.billable === false);

      const billableAllocation = billableAllocs.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      const nonBillableAllocation = nonBillableAllocs.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      const totalAllocation = billableAllocation + nonBillableAllocation;

      const monthlySalary = (emp as any).monthlySalary || 0; // eslint-disable-line @typescript-eslint/no-explicit-any
      const periodCost = monthlySalary * monthsInPeriod;

      // Proportional cost calculation
      const billableCost = totalAllocation > 0 
        ? (periodCost * billableAllocation) / 100 
        : 0;
      const nonBillableCost = totalAllocation > 0 
        ? (periodCost * nonBillableAllocation) / 100 
        : 0;

      employeeCosts.set(emp.employeeId, {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        monthlySalary,
        periodCost,
        allocations: empAllocs,
        billableAllocation,
        nonBillableAllocation,
        billableCost,
        nonBillableCost,
        isBench: totalAllocation === 0
      });
    });

    // Calculate summary totals
    const totalResourceCost = Array.from(employeeCosts.values())
      .reduce((sum, ec) => sum + ec.periodCost, 0);

    const billableResourceCost = Array.from(employeeCosts.values())
      .reduce((sum, ec) => sum + ec.billableCost, 0);

    const nonBillableResourceCost = Array.from(employeeCosts.values())
      .reduce((sum, ec) => sum + ec.nonBillableCost, 0);

    const benchCost = Array.from(employeeCosts.values())
      .filter(ec => ec.isBench)
      .reduce((sum, ec) => sum + ec.periodCost, 0);

    // Department-wise cost breakdown
    const departmentCostMap = new Map<string, {
      department: string;
      resourceCount: number;
      totalCost: number;
      billableCost: number;
      nonBillableCost: number;
      benchCost: number;
      benchCount: number;
    }>();

    Array.from(employeeCosts.values()).forEach(ec => {
      if (!departmentCostMap.has(ec.department)) {
        departmentCostMap.set(ec.department, {
          department: ec.department,
          resourceCount: 0,
          totalCost: 0,
          billableCost: 0,
          nonBillableCost: 0,
          benchCost: 0,
          benchCount: 0
        });
      }

      const deptData = departmentCostMap.get(ec.department)!;
      deptData.resourceCount++;
      deptData.totalCost += ec.periodCost;
      deptData.billableCost += ec.billableCost;
      deptData.nonBillableCost += ec.nonBillableCost;
      if (ec.isBench) {
        deptData.benchCost += ec.periodCost;
        deptData.benchCount++;
      }
    });

    const departmentCosts = Array.from(departmentCostMap.values())
      .map(d => ({
        ...d,
        totalCost: Math.round(d.totalCost * 100) / 100,
        billableCost: Math.round(d.billableCost * 100) / 100,
        nonBillableCost: Math.round(d.nonBillableCost * 100) / 100,
        benchCost: Math.round(d.benchCost * 100) / 100,
        avgCostPerResource: Math.round((d.totalCost / d.resourceCount) * 100) / 100
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // Project-wise cost calculation
    const projectCostMap = new Map<string, {
      projectId: string;
      projectName: string;
      budget: number;
      actualCost: number;
      resourceCount: number;
      variance: number;
      variancePercent: number;
      roi: number;
    }>();

    projects.forEach(proj => {
      const projAllocs = allocations.filter(a => a.projectId === proj.projectId && a.billable !== false);
      const resourceIds = new Set(projAllocs.map(a => a.employeeId));
      
      let projectCost = 0;
      projAllocs.forEach(alloc => {
        const empCost = employeeCosts.get(alloc.employeeId);
        if (empCost) {
          // Cost = (Monthly Salary * Months * Allocation %)
          projectCost += (empCost.monthlySalary * monthsInPeriod * alloc.allocation) / 100;
        }
      });

      const budget = proj.budget || 0;
      const variance = budget - projectCost;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
      const roi = projectCost > 0 ? ((budget - projectCost) / projectCost) * 100 : 0;

      if (resourceIds.size > 0) {
        projectCostMap.set(proj.projectId, {
          projectId: proj.projectId,
          projectName: proj.name,
          budget,
          actualCost: Math.round(projectCost * 100) / 100,
          resourceCount: resourceIds.size,
          variance: Math.round(variance * 100) / 100,
          variancePercent: Math.round(variancePercent * 100) / 100,
          roi: Math.round(roi * 100) / 100
        });
      }
    });

    const projectCosts = Array.from(projectCostMap.values())
      .sort((a, b) => b.actualCost - a.actualCost);

    // Top cost contributors
    const topCostEmployees = Array.from(employeeCosts.values())
      .filter(ec => ec.periodCost > 0)
      .sort((a, b) => b.periodCost - a.periodCost)
      .slice(0, 10)
      .map(ec => ({
        employeeId: ec.employeeId,
        name: ec.name,
        department: ec.department,
        monthlySalary: ec.monthlySalary,
        periodCost: Math.round(ec.periodCost * 100) / 100,
        billableCost: Math.round(ec.billableCost * 100) / 100,
        utilization: ec.billableAllocation + ec.nonBillableAllocation,
        isBench: ec.isBench
      }));

    // Cost efficiency metrics
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const budgetUtilization = totalBudget > 0 
      ? (billableResourceCost / totalBudget) * 100 
      : 0;

    const costPerProject = projectCosts.length > 0 
      ? billableResourceCost / projectCosts.length 
      : 0;

    res.json({
      success: true,
      data: {
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          days: daysInPeriod,
          months: Math.round(monthsInPeriod * 100) / 100
        },
        summary: {
          totalResourceCost: Math.round(totalResourceCost * 100) / 100,
          billableResourceCost: Math.round(billableResourceCost * 100) / 100,
          nonBillableResourceCost: Math.round(nonBillableResourceCost * 100) / 100,
          benchCost: Math.round(benchCost * 100) / 100,
          totalBudget: Math.round(totalBudget * 100) / 100,
          budgetUtilization: Math.round(budgetUtilization * 100) / 100,
          costPerProject: Math.round(costPerProject * 100) / 100,
          resourceCount: employees.length,
          benchCount: Array.from(employeeCosts.values()).filter(ec => ec.isBench).length
        },
        departmentCosts,
        projectCosts,
        topCostEmployees,
        trends: {
          // Month-over-month trends would require historical data
          // Placeholder for future enhancement
          currentMonth: Math.round(totalResourceCost * 100) / 100,
          previousMonth: 0,
          change: 0,
          changePercent: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cost summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cost summary data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rmg-analytics/skills-gap
 * Get skills gap analysis
 * 
 * @access Private (RMG, SUPER_ADMIN)
 */
router.get('/skills-gap', async (req: Request, res: Response) => {
  try {
    const { projectId, futureMonths = 3 } = req.query;

    // Get all active employees with their skills
    const employees = await Employee.find({ 
      status: 'active',
      isActive: true 
    }).lean();

    // Get upcoming projects
    const upcomingDate = new Date();
    upcomingDate.setMonth(upcomingDate.getMonth() + Number(futureMonths));

    const projectFilter: Record<string, unknown> = {
      status: { $in: ['active', 'on-hold'] },
      startDate: { $lte: upcomingDate }
    };

    if (projectId) {
      projectFilter.projectId = projectId;
    }

    const projects = await Project.find(projectFilter).lean();

    // Collect all required skills from projects
    const requiredSkillsMap = new Map();
    projects.forEach(proj => {
      if (proj.requiredSkills && Array.isArray(proj.requiredSkills)) {
        proj.requiredSkills.forEach(skill => {
          requiredSkillsMap.set(skill, (requiredSkillsMap.get(skill) || 0) + 1);
        });
      }
    });

    // Collect available skills from employees
    const availableSkillsMap = new Map();
    employees.forEach(emp => {
      if (emp.skills && Array.isArray(emp.skills)) {
        emp.skills.forEach(skill => {
          if (!availableSkillsMap.has(skill)) {
            availableSkillsMap.set(skill, []);
          }
          availableSkillsMap.get(skill).push({
            employeeId: emp.employeeId,
            name: emp.name,
            department: emp.department
          });
        });
      }
    });

    // Calculate skills gap
    const skillsGap = Array.from(requiredSkillsMap.entries())
      .map(([skill, required]) => {
        const available = availableSkillsMap.has(skill) 
          ? availableSkillsMap.get(skill).length 
          : 0;
        const gap = Math.max(0, required - available);
        
        return {
          skill,
          required,
          available,
          gap,
          status: gap > 0 ? 'shortage' : 'sufficient',
          employees: availableSkillsMap.get(skill) || []
        };
      })
      .sort((a, b) => b.gap - a.gap);

    // Hiring recommendations
    const hiringRecommendations = skillsGap
      .filter(sg => sg.gap > 0)
      .map(sg => ({
        skill: sg.skill,
        requiredCount: sg.gap,
        priority: sg.gap >= 3 ? 'high' : sg.gap >= 2 ? 'medium' : 'low',
        suggestedRole: sg.skill
      }));

    // Training needs (skills with low availability)
    const trainingNeeds = Array.from(requiredSkillsMap.entries())
      .map(([skill, required]) => {
        const available = availableSkillsMap.has(skill) 
          ? availableSkillsMap.get(skill).length 
          : 0;
        
        return {
          skill,
          currentEmployees: available,
          additionalNeeded: Math.max(0, Math.ceil(required * 0.5) - available)
        };
      })
      .filter(tn => tn.additionalNeeded > 0)
      .sort((a, b) => b.additionalNeeded - a.additionalNeeded);

    res.json({
      success: true,
      data: {
        period: {
          futureMonths: Number(futureMonths),
          upcomingProjectsCount: projects.length
        },
        summary: {
          totalSkillsRequired: requiredSkillsMap.size,
          totalSkillsAvailable: availableSkillsMap.size,
          criticalGaps: skillsGap.filter(sg => sg.gap >= 3).length,
          moderateGaps: skillsGap.filter(sg => sg.gap >= 1 && sg.gap < 3).length
        },
        skillsGap,
        hiringRecommendations,
        trainingNeeds
      }
    });

  } catch (error) {
    console.error('Error fetching skills gap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills gap data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rmg-analytics/demand-forecast
 * Get resource demand forecast
 * 
 * @access Private (RMG, SUPER_ADMIN)
 */
router.get('/demand-forecast', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department, role } = req.query;

    const end = endDate ? new Date(endDate as string) : new Date();
    end.setMonth(end.getMonth() + 6); // Look 6 months ahead
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date();

    // Get upcoming and active projects
    const projects = await Project.find({
      status: { $in: ['active', 'on-hold'] },
      startDate: { $gte: start, $lte: end }
    }).lean();

    // Get current FL resources to understand demand
    const flResources = await FLResource.find({
      status: 'Active'
    }).lean();

    // Build employee filter
    const employeeFilter: Record<string, unknown> = {
      status: 'active',
      isActive: true
    };

    if (department) {
      employeeFilter.department = department;
    }

    if (role) {
      employeeFilter.designation = role;
    }

    const employees = await Employee.find(employeeFilter).lean();

    // Calculate current utilization
    const currentUtilization = new Map();
    employees.forEach(emp => {
      const empAllocs = flResources.filter(a => a.employeeId === emp.employeeId);
      const totalAlloc = empAllocs.reduce((sum, a) => sum + (a.utilizationPercentage || 0), 0);
      currentUtilization.set(emp.employeeId, totalAlloc);
    });

    const availableResources = employees.filter(emp => 
      (currentUtilization.get(emp.employeeId) || 0) < 80
    ).length;

    // Project demands by role
    const roleDemands = new Map();
    projects.forEach(proj => {
      if (proj.requiredSkills && Array.isArray(proj.requiredSkills)) {
        proj.requiredSkills.forEach(skill => {
          roleDemands.set(skill, (roleDemands.get(skill) || 0) + 1);
        });
      }
    });

    const demandByRole = Array.from(roleDemands.entries())
      .map(([role, demand]) => {
        const availableWithSkill = employees.filter(emp => 
          emp.skills && emp.skills.includes(role) &&
          (currentUtilization.get(emp.employeeId) || 0) < 80
        ).length;

        return {
          role,
          demand,
          available: availableWithSkill,
          gap: Math.max(0, demand - availableWithSkill)
        };
      })
      .sort((a, b) => b.gap - a.gap);

    // Upcoming project timeline
    const upcomingProjects = projects.map(proj => ({
      projectId: proj.projectId,
      projectName: proj.name,
      startDate: proj.startDate,
      estimatedTeamSize: proj.teamSize || 5,
      requiredSkills: proj.requiredSkills || [],
      status: proj.status
    })).sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Gap analysis
    const totalDemand = Array.from(roleDemands.values())
      .reduce((sum: number, d) => sum + (d as number), 0);
    const totalGap = demandByRole.reduce((sum, d) => sum + d.gap, 0);

    // Hiring timeline recommendations
    const hiringTimeline = demandByRole
      .filter(d => d.gap > 0)
      .map(d => ({
        role: d.role,
        hiresNeeded: d.gap,
        urgency: d.gap >= 3 ? 'immediate' : d.gap >= 2 ? 'within-month' : 'within-quarter',
        suggestedStartDate: new Date()
      }));

    res.json({
      success: true,
      data: {
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        summary: {
          upcomingProjectsCount: projects.length,
          totalDemand,
          availableResources,
          totalGap,
          utilizationRate: employees.length > 0
            ? Math.round((Array.from(currentUtilization.values()).reduce((s: number, u) => s + u, 0) / (employees.length * 100)) * 100 * 100) / 100
            : 0
        },
        demandByRole,
        upcomingProjects,
        hiringTimeline
      }
    });

  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demand forecast data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
