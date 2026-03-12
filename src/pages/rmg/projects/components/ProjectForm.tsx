import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import type { ProjectFormData } from '@/types/project';
import type { Customer } from '@/types/customer';
import { useCustomerStore } from '@/store/customerStore';
import { configService, type ConfigMaster } from '@/services/configService';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { SinglePersonPicker } from '@/components/ui/single-person-picker';
import { RotateCcw, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { toast } from 'sonner';

// Dropdown options
const LEGAL_ENTITIES = [
  'Acuvate Software Pvt Ltd - India',
  'Acuvate Software Ltd - UK',
  'Acuvate Software Inc - USA',
  'Acuvate Software ME - Dubai',
] as const;

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Retail & E-commerce',
  'Manufacturing',
  'Energy & Utilities',
  'Media & Entertainment',
  'Telecommunications',
  'Government',
  'Education',
  'Other',
] as const;

const REGION_HEADS = [
  'Anil Kumar',
  'James Wilson',
  'Sarah Mitchell',
  'Mohammed Al-Rashid',
] as const;

// Validation schema
const projectSchema = z.object({
  projectId: z.string().optional(),
  customerId: z.string().default('').refine((val) => val.length > 0, {
    message: 'Customer is required. Please select a customer from Account Name.',
  }),
  projectName: z.string({ message: 'Project name is required' }).min(1, 'Project name is required').max(100, 'Max 100 characters'),
  projectDescription: z.string().optional().or(z.literal('')),
  accountName: z.string().default('').refine((val) => val.length > 0, {
    message: 'Account name is required',
  }),
  hubspotDealId: z.string().optional().or(z.literal('')),
  legalEntity: z.string({ message: 'Legal entity is required' }).min(1, 'Legal entity is required'),
  projectManager: z.string({ message: 'Project manager is required' }).min(1, 'Project manager is required'),
  deliveryManager: z.string({ message: 'Delivery manager is required' }).min(1, 'Delivery manager is required'),
  dealOwner: z.string({ message: 'Deal owner is required' }).min(1, 'Deal owner is required'),
  billingType: z.string({ message: 'Billing type is required' }).min(1, 'Billing type is required'),
  practiceUnit: z.enum(['AiB & Automation', 'GenAI', 'Data & Analytics', 'Cloud Engineering', 'Other'], { message: 'Practice unit is required' }),
  region: z.enum(['UK', 'India', 'USA', 'ME', 'Other'], { message: 'Region is required' }),
  industry: z.string({ message: 'Industry is required' }).min(1, 'Industry is required'),
  regionHead: z.string({ message: 'Region head is required' }).min(1, 'Region head is required'),
  leadSource: z.string({ message: 'Lead source is required' }).min(1, 'Lead source is required'),
  revenueType: z.string({ message: 'Revenue type is required' }).min(1, 'Revenue type is required'),
  clientType: z.string({ message: 'Client type is required' }).min(1, 'Client type is required'),
  projectWonThroughRFP: z.boolean().default(false),
  projectStartDate: z.string({ message: 'Start date is required' }).min(1, 'Start date is required'),
  projectEndDate: z.string({ message: 'End date is required' }).min(1, 'End date is required'),
  projectCurrency: z.string({ message: 'Currency is required' }).min(1, 'Currency is required'),
  status: z.string().optional(),
  estimatedValue: z.number().optional(),
}).refine(
  (data) => {
    if (data.projectStartDate && data.projectEndDate) {
      return new Date(data.projectEndDate) >= new Date(data.projectStartDate);
    }
    return true;
  },
  { message: 'Project End Date must be after or equal to Start Date', path: ['projectEndDate'] },
);

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  defaultValues?: Partial<ProjectFormData>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean; // Add flag to indicate edit mode
}

