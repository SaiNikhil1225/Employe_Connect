import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  FileText,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Columns3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { useLeaveStore } from '@/store/leaveStore';
import { getAvatarGradient } from '@/constants/design-system';

import { leaveAttendanceOverviewService } from '@/services/leaveAttendanceOverviewService';
import type {
  LeaveAttendanceKPIs,
  LeaveBreakdown,
  MonthlyTrend,
  LateArrival,
  LeaveRequestForApproval,
  EmployeeLeaveAttendanceDetail
} from '@/services/leaveAttendanceOverviewService';

// Chart colors
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

export function LeaveAttendanceOverview() {
  const navigate = useNavigate();
  const { permissions } = useProfile();
  const isHRAdmin = permissions?.canEditEmployees || false;

  console.log('LeaveAttendanceOverview - User permissions:', { 
    permissions, 
    isHRAdmin
  });

  // Leave store data
  const leaves = useLeaveStore((state) => state.leaves);

  // State management
  const [kpis, setKpis] = useState<LeaveAttendanceKPIs | null>(null);
  const [leaveBreakdown, setLeaveBreakdown] = useState<LeaveBreakdown[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [lateArrivals, setLateArrivals] = useState<LateArrival[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestForApproval[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeLeaveAttendanceDetail[]>([]);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter state
  const [fromDate, setFromDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Leave requests filters (for HR admin)
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('pending');
  const [expandedLeaveId, setExpandedLeaveId] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bulk selection state for leave approvals
  const [selectedLeaveIds, setSelectedLeaveIds] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  // Column visibility state for employee details table
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  
  // Filter visibility state for leave requests
  const [showLeaveFilters, setShowLeaveFilters] = useState(false);
  
  // Filter visibility state for overview filters
  const [showOverviewFilters, setShowOverviewFilters] = useState(false);
  
  // Overview attendance filters
  const [presentFilter, setPresentFilter] = useState<string>('');
  const [absentFilter, setAbsentFilter] = useState<string>('');
  const [lateFilter, setLateFilter] = useState<string>('');
  const [attendanceRateFilter, setAttendanceRateFilter] = useState<string>('');

  // Fetch all data
  const fetchData = async () => {
    try {
      const startDate = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
      const endDate = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

      console.log('Fetching dashboard data...');

      const [kpisData, breakdownData, trendData, lateArrivalsData] = await Promise.all([
        leaveAttendanceOverviewService.getKPIs(startDate, endDate),
        leaveAttendanceOverviewService.getLeaveBreakdown(startDate, endDate),
        leaveAttendanceOverviewService.getMonthlyTrend(selectedYear),
        leaveAttendanceOverviewService.getLateArrivals(startDate, endDate, 20)
      ]);

      console.log('Dashboard data fetched:', { kpisData, breakdownData, trendData, lateArrivalsData });
      console.log('KPIs Data Details:', {
        totalEmployees: kpisData?.totalEmployees,
        presentToday: kpisData?.presentToday,
        onLeaveToday: kpisData?.onLeaveToday,
        attendanceType: typeof kpisData?.totalEmployees
      });

      setKpis(kpisData);
      setLeaveBreakdown(breakdownData);
      setMonthlyTrend(trendData);
      setLateArrivals(lateArrivalsData);

      // Fetch leave requests and employee details only for HR admin
      if (isHRAdmin) {
        console.log('User is HR Admin, fetching admin data...');
        try {
          const [requestsData, employeeDetailsData] = await Promise.all([
            leaveAttendanceOverviewService.getLeaveRequests({
              status: leaveStatusFilter,
              startDate,
              endDate,
              department: departmentFilter || undefined,
              location: locationFilter || undefined,
              leaveType: leaveTypeFilter || undefined,
              employmentType: employmentTypeFilter || undefined
            }),
            leaveAttendanceOverviewService.getEmployeeDetails(startDate, endDate)
          ]);
          console.log('HR admin data fetched:', { 
            requestsCount: requestsData.length, 
            employeeDetailsCount: employeeDetailsData.length 
          });
          setLeaveRequests(requestsData);
          setEmployeeDetails(employeeDetailsData);
        } catch (adminError: any) {
          console.error('Error fetching admin data:', adminError);
          if (adminError?.response?.status === 403) {
            console.warn('403 Forbidden - User may not have HR admin privileges');
            toast.error('You do not have permission to view employee details. Please contact your administrator.');
          } else {
            throw adminError; // Re-throw other errors to be caught by outer catch
          }
        }
      } else {
        console.log('User is not HR Admin, skipping admin data fetch');
      }
      
      console.log('Data loading completed successfully');
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load dashboard data';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, selectedYear, leaveStatusFilter, departmentFilter, locationFilter, leaveTypeFilter, employmentTypeFilter, isHRAdmin]);

  // Helper functions
  const formatLeaveDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate === endDate) {
      return format(start, 'MMM dd, yyyy');
    }
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  // Filter approved leaves for team leave details
  const teamLeaves = leaves.filter(l => l.status === 'approved');

  // Handle leave approval/rejection
  const handleLeaveAction = async (
    leaveId: string,
    action: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    try {
      await leaveAttendanceOverviewService.updateLeaveStatus(
        leaveId,
        action,
        rejectionReason
      );
      toast.success(`Leave request ${action} successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'} leave request`);
    }
  };

  // Handle bulk leave approval
  const handleBulkApprove = async () => {
    if (selectedLeaveIds.length === 0) {
      toast.error('Please select at least one leave request');
      return;
    }

    try {
      const promises = selectedLeaveIds.map(leaveId =>
        leaveAttendanceOverviewService.updateLeaveStatus(leaveId, 'approved')
      );
      await Promise.all(promises);
      toast.success(`${selectedLeaveIds.length} leave request(s) approved successfully`);
      setSelectedLeaveIds([]);
      setIsSelectAll(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving leave requests:', error);
      toast.error('Failed to approve some leave requests');
    }
  };

  // Handle bulk leave rejection
  const handleBulkReject = async () => {
    if (selectedLeaveIds.length === 0) {
      toast.error('Please select at least one leave request');
      return;
    }

    const reason = prompt('Please enter rejection reason:');
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      const promises = selectedLeaveIds.map(leaveId =>
        leaveAttendanceOverviewService.updateLeaveStatus(leaveId, 'rejected', reason)
      );
      await Promise.all(promises);
      toast.success(`${selectedLeaveIds.length} leave request(s) rejected successfully`);
      setSelectedLeaveIds([]);
      setIsSelectAll(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting leave requests:', error);
      toast.error('Failed to reject some leave requests');
    }
  };

  // Handle checkbox selection
  const handleSelectLeave = (leaveId: string) => {
    setSelectedLeaveIds(prev => {
      if (prev.includes(leaveId)) {
        return prev.filter(id => id !== leaveId);
      } else {
        return [...prev, leaveId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (filteredRequests: LeaveRequestForApproval[]) => {
    if (isSelectAll) {
      setSelectedLeaveIds([]);
      setIsSelectAll(false);
    } else {
      setSelectedLeaveIds(filteredRequests.map(req => req._id));
      setIsSelectAll(true);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFromDate(startOfMonth(new Date()));
    setToDate(endOfMonth(new Date()));
    setPresentFilter('');
    setAbsentFilter('');
    setLateFilter('');
    setAttendanceRateFilter('');
    fetchData();
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // KPIs Sheet
      if (kpis) {
        const kpisData = [
          ['Metric', 'Value'],
          ['Total Employees', kpis.totalEmployees],
          ['Present Today', kpis.presentToday],
          ['On Leave Today', kpis.onLeaveToday],
          ['Attendance Rate (%)', kpis.attendanceRate],
          ['Leave Utilization Rate (%)', kpis.leaveUtilizationRate],
          ['Late Arrivals (MTD)', kpis.lateArrivalsMTD],
          ['Overtime Hours (MTD)', kpis.overtimeHoursMTD]
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(kpisData);
        XLSX.utils.book_append_sheet(wb, ws1, 'KPIs');
      }

      // Leave Breakdown Sheet
      if (leaveBreakdown.length > 0) {
        const breakdownData = leaveBreakdown.map(item => ({
          'Leave Type': item.leaveType,
          'Count': item.count,
          'Total Days': item.totalDays,
          'Percentage': item.percentage
        }));
        const ws2 = XLSX.utils.json_to_sheet(breakdownData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Leave Breakdown');
      }

      // Monthly Trend Sheet
      if (monthlyTrend.length > 0) {
        const trendData = monthlyTrend.map(item => ({
          'Month': item.month,
          'Present': item.present,
          'Absent': item.absent,
          'Late': item.late,
          'Leaves': item.leaves
        }));
        const ws3 = XLSX.utils.json_to_sheet(trendData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Trend');
      }

      // Late Arrivals Sheet
      if (lateArrivals.length > 0) {
        const lateArrivalsData = lateArrivals.map(item => ({
          'Employee ID': item.employeeId,
          'Employee Name': item.employeeName,
          'Department': item.department,
          'Date': item.date,
          'Check In': item.checkIn,
          'Notes': item.notes || ''
        }));
        const ws4 = XLSX.utils.json_to_sheet(lateArrivalsData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Late Arrivals');
      }

      XLSX.writeFile(wb, `Leave_Attendance_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export report');
    }
  };

  // Export to PDF (placeholder - requires jspdf and html2canvas packages)
  const exportToPDF = async () => {
    toast.info('PDF export feature requires additional packages. Use Excel export instead.');
  };

  // Render KPI Cards
  const renderKPICards = () => {
    if (!kpis) return null;

    console.log('Rendering KPI Cards with:', { 
      isHRAdmin, 
      totalEmployees: kpis.totalEmployees,
      presentToday: kpis.presentToday,
      kpisObject: kpis 
    });

    const kpiData = [
      {
        title: isHRAdmin ? 'Total Employees' : 'My Status',
        value: isHRAdmin ? (kpis.totalEmployees ?? 0) : (kpis.presentToday > 0 ? 'Present' : 'Absent'),
        icon: Users
      },
      {
        title: 'Present Today',
        value: isHRAdmin ? (kpis.presentToday ?? 0) : (kpis.presentToday > 0 ? '✓' : '-'),
        icon: CheckCircle2
      },
      {
        title: 'On Leave Today',
        value: kpis.onLeaveToday ?? 0,
        icon: Calendar
      },
      {
        title: 'Attendance Rate',
        value: `${kpis.attendanceRate ?? 0}%`,
        icon: TrendingUp
      },
      {
        title: 'Leave Utilization',
        value: `${kpis.leaveUtilizationRate ?? 0}%`,
        icon: FileText
      },
      {
        title: 'Late Arrivals (MTD)',
        value: kpis.lateArrivalsMTD ?? 0,
        icon: Clock
      }
    ];

    // For regular users, show only relevant KPIs
    const displayKpis = isHRAdmin ? kpiData : kpiData.slice(0, 4);

    // Define consistent styling arrays for all metrics
    const cardStyles = [
      'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
      'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20',
      'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
      'border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
      'border-l-4 border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/20',
      'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
    ];

    const iconBgStyles = [
      'bg-blue-100 dark:bg-blue-900/30',
      'bg-green-100 dark:bg-green-900/30',
      'bg-orange-100 dark:bg-orange-900/30',
      'bg-purple-100 dark:bg-purple-900/30',
      'bg-pink-100 dark:bg-pink-900/30',
      'bg-red-100 dark:bg-red-900/30'
    ];

    const iconColorStyles = [
      'text-blue-600',
      'text-green-600',
      'text-orange-600',
      'text-purple-600',
      'text-pink-600',
      'text-red-600'
    ];

    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {displayKpis.map((kpi, index) => {
          const Icon = kpi.icon;
          
          return (
            <Card key={index} className={`hover:shadow-md transition-shadow rounded-xl shadow-sm cursor-pointer ${cardStyles[index] || cardStyles[0]}`}>
              <CardContent className="p-4">
                <div className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{kpi.title}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{kpi.value}</span>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${iconBgStyles[index] || iconBgStyles[0]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${iconColorStyles[index] || iconColorStyles[0]}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render Leave Breakdown Chart
  const renderLeaveBreakdownChart = () => {
    if (leaveBreakdown.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No leave data available for the selected period
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={leaveBreakdown}
            dataKey="totalDays"
            nameKey="leaveType"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.leaveType}: ${entry.percentage}%`}
          >
            {leaveBreakdown.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render Monthly Trend Chart
  const renderMonthlyTrendChart = () => {
    if (monthlyTrend.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No trend data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={monthlyTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" strokeWidth={2} />
          <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
          <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" strokeWidth={2} />
          <Line type="monotone" dataKey="leaves" stroke="#8b5cf6" name="Leaves" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render Late Arrivals Table
  const renderLateArrivalsTable = () => {
    if (lateArrivals.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No late arrivals recorded for the selected period
        </div>
      );
    }

    // Define table columns for late arrivals
    const lateArrivalsColumns: DataTableColumn<LateArrival>[] = [
      {
        key: 'employeeName',
        label: 'Employee',
        sortable: true,
        align: 'left',
        width: '200px',
        render: (_, arrival) => (
          <div className="flex items-center gap-2">
            <EmployeeAvatar 
              employee={{ 
                employeeId: arrival.employeeId, 
                name: arrival.employeeName 
              }} 
              size="sm" 
            />
            <div>
              <div className="font-medium text-sm">{arrival.employeeName}</div>
              <div className="text-xs text-muted-foreground">{arrival.employeeId}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'department',
        label: 'Department',
        sortable: true,
        align: 'left',
        render: (value) => <span className="text-sm">{value}</span>,
      },
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        align: 'left',
        render: (value) => <span className="text-sm">{format(new Date(value), 'MMM dd, yyyy')}</span>,
      },
      {
        key: 'checkIn',
        label: 'Check In Time',
        sortable: true,
        align: 'left',
        render: (value) => (
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{value}</span>
        ),
      },
      {
        key: 'notes',
        label: 'Notes',
        sortable: false,
        align: 'left',
        render: (value) => <span className="text-sm text-muted-foreground">{value || '-'}</span>,
      },
    ];

    return (
      <DataTable
        data={lateArrivals}
        columns={lateArrivalsColumns}
        searchable={false}
        hideColumnToggle={true}
        pageSize={10}
        emptyMessage="No late arrivals recorded for the selected period"
      />
    );
  };

  // Render Employee Details Table (HR Admin only)
  const renderEmployeeDetailsTable = () => {
    if (!isHRAdmin) {
      return null;
    }

    if (employeeDetails.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No employee data available for the selected period
        </div>
      );
    }

    // Define table columns for employee details
    const employeeDetailsColumns: DataTableColumn<EmployeeLeaveAttendanceDetail>[] = [
      {
        key: 'employeeId',
        label: 'Employee ID',
        sortable: true,
        align: 'left',
        width: '120px',
        sticky: 'left',
        render: (value) => <span className="font-medium text-sm">{value}</span>,
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        align: 'left',
        width: '200px',
        sticky: 'left',
        render: (_, employee) => (
          <div className="flex items-center gap-2">
            <EmployeeAvatar
              employee={{ employeeId: employee.employeeId, name: employee.name }}
              size="sm"
            />
            <div>
              <span className="text-sm font-medium">{employee.name}</span>
              <div className="text-xs text-muted-foreground">{employee.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'department',
        label: 'Department',
        sortable: true,
        align: 'left',
        render: (value) => <span className="text-sm">{value}</span>,
      },
      {
        key: 'designation',
        label: 'Designation',
        sortable: true,
        align: 'left',
        render: (value) => <span className="text-sm">{value}</span>,
      },
      {
        key: 'location',
        label: 'Location',
        sortable: true,
        align: 'left',
        render: (value) => <span className="text-sm">{value}</span>,
      },
      {
        key: 'todayStatus',
        label: 'Today Status',
        sortable: true,
        align: 'left',
        render: (value) => {
          const statusColor = 
            value.startsWith('On Leave') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
            value === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            value === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
            value === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
            'bg-gray-100 text-gray-700';
          return (
            <Badge className={`${statusColor} border-0 text-xs`}>
              {value}
            </Badge>
          );
        },
      },
      {
        key: 'presentDays',
        label: 'Present',
        sortable: true,
        align: 'center',
        render: (value) => <span className="text-sm font-medium text-green-600 dark:text-green-400">{value}</span>,
      },
      {
        key: 'absentDays',
        label: 'Absent',
        sortable: true,
        align: 'center',
        render: (value) => <span className="text-sm font-medium text-red-600 dark:text-red-400">{value}</span>,
      },
      {
        key: 'lateDays',
        label: 'Late',
        sortable: true,
        align: 'center',
        render: (value) => <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{value}</span>,
      },
      {
        key: 'totalLeaveDays',
        label: 'Leave Days',
        sortable: true,
        align: 'center',
        render: (value) => <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{value}</span>,
      },
      {
        key: 'attendanceRate',
        label: 'Attendance Rate',
        sortable: true,
        align: 'center',
        render: (value) => {
          const rate = typeof value === 'number' ? value : 0;
          const rateColor = 
            rate >= 95 ? 'text-green-600 dark:text-green-400 font-semibold' :
            rate >= 85 ? 'text-blue-600 dark:text-blue-400 font-medium' :
            rate >= 75 ? 'text-amber-600 dark:text-amber-400 font-medium' :
            'text-red-600 dark:text-red-400 font-semibold';
          return <span className={`text-sm ${rateColor}`}>{rate}%</span>;
        },
      },
      {
        key: 'leaveBalance',
        label: 'Leave Balance',
        sortable: false,
        align: 'left',
        render: (_, employee) => {
          if (employee.leaveBalance && Object.keys(employee.leaveBalance).length > 0) {
            return (
              <div className="space-y-1">
                {Object.entries(employee.leaveBalance).map(([type, balance]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate" title={type}>
                      {type.substring(0, 2).toUpperCase()}:
                    </span>
                    <span className="text-xs font-medium">{balance.available}</span>
                    <span className="text-[10px] text-muted-foreground">/{balance.allocated}</span>
                  </div>
                ))}
              </div>
            );
          }
          return <span className="text-xs text-muted-foreground">N/A</span>;
        },
      },
    ];

    // Toggle column visibility
    const toggleColumnVisibility = (key: string) => {
      setColumnVisibility(prev => ({
        ...prev,
        [key]: prev[key] === undefined ? false : !prev[key]
      }));
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-xl">Employee Leave & Attendance Details</CardTitle>
                <CardDescription className="mt-1">
                  Comprehensive view of all employees with attendance and leave data
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Column Visibility Toggle */}
              <DropdownMenu open={showColumnToggle} onOpenChange={setShowColumnToggle}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Columns3 className="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Toggle Columns</div>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {employeeDetailsColumns.map((column) => (
                      <DropdownMenuItem
                        key={column.key}
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer py-1.5 px-2"
                      >
                        <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility(column.key)}>
                          <Checkbox
                            checked={columnVisibility[column.key] !== false}
                            onCheckedChange={() => toggleColumnVisibility(column.key)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="flex-1 text-xs">{column.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={employeeDetails}
            columns={employeeDetailsColumns.map(col => ({ 
              ...col, 
              hidden: columnVisibility[col.key] === false 
            }))}
            searchable={false}
            hideColumnToggle={true}
            pageSize={15}
            emptyMessage="No employee data available for the selected period"
          />
        </CardContent>
      </Card>
    );
  };

  // Render Leave Requests (HR Admin only)
  const renderLeaveRequests = () => {
    if (!isHRAdmin) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Only HR administrators can view and manage leave requests</p>
          <Button 
            onClick={() => navigate('/leaves')} 
            className="mt-4"
            variant="outline"
          >
            View My Leave Requests
          </Button>
        </div>
      );
    }

    // Filter leave requests by search query
    const filteredRequests = leaveRequests.filter(request => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        request.employeeName.toLowerCase().includes(query) ||
        request.employeeId.toLowerCase().includes(query) ||
        request.department.toLowerCase().includes(query) ||
        request.location.toLowerCase().includes(query)
      );
    });

    // Get unique values for dropdowns
    const uniqueDepartments = [...new Set(leaveRequests.map(r => r.department))].filter(Boolean);
    const uniqueLocations = [...new Set(leaveRequests.map(r => r.location))].filter(Boolean);
    const uniqueLeaveTypes = [...new Set(leaveRequests.map(r => r.leaveType))].filter(Boolean);
    const uniqueEmploymentTypes = [...new Set(leaveRequests.map(r => r.employmentType))].filter(Boolean);

    // Check if any filters are active
    const hasActiveLeaveFilters = searchQuery || departmentFilter || locationFilter || leaveTypeFilter || employmentTypeFilter;

    return (
      <div className="space-y-4">
        {/* Filter Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-10"
              onClick={() => setShowLeaveFilters(!showLeaveFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showLeaveFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveLeaveFilters && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" />
              )}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredRequests.length} of {leaveRequests.length} requests
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showLeaveFilters && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Filter Leave Requests</h4>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('');
                  setLocationFilter('');
                  setLeaveTypeFilter('');
                  setEmploymentTypeFilter('');
                }} className="h-7 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search</label>
                  <Input
                    placeholder="Search by name, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    value={leaveStatusFilter}
                    onChange={(e) => setLeaveStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All Status</option>
                  </select>
                </div>
                
                {/* Leave Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leave Type</label>
                  <select
                    value={leaveTypeFilter}
                    onChange={(e) => setLeaveTypeFilter(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Types</option>
                    {uniqueLeaveTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                {/* Employment Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employment Type</label>
                  <select
                    value={employmentTypeFilter}
                    onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    <option value="">All Types</option>
                    {uniqueEmploymentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || departmentFilter || locationFilter || leaveTypeFilter || employmentTypeFilter) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setDepartmentFilter('');
                      setLocationFilter('');
                      setLeaveTypeFilter('');
                      setEmploymentTypeFilter('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {leaveRequests.length} leave requests
          </div>
        </div>

        {/* Bulk Action Buttons */}
        {filteredRequests.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={() => handleSelectAll(filteredRequests)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
                
                {selectedLeaveIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedLeaveIds.length} selected
                    </Badge>
                    <Button
                      size="sm"
                      onClick={handleBulkApprove}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkReject}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leave Requests Table */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No leave requests found matching your filters
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b-2">
                    <tr>
                      <th className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={() => handleSelectAll(filteredRequests)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Location</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Leave Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Days</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Applied On</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedLeaveIds.includes(request._id)}
                            onChange={() => handleSelectLeave(request._id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <EmployeeAvatar 
                              employee={{ 
                                employeeId: request.employeeId, 
                                name: request.employeeName 
                              }} 
                              size="sm" 
                            />
                            <div>
                              <div className="font-medium text-sm">{request.employeeName}</div>
                              <div className="text-xs text-gray-500">{request.employeeId}</div>
                              <div className="text-xs text-gray-500">{request.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{request.department}</td>
                        <td className="py-3 px-4 text-sm">{request.location}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{request.leaveType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>{format(new Date(request.startDate), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-gray-500">to</div>
                          <div>{format(new Date(request.endDate), 'MMM dd, yyyy')}</div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{request.days}</td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(request.appliedOn), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                            className={
                              request.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              request.status === 'rejected' ? '' :
                              'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            {request.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleLeaveAction(request._id, 'approved')}
                                  title="Approve"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const reason = window.prompt('Please provide a rejection reason:');
                                    if (reason) {
                                      handleLeaveAction(request._id, 'rejected', reason);
                                    }
                                  }}
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedLeaveId(
                                  expandedLeaveId === request._id ? null : request._id
                                )}
                                title="View Details"
                              >
                                {expandedLeaveId === request._id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expanded Details */}
        {expandedLeaveId && filteredRequests.find(r => r._id === expandedLeaveId) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Leave Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const request = filteredRequests.find(r => r._id === expandedLeaveId)!;
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Employee Type:</span>
                        <div className="mt-1">{request.employmentType}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Leave Plan:</span>
                        <div className="mt-1">{request.leavePlan}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Designation:</span>
                        <div className="mt-1">{request.designation}</div>
                      </div>
                    </div>
                    {request.reason && (
                      <div>
                        <span className="font-medium text-gray-600">Reason:</span>
                        <div className="mt-1 p-3 bg-white rounded border">{request.reason}</div>
                      </div>
                    )}
                    {request.status === 'approved' && request.approvedBy && (
                      <div>
                        <span className="font-medium text-gray-600">Approved By:</span>
                        <div className="mt-1">{request.approvedBy} on {format(new Date(request.approvedOn!), 'PPP')}</div>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div>
                        <span className="font-medium text-gray-600">Rejection Details:</span>
                        <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                          <div className="font-medium">Rejected by: {request.rejectedBy}</div>
                          <div className="text-sm">On: {format(new Date(request.rejectedOn!), 'PPP')}</div>
                          {request.rejectionReason && (
                            <div className="mt-2">
                              <span className="font-medium">Reason:</span> {request.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {isHRAdmin ? 'Leave & Attendance Overview' : 'My Leave & Attendance'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isHRAdmin 
                ? 'Comprehensive analytics and management dashboard'
                : 'View your attendance and leave statistics'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <Button 
            variant="outline" 
            className="h-10"
            onClick={() => setShowOverviewFilters(!showOverviewFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showOverviewFilters ? 'Hide Filters' : 'Show Filters'}
            {(fromDate || toDate || presentFilter || absentFilter || lateFilter || attendanceRateFilter) && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>

          {/* Export Dropdown */}
          {isHRAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={exportToExcel}
                  >
                    Export as Excel
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={exportToPDF}
                  >
                    Export as PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div id="dashboard-content">
        {/* KPI Cards */}
        {renderKPICards()}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="late-arrivals">Late Arrivals</TabsTrigger>
            {isHRAdmin && <TabsTrigger value="approvals">Leave Approvals</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Filter Panel */}
            {showOverviewFilters && (
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Filter Leave & Attendance Data</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From Date</label>
                      <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                            <Calendar className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select from date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              setShowFromCalendar(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To Date</label>
                      <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                            <Calendar className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select to date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            selected={toDate}
                            onSelect={(date) => {
                              setToDate(date);
                              setShowToCalendar(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Attendance Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Present</label>
                      <select
                        value={presentFilter}
                        onChange={(e) => setPresentFilter(e.target.value)}
                        className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        <option value="">All</option>
                        <option value="true">Present Only</option>
                        <option value="false">Not Present</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Absent</label>
                      <select
                        value={absentFilter}
                        onChange={(e) => setAbsentFilter(e.target.value)}
                        className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        <option value="">All</option>
                        <option value="true">Absent Only</option>
                        <option value="false">Not Absent</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Late</label>
                      <select
                        value={lateFilter}
                        onChange={(e) => setLateFilter(e.target.value)}
                        className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        <option value="">All</option>
                        <option value="true">Late Only</option>
                        <option value="false">On Time</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance Rate</label>
                      <select
                        value={attendanceRateFilter}
                        onChange={(e) => setAttendanceRateFilter(e.target.value)}
                        className="w-full h-9 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        <option value="">All</option>
                        <option value="high">&gt; 90%</option>
                        <option value="medium">70% - 90%</option>
                        <option value="low">&lt; 70%</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Date Range Display */}
                  {(fromDate || toDate) && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {fromDate && toDate
                          ? `Date Range: ${format(fromDate, 'MMM dd, yyyy')} → ${format(toDate, 'MMM dd, yyyy')}`
                          : fromDate
                          ? `From: ${format(fromDate, 'MMM dd, yyyy')}`
                          : `Until: ${format(toDate!, 'MMM dd, yyyy')}`}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Breakdown by Type</CardTitle>
                  <CardDescription>
                    Distribution of leave types for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderLeaveBreakdownChart()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Statistics</CardTitle>
                  <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaveBreakdown.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.leaveType}</div>
                          <div className="text-sm text-gray-600">
                            {item.count} employees • {item.totalDays} days
                          </div>
                        </div>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                    ))}
                    {leaveBreakdown.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No leave data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Leave Details - Enhanced */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-primary">Team Leave Details</span>
                    </CardTitle>
                    <CardDescription className="mt-1">Team members on leave</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {teamLeaves.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Everyone is in the office! 🎉</p>
                    </div>
                  ) : (
                    teamLeaves.slice(0, 5).map((leave, index) => {
                      const leaveTypeColors: Record<string, string> = {
                        'Sick Leave': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        'Casual Leave': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                        'Earned Leave': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      };
                      const userName = (leave.userName || 'Unknown').split(' ');
                      const initials = userName.length > 1 ? `${userName[0][0]}${userName[1][0]}` : userName[0][0];
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-all bg-purple-50/30 dark:bg-purple-950/20">
                          <div className={`h-10 w-10 rounded-full ${getAvatarGradient(leave.userName || 'Unknown')} flex items-center justify-center text-white font-semibold shadow-md`}>
                            {initials}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-primary">{leave.userName}</p>
                            <p className="text-sm text-muted-foreground">{formatLeaveDate(leave.startDate, leave.endDate)}</p>
                          </div>
                          <Badge variant="outline" className={leaveTypeColors[leave.leaveType] || 'bg-muted text-muted-foreground'}>
                            {leave.leaveType}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Leave & Attendance Details Table */}
            {isHRAdmin && renderEmployeeDetailsTable()}

            {/* Late Arrivals Summary */}
            {isHRAdmin && lateArrivals.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Late Arrivals</CardTitle>
                      <CardDescription>
                        Employees who arrived late in the selected period
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('late-arrivals')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Employee</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Check In</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lateArrivals.slice(0, 5).map((arrival) => (
                          <tr key={arrival._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <EmployeeAvatar 
                                  employee={{ 
                                    employeeId: arrival.employeeId, 
                                    name: arrival.employeeName 
                                  }} 
                                  size="sm" 
                                />
                                <div>
                                  <div className="font-medium text-sm">{arrival.employeeName}</div>
                                  <div className="text-xs text-gray-500">{arrival.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{arrival.department}</td>
                            <td className="py-3 px-4 text-sm">{format(new Date(arrival.date), 'MMM dd, yyyy')}</td>
                            <td className="py-3 px-4 text-sm font-medium text-orange-600">{arrival.checkIn}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{arrival.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Monthly Attendance & Leave Trend</CardTitle>
                    <CardDescription>
                      Year-over-year attendance patterns and leave usage
                    </CardDescription>
                  </div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {renderMonthlyTrendChart()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Late Arrivals Tab */}
          <TabsContent value="late-arrivals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Late Arrival Records</CardTitle>
                <CardDescription>
                  Employees who arrived late during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLateArrivalsTable()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Approvals Tab (HR Admin only) */}
          {isHRAdmin && (
            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Request Management</CardTitle>
                  <CardDescription>
                    Review and manage employee leave requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderLeaveRequests()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
