import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHiringStore } from '@/store/hiringStore';
import { hiringRequestSchema } from '@/schemas/hiringSchema';
import type { HiringRequestFormData } from '@/schemas/hiringSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { Calendar as CalendarIcon, ArrowLeft, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function HiringRequestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createRequest, updateRequest, fetchRequestById, currentRequest, submitRequest } = useHiringStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplacementDetails, setShowReplacementDetails] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HiringRequestFormData>({
    resolver: zodResolver(hiringRequestSchema),
    defaultValues: {
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
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  useEffect(() => {
    if (currentRequest && id) {
      // Populate form with existing data
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
  }, [currentRequest, id, setValue]);

  const onSubmit = async (data: HiringRequestFormData, saveAsDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      if (id) {
        // Update existing request
        await updateRequest(id, data);
        toast.success('Request updated successfully');
        navigate('/hiring/my-requests');
      } else {
        // Create new request
        const newRequest = await createRequest(data);
        
        if (!saveAsDraft) {
          // Submit to HR
          await submitRequest(newRequest._id);
          toast.success('Request submitted to HR successfully');
        } else {
          toast.success('Request saved as draft');
        }
        
        navigate('/hiring/my-requests');
      }
    } catch (error) {
      console.error('Error saving request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Hiring Request' : 'New Hiring Request'}
        </h1>
        <p className="text-muted-foreground">
          Fill in the details for the hiring request
        </p>
      </div>

      <form className="space-y-6">
        {/* Position Details */}
        <Card>
          <CardHeader>
            <CardTitle>Position Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.jobTitle.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select
                  onValueChange={(value) => setValue('employmentType', value as any)}
                  defaultValue={watch('employmentType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentType && (
                  <p className="text-sm text-red-500 mt-1">{errors.employmentType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hiringType">Hiring Type *</Label>
                <Select
                  onValueChange={(value) => setValue('hiringType', value as any)}
                  defaultValue={watch('hiringType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Position">New Position</SelectItem>
                    <SelectItem value="Replacement">Replacement</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hiringType && (
                  <p className="text-sm text-red-500 mt-1">{errors.hiringType.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replacement Details (Conditional) */}
        {showReplacementDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Replacement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="replacementEmployeeName">Employee Name *</Label>
                <Input
                  id="replacementEmployeeName"
                  {...register('replacementDetails.employeeName')}
                  placeholder="Name of employee being replaced"
                />
                {errors.replacementDetails?.employeeName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.replacementDetails.employeeName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reasonForReplacement">Reason for Replacement *</Label>
                <Input
                  id="reasonForReplacement"
                  {...register('replacementDetails.reasonForReplacement')}
                  placeholder="e.g., Resignation, Promotion"
                />
                {errors.replacementDetails?.reasonForReplacement && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.replacementDetails.reasonForReplacement.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Last Working Day *</Label>
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
                      {replacementLastWorkingDay
                        ? format(replacementLastWorkingDay, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      selected={replacementLastWorkingDay}
                      onSelect={(date) =>
                        setValue('replacementDetails.lastWorkingDay', date as Date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.replacementDetails?.lastWorkingDay && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.replacementDetails.lastWorkingDay.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumYears">Minimum Years *</Label>
                <Input
                  id="minimumYears"
                  type="number"
                  {...register('minimumYears', { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                  max="50"
                />
                {errors.minimumYears && (
                  <p className="text-sm text-red-500 mt-1">{errors.minimumYears.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredIndustry">Preferred Industry</Label>
                <Input
                  id="preferredIndustry"
                  {...register('preferredIndustry')}
                  placeholder="e.g., FinTech, Healthcare"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Details & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workLocation">Work Location *</Label>
                <Select
                  onValueChange={(value) => setValue('workLocation', value as any)}
                  defaultValue={watch('workLocation')}
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
                  <p className="text-sm text-red-500 mt-1">{errors.workLocation.message}</p>
                )}
              </div>

              <div>
                <Label>Preferred Joining Date *</Label>
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
                      {preferredJoiningDate
                        ? format(preferredJoiningDate, 'PPP')
                        : 'Pick a date'}
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
                  <p className="text-sm text-red-500 mt-1">
                    {errors.preferredJoiningDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="shiftOrHours">Shift / Working Hours</Label>
              <Input
                id="shiftOrHours"
                {...register('shiftOrHours')}
                placeholder="e.g., 9 AM - 6 PM, Rotational Shifts"
              />
            </div>
          </CardContent>
        </Card>

        {/* Compensation & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Compensation & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budgetMin">Min Budget (₹) *</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register('budgetRange.min', { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                />
                {errors.budgetRange?.min && (
                  <p className="text-sm text-red-500 mt-1">{errors.budgetRange.min.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="budgetMax">Max Budget (₹) *</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register('budgetRange.max', { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                />
                {errors.budgetRange?.max && (
                  <p className="text-sm text-red-500 mt-1">{errors.budgetRange.max.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setValue('budgetRange.currency', value)}
                  defaultValue="INR"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Justification */}
        <Card>
          <CardHeader>
            <CardTitle>Business Justification</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                id="justification"
                {...register('justification')}
                placeholder="Explain why this position is needed (minimum 20 characters)"
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {watch('justification')?.length || 0} / 1000 characters
              </p>
              {errors.justification && (
                <p className="text-sm text-red-500 mt-1">{errors.justification.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="10-digit phone number"
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave blank to use your registered phone number
              </p>
              {errors.contactPhone && (
                <p className="text-sm text-red-500 mt-1">{errors.contactPhone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {!id && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {id ? 'Update' : 'Submit to HR'}
          </Button>
        </div>
      </form>
    </div>
  );
}
