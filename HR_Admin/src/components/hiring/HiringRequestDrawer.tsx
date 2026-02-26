import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHiringStore } from '@/store/hiringStore';
import { hiringRequestSchema } from '@/schemas/hiringSchema';
import type { HiringRequestFormData } from '@/schemas/hiringSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, Send, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HiringRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editId?: string;
}

export function HiringRequestDrawer({ open, onOpenChange, onSuccess, editId }: HiringRequestDrawerProps) {
  const { createRequest, updateRequest, fetchRequestById, currentRequest, submitRequest } = useHiringStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplacementDetails, setShowReplacementDetails] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HiringRequestFormData>({
    resolver: zodResolver(hiringRequestSchema) as any,
    defaultValues: {
      candidateName: '',
      budgetRange: { currency: 'INR', min: 0, max: 0 },
      minimumYears: 0,
    },
  });

  const hiringType = watch('hiringType');
  const preferredJoiningDate = watch('preferredJoiningDate');
  const replacementLastWorkingDay = watch('replacementDetails.lastWorkingDay');

  useEffect(() => {
    if (hiringType === 'Replacement') {
      setShowReplacementDetails(true);
    } else {
      setShowReplacementDetails(false);
      setValue('replacementDetails', undefined);
    }
  }, [hiringType, setValue]);

  useEffect(() => {
    if (editId) {
      fetchRequestById(editId);
    }
  }, [editId, fetchRequestById]);

  useEffect(() => {
    if (currentRequest && editId) {
      // Populate form with existing data
      setValue('candidateName', currentRequest.candidateName || '');
      setValue('jobTitle', currentRequest.jobTitle);
      setValue('employmentType', currentRequest.employmentType);
      setValue('hiringType', currentRequest.hiringType);
      setValue('minimumYears', currentRequest.minimumYears);
      setValue('preferredIndustry', currentRequest.preferredIndustry || '');
      setValue('workLocation', currentRequest.workLocation);
      setValue('preferredJoiningDate', new Date(currentRequest.preferredJoiningDate));
      setValue('shiftOrHours', currentRequest.shiftOrHours || '');
      setValue('budgetRange', currentRequest.budgetRange);
      setValue('justification', currentRequest.justification);
      setValue('contactPhone', currentRequest.contactPhone);
      
      if (currentRequest.replacementDetails) {
        setValue('replacementDetails', {
          ...currentRequest.replacementDetails,
          lastWorkingDay: new Date(currentRequest.replacementDetails.lastWorkingDay)
        });
        setShowReplacementDetails(true);
      }
    }
  }, [currentRequest, editId, setValue]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      reset();
      setShowReplacementDetails(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: HiringRequestFormData, saveAsDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      if (editId) {
        // Update existing request
        await updateRequest(editId, data);
        toast.success('Request updated successfully');
      } else {
        // Create new request
        const newRequest = await createRequest(data);
        
        if (!saveAsDraft && newRequest?._id) {
          // Submit immediately if not draft
          await submitRequest(newRequest._id);
          toast.success('Request created and submitted successfully');
        } else {
          toast.success('Request saved as draft');
        }
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data: HiringRequestFormData) => onSubmit(data, true))();
  };

  const handleSubmitRequest = () => {
    handleSubmit((data: HiringRequestFormData) => onSubmit(data, false))();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {editId ? 'Edit Hiring Request' : 'New Hiring Request'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the details below to create a hiring request
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form className="space-y-6">
            {/* Candidate Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Candidate Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="candidateName">
                  Name of Employee/Candidate
                </Label>
                <Input
                  id="candidateName"
                  {...register('candidateName')}
                  placeholder="Enter candidate name (if known)"
                />
                {errors.candidateName && (
                  <p className="text-sm text-red-500">{errors.candidateName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Optional: Leave blank if candidate not yet identified</p>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Job Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    {...register('jobTitle')}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">
                    Employment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('employmentType')}
                    onValueChange={(value) => setValue('employmentType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employmentType && (
                    <p className="text-sm text-red-500">{errors.employmentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hiringType">
                    Hiring Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('hiringType')}
                    onValueChange={(value) => setValue('hiringType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Position">New Position</SelectItem>
                      <SelectItem value="Replacement">Replacement</SelectItem>
                      <SelectItem value="Backfill">Backfill</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.hiringType && (
                    <p className="text-sm text-red-500">{errors.hiringType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumYears">
                    Minimum Experience (Years) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="minimumYears"
                    type="number"
                    {...register('minimumYears', { valueAsNumber: true })}
                    placeholder="e.g., 3"
                  />
                  {errors.minimumYears && (
                    <p className="text-sm text-red-500">{errors.minimumYears.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredIndustry">Preferred Industry</Label>
                  <Input
                    id="preferredIndustry"
                    {...register('preferredIndustry')}
                    placeholder="e.g., FinTech, E-commerce"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLocation">
                    Work Location <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('workLocation')}
                    onValueChange={(value) => setValue('workLocation', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workLocation && (
                    <p className="text-sm text-red-500">{errors.workLocation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Preferred Joining Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !preferredJoiningDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {preferredJoiningDate ? format(preferredJoiningDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        selected={preferredJoiningDate}
                        onSelect={(date) => setValue('preferredJoiningDate', date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.preferredJoiningDate && (
                    <p className="text-sm text-red-500">{errors.preferredJoiningDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shiftOrHours">Shift/Working Hours</Label>
                  <Input
                    id="shiftOrHours"
                    {...register('shiftOrHours')}
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>
              </div>
            </div>

            {/* Replacement Details (Conditional) */}
            {showReplacementDetails && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground">Replacement Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="replacementName">
                      Employee Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="replacementName"
                      {...register('replacementDetails.employeeName')}
                      placeholder="Name of person being replaced"
                    />
                    {errors.replacementDetails?.employeeName && (
                      <p className="text-sm text-red-500">{errors.replacementDetails.employeeName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replacementId">
                      Employee ID (Optional)
                    </Label>
                    <Input
                      id="replacementId"
                      placeholder="Employee ID (if known)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Last Working Day <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !replacementLastWorkingDay && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {replacementLastWorkingDay ? format(replacementLastWorkingDay, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          selected={replacementLastWorkingDay}
                          onSelect={(date) => setValue('replacementDetails.lastWorkingDay', date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.replacementDetails?.lastWorkingDay && (
                      <p className="text-sm text-red-500">{errors.replacementDetails.lastWorkingDay.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replacementReason">
                      Reason <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="replacementReason"
                      {...register('replacementDetails.reasonForReplacement')}
                      placeholder="e.g., Resignation, Transfer"
                    />
                    {errors.replacementDetails?.reasonForReplacement && (
                      <p className="text-sm text-red-500">{errors.replacementDetails.reasonForReplacement.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Budget Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Budget Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={watch('budgetRange.currency')}
                    onValueChange={(value) => setValue('budgetRange.currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minBudget">
                    Min Budget
                  </Label>
                  <Input
                    id="minBudget"
                    type="number"
                    {...register('budgetRange.min', { valueAsNumber: true })}
                    placeholder="e.g., 50000"
                  />
                  {errors.budgetRange?.min && (
                    <p className="text-sm text-red-500">{errors.budgetRange.min.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxBudget">
                    Max Budget
                  </Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    {...register('budgetRange.max', { valueAsNumber: true })}
                    placeholder="e.g., 80000"
                  />
                  {errors.budgetRange?.max && (
                    <p className="text-sm text-red-500">{errors.budgetRange.max.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="justification">
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  {...register('justification')}
                  placeholder="Provide detailed justification for this hiring request..."
                  rows={4}
                />
                {errors.justification && (
                  <p className="text-sm text-red-500">{errors.justification.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  {...register('contactPhone')}
                  placeholder="e.g., +91 9876543210"
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="flex-1 h-11 shadow-lg shadow-primary/25"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
