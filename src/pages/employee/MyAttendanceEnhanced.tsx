import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import {
    Clock,
    Target,
    AlertCircle,
    LogOut as LogOutEarly,
    FileText,
    LogIn,
    LogOut,
    CheckCircle,
    Home
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subYears } from 'date-fns';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { RegularizationDrawer } from '@/components/attendance/RegularizationDrawer';
import { WFHRequestDrawer } from '@/components/attendance/WFHRequestDrawer';
import { WebClockInModal } from '@/components/attendance/WebClockInModal';
import { KPICard } from '@/components/attendance/KPICard';
import type { AttendanceLog, EmployeeAttendanceKPIs } from '@/types/attendance';

export default function MyAttendanceEnhanced() {
    const [activeTab, setActiveTab] = useState('logs');
    const [isClocking, setIsClocking] = useState(false);
    const [dateFilter, setDateFilter] = useState<string>('this-month');
    const [elapsedTime, setElapsedTime] = useState<string>('0h 0m 0s');

    // Modal states
    const [showClockInModal, setShowClockInModal] = useState(false);
    const [showWFHDrawer, setShowWFHDrawer] = useState(false);
    const [showRegularizationModal, setShowRegularizationModal] = useState(false);
    const [selectedLogForRegularization, setSelectedLogForRegularization] = useState<Date | undefined>();

    // Calculate date range based on filter
    const dateRange = useMemo(() => {
        const now = new Date();

        switch (dateFilter) {
            case 'this-week':
                return {
                    from: startOfWeek(now, { weekStartsOn: 1 }),
                    to: endOfWeek(now, { weekStartsOn: 1 })
                };
            case 'this-month':
                return {
                    from: startOfMonth(now),
                    to: endOfMonth(now)
                };
            case 'last-3-months':
                return {
                    from: subMonths(now, 3),
                    to: now
                };
            case 'last-6-months':
                return {
                    from: subMonths(now, 6),
                    to: now
                };
            case 'last-year':
                return {
                    from: subYears(now, 1),
                    to: now
                };
            default:
                return {
                    from: startOfMonth(now),
                    to: endOfMonth(now)
                };
        }
    }, [dateFilter]);

    // Enhanced KPIs state
    const [enhancedKPIs, setEnhancedKPIs] = useState<EmployeeAttendanceKPIs | null>(null);
    const [loadingKPIs, setLoadingKPIs] = useState(false);

    const {
        logs,
        wfhRequests,
        regularizationRequests,
        lastLogsUpdate,
        fetchLogs,
        fetchWFHRequests,
        fetchRegularizationRequests,
        submitWFHRequest,
        submitRegularization,
        webClockIn,
        webClockOut
    } = useAttendanceStore();

    const { user } = useAuthStore();

    // Get today's attendance record
    const todayRecord = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaySessions = logs?.filter(log => {
            const logDate = format(new Date(log.date), 'yyyy-MM-dd');
            return logDate === today;
        }) || [];

        if (todaySessions.length > 0) {
            const completedSessions = todaySessions.filter(log => log.checkInTime && log.checkOutTime);
            const cumulativeHours = completedSessions.reduce((sum, log) => sum + (log.effectiveHours || 0), 0);
            const openSession = todaySessions.find(log => log.checkInTime && !log.checkOutTime);
            const latestSession = todaySessions.sort((a, b) =>
                new Date(b.checkInTime || 0).getTime() - new Date(a.checkInTime || 0).getTime()
            )[0];

            const MAX_WORK_HOURS = 8;
            const remainingHours = Math.max(0, MAX_WORK_HOURS - cumulativeHours);

            return {
                ...latestSession,
                checkIn: openSession?.checkInTime ? format(new Date(openSession.checkInTime), 'h:mm a') : null,
                checkOut: null,
                effectiveHours: `${Math.floor(cumulativeHours)}h ${Math.round((cumulativeHours % 1) * 60)}m`,
                cumulativeHours,
                remainingHours,
                sessionCount: todaySessions.length,
                completedSessionCount: completedSessions.length,
                hasOpenSession: !!openSession,
                maxHoursReached: cumulativeHours >= MAX_WORK_HOURS
            };
        }

        return null;
    }, [logs, lastLogsUpdate]);

    // Timer effect for running elapsed time
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (todayRecord?.hasOpenSession && todayRecord?.checkIn) {
            // Parse check-in time
            const checkInParts = todayRecord.checkIn.split(' ');
            const [time, period] = checkInParts;
            const [hours, minutes] = time.split(':').map(Number);
            let checkInHours = hours;

            if (period === 'PM' && hours !== 12) checkInHours += 12;
            if (period === 'AM' && hours === 12) checkInHours = 0;

            const today = new Date();
            const checkInDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), checkInHours, minutes);

            const updateTimer = () => {
                const now = new Date();
                const diff = now.getTime() - checkInDate.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setElapsedTime(`${hours}h ${mins}m ${secs}s`);
            };

            updateTimer(); // Initial update
            interval = setInterval(updateTimer, 1000); // Update every second
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [todayRecord]);

    // Define data-loading functions first (before useEffect hooks that use them)
    const loadEnhancedKPIs = useCallback(async () => {
        setLoadingKPIs(true);
        try {
            const apiUrl = `/attendance/enhanced-stats?employeeId=${user?.employeeId}&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
            console.log('[KPI] Fetching enhanced KPIs from:', apiUrl);

            // Call enhanced KPI API using apiClient (automatically adds auth token)
            const response = await apiClient.get(apiUrl);

            console.log('[KPI] Response status:', response.status);
            const data = response.data;
            console.log('[KPI] Response data:', data);

            if (data.success) {
                console.log('[KPI] Setting KPIs:', data.data);
                setEnhancedKPIs(data.data);
            } else {
                console.error('[KPI] API returned success: false', data);
            }
        } catch (error) {
            console.error('[KPI] Error loading enhanced KPIs:', error);
        } finally {
            setLoadingKPIs(false);
        }
    }, [user?.employeeId, dateRange.from, dateRange.to]);

    const loadData = useCallback(async () => {
        const employeeId = user?.employeeId;
        if (!employeeId) return;

        const startDate = format(dateRange.from, 'yyyy-MM-dd');
        const endDate = format(dateRange.to, 'yyyy-MM-dd');

        await Promise.all([
            fetchLogs(employeeId, { startDate, endDate }),
            fetchWFHRequests(employeeId),
            fetchRegularizationRequests(employeeId)
        ]);
    }, [user?.employeeId, dateRange.from, dateRange.to, fetchLogs, fetchWFHRequests, fetchRegularizationRequests]);

    // Fetch enhanced KPIs when date range changes
    useEffect(() => {
        if (user?.employeeId) {
            loadEnhancedKPIs();
        }
    }, [user?.employeeId, loadEnhancedKPIs]);

    // Fetch logs when date range changes
    useEffect(() => {
        if (user?.employeeId) {
            loadData();
        }
    }, [user?.employeeId, loadData]);

    const handleClockIn = async () => {
        if (!user?.employeeId) return;
        setIsClocking(true);
        try {
            await webClockIn(user.employeeId);
            setShowClockInModal(false);
            loadData();
        } catch (error) {
            // Error handled by store
        } finally {
            setIsClocking(false);
        }
    };

    const handleClockOut = async () => {
        if (!user?.employeeId) return;
        setIsClocking(true);
        try {
            await webClockOut(user.employeeId);
            loadData();
        } catch (error) {
            // Error handled by store
        } finally {
            setIsClocking(false);
        }
    };

    const handleWFHSubmit = useCallback(async (data: any) => {
        await submitWFHRequest(data);
        await loadData();
        await loadEnhancedKPIs();
    }, [submitWFHRequest, loadData, loadEnhancedKPIs]);

    const handleRegularizationSubmit = useCallback(async (data: any) => {
        await submitRegularization(data);
        await loadData();
        await loadEnhancedKPIs();
    }, [submitRegularization, loadData, loadEnhancedKPIs]);

    const handleWFHDrawerClose = useCallback(() => {
        setShowWFHDrawer(false);
    }, []);

    const handleRegularizationModalClose = useCallback(() => {
        setShowRegularizationModal(false);
        setSelectedLogForRegularization(undefined);
    }, []);

    const handleRegularizeClick = (log: AttendanceLog) => {
        setSelectedLogForRegularization(new Date(log.date));
        setShowRegularizationModal(true);
    };

    // Attendance logs columns
    const attendanceColumns: DataTableColumn<AttendanceLog>[] = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (value) => <span className="font-medium">{format(new Date(value), 'MMM dd, yyyy')}</span>
        },
        {
            key: 'shift',
            label: 'Shift Timing',
            render: (value, row) => (
                <div className="text-sm">
                    <div className="font-medium">{value || 'General'}</div>
                    <div className="text-xs text-muted-foreground">{row.shiftTiming || '10:00 AM - 7:00 PM IST'}</div>
                </div>
            )
        },
        {
            key: 'ipAddress',
            label: 'IP Address',
            render: (value) => <span className="text-sm font-mono">{value || '-'}</span>
        },
        {
            key: 'checkInTime',
            label: 'Check In',
            render: (value) => value ? format(new Date(value), 'h:mm a') : '-'
        },
        {
            key: 'checkOutTime',
            label: 'Check Out',
            render: (value) => value ? format(new Date(value), 'h:mm a') : '-'
        },
        {
            key: 'grossHours',
            label: 'Gross Hours',
            sortable: true,
            render: (value) => {
                if (!value || value === 0) return <span className="text-gray-400">-</span>;
                return (
                    <span className="font-medium text-gray-700">
                        {Math.floor(value)}h {Math.round((value % 1) * 60)}m
                    </span>
                );
            }
        },
        {
            key: 'effectiveHours',
            label: 'Work Hours',
            sortable: true,
            render: (value) => (
                <span className="font-medium text-blue-600">
                    {Math.floor(value)}h {Math.round((value % 1) * 60)}m
                </span>
            )
        },
        {
            key: 'workLocation',
            label: 'Status',
            render: (_value, row) => {
                if (row.status === 'wfh') {
                    return <Badge className="bg-green-100 text-green-700">WFH</Badge>;
                }
                return <Badge className="bg-blue-100 text-blue-700">In Office</Badge>;
            }
        },
        {
            key: 'regularizationStatus',
            label: 'Regularization',
            render: (value) => {
                const badges = {
                    none: <span className="text-gray-400">-</span>,
                    pending: <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>,
                    approved: <Badge className="bg-green-100 text-green-700">Approved</Badge>,
                    rejected: <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                };
                return badges[value as keyof typeof badges] || badges.none;
            }
        },
        {
            key: 'approvedBy',
            label: 'Approved By',
            render: (value) => <span className="text-sm">{value || '-'}</span>
        },
        {
            key: 'remarks',
            label: 'Remarks',
            render: (value) => (
                <span className="text-sm text-muted-foreground" title={value}>
                    {value ? (value.length > 30 ? value.substring(0, 30) + '...' : value) : '-'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sticky: 'right',
            render: (_value, row) => {
                const workHours = row.effectiveHours || 0;
                if (workHours < 9) {
                    return (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegularizeClick(row)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            Regularize
                        </Button>
                    );
                }
                return <span className="text-gray-400">-</span>;
            }
        }
    ];

    // WFH requests columns
    const wfhColumns: DataTableColumn<any>[] = [
        {
            key: 'fromDate',
            label: 'From Date',
            sortable: true,
            render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : '-'
        },
        {
            key: 'toDate',
            label: 'To Date',
            sortable: true,
            render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : '-'
        },
        {
            key: 'reason',
            label: 'Reason',
            render: (value) => (
                <span className="text-sm" title={value}>
                    {value && value.length > 50 ? value.substring(0, 50) + '...' : value || '-'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const badges = {
                    pending: <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>,
                    approved: <Badge className="bg-green-100 text-green-700">Approved</Badge>,
                    rejected: <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                };
                return badges[value as keyof typeof badges] || <span>-</span>;
            }
        },
        {
            key: 'approvedBy',
            label: 'Approved/Rejected By',
            render: (value, row) => (
                <span className="text-sm">
                    {row.status === 'approved' ? (value || '-') : (row.rejectedBy || '-')}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Requested On',
            render: (value) => value ? format(new Date(value), 'MMM dd, h:mm a') : '-'
        }
    ];

    // Regularization requests columns
    const regularizationColumns: DataTableColumn<any>[] = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : '-'
        },
        {
            key: 'requestType',
            label: 'Type',
            render: (value) => (
                <Badge variant="outline">
                    {value ? value.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General'}
                </Badge>
            )
        },
        {
            key: 'reason',
            label: 'Reason',
            render: (value) => (
                <span className="text-sm" title={value}>
                    {value && value.length > 40 ? value.substring(0, 40) + '...' : value || '-'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const badges = {
                    pending: <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>,
                    approved: <Badge className="bg-green-100 text-green-700">Approved</Badge>,
                    rejected: <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                };
                return badges[value as keyof typeof badges] || <span>-</span>;
            }
        },
        {
            key: 'createdAt',
            label: 'Requested On',
            render: (value) => value ? format(new Date(value), 'MMM dd, h:mm a') : '-'
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Clock}
                title="My Attendance"
                description="Track your attendance and work hours"
                actions={
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Date Range:</span>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="this-week">Current Week</SelectItem>
                                <SelectItem value="this-month">Current Month</SelectItem>
                                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                                <SelectItem value="last-year">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            {/* Web Check-in Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Today's Attendance</h3>
                            {todayRecord?.hasOpenSession ? (
                                <div>
                                    <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-3 py-1 rounded-md">
                                        Clocked in at {todayRecord.checkIn} • Session #{todayRecord.completedSessionCount + 1}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {todayRecord ?
                                        `Completed ${todayRecord.sessionCount} session(s) - ${todayRecord.effectiveHours}` :
                                        'Not clocked in yet'
                                    }
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {todayRecord?.hasOpenSession && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
                                    <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                                    <span className="text-sm font-medium text-blue-700">{elapsedTime}</span>
                                </div>
                            )}
                            <Button
                                onClick={() => setShowClockInModal(true)}
                                disabled={isClocking || todayRecord?.hasOpenSession || todayRecord?.maxHoursReached}
                                className="min-w-[120px]"
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Clock In
                            </Button>

                            <Button
                                onClick={handleClockOut}
                                disabled={isClocking || !todayRecord?.hasOpenSession}
                                variant="outline"
                                className="min-w-[120px]"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Clock Out
                            </Button>
                            <Button
                                onClick={() => setShowWFHDrawer(true)}
                                variant="outline"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                WFH Request
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KPICard
                    title="Attendance Rate"
                    value={`${enhancedKPIs?.attendanceRate || 0}%`}
                    subtitle="Present days vs working days"
                    icon={CheckCircle}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                    loading={loadingKPIs}
                />
                <KPICard
                    title="Punctuality Rate"
                    value={`${enhancedKPIs?.punctualityRate || 0}%`}
                    subtitle="On-time check-ins"
                    icon={Target}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                    loading={loadingKPIs}
                />
                <KPICard
                    title="Late Arrivals"
                    value={enhancedKPIs?.lateArrivalFrequency || 0}
                    subtitle="Late instances"
                    icon={AlertCircle}
                    iconColor="text-orange-600"
                    iconBgColor="bg-orange-100"
                    loading={loadingKPIs}
                />
                <KPICard
                    title="Early Logouts"
                    value={enhancedKPIs?.earlyLogoutFrequency || 0}
                    subtitle="Early logout instances"
                    icon={LogOutEarly}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-100"
                    loading={loadingKPIs}
                />
                <KPICard
                    title="Total Requests"
                    value={enhancedKPIs?.totalRequests || 0}
                    subtitle="WFH + Regularization"
                    icon={FileText}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-100"
                    loading={loadingKPIs}
                />
            </div>

            {/* Tabs Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>
                        View and manage your attendance logs, WFH requests, and regularization requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                            <TabsTrigger value="logs">Attendance Logs</TabsTrigger>
                            <TabsTrigger value="wfh">WFH Requests ({wfhRequests?.length || 0})</TabsTrigger>
                            <TabsTrigger value="regularization">
                                Regularization ({regularizationRequests?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="logs" className="mt-0 space-y-4">
                            <DataTable
                                columns={attendanceColumns}
                                data={logs || []}
                                searchable
                                hideColumnToggle={true}
                            />
                        </TabsContent>

                        <TabsContent value="wfh" className="mt-0">
                            <DataTable
                                columns={wfhColumns}
                                data={wfhRequests || []}
                                searchable
                                hideColumnToggle={true}
                            />
                        </TabsContent>

                        <TabsContent value="regularization" className="mt-0">
                            <DataTable
                                columns={regularizationColumns}
                                data={regularizationRequests || []}
                                searchable
                                hideColumnToggle={true}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Modals */}
            <WebClockInModal
                open={showClockInModal}
                onClose={() => setShowClockInModal(false)}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
            />

            <WFHRequestDrawer
                open={showWFHDrawer}
                onClose={handleWFHDrawerClose}
                onSubmit={handleWFHSubmit}
            />

            <RegularizationDrawer
                open={showRegularizationModal}
                onClose={handleRegularizationModalClose}
                onSubmit={handleRegularizationSubmit}
                prefilledDate={selectedLogForRegularization}
            />
        </div>
    );
}
