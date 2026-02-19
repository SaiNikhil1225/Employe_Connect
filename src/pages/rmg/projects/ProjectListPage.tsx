import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FolderKanban, CheckCircle2, TrendingUp, AlertTriangle, DollarSign, X, Filter, FileText, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectTable } from './components/ProjectTable';
import { CreateProjectDialog } from './components/CreateProjectDialog';
import { KpiCard } from './components/KpiCard';
import { ColumnToggle, type ColumnVisibility } from './components/ColumnToggle';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { SectionHeader } from '@/components/common/SectionHeader';
import { StatCard } from '@/components/common/StatCard';
import type { ProjectFilters } from '@/types/project';
import type { DateRange } from 'react-day-picker';

export function ProjectListPage() {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  // Hidden until functional
  // const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  // const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchScope, setSearchScope] = useState<'all' | 'name' | 'id' | 'manager'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    projectName: true,
    owner: true,
    status: true,
    progress: true,
    budget: true,
    team: true,
    dueDate: true,
  });

  // Filter options
  const statusOptions: Option[] = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Active', value: 'Active' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Closed', value: 'Closed' },
  ];

  const regionOptions: Option[] = [
    { label: 'UK', value: 'UK' },
    { label: 'India', value: 'India' },
    { label: 'USA', value: 'USA' },
    { label: 'ME', value: 'ME' },
    { label: 'Other', value: 'Other' },
  ];

  // Hidden until functional
  // const healthOptions: Option[] = [
  //   { label: '🟢 Excellent (80-100%)', value: 'excellent' },
  //   { label: '🟡 Good (60-79%)', value: 'good' },
  //   { label: '🟠 Fair (40-59%)', value: 'fair' },
  //   { label: '🔴 At Risk (20-39%)', value: 'at-risk' },
  //   { label: '⚫ Critical (<20%)', value: 'critical' },
  // ];

  // Hidden until functional
  // Get unique project owners/managers
  // const ownerOptions: Option[] = Array.from(
  //   new Set(
  //     projects
  //       .map(p => p.projectManager?.name || p.deliveryManager?.name)
  //       .filter(Boolean)
  //   )
  // ).map(name => ({ label: name!, value: name! }));

  // Calculate KPIs
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const draftProjects = projects.filter(p => p.status === 'Draft').length;
  const closedProjects = projects.filter(p => p.status === 'Closed').length;
  
  // Calculate average health score based on project utilization
  const projectsWithUtilization = projects.filter(p => p.utilization !== undefined && p.utilization !== null);
  const avgHealthScore = projectsWithUtilization.length > 0
    ? Math.round(projectsWithUtilization.reduce((sum, p) => sum + (p.utilization || 0), 0) / projectsWithUtilization.length)
    : 0;
  
  // Critical risks are projects on hold or with low utilization
  const criticalRisks = projects.filter(p => 
    p.status === 'On Hold' || (p.utilization !== undefined && p.utilization < 50)
  ).length;
  
  // Calculate budget utilization: projects with budget data
  const projectsWithBudget = projects.filter(p => p.budget && p.budget > 0 && p.estimatedValue);
  const budgetUtilization = projectsWithBudget.length > 0
    ? Math.round(
        (projectsWithBudget.reduce((sum, p) => sum + ((p.estimatedValue || 0) / (p.budget || 1)), 0) / projectsWithBudget.length) * 100 * 10
      ) / 10
    : 0;

  // Mock trend data (in real app, compare with last month from API)
  const trends = {
    total: { value: 8, direction: 'up' as const },
    active: { value: 12, direction: 'up' as const },
    health: { value: 5, direction: 'up' as const },
    risks: { value: 15, direction: 'down' as const, isPositive: true },
    budget: { value: 3, direction: 'up' as const },
  };

  useEffect(() => {
    fetchProjects(filters);
  }, [fetchProjects, filters]);

  useEffect(() => {
    // Real-time search with debouncing
    const timeoutId = setTimeout(() => {
      const newFilters: ProjectFilters = {};
      
      if (searchQuery) {
        newFilters.search = searchQuery;
        newFilters.searchScope = searchScope;
      }
      
      if (selectedStatuses.length > 0) {
        newFilters.statuses = selectedStatuses;
      }
      
      if (selectedRegions.length > 0) {
        newFilters.regions = selectedRegions;
      }
      
      // Hidden filters
      // if (selectedOwners.length > 0) {
      //   newFilters.owners = selectedOwners;
      // }
      
      // if (selectedHealth.length > 0) {
      //   newFilters.health = selectedHealth;
      // }
      
      if (dateRange?.from) {
        newFilters.startDate = dateRange.from.toISOString();
      }
      
      if (dateRange?.to) {
        newFilters.endDate = dateRange.to.toISOString();
      }
      
      setFilters(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchScope, selectedStatuses, selectedRegions, /* selectedOwners, selectedHealth, */ dateRange]);

  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    if (value === 'all') {
      const { [key]: _removed, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedRegions([]);
    // setSelectedOwners([]); // Hidden filter
    // setSelectedHealth([]); // Hidden filter
    setDateRange(undefined);
    setFilters({});
  };

  const handleStatClick = (status?: string) => {
    if (status) {
      setSelectedStatuses([status]);
    } else {
      clearAllFilters();
    }
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    selectedStatuses.length +
    selectedRegions.length +
    // selectedOwners.length + // Hidden filter
    // selectedHealth.length + // Hidden filter
    (dateRange?.from ? 1 : 0);

  const removeFilter = (type: 'status' | 'region' | /* 'owner' | 'health' | */ 'date' | 'search', value?: string) => {
    switch (type) {
      case 'status':
        setSelectedStatuses(selectedStatuses.filter(s => s !== value));
        break;
      case 'region':
        setSelectedRegions(selectedRegions.filter(r => r !== value));
        break;
      // case 'owner': // Hidden filter
      //   setSelectedOwners(selectedOwners.filter(o => o !== value));
      //   break;
      // case 'health': // Hidden filter
      //   setSelectedHealth(selectedHealth.filter(h => h !== value));
      //   break;
      case 'date':
        setDateRange(undefined);
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <div className="page-header-content">
          <div className="flex items-start gap-3">
            <FolderKanban className="h-7 w-7 text-primary mt-1" />
            <div>
              <h1 className="page-title">Projects</h1>
              <p className="page-description">Manage and track project lifecycle</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard
            label="Total"
            value={totalProjects}
            icon={FolderKanban}
            color="blue"
            trend={trends.total}
            tooltip="Total number of projects across all statuses. Click to clear filters."
            onClick={() => handleStatClick()}
          />
          <StatCard
            label="Active"
            value={activeProjects}
            icon={CheckCircle2}
            color="green"
            trend={trends.active}
            tooltip={`${activeProjects} active projects (${totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}% of total). Click to filter active projects.`}
            onClick={() => handleStatClick('Active')}
          />
          <StatCard
            label="Health"
            value={`${avgHealthScore}%`}
            icon={TrendingUp}
            color="purple"
            trend={trends.health}
            tooltip="Average health score based on project utilization. Higher is better."
          />
          <StatCard
            label="Risks"
            value={criticalRisks}
            icon={AlertTriangle}
            color={criticalRisks > 0 ? 'orange' : 'green'}
            trend={trends.risks}
            tooltip={`${criticalRisks} projects with critical risks (On Hold or low utilization <50%). Click to filter.`}
            onClick={() => criticalRisks > 0 && handleStatClick('On Hold')}
          />
          <StatCard
            label="Budget"
            value={`${budgetUtilization}%`}
            icon={DollarSign}
            color="blue"
            trend={trends.budget}
            tooltip={`Average budget utilization across ${projectsWithBudget.length} tracked projects.`}
          />
        </div>

      {/* Projects Table */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              icon={FileText}
              title="All Projects"
              subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
            />
            <div className="flex gap-2 self-start sm:self-auto">
              <ColumnToggle 
                columns={columnVisibility} 
                onToggle={setColumnVisibility}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 !pt-0">
          {/* Filters Section */}
          {showFilters && (
            <Card className="border-muted shadow-none hover:shadow-none">
              <CardContent className="pb-4 !pt-0 !px-0">
                <div className="space-y-4">
                  {/* Filters Row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Search Input */}
                    <div className="w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-9 border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear search"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Multi-Select */}
                    <div className="w-[180px]">
                      <MultiSelect
                        options={statusOptions}
                        selected={selectedStatuses}
                        onChange={setSelectedStatuses}
                        placeholder="Status"
                        className="border-brand-light-gray"
                      />
                    </div>

                    {/* Region Multi-Select */}
                    <div className="w-[180px]">
                      <MultiSelect
                        options={regionOptions}
                        selected={selectedRegions}
                        onChange={setSelectedRegions}
                        placeholder="Region"
                        className="border-brand-light-gray"
                      />
                    </div>

                    {/* Date Range Picker */}
                    <div className="w-[200px]">
                      <DateRangePicker
                        date={dateRange}
                        onDateChange={setDateRange}
                        placeholder="Project Timeline"
                        className="border-brand-light-gray"
                      />
                    </div>
                  </div>

                  {/* Active Filter Chips */}
                  {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-light-gray">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">Active Filters ({activeFilterCount}):</span>
                      </div>
                      
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                          Search: "{searchQuery}"
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('search')}
                          />
                        </Badge>
                      )}
                      
                      {selectedStatuses.map((status) => (
                        <Badge key={status} variant="secondary" className="gap-1">
                          Status: {status}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('status', status)}
                          />
                        </Badge>
                      ))}
                      
                      {selectedRegions.map((region) => (
                        <Badge key={region} variant="secondary" className="gap-1">
                          Region: {region}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('region', region)}
                          />
                        </Badge>
                      ))}
                      
                      {/* Hidden filters - Owner and Health (commented out until functional) */}
                      
                      {dateRange?.from && (
                        <Badge variant="secondary" className="gap-1">
                          Date: {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString() || 'Now'}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('date')}
                          />
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-7 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Table */}
          <ProjectTable 
                projects={projects} 
                isLoading={isLoading}
                onCreateProject={() => setIsCreateDialogOpen(true)}
                columnVisibility={columnVisibility}
              />
            </CardContent>
          </Card>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