export function ProjectForm({
  onSubmit,
  defaultValues,
  isLoading,
  submitLabel = 'Create Project',
  isEditMode = false,
}: ProjectFormProps) {
  const { customers, fetchCustomers } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Configuration state
  const [leadSources, setLeadSources] = useState<ConfigMaster[]>([]);
  const [revenueTypes, setRevenueTypes] = useState<ConfigMaster[]>([]);
  const [clientTypes, setClientTypes] = useState<ConfigMaster[]>([]);
  const [billingTypes, setBillingTypes] = useState<ConfigMaster[]>([]);
  const [currencies, setCurrencies] = useState<ConfigMaster[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectId: defaultValues?.projectId || '',
      customerId: typeof defaultValues?.customerId === 'object' && defaultValues?.customerId !== null
        ? String((defaultValues.customerId as any)?._id || (defaultValues.customerId as any)?.id || defaultValues.customerId)
        : (defaultValues?.customerId || ''),
      projectName: defaultValues?.projectName || '',
      projectDescription: defaultValues?.projectDescription || '',
      accountName: defaultValues?.accountName || '',
      hubspotDealId: defaultValues?.hubspotDealId || '',
      legalEntity: defaultValues?.legalEntity || 'Acuvate Software Pvt Ltd - India',
      projectManager: defaultValues?.projectManager || '',
      deliveryManager: defaultValues?.deliveryManager || '',
      dealOwner: defaultValues?.dealOwner || '',
      billingType: defaultValues?.billingType || '',
      practiceUnit: defaultValues?.practiceUnit,
      region: defaultValues?.region,
      industry: defaultValues?.industry || '',
      regionHead: defaultValues?.regionHead || '',
      leadSource: defaultValues?.leadSource || '',
      revenueType: defaultValues?.revenueType || '',
      clientType: defaultValues?.clientType || '',
      projectWonThroughRFP: defaultValues?.projectWonThroughRFP || false,
      projectStartDate: defaultValues?.projectStartDate || '',
      projectEndDate: defaultValues?.projectEndDate || '',
      projectCurrency: defaultValues?.projectCurrency || '',
      status: defaultValues?.status || 'Draft',
      estimatedValue: defaultValues?.estimatedValue || 0,
    },
  });

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Set isCustomerSelected to true in edit mode if customer data exists
  useEffect(() => {
    if (isEditMode && defaultValues?.customerId && defaultValues?.accountName && customers.length > 0) {
      const timer = setTimeout(() => {
        setIsCustomerSelected(true);
        const customerIdStr = typeof defaultValues.customerId === 'object' && defaultValues.customerId !== null
          ? String((defaultValues.customerId as any)?._id || (defaultValues.customerId as any)?.id || defaultValues.customerId)
          : String(defaultValues.customerId);
        const customer = customers.find(c => {
          const cIdStr = String(c._id || c.id);
          return cIdStr === customerIdStr;
        });
        setSelectedCustomer(customer || null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isEditMode, defaultValues?.customerId, defaultValues?.accountName, customers]);

  // Fetch configuration values on mount
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setConfigLoading(true);
        const [leadSourcesData, revenueTypesData, clientTypesData, billingTypesData, currenciesData] = await Promise.all([
          configService.getActiveByType('lead-source'),
          configService.getActiveByType('revenue-type'),
          configService.getActiveByType('client-type'),
          configService.getActiveByType('billing-type'),
          configService.getActiveByType('project-currency'),
        ]);
        setLeadSources(leadSourcesData);
        setRevenueTypes(revenueTypesData);
        setClientTypes(clientTypesData);
        setBillingTypes(billingTypesData);
        setCurrencies(currenciesData);
      } catch (error) {
        console.error('Failed to fetch configurations:', error);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfigurations();
  }, []);

  // Reset form with defaultValues when editing a different project
  useEffect(() => {
    if (isEditMode && defaultValues && defaultValues.projectId) {
      const safeDefaults = {
        projectId: defaultValues.projectId || '',
        customerId: typeof defaultValues.customerId === 'object' && defaultValues.customerId !== null
          ? String((defaultValues.customerId as any)?._id || (defaultValues.customerId as any)?.id || defaultValues.customerId)
          : (defaultValues.customerId || ''),
        projectName: defaultValues.projectName || '',
        projectDescription: defaultValues.projectDescription || '',
        accountName: defaultValues.accountName || '',
        hubspotDealId: defaultValues.hubspotDealId || '',
        legalEntity: defaultValues.legalEntity || 'Acuvate Software Pvt Ltd - India',
        projectManager: defaultValues.projectManager || '',
        deliveryManager: defaultValues.deliveryManager || '',
        dealOwner: defaultValues.dealOwner || '',
        billingType: defaultValues.billingType || '',
        practiceUnit: defaultValues.practiceUnit,
        region: defaultValues.region,
        industry: defaultValues.industry || '',
        regionHead: defaultValues.regionHead || '',
        leadSource: defaultValues.leadSource || '',
        revenueType: defaultValues.revenueType || '',
        clientType: defaultValues.clientType || '',
        projectWonThroughRFP: defaultValues.projectWonThroughRFP || false,
        projectStartDate: defaultValues.projectStartDate || '',
        projectEndDate: defaultValues.projectEndDate || '',
        projectCurrency: defaultValues.projectCurrency || '',
        status: defaultValues.status || 'Draft',
        estimatedValue: defaultValues.estimatedValue || 0,
      };
      form.reset(safeDefaults);
      if (defaultValues.customerId) {
        setTimeout(() => {
          form.setValue('customerId', defaultValues.customerId, { shouldValidate: false });
          form.setValue('accountName', defaultValues.accountName || '', { shouldValidate: false });
        }, 0);
      }
    }
  }, [isEditMode, defaultValues?.projectId, form]);

  // Auto-populate fields when customer is selected (only in create mode)
  useEffect(() => {
    if (selectedCustomer && !isEditMode) {
      form.setValue('industry', selectedCustomer.industry || '');
      const customerRegion = selectedCustomer.region;
      if (customerRegion && ['UK', 'India', 'USA', 'ME', 'Other'].includes(customerRegion)) {
        form.setValue('region', customerRegion as 'UK' | 'India' | 'USA' | 'ME' | 'Other');
      }
      form.setValue('regionHead', selectedCustomer.regionHead || '');
      if (selectedCustomer.hubspotRecordId) {
        form.setValue('hubspotDealId', selectedCustomer.hubspotRecordId);
      }
    }
  }, [selectedCustomer, form, isEditMode]);

  // Handle customer selection
  const handleCustomerChange = (customerName: string) => {
    form.setValue('accountName', customerName);
    const customer = customers.find(c => c.customerName === customerName);
    setSelectedCustomer(customer || null);
    setIsCustomerSelected(!!customer);
    if (customer && customer._id) {
      const customerIdStr = typeof customer._id === 'object'
        ? String((customer._id as any)._id || (customer._id as any).id || customer._id)
        : String(customer._id);
      form.setValue('customerId', customerIdStr);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      throw error;
    }
  };

  const steps = [
    { id: 1, title: 'Basic Details', description: 'Project information' },
    { id: 2, title: 'Assigning', description: 'Ownership & classification' },
    { id: 3, title: 'Schedule & Status', description: 'Timeline and status' },
  ];

  const handleNext = async () => {
    if (currentStep >= totalSteps) return;
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        'customerId', 'accountName', 'projectName',
        'hubspotDealId', 'legalEntity', 'region', 'industry', 'regionHead',
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        'projectManager', 'deliveryManager', 'dealOwner', 'practiceUnit',
        'leadSource', 'billingType', 'revenueType', 'clientType', 'projectCurrency',
      ];
    }
    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) {
      const errors = form.formState.errors;
      const firstError = Object.entries(errors)[0];
      if (firstError) {
        const [fieldName, error] = firstError;
        toast.error((error as any)?.message || `${fieldName} is required`);
      }
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      form.clearErrors();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        const firstError = Object.entries(errors)[0];
        if (firstError) {
          const [fieldName, error] = firstError;
          toast.error((error as any)?.message || 'Please fix form errors before submitting');
          const step1Fields = ['customerId', 'accountName', 'projectName', 'projectDescription', 'hubspotDealId', 'legalEntity', 'region', 'industry', 'regionHead'];
          const step2Fields = ['projectManager', 'deliveryManager', 'dealOwner', 'leadSource', 'billingType', 'revenueType', 'clientType', 'projectCurrency'];
          if (step1Fields.includes(fieldName)) setCurrentStep(1);
          else if (step2Fields.includes(fieldName)) setCurrentStep(2);
        } else {
          toast.error('Please fix form errors before submitting');
        }
      })} className="flex flex-col h-full">

        {/* Step Indicator */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              STEP 1 â€” Basic Details
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Account Name */}
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <Select onValueChange={handleCustomerChange} value={field.value} disabled={isEditMode}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No customers found</div>
                          ) : (
                            customers.map((customer) => (
                              <SelectItem key={customer._id || customer.id} value={customer.customerName}>
                                {customer.customerName} ({customer.customerNo})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* HubSpot Deal ID */}
                <FormField
                  control={form.control}
                  name="hubspotDealId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HubSpot Deal ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DEAL-12345"
                          {...field}
                          readOnly={isEditMode || isCustomerSelected}
                          className={(isEditMode || isCustomerSelected) ? 'bg-muted opacity-60 cursor-not-allowed' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Region */}
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region *</FormLabel>
                      {isCustomerSelected ? (
                        <FormControl>
                          <Input
                            value={field.value || ''}
                            readOnly
                            placeholder="Auto-populated from customer"
                            className="bg-muted opacity-60 cursor-not-allowed"
                          />
                        </FormControl>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UK">UK</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="ME">Middle East</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      {(isEditMode || isCustomerSelected) ? (
                        <FormControl>
                          <Input
                            value={field.value || ''}
                            readOnly
                            placeholder="Auto-populated from customer"
                            className="bg-muted opacity-60 cursor-not-allowed"
                          />
                        </FormControl>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Region Head */}
                <FormField
                  control={form.control}
                  name="regionHead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region Head *</FormLabel>
                      {isCustomerSelected ? (
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            placeholder="Auto-populated from customer"
                            className="bg-muted opacity-60 cursor-not-allowed"
                          />
                        </FormControl>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region head" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGION_HEADS.map((head) => (
                              <SelectItem key={head} value={head}>
                                {head}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Legal Entity */}
                <FormField
                  control={form.control}
                  name="legalEntity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Entity *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select legal entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEGAL_ENTITIES.map((entity) => (
                            <SelectItem key={entity} value={entity}>
                              {entity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} disabled={isEditMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Project Description â€” full width */}
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the project"
                        rows={3}
                        {...field}
                        disabled={isEditMode}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              STEP 2 â€” Assigning
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Project Manager */}
              <FormField
                control={form.control}
                name="projectManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager *</FormLabel>
                    <FormControl>
                      <SinglePersonPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select project manager"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Manager */}
              <FormField
                control={form.control}
                name="deliveryManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Manager *</FormLabel>
                    <FormControl>
                      <SinglePersonPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select delivery manager"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deal Owner */}
              <FormField
                control={form.control}
                name="dealOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Owner *</FormLabel>
                    <FormControl>
                      <SinglePersonPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select deal owner"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Practice Unit */}
              <FormField
                control={form.control}
                name="practiceUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select practice unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AiB & Automation">AiB &amp; Automation</SelectItem>
                        <SelectItem value="GenAI">GenAI</SelectItem>
                        <SelectItem value="Data & Analytics">Data &amp; Analytics</SelectItem>
                        <SelectItem value="Cloud Engineering">Cloud Engineering</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lead Source */}
              <FormField
                control={form.control}
                name="leadSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? 'Loading...' : leadSources.length === 0 ? 'No active values configured' : 'Select lead source'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadSources.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No active lead sources configured</div>
                        ) : (
                          leadSources.map((source) => (
                            <SelectItem key={source._id} value={source.name}>{source.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billing Type */}
              <FormField
                control={form.control}
                name="billingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? 'Loading...' : billingTypes.length === 0 ? 'No active values configured' : 'Select billing type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No active billing types configured</div>
                        ) : (
                          billingTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>{type.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Revenue Type */}
              <FormField
                control={form.control}
                name="revenueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? 'Loading...' : revenueTypes.length === 0 ? 'No active values configured' : 'Select revenue type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {revenueTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No active revenue types configured</div>
                        ) : (
                          revenueTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>{type.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client Type */}
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? 'Loading...' : clientTypes.length === 0 ? 'No active values configured' : 'Select client type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No active client types configured</div>
                        ) : (
                          clientTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>{type.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Currency */}
              <FormField
                control={form.control}
                name="projectCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? 'Loading...' : currencies.length === 0 ? 'No active values configured' : 'Select currency'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No active currencies configured</div>
                        ) : (
                          currencies.map((currency) => (
                            <SelectItem key={currency._id} value={currency.name}>
                              {currency.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Project Won Through RFP */}
              <FormField
                control={form.control}
                name="projectWonThroughRFP"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Won Through RFP?</FormLabel>
                      <FormDescription className="text-xs">
                        Was this project won through an RFP process?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 cursor-pointer"
                        disabled={isEditMode}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />            </div>
          )}

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              STEP 3 â€” Schedule & Status
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Project Start Date */}
              <FormField
                control={form.control}
                name="projectStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Start Date *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project End Date */}
              <FormField
                control={form.control}
                name="projectEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project End Date *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end date"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Must be on or after the start date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 mt-6">
          <div className="flex justify-between gap-3">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => { form.reset(); setCurrentStep(1); }} disabled={isLoading} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext} disabled={isLoading} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : submitLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
