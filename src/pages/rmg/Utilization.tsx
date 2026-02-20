import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, RefreshCw, Loader2, BarChart3, Users, TrendingUp, DollarSign, Clock, UserCheck, Eye, Pencil, MoreHorizontal } from 'lucide-react';
import { rmgAnalyticsService, type ResourceUtilizationData } from '@/services/rmgAnalyticsService';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/common/StatCard';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { employeeService } from '@/services/employeeService';
import { projectService } from '@/services/projectService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function Utilization() {
  const [data, setData] = useState<ResourceUtilizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [department, setDepartment] = useState<string>('all');
  const [designation, setDesignation] = useState<string>('all');
  const [project, setProject] = useState<string>('all');

  // Clear all filters to default (no filters)
  const handleClearFilters = () => {
    setSearch('');
    setFromDate(undefined);
    setToDate(undefined);
    setDepartment('all');
    setDesignation('all');
    setProject('all');
    fetchData();
  };

  // Option lists (dynamic)
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(['all']);
  const [designationOptions, setDesignationOptions] = useState<string[]>(['all']);
  const [projectOptions, setProjectOptions] = useState<string[]>(['all']);

  // Fetch options on mount
  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch all employees to extract unique departments and designations
        const employees = await employeeService.getAll();
        const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
        const designations = Array.from(new Set(employees.map(e => e.designation).filter(Boolean)));
        setDepartmentOptions(['all', ...departments]);
        setDesignationOptions(['all', ...designations]);

        // Fetch all projects for project name filter
        const projects = await projectService.getAll();
        setProjectOptions(['all', ...projects.map(p => ({ id: p.projectId, name: p.name }))]);
      } catch (err) {
        // fallback to 'all' only
        setDepartmentOptions(['all']);
        setDesignationOptions(['all']);
        setProjectOptions(['all']);
      }
    }
    fetchOptions();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      if (department && department !== 'all') params.department = department;
      if (designation && designation !== 'all') params.role = designation;
      if (project && project !== 'all') params.projectId = project;
      const utilizationData = await rmgAnalyticsService.getResourceUtilization(params);
      setData(utilizationData);
    } catch (error) {
      console.error('Error fetching utilization data:', error);
      toast.error('Failed to load utilization data');
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch on mount or refresh, not on filter change
  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Data refreshed');
  };

  const getUtilizationBadgeVariant = (utilization: number): "default" | "secondary" | "destructive" => {
    if (utilization >= 80) return 'default';
    if (utilization >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading utilization data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Unable to load utilization data. Please try again.
            </p>
            <Button onClick={handleRefresh}>
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
      <div className="page-header mb-6">
        <div className="page-header-content">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-7 w-7 text-primary mt-1" />
            <div>
              <h1 className="page-title">Resource Utilization</h1>
              <p className="page-description">Track resource productivity and efficiency</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, etc." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DateRangePicker fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt === 'all' ? 'All Departments' : opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Designation</label>
              <Select value={designation} onValueChange={setDesignation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {designationOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt === 'all' ? 'All Designations' : opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Project Name</label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Projects</SelectItem>
                  {projectOptions.filter(opt => opt !== 'all').map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.id} - {opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button onClick={handleApplyFilters} variant="default">Apply Filters</Button>
            <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
        <StatCard
          label="Total Headcount"
          value={data.summary.totalResources}
          icon={Users}
          color="blue"
          tooltip="Total number of employees across all departments"
        />
        <StatCard
          label="Overall Utilization"
          value={`${data.summary.overallUtilization}%`}
          icon={TrendingUp}
          color="purple"
          tooltip={`${data.summary.utilizedResources} of ${data.summary.totalResources} resources utilized`}
        />
        <StatCard
          label="Billable"
          value={`${data.summary.billableUtilization}%`}
          icon={DollarSign}
          color="green"
          tooltip="Revenue-generating utilization"
        />
        <StatCard
          label="Non Billable"
          value={`${data.summary.nonBillableUtilization}%`}
          icon={Clock}
          color="orange"
          tooltip="Internal projects and activities"
        />
        <StatCard
          label="On Bench"
          value={data.summary.benchStrength}
          icon={UserCheck}
          color="red"
          tooltip="Available resources for allocation"
        />
      </div>

      {/* Employee Utilization Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Utilization</CardTitle>
          <CardDescription>Detailed resource allocation and utilization status</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 !pt-0">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">Active Allocations</TabsTrigger>
              <TabsTrigger value="bench">Bench Active</TabsTrigger>
            </TabsList>
            
            {/* Active Allocations Tab */}
            <TabsContent value="active" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Resource Name</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Designation</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Department</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Start Date</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">End Date</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Allocation %</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Project Name</TableHead>
                      <TableHead className="text-right normal-case !font-medium !tracking-normal whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topPerformers && data.topPerformers.length > 0 ? (
                      data.topPerformers.map((employee) => (
                        <TableRow key={`active-${employee.employeeId}`} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`/api/avatar/${employee.employeeId}`} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{employee.designation}</TableCell>
                          <TableCell className="text-sm">{employee.department}</TableCell>
                          <TableCell className="text-sm">
                            {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {employee.endDate ? new Date(employee.endDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress value={employee.utilization} className="h-2 flex-1" />
                              <span className="text-sm font-medium whitespace-nowrap">{employee.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{employee.projectName}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toast.info('View functionality coming soon')}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Allocation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No active allocations found for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Bench Active Tab */}
            <TabsContent value="bench" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Resource Name</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Designation</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Department</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Available Since</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Skills</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Allocation %</TableHead>
                      <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right normal-case !font-medium !tracking-normal whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.benchResources && data.benchResources.length > 0 ? (
                      data.benchResources.map((employee) => (
                        <TableRow key={`bench-${employee.employeeId}`} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`/api/avatar/${employee.employeeId}`} />
                                <AvatarFallback className="bg-orange-500/10 text-orange-600 text-xs font-medium">
                                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{employee.designation}</TableCell>
                          <TableCell className="text-sm">{employee.department}</TableCell>
                          <TableCell className="text-sm">
                            {employee.availableSince ? new Date(employee.availableSince).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {employee.skills && employee.skills.length > 0 ? (
                                employee.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                              {employee.skills && employee.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{employee.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress value={employee.utilization} className="h-2 flex-1" />
                              <span className="text-sm font-medium whitespace-nowrap">{employee.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-200">
                              On Bench
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toast.info('View functionality coming soon')}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Assign to Project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No bench resources found for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Department-wise Utilization</CardTitle>
          <CardDescription>Resource utilization across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.departmentBreakdown?.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.department}</span>
                  <Badge variant={getUtilizationBadgeVariant(dept.utilization)}>
                    {dept.utilization}%
                  </Badge>
                </div>
                <Progress value={dept.utilization} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{dept.totalResources} resources</span>
                  <span>
                    {dept.billableHours}h billable • {dept.nonBillableHours}h non-billable • {dept.benchCount} bench
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Utilization Trends</CardTitle>
            <CardDescription>Daily utilization pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Overall %" strokeWidth={2} />
                <Line type="monotone" dataKey="billable" stroke="#10b981" name="Billable %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Utilization by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" name="Utilization %" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
