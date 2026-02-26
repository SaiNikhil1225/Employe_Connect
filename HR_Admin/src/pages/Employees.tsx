import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, GitBranch, Building, Building2, MapPin, Mail, Phone, Briefcase, ChevronDown, ChevronRight, Calendar, MoreVertical, Eye, Trash2, UserX, UserCheck, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ExportColumnSelector from '@/components/employee/ExportColumnSelector';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { getInitials } from '@/constants/design-system';
import { 
  getExperienceBreakdown, 
  EXPERIENCE_CATEGORIES, 
  filterByExperience 
} from '@/lib/experienceUtils';
import { exportToExcel, exportToCSV, exportToPDF } from '@/lib/employeeExportService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// Local type for component use
interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  firstName?: string;
  lastName?: string;
  role: string;
  department: string;
  joiningDate: string;
  dateOfJoining?: string;
  reportingManager: string;
  status: string;
  phone: string;
  location?: string;
  avatar?: string;
  profilePhoto?: string;
  previousExperience?: {
    years?: number;
    months?: number;
  };
}

interface Filters {
  businessUnit: string;
  department: string;
  location: string;
  costCenter: string;
  legalEntity: string;
  search: string;
  previousExperience: string;
  acuvateExperience: string;
}

type SortField = 'employeeId' | 'name' | 'designation' | 'department' | 'location' | 'previousExp' | 'acuvateExp' | 'totalExp';
type SortOrder = 'asc' | 'desc' | null;

interface TreeNode {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  children: TreeNode[];
}

