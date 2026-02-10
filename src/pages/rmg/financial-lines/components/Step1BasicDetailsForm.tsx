import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
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
import type { FLStep1Data } from '@/types/financialLine';
import { useProjectStore } from '@/store/projectStore';

const step1Schema = z.object({
  flName: z.string({ message: 'FL name is required' }).min(1, 'FL name is required').max(150, 'FL name cannot exceed 150 characters'),
  projectId: z.string({ message: 'Project is required' }).min(1, 'Project is required'),
  contractType: z.string({ message: 'Contract type is required' }).min(1, 'Contract type is required'),
  locationType: z.enum(['Onsite', 'Offshore', 'Hybrid'], { message: 'Location type is required' }),
  executionEntity: z.string({ message: 'Execution entity is required' }).min(1, 'Execution entity is required'),
  timesheetApprover: z.string({ message: 'Timesheet approver is required' }).min(1, 'Timesheet approver is required'),
  scheduleStart: z.string({ message: 'Schedule start date is required' }).min(1, 'Schedule start date is required'),
  scheduleEnd: z.string({ message: 'Schedule end date is required' }).min(1, 'Schedule end date is required'),
  currency: z.string({ message: 'Currency is required' }).min(1, 'Currency is required'),
});

type Step1FormValues = z.infer<typeof step1Schema>;

interface Step1FormProps {
  defaultValues?: Partial<FLStep1Data>;
  onNext: (data: FLStep1Data) => void;
  onCancel: () => void;
}

export function Step1BasicDetailsForm({ defaultValues, onNext, onCancel }: Step1FormProps) {
  const { projects = [], fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects({});
  }, [fetchProjects]);

  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: defaultValues || {
      flName: '',
      projectId: '',
      contractType: '',
      locationType: 'Offshore',
      executionEntity: '',
      timesheetApprover: '',
      scheduleStart: '',
      scheduleEnd: '',
      currency: 'USD',
    },
  });

  const activeProjects = projects?.filter((p) => p.status === 'Active') || [];

  // Auto-fill contract type and currency when project is selected
  const selectedProjectId = form.watch('projectId');
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects?.find((p) => p._id === selectedProjectId);
      if (project) {
        form.setValue('contractType', project.billingType);
        // Currency is hardcoded for now as it's not in project schema
      }
    }
  }, [selectedProjectId, projects, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <div className="bg-gradient-to-br from-brand-green/5 to-transparent p-6 rounded-lg border border-brand-light-gray">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Basic Information</h3>
          
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="flName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">FL Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter financial line name" 
                      {...field} 
                      maxLength={150}
                      className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                    />
                  </FormControl>
                  <FormDescription className="text-brand-slate text-xs">Maximum 150 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Project *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeProjects.map((project) => (
                        <SelectItem key={project._id || project.id} value={project._id || project.id || ''}>
                          {project.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Contract Details</h3>
          
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-navy font-medium">Contract Type *</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-brand-green/5 border-brand-light-gray" />
                    </FormControl>
                    <FormDescription className="text-brand-slate text-xs">Inherited from project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-navy font-medium">Currency *</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-brand-green/5 border-brand-light-gray" />
                    </FormControl>
                    <FormDescription className="text-brand-slate text-xs">Inherited from project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Location Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green">
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
              name="executionEntity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Execution Entity *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green">
                        <SelectValue placeholder="Select execution entity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Eviden">Eviden</SelectItem>
                      <SelectItem value="Habile">Habile</SelectItem>
                      <SelectItem value="Akraya">Akraya</SelectItem>
                      <SelectItem value="ECIS">ECIS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timesheetApprover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Timesheet Approver *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter approver name or email" 
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

        <div className="bg-white p-6 rounded-lg border border-brand-light-gray shadow-sm">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Schedule</h3>
          
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="scheduleStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Schedule Start Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                    />
                  </FormControl>
                  <FormDescription className="text-brand-slate text-xs">Must be within project dates</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduleEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-navy font-medium">Schedule End Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      className="border-brand-light-gray focus:border-brand-green focus:ring-brand-green"
                    />
                  </FormControl>
                  <FormDescription className="text-brand-slate text-xs">Must be within project dates</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-brand-light-gray">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-brand-light-gray text-brand-slate hover:bg-brand-green/5"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-brand-green hover:bg-brand-green-dark text-white"
          >
            Next Step →
          </Button>
        </div>
      </form>
    </Form>
  );
}
