import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  Download,
  Search,
  Loader2,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  X,
} from "lucide-react";
import WeeklyTimesheet from "@/pages/rmg/uda-configuration/WeeklyTimesheet";
import { PageHeader } from "@/components/ui/page-header";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { employeeHoursReportService } from "@/services/employeeHoursReportService";
import type {
  EmployeeHoursData,
  ProjectOption,
  ReportFilters,
} from "@/services/employeeHoursReportService";
import { flResourceService } from "@/services/flResourceService";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";
// Chart colors
const CHART_COLORS = {
  blue: "#3B82F6",
  blueLight: "#93C5FD",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
  orange: "#F97316",
  emerald: "#10B981",
  purple: "#8B5CF6",
  indigo: "#6366F1",
  teal: "#14B8A6",
  slate: "#64748B",
  slateLight: "#94A3B8",
  gray: "#9CA3AF",
  ash: "#D1D5DB",
};

// Type definitions for chart data and allocations
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface AllocationSegment {
  startDate: string;
  endDate: string;
  projectName: string | null;
  color: string;
  allocationStart: string | null;
  allocationEnd: string | null;
  dayCount: number;
}

interface ProjectAllocation {
  projectName: string;
  hours: number;
  percentage: number;
  startDate: string;
  endDate: string;
  color: string;
}

interface AllocationRecord {
  flNo?: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  employeeId?: string;
  startDate?: string | Date;
  expectedStartDate?: string;
  requestedFromDate?: string;
  endDate?: string | Date;
  expectedEndDate?: string;
  requestedToDate?: string;
  totalAllocation?: string | number;
  allocation?: string | number;
  projectManager?: { employeeId?: string };
  [key: string]: unknown;
}

interface ProjectRecord {
  _id?: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
  projectManager?: { employeeId?: string };
}

/**
 * Helper: Project Color Palette Generator
 */
