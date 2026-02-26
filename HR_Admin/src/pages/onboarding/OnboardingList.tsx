import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import type { OnboardingStatus } from '@/types/onboarding';
import { onboardingServiceAPI } from '@/services/onboardingServiceAPI';
import { toast } from 'sonner';
import { getInitials } from '@/constants/design-system';

const OnboardingList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<OnboardingStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  useEffect(() => {
    loadOnboardingEmployees();
  }, []);

  // Reload data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOnboardingEmployees();
      }
    };

    const handleFocus = () => {
      loadOnboardingEmployees();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadOnboardingEmployees = async () => {
    setLoading(true);
    const response = await onboardingServiceAPI.getAllOnboardingEmployees();
    
    if (response.success && response.data) {
      // Calculate progress for each employee
      const employeesWithProgress = response.data.map(emp => {
        const { progress } = onboardingServiceAPI.calculateProgress(emp);
        return {
          ...emp,
          progressPercentage: progress
        };
      });
      setEmployees(employeesWithProgress);
    } else {
      toast.error(response.message || 'Failed to load onboarding employees');
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || emp.currentPhase === phaseFilter;
    
    return matchesSearch && matchesStatus && matchesPhase;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'on-hold':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'probation':
        return 'bg-purple-100 text-purple-800';
      case 'month-1':
        return 'bg-blue-100 text-blue-800';
      case 'week-1':
        return 'bg-cyan-100 text-cyan-800';
      case 'day-1':
        return 'bg-indigo-100 text-indigo-800';
      case 'pre-joining':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: employees.length,
    inProgress: employees.filter(e => e.status === 'in-progress').length,
    completed: employees.filter(e => e.status === 'completed').length,
    onHold: employees.filter(e => e.status === 'on-hold').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Management</h1>
          <p className="text-gray-500">Monitor and manage employee onboarding processes</p>
        </div>
        <Button onClick={() => navigate('/employees')}>
          <Plus className="h-4 w-4 mr-2" />
          New Onboarding
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">{stats.inProgress}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold">{stats.onHold}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, department, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="pre-joining">Pre-Joining</SelectItem>
                <SelectItem value="day-1">Day 1</SelectItem>
                <SelectItem value="week-1">Week 1</SelectItem>
                <SelectItem value="month-1">Month 1</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Employees ({filteredEmployees.length})</CardTitle>
          <CardDescription>Click on any employee to view detailed onboarding progress</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.employeeId}
                  onClick={() => navigate(`/onboarding/${employee.employeeId}`)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {getInitials(employee.employeeName)}
                    </div>
                    <div>
                      <p className="font-semibold">{employee.employeeName}</p>
                      <p className="text-sm text-gray-500">
                        {employee.designation} • {employee.department}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Progress</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${employee.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{employee.progressPercentage}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Badge className={getPhaseColor(employee.currentPhase)}>
                        {employee.currentPhase.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusIcon(employee.status)}
                        <span className="ml-1">{employee.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingList;
