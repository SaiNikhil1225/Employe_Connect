/**
 * Super Admin Dashboard
 * Interactive dashboard with system overview, analytics, and key metrics
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Ticket,
  Clock,
  FolderOpen,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Activity,
  Package,
  BarChart3,
  PieChart,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { getDashboardStats, getSystemHealth } from '@/services/superAdminService';
import type { DashboardStats, SystemHealth } from '@/types/superAdmin';

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, healthData] = await Promise.all([
        getDashboardStats(),
        getSystemHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!stats) return null;

    const totalPending = stats.pendingApprovals.total;
    const userGrowthRate = stats.newUsersThisWeek > 0 ?
      Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100) : 0;
    const criticalTicketRate = stats.openTickets > 0 ?
      Math.round((stats.criticalTickets / stats.openTickets) * 100) : 0;

    return {
      totalPending,
      userGrowthRate,
      criticalTicketRate,
      approvalDistribution: {
        l1Percent: totalPending > 0 ? Math.round((stats.pendingApprovals.l1 / totalPending) * 100) : 0,
        l2Percent: totalPending > 0 ? Math.round((stats.pendingApprovals.l2 / totalPending) * 100) : 0,
        l3Percent: totalPending > 0 ? Math.round((stats.pendingApprovals.l3 / totalPending) * 100) : 0,
      }
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats || !metrics) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{error || 'Failed to load dashboard'}</span>
            </div>
            <Button onClick={fetchData} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">System overview and real-time analytics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users with Growth */}
        <Card className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-blue-500" onClick={() => navigate('/superadmin/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                +{stats.newUsersThisWeek || 0} this week
              </div>
              <Badge variant="secondary" className="text-xs">
                {metrics.userGrowthRate}% growth
              </Badge>
            </div>
            <Progress value={metrics.userGrowthRate} className="h-1 mt-2" />
          </CardContent>
        </Card>

        {/* Open Tickets with Priority */}
        <Card className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openTickets}</div>
            <div className="flex items-center gap-2 mt-2">
              {stats.criticalTickets > 0 ? (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.criticalTickets} critical
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  No critical issues
                </div>
              )}
              <Badge variant={stats.criticalTickets > 0 ? "destructive" : "secondary"} className="text-xs">
                {metrics.criticalTicketRate}% critical
              </Badge>
            </div>
            <Progress
              value={metrics.criticalTicketRate}
              className={`h-1 mt-2 ${stats.criticalTickets > 0 ? '[&>*]:bg-destructive' : ''}`}
            />
          </CardContent>
        </Card>

        {/* Pending Approvals with Breakdown */}
        <Card className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-purple-500" onClick={() => navigate('/superadmin/approvers')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalPending}</div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Badge variant="outline" className="text-xs gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                L1: {stats.pendingApprovals.l1}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                L2: {stats.pendingApprovals.l2}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                L3: {stats.pendingApprovals.l3}
              </Badge>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="h-1 bg-blue-500 rounded" style={{ width: `${metrics.approvalDistribution.l1Percent}%` }} />
              <div className="h-1 bg-yellow-500 rounded" style={{ width: `${metrics.approvalDistribution.l2Percent}%` }} />
              <div className="h-1 bg-red-500 rounded" style={{ width: `${metrics.approvalDistribution.l3Percent}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-green-500" onClick={() => navigate('/superadmin/categories')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.categoriesCount}</div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {stats.categoriesByType && Object.entries(stats.categoriesByType).slice(0, 3).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}: {count}
                </Badge>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Across {Object.keys(stats.categoriesByType || {}).length} config items
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Approval Pipeline Visualization */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Approval Pipeline
                </CardTitle>
                <CardDescription>Distribution across approval levels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/superadmin/approvers')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* L1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    L1 Approval
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{stats.pendingApprovals.l1}</span>
                    <Badge variant="outline" className="text-xs">{metrics.approvalDistribution.l1Percent}%</Badge>
                  </div>
                </div>
                <Progress value={metrics.approvalDistribution.l1Percent} max={100} className="h-2" />
              </div>

              {/* L2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    L2 Approval
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{stats.pendingApprovals.l2}</span>
                    <Badge variant="outline" className="text-xs">{metrics.approvalDistribution.l2Percent}%</Badge>
                  </div>
                </div>
                <Progress value={metrics.approvalDistribution.l2Percent} max={100} className="h-2 [&>*]:bg-yellow-500" />
              </div>

              {/* L3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    L3 Approval
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{stats.pendingApprovals.l3}</span>
                    <Badge variant="outline" className="text-xs">{metrics.approvalDistribution.l3Percent}%</Badge>
                  </div>
                </div>
                <Progress value={metrics.approvalDistribution.l3Percent} max={100} className="h-2 [&>*]:bg-red-500" />
              </div>
            </div>

            {metrics.totalPending === 0 && (
              <div className="mt-6 text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No pending approvals at this time</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
                <CardDescription>Active categories by config item</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/superadmin/categories')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoriesByType && Object.entries(stats.categoriesByType).map(([type, count]) => {
                const percentage = Math.round((count / stats.categoriesCount) * 100);
                const colors: Record<string, string> = {
                  'IT Support': 'bg-blue-500',
                  'Finance': 'bg-green-500',
                  'Facilities': 'bg-yellow-500',
                  'Location': 'bg-purple-500',
                  'Department': 'bg-pink-500',
                  'Designation': 'bg-orange-500'
                };
                const color = colors[type] || 'bg-gray-500';

                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${color}`} />
                        {type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <Badge variant="outline" className="text-xs">{percentage}%</Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
