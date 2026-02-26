import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/contexts/ProfileContext';
import { leaveService } from '@/services/leaveService';
import type { LeaveRequest } from '@/types/leave';
import { useLeaveStore } from '@/store/leaveStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, Plus, Eye, Search, Filter, CalendarDays, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { LEAVE_PLAN_COLORS as LeavePlanColors } from '@/types/leave';

export function LeaveManagement() {
  const { user } = useAuthStore();
  const { permissions } = useProfile();
  const { fetchLeaveBalance, leaveBalance } = useLeaveStore();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApplyDrawer, setShowApplyDrawer] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaveRequests();
    if (user?.employeeId) {
      fetchLeaveBalance(user.employeeId);
    }
  }, [user?.employeeId]);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const data = await leaveService.getAll();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests for current user
  const myRequests = useMemo(() => {
    if (!user?.employeeId) return [];
    
    let filtered = leaveRequests.filter(req => req.employeeId === user.employeeId);

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.leaveType.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query)
      );
    }

    // Sort by applied date (newest first)
    return filtered.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  }, [leaveRequests, user, statusFilter, searchQuery]);

  const calculateDays = (from: string, to: string): number => {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitLeave = async () => {
    if (!user?.employeeId || !user?.name || !user?.department) {
      console.error('User data missing:', user);
      toast.error('User information not available');
      return;
    }

    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const days = calculateDays(formData.fromDate, formData.toDate);

    const requestData = {
      employeeId: user.employeeId,
      employeeName: user.name,
      department: user.department,
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      days,
      reason: formData.reason,
    };

    try {
      setIsLoading(true);
      await leaveService.create(requestData);

      toast.success('Leave request submitted for approval');
      setShowApplyDrawer(false);
      setFormData({
        leaveType: 'Casual Leave',
        fromDate: '',
        toDate: '',
        reason: '',
      });
      await loadLeaveRequests();
    } catch (error) {
      console.error('Failed to submit leave:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequest = (request: LeaveRequestData) => {
    setSelectedRequest(request);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status: LeaveRequestData['status']) => {
    const variants: Record<LeaveRequestData['status'], { className: string }> = {
      Pending: { className: 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400' },
      Approved: { className: 'bg-green-100 text-green-700' },
      Rejected: { className: 'bg-red-100 text-red-700' },
    };

    return (
      <Badge variant="outline" className={variants[status].className}>
        {status}
      </Badge>
    );
  };

  const stats = useMemo(() => {
    const userRequests = user?.employeeId 
      ? leaveRequests.filter(r => r.employeeId === user.employeeId)
      : [];
    
    return {
      pending: userRequests.filter(r => r.status === 'Pending').length,
      approved: userRequests.filter(r => r.status === 'Approved').length,
      rejected: userRequests.filter(r => r.status === 'Rejected').length,
    };
  }, [leaveRequests, user]);

  // Leave balance display
  const dynamicLeaveBalance = useMemo(() => {
    if (!leaveBalance || !leaveBalance.leaveTypes) {
      return { employeeId: user?.employeeId || '', leavePlan: 'Acuvate', leaveTypes: [] };
    }
    return leaveBalance;
  }, [leaveBalance, user]);

  return (
    <div className="page-container">
      {/* View-Only Banner for HR User */}
      {permissions.isHRUser && (
        <div className="mb-4 p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">View-Only Mode</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You can view leave requests but cannot approve or reject them. Switch to HR Admin mode in the header to manage leave requests.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <CalendarDays className="h-7 w-7 text-primary" />
            My Leave Management
          </h1>
          <p className="page-description">View your leave balance and manage requests</p>
          {dynamicLeaveBalance.leavePlan && (
            <Badge className={LeavePlanColors[dynamicLeaveBalance.leavePlan as keyof typeof LeavePlanColors] || 'bg-gray-100'}>
              {dynamicLeaveBalance.leavePlan} Plan
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowApplyDrawer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {dynamicLeaveBalance.leaveTypes && dynamicLeaveBalance.leaveTypes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Your Leave Balance</h2>
              <p className="text-sm text-muted-foreground">
                {dynamicLeaveBalance.leaveTypes.length} leave {dynamicLeaveBalance.leaveTypes.length === 1 ? 'type' : 'types'} available in your plan
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {dynamicLeaveBalance.leaveTypes.reduce((sum, lt) => sum + (lt.available || 0), 0)} total days available
            </Badge>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {dynamicLeaveBalance.leaveTypes.map((leaveType) => {
            const colorMap: Record<string, { border: string; text: string; progressBg: string }> = {
              'Casual Leave': { border: 'border-l-purple-500', text: 'text-purple-600', progressBg: 'bg-purple-100 dark:bg-purple-950/30' },
              'Earned Leave': { border: 'border-l-blue-500', text: 'text-blue-600', progressBg: 'bg-blue-100 dark:bg-blue-950/30' },
              'Sick Leave': { border: 'border-l-red-500', text: 'text-red-600', progressBg: 'bg-red-100 dark:bg-red-950/30' },
              'Compensatory Off': { border: 'border-l-orange-500', text: 'text-orange-600', progressBg: 'bg-orange-100 dark:bg-orange-950/30' },
              'Maternity Leave': { border: 'border-l-pink-500', text: 'text-pink-600', progressBg: 'bg-pink-100 dark:bg-pink-950/30' },
              'Paternity Leave': { border: 'border-l-green-500', text: 'text-green-600', progressBg: 'bg-green-100 dark:bg-green-950/30' },
              'Bereavement Leave': { border: 'border-l-gray-500', text: 'text-gray-600', progressBg: 'bg-gray-100 dark:bg-gray-950/30' },
              'Marriage Leave': { border: 'border-l-yellow-500', text: 'text-yellow-600', progressBg: 'bg-yellow-100 dark:bg-yellow-950/30' },
              'Loss of Pay': { border: 'border-l-slate-500', text: 'text-slate-600', progressBg: 'bg-slate-100 dark:bg-slate-950/30' },
              'Annual Leave': { border: 'border-l-indigo-500', text: 'text-indigo-600', progressBg: 'bg-indigo-100 dark:bg-indigo-950/30' }
            };

            const colors = colorMap[leaveType.type] || colorMap['Loss of Pay'];
            const totalAllocated = leaveType.allocated || leaveType.accrued || 0;
            const progressPercent = totalAllocated > 0 ? (leaveType.available / totalAllocated) * 100 : 0;

            return (
              <Card key={leaveType.type} className={`border-l-4 ${colors.border}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{leaveType.type}</CardTitle>
                  <CardDescription className="text-xs">
                    {leaveType.carriedForward > 0 ? `Includes ${leaveType.carriedForward} carried forward` : 'Current year'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-xl font-bold ${colors.text}`}>
                        {leaveType.available}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">of {totalAllocated} available</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={progressPercent} className={`h-1.5 ${colors.progressBg}`} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {leaveType.used}</span>
                        {leaveType.pending > 0 && (
                          <span className="text-orange-500">+{leaveType.pending} pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved leaves</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>My Leave History</CardTitle>
              <CardDescription>View and track all your leave requests</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading leave requests...
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'No leave requests found matching your filters.'
                : 'No leave requests yet. Click "Apply Leave" to submit your first request.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRequests.map((request) => (
                    <TableRow key={request.id || request._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {request.leaveType}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.fromDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.toDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{request.days} day{request.days > 1 ? 's' : ''}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {request.reason}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.appliedOn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Drawer */}
      <Sheet open={showApplyDrawer} onOpenChange={setShowApplyDrawer}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Apply for Leave</SheetTitle>
            <SheetDescription>
              Submit a new leave request for manager approval
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="leave-type">
                Leave Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger id="leave-type" className="mt-2">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {dynamicLeaveBalance.leaveTypes && dynamicLeaveBalance.leaveTypes.length > 0 ? (
                    dynamicLeaveBalance.leaveTypes.map((lt) => (
                      <SelectItem key={lt.type} value={lt.type}>
                        {lt.type} ({lt.available} days available)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-date">
                  From Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="to-date">
                  To Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="to-date"
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  className="mt-2"
                  min={formData.fromDate}
                />
              </div>
            </div>
            {formData.fromDate && formData.toDate && (
              <div className="text-sm text-muted-foreground">
                Duration: {calculateDays(formData.fromDate, formData.toDate)} day(s)
              </div>
            )}
            <div>
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowApplyDrawer(false);
                setFormData({
                  leaveType: 'Casual Leave',
                  fromDate: '',
                  toDate: '',
                  reason: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitLeave}
              disabled={!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason.trim() || isLoading}
            >
              Submit Request
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* View Request Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Complete information about your leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Leave Type</Label>
                  <p className="mt-1 font-medium">{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="mt-1">{selectedRequest.days} day{selectedRequest.days > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">From Date</Label>
                  <p className="mt-1">
                    {new Date(selectedRequest.fromDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">To Date</Label>
                  <p className="mt-1">
                    {new Date(selectedRequest.toDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap bg-muted-color p-3 rounded-md">{selectedRequest.reason}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Applied On</Label>
                <p className="mt-1 text-sm">
                  {new Date(selectedRequest.appliedOn).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              {selectedRequest.status === 'Approved' && selectedRequest.reviewedBy && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Approved By</Label>
                  <p className="mt-1">{selectedRequest.reviewedBy}</p>
                  {selectedRequest.reviewedOn && (
                    <p className="text-sm text-muted-foreground">
                      on {new Date(selectedRequest.reviewedOn).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              {selectedRequest.status === 'Rejected' && selectedRequest.reviewedBy && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Rejected By</Label>
                  <p className="mt-1">{selectedRequest.reviewedBy}</p>
                  {selectedRequest.reviewedOn && (
                    <p className="text-sm text-muted-foreground">
                      on {new Date(selectedRequest.reviewedOn).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
