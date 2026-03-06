import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Home, FileText, Clock as ClockIcon } from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { WebClockInModal } from './WebClockInModal';

interface ActionsCardProps {
  employeeId?: string;
  onWFHRequest?: () => void;
  onViewPolicy?: () => void;
}

export function ActionsCard({ employeeId, onWFHRequest, onViewPolicy }: ActionsCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClockInModal, setShowClockInModal] = useState(false);
  const { webClockIn, webClockOut, loading } = useAttendanceStore();

  const handleClockIn = async () => {
    await webClockIn(employeeId);
  };

  const handleClockOut = async () => {
    await webClockOut(employeeId);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <ClockIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Live Clock */}
        <div className="mb-6 text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-4xl font-bold text-blue-900 mb-1 font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-blue-700">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-12"
            variant="default"
            onClick={() => setShowClockInModal(true)}
            disabled={loading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Web Clock-In
          </Button>

          <Button
            className="w-full h-12"
            variant="outline"
            onClick={onWFHRequest}
          >
            <Home className="mr-2 h-4 w-4" />
            Request WFH
          </Button>

          <Button
            className="w-full h-12"
            variant="outline"
            onClick={onViewPolicy}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Policy
          </Button>
        </div>

        {/* Policy Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Today's Schedule</h4>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Standard Time:</span>
              <span className="font-medium">10:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Working Hours:</span>
              <span className="font-medium">9 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Break:</span>
              <span className="font-medium">60 minutes</span>
            </div>
          </div>
        </div>
      </Card>

      <WebClockInModal
        open={showClockInModal}
        onClose={() => setShowClockInModal(false)}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />
    </>
  );
}
