import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Edit3, Send, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RegularizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function RegularizationModal({ open, onClose, onSubmit }: RegularizationModalProps) {
  const [date, setDate] = useState<Date>();
  const [requestType, setRequestType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [proposedCheckIn, setProposedCheckIn] = useState('');
  const [proposedCheckOut, setProposedCheckOut] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !requestType || !reason.trim()) {
      return;
    }

    if (reason.trim().length < 10) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        date: format(date, 'yyyy-MM-dd'),
        requestType,
        reason: reason.trim(),
        proposedCheckIn: proposedCheckIn || undefined,
        proposedCheckOut: proposedCheckOut || undefined
      });
      
      // Reset form
      setDate(undefined);
      setRequestType('');
      setReason('');
      setProposedCheckIn('');
      setProposedCheckOut('');
      onClose();
    } catch (error) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Edit3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold">Regularization Request</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Request to correct your attendance record
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-10',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date() || date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="requestType" className="text-sm font-medium">Request Type *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="late-arrival">Late Arrival</SelectItem>
                <SelectItem value="early-departure">Early Departure</SelectItem>
                <SelectItem value="missing-punch">Missing Punch</SelectItem>
                <SelectItem value="wfh-conversion">WFH Conversion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proposed Times */}
          {(requestType === 'late-arrival' || requestType === 'missing-punch') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="proposedCheckIn" className="text-sm font-medium">Proposed Check-In Time</Label>
              </div>
              <Input
                id="proposedCheckIn"
                type="time"
                value={proposedCheckIn}
                onChange={(e) => setProposedCheckIn(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {(requestType === 'early-departure' || requestType === 'missing-punch') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="proposedCheckOut" className="text-sm font-medium">Proposed Check-Out Time</Label>
              </div>
              <Input
                id="proposedCheckOut"
                type="time"
                value={proposedCheckOut}
                onChange={(e) => setProposedCheckOut(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason" className="text-sm font-medium">Reason *</Label>
              <span className="text-xs text-muted-foreground">
                {reason.length}/500 (min 10)
              </span>
            </div>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for regularization..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2.5">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="flex-1 text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                Regularization requests can be submitted for up to 30 days. Your request will be sent to your manager and HR for review.
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 bg-orange-600 hover:bg-orange-700"
              disabled={loading || !date || !requestType || reason.trim().length < 10}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
