import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Rocket,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { onboardingService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

export default function OnboardingDashboard() {
  const { user } = useAuthStore();
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklistData();
  }, []);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      const response = await onboardingService.getEmployeeChecklist(user?.id || '');
      if (response.success) {
        setChecklist(response.data);
      }
    } catch (error) {
      toast.error('Failed to load onboarding checklist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (phase: string, taskName: string, completed: boolean) => {
    try {
      const response = await onboardingService.updateTask(
        user?.id || '',
        phase,
        taskName,
        completed
      );
      if (response.success) {
        toast.success(completed ? 'Task completed' : 'Task marked incomplete');
        loadChecklistData();
      }
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    }
  };

  const getMilestoneStatus = (milestone: any) => {
    if (milestone?.completedAt) {
      return (
        <Badge variant="default">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (milestone?.startedAt) {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Started
      </Badge>
    );
  };

  const TaskList = ({ phase, tasks }: any) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="space-y-2">
        {tasks.map((task: any, index: number) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={`${phase}-${index}`}
              checked={task.completed}
              onCheckedChange={(checked) =>
                handleTaskToggle(phase, task.taskName, checked as boolean)
              }
            />
            <label
              htmlFor={`${phase}-${index}`}
              className={`flex-1 text-sm cursor-pointer ${
                task.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {task.taskName}
            </label>
            {task.completedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your onboarding checklist...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Onboarding Checklist</h3>
          <p className="text-muted-foreground">
            Your onboarding checklist has not been created yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to the Team! 🎉</h1>
          <p className="text-muted-foreground mt-1">
            Complete your onboarding tasks to get started
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-500" />
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-bold">{checklist.overallProgress}%</span>
            </div>
            <Progress value={checklist.overallProgress} className="h-3" />
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Start Date:{' '}
                  {checklist.joiningDate
                    ? new Date(checklist.joiningDate).toLocaleDateString()
                    : 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Buddy: {checklist.buddyAssigned || 'Not assigned'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Joining Phase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Pre-Joining Tasks
            </CardTitle>
            {getMilestoneStatus(checklist.milestones?.preJoining)}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList phase="preJoining" tasks={checklist.preJoiningTasks} />
        </CardContent>
      </Card>

      {/* Day 1 Phase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-500" />
              Day 1 Tasks
            </CardTitle>
            {getMilestoneStatus(checklist.milestones?.day1)}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList phase="day1" tasks={checklist.day1Tasks} />
        </CardContent>
      </Card>

      {/* Week 1 Phase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              Week 1 Tasks
            </CardTitle>
            {getMilestoneStatus(checklist.milestones?.week1)}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList phase="week1" tasks={checklist.week1Tasks} />
        </CardContent>
      </Card>

      {/* Month 1 Phase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Month 1 Tasks
            </CardTitle>
            {getMilestoneStatus(checklist.milestones?.month1)}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList phase="month1" tasks={checklist.month1Tasks} />
        </CardContent>
      </Card>

      {/* Probation Phase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Probation Period Tasks
            </CardTitle>
            {getMilestoneStatus(checklist.milestones?.probation)}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList phase="probation" tasks={checklist.probationTasks} />
        </CardContent>
      </Card>
    </div>
  );
}
