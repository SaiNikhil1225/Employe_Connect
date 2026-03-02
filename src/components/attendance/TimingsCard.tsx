import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Coffee, Briefcase } from 'lucide-react';
import type { DailyTimings } from '@/types/attendance';

interface TimingsCardProps {
  timings: DailyTimings | null;
  loading?: boolean;
}

export function TimingsCard({ timings, loading }: TimingsCardProps) {
  if (loading || !timings) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const { progress } = timings;
  const workedPercentage = progress.total > 0 ? (progress.worked / progress.total) * 100 : 0;
  const breakPercentage = progress.total > 0 ? (progress.break / progress.total) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Today's Timings</h3>
          <p className="text-sm text-gray-500">
            {timings.dayOfWeek}, {new Date(timings.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      {/* Check-in/Check-out Times */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Check In</p>
          <p className="text-xl font-bold text-green-700">
            {timings.checkIn || '--:--'}
          </p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Check Out</p>
          <p className="text-xl font-bold text-red-700">
            {timings.checkOut || '--:--'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Time Distribution</span>
          <span className="text-sm text-gray-500">{timings.totalHours}</span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${workedPercentage}%` }}
          ></div>
          <div
            className="absolute h-full bg-orange-400 transition-all duration-300"
            style={{ 
              left: `${workedPercentage}%`,
              width: `${breakPercentage}%` 
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Work: {timings.workingHours}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span className="text-gray-600">Break: {timings.breakDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">
              Remaining: {Math.floor(progress.remaining / 60)}h {progress.remaining % 60}m
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Briefcase className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Working</p>
          <p className="text-sm font-semibold text-blue-600">{timings.workingHours}</p>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Coffee className="h-4 w-4 text-orange-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Break</p>
          <p className="text-sm font-semibold text-orange-600">{timings.breakDuration}</p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Clock className="h-4 w-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-sm font-semibold text-purple-600">{timings.totalHours}</p>
        </div>
      </div>
    </Card>
  );
}
