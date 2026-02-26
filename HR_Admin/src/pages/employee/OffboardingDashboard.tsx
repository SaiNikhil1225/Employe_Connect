import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  Laptop,
  Shield,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { offboardingService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

export default function OffboardingDashboard() {
  const { user } = useAuthStore();
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exitInterviewDialog, setExitInterviewDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    reasonForLeaving: '',
    feedback: '',
    suggestions: '',
  });

  useEffect(() => {
    loadChecklistData();
  }, []);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      const response = await offboardingService.getEmployeeChecklist(user?.id || '');
      if (response.success) {
        setChecklist(response.data);
      }
    } catch (error) {
      toast.error('Failed to load offboarding checklist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExitInterview = async () => {
    try {
      const response = await offboardingService.completeExitInterview(
        user?.id || '',
        feedbackData
      );
      if (response.success) {
        toast.success('Exit interview submitted');
        setExitInterviewDialog(false);
        loadChecklistData();
      }
    } catch (error) {
      toast.error('Failed to submit exit interview');
      console.error(error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: 'default' as const, icon: CheckCircle2, color: 'text-green-500' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-500' },
      'not-started': {
        variant: 'outline' as const,
        icon: AlertCircle,
        color: 'text-gray-500',
      },
    };
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
        {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your offboarding checklist...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <LogOut className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Active Offboarding</h3>
          <p className="text-muted-foreground">You do not have an active offboarding process.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offboarding Process</h1>
          <p className="text-muted-foreground mt-1">
            Complete all tasks before your last working day
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Exit Clearance Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-bold">{checklist.overallProgress}%</span>
            </div>
            <Progress value={checklist.overallProgress} className="h-3" />
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="text-muted-foreground">Last Working Day</div>
                  <div className="font-medium">
                    {checklist.lastWorkingDay
                      ? new Date(checklist.lastWorkingDay).toLocaleDateString()
                      : 'Not set'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="text-muted-foreground">Notice Period</div>
                  <div className="font-medium">{checklist.noticePeriodDays || 0} days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="text-muted-foreground">Exit Type</div>
                  <div className="font-medium">{checklist.exitType || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Interview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Exit Interview
            </CardTitle>
            {getStatusBadge(checklist.exitInterview?.status || 'not-started')}
          </div>
        </CardHeader>
        <CardContent>
          {checklist.exitInterview?.completedAt ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Exit interview completed on{' '}
                {new Date(checklist.exitInterview.completedAt).toLocaleDateString()}
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Reason for leaving:</strong> {checklist.exitInterview.reasonForLeaving}
                </p>
              </div>
            </div>
          ) : checklist.exitInterview?.scheduledDate ? (
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Scheduled for:</strong>{' '}
                {new Date(checklist.exitInterview.scheduledDate).toLocaleString()}
              </p>
              <Button onClick={() => setExitInterviewDialog(true)} size="sm">
                Complete Exit Interview
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Exit interview not yet scheduled. HR will contact you soon.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assets Return */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-purple-500" />
              Company Assets
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(checklist.assetsReturned || {}).map(([asset, returned]: any) => (
              <div key={asset} className="flex items-center justify-between">
                <span className="text-sm capitalize">{asset.replace(/([A-Z])/g, ' $1').trim()}</span>
                {returned ? (
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Returned
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending Return
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Revocation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Revocation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(checklist.accessRevoked || {}).map(([access, revoked]: any) => (
              <div key={access} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {access.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {revoked ? (
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Revoked
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Clearances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Department Clearances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.departmentClearances &&
              checklist.departmentClearances.map((clearance: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{clearance.department}</span>
                  {getStatusBadge(clearance.status)}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Exit Interview Dialog */}
      <Dialog open={exitInterviewDialog} onOpenChange={setExitInterviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exit Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reasonForLeaving">Reason for Leaving *</Label>
              <Textarea
                id="reasonForLeaving"
                value={feedbackData.reasonForLeaving}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, reasonForLeaving: e.target.value })
                }
                placeholder="Please share your primary reason for leaving"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback on Company</Label>
              <Textarea
                id="feedback"
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                placeholder="Your experience working here..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="suggestions">Suggestions for Improvement</Label>
              <Textarea
                id="suggestions"
                value={feedbackData.suggestions}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, suggestions: e.target.value })
                }
                placeholder="How can we improve?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitInterviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitExitInterview}
              disabled={!feedbackData.reasonForLeaving}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
