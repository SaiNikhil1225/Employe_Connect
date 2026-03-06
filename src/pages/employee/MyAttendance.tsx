import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import { 
  Clock, 
  Home, 
  FileText,
  MoreHorizontal,
  User,
  Users,
  Calendar,
  LogIn,
  LogOut,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, subDays, subMonths } from 'date-fns';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import { WebClockInModal } from '@/components/attendance/WebClockInModal';
import { PageHeader } from '@/components/ui/page-header';
import { WFHRequestModal } from '@/components/attendance/WFHRequestModal';
import { RegularizationModal } from '@/components/attendance/RegularizationModal';
import { toast } from 'sonner';

export default function MyAttendance() {
  const [selectedDateRange, setSelectedDateRange] = useState('last-week');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClocking, setIsClocking] = useState(false);
  const [workDuration, setWorkDuration] = useState<{ hours: number; minutes: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [showWFHModal, setShowWFHModal] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);

  const { 
    stats, 
    dailyTimings, 
    wfhRequests, 
    regularizationRequests,
    logs,
    lastLogsUpdate,
    fetchStats, 
    fetchDailyTimings, 
    fetchWFHRequests, 
    fetchRegularizationRequests,
    fetchLogs, 
    submitWFHRequest, 
    submitRegularization, 
    webClockIn,
    webClockOut
  } = useAttendanceStore();
  const { user } = useAuthStore();
  
  // Get today's attendance record from logs (API data) or fallback to local storage
  const todayRecord = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Get all sessions for today
    const todaySessions = logs?.filter(log => {
      const logDate = format(new Date(log.date), 'yyyy-MM-dd');
      return logDate === today;
    }) || [];
    
    if (todaySessions.length > 0) {
      // Calculate cumulative hours from all completed sessions
      const completedSessions = todaySessions.filter(log => log.checkInTime && log.checkOutTime);
      const cumulativeHours = completedSessions.reduce((sum, log) => sum + (log.effectiveHours || 0), 0);
      
      // Find current open session (has check-in but no check-out)
      const openSession = todaySessions.find(log => log.checkInTime && !log.checkOutTime);
      
      // Get the most recent session for display
      const latestSession = todaySessions.sort((a, b) => 
        new Date(b.checkInTime || 0).getTime() - new Date(a.checkInTime || 0).getTime()
      )[0];
      
      const MAX_WORK_HOURS = 8;
      const remainingHours = Math.max(0, MAX_WORK_HOURS - cumulativeHours);
      
      // Convert to format compatible with existing UI
      const result = {
        ...latestSession,
        checkIn: openSession?.checkInTime ? format(new Date(openSession.checkInTime), 'h:mm a') : null,
        checkOut: null, // Always null if there's an open session
        effectiveHours: `${Math.floor(cumulativeHours)}h ${Math.round((cumulativeHours % 1) * 60)}m`,
        cumulativeHours,
        remainingHours,
        sessionCount: todaySessions.length,
        completedSessionCount: completedSessions.length,
        hasOpenSession: !!openSession,
        maxHoursReached: cumulativeHours >= MAX_WORK_HOURS
      };
      
      return result;
    }
    
    // No sessions today
    return null;
  }, [logs, lastLogsUpdate, user?.employeeId]);

  // Force fetch logs on component mount and periodically
  useEffect(() => {
    if (user?.employeeId) {
      // Force immediate fetch
      fetchLogs(user.employeeId);
      fetchStats(user.employeeId);
      fetchWFHRequests(user.employeeId);
      fetchRegularizationRequests(user.employeeId);
      
      // Set up polling every 60 seconds to keep data fresh
      const pollInterval = setInterval(() => {
        fetchLogs(user.employeeId);
      }, 60000);
      
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [user?.employeeId, fetchLogs, fetchStats, fetchWFHRequests, fetchRegularizationRequests]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange]);

  // Load data on initial mount
  useEffect(() => {
    if (user?.employeeId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.employeeId]);

  // Refetch logs when page becomes visible (for sync between pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.employeeId) {
        // Calculate date range based on current selection
        let startDate: string | undefined;
        let endDate: string | undefined;
        
        const now = new Date();
        switch (selectedDateRange) {
          case 'last-week':
            startDate = format(subDays(now, 7), 'yyyy-MM-dd');
            endDate = format(now, 'yyyy-MM-dd');
            break;
          case 'last-month':
            startDate = format(subMonths(now, 1), 'yyyy-MM-dd');
            endDate = format(now, 'yyyy-MM-dd');
            break;
          case 'last-3-months':
            startDate = format(subMonths(now, 3), 'yyyy-MM-dd');
            endDate = format(now, 'yyyy-MM-dd');
            break;
          default:
            break;
        }
        
        fetchLogs(user.employeeId, { startDate, endDate });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchLogs, user?.employeeId, selectedDateRange]);

  const loadData = async () => {
    const employeeId = user?.employeeId || 'EMP001';
    
    // Calculate date range based on selection
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    const now = new Date();
    switch (selectedDateRange) {
      case 'last-week':
        startDate = format(subDays(now, 7), 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case 'last-month':
        startDate = format(subMonths(now, 1), 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case 'last-3-months':
        startDate = format(subMonths(now, 3), 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      default:
        // No specific date range
        break;
    }
    
    // Load data with individual error handling to prevent failures from breaking the entire page
    try {
      await fetchStats(employeeId, true);
    } catch (error) {
      // Error handled silently
    }
    
    try {
      await fetchDailyTimings(employeeId, format(selectedDay, 'yyyy-MM-dd'));
    } catch (error) {
      // Error handled silently
    }
    
    try {
      await fetchWFHRequests();
    } catch (error) {
      // Error handled silently
    }
    
    try {
      await fetchRegularizationRequests();
    } catch (error) {
      // Error handled silently
    }

    try {
      await fetchLogs(employeeId, { startDate, endDate });
    } catch (error) {
      // Error handled silently
    }
  };

  // Handle actions
  const handleClockIn = async () => {
    if (!user?.employeeId) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      setIsClocking(true);
      
      await webClockIn(user.employeeId);
      
      // Force refresh to ensure data loads
      await fetchLogs(user.employeeId);
      
      // Single delayed refresh to catch async updates
      setTimeout(async () => {
        await fetchLogs(user.employeeId);
      }, 1000);
      
    } catch (error: any) {
      // Error handled silently
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.employeeId) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!todayRecord?.hasOpenSession) {
      toast.error('No active session to clock out. Please clock in first.');
      
      // Force refresh to get latest data
      await fetchLogs(user.employeeId);
      return;
    }
    
    try {
      setIsClocking(true);
      
      await webClockOut(user.employeeId);
      
      // Force refresh to ensure data loads
      await fetchLogs(user.employeeId);
      
      // Single delayed refresh to catch async updates
      setTimeout(async () => {
        await fetchLogs(user.employeeId);
      }, 1000);
      
    } catch (error: any) {
      // Error handled silently
    } finally {
      setIsClocking(false);
    }
  };

  const handleRegularize = () => {
    setShowRegularizationModal(true);
  };

  const handleWFHSubmit = async (data: { date: string; reason: string }) => {
    try {
      await submitWFHRequest(data);
      setShowWFHModal(false);
      if (user?.employeeId) {
        await fetchWFHRequests(); // Refresh WFH requests
      }
    } catch (error) {
      // Error handled silently
    }
  };

  // Calculate work duration and auto clock-out at 8 hours cumulative
  useEffect(() => {
    // Check if there's an open session and track duration
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaySessions = logs?.filter(log => {
      const logDate = format(new Date(log.date), 'yyyy-MM-dd');
      return logDate === today;
    }) || [];
    
    const openSession = todaySessions.find(log => log.checkInTime && !log.checkOutTime);
    
    if (openSession && openSession.checkInTime && !isClocking) {
      const checkInTime = new Date(openSession.checkInTime);
      const MAX_WORK_HOURS = 8;
      let hasAutoClockOut = false;
      
      // Calculate cumulative hours from completed sessions
      const completedSessions = todaySessions.filter(log => log.checkInTime && log.checkOutTime);
      const cumulativeHours = completedSessions.reduce((sum, log) => sum + (log.effectiveHours || 0), 0);
      
      const updateDuration = () => {
        const now = new Date();
        const diffMs = now.getTime() - checkInTime.getTime();
        const diffMinutes = Math.floor(diffMs / 1000 / 60);
        const sessionHours = Math.floor(diffMinutes / 60);
        const sessionMinutes = diffMinutes % 60;
        
        // Calculate total hours including current session (approximate without break)
        const currentSessionHours = diffMinutes / 60;
        const totalHours = cumulativeHours + currentSessionHours;
        
        // Display current session duration
        setWorkDuration({ hours: sessionHours, minutes: sessionMinutes });
        
        // Auto clock-out when total reaches 8 hours (only once)
        if (totalHours >= MAX_WORK_HOURS && !hasAutoClockOut) {
          hasAutoClockOut = true;
          toast.info(`Total work hours reached ${MAX_WORK_HOURS} hours. Auto-clocking out now...`);
          handleClockOut();
        }
      };
      
      updateDuration();
      const interval = setInterval(updateDuration, 60000); // Update every minute
      
      return () => clearInterval(interval);
    } else {
      setWorkDuration(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, isClocking]);

  const handleRegularizationSubmit = async (data: any) => {
    try {
      await submitRegularization(data);
      setShowRegularizationModal(false);
      if (user?.employeeId) {
        await fetchRegularizationRequests(); // Refresh regularization requests
        await fetchLogs(user.employeeId); // Refresh logs in case it affects attendance
      }
    } catch (error) {
      // Error handled silently
    }
  };

  // Generate week days starting from Monday
  const getWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const calculateProgress = () => {
    if (!dailyTimings) return { work: 0, break: 0, total: 9 };
    
    const workHours = 7; // Assuming 7 work hours
    const breakHours = 1; // Assuming 1 hour break
    const totalHours = workHours + breakHours;
    
    return {
      work: (workHours / totalHours) * 100,
      break: (breakHours / totalHours) * 100,
      total: totalHours
    };
  };

  const progress = calculateProgress();

  // DataTable configuration for Attendance Logs
  const formatHours = (hours: number) => {
    if (!hours || hours === 0) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (dateTime: Date | string | null | undefined) => {
    if (!dateTime) return '--';
    const date = new Date(dateTime);
    return format(date, 'h:mm a');
  };

  const attendanceColumns: DataTableColumn<any>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {value ? format(new Date(value), 'EEE, dd MMM yyyy') : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        // Handle weekly-off and holidays
        if (value === 'weekly-off') {
          return (
            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
              W-OFF
            </Badge>
          );
        }
        if (value === 'leave') {
          return (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 font-medium">
              Leave
            </Badge>
          );
        }
        if (value === 'wfh') {
          return (
            <Badge variant="secondary" className="bg-green-100 text-green-700 font-medium">
              WFH
            </Badge>
          );
        }
        
        // No time entries
        if (!row.checkInTime && !row.checkOutTime) {
          return <div className="text-sm text-muted-foreground">No Time Entries Logged</div>;
        }
        
        // Show check-in/check-out times
        return (
          <div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {formatTime(row.checkInTime)} - {formatTime(row.checkOutTime)}
            </div>
            {row.isLate && row.lateMinutes > 0 && (
              <div className="text-xs text-orange-600">
                Late by {row.lateMinutes} min
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'effectiveHours',
      label: 'Effective Hours',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatHours(value)}</div>
      )
    },
    {
      key: 'grossHours',
      label: 'Gross Hours',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatHours(value)}</div>
      )
    }
  ];

  const attendanceActions: DataTableAction<any>[] = [
    {
      label: 'Regularize',
      onClick: () => {
        setShowRegularizationModal(true);
      }
    },
    {
      label: 'Apply WFH Request',
      onClick: () => {
        setShowWFHModal(true);
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Clock}
        title="My Attendance"
        description="Track your attendance and work hours"
      />


      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">My Hours Today</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.me?.avgHoursPerDay || '7.5'}h</div>
            <p className="text-xs text-muted-foreground mt-1">Working time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Hours/Day</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
              <User className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.me?.avgHoursPerDay || '8.5'}h</div>
            <p className="text-xs text-muted-foreground mt-1">{selectedDateRange.replace('-', ' ')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">On-Time Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{stats?.me?.onTimeArrivalPercentage || 95}%</div>
            <p className="text-xs text-muted-foreground mt-1">Punctuality score</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Team Average</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.myTeam?.avgHoursPerDay || '8.2'}h</div>
            <p className="text-xs text-muted-foreground mt-1">Team performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Filter by Date Range</h2>
            <p className="text-sm text-muted-foreground">Select period</p>
          </div>
        </div>
        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm rounded-xl bg-white dark:bg-gray-800 border-0 ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Timings</CardTitle>
              <div className="flex gap-1">
                {getWeekDays().map((day, index) => {
                  const dayLetter = format(day, 'EEEEE');
                  const isSelected = isSameDay(day, selectedDay);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 rounded-full p-0 text-xs font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isToday
                          ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                          : 'text-muted-foreground border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={() => {
                        setSelectedDay(day);
                        // Fetch timings for selected day
                        const employeeId = user?.employeeId || 'EMP001';
                        fetchDailyTimings(employeeId, format(day, 'yyyy-MM-dd'));
                      }}
                    >
                      {dayLetter}
                    </Button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isSameDay(selectedDay, new Date()) ? 'Today' : format(selectedDay, 'EEEE')} 
                  {' '}({dailyTimings?.checkIn || '10:00 AM'} – {dailyTimings?.checkOut || '7:00 PM'})
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${progress.work}%` }}
                    />
                    <div 
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${progress.break}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Working</span>
                  <span>Break</span>
                  <span>Remaining</span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {dailyTimings?.totalHours || '9h 0m'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Break time:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {dailyTimings?.breakDuration || '60 min'}
                  </span>
                </div>
                {dailyTimings?.workingHours && (
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="text-sm font-medium text-muted-foreground">Effective Hours:</span>
                    <span className="text-sm font-bold text-green-600">
                      {dailyTimings.workingHours}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm rounded-xl bg-white dark:bg-gray-800 border-0 ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Web Check-In</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono">
                  {format(currentTime, 'h:mm a')}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {format(currentTime, 'EEEE, MMMM dd, yyyy')}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                {todayRecord ? (
                  <div className="space-y-2">
                    {/* Session info */}
                    {todayRecord.sessionCount > 0 && (
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-xs text-muted-foreground font-medium">
                          {todayRecord.hasOpenSession ? 'Current Session' : 'Sessions Today'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {todayRecord.hasOpenSession 
                            ? `Session #${todayRecord.sessionCount}` 
                            : `${todayRecord.completedSessionCount} Completed`}
                        </Badge>
                      </div>
                    )}
                    
                    {todayRecord.hasOpenSession ? (
                      // Has an open session
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Checked In</span>
                          <span className="text-sm font-medium text-green-600">
                            {todayRecord.checkIn}
                          </span>
                        </div>
                        <div className="text-center pt-1">
                          <Badge className="bg-green-100 text-green-700">Active Session</Badge>
                        </div>
                        {workDuration && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Session Duration</span>
                            <span className={`text-sm font-bold ${
                              workDuration.hours >= 8 ? 'text-red-600' : 
                              workDuration.hours >= 7 ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                              {workDuration.hours}h {workDuration.minutes}m
                            </span>
                          </div>
                        )}
                        {/* Cumulative hours */}
                        {todayRecord.cumulativeHours > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Cumulative</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {Math.floor(todayRecord.cumulativeHours)}h {Math.round((todayRecord.cumulativeHours % 1) * 60)}m
                            </span>
                          </div>
                        )}
                        {/* Remaining hours */}
                        {todayRecord.remainingHours !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Remaining</span>
                            <span className={`text-sm font-semibold ${
                              todayRecord.remainingHours <= 0 ? 'text-red-600' :
                              todayRecord.remainingHours <= 1 ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {Math.floor(todayRecord.remainingHours)}h {Math.round((todayRecord.remainingHours % 1) * 60)}m
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      // All sessions completed
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Hours Today</span>
                          <span className={`text-sm font-bold ${
                            todayRecord.cumulativeHours >= 8 ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {Math.floor(todayRecord.cumulativeHours)}h {Math.round((todayRecord.cumulativeHours % 1) * 60)}m
                          </span>
                        </div>
                        {todayRecord.remainingHours > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Can Work More</span>
                              <span className="text-sm font-semibold text-blue-600">
                                {Math.floor(todayRecord.remainingHours)}h {Math.round((todayRecord.remainingHours % 1) * 60)}m
                              </span>
                            </div>
                            <div className="text-center pt-1">
                              <Badge variant="outline" className="text-xs">Ready for next session</Badge>
                            </div>
                          </>
                        )}
                        {todayRecord.maxHoursReached && (
                          <div className="text-center pt-1">
                            <Badge className="bg-green-100 text-green-700">8 Hours Completed ✓</Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Not checked in today</div>
                    <div className="text-xs text-muted-foreground mt-1">Start your first session</div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleClockIn}
                    disabled={isClocking || todayRecord?.hasOpenSession || todayRecord?.maxHoursReached}
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={todayRecord?.maxHoursReached ? 'Max hours reached' : todayRecord?.hasOpenSession ? 'Active session in progress' : 'Start new work session'}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>
                      {isClocking ? 'Checking In...' : 
                       todayRecord?.maxHoursReached ? 'Max Hours' :
                       todayRecord?.hasOpenSession ? 'In Session' : 'Clock In'}
                    </span>
                  </Button>
                  
                  <Button 
                    onClick={handleClockOut}
                    disabled={isClocking || !todayRecord?.hasOpenSession}
                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={todayRecord?.hasOpenSession ? 'End current work session' : 'No active session'}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>
                      {isClocking && todayRecord?.hasOpenSession? 'Checking Out...' : 'Clock Out'}
                    </span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-9 gap-2"
                    onClick={() => setShowWFHModal(true)}
                  >
                    <Home className="h-4 w-4 text-green-600" />
                    <span className="text-sm">WFH</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-9 gap-2"
                    onClick={() => handleRegularize()}
                  >
                    <Edit3 className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Regularize</span>
                  </Button>
                </div>

                <Button variant="ghost" className="w-full h-9 gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Attendance Policy</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm rounded-xl bg-white dark:bg-gray-800 border-0 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
          <CardHeader className="bg-muted/30 p-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Requests</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="wfh-requests" className="w-full">
              <TabsList className="grid grid-cols-2 w-fit">
                <TabsTrigger value="wfh-requests" className="px-6">
                  {"Work From Home"}
                </TabsTrigger>
                <TabsTrigger value="regularization" className="px-6">
                  {"Regularization"}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="wfh-requests" className="mt-6">
                <div className="space-y-4">
                  {wfhRequests && wfhRequests.length > 0 ? (
                    wfhRequests.map((request: any) => (
                      <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Home className="h-5 w-5 text-green-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  Work From Home - {format(new Date(request.date), 'MMM dd, yyyy')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Submitted on {format(new Date(request.createdAt || request.date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="ml-8">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <strong>Reason:</strong> {request.reason}
                              </p>
                              
                              {request.rejectionReason && (
                                <p className="text-sm text-red-600 mb-2">
                                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge 
                                  className={
                                    request.status === 'approved'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : request.status === 'rejected'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  }
                                >
                                  {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                  {request.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <Home className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No WFH Requests</h3>
                        <p className="text-muted-foreground">You haven't submitted any work from home requests yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => setShowWFHModal(true)}
                        >
                          Submit WFH Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="regularization" className="mt-6">
                <div className="space-y-4">
                  {regularizationRequests && regularizationRequests.length > 0 ? (
                    regularizationRequests.map((request: any) => (
                      <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Edit3 className="h-5 w-5 text-orange-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {request.requestType?.replace('-', ' ').toUpperCase() || 'Attendance Regularization'} - {format(new Date(request.date), 'MMM dd, yyyy')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Submitted on {format(new Date(request.createdAt || request.date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="ml-8">
                              {request.proposedCheckIn && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  <strong>Proposed Check-in:</strong> {format(new Date(request.proposedCheckIn), 'h:mm a')}
                                </p>
                              )}
                              {request.proposedCheckOut && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  <strong>Proposed Check-out:</strong> {format(new Date(request.proposedCheckOut), 'h:mm a')}
                                </p>
                              )}
                              
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <strong>Reason:</strong> {request.reason}
                              </p>
                              
                              {request.rejectionReason && (
                                <p className="text-sm text-red-600 mb-2">
                                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge 
                                  className={
                                    request.status === 'approved'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : request.status === 'rejected'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  }
                                >
                                  {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                  {request.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <Edit3 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Regularization Requests</h3>
                        <p className="text-muted-foreground">You haven't submitted any attendance regularization requests yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => handleRegularize()}
                        >
                          Submit Regularization Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      {/* Attendance Logs DataTable */}
      <Card className="shadow-sm rounded-xl bg-white dark:bg-gray-800 border-0 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
        <CardHeader className="bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attendance Logs & Requests</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">View your attendance history and requests</p>
              </div>
            </div>
            {/* Search Bar on the Right */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {logs && logs.length > 0 ? (
            <DataTable
              data={logs.filter(log => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  format(new Date(log.date), 'MMM dd, yyyy').toLowerCase().includes(query) ||
                  (log.status || '').toLowerCase().includes(query) ||
                  (log.regularizationStatus || '').toLowerCase().includes(query)
                );
              })}
              columns={attendanceColumns}
              actions={attendanceActions}
              searchable={false}
              hideColumnToggle={true}
              pageSize={10}
              emptyMessage="No attendance logs found"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Attendance Logs Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Your attendance logs will appear here once you start checking in. 
                Use the Web Check-In button above to record your attendance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <div>
        <WebClockInModal
          open={showClockInModal}
          onClose={() => setShowClockInModal(false)}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />

        <WFHRequestModal
          open={showWFHModal}
          onClose={() => setShowWFHModal(false)}
          onSubmit={handleWFHSubmit}
        />

        <RegularizationModal
          open={showRegularizationModal}
          onClose={() => {
            setShowRegularizationModal(false);
          }}
          onSubmit={handleRegularizationSubmit}
        />
      </div>
    </div>
  );
}