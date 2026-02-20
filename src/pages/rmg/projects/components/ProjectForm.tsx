import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import type { ProjectFormData } from '@/types/project';
import type { Customer } from '@/types/customer';
import { useCustomerStore } from '@/store/customerStore';
import { configService, type ConfigMaster } from '@/services/configService';
import axios from 'axios';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { SinglePersonPicker } from '@/components/ui/single-person-picker';
import { RotateCcw, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stepper } from '@/components/ui/stepper';

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
  customerId: z.string({ message: 'Customer is required. Please select a customer from Account Name.' }).min(1, 'Customer is required'),
  projectName: z.string({ message: 'Project name is required' }).min(1, 'Project name is required').max(100, 'Max 100 characters'),
  projectDescription: z.string().optional().or(z.literal('')),
  accountName: z.string({ message: 'Account name is required' }).min(1, 'Account name is required'),
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
});

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
  const [nextProjectId, setNextProjectId] = useState<string>(defaultValues?.projectId || '');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

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
      projectId: '',
      customerId: '',
      projectName: '',
      projectDescription: '',
      accountName: '',
      hubspotDealId: '',
      legalEntity: 'Acuvate Software Pvt Ltd - India',
      projectManager: '',
      deliveryManager: '',
      dealOwner: '',
      billingType: '',
      practiceUnit: undefined,
      region: undefined,
      industry: '',
      regionHead: '',
      leadSource: '',
      revenueType: '',
      clientType: '',
      projectWonThroughRFP: false,
      projectStartDate: '',
      projectEndDate: '',
      projectCurrency: '',
      ...defaultValues,
    },
  });

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  // Fetch next project ID for create mode
  useEffect(() => {
    if (!isEditMode && !defaultValues?.projectId) {
      const fetchNextId = async () => {
        try {
          const response = await axios.get('/api/projects/next-id');
          const nextId = response.data.data;
          setNextProjectId(nextId);
          form.setValue('projectId', nextId);
        } catch (error) {
          console.error('Failed to fetch next project ID:', error);
        }
      };
      fetchNextId();
    }
  }, [isEditMode, defaultValues?.projectId, form]);

  // Auto-populate fields when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('industry', selectedCustomer.industry || '');
      
      // Set region with proper type assertion
      const customerRegion = selectedCustomer.region;
      if (customerRegion && ['UK', 'India', 'USA', 'ME', 'Other'].includes(customerRegion)) {
        form.setValue('region', customerRegion as 'UK' | 'India' | 'USA' | 'ME' | 'Other');
      }
      
      form.setValue('regionHead', selectedCustomer.regionHead || '');
      
      // Also set hubspotRecordId if available
      if (selectedCustomer.hubspotRecordId) {
        form.setValue('hubspotDealId', selectedCustomer.hubspotRecordId);
      }
    }
  }, [selectedCustomer, form]);

  // Handle customer selection
  const handleCustomerChange = (customerName: string) => {
    form.setValue('accountName', customerName);
    const customer = customers.find(c => c.customerName === customerName);
    setSelectedCustomer(customer || null);
    setIsCustomerSelected(!!customer);
    
    // Set customerId from the selected customer
    if (customer && customer._id) {
      form.setValue('customerId', customer._id);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const steps = [
    { id: 1, title: 'Basic Details', description: 'Project information' },
    { id: 2, title: 'Schedule & Status', description: 'Timeline and status' },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
        {/* Step Indicator */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">{/* Step 1: Basic Details */}
          {currentStep === 1 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Project ID */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-generated" 
                        {...field} 
                        value={field.value || nextProjectId || 'Generating...'} 
                        disabled 
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Auto-generated ID (e.g., P001)
                    </FormDescription>
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

              {/* Project Description - Full Width */}
              <div className="lg:col-span-2">
                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the project" {...field} disabled={isEditMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      <Input placeholder="DEAL-12345" {...field} disabled={isEditMode} />
                    </FormControl>
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
                        disabled={isEditMode}
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
                        disabled={isEditMode}
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
                        disabled={isEditMode}
                      />
                    </FormControl>
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
                          <SelectValue placeholder={configLoading ? "Loading..." : billingTypes.length === 0 ? "No active values configured" : "Select billing type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No active billing types configured
                          </div>
                        ) : (
                          billingTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="AiB & Automation">AiB & Automation</SelectItem>
                        <SelectItem value="GenAI">GenAI</SelectItem>
                        <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                        <SelectItem value="Cloud Engineering">Cloud Engineering</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || isCustomerSelected}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || isCustomerSelected}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? "Loading..." : leadSources.length === 0 ? "No active values configured" : "Select lead source"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadSources.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No active lead sources configured
                          </div>
                        ) : (
                          leadSources.map((source) => (
                            <SelectItem key={source._id} value={source.name}>
                              {source.name}
                            </SelectItem>
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
                          <SelectValue placeholder={configLoading ? "Loading..." : revenueTypes.length === 0 ? "No active values configured" : "Select revenue type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {revenueTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No active revenue types configured
                          </div>
                        ) : (
                          revenueTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>
                              {type.name}
                            </SelectItem>
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
                          <SelectValue placeholder={configLoading ? "Loading..." : clientTypes.length === 0 ? "No active values configured" : "Select client type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientTypes.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            No active client types configured
                          </div>
                        ) : (
                          clientTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>
                              {type.name}
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Project Won Through RFP *</FormLabel>
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
              />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Schedule & Status */}
          {currentStep === 2 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Start Date */}
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
                              disabled={isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
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
                              disabled={isEditMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currency */}
                    <FormField
                      control={form.control}
                      name="projectCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Currency *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || configLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={configLoading ? "Loading..." : currencies.length === 0 ? "No active values configured" : "Select currency"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  No active currencies configured
                                </div>
                              ) : (
                                currencies.map((currency) => (
                                  <SelectItem key={currency._id} value={currency.name}>
                                    {currency.name} {currency.description && `- ${currency.description}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 mt-6">
          <div className="flex justify-between gap-3">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="gap-2"
                >
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
