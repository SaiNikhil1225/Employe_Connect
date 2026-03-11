import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from '@/components/ui/page-header';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Users,
  User,
  Filter,
  Network,
  Mail,
  Building2,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GitBranch,
  Phone,
  Calendar,
  Columns3,
} from "lucide-react";
import { Tree, TreeNode } from "react-organizational-chart";
import { useEmployeeStore } from "@/store/employeeStore";
import { useAuthStore } from "@/store/authStore";
import type { Employee } from "@/services/employeeService";
import { employeeService } from "@/services/employeeService";
import { cn } from "@/lib/utils";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getOrganizationTree,
  type OrganizationTree,
  type DirectReport,
} from "@/services/managerAssignmentService";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    [],
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>(
    [],
  );
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [allocationDateFrom, setAllocationDateFrom] = useState<Date | undefined>(undefined);
  const [allocationDateTo, setAllocationDateTo] = useState<Date | undefined>(undefined);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const [allocations, setAllocations] = useState<Map<string, number>>(
    new Map(),
  );
  const [allocationDetails, setAllocationDetails] = useState<Map<string, Array<{
    projectId: string;
    projectName: string;
    utilizationPercentage: number;
    fromDate: string;
    toDate: string;
    billable: boolean;
  }>>>(new Map());

  // Column visibility for RMG table view
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    designation: true,
    department: true,
    reportingManagerName: true,
    allocation: true,
  });

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [activeTab, setActiveTab] = useState("directory");
  const [orgTree, setOrgTree] = useState<OrganizationTree | null>(null);
  const [loadingOrgTree, setLoadingOrgTree] = useState(false);
  const [, setShowDirectReports] = useState(false);
  const [showReportingManagerReports, setShowReportingManagerReports] =
    useState(false);
  const [expandedDirectReports, setExpandedDirectReports] = useState<
    Set<string>
  >(new Set());
  const [reportingManagerTree, setReportingManagerTree] =
    useState<OrganizationTree | null>(null);
  const [directReportTrees, setDirectReportTrees] = useState<
    Map<string, OrganizationTree>
  >(new Map());
  const [zoomLevel, setZoomLevel] = useState(0.5); // Start at 50% to see more employees
  const [orgChartView, setOrgChartView] = useState<"me" | "department" | "top">(
    "me",
  );
  const orgTreeRef = useRef<HTMLDivElement>(null);
  const orgChartRef = useRef<HTMLDivElement>(null);

  // Generate unique color for each employee based on their ID
  const getAvatarColor = (id: string) => {
    const colors = [
      "#8B5CF6", // Purple
      "#EC4899", // Pink
      "#F59E0B", // Amber
      "#10B981", // Emerald
      "#3B82F6", // Blue
      "#EF4444", // Red
      "#14B8A6", // Teal
      "#F97316", // Orange
      "#6366F1", // Indigo
      "#84CC16", // Lime
      "#06B6D4", // Cyan
      "#A855F7", // Violet
    ];
    // Generate a consistent index from the ID
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.max(0.1, Math.min(2, prev + delta)));
    }
  };

  // Native wheel event handler for better browser compatibility
  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel((prev) => Math.max(0.1, Math.min(2, prev + delta)));
      }
    };

    const orgTreeElement = orgTreeRef.current;
    const orgChartElement = orgChartRef.current;

    if (orgTreeElement) {
      orgTreeElement.addEventListener("wheel", handleNativeWheel, {
        passive: false,
      });
    }
    if (orgChartElement) {
      orgChartElement.addEventListener("wheel", handleNativeWheel, {
        passive: false,
      });
    }

    return () => {
      if (orgTreeElement) {
        orgTreeElement.removeEventListener("wheel", handleNativeWheel);
      }
      if (orgChartElement) {
        orgChartElement.removeEventListener("wheel", handleNativeWheel);
      }
    };
  }, []);

  // Check if we're in RMG module
  const isRMGModule = location.pathname.includes("/rmg/");

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Set default department filter to user's department
  useEffect(() => {
    if (
      user?.employeeId &&
      employees.length > 0 &&
      selectedDepartments.length === 0
    ) {
      const currentEmployee = employees.find(
        (emp) => emp.employeeId === user.employeeId,
      );
      if (currentEmployee?.department) {
        console.log(
          `[Default Filter] Setting department filter to: ${currentEmployee.department}`,
        );
        setSelectedDepartments([currentEmployee.department]);
      }
    }
  }, [user, employees, selectedDepartments.length]);

  // Fetch allocations when in RMG module
  useEffect(() => {
    const fetchAllocations = async () => {
      if (isRMGModule) {
        try {
          const allocationData = await employeeService.getAllocations();
          const allocationMap = new Map(
            allocationData.map((item) => [item.employeeId, item.allocation]),
          );
          setAllocations(allocationMap);
        } catch (error) {
          console.error("Failed to fetch allocations:", error);
        }
      }
    };
    fetchAllocations();
  }, [isRMGModule]);

  // Fetch allocation details (per-project) for RMG tooltip
  useEffect(() => {
    const fetchDetails = async () => {
      if (!isRMGModule) return;
      try {
        const details = await employeeService.getAllocationDetails();
        const detailsMap = new Map(
          details.map((item) => [item.employeeId, item.projects]),
        );
        setAllocationDetails(detailsMap);
      } catch (error) {
        console.error("Failed to fetch allocation details:", error);
      }
    };
    fetchDetails();
  }, [isRMGModule]);

  // Helper function to convert Employee to OrganizationTree Employee format
  const convertToTreeEmployee = (emp: Employee | undefined | null) => {
    if (!emp) return null;
    return {
      _id: emp._id || "",
      employeeId: emp.employeeId,
      id: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      profilePhoto: emp.profilePhoto,
      businessUnit: emp.businessUnit,
      location: emp.location,
    };
  };

  // Helper function to build DirectReport array for an employee
  const buildDirectReports = (managerId: string): DirectReport[] => {
    return employees
      .filter(
        (emp) =>
          emp.reportingManagerId === managerId && emp.status === "active",
      )
      .map((emp) => ({
        _id: emp._id || "",
        employeeId: emp.employeeId,
        employeeName: emp.name,
        reportingManagerId: emp.reportingManagerId,
        dottedLineManagerId: emp.dottedLineManagerId,
        relationship: "direct" as const,
        employee: convertToTreeEmployee(emp),
      }));
  };

  // Helper function to build OrganizationTree for a given employee ID
  const buildOrgTree = (employeeId: string): OrganizationTree | null => {
    const employee = employees.find((emp) => emp.employeeId === employeeId);
    if (!employee) return null;

    const reportingManager = employee.reportingManagerId
      ? employees.find((emp) => emp.employeeId === employee.reportingManagerId)
      : null;

    const dottedLineManager = employee.dottedLineManagerId
      ? employees.find((emp) => emp.employeeId === employee.dottedLineManagerId)
      : null;

    const directReports = buildDirectReports(employeeId);

    return {
      employee: convertToTreeEmployee(employee)!,
      reportingManager: convertToTreeEmployee(reportingManager),
      dottedLineManager: convertToTreeEmployee(dottedLineManager),
      directReports,
    };
  };

  // Find the top of organization (employee with no reporting manager)
  const findTopOfOrg = (): string | null => {
    // Look for HM001 (Alex Martinez) first as the organizational root
    const alexMartinez = employees.find(
      (emp) => emp.employeeId === "HM001" && emp.status === "active",
    );
    if (alexMartinez) {
      console.log("[findTopOfOrg] Found HM001 (Alex Martinez) as org root");
      return alexMartinez.employeeId;
    }

    // Fallback: find any employee with no manager
    const topEmployee = employees.find(
      (emp) => emp.status === "active" && !emp.reportingManagerId,
    );
    console.log(
      "[findTopOfOrg] Fallback - found:",
      topEmployee?.name,
      topEmployee?.employeeId,
    );
    return topEmployee?.employeeId || null;
  };

  // Get root employee ID based on view mode
  const getRootEmployeeId = (): string | null => {
    if (!user?.employeeId) return null;

    if (orgChartView === "me") {
      return user.employeeId;
    } else if (orgChartView === "top") {
      return findTopOfOrg();
    } else if (orgChartView === "department") {
      const currentUser = employees.find(
        (emp) => emp.employeeId === user.employeeId,
      );
      if (!currentUser?.department) return user.employeeId;

      // Find all employees in this department
      const deptEmployees = employees.filter(
        (emp) =>
          emp.status === "active" && emp.department === currentUser.department,
      );

      // Find all employees in department who report to managers outside the department
      const externalReportingEmployees = deptEmployees.filter((emp) => {
        if (!emp.reportingManagerId) return false; // Exclude employees with no manager
        const manager = employees.find(
          (m) => m.employeeId === emp.reportingManagerId,
        );
        return manager && manager.department !== currentUser.department;
      });

      // If there are multiple people reporting externally, find their common manager
      if (externalReportingEmployees.length > 0) {
        const managerId = externalReportingEmployees[0].reportingManagerId;

        // Check if they all report to the same external manager
        const allSameManager = externalReportingEmployees.every(
          (emp) => emp.reportingManagerId === managerId,
        );

        if (allSameManager && managerId) {
          // Return the common external manager - this way all department members at that level will show
          return managerId;
        }

        // Otherwise, return the first department head
        return externalReportingEmployees[0].employeeId;
      }

      // Fallback to first employee in department or current user
      return deptEmployees[0]?.employeeId || user.employeeId;
    }

    return user.employeeId;
  };

  // Build organization tree from employees array when tab is active
  useEffect(() => {
    const buildOrgTreeFromEmployees = () => {
      if (
        (activeTab === "org-tree" || activeTab === "org-chart") &&
        user?.employeeId &&
        employees.length > 0
      ) {
        setLoadingOrgTree(true);
        setShowDirectReports(false); // Reset expansion state
        setShowReportingManagerReports(true); // Auto-expand reporting manager's team on load
        setExpandedDirectReports(new Set());
        setReportingManagerTree(null);
        setDirectReportTrees(new Map());

        try {
          // Build tree based on selected view
          const rootEmployeeId = getRootEmployeeId();
          if (!rootEmployeeId) {
            console.error(
              "Could not determine root employee for view:",
              orgChartView,
            );
            setOrgTree(null);
            toast.error("Could not load organization tree");
            setLoadingOrgTree(false);
            return;
          }

          const tree = buildOrgTree(rootEmployeeId);
          if (tree && tree.employee) {
            setOrgTree(tree);

            if (orgChartView === "me") {
              // ME VIEW: Build reporting manager's org tree
              if (tree.reportingManager?.employeeId) {
                const rmTree = buildOrgTree(tree.reportingManager.employeeId);

                if (rmTree && rmTree.employee) {
                  setReportingManagerTree(rmTree);

                  // Build org trees for direct reports (peers)
                  const directReportsOnly =
                    rmTree.directReports?.filter(
                      (report) => report.relationship === "direct",
                    ) || [];

                  const newTrees = new Map<string, OrganizationTree>();
                  for (const report of directReportsOnly) {
                    if (report.employee?.employeeId || report.employee?.id) {
                      const empId =
                        (report.employee.employeeId || report.employee.id) as string;
                      const memberTree = buildOrgTree(empId);

                      if (memberTree?.employee) {
                        newTrees.set(empId, memberTree);
                      }
                    }
                  }
                  setDirectReportTrees(newTrees);
                }
              }
            } else {
              // DEPARTMENT/TOP VIEW: Recursively build trees for ALL employees in hierarchy
              const newTrees = new Map<string, OrganizationTree>();

              // Recursive function to build trees for an employee and all their subordinates
              const buildAllSubTrees = (empId: string) => {
                const empTree = buildOrgTree(empId);
                if (!empTree?.employee) {
                  console.log(`[BuildTrees] ❌ No tree for ${empId}`);
                  return;
                }

                // Store this employee's tree
                newTrees.set(empId, empTree);

                const directReportCount =
                  empTree.directReports?.filter(
                    (r) => r.relationship === "direct",
                  ).length || 0;
                console.log(
                  `[BuildTrees] ✅ ${empTree.employee.name} (${empId}), direct reports: ${directReportCount}`,
                );

                // Log each direct report
                if (empTree.directReports && empTree.directReports.length > 0) {
                  empTree.directReports
                    .filter((r) => r.relationship === "direct")
                    .forEach((report) => {
                      console.log(
                        `  └─ ${report.employee?.name} (${report.employee?.employeeId || report.employee?.id})`,
                      );
                    });
                }

                // Recursively build trees for all direct reports
                if (empTree.directReports && empTree.directReports.length > 0) {
                  for (const report of empTree.directReports) {
                    if (
                      report.relationship === "direct" &&
                      (report.employee?.employeeId || report.employee?.id)
                    ) {
                      const childEmpId =
                        (report.employee.employeeId || report.employee.id) as string;
                      buildAllSubTrees(childEmpId);
                    }
                  }
                }
              };

              // Start building trees based on view
              if (orgChartView === "top") {
                // TOP VIEW: Find ALL top-level employees (no manager) and build trees for each
                const topLevelEmployees = employees.filter(
                  (e) => e.status === "active" && !e.reportingManagerId,
                );
                console.log(
                  `[BuildTrees] Found ${topLevelEmployees.length} top-level employees`,
                );
                topLevelEmployees.forEach((emp) => {
                  console.log(
                    `[BuildTrees] Building tree for top-level: ${emp.name} (${emp.employeeId})`,
                  );
                  buildAllSubTrees(emp.employeeId);
                });
              } else {
                // DEPARTMENT VIEW: Build from the root employee
                if (tree.employee?.employeeId || tree.employee?.id) {
                  const rootEmpId =
                    (tree.employee.employeeId || tree.employee.id) as string;
                  buildAllSubTrees(rootEmpId);
                }
              }

              console.log(`[BuildTrees] Total trees built: ${newTrees.size}`);
              setDirectReportTrees(newTrees);
            }
          } else {
            console.error(
              "Could not build tree for employee:",
              user.employeeId,
            );
            setOrgTree(null);
            toast.error("Could not load organization tree");
          }
        } catch (error: unknown) {
          console.error("Failed to build organization tree:", error);
          toast.error("Failed to load organization tree");
          setOrgTree(null);
        } finally {
          setLoadingOrgTree(false);
        }
      }
    };
    buildOrgTreeFromEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.employeeId, employees, orgChartView]);

  // Handle fetching and toggling direct reports for any employee
  const toggleDirectReportsForEmployee = async (employeeId: string) => {
    if (expandedDirectReports.has(employeeId)) {
      // Collapse
      const newExpanded = new Set(expandedDirectReports);
      newExpanded.delete(employeeId);
      setExpandedDirectReports(newExpanded);
    } else {
      // Expand - ensure we have the tree and all child trees
      try {
        let parentTree = directReportTrees.get(employeeId);
        const newTrees = new Map(directReportTrees);

        // First, make sure we have THIS employee's tree
        if (!parentTree) {
          const tree = await getOrganizationTree(employeeId);
          if (tree && tree.employee) {
            parentTree = {
              employee: tree.employee,
              reportingManager: tree.reportingManager || null,
              dottedLineManager: tree.dottedLineManager || null,
              directReports: Array.isArray(tree.directReports)
                ? tree.directReports
                : [],
            };
            newTrees.set(employeeId, parentTree);
          }
        }

        // Auto-fetch org trees for direct reports to show their count badges
        if (parentTree?.directReports) {
          const directReportsOnly = parentTree.directReports.filter(
            (report) => report.relationship === "direct",
          );

          for (const report of directReportsOnly) {
            if (report.employee?.employeeId || report.employee?.id) {
              const empId = (report.employee.employeeId || report.employee.id) as string;
              if (!newTrees.has(empId)) {
                try {
                  const memberTree = await getOrganizationTree(empId);
                  if (memberTree?.employee) {
                    newTrees.set(empId, {
                      employee: memberTree.employee,
                      reportingManager: memberTree.reportingManager || null,
                      dottedLineManager: memberTree.dottedLineManager || null,
                      directReports: Array.isArray(memberTree.directReports)
                        ? memberTree.directReports
                        : [],
                    });
                  }
                } catch (err) {
                  console.error(
                    `[AUTO-FETCH] Failed to fetch tree for ${empId}:`,
                    err,
                  );
                }
              }
            }
          }
        }

        setDirectReportTrees(newTrees);
      } catch (error) {
        console.error(`Failed to fetch org tree for ${employeeId}:`, error);
        toast.error("Failed to load employee reports");
        return;
      }

      const newExpanded = new Set(expandedDirectReports);
      newExpanded.add(employeeId);
      setExpandedDirectReports(newExpanded);
    }
  };

  // Extract unique values for filters
  const businessUnits = Array.from(
    new Set(employees.map((emp) => emp.businessUnit).filter(Boolean)),
  );
  const departments = Array.from(
    new Set(employees.map((emp) => emp.department).filter(Boolean)),
  );
  const locations = Array.from(
    new Set(employees.map((emp) => emp.location).filter(Boolean)),
  );
  const designations = Array.from(
    new Set(employees.map((emp) => emp.designation).filter(Boolean)),
  );
  const experienceRanges = [
    "0-2 years",
    "2-5 years",
    "5-10 years",
    "10+ years",
  ];

  // Separate active and inactive employees
  const activeEmployees = employees.filter((emp) => emp.status === "active");

  // Filter employees based on search and all filters
  const filteredEmployees = activeEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBusinessUnit =
      selectedBusinessUnits.length === 0 ||
      selectedBusinessUnits.includes(emp.businessUnit);
    const matchesDepartment =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(emp.department);
    const matchesLocation =
      selectedLocations.length === 0 ||
      selectedLocations.includes(emp.location);
    const matchesDesignation =
      selectedDesignations.length === 0 ||
      selectedDesignations.includes(emp.designation);

    // Calculate total experience
    const previousYears =
      typeof emp.previousExperience === "number"
        ? emp.previousExperience
        : emp.previousExperience?.years || 0;
    const acuvateYears = emp.dateOfJoining
      ? Math.floor(
          (currentTime - new Date(emp.dateOfJoining).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        )
      : 0;
    const totalExperience = previousYears + acuvateYears;

    const matchesExperience =
      selectedExperiences.length === 0 ||
      selectedExperiences.some((range) => {
        if (range === "0-2 years") return totalExperience <= 2;
        if (range === "2-5 years")
          return totalExperience > 2 && totalExperience <= 5;
        if (range === "5-10 years")
          return totalExperience > 5 && totalExperience <= 10;
        if (range === "10+ years") return totalExperience > 10;
        return false;
      });

    const matchesDateRange = !isRMGModule || (() => {
      if (!allocationDateFrom && !allocationDateTo) return true;
      const projects = allocationDetails.get(emp.employeeId) || [];
      if (projects.length === 0) return false;
      const from = allocationDateFrom ?? new Date(0);
      const to = allocationDateTo ?? new Date(8640000000000000);
      return projects.some(proj => {
        if (!proj.fromDate || !proj.toDate) return false;
        const pFrom = new Date(proj.fromDate);
        const pTo = new Date(proj.toDate);
        return pFrom <= to && pTo >= from;
      });
    })();

    return (
      matchesSearch &&
      matchesBusinessUnit &&
      matchesDepartment &&
      matchesLocation &&
      matchesDesignation &&
      matchesExperience &&
      matchesDateRange
    );
  });

  // Count active filters
  const activeFilterCount =
    selectedBusinessUnits.length +
    selectedDepartments.length +
    selectedLocations.length +
    selectedDesignations.length +
    selectedExperiences.length +
    (allocationDateFrom ? 1 : 0) +
    (allocationDateTo ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBusinessUnits([]);
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedDesignations([]);
    setSelectedExperiences([]);
    setAllocationDateFrom(undefined);
    setAllocationDateTo(undefined);
  };

  // Toggle checkbox selection
  const toggleFilter = (
    value: string,
    selectedArray: string[],
    setterFunction: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (selectedArray.includes(value)) {
      setterFunction(selectedArray.filter((item) => item !== value));
    } else {
      setterFunction([...selectedArray, value]);
    }
  };

  // Format date helper for birthday
  const formatBirthday = (dateStr?: string) => {
    if (!dateStr) return "Not specified";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Not specified";
    }
  };

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    const actualStatus = status || "active";
    return actualStatus.toLowerCase() === "active"
      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400"
      : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400";
  };

  // Card view - no table code needed

  return (
    <div className="page-container">
      <PageHeader
        icon={Users}
        title="Employee Directory"
        description="Browse employee profiles and information"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!isRMGModule && (
          <TabsList className="grid w-full max-w-[32rem] grid-cols-2 mb-6">
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Directory
            </TabsTrigger>
            <TabsTrigger value="org-chart" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Organization Chart
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="directory" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employees</CardTitle>
                  <CardDescription>
                    Showing {filteredEmployees.length} of{" "}
                    {activeEmployees.length} employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover
                    open={showFiltersPopover}
                    onOpenChange={setShowFiltersPopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="relative"
                      >
                        <Filter className="h-4 w-4" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Filters</h4>
                          {activeFilterCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-8 text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        <Accordion type="multiple" className="w-full">
                          {/* Business Unit Filter */}
                          {businessUnits.length > 0 && (
                            <AccordionItem value="business-unit">
                              <AccordionTrigger className="text-sm font-medium">
                                Business Unit{" "}
                                {selectedBusinessUnits.length > 0 &&
                                  `(${selectedBusinessUnits.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {businessUnits.map((unit) => (
                                    <div
                                      key={unit}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`bu-${unit}`}
                                        checked={selectedBusinessUnits.includes(
                                          unit,
                                        )}
                                        onCheckedChange={() =>
                                          toggleFilter(
                                            unit,
                                            selectedBusinessUnits,
                                            setSelectedBusinessUnits,
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`bu-${unit}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {unit}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Department Filter */}
                          {departments.length > 0 && (
                            <AccordionItem value="department">
                              <AccordionTrigger className="text-sm font-medium">
                                Department{" "}
                                {selectedDepartments.length > 0 &&
                                  `(${selectedDepartments.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {departments.map((dept) => (
                                    <div
                                      key={dept}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`dept-${dept}`}
                                        checked={selectedDepartments.includes(
                                          dept,
                                        )}
                                        onCheckedChange={() =>
                                          toggleFilter(
                                            dept,
                                            selectedDepartments,
                                            setSelectedDepartments,
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`dept-${dept}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {dept}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Location Filter */}
                          {locations.length > 0 && (
                            <AccordionItem value="location">
                              <AccordionTrigger className="text-sm font-medium">
                                Location{" "}
                                {selectedLocations.length > 0 &&
                                  `(${selectedLocations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {locations.map((loc) => (
                                    <div
                                      key={loc}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`loc-${loc}`}
                                        checked={selectedLocations.includes(
                                          loc,
                                        )}
                                        onCheckedChange={() =>
                                          toggleFilter(
                                            loc,
                                            selectedLocations,
                                            setSelectedLocations,
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`loc-${loc}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {loc}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Designation Filter */}
                          {designations.length > 0 && (
                            <AccordionItem value="designation">
                              <AccordionTrigger className="text-sm font-medium">
                                Designation{" "}
                                {selectedDesignations.length > 0 &&
                                  `(${selectedDesignations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {designations.map((des) => (
                                    <div
                                      key={des}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`des-${des}`}
                                        checked={selectedDesignations.includes(
                                          des,
                                        )}
                                        onCheckedChange={() =>
                                          toggleFilter(
                                            des,
                                            selectedDesignations,
                                            setSelectedDesignations,
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`des-${des}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {des}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Total Experience Filter */}
                          <AccordionItem value="experience">
                            <AccordionTrigger className="text-sm font-medium">
                              Total Experience{" "}
                              {selectedExperiences.length > 0 &&
                                `(${selectedExperiences.length})`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {experienceRanges.map((range) => (
                                  <div
                                    key={range}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`exp-${range}`}
                                      checked={selectedExperiences.includes(
                                        range,
                                      )}
                                      onCheckedChange={() =>
                                        toggleFilter(
                                          range,
                                          selectedExperiences,
                                          setSelectedExperiences,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`exp-${range}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {range}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Allocation Date Range Filter — RMG module only */}
                          {isRMGModule && (
                            <AccordionItem value="allocation-date">
                              <AccordionTrigger className="text-sm font-medium">
                                Allocation Date Range{" "}
                                {(allocationDateFrom || allocationDateTo) &&
                                  `(${(allocationDateFrom ? 1 : 0) + (allocationDateTo ? 1 : 0)})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">From</label>
                                    <DatePicker
                                      value={allocationDateFrom ? `${allocationDateFrom.getFullYear()}-${String(allocationDateFrom.getMonth()+1).padStart(2,'0')}-${String(allocationDateFrom.getDate()).padStart(2,'0')}` : ''}
                                      onChange={val => setAllocationDateFrom(val ? new Date(val + 'T00:00:00') : undefined)}
                                      placeholder="From date"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">To</label>
                                    <DatePicker
                                      value={allocationDateTo ? `${allocationDateTo.getFullYear()}-${String(allocationDateTo.getMonth()+1).padStart(2,'0')}-${String(allocationDateTo.getDate()).padStart(2,'0')}` : ''}
                                      onChange={val => setAllocationDateTo(val ? new Date(val + 'T00:00:00') : undefined)}
                                      placeholder="To date"
                                    />
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Column toggle — RMG table mode only */}
                  {isRMGModule && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Columns3 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {[
                          { key: 'name', label: 'Name' },
                          { key: 'designation', label: 'Designation' },
                          { key: 'department', label: 'Department' },
                          { key: 'reportingManagerName', label: 'Reporting Manager' },
                          { key: 'allocation', label: 'Allocation' },
                        ].map(({ key, label }) => (
                          <DropdownMenuItem
                            key={key}
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility(key)}>
                              <Checkbox
                                checked={!!(columnVisibility[key])}
                                onCheckedChange={() => toggleColumnVisibility(key)}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">{label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* RMG Table View */}
              {isRMGModule ? (
                <DataTable<Employee>
                  data={filteredEmployees}
                  columns={[
                    {
                      key: 'name',
                      label: 'Employee',
                      sortable: true,
                      align: 'left',
                      hidden: !columnVisibility.name,
                      render: (_val, employee) => (
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar
                            employee={{
                              employeeId: employee.employeeId,
                              name: employee.name,
                              firstName: employee.firstName,
                              lastName: employee.lastName,
                              profilePhoto: employee.profilePhoto,
                            }}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-foreground">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'designation',
                      label: 'Designation',
                      sortable: true,
                      align: 'left',
                      hidden: !columnVisibility.designation,
                      render: (value) => <span className="text-sm">{value || '-'}</span>,
                    },
                    {
                      key: 'department',
                      label: 'Department',
                      sortable: true,
                      align: 'left',
                      hidden: !columnVisibility.department,
                      render: (value) => (
                        <Badge variant="outline" className="font-normal">
                          {value || '-'}
                        </Badge>
                      ),
                    },
                    {
                      key: 'reportingManagerName',
                      label: 'Reporting Manager',
                      sortable: true,
                      align: 'left',
                      hidden: !columnVisibility.reportingManagerName,
                      render: (_val, employee) => (
                        <span className="text-sm">{employee.reportingManager?.name || '-'}</span>
                      ),
                    },
                    {
                      key: 'allocation',
                      label: 'Allocation',
                      sortable: false,
                      align: 'center',
                      hidden: !columnVisibility.allocation,
                      render: (_val, employee) => {
                        const pct = allocations.get(employee.employeeId) || 0;
                        const projects = allocationDetails.get(employee.employeeId) || [];
                        const cls =
                          pct === 0
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : pct < 50
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : pct < 80
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-green-100 text-green-700 border-green-300';

                        const badge = (
                          <Badge variant="outline" className={cn('font-medium cursor-default', cls)}>
                            {pct}%
                          </Badge>
                        );

                        if (projects.length === 0) return badge;

                        return (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>{badge}</TooltipTrigger>
                              <TooltipContent
                                side="left"
                                className="p-0 max-w-xs w-72 shadow-lg"
                              >
                                <div className="p-3">
                                  <p className="text-xs font-semibold mb-2 text-popover-foreground">
                                    Assigned Projects
                                  </p>
                                  <div className="space-y-2">
                                    {projects.map((proj, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-md bg-muted/60 px-2.5 py-1.5 text-xs"
                                      >
                                        <div className="font-medium text-foreground truncate">
                                          {proj.projectName}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5 text-muted-foreground">
                                          <span>{proj.utilizationPercentage}% allocation</span>
                                          <span className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded-full border',
                                            proj.billable
                                              ? 'bg-green-50 text-green-700 border-green-200'
                                              : 'bg-gray-50 text-gray-500 border-gray-200'
                                          )}>
                                            {proj.billable ? 'Billable' : 'Non-billable'}
                                          </span>
                                        </div>
                                        {proj.fromDate && proj.toDate && (
                                          <div className="text-muted-foreground mt-0.5">
                                            {proj.fromDate} → {proj.toDate}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      },
                    },
                  ] as DataTableColumn<Employee>[]}
                  actions={[
                    {
                      label: 'View Profile',
                      onClick: (employee) => {
                        sessionStorage.setItem('profileReferrer', '/rmg/employees');
                        navigate(`/employee/profile/${employee.employeeId}`);
                      },
                      variant: 'default',
                    },
                  ] as DataTableAction<Employee>[]}
                  searchable={false}
                  pageSize={15}
                  hideColumnToggle={true}
                  emptyMessage="No employees found"
                  onRowClick={(employee) => {
                    sessionStorage.setItem('profileReferrer', '/rmg/employees');
                    navigate(`/employee/profile/${employee.employeeId}`);
                  }}
                />
              ) : (
              <>{/* Employee Cards Grid */}
              {filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredEmployees.map((member: Employee) => (
                    <Card
                      key={member.employeeId}
                      className="group relative border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                      onClick={() => {
                        sessionStorage.setItem(
                          "profileReferrer",
                          "/employee/directory",
                        );
                        navigate(`/employee/profile/${member.employeeId}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          sessionStorage.setItem(
                            "profileReferrer",
                            "/employee/directory",
                          );
                          navigate(`/employee/profile/${member.employeeId}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${member.name}'s profile`}
                    >
                      <CardContent className="p-5">
                        {/* Header: Name + Status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm truncate">
                              {member.name}
                            </h3>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0",
                              getStatusBadge(member.status),
                            )}
                          >
                            {member.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Designation */}
                        <p className="text-xs text-muted-foreground mb-4">
                          {member.designation}
                        </p>

                        {/* Profile Picture */}
                        <div className="flex justify-center mb-4">
                          <EmployeeAvatar
                            employee={member}
                            size="xl"
                            className="border-2 border-border"
                          />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2.5">
                          {/* Email */}
                          <div className="flex items-start gap-2">
                            <Mail
                              className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                              aria-label="Email"
                            />
                            <span className="text-xs text-muted-foreground break-all leading-relaxed">
                              {member.email}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start gap-2">
                            <MapPin
                              className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                              aria-label="Location"
                            />
                            <span className="text-xs text-foreground leading-relaxed">
                              {member.location || "Not specified"}
                            </span>
                          </div>

                          {/* Phone */}
                          <div className="flex items-start gap-2">
                            <Phone
                              className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                              aria-label="Phone"
                            />
                            <span className="text-xs text-foreground leading-relaxed">
                              {member.phone || "Not specified"}
                            </span>
                          </div>

                          {/* Birthday */}
                          <div className="flex items-start gap-2">
                            <Calendar
                              className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                              aria-label="Birthday"
                            />
                            <span className="text-xs text-foreground leading-relaxed">
                              {formatBirthday(member.dateOfBirth)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-sm border-border">
                  <CardContent className="py-16 text-center">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No employees found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {activeFilterCount > 0 || searchQuery
                        ? "No employees match your search criteria. Try adjusting your filters."
                        : "There are no employees available at the moment."}
                    </p>
                  </CardContent>
                </Card>
              )}
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="org-tree" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Organization Tree
                  </CardTitle>
                  <CardDescription>
                    View your reporting structure and direct reports
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                    disabled={zoomLevel <= 0.1}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    disabled={zoomLevel >= 2}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(0.5)}
                    disabled={zoomLevel === 0.5}
                    title="Reset to default (50%)"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              ref={orgTreeRef}
              className="min-h-[500px] max-h-[calc(100vh-300px)] overflow-auto"
              onWheel={handleWheel}
            >
              {loadingOrgTree ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading organization tree...
                    </p>
                  </div>
                </div>
              ) : !orgTree || !orgTree.employee ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-4">
                    <Network className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        No Data Available
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Unable to load organization tree data
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full overflow-hidden">
                  <div
                    className="space-y-8 py-6 transition-transform duration-200 origin-top-center w-max min-w-full"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {/* Reporting Manager Section */}
                    {orgTree.reportingManager && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <Badge variant="secondary" className="mb-2">
                            Reporting Manager
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <Card className="w-80 h-24 hover:shadow-lg transition-shadow border-2 relative">
                            <CardContent
                              className="p-4 cursor-pointer"
                              onClick={() =>
                                navigate(
                                  `/employee/profile/${orgTree.reportingManager!.employeeId || orgTree.reportingManager!.id}`,
                                )
                              }
                            >
                              <div className="flex items-start gap-4">
                                <EmployeeAvatar
                                  employee={orgTree.reportingManager}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm truncate">
                                    {orgTree.reportingManager.name || "N/A"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {orgTree.reportingManager.designation ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            {/* Direct Reports Count Badge */}
                            {reportingManagerTree &&
                              Array.isArray(
                                reportingManagerTree.directReports,
                              ) &&
                              reportingManagerTree.directReports.length > 0 && (
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowReportingManagerReports(
                                        !showReportingManagerReports,
                                      );
                                    }}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg cursor-pointer"
                                  >
                                    <span className="text-sm font-semibold">
                                      {showReportingManagerReports
                                        ? "-"
                                        : reportingManagerTree.directReports
                                            .length}
                                    </span>
                                  </button>
                                </div>
                              )}
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Team Members - Other employees reporting to same manager */}
                    {orgTree.reportingManager &&
                      showReportingManagerReports &&
                      reportingManagerTree &&
                      Array.isArray(reportingManagerTree.directReports) &&
                      reportingManagerTree.directReports.length > 0 && (
                        <div className="space-y-0">
                          {/* Main connector from parent */}
                          <div className="flex justify-center">
                            <div className="h-8 w-0.5 bg-gray-400"></div>
                          </div>

                          <div className="relative">
                            {/* Horizontal line across all children */}
                            <div
                              className="absolute left-0 right-0 top-0 h-0.5 bg-gray-400"
                              style={{
                                left: `calc(${100 / (reportingManagerTree.directReports.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                right: `calc(${100 / (reportingManagerTree.directReports.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                              }}
                            ></div>

                            <div className="flex justify-center gap-8 pt-8">
                              {reportingManagerTree.directReports
                                .filter(
                                  (report) =>
                                    report &&
                                    report.employee &&
                                    typeof report.employee === "object" &&
                                    report.employee !== null &&
                                    (report.employee.employeeId ||
                                      report.employee.id) &&
                                    report.relationship === "direct", // Only show direct reports, not dotted
                                )
                                .map((report) => {
                                  const emp = report.employee!;
                                  const empId = (emp.employeeId || emp.id) as string;
                                  const isCurrentUser =
                                    emp.employeeId === user?.employeeId;
                                  const isExpanded =
                                    expandedDirectReports.has(empId);
                                  const empTree = directReportTrees.get(empId);
                                  const reportsToShow =
                                    empTree?.directReports || [];
                                  const directReportsCount = Array.isArray(
                                    reportsToShow,
                                  )
                                    ? reportsToShow.filter(
                                        (r) => r.relationship === "direct",
                                      ).length
                                    : 0;

                                  return (
                                    <div
                                      key={report._id}
                                      className="relative flex flex-col items-center"
                                    >
                                      {/* Vertical connector from top line to card */}
                                      <div className="w-0.5 bg-gray-400 h-8 absolute -top-8 left-1/2 transform -translate-x-1/2"></div>

                                      <Card
                                        className={cn(
                                          "hover:shadow-lg transition-shadow cursor-pointer relative w-80 h-24",
                                          isCurrentUser &&
                                            "border-2 border-primary",
                                        )}
                                      >
                                        <CardContent
                                          className="p-4"
                                          onClick={() =>
                                            navigate(
                                              `/employee/profile/${empId}`,
                                            )
                                          }
                                        >
                                          <div className="flex items-start gap-3">
                                            <EmployeeAvatar
                                              employee={emp}
                                              size="md"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm truncate">
                                                  {emp.name || "Unknown"}
                                                </h4>
                                                {isCurrentUser && (
                                                  <Badge
                                                    variant="default"
                                                    className="text-[10px] h-4 px-1"
                                                  >
                                                    You
                                                  </Badge>
                                                )}
                                                {report.relationship ===
                                                  "dotted" && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-4 px-1"
                                                  >
                                                    Dotted
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-xs text-muted-foreground truncate">
                                                {emp.designation || "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </CardContent>
                                        {/* Count badge for each peer - only show if count > 0 */}
                                        {directReportsCount > 0 && (
                                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                await toggleDirectReportsForEmployee(
                                                  empId,
                                                );
                                              }}
                                              className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg cursor-pointer border"
                                            >
                                              <span className="text-sm font-semibold">
                                                {isExpanded
                                                  ? "-"
                                                  : directReportsCount}
                                              </span>
                                            </button>
                                          </div>
                                        )}
                                      </Card>

                                      {/* Nested Direct Reports */}
                                      {isExpanded &&
                                        reportsToShow &&
                                        Array.isArray(reportsToShow) &&
                                        reportsToShow.length > 0 && (
                                          <div className="w-full mt-0">
                                            {/* Connector from parent count badge to children */}
                                            <div className="flex justify-center">
                                              <div className="h-12 w-0.5 bg-gray-400"></div>
                                            </div>

                                            <div className="relative">
                                              {/* Horizontal line across children */}
                                              <div
                                                className="absolute left-0 right-0 top-0 h-0.5 bg-gray-400"
                                                style={{
                                                  left: `calc(${100 / (reportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                  right: `calc(${100 / (reportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                }}
                                              ></div>

                                              <div className="flex justify-center gap-6 pt-8">
                                                {reportsToShow
                                                  .filter(
                                                    (subReport) =>
                                                      subReport &&
                                                      subReport.employee &&
                                                      typeof subReport.employee ===
                                                        "object" &&
                                                      subReport.employee !==
                                                        null &&
                                                      (subReport.employee
                                                        .employeeId ||
                                                        subReport.employee
                                                          .id) &&
                                                      subReport.relationship ===
                                                        "direct", // Only show direct reports
                                                  )
                                                  .map((subReport) => {
                                                    const subEmp =
                                                      subReport.employee!;
                                                    const subEmpId =
                                                      (subEmp.employeeId ||
                                                      subEmp.id) as string;
                                                    const isSubExpanded =
                                                      expandedDirectReports.has(
                                                        subEmpId,
                                                      );
                                                    const subEmpTree =
                                                      directReportTrees.get(
                                                        subEmpId,
                                                      );
                                                    const subReportsToShow =
                                                      subEmpTree?.directReports ||
                                                      [];
                                                    const subDirectReportsCount =
                                                      Array.isArray(
                                                        subReportsToShow,
                                                      )
                                                        ? subReportsToShow.filter(
                                                            (r) =>
                                                              r.relationship ===
                                                              "direct",
                                                          ).length
                                                        : 0;

                                                    return (
                                                      <div
                                                        key={subReport._id}
                                                        className="relative flex flex-col items-center"
                                                      >
                                                        {/* Vertical connector from top line to card */}
                                                        <div className="w-0.5 bg-gray-400 h-8 absolute -top-8 left-1/2 transform -translate-x-1/2"></div>

                                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative w-80 h-24">
                                                          <CardContent
                                                            className="p-4"
                                                            onClick={() =>
                                                              navigate(
                                                                `/employee/profile/${subEmpId}`,
                                                              )
                                                            }
                                                          >
                                                            <div className="flex items-start gap-3">
                                                              <EmployeeAvatar
                                                                employee={
                                                                  subEmp
                                                                }
                                                                size="md"
                                                              />
                                                              <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                  <h5 className="font-semibold text-sm truncate">
                                                                    {subEmp.name ||
                                                                      "Unknown"}
                                                                  </h5>
                                                                  {subReport.relationship ===
                                                                    "dotted" && (
                                                                    <Badge
                                                                      variant="outline"
                                                                      className="text-[10px] h-4 px-1"
                                                                    >
                                                                      Dotted
                                                                    </Badge>
                                                                  )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                  {subEmp.designation ||
                                                                    "N/A"}
                                                                </p>
                                                              </div>
                                                            </div>
                                                          </CardContent>
                                                          {/* Count badge for nested reports - only show if count > 0 */}
                                                          {subDirectReportsCount >
                                                            0 && (
                                                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                                                              <button
                                                                onClick={async (
                                                                  e,
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  await toggleDirectReportsForEmployee(
                                                                    subEmpId,
                                                                  );
                                                                }}
                                                                className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg cursor-pointer border"
                                                              >
                                                                <span className="text-sm font-semibold">
                                                                  {isSubExpanded
                                                                    ? "-"
                                                                    : subDirectReportsCount}
                                                                </span>
                                                              </button>
                                                            </div>
                                                          )}
                                                        </Card>

                                                        {/* Deeper nested reports */}
                                                        {isSubExpanded &&
                                                          subReportsToShow &&
                                                          Array.isArray(
                                                            subReportsToShow,
                                                          ) &&
                                                          subReportsToShow.length >
                                                            0 && (
                                                            <div className="w-full mt-0">
                                                              {/* Connector from parent count badge to children */}
                                                              <div className="flex justify-center">
                                                                <div className="h-11 w-0.5 bg-gray-400"></div>
                                                              </div>

                                                              <div className="relative">
                                                                {/* Horizontal line across children */}
                                                                <div
                                                                  className="absolute left-0 right-0 top-0 h-0.5 bg-gray-400"
                                                                  style={{
                                                                    left: `calc(${100 / (subReportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                                    right: `calc(${100 / (subReportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                                  }}
                                                                ></div>

                                                                <div className="flex justify-center gap-4 pt-8">
                                                                  {subReportsToShow
                                                                    .filter(
                                                                      (
                                                                        deepReport,
                                                                      ) =>
                                                                        deepReport &&
                                                                        deepReport.employee &&
                                                                        typeof deepReport.employee ===
                                                                          "object" &&
                                                                        deepReport.employee !==
                                                                          null &&
                                                                        (deepReport
                                                                          .employee
                                                                          .employeeId ||
                                                                          deepReport
                                                                            .employee
                                                                            .id) &&
                                                                        deepReport.relationship ===
                                                                          "direct", // Only show direct reports
                                                                    )
                                                                    .map(
                                                                      (
                                                                        deepReport,
                                                                      ) => {
                                                                        const deepEmp =
                                                                          deepReport.employee!;
                                                                        const deepEmpId =
                                                                          (deepEmp.employeeId ||
                                                                          deepEmp.id) as string;
                                                                        const isDeepExpanded =
                                                                          expandedDirectReports.has(
                                                                            deepEmpId,
                                                                          );
                                                                        const deepEmpTree =
                                                                          directReportTrees.get(
                                                                            deepEmpId,
                                                                          );
                                                                        const deepReportsToShow =
                                                                          deepEmpTree?.directReports ||
                                                                          [];
                                                                        const deepDirectReportsCount =
                                                                          Array.isArray(
                                                                            deepReportsToShow,
                                                                          )
                                                                            ? deepReportsToShow.filter(
                                                                                (
                                                                                  r,
                                                                                ) =>
                                                                                  r.relationship ===
                                                                                  "direct",
                                                                              )
                                                                                .length
                                                                            : 0;

                                                                        return (
                                                                          <div
                                                                            key={
                                                                              deepReport._id
                                                                            }
                                                                            className="relative flex flex-col items-center"
                                                                          >
                                                                            {/* Vertical connector from top line to card */}
                                                                            <div className="w-0.5 bg-gray-400 h-8 absolute -top-8 left-1/2 transform -translate-x-1/2"></div>

                                                                            <Card className="hover:shadow-lg transition-shadow cursor-pointer relative w-80 h-24">
                                                                              <CardContent
                                                                                className="p-4"
                                                                                onClick={() =>
                                                                                  navigate(
                                                                                    `/employee/profile/${deepEmpId}`,
                                                                                  )
                                                                                }
                                                                              >
                                                                                <div className="flex items-start gap-3">
                                                                                  <EmployeeAvatar
                                                                                    employee={
                                                                                      deepEmp
                                                                                    }
                                                                                    size="md"
                                                                                  />
                                                                                  <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                      <h6 className="font-semibold text-sm truncate">
                                                                                        {deepEmp.name ||
                                                                                          "Unknown"}
                                                                                      </h6>
                                                                                      {deepReport.relationship ===
                                                                                        "dotted" && (
                                                                                        <Badge
                                                                                          variant="outline"
                                                                                          className="text-[10px] h-4 px-1"
                                                                                        >
                                                                                          Dotted
                                                                                        </Badge>
                                                                                      )}
                                                                                    </div>
                                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                                      {deepEmp.designation ||
                                                                                        "N/A"}
                                                                                    </p>
                                                                                  </div>
                                                                                </div>
                                                                              </CardContent>
                                                                              {/* Count badge for fourth level - only show if count > 0 */}
                                                                              {deepDirectReportsCount >
                                                                                0 && (
                                                                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                                                                                  <button
                                                                                    onClick={async (
                                                                                      e,
                                                                                    ) => {
                                                                                      e.stopPropagation();
                                                                                      await toggleDirectReportsForEmployee(
                                                                                        deepEmpId,
                                                                                      );
                                                                                    }}
                                                                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg cursor-pointer border"
                                                                                  >
                                                                                    <span className="text-sm font-semibold">
                                                                                      {isDeepExpanded
                                                                                        ? "-"
                                                                                        : deepDirectReportsCount}
                                                                                    </span>
                                                                                  </button>
                                                                                </div>
                                                                              )}
                                                                            </Card>

                                                                            {/* Fourth level nested reports */}
                                                                            {isDeepExpanded &&
                                                                              deepReportsToShow &&
                                                                              Array.isArray(
                                                                                deepReportsToShow,
                                                                              ) &&
                                                                              deepReportsToShow.length >
                                                                                0 && (
                                                                                <div className="w-full mt-0">
                                                                                  {/* Connector from parent count badge to children */}
                                                                                  <div className="flex justify-center">
                                                                                    <div className="h-10 w-0.5 bg-gray-400"></div>
                                                                                  </div>

                                                                                  <div className="relative">
                                                                                    {/* Horizontal line across children */}
                                                                                    <div
                                                                                      className="absolute left-0 right-0 top-0 h-0.5 bg-gray-400"
                                                                                      style={{
                                                                                        left: `calc(${100 / (deepReportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                                                        right: `calc(${100 / (deepReportsToShow.filter((r) => r && r.employee && r.relationship === "direct").length * 2)}%)`,
                                                                                      }}
                                                                                    ></div>

                                                                                    <div className="flex justify-center gap-3 pt-6">
                                                                                      {deepReportsToShow
                                                                                        .filter(
                                                                                          (
                                                                                            fourthReport,
                                                                                          ) =>
                                                                                            fourthReport &&
                                                                                            fourthReport.employee &&
                                                                                            typeof fourthReport.employee ===
                                                                                              "object" &&
                                                                                            fourthReport.employee !==
                                                                                              null &&
                                                                                            (fourthReport
                                                                                              .employee
                                                                                              .employeeId ||
                                                                                              fourthReport
                                                                                                .employee
                                                                                                .id) &&
                                                                                            fourthReport.relationship ===
                                                                                              "direct",
                                                                                        )
                                                                                        .map(
                                                                                          (
                                                                                            fourthReport,
                                                                                          ) => {
                                                                                            const fourthEmp =
                                                                                              fourthReport.employee!;
                                                                                            const fourthEmpId =
                                                                                              fourthEmp.employeeId ||
                                                                                              fourthEmp.id;

                                                                                            return (
                                                                                              <div
                                                                                                key={
                                                                                                  fourthReport._id
                                                                                                }
                                                                                                className="relative flex flex-col items-center"
                                                                                              >
                                                                                                {/* Vertical connector from top line to card */}
                                                                                                <div className="w-0.5 bg-gray-400 h-6 absolute -top-6 left-1/2 transform -translate-x-1/2"></div>

                                                                                                <Card
                                                                                                  className="hover:shadow-lg transition-shadow cursor-pointer w-80 h-24"
                                                                                                  onClick={() =>
                                                                                                    navigate(
                                                                                                      `/employee/profile/${fourthEmpId}`,
                                                                                                    )
                                                                                                  }
                                                                                                >
                                                                                                  <CardContent className="p-4">
                                                                                                    <div className="flex items-start gap-3">
                                                                                                      <EmployeeAvatar
                                                                                                        employee={
                                                                                                          fourthEmp
                                                                                                        }
                                                                                                        size="md"
                                                                                                      />
                                                                                                      <div className="flex-1 min-w-0">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                          <h6 className="font-semibold text-sm truncate">
                                                                                                            {fourthEmp.name ||
                                                                                                              "Unknown"}
                                                                                                          </h6>
                                                                                                          {fourthReport.relationship ===
                                                                                                            "dotted" && (
                                                                                                            <Badge
                                                                                                              variant="outline"
                                                                                                              className="text-[10px] h-4 px-1"
                                                                                                            >
                                                                                                              Dotted
                                                                                                            </Badge>
                                                                                                          )}
                                                                                                        </div>
                                                                                                        <p className="text-xs text-muted-foreground truncate">
                                                                                                          {fourthEmp.designation ||
                                                                                                            "N/A"}
                                                                                                        </p>
                                                                                                      </div>
                                                                                                    </div>
                                                                                                  </CardContent>
                                                                                                </Card>
                                                                                              </div>
                                                                                            );
                                                                                          },
                                                                                        )}
                                                                                    </div>
                                                                                  </div>
                                                                                </div>
                                                                              )}
                                                                          </div>
                                                                        );
                                                                      },
                                                                    )}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          )}
                                                      </div>
                                                    );
                                                  })}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      )}

                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="org-chart" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Organization Chart
                    </CardTitle>
                    <CardDescription>
                      Visual tree representation of your reporting structure
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setZoomLevel(Math.max(0.1, zoomLevel - 0.1))
                      }
                      disabled={zoomLevel <= 0.1}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      disabled={zoomLevel >= 2}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">
                    Go to
                  </span>
                  <Button
                    variant={
                      orgChartView === "department" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setOrgChartView("department")}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    My Department
                  </Button>
                  <Button
                    variant={orgChartView === "top" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrgChartView("top")}
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Top of the Org
                  </Button>
                  <Button
                    variant={orgChartView === "me" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrgChartView("me")}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    Me
                  </Button>

                </div>
              </div>
            </CardHeader>
            <CardContent
              ref={orgChartRef}
              className="min-h-[500px] max-h-[calc(100vh-300px)] overflow-auto"
              onWheel={handleWheel}
            >
              {loadingOrgTree ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading organization chart...
                    </p>
                  </div>
                </div>
              ) : !orgTree || !orgTree.employee ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-4">
                    <GitBranch className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        No Data Available
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Unable to load organization chart data
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full overflow-x-auto overflow-y-auto py-8">
                  <div
                    className="w-full min-w-max transition-transform duration-200 origin-top-left"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <div className="flex justify-start pl-8">
                      <Tree
                        lineWidth="0.5px"
                        lineColor="#D8DDE6"
                        lineBorderRadius="10px"
                        label={(() => {
                          // Me view: show reporting manager at root
                          if (orgChartView === "me" && orgTree.reportingManager) {
                            return (
                              <div className="relative inline-block">
                                <Card className="w-[260px] h-[110px] border-2 border-primary/60 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
                                  <CardContent className="p-4 h-full">
                                    <div className="flex items-center gap-3 h-full">
                                      <div className="relative flex-shrink-0">
                                        <div
                                          className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px]"
                                          style={{
                                            backgroundColor: getAvatarColor(
                                              orgTree.reportingManager.employeeId ||
                                                orgTree.reportingManager.id ||
                                                "manager",
                                            ),
                                          }}
                                        >
                                          {orgTree.reportingManager.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) || "??"}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                          <Users className="h-2 w-2 text-primary-foreground" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-left font-semibold text-sm break-words">
                                          {orgTree.reportingManager.name || "N/A"}
                                        </h3>
                                        <p className="text-xs text-muted-foreground break-words text-left">
                                          {orgTree.reportingManager.designation || "N/A"}
                                        </p>
                                        <p className="text-xs text-muted-foreground/80 break-words text-left">
                                          {orgTree.reportingManager.department || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                {/* Count Badge for Manager */}
                                {(reportingManagerTree?.directReports?.filter(
                                  (r) => r.relationship === "direct",
                                ).length ?? 0) > 0 && (
                                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg z-10">
                                    <span className="text-sm font-bold">
                                      {reportingManagerTree?.directReports?.filter(
                                        (r) => r.relationship === "direct",
                                      ).length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          // Department view: show current user's reporting manager at root
                          if (orgChartView === "department") {
                            const currentUser = employees.find(e => e.employeeId === user?.employeeId);
                            const deptRM = currentUser?.reportingManagerId
                              ? employees.find(e => e.employeeId === currentUser.reportingManagerId)
                              : null;
                            if (deptRM) {
                              return (
                                <div className="relative inline-block">
                                  <Card className="w-[260px] h-[110px] border-2 border-primary/60 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
                                    <CardContent className="p-4 h-full">
                                      <div className="flex items-center gap-3 h-full">
                                        <div className="relative flex-shrink-0">
                                          <div
                                            className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px]"
                                            style={{ backgroundColor: getAvatarColor(deptRM.employeeId || "manager") }}
                                          >
                                            {deptRM.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                            <Users className="h-2 w-2 text-primary-foreground" />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h3 className="text-left font-semibold text-sm break-words">{deptRM.name || "N/A"}</h3>
                                          <p className="text-xs text-muted-foreground break-words text-left">{deptRM.designation || "N/A"}</p>
                                          <p className="text-xs text-muted-foreground/80 break-words text-left">{deptRM.department || "N/A"}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            }
                          }
                          return undefined;
                        })()}
                      >
                        {orgChartView === "me"
                          ? /* "ME" VIEW: Show manager at top, then current user and peers */
                            orgTree.reportingManager &&
                            reportingManagerTree &&
                            Array.isArray(reportingManagerTree.directReports) &&
                            reportingManagerTree.directReports.length > 0 &&
                            reportingManagerTree.directReports
                              .filter(
                                (report) =>
                                  report?.employee &&
                                  report.relationship === "direct",
                              )
                              .map((report) => {
                                const emp = report.employee!;
                                const empId = (emp.employeeId || emp.id) as string;
                                const isCurrentUser =
                                  emp.employeeId === user?.employeeId;
                                const isExpanded =
                                  expandedDirectReports.has(empId);
                                const empTree = directReportTrees.get(empId);
                                const directReportsCount =
                                  empTree?.directReports?.filter(
                                    (r) => r.relationship === "direct",
                                  ).length || 0;

                                return (
                                  <TreeNode
                                    key={report._id}
                                    label={
                                      <div className="relative inline-block">
                                        <Card
                                          className={cn(
                                            "w-[260px] h-[110px] cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1",
                                            isCurrentUser
                                              ? "border-2 border-green-500 shadow-green-500/20 shadow-lg"
                                              : "border shadow-md",
                                          )}
                                          onClick={() =>
                                            navigate(
                                              `/employee/profile/${empId}`,
                                            )
                                          }
                                        >
                                          <CardContent className="p-4 h-full">
                                            <div className="flex items-center gap-3 h-full">
                                              <div
                                                className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                style={{
                                                  backgroundColor:
                                                    getAvatarColor(empId),
                                                }}
                                              >
                                                {emp.name
                                                  ?.split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                                  .toUpperCase()
                                                  .slice(0, 2) || "??"}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                  <h4 className="text-left font-semibold text-sm break-words">
                                                    {emp.name || "Unknown"}
                                                  </h4>
                                                  {isCurrentUser && (
                                                    <Badge
                                                      variant="default"
                                                      className="text-[10px] bg-green-500"
                                                    >
                                                      You
                                                    </Badge>
                                                  )}
                                                </div>
                                                <p className="text-xs text-muted-foreground break-words text-left">
                                                  {emp.designation || "N/A"}
                                                </p>
                                                <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                  {emp.department || "N/A"}
                                                </p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                        {/* Count Badge - Positioned at bottom center */}
                                        {directReportsCount > 0 && (
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              await toggleDirectReportsForEmployee(
                                                empId,
                                              );
                                            }}
                                            className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all shadow-lg hover:shadow-xl hover:scale-110 z-10"
                                          >
                                            <span className="text-sm font-bold">
                                              {isExpanded
                                                ? "−"
                                                : directReportsCount}
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    }
                                  >
                                    {/* Only render children TreeNodes if expanded AND has count badge */}
                                    {isExpanded &&
                                      directReportsCount > 0 &&
                                      empTree?.directReports &&
                                      empTree.directReports.length > 0 &&
                                      empTree.directReports
                                        .filter(
                                          (r) =>
                                            r?.employee &&
                                            r.relationship === "direct",
                                        )
                                        .map((subReport) => {
                                          const subEmp = subReport.employee!;
                                          const subEmpId =
                                            (subEmp.employeeId || subEmp.id) as string;
                                          const subEmpTree =
                                            directReportTrees.get(subEmpId);
                                          const subDirectReportsCount =
                                            subEmpTree?.directReports?.filter(
                                              (r) =>
                                                r.relationship === "direct",
                                            ).length || 0;
                                          const isSubExpanded =
                                            expandedDirectReports.has(subEmpId);

                                          return (
                                            <TreeNode
                                              key={subReport._id}
                                              label={
                                                <div className="relative inline-block">
                                                  <Card
                                                    className="w-[260px] h-[110px] cursor-pointer hover:shadow-xl transition-all duration-300"
                                                    onClick={() =>
                                                      navigate(
                                                        `/employee/profile/${subEmpId}`,
                                                      )
                                                    }
                                                  >
                                                    <CardContent className="p-4 h-full">
                                                      <div className="flex items-center gap-3 h-full">
                                                        <div
                                                          className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                          style={{
                                                            backgroundColor:
                                                              getAvatarColor(
                                                                subEmpId,
                                                              ),
                                                          }}
                                                        >
                                                          {subEmp.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2) ||
                                                            "??"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                          <h5 className="text-left font-semibold text-sm break-words">
                                                            {subEmp.name ||
                                                              "Unknown"}
                                                          </h5>
                                                          <p className="text-xs text-muted-foreground break-words text-left">
                                                            {subEmp.designation ||
                                                              "N/A"}
                                                          </p>
                                                          <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                            {subEmp.department ||
                                                              "N/A"}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </CardContent>
                                                  </Card>
                                                  {/* Count Badge - Positioned at bottom center */}
                                                  {subDirectReportsCount >
                                                    0 && (
                                                    <button
                                                      onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await toggleDirectReportsForEmployee(
                                                          subEmpId,
                                                        );
                                                      }}
                                                      className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all shadow-lg hover:shadow-xl hover:scale-110 z-10"
                                                    >
                                                      <span className="text-sm font-bold">
                                                        {isSubExpanded
                                                          ? "−"
                                                          : subDirectReportsCount}
                                                      </span>
                                                    </button>
                                                  )}
                                                </div>
                                              }
                                            >
                                              {/* Only render children TreeNodes if expanded AND has count badge */}
                                              {isSubExpanded &&
                                                subDirectReportsCount > 0 &&
                                                subEmpTree?.directReports &&
                                                subEmpTree.directReports
                                                  .length > 0 &&
                                                subEmpTree.directReports
                                                  .filter(
                                                    (r) =>
                                                      r?.employee &&
                                                      r.relationship ===
                                                        "direct",
                                                  )
                                                  .map((deepReport) => {
                                                    const deepEmp =
                                                      deepReport.employee!;
                                                    const deepEmpId =
                                                      (deepEmp.employeeId ||
                                                      deepEmp.id) as string;

                                                    return (
                                                      <TreeNode
                                                        key={deepReport._id}
                                                        label={
                                                          <Card
                                                            className="w-[260px] h-[110px] cursor-pointer hover:shadow-lg transition-all"
                                                            onClick={() =>
                                                              navigate(
                                                                `/employee/profile/${deepEmpId}`,
                                                              )
                                                            }
                                                          >
                                                            <CardContent className="p-4 h-full">
                                                              <div className="flex items-center gap-3 h-full">
                                                                <div
                                                                  className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                                  style={{
                                                                    backgroundColor:
                                                                      getAvatarColor(
                                                                        deepEmpId,
                                                                      ),
                                                                  }}
                                                                >
                                                                  {deepEmp.name
                                                                    ?.split(" ")
                                                                    .map(
                                                                      (n) =>
                                                                        n[0],
                                                                    )
                                                                    .join("")
                                                                    .toUpperCase()
                                                                    .slice(
                                                                      0,
                                                                      2,
                                                                    ) || "??"}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                  <h6 className="text-left font-semibold text-sm break-words">
                                                                    {deepEmp.name ||
                                                                      "Unknown"}
                                                                  </h6>
                                                                  <p className="text-xs text-muted-foreground break-words text-left">
                                                                    {deepEmp.designation ||
                                                                      "N/A"}
                                                                  </p>
                                                                  <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                                    {deepEmp.department ||
                                                                      "N/A"}
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </CardContent>
                                                          </Card>
                                                        }
                                                      />
                                                    );
                                                  })}
                                            </TreeNode>
                                          );
                                        })}
                                  </TreeNode>
                                );
                              })
                          : /* "TOP" & "DEPARTMENT" VIEWS */
                            orgTree?.employee &&
                            (orgChartView === "department"
                              ? /* DEPARTMENT VIEW: Show all department members at top level (no external manager card, no top connecting lines) */
                                (() => {
                                  const currentUserDept = employees.find(
                                    (e) => e.employeeId === user?.employeeId,
                                  )?.department;

                                  // Get all active employees in the department
                                  const deptEmployees = employees.filter(
                                    (emp) =>
                                      emp.status === "active" &&
                                      emp.department === currentUserDept,
                                  );

                                  // Find top-level employees: those with external managers OR no manager
                                  const topLevelEmployees =
                                    deptEmployees.filter((emp) => {
                                      if (!emp.reportingManagerId) {
                                        // No manager = top level
                                        return true;
                                      }
                                      const manager = employees.find(
                                        (m) =>
                                          m.employeeId ===
                                          emp.reportingManagerId,
                                      );
                                      // External manager (different department) = top level
                                      return (
                                        manager &&
                                        manager.department !== currentUserDept
                                      );
                                    });

                                  // Recursive function to render employee subtree (only same department employees)
                                  const renderEmployeeSubtree = (
                                    empId: string,
                                  ) => {
                                    const subTree =
                                      directReportTrees.get(empId);
                                    if (
                                      !subTree?.directReports ||
                                      subTree.directReports.length === 0
                                    ) {
                                      return null;
                                    }

                                    // Filter direct reports to only include same department employees
                                    const deptDirectReports =
                                      subTree.directReports.filter(
                                        (r) =>
                                          r?.employee &&
                                          r.relationship === "direct" &&
                                          r.employee.department ===
                                            currentUserDept,
                                      );

                                    if (deptDirectReports.length === 0) {
                                      return null;
                                    }

                                    return deptDirectReports.map(
                                      (deepReport) => {
                                        const deepEmp = deepReport.employee!;
                                        const deepEmpId =
                                          (deepEmp.employeeId || deepEmp.id) as string;
                                        const deepSubTree =
                                          directReportTrees.get(deepEmpId);

                                        // Count only same-department direct reports
                                        const deptReportCount =
                                          deepSubTree?.directReports?.filter(
                                            (r) =>
                                              r.relationship === "direct" &&
                                              r.employee?.department ===
                                                currentUserDept,
                                          ).length || 0;

                                        return (
                                          <TreeNode
                                            key={deepReport._id}
                                            label={
                                              <div className="relative inline-block">
                                                <Card
                                                  className="w-[260px] h-[110px] cursor-pointer hover:shadow-lg transition-all"
                                                  onClick={() =>
                                                    navigate(
                                                      `/employee/profile/${deepEmpId}`,
                                                    )
                                                  }
                                                >
                                                  <CardContent className="p-4 h-full">
                                                    <div className="flex items-center gap-3 h-full">
                                                      <div
                                                        className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                        style={{
                                                          backgroundColor:
                                                            getAvatarColor(
                                                              deepEmpId ||
                                                                "employee",
                                                            ),
                                                        }}
                                                      >
                                                        {deepEmp.name
                                                          ?.split(" ")
                                                          .map((n) => n[0])
                                                          .join("")
                                                          .toUpperCase()
                                                          .slice(0, 2) || "??"}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <h3 className="text-left font-semibold text-sm break-words">
                                                          {deepEmp.name ||
                                                            "N/A"}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground break-words text-left">
                                                          {deepEmp.designation ||
                                                            "N/A"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                          {deepEmp.department ||
                                                            "N/A"}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                                {/* Count Badge - only if has same-dept reports */}
                                                {deptReportCount > 0 && (
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); toggleDirectReportsForEmployee(deepEmpId); }}
                                                    className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg z-10 cursor-pointer transition-all"
                                                  >
                                                    <span className="text-sm font-bold">
                                                      {expandedDirectReports.has(deepEmpId) ? "−" : deptReportCount}
                                                    </span>
                                                  </button>
                                                )}
                                              </div>
                                            }
                                          >
                                            {expandedDirectReports.has(deepEmpId) && renderEmployeeSubtree(deepEmpId)}
                                          </TreeNode>
                                        );
                                      },
                                    );
                                  };

                                  // Render each top-level employee with their subtree
                                  console.log(
                                    "[Dept View] Top-level employees:",
                                    topLevelEmployees.map((e) => ({
                                      id: e.employeeId,
                                      name: e.name,
                                      manager: e.reportingManagerId,
                                    })),
                                  );

                                  return (
                                    <>
                                      {topLevelEmployees.map((emp) => {
                                        const empId = emp.employeeId;
                                        const subTree =
                                          directReportTrees.get(empId);

                                        const managerName =
                                          emp.reportingManagerId
                                            ? employees.find(
                                                (e) =>
                                                  e.employeeId ===
                                                  emp.reportingManagerId,
                                              )?.name || emp.reportingManagerId
                                            : "None";

                                        // Count only same-department direct reports
                                        const deptReportCount =
                                          subTree?.directReports?.filter(
                                            (r) =>
                                              r.relationship === "direct" &&
                                              r.employee?.department ===
                                                currentUserDept,
                                          ).length || 0;

                                        return (
                                          <TreeNode
                                            key={empId}
                                            label={
                                              <div className="relative inline-block">
                                                <Card
                                                  className="w-[260px] h-[135px] cursor-pointer hover:shadow-lg transition-all border-2 border-primary/60"
                                                  onClick={() =>
                                                    navigate(
                                                      `/employee/profile/${empId}`,
                                                    )
                                                  }
                                                >
                                                  <CardContent className="p-3 h-full">
                                                    <div className="flex items-center gap-3 h-full">
                                                      <div
                                                        className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                        style={{
                                                          backgroundColor:
                                                            getAvatarColor(
                                                              empId ||
                                                                "employee",
                                                            ),
                                                        }}
                                                      >
                                                        {emp.name
                                                          ?.split(" ")
                                                          .map((n) => n[0])
                                                          .join("")
                                                          .toUpperCase()
                                                          .slice(0, 2) || "??"}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <h3 className="text-left font-semibold text-sm break-words">
                                                          {emp.name || "N/A"}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground break-words text-left">
                                                          {emp.designation ||
                                                            "N/A"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                          {emp.department ||
                                                            "N/A"}
                                                        </p>
                                                        <p className="text-[10px] text-blue-600 break-words text-left font-medium">
                                                          Mgr: {managerName}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                                {/* Count Badge - only if has same-dept reports */}
                                                {deptReportCount > 0 && (
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); toggleDirectReportsForEmployee(empId); }}
                                                    className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg z-10 cursor-pointer transition-all"
                                                  >
                                                    <span className="text-sm font-bold">
                                                      {expandedDirectReports.has(empId) ? "−" : deptReportCount}
                                                    </span>
                                                  </button>
                                                )}
                                              </div>
                                            }
                                          >
                                            {expandedDirectReports.has(empId) && renderEmployeeSubtree(empId)}
                                          </TreeNode>
                                        );
                                      })}
                                    </>
                                  );
                                })()
                              : /* TOP VIEW: Show root employee and full hierarchy with recursion */
                                (() => {
                                  // Recursive function to render full organization hierarchy
                                  const renderFullHierarchy = (
                                    empId: string,
                                    level: number = 0,
                                  ): ReactNode => {
                                    // Always use empId to find the employee (not orgTree.employee)
                                    const empData = employees.find(
                                      (e) => e.employeeId === empId,
                                    );
                                    const subTree =
                                      directReportTrees.get(empId);

                                    if (!empData) {
                                      console.log(
                                        `[Top View L${level}] ❌ Employee not found: ${empId}`,
                                      );
                                      return null;
                                    }

                                    const managerName =
                                      empData.reportingManagerId
                                        ? employees.find(
                                            (e) =>
                                              e.employeeId ===
                                              empData.reportingManagerId,
                                          )?.name || empData.reportingManagerId
                                        : "None";

                                    const directReportCount =
                                      subTree?.directReports?.filter(
                                        (r) => r.relationship === "direct",
                                      ).length || 0;

                                    console.log(
                                      `[Top View L${level}] Rendering: ${empData.name} (${empId}), direct reports: ${directReportCount}`,
                                    );

                                    // Log children
                                    if (
                                      subTree?.directReports &&
                                      subTree.directReports.length > 0
                                    ) {
                                      subTree.directReports
                                        .filter(
                                          (r) =>
                                            r?.employee &&
                                            r.relationship === "direct",
                                        )
                                        .forEach((report) => {
                                          const childEmpId =
                                            report.employee!.employeeId ||
                                            report.employee!.id;
                                          console.log(
                                            `  [Top View L${level}] └─ Child: ${report.employee!.name} (${childEmpId})`,
                                          );
                                        });
                                    }

                                    return (
                                      <TreeNode
                                        key={empId}
                                        label={
                                          <div className="relative inline-block">
                                            <Card
                                              className={`w-[260px] h-[135px] cursor-pointer hover:shadow-lg transition-all ${level === 0 ? "border-2 border-primary/60" : ""}`}
                                              onClick={() =>
                                                navigate(
                                                  `/employee/profile/${empId}`,
                                                )
                                              }
                                            >
                                              <CardContent className="p-3 h-full">
                                                <div className="flex items-center gap-3 h-full">
                                                  <div
                                                    className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                                                    style={{
                                                      backgroundColor:
                                                        getAvatarColor(
                                                          empId || "employee",
                                                        ),
                                                    }}
                                                  >
                                                    {empData.name
                                                      ?.split(" ")
                                                      .map((n) => n[0])
                                                      .join("")
                                                      .toUpperCase()
                                                      .slice(0, 2) || "??"}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <h3 className="text-left font-semibold text-sm break-words">
                                                      {empData.name || "N/A"}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground break-words text-left">
                                                      {empData.designation ||
                                                        "N/A"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/80 break-words text-left">
                                                      {empData.department ||
                                                        "N/A"}
                                                    </p>
                                                    <p className="text-[10px] text-blue-600 break-words text-left font-medium">
                                                      Mgr: {managerName}
                                                    </p>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                            {/* Count Badge */}
                                            {directReportCount > 0 && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); toggleDirectReportsForEmployee(empId); }}
                                                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg z-10 cursor-pointer transition-all"
                                              >
                                                <span className="text-sm font-bold">
                                                  {expandedDirectReports.has(empId) ? "−" : directReportCount}
                                                </span>
                                              </button>
                                            )}
                                          </div>
                                        }
                                      >
                                        {/* Recursively render all direct reports */}
                                        {(level === 0 || expandedDirectReports.has(empId)) && subTree?.directReports &&
                                          subTree.directReports
                                            .filter(
                                              (r) =>
                                                r?.employee &&
                                                r.relationship === "direct",
                                            )
                                            .map((report) => {
                                              const childEmpId =
                                                (report.employee!.employeeId ||
                                                report.employee!.id) as string;
                                              return renderFullHierarchy(
                                                childEmpId,
                                                level + 1,
                                              );
                                            })}
                                      </TreeNode>
                                    );
                                  };

                                  // Render ALL top-level employees (those with no manager)
                                  const topLevelEmployees = employees.filter(
                                    (e) =>
                                      e.status === "active" &&
                                      !e.reportingManagerId,
                                  );
                                  console.log(
                                    `[Top View] Rendering ${topLevelEmployees.length} top-level employees`,
                                  );
                                  return (
                                    <>
                                      {topLevelEmployees.map((emp) =>
                                        renderFullHierarchy(emp.employeeId, 0),
                                      )}
                                    </>
                                  );
                                })())}
                      </Tree>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
