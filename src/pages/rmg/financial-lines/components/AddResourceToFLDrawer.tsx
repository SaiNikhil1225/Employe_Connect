import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Check, ChevronsUpDown, CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinancialLine } from '@/types/financialLine';
import { format, eachDayOfInterval, isWeekend, eachMonthOfInterval } from 'date-fns';

interface MonthAllocation {
  month: string;
  allocation: number;
}

interface AddResourceToFLDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  financialLine?: FinancialLine | null;
  projectId?: string;
  onSuccess?: () => void;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

const SKILL_OPTIONS = [
  'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', '.NET',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'TypeScript', 'JavaScript',
  'MongoDB', 'PostgreSQL', 'MySQL', 'GraphQL', 'REST API', 'Microservices',
  'DevOps', 'CI/CD', 'Agile', 'Scrum', 'UI/UX Design', 'Figma', 'Adobe XD'
];

const calculateWorkingDays = (fromDate: Date, toDate: Date): number => {
  const days = eachDayOfInterval({ start: fromDate, end: toDate });
  return days.filter(day => !isWeekend(day)).length;
};

export function AddResourceToFLDrawer({ 
  open, 
  onOpenChange, 
  financialLine,
  projectId,
  onSuccess 
}: AddResourceToFLDrawerProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    jobRole: '',
    department: '',
    selectedSkills: [] as string[],
    utilizationPercentage: '',
    requestedFromDate: null as Date | null,
    requestedToDate: null as Date | null,
    billable: true,
    percentageBasis: 'Billable',
    selectedFinancialLineId: '',
  });

  const [monthlyAllocations, setMonthlyAllocations] = useState<MonthAllocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [existingResourcesCount, setExistingResourcesCount] = useState(0);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [availableFinancialLines, setAvailableFinancialLines] = useState<FinancialLine[]>([]);
  const [selectedFL, setSelectedFL] = useState<FinancialLine | null>(null);
  const [flResourceInfo, setFlResourceInfo] = useState<Record<string, { count: number; resourceName?: string }>>({});
  const [employeeAllocation, setEmployeeAllocation] = useState<{
    totalAllocated: number;
    availableCapacity: number;
    allocations: Array<{ 
      projectId: string; 
      flNo: string;
      flName: string;
      allocation: number; 
      role?: string; 
      billable: boolean;
      fromDate?: string;
      toDate?: string;
    }>;
  } | null>(null);
  const [loadingAllocation, setLoadingAllocation] = useState(false);

  // Fetch employees and FLs
  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (projectId) {
        fetchFinancialLines();
      }
      if (financialLine) {
        // Pre-selected FL from Financial Lines page
        setSelectedFL(financialLine);
        
        // Parse FL dates and set them as default
        const flStartDate = financialLine.scheduleStart ? new Date(financialLine.scheduleStart) : null;
        const flEndDate = financialLine.scheduleFinish ? new Date(financialLine.scheduleFinish) : null;
        
        setFormData(prev => ({ 
          ...prev, 
          selectedFinancialLineId: financialLine._id,
          requestedFromDate: flStartDate,
          requestedToDate: flEndDate,
        }));
        checkExistingResources(financialLine._id);
      }
    }
  }, [open, financialLine, projectId]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees/active');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employee list');
    }
  };

  const fetchFinancialLines = async () => {
    if (!projectId) {
      return;
    }
    
    try {
      const response = await fetch(`/api/financial-lines?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both data.data and direct data array
        const flArray = Array.isArray(data) ? data : (data.data || []);
        // Show Active and Draft FLs (exclude only Archived/Closed)
        const availableFLs = flArray.filter((fl: any) => 
          fl.status && !['Archived', 'Closed', 'Cancelled'].includes(fl.status)
        );
        setAvailableFinancialLines(availableFLs);
        // Fetch resource counts for each FL
        fetchResourceCountsForFLs(availableFLs);
      } else {
        console.error('Failed to fetch FLs, status:', response.status);
        toast.error('Failed to load financial lines');
      }
    } catch (error) {
      console.error('Failed to fetch financial lines:', error);
      toast.error('Failed to load financial lines');
    }
  };

  const fetchResourceCountsForFLs = async (fls: FinancialLine[]) => {
    try {
      const countPromises = fls.map(async (fl) => {
        const response = await fetch(`/api/fl-resources?financialLineId=${fl._id}`);
        if (response.ok) {
          const resourceData = await response.json();
          const count = resourceData.length || 0;
          const resourceName = count > 0 && resourceData[0] ? resourceData[0].resourceName : undefined;
          return { flId: fl._id, count, resourceName };
        }
        return { flId: fl._id, count: 0, resourceName: undefined };
      });
      
      const counts = await Promise.all(countPromises);
      const infoMap = counts.reduce((acc, { flId, count, resourceName }) => {
        acc[flId] = { count, resourceName };
        return acc;
      }, {} as Record<string, { count: number; resourceName?: string }>);
      
      setFlResourceInfo(infoMap);
    } catch (error) {
      console.error('Failed to fetch resource info:', error);
    }
  };

  const fetchEmployeeAllocation = async (employeeId: string) => {
    setLoadingAllocation(true);
    try {
      const response = await fetch(`/api/fl-resources/by-employee/${employeeId}`);
      if (response.ok) {
        const flResources = await response.json();
        
        if (flResources.length === 0) {
          setEmployeeAllocation(null);
          setLoadingAllocation(false);
          return;
        }
        
        // Calculate total allocation from monthly allocations across all active FL resources
        let totalAllocated = 0;
        
        // For each FL resource, calculate average allocation from monthly allocations
        const allocations = flResources.map((flResource: any) => {
          const monthlyAllocations = flResource.monthlyAllocations || [];
          
          // Calculate average allocation from monthly allocations
          let avgAllocation = 0;
          if (monthlyAllocations.length > 0) {
            const totalMonthlyAllocation = monthlyAllocations.reduce(
              (sum: number, month: any) => sum + (month.allocation || 0), 
              0
            );
            avgAllocation = totalMonthlyAllocation / monthlyAllocations.length;
          } else if (flResource.utilizationPercentage) {
            // Fallback to utilizationPercentage if no monthly allocations
            avgAllocation = flResource.utilizationPercentage;
          }
          
          totalAllocated += avgAllocation;
          
          return {
            projectId: flResource.projectId || 'N/A',
            flNo: flResource.flNo,
            flName: flResource.flName,
            allocation: Math.round(avgAllocation),
            role: flResource.jobRole,
            billable: flResource.billable,
            fromDate: flResource.requestedFromDate,
            toDate: flResource.requestedToDate
          };
        });
        
        const availableCapacity = Math.max(0, 100 - totalAllocated);
        
        setEmployeeAllocation({
          totalAllocated: Math.round(totalAllocated),
          availableCapacity: Math.round(availableCapacity),
          allocations
        });
      } else {
        setEmployeeAllocation(null);
      }
    } catch (error) {
      console.error('Failed to fetch employee allocation:', error);
      setEmployeeAllocation(null);
    } finally {
      setLoadingAllocation(false);
    }
  };

  const checkExistingResources = async (flId?: string) => {
    const flToCheck = flId || formData.selectedFinancialLineId;
    if (!flToCheck) return;
    
    try {
      const response = await fetch(`/api/fl-resources?financialLineId=${flToCheck}`);
      if (response.ok) {
        const data = await response.json();
        const resourceCount = data.length || 0;
        setExistingResourcesCount(resourceCount);
        
        // If resource exists, populate form with its data
        if (resourceCount > 0 && data[0]) {
          const existingResource = data[0];
          
          setFormData(prev => ({
            ...prev,
            employeeId: existingResource.employeeId || '',
            employeeName: existingResource.resourceName || '',
            jobRole: existingResource.jobRole || '',
            department: existingResource.department || '',
            selectedSkills: existingResource.skills || [],
            utilizationPercentage: existingResource.utilizationPercentage?.toString() || '',
            requestedFromDate: existingResource.requestedFromDate ? new Date(existingResource.requestedFromDate) : prev.requestedFromDate,
            requestedToDate: existingResource.requestedToDate ? new Date(existingResource.requestedToDate) : prev.requestedToDate,
            billable: existingResource.billable ?? true,
            percentageBasis: existingResource.percentageBasis || 'Billable',
          }));
          
          // Set monthly allocations if they exist
          if (existingResource.monthlyAllocations && existingResource.monthlyAllocations.length > 0) {
            setMonthlyAllocations(existingResource.monthlyAllocations);
          }
          
          toast.info('Loaded existing resource data for editing');
        }
      }
    } catch (error) {
      console.error('Failed to check existing resources:', error);
    }
  };

  // Generate months when dates change
  useEffect(() => {
    if (formData.requestedFromDate && formData.requestedToDate) {
      try {
        const fromDate = formData.requestedFromDate;
        const toDate = formData.requestedToDate;
        
        if (fromDate <= toDate) {
          const months = eachMonthOfInterval({ start: fromDate, end: toDate });
          const allocations = months.map(month => ({
            month: format(month, 'MMM yyyy'),
            allocation: 0,
          }));
          setMonthlyAllocations(allocations);
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.requestedToDate;
            return newErrors;
          });
        } else {
          setValidationErrors(prev => ({
            ...prev,
            requestedToDate: 'To Date must be after From Date'
          }));
          setMonthlyAllocations([]);
        }
      } catch {
        setMonthlyAllocations([]);
      }
    } else {
      setMonthlyAllocations([]);
    }
  }, [formData.requestedFromDate, formData.requestedToDate]);

  // Calculate total allocation hours (8 hours/day, weekdays only)
  const calculateTotalAllocation = () => {
    if (!formData.requestedFromDate || !formData.requestedToDate) return '0 Hrs';
    
    const workingDays = calculateWorkingDays(formData.requestedFromDate, formData.requestedToDate);
    const totalPercentage = monthlyAllocations.reduce((sum, month) => sum + month.allocation, 0);
    const avgAllocation = monthlyAllocations.length > 0 ? totalPercentage / monthlyAllocations.length : 0;
    
    // 8 hours per day for working days only
    const totalHours = (avgAllocation / 100) * 8 * workingDays;
    
    return totalHours > 0 ? `${Math.round(totalHours)} Hrs` : '0 Hrs';
  };

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        employeeId: '',
        employeeName: '',
        jobRole: '',
        department: '',
        selectedSkills: [],
        utilizationPercentage: '',
        requestedFromDate: null,
        requestedToDate: null,
        billable: true,
        percentageBasis: 'Billable',
        selectedFinancialLineId: '',
      });
      setMonthlyAllocations([]);
      setValidationErrors({});
      setSelectedFL(null);
      setExistingResourcesCount(0);
      setEmployeeAllocation(null);
    }
  }, [open]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Check if FL is selected
    if (!formData.selectedFinancialLineId && !financialLine) {
      errors.selectedFinancialLineId = 'Please select a Financial Line';
    }

    // Check T&M restriction
    if (selectedFL?.contractType === 'T&M' && existingResourcesCount >= 1) {
      errors.general = 'Only one resource can be allocated to T&M type Financial Lines';
    }

    if (!formData.requestedFromDate) {
      errors.requestedFromDate = 'From Date is required';
    }

    if (!formData.requestedToDate) {
      errors.requestedToDate = 'To Date is required';
    }

    if (formData.requestedFromDate && formData.requestedToDate) {
      if (formData.requestedFromDate > formData.requestedToDate) {
        errors.requestedToDate = 'To Date must be after From Date';
      }
    }

    if (!formData.jobRole) {
      errors.jobRole = 'Job Role is required';
    }

    if (!formData.employeeId) {
      errors.employeeId = 'Resource Name is required';
    }

    if (formData.utilizationPercentage) {
      const utilization = parseFloat(formData.utilizationPercentage);
      if (utilization < 0 || utilization > 100) {
        errors.utilizationPercentage = 'Utilization must be between 0 and 100';
      }
    }

    if (formData.billable && !formData.utilizationPercentage) {
      errors.utilizationPercentage = 'Utilization is mandatory when billable';
    }

    // Validate monthly allocations
    monthlyAllocations.forEach((month, index) => {
      if (month.allocation < 0 || month.allocation > 100) {
        errors[`allocation_${index}`] = 'Must be between 0-100';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const activeFinancialLine = selectedFL || financialLine;
    
    if (!activeFinancialLine) {
      toast.error('No financial line selected');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const resourceData = {
        employeeId: formData.employeeId,
        resourceName: formData.employeeName,
        jobRole: formData.jobRole,
        department: formData.department,
        skills: formData.selectedSkills,
        utilizationPercentage: parseFloat(formData.utilizationPercentage) || 0,
        requestedFromDate: formData.requestedFromDate?.toISOString(),
        requestedToDate: formData.requestedToDate?.toISOString(),
        billable: formData.billable,
        percentageBasis: formData.percentageBasis,
        monthlyAllocations: monthlyAllocations,
        totalAllocation: calculateTotalAllocation(),
        financialLineId: activeFinancialLine._id,
        flNo: activeFinancialLine.flNo,
        flName: activeFinancialLine.flName,
        projectId: typeof activeFinancialLine.projectId === 'string' 
          ? activeFinancialLine.projectId 
          : activeFinancialLine.projectId?._id,
        status: 'Active' as const,
      };

      const response = await fetch('/api/fl-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      toast.success(`Resource ${formData.employeeName} added to FL ${activeFinancialLine.flNo}`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add resource:', error);
      toast.error('Failed to add resource to financial line');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      jobRole: employee.designation,
    }));
    setEmployeeSearchOpen(false);
    setEmployeeSearch('');
    
    // Fetch allocation data for the selected employee
    await fetchEmployeeAllocation(employee.employeeId);
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const skills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      return { ...prev, selectedSkills: skills };
    });
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(s => s !== skill)
    }));
  };

  const handleFinancialLineSelect = (flId: string) => {
    const selected = availableFinancialLines.find(fl => fl._id === flId);
    if (selected) {
      setSelectedFL(selected);
      
      // Parse FL dates and set them as default
      const flStartDate = selected.scheduleStart ? new Date(selected.scheduleStart) : null;
      const flEndDate = selected.scheduleFinish ? new Date(selected.scheduleFinish) : null;
      
      setFormData(prev => ({ 
        ...prev, 
        selectedFinancialLineId: flId,
        requestedFromDate: flStartDate,
        requestedToDate: flEndDate,
      }));
      
      checkExistingResources(flId);
      // Clear validation error
      if (validationErrors.selectedFinancialLineId) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.selectedFinancialLineId;
          return newErrors;
        });
      }
    }
  };

  const handleAllocationChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setMonthlyAllocations(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], allocation: numValue };
        return updated;
      });
      // Clear validation error
      if (validationErrors[`allocation_${index}`]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`allocation_${index}`];
          return newErrors;
        });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-6xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b pb-4 pr-8">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl">
                {existingResourcesCount > 0 ? 'Edit Resource Assignment' : 'Add Resource to Financial Line'}
              </SheetTitle>
              {(selectedFL || financialLine) && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-foreground">FL: {(selectedFL || financialLine)?.flNo}</p>
                    <p className="text-muted-foreground">{(selectedFL || financialLine)?.flName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {(selectedFL || financialLine)?.contractType}
                    </Badge>
                    {existingResourcesCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Editing Existing Resource
                      </Badge>
                    )}
                    {(selectedFL || financialLine)?.contractType === 'T&M' && existingResourcesCount >= 1 && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Max 1 resource for T&M
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SheetHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {validationErrors.general && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{validationErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Select Financial Line - Only show if not pre-selected */}
          {!financialLine && projectId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Financial Line</CardTitle>
                <CardDescription>
                  Choose the Financial Line to assign this resource to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="financialLine">
                    Financial Line <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.selectedFinancialLineId}
                    onValueChange={handleFinancialLineSelect}
                  >
                    <SelectTrigger className={validationErrors.selectedFinancialLineId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select Financial Line" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFinancialLines.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No active Financial Lines found for this project
                        </SelectItem>
                      ) : (
                        availableFinancialLines.map((fl) => {
                          const resourceInfo = flResourceInfo[fl._id];
                          const hasResource = resourceInfo && resourceInfo.count > 0;
                          const resourceName = resourceInfo?.resourceName;
                          return (
                            <SelectItem key={fl._id} value={fl._id}>
                              {fl.flNo} - {fl.flName} ({fl.contractType}){hasResource && resourceName ? ` • ${resourceName}` : ''}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {validationErrors.selectedFinancialLineId && (
                    <p className="text-xs text-destructive">{validationErrors.selectedFinancialLineId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 3 columns layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Financial Line Item - Read Only - Only show if FL is selected */}
                {(selectedFL || financialLine) && (
                  <div className="space-y-2">
                    <Label>Financial Line Item</Label>
                    <Input
                      value={(selectedFL || financialLine) ? `${(selectedFL || financialLine)?.flNo} - ${(selectedFL || financialLine)?.flName}` : ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                {/* Date Range - From */}
                <div className="space-y-2">
                  <Label htmlFor="requestedFromDate">
                    Requested From Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.requestedFromDate && "text-muted-foreground",
                          validationErrors.requestedFromDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.requestedFromDate ? format(formData.requestedFromDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        selected={formData.requestedFromDate || undefined}
                        onSelect={(date) => handleChange('requestedFromDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.requestedFromDate && (
                    <p className="text-xs text-destructive">{validationErrors.requestedFromDate}</p>
                  )}
                </div>

                {/* Date Range - To */}
                <div className="space-y-2">
                  <Label htmlFor="requestedToDate">
                    Requested To Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.requestedToDate && "text-muted-foreground",
                          validationErrors.requestedToDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.requestedToDate ? format(formData.requestedToDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        selected={formData.requestedToDate || undefined}
                        onSelect={(date) => handleChange('requestedToDate', date)}
                        disabled={(date) => 
                          formData.requestedFromDate ? date < formData.requestedFromDate : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.requestedToDate && (
                    <p className="text-xs text-destructive">{validationErrors.requestedToDate}</p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange('department', value)}
                  >
                    <SelectTrigger className={validationErrors.department ? 'border-destructive' : ''}>
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

                {/* Job Role */}
                <div className="space-y-2">
                  <Label htmlFor="jobRole">
                    Job Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.jobRole}
                    onValueChange={(value) => handleChange('jobRole', value)}
                  >
                    <SelectTrigger className={validationErrors.jobRole ? 'border-destructive' : ''}>
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
                  {validationErrors.jobRole && (
                    <p className="text-xs text-destructive">{validationErrors.jobRole}</p>
                  )}
                </div>

                {/* Skills - Multi-select */}
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Popover open={skillSearchOpen} onOpenChange={(open) => {
                    setSkillSearchOpen(open);
                    if (!open) setSkillSearch('');
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {formData.selectedSkills.length > 0
                            ? `${formData.selectedSkills.length} skill(s) selected`
                            : "Select skills"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Search skills..." 
                          value={skillSearch}
                          onValueChange={setSkillSearch}
                        />
                        <CommandEmpty>No skill found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {SKILL_OPTIONS.filter(skill => 
                            skill.toLowerCase().includes(skillSearch.toLowerCase())
                          ).map((skill) => (
                            <CommandItem
                              key={skill}
                              onSelect={() => handleSkillToggle(skill)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {skill}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.selectedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resource Name - People Picker */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="resourceName">
                    Resource Name <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={employeeSearchOpen} onOpenChange={(open) => {
                    setEmployeeSearchOpen(open);
                    if (!open) setEmployeeSearch('');
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          validationErrors.employeeId && "border-destructive"
                        )}
                      >
                        {formData.employeeName || "Select employee"}
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
                                  formData.employeeId === employee.employeeId ? "opacity-100" : "opacity-0"
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
                  {validationErrors.employeeId && (
                    <p className="text-xs text-destructive">{validationErrors.employeeId}</p>
                  )}
                  
                  {/* Employee Allocation Info */}
                  {formData.employeeId && (
                    <div className="mt-3">
                      {loadingAllocation ? (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Loading allocation data...</p>
                        </div>
                      ) : employeeAllocation ? (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Current Allocation Status
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-blue-700 dark:text-blue-300">Total Allocated</p>
                              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {employeeAllocation.totalAllocated}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-green-700 dark:text-green-300">Available Capacity</p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {employeeAllocation.availableCapacity}%
                              </p>
                            </div>
                          </div>
                          {employeeAllocation.allocations.length > 0 && (
                            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Active Allocations: {employeeAllocation.allocations.length} Financial Line(s)
                              </p>
                              <div className="space-y-1">
                                {employeeAllocation.allocations.slice(0, 3).map((alloc, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-blue-700 dark:text-blue-300">
                                      {alloc.flNo} - {alloc.flName}
                                      {alloc.role && ` • ${alloc.role}`}
                                    </span>
                                    <Badge variant={alloc.billable ? "default" : "secondary"} className="text-xs">
                                      {alloc.allocation}%
                                    </Badge>
                                  </div>
                                ))}
                                {employeeAllocation.allocations.length > 3 && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    +{employeeAllocation.allocations.length - 3} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            ✓ No active allocations - 100% available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Billable Toggle */}
                <div className="flex items-center justify-between space-x-2 py-2">
                  <Label htmlFor="billable" className="font-medium">
                    Billable <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formData.billable ? 'Yes' : 'No'}
                    </span>
                    <Switch
                      id="billable"
                      checked={formData.billable}
                      onCheckedChange={(checked) => handleChange('billable', checked)}
                    />
                  </div>
                </div>

                {/* Utilization */}
                <div className="space-y-2">
                  <Label htmlFor="utilizationPercentage">
                    Utilization (%) {formData.billable && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="utilizationPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.utilizationPercentage}
                    onChange={(e) => handleChange('utilizationPercentage', e.target.value)}
                    placeholder="0-100"
                    className={validationErrors.utilizationPercentage ? 'border-destructive' : ''}
                  />
                  {validationErrors.utilizationPercentage && (
                    <p className="text-xs text-destructive">{validationErrors.utilizationPercentage}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Section */}
          {monthlyAllocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Allocation (Month-wise)</CardTitle>
                <CardDescription>
                  Allocate resources across months. Each value must be between 0-100%. Calculation based on 8 hours/day for weekdays only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Percentage Basis */}
                <div className="space-y-2">
                  <Label htmlFor="percentageBasis">% Basis</Label>
                  <Select
                    value={formData.percentageBasis}
                    onValueChange={(value) => handleChange('percentageBasis', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Billable">Billable</SelectItem>
                      <SelectItem value="Non-Billable">Non-Billable</SelectItem>
                      <SelectItem value="Buffer">Buffer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monthly Allocation Grid */}
                <div className="border rounded-lg overflow-x-auto">
                  <div className="min-w-max">
                    {/* Header */}
                    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] bg-muted/50 border-b">
                      <div className="p-3 font-medium text-sm">Month</div>
                      {monthlyAllocations.map((month, index) => (
                        <div key={index} className="p-3 font-medium text-sm text-center border-l">
                          {month.month}
                        </div>
                      ))}
                    </div>

                    {/* Allocation Row */}
                    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))]">
                      <div className="p-3 text-sm font-medium">Allocation (%)</div>
                      {monthlyAllocations.map((month, index) => (
                        <div key={index} className="p-2 border-l">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={month.allocation || ''}
                            onChange={(e) => handleAllocationChange(index, e.target.value)}
                            placeholder="0"
                            className={`text-center ${validationErrors[`allocation_${index}`] ? 'border-destructive' : ''}`}
                          />
                          {validationErrors[`allocation_${index}`] && (
                            <p className="text-xs text-destructive mt-1">{validationErrors[`allocation_${index}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Allocation with working days info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-medium">Total Allocation</span>
                      {formData.requestedFromDate && formData.requestedToDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {calculateWorkingDays(formData.requestedFromDate, formData.requestedToDate)} working days 
                          (8 hrs/day, weekdays only)
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-brand-green">
                      {calculateTotalAllocation()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-green hover:bg-brand-green-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (existingResourcesCount > 0 ? 'Update Resource' : 'Save Resource')}
            </Button>
          </div>
        </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