const generateProjectColor = (projectName: string) => {
  const hash = projectName
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 50%)`;
};

/**
 * Redesigned Chart Components
 */

// 1. KPI 1: Allocation Summary - Semi-Circle Gauge (Half-Donut)
const AllocationSummaryChart: React.FC<{
  data: ChartDataItem[];
  employeeCount: number;
  allocatedCount: number;
  benchCount: number;
  averageProjects?: string;
}> = ({ data }) => {
  // Calculate total allocation percentage (excluding Bench)
  const allocatedPercentage = data
    .filter((item) => item.name !== "Bench")
    .reduce((acc, curr) => acc + curr.value, 0);

  const roundedAllocation = Math.round(allocatedPercentage);

  // Determine color based on allocation
  const allocationColor = roundedAllocation === 0 ? "#94a3b8" : "#6366f1"; // Gray if 0%, Indigo if allocated

  // Create simplified data: allocated vs unallocated
  const simplifiedData = [
    {
      name: "Allocated",
      value: roundedAllocation,
      color: allocationColor,
    },
    {
      name: "Unallocated",
      value: Math.max(0, 100 - roundedAllocation),
      color: "#e2e8f0", // Light gray for unallocated
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-2 w-full">
      <div
        className="relative flex items-center justify-center"
        style={{ minHeight: "220px" }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={simplifiedData}
              cx="50%"
              cy="75%"
              innerRadius={75}
              outerRadius={110}
              startAngle={180}
              endAngle={0}
              paddingAngle={0}
              dataKey="value"
              label={false}
              labelLine={false}
            >
              {simplifiedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-slate-800 leading-none">
            {roundedAllocation}%
          </span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            Allocated
          </span>
        </div>
      </div>
    </div>
  );
};

// 2b. Monthly Daily Allocation Progress Bar (Day-by-Day Multi-Segment)
const MonthlyDailyAllocationChart: React.FC<{
  dailyData: AllocationSegment[];
}> = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No allocation data available for the selected month
      </div>
    );
  }

  // Calculate total days from merged segments
  const totalDays = dailyData.reduce(
    (sum, segment) => sum + segment.dayCount,
    0,
  );

  return (
    <div className="space-y-4">
      {/* Month day labels */}
      <div className="flex justify-between text-[10px] text-slate-500 px-1">
        <span>Day 1</span>
        <span>Day {Math.ceil(totalDays / 2)}</span>
        <span>Day {totalDays}</span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden flex">
        {dailyData.map((segment, index) => {
          // Calculate width based on day count
          const segmentWidth = `${(segment.dayCount / totalDays) * 100}%`;

          // Format date range for tooltip
          const isSingleDay = segment.startDate === segment.endDate;
          const dateDisplay = isSingleDay
            ? format(new Date(segment.startDate), "MMM dd, yyyy")
            : `${format(new Date(segment.startDate), "MMM dd")} – ${format(new Date(segment.endDate), "MMM dd, yyyy")}`;

          return (
            <div
              key={index}
              className="relative group cursor-pointer transition-all hover:brightness-110"
              style={{
                width: segmentWidth,
                backgroundColor: segment.color,
                borderRight:
                  index < dailyData.length - 1
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "none",
              }}
              title={`${dateDisplay}: ${segment.projectName || "Bench"}`}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                  <div className="font-semibold">{dateDisplay}</div>
                  {segment.projectName && segment.projectName !== "Bench" ? (
                    <>
                      <div className="mt-1 text-slate-300">
                        Project: {segment.projectName}
                      </div>
                      {segment.allocationStart && segment.allocationEnd && (
                        <div className="text-slate-400 text-[10px] mt-1">
                          Full allocation:{" "}
                          {format(new Date(segment.allocationStart), "MMM dd")}{" "}
                          -{" "}
                          {format(
                            new Date(segment.allocationEnd),
                            "MMM dd, yyyy",
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-1 text-slate-300">Status: Bench</div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-xs">
        {dailyData
          .filter(
            (segment, index, self) =>
              segment.projectName &&
              segment.projectName !== "Bench" &&
              self.findIndex((s) => s.projectName === segment.projectName) ===
                index,
          )
          .map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-slate-600">{segment.projectName}</span>
            </div>
          ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
          <span className="text-slate-600">Bench</span>
        </div>
      </div>
    </div>
  );
};

// 3. Approval Status Doughnut Component
const ApprovalStatusDoughnut: React.FC<{
  data: ChartDataItem[];
  reportData?: EmployeeHoursData[];
  userRole?: string;
}> = ({ data, reportData = [], userRole }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Group employees by status for tooltip
  const getEmployeesForStatus = (statusName: string) => {
    if (!reportData || reportData.length === 0) return [];

    return reportData.filter((emp) => {
      const notSubmitted = Math.max(0, emp.allocationHours - emp.actualHours);

      switch (statusName) {
        case "Approved":
          return emp.approvedHours > 0;
        case "Pending for Approval":
          return emp.pendingApprovedHours > 0;
        case "Revision Requested":
          return (emp.revisionRequestedHours || 0) > 0;
        case "Rejected":
          return (emp.rejectedHours || 0) > 0;
        case "Not Submitted":
          return notSubmitted > 0;
        default:
          return false;
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ percent, value }) =>
                `${(percent * 100).toFixed(0)}% (${value}h)`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;

                const data = payload[0];
                const statusName = data.name as string;
                const hours = data.value;
                const employees = getEmployeesForStatus(statusName);

                return (
                  <div className="bg-white p-4 rounded-lg shadow-xl border border-slate-200 max-w-xs">
                    <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.payload.color }}
                      ></div>
                      {statusName}
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      Total: <b>{hours}h</b>
                    </div>
                    {userRole !== "EMPLOYEE" && employees.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                          Employees ({employees.length})
                        </div>
                        <div className="text-xs text-slate-700 max-h-32 overflow-y-auto space-y-1">
                          {employees.slice(0, 10).map((emp, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="truncate flex-1">
                                {emp.employeeName}
                              </span>
                              <span className="ml-2 text-slate-500 font-mono text-[10px]">
                                {statusName === "Approved" &&
                                  `${emp.approvedHours}h`}
                                {statusName === "Pending for Approval" &&
                                  `${emp.pendingApprovedHours}h`}
                                {statusName === "Revision Requested" &&
                                  `${emp.revisionRequestedHours || 0}h`}
                                {statusName === "Rejected" &&
                                  `${emp.rejectedHours || 0}h`}
                                {statusName === "Not Submitted" &&
                                  `${Math.max(0, emp.allocationHours - emp.actualHours).toFixed(1)}h`}
                              </span>
                            </div>
                          ))}
                          {employees.length > 10 && (
                            <div className="text-[10px] text-slate-400 italic pt-1">
                              +{employees.length - 10} more employees
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl font-bold text-slate-700 leading-none">
            {total}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
            Total Hrs
          </span>
        </div>
      </div>
    </div>
  );
};
const EmployeeHoursReport: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const userRole = user?.role || "EMPLOYEE";

  // State
  const [reportData, setReportData] = useState<EmployeeHoursData[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation[]>([]);
  const [approvalStatusData, setApprovalStatusData] = useState<ChartDataItem[]>([]);

  // Custom Date Range Popover
  const [customDatePopoverOpen, setCustomDatePopoverOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [dateRangeType, setDateRangeType] = useState<string>("current_week");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>(
    userRole === "RMG" ? "" : "all",
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDepartment, _setSelectedDepartment] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Employee allocation counts for KPI
  const [employeeAllocationCounts, setEmployeeAllocationCounts] = useState({
    total: 0,
    allocated: 0,
    bench: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check if user can see filters (RMG or Manager)
  const canSeeFilters = userRole === "RMG" || userRole === "MANAGER";

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Calculate initial date range for current_week BEFORE loading report
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
        const start = format(weekStart, "yyyy-MM-dd");
        const end = format(weekEnd, "yyyy-MM-dd");
        setStartDate(start);
        setEndDate(end);

        // Load projects if user can see filters
        if (canSeeFilters) {
          const projectsData = await employeeHoursReportService.getProjects(
            userRole,
            user?.employeeId || user?.id,
          );
          setProjects(projectsData);
        }

        setIsInitialLoad(false);
        
        // Explicitly load the report after initial setup
        // The dates are now set, so we can load the report
      } catch {
        toast.error("Failed to load initial data");
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-populate employee filter from navigation state (e.g. from Utilization page "View" button)
  useEffect(() => {
    const state = location.state as { employeeId?: string; employeeName?: string; startDate?: string; endDate?: string } | null;
    if (state?.employeeId) {
      setSelectedEmployee(state.employeeId);
    }
  }, [location.state]);

  // Calculate date range based on filter type
  useEffect(() => {
    const today = new Date();
    let start = "";
    let end = "";

    switch (dateRangeType) {
      case "current_week":
        start = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        end = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "current_month":
        start = format(startOfMonth(today), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "last_3_months":
        start = format(startOfMonth(subMonths(today, 2)), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "last_6_months":
        start = format(startOfMonth(subMonths(today, 5)), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "last_year":
        start = format(startOfMonth(subYears(today, 1)), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "custom":
        // Keep existing startDate and endDate
        return;
    }

    if (dateRangeType !== "custom") {
      setStartDate(start);
      setEndDate(end);
    }
  }, [dateRangeType]);

  // Auto-reload report when filters change
  useEffect(() => {
    if (!isInitialLoad && startDate && endDate) {
      loadReport();
      loadProjectAllocations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoad, selectedMonth, selectedProject, startDate, endDate, selectedDepartment]);

  // Update approval status when reportData changes (filtered by date range)
  useEffect(() => {
    loadApprovalStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData]);

  // Load project allocations from FLResource
  const loadProjectAllocations = async () => {
    try {
      if (!user) return;

      let allocations: AllocationRecord[] = [];
      const empIdSet = new Set<string>();

      // KPI 2: For MANAGER role, show projects managed by logged-in user
      if (userRole === "MANAGER") {
        // Get all projects managed by this user
        const managedProjects = await projectService.getAll();
        let userManagedProjects = managedProjects.filter(
          (project: ProjectRecord) =>
            project.projectManager?.employeeId === (user.employeeId || user.id),
        );

        // Filter by selected project if not "all"
        if (selectedProject && selectedProject !== "all") {
          userManagedProjects = userManagedProjects.filter(
            (project: ProjectRecord) => project.projectId === selectedProject,
          );
        }

        // Get allocations for these projects
        allocations = (await Promise.all(
          userManagedProjects.map(async (project: ProjectRecord) => {
            const projectAllocations = await flResourceService.getByProjectId(
              project._id!,
            );
            return projectAllocations;
          }),
        )).flat() as unknown as AllocationRecord[];
      } else if (userRole === "RMG") {
        // RMG can view all allocations across all projects
        // Fetch all FLResource allocations
        try {
          allocations = await flResourceService.getAll() as unknown as AllocationRecord[];
        } catch {
          allocations = [];
        }
      } else {
        // For EMPLOYEE role, use their own allocations
        const employeeId = user.employeeId || user.id;
        allocations = await flResourceService.getByEmployeeId(employeeId) as unknown as AllocationRecord[];
        empIdSet.add(employeeId);
      }

      // Filter by selected project (for RMG only, MANAGER filtered above)
      if (
        userRole === "RMG" &&
        selectedProject &&
        selectedProject !== "all" &&
        selectedProject !== ""
      ) {
        allocations = allocations.filter(
          (alloc: AllocationRecord) =>
            alloc.projectId === selectedProject ||
            alloc.projectCode === selectedProject,
        );
      }

      // Filter by date range - only show allocations that overlap with selected date range
      if (startDate && endDate) {
        const filterStartDate = new Date(startDate);
        const filterEndDate = new Date(endDate);

        allocations = allocations.filter((alloc: AllocationRecord) => {
          // Handle multiple possible date field names from flresource table
          const allocStartStr =
            alloc.startDate ||
            alloc.expectedStartDate ||
            alloc.requestedFromDate;
          const allocEndStr =
            alloc.endDate || alloc.expectedEndDate || alloc.requestedToDate;

          if (!allocStartStr || !allocEndStr) {
            return false;
          }

          const allocStart = new Date(allocStartStr);
          const allocEnd = new Date(allocEndStr);

          // Check if allocation overlaps with filter date range
          // Overlap occurs if: allocStart <= filterEnd AND allocEnd >= filterStart
          const overlaps =
            allocStart <= filterEndDate && allocEnd >= filterStartDate;

          return overlaps;
        });
      }

      // Calculate employee allocation counts
      const uniqueEmployees = new Set(
        allocations.map((alloc: AllocationRecord) => alloc.employeeId),
      );
      const totalEmployees =
        userRole === "EMPLOYEE" ? 1 : reportData.length || uniqueEmployees.size;
      const allocatedEmployees = uniqueEmployees.size;
      const benchEmployees = Math.max(0, totalEmployees - allocatedEmployees);

      setEmployeeAllocationCounts({
        total: totalEmployees,
        allocated: allocatedEmployees,
        bench: benchEmployees,
      });

      // Transform to chart format
      const projectMap: Record<string, { projectName: string; hours: number; startDate: string; endDate: string; color: string }> = {};
      let totalHours = 0;

      allocations.forEach((alloc: AllocationRecord) => {
        const projectKey = alloc.projectCode || alloc.projectId || 'unknown';
        if (!projectMap[projectKey]) {
          projectMap[projectKey] = {
            projectName:
              alloc.projectName || alloc.projectCode || alloc.projectId || 'Unknown',
            hours: 0,
            startDate:
              String(alloc.startDate || '') ||
              alloc.expectedStartDate ||
              alloc.requestedFromDate ||
              new Date().toISOString().split("T")[0],
            endDate:
              String(alloc.endDate || '') ||
              alloc.expectedEndDate ||
              alloc.requestedToDate ||
              new Date().toISOString().split("T")[0],
            color: generateProjectColor(
              alloc.projectName || alloc.projectCode || alloc.projectId || 'Unknown',
            ),
          };
        }
        const hours = Number.parseFloat(
          String(alloc.totalAllocation || alloc.allocation || 0),
        );
        projectMap[projectKey].hours += hours;
        totalHours += hours;
      });

      // Convert to array and calculate percentages
      const projectData = Object.values(projectMap)
        .map((proj) => ({
          ...proj,
          hours: Math.round(proj.hours),
          percentage: totalHours > 0 ? (proj.hours / totalHours) * 100 : 0,
        }))
        .filter((p) => p.hours > 0);

      // Calculate total allocated percentage
      const totalPercentage = projectData.reduce(
        (sum: number, proj: { percentage: number }) => sum + proj.percentage,
        0,
      );

      // Add Bench project if total is less than 100%
      if (totalPercentage < 100 && totalPercentage > 0) {
        const benchPercentage = 100 - totalPercentage;
        projectData.push({
          projectName: "Bench",
          hours: 0,
          percentage: benchPercentage,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          color: CHART_COLORS.slateLight,
        });
      }

      // If no allocations match the date filter, show 100% Bench
      if (projectData.length === 0) {
        setProjectAllocations([
          {
            projectName: "Bench",
            hours: 0,
            percentage: 100,
            startDate: startDate || new Date().toISOString().split("T")[0],
            endDate: endDate || new Date().toISOString().split("T")[0],
            color: CHART_COLORS.gray,
          },
        ]);
      } else {
        setProjectAllocations(projectData);
      }
    } catch {
      // On error, show 100% Bench instead of sample data
      setProjectAllocations([
        {
          projectName: "Bench",
          hours: 0,
          percentage: 100,
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate: endDate || new Date().toISOString().split("T")[0],
          color: CHART_COLORS.gray,
        },
      ]);
    }
  };

  // Helper function to calculate working days (excluding weekends)
  const calculateWorkingDays = (start: string, end: string): number => {
    if (!start || !end) return 0;

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const workingDays = allDays.filter((day) => {
        const dayOfWeek = getDay(day);
        return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Sunday, 6 = Saturday
      });

      return workingDays.length;
    } catch {
      return 0;
    }
  };

  // Load approval status from report summary
  const loadApprovalStatus = () => {
    try {
      if (!reportData || reportData.length === 0) {
        setApprovalStatusData([]);
        return;
      }

      // Calculate totalFilteredAllocation based on working days * 8 hours/day * number of employees
      // This gives realistic allocation based on actual working days (excluding weekends)
      const workingDays = calculateWorkingDays(startDate, endDate);
      const employeeCount = reportData.length;
      const totalFilteredAllocation = workingDays * 8 * employeeCount;

      const totalApprovedHours = reportData.reduce(
        (sum, emp) => sum + emp.approvedHours,
        0,
      );

      const totalPendingHours = reportData.reduce(
        (sum, emp) => sum + emp.pendingApprovedHours,
        0,
      );

      const totalRevisionRequestedHours = reportData.reduce(
        (sum, emp) => sum + (emp.revisionRequestedHours || 0),
        0,
      );

      const totalRejectedHours = reportData.reduce(
        (sum, emp) => sum + (emp.rejectedHours || 0),
        0,
      );

      const totalActualHours = reportData.reduce(
        (sum, emp) => sum + emp.actualHours,
        0,
      );

      // Calculate Not Submitted = allocated - actual worked hours
      const notSubmitted = Math.max(
        0,
        totalFilteredAllocation - totalActualHours,
      );

      const statusData = [
        {
          name: "Approved",
          value: Math.round(totalApprovedHours * 10) / 10,
          color: CHART_COLORS.green,
        },
        {
          name: "Pending for Approval",
          value: Math.round(totalPendingHours * 10) / 10,
          color: CHART_COLORS.orange,
        },
        {
          name: "Revision Requested",
          value: Math.round(totalRevisionRequestedHours * 10) / 10,
          color: "#f59e0b", // amber-500
        },
        {
          name: "Rejected",
          value: Math.round(totalRejectedHours * 10) / 10,
          color: CHART_COLORS.red,
        },
        {
          name: "Not Submitted",
          value: Math.round(notSubmitted * 10) / 10,
          color: CHART_COLORS.slateLight,
        },
      ].filter((item) => item.value > 0);

      setApprovalStatusData(statusData);
    } catch {
      setApprovalStatusData([]);
    }
  };

  // Load report data
  const loadReport = async () => {
    if (!user) {
      toast.error("User information not available");
      return;
    }

    // RMG no longer requires project selection - show month-wise data for all employees

    setIsLoading(true);
    try {
      const filters: ReportFilters = {
        role: userRole as "EMPLOYEE" | "RMG" | "MANAGER",
        // Only send month if using custom month filter (not when using date ranges)
        month:
          dateRangeType === "custom" && selectedMonth
            ? selectedMonth
            : undefined,
        employeeId:
          userRole === "EMPLOYEE" ? user.employeeId || user.id : undefined,
        managerId:
          userRole === "MANAGER" ? user.employeeId || user.id : undefined,
        projectId:
          selectedProject && selectedProject !== "all" && selectedProject !== ""
            ? selectedProject
            : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        department:
          selectedDepartment && selectedDepartment !== "all"
            ? selectedDepartment
            : undefined,
      };

      const response = await employeeHoursReportService.getReport(filters);

      setReportData(response.employees);
      setCurrentPage(1); // Reset to first page on new data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load report");
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique employees list for dropdown
  const employeesList = useMemo(() => {
    const uniqueEmployees = reportData.map((emp) => ({
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
    }));
    // Remove duplicates
    const seen = new Set();
    return uniqueEmployees.filter((emp) => {
      if (seen.has(emp.employeeId)) return false;
      seen.add(emp.employeeId);
      return true;
    }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [reportData]);

  // Filter data by search query and selected employee
  const filteredData = reportData.filter(
    (emp) => {
      // Filter by selected employee
      if (selectedEmployee && selectedEmployee !== "all") {
        if (emp.employeeId !== selectedEmployee) return false;
      }
      // Filter by search query
      return (
        emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  /**
   * Data Transformations for Redesigned Charts
   */


  // 1. Allocation Summary (Pie chart showing project allocation percentages)
  const redesignedAllocationSummaryData = useMemo(() => {
    if (!projectAllocations || projectAllocations.length === 0) return [];

    // Group by project and calculate percentages
    const totalPercentage = projectAllocations.reduce(
      (sum, proj) => sum + (proj.percentage || 0),
      0,
    );

    return projectAllocations
      .filter((proj) => proj.projectName !== "Bench" && proj.percentage > 0)
      .map((proj) => ({
        name: proj.projectName,
        value: Math.round(proj.percentage * 10) / 10,
        color: proj.color || generateProjectColor(proj.projectName),
      }))
      .concat(
        totalPercentage < 100
          ? [
              {
                name: "Bench",
                value: Math.round((100 - totalPercentage) * 10) / 10,
                color: CHART_COLORS.gray,
              },
            ]
          : [],
      )
      .filter((item) => item.value > 0);
  }, [projectAllocations]);

  // 2b. Weekly Project Allocation Data
  // 2b. Monthly Daily Allocation Data - Day-by-Day Segments
  const monthlyDailyAllocationData = useMemo(() => {
    if (!startDate || !endDate || projectAllocations.length === 0) {
      return [];
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Generate all days in the selected month/date range
      const allDays = eachDayOfInterval({ start, end });

      // Default color for days before any allocation
      const DEFAULT_COLOR = "#cbd5e1"; // slate-300
      const BENCH_COLOR = "#9ca3af"; // gray-400

      // Sort project allocations by start date
      const sortedAllocations = [...projectAllocations]
        .filter((proj) => proj.projectName !== "Bench")
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );

      // Find the first allocation start date
      const firstAllocationDate =
        sortedAllocations.length > 0
          ? new Date(sortedAllocations[0].startDate)
          : null;

      // Find the last allocation end date
      const lastAllocationDate =
        sortedAllocations.length > 0
          ? new Date(sortedAllocations[sortedAllocations.length - 1].endDate)
          : null;

      // Map each day to its appropriate segment
      const dailySegments = allDays.map((day) => {
        const dayDate = day.toISOString().split("T")[0];

        // Check if day is before first allocation
        if (firstAllocationDate && day < firstAllocationDate) {
          return {
            date: dayDate,
            projectName: null,
            color: DEFAULT_COLOR,
            allocationStart: null,
            allocationEnd: null,
          };
        }

        // Check if day is after last allocation
        if (lastAllocationDate && day > lastAllocationDate) {
          return {
            date: dayDate,
            projectName: "Bench",
            color: BENCH_COLOR,
            allocationStart: null,
            allocationEnd: null,
          };
        }

        // Find which project(s) this day belongs to
        const activeAllocations = sortedAllocations.filter((proj) => {
          const projStart = new Date(proj.startDate);
          const projEnd = new Date(proj.endDate);
          return day >= projStart && day <= projEnd;
        });

        // If day falls within an allocation period
        if (activeAllocations.length > 0) {
          // Use the first matching allocation (or could use most recent)
          const allocation = activeAllocations[0];
          return {
            date: dayDate,
            projectName: allocation.projectName,
            color:
              allocation.color || generateProjectColor(allocation.projectName),
            allocationStart: allocation.startDate,
            allocationEnd: allocation.endDate,
          };
        }

        // If no allocation found for this day (gap between allocations)
        return {
          date: dayDate,
          projectName: "Bench",
          color: BENCH_COLOR,
          allocationStart: null,
          allocationEnd: null,
        };
      });

      // Merge consecutive segments with the same project
      const mergedSegments: Array<{
        startDate: string;
        endDate: string;
        projectName: string | null;
        color: string;
        allocationStart: string | null;
        allocationEnd: string | null;
        dayCount: number;
      }> = [];

      dailySegments.forEach((segment) => {
        const lastMerged = mergedSegments[mergedSegments.length - 1];

        // Check if we can merge with the previous segment
        const canMerge =
          lastMerged &&
          lastMerged.projectName === segment.projectName &&
          lastMerged.color === segment.color;

        if (canMerge) {
          // Extend the end date and increment day count
          lastMerged.endDate = segment.date;
          lastMerged.dayCount += 1;
        } else {
          // Start a new merged segment
          mergedSegments.push({
            startDate: segment.date,
            endDate: segment.date,
            projectName: segment.projectName,
            color: segment.color,
            allocationStart: segment.allocationStart,
            allocationEnd: segment.allocationEnd,
            dayCount: 1,
          });
        }
      });

      return mergedSegments;
    } catch {
      return [];
    }
  }, [projectAllocations, startDate, endDate]);

  // Calculate average allocated projects (kept for compatibility)
  const averageAllocatedProjects = useMemo(() => {
    if (monthlyDailyAllocationData.length === 0) return "0.0";

    const allocatedDays = monthlyDailyAllocationData.filter(
      (day) => day.projectName && day.projectName !== "Bench",
    );

    const uniqueProjects = new Set(allocatedDays.map((day) => day.projectName));

    return uniqueProjects.size.toFixed(1);
  }, [monthlyDailyAllocationData]);

  // 3. Approval Status (From TimesheetEntries table)
  const redesignedStatusData = useMemo(() => {
    return approvalStatusData;
  }, [approvalStatusData]);

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Export to CSV
  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Email",
      "Department",
      "Allocation Hours",
      "Actual Billable Hours",
      "Actual Non-Billable Hours",
      "Billable Approved Hours",
      "Non-Billable Approved Hours",
      "Actual Hours",
      "Approved Hours",
    ];

    const rows = reportData.map((emp) => [
      emp.employeeId,
      emp.employeeName,
      emp.email,
      emp.department,
      emp.allocationHours,
      emp.actualBillableHours,
      emp.actualNonBillableHours,
      emp.billableApprovedHours,
      emp.nonBillableApprovedHours,
      emp.actualHours,
      emp.approvedHours,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateLabel =
      startDate && endDate
        ? `${startDate}_to_${endDate}`
        : format(new Date(), "yyyy-MM");
    link.download = `employee_hours_report_${dateLabel}.csv`;
    link.click();
    globalThis.URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        icon={FileText}
        title="Productivity & Hours Dashboard"
        description={userRole === "EMPLOYEE"
          ? "View your productivity and hours with flexible date ranges"
          : "View productivity and hours dashboard with flexible date ranges and filters"}
        actions={
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Search Bar and Project Filter - Only show for RMG/Manager */}
      {canSeeFilters && reportData.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Label htmlFor="projectFilter" className="text-sm font-medium whitespace-nowrap">
              Project:
            </Label>
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
              }}
            >
              <SelectTrigger id="projectFilter" className="w-[220px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && selectedProject !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProject("all")}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Employee Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Label htmlFor="employeeFilter" className="text-sm font-medium whitespace-nowrap">
              Employee:
            </Label>
            <Select
              value={selectedEmployee}
              onValueChange={(value) => {
                setSelectedEmployee(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="employeeFilter" className="w-[220px]">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employeesList.map((emp) => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmployee && selectedEmployee !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmployee("all")}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Badge variant="outline">{filteredData.length} employees</Badge>
        </div>
      )}

      {/* Analytics & Detailed Report - Tabbed Interface */}
      {reportData.length > 0 && (
        <div className="space-y-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="overview" className="gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Overview & Analytics
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Detailed Report
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Label htmlFor="dateRangeTop" className="text-sm font-medium">
                  Date Range:
                </Label>
                <div className="relative">
                  <Select
                    value={dateRangeType}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setTempStartDate(
                          startDate || format(new Date(), "yyyy-MM-dd"),
                        );
                        setTempEndDate(
                          endDate || format(new Date(), "yyyy-MM-dd"),
                        );
                        setCustomDatePopoverOpen(true);
                      } else {
                        setDateRangeType(value);
                        setSelectedMonth("");
                      }
                    }}
                  >
                    <SelectTrigger id="dateRangeTop" className="w-[240px]">
                      <SelectValue placeholder="Select date range">
                        {dateRangeType === "custom" && startDate && endDate
                          ? `${format(new Date(startDate), "MMM dd")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
                          : dateRangeType === "current_week" && startDate && endDate
                            ? `Current Week (${format(new Date(startDate), "MMM dd")} - ${format(new Date(endDate), "MMM dd")})`
                            : dateRangeType === "current_week"
                              ? "Current Week"
                              : dateRangeType === "current_month" && startDate && endDate
                                ? `Current Month (${format(new Date(startDate), "MMM yyyy")})`
                                : dateRangeType === "current_month"
                                  ? "Current Month"
                                  : dateRangeType === "last_3_months"
                                    ? "Last 3 Months"
                                    : dateRangeType === "last_6_months"
                                      ? "Last 6 Months"
                                  : dateRangeType === "last_year"
                                    ? "Last Year"
                                    : "Select date range"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current_week">Current Week</SelectItem>
                      <SelectItem value="current_month">Current Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Custom Date Range Picker */}
                  {customDatePopoverOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => {
                          setCustomDatePopoverOpen(false);
                          setTempStartDate("");
                          setTempEndDate("");
                        }}
                      />
                      {/* Date Picker Panel */}
                      <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border p-4 space-y-4 min-w-[600px]">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Select Custom Date Range</h4>
                          <p className="text-xs text-muted-foreground">
                            Choose the start and end dates for your report
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Start Date</Label>
                            <Calendar
                              selected={tempStartDate ? new Date(tempStartDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setTempStartDate(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              disabled={(date) => isAfter(date, new Date())}
                              className="rounded-md border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">End Date</Label>
                            <Calendar
                              selected={tempEndDate ? new Date(tempEndDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setTempEndDate(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              disabled={(date) => {
                                if (isAfter(date, new Date())) return true;
                                if (tempStartDate && isBefore(date, new Date(tempStartDate))) return true;
                                return false;
                              }}
                              className="rounded-md border"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomDatePopoverOpen(false);
                              setTempStartDate("");
                              setTempEndDate("");
                              setDateRangeType("current_month");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (tempStartDate && tempEndDate) {
                                setStartDate(tempStartDate);
                                setEndDate(tempEndDate);
                                setDateRangeType("custom");
                                setCustomDatePopoverOpen(false);
                              } else {
                                toast.error("Please select both start and end dates");
                              }
                            }}
                            disabled={!tempStartDate || !tempEndDate}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {dateRangeType !== "current_week" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRangeType("current_week");
                      const today = new Date();
                      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
                      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
                      setStartDate(format(weekStart, "yyyy-MM-dd"));
                      setEndDate(format(weekEnd, "yyyy-MM-dd"));
                      setSelectedMonth("");
                      setCustomDatePopoverOpen(false);
                      setTempStartDate("");
                      setTempEndDate("");
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Overview Tab with Charts */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Second Row: Allocation Summary and Approval Status - 50% each */}
              <div className="flex lg:flex-row gap-4 items-stretch">
                {/* Chart 1: Allocation Summary - 50% */}
                <Card className="w-[25%] shadow-sm bg-white overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">
                          Allocation Summary
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Total allocation percentage
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex-1 flex items-center justify-center">
                    <AllocationSummaryChart
                      data={redesignedAllocationSummaryData}
                      employeeCount={employeeAllocationCounts.total}
                      allocatedCount={employeeAllocationCounts.allocated}
                      benchCount={employeeAllocationCounts.bench}
                      averageProjects={averageAllocatedProjects}
                    />
                  </CardContent>
                </Card>
                <div className="w-[75%] flex gap-4">
                  {/* First Row: Project Allocations - Full Width */}
                  <Card className="w-[65%] shadow-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800">
                            Project Allocations
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Daily allocation timeline for selected month
                          </CardDescription>
                        </div>

                        <Badge variant="outline" className="bg-white">
                          {startDate && endDate
                            ? `${format(new Date(startDate), "MMM yyyy")}`
                            : "Select Month"}
                        </Badge>
                      </div>
                    </CardHeader>

                    {/* IMPORTANT: make this flex-col + flex-1 for correct height */}
                    <CardContent className="pt-2 flex flex-col flex-1">
                      <div className="w-full min-w-full flex flex-col h-full">
                        {/* 🔥 BOTTOM ALIGN CHILD USING mt-auto */}
                        <div className="mt-auto w-full pb-20">
                          <MonthlyDailyAllocationChart
                            dailyData={monthlyDailyAllocationData}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Chart 2: Approval Status - 50% */}
                  <Card className="w-[35%] shadow-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="pb-3">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">
                          Approval Status{" "}
                          {userRole === "MANAGER" && "(Aggregated)"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {userRole === "MANAGER"
                            ? "Total approval breakdown - see employee details below"
                            : "Approval lifecycle breakdown"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 flex-1">
                      <ApprovalStatusDoughnut
                        data={redesignedStatusData}
                        reportData={reportData}
                        userRole={userRole}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Employee-wise Approval Status for MANAGER */}
              {userRole === "MANAGER" && reportData.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-800">
                      Employee-wise Approval Status
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Detailed approval breakdown for each employee
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="whitespace-nowrap">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead className="text-right">
                              Allocated
                            </TableHead>
                            <TableHead className="text-right">
                              Approved
                            </TableHead>
                            <TableHead className="text-right">
                              Pending
                            </TableHead>
                            <TableHead className="text-right">
                              Revision
                            </TableHead>
                            <TableHead className="text-right">
                              Rejected
                            </TableHead>
                            <TableHead className="text-right">
                              Not Submitted
                            </TableHead>
                            <TableHead className="text-center">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((emp) => {
                            const notSubmitted = Math.max(
                              0,
                              emp.allocationHours - emp.actualHours,
                            );
                            const rejectedHours = emp.rejectedHours || 0;
                            const revisionRequestedHours =
                              emp.revisionRequestedHours || 0;
                            return (
                              <TableRow key={emp.employeeId}>
                                <TableCell className="font-medium">
                                  {emp.employeeName}
                                </TableCell>
                                <TableCell className="text-right">
                                  {emp.allocationHours}h
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    {emp.approvedHours}h
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    {emp.pendingApprovedHours}h
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    {revisionRequestedHours}h
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700 border-red-200"
                                  >
                                    {rejectedHours}h
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-50 text-slate-700 border-slate-200"
                                  >
                                    {notSubmitted.toFixed(1)}h
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {emp.approvedHours === emp.allocationHours ? (
                                    <Badge className="bg-green-500">
                                      Complete
                                    </Badge>
                                  ) : emp.pendingApprovedHours > 0 ? (
                                    <Badge className="bg-orange-500">
                                      Pending
                                    </Badge>
                                  ) : revisionRequestedHours > 0 ? (
                                    <Badge className="bg-amber-500">
                                      Revision
                                    </Badge>
                                  ) : rejectedHours > 0 ? (
                                    <Badge className="bg-red-500">
                                      Rejected
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">In Progress</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Timesheet View - Only for EMPLOYEE */}
              {userRole === "EMPLOYEE" && (
                <div className="mt-6">
                  <style>{`
                  /* Hide Weekly Timesheet header, description, tabs, and action buttons for report view */
                  /* Hide the main header title and description */
                  .weekly-timesheet-report-view .page-header-content h1,
                  .weekly-timesheet-report-view .page-header-content p.page-description,
                  .weekly-timesheet-report-view .page-title {
                    display: none !important;
                  }
                  
                  /* Hide My Timesheet and Approval tabs in report view */
                  .weekly-timesheet-report-view [role="tablist"] {
                    display: none !important;
                  }
                  
                  /* Hide all action buttons in the tabs row */
                  .weekly-timesheet-report-view .flex.items-center.gap-3 button {
                    display: none !important;
                  }
                  
                  /* Hide delete buttons in Category Assignment dialog */
                  .weekly-timesheet-report-view .category-delete-btn {
                    display: none !important;
                  }
                  
                  /* Hide empty row for adding categories in Category Assignment dialog */
                  .weekly-timesheet-report-view .category-empty-row {
                    display: none !important;
                  }
                  
                  /* Keep the tab content visible */
                  .weekly-timesheet-report-view [role="tabpanel"] {
                    display: block !important;
                  }
                  
                  /* Make timesheet read-only in report view */
                  .weekly-timesheet-report-view input,
                  .weekly-timesheet-report-view textarea,
                  .weekly-timesheet-report-view select {
                    pointer-events: none !important;
                    opacity: 0.8;
                    cursor: not-allowed;
                  }
                `}</style>
                  <div className="weekly-timesheet-report-view">
                    <WeeklyTimesheet />
                  </div>
                </div>
              )}
            </TabsContent>
            {/* Details Tab with Table */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Report</CardTitle>
                  <CardDescription>
                    {startDate && endDate
                      ? `${format(new Date(startDate), "MMMM dd, yyyy")} - ${format(new Date(endDate), "MMMM dd, yyyy")}`
                      : "Select a date range to view report"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {!isLoading && reportData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No data available
                      </h3>
                      <p className="text-muted-foreground">
                        No hours data found for the selected month
                      </p>
                    </div>
                  )}

                  {!isLoading &&
                    reportData.length > 0 &&
                    paginatedData.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No results found
                        </h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search query
                        </p>
                      </div>
                    )}

                  {!isLoading && paginatedData.length > 0 && (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table className="whitespace-nowrap">
                          <TableHeader>
                            <TableRow>
                              {canSeeFilters && (
                                <>
                                  <TableHead>Employee ID</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Department</TableHead>
                                  <TableHead>Project</TableHead>
                                </>
                              )}
                              <TableHead className="text-right">
                                Allocation
                              </TableHead>
                              <TableHead className="text-right">
                                Actual Billable
                              </TableHead>
                              <TableHead className="text-right">
                                Actual Non-Billable
                              </TableHead>
                              <TableHead className="text-right">
                                Billable Approved
                              </TableHead>
                              <TableHead className="text-right">
                                Non-Billable Approved
                              </TableHead>
                              <TableHead className="text-right">
                                Actual Hours
                              </TableHead>
                              <TableHead className="text-right">
                                Approved Hours
                              </TableHead>
                              <TableHead className="text-right">
                                Pending Approved
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedData.map((emp) => (
                              <TableRow key={emp.employeeId}>
                                {canSeeFilters && (
                                  <>
                                    <TableCell className="font-mono text-sm whitespace-nowrap">
                                      {emp.employeeId}
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">
                                      {emp.employeeName}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {emp.department || "-"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-sm">
                                      {emp.projectName || "-"}
                                    </TableCell>
                                  </>
                                )}
                                <TableCell className="text-right whitespace-nowrap">
                                  {emp.allocationHours}
                                </TableCell>
                                <TableCell className="text-right text-blue-600 font-semibold whitespace-nowrap">
                                  {emp.actualBillableHours}
                                </TableCell>
                                <TableCell className="text-right text-orange-600 font-semibold whitespace-nowrap">
                                  {emp.actualNonBillableHours}
                                </TableCell>
                                <TableCell className="text-right text-green-600 font-semibold whitespace-nowrap">
                                  {emp.billableApprovedHours}
                                </TableCell>
                                <TableCell className="text-right text-emerald-600 font-semibold whitespace-nowrap">
                                  {emp.nonBillableApprovedHours}
                                </TableCell>
                                <TableCell className="text-right text-indigo-600 font-bold whitespace-nowrap">
                                  {emp.actualHours}
                                </TableCell>
                                <TableCell className="text-right text-teal-600 font-bold whitespace-nowrap">
                                  {emp.approvedHours}
                                </TableCell>
                                <TableCell className="text-right text-yellow-600 font-bold whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <span>{emp.pendingApprovedHours}</span>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          className="p-1 rounded hover:bg-yellow-50 text-yellow-600"
                                          aria-label="View pending details"
                                        >
                                          <Info className="h-4 w-4" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-72">
                                        <div className="text-sm font-semibold mb-2">
                                          Pending details
                                        </div>
                                        {emp.pendingDetails &&
                                        emp.pendingDetails.length > 0 ? (
                                          <div className="space-y-3 max-h-60 overflow-auto">
                                            {emp.pendingDetails.map(
                                              (item: { date: string; projectName: string; projectId: string; projectManagerName: string }, index: number) => (
                                                <div
                                                  key={`${emp.employeeId}-${index}`}
                                                  className="text-xs"
                                                >
                                                  <div className="font-semibold text-slate-700">
                                                    {format(
                                                      new Date(item.date),
                                                      "dd MMM yyyy",
                                                    )}
                                                  </div>
                                                  <div className="text-slate-500">
                                                    {item.projectName} (
                                                    {item.projectId})
                                                  </div>
                                                  <div className="text-slate-500">
                                                    Manager:{" "}
                                                    {item.projectManagerName}
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-slate-500">
                                            No pending entries
                                          </div>
                                        )}
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredData.length,
                            )}{" "}
                            of {filteredData.length} employees
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <span className="text-sm">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State when no data */}
      {!isLoading && reportData.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data available</h3>
              <p className="text-muted-foreground mb-2">
                No hours data found for the selected criteria
              </p>
              {startDate && endDate && (
                <p className="text-xs text-muted-foreground">
                  Date range: {format(new Date(startDate), "MMM dd, yyyy")} - {format(new Date(endDate), "MMM dd, yyyy")}
                </p>
              )}
              {userRole === "RMG" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Try selecting a different date range or project
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeHoursReport;
