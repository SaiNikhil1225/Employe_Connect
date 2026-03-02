import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import type { AttendanceStats } from '@/types/attendance';

interface AttendanceStatsCardProps {
  stats: AttendanceStats | null;
  loading?: boolean;
}

export function AttendanceStatsCard({ stats, loading }: AttendanceStatsCardProps) {
  if (loading || !stats) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Attendance Statistics</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Your Stats */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Your Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Avg Hours/Day</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.me.avgHoursPerDay.toFixed(1)}h
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">On-Time %</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.me.onTimeArrivalPercentage}%
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Total Days</p>
              <p className="font-semibold">{stats.me.totalDays}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Present</p>
              <p className="font-semibold text-green-600">{stats.me.presentDays}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Late</p>
              <p className="font-semibold text-orange-600">{stats.me.lateDays}</p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        {stats.myTeam && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Team Average</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Avg Hours/Day</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.myTeam.avgHoursPerDay.toFixed(1)}h
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-gray-600">On-Time %</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.myTeam.onTimeArrivalPercentage}%
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Team Size</p>
                <p className="font-semibold">{stats.myTeam.totalEmployees}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Present Today</p>
                <p className="font-semibold text-green-600">{stats.myTeam.presentToday}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
