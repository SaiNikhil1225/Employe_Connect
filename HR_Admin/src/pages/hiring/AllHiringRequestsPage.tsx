import { useState, useEffect } from 'react';
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
import { HiringStatusBadge } from '@/components/hiring/HiringStatusBadge';
import { Search, Eye, Filter, Users, Briefcase, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function AllHiringRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, fetchRequests, setFilters, statistics, fetchStatistics } = useHiringStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRequests(true); // true = all requests (HR view)
    fetchStatistics();
  }, [fetchRequests, fetchStatistics]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ searchQuery: value });
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    if (value === 'all') {
      setFilters({ status: [] });
    } else {
      setFilters({ status: [value] });
    }
  };

  const handleDepartmentFilter = (value: string) => {
    setSelectedDepartment(value);
  };

  // Get unique departments from requests
  const uniqueDepartments = Array.from(new Set(requests.map(req => req.department)));

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.hiringManagerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'all' || req.department === selectedDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hiring Requests Management
            </h1>
            <p className="text-slate-600 mt-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              View and manage all hiring requests across your organization
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-slate-500 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
                  <Users className="h-5 w-5 text-slate-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-700">{statistics.total}</div>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Submitted</CardTitle>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statistics.byStatus.submitted}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Open</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{statistics.byStatus.open}</div>
                <p className="text-xs text-slate-500 mt-1">Active recruiting</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                  <Briefcase className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{statistics.byStatus.inProgress}</div>
                <p className="text-xs text-slate-500 mt-1">Interviews ongoing</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Closed</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{statistics.byStatus.closed}</div>
                <p className="text-xs text-slate-500 mt-1">Completed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="shadow-md bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by job title, request number, or hiring manager..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-300 whitespace-nowrap"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFilters && (
              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Filter by Status</Label>
                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Filter by Department</Label>
                    <Select value={selectedDepartment} onValueChange={handleDepartmentFilter}>
                      <SelectTrigger className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {uniqueDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="shadow-md bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              All Requests ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">Request #</TableHead>
                    <TableHead className="font-semibold text-slate-700">Job Title</TableHead>
                    <TableHead className="font-semibold text-slate-700">Employee Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Hiring Manager</TableHead>
                    <TableHead className="font-semibold text-slate-700">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700">Employment Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Created Date</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-slate-500">Loading hiring requests...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <XCircle className="h-12 w-12 text-slate-300" />
                          <p className="text-slate-500 font-medium">No hiring requests found</p>
                          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow 
                        key={request._id} 
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/hiring/${request._id}`)}
                      >
                        <TableCell className="font-semibold text-blue-600">{request.requestNumber}</TableCell>
                        <TableCell className="font-medium text-slate-700">{request.jobTitle}</TableCell>
                        <TableCell className="text-slate-600">
                          {request.candidateName || <span className="text-slate-400 italic">Not specified</span>}
                        </TableCell>
                        <TableCell className="text-slate-600">{request.hiringManagerName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {request.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {request.employmentType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <HiringStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hiring/${request._id}`);
                            }}
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

