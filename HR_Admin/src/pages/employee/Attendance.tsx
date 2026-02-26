import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreVertical, CheckCircle, XCircle, Circle, Calendar, Plus, Clock, CalendarDays, Plane, AlertCircle, User, BarChart3, Search, Filter, ArrowUpDown, Eye, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useLeaveStore } from '@/store/leaveStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { useState, useEffect, useMemo } from 'react';
import { ApplyLeaveDrawer } from '@/components/leave/ApplyLeaveDrawer';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';
import type { LeaveType } from '@/types/leave';

type FilterPeriod = '30Days' | 'Oct' | 'Sep' | 'Aug' | 'Jul' | 'Jun' | 'May';

export function Attendance() {
  const user = useAuthStore((state) => state.user);
  const { getRecordsByUserId } = useAttendanceStore();
  const { leaves, leaveBalance, fetchLeaves, fetchLeaveBalance } = useLeaveStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>('30Days');
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [preSelectedLeaveType, setPreSelectedLeaveType] = useState<LeaveType | null>(null);
  
  // Leave History Filters and Sorting
  const [leaveSearchQuery, setLeaveSearchQuery] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('all');
  const [leaveSortBy, setLeaveSortBy] = useState<'requestDate' | 'leaveDate' | 'status'>('requestDate');
  const [leaveSortOrder, setLeaveSortOrder] = useState<'asc' | 'desc'>('desc');

  const records = getRecordsByUserId(user?.employeeId || '');

  // Fetch leave data
  useEffect(() => {
    if (user?.employeeId) {
      fetchLeaves(user.employeeId);
      fetchLeaveBalance(user.employeeId);
      fetchEmployees();
    }
  }, [user?.employeeId, fetchLeaves, fetchLeaveBalance, fetchEmployees]);

  // Get current employee
  const currentEmployee = useMemo(() => {
    if (user?.employeeId && employees.length > 0) {
      return employees.find(e => e.employeeId === user.employeeId);
    }
    return undefined;
  }, [user, employees]);

  // Calculate leave stats
  const leaveStats = useMemo(() => {
    const pending = leaves.filter(l => l.status === 'pending').length;
    const upcoming = leaves.filter(l => {
      if (l.status !== 'approved') return false;
      const startDate = new Date(l.startDate);
      const today = new Date();
      return startDate > today;
    }).length;
    
    const totalAvailable = leaveBalance?.leaveTypes?.reduce((sum, lt) => sum + (lt.available || 0), 0) || 0;
    
    // Calculate additional stats
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    const totalRequests = leaves.length;
    const approvalRate = totalRequests > 0 ? ((approved / totalRequests) * 100).toFixed(1) : '0';
    
    const totalLeavesTaken = leaves
      .filter(l => l.status === 'approved')
      .reduce((sum, l) => sum + (l.days || 0), 0);
    
    return { 
      pending, 
      upcoming, 
      totalAvailable, 
      approved, 
      rejected, 
      approvalRate,
      totalLeavesTaken,
      totalRequests 
    };
  }, [leaves, leaveBalance]);

  // Get upcoming leaves (next 30 days)
  const upcomingLeaves = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return leaves
      .filter(l => {
        if (l.status !== 'approved') return false;
        const startDate = new Date(l.startDate);
        return startDate >= today && startDate <= next30Days;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [leaves]);

  // Get pending leave requests
  const pendingLeaves = useMemo(() => {
    return leaves
      .filter(l => l.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [leaves]);

  // Calculate total stats for summary
  const totalStats = useMemo(() => {
    if (!leaveBalance?.leaveTypes) {
      return { totalAllocated: 0, totalUsed: 0, totalPending: 0, totalAvailable: 0 };
    }
    
    return leaveBalance.leaveTypes.reduce((acc, lt) => ({
      totalAllocated: acc.totalAllocated + (lt.allocated || lt.accrued || 0),
      totalUsed: acc.totalUsed + (lt.used || 0),
      totalPending: acc.totalPending + (lt.pending || 0),
      totalAvailable: acc.totalAvailable + (lt.available || 0)
    }), { totalAllocated: 0, totalUsed: 0, totalPending: 0, totalAvailable: 0 });
  }, [leaveBalance]);

  // Attendance Pattern Analysis
  const attendancePatterns = useMemo(() => {
    const officeStartTime = '09:00'; // Define office hours
    const officeEndTime = '18:00';
    
    const lateLogins = records.filter(r => {
      if (!r.checkIn || r.status !== 'Present') return false;
      return r.checkIn > officeStartTime;
    });
    
    const earlyCheckouts = records.filter(r => {
      if (!r.checkOut || r.status !== 'Present') return false;  
      return r.checkOut < officeEndTime;
    });
    
    // Get trends (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = records.filter(r => {
      const recordDate = new Date(r.date);
      const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 7;
    });
    
    const previous7Days = records.filter(r => {
      const recordDate = new Date(r.date);
      const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 7 && daysDiff < 14;
    });
    
    const lateLoginsLast7 = last7Days.filter(r => r.checkIn && r.checkIn > officeStartTime).length;
    const lateLoginsPrev7 = previous7Days.filter(r => r.checkIn && r.checkIn > officeStartTime).length;
    const lateLoginTrend = lateLoginsLast7 - lateLoginsPrev7;
    
    const earlyCheckoutsLast7 = last7Days.filter(r => r.checkOut && r.checkOut < officeEndTime).length;
    const earlyCheckoutsPrev7 = previous7Days.filter(r => r.checkOut && r.checkOut < officeEndTime).length;
    const earlyCheckoutTrend = earlyCheckoutsLast7 - earlyCheckoutsPrev7;
    
    return {
      lateLogins: lateLogins.length,
      lateLoginsList: lateLogins.slice(0, 5).map(r => ({
        date: r.date,
        checkIn: r.checkIn,
        minutesLate: Math.max(0, Math.floor((new Date(`2000-01-01 ${r.checkIn}`).getTime() - new Date(`2000-01-01 ${officeStartTime}`).getTime()) / 60000))
      })),
      lateLoginTrend,
      earlyCheckouts: earlyCheckouts.length,
      earlyCheckoutsList: earlyCheckouts.slice(0, 5).map(r => ({
        date: r.date,
        checkOut: r.checkOut,
        minutesEarly: Math.max(0, Math.floor((new Date(`2000-01-01 ${officeEndTime}`).getTime() - new Date(`2000-01-01 ${r.checkOut}`).getTime()) / 60000))
      })),
      earlyCheckoutTrend
    };
  }, [records]);

  // Filtered and Sorted Leave History
  const filteredAndSortedLeaves = useMemo(() => {
    let filtered = [...leaves];
    
    // Apply search filter
    if (leaveSearchQuery) {
      const query = leaveSearchQuery.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leaveType.toLowerCase().includes(query) ||
        (leave.reason || '').toLowerCase().includes(query) ||
        (leave.justification || '').toLowerCase().includes(query) ||
        (leave.rejectionReason || '').toLowerCase().includes(query)
      );
    }
    
    // Apply leave type filter
    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(leave => leave.leaveType === leaveTypeFilter);
    }
    
    // Apply status filter
    if (leaveStatusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === leaveStatusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (leaveSortBy === 'requestDate') {
        comparison = new Date(a.createdAt || a.appliedOn).getTime() - new Date(b.createdAt || b.appliedOn).getTime();
      } else if (leaveSortBy === 'leaveDate') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (leaveSortBy === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      
      return leaveSortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [leaves, leaveSearchQuery, leaveTypeFilter, leaveStatusFilter, leaveSortBy, leaveSortOrder]);

  // Get unique leave types for filter dropdown
  const uniqueLeaveTypes = useMemo(() => {
    const types = new Set(leaves.map(l => l.leaveType));
    return Array.from(types);
  }, [leaves]);

  // Filter records based on selected period
  const filterRecordsByPeriod = (period: FilterPeriod) => {
    const now = new Date();
    
    if (period === '30Days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return records.filter(r => new Date(r.date) >= thirtyDaysAgo);
    }
    
    // For month filters, get records from that month
    const monthMap: Record<string, number> = {
      'Oct': 9, 'Sep': 8, 'Aug': 7, 'Jul': 6, 'Jun': 5, 'May': 4
    };
    
    const monthNum = monthMap[period];
    return records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === monthNum && recordDate.getFullYear() === now.getFullYear();
    });
  };

  const filteredRecords = filterRecordsByPeriod(activePeriod);

  const getAttendanceIcon = (record: typeof records[0]) => {
    if (record.status === 'Present') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (record.status === 'Absent') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getRowClassName = (record: typeof records[0], index: number) => {
    if (record.status === 'W-Off' || record.status === 'Holiday') {
      return 'bg-blue-50 dark:bg-blue-950/20';
    } else if (record.status === 'Leave') {
      return 'bg-orange-100 dark:bg-orange-900/20';
    } else if (!record.checkIn) {
      return 'bg-red-50 dark:bg-red-950/20';
    }
    // Alternating row colors for normal records
    return index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, 'MMM dd, yyyy');
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`;
    }
    
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  const periods: { label: string; value: FilterPeriod }[] = [
    { label: '30 Days', value: '30Days' },
    { label: 'Oct', value: 'Oct' },
    { label: 'Sep', value: 'Sep' },
    { label: 'Aug', value: 'Aug' },
    { label: 'Jul', value: 'Jul' },
    { label: 'Jun', value: 'Jun' },
    { label: 'May', value: 'May' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            My Leave & Attendance
          </h1>
          <p className="text-muted-foreground mt-2">Track your attendance records, leave requests, and balance</p>
        </div>
        <Button
          onClick={() => setIsApplyLeaveOpen(true)}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Quick Stats - Full Width Responsive Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-500/20 dark:bg-blue-500/30">
                  <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Current</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Available Leave</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{leaveStats.totalAvailable}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">days remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-green-500/20 dark:bg-green-500/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Total</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Leaves Taken</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{leaveStats.totalLeavesTaken}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">days this year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-orange-500/20 dark:bg-orange-500/30">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Pending</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending Requests</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{leaveStats.pending}</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">awaiting approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-500/20 dark:bg-purple-500/30">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Rate</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Approval Rate</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{leaveStats.approvalRate}%</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                  {leaveStats.approved} of {leaveStats.totalRequests} approved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tracking Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-left-6 duration-500">
        {/* Late Logins Card */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Late Login Tracking
              </div>
              <Badge variant={attendancePatterns.lateLoginTrend > 0 ? 'destructive' : 'secondary'} className="gap-1">
                {attendancePatterns.lateLoginTrend > 0 ? (
                  <><TrendingUp className="h-3 w-3" /> +{attendancePatterns.lateLoginTrend}</>
                ) : attendancePatterns.lateLoginTrend < 0 ? (
                  <><TrendingDown className="h-3 w-3" /> {attendancePatterns.lateLoginTrend}</>
                ) : (
                  <><Minus className="h-3 w-3" /> No change</>
                )}
              </Badge>
            </CardTitle>
            <CardDescription>Check-ins after 09:00 AM</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-orange-600 dark:text-orange-400">{attendancePatterns.lateLogins}</p>
                <p className="text-sm text-muted-foreground mt-1">Total late logins</p>
              </div>
            </div>
            
            {attendancePatterns.lateLoginsList.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recent Late Logins</p>
                {attendancePatterns.lateLoginsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">Check-in: {item.checkIn}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      +{item.minutesLate} min
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No late logins! Great job!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Early Checkouts Card */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Early Checkout Tracking
              </div>
              <Badge variant={attendancePatterns.earlyCheckoutTrend > 0 ? 'destructive' : 'secondary'} className="gap-1">
                {attendancePatterns.earlyCheckoutTrend > 0 ? (
                  <><TrendingUp className="h-3 w-3" /> +{attendancePatterns.earlyCheckoutTrend}</>
                ) : attendancePatterns.earlyCheckoutTrend < 0 ? (
                  <><TrendingDown className="h-3 w-3" /> {attendancePatterns.earlyCheckoutTrend}</>
                ) : (
                  <><Minus className="h-3 w-3" /> No change</>
                )}
              </Badge>
            </CardTitle>
            <CardDescription>Check-outs before 06:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{attendancePatterns.earlyCheckouts}</p>
                <p className="text-sm text-muted-foreground mt-1">Total early checkouts</p>
              </div>
            </div>
            
            {attendancePatterns.earlyCheckoutsList.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recent Early Checkouts</p>
                {attendancePatterns.earlyCheckoutsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">Check-out: {item.checkOut}</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      -{item.minutesEarly} min
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No early checkouts! Excellent!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Leave Balance Breakdown */}
      {leaveBalance?.leaveTypes && leaveBalance.leaveTypes.length > 0 && (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2 animate-in slide-in-from-bottom-6 duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Leave Balance Overview
            </CardTitle>
            <CardDescription>Complete breakdown of your leave entitlements and usage</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Leave Type</TableHead>
                    <TableHead className="text-center font-semibold">Total Allocated</TableHead>
                    <TableHead className="text-center font-semibold">Used</TableHead>
                    <TableHead className="text-center font-semibold">Pending</TableHead>
                    <TableHead className="text-center font-semibold">Available</TableHead>
                    <TableHead className="text-center font-semibold">Carried Forward</TableHead>
                    <TableHead className="text-center font-semibold">Utilization %</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalance.leaveTypes.map((leaveType) => {
                    const totalAllocated = leaveType.allocated || leaveType.accrued || 0;
                    const used = leaveType.used || 0;
                    const available = leaveType.available || 0;
                    const pending = leaveType.pending || 0;
                    const carriedForward = leaveType.carriedForward || 0;
                    const utilizationPercent = totalAllocated > 0 ? ((used / totalAllocated) * 100).toFixed(1) : '0.0';
                    const availablePercent = totalAllocated > 0 ? ((available / totalAllocated) * 100).toFixed(0) : '0';
                    
                    const getBalanceColor = () => {
                      const percent = parseInt(availablePercent);
                      if (percent >= 70) return 'text-green-600 dark:text-green-400';
                      if (percent >= 40) return 'text-blue-600 dark:text-blue-400';
                      if (percent >= 20) return 'text-orange-600 dark:text-orange-400';
                      return 'text-red-600 dark:text-red-400';
                    };

                    const getUtilizationColor = () => {
                      const percent = parseFloat(utilizationPercent);
                      if (percent >= 80) return 'text-red-600 dark:text-red-400';
                      if (percent >= 60) return 'text-orange-600 dark:text-orange-400';
                      if (percent >= 40) return 'text-blue-600 dark:text-blue-400';
                      return 'text-green-600 dark:text-green-400';
                    };

                    return (
                      <TableRow key={leaveType.type} className="group hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              leaveType.type === 'Casual Leave' ? 'bg-purple-500' :
                              leaveType.type === 'Earned Leave' ? 'bg-blue-500' :
                              leaveType.type === 'Sick Leave' ? 'bg-red-500' :
                              leaveType.type === 'Compensatory Off' ? 'bg-orange-500' :
                              leaveType.type === 'Maternity Leave' ? 'bg-pink-500' :
                              leaveType.type === 'Paternity Leave' ? 'bg-green-500' :
                              leaveType.type === 'Bereavement Leave' ? 'bg-gray-500' :
                              leaveType.type === 'Marriage Leave' ? 'bg-yellow-500' :
                              leaveType.type === 'Annual Leave' ? 'bg-indigo-500' :
                              'bg-slate-500'
                            }`} />
                            <span className="text-sm">{leaveType.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-foreground">{totalAllocated}</span>
                            <span className="text-xs text-muted-foreground">days</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold text-red-600 dark:text-red-400">{used}</span>
                            <span className="text-xs text-muted-foreground">consumed</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {pending > 0 ? (
                              <>
                                <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">{pending}</span>
                                <span className="text-xs text-orange-600 dark:text-orange-400">awaiting</span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg font-semibold text-gray-400">0</span>
                                <span className="text-xs text-muted-foreground">none</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-2xl font-bold ${getBalanceColor()}`}>{available}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>remaining</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{availablePercent}%</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {carriedForward > 0 ? (
                              <>
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{carriedForward}</span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">from prev year</span>
                                {leaveType.carryForwardExpiry && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5">
                                    Exp: {format(new Date(leaveType.carryForwardExpiry), 'MMM dd')}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-lg font-semibold text-gray-400">0</span>
                                <span className="text-xs text-muted-foreground">none</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-lg font-bold ${getUtilizationColor()}`}>{utilizationPercent}%</span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  parseFloat(utilizationPercent) >= 80 ? 'bg-red-500' :
                                  parseFloat(utilizationPercent) >= 60 ? 'bg-orange-500' :
                                  parseFloat(utilizationPercent) >= 40 ? 'bg-blue-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(parseFloat(utilizationPercent), 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setPreSelectedLeaveType(leaveType.type);
                              setIsApplyLeaveOpen(true);
                            }}
                            disabled={available <= 0}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 font-semibold border-t-2">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold">{totalStats.totalAllocated}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">{totalStats.totalUsed}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalStats.totalPending}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalStats.totalAvailable}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {leaveBalance.leaveTypes.reduce((sum, lt) => sum + (lt.carriedForward || 0), 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-foreground">
                        {totalStats.totalAllocated > 0 ? ((totalStats.totalUsed / totalStats.totalAllocated) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 border-t">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Available: <span className="font-semibold text-foreground">{totalStats.totalAvailable} days</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Used: <span className="font-semibold text-foreground">{totalStats.totalUsed} days</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-muted-foreground">Pending: <span className="font-semibold text-foreground">{totalStats.totalPending} days</span></span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {leaveBalance.lastUpdated ? format(new Date(leaveBalance.lastUpdated), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Leaves & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-left-6 duration-500">
        {/* Upcoming Approved Leaves */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plane className="h-5 w-5 text-green-600" />
              Upcoming Leaves
            </CardTitle>
            <CardDescription>Your approved leaves in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLeaves.length > 0 ? (
              <div className="space-y-3">
                {upcomingLeaves.map((leave) => (
                  <div
                    key={leave.id || leave._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{leave.leaveType}</Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{leave.days} day{leave.days > 1 ? 's' : ''} • {leave.justification}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No upcoming leaves</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>Requests awaiting manager approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length > 0 ? (
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id || leave._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{leave.leaveType}</Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {leave.days} day{leave.days > 1 ? 's' : ''} • Applied {format(new Date(leave.createdAt), 'MMM dd')}
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-orange-600 animate-pulse flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Leave History */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2 animate-in slide-in-from-bottom-6 duration-500">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Complete Leave History
              </CardTitle>
              <CardDescription>All your leave requests with dates, status, and approval details</CardDescription>
            </div>
            
            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leaves..."
                  value={leaveSearchQuery}
                  onChange={(e) => setLeaveSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
                {leaveSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setLeaveSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Leave Type Filter */}
              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueLeaveTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={leaveSortBy} onValueChange={(v) => setLeaveSortBy(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestDate">Request Date</SelectItem>
                  <SelectItem value="leaveDate">Leave Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort Order */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaveSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              
              {/* Clear Filters */}
              {(leaveSearchQuery || leaveTypeFilter !== 'all' || leaveStatusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLeaveSearchQuery('');
                    setLeaveTypeFilter('all');
                    setLeaveStatusFilter('all');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Leave Type</TableHead>
                  <TableHead className="font-semibold">Dates</TableHead>
                  <TableHead className="text-center font-semibold">Days</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applied On</TableHead>
                  <TableHead className="font-semibold">Action Date</TableHead>
                  <TableHead className="font-semibold">Approved/Rejected By</TableHead>
                  <TableHead className="font-semibold">Reason/Comments</TableHead>
                  <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLeaves.length > 0 ? (
                  filteredAndSortedLeaves.map((leave, index) => {
                      const getStatusBadge = () => {
                        switch (leave.status) {
                          case 'approved':
                            return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
                          case 'pending':
                            return <Badge className="bg-orange-500 hover:bg-orange-600 animate-pulse"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
                          case 'rejected':
                            return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
                          case 'cancelled':
                            return <Badge variant="secondary"><Circle className="h-3 w-3 mr-1" />Cancelled</Badge>;
                          default:
                            return <Badge variant="outline">{leave.status}</Badge>;
                        }
                      };

                      const getRowBgColor = () => {
                        if (leave.status === 'approved') return 'bg-green-50 dark:bg-green-950/10';
                        if (leave.status === 'rejected') return 'bg-red-50 dark:bg-red-950/10';
                        if (leave.status === 'pending') return 'bg-orange-50 dark:bg-orange-950/10';
                        if (leave.status === 'cancelled') return 'bg-gray-50 dark:bg-gray-950/10';
                        return index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50';
                      };

                      return (
                        <TableRow key={leave.id || leave._id} className={getRowBgColor()}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                leave.leaveType === 'Casual Leave' ? 'bg-purple-500' :
                                leave.leaveType === 'Earned Leave' ? 'bg-blue-500' :
                                leave.leaveType === 'Sick Leave' ? 'bg-red-500' :
                                leave.leaveType === 'Compensatory Off' ? 'bg-orange-500' :
                                leave.leaveType === 'Maternity Leave' ? 'bg-pink-500' :
                                leave.leaveType === 'Paternity Leave' ? 'bg-green-500' :
                                'bg-slate-500'
                              }`} />
                              <span className="text-sm font-medium">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                              </p>
                              {leave.startDate !== leave.endDate && (
                                <p className="text-xs text-muted-foreground">
                                  to {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                </p>
                              )}
                              {leave.isHalfDay && (
                                <Badge variant="outline" className="text-[10px] mt-1">
                                  Half Day - {leave.halfDayType === 'first_half' ? 'First Half' : 'Second Half'}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">{leave.days}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {leave.days > 1 ? 'days' : 'day'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge()}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {leave.createdAt || leave.appliedOn ? (
                                format(new Date(leave.createdAt || leave.appliedOn), 'MMM dd, yyyy')
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {leave.status === 'approved' && leave.approvedOn ? (
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {format(new Date(leave.approvedOn), 'MMM dd, yyyy')}
                                </span>
                              ) : leave.status === 'rejected' && leave.rejectedOn ? (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  {format(new Date(leave.rejectedOn), 'MMM dd, yyyy')}
                                </span>
                              ) : leave.status === 'cancelled' && leave.cancelledOn ? (
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {format(new Date(leave.cancelledOn), 'MMM dd, yyyy')}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {leave.status === 'approved' && leave.approvedBy ? (
                                <div>
                                  <p className="font-medium text-green-600 dark:text-green-400">
                                    {leave.approvedBy}
                                  </p>
                                </div>
                              ) : leave.status === 'rejected' && leave.rejectedBy ? (
                                <div>
                                  <p className="font-medium text-red-600 dark:text-red-400">
                                    {leave.rejectedBy}
                                  </p>
                                </div>
                              ) : leave.status === 'cancelled' && leave.cancelledBy ? (
                                <div>
                                  <p className="font-medium text-gray-600 dark:text-gray-400">
                                    {leave.cancelledBy}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Pending</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {leave.status === 'rejected' && leave.rejectionReason ? (
                                <div className="text-sm space-y-1">
                                  <p className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase">Rejection Reason:</p>
                                  <p className="text-xs text-foreground bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900">
                                    {leave.rejectionReason}
                                  </p>
                                </div>
                              ) : leave.status === 'cancelled' && leave.cancellationReason ? (
                                <div className="text-sm space-y-1">
                                  <p className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase">Cancellation Reason:</p>
                                  <p className="text-xs text-foreground bg-gray-50 dark:bg-gray-950/20 p-2 rounded border border-gray-200 dark:border-gray-900">
                                    {leave.cancellationReason}
                                  </p>
                                </div>
                              ) : leave.justification || leave.reason ? (
                                <div className="text-sm space-y-1">
                                  <p className="font-semibold text-muted-foreground text-xs uppercase">Your Reason:</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {leave.justification || leave.reason}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                              {leave.remarks && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                                  <span className="font-semibold">Note:</span> {leave.remarks}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  toast.info(`Leave Details for ${leave.leaveType}`, {
                                    description: `${leave.days} day(s) from ${format(new Date(leave.startDate), 'MMM dd')} to ${format(new Date(leave.endDate), 'MMM dd')}`,
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {leave.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    toast.info('Cancel request feature coming soon');
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground mb-2">
                        {leaveSearchQuery || leaveTypeFilter !== 'all' || leaveStatusFilter !== 'all' 
                          ? 'No leaves match your filters' 
                          : 'No leave history found'}
                      </p>
                      {!leaveSearchQuery && leaveTypeFilter === 'all' && leaveStatusFilter === 'all' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setIsApplyLeaveOpen(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Request Your First Leave
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary Footer */}
          {filteredAndSortedLeaves.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 border-t">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Approved: <span className="font-semibold text-green-600">{filteredAndSortedLeaves.filter(l => l.status === 'approved').length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-muted-foreground">
                      Pending: <span className="font-semibold text-orange-600">{filteredAndSortedLeaves.filter(l => l.status === 'pending').length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">
                      Rejected: <span className="font-semibold text-red-600">{filteredAndSortedLeaves.filter(l => l.status === 'rejected').length}</span>
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing: <span className="font-semibold text-foreground">{filteredAndSortedLeaves.length}</span> of <span className="font-semibold text-foreground">{leaves.length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Records Section */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2 animate-in slide-in-from-bottom-6 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Attendance Records
              </CardTitle>
              <CardDescription>Your daily attendance and working hours</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Month Filters */}
          <div className="flex gap-2 flex-wrap">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={activePeriod === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Attendance Table */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted-color/50 font-semibold text-sm">
                <div>Date</div>
                <div>Attendance</div>
                <div>Effective Hours</div>
                <div>Gross Hours</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Table Body */}
              {filteredRecords.length > 0 ? (
                <div>
                  {filteredRecords.map((record, index) => (
                    <div
                      key={`${record.date}-${record.userId}`}
                      className={`grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center ${getRowClassName(record, index)}`}
                    >
                      {/* Date Column */}
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                      </div>

                      {/* Attendance Visual Column */}
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(record)}
                        <div>
                          {record.checkIn ? (
                            <>
                              <p className="text-sm font-medium">{record.checkIn}</p>
                              {record.checkOut && (
                                <p className="text-xs text-muted-foreground">{record.checkOut}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {record.status === 'W-Off' ? 'Week Off' :
                              record.status === 'Holiday' ? 'Holiday' :
                              record.status === 'Leave' ? 'On Leave' :
                              'No Time Entries Logged'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Effective Hours Column */}
                      <div>
                        {record.effectiveHours ? (
                          <Badge variant="secondary" className="font-mono">
                            {record.effectiveHours}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Gross Hours Column */}
                      <div>
                        {record.grossHours ? (
                          <Badge variant="outline" className="font-mono">
                            {record.grossHours}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Log Menu Column */}
                      <div className="flex justify-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2" align="end">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => {
                                  toast.info('View details coming soon');
                                }}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={() => {
                                  toast.info('Edit feature coming soon');
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  toast.info('Delete feature coming soon');
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-lg">No attendance records found for this period</p>
                  <p className="text-sm mt-2">Check in from your dashboard to start tracking attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Apply Leave Drawer */}
      {user && (
        <ApplyLeaveDrawer
          open={isApplyLeaveOpen}
          onOpenChange={(open) => {
            setIsApplyLeaveOpen(open);
            if (!open) {
              setPreSelectedLeaveType(null);
            }
          }}
          userId={user.employeeId || ''}
          userName={user.name || ''}
          userEmail={user.email || ''}
          department={currentEmployee?.department || ''}
          managerId={currentEmployee?.reportingManagerId || 'HR'}
          defaultLeaveType={preSelectedLeaveType}
          onSuccess={() => {
            if (user?.employeeId) {
              fetchLeaves(user.employeeId);
              fetchLeaveBalance(user.employeeId);
            }
          }}
        />
      )}
    </div>
  );
}

