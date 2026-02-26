import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Award } from 'lucide-react';
import PIPTable from '@/components/performance/PIPTable';

interface PerformanceTabProps {
  employeeId?: string;
  overallRating?: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

export default function PerformanceTab({
  employeeId,
  overallRating = 0,
  lastReviewDate = 'Not available',
  nextReviewDate = 'Not scheduled',
}: PerformanceTabProps) {
  return (
    <div className="space-y-6 p-6">
      {/* PIP Section - Full Table */}
      <PIPTable employeeId={employeeId} />

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{overallRating}/5</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-5 w-5 text-blue-600" />
              Last Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">{lastReviewDate}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Award className="h-5 w-5 text-emerald-600" />
              Next Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">{nextReviewDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Goals */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-orange-600" />
            Performance Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center py-8">
            Performance goals will be available after your next review cycle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
