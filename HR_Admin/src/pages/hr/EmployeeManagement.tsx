import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Mail, Phone, MoreVertical, UserX, UserCheck, Trash2, Users, ClipboardCheck, Filter, CalendarIcon, Download, Upload, UserPlus, TrendingUp, TrendingDown, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import type { Employee } from '@/services/employeeService';
import { getExperienceBreakdown } from '@/lib/experienceUtils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export function EmployeeManagement() {
  const navigate = useNavigate();
  const { employees, isLoading, fetchEmployees, markInactive, activateEmployee, deleteEmployee } = useEmployeeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [employeeToMarkInactive, setEmployeeToMarkInactive] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Date range filtering states
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Extract unique values for filters
  const businessUnits = ['all', ...Array.from(new Set(employees.map(emp => emp.businessUnit).filter(Boolean)))];
  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)))];
  const locations = ['all', ...Array.from(new Set(employees.map(emp => emp.location).filter(Boolean)))];
  const designations = ['all', ...Array.from(new Set(employees.map(emp => emp.designation).filter(Boolean)))];
  const experienceRanges = ['all', '0-2 years', '2-5 years', '5-10 years', '10+ years'];

  // Calculate active filter count
  const activeFilterCount = [
    businessUnitFilter !== 'all',
    departmentFilter !== 'all',
    locationFilter !== 'all',
    designationFilter !== 'all',
    experienceFilter !== 'all'
  ].filter(Boolean).length;

  // Clear all filters function
  const clearAllFilters = () => {
    setBusinessUnitFilter('all');
    setDepartmentFilter('all');
    setLocationFilter('all');
    setDesignationFilter('all');
    setExperienceFilter('all');
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');

  const filteredActiveEmployees = activeEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBusinessUnit = businessUnitFilter === 'all' || emp.businessUnit === businessUnitFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesLocation = locationFilter === 'all' || emp.location === locationFilter;
    const matchesDesignation = designationFilter === 'all' || emp.designation === designationFilter;
    
    // Experience filter logic
    let matchesExperience = true;
    if (experienceFilter !== 'all') {
      const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
      const expYears = experienceData.totalExperience.totalMonths / 12;
      if (experienceFilter === '0-2 years') matchesExperience = expYears < 2;
      else if (experienceFilter === '2-5 years') matchesExperience = expYears >= 2 && expYears < 5;
      else if (experienceFilter === '5-10 years') matchesExperience = expYears >= 5 && expYears < 10;
      else if (experienceFilter === '10+ years') matchesExperience = expYears >= 10;
    }
    
    return matchesSearch && matchesBusinessUnit && matchesDepartment && matchesLocation && matchesDesignation && matchesExperience;
  });

  const filteredInactiveEmployees = inactiveEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBusinessUnit = businessUnitFilter === 'all' || emp.businessUnit === businessUnitFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesLocation = locationFilter === 'all' || emp.location === locationFilter;
    const matchesDesignation = designationFilter === 'all' || emp.designation === designationFilter;
    
    // Experience filter logic
    let matchesExperience = true;
    if (experienceFilter !== 'all') {
      const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
      const expYears = experienceData.totalExperience.totalMonths / 12;
      if (experienceFilter === '0-2 years') matchesExperience = expYears < 2;
      else if (experienceFilter === '2-5 years') matchesExperience = expYears >= 2 && expYears < 5;
      else if (experienceFilter === '5-10 years') matchesExperience = expYears >= 5 && expYears < 10;
      else if (experienceFilter === '10+ years') matchesExperience = expYears >= 10;
    }
    
    return matchesSearch && matchesBusinessUnit && matchesDepartment && matchesLocation && matchesDesignation && matchesExperience;
  });

  const handleMarkInactive = (employee: Employee) => {
    if (!employee._id) return;
    setEmployeeToMarkInactive(employee);
  };

  const confirmMarkInactive = async () => {
    if (!employeeToMarkInactive?._id) return;

    try {
      await markInactive(employeeToMarkInactive._id);
      toast.success(`${employeeToMarkInactive.name} marked as inactive`);
      setEmployeeToMarkInactive(null);
    } catch (error) {
      console.error('Failed to mark inactive:', error);
      toast.error('Failed to mark employee as inactive');
    }
  };

  const handleActivate = async (employee: Employee) => {
    if (!employee._id) return;

    try {
      await activateEmployee(employee._id);
      toast.success(`${employee.name} reactivated`);
    } catch (error) {
      console.error('Failed to reactivate:', error);
      toast.error('Failed to reactivate employee');
    }
  };

  const handleDelete = (employee: Employee) => {
    if (!employee._id) return;
    setEmployeeToDelete(employee);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete?._id) return;

    try {
      await deleteEmployee(employeeToDelete._id);
      toast.success(`${employeeToDelete.name} deleted`);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete employee');
    }
  };

  // Clear date filters
  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilterApplied(false);
  };

  // Apply filter
  const applyFilter = () => {
    if (!fromDate && !toDate) {
      toast.error('Please select at least one date');
      return;
    }
    setFilterApplied(true);
    setShowFilterPopover(false);
    toast.success('Date range filter applied');
  };

  // Calculate stats based on date range filter
  const getFilteredStats = () => {
    if (!filterApplied || (!fromDate && !toDate)) {
      // Return all employees when no filter is applied
      return {
        total: employees.length,
        joiners: 0, // Don't show joiners without filter
        exits: employees.filter(emp => emp.status === 'inactive').length,
        active: activeEmployees.length
      };
    }

    // Filter employees by date range
    const filteredEmployees = employees.filter(emp => {
      const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
      if (!joinDate) return false;

      if (fromDate && toDate) {
        return joinDate >= fromDate && joinDate <= toDate;
      } else if (fromDate) {
        return joinDate >= fromDate;
      } else if (toDate) {
        return joinDate <= toDate;
      }
      return true;
    });

    const totalInRange = filteredEmployees.length;
    const joinersInRange = filteredEmployees.filter(e => e.status === 'active').length;
    const exitsInRange = filteredEmployees.filter(e => e.status === 'inactive').length;

    return {
      total: totalInRange,
      joiners: joinersInRange,
      exits: exitsInRange,
      active: filteredEmployees.filter(emp => emp.status === 'active').length
    };
  };

  const stats = getFilteredStats();

  // Export functions
  const exportToExcel = () => {
    toast.success('Exporting to Excel...');
    // TODO: Implement Excel export logic
  };

  const exportToCSV = () => {
    toast.success('Exporting to CSV...');
    // TODO: Implement CSV export logic
  };

  const exportToPDF = () => {
    toast.success('Exporting to PDF...');
    // TODO: Implement PDF export logic
  };

  const EmployeeCard = ({ employee, isInactive = false }: { employee: Employee; isInactive?: boolean }) => (
    <div className="group flex items-center justify-between p-4 border rounded-lg hover:bg-primary hover:border-primary transition-colors">
      <div className="flex items-center gap-4">
        <EmployeeAvatar
          employee={{
            employeeId: employee.employeeId,
            name: employee.name,
            firstName: employee.firstName,
            lastName: employee.lastName,
            profilePhoto: employee.profilePhoto,
          }}
          size="lg"
        />
        <div>
          <p className="font-medium group-hover:text-white">{employee.name}</p>
          <p className="text-sm text-muted-foreground group-hover:text-white/80">{employee.designation}</p>
          {employee.reportingManager && (
            <p className="text-xs text-muted-foreground group-hover:text-white/70">
              Reports to: {employee.reportingManager.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium group-hover:text-white">{employee.department}</p>
          <p className="text-xs text-muted-foreground group-hover:text-white/80">{employee.employeeId}</p>
          <p className="text-xs text-muted-foreground group-hover:text-white/80">{employee.location}</p>
        </div>
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="group-hover:bg-white/10 group-hover:text-white group-hover:border-white/30">
          {employee.status}
        </Badge>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => window.open(`mailto:${employee.email}`)} aria-label={`Send email to ${employee.name}`} className="group-hover:text-white group-hover:hover:bg-white/20">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(`tel:${employee.phone}`)} aria-label={`Call ${employee.name}`} className="group-hover:text-white group-hover:hover:bg-white/20">
            <Phone className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`More actions for ${employee.name}`} className="group-hover:text-white group-hover:hover:bg-white/20">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/onboarding/${employee.employeeId}`)}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                View Onboarding
              </DropdownMenuItem>
              {!isInactive ? (
                <DropdownMenuItem onClick={() => handleMarkInactive(employee)} className="text-orange-600 dark:text-orange-400">
                  <UserX className="mr-2 h-4 w-4" />
                  Mark Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleActivate(employee)} className="text-green-600">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(employee)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container space-y-6">
      {/* Professional Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Employee Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage your workforce efficiently</p>
          </div>
        </div>

        {/* Action Bar: Filter + Buttons */}
        <div className="flex items-center justify-between">
          <div></div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filter Button with Popover */}
            <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Button
                    variant={filterApplied ? "default" : "outline"}
                    className={filterApplied ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 gap-2" : "gap-2"}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  {filterApplied && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Filter by Date Range</h4>
                    <p className="text-xs text-muted-foreground mb-4">Filter employees by their joining date</p>
                  </div>
                  
                  {/* Date Pickers */}
                  <div className="grid gap-3">
                    {/* From Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">From Date</label>
                      <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select from date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              setShowFromCalendar(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">To Date</label>
                      <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select to date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            selected={toDate}
                            onSelect={(date) => {
                              setToDate(date);
                              setShowToCalendar(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Selected Range Display */}
                  {(fromDate || toDate) && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {fromDate && toDate
                          ? `${format(fromDate, 'MMM dd, yyyy')} → ${format(toDate, 'MMM dd, yyyy')}`
                          : fromDate
                          ? `From ${format(fromDate, 'MMM dd, yyyy')}`
                          : `Until ${format(toDate!, 'MMM dd, yyyy')}`}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={applyFilter}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                      size="sm"
                    >
                      <Filter className="h-3 w-3 mr-2" />
                      Apply Filter
                    </Button>
                    <Button
                      onClick={() => {
                        clearDateFilters();
                        setShowFilterPopover(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >

                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => navigate('/bulk-upload')}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            
            <Button
              onClick={() => navigate('/add-employee')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add New Employee
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-none gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileDown className="mr-2 h-4 w-4 text-red-600" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Employees Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {filterApplied ? 'Total in Range' : 'Total Employees'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterApplied ? 'In selected range' : 'All employees'}
            </p>
          </CardContent>
        </Card>

        {/* New Joiners Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Joiners
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.joiners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterApplied ? 'Joined in range' : 'Apply filter to see'}
            </p>
          </CardContent>
        </Card>

        {/* Exits Card */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exits
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.exits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterApplied ? 'Inactive in range' : 'Total inactive'}
            </p>
          </CardContent>
        </Card>

        {/* Active Today Card */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Employees
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterApplied ? 'Active in range' : 'Currently active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Existing Employee List Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active Employees ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive Employees ({inactiveEmployees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Employees</CardTitle>
                  <CardDescription>
                    {filteredActiveEmployees.length} of {activeEmployees.length} employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees by name, ID, email, department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2 relative whitespace-nowrap">
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge variant="default" className="ml-1 px-1.5 py-0.5 text-xs">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Filter Employees</h4>
                          {activeFilterCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-8 text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        {/* Business Unit Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Business Unit</label>
                          <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Business Units" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Business Units</SelectItem>
                              {businessUnits.filter(u => u !== 'all').map((unit) => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {departments.filter(d => d !== 'all').map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Locations</SelectItem>
                              {locations.filter(l => l !== 'all').map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Designation Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Designation</label>
                          <Select value={designationFilter} onValueChange={setDesignationFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Designations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Designations</SelectItem>
                              {designations.filter(d => d !== 'all').map((des) => (
                                <SelectItem key={des} value={des}>{des}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Total Experience Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Total Experience</label>
                          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Experience</SelectItem>
                              {experienceRanges.filter(e => e !== 'all').map((exp) => (
                                <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted-color" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted-color rounded" />
                          <div className="h-3 w-24 bg-muted-color rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredActiveEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No employees found matching your search' : 'No active employees'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActiveEmployees.map((employee) => (
                    <EmployeeCard key={employee._id || employee.employeeId} employee={employee} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inactive Employees</CardTitle>
                  <CardDescription>
                    {filteredInactiveEmployees.length} of {inactiveEmployees.length} employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees by name, ID, email, department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2 relative whitespace-nowrap">
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge variant="default" className="ml-1 px-1.5 py-0.5 text-xs">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Filter Employees</h4>
                          {activeFilterCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-8 text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        {/* Business Unit Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Business Unit</label>
                          <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Business Units" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Business Units</SelectItem>
                              {businessUnits.filter(u => u !== 'all').map((unit) => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {departments.filter(d => d !== 'all').map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Locations</SelectItem>
                              {locations.filter(l => l !== 'all').map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Designation Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Designation</label>
                          <Select value={designationFilter} onValueChange={setDesignationFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Designations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Designations</SelectItem>
                              {designations.filter(d => d !== 'all').map((des) => (
                                <SelectItem key={des} value={des}>{des}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Total Experience Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Total Experience</label>
                          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Experience</SelectItem>
                              {experienceRanges.filter(e => e !== 'all').map((exp) => (
                                <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted-color" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted-color rounded" />
                          <div className="h-3 w-24 bg-muted-color rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredInactiveEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No employees found matching your search' : 'No inactive employees'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInactiveEmployees.map((employee) => (
                    <EmployeeCard key={employee._id || employee.employeeId} employee={employee} isInactive={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mark Inactive Confirmation Dialog */}
      <AlertDialog open={employeeToMarkInactive !== null} onOpenChange={(open) => !open && setEmployeeToMarkInactive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Employee as Inactive?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark <strong>{employeeToMarkInactive?.name}</strong> as inactive?
              Inactive employees will not appear in the employee directory but will remain visible to HR.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToMarkInactive(null)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkInactive} className="bg-orange-600 hover:bg-orange-700">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Employee Confirmation Dialog */}
      <AlertDialog open={employeeToDelete !== null} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the employee record for <strong>{employeeToDelete?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

