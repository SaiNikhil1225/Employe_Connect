import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Users, GitBranch, Building, Building2, MapPin, DollarSign, FileText, Mail, Phone, Briefcase, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import { cn } from '@/lib/utils';

// BACKUP FILE - Original Employees.tsx before consolidation
// Created on: 2026-02-11

// Local type for component use
interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  department: string;
  joiningDate: string;
  reportingManager: string;
  status: string;
  phone: string;
  avatar: string;
}

interface Filters {
  businessUnit: string;
  department: string;
  location: string;
  costCenter: string;
  legalEntity: string;
  search: string;
}

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
  const { employees: storeEmployees, isLoading, fetchEmployees } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState('directory');
  const [filters, setFilters] = useState<Filters>({
    businessUnit: '',
    department: '',
    location: '',
    costCenter: '',
    legalEntity: '',
    search: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Map store employees to component format
  const employees = storeEmployees.map(emp => ({
    id: emp._id || emp.employeeId,
    name: emp.name,
    email: emp.email,
    employeeId: emp.employeeId,
    role: emp.designation,
    department: emp.department,
    joiningDate: emp.dateOfJoining,
    reportingManager: emp.reportingManager?.name || 'CEO',
    status: emp.status,
    phone: emp.phone,
    avatar: emp.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`,
  }));

  // Extract unique filter values
  const businessUnits = ['All', 'Technology', 'Marketing & Sales', 'Finance & Operations', 'Human Resources'];
  const departments = ['All', ...new Set(employees.map(e => e.department))];
  const locations = ['All', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Chicago, IL', 'Seattle, WA'];
  const costCenters = ['All', 'CC-001', 'CC-002', 'CC-003', 'CC-004', 'CC-005'];
  const legalEntities = ['All', 'Company Inc.', 'Company LLC', 'Company Corp'];

  // Filter employees (exclude inactive employees from directory)
  const filteredEmployees = employees.filter((emp) => {
    // Only show active employees in the directory
    const isActive = emp.status === 'active';
    
    const matchesBusinessUnit = !filters.businessUnit || filters.businessUnit === 'All';
    const matchesDepartment = !filters.department || filters.department === 'All' || emp.department === filters.department;
    const matchesLocation = !filters.location || filters.location === 'All';
    const matchesCostCenter = !filters.costCenter || filters.costCenter === 'All';
    const matchesLegalEntity = !filters.legalEntity || filters.legalEntity === 'All';
    const matchesSearch = !filters.search || 
      emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      emp.role.toLowerCase().includes(filters.search.toLowerCase());

    return isActive && matchesBusinessUnit && matchesDepartment && matchesLocation && 
           matchesCostCenter && matchesLegalEntity && matchesSearch;
  });

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
    });
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
                      placeholder="Search by name, email, or role..."
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

                {/* Cost Center */}
                <FilterDropdown
                  icon={DollarSign}
                  label="Cost Center"
                  options={costCenters}
                  value={filters.costCenter}
                  onChange={(val) => handleFilterChange('costCenter', val)}
                />

                {/* Legal Entity */}
                <FilterDropdown
                  icon={FileText}
                  label="Legal Entity"
                  options={legalEntities}
                  value={filters.legalEntity}
                  onChange={(val) => handleFilterChange('legalEntity', val)}
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
          </div>

          {/* Employee Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-muted-color" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted-color rounded w-3/4" />
                        <div className="h-4 bg-muted-color rounded w-1/2" />
                        <div className="h-3 bg-muted-color rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredEmployees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}

          {!isLoading && filteredEmployees.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No employees found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </CardContent>
            </Card>
          )}
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
}

function FilterDropdown({ icon: Icon, label, options, value, onChange }: FilterDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md bg-background"
      >
        <option value="">All</option>
        {options.filter(opt => opt !== 'All').map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Employee Card Component
function EmployeeCard({ employee }: { employee: Employee }) {
  const navigate = useNavigate();

  const getStatusBadge = (status?: string) => {
    const actualStatus = status || 'active';
    return actualStatus.toLowerCase() === 'active'
      ? 'bg-brand-green-light text-brand-green dark:bg-brand-green/20 dark:text-brand-green-light'
      : 'bg-gray-100 text-brand-slate dark:bg-gray-800 dark:text-gray-400';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Not specified';
    }
  };

  return (
    <Card
      className="group relative border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      onClick={() => navigate(`/employee/profile/${employee.employeeId}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/employee/profile/${employee.employeeId}`)}
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${employee.name}'s profile`}
    >
      <CardContent className="p-5">
        {/* Header: Name + Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {employee.name}
            </h3>
          </div>
          <Badge
            className={cn(
              'text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0',
              getStatusBadge(employee.status)
            )}
          >
            {employee.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Designation */}
        <p className="text-xs text-brand-slate dark:text-gray-400 mb-4">
          {employee.role}
        </p>

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold border-2 border-border">
              {employee.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2.5">
          {/* Department */}
          <div className="flex items-start gap-2">
            <Building
              className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
              aria-label="Department"
            />
            <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
              {employee.department || 'Not specified'}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-start gap-2">
            <Mail
              className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
              aria-label="Email"
            />
            <span className="text-xs text-muted-foreground break-all leading-relaxed">
              {employee.email}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-2">
            <Phone
              className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
              aria-label="Phone"
            />
            <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
              {employee.phone || 'Not specified'}
            </span>
          </div>

          {/* Joining Date */}
          <div className="flex items-start gap-2">
            <Calendar
              className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
              aria-label="Joining Date"
            />
            <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
              {formatDate(employee.joiningDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
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
        avatar: emp.name.split(' ').map(n => n[0]).join('').toUpperCase(),
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
