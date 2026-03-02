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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface InitiateExitDrawerProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
}

export default function InitiateExitDrawer({
  open,
  onClose,
  employeeName,
  employeeId,
}: InitiateExitDrawerProps) {
  const { user } = useAuthStore();
  const [exitReason, setExitReason] = useState<'resign' | 'terminate' | ''>('');
  const [discussionHeld, setDiscussionHeld] = useState<'yes' | 'no' | ''>('');
  const [discussionSummary, setDiscussionSummary] = useState('');
  
  // Termination-specific fields
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationNoticeDate, setTerminationNoticeDate] = useState('');
  
  // Resignation-specific fields
  const [resignationReason, setResignationReason] = useState('');
  const [resignationNoticeDate, setResignationNoticeDate] = useState('');
  
  const [lastWorkingDayOption, setLastWorkingDayOption] = useState<'original' | 'other' | ''>('');
  const [customLastWorkingDay, setCustomLastWorkingDay] = useState('');
  const [okToRehire, setOkToRehire] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate original notice period (90 days from notice date)
  const calculateOriginalLastWorkingDay = () => {
    const noticeDate = exitReason === 'resign' ? resignationNoticeDate : terminationNoticeDate;
    if (!noticeDate) return '';
    const date = new Date(noticeDate);
    date.setDate(date.getDate() + 90); // 90 days notice period
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!exitReason) {
      toast.error('Please select an exit reason');
      return;
    }
    if (!discussionHeld) {
      toast.error('Please confirm if discussion was held');
      return;
    }
    
    // Resignation-specific validation
    if (exitReason === 'resign' && !resignationReason) {
      toast.error('Resignation reason is required');
      return;
    }
    if (exitReason === 'resign' && !resignationNoticeDate) {
      toast.error('Resignation notice date is required');
      return;
    }
    
    // Termination-specific validation
    if (exitReason === 'terminate' && !terminationReason) {
      toast.error('Please select termination reason');
      return;
    }
    if (exitReason === 'terminate' && !terminationNoticeDate) {
      toast.error('Please select termination notice date');
      return;
    }
    
    if (!lastWorkingDayOption) {
      toast.error('Please select last working day option');
      return;
    }
    if (lastWorkingDayOption === 'other' && !customLastWorkingDay) {
      toast.error('Please select custom last working day');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/exit-requests/initiate', {
        employeeId,
        exitReason,
        discussionHeld,
        discussionSummary,
        resignationReason: exitReason === 'resign' ? resignationReason : undefined,
        resignationNoticeDate: exitReason === 'resign' ? resignationNoticeDate : undefined,
        terminationReason: exitReason === 'terminate' ? terminationReason : undefined,
        terminationNoticeDate: exitReason === 'terminate' ? terminationNoticeDate : undefined,
        lastWorkingDayOption,
        customLastWorkingDay: lastWorkingDayOption === 'other' ? customLastWorkingDay : undefined,
        okToRehire,
        initiatedBy: user?.employeeId,
        initiatedByName: user?.name
      });
      
      if (response.data.success) {
        toast.success(response.data.message || `Exit process initiated for ${employeeName}`);
        onClose();
        resetForm();
      } else {
        toast.error(response.data.message || 'Failed to initiate exit process');
      }
    } catch (error: any) {
      console.error('Failed to initiate exit process:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate exit process';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setExitReason('');
    setDiscussionHeld('');
    setDiscussionSummary('');
    setTerminationReason('');
    setTerminationNoticeDate('');
    setResignationReason('');
    setResignationNoticeDate('');
    setLastWorkingDayOption('');
    setCustomLastWorkingDay('');
    setOkToRehire(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl p-0">
        <SheetHeader>
          <div className="flex-1">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              Initiate Exit Process
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-600">
              Employee: <span className="font-medium text-gray-900">{employeeName}</span>
            </SheetDescription>
          </div>
          <SheetCloseButton />
        </SheetHeader>

        <SheetBody>
          <div className="space-y-5">
          {/* Exit Reason Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Exit Reason
            </Label>
            <div className="flex gap-3">
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all flex-1 ${
                  exitReason === 'resign'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="exitReason"
                  value="resign"
                  checked={exitReason === 'resign'}
                  onChange={(e) => setExitReason(e.target.value as any)}
                  className="h-3.5 w-3.5 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-900">Resignation</span>
              </label>
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all flex-1 ${
                  exitReason === 'terminate'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="exitReason"
                  value="terminate"
                  checked={exitReason === 'terminate'}
                  onChange={(e) => setExitReason(e.target.value as any)}
                  className="h-3.5 w-3.5 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-900">Termination</span>
              </label>
            </div>
          </div>

          {/* Discussion Confirmation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Discussion Status
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center py-2 rounded-md border cursor-pointer transition-all ${
                  discussionHeld === 'yes'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="discussionHeld"
                  value="yes"
                  checked={discussionHeld === 'yes'}
                  onChange={(e) => setDiscussionHeld(e.target.value as any)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Yes, Discussed</span>
              </label>
              <label
                className={`flex items-center justify-center py-2 rounded-md border cursor-pointer transition-all ${
                  discussionHeld === 'no'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-300 hover:border-rose-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="discussionHeld"
                  value="no"
                  checked={discussionHeld === 'no'}
                  onChange={(e) => setDiscussionHeld(e.target.value as any)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">No Discussion</span>
              </label>
            </div>
          </div>

          {/* Discussion Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
              Discussion Summary
            </Label>
            <Textarea
              id="summary"
              placeholder="Enter discussion details..."
              rows={3}
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              className="resize-none text-sm"
            />
          </div>

          {/* Resignation Details */}
          {exitReason === 'resign' && (
            <>
              <div className="h-px bg-gray-200 my-4" />
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Resignation Details</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Reason</Label>
                    <Select value={resignationReason} onValueChange={setResignationReason}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="better-opportunity">Better Opportunity</SelectItem>
                        <SelectItem value="higher-education">Higher Education</SelectItem>
                        <SelectItem value="personal-reasons">Personal Reasons</SelectItem>
                        <SelectItem value="health-issues">Health Issues</SelectItem>
                        <SelectItem value="relocation">Relocation</SelectItem>
                        <SelectItem value="career-change">Career Change</SelectItem>
                        <SelectItem value="family-reasons">Family Reasons</SelectItem>
                        <SelectItem value="work-life-balance">Work-Life Balance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="resignNoticeDate" className="text-xs font-medium text-gray-600">
                      Notice Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="resignNoticeDate"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={resignationNoticeDate}
                        onChange={(e) => setResignationNoticeDate(e.target.value)}
                        className="h-9 pr-8"
                      />
                      <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Termination Details */}
          {exitReason === 'terminate' && (
            <>
              <div className="h-px bg-gray-200 my-4" />
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Termination Details</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Reason</Label>
                    <Select value={terminationReason} onValueChange={setTerminationReason}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance Issues</SelectItem>
                        <SelectItem value="misconduct">Misconduct</SelectItem>
                        <SelectItem value="redundancy">Redundancy</SelectItem>
                        <SelectItem value="contract-end">Contract End</SelectItem>
                        <SelectItem value="violation">Policy Violation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="noticeDate" className="text-xs font-medium text-gray-600">
                      Notice Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="noticeDate"
                        type="date"
                        value={terminationNoticeDate}
                        onChange={(e) => setTerminationNoticeDate(e.target.value)}
                        className="h-9 pr-8"
                      />
                      <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Last Working Day */}
          <div className="h-px bg-gray-200 my-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Last Working Day
              </Label>
              {(resignationNoticeDate || terminationNoticeDate) && (
                <span className="text-xs text-indigo-600 font-medium">
                  Recommended: {calculateOriginalLastWorkingDay()}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all flex-1 ${
                  lastWorkingDayOption === 'original'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="lastWorkingDayOption"
                  value="original"
                  checked={lastWorkingDayOption === 'original'}
                  onChange={(e) => setLastWorkingDayOption(e.target.value as any)}
                  className="h-3.5 w-3.5 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Use Recommended</div>
                </div>
              </label>
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all flex-1 ${
                  lastWorkingDayOption === 'other'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="lastWorkingDayOption"
                  value="other"
                  checked={lastWorkingDayOption === 'other'}
                  onChange={(e) => setLastWorkingDayOption(e.target.value as any)}
                  className="h-3.5 w-3.5 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-900">Custom Date</span>
              </label>
            </div>
            {lastWorkingDayOption === 'other' && (
              <div className="mt-2">
                <div className="relative">
                  <Input
                    type="date"
                    value={customLastWorkingDay}
                    onChange={(e) => setCustomLastWorkingDay(e.target.value)}
                    className="h-9 pr-8"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Rehire Eligibility */}
          <label className="flex items-center gap-2.5 p-2.5 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              id="rehire"
              checked={okToRehire}
              onCheckedChange={(checked) => setOkToRehire(checked as boolean)}
            />
            <span className="text-sm font-medium text-gray-900">Eligible for Rehire</span>
          </label>

          {/* Information Banner */}
          <div className="flex gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              This will initiate an approval workflow. The employee will be notified once approved.
            </p>
          </div>
          </div>
        </SheetBody>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-9 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? 'Processing...' : 'Initiate Exit'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
