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
import { Loader2 } from 'lucide-react';

interface AllocateLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeWithBalance;
  leavePlan: LeavePlanConfig;
  onSuccess: () => void;
  currentUser: any;
}

export function AllocateLeaveModal({
  open,
  onOpenChange,
  employee,
  leavePlan,
  onSuccess,
  currentUser,
}: AllocateLeaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType,
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

    try {
      setIsSubmitting(true);
      await leavePlanService.allocateLeave({
        employeeId: employee.employeeId,
        year: currentYear,
        leaveType: formData.leaveType,
        days,
        reason: formData.reason,
        adjustedBy: currentUser.employeeId,
        adjustedByName: currentUser.name,
      });

      toast.success(`Successfully allocated ${days} days of ${formData.leaveType} to ${employee.name}`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        leaveType: '' as LeaveType,
        days: '',
        reason: '',
      });
    } catch (error: any) {
      console.error('Failed to allocate leave:', error);
      toast.error(error.response?.data?.message || 'Failed to allocate leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current balance for selected leave type
  const currentBalance = formData.leaveType && employee.leaveBalance
    ? employee.leaveBalance.leaveTypes.find(lt => lt.type === formData.leaveType)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Allocate Leave</DialogTitle>
            <DialogDescription>
              Allocate additional leave days to {employee.name} ({employee.employeeId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            {/* Days to Allocate */}
            <div className="space-y-2">
              <Label htmlFor="days">
                Days to Allocate <span className="text-destructive">*</span>
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
              <p className="text-xs text-muted-foreground">
                Enter the number of additional days to allocate (can be decimal)
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for allocation..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear reason for this allocation (for audit trail)
              </p>
            </div>

            {/* Preview */}
            {formData.leaveType && formData.days && currentBalance && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
                <div className="font-medium mb-2">Preview:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Current Allocation:</span>
                    <span className="font-medium">{currentBalance.allocated} days</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Adding:</span>
                    <span className="font-medium">+{formData.days} days</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-medium">
                    <span>New Allocation:</span>
                    <span>{(currentBalance.allocated + parseFloat(formData.days || '0')).toFixed(1)} days</span>
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
              Allocate Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
