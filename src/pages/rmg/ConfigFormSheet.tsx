import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { configService, type ConfigMaster } from '@/services/configService';
import { useToast } from '@/hooks/use-toast';

interface ConfigFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  label: string;
  config: ConfigMaster | null;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const ConfigFormSheet: React.FC<ConfigFormSheetProps> = ({
  open,
  onOpenChange,
  type,
  label,
  config,
  onSuccess,
}) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      status: 'Active',
    },
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (config) {
      reset({
        name: config.name,
        description: config.description || '',
        status: config.status,
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'Active',
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (config) {
        // Update existing
        await configService.update(type, config._id!, {
          name: data.name.trim(),
          description: data.description.trim(),
          status: data.status,
        });
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        // Create new
        await configService.create(type, {
          name: data.name.trim(),
          description: data.description.trim(),
          status: data.status,
        });
        toast({
          title: 'Success',
          description: 'Configuration created successfully',
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: 'Error',
        description:
          (error as Error).message || 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {config ? 'Edit' : 'Add New'} {label}
          </SheetTitle>
          <SheetDescription>
            {config
              ? `Update the details for this ${label.toLowerCase()}.`
              : `Create a new ${label.toLowerCase()} configuration.`}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Name is required',
                validate: (value) =>
                  value.trim().length > 0 || 'Name cannot be empty',
              })}
              placeholder={`Enter ${label.toLowerCase()} name`}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter optional description"
              rows={3}
            />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value: 'Active' | 'Inactive') =>
                setValue('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              Inactive items will not appear in dropdowns
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : config ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ConfigFormSheet;
