import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiringStore } from '@/store/hiringStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HiringStatusBadge } from '@/components/hiring/HiringStatusBadge';
import { HiringRequestDrawer } from '@/components/hiring/HiringRequestDrawer';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Briefcase,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MyHiringRequestsPage() {
  const navigate = useNavigate();

  const { requests, isLoading, fetchRequests, deleteRequest } = useHiringStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editRequestId, setEditRequestId] = useState<string | undefined>(undefined);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests(false); // false = my requests only
  }, [fetchRequests]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRequest(deleteId);
      setDeleteId(null);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleNewRequest = () => {
    setEditRequestId(undefined);
    setShowDrawer(true);
  };

  const handleEditRequest = (id: string) => {
    setEditRequestId(id);
    setShowDrawer(true);
  };

  const handleDrawerSuccess = () => {
    fetchRequests(false);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const draft = requests.filter(r => r.status === 'Draft').length;
    const submitted = requests.filter(r => r.status === 'Submitted').length;
    const open = requests.filter(r => r.status === 'Open').length;
    const inProgress = requests.filter(r => r.status === 'In Progress').length;
    const closed = requests.filter(r => r.status === 'Closed').length;

    return { total, draft, submitted, open, inProgress, closed };
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }
      // Employment type filter
      if (employmentTypeFilter !== 'all' && req.employmentType !== employmentTypeFilter) {
        return false;
      }
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.jobTitle.toLowerCase().includes(query) ||
          req.requestNumber.toLowerCase().includes(query) ||
          req.department.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, statusFilter, employmentTypeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 rounded-xl p-6 border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">My Hiring Requests</h1>
                <p className="text-sm text-muted-foreground">Track and manage your hiring requests</p>
              </div>
            </div>
          </div>
          <Button onClick={handleNewRequest} size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
              <p className="text-lg font-semibold text-foreground">{stats.total}</p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-lg font-semibold text-foreground">{stats.inProgress + stats.open}</p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Closed</p>
              <p className="text-lg font-semibold text-foreground">{stats.closed}</p>
            </div>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-lg p-3 border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-lg font-semibold text-foreground">{stats.draft}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            </div>
            <CardDescription className="text-xs">Awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </div>
            <CardDescription className="text-xs">Open and in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.open + stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </div>
            <CardDescription className="text-xs">Successfully closed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>
      {/* Requests Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Requests History
                </CardTitle>
                <CardDescription>Your hiring requests ({filteredRequests.length} total)</CardDescription>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={employmentTypeFilter} onValueChange={(value) => {
                setEmploymentTypeFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[140px]">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== 'all' || employmentTypeFilter !== 'all' || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setEmploymentTypeFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hiring requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "New Request" to create your first hiring request
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No matching requests</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((request) => {
                      const statusColor = request.status === 'Closed' ? 'bg-green-500'
                        : request.status === 'In Progress' || request.status === 'Open' ? 'bg-blue-500'
                        : request.status === 'Submitted' ? 'bg-orange-500'
                        : 'bg-gray-400';

                      return (
                        <TableRow 
                          key={request._id}
                          className="group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                          onClick={() => navigate(`/hiring/${request._id}`)}
                        >
                          <TableCell className="p-0">
                            <div className={`w-1 h-full min-h-[60px] ${statusColor} rounded-r`} />
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {request.requestNumber}
                          </TableCell>
                          <TableCell className="font-medium">{request.jobTitle}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {request.candidateName || <span className="text-muted-foreground/50 italic">Not specified</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{request.department}</TableCell>
                          <TableCell>
                            <span className="text-sm px-2 py-1 bg-muted rounded-md">
                              {request.employmentType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <HiringStatusBadge status={request.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/hiring/${request._id}`)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === 'Draft' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRequest(request._id)}
                                    title="Edit request"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteId(request._id)}
                                    title="Delete request"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Hiring Request Drawer */}
      <HiringRequestDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        onSuccess={handleDrawerSuccess}
        editId={editRequestId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hiring Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hiring request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
