import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown, Percent, Download, FileText, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { FinancialLineTable } from '../../../financial-lines/components/FinancialLineTable';
import { CreateFLForm } from '../../../financial-lines/components/CreateFLForm';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MarginMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  laborCost: number;
  overheadCost: number;
  otherCosts: number;
  marginTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export function MarginDetailsTab() {
  // Mock data - in real app, fetch from API
  const metrics: MarginMetrics = {
    totalRevenue: 500000,
    totalCost: 380000,
    grossProfit: 120000,
    grossMargin: 24.0,
    netProfit: 95000,
    netMargin: 19.0,
    laborCost: 280000,
    overheadCost: 75000,
    otherCosts: 25000,
    marginTrend: 'up',
    trendPercentage: 2.5,
  };

  const costBreakdown = [
    { category: 'Labor Costs', amount: metrics.laborCost, percentage: (metrics.laborCost / metrics.totalCost) * 100, color: 'bg-blue-500' },
    { category: 'Overhead', amount: metrics.overheadCost, percentage: (metrics.overheadCost / metrics.totalCost) * 100, color: 'bg-orange-500' },
    { category: 'Other Costs', amount: metrics.otherCosts, percentage: (metrics.otherCosts / metrics.totalCost) * 100, color: 'bg-purple-500' },
  ];

  const monthlyMargins = [
    { month: 'Jan 2026', revenue: 45000, cost: 34000, margin: 24.4 },
    { month: 'Feb 2026', revenue: 48000, cost: 36000, margin: 25.0 },
    { month: 'Mar 2026', revenue: 52000, cost: 40000, margin: 23.1 },
    { month: 'Apr 2026', revenue: 50000, cost: 38000, margin: 24.0 },
    { month: 'May 2026', revenue: 55000, cost: 42000, margin: 23.6 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Billed amount to date</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(metrics.totalCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">All project costs</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-600">{metrics.grossMargin.toFixed(1)}%</div>
              {metrics.marginTrend === 'up' && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +{metrics.trendPercentage}%
                </Badge>
              )}
            </div>
            <Progress value={metrics.grossMargin} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(metrics.grossProfit)} profit</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-green">{metrics.netMargin.toFixed(1)}%</div>
            <Progress value={metrics.netMargin} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(metrics.netProfit)} net profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Cost Breakdown</CardTitle>
              <CardDescription className="text-brand-slate">Distribution of project costs</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                    <span className="font-semibold">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Total Costs</span>
              <span>{formatCurrency(metrics.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Margin Trend */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Monthly Margin Trend</CardTitle>
          <CardDescription className="text-brand-slate">Historical margin performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyMargins.map((row, index) => {
                  const profit = row.revenue - row.cost;
                  const isGoodMargin = row.margin >= 24.0;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.cost)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(profit)}</TableCell>
                      <TableCell className="text-right">
                        <span className={isGoodMargin ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                          {row.margin.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isGoodMargin ? 'default' : 'secondary'}>
                          {isGoodMargin ? 'On Target' : 'Below Target'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Margin Analysis Notes */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-navy" />
            <CardTitle className="text-brand-navy">Margin Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-brand-navy mb-2">Key Insights</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Gross margin is maintaining above 23%, indicating healthy project profitability</li>
                <li>Labor costs represent {((metrics.laborCost / metrics.totalCost) * 100).toFixed(1)}% of total costs</li>
                <li>Net margin of {metrics.netMargin}% exceeds industry average of 15-18%</li>
                <li>Margin trend is {metrics.marginTrend} by {metrics.trendPercentage}% month-over-month</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-brand-navy mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Monitor labor costs closely to maintain current margin levels</li>
                <li>Consider resource optimization for months with margins below 24%</li>
                <li>Review overhead allocation to identify cost reduction opportunities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FLSTabProps {
  projectId?: string;
}

export function FLSTab({ projectId }: FLSTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { fls = [], loading, filters, fetchFLs, setFilter, clearFilters } = useFinancialLineStore();

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCreateOpen(true);
  };

  // Initial fetch and project filter setup
  useEffect(() => {
    if (projectId) {
      setFilter('projectId', projectId);
    }
    fetchFLs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // Zustand functions are stable

  useEffect(() => {
    fetchFLs();
  }, [filters, fetchFLs]);

  // Filter FLs for this project
  const projectFLs = projectId 
    ? fls.filter(fl => {
        const flProjectId = typeof fl.projectId === 'string' ? fl.projectId : fl.projectId?._id;
        return flProjectId === projectId;
      })
    : fls;

  return (
    <div className="space-y-6">
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Filters</CardTitle>
              <CardDescription className="text-brand-slate">Search and filter financial lines</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button 
                type="button"
                onClick={handleCreateClick}
                className="bg-brand-green hover:bg-brand-green-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Financial Line
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder="Search by FL no, name..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
              />
              
              <Select value={filters.status} onValueChange={(value) => setFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.locationType} onValueChange={(value) => setFilter('locationType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Location Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Locations</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                  <SelectItem value="Offshore">Offshore</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.contractType} onValueChange={(value) => setFilter('contractType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Types</SelectItem>
                  <SelectItem value="T&M">T&M</SelectItem>
                  <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                  <SelectItem value="Retainer">Retainer</SelectItem>
                  <SelectItem value="Milestone-based">Milestone-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Financial Lines</CardTitle>
          <CardDescription className="text-brand-slate">
            {projectFLs.length} {projectFLs.length === 1 ? 'FL' : 'FLs'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialLineTable data={projectFLs} loading={loading} />
        </CardContent>
      </Card>

      <CreateFLForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultProjectId={projectId}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchFLs();
        }}
      />
    </div>
  );
}

export function PlannedCostsTab() {
  const [selectedView, setSelectedView] = useState('summary');

  // Mock planned cost data
  const plannedMetrics = {
    totalPlanned: 420000,
    laborPlanned: 300000,
    overheadPlanned: 85000,
    contingency: 35000,
    budgetUtilization: 90.5,
  };

  const costCategories = [
    { 
      category: 'Labor Costs', 
      planned: 300000, 
      allocated: 285000, 
      utilization: 95.0,
      subcategories: [
        { role: 'Senior Engineer', planned: 120000, allocated: 115000, hours: 1000 },
        { role: 'Engineer', planned: 90000, allocated: 88000, hours: 1200 },
        { role: 'Designer', planned: 60000, allocated: 52000, hours: 800 },
        { role: 'Project Manager', planned: 30000, allocated: 30000, hours: 300 },
      ]
    },
    { category: 'Overhead', planned: 85000, allocated: 75000, utilization: 88.2 },
    { category: 'Software & Tools', planned: 25000, allocated: 20000, utilization: 80.0 },
    { category: 'Contingency', planned: 35000, allocated: 0, utilization: 0.0 },
  ];

  const quarterlyPlan = [
    { quarter: 'Q4 2025', planned: 105000, forecast: 102000, variance: -3000 },
    { quarter: 'Q1 2026', planned: 110000, forecast: 115000, variance: 5000 },
    { quarter: 'Q2 2026', planned: 105000, forecast: 103000, variance: -2000 },
    { quarter: 'Q3 2026', planned: 100000, forecast: 100000, variance: 0 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Planned Cost KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(plannedMetrics.totalPlanned)}</div>
            <p className="text-xs text-muted-foreground mt-1">Project budget allocation</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Planned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(plannedMetrics.laborPlanned)}</div>
            <p className="text-xs text-muted-foreground mt-1">{((plannedMetrics.laborPlanned / plannedMetrics.totalPlanned) * 100).toFixed(1)}% of budget</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contingency</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(plannedMetrics.contingency)}</div>
            <p className="text-xs text-muted-foreground mt-1">{((plannedMetrics.contingency / plannedMetrics.totalPlanned) * 100).toFixed(1)}% buffer</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{plannedMetrics.budgetUtilization}%</div>
            <Progress value={plannedMetrics.budgetUtilization} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">Current utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Category Breakdown */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Cost Category Breakdown</CardTitle>
              <CardDescription className="text-brand-slate">Planned vs allocated budget</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {costCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-brand-navy">{category.category}</h4>
                    <p className="text-sm text-muted-foreground">Utilization: {category.utilization}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Planned: {formatCurrency(category.planned)}</p>
                    <p className="font-semibold">Allocated: {formatCurrency(category.allocated)}</p>
                  </div>
                </div>
                <Progress value={category.utilization} className="h-2" />
                
                {selectedView === 'detailed' && 'subcategories' in category && (
                  <div className="ml-4 mt-3 space-y-2 border-l-2 border-muted pl-4">
                    {category.subcategories?.map((sub, subIndex) => (
                      <div key={subIndex} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{sub.role}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{sub.hours}h</span>
                          <span className="font-medium">{formatCurrency(sub.allocated)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between font-bold">
              <span>Total Allocation</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-normal">Remaining: {formatCurrency(plannedMetrics.totalPlanned - costCategories.reduce((sum, cat) => sum + cat.allocated, 0))}</p>
                <p className="text-brand-navy">{formatCurrency(costCategories.reduce((sum, cat) => sum + cat.allocated, 0))}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Budget Plan */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Quarterly Budget Plan</CardTitle>
          <CardDescription className="text-brand-slate">Planned vs forecasted costs by quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarter</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Forecast</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarterlyPlan.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.quarter}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.planned)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(row.forecast)}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.variance > 0 ? 'text-red-600' : row.variance < 0 ? 'text-green-600' : ''}>
                        {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Math.abs(row.variance) <= 5000 ? 'default' : 'secondary'}>
                        {Math.abs(row.variance) <= 5000 ? 'On Track' : 'Review Needed'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(quarterlyPlan.reduce((sum, q) => sum + q.planned, 0))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(quarterlyPlan.reduce((sum, q) => sum + q.forecast, 0))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(quarterlyPlan.reduce((sum, q) => sum + q.variance, 0))}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ActualCostsTab() {
  const [filterPeriod, setFilterPeriod] = useState('current-month');

  // Mock actual cost data
  const actualMetrics = {
    totalActual: 380000,
    totalBudget: 420000,
    variance: -40000,
    budgetRemaining: 40000,
    burnRate: 90.5,
    projectedTotal: 415000,
  };

  const costByCategory = [
    { category: 'Labor', actual: 280000, budget: 300000, variance: -20000, percentage: 73.7 },
    { category: 'Overhead', actual: 75000, budget: 85000, variance: -10000, percentage: 19.7 },
    { category: 'Tools & Software', actual: 20000, budget: 25000, variance: -5000, percentage: 5.3 },
    { category: 'Travel', actual: 5000, budget: 10000, variance: -5000, percentage: 1.3 },
  ];

  const monthlyActuals = [
    { month: 'Nov 2025', labor: 52000, overhead: 14000, other: 4000, total: 70000, budget: 75000 },
    { month: 'Dec 2025', labor: 58000, overhead: 15000, other: 5000, total: 78000, budget: 80000 },
    { month: 'Jan 2026', labor: 55000, overhead: 15000, other: 3000, total: 73000, budget: 75000 },
    { month: 'Feb 2026', labor: 60000, overhead: 16000, other: 4000, total: 80000, budget: 85000 },
    { month: 'Mar 2026', labor: 55000, overhead: 15000, other: 4000, total: 74000, budget: 80000 },
  ];

  const resourceCosts = [
    { resource: 'John Smith', role: 'Senior Engineer', hours: 480, rate: 150, cost: 72000, utilization: 96 },
    { resource: 'Sarah Johnson', role: 'Engineer', hours: 520, rate: 100, cost: 52000, utilization: 92 },
    { resource: 'Mike Davis', role: 'Designer', hours: 380, rate: 120, cost: 45600, utilization: 88 },
    { resource: 'Emma Wilson', role: 'QA Engineer', hours: 400, rate: 90, cost: 36000, utilization: 85 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Actual Cost KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(actualMetrics.totalActual)}</div>
            <Progress value={actualMetrics.burnRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{actualMetrics.burnRate}% of budget used</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(actualMetrics.totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved budget</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(actualMetrics.variance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Under budget</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(actualMetrics.projectedTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">At completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Category */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Actual vs Budget by Category</CardTitle>
              <CardDescription className="text-brand-slate">Cost breakdown and variances</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costByCategory.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(row.actual)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.budget)}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.variance < 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(row.variance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.variance < 0 ? 'default' : 'secondary'}>
                        {row.variance < 0 ? 'Under Budget' : 'Over Budget'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(actualMetrics.totalActual)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(actualMetrics.totalBudget)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(actualMetrics.variance)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Actual Costs */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Monthly Actual Costs</CardTitle>
              <CardDescription className="text-brand-slate">Track costs over time</CardDescription>
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Labor</TableHead>
                  <TableHead className="text-right">Overhead</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyActuals.map((row, index) => {
                  const variance = row.total - row.budget;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.labor)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.overhead)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.other)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(row.total)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.budget)}</TableCell>
                      <TableCell className="text-right">
                        <span className={variance < 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(variance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resource Cost Detail */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Resource Cost Detail</CardTitle>
          <CardDescription className="text-brand-slate">Labor costs by resource</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resourceCosts.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.resource}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell className="text-right">{row.hours}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.rate)}/hr</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(row.cost)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={row.utilization >= 90 ? 'text-green-600' : 'text-orange-600'}>
                          {row.utilization}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={2}>Total Labor</TableCell>
                  <TableCell className="text-right">{resourceCosts.reduce((sum, r) => sum + r.hours, 0)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{formatCurrency(resourceCosts.reduce((sum, r) => sum + r.cost, 0))}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RevenueDetailsTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');

  // Mock revenue data
  const revenueMetrics = {
    totalRecognized: 450000,
    totalBilled: 485000,
    totalUnbilled: 35000,
    deferredRevenue: 50000,
    recognitionRate: 92.8,
    outstandingAR: 125000,
    collectionPeriod: 42, // days
  };

  const billingSchedule = [
    { milestone: 'Project Kickoff', amount: 50000, dueDate: '2025-11-15', status: 'Paid', paidDate: '2025-11-18' },
    { milestone: 'Phase 1 Completion', amount: 125000, dueDate: '2026-01-30', status: 'Paid', paidDate: '2026-02-05' },
    { milestone: 'Phase 2 Completion', amount: 150000, dueDate: '2026-04-15', status: 'Invoiced', paidDate: null },
    { milestone: 'Phase 3 Completion', amount: 160000, dueDate: '2026-07-30', status: 'Pending', paidDate: null },
  ];

  const monthlyRevenue = [
    { month: 'Nov 2025', recognized: 45000, billed: 50000, cash: 48000 },
    { month: 'Dec 2025', recognized: 52000, billed: 55000, cash: 50000 },
    { month: 'Jan 2026', recognized: 48000, billed: 50000, cash: 52000 },
    { month: 'Feb 2026', recognized: 55000, billed: 58000, cash: 55000 },
    { month: 'Mar 2026', recognized: 60000, billed: 62000, cash: 58000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Paid': 'default',
      'Invoiced': 'secondary',
      'Pending': 'outline',
    };
    const colors = {
      'Paid': 'text-green-600',
      'Invoiced': 'text-blue-600',
      'Pending': 'text-orange-600',
    };
    return { variant: variants[status as keyof typeof variants], color: colors[status as keyof typeof colors] };
  };

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Recognized</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(revenueMetrics.totalRecognized)}</div>
            <Progress value={revenueMetrics.recognitionRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{revenueMetrics.recognitionRate}% recognition rate</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billed Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(revenueMetrics.totalBilled)}</div>
            <p className="text-xs text-muted-foreground mt-1">Invoiced to client</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding AR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(revenueMetrics.outstandingAR)}</div>
            <p className="text-xs text-muted-foreground mt-1">{revenueMetrics.collectionPeriod} days collection period</p>
          </CardContent>
        </Card>

        <Card className="border-brand-light-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deferred Revenue</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{formatCurrency(revenueMetrics.deferredRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Future recognition</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Schedule */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Billing Schedule & Milestones</CardTitle>
              <CardDescription className="text-brand-slate">Project payment schedule</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingSchedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.milestone}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadge(item.status).variant as any}
                        className={getStatusBadge(item.status).color}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.paidDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Contract Value</p>
              <p className="text-2xl font-bold text-brand-navy">
                {formatCurrency(billingSchedule.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Paid: {formatCurrency(billingSchedule.filter(i => i.status === 'Paid').reduce((sum, item) => sum + item.amount, 0))}
              </p>
              <p className="text-sm text-muted-foreground">
                Pending: {formatCurrency(billingSchedule.filter(i => i.status !== 'Paid').reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Breakdown */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Monthly Revenue Breakdown</CardTitle>
              <CardDescription className="text-brand-slate">Track recognized vs billed vs cash collected</CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Recognized</TableHead>
                  <TableHead className="text-right">Billed</TableHead>
                  <TableHead className="text-right">Cash Collected</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyRevenue.map((row, index) => {
                  const variance = row.recognized - row.cash;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.recognized)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.billed)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(row.cash)}</TableCell>
                      <TableCell className="text-right">
                        <span className={variance > 0 ? 'text-orange-600' : 'text-green-600'}>
                          {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyRevenue.reduce((sum, row) => sum + row.recognized, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyRevenue.reduce((sum, row) => sum + row.billed, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyRevenue.reduce((sum, row) => sum + row.cash, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyRevenue.reduce((sum, row) => sum + (row.recognized - row.cash), 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Recognition Notes */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Revenue Recognition Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-brand-navy">Recognition Method:</strong> Percentage of completion based on costs incurred</p>
            <p><strong className="text-brand-navy">Billing Terms:</strong> Net 30 days from invoice date</p>
            <p><strong className="text-brand-navy">Payment Schedule:</strong> Milestone-based billing as per contract</p>
            <Separator />
            <div>
              <h4 className="font-semibold text-brand-navy mb-2">Key Metrics</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Unbilled revenue: {formatCurrency(revenueMetrics.totalUnbilled)}</li>
                <li>Average collection period: {revenueMetrics.collectionPeriod} days</li>
                <li>Revenue recognition rate: {revenueMetrics.recognitionRate}%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


