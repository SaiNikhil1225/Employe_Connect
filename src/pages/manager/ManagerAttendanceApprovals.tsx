import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useIsManager } from '@/hooks/useIsManager';
import { type WFHRequest, type RegularizationRequest } from '@/types/attendance';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  CheckCircle,
  XCircle,
  Clock,
  Home,
  CalendarCheck,
  AlertCircle,
  Eye,
  ClipboardList,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatRequestType(type: string) {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ManagerAttendanceApprovals() {
  const { user } = useAuthStore();
  const { isManager, reportingIds } = useIsManager();
  const {
    wfhRequests,
    regularizationRequests,
    fetchWFHRequests,
    fetchRegularizationRequests,
    approveWFHRequest,
    rejectWFHRequest,
    approveRegularization,
    rejectRegularization,
  } = useAttendanceStore();

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionId, setActionId] = useState<string>('');
  const [actionType, setActionType] = useState<'wfh' | 'regularization'>('wfh');
  const [detailItem, setDetailItem] = useState<WFHRequest | RegularizationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Load data
  const loadData = useCallback(async () => {
    try {
      await Promise.all([fetchWFHRequests(), fetchRegularizationRequests()]);
    } catch {
      // errors handled by store
    }
  }, [fetchWFHRequests, fetchRegularizationRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter to team members only (exclude self)
  const teamWFHRequests = useMemo(() => {
    let filtered = wfhRequests.filter(
      (req) => req.employeeId !== user?.employeeId && reportingIds.has(req.employeeId)
    );
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [wfhRequests, user?.employeeId, reportingIds, statusFilter]);

  const teamRegularizationRequests = useMemo(() => {
    let filtered = regularizationRequests.filter(
      (req) => req.employeeId !== user?.employeeId && reportingIds.has(req.employeeId)
    );
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [regularizationRequests, user?.employeeId, reportingIds, statusFilter]);

  // Counts
  const pendingWFH = wfhRequests.filter(
    (r) => r.status === 'pending' && r.employeeId !== user?.employeeId && reportingIds.has(r.employeeId)
  ).length;
  const pendingReg = regularizationRequests.filter(
    (r) => r.status === 'pending' && r.employeeId !== user?.employeeId && reportingIds.has(r.employeeId)
  ).length;

  // ── Action handlers ──────────────────────────────────────────────────────────

  const openApprove = (id: string, type: 'wfh' | 'regularization') => {
    setActionId(id);
    setActionType(type);
    setApproveDialogOpen(true);
  };

  const openReject = (id: string, type: 'wfh' | 'regularization') => {
    setActionId(id);
    setActionType(type);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const openDetail = (item: WFHRequest | RegularizationRequest, type: 'wfh' | 'regularization') => {
    setDetailItem(item);
    setActionType(type);
    setDetailDialogOpen(true);
  };

  const confirmApprove = async () => {
    setSubmitting(true);
    try {
      if (actionType === 'wfh') {
        await approveWFHRequest(actionId);
        toast.success('WFH request approved');
      } else {
        await approveRegularization(actionId);
        toast.success('Regularization request approved');
      }
      setApproveDialogOpen(false);
    } catch {
      // error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      if (actionType === 'wfh') {
        await rejectWFHRequest(actionId, rejectionReason.trim());
        toast.success('WFH request rejected');
      } else {
        await rejectRegularization(actionId, rejectionReason.trim());
        toast.success('Regularization request rejected');
      }
      setRejectDialogOpen(false);
    } catch {
      // error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guard ────────────────────────────────────────────────────────────────────

  if (!isManager) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              This page is only available to Reporting Managers. You must have direct reports to access
              attendance approvals.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Attendance Approvals"
        description="Review and approve WFH and regularization requests from your team"
        icon={CalendarCheck}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending WFH</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600">{pendingWFH}</h3>
              </div>
              <Home className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Regularization</p>
                <h3 className="text-2xl font-bold mt-1 text-orange-600">{pendingReg}</h3>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                <h3 className="text-2xl font-bold mt-1">{pendingWFH + pendingReg}</h3>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wfh">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="wfh" className="gap-2">
              <Home className="h-4 w-4" />
              WFH Requests
              {pendingWFH > 0 && (
                <Badge className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0">{pendingWFH}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="regularization" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Regularization
              {pendingReg > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0">{pendingReg}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Status filter */}
          <div className="flex gap-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* WFH Requests Tab */}
        <TabsContent value="wfh">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work From Home Requests</CardTitle>
              <CardDescription>
                {teamWFHRequests.length === 0
                  ? 'No WFH requests found for your team.'
                  : `Showing ${teamWFHRequests.length} request${teamWFHRequests.length === 1 ? '' : 's'}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {teamWFHRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Home className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No WFH requests to review</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamWFHRequests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{req.employeeId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(req.fromDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(req.toDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate text-muted-foreground">{req.reason}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              onClick={() => openDetail(req, 'wfh')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve"
                                  onClick={() => openApprove(req._id, 'wfh')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject"
                                  onClick={() => openReject(req._id, 'wfh')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regularization Requests Tab */}
        <TabsContent value="regularization">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regularization Requests</CardTitle>
              <CardDescription>
                {teamRegularizationRequests.length === 0
                  ? 'No regularization requests found for your team.'
                  : `Showing ${teamRegularizationRequests.length} request${teamRegularizationRequests.length === 1 ? '' : 's'}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {teamRegularizationRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No regularization requests to review</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamRegularizationRequests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{req.employeeId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(req.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {formatRequestType(req.requestType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate text-muted-foreground">{req.reason}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              onClick={() => openDetail(req, 'regularization')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve"
                                  onClick={() => openApprove(req._id, 'regularization')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject"
                                  onClick={() => openReject(req._id, 'regularization')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Approve Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this{' '}
              {actionType === 'wfh' ? 'WFH' : 'regularization'} request? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Approving…' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this{' '}
              {actionType === 'wfh' ? 'WFH' : 'regularization'} request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {rejectionReason.length}/500
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={submitting || !rejectionReason.trim()}
            >
              {submitting ? 'Rejecting…' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'wfh' ? 'WFH Request Details' : 'Regularization Request Details'}
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{detailItem.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.employeeId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="font-medium">{detailItem.department}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(detailItem.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted On</Label>
                  <p className="font-medium">
                    {format(new Date(detailItem.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {actionType === 'wfh' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">From Date</Label>
                      <p className="font-medium">
                        {format(new Date((detailItem as WFHRequest).fromDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">To Date</Label>
                      <p className="font-medium">
                        {format(new Date((detailItem as WFHRequest).toDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="font-medium">
                        {format(new Date((detailItem as RegularizationRequest).date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Request Type</Label>
                      <p className="font-medium">
                        {formatRequestType((detailItem as RegularizationRequest).requestType)}
                      </p>
                    </div>
                  </div>
                  {(detailItem as RegularizationRequest).proposedCheckIn && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Proposed Check-In</Label>
                        <p className="font-medium">
                          {format(
                            new Date((detailItem as RegularizationRequest).proposedCheckIn!),
                            'hh:mm a'
                          )}
                        </p>
                      </div>
                      {(detailItem as RegularizationRequest).proposedCheckOut && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Proposed Check-Out</Label>
                          <p className="font-medium">
                            {format(
                              new Date((detailItem as RegularizationRequest).proposedCheckOut!),
                              'hh:mm a'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="mt-1 p-3 bg-muted/50 rounded-md text-sm leading-relaxed">
                  {detailItem.reason}
                </p>
              </div>

              {detailItem.status === 'rejected' && detailItem.rejectionReason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md text-sm text-red-700 dark:text-red-400">
                    {detailItem.rejectionReason}
                  </p>
                </div>
              )}

              {detailItem.status === 'approved' && detailItem.approvedBy && (
                <div>
                  <Label className="text-xs text-muted-foreground">Approved By</Label>
                  <p className="mt-1 font-medium">{detailItem.approvedBy}</p>
                  {detailItem.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(detailItem.approvedAt), 'MMM dd, yyyy hh:mm a')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detailItem?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openReject(detailItem._id, actionType);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openApprove(detailItem._id, actionType);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
