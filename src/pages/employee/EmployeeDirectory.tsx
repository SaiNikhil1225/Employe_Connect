import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import { 
  Search, Users, Filter, Columns3
} from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import type { Employee } from '@/services/employeeService';
import { employeeService } from '@/services/employeeService';
import { cn } from '@/lib/utils';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map());
  
  // Check if we're in RMG module
  const isRMGModule = location.pathname.includes('/rmg/');
  
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    designation: true,
    department: true,
    reportingManagerName: true,
    allocation: isRMGModule, // Show allocation only in RMG
    status: true,
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch allocations when in RMG module
  useEffect(() => {
    const fetchAllocations = async () => {
      if (isRMGModule) {
        try {
          const allocationData = await employeeService.getAllocations();
          const allocationMap = new Map(
            allocationData.map(item => [item.employeeId, item.allocation])
          );
          setAllocations(allocationMap);
        } catch (error) {
          console.error('Failed to fetch allocations:', error);
        }
      }
    };
    fetchAllocations();
  }, [isRMGModule]);

  // Extract unique values for filters
  const businessUnits = Array.from(new Set(employees.map(emp => emp.businessUnit).filter(Boolean)));
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));
  const locations = Array.from(new Set(employees.map(emp => emp.location).filter(Boolean)));
  const designations = Array.from(new Set(employees.map(emp => emp.designation).filter(Boolean)));
  const experienceRanges = ['0-2 years', '2-5 years', '5-10 years', '10+ years'];

  // Separate active and inactive employees
  const activeEmployees = employees.filter(emp => emp.status === 'active');

  // Filter employees based on search and all filters
  const filteredEmployees = activeEmployees.filter(emp => {
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
        ? Math.floor((currentTime - new Date(emp.dateOfJoining).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
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

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Define table columns for employee directory
  const employeeColumns: DataTableColumn<Employee>[] = [
    {
      key: 'name',
      label: 'Employee Name',
      sortable: true,
      align: 'left',
      hidden: !columnVisibility.name,
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
      hidden: !columnVisibility.designation,
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      align: 'left',
      hidden: !columnVisibility.department,
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
      hidden: !columnVisibility.reportingManagerName,
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    ...(isRMGModule ? [{
      key: 'allocation' as keyof Employee,
      label: 'Allocation',
      sortable: true,
      align: 'center' as const,
      hidden: !columnVisibility.allocation,
      render: (_value: unknown, employee: Employee) => {
        const allocationPercentage = allocations.get(employee.employeeId) || 0;
        
        const getColorClass = (percentage: number) => {
          if (percentage === 0) return 'bg-gray-100 text-gray-700 border-gray-300';
          if (percentage < 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
          if (percentage < 80) return 'bg-blue-100 text-blue-700 border-blue-300';
          return 'bg-green-100 text-green-700 border-green-300';
        };
        
        return (
          <Badge variant="outline" className={cn('font-medium', getColorClass(allocationPercentage))}>
            {allocationPercentage}%
          </Badge>
        );
      },
    }] : []),
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'left',
      hidden: !columnVisibility.status,
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

  // Define table actions - Only View Profile for Employee module
  const tableActions: DataTableAction<Employee>[] = [
    {
      label: 'View Profile',
      onClick: (employee) => {
        sessionStorage.setItem('profileReferrer', '/employee/directory');
        navigate(`/employee/profile/${employee.employeeId}`);
      },
      variant: 'default',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users className="h-7 w-7 text-primary" />
            Employee Directory
          </h1>
          <p className="page-description">Browse employee profiles and information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Showing {filteredEmployees.length} of {activeEmployees.length} employees
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Columns3 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer py-1.5 px-2"
                        >
                          <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('name')}>
                            <Checkbox
                              checked={columnVisibility.name}
                              onCheckedChange={() => toggleColumnVisibility('name')}
                              className="h-3.5 w-3.5"
                            />
                            <span className="flex-1 text-xs">Name</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer py-1.5 px-2"
                        >
                          <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('designation')}>
                            <Checkbox
                              checked={columnVisibility.designation}
                              onCheckedChange={() => toggleColumnVisibility('designation')}
                              className="h-3.5 w-3.5"
                            />
                            <span className="flex-1 text-xs">Designation</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer py-1.5 px-2"
                        >
                          <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('department')}>
                            <Checkbox
                              checked={columnVisibility.department}
                              onCheckedChange={() => toggleColumnVisibility('department')}
                              className="h-3.5 w-3.5"
                            />
                            <span className="flex-1 text-xs">Department</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer py-1.5 px-2"
                        >
                          <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('reportingManagerName')}>
                            <Checkbox
                              checked={columnVisibility.reportingManagerName}
                              onCheckedChange={() => toggleColumnVisibility('reportingManagerName')}
                              className="h-3.5 w-3.5"
                            />
                            <span className="flex-1 text-xs">Reporting Manager</span>
                          </div>
                        </DropdownMenuItem>
                        {isRMGModule && (
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('allocation')}>
                              <Checkbox
                                checked={columnVisibility.allocation}
                                onCheckedChange={() => toggleColumnVisibility('allocation')}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">Allocation</span>
                            </div>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer py-1.5 px-2"
                        >
                          <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility('status')}>
                            <Checkbox
                              checked={columnVisibility.status}
                              onCheckedChange={() => toggleColumnVisibility('status')}
                              className="h-3.5 w-3.5"
                            />
                            <span className="flex-1 text-xs">Status</span>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredEmployees}
                columns={employeeColumns}
                actions={tableActions}
                searchable={false}
                pageSize={15}
                hideColumnToggle={true}
                emptyMessage="No employees found"
                onRowClick={(employee) => {
                  sessionStorage.setItem('profileReferrer', '/employee/directory');
                  navigate(`/employee/profile/${employee.employeeId}`);
                }}
              />
            </CardContent>
          </Card>
    </div>
  );
}
