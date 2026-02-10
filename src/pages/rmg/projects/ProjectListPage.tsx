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
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchScope, setSearchScope] = useState<'all' | 'name' | 'id' | 'manager'>('all');
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

  const healthOptions: Option[] = [
    { label: '🟢 Excellent (80-100%)', value: 'excellent' },
    { label: '🟡 Good (60-79%)', value: 'good' },
    { label: '🟠 Fair (40-59%)', value: 'fair' },
    { label: '🔴 At Risk (20-39%)', value: 'at-risk' },
    { label: '⚫ Critical (<20%)', value: 'critical' },
  ];

  // Get unique project owners/managers
  const ownerOptions: Option[] = Array.from(
    new Set(
      projects
        .map(p => p.projectManager?.name || p.deliveryManager?.name)
        .filter(Boolean)
    )
  ).map(name => ({ label: name!, value: name! }));

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
      
      if (selectedOwners.length > 0) {
        newFilters.owners = selectedOwners;
      }
      
      if (selectedHealth.length > 0) {
        newFilters.health = selectedHealth;
      }
      
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
  }, [searchQuery, searchScope, selectedStatuses, selectedRegions, selectedOwners, selectedHealth, dateRange]);

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
    setSelectedOwners([]);
    setSelectedHealth([]);
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
    selectedOwners.length +
    selectedHealth.length +
    (dateRange?.from ? 1 : 0);

  const removeFilter = (type: 'status' | 'region' | 'owner' | 'health' | 'date' | 'search', value?: string) => {
    switch (type) {
      case 'status':
        setSelectedStatuses(selectedStatuses.filter(s => s !== value));
        break;
      case 'region':
        setSelectedRegions(selectedRegions.filter(r => r !== value));
        break;
      case 'owner':
        setSelectedOwners(selectedOwners.filter(o => o !== value));
        break;
      case 'health':
        setSelectedHealth(selectedHealth.filter(h => h !== value));
        break;
      case 'date':
        setDateRange(undefined);
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Project Overview</h1>
                <p className="text-sm text-muted-foreground">Overseeing global projects, resources, and delivery performance</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
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
            showProgress
            progressValue={avgHealthScore}
            progressMax={100}
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
            showProgress
            progressValue={budgetUtilization}
            progressMax={100}
            tooltip={`Average budget utilization across ${projectsWithBudget.length} tracked projects.`}
          />
        </div>
      </div>

      {/* Filters & Column Toggle */}
      <Card className="border-brand-light-gray shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-4">
                {/* First Row: Search with Column Toggle */}
                <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                  {/* Search with Scope Selector and Results Count */}
                  <div className="flex-1 max-w-md space-y-2">
                    <div className="flex gap-2">
                      {/* Search Scope Selector */}
                      <Select value={searchScope} onValueChange={(value: any) => setSearchScope(value)}>
                        <SelectTrigger className="w-[120px] border-brand-light-gray">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fields</SelectItem>
                          <SelectItem value="name">Name Only</SelectItem>
                          <SelectItem value="id">ID Only</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Search Input with Clear Button */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Search ${searchScope === 'all' ? 'all fields' : searchScope}...`}
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
                    
                    {/* Search Results Count */}
                    {searchQuery && (
                      <div className="text-sm text-muted-foreground px-1">
                        {isLoading ? (
                          <span>Searching...</span>
                        ) : (
                          <span>
                            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
                            {searchScope !== 'all' && ` in ${searchScope}`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column Toggle */}
                  <ColumnToggle 
                    columns={columnVisibility} 
                    onToggle={setColumnVisibility}
                  />
                </div>

                {/* Second Row: Filter Dropdowns */}
                <div className="flex flex-wrap gap-4">
                  {/* Status Multi-Select */}
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <MultiSelect
                      options={statusOptions}
                      selected={selectedStatuses}
                      onChange={setSelectedStatuses}
                      placeholder="Status"
                      className="border-brand-light-gray"
                    />
                  </div>

                  {/* Region Multi-Select */}
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <MultiSelect
                      options={regionOptions}
                      selected={selectedRegions}
                      onChange={setSelectedRegions}
                      placeholder="Region"
                      className="border-brand-light-gray"
                    />
                  </div>

                  {/* Owner Multi-Select */}
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <MultiSelect
                      options={ownerOptions}
                      selected={selectedOwners}
                      onChange={setSelectedOwners}
                      placeholder="Owner"
                      className="border-brand-light-gray"
                    />
                  </div>

                  {/* Health Multi-Select */}
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <MultiSelect
                      options={healthOptions}
                      selected={selectedHealth}
                      onChange={setSelectedHealth}
                      placeholder="Health"
                      className="border-brand-light-gray"
                    />
                  </div>

                  {/* Date Range Picker */}
                  <div className="w-full sm:w-auto sm:min-w-[280px]">
                    <DateRangePicker
                      date={dateRange}
                      onDateChange={setDateRange}
                      placeholder="Project Timeline"
                      className="border-brand-light-gray"
                    />
                  </div>
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
                  
                  {selectedOwners.map((owner) => (
                    <Badge key={owner} variant="secondary" className="gap-1">
                      Owner: {owner}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeFilter('owner', owner)}
                      />
                    </Badge>
                  ))}
                  
                  {selectedHealth.map((health) => (
                    <Badge key={health} variant="secondary" className="gap-1">
                      Health: {healthOptions.find(h => h.value === health)?.label || health}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeFilter('health', health)}
                      />
                    </Badge>
                  ))}
                  
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
            </CardContent>
          </Card>

      {/* Projects Table */}
      <Card className="border-brand-light-gray shadow-sm">
            <CardHeader>
              <SectionHeader
                icon={FileText}
                title="All Projects"
                subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
              />
            </CardHeader>
            <CardContent>
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
