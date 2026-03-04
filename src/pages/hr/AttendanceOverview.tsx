import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  RefreshCw,
  Download,
  Users,
  UserCheck,
  UserX,
  Home,
  X,
  Check,
  Filter,
  Calendar,
  Search,
  FileText,
  Columns3,
  Edit3
} from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AttendanceLog, RegularizationRequest, WFHRequest } from '@/types/attendance';

export default function AdminAttendanceOverview() {
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter] = useState('');
  const [searchQuery] = useState('');
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [regularizationSearchQuery, setRegularizationSearchQuery] = useState('');
  const [wfhSearchQuery, setWfhSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('pending');
  
  // Column visibility states
  const [logsColumnVisibility, setLogsColumnVisibility] = useState<Record<string, boolean>>({});
  const [regularizationColumnVisibility, setRegularizationColumnVisibility] = useState<Record<string, boolean>>({});
  const [wfhColumnVisibility, setWfhColumnVisibility] = useState<Record<string, boolean>>({});

  // Date range filtering states
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const {
    adminStats,
    teamLogs,
    regularizationRequests,
    wfhRequests,
    loading,
    fetchAdminStats,
    fetchTeamLogs,
    fetchRegularizationRequests,
    fetchWFHRequests,
    approveRegularization,
    rejectRegularization,
    approveWFHRequest,
    rejectWFHRequest,
    bulkApprove,
    bulkReject,
    exportData
  } = useAttendanceStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    await Promise.all([
      fetchAdminStats({ department: departmentFilter === 'all' ? undefined : departmentFilter }),
      fetchTeamLogs({
        department: departmentFilter === 'all' ? undefined : departmentFilter,
        designation: designationFilter,
        employeeName: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter
      }),
      fetchRegularizationRequests(requestStatusFilter === 'all' ? undefined : requestStatusFilter),
      fetchWFHRequests(requestStatusFilter === 'all' ? undefined : requestStatusFilter)
    ]);
  };

  // Clear date filters
  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilterApplied(false);
  };

  // Apply filter
  const applyFilter = () => {
    if (!fromDate && !toDate) {
      toast.error('Please select at least one date');
      return;
    }
    setFilterApplied(true);
    setShowFilterPopover(false);
    toast.success('Date range filter applied');
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = async () => {
    await exportData({ format: 'excel' });
  };

  const handleBulkApprove = async (type: 'regularization' | 'wfh') => {
    if (selectedRequests.length === 0) return;
    await bulkApprove(selectedRequests, type);
    setSelectedRequests([]);
  };

  const handleBulkReject = async (type: 'regularization' | 'wfh') => {
    if (selectedRequests.length === 0) return;
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await bulkReject(selectedRequests, type, reason);
      setSelectedRequests([]);
    }
  };

  const toggleRequestSelection = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Helper function to format time
  const formatTime = (time?: string | Date) => {
    if (!time) return 'N/A';
    try {
      // If it's already a formatted time string (HH:MM AM/PM), return it
      if (typeof time === 'string' && time.match(/^\d{1,2}:\d{2}(\s?[AP]M)?$/i)) {
        return time;
      }
      // If it's a date object or ISO string, format it
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return format(date, 'h:mm a');
      }
      return time.toString();
    } catch {
      return 'N/A';
    }
  };

  // Helper function to format hours
  const formatHours = (hours?: number) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      present: { variant: 'default', className: 'bg-green-100 text-green-700' },
      absent: { variant: 'destructive', className: 'bg-red-100 text-red-700' },
      wfh: { variant: 'secondary', className: 'bg-blue-100 text-blue-700' },
      leave: { variant: 'outline', className: 'bg-yellow-100 text-yellow-700' },
      late: { variant: 'outline', className: 'bg-orange-100 text-orange-700' },
      'weekly-off': { variant: 'outline', className: 'bg-gray-100 text-gray-700' },
      'half-day': { variant: 'outline', className: 'bg-purple-100 text-purple-700' }
    };
    const config = variants[status.toLowerCase()] || variants.present;
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  // Define attendance table columns
  const attendanceColumns: DataTableColumn<AttendanceLog>[] = useMemo(() => [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      align: 'left',
      width: '120px',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'employeeName',
      label: 'Name',
      sortable: true,
      align: 'left',
      width: '180px',
      render: (value) => <span className="font-medium">{value}</span>,
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
      key: 'checkInTime',
      label: 'Check In',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm">{formatTime(value)}</span>,
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm">{formatTime(value)}</span>,
    },
    {
      key: 'effectiveHours',
      label: 'Effective Hours',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm font-medium text-blue-600">{formatHours(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'isLate',
      label: 'Late',
      sortable: true,
      align: 'center',
      render: (value) => value ? <Badge className="bg-orange-100 text-orange-700">Yes</Badge> : <span className="text-gray-400">-</span>,
    },
    {
      key: 'regularizationStatus',
      label: 'Regularization',
      sortable: true,
      align: 'left',
      render: (value) => {
        if (!value || value === 'none') return <span className="text-gray-400">-</span>;
        const variants: Record<string, { className: string }> = {
          pending: { className: 'bg-yellow-100 text-yellow-700' },
          approved: { className: 'bg-green-100 text-green-700' },
          rejected: { className: 'bg-red-100 text-red-700' }
        };
        const config = variants[value] || variants.pending;
        return <Badge className={config.className}>{value}</Badge>;
      },
    },
  ], []);

  // Define attendance table actions
  const attendanceActions: DataTableAction<AttendanceLog>[] = [
    {
      label: 'View Details',
      onClick: () => {},
    },
  ];

  // Define regularization request columns
  const regularizationColumns: DataTableColumn<RegularizationRequest>[] = useMemo(() => [
    {
      key: '_id',
      label: '',
      sortable: false,
      align: 'center',
      width: '50px',
      render: (_, request) => (
        <Checkbox
          checked={selectedRequests.includes(request._id)}
          onCheckedChange={() => toggleRequestSelection(request._id)}
          disabled={request.status !== 'pending'}
        />
      ),
    },
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      align: 'left',
      width: '120px',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'employeeName',
      label: 'Name',
      sortable: true,
      align: 'left',
      width: '180px',
      render: (value) => <span className="font-medium">{value}</span>,
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
      key: 'requestType',
      label: 'Request Type',
      sortable: true,
      align: 'left',
      render: (value) => <Badge variant="outline">{value.replace('-', ' ').toUpperCase()}</Badge>,
    },
    {
      key: 'proposedCheckIn',
      label: 'Proposed In',
      sortable: false,
      align: 'left',
      render: (value) => <span className="text-sm">{value ? format(new Date(value), 'h:mm a') : '-'}</span>,
    },
    {
      key: 'proposedCheckOut',
      label: 'Proposed Out',
      sortable: false,
      align: 'left',
      render: (value) => <span className="text-sm">{value ? format(new Date(value), 'h:mm a') : '-'}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
      align: 'left',
      render: (value) => <span className="text-sm truncate max-w-[200px]" title={value}>{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      render: (value) => {
        const variants: Record<string, { className: string }> = {
          pending: { className: 'bg-yellow-100 text-yellow-700' },
          approved: { className: 'bg-green-100 text-green-700' },
          rejected: { className: 'bg-red-100 text-red-700' }
        };
        const config = variants[value] || variants.pending;
        return <Badge className={config.className}>{value}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Requested On',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm text-gray-500">{format(new Date(value), 'MMM dd, h:mm a')}</span>,
    },
  ], [selectedRequests]);

  // Define regularization actions
  const regularizationActions: DataTableAction<RegularizationRequest>[] = [
    {
      label: 'Approve',
      onClick: (request) => approveRegularization(request._id),
    },
    {
      label: 'Reject',
      onClick: async (request) => {
        const reason = prompt('Enter rejection reason:');
        if (reason) await rejectRegularization(request._id, reason);
      },
    },
    {
      label: 'View Details',
      onClick: () => {},
    },
  ];

  // Define WFH request columns
  const wfhColumns: DataTableColumn<WFHRequest>[] = useMemo(() => [
    {
      key: '_id',
      label: '',
      sortable: false,
      align: 'center',
      width: '50px',
      render: (_, request) => (
        <Checkbox
          checked={selectedRequests.includes(request._id)}
          onCheckedChange={() => toggleRequestSelection(request._id)}
          disabled={request.status !== 'pending'}
        />
      ),
    },
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      align: 'left',
      width: '120px',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'employeeName',
      label: 'Name',
      sortable: true,
      align: 'left',
      width: '180px',
      render: (value) => <span className="font-medium">{value}</span>,
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
      label: 'WFH Date',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm">{format(new Date(value), 'MMM dd, yyyy')}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
      align: 'left',
      render: (value) => <span className="text-sm truncate max-w-[300px]" title={value}>{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      render: (value) => {
        const variants: Record<string, { className: string }> = {
          pending: { className: 'bg-yellow-100 text-yellow-700' },
          approved: { className: 'bg-green-100 text-green-700' },
          rejected: { className: 'bg-red-100 text-red-700' }
        };
        const config = variants[value] || variants.pending;
        return <Badge className={config.className}>{value}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Requested On',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm text-gray-500">{format(new Date(value), 'MMM dd, h:mm a')}</span>,
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      sortable: false,
      align: 'left',
      render: (value, request) => {
        if (request.status === 'approved' && value) {
          return <span className="text-sm text-gray-600">{value}</span>;
        }
        if (request.status === 'rejected' && request.rejectedBy) {
          return <span className="text-sm text-gray-600">{request.rejectedBy}</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'approvedAt',
      label: 'Action Date',
      sortable: true,
      align: 'left',
      render: (value, request) => {
        const actionDate = request.status === 'approved' ? value : request.rejectedAt;
        if (actionDate) {
          return <span className="text-sm text-gray-500">{format(new Date(actionDate), 'MMM dd, h:mm a')}</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
  ], [selectedRequests]);

  // Define WFH actions
  const wfhActions: DataTableAction<WFHRequest>[] = [
    {
      label: 'Approve',
      onClick: (request) => approveWFHRequest(request._id),
    },
    {
      label: 'Reject',
      onClick: async (request) => {
        const reason = prompt('Enter rejection reason:');
        if (reason) await rejectWFHRequest(request._id, reason);
      },
    },
    {
      label: 'View Details',
      onClick: () => {},
    },
  ];

  // Initialize column visibility for all tables
  useEffect(() => {
    const logsVisibility: Record<string, boolean> = {};
    attendanceColumns.forEach(col => {
      logsVisibility[col.key] = !col.hidden;
    });
    setLogsColumnVisibility(logsVisibility);
  }, [attendanceColumns]);

  useEffect(() => {
    const regVisibility: Record<string, boolean> = {};
    regularizationColumns.forEach(col => {
      regVisibility[col.key] = !col.hidden;
    });
    setRegularizationColumnVisibility(regVisibility);
  }, [regularizationColumns]);

  useEffect(() => {
    const wfhVisibility: Record<string, boolean> = {};
    wfhColumns.forEach(col => {
      wfhVisibility[col.key] = !col.hidden;
    });
    setWfhColumnVisibility(wfhVisibility);
  }, [wfhColumns]);

  // const toggleSelectAll = (requests: any[]) => {
  //   if (selectedRequests.length === requests.length) {
  //     setSelectedRequests([]);
  //   } else {
  //     setSelectedRequests(requests.map(r => r._id));
  //   }
  // };

  return (
    <div className="page-container">
      {/* Attendance Management Section */}
      <div className="page-header">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="page-title">Attendance Management</h2>
            <p className="page-description">Monitor and manage team attendance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <Button 
            variant="outline" 
            className="h-10"
            onClick={() => setShowFilterPopover(!showFilterPopover)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilterPopover ? 'Hide Filters' : 'Show Filters'}
            {filterApplied && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
          <Button onClick={handleExport} variant="outline" className="h-10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="h-10" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Expandable Filter Section */}
      {showFilterPopover && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Attendance Data</h4>
              <Button variant="ghost" size="sm" onClick={() => {
                clearDateFilters();
                setDepartmentFilter('all');
                setStatusFilter('all');
                setFilterApplied(false);
              }} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date Pickers */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Department Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="wfh">WFH</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Range Display */}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={() => {
                  applyFilter();
                  loadData();
                }}
                className="flex-1"
                size="sm"
              >
                <Filter className="h-3 w-3 mr-2" />
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  clearDateFilters();
                  setDepartmentFilter('all');
                  setStatusFilter('all');
                  setFilterApplied(false);
                  setShowFilterPopover(false);
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards - Always Visible */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{adminStats?.totalEmployees || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {adminStats?.presentToday || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <UserX className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {adminStats?.absentToday || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">WFH Today</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {adminStats?.wfhToday || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">
                  {adminStats?.lateArrivals || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">employees late today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {adminStats?.lateArrivalPercentage || 0}%
                </p>
                <p className="text-sm text-muted-foreground">of present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Leave Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">On Leave</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {adminStats?.onLeaveToday || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Present + WFH</span>
                <Badge className="bg-green-100 text-green-700">
                  {(adminStats?.presentToday || 0) + (adminStats?.wfhToday || 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="logs">Team Logs</TabsTrigger>
          <TabsTrigger value="regularization">
            Regularization
            {regularizationRequests.filter((r: RegularizationRequest) => r.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {regularizationRequests.filter((r: RegularizationRequest) => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="wfh">
            WFH Requests
            {wfhRequests.filter((r: WFHRequest) => r.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {wfhRequests.filter((r: WFHRequest) => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Team Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Team Logs Table */}
          <Card className="overflow-hidden rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Team Attendance Logs</CardTitle>
                    <CardDescription className="mt-1">
                      {teamLogs.length} {teamLogs.length === 1 ? 'record' : 'records'} found
                    </CardDescription>
                  </div>
                </div>
                {/* Search Bar, Status Filter and Column Toggle on the Right */}
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or status..."
                      value={logsSearchQuery}
                      onChange={(e) => setLogsSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="wfh">WFH</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Columns3 className="mr-2 h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        {attendanceColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div 
                              className="flex items-center gap-2 w-full" 
                              onClick={() => {
                                setLogsColumnVisibility(prev => ({
                                  ...prev,
                                  [column.key]: prev[column.key] === false ? true : false
                                }));
                              }}
                            >
                              <Checkbox
                                checked={logsColumnVisibility[column.key] !== false}
                                onCheckedChange={() => {
                                  setLogsColumnVisibility(prev => ({
                                    ...prev,
                                    [column.key]: prev[column.key] === false ? true : false
                                  }));
                                }}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">{column.label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={teamLogs.filter(log => {
                  if (!logsSearchQuery) return true;
                  const query = logsSearchQuery.toLowerCase();
                  return (
                    (log.employeeName || '').toLowerCase().includes(query) ||
                    format(new Date(log.date), 'MMM dd, yyyy').toLowerCase().includes(query) ||
                    (log.status || '').toLowerCase().includes(query)
                  );
                })}
                columns={attendanceColumns.map(col => ({
                  ...col,
                  hidden: logsColumnVisibility[col.key] === false
                }))}
                actions={attendanceActions}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
                emptyMessage="No attendance logs found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regularization Tab */}
        <TabsContent value="regularization" className="space-y-6">
          <Card className="overflow-hidden rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Edit3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Regularization Requests</CardTitle>
                    <CardDescription className="mt-1">
                      {regularizationRequests.length} {regularizationRequests.length === 1 ? 'request' : 'requests'} found
                    </CardDescription>
                  </div>
                </div>
                {/* Search Bar, Status Filter and Column Toggle on the Right */}
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or status..."
                      value={regularizationSearchQuery}
                      onChange={(e) => setRegularizationSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Columns3 className="mr-2 h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        {regularizationColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div 
                              className="flex items-center gap-2 w-full" 
                              onClick={() => {
                                setRegularizationColumnVisibility(prev => ({
                                  ...prev,
                                  [column.key]: prev[column.key] === false ? true : false
                                }));
                              }}
                            >
                              <Checkbox
                                checked={regularizationColumnVisibility[column.key] !== false}
                                onCheckedChange={() => {
                                  setRegularizationColumnVisibility(prev => ({
                                    ...prev,
                                    [column.key]: prev[column.key] === false ? true : false
                                  }));
                                }}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">{column.label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                {selectedRequests.length > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkApprove('regularization')}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve ({selectedRequests.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkReject('regularization')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject ({selectedRequests.length})
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={regularizationRequests.filter(req => {
                  if (!regularizationSearchQuery) return true;
                  const query = regularizationSearchQuery.toLowerCase();
                  return (
                    (req.employeeName || '').toLowerCase().includes(query) ||
                    (req.employeeId || '').toLowerCase().includes(query) ||
                    (req.status || '').toLowerCase().includes(query) ||
                    format(new Date(req.date), 'MMM dd, yyyy').toLowerCase().includes(query)
                  );
                })}
                columns={regularizationColumns.map(col => ({
                  ...col,
                  hidden: regularizationColumnVisibility[col.key] === false
                }))}
                actions={regularizationActions}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
                emptyMessage="No regularization requests found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* WFH Requests Tab */}
        <TabsContent value="wfh" className="space-y-6">
          <Card className="overflow-hidden rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">WFH Requests</CardTitle>
                    <CardDescription className="mt-1">
                      {wfhRequests.length} {wfhRequests.length === 1 ? 'request' : 'requests'} found
                    </CardDescription>
                  </div>
                </div>
                {/* Search Bar, Status Filter and Column Toggle on the Right */}
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or status..."
                      value={wfhSearchQuery}
                      onChange={(e) => setWfhSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Columns3 className="mr-2 h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        {wfhColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div 
                              className="flex items-center gap-2 w-full" 
                              onClick={() => {
                                setWfhColumnVisibility(prev => ({
                                  ...prev,
                                  [column.key]: prev[column.key] === false ? true : false
                                }));
                              }}
                            >
                              <Checkbox
                                checked={wfhColumnVisibility[column.key] !== false}
                                onCheckedChange={() => {
                                  setWfhColumnVisibility(prev => ({
                                    ...prev,
                                    [column.key]: prev[column.key] === false ? true : false
                                  }));
                                }}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">{column.label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                {selectedRequests.length > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkApprove('wfh')}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve ({selectedRequests.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkReject('wfh')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject ({selectedRequests.length})
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={wfhRequests.filter(req => {
                  if (!wfhSearchQuery) return true;
                  const query = wfhSearchQuery.toLowerCase();
                  return (
                    (req.employeeName || '').toLowerCase().includes(query) ||
                    (req.employeeId || '').toLowerCase().includes(query) ||
                    (req.status || '').toLowerCase().includes(query) ||
                    format(new Date(req.date), 'MMM dd, yyyy').toLowerCase().includes(query)
                  );
                })}
                columns={wfhColumns.map(col => ({
                  ...col,
                  hidden: wfhColumnVisibility[col.key] === false
                }))}
                actions={wfhActions}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
                emptyMessage="No WFH requests found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
