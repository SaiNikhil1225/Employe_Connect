import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, CheckCircle2, Clock, TrendingUp, AlertCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { useProjectStore } from '@/store/projectStore';
import { StatCard } from '@/components/common/StatCard';
import { FinancialLineTable } from './components/FinancialLineTable';
import { CreateFLWizard } from './components/CreateFLWizard';

export function FinancialLineListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { fls = [], loading, filters, fetchFLs, setFilter, clearFilters } = useFinancialLineStore();
  const { projects = [], fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchFLs();
    fetchProjects({});
  }, [fetchFLs, fetchProjects]);

  useEffect(() => {
    fetchFLs();
  }, [filters, fetchFLs]);

  const activeProjects = projects?.filter((p) => p.status === 'Active') || [];

  // Calculate KPIs
  const totalFLs = fls.length;
  const activeFLs = fls.filter(fl => fl.status === 'Active').length;
  const completedFLs = fls.filter(fl => fl.status === 'Completed').length;
  const draftFLs = fls.filter(fl => fl.status === 'Draft').length;
  const onHoldFLs = fls.filter(fl => fl.status === 'On Hold').length;
  const totalRevenue = fls.reduce((sum, fl) => sum + (fl.totalRevenue || 0), 0);

  // Mock trend data
  const trends = {
    total: { value: 7, direction: 'up' as const },
    active: { value: 9, direction: 'up' as const },
    completed: { value: 12, direction: 'up' as const },
    draft: { value: 5, direction: 'down' as const, isPositive: true },
    revenue: { value: 18, direction: 'up' as const },
  };

  const handleStatClick = (status?: string) => {
    if (status) {
      setFilter('status', status);
      setFilter('search', '');
      setFilter('locationType', '');
      setFilter('contractType', '');
      setFilter('projectId', '');
    } else {
      // Clear all filters
      clearFilters();
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Financial Lines</h1>
                <p className="text-sm text-muted-foreground">Manage financial lines with revenue planning and milestones</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New Financial Line
          </Button>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <StatCard
            label="Total"
            value={totalFLs}
            icon={DollarSign}
            color="blue"
            trend={trends.total}
            tooltip="Total number of financial lines. Click to clear filters."
            onClick={() => handleStatClick()}
          />
          <StatCard
            label="Active"
            value={activeFLs}
            icon={CheckCircle2}
            color="green"
            trend={trends.active}
            tooltip={`${activeFLs} active financial lines (${totalFLs > 0 ? Math.round((activeFLs / totalFLs) * 100) : 0}% of total). Click to filter.`}
            onClick={() => handleStatClick('Active')}
          />
          <StatCard
            label="Completed"
            value={completedFLs}
            icon={TrendingUp}
            color="purple"
            trend={trends.completed}
            tooltip={`${completedFLs} completed financial lines. Click to filter.`}
            onClick={() => handleStatClick('Completed')}
          />
          <StatCard
            label="Draft"
            value={draftFLs}
            icon={Clock}
            color={draftFLs > 5 ? 'orange' : 'green'}
            trend={trends.draft}
            tooltip={`${draftFLs} draft financial lines. Trend down is positive. Click to filter.`}
            onClick={() => handleStatClick('Draft')}
          />
          <StatCard
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="blue"
            trend={trends.revenue}
            tooltip={`Total revenue across all financial lines: ${formatCurrency(totalRevenue)}`}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter financial lines</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Input
                placeholder="Search by FL no, name..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
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

              <Select value={filters.projectId} onValueChange={(value) => setFilter('projectId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Projects</SelectItem>
                  {activeProjects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Lines</CardTitle>
          <CardDescription>
            {fls.length} {fls.length === 1 ? 'FL' : 'FLs'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialLineTable data={fls} loading={loading} />
        </CardContent>
      </Card>

      <CreateFLWizard
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchFLs();
        }}
      />
    </div>
  );
}
