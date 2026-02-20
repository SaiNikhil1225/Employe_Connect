import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Plus, FileText, DollarSign, Users, BarChart3, ArrowLeft, CalendarIcon, X, Check, ChevronsUpDown, FilterX, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectHeader } from './components/ProjectHeader';
import { ResourceTable } from './components/ResourceTable';
import { AddResourceToFLDrawer } from '../financial-lines/components/AddResourceToFLDrawer';

// General Info Sub-tabs
import { FieldsTab } from './tabs/general/FieldsTab';
import { CustomerInfoTab } from './tabs/general/CustomerInfoTab';

// Financials Sub-tabs
import { FinancialSummaryTab } from './tabs/financials/FinancialSummaryTab';
import { CustomerPOTab } from './tabs/financials/CustomerPOTab';
import { MarginDetailsTab, FLSTab, PlannedCostsTab, ActualCostsTab, RevenueDetailsTab } from './tabs/financials/FinancialsSubTabs';

// Components
import { ComingSoon } from './components/ComingSoon';

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById } = useProjectStore();
  const { pos, fetchPOs } = useCustomerPOStore();
  const [isInitialLoading, setIsInitialLoading] = useState(!selectedProject);
  const [primaryTab, setPrimaryTab] = useState('general');
  const [generalSubTab, setGeneralSubTab] = useState('fields');
  const [financialSubTab, setFinancialSubTab] = useState('summary');
  const [resourceSubTab, setResourceSubTab] = useState('allocated');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('resourcewise');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('wsp');
  const [flResources, setFlResources] = useState<any[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isViewResourceOpen, setIsViewResourceOpen] = useState(false);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);
  const [isDeleteResourceOpen, setIsDeleteResourceOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any | null>(null);
  const [isReleaseResourceOpen, setIsReleaseResourceOpen] = useState(false);
  const [resourceToRelease, setResourceToRelease] = useState<any | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isAddResourceDrawerOpen, setIsAddResourceDrawerOpen] = useState(false);

  // Advanced Filters - Allocated Resources Tab
  const [showAllocatedFilters, setShowAllocatedFilters] = useState(false);
  const [allocatedResourceSearch, setAllocatedResourceSearch] = useState('');
  const [allocatedDateFrom, setAllocatedDateFrom] = useState<Date | undefined>(undefined);
  const [allocatedDateTo, setAllocatedDateTo] = useState<Date | undefined>(undefined);
  const [allocatedTimeline, setAllocatedTimeline] = useState('all');
  const [allocatedHoursColumns, setAllocatedHoursColumns] = useState<string[]>(['allocated-percent', 'allocated-hour', 'actual', 'approved']);

  // Advanced Filters - Allocated Details Tab
  const [showDetailsFilters, setShowDetailsFilters] = useState(false);
  const [detailsResourceSearch, setDetailsResourceSearch] = useState('');
  const [detailsDateFrom, setDetailsDateFrom] = useState<Date | undefined>(undefined);
  const [detailsDateTo, setDetailsDateTo] = useState<Date | undefined>(undefined);
  const [detailsStatus, setDetailsStatus] = useState('all');

  // Dynamic calculations
  const [calculatedBudget, setCalculatedBudget] = useState<number>(0);
  const [calculatedTeamSize, setCalculatedTeamSize] = useState<number>(0);

  // Calculate dynamic budget from POs (legacy, now using Financial Lines)
  const projectPOs = id 
    ? pos.filter((po) => {
        if (!po || !po.projectId) return false;
        return po.projectId === id || (typeof po.projectId === 'object' && po.projectId?._id === id);
      })
    : [];
  const dynamicBudget = calculatedBudget > 0 ? calculatedBudget : projectPOs.reduce((sum, po) => sum + (po.poAmount || 0), 0);

  useEffect(() => {
    if (id) {
      setIsInitialLoading(true);
      fetchProjectById(id).finally(() => setIsInitialLoading(false));
      // Fetch POs to calculate dynamic budget
      fetchPOs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // fetchProjectById and fetchPOs are stable in Zustand stores

  // Fetch FL resources when project ID is available
  useEffect(() => {
    if (id) {
      fetchFLResources();
      fetchCalculatedValues();
    }
  }, [id]);

  const fetchCalculatedValues = async () => {
    if (!id) return;

    try {
      // Fetch Financial Lines to calculate total budget
      const flResponse = await fetch(`/api/financial-lines?projectId=${id}`);
      if (flResponse.ok) {
        const flData = await flResponse.json();
        const financialLines = Array.isArray(flData) ? flData : (flData.data || []);
        
        // Sum all FL budgets (using expectedRevenue or revenueAmount)
        const totalBudget = financialLines.reduce((sum: number, fl: any) => {
          return sum + (fl.expectedRevenue || fl.revenueAmount || 0);
        }, 0);
        setCalculatedBudget(totalBudget);
      }

      // Fetch FL Resources to calculate team size
      const flResourcesResponse = await fetch(`/api/fl-resources?projectId=${id}`);
      if (flResourcesResponse.ok) {
        const flResources = await flResourcesResponse.json();
        
        // Count unique employees (filter by unique employeeId)
        const uniqueEmployees = new Set(
          flResources
            .filter((resource: any) => resource.employeeId && resource.status === 'Active')
            .map((resource: any) => resource.employeeId)
        );
        setCalculatedTeamSize(uniqueEmployees.size);
      }
    } catch (error) {
      console.error('Error calculating budget and team size:', error);
    }
  };

  const fetchFLResources = async () => {
    if (!id) return;
    
    setIsLoadingResources(true);
    try {
      const response = await fetch(`/api/fl-resources?projectId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setFlResources(data);
        
        // Also update team size calculation
        const uniqueEmployees = new Set(
          data
            .filter((resource: any) => resource.employeeId && resource.status === 'Active')
            .map((resource: any) => resource.employeeId)
        );
        setCalculatedTeamSize(uniqueEmployees.size);
      } else {
        toast.error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching FL resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees/active');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Helper function to calculate date ranges based on timeline
  const getDateRangeFromTimeline = (timeline: string): { from: Date; to: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeline) {
      case 'this-week': {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { from: startOfWeek, to: endOfWeek };
      }
      case 'this-month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: startOfMonth, to: endOfMonth };
      }
      case 'last-month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { from: startOfLastMonth, to: endOfLastMonth };
      }
      case 'this-quarter': {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
        const endOfQuarter = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
        return { from: startOfQuarter, to: endOfQuarter };
      }
      case 'custom':
      case 'all':
      default:
        return null;
    }
  };

  // Update date filters when timeline changes
  useEffect(() => {
    if (allocatedTimeline !== 'custom' && allocatedTimeline !== 'all') {
      const range = getDateRangeFromTimeline(allocatedTimeline);
      if (range) {
        setAllocatedDateFrom(range.from);
        setAllocatedDateTo(range.to);
      }
    } else if (allocatedTimeline === 'all') {
      setAllocatedDateFrom(undefined);
      setAllocatedDateTo(undefined);
    }
  }, [allocatedTimeline]);

  // Clear filters functions
  const clearAllocatedFilters = () => {
    setAllocatedResourceSearch('');
    setAllocatedDateFrom(undefined);
    setAllocatedDateTo(undefined);
    setAllocatedTimeline('all');
    setAllocatedHoursColumns(['allocated-percent', 'allocated-hour', 'actual', 'approved']);
  };

  const clearDetailsFilters = () => {
    setDetailsResourceSearch('');
    setDetailsDateFrom(undefined);
    setDetailsDateTo(undefined);
    setDetailsStatus('all');
  };

  // Check if any filters are active
  const hasAllocatedFilters = allocatedResourceSearch || allocatedDateFrom || allocatedDateTo || allocatedTimeline !== 'all';
  const hasDetailsFilters = detailsResourceSearch || detailsDateFrom || detailsDateTo || detailsStatus !== 'all';

  // Convert FL resources to the format expected by ResourceTable
  const convertedResources = flResources.map(resource => ({
    id: resource._id,
    name: resource.resourceName || 'Unnamed Resource',
    employeeId: resource.employeeId || '',
    email: resource.email || '',
    role: resource.jobRole,
    department: resource.department || 'N/A',
    skills: resource.skills && resource.skills.length > 0 ? resource.skills : (resource.skillRequired ? [resource.skillRequired] : []),
    utilization: resource.utilizationPercentage || 0,
    status: resource.status as 'Active' | 'On Leave' | 'Inactive',
    startDate: resource.requestedFromDate,
    endDate: resource.requestedToDate,
    allocatedPercent: resource.utilizationPercentage || 0,
    allocatedHour: resource.allocatedHours || 0,
    actualHours: resource.actualHours || 0,
    approvedHours: resource.approvedHours || 0,
  }));

  // Filter resources for Allocated Resources tab
  const allocatedFilteredResources = convertedResources.filter(resource => {
    // Resource search (name, employee ID, email)
    const matchesSearch = allocatedResourceSearch === '' || 
      resource.name.toLowerCase().includes(allocatedResourceSearch.toLowerCase()) ||
      resource.employeeId.toLowerCase().includes(allocatedResourceSearch.toLowerCase()) ||
      resource.email.toLowerCase().includes(allocatedResourceSearch.toLowerCase());
    
    // Role filter
    const matchesType = typeFilter === 'all' || 
      resource.role.toLowerCase().includes(typeFilter.toLowerCase());
    
    // Date range filter
    let matchesDateRange = true;
    if (allocatedDateFrom || allocatedDateTo) {
      const resourceStart = resource.startDate ? new Date(resource.startDate) : null;
      const resourceEnd = resource.endDate ? new Date(resource.endDate) : null;

      if (allocatedDateFrom && resourceEnd) {
        matchesDateRange = matchesDateRange && resourceEnd >= allocatedDateFrom;
      }
      if (allocatedDateTo && resourceStart) {
        matchesDateRange = matchesDateRange && resourceStart <= allocatedDateTo;
      }
    }
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  // Filter for active resources only (Current team: Active status AND end date is today or in future)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for date comparison
  
  const activeResources = allocatedFilteredResources.filter(resource => {
    const isActiveStatus = resource.status === 'Active';
    const endDate = resource.endDate ? new Date(resource.endDate) : null;
    const isCurrentAllocation = !endDate || endDate >= today; // No end date or end date is today/future
    
    return isActiveStatus && isCurrentAllocation;
  });

  // Filter resources for Allocated Details tab
  const detailsFilteredResources = convertedResources.filter(resource => {
    // Resource search (name, employee ID, email)
    const matchesSearch = detailsResourceSearch === '' || 
      resource.name.toLowerCase().includes(detailsResourceSearch.toLowerCase()) ||
      resource.employeeId.toLowerCase().includes(detailsResourceSearch.toLowerCase()) ||
      resource.email.toLowerCase().includes(detailsResourceSearch.toLowerCase());
    
    // Status filter
    const matchesStatus = detailsStatus === 'all' || resource.status.toLowerCase() === detailsStatus.toLowerCase();
    
    // Date range filter
    let matchesDateRange = true;
    if (detailsDateFrom || detailsDateTo) {
      const resourceStart = resource.startDate ? new Date(resource.startDate) : null;
      const resourceEnd = resource.endDate ? new Date(resource.endDate) : null;

      if (detailsDateFrom && resourceEnd) {
        matchesDateRange = matchesDateRange && resourceEnd >= detailsDateFrom;
      }
      if (detailsDateTo && resourceStart) {
        matchesDateRange = matchesDateRange && resourceStart <= detailsDateTo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Resource action handlers
  const handleViewResource = (resource: any) => {
    setSelectedResource(resource);
    setIsViewResourceOpen(true);
  };

  const handleEditResource = (resource: any) => {
    const fullResource = flResources.find(r => r._id === resource.id);
    setSelectedResource(resource);
    if (fullResource) {
      setEditFormData({
        employeeId: fullResource.employeeId || '',
        resourceName: fullResource.resourceName || '',
        jobRole: fullResource.jobRole || '',
        department: fullResource.department || '',
        skills: fullResource.skills || [],
        utilizationPercentage: fullResource.utilizationPercentage || 0,
        requestedFromDate: fullResource.requestedFromDate ? new Date(fullResource.requestedFromDate) : null,
        requestedToDate: fullResource.requestedToDate ? new Date(fullResource.requestedToDate) : null,
        billable: fullResource.billable !== undefined ? fullResource.billable : true,
        status: fullResource.status || 'Active',
      });
    }
    fetchEmployees();
    setIsEditResourceOpen(true);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setEditFormData((prev: any) => ({
      ...prev,
      employeeId: employee.employeeId,
      resourceName: employee.name,
      department: employee.department,
      jobRole: employee.designation,
    }));
    setEmployeeSearchOpen(false);
    setEmployeeSearch('');
  };

  const handleRemoveResource = (resource: any) => {
    setResourceToDelete(resource);
    setIsDeleteResourceOpen(true);
  };

  const handleReleaseResource = async (resource: any) => {
    setResourceToRelease(resource);
    setIsReleaseResourceOpen(true);
  };

  const handleReleaseResourceConfirm = async () => {
    if (!resourceToRelease) return;
    try {
      // Find the full resource object
      const fullResource = flResources.find(r => r._id === resourceToRelease.id);
      if (!fullResource) {
        toast.error('Resource not found');
        setIsReleaseResourceOpen(false);
        setResourceToRelease(null);
        return;
      }
      // Set end date to today and status to Inactive
      const today = new Date();
      const updateData = {
        ...fullResource,
        requestedToDate: today.toISOString(),
        status: 'Inactive'
      };
      const response = await fetch(`/api/fl-resources/${resourceToRelease.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        toast.success('Resource released successfully');
        fetchFLResources(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to release resource');
      }
    } catch (error) {
      console.error('Error releasing resource:', error);
      toast.error('Failed to release resource');
    } finally {
      setIsReleaseResourceOpen(false);
      setResourceToRelease(null);
    }
  };

  const handleDeleteResourceConfirm = async () => {
    if (resourceToDelete) {
      try {
        const response = await fetch(`/api/fl-resources/${resourceToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('Resource removed successfully');
          fetchFLResources(); // Refresh the list
          setIsDeleteResourceOpen(false);
          setResourceToDelete(null);
        } else {
          toast.error('Failed to remove resource');
        }
      } catch (error) {
        console.error('Error removing resource:', error);
        toast.error('Failed to remove resource');
      }
    }
  };

  if (isInitialLoading && !selectedProject) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground font-medium">Project not found</p>
          <Button onClick={() => navigate('/rmg/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/rmg/projects')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

      {/* Project Header */}
      <div className="bg-background/80 backdrop-blur rounded-lg border">
        <ProjectHeader
          projectName={selectedProject.projectName}
          projectId={selectedProject.projectId}
          hubspotDealId={selectedProject.hubspotDealId}
          status={selectedProject.status}
          projectManager={selectedProject.projectManager?.name || 'Unassigned'}
          startDate={selectedProject.projectStartDate}
          endDate={selectedProject.projectEndDate}
          budget={dynamicBudget > 0 ? dynamicBudget : selectedProject.budget || selectedProject.estimatedValue || 0}
        />
      </div>
      </div>

      {/* Primary Tabs */}
      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="w-full">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent overflow-x-auto">
          <TabsTrigger 
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger 
            value="financials"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">In Dev</Badge>
          </TabsTrigger>
        </TabsList>

        {/* General Info Tab with Sub-tabs */}
        <TabsContent value="general" className="mt-6">
          <Tabs value={generalSubTab} onValueChange={setGeneralSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="fields" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Fields</TabsTrigger>
              <TabsTrigger value="customer-info" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Customer Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields">{selectedProject && <FieldsTab project={selectedProject} />}</TabsContent>
            <TabsContent value="customer-info">{selectedProject && <CustomerInfoTab project={selectedProject} />}</TabsContent>
          </Tabs>
        </TabsContent>

        {/* Financials Tab with Sub-tabs */}
        <TabsContent value="financials" className="mt-6">
          <Tabs value={financialSubTab} onValueChange={setFinancialSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="summary" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Summary</TabsTrigger>
              <TabsTrigger value="margin" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Margin Details
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="po" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Customer PO</TabsTrigger>
              <TabsTrigger value="fls" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">FL's</TabsTrigger>
              <TabsTrigger value="planned" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Planned Costs
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="actual" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Actual Cost
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Revenue Details
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary"><FinancialSummaryTab /></TabsContent>
            <TabsContent value="margin"><MarginDetailsTab /></TabsContent>
            <TabsContent value="po"><CustomerPOTab projectId={selectedProject?._id || selectedProject?.id} /></TabsContent>
            <TabsContent value="fls"><FLSTab projectId={selectedProject?._id || selectedProject?.id} /></TabsContent>
            <TabsContent value="planned"><PlannedCostsTab /></TabsContent>
            <TabsContent value="actual"><ActualCostsTab /></TabsContent>
            <TabsContent value="revenue"><RevenueDetailsTab /></TabsContent>
          </Tabs>
        </TabsContent>

        {/* Resources Tab with Sub-tabs */}
        <TabsContent value="resources" className="mt-6">
          <Tabs value={resourceSubTab} onValueChange={setResourceSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="allocated" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Allocated Resources
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Allocated Details (Tabular)
              </TabsTrigger>
            </TabsList>

            {/* Allocated Resources Sub-tab (Active Only) */}
            <TabsContent value="allocated">
              <div className="space-y-6">
                {/* Filter Button and Add Resource */}
                <Card className="border-brand-light-gray shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setShowAllocatedFilters(!showAllocatedFilters)}
                        className="gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        {showAllocatedFilters ? 'Hide Filters' : 'Show Filters'}
                      </Button>

                      <Button 
                        className="bg-brand-green hover:bg-brand-green-dark text-white gap-2"
                        onClick={() => setIsAddResourceDrawerOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Filters Card - Collapsible */}
                {showAllocatedFilters && (
                  <Card className="border-brand-light-gray shadow-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Resource Search */}
                        <div className="flex-1 max-w-md">
                          <Label htmlFor="allocated-search" className="text-sm font-medium mb-2 block">Resource Search</Label>
                          <Input
                            id="allocated-search"
                            placeholder="Search by name, employee ID, or email..."
                            value={allocatedResourceSearch}
                            onChange={(e) => setAllocatedResourceSearch(e.target.value)}
                            className="w-full border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>

                        {/* Date Range, Timeline, Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Date From */}
                          <div className="space-y-2">
                          <Label className="text-sm font-medium">From Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-brand-light-gray",
                                  !allocatedDateFrom && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {allocatedDateFrom ? format(allocatedDateFrom, "MMM dd, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={allocatedDateFrom}
                                onSelect={setAllocatedDateFrom}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">To Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-brand-light-gray",
                                  !allocatedDateTo && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {allocatedDateTo ? format(allocatedDateTo, "MMM dd, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={allocatedDateTo}
                                onSelect={setAllocatedDateTo}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Timeline</Label>
                          <Select value={allocatedTimeline} onValueChange={setAllocatedTimeline}>
                            <SelectTrigger className="border-brand-light-gray">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="this-week">This Week</SelectItem>
                              <SelectItem value="this-month">This Month</SelectItem>
                              <SelectItem value="last-month">Last Month</SelectItem>
                              <SelectItem value="this-quarter">This Quarter</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Hours Multi-select */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Hours Columns</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between border-brand-light-gray"
                              >
                                <span className="truncate">
                                  {allocatedHoursColumns.length === 4 ? "All Selected" : `${allocatedHoursColumns.length} selected`}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-3" align="start">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="allocated-percent"
                                    checked={allocatedHoursColumns.includes('allocated-percent')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setAllocatedHoursColumns([...allocatedHoursColumns, 'allocated-percent']);
                                      } else {
                                        setAllocatedHoursColumns(allocatedHoursColumns.filter(c => c !== 'allocated-percent'));
                                      }
                                    }}
                                  />
                                  <label htmlFor="allocated-percent" className="text-sm cursor-pointer">
                                    Allocated (%)
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="allocated-hour"
                                    checked={allocatedHoursColumns.includes('allocated-hour')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setAllocatedHoursColumns([...allocatedHoursColumns, 'allocated-hour']);
                                      } else {
                                        setAllocatedHoursColumns(allocatedHoursColumns.filter(c => c !== 'allocated-hour'));
                                      }
                                    }}
                                  />
                                  <label htmlFor="allocated-hour" className="text-sm cursor-pointer">
                                    Allocated (Hour)
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="actual"
                                    checked={allocatedHoursColumns.includes('actual')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setAllocatedHoursColumns([...allocatedHoursColumns, 'actual']);
                                      } else {
                                        setAllocatedHoursColumns(allocatedHoursColumns.filter(c => c !== 'actual'));
                                      }
                                    }}
                                  />
                                  <label htmlFor="actual" className="text-sm cursor-pointer">
                                    Actual
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="approved"
                                    checked={allocatedHoursColumns.includes('approved')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setAllocatedHoursColumns([...allocatedHoursColumns, 'approved']);
                                      } else {
                                        setAllocatedHoursColumns(allocatedHoursColumns.filter(c => c !== 'approved'));
                                      }
                                    }}
                                  />
                                  <label htmlFor="approved" className="text-sm cursor-pointer">
                                    Approved
                                  </label>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {hasAllocatedFilters && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllocatedFilters}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <FilterX className="h-4 w-4" />
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Active Resources Table */}
                <Card className="border-brand-light-gray shadow-sm rounded-lg">
                  <CardContent className="p-6">
                    <ResourceTable 
                      resources={activeResources} 
                      isLoading={isLoadingResources} 
                      onView={handleViewResource}
                      onEdit={handleEditResource}
                      onRemove={handleRemoveResource}
                      onRelease={handleReleaseResource}
                      onExtend={handleEditResource}
                      visibleColumns={allocatedHoursColumns}
                    />
                    {/* Release Resource Confirmation Dialog */}
                    <AlertDialog open={isReleaseResourceOpen} onOpenChange={setIsReleaseResourceOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Release Resource?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to release this resource? This will set the end date to today and mark the resource as inactive.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleReleaseResourceConfirm} className="bg-orange-600 text-white hover:bg-orange-700">
                            Release
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Allocated Details Sub-tab (All Resources) */}
            <TabsContent value="details">
              <div className="space-y-6">
                {/* Filter Button */}
                <Card className="border-brand-light-gray shadow-sm">
                  <CardContent className="pt-6">
                    <Button 
                      variant="outline"
                      onClick={() => setShowDetailsFilters(!showDetailsFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {showDetailsFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Advanced Filters Card - Collapsible */}
                {showDetailsFilters && (
                  <Card className="border-brand-light-gray shadow-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Resource Search */}
                        <div className="flex-1 max-w-md">
                          <Label htmlFor="details-search" className="text-sm font-medium mb-2 block">Resource Search</Label>
                          <Input
                            id="details-search"
                            placeholder="Search by name, employee ID, or email..."
                            value={detailsResourceSearch}
                            onChange={(e) => setDetailsResourceSearch(e.target.value)}
                            className="w-full border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>

                        {/* Date Range & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date From */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">From Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-brand-light-gray",
                                  !detailsDateFrom && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {detailsDateFrom ? format(detailsDateFrom, "MMM dd, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={detailsDateFrom}
                                onSelect={setDetailsDateFrom}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">To Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-brand-light-gray",
                                  !detailsDateTo && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {detailsDateTo ? format(detailsDateTo, "MMM dd, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={detailsDateTo}
                                onSelect={setDetailsDateTo}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Status</Label>
                          <Select value={detailsStatus} onValueChange={setDetailsStatus}>
                            <SelectTrigger className="border-brand-light-gray">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {hasDetailsFilters && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearDetailsFilters}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <FilterX className="h-4 w-4" />
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* All Resources Table (Active + Inactive) */}
                <Card className="border-brand-light-gray shadow-sm rounded-lg">
                  <CardContent className="p-6">
                    <ResourceTable 
                      resources={detailsFilteredResources} 
                      isLoading={isLoadingResources} 
                      onView={handleViewResource}
                      onEdit={handleEditResource}
                      onRemove={handleRemoveResource}
                      onRelease={handleReleaseResource}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Analytics Tab with Sub-tabs */}
        <TabsContent value="analytics" className="mt-6">
          <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="resourcewise" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Resource Wise MOM Hours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resourcewise">
              <ComingSoon 
                title="Resource Wise MOM Hours" 
                description="Comprehensive analytics showing resource-wise month-over-month hours with trend analysis and forecasting."
                priority="high"
                estimatedDate="Q1 2026"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* View Resource Sheet */}
      <Sheet open={isViewResourceOpen} onOpenChange={setIsViewResourceOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Resource Details</SheetTitle>
            <SheetDescription>View resource allocation and information</SheetDescription>
          </SheetHeader>
          {selectedResource && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Resource Name</Label>
                  <p className="text-base font-semibold mt-1">{selectedResource.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p className="text-base mt-1">{selectedResource.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="text-base mt-1">{selectedResource.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedResource.skills && selectedResource.skills.length > 0 ? (
                      selectedResource.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills listed</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="text-base mt-1">
                    {selectedResource.startDate 
                      ? new Date(selectedResource.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="text-base mt-1">
                    {selectedResource.endDate 
                      ? new Date(selectedResource.endDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Utilization</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{selectedResource.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-green h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(selectedResource.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="secondary"
                      className={
                        selectedResource.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedResource.status === 'On Leave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {selectedResource.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Resource Sheet */}
      <Sheet open={isEditResourceOpen} onOpenChange={setIsEditResourceOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Resource</SheetTitle>
            <SheetDescription>Update resource allocation details</SheetDescription>
          </SheetHeader>
          {selectedResource && editFormData && (
            <div className="mt-6 space-y-6">
              {/* Basic Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Resource Name - Employee Picker */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-resourceName">Resource Name</Label>
                      <Popover open={employeeSearchOpen} onOpenChange={(open) => {
                        setEmployeeSearchOpen(open);
                        if (!open) setEmployeeSearch('');
                      }}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {editFormData.resourceName || "Select employee"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search employees..." 
                              value={employeeSearch}
                              onValueChange={setEmployeeSearch}
                            />
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {employees.filter(employee =>
                                employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                employee.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                employee.designation.toLowerCase().includes(employeeSearch.toLowerCase())
                              ).map((employee) => (
                                <CommandItem
                                  key={employee._id}
                                  onSelect={() => handleEmployeeSelect(employee)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      editFormData.employeeId === employee.employeeId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{employee.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {employee.department} • {employee.designation}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Job Role */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-jobRole">Job Role</Label>
                      <Select
                        value={editFormData.jobRole}
                        onValueChange={(value) => setEditFormData({...editFormData, jobRole: value})}
                      >
                        <SelectTrigger id="edit-jobRole">
                          <SelectValue placeholder="Select job role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                          <SelectItem value="Senior Software Engineer">Senior Software Engineer</SelectItem>
                          <SelectItem value="Lead Engineer">Lead Engineer</SelectItem>
                          <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                          <SelectItem value="Product Manager">Product Manager</SelectItem>
                          <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                          <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                          <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                          <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                          <SelectItem value="Project Manager">Project Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-department">Department</Label>
                      <Select
                        value={editFormData.department}
                        onValueChange={(value) => setEditFormData({...editFormData, department: value})}
                      >
                        <SelectTrigger id="edit-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="Data">Data</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={editFormData.status}
                        onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Requested From Date */}
                    <div className="space-y-2">
                      <Label>Requested From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editFormData.requestedFromDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editFormData.requestedFromDate ? format(editFormData.requestedFromDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editFormData.requestedFromDate || undefined}
                            onSelect={(date) => setEditFormData({...editFormData, requestedFromDate: date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Requested To Date */}
                    <div className="space-y-2">
                      <Label>Requested To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editFormData.requestedToDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editFormData.requestedToDate ? format(editFormData.requestedToDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editFormData.requestedToDate || undefined}
                            onSelect={(date) => setEditFormData({...editFormData, requestedToDate: date})}
                            disabled={(date) => 
                              editFormData.requestedFromDate ? date < editFormData.requestedFromDate : false
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Billable Toggle */}
                    <div className="flex items-center justify-between space-x-2 py-2 md:col-span-2">
                      <Label htmlFor="edit-billable" className="font-medium">
                        Billable
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {editFormData.billable ? 'Yes' : 'No'}
                        </span>
                        <Switch
                          id="edit-billable"
                          checked={editFormData.billable}
                          onCheckedChange={(checked) => setEditFormData({...editFormData, billable: checked})}
                        />
                      </div>
                    </div>

                    {/* Utilization Percentage */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-utilization">Utilization (%)</Label>
                      <Input
                        id="edit-utilization"
                        type="number"
                        min="0"
                        max="100"
                        value={editFormData.utilizationPercentage}
                        onChange={(e) => setEditFormData({...editFormData, utilizationPercentage: parseFloat(e.target.value) || 0})}
                        placeholder="Enter utilization %"
                      />
                    </div>

                    {/* Skills */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Skills</Label>
                      {editFormData.skills && editFormData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]">
                          {editFormData.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSkills = editFormData.skills.filter((_: string, i: number) => i !== index);
                                  setEditFormData({...editFormData, skills: newSkills});
                                }}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] text-sm text-muted-foreground">
                          No skills assigned
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditResourceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const fullResource = flResources.find(r => r._id === selectedResource.id);
                      if (!fullResource) {
                        toast.error('Resource not found');
                        return;
                      }

                      const response = await fetch(`/api/fl-resources/${fullResource._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...fullResource,
                          employeeId: editFormData.employeeId,
                          resourceName: editFormData.resourceName,
                          jobRole: editFormData.jobRole,
                          department: editFormData.department,
                          skills: editFormData.skills,
                          utilizationPercentage: editFormData.utilizationPercentage,
                          requestedFromDate: editFormData.requestedFromDate,
                          requestedToDate: editFormData.requestedToDate,
                          billable: editFormData.billable,
                          status: editFormData.status,
                        }),
                      });

                      if (response.ok) {
                        toast.success('Resource updated successfully');
                        setIsEditResourceOpen(false);
                        fetchFLResources();
                      } else {
                        toast.error('Failed to update resource');
                      }
                    } catch (error) {
                      console.error('Error updating resource:', error);
                      toast.error('Failed to update resource');
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Resource Confirmation Dialog */}
      <AlertDialog open={isDeleteResourceOpen} onOpenChange={setIsDeleteResourceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{resourceToDelete?.name}</strong> from this project?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResourceConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Resource to FL Drawer */}
      <AddResourceToFLDrawer
        open={isAddResourceDrawerOpen}
        onOpenChange={setIsAddResourceDrawerOpen}
        projectId={id}
        onSuccess={() => {
          fetchFLResources();
          fetchCalculatedValues(); // Update team size and budget
          toast.success('Resource will now appear in the Allocated Resources tab');
        }}
      />
    </div>
  );
}
