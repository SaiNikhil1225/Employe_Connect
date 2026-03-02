import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Info, Paperclip, Plus, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface Task {
  id: string;
  name: string;
  startDate: string;
}

interface AddToPIPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  onSuccess?: () => void;
}

export default function AddToPIPDrawer({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employeeAvatar,
  onSuccess,
}: AddToPIPDrawerProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [reason, setReason] = useState('');
  const [evaluationProcess, setEvaluationProcess] = useState('');
  const [improvementPlan, setImprovementPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Calculate PIP duration
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: '',
      startDate: startDate || '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, field: 'name' | 'startDate', value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
      toast.error('Please provide a reason for PIP');
      return;
    }
    if (reason.length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }
    if (!evaluationProcess) {
      toast.error('Please select an evaluation process');
      return;
    }
    if (!improvementPlan.trim()) {
      toast.error('Please add improvement plan details');
      return;
    }
    if (improvementPlan.length < 20) {
      toast.error('Improvement plan must be at least 20 characters');
      return;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Please add at least one task');
      return;
    }
    if (tasks.some(task => !task.name.trim() || !task.startDate)) {
      toast.error('All tasks must have a name and start date');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Upload attachments first if any
      const attachmentIds: string[] = [];

      const response = await axios.post('http://localhost:5000/api/pip/start', {
        employeeId,
        reason,
        attachments: attachmentIds,
        evaluationProcess,
        improvementPlan,
        startDate,
        endDate,
        tasks: tasks.map(({ name, startDate }) => ({ name, startDate })),
        initiatedBy: user?.employeeId,
        initiatedByName: user?.name,
      });

      if (response.data.success) {
        toast.success(`PIP started for ${employeeName}`);
        onClose();
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.data.message || 'Failed to start PIP');
      }
    } catch (error: any) {
      console.error('Failed to start PIP:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start PIP';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setEvaluationProcess('');
    setImprovementPlan('');
    setStartDate('');
    setEndDate('');
    setTasks([]);
    setAttachments([]);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-3xl p-0">
        <SheetHeader>
          <div className="flex-1">
            <SheetTitle className="text-2xl font-semibold text-gray-900">
              Start Performance Improvement Plan
            </SheetTitle>
            <SheetDescription className="sr-only">Start a Performance Improvement Plan for {employeeName}</SheetDescription>
          </div>
          <SheetCloseButton />
        </SheetHeader>

        <SheetBody>
          <div className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Employee</Label>
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              {employeeAvatar ? (
                <img 
                  src={employeeAvatar} 
                  alt={employeeName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {employeeName.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 flex-1">{employeeName}</span>
            </div>
          </div>

          {/* Reason for PIP */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Reason to place this employee under Performance Improvement Plan
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              placeholder="Needs improvement"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none text-sm"
            />
            {reason && reason.length < 10 && (
              <p className="text-xs text-red-600">Minimum 10 characters required</p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Attachments (Optional)</Label>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="gap-2"
              >
                <Paperclip className="h-4 w-4" />
                Add Attachments
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evaluation Process */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Select Evaluation Process for Performance Improvement Plan
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select value={evaluationProcess} onValueChange={setEvaluationProcess}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select evaluation process" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales-pip">Sales Team PIP</SelectItem>
                <SelectItem value="engineering-pip">Engineering PIP</SelectItem>
                <SelectItem value="support-pip">Customer Support PIP</SelectItem>
                <SelectItem value="management-pip">Management PIP</SelectItem>
                <SelectItem value="generic-pip">Generic PIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Improvement Plan Details */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Add Improvement Plan
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              placeholder="Need to work on leadership"
              rows={4}
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              className="resize-none text-sm"
            />
            {improvementPlan && improvementPlan.length < 20 && (
              <p className="text-xs text-red-600">Minimum 20 characters required</p>
            )}
          </div>

          {/* PIP Timeline */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              PIP Timeline
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Start Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 pr-8"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">End Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 pr-8"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* PIP Duration & Tasks */}
          {startDate && endDate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <div className="text-sm font-semibold text-blue-900">
                PIP Duration: {calculateDuration()} days
              </div>

              {/* Tasks Section */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Tasks
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                
                {tasks.length > 0 && (
                  <div className="border border-gray-300 rounded-md divide-y">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-3 px-3 py-2">
                        <Input
                          placeholder="Task name"
                          value={task.name}
                          onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                          className="flex-1 h-9 border-0 focus-visible:ring-0 px-0"
                        />
                        <div className="relative w-32">
                          <Input
                            type="date"
                            value={task.startDate}
                            min={startDate}
                            max={endDate}
                            onChange={(e) => handleUpdateTask(task.id, 'startDate', e.target.value)}
                            className="h-9 pr-8 text-sm"
                          />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTask(task.id)}
                          className="h-9 w-9 p-0"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddTask}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add task
                </Button>
              </div>
            </div>
          )}

          {/* Information Banner */}
          <div className="flex gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 leading-relaxed">
              The employee will receive notification about the PIP and must acknowledge before it officially starts.
            </p>
          </div>
          </div>
        </SheetBody>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 min-w-24"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 min-w-24 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Starting...</span>
              </div>
            ) : (
              'Start'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