export function Employees() {
  const navigate = useNavigate();
  const { employees: storeEmployees, isLoading, fetchEmployees, deleteEmployee, markInactive, activateEmployee } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState('directory');
  const [statusTab, setStatusTab] = useState('active');
  const [filters, setFilters] = useState<Filters>({
    businessUnit: '',
    department: '',
    location: '',
    costCenter: '',
    legalEntity: '',
    search: '',
    previousExperience: 'all',
    acuvateExperience: 'all',
  });
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [showExportSelector, setShowExportSelector] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Map store employees to component format with experience data
  const employees = useMemo(() => storeEmployees.map(emp => ({
    id: emp._id || emp.employeeId,
    employeeId: emp.employeeId,
    name: emp.name,
    email: emp.employeeId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    role: emp.designation,
    department: emp.department,
    joiningDate: emp.dateOfJoining,
    dateOfJoining: emp.dateOfJoining,
    location: emp.location || 'Not specified',
    reportingManager: emp.reportingManager?.name || 'CEO',
    status: emp.status,
    phone: emp.phone,
    avatar: emp.profilePhoto,
    profilePhoto: emp.profilePhoto,
    previousExperience: emp.previousExperience,
  })), [storeEmployees]);

  // Extract unique filter values
  const businessUnits = ['All', 'Technology', 'Marketing & Sales', 'Finance & Operations', 'Human Resources'];
  const departments = ['All', ...new Set(employees.map(e => e.department))];
  const locations = ['All', ...new Set(employees.map(e => e.location).filter(Boolean))];

  // Filter and sort employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      // Show employees based on selected status tab
      const matchesStatus = statusTab === 'active' 
        ? emp.status === 'active' 
        : emp.status !== 'active';
      
      const matchesBusinessUnit = !filters.businessUnit || filters.businessUnit === 'All';
      const matchesDepartment = !filters.department || filters.department === 'All' || emp.department === filters.department;
      const matchesLocation = !filters.location || filters.location === 'All' || emp.location === filters.location;
      const matchesSearch = !filters.search || 
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.role.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(filters.search.toLowerCase());

      // Experience filtering
      const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
      const matchesPreviousExp = filterByExperience(
        experienceData.previousExperience.totalMonths,
        filters.previousExperience
      );
      const matchesAcuvateExp = filterByExperience(
        experienceData.acuvateExperience.totalMonths,
        filters.acuvateExperience
      );

      return matchesStatus && matchesBusinessUnit && matchesDepartment && matchesLocation && 
             matchesSearch && matchesPreviousExp && matchesAcuvateExp;
    });

    // Sorting
    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'employeeId':
            aValue = a.employeeId;
            bValue = b.employeeId;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'designation':
            aValue = a.role;
            bValue = b.role;
            break;
          case 'department':
            aValue = a.department;
            bValue = b.department;
            break;
          case 'location':
            aValue = a.location || '';
            bValue = b.location || '';
            break;
          case 'previousExp':
            aValue = getExperienceBreakdown(a.previousExperience, a.dateOfJoining).previousExperience.totalMonths;
            bValue = getExperienceBreakdown(b.previousExperience, b.dateOfJoining).previousExperience.totalMonths;
            break;
          case 'acuvateExp':
            aValue = getExperienceBreakdown(a.previousExperience, a.dateOfJoining).acuvateExperience.totalMonths;
            bValue = getExperienceBreakdown(b.previousExperience, b.dateOfJoining).acuvateExperience.totalMonths;
            break;
          case 'totalExp':
            aValue = getExperienceBreakdown(a.previousExperience, a.dateOfJoining).totalExperience.totalMonths;
            bValue = getExperienceBreakdown(b.previousExperience, b.dateOfJoining).totalExperience.totalMonths;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [employees, statusTab, filters, sortField, sortOrder]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      businessUnit: '',
      department: '',
      location: '',
      costCenter: '',
      legalEntity: '',
      search: '',
      previousExperience: 'all',
      acuvateExperience: 'all',
    });
    setSortField(null);
    setSortOrder(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order: asc -> desc -> null
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const handleDelete = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployeeToDelete(employee);
  };

  const handleViewProfile = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/employee/profile/${employee.employeeId}`);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    const storeEmp = storeEmployees.find(emp => emp.employeeId === employeeToDelete.employeeId);
    if (!storeEmp?._id) return;

    try {
      await deleteEmployee(storeEmp._id);
      toast.success(`${employeeToDelete.name} deleted successfully`);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete employee');
    }
  };

  const handleToggleStatus = async (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    const storeEmp = storeEmployees.find(emp => emp.employeeId === employee.employeeId);
    if (!storeEmp?._id) return;

    try {
      if (employee.status === 'active') {
        await markInactive(storeEmp._id);
        toast.success(`${employee.name} marked as inactive`);
      } else {
        await activateEmployee(storeEmp._id);
        toast.success(`${employee.name} reactivated`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update employee status');
    }
  };

  const handleExportClick = (format: 'excel' | 'csv' | 'pdf') => {
    if (filteredEmployees.length === 0) {
      toast.error('No employees to export');
      return;
    }
    setExportFormat(format);
    setShowExportSelector(true);
  };

  const handleExportWithColumns = (selectedColumns: string[], format: 'excel' | 'csv' | 'pdf') => {
    const exportData = filteredEmployees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      designation: emp.role,
      department: emp.department,
      location: emp.location,
      email: emp.email,
      phone: emp.phone,
      dateOfJoining: emp.dateOfJoining,
      status: emp.status,
      previousExperience: emp.previousExperience,
    }));

    const filename = `employee_directory_${statusTab}`;

    try {
      switch (format) {
        case 'excel':
          exportToExcel(exportData, filename, selectedColumns);
          toast.success(`Exported ${filteredEmployees.length} employees to Excel`);
          break;
        case 'csv':
          exportToCSV(exportData, filename, selectedColumns);
          toast.success(`Exported ${filteredEmployees.length} employees to CSV`);
          break;
        case 'pdf':
          exportToPDF(exportData, selectedColumns);
          toast.success(`Preparing PDF export...`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export employees');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users className="h-7 w-7 text-primary" />
            Employees
          </h1>
          <p className="page-description">Browse employee directory and organization structure</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Directory
          </TabsTrigger>
          <TabsTrigger value="orgtree" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Organization Tree
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div className="lg:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, ID, or role..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Business Unit */}
                <FilterDropdown
                  icon={Building2}
                  label="Business Unit"
                  options={businessUnits}
                  value={filters.businessUnit}
                  onChange={(val) => handleFilterChange('businessUnit', val)}
                />

                {/* Department */}
                <FilterDropdown
                  icon={Building}
                  label="Department"
                  options={departments}
                  value={filters.department}
                  onChange={(val) => handleFilterChange('department', val)}
                />

                {/* Location */}
                <FilterDropdown
                  icon={MapPin}
                  label="Location"
                  options={locations}
                  value={filters.location}
                  onChange={(val) => handleFilterChange('location', val)}
                />

                {/* Previous Experience */}
                <FilterDropdown
                  icon={Briefcase}
                  label="Previous Experience"
                  options={EXPERIENCE_CATEGORIES.map(cat => cat.label)}
                  value={filters.previousExperience}
                  onChange={(val) => {
                    const category = EXPERIENCE_CATEGORIES.find(cat => cat.label === val);
                    handleFilterChange('previousExperience', category?.value || 'all');
                  }}
                  valueMap={Object.fromEntries(EXPERIENCE_CATEGORIES.map(cat => [cat.label, cat.value]))}
                />

                {/* Acuvate Experience */}
                <FilterDropdown
                  icon={Calendar}
                  label="Acuvate Experience"
                  options={EXPERIENCE_CATEGORIES.map(cat => cat.label)}
                  value={filters.acuvateExperience}
                  onChange={(val) => {
                    const category = EXPERIENCE_CATEGORIES.find(cat => cat.label === val);
                    handleFilterChange('acuvateExperience', category?.value || 'all');
                  }}
                  valueMap={Object.fromEntries(EXPERIENCE_CATEGORIES.map(cat => [cat.label, cat.value]))}
                />

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportClick('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportClick('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportClick('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active/Inactive Tabs */}
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">Active Employees</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Employees</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : filteredEmployees.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No active employees found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Avatar</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('employeeId')}
                                className="flex items-center hover:text-primary"
                              >
                                Employee ID
                                {getSortIcon('employeeId')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('name')}
                                className="flex items-center hover:text-primary"
                              >
                                Name
                                {getSortIcon('name')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('designation')}
                                className="flex items-center hover:text-primary"
                              >
                                Designation
                                {getSortIcon('designation')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('department')}
                                className="flex items-center hover:text-primary"
                              >
                                Department
                                {getSortIcon('department')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('location')}
                                className="flex items-center hover:text-primary"
                              >
                                Location
                                {getSortIcon('location')}
                              </button>
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('previousExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Previous Exp
                                {getSortIcon('previousExp')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('acuvateExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Acuvate Exp
                                {getSortIcon('acuvateExp')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('totalExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Total Exp
                                {getSortIcon('totalExp')}
                              </button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.map((employee) => {
                            const experienceData = getExperienceBreakdown(
                              employee.previousExperience,
                              employee.dateOfJoining
                            );

                            return (
                              <TableRow
                                key={employee.id}
                                className="cursor-pointer"
                                onClick={() => navigate(`/employee/profile/${employee.employeeId}`)}
                              >
                                <TableCell>
                                  <EmployeeAvatar
                                    employee={{
                                      employeeId: employee.employeeId,
                                      name: employee.name,
                                      firstName: employee.firstName,
                                      lastName: employee.lastName,
                                      profilePhoto: employee.profilePhoto,
                                    }}
                                    size="md"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{employee.employeeId}</TableCell>
                                <TableCell className="font-semibold">{employee.name}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>{employee.location}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {employee.email || 'Not specified'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {employee.phone || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {experienceData.previousExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {experienceData.acuvateExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-semibold text-primary">
                                    {experienceData.totalExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                                    className={cn(
                                      employee.status === 'active' && 'bg-green-500 hover:bg-green-600'
                                    )}
                                  >
                                    {employee.status}
                                  </Badge>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => handleViewProfile(employee, e)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Profile
                                      </DropdownMenuItem>
                                      {employee.status === 'active' ? (
                                        <DropdownMenuItem onClick={(e) => handleToggleStatus(employee, e)} className="text-orange-600">
                                          <UserX className="mr-2 h-4 w-4" />
                                          Mark Inactive
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={(e) => handleToggleStatus(employee, e)} className="text-green-600">
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          Reactivate
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={(e) => handleDelete(employee, e)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-6">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : filteredEmployees.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No inactive employees found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Avatar</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('employeeId')}
                                className="flex items-center hover:text-primary"
                              >
                                Employee ID
                                {getSortIcon('employeeId')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('name')}
                                className="flex items-center hover:text-primary"
                              >
                                Name
                                {getSortIcon('name')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('designation')}
                                className="flex items-center hover:text-primary"
                              >
                                Designation
                                {getSortIcon('designation')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('department')}
                                className="flex items-center hover:text-primary"
                              >
                                Department
                                {getSortIcon('department')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('location')}
                                className="flex items-center hover:text-primary"
                              >
                                Location
                                {getSortIcon('location')}
                              </button>
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('previousExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Previous Exp
                                {getSortIcon('previousExp')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('acuvateExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Acuvate Exp
                                {getSortIcon('acuvateExp')}
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('totalExp')}
                                className="flex items-center hover:text-primary"
                              >
                                Total Exp
                                {getSortIcon('totalExp')}
                              </button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.map((employee) => {
                            const experienceData = getExperienceBreakdown(
                              employee.previousExperience,
                              employee.dateOfJoining
                            );

                            return (
                              <TableRow
                                key={employee.id}
                                className="cursor-pointer"
                                onClick={() => navigate(`/employee/profile/${employee.employeeId}`)}
                              >
                                <TableCell>
                                  <EmployeeAvatar
                                    employee={{
                                      employeeId: employee.employeeId,
                                      name: employee.name,
                                      firstName: employee.firstName,
                                      lastName: employee.lastName,
                                      profilePhoto: employee.profilePhoto,
                                    }}
                                    size="md"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{employee.employeeId}</TableCell>
                                <TableCell className="font-semibold">{employee.name}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>{employee.location}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {employee.email || 'Not specified'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {employee.phone || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {experienceData.previousExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {experienceData.acuvateExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-semibold text-primary">
                                    {experienceData.totalExperience.formatted}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                                    className={cn(
                                      employee.status === 'active' && 'bg-gray-500 hover:bg-gray-600'
                                    )}
                                  >
                                    {employee.status}
                                  </Badge>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => handleViewProfile(employee, e)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Profile
                                      </DropdownMenuItem>
                                      {employee.status === 'active' ? (
                                        <DropdownMenuItem onClick={(e) => handleToggleStatus(employee, e)} className="text-orange-600">
                                          <UserX className="mr-2 h-4 w-4" />
                                          Mark Inactive
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={(e) => handleToggleStatus(employee, e)} className="text-green-600">
                                          <UserCheck className="mr-2 h-4 w-4" />
                                          Reactivate
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={(e) => handleDelete(employee, e)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

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

      {/* Export Column Selector */}
      <ExportColumnSelector
        open={showExportSelector}
        onClose={() => setShowExportSelector(false)}
        onExport={handleExportWithColumns}
        format={exportFormat}
      />

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

// Filter Dropdown Component
interface FilterDropdownProps {
  icon: React.ElementType;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  valueMap?: Record<string, string>;
}

function FilterDropdown({ icon: Icon, label, options, value, onChange, valueMap }: FilterDropdownProps) {
  const displayValue = valueMap 
    ? Object.keys(valueMap).find(key => valueMap[key] === value) || 'All Experience'
    : value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <select
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md bg-background"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Detail Row Component (used in organization tree)
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

// Organization Tree Component
function OrganizationTree({ employees }: { employees: Employee[] }) {
  // Build tree structure based on reporting relationships
  const buildTree = (): TreeNode[] => {
    const employeeMap = new Map<string, TreeNode>();
    
    // Create nodes
    employees.forEach(emp => {
      employeeMap.set(emp.name, {
        id: emp.id,
        name: emp.name,
        title: emp.role,
        department: emp.department,
        email: emp.email,
        phone: emp.phone || 'N/A',
        avatar: getInitials(emp.name),
        children: [],
      });
    });

    const roots: TreeNode[] = [];

    // Build parent-child relationships
    employees.forEach(emp => {
      const node = employeeMap.get(emp.name);
      if (!node) return;

      if (emp.reportingManager === 'CEO' || !emp.reportingManager) {
        roots.push(node);
      } else {
        const parent = employeeMap.get(emp.reportingManager);
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
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                {node.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate group-hover:text-white">{node.name}</p>
                <p className="text-sm text-muted-foreground truncate group-hover:text-white/80">{node.title}</p>
              </div>
              <Badge variant="outline" className="group-hover:bg-white/10 group-hover:text-white group-hover:border-white/30">{node.department}</Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {node.avatar}
                </div>
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
