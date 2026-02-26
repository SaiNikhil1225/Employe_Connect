import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, AlertCircle, X, Search, Eye, Edit, Filter, ChevronLeft, ChevronRight, Info, CalendarDays, BarChart3, PieChart, Calendar, Clock, FileText, CheckCircle, XCircle, CircleDot, TrendingUp, Sparkles, Palmtree, Plane, Circle } from 'lucide-react';
import type { LeaveRequest, LeaveBalance } from '@/types/leave';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useLeaveStore } from '@/store/leaveStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { ApplyLeaveDrawer } from '@/components/leave/ApplyLeaveDrawer';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Skeleton components for loading states
function LeaveBalanceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function LeaveTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
    </TableRow>
  );
}

function LeaveTableSkeleton() {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Leave Dates</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <LeaveTableRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Leave Stats Component
interface LeaveStatsProps {
  leaves: LeaveRequest[];
  leaveBalance: LeaveBalance | null;
  selectedMonthYear: string;
}

function LeaveStats({ leaves }: LeaveStatsProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  // Calculate weekly pattern (Mon-Sun)
  const weeklyPattern = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const pattern = days.map(day => ({ day, count: 0 }));

    leaves.forEach(leave => {
      if (leave.status === 'cancelled' || leave.status === 'rejected') return;
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        pattern[index].count += leave.isHalfDay ? 0.5 : 1;
      }
    });

    const maxCount = Math.max(...pattern.map(p => p.count), 1);
    return { pattern, maxCount };
  }, [leaves]);

  // Calculate monthly pattern (Jan-Dec)
  const monthlyPattern = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pattern = months.map(month => ({ month, count: 0 }));

    leaves.forEach(leave => {
      if (leave.status === 'cancelled' || leave.status === 'rejected') return;
      const start = new Date(leave.startDate);
      const monthIndex = start.getMonth();
      pattern[monthIndex].count += leave.days || 0;
    });

    const maxCount = Math.max(...pattern.map(p => p.count), 1);
    return { pattern, maxCount };
  }, [leaves]);

  // Calculate leave types for donut chart - includes approved and pending
  const consumedByType = useMemo(() => {
    // Calculate days from approved and pending leaves
    const consumed: Record<string, number> = {
      'Earned Leave': 0,
      'Sabbatical Leave': 0,
      'Comp Off': 0,
      'Paternity Leave': 0
    };

    // Sum up all approved and pending leaves by type (exclude cancelled/rejected)
    leaves.forEach(leave => {
      if (leave.status === 'cancelled' || leave.status === 'rejected') return;
      const days = leave.days || 0;
      if (consumed.hasOwnProperty(leave.leaveType)) {
        consumed[leave.leaveType] += days;
      }
    });

    const types = [
      { name: 'Earned', fullName: 'Earned Leave', consumed: consumed['Earned Leave'], color: '#3B82F6' },
      { name: 'Sabbatical', fullName: 'Sabbatical Leave', consumed: consumed['Sabbatical Leave'], color: '#8B5CF6' },
      { name: 'Comp Off', fullName: 'Comp Off', consumed: consumed['Comp Off'], color: '#F97316' },
      { name: 'Paternity', fullName: 'Paternity Leave', consumed: consumed['Paternity Leave'], color: '#22C55E' }
    ];

    // Filter to only include leave types that have been used
    const usedTypes = types.filter(t => t.consumed > 0);
    const total = usedTypes.reduce((sum, t) => sum + t.consumed, 0);

    // Calculate SVG arc segments
    let currentAngle = 0;
    const segments = usedTypes.map(type => {
      const percentage = total > 0 ? (type.consumed / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...type,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return segment;
    });

    return { segments, total };
  }, [leaves]);

  // Helper to create SVG arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    if (endAngle - startAngle === 0) return '';
    
    // Handle full circle case (360 degrees) - SVG arc can't draw a complete circle
    if (endAngle - startAngle >= 359.99) {
      // Draw two half circles instead
      return `M ${50} ${50 - radius} A ${radius} ${radius} 0 1 1 ${50} ${50 + radius} A ${radius} ${radius} 0 1 1 ${50} ${50 - radius} 
              M ${50} ${50 - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${50} ${50 + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${50} ${50 - innerRadius} Z`;
    }

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);

    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Pattern Card */}
        <Card className="transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              Weekly Pattern
            </CardTitle>
            <CardDescription className="text-xs">Leave distribution by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-1">
              {weeklyPattern.pattern.map(({ day, count }) => (
                <Tooltip key={day} open={hoveredDay === day}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div
                        className="w-full bg-purple-500 rounded-t-sm transition-all hover:bg-purple-600"
                        style={{
                          height: `${(count / weeklyPattern.maxCount) * 80}px`,
                          minHeight: count > 0 ? '4px' : '0px'
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{day}: {count} day{count !== 1 ? 's' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Types Breakdown - Donut Chart */}
        <Card className="transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Leave Types Breakdown
            </CardTitle>
            <CardDescription className="text-xs">Usage by type (approved + pending)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                {consumedByType.total === 0 ? (
                  // Show a placeholder gray circle when no data
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="15"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="25"
                      fill="currentColor"
                      className="text-background"
                    />
                  </>
                ) : (
                  consumedByType.segments.map((segment) => (
                    <g key={segment.name}>
                      <path
                        d={createArcPath(segment.startAngle, segment.endAngle, 40, 25)}
                        fill={segment.color}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        onMouseEnter={() => setHoveredType(segment.name)}
                        onMouseLeave={() => setHoveredType(null)}
                      />
                    </g>
                  ))
                )}
                {/* Center text */}
                <text x="50" y="47" textAnchor="middle" className="text-[8px] fill-muted-foreground">
                  {consumedByType.total === 0 ? 'No' : 'Leave'}
                </text>
                <text x="50" y="56" textAnchor="middle" className="text-[8px] fill-muted-foreground">
                  {consumedByType.total === 0 ? 'Data' : 'Types'}
                </text>
              </svg>

              {/* Hover Tooltip - positioned absolutely */}
              {hoveredType && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-md text-xs whitespace-nowrap pointer-events-none z-10">
                  <p className="font-medium">
                    {consumedByType.segments.find(s => s.name === hoveredType)?.fullName}
                  </p>
                  <p className="text-xs">
                    {consumedByType.segments.find(s => s.name === hoveredType)?.consumed} days ({consumedByType.segments.find(s => s.name === hoveredType)?.percentage.toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {consumedByType.segments.map((segment) => (
                <div key={segment.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-[10px] text-muted-foreground truncate">
                    {segment.name}: {segment.consumed}d
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats Card */}
        <Card className="transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Monthly Stats
            </CardTitle>
            <CardDescription className="text-xs">Leave days per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-0.5">
              {monthlyPattern.pattern.map(({ month, count }) => (
                <Tooltip key={month} open={hoveredMonth === month}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                        style={{
                          height: `${(count / monthlyPattern.maxCount) * 80}px`,
                          minHeight: count > 0 ? '4px' : '0px'
                        }}
                      />
                      <span className="text-[8px] text-muted-foreground">{month}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{month}: {count} day{count !== 1 ? 's' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export function Leave() {
  const { user } = useAuthStore();
  const { leaves, leaveBalance, isLoading, fetchLeaves, fetchLeaveBalance, cancelLeave } = useLeaveStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLeaveId, setCancelLeaveId] = useState<string | null>(null);
  const [preSelectedLeaveType, setPreSelectedLeaveType] = useState<'Earned Leave' | 'Sabbatical Leave' | 'Comp Off' | 'Paternity Leave' | null>(null);

  // Filter states
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('all');
  const itemsPerPage = 10;

  // View/Edit states
  const [viewLeave, setViewLeave] = useState<typeof leaves[0] | null>(null);
  const [editLeave, setEditLeave] = useState<typeof leaves[0] | null>(null);

  // Generate month options for 2024-2025
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    [2024, 2025, 2026].forEach(year => {
      months.forEach((month, index) => {
        options.push({
          value: `${year}-${String(index + 1).padStart(2, '0')}`,
          label: `${month} ${year}`
        });
      });
    });

    return options;
  }, []);

  // Use useMemo to derive current employee instead of useState + useEffect
  const currentEmployee = useMemo(() => {
    if (user?.employeeId && employees.length > 0) {
      return employees.find(e => e.employeeId === user.employeeId);
    }
    return undefined;
  }, [user, employees]);

  // Calculate dynamic leave balance from the new leaveTypes structure
  const dynamicLeaveBalance = useMemo(() => {
    if (!leaveBalance || !leaveBalance.leaveTypes) {
      // Return empty structure if no balance data
      return {
        employeeId: user?.employeeId || '',
        leavePlan: 'Acuvate' as const,
        leaveTypes: []
      };
    }

    // Return the balance as-is since it already has the correct structure
    return leaveBalance;
  }, [leaveBalance, user]);

  // Helper to get total used and available across all leave types
  const totalStats = useMemo(() => {
    if (!dynamicLeaveBalance.leaveTypes || dynamicLeaveBalance.leaveTypes.length === 0) {
      return { totalUsed: 0, totalPending: 0, totalAvailable: 0, totalAllocated: 0 };
    }

    return dynamicLeaveBalance.leaveTypes.reduce((acc, lt) => ({
      totalUsed: acc.totalUsed + (lt.used || 0),
      totalPending: acc.totalPending + (lt.pending || 0),
      totalAvailable: acc.totalAvailable + (lt.available || 0),
      totalAllocated: acc.totalAllocated + (lt.allocated || lt.accrued || 0)
    }), { totalUsed: 0, totalPending: 0, totalAvailable: 0, totalAllocated: 0 });
  }, [dynamicLeaveBalance]);

  useEffect(() => {
    if (user?.employeeId) {
      // Fetch leave data for current user
      fetchLeaves(user.employeeId);
      fetchLeaveBalance(user.employeeId);

      // Fetch employee data to get manager info
      fetchEmployees();
    }
  }, [user?.employeeId, fetchLeaves, fetchLeaveBalance, fetchEmployees]);

  const handleCancelLeave = (leaveId: string) => {
    setCancelLeaveId(leaveId);
    setShowCancelDialog(true);
  };

  const confirmCancelLeave = async () => {
    if (cancelLeaveId) {
      try {
        await cancelLeave(cancelLeaveId);
      } catch (error) {
        console.error('Failed to cancel leave:', error);
      }
    }
    setShowCancelDialog(false);
    setCancelLeaveId(null);
  };

  const handleLeaveSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 4000);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return format(start, 'MMM dd, yyyy');
    }

    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  // Check if there are any pending requests
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
  const hasPendingRequests = pendingLeaves.length > 0;

  // Filter and sort leaves
  const filteredLeaves = useMemo(() => {
    return leaves
      .filter(leave => {
        // Month/Year filter
        if (selectedMonthYear !== 'all') {
          const [year, month] = selectedMonthYear.split('-').map(Number);
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          const filterStart = new Date(year, month - 1, 1);
          const filterEnd = new Date(year, month, 0);

          // Check if leave overlaps with selected month
          if (leaveEnd < filterStart || leaveStart > filterEnd) {
            return false;
          }
        }
        // Leave type filter
        if (leaveTypeFilter !== 'all' && leave.leaveType !== leaveTypeFilter) {
          return false;
        }
        // Status filter
        if (statusFilter !== 'all' && leave.status !== statusFilter) {
          return false;
        }
        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            leave.leaveType.toLowerCase().includes(query) ||
            leave.justification?.toLowerCase().includes(query) ||
            leave.status.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leaves, leaveTypeFilter, statusFilter, searchQuery, selectedMonthYear]);

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palmtree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">My Leave Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your leave requests and balance
                  {dynamicLeaveBalance.leavePlan && (
                    <Badge className={`ml-2 ${LeavePlanColors[dynamicLeaveBalance.leavePlan]}`}>
                      {dynamicLeaveBalance.leavePlan} Plan
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsApplyLeaveOpen(true)}
            disabled={!currentEmployee}
            size="lg"
            className="shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Used</p>
              <p className="text-lg font-semibold text-foreground">
                {totalStats.totalUsed} days
              </p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-foreground">{pendingLeaves.length} requests</p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-semibold text-foreground">
                {leaves.filter(l => l.status === 'approved').length} this year
              </p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-semibold text-foreground">
                {totalStats.totalAvailable} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      {hasPendingRequests ? (
        <div className="bg-orange-100 dark:bg-orange-900/10 border border-warning-color/20 rounded-lg p-4 shadow-sm overflow-hidden relative">
          {/* Flying plane animation */}
          <div className="absolute top-2 right-4 opacity-20">
            <Plane className="h-8 w-8 text-orange-600 dark:text-orange-400" style={{
              animation: 'flyPath 3s ease-in-out infinite'
            }} />
          </div>

          <div className="flex items-start gap-3">
            <Plane className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                {pendingLeaves.length} Leave Request{pendingLeaves.length > 1 ? 's' : ''} In Flight
              </p>
              <div className="space-y-2">
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div key={leave.id || leave._id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-100 dark:bg-orange-900/10 animate-pulse" />
                    <span className="font-medium text-orange-600 dark:text-orange-400">{leave.leaveType}</span>
                    <span className="text-orange-600 dark:text-orange-400">•</span>
                    <span className="text-orange-600 dark:text-orange-400">{formatDateRange(leave.startDate, leave.endDate)}</span>
                    <span className="text-orange-600 dark:text-orange-400">•</span>
                    <span className="text-orange-600 dark:text-orange-400">{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                  </div>
                ))}
                {pendingLeaves.length > 3 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">+{pendingLeaves.length - 3} more pending</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-blue-900">Hurray! No pending leave requests</p>
            <p className="text-sm text-blue-700">Request leave on the right!</p>
          </div>
        </div>
      )}

      {/* Leave Balance Cards */}
      {dynamicLeaveBalance.leaveTypes && dynamicLeaveBalance.leaveTypes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Leave Balance</h2>
              <p className="text-sm text-muted-foreground">
                {dynamicLeaveBalance.leaveTypes.length} leave {dynamicLeaveBalance.leaveTypes.length === 1 ? 'type' : 'types'} available in your {dynamicLeaveBalance.leavePlan} plan
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {dynamicLeaveBalance.leaveTypes.reduce((sum, lt) => sum + (lt.available || 0), 0)} total days available
            </Badge>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {dynamicLeaveBalance.leaveTypes.map((leaveType) => {
            // Icon mapping
            // Color mapping per leave type
            const colorMap: Record<string, { border: string; text: string; progressBg: string }> = {
              'Casual Leave': { border: 'border-l-purple-500', text: 'text-purple-600', progressBg: 'bg-purple-100 dark:bg-purple-950/30' },
              'Earned Leave': { border: 'border-l-blue-500', text: 'text-blue-600', progressBg: 'bg-blue-100 dark:bg-blue-950/30' },
              'Sick Leave': { border: 'border-l-red-500', text: 'text-red-600', progressBg: 'bg-red-100 dark:bg-red-950/30' },
              'Compensatory Off': { border: 'border-l-orange-500', text: 'text-orange-600', progressBg: 'bg-orange-100 dark:bg-orange-950/30' },
              'Maternity Leave': { border: 'border-l-pink-500', text: 'text-pink-600', progressBg: 'bg-pink-100 dark:bg-pink-950/30' },
              'Paternity Leave': { border: 'border-l-green-500', text: 'text-green-600', progressBg: 'bg-green-100 dark:bg-green-950/30' },
              'Bereavement Leave': { border: 'border-l-gray-500', text: 'text-gray-600', progressBg: 'bg-gray-100 dark:bg-gray-950/30' },
              'Marriage Leave': { border: 'border-l-yellow-500', text: 'text-yellow-600', progressBg: 'bg-yellow-100 dark:bg-yellow-950/30' },
              'Loss of Pay': { border: 'border-l-slate-500', text: 'text-slate-600', progressBg: 'bg-slate-100 dark:bg-slate-950/30' },
              'Annual Leave': { border: 'border-l-indigo-500', text: 'text-indigo-600', progressBg: 'bg-indigo-100 dark:bg-indigo-950/30' }
            };

            const colors = colorMap[leaveType.type] || colorMap['Loss of Pay'];
            const totalAllocated = leaveType.allocated || leaveType.accrued || 0;
            const progressPercent = totalAllocated > 0 ? (leaveType.available / totalAllocated) * 100 : 0;

            return (
              <Card key={leaveType.type} className={`group hover:shadow-md transition-all duration-200 border-l-4 ${colors.border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{leaveType.type}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7"
                      onClick={() => {
                        setPreSelectedLeaveType(leaveType.type);
                        setIsApplyLeaveOpen(true);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    {leaveType.carriedForward > 0 ? `Includes ${leaveType.carriedForward} carried forward` : 'Current year allocation'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-xl font-bold ${colors.text}`}>
                        {leaveType.available}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">of {totalAllocated} available</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={progressPercent} 
                        className={`h-1.5 ${colors.progressBg}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {leaveType.used}</span>
                        {leaveType.pending > 0 && (
                          <span className="text-orange-500">+{leaveType.pending} pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Your Leave Balance</h2>
            <p className="text-sm text-muted-foreground">No leave types available</p>
          </div>
          <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No leave balances available</p>
            <p className="text-sm text-muted-foreground mt-1">Contact HR to set up your leave plan</p>
          </div>
        </div>
      )}

      {/* Detailed Leave Balance Table */}
      {dynamicLeaveBalance.leaveTypes && dynamicLeaveBalance.leaveTypes.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Detailed Leave Balance Breakdown
            </CardTitle>
            <CardDescription>Complete overview of your leave entitlements and usage</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Leave Type</TableHead>
                    <TableHead className="text-center font-semibold">Total Allocated</TableHead>
                    <TableHead className="text-center font-semibold">Used</TableHead>
                    <TableHead className="text-center font-semibold">Pending Approval</TableHead>
                    <TableHead className="text-center font-semibold">Available</TableHead>
                    <TableHead className="text-center font-semibold">Carried Forward</TableHead>
                    <TableHead className="text-center font-semibold">Utilization %</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dynamicLeaveBalance.leaveTypes.map((leaveType) => {
                    const totalAllocated = leaveType.allocated || leaveType.accrued || 0;
                    const utilizationPercent = totalAllocated > 0 ? ((leaveType.used / totalAllocated) * 100).toFixed(1) : '0.0';
                    const availablePercent = totalAllocated > 0 ? ((leaveType.available / totalAllocated) * 100).toFixed(0) : '0';
                    
                    // Color based on available balance
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
                            <span className="text-lg font-semibold text-red-600 dark:text-red-400">{leaveType.used}</span>
                            <span className="text-xs text-muted-foreground">consumed</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {leaveType.pending > 0 ? (
                              <>
                                <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">{leaveType.pending}</span>
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
                            <span className={`text-2xl font-bold ${getBalanceColor()}`}>{leaveType.available}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>remaining</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{availablePercent}%</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {leaveType.carriedForward > 0 ? (
                              <>
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{leaveType.carriedForward}</span>
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
                            disabled={leaveType.available <= 0}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
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
                      {dynamicLeaveBalance.leaveTypes.reduce((sum, lt) => sum + (lt.carriedForward || 0), 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-bold text-foreground">
                      {totalStats.totalAllocated > 0 ? ((totalStats.totalUsed / totalStats.totalAllocated) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
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
                  Last updated: {dynamicLeaveBalance.lastUpdated ? format(new Date(dynamicLeaveBalance.lastUpdated), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Stats */}
      <LeaveStats
        leaves={leaves}
        leaveBalance={dynamicLeaveBalance}
        selectedMonthYear={selectedMonthYear}
      />

      {/* Leave History */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Leave History
                </CardTitle>
                <CardDescription>Your recent leave requests ({filteredLeaves.length} total)</CardDescription>
              </div>

              {/* Month/Year Filter */}
              <Select value={selectedMonthYear} onValueChange={(value) => {
                setSelectedMonthYear(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[160px]">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Time</SelectItem>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leaves..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              <Select value={leaveTypeFilter} onValueChange={(value) => {
                setLeaveTypeFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[160px]">
                  <Palmtree className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {dynamicLeaveBalance.leaveTypes && dynamicLeaveBalance.leaveTypes.length > 0 ? (
                    dynamicLeaveBalance.leaveTypes.map((lt) => (
                      <SelectItem key={lt.type} value={lt.type}>{lt.type}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {(leaveTypeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setLeaveTypeFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LeaveTableSkeleton />
          ) : leaves.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No leave requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Apply Leave" to submit your first request
              </p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No matching leave requests</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Leave Dates</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action Taken On</TableHead>
                      <TableHead>Leave Note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeaves.map((leave) => {
                      const statusColor = leave.status === 'approved' ? 'bg-green-500' 
                        : leave.status === 'pending' ? 'bg-orange-500' 
                        : leave.status === 'rejected' ? 'bg-red-500' 
                        : 'bg-gray-400';
                      
                      return (
                        <TableRow 
                          key={leave.id || leave._id} 
                          className="group hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setViewLeave(leave)}
                        >
                          <TableCell className="p-0">
                            <div className={`w-1 h-full min-h-[60px] ${statusColor} rounded-r`} />
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDateRange(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {leave.leaveType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{leave.days}</span>
                            {leave.isHalfDay && (
                              <span className="text-xs text-muted-foreground ml-1">(Half)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {leave.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {leave.status === 'pending' && <Clock className="h-4 w-4 text-orange-500 animate-pulse" />}
                              {leave.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                              {leave.status === 'cancelled' && <Circle className="h-4 w-4 text-gray-400" />}
                              <span className={`text-sm font-medium capitalize ${
                                leave.status === 'approved' ? 'text-green-600 dark:text-green-400' 
                                : leave.status === 'pending' ? 'text-orange-600 dark:text-orange-400'
                                : leave.status === 'rejected' ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {leave.status}
                              </span>
                            </div>
                            {leave.expiresAt && leave.status === 'pending' && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Expires: {format(new Date(leave.expiresAt), 'MMM dd')}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {leave.approvedAt ? format(new Date(leave.approvedAt), 'MMM dd, yyyy') :
                             leave.rejectedAt ? format(new Date(leave.rejectedAt), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="truncate text-sm text-muted-foreground" title={leave.justification || ''}>
                              {leave.justification || '-'}
                            </p>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setViewLeave(leave)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {leave.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => setEditLeave(leave)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {(leave.status === 'pending' || leave.status === 'approved') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                  onClick={() => handleCancelLeave(leave.id || leave._id || '')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Drawer */}
      {user && currentEmployee && (
        <ApplyLeaveDrawer
          open={isApplyLeaveOpen}
          onOpenChange={(open) => {
            setIsApplyLeaveOpen(open);
            if (!open) setPreSelectedLeaveType(null); // Reset when closing
          }}
          userId={user.employeeId || user.id}
          userName={user.name}
          userEmail={user.email}
          department={currentEmployee.department || user.department || 'Unknown'}
          managerId={currentEmployee.reportingManagerId || 'MGR001'}
          onSuccess={handleLeaveSuccess}
          defaultLeaveType={preSelectedLeaveType}
        />
      )}

      {/* Cancel Leave Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to cancel this leave request?</p>
              {cancelLeaveId && (() => {
                const leave = leaves.find(l => l.id === cancelLeaveId);
                if (leave) {
                  return (
                    <div className="mt-3 p-3 bg-muted-color rounded-md">
                      <p className="font-medium text-card-foreground mb-1">Leave Dates:</p>
                      <p className="text-sm text-card-foreground">
                        {formatDateRange(leave.startDate, leave.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {leave.days} {leave.days === 1 ? 'day' : 'days'} • {leave.leaveType}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              <p className="text-sm mt-2">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelLeave} className="bg-red-600 hover:bg-red-700">
              Yes, cancel leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
            <div className="relative h-24 mb-4">
              <Plane className="h-12 w-12 text-blue-600 absolute animate-bounce" style={{
                animation: 'flyAway 2s ease-in-out forwards'
              }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your leave request has taken off!</h3>
            <p className="text-gray-600 dark:text-gray-400">Your manager will be notified shortly.</p>
          </div>
        </div>
      )}

      {/* View Leave Details Sheet */}
      <Sheet open={!!viewLeave} onOpenChange={(open) => !open && setViewLeave(null)}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Palmtree className="h-5 w-5 text-primary" />
                Leave Details
              </SheetTitle>
            </SheetHeader>
          </div>
          
          {/* Scrollable Body */}
          {viewLeave && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Date & Duration Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Leave Period</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {format(new Date(viewLeave.startDate), 'MMM dd')} - {format(new Date(viewLeave.endDate), 'MMM dd')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(viewLeave.startDate), 'yyyy')}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-900">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Duration</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {viewLeave.days} {viewLeave.days === 1 ? 'Day' : 'Days'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {viewLeave.isHalfDay 
                        ? (viewLeave.halfDayType === 'first_half' ? 'First Half' : 'Second Half')
                        : 'Full Day'}
                    </p>
                  </div>
                </div>

                {/* Leave Type & Status Row */}
                <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Palmtree className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Leave Type</p>
                      <p className="font-semibold text-foreground">{viewLeave.leaveType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                    <Badge
                      variant="outline"
                      className={`text-sm px-3 py-1 capitalize ${getStatusStyles(viewLeave.status)}`}
                    >
                      {viewLeave.status}
                    </Badge>
                  </div>
                </div>

                {/* Reason Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Reason / Justification</Label>
                  </div>
                  <div className="bg-muted/30 border rounded-xl p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {viewLeave.justification || 'No reason provided'}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {viewLeave.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-900">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <Label className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">Rejection Reason</Label>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400">{viewLeave.rejectionReason}</p>
                  </div>
                )}

                {/* Cancellation Reason (if cancelled) */}
                {viewLeave.cancellationReason && (
                  <div className="bg-gray-50 dark:bg-gray-950/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <Label className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Cancellation Reason</Label>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">{viewLeave.cancellationReason}</p>
                  </div>
                )}

                {/* Timeline Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Request Timeline</Label>
                  </div>
                  <div className="relative pl-6 space-y-4">
                    {/* Timeline line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />
                    
                    {/* Applied */}
                    <div className="relative flex items-start gap-3">
                      <div className="absolute left-[-24px] top-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Request Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(viewLeave.createdAt), 'MMMM dd, yyyy \'at\' hh:mm a')}
                        </p>
                      </div>
                    </div>

                    {/* Current Status */}
                    {viewLeave.status === 'pending' && (
                      <div className="relative flex items-start gap-3">
                        <div className="absolute left-[-24px] top-0.5 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                          <CircleDot className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Awaiting Approval</p>
                          <p className="text-xs text-muted-foreground">Pending manager review</p>
                        </div>
                      </div>
                    )}

                    {viewLeave.status === 'approved' && (
                      <div className="relative flex items-start gap-3">
                        <div className="absolute left-[-24px] top-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                          <p className="text-xs text-muted-foreground">
                            {viewLeave.approvedBy && `by ${viewLeave.approvedBy}`}
                            {viewLeave.approvedAt && ` on ${format(new Date(viewLeave.approvedAt), 'MMM dd, yyyy')}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewLeave.status === 'rejected' && (
                      <div className="relative flex items-start gap-3">
                        <div className="absolute left-[-24px] top-0.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                          <XCircle className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                          <p className="text-xs text-muted-foreground">
                            {viewLeave.rejectedBy && `by ${viewLeave.rejectedBy}`}
                            {viewLeave.rejectedAt && ` on ${format(new Date(viewLeave.rejectedAt), 'MMM dd, yyyy')}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewLeave.status === 'cancelled' && (
                      <div className="relative flex items-start gap-3">
                        <div className="absolute left-[-24px] top-0.5 h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center">
                          <Circle className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                          <p className="text-xs text-muted-foreground">
                            {viewLeave.cancelledAt && `on ${format(new Date(viewLeave.cancelledAt), 'MMM dd, yyyy')}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Footer - Action Buttons */}
          {viewLeave && (viewLeave.status === 'pending' || viewLeave.status === 'approved') && (
            <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
              <div className="flex gap-3">
                {viewLeave.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditLeave(viewLeave);
                      setViewLeave(null);
                    }}
                    className="flex-1 h-11"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCancelLeave(viewLeave.id || viewLeave._id || '');
                    setViewLeave(null);
                  }}
                  className="flex-1 h-11 font-semibold shadow-lg shadow-red-500/25"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Leave
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Leave - Reuse ApplyLeaveDrawer */}
      {user && currentEmployee && editLeave && (
        <ApplyLeaveDrawer
          open={!!editLeave}
          onOpenChange={(open) => !open && setEditLeave(null)}
          userId={user.employeeId || user.id}
          userName={user.name}
          userEmail={user.email}
          department={currentEmployee.department || user.department || 'Unknown'}
          managerId={currentEmployee.reportingManagerId || 'MGR001'}
          onSuccess={handleLeaveSuccess}
          editData={editLeave}
        />
      )}

      <style>{`
        @keyframes flyAway {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateX(50px) translateY(-30px) rotate(-15deg);
            opacity: 1;
          }
          100% {
            transform: translateX(200px) translateY(-100px) rotate(-30deg);
            opacity: 0;
          }
        }
        @keyframes flyPath {
          0%, 100% {
            transform: translateX(0) translateY(0) rotate(-45deg);
          }
          25% {
            transform: translateX(-10px) translateY(-5px) rotate(-50deg);
          }
          50% {
            transform: translateX(0) translateY(-10px) rotate(-45deg);
          }
          75% {
            transform: translateX(10px) translateY(-5px) rotate(-40deg);
          }
        }
      `}</style>
    </div>
  );
}
