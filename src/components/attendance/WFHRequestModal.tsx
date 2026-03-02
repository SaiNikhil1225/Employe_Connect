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
import { CalendarIcon, Home, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface WFHRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; reason: string }) => Promise<void>;
}

export function WFHRequestModal({ open, onClose, onSubmit }: WFHRequestModalProps) {
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !reason.trim()) {
      return;
    }

    if (reason.trim().length < 10) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        date: format(date, 'yyyy-MM-dd'),
        reason: reason.trim()
      });
      
      // Reset form
      setDate(undefined);
      setReason('');
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
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold">Work From Home Request</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Submit a WFH request for manager approval
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">WFH Date *</Label>
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
              placeholder="Please provide a detailed reason for your WFH request..."
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
                Your request will be sent to your manager and HR for approval. You'll be notified once reviewed.
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
              className="flex-1 h-10 bg-green-600 hover:bg-green-700"
              disabled={loading || !date || reason.trim().length < 10}
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
