import { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { leavePlanService } from '@/services/leaveService';
import type { EmployeeWithBalance, LeavePlanConfig, LeaveType } from '@/types/leave';
import { Loader2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkAllocateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leavePlan: LeavePlanConfig;
  employees: EmployeeWithBalance[];
  onSuccess: () => void;
  currentUser: any;
}

export function BulkAllocateModal({
  open,
  onOpenChange,
  leavePlan,
  employees,
  onSuccess,
  currentUser,
}: BulkAllocateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType,
    days: '',
    reason: '',
  });

  const currentYear = new Date().getFullYear();

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(emp => emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = searchQuery === '' ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchQuery, departmentFilter]);

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.employeeId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployeeIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

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
      const result = await leavePlanService.bulkAllocate({
        employeeIds: selectedEmployeeIds,
        year: currentYear,
        leaveType: formData.leaveType,
        days,
        reason: formData.reason,
        adjustedBy: currentUser.employeeId,
        adjustedByName: currentUser.name,
      });

      const successCount = result.success?.length || 0;
      const failedCount = result.failed?.length || 0;

      if (successCount > 0) {
        toast.success(`Successfully allocated leave to ${successCount} employee(s)`);
      }
      if (failedCount > 0) {
        toast.warning(`Failed to allocate leave to ${failedCount} employee(s)`);
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedEmployeeIds([]);
      setFormData({
        leaveType: '' as LeaveType,
        days: '',
        reason: '',
      });
      setSearchQuery('');
      setDepartmentFilter('all');
    } catch (error: any) {
      console.error('Failed to bulk allocate leave:', error);
      toast.error(error.response?.data?.message || 'Failed to allocate leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Bulk Allocate Leave</DialogTitle>
            <DialogDescription>
              Allocate leave days to multiple employees in the {leavePlan.planName} plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Leave Configuration */}
            <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for bulk allocation..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Select Employees</Label>
                <Badge variant="secondary">
                  {selectedEmployeeIds.length} of {filteredEmployees.length} selected
                </Badge>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select All */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="cursor-pointer font-normal">
                  Select all ({filteredEmployees.length} employees)
                </Label>
              </div>

              {/* Employee List */}
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="p-4 space-y-2">
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No employees found</p>
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const currentBalance = formData.leaveType && emp.leaveBalance
                        ? emp.leaveBalance.leaveTypes.find(lt => lt.type === formData.leaveType)
                        : null;

                      return (
                        <div
                          key={emp.employeeId}
                          className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                            selectedEmployeeIds.includes(emp.employeeId)
                              ? 'bg-primary/5 border border-primary/20'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Checkbox
                            id={emp.employeeId}
                            checked={selectedEmployeeIds.includes(emp.employeeId)}
                            onCheckedChange={() => handleToggleEmployee(emp.employeeId)}
                          />
                          <Label
                            htmlFor={emp.employeeId}
                            className="flex-1 cursor-pointer space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {emp.employeeId} • {emp.department} • {emp.designation}
                                </div>
                              </div>
                              {currentBalance && (
                                <div className="text-xs text-right">
                                  <div className="text-muted-foreground">Current</div>
                                  <div className="font-medium">{currentBalance.available}/{currentBalance.allocated}</div>
                                </div>
                              )}
                            </div>
                          </Label>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Summary */}
            {selectedEmployeeIds.length > 0 && formData.days && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
                <div className="font-medium mb-2">Summary:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total Employees:</span>
                    <span className="font-medium">{selectedEmployeeIds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days per Employee:</span>
                    <span className="font-medium">{formData.days} days</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-medium">
                    <span>Total Days Allocated:</span>
                    <span>{(selectedEmployeeIds.length * parseFloat(formData.days || '0')).toFixed(1)} days</span>
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
            <Button type="submit" disabled={isSubmitting || selectedEmployeeIds.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Allocate to {selectedEmployeeIds.length} Employee{selectedEmployeeIds.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
