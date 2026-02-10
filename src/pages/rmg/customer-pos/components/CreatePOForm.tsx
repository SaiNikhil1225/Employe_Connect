import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Upload, FileText } from 'lucide-react';
import type { CustomerPOFormData } from '@/types/customerPO';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from '@/store/projectStore';
import { useCustomerStore } from '@/store/customerStore';

const poFormSchema = z.object({
  contractNo: z.string().min(1, 'Contract number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  projectName: z.string().min(1, 'Project name is required'),
  poNo: z.string().min(1, 'PO number is required'),
  title: z.string().optional(),
  poCreationDate: z.string().min(1, 'PO creation date is required'),
  poStartDate: z.string().min(1, 'PO start date is required'),
  poValidityDate: z.string().min(1, 'PO validity date is required'),
  customerId: z.string().min(1, 'Customer is required'),
  projectId: z.string().min(1, 'Project is required'),
  bookingEntity: z.string().min(1, 'Booking entity is required'),
  poAmount: z.coerce.number().min(0.01, 'PO amount must be greater than 0'),
  poCurrency: z.string().min(1, 'Currency is required'),
  paymentTerms: z.enum(['Net 30', 'Net 45', 'Net 60', 'Net 90', 'Immediate', 'Custom'], { 
    message: 'Payment terms are required' 
  }),
  autoRelease: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => {
  // PO Validity Date must be >= PO Start Date
  if (data.poStartDate && data.poValidityDate) {
    return new Date(data.poValidityDate) >= new Date(data.poStartDate);
  }
  return true;
}, {
  message: 'PO Validity Date must be on or after PO Start Date',
  path: ['poValidityDate'],
});

type POFormValues = z.infer<typeof poFormSchema>;

interface CreatePOFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
}

export function CreatePOForm({ open, onOpenChange, onSuccess, defaultProjectId }: CreatePOFormProps) {
  const { createPO } = useCustomerPOStore();
  const { toast } = useToast();
  const { projects = [], fetchProjects } = useProjectStore();
  const { customers = [], fetchCustomers } = useCustomerStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contractNo, setContractNo] = useState('');

  // Generate unique contract number
  const generateContractNo = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `CNT-${year}-${String(randomNum).padStart(4, '0')}`;
  };

  useEffect(() => {
    if (open) {
      fetchProjects({});
      fetchCustomers({});
    }
  }, [open, fetchProjects, fetchCustomers]);

  const form = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      contractNo: '',
      customerName: '',
      projectName: '',
      poNo: '',
      title: '',
      poCreationDate: '',
      poStartDate: '',
      poValidityDate: '',
      customerId: '',
      projectId: '',
      bookingEntity: '',
      poAmount: 0,
      poCurrency: 'USD',
      paymentTerms: 'Net 30',
      autoRelease: true,
      notes: '',
    },
  });

  // Auto-select project when form opens with defaultProjectId
  useEffect(() => {
    if (open && defaultProjectId) {
      form.setValue('projectId', defaultProjectId);
      // Generate contract number when form opens
      const newContractNo = generateContractNo();
      setContractNo(newContractNo);
      form.setValue('contractNo', newContractNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultProjectId]);

  // Auto-fill fields when project is selected
  const selectedProjectId = form.watch('projectId');
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects?.find((p) => p._id === selectedProjectId || p.id === selectedProjectId);
      if (project) {
        // Auto-fill project name
        form.setValue('projectName', project.projectName || '');
        
        // Auto-fill customer
        if (project.customerId) {
          const customerId = typeof project.customerId === 'string' 
            ? project.customerId 
            : (project.customerId as { _id?: string })?._id || '';
          form.setValue('customerId', customerId);
          
          // Find customer name
          const customer = customers?.find((c) => c._id === customerId || c.id === customerId);
          if (customer) {
            form.setValue('customerName', customer.customerName || project.accountName || '');
          } else {
            form.setValue('customerName', project.accountName || '');
          }
        } else {
          form.setValue('customerName', project.accountName || '');
        }
        
        // Auto-fill booking entity from legal entity
        if (project.legalEntity) {
          form.setValue('bookingEntity', project.legalEntity);
        }
        
        // Auto-fill currency from project currency
        if (project.projectCurrency) {
          form.setValue('poCurrency', project.projectCurrency);
        }
      }
    }
  }, [selectedProjectId, projects, customers, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (data: POFormValues) => {
    try {
      // Validate project context
      if (!selectedProjectId) {
        toast({
          title: 'Error',
          description: 'Project context is required to create a PO',
          variant: 'destructive',
        });
        return;
      }

      // Get selected project for date validation
      const project = projects?.find((p) => p._id === selectedProjectId || p.id === selectedProjectId);
      if (project) {
        const projectStartDate = new Date(project.projectStartDate);
        const projectEndDate = new Date(project.projectEndDate);
        const poStartDate = new Date(data.poStartDate);
        const poValidityDate = new Date(data.poValidityDate);

        // Validate PO Start Date is within project dates
        if (poStartDate < projectStartDate || poStartDate > projectEndDate) {
          toast({
            title: 'Validation Error',
            description: 'PO Start Date must fall within the project start and end dates',
            variant: 'destructive',
          });
          return;
        }

        // Validate PO Validity Date is within project end date
        if (poValidityDate > projectEndDate) {
          toast({
            title: 'Validation Error',
            description: 'PO Validity Date must be on or before the project end date',
            variant: 'destructive',
          });
          return;
        }
      }

      const poData: CustomerPOFormData = {
        contractNo: data.contractNo,
        poNo: data.poNo,
        customerId: data.customerId,
        projectId: data.projectId,
        bookingEntity: data.bookingEntity as 'Eviden' | 'Habile' | 'Akraya' | 'ECIS',
        poCreationDate: data.poCreationDate,
        poStartDate: data.poStartDate,
        poValidityDate: data.poValidityDate,
        poAmount: data.poAmount,
        poCurrency: data.poCurrency,
        paymentTerms: data.paymentTerms,
        autoRelease: data.autoRelease,
        status: 'Active',
        notes: data.notes,
      };

      await createPO(poData);
      
      toast({
        title: 'Success',
        description: 'Customer PO created successfully',
      });
      
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create PO';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setUploadedFile(null);
    setContractNo('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-3xl w-full">
        <SheetHeader className="pb-6 border-b border-brand-light-gray">
          <SheetTitle className="text-2xl font-bold text-brand-navy">Create Customer PO</SheetTitle>
          <SheetDescription className="text-brand-slate">
            Fill in the purchase order details to create a new customer PO.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6 pb-6">
            {/* Hidden fields for IDs */}
            <input type="hidden" {...form.register('projectId')} />
            <input type="hidden" {...form.register('customerId')} />
            
            {/* Auto-Filled Fields Section - Read Only */}
            <div className="bg-gradient-to-br from-blue-50 to-transparent p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-brand-navy mb-2">Auto-Generated & Project Details</h3>
              <p className="text-xs text-brand-slate mb-4">These fields are automatically filled and cannot be edited</p>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="contractNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">Contract No *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          disabled
                          className="bg-gray-50 border-brand-light-gray cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-slate text-xs">
                        Auto-generated contract number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">Project *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          disabled
                          className="bg-gray-50 border-brand-light-gray cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-slate text-xs">
                        Auto-filled from current project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">Customer Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          disabled
                          className="bg-gray-50 border-brand-light-gray cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-slate text-xs">
                        Auto-filled from project's customer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingEntity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">Booking Entity *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          disabled
                          className="bg-gray-50 border-brand-light-gray cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-slate text-xs">
                        Auto-filled from project's Legal Entity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PO Details Section - Editable */}
            <div className="bg-gradient-to-br from-brand-green/5 to-transparent p-6 rounded-lg border border-brand-light-gray">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">PO Details</h3>
              
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="poNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO No *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter PO number" 
                          {...field}
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter PO title (optional)" 
                          {...field}
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PO Dates Section */}
            <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">PO Dates</h3>
              
              <div className="grid gap-5 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="poCreationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO Creation Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select creation date"
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poValidityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO Validity Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select validity date"
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Info Section */}
            <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Financial Info</h3>
              
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="poAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO Amount *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter PO amount" 
                          {...field}
                          className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-navy font-medium">PO Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Payment Terms Section */}
            <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Payment & Terms</h3>
              
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-navy font-medium">Payment Terms (Days) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green">
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Net 90">Net 90</SelectItem>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Upload Section */}
            <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Document Upload</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-brand-navy">PO Document</label>
                <div className="border-2 border-dashed border-brand-light-gray rounded-lg p-6 hover:border-brand-green transition-colors">
                  <input
                    type="file"
                    id="po-document"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="po-document"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-brand-slate mb-2" />
                    <span className="text-sm font-medium text-brand-navy mb-1">
                      Click to upload PO document
                    </span>
                    <span className="text-xs text-brand-slate">PDF, DOC, DOCX up to 10MB</span>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-brand-navy bg-brand-green/10 p-3 rounded-md">
                    <FileText className="h-4 w-4 text-brand-green" />
                    <span>{uploadedFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Other Options Section */}
            <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Other Options</h3>
              
              <FormField
                control={form.control}
                name="autoRelease"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-brand-light-gray data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-brand-navy font-medium">
                        Auto Release *
                      </FormLabel>
                      <FormDescription className="text-brand-slate text-xs">
                        Automatically release this PO when conditions are met
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-brand-navy font-medium">Notes</FormLabel>
                    <FormControl>
                      <textarea 
                        placeholder="Add any additional notes (optional)" 
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-brand-light-gray rounded-md focus:border-brand-green focus:ring-brand-green focus:ring-1 outline-none resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-brand-light-gray">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="border-brand-light-gray text-brand-slate hover:bg-brand-green/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-brand-green hover:bg-brand-green-dark text-white px-8"
              >
                Complete
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
