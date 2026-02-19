import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useProjectStore } from '@/store/projectStore';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, UOM, ContractType, LocationType } from '@/types/financialLine';
import { format, isAfter, isBefore } from 'date-fns';

const step1Schema = z.object({
  flName: z.string().min(1, 'FL name is required'),
  projectId: z.string().min(1, 'Project is required'),
  locationType: z.enum(['Onsite', 'Offshore', 'Hybrid']),
  contractType: z.enum(['T&M', 'Fixed Bid', 'Fixed Monthly', 'License']),
  timesheetApprover: z.string().min(1, 'Timesheet approver is required'),
  scheduleStart: z.string().min(1, 'Schedule start is required'),
  scheduleFinish: z.string().min(1, 'Schedule finish is required'),
  executionEntity: z.string().min(1, 'Execution entity is required'),
  currency: z.string().min(1, 'Currency is required'),
  billingRate: z.number().min(0.01, 'Billing rate must be greater than 0'),
  rateUom: z.enum(['Hr', 'Day', 'Month']),
  effort: z.number().optional().default(0),
  effortUom: z.enum(['Hr', 'Day', 'Month']),
  revenueAmount: z.number(),
  expectedRevenue: z.number(),
}).refine(data => {
  const start = new Date(data.scheduleStart);
  const finish = new Date(data.scheduleFinish);
  return isAfter(finish, start) || finish.getTime() === start.getTime();
}, {
  message: 'Schedule finish must be on or after schedule start',
  path: ['scheduleFinish'],
});

interface FLStep1FormProps {
  data: Partial<FLStep1Data>;
  step2Data?: Partial<FLStep2Data>;
  onDataChange: (data: Partial<FLStep1Data>) => void;
  onNext: () => void;
  defaultProjectId?: string;
}

