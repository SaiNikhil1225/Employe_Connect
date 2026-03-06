import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OnboardingTabProps {
  status?: 'pending' | 'in-progress' | 'completed';
  progress?: number;
  tasks?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
}

export default function OnboardingTab({ status = 'completed', progress = 100, tasks = [] }: OnboardingTabProps) {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Onboarding Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                <Badge
                  className={
                    status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }
                >
                  {status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{progress}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      {tasks.length > 0 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Onboarding Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gray-50"
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <p className="flex-1 font-medium text-gray-900">{task.title}</p>
                  <Badge
                    variant={task.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ''
                    }
                  >
                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'completed' && tasks.length === 0 && (
        <Card className="border border-gray-200 shadow-sm bg-emerald-50/50">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Onboarding Completed</h3>
            <p className="text-sm text-gray-600">
              You have successfully completed all onboarding requirements.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
