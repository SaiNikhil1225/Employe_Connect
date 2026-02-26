import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHiringStore } from '@/store/hiringStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HiringStatusBadge } from '@/components/hiring/HiringStatusBadge';
import {
  ArrowLeft,
  Edit,
  Send,
  Ban,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function HiringRequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentRequest, fetchRequestById, submitRequest, updateStatus, closeRequest, isLoading } = useHiringStore();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [closureType, setClosureType] = useState('');

  const isHR = user?.role === 'HR' || user?.role === 'SUPER_ADMIN';
  const isOwner = currentRequest?.hiringManagerId === user?.id;

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  const handleSubmit = async () => {
    if (id) {
      await submitRequest(id);
      fetchRequestById(id);
    }
  };

  const handleStatusUpdate = async () => {
    if (id && newStatus) {
      await updateStatus(id, newStatus);
      setShowStatusDialog(false);
      fetchRequestById(id);
    }
  };

  const handleClose = async () => {
    if (id && closureReason && closureType) {
      await closeRequest(id, closureReason, closureType);
      setShowCloseDialog(false);
      fetchRequestById(id);
    }
  };

  if (isLoading || !currentRequest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Clock className="h-12 w-12 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-green-500';
      case 'In Progress':
      case 'Open':
        return 'bg-blue-500';
      case 'Submitted':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 rounded-xl p-6 border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex space-x-2">
            {isOwner && currentRequest.status === 'Draft' && (
              <>
                <Button variant="outline" onClick={() => navigate(`/hiring/edit/${id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSubmit} className="shadow-lg shadow-primary/25">
                  <Send className="mr-2 h-4 w-4" />
                  Submit to HR
                </Button>
              </>
            )}
            {isHR && currentRequest.status !== 'Closed' && (
              <>
                <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
                  Update Status
                </Button>
                <Button variant="destructive" onClick={() => setShowCloseDialog(true)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Close Request
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className={`w-1 h-32 ${getStatusColor(currentRequest.status)} rounded`} />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{currentRequest.jobTitle}</h1>
                <p className="text-sm text-muted-foreground font-mono">{currentRequest.requestNumber}</p>
              </div>
              <HiringStatusBadge status={currentRequest.status} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-background/80 backdrop-blur rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Created</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(currentRequest.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              
              {currentRequest.submittedAt && (
                <div className="bg-background/80 backdrop-blur rounded-lg p-3 border">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                    <Send className="h-4 w-4" />
                    <span className="text-xs font-medium">Submitted</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {format(new Date(currentRequest.submittedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              
              <div className="bg-background/80 backdrop-blur rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs font-medium">Type</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {currentRequest.employmentType}
                </p>
              </div>
              
              <div className="bg-background/80 backdrop-blur rounded-lg p-3 border">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-medium">Location</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {currentRequest.workLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Position Details */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle>Position Details</CardTitle>
              </div>
              <CardDescription>Job requirements and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentRequest.candidateName && (
                  <div className="bg-muted/30 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Candidate/Employee Name</span>
                    </div>
                    <p className="font-semibold text-foreground">{currentRequest.candidateName}</p>
                  </div>
                )}
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Employment Type</span>
                  </div>
                  <p className="font-semibold text-foreground">{currentRequest.employmentType}</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Hiring Type</span>
                  </div>
                  <p className="font-semibold text-foreground">{currentRequest.hiringType}</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Work Location</span>
                  </div>
                  <p className="font-semibold text-foreground">{currentRequest.workLocation}</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Joining Date</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {format(new Date(currentRequest.preferredJoiningDate), 'MMM dd, yyyy')}
                  </p>
                </div>

                {currentRequest.shiftOrHours && (
                  <div className="bg-muted/30 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Working Hours</span>
                    </div>
                    <p className="font-semibold text-foreground">{currentRequest.shiftOrHours}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Replacement Details */}
          {currentRequest.replacementDetails && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <CardTitle>Replacement Details</CardTitle>
                </div>
                <CardDescription>Information about the employee being replaced</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Employee Name</p>
                    <p className="font-semibold text-foreground">{currentRequest.replacementDetails.employeeName}</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Last Working Day</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(currentRequest.replacementDetails.lastWorkingDay), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Reason for Replacement</p>
                    <p className="font-semibold text-foreground">{currentRequest.replacementDetails.reasonForReplacement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience & Budget */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle>Experience & Compensation</CardTitle>
              </div>
              <CardDescription>Required experience and budget range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Min. Experience</p>
                  <p className="font-semibold text-foreground text-2xl">{currentRequest.minimumYears} <span className="text-sm font-normal">years</span></p>
                </div>
                
                {currentRequest.preferredIndustry && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Preferred Industry</p>
                    <p className="font-semibold text-foreground">{currentRequest.preferredIndustry}</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget Range</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currentRequest.budgetRange.currency} {currentRequest.budgetRange.min.toLocaleString()} - {currentRequest.budgetRange.max.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Justification */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-500" />
                </div>
                <CardTitle>Business Justification</CardTitle>
              </div>
              <CardDescription>Reason for this hiring request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{currentRequest.justification}</p>
              </div>
            </CardContent>
          </Card>

          {/* HR Notes (HR only) */}
          {isHR && currentRequest.hrNotes && (
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle>HR Notes (Internal)</CardTitle>
                </div>
                <CardDescription>Internal notes visible to HR only</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{currentRequest.hrNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Closure Information */}
          {currentRequest.status === 'Closed' && (
            <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Closure Information</CardTitle>
                </div>
                <CardDescription>Request closure details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRequest.closureType && (
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Closure Type</p>
                      <Badge variant="destructive">{currentRequest.closureType}</Badge>
                    </div>
                  )}
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Closure Reason</p>
                    <p className="font-medium text-foreground">{currentRequest.closureReason}</p>
                  </div>
                  {currentRequest.closedAt && (
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Closed Date</p>
                      <p className="font-medium text-foreground">{format(new Date(currentRequest.closedAt), 'PPP')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Info */}
          <Card className="border-l-4 border-l-cyan-500 sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-cyan-500" />
                </div>
                <CardTitle>Requester Information</CardTitle>
              </div>
              <CardDescription>Contact details of the hiring manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Name</span>
                </div>
                <p className="font-semibold text-foreground">{currentRequest.hiringManagerName}</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Department</span>
                </div>
                <p className="font-semibold text-foreground">{currentRequest.department}</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Designation</span>
                </div>
                <p className="font-semibold text-foreground">{currentRequest.designation}</p>
              </div>
              
              <Separator />
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Email</span>
                </div>
                <a href={`mailto:${currentRequest.contactEmail}`} className="font-medium text-primary hover:underline text-sm break-all">
                  {currentRequest.contactEmail}
                </a>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Phone</span>
                </div>
                <a href={`tel:${currentRequest.contactPhone}`} className="font-medium text-primary hover:underline">
                  {currentRequest.contactPhone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* HR Assignment (HR only) */}
          {isHR && currentRequest.hrAssignedToName && (
            <Card className="border-l-4 border-l-teal-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  </div>
                  <CardTitle>Assigned Recruiter</CardTitle>
                </div>
                <CardDescription>HR personnel handling this request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-semibold text-foreground">{currentRequest.hrAssignedToName}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card className="border-l-4 border-l-slate-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <CardTitle>Activity Timeline</CardTitle>
              </div>
              <CardDescription>Request status history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRequest.activityLog.map((activity, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      {index < currentRequest.activityLog.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.performedByName} • {format(new Date(activity.timestamp), 'PPp')}
                      </p>
                      {activity.notes && (
                        <div className="bg-muted/30 rounded-lg p-2 mt-2">
                          <p className="text-sm text-muted-foreground">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Change the status of this hiring request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Request Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Hiring Request</DialogTitle>
            <DialogDescription>
              Provide closure information for this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Closure Type</Label>
              <Select value={closureType} onValueChange={setClosureType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Position Filled">Position Filled</SelectItem>
                  <SelectItem value="Request Cancelled">Request Cancelled</SelectItem>
                  <SelectItem value="Budget Denied">Budget Denied</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Closure Reason</Label>
              <Textarea
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="Explain why this request is being closed..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClose}
              disabled={!closureReason || !closureType}
            >
              Close Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
