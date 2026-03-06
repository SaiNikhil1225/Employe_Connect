import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, MapPin, Wifi, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface WebClockInModalProps {
  open: boolean;
  onClose: () => void;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
}

export function WebClockInModal({ open, onClose, onClockIn, onClockOut }: WebClockInModalProps) {
  const [action, setAction] = useState<'clock-in' | 'clock-out'>('clock-in');
  const [location, setLocation] = useState<string>('Fetching location...');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (action === 'clock-in') {
        await onClockIn();
        toast.success('Clocked in successfully');
      } else {
        await onClockOut();
        toast.success('Clocked out successfully');
      }
      onClose();
    } catch (error: any) {
      // Error already handled by store
    } finally {
      setLoading(false);
    }
  };

  // Get location (simplified - in production use geolocation API)
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Web Clock-In/Out</DialogTitle>
          <DialogDescription>
            Record your attendance with timestamp and location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Toggle */}
          <div className="flex gap-2">
            <Button
              variant={action === 'clock-in' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAction('clock-in')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Clock In
            </Button>
            <Button
              variant={action === 'clock-out' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAction('clock-out')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>

          {/* Current Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="font-semibold">{getCurrentTime()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-sm">Office - Main Building</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="font-semibold text-sm">Office WiFi</p>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              {action === 'clock-in' 
                ? '⏱️ You are about to clock in. Make sure you are at your designated work location.'
                : '⏱️ You are about to clock out. This will end your work session for today.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Confirm ${action === 'clock-in' ? 'Clock In' : 'Clock Out'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