export function FLStep1Form({ data, step2Data, onDataChange, onNext, defaultProjectId }: FLStep1FormProps) {
  const { projects, fetchProjects } = useProjectStore();
  const { toast } = useToast();

  const form = useForm<FLStep1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      flName: data.flName || '',
      projectId: data.projectId || defaultProjectId || '',
      locationType: data.locationType || 'Onsite',
      contractType: data.contractType || 'T&M',
      timesheetApprover: data.timesheetApprover || '',
      scheduleStart: data.scheduleStart || '',
      scheduleFinish: data.scheduleFinish || '',
      executionEntity: data.executionEntity || '',
      currency: data.currency || '',
      billingRate: data.billingRate || 0,
      rateUom: data.rateUom || 'Day',
      effort: data.effort || 0,
      effortUom: data.effortUom || 'Day',
      revenueAmount: data.revenueAmount || 0,
      expectedRevenue: data.expectedRevenue || 0,
    },
  });

  useEffect(() => {
    fetchProjects({});
  }, [fetchProjects]);

  // Auto-fill execution entity, currency, and timesheet approver from project
  useEffect(() => {
    const watchedProjectId = form.watch('projectId');
    if (watchedProjectId) {
      const project = projects.find(p => p._id === watchedProjectId);
      if (project) {
        form.setValue('executionEntity', project.legalEntity || '');
        form.setValue('currency', project.projectCurrency || 'USD');
        
        // Set contract type from project billing type
        if (project.billingType) {
          form.setValue('contractType', project.billingType as ContractType);
        }
        
        // Auto-populate timesheet approver from PM or DM
        // Prefer Project Manager, fallback to Delivery Manager
        const approver = project.projectManager || project.deliveryManager;
        const approverName = approver?.name || '';
        if (approverName && !form.getValues('timesheetApprover')) {
          form.setValue('timesheetApprover', approverName);
        }
      }
    }
  }, [projects, form]);

  // Calculate effort from Step 2 funding data
  useEffect(() => {
    if (step2Data?.funding && step2Data.funding.length > 0) {
      const totalEffort = step2Data.funding.reduce((sum, funding) => sum + funding.fundingUnits, 0);
      form.setValue('effort', totalEffort);
      onDataChange({ ...data, effort: totalEffort });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step2Data?.funding]);

  // Calculate revenue amount and expected revenue
  useEffect(() => {
    const watchedBillingRate = form.watch('billingRate');
    const watchedEffort = form.watch('effort');
    if (watchedBillingRate && watchedEffort) {
      const revenueAmount = watchedBillingRate * watchedEffort;
      form.setValue('revenueAmount', revenueAmount);
      form.setValue('expectedRevenue', revenueAmount);
    }
  }, [form]);

  // Validate schedule dates are within project dates
  const validateDatesWithinProject = () => {
    const projectId = form.getValues('projectId');
    const scheduleStart = form.getValues('scheduleStart');
    const scheduleFinish = form.getValues('scheduleFinish');

    const project = projects.find(p => p._id === projectId);
    if (project && scheduleStart && scheduleFinish) {
      const flStart = new Date(scheduleStart);
      const flFinish = new Date(scheduleFinish);
      const projStart = new Date(project.projectStartDate);
      const projEnd = new Date(project.projectEndDate);

      if (isBefore(flStart, projStart) || isAfter(flStart, projEnd)) {
        toast({
          title: 'Validation Error',
          description: 'FL Schedule Start must be within project start and end dates',
          variant: 'destructive',
        });
        return false;
      }

      if (isBefore(flFinish, projStart) || isAfter(flFinish, projEnd)) {
        toast({
          title: 'Date Extension Required',
          description: `FL end date (${format(flFinish, 'MMM dd, yyyy')}) extends beyond project end date (${format(projEnd, 'MMM dd, yyyy')}). Please extend the Project End Date first.`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  // Check if FL dates are being extended (for edit mode)
  const checkDateExtension = () => {
    if (!data.scheduleFinish) return true; // Not edit mode or no previous date
    
    const previousEndDate = new Date(data.scheduleFinish);
    const newEndDate = new Date(form.getValues('scheduleFinish'));
    
    if (isAfter(newEndDate, previousEndDate)) {
      // FL end date is being extended
      const confirmed = window.confirm(
        'Financial Line duration is being extended.\n\n' +
        'After saving, please remember to:\n' +
        '• Add additional PO funding allocation for the extended period\n' +
        '• Update planned revenue for the extended months\n\n' +
        'Do you want to continue?'
      );
      
      if (!confirmed) {
        // Reset to original date
        form.setValue('scheduleFinish', data.scheduleFinish);
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    const values = form.getValues();
    console.log('FLStep1 - Form Values:', values);
    
    const result = step1Schema.safeParse(values);
    console.log('FLStep1 - Validation Result:', result);

    if (!result.success) {
      const firstError = result.error.issues[0];
      console.error('FLStep1 - Validation Error:', JSON.stringify(firstError, null, 2));
      console.error('FLStep1 - All validation errors:', result.error.issues);
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    if (!validateDatesWithinProject()) {
      console.error('FLStep1 - Date validation failed');
      return;
    }

    // Check for date extension and show warning
    if (!checkDateExtension()) {
      console.error('FLStep1 - Date extension cancelled by user');
      return;
    }

    console.log('FLStep1 - Validation passed, calling onNext');
    onDataChange(values);
    onNext();
  };

  // Generate FL No for display
  const flNo = `FL-${format(new Date(), 'yyyy')}-XXXX`;
  
  // Get selected project for display
  const selectedProject = projects.find(p => p._id === form.watch('projectId'));

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Basic Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Auto-filled Disabled Fields */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>FL No</FormLabel>
                <FormControl>
                  <Input value={flNo} disabled className="bg-blue-50 border-blue-200" />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Project ID</FormLabel>
                <FormControl>
                  <Input 
                    value={selectedProject?.projectId || '-'} 
                    disabled 
                    className="bg-blue-50 border-blue-200 font-medium" 
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input 
                    value={selectedProject?.projectName || '-'} 
                    disabled 
                    className="bg-blue-50 border-blue-200" 
                  />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="executionEntity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Entity</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-blue-50 border-blue-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-blue-50 border-blue-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Editable Fields */}
              <FormField
                control={form.control}
                name="flName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>FL Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FL name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timesheetApprover"
                render={({ field }) => {
                  const approverOptions: { id: string; name: string; role: string }[] = [];
                  if (selectedProject?.projectManager?.name) {
                    approverOptions.push({ 
                      id: 'pm', 
                      name: selectedProject.projectManager.name, 
                      role: 'Project Manager' 
                    });
                  }
                  if (selectedProject?.deliveryManager?.name && selectedProject.deliveryManager.name !== selectedProject?.projectManager?.name) {
                    approverOptions.push({ 
                      id: 'dm', 
                      name: selectedProject.deliveryManager.name, 
                      role: 'Delivery Manager' 
                    });
                  }
                  
                  return (
                    <FormItem>
                      <FormLabel>Timesheet Approver *</FormLabel>
                      {approverOptions.length > 0 ? (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select approver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {approverOptions.map((approver) => (
                              <SelectItem key={approver.id} value={approver.name}>
                                {approver.name} ({approver.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled 
                            placeholder="Select a project first" 
                            className="bg-gray-100"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type *</FormLabel>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as LocationType)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Offshore">Offshore</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type *</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value} 
                        disabled 
                        className="bg-blue-50 border-blue-200 font-medium"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inherited from project billing type
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduleStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Start *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduleFinish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Finish *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                        placeholder="Select finish date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="billingRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Rate *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate per unit (based on Rate Unit)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateUom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Unit *</FormLabel>
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as UOM)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hr">Hour</SelectItem>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenueAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled
                        className="bg-blue-50 border-blue-200"
                        value={field.value.toFixed(2)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Revenue</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled
                        className="bg-blue-50 border-blue-200"
                        value={field.value.toFixed(2)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>


        <button 
          type="button" 
          onClick={handleNext} 
          className="hidden" 
          id="step1-next" 
        />
      </div>
    </Form>
  );
}
