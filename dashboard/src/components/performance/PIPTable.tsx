import { useState, useEffect } from 'react';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/avatarUtils';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X, 
  MoreVertical,
  Eye,
  CheckCircle2,
  ListTodo,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getInitials } from '@/constants/design-system';

interface PIPRecord {
  _id: string;
  pipNumber: string;
  status: 'Pending' | 'Acknowledged' | 'Active' | 'Completed' | 'Failed' | 'Cancelled';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  startDate: string;
  endDate: string;
  duration: number;
  daysRemaining: number;
  reason: string;
  improvementPlan: string;
  evaluationProcess: string;
  tasks: Array<{
    name: string;
    startDate: string;
    completed: boolean;
    completedDate?: string;
  }>;
  completedTasks: number;
  totalTasks: number;
  progress: number;
  raisedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  reportingManager: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  initiatedAt: string;
}

interface PIPTableProps {
  employeeId?: string;
}

export default function PIPTable({ employeeId: propEmployeeId }: PIPTableProps = {}) {
  const { user } = useAuthStore();
  const [pipRecords, setPipRecords] = useState<PIPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Use prop employeeId if provided, otherwise use current user's employeeId
  const employeeId = propEmployeeId || user?.employeeId;

  useEffect(() => {
    if (employeeId) {
      fetchPIPRecords();
    }
  }, [employeeId]);

  const fetchPIPRecords = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/pip/employee/${employeeId}`);
      console.log('PIP Records response:', response.data);
      if (response.data.success) {
        setPipRecords(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch PIP records:', error);
      toast.error('Failed to load PIP records');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (pipId: string) => {
    try {
      const response = await apiClient.patch(`/pip/${pipId}/acknowledge`);
      if (response.data.success) {
        toast.success('PIP acknowledged successfully');
        fetchPIPRecords();
      }
    } catch (error: any) {
      console.error('Failed to acknowledge PIP:', error);
      toast.error(error.response?.data?.message || 'Failed to acknowledge PIP');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      Pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      Acknowledged: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Acknowledged' },
      Active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
      Completed: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Completed' },
      Failed: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Failed' },
      Cancelled: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Cancelled' },
    };

    const variant = variants[status] || variants.Pending;
    return (
      <Badge className={`${variant.color} border px-2.5 py-0.5 text-xs font-medium`}>
        {variant.label}
      </Badge>
    );
  };

  const getApprovalBadge = (status: string) => {
    if (status === 'Approved') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Approved</span>
        </div>
      );
    }
    if (status === 'Pending') {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-600">
        <X className="h-4 w-4" />
        <span className="text-sm font-medium">Rejected</span>
      </div>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const toggleRowExpansion = (pipId: string) => {
    setExpandedRowId(expandedRowId === pipId ? null : pipId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pipRecords.length === 0) {
    return (
      <Card className="bg-green-50/50 border-green-200">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Performance Improvement Plans
            </h3>
            <p className="text-sm text-gray-600">
              You don't have any active or past PIPs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activePIP = pipRecords.find(pip => 
    ['Pending', 'Acknowledged', 'Active'].includes(pip.status)
  );

  return (
    <div className="space-y-6">
      {/* Active PIP Alert Banner */}
      {activePIP && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Active Performance Improvement Plan</h3>
                {getStatusBadge(activePIP.status)}
              </div>
              <p className="text-sm text-gray-700 mb-3">
                <strong>PIP Number:</strong> {activePIP.pipNumber}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activePIP.reason}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium">{format(new Date(activePIP.startDate), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-medium">{format(new Date(activePIP.endDate), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{activePIP.duration} days</p>
                </div>
              </div>
              {activePIP.status === 'Pending' && (
                <Button
                  onClick={() => handleAcknowledge(activePIP._id)}
                  className="mt-4"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Acknowledge PIP
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PIP Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>PIP Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-32">PIP Number</TableHead>
                  <TableHead className="w-48">Raised By</TableHead>
                  <TableHead className="w-48">Reporting Manager</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-36">Approved</TableHead>
                  <TableHead className="w-32">Start Date</TableHead>
                  <TableHead className="w-32">End Date</TableHead>
                  <TableHead className="w-32">Duration</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipRecords.map((pip) => (
                  <>
                    <TableRow
                      key={pip._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <button
                          onClick={() => toggleRowExpansion(pip._id)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {pip.pipNumber}
                          {expandedRowId === pip._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        {pip.raisedBy ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={pip.raisedBy.avatar} />
                              <AvatarFallback 
                                className="text-xs font-semibold"
                                style={{
                                  backgroundColor: getAvatarColor(pip.raisedBy.employeeId || pip.raisedBy.name).bg,
                                  color: getAvatarColor(pip.raisedBy.employeeId || pip.raisedBy.name).text,
                                }}
                              >
                                {getInitials(pip.raisedBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{pip.raisedBy.name}</p>
                              <p className="text-xs text-gray-500">{pip.raisedBy.role}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pip.reportingManager ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={pip.reportingManager.avatar} />
                              <AvatarFallback 
                                className="text-xs font-semibold"
                                style={{
                                  backgroundColor: getAvatarColor(pip.reportingManager.employeeId || pip.reportingManager.name).bg,
                                  color: getAvatarColor(pip.reportingManager.employeeId || pip.reportingManager.name).text,
                                }}
                              >
                                {getInitials(pip.reportingManager.name)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">{pip.reportingManager.name}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(pip.status)}</TableCell>
                      <TableCell>{getApprovalBadge(pip.approvalStatus)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(pip.startDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(pip.endDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {pip.daysRemaining > 0 ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className={pip.daysRemaining < 10 ? 'text-amber-600 font-medium' : ''}>
                                {pip.daysRemaining} days left
                              </span>
                            </div>
                          ) : (
                            <span>{pip.duration} days</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(pip.progress)}`}
                              style={{ width: `${pip.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600">
                            {pip.completedTasks}/{pip.totalTasks} tasks ({pip.progress}%)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleRowExpansion(pip._id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {pip.status === 'Pending' && (
                              <DropdownMenuItem onClick={() => handleAcknowledge(pip._id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Acknowledge
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <ListTodo className="h-4 w-4 mr-2" />
                              View Tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Details */}
                    {expandedRowId === pip._id && (
                      <TableRow className="bg-gray-50 border-t-2 border-blue-500">
                        <TableCell colSpan={10} className="p-6">
                          <div className="space-y-6">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Raised By</h4>
                                {pip.raisedBy && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={pip.raisedBy.avatar} />
                                      <AvatarFallback
                                        className="font-semibold"
                                        style={{
                                          backgroundColor: getAvatarColor(pip.raisedBy.employeeId || pip.raisedBy.name).bg,
                                          color: getAvatarColor(pip.raisedBy.employeeId || pip.raisedBy.name).text,
                                        }}
                                      >
                                        {getInitials(pip.raisedBy.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{pip.raisedBy.name}</p>
                                      <p className="text-xs text-gray-500">{pip.raisedBy.role}</p>
                                      <p className="text-xs text-gray-400">{pip.raisedBy.email}</p>
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  Date: {format(new Date(pip.initiatedAt), 'dd MMM yyyy')}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Reporting Manager</h4>
                                {pip.reportingManager && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={pip.reportingManager.avatar} />
                                      <AvatarFallback
                                        className="font-semibold"
                                        style={{
                                          backgroundColor: getAvatarColor(pip.reportingManager.employeeId || pip.reportingManager.name).bg,
                                          color: getAvatarColor(pip.reportingManager.employeeId || pip.reportingManager.name).text,
                                        }}
                                      >
                                        {getInitials(pip.reportingManager.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{pip.reportingManager.name}</p>
                                      <p className="text-xs text-gray-400">{pip.reportingManager.email}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Evaluation Process</h4>
                                <p className="text-sm font-medium">{pip.evaluationProcess}</p>
                                <div className="mt-3">
                                  <h4 className="text-xs font-medium text-gray-500 mb-1">Duration</h4>
                                  <p className="text-sm">{pip.duration} days</p>
                                </div>
                              </div>
                            </div>

                            {/* Reason */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Reason for PIP</h4>
                              <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                                {pip.reason}
                              </div>
                            </div>

                            {/* Improvement Plan */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Improvement Plan</h4>
                              <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                                {pip.improvementPlan}
                              </div>
                            </div>

                            {/* Tasks */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                Tasks 
                                <Badge variant="secondary" className="text-xs">
                                  {pip.completedTasks}/{pip.totalTasks} completed
                                </Badge>
                              </h4>
                              <div className="space-y-2">
                                {pip.tasks.map((task, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={task.completed}
                                      disabled
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {task.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Start: {format(new Date(task.startDate), 'dd MMM yyyy')}
                                        {task.completedDate && (
                                          <> • Completed: {format(new Date(task.completedDate), 'dd MMM yyyy')}</>
                                        )}
                                      </p>
                                    </div>
                                    {task.completed ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
                                    ) : (
                                      <Badge variant="secondary">Pending</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
