import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Briefcase,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Loader2,
  UserCheck,
  UserMinus,
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  CalendarClock,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useProjectStore } from '@/store/projectStore';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { useCustomerStore } from '@/store/customerStore';
import { rmgAnalyticsService, type ResourceUtilizationData, type AllocationEfficiencyData, type DemandForecastData } from '@/services/rmgAnalyticsService';
import { toast } from 'sonner';
import { format, differenceInDays, isPast, addDays, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Color palette for charts
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  Active: '#10b981',
  Draft: '#f59e0b',
  'On Hold': '#ef4444',
  Closed: '#6b7280',
  Completed: '#3b82f6',
  Cancelled: '#9ca3af',
};

export function RMGDashboard() {
  const navigate = useNavigate();
  const { projects, stats, fetchProjects, fetchStats } = useProjectStore();
  const { fls, fetchFLs } = useFinancialLineStore();
  const { pos, fetchPOs } = useCustomerPOStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [utilizationData, setUtilizationData] = useState<ResourceUtilizationData | null>(null);
  const [allocationData, setAllocationData] = useState<AllocationEfficiencyData | null>(null);
  const [demandData, setDemandData] = useState<DemandForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      else setIsLoading(true);

      await Promise.all([
        fetchProjects(),
        fetchStats(),
        fetchFLs(),
        fetchPOs(),
        fetchCustomers(),
      ]);

      const [utilRes, allocRes, demandRes] = await Promise.allSettled([
        rmgAnalyticsService.getResourceUtilization(),
        rmgAnalyticsService.getAllocationEfficiency(),
        rmgAnalyticsService.getDemandForecast(),
      ]);

      if (utilRes.status === 'fulfilled') setUtilizationData(utilRes.value);
      if (allocRes.status === 'fulfilled') setAllocationData(allocRes.value);
      if (demandRes.status === 'fulfilled') setDemandData(demandRes.value);

      if (showRefreshToast) toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to load some dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchProjects, fetchStats, fetchFLs, fetchPOs, fetchCustomers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Computed KPIs ──
  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'Active').length
  , [projects]);

  const activeCustomers = useMemo(() =>
    customers.filter(c => c.status === 'Active').length
  , [customers]);

  const totalFunding = useMemo(() =>
    fls.reduce((sum, fl) => sum + (fl.totalFunding || 0), 0)
  , [fls]);

  const totalPlannedRevenue = useMemo(() =>
    fls.reduce((sum, fl) => sum + (fl.totalPlannedRevenue || 0), 0)
  , [fls]);

  const activePOValue = useMemo(() =>
    pos.filter(po => po.status === 'Active').reduce((sum, po) => sum + (po.poAmount || 0), 0)
  , [pos]);

  const expiringPOs = useMemo(() => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return pos.filter(po => {
      if (po.status !== 'Active') return false;
      const expiry = new Date(po.poValidityDate);
      return !isPast(expiry) && !isAfter(expiry, thirtyDaysFromNow);
    });
  }, [pos]);

  // Project status breakdown for pie chart
  const projectStatusData = useMemo(() => {
    if (!stats?.byStatus) return [];
    return stats.byStatus.map(s => ({
      name: s._id,
      value: s.count,
      color: STATUS_COLORS[s._id] || '#6b7280',
    }));
  }, [stats]);

  // FL status breakdown
  const flStatusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    fls.forEach(fl => {
      counts[fl.status] = (counts[fl.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [fls]);

  // Projects by region for bar chart
  const projectsByRegion = useMemo(() => {
    if (!stats?.byRegion) return [];
    return stats.byRegion.map(r => ({
      region: r._id || 'Unknown',
      count: r.count,
    }));
  }, [stats]);

  // Projects by billing type
  const projectsByBilling = useMemo(() => {
    if (!stats?.byBillingType) return [];
    return stats.byBillingType.map(b => ({
      type: b._id || 'Unknown',
      count: b.count,
    }));
  }, [stats]);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RMG Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time overview of resources, projects, and financials
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* ═══════ Row 1: KPI Cards ═══════ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Active Projects"
          value={activeProjects}
          icon={Briefcase}
          color="blue"
          subtitle={`of ${projects.length} total`}
          onClick={() => navigate('/rmg/projects')}
        />
        <KPICard
          label="Utilization Rate"
          value={utilizationData ? `${utilizationData.summary.overallUtilization}%` : '—'}
          icon={Activity}
          color="green"
          subtitle={utilizationData ? `${utilizationData.summary.billableUtilization}% billable` : undefined}
          trend={utilizationData && utilizationData.summary.overallUtilization >= 75 ? 'up' : 'down'}
          onClick={() => navigate('/utilization')}
        />
        <KPICard
          label="Resources"
          value={utilizationData?.summary.totalResources ?? '—'}
          icon={Users}
          color="orange"
          subtitle={utilizationData ? `${utilizationData.summary.benchStrength} on bench · ${utilizationData.summary.utilizedResources} utilized` : undefined}
          onClick={() => navigate('/rmg/employees')}
        />
        <KPICard
          label="Active PO Value"
          value={formatCurrency(activePOValue)}
          icon={DollarSign}
          color="purple"
          subtitle={`${pos.filter(p => p.status === 'Active').length} active POs`}
          alert={expiringPOs.length > 0 ? `${expiringPOs.length} expiring in 30 days` : undefined}
        />
      </div>

      {/* ═══════ Row 2: Secondary KPI Cards ═══════ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Active Customers"
          value={activeCustomers}
          icon={Building2}
          color="blue"
          subtitle={`of ${customers.length} total`}
          onClick={() => navigate('/rmg/customers')}
        />
        <KPICard
          label="Optimal Allocation"
          value={allocationData ? `${allocationData.summary.optimalRate}%` : '—'}
          icon={Target}
          color="green"
          subtitle={allocationData ? `${allocationData.summary.optimalCount} of ${allocationData.summary.totalResources}` : undefined}
        />
        <KPICard
          label="Total FL Funding"
          value={formatCurrency(totalFunding)}
          icon={DollarSign}
          color="orange"
          subtitle={`${fls.length} financial lines`}
        />
        <KPICard
          label="Planned Revenue"
          value={formatCurrency(totalPlannedRevenue)}
          icon={TrendingUp}
          color="purple"
          subtitle={totalFunding > 0 ? `${((totalPlannedRevenue / totalFunding) * 100).toFixed(0)}% of funding` : undefined}
        />
      </div>

      {/* ═══════ Row 3: Charts ═══════ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Utilization Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Utilization Trend</CardTitle>
                <CardDescription>Monthly utilization & billable rates</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {utilizationData?.trendData && utilizationData.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={utilizationData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      try { return format(new Date(d), 'MMM yy'); } catch { return d; }
                    }}
                    className="text-xs"
                  />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} className="text-xs" />
                  <Tooltip
                    formatter={(val: number) => `${val}%`}
                    labelFormatter={(l) => {
                      try { return format(new Date(l), 'MMM yyyy'); } catch { return l; }
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} name="Overall" dot={false} />
                  <Line type="monotone" dataKey="billable" stroke="#10b981" strokeWidth={2} name="Billable" dot={false} />
                  <Line type="monotone" dataKey="nonBillable" stroke="#f59e0b" strokeWidth={1.5} name="Non-Billable" dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No utilization trend data available" />
            )}
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Project Status</CardTitle>
                <CardDescription>Distribution by current status</CardDescription>
              </div>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {projectStatusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => val} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {projectStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex items-center justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{projects.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyChartState message="No project data available" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Row 4: Bar Charts ═══════ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Projects by Region */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects by Region</CardTitle>
            <CardDescription>Geographic distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsByRegion.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectsByRegion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="region" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No region data available" />
            )}
          </CardContent>
        </Card>

        {/* Department Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Department Utilization</CardTitle>
            <CardDescription>Resource efficiency by department</CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationData?.departmentBreakdown && utilizationData.departmentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={utilizationData.departmentBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} className="text-xs" />
                  <YAxis dataKey="department" type="category" width={100} className="text-xs" />
                  <Tooltip formatter={(val: number) => `${val}%`} />
                  <Bar dataKey="utilization" fill="#10b981" radius={[0, 4, 4, 0]} name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No department data available" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Row 5: Allocation & Demand ═══════ */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Allocation Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Allocation Summary</CardTitle>
            <CardDescription>Resource allocation health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationData ? (
              <>
                <AllocationBar
                  label="Optimal"
                  value={allocationData.summary.optimalCount}
                  total={allocationData.summary.totalResources}
                  color="bg-green-500"
                />
                <AllocationBar
                  label="Over-Allocated"
                  value={allocationData.summary.overAllocatedCount}
                  total={allocationData.summary.totalResources}
                  color="bg-red-500"
                />
                <AllocationBar
                  label="Under-Allocated"
                  value={allocationData.summary.underAllocatedCount}
                  total={allocationData.summary.totalResources}
                  color="bg-amber-500"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No allocation data</p>
            )}
          </CardContent>
        </Card>

        {/* Demand Forecast */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Demand vs Supply</CardTitle>
            <CardDescription>Upcoming resource needs</CardDescription>
          </CardHeader>
          <CardContent>
            {demandData?.demandByRole && demandData.demandByRole.length > 0 ? (
              <div className="space-y-3">
                {demandData.demandByRole.slice(0, 5).map((role) => (
                  <div key={role.role} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[140px]">{role.role}</span>
                      <span className="text-muted-foreground">
                        {role.available}/{role.demand}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          role.gap > 0 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((role.available / Math.max(role.demand, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {demandData.summary.totalGap > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{demandData.summary.totalGap} resource gap across roles</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No demand data</p>
            )}
          </CardContent>
        </Card>

        {/* FL Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Lines</CardTitle>
            <CardDescription>Status & funding overview</CardDescription>
          </CardHeader>
          <CardContent>
            {flStatusBreakdown.length > 0 ? (
              <div className="space-y-3">
                {flStatusBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.value}</Badge>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total Funding</span>
                    <span className="font-medium text-foreground">{formatCurrency(totalFunding)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Planned Revenue</span>
                    <span className="font-medium text-foreground">{formatCurrency(totalPlannedRevenue)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No FL data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Row 6: Action Tables ═══════ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bench Resources */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Bench Resources</CardTitle>
                <CardDescription>Currently unassigned employees</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/utilization')}>
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {utilizationData?.benchResources && utilizationData.benchResources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utilizationData.benchResources.slice(0, 5).map((res) => (
                    <TableRow key={res.employeeId}>
                      <TableCell className="text-sm font-medium">{res.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{res.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {res.skills.slice(0, 2).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                          ))}
                          {res.skills.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{res.skills.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCheck className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">No bench resources</p>
                <p className="text-xs text-muted-foreground">All resources are allocated</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Over-Allocated Resources */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Over-Allocated Resources</CardTitle>
                <CardDescription>Employees exceeding 100% allocation</CardDescription>
              </div>
              {allocationData && allocationData.overAllocated.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {allocationData.overAllocated.length} at risk
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allocationData?.overAllocated && allocationData.overAllocated.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs text-right">Allocation</TableHead>
                    <TableHead className="text-xs text-right">Excess</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationData.overAllocated.slice(0, 5).map((res) => (
                    <TableRow key={res.employeeId}>
                      <TableCell className="text-sm font-medium">{res.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{res.department}</TableCell>
                      <TableCell className="text-sm text-right font-medium text-red-600">{res.allocation}%</TableCell>
                      <TableCell className="text-sm text-right text-red-500">+{res.excess}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">No over-allocations</p>
                <p className="text-xs text-muted-foreground">All resources within capacity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════ Row 7: Expiring POs + Projects by Billing ═══════ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expiring POs */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">POs Expiring Soon</CardTitle>
                <CardDescription>Active POs expiring within 30 days</CardDescription>
              </div>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {expiringPOs.length > 0 ? (
              <div className="space-y-3">
                {expiringPOs.slice(0, 5).map((po) => {
                  const daysLeft = differenceInDays(new Date(po.poValidityDate), new Date());
                  return (
                    <div key={po._id} className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div>
                        <p className="text-sm font-medium">{po.poNo}</p>
                        <p className="text-xs text-muted-foreground">{po.customerName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={daysLeft <= 7 ? 'destructive' : 'outline'} className="text-xs">
                          {daysLeft}d left
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(po.poValidityDate), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">No POs expiring soon</p>
                <p className="text-xs text-muted-foreground">All active POs have 30+ days remaining</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects by Billing Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects by Billing Type</CardTitle>
            <CardDescription>Contract type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsByBilling.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectsByBilling}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Projects">
                    {projectsByBilling.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No billing type data available" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ──

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  alert,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'purple';
  subtitle?: string;
  trend?: 'up' | 'down';
  alert?: string;
  total?: number;
  onClick?: () => void;
}) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            trend === 'up'
              ? <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
              : <TrendingDown className="h-4 w-4 text-red-500 mb-1" />
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {alert && (
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{alert}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AllocationBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-center">
      <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
