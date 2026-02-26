import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { leavePlanService } from '@/services/leaveService';
import type { EmployeeWithBalance, LeavePlanConfig, LeaveType } from '@/types/leave';
import { Loader2, Plus, Minus } from 'lucide-react';

interface AdjustLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeWithBalance;
  leavePlan: LeavePlanConfig;
  onSuccess: () => void;
  currentUser: any;
}

export function AdjustLeaveModal({
  open,
  onOpenChange,
  employee,
  leavePlan,
  onSuccess,
  currentUser,
}: AdjustLeaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType,
    adjustmentType: 'Add' as 'Add' | 'Deduct',
    days: '',
    reason: '',
  });

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.days || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const days = parseFloat(formData.days);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    // Check if deducting more than available
    const currentBalance = employee.leaveBalance?.leaveTypes.find(lt => lt.type === formData.leaveType);
    if (formData.adjustmentType === 'Deduct' && currentBalance && days > currentBalance.allocated) {
      toast.error(`Cannot deduct more than allocated balance (${currentBalance.allocated} days)`);
      return;
    }

    try {
      setIsSubmitting(true);
      await leavePlanService.adjustLeave({
        employeeId: employee.employeeId,
        year: currentYear,
        leaveType: formData.leaveType,
        adjustmentType: formData.adjustmentType,
        days,
        reason: formData.reason,
        adjustedBy: currentUser.employeeId,
        adjustedByName: currentUser.name,
      });

      const action = formData.adjustmentType === 'Add' ? 'added' : 'deducted';
      toast.success(`Successfully ${action} ${days} days of ${formData.leaveType} for ${employee.name}`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        leaveType: '' as LeaveType,
        adjustmentType: 'Add',
        days: '',
        reason: '',
      });
    } catch (error: any) {
      console.error('Failed to adjust leave:', error);
      toast.error(error.response?.data?.message || 'Failed to adjust leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current balance for selected leave type
  const currentBalance = formData.leaveType && employee.leaveBalance
    ? employee.leaveBalance.leaveTypes.find(lt => lt.type === formData.leaveType)
    : null;

  const calculateNewBalance = () => {
    if (!currentBalance || !formData.days) return null;
    const days = parseFloat(formData.days);
    if (isNaN(days)) return null;

    const newAllocated = formData.adjustmentType === 'Add'
      ? currentBalance.allocated + days
      : Math.max(0, currentBalance.allocated - days);

    const newAvailable = newAllocated - currentBalance.used - currentBalance.pending;

    return {
      allocated: newAllocated,
      available: Math.max(0, newAvailable),
    };
  };

  const newBalance = calculateNewBalance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adjust Leave Balance</DialogTitle>
            <DialogDescription>
              Add or deduct leave days for {employee.name} ({employee.employeeId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Adjustment Type */}
            <div className="space-y-3">
              <Label>Adjustment Type <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={formData.adjustmentType}
                onValueChange={(value) => setFormData({ ...formData, adjustmentType: value as 'Add' | 'Deduct' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Add" id="add" />
                  <Label htmlFor="add" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Plus className="h-4 w-4 text-green-600" />
                    Add Days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Deduct" id="deduct" />
                  <Label htmlFor="deduct" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Minus className="h-4 w-4 text-red-600" />
                    Deduct Days
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Leave Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="leaveType">
                Leave Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData({ ...formData, leaveType: value as LeaveType })}
              >
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leavePlan.leaveTypes.map((lt) => (
                    <SelectItem key={lt.type} value={lt.type}>
                      {lt.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Balance Display */}
            {currentBalance && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <div className="font-medium">Current Balance:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Allocated:</span>{' '}
                    <span className="font-medium">{currentBalance.allocated} days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Used:</span>{' '}
                    <span className="font-medium">{currentBalance.used} days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending:</span>{' '}
                    <span className="font-medium">{currentBalance.pending} days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available:</span>{' '}
                    <span className="font-medium text-green-600">{currentBalance.available} days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Days */}
            <div className="space-y-2">
              <Label htmlFor="days">
                Number of Days <span className="text-destructive">*</span>
              </Label>
              <Input
                id="days"
                type="number"
                min="0"
                step="0.5"
                placeholder="Enter number of days"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for adjustment..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear reason for this adjustment (for audit trail)
              </p>
            </div>

            {/* Preview */}
            {newBalance && currentBalance && (
              <div className={`rounded-md p-3 text-sm ${
                formData.adjustmentType === 'Add' 
                  ? 'bg-green-50 dark:bg-green-950/20' 
                  : 'bg-orange-50 dark:bg-orange-950/20'
              }`}>
                <div className="font-medium mb-2">Preview:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Current Allocation:</span>
                    <span className="font-medium">{currentBalance.allocated} days</span>
                  </div>
                  <div className={`flex justify-between ${
                    formData.adjustmentType === 'Add' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <span>{formData.adjustmentType === 'Add' ? 'Adding:' : 'Deducting:'}</span>
                    <span className="font-medium">{formData.adjustmentType === 'Add' ? '+' : '-'}{formData.days} days</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-medium">
                    <span>New Allocation:</span>
                    <span>{newBalance.allocated.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Available:</span>
                    <span className="text-green-600 font-medium">{newBalance.available.toFixed(1)} days</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formData.adjustmentType === 'Add' ? 'Add' : 'Deduct'} Days
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
