import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import { 
  Search, Users, GitBranch, Building, Mail, Phone,
  ChevronDown, ChevronRight, Filter, Eye
} from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import type { Employee } from '@/services/employeeService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
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

interface TreeNode {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  employee: {
    employeeId: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
  };
  children: TreeNode[];
}

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const { permissions } = useProfile();
  const { employees, isLoading, fetchEmployees, deleteEmployee } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Extract unique values for filters
  const businessUnits = Array.from(new Set(employees.map(emp => emp.businessUnit).filter(Boolean)));
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));
  const locations = Array.from(new Set(employees.map(emp => emp.location).filter(Boolean)));
  const designations = Array.from(new Set(employees.map(emp => emp.designation).filter(Boolean)));
  const experienceRanges = ['0-2 years', '2-5 years', '5-10 years', '10+ years'];

  // Separate active and inactive employees
  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');

  // Filter employees based on search and all filters
  const getFilteredEmployees = (empList: Employee[]) => {
    return empList.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBusinessUnit = selectedBusinessUnits.length === 0 || selectedBusinessUnits.includes(emp.businessUnit);
      const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(emp.department);
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(emp.location);
      const matchesDesignation = selectedDesignations.length === 0 || selectedDesignations.includes(emp.designation);
      
      // Calculate total experience
      const previousYears = typeof emp.previousExperience === 'number' 
        ? emp.previousExperience 
        : (emp.previousExperience?.years || 0);
      const acuvateYears = emp.dateOfJoining 
        ? Math.floor((Date.now() - new Date(emp.dateOfJoining).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;
      const totalExperience = previousYears + acuvateYears;
      
      const matchesExperience = selectedExperiences.length === 0 || selectedExperiences.some(range => {
        if (range === '0-2 years') return totalExperience <= 2;
        if (range === '2-5 years') return totalExperience > 2 && totalExperience <= 5;
        if (range === '5-10 years') return totalExperience > 5 && totalExperience <= 10;
        if (range === '10+ years') return totalExperience > 10;
        return false;
      });
      
      return matchesSearch && matchesBusinessUnit && matchesDepartment && matchesLocation && matchesDesignation && matchesExperience;
    });
  };

  // Count active filters
  const activeFilterCount = selectedBusinessUnits.length + selectedDepartments.length + 
    selectedLocations.length + selectedDesignations.length + selectedExperiences.length;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBusinessUnits([]);
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedDesignations([]);
    setSelectedExperiences([]);
  };

  // Toggle checkbox selection
  const toggleFilter = (value: string, selectedArray: string[], setterFunction: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedArray.includes(value)) {
      setterFunction(selectedArray.filter(item => item !== value));
    } else {
      setterFunction([...selectedArray, value]);
    }
  };

  const filteredActiveEmployees = getFilteredEmployees(activeEmployees);
  const filteredInactiveEmployees = getFilteredEmployees(inactiveEmployees);

  const confirmDelete = async () => {
    if (!employeeToDelete?._id) return;

    try {
      await deleteEmployee(employeeToDelete._id);
      toast.success(`${employeeToDelete.name} deleted successfully`);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete employee');
    }
  };

  // Define table columns for employee directory
  const employeeColumns: DataTableColumn<Employee>[] = [
    {
      key: 'name',
      label: 'Employee Name',
      sortable: true,
      align: 'left',
      render: (_, employee) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar 
            employee={{
              employeeId: employee.employeeId,
              name: employee.name,
              firstName: employee.firstName,
              lastName: employee.lastName,
              profilePhoto: employee.profilePhoto,
            }}
            size="sm"
          />
          <div>
            <div className="font-medium text-foreground">{employee.name}</div>
            <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      align: 'left',
      render: (value) => (
        <Badge variant="outline" className="font-normal">
          {value || '-'}
        </Badge>
      ),
    },
    {
      key: 'reportingManagerName',
      label: 'Reporting Manager',
      sortable: true,
      align: 'left',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      render: (value) => {
        const statusColors = {
          active: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400',
          inactive: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400',
          'on leave': 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400',
          probation: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400',
        };
        const status = (value || 'inactive').toLowerCase();
        const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.inactive;
        return (
          <Badge variant="outline" className={cn('font-medium', colorClass)}>
            {(value || 'Inactive').charAt(0).toUpperCase() + (value || 'inactive').slice(1)}
          </Badge>
        );
      },
    },
  ];

  // Define table actions
  const tableActions: DataTableAction<Employee>[] = [
    {
      label: 'View Profile',
      onClick: (employee) => navigate(`/employee/profile/${employee.employeeId}`),
      variant: 'default',
    },
    ...(permissions.canDeleteEmployees ? [{
      label: 'Delete',
      onClick: (employee: Employee) => setEmployeeToDelete(employee),
      variant: 'destructive' as const,
    }] : []),
  ];

  return (
    <div className="page-container">
      {/* View-Only Banner for HR User */}
      {permissions.isHRUser && (
        <div className="mb-4 p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">View-Only Mode</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You can view employee information but cannot add, edit, or delete. Switch to HR Admin mode in the header to perform these actions.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users className="h-7 w-7 text-primary" />
            Employee Directory & Management
          </h1>
          <p className="page-description">Browse and manage employee profiles and information</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Employees ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Inactive Employees ({inactiveEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="orgtree" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Organization Tree
          </TabsTrigger>
        </TabsList>

        {/* Active Employees Tab */}
        <TabsContent value="active" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Employees</CardTitle>
                  <CardDescription>
                    Showing {filteredActiveEmployees.length} of {activeEmployees.length} employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <Filter className="h-4 w-4" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Filters</h4>
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

                        <Accordion type="multiple" className="w-full">
                          {/* Business Unit Filter */}
                          {businessUnits.length > 0 && (
                            <AccordionItem value="business-unit">
                              <AccordionTrigger className="text-sm font-medium">
                                Business Unit {selectedBusinessUnits.length > 0 && `(${selectedBusinessUnits.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {businessUnits.map((unit) => (
                                    <div key={unit} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`bu-${unit}`}
                                        checked={selectedBusinessUnits.includes(unit)}
                                        onCheckedChange={() => toggleFilter(unit, selectedBusinessUnits, setSelectedBusinessUnits)}
                                      />
                                      <label
                                        htmlFor={`bu-${unit}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {unit}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Department Filter */}
                          {departments.length > 0 && (
                            <AccordionItem value="department">
                              <AccordionTrigger className="text-sm font-medium">
                                Department {selectedDepartments.length > 0 && `(${selectedDepartments.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {departments.map((dept) => (
                                    <div key={dept} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`dept-${dept}`}
                                        checked={selectedDepartments.includes(dept)}
                                        onCheckedChange={() => toggleFilter(dept, selectedDepartments, setSelectedDepartments)}
                                      />
                                      <label
                                        htmlFor={`dept-${dept}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {dept}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Location Filter */}
                          {locations.length > 0 && (
                            <AccordionItem value="location">
                              <AccordionTrigger className="text-sm font-medium">
                                Location {selectedLocations.length > 0 && `(${selectedLocations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {locations.map((loc) => (
                                    <div key={loc} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`loc-${loc}`}
                                        checked={selectedLocations.includes(loc)}
                                        onCheckedChange={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                                      />
                                      <label
                                        htmlFor={`loc-${loc}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {loc}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Designation Filter */}
                          {designations.length > 0 && (
                            <AccordionItem value="designation">
                              <AccordionTrigger className="text-sm font-medium">
                                Designation {selectedDesignations.length > 0 && `(${selectedDesignations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {designations.map((des) => (
                                    <div key={des} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`des-${des}`}
                                        checked={selectedDesignations.includes(des)}
                                        onCheckedChange={() => toggleFilter(des, selectedDesignations, setSelectedDesignations)}
                                      />
                                      <label
                                        htmlFor={`des-${des}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {des}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Total Experience Filter */}
                          <AccordionItem value="experience">
                            <AccordionTrigger className="text-sm font-medium">
                              Total Experience {selectedExperiences.length > 0 && `(${selectedExperiences.length})`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {experienceRanges.map((range) => (
                                  <div key={range} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`exp-${range}`}
                                      checked={selectedExperiences.includes(range)}
                                      onCheckedChange={() => toggleFilter(range, selectedExperiences, setSelectedExperiences)}
                                    />
                                    <label
                                      htmlFor={`exp-${range}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {range}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredActiveEmployees}
                columns={employeeColumns}
                actions={tableActions}
                searchable={false}
                pageSize={15}
                emptyMessage="No active employees found"
                onRowClick={(employee) => navigate(`/employee/profile/${employee.employeeId}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Employees Tab */}
        <TabsContent value="inactive" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inactive Employees</CardTitle>
                  <CardDescription>
                    Showing {filteredInactiveEmployees.length} of {inactiveEmployees.length} employees
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <Filter className="h-4 w-4" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Filters</h4>
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

                        <Accordion type="multiple" className="w-full">
                          {/* Business Unit Filter */}
                          {businessUnits.length > 0 && (
                            <AccordionItem value="business-unit">
                              <AccordionTrigger className="text-sm font-medium">
                                Business Unit {selectedBusinessUnits.length > 0 && `(${selectedBusinessUnits.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {businessUnits.map((unit) => (
                                    <div key={unit} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`bu-inactive-${unit}`}
                                        checked={selectedBusinessUnits.includes(unit)}
                                        onCheckedChange={() => toggleFilter(unit, selectedBusinessUnits, setSelectedBusinessUnits)}
                                      />
                                      <label
                                        htmlFor={`bu-inactive-${unit}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {unit}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Department Filter */}
                          {departments.length > 0 && (
                            <AccordionItem value="department">
                              <AccordionTrigger className="text-sm font-medium">
                                Department {selectedDepartments.length > 0 && `(${selectedDepartments.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {departments.map((dept) => (
                                    <div key={dept} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`dept-inactive-${dept}`}
                                        checked={selectedDepartments.includes(dept)}
                                        onCheckedChange={() => toggleFilter(dept, selectedDepartments, setSelectedDepartments)}
                                      />
                                      <label
                                        htmlFor={`dept-inactive-${dept}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {dept}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Location Filter */}
                          {locations.length > 0 && (
                            <AccordionItem value="location">
                              <AccordionTrigger className="text-sm font-medium">
                                Location {selectedLocations.length > 0 && `(${selectedLocations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {locations.map((loc) => (
                                    <div key={loc} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`loc-inactive-${loc}`}
                                        checked={selectedLocations.includes(loc)}
                                        onCheckedChange={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                                      />
                                      <label
                                        htmlFor={`loc-inactive-${loc}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {loc}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Designation Filter */}
                          {designations.length > 0 && (
                            <AccordionItem value="designation">
                              <AccordionTrigger className="text-sm font-medium">
                                Designation {selectedDesignations.length > 0 && `(${selectedDesignations.length})`}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {designations.map((des) => (
                                    <div key={des} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`des-inactive-${des}`}
                                        checked={selectedDesignations.includes(des)}
                                        onCheckedChange={() => toggleFilter(des, selectedDesignations, setSelectedDesignations)}
                                      />
                                      <label
                                        htmlFor={`des-inactive-${des}`}
                                        className="text-sm cursor-pointer flex-1"
                                      >
                                        {des}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Total Experience Filter */}
                          <AccordionItem value="experience">
                            <AccordionTrigger className="text-sm font-medium">
                              Total Experience {selectedExperiences.length > 0 && `(${selectedExperiences.length})`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {experienceRanges.map((range) => (
                                  <div key={range} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`exp-inactive-${range}`}
                                      checked={selectedExperiences.includes(range)}
                                      onCheckedChange={() => toggleFilter(range, selectedExperiences, setSelectedExperiences)}
                                    />
                                    <label
                                      htmlFor={`exp-inactive-${range}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {range}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredInactiveEmployees}
                columns={employeeColumns}
                actions={tableActions}
                searchable={false}
                pageSize={15}
                emptyMessage="No inactive employees found"
                onRowClick={(employee) => navigate(`/employee/profile/${employee.employeeId}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tree Tab*/}
        <TabsContent value="orgtree" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Organization Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-lg animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted-color" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted-color rounded w-1/3" />
                          <div className="h-3 bg-muted-color rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <OrganizationTree employees={employees} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Organization Tree Component
function OrganizationTree({ employees }: { employees: Employee[] }) {
  const buildTree = (): TreeNode[] => {
    const employeeMap = new Map<string, TreeNode>();
    
    employees.forEach(emp => {
      employeeMap.set(emp.name, {
        id: emp._id || emp.employeeId,
        name: emp.name,
        title: emp.designation,
        department: emp.department,
        email: emp.email,
        phone: emp.phone || 'N/A',
        employee: {
          employeeId: emp.employeeId,
          name: emp.name,
          firstName: emp.firstName,
          lastName: emp.lastName,
          profilePhoto: emp.profilePhoto,
        },
        children: [],
      });
    });

    const roots: TreeNode[] = [];

    employees.forEach(emp => {
      const node = employeeMap.get(emp.name);
      if (!node) return;

      if (!emp.reportingManager || emp.reportingManager.name === 'CEO') {
        roots.push(node);
      } else {
        const parent = employeeMap.get(emp.reportingManager.name);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  };

  const tree = buildTree();

  return (
    <div className="space-y-2">
      {tree.map(node => (
        <TreeNodeComponent key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}

function TreeNodeComponent({ node, level }: { node: TreeNode; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  return (
    <div className="space-y-2">
      <div
        className="group flex items-center gap-2 p-3 border rounded-lg hover:bg-primary hover:border-primary transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {node.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-background/20 rounded transition-colors group-hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {node.children.length === 0 && <div className="w-6" />}
        
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-90">
              <EmployeeAvatar
                employee={node.employee}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate group-hover:text-white">{node.name}</p>
                <p className="text-sm text-muted-foreground truncate group-hover:text-white/80">{node.title}</p>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-white/70">{node.department}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <EmployeeAvatar
                  employee={node.employee}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{node.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{node.title}</p>
                </div>
              </div>
              <div className="space-y-3">
                <DetailRow icon={Mail} label="Email" value={node.email} />
                <DetailRow icon={Phone} label="Phone" value={node.phone} />
                <DetailRow icon={Building} label="Department" value={node.department} />
                <DetailRow icon={Users} label="Direct Reports" value={node.children.length.toString()} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map(child => (
            <TreeNodeComponent key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="p-1.5 rounded-md bg-primary/10 text-primary mt-0.5">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
