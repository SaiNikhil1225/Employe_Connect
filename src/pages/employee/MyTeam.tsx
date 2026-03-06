import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  MapPin,
  Search,
  Users,
  Building2,
  Clock,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEmployeeStore } from "@/store/employeeStore";
import type { Employee } from "@/services/employeeService";
import { cn } from "@/lib/utils";
import {
  attendanceService,
  type AttendanceRecord,
} from "@/services/attendanceService";
import { leaveService } from "@/services/leaveService";
import { getHolidays } from "@/services/holidayService";
import { PageHeader } from "@/components/ui/page-header";
import { getAvatarGradient } from "@/constants/design-system";
import type { LeaveRequest } from "@/types/leave";
import type { Holiday } from "@/types/holiday";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MyTeam() {
  const user = useAuthStore((state) => state.user);
  const employees = useEmployeeStore((state) => state.employees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [lateEmployeesDrawerOpen, setLateEmployeesDrawerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get current date in YYYY-MM-DD format
  const currentDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Fetch attendance data for today
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const data = await attendanceService.getAttendanceByDate(currentDate);
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchAttendanceData();
  }, [currentDate]);

  // Fetch holidays for current date
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const response = await getHolidays({ year: year as any });
        if (response.success && response.data) {
          setHolidays(response.data.holidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  // Fetch all approved leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await leaveService.getAll();
        const approvedLeaves = data.filter(
          (leave) => leave.status === "approved",
        );
        setLeaves(approvedLeaves);
      } catch (error) {
        console.error("Error fetching leaves:", error);
      }
    };
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  // Get current user's full employee record
  const currentEmployee = useMemo(() => {
    return employees.find(
      (emp: Employee) => emp.employeeId === user?.employeeId,
    );
  }, [employees, user]);

  // Filter team members - all employees who share the same Reporting Manager
  const teamMembers = useMemo(() => {
    let teamList: Employee[] = [];

    if (currentEmployee?.reportingManagerId) {
      // Show all employees (including self) who report to the same manager
      teamList = employees.filter((emp: Employee) =>
        emp.reportingManagerId === currentEmployee.reportingManagerId
      );
    }

    let filtered = teamList;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (emp: Employee) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.designation.toLowerCase().includes(query) ||
          emp.location?.toLowerCase().includes(query),
      );
    }

    // Sort alphabetically by name (A → Z)
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, currentEmployee, searchQuery]);

  // Get status badge color and text based on attendance logs, holidays, and leaves
  const getStatusBadge = (employeeId: string) => {
    // Check if today is a holiday
    const todayHoliday = holidays.find((holiday) => {
      const holidayDate = new Date(holiday.date).toISOString().split("T")[0];
      return holidayDate === currentDate;
    });
    if (todayHoliday) {
      return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400";
    }

    // Check if employee is on approved leave
    const employeeLeave = leaves.find((leave) => {
      if (leave.employeeId !== employeeId) return false;
      const leaveStart = new Date(leave.startDate).toISOString().split("T")[0];
      const leaveEnd = new Date(leave.endDate).toISOString().split("T")[0];
      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });
    if (employeeLeave) {
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400";
    }

    // Check attendance log
    const attendance = attendanceData.find(
      (att) => att.employeeId === employeeId,
    );
    if (attendance?.status === "Present") {
      return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400";
    }

    // Default: Not in yet
    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400";
  };

  const getStatusText = (employeeId: string) => {
    // Check if today is a holiday
    const todayHoliday = holidays.find((holiday) => {
      const holidayDate = new Date(holiday.date).toISOString().split("T")[0];
      return holidayDate === currentDate;
    });
    if (todayHoliday) {
      return "Holiday";
    }

    // Check if employee is on approved leave
    const employeeLeave = leaves.find((leave) => {
      if (leave.employeeId !== employeeId) return false;
      const leaveStart = new Date(leave.startDate).toISOString().split("T")[0];
      const leaveEnd = new Date(leave.endDate).toISOString().split("T")[0];
      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });
    if (employeeLeave) {
      return "Leave";
    }

    // Check attendance log
    const attendance = attendanceData.find(
      (att) => att.employeeId === employeeId,
    );
    if (attendance?.status === "Present") {
      return "IN";
    }

    // Default: Not in yet
    return "NOT IN YET";
  };

  // Get attendance stats
  const attendanceStats = useMemo(() => {
    const totalEmployees = employees.length;
    const notInYetCount = employees.filter((emp) => {
      const attendance = attendanceData.find(
        (att) => att.employeeId === emp.employeeId,
      );
      const onLeave = leaves.some((leave) => {
        if (leave.employeeId !== emp.employeeId) return false;
        const leaveStart = new Date(leave.startDate)
          .toISOString()
          .split("T")[0];
        const leaveEnd = new Date(leave.endDate).toISOString().split("T")[0];
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      });
      const isHoliday = holidays.some((holiday) => {
        const holidayDate = new Date(holiday.date).toISOString().split("T")[0];
        return holidayDate === currentDate;
      });
      return !attendance && !onLeave && !isHoliday;
    }).length;

    const lateArrivals = attendanceData.filter((att) => {
      if (!att.checkIn) return false;
      const checkInTime = att.checkIn.split(":");
      const hours = Number.parseInt(checkInTime[0], 10);
      const minutes = Number.parseInt(checkInTime[1], 10);
      // Consider late if check-in is after 10:00 AM
      return hours > 10 || (hours === 10 && minutes > 0);
    });

    const onTimeCount = attendanceData.filter((att) => {
      if (!att.checkIn) return false;
      const checkInTime = att.checkIn.split(":");
      const hours = Number.parseInt(checkInTime[0], 10);
      const minutes = Number.parseInt(checkInTime[1], 10);
      // On time if check-in is at or before 10:00 AM
      return hours < 10 || (hours === 10 && minutes === 0);
    }).length;

    const offCount = employees.filter((emp) => {
      return leaves.some((leave) => {
        if (leave.employeeId !== emp.employeeId) return false;
        const leaveStart = new Date(leave.startDate)
          .toISOString()
          .split("T")[0];
        const leaveEnd = new Date(leave.endDate).toISOString().split("T")[0];
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      });
    }).length;

    return {
      total: totalEmployees,
      onTime: onTimeCount,
      late: lateArrivals.length,
      lateEmployees: lateArrivals,
      wfh: 0, // Placeholder
      remote: 0, // Placeholder
      off: offCount,
      notInYet: notInYetCount,
    };
  }, [employees, attendanceData, leaves, holidays, currentDate]);

  return (
    <div className="page-container">
      <PageHeader
        icon={Users}
        title="My Team"
        description="View and manage your team members and their attendance"
      />

      {/* Attendance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Who is off today */}
        <Card className="border border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Who is off today
            </h3>
            {attendanceStats.off > 0 ? (
              <div className="flex items-center gap-3">
                {employees
                  .filter((emp) => {
                    return leaves.some((leave) => {
                      if (leave.employeeId !== emp.employeeId) return false;
                      const leaveStart = new Date(leave.startDate)
                        .toISOString()
                        .split("T")[0];
                      const leaveEnd = new Date(leave.endDate)
                        .toISOString()
                        .split("T")[0];
                      return (
                        currentDate >= leaveStart && currentDate <= leaveEnd
                      );
                    });
                  })
                  .slice(0, 3)
                  .map((emp: Employee) => (
                    <div
                      key={emp.employeeId}
                      className="flex flex-col items-center"
                    >
                      {emp.profilePhoto ? (
                        <img
                          src={emp.profilePhoto}
                          alt={emp.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-border ${getAvatarGradient(emp.name)}`}>
                          {emp.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-1">
                        {emp.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No employees is off today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Not in yet today */}
        <Card className="border border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Not in yet today
            </h3>
            {attendanceStats.notInYet > 0 ? (
              <div className="flex items-center gap-3">
                {employees
                  .filter((emp) => {
                    const attendance = attendanceData.find(
                      (att) => att.employeeId === emp.employeeId,
                    );
                    const onLeave = leaves.some((leave) => {
                      if (leave.employeeId !== emp.employeeId) return false;
                      const leaveStart = new Date(leave.startDate)
                        .toISOString()
                        .split("T")[0];
                      const leaveEnd = new Date(leave.endDate)
                        .toISOString()
                        .split("T")[0];
                      return (
                        currentDate >= leaveStart && currentDate <= leaveEnd
                      );
                    });
                    const isHoliday = holidays.some((holiday) => {
                      const holidayDate = new Date(holiday.date)
                        .toISOString()
                        .split("T")[0];
                      return holidayDate === currentDate;
                    });
                    return !attendance && !onLeave && !isHoliday;
                  })
                  .slice(0, 3)
                  .map((emp: Employee) => (
                    <div
                      key={emp.employeeId}
                      className="flex flex-col items-center"
                    >
                      {emp.profilePhoto ? (
                        <img
                          src={emp.profilePhoto}
                          alt={emp.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-border ${getAvatarGradient(emp.name)}`}>
                          {emp.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-1">
                        {emp.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Everyone is in!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Employees On Time today
            </p>
            <p className="text-2xl font-bold text-foreground">
              {attendanceStats.onTime}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 relative">
            <p className="text-xs text-muted-foreground mb-1">
              Late Arrivals today
            </p>
            <p className="text-2xl font-bold text-foreground">
              {attendanceStats.late}
            </p>
            {attendanceStats.late > 0 && (
              <button
                onClick={() => setLateEmployeesDrawerOpen(true)}
                className="absolute bottom-2 right-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Employees
              </button>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Work from Home / On Duty today
            </p>
            <p className="text-2xl font-bold text-foreground">
              {attendanceStats.wfh}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Remote Clock-ins today
            </p>
            <p className="text-2xl font-bold text-foreground">
              {attendanceStats.remote}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Calendar */}
      <Card className="border border-border mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Team calendar
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <button
              className="p-1 hover:bg-muted rounded"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
            >
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-medium text-foreground">
              {currentMonth.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              className="p-1 hover:bg-muted rounded"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
            >
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar Timeline Grid */}
          {(() => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Generate array of days with their day names
            const daysArray: Array<{
              day: number;
              dayName: string;
              date: Date;
            }> = [];
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              daysArray.push({ day, dayName, date });
            }

            // Get employees with leave data for this month
            const employeesWithLeaves = teamMembers.map((member) => {
              const employeeLeaves = leaves.filter((leave) => {
                if (leave.employeeId !== member.employeeId) return false;
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);
                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                return leaveStart <= monthEnd && leaveEnd >= monthStart;
              });
              return { ...member, leavesThisMonth: employeeLeaves };
            });

            const hasAnyLeaves = employeesWithLeaves.some(
              (emp) => emp.leavesThisMonth.length > 0,
            );

            if (!hasAnyLeaves) {
              return (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Nobody is on leave for the selected month
                  </p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Header Row - Days */}
                  <div className="flex items-center border-b border-border">
                    <div className="w-48 flex-shrink-0 p-2"></div>
                    <div className="flex">
                      {daysArray.map(({ day, dayName }) => (
                        <div
                          key={`header-${day}`}
                          className="w-12 flex-shrink-0 text-center"
                        >
                          <div className="text-xs font-semibold text-muted-foreground">
                            {dayName.slice(0, 2)}
                          </div>
                          <div className="text-xs font-medium text-foreground mt-1">
                            {day}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Rows */}
                  {employeesWithLeaves
                    .filter((emp) => emp.leavesThisMonth.length > 0)
                    .map((employee) => (
                      <div
                        key={employee.employeeId}
                        className="flex items-center border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        {/* Employee Info */}
                        <div className="w-48 flex-shrink-0 p-3 flex items-center gap-2">
                          {employee.profilePhoto ? (
                            <img
                              src={employee.profilePhoto}
                              alt={employee.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarGradient(employee.name)}`}>
                              {employee.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {employee.name.split(" ").slice(0, 2).join(" ")}
                            </div>
                          </div>
                        </div>

                        {/* Days Grid */}
                        <div className="flex">
                          {daysArray.map(({ day, date }) => {
                            const dateStr = date.toISOString().split("T")[0];

                            // Check if employee is on leave this day
                            const onLeave = employee.leavesThisMonth.some(
                              (leave) => {
                                const leaveStart = new Date(leave.startDate)
                                  .toISOString()
                                  .split("T")[0];
                                const leaveEnd = new Date(leave.endDate)
                                  .toISOString()
                                  .split("T")[0];
                                return (
                                  dateStr >= leaveStart && dateStr <= leaveEnd
                                );
                              },
                            );

                            if (!onLeave) {
                              return (
                                <div
                                  key={`${employee.employeeId}-${day}`}
                                  className="w-12 h-12 flex items-center justify-center"
                                ></div>
                              );
                            }

                            // Get the leave details for color
                            const leave = employee.leavesThisMonth.find((l) => {
                              const leaveStart = new Date(l.startDate)
                                .toISOString()
                                .split("T")[0];
                              const leaveEnd = new Date(l.endDate)
                                .toISOString()
                                .split("T")[0];
                              return (
                                dateStr >= leaveStart && dateStr <= leaveEnd
                              );
                            });

                            let color = "bg-blue-500";
                            if (leave?.leaveType === "Earned Leave") {
                              color = "bg-green-500";
                            } else if (leave?.leaveType === "Sick Leave") {
                              color = "bg-red-500";
                            }

                            return (
                              <div
                                key={`${employee.employeeId}-${day}`}
                                className="w-12 h-12 flex items-center justify-center"
                              >
                                <div
                                  className={`h-6 w-6 rounded-full ${color}`}
                                  title={`${employee.name} - ${leave?.leaveType || "Leave"}`}
                                ></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })()}

          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-muted-foreground">Work from home</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">On duty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Paid Leave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">Unpaid Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Team Members ({teamMembers.length})
        </h2>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search team members"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {teamMembers.map((member: Employee) => (
            <Card
              key={member.employeeId}
              className="group relative border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              onClick={() => {
                sessionStorage.setItem("profileReferrer", "/employee/my-team");
                navigate(`/employee/profile/${member.employeeId}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  sessionStorage.setItem(
                    "profileReferrer",
                    "/employee/my-team",
                  );
                  navigate(`/employee/profile/${member.employeeId}`);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${member.name}'s profile`}
            >
              <CardContent className="p-5">
                {/* Profile Picture - Larger at top */}
                <div className="flex justify-center mb-4">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-border ${getAvatarGradient(member.name)}`}>
                      {member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Name + Designation */}
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-foreground text-base mb-1">
                    {member.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {member.designation}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  <Badge
                    className={cn(
                      "text-xs px-3 py-1 rounded-full font-medium",
                      getStatusBadge(member.employeeId),
                    )}
                  >
                    {getStatusText(member.employeeId)}
                  </Badge>
                </div>

                {/* Contact Information */}
                <div className="space-y-2.5">
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

                  {/* Department */}
                  <div className="flex items-start gap-2">
                    <Building2
                      className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                      aria-label="Department"
                    />
                    <span className="text-xs text-foreground leading-relaxed">
                      {member.department || "Not specified"}
                    </span>
                  </div>

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

                  {/* Phone */}
                  <div className="flex items-start gap-2">
                    <Phone
                      className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                      aria-label="Mobile"
                    />
                    <span className="text-xs text-foreground leading-relaxed">
                      {member.phone || "Not specified"}
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
              No team members found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? "No team members match your search criteria."
                : "No reporting manager is assigned to your profile, or no other employees share the same reporting manager."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Late Employees Drawer */}
      <Sheet
        open={lateEmployeesDrawerOpen}
        onOpenChange={setLateEmployeesDrawerOpen}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>View Employees</SheetTitle>
              <button
                onClick={() => setLateEmployeesDrawerOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </SheetHeader>

          <div className="mt-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-10" />
              </div>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Total: {attendanceStats.late}
            </div>

            <div className="space-y-3">
              {attendanceStats.lateEmployees?.map((attendance) => {
                const employee = employees.find(
                  (emp) => emp.employeeId === attendance.employeeId,
                );
                if (!employee) return null;

                // Calculate delay
                const checkInTime = attendance.checkIn || "";
                const [hours, minutes] = checkInTime.split(":").map(Number);
                const checkInMinutes = hours * 60 + minutes;
                const standardTime = 10 * 60; // 10:00 AM
                const delayMinutes = checkInMinutes - standardTime;
                const delayHours = Math.floor(delayMinutes / 60);
                const delayMins = delayMinutes % 60;
                let delayText: string;
                if (delayHours > 0) {
                  delayText = `${delayHours}h ${delayMins}m ${Math.max(delayMinutes, 0)}s`;
                } else {
                  delayText = `${delayMins}m ${Math.max(delayMinutes, 0)}s`;
                }

                return (
                  <div
                    key={attendance.employeeId}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {employee.profilePhoto ? (
                          <img
                            src={employee.profilePhoto}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarGradient(employee.name)}`}>
                            {employee.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {employee.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employeeId}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          DEPARTMENT
                        </span>
                        <span className="text-foreground">
                          {employee.department || "Not Available"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          SUB DEPARTMENT
                        </span>
                        <span className="text-foreground">Not Available</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">LOCATION</span>
                        <span className="text-foreground">
                          {employee.location || "Not Available"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">JOB TITLE</span>
                        <span className="text-foreground">
                          {employee.designation}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          CLOCK-IN TIME
                        </span>
                        <span className="text-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {checkInTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          ASSIGNED SHIFT
                        </span>
                        <span className="text-foreground">General Shift</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">DELAY</span>
                        <span className="text-red-600 dark:text-red-400">
                          {delayText}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
