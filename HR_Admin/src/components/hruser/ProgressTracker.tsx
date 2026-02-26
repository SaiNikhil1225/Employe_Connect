import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Calendar, CheckCircle2, Clock as ClockIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Training {
  id: string;
  name: string;
  category: string;
  status: string;
  endDate: string;
  progress: {
    percentage: number;
    hoursCompleted: number;
    totalHours: number;
    modulesCompleted?: number;
    totalModules?: number;
  };
}

interface ProgressTrackerProps {
  trainings: Training[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: XCircle
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: ClockIcon
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2
  }
};

const mockModules = [
  { id: 1, name: 'Introduction', status: 'completed' },
  { id: 2, name: 'Core Concepts', status: 'completed' },
  { id: 3, name: 'Advanced Topics', status: 'completed' },
  { id: 4, name: 'Practical Applications', status: 'in_progress' },
  { id: 5, name: 'Best Practices', status: 'not_started' },
  { id: 6, name: 'Project Work', status: 'not_started' }
];

const mockAssessments = [
  { id: 1, name: 'Quiz 1', score: 90, status: 'completed' },
  { id: 2, name: 'Quiz 2', score: 85, status: 'completed' },
  { id: 3, name: 'Mid-term', score: 88, status: 'completed' },
  { id: 4, name: 'Quiz 3', score: null, status: 'pending' },
  { id: 5, name: 'Final Exam', score: null, status: 'not_started' }
];

export function ProgressTracker({ trainings }: ProgressTrackerProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress_desc');

  // Filter and sort trainings
  const filteredTrainings = useMemo(() => {
    let filtered = trainings;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'progress_desc':
          return b.progress.percentage - a.progress.percentage;
        case 'progress_asc':
          return a.progress.percentage - b.progress.percentage;
        case 'date':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [trainings, statusFilter, sortBy]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress_desc">Progress (High to Low)</SelectItem>
                <SelectItem value="progress_asc">Progress (Low to High)</SelectItem>
                <SelectItem value="date">End Date (Nearest First)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Table */}
      <div className="space-y-4">
        {filteredTrainings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClockIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No Training Progress</h3>
              <p className="text-sm text-muted-foreground mt-2">Complete your first training to see progress</p>
            </CardContent>
          </Card>
        ) : (
          filteredTrainings.map((training) => {
            const statusInfo = statusConfig[training.status] || statusConfig.not_started;
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedRow === training.id;

            return (
              <Card key={training.id} className="transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleRow(training.id)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Training Name */}
                      <div className="md:col-span-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{training.name}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {training.category}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="md:col-span-4 space-y-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {training.progress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${training.progress.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {training.progress.hoursCompleted}/{training.progress.totalHours} hours
                        </p>
                      </div>

                      {/* Completion Date */}
                      <div className="md:col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(training.endDate)}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 p-6 space-y-6">
                      {/* Modules Progress */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Modules Progress</h4>
                        <div className="space-y-2">
                          {mockModules.map((module) => (
                            <div
                              key={module.id}
                              className="flex items-center justify-between p-2 rounded bg-background"
                            >
                              <div className="flex items-center gap-3">
                                {module.status === 'completed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : module.status === 'in_progress' ? (
                                  <ClockIcon className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">Module {module.id}: {module.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {module.status === 'completed'
                                  ? 'Completed'
                                  : module.status === 'in_progress'
                                  ? 'In Progress'
                                  : 'Not Started'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attendance */}
                      {training.status !== 'not_started' && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Attendance</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">4 / 5 days (80%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: '80%' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assessments */}
                      {training.status !== 'not_started' && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Assessments</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {mockAssessments.map((assessment) => (
                              <div
                                key={assessment.id}
                                className="flex items-center justify-between p-2 rounded bg-background"
                              >
                                <span className="text-sm">{assessment.name}</span>
                                {assessment.status === 'completed' ? (
                                  <span className={`text-sm font-semibold ${getScoreColor(assessment.score!)}`}>
                                    {assessment.score}% ✅
                                  </span>
                                ) : assessment.status === 'pending' ? (
                                  <Badge variant="outline" className="text-xs">Pending</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Not Started</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Session */}
                      {training.status === 'in_progress' && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Next Session: Tomorrow at 9:00 AM
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Location: Room 301, 3rd Floor
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
