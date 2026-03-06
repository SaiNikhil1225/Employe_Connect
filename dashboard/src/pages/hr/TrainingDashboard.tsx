import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetCloseButton } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  Award,
  TrendingUp,
  Users,
  Plus,
  Filter,
  Download,
  X,
  Calendar,
  Save,
  UserPlus,
  CheckCircle,
  Edit,
  Search,
  Columns3,
  ChevronDown,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Training {
  _id: string;
  trainingId: string;
  trainingName: string;
  trainingCategory: string;
  description: string;
  trainerName: string;
  trainingMode: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  maxParticipants: number;
  currentEnrollments: number;
  costPerEmployee: number;
  certificationAvailable: boolean;
  status: string;
  averageRating?: number;
  targetDepartments: string[];
  targetLocations: string[];
}

interface TrainingEnrollment {
  _id: string;
  enrollmentId: string;
  trainingId: string;
  trainingName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  location: string;
  grade: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  costPerEmployee: number;
  completionStatus: string;
  hoursCompleted: number;
  certificationStatus: string;
  trainingCategory: string;
}

interface TrainingMetrics {
  totalEmployees: number;
  totalEnrollments: number;
  avgHoursPerEmployee: number;
  avgCostPerEmployee: number;
  certificationCompletionRate: number;
  completionRate: number;
  totalInvestment: number;
}

interface SkillGap {
  skillName: string;
  employeesWithGap: number;
  avgGapScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  category: string;
}

export function TrainingDashboard() {
  const user = useAuthStore((state) => state.user);
  
  // State
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  
  // DataTable UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showAddTrainingSheet, setShowAddTrainingSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrainingForEdit, setSelectedTrainingForEdit] = useState<Training | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [selectedTrainingForAssign, setSelectedTrainingForAssign] = useState<Training | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [showProgressSheet, setShowProgressSheet] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<TrainingEnrollment | null>(null);
  const [progressUpdateData, setProgressUpdateData] = useState({
    completionStatus: '',
    hoursCompleted: 0,
    certificationStatus: 'Not Started'
  });
  
  // Training Form Data
  const [trainingFormData, setTrainingFormData] = useState({
    trainingName: '',
    trainingCategory: '',
    description: '',
    trainerName: '',
    trainerOrganization: '',
    trainingMode: '',
    startDate: '',
    endDate: '',
    durationHours: 0,
    maxParticipants: 0,
    certificationAvailable: false,
    certificationName: '',
    certificationValidityMonths: 0,
    prerequisites: [] as string[],
    status: 'Scheduled',
    skillsToBeAcquired: [] as string[],
    location: ''
  });
  
  // Role-based access
  const isHROrAdmin = user?.role === 'HR' || user?.role === 'SUPER_ADMIN' || user?.role === 'RMG';
  const isManager = user?.role === 'MANAGER' || user?.role === 'L2_APPROVER' || user?.role === 'L3_APPROVER';
  const isEmployee = !isHROrAdmin && !isManager;
  
  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [selectedDepartments, selectedLocations, selectedGrades, selectedEmploymentTypes, dateFrom, dateTo]);
  
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchTrainings(),
        fetchEnrollments(),
        fetchMetrics(),
        fetchSkillGaps()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load training data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  const fetchTrainings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/training');
      const result = await response.json();
      if (result.success) {
        setTrainings(result.data);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };
  
  const fetchEnrollments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartments.length) params.append('department', selectedDepartments[0]);
      if (selectedLocations.length) params.append('location', selectedLocations[0]);
      if (selectedGrades.length) params.append('grade', selectedGrades[0]);
      if (selectedEmploymentTypes.length) params.append('employmentType', selectedEmploymentTypes[0]);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      // Add role-based filtering
      if (user?.role) params.append('role', user.role);
      if (user?.employeeId) params.append('userId', user.employeeId);
      
      const response = await fetch(`http://localhost:5000/api/training/enrollments/all?${params}`);
      const result = await response.json();
      if (result.success) {
        setEnrollments(result.data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };
  
  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartments.length) params.append('department', selectedDepartments[0]);
      if (selectedLocations.length) params.append('location', selectedLocations[0]);
      if (selectedGrades.length) params.append('grade', selectedGrades[0]);
      if (selectedEmploymentTypes.length) params.append('employmentType', selectedEmploymentTypes[0]);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      // Add role-based filtering
      if (user?.role) params.append('role', user.role);
      if (user?.employeeId) params.append('userId', user.employeeId);
      
      const response = await fetch(`http://localhost:5000/api/training/analytics/metrics?${params}`);
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };
  
  const fetchSkillGaps = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartments.length) params.append('department', selectedDepartments[0]);
      if (selectedLocations.length) params.append('location', selectedLocations[0]);
      if (selectedGrades.length) params.append('grade', selectedGrades[0]);
      if (selectedEmploymentTypes.length) params.append('employmentType', selectedEmploymentTypes[0]);
      
      const response = await fetch(`http://localhost:5000/api/training/skill-gaps/analytics/summary?${params}`);
      const result = await response.json();
      if (result.success) {
        setSkillGaps(result.data.skillGaps || []);
      }
    } catch (error) {
      console.error('Error fetching skill gaps:', error);
    }
  };
  
  // Get unique filter values from actual employee data
  const departments = useMemo(() => 
    [...new Set(employees.map(e => e.department).filter(Boolean))].sort(),
    [employees]
  );
  
  const locations = useMemo(() => 
    [...new Set(employees.map(e => e.location).filter(Boolean))].sort(),
    [employees]
  );
  
  const grades = useMemo(() => 
    [...new Set(employees.map(e => e.grade).filter(Boolean))].sort(),
    [employees]
  );
  
  const employmentTypes = useMemo(() => 
    [...new Set(employees.map(e => e.employmentType).filter(Boolean))].sort(),
    [employees]
  );
  
  // Training Record Column Definitions
  const trainingRecordColumns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      sortable: true,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'trainingName',
      label: 'Training Name',
      sortable: true,
    },
    {
      key: 'trainingCategory',
      label: 'Category',
      sortable: true,
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'durationHours',
      label: 'Duration (hrs)',
      sortable: true,
    },
    {
      key: 'hoursCompleted',
      label: 'Hours Completed',
      sortable: true,
    },
    {
      key: 'completionStatus',
      label: 'Completion Status',
      sortable: true,
      render: (value: string) => (
        <Badge className={getCompletionStatusColor(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'certificationStatus',
      label: 'Certification',
      sortable: true,
      render: (value: string) => (
        <Badge className={getCertificationStatusColor(value)}>
          {value}
        </Badge>
      ),
    },
  ];
  
  // Filter enrollments for table
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments;
    
    if (selectedDepartments.length) {
      filtered = filtered.filter(e => selectedDepartments.includes(e.department));
    }
    
    if (selectedLocations.length) {
      filtered = filtered.filter(e => selectedLocations.includes(e.location));
    }
    
    if (selectedGrades.length) {
      filtered = filtered.filter(e => selectedGrades.includes(e.grade));
    }
    
    if (selectedEmploymentTypes.length) {
      filtered = filtered.filter(e => selectedEmploymentTypes.includes(e.employmentType));
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(e => e.completionStatus === selectedStatus);
    }
    
    return filtered;
  }, [enrollments, selectedDepartments, selectedLocations, selectedGrades, selectedEmploymentTypes, selectedStatus]);
  
  // Apply search filter on top of other filters
  const searchFilteredEnrollments = useMemo(() => {
    if (!searchQuery.trim()) return filteredEnrollments;
    
    const query = searchQuery.toLowerCase();
    return filteredEnrollments.filter((enrollment) =>
      enrollment.employeeId?.toLowerCase().includes(query) ||
      enrollment.employeeName?.toLowerCase().includes(query) ||
      enrollment.department?.toLowerCase().includes(query) ||
      enrollment.location?.toLowerCase().includes(query) ||
      enrollment.trainingName?.toLowerCase().includes(query) ||
      enrollment.trainingCategory?.toLowerCase().includes(query) ||
      enrollment.completionStatus?.toLowerCase().includes(query)
    );
  }, [filteredEnrollments, searchQuery]);
  
  // Filter employees for assignment
  const filteredEmployeesForAssignment = useMemo(() => {
    if (!employeeSearchQuery.trim()) return employees;
    
    const query = employeeSearchQuery.toLowerCase();
    return employees.filter((emp: any) => 
      emp.name?.toLowerCase().includes(query) ||
      emp.employeeId?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.location?.toLowerCase().includes(query)
    );
  }, [employees, employeeSearchQuery]);
  
  // Get trainings for current user (employee view)
  const myTrainings = useMemo(() => {
    if (!isEmployee) return [];
    
    // Get training IDs from enrollments (enrollment.trainingId is the MongoDB _id)
    const myTrainingIds = enrollments.map(e => e.trainingId);
    
    // Filter trainings based on enrollment and active status
    // Compare with training._id (MongoDB ID) since enrollment stores _id as trainingId
    return trainings.filter(t => 
      myTrainingIds.includes(t._id) && 
      (t.status === 'Scheduled' || t.status === 'Ongoing')
    );
  }, [isEmployee, enrollments, trainings]);
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Location',
      'Grade',
      'Employment Type',
      'Training Name',
      'Category',
      'Start Date',
      'End Date',
      'Duration (Hours)',
      'Completion Status',
      'Hours Completed',
      'Certification Status'
    ];
    
    const rows = filteredEnrollments.map(e => [
      e.employeeId,
      e.employeeName,
      e.department,
      e.location,
      e.grade,
      e.employmentType,
      e.trainingName,
      e.trainingCategory,
      format(new Date(e.startDate), 'yyyy-MM-dd'),
      format(new Date(e.endDate), 'yyyy-MM-dd'),
      e.durationHours,
      e.completionStatus,
      e.hoursCompleted || 0,
      e.certificationStatus
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Training report exported successfully');
  };
  
  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedGrades([]);
    setSelectedEmploymentTypes([]);
    setSelectedStatus('all');
    clearDateFilters();
  };
  
  const getCompletionStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'Not Started': 'bg-gray-500',
      'Cancelled': 'bg-red-500',
      'Failed': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  const getCertificationStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Certified': 'bg-green-500',
      'Pending': 'bg-yellow-500',
      'Failed': 'bg-red-500',
      'Expired': 'bg-orange-500',
      'Not Applicable': 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Training & Development data...</p>
        </div>
      </div>
    );
  }
  
  // Clear date filters
  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterApplied(false);
  };

  // Apply date filter
  const applyDateFilter = () => {
    if (!dateFrom && !dateTo) {
      toast.error('Please select at least one date');
      return;
    }
    setFilterApplied(true);
    setShowDateFilter(false);
    toast.success('Date range filter applied');
  };
  
  // Training Form Handlers
  const handleTrainingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setTrainingFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleTrainingSelectChange = (name: string, value: string) => {
    setTrainingFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addSkill = () => {
    if (currentSkill.trim() && !trainingFormData.skillsToBeAcquired.includes(currentSkill.trim())) {
      setTrainingFormData(prev => ({
        ...prev,
        skillsToBeAcquired: [...prev.skillsToBeAcquired, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };
  
  const removeSkill = (skill: string) => {
    setTrainingFormData(prev => ({
      ...prev,
      skillsToBeAcquired: prev.skillsToBeAcquired.filter(s => s !== skill)
    }));
  };
  
  const addPrerequisite = () => {
    if (currentPrerequisite.trim() && !trainingFormData.prerequisites.includes(currentPrerequisite.trim())) {
      setTrainingFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()]
      }));
      setCurrentPrerequisite('');
    }
  };
  
  const removePrerequisite = (prerequisite: string) => {
    setTrainingFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prerequisite)
    }));
  };
  
  const handleOpenAssignSheet = (training: Training) => {
    setSelectedTrainingForAssign(training);
    setSelectedEmployees([]);
    setEmployeeSearchQuery('');
    setShowAssignSheet(true);
  };

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAssignEmployees = async () => {
    if (!selectedTrainingForAssign || selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trainingId: selectedTrainingForAssign._id,
          employeeIds: selectedEmployees,
          startDate: selectedTrainingForAssign.startDate,
          endDate: selectedTrainingForAssign.endDate,
          durationHours: selectedTrainingForAssign.durationHours
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully assigned training to ${selectedEmployees.length} employee(s)`);
        setShowAssignSheet(false);
        setSelectedEmployees([]);
        fetchAllData();
      } else {
        toast.error(result.message || 'Failed to assign employees');
      }
    } catch (error) {
      console.error('Error assigning employees:', error);
      toast.error('Failed to assign employees to training');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenProgressSheet = (enrollment: TrainingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setProgressUpdateData({
      completionStatus: enrollment.completionStatus,
      hoursCompleted: enrollment.hoursCompleted,
      certificationStatus: enrollment.certificationStatus
    });
    setShowProgressSheet(true);
  };

  const handleUpdateProgress = async () => {
    if (!selectedEnrollment) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/training/enrollments/${selectedEnrollment.enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressUpdateData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Progress updated successfully');
        setShowProgressSheet(false);
        fetchAllData();
      } else {
        toast.error(result.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenEditSheet = (training: Training) => {
    setIsEditMode(true);
    setSelectedTrainingForEdit(training);
    const trainingAny = training as any;
    setTrainingFormData({
      trainingName: training.trainingName,
      trainingCategory: training.trainingCategory,
      description: training.description || '',
      trainerName: training.trainerName || '',
      trainerOrganization: trainingAny.trainerOrganization || '',
      trainingMode: training.trainingMode || '',
      startDate: training.startDate ? new Date(training.startDate).toISOString().split('T')[0] : '',
      endDate: training.endDate ? new Date(training.endDate).toISOString().split('T')[0] : '',
      durationHours: training.durationHours || 0,
      maxParticipants: training.maxParticipants || 0,
      certificationAvailable: training.certificationAvailable || false,
      certificationName: trainingAny.certificationName || '',
      certificationValidityMonths: trainingAny.certificationValidityMonths || 0,
      prerequisites: trainingAny.prerequisites || [],
      status: training.status,
      skillsToBeAcquired: trainingAny.skillsToBeAcquired || [],
      location: trainingAny.location || ''
    });
    setShowAddTrainingSheet(true);
  };
  
  const handleSubmitTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trainingFormData.trainingName.trim()) {
      toast.error('Training name is required');
      return;
    }
    
    if (!trainingFormData.trainingCategory) {
      toast.error('Training category is required');
      return;
    }
    
    if (!trainingFormData.startDate || !trainingFormData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = isEditMode && selectedTrainingForEdit 
        ? `http://localhost:5000/api/training/${selectedTrainingForEdit.trainingId}`
        : 'http://localhost:5000/api/training';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingFormData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditMode ? 'Training program updated successfully' : 'Training program created successfully');
        setShowAddTrainingSheet(false);
        setIsEditMode(false);
        setSelectedTrainingForEdit(null);
        // Reset form
        setTrainingFormData({
          trainingName: '',
          trainingCategory: '',
          description: '',
          trainerName: '',
          trainerOrganization: '',
          trainingMode: '',
          startDate: '',
          endDate: '',
          durationHours: 0,
          maxParticipants: 0,
          certificationAvailable: false,
          certificationName: '',
          certificationValidityMonths: 0,
          prerequisites: [],
          status: 'Scheduled',
          skillsToBeAcquired: [],
          location: ''
        });
        fetchAllData(); // Refresh data
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} training program`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} training:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} training program`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Column toggle helper
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: prev[columnKey] === false ? true : false
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Matching WorkforceSummary UI */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Training & Development</h2>
            <p className="text-sm text-muted-foreground">
              {isEmployee 
                ? 'View your training programs, track progress, and manage certifications'
                : isManager
                ? 'Manage team training programs and track team progress'
                : 'Manage employee training programs, track progress, and analyze skill gaps'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {filterApplied && (
                    <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Filter by Date Range</h4>
                    <p className="text-xs text-muted-foreground mb-4">Filter training data by date range</p>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">From Date</label>
                      <DatePicker
                        value={dateFrom}
                        onChange={setDateFrom}
                        placeholder="Select from date"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">To Date</label>
                      <DatePicker
                        value={dateTo}
                        onChange={setDateTo}
                        placeholder="Select to date"
                      />
                    </div>
                  </div>

                  {(dateFrom || dateTo) && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {dateFrom && dateTo
                          ? `${dateFrom} → ${dateTo}`
                          : dateFrom
                          ? `From ${dateFrom}`
                          : `Until ${dateTo}`}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={applyDateFilter}
                      className="flex-1"
                      size="sm"
                    >
                      <Filter className="h-3 w-3 mr-2" />
                      Apply Filter
                    </Button>
                    <Button
                      onClick={() => {
                        clearDateFilters();
                        setShowDateFilter(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
          </Popover>

          {isHROrAdmin && (
            <Button onClick={() => setShowAddTrainingSheet(true)} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add New Training
            </Button>
          )}
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEmployee ? 'My Training Hours' : isManager ? 'Team Avg Hours' : 'Training Hours / Employee'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics?.avgHoursPerEmployee.toFixed(1) || '0'} hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {metrics?.totalEnrollments || 0} enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEmployee ? 'My Certifications' : isManager ? 'Team Certification %' : 'Certification Completion'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics?.certificationCompletionRate.toFixed(1) || '0'}%</div>
            <Progress value={metrics?.certificationCompletionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEmployee ? 'My Completion Rate' : isManager ? 'Team Completion Rate' : 'Training Completion Rate'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{metrics?.completionRate.toFixed(1) || '0'}%</div>
            <Progress value={metrics?.completionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Training Records</TabsTrigger>
          <TabsTrigger value="skill-gaps">Skill Gap Analysis</TabsTrigger>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle>
                  {isEmployee ? 'My Training Programs' : 'Active Training Programs'}
                </CardTitle>
                <CardDescription>
                  {isEmployee 
                    ? 'Your current and upcoming training programs'
                    : 'Currently scheduled and ongoing trainings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isEmployee ? (
                    // Employee view - show only assigned trainings
                    myTrainings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>You are not enrolled in any active training programs</p>
                        <p className="text-xs mt-2">Contact HR for training opportunities</p>
                      </div>
                    ) : (
                      myTrainings.map(training => {
                        const myEnrollment = enrollments.find(e => e.trainingId === training._id);
                        return (
                          <div key={training._id} className="p-4 rounded-lg border hover:shadow-sm transition-all bg-gradient-to-r from-blue-50 to-transparent">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{training.trainingName}</p>
                                <Badge variant="outline" className="mt-1.5 text-xs">
                                  {training.trainingCategory}
                                </Badge>
                              </div>
                              <Badge variant={training.status === 'Ongoing' ? 'default' : 'secondary'}>
                                {training.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{format(new Date(training.startDate), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{training.durationHours} hours</span>
                              </div>
                            </div>
                            {myEnrollment && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">
                                    {myEnrollment.hoursCompleted}/{training.durationHours} hrs
                                  </span>
                                </div>
                                <Progress 
                                  value={(myEnrollment.hoursCompleted / training.durationHours) * 100} 
                                  className="h-2"
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <Badge className={getCompletionStatusColor(myEnrollment.completionStatus)} variant="outline">
                                    {myEnrollment.completionStatus}
                                  </Badge>
                                  {training.certificationAvailable && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Award className="h-3 w-3" />
                                      <span>{myEnrollment.certificationStatus}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )
                  ) : (
                    // HR/Admin/Manager view - show all active trainings
                    trainings.filter(t => t.status === 'Scheduled' || t.status === 'Ongoing').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No active training programs available</p>
                      </div>
                    ) : (
                      trainings.filter(t => t.status === 'Scheduled' || t.status === 'Ongoing').slice(0, 5).map(training => (
                        <div key={training._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{training.trainingName}</p>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(training.startDate), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {training.currentEnrollments}/{training.maxParticipants}
                              </span>
                            </div>
                          </div>
                          <Badge variant={training.status === 'Ongoing' ? 'default' : 'secondary'} className="ml-2">
                            {training.status}
                          </Badge>
                        </div>
                      ))
                    )
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle>
                  {isEmployee ? 'My Skill Development' : 'Top Skill Gaps'}
                </CardTitle>
                <CardDescription>
                  {isEmployee 
                    ? 'Skills you are currently developing'
                    : isManager
                    ? 'Most common skill gaps in your team'
                    : 'Most common skill gaps across organization'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillGaps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        {isEmployee 
                          ? 'No skill development plan available'
                          : 'No skill gap analysis available'
                        }
                      </p>
                      <p className="text-xs mt-2">
                        {isEmployee 
                          ? 'Complete a skills assessment to see your development plan'
                          : 'Skill gaps will appear here once assessments are conducted'
                        }
                      </p>
                    </div>
                  ) : (
                    skillGaps.slice(0, 5).map((gap, idx) => (
                      <div key={idx} className="p-3 rounded-lg hover:bg-muted/50 transition-colors space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{gap.skillName}</span>
                          {!isEmployee && (
                            <Badge variant="outline" className="text-xs">{gap.employeesWithGap} affected</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {gap.criticalCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-0">
                              {gap.criticalCount} Critical
                            </Badge>
                          )}
                          {gap.highCount > 0 && (
                            <Badge className="bg-orange-500 text-xs px-2 py-0">
                              {gap.highCount} High
                            </Badge>
                          )}
                        </div>
                        <Progress value={(gap.avgGapScore / 100) * 100} className="h-2" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Training Records Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Training Records</CardTitle>
                  <CardDescription className="mt-1">
                    {filteredEnrollments.length} {filteredEnrollments.length === 1 ? 'record' : 'records'}
                    {isEmployee 
                      ? '' 
                      : (selectedDepartments.length + selectedLocations.length + selectedGrades.length + selectedEmploymentTypes.length) > 0 
                      ? ' (filtered)' 
                      : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search training records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Column Visibility Toggle */}
                  <DropdownMenu open={showColumnToggle} onOpenChange={setShowColumnToggle}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 h-9">
                        <Columns3 className="h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Toggle Columns</div>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        {trainingRecordColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer py-1.5 px-2"
                          >
                            <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility(column.key)}>
                              <Checkbox
                                checked={columnVisibility[column.key] !== false}
                                onCheckedChange={() => toggleColumnVisibility(column.key)}
                                className="h-3.5 w-3.5"
                              />
                              <span className="flex-1 text-xs">{column.label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export Dropdown */}
                  {isHROrAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-9">
                          <Download className="h-4 w-4" />
                          Export
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={exportToCSV}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export to CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportToCSV}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export to Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Advanced Filters Toggle */}
                  {!isEmployee && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowFilters(!showFilters)} 
                      className="gap-2 h-9"
                    >
                      <Filter className="h-4 w-4" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                      {(selectedDepartments.length + selectedLocations.length + selectedGrades.length + selectedEmploymentTypes.length) > 0 && (
                        <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Active Filter Badges */}
              {(selectedDepartments.length + selectedLocations.length + selectedGrades.length + selectedEmploymentTypes.length) > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {selectedDepartments.map(dept => (
                    <Badge key={dept} variant="secondary" className="gap-1">
                      {dept}
                      <button onClick={() => setSelectedDepartments(selectedDepartments.filter(d => d !== dept))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedLocations.map(loc => (
                    <Badge key={loc} variant="secondary" className="gap-1">
                      {loc}
                      <button onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== loc))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedGrades.map(grade => (
                    <Badge key={grade} variant="secondary" className="gap-1">
                      {grade}
                      <button onClick={() => setSelectedGrades(selectedGrades.filter(g => g !== grade))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedEmploymentTypes.map(type => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <button onClick={() => setSelectedEmploymentTypes(selectedEmploymentTypes.filter(t => t !== type))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            
            {/* Expandable Filter Section */}
            {showFilters && !isEmployee && (
              <Card className="mx-4 mb-4 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Advanced Filters</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Department Filter - Only for HR/Admin */}
                    {isHROrAdmin && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span className="text-sm">
                                {selectedDepartments.length === 0
                                  ? 'All Departments'
                                  : `${selectedDepartments.length} selected`}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-3">
                            <div className="space-y-2">
                              {departments.map(dept => (
                                <label key={dept} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={selectedDepartments.includes(dept)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedDepartments([...selectedDepartments, dept]);
                                      } else {
                                        setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                                      }
                                    }}
                                  />
                                  <span className="text-sm">{dept}</span>
                                </label>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    
                    {/* Location Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-sm">
                              {selectedLocations.length === 0
                                ? 'All Locations'
                                : `${selectedLocations.length} selected`}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3">
                          <div className="space-y-2">
                            {locations.map(loc => (
                              <label key={loc} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedLocations.includes(loc)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedLocations([...selectedLocations, loc]);
                                    } else {
                                      setSelectedLocations(selectedLocations.filter(l => l !== loc));
                                    }
                                  }}
                                />
                                <span className="text-sm">{loc}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Grade Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grade/Band</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-sm">
                              {selectedGrades.length === 0
                                ? 'All Grades'
                                : `${selectedGrades.length} selected`}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3">
                          <div className="space-y-2">
                            {grades.map(grade => (
                              <label key={grade} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedGrades.includes(grade)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedGrades([...selectedGrades, grade]);
                                    } else {
                                      setSelectedGrades(selectedGrades.filter(g => g !== grade));
                                    }
                                  }}
                                />
                                <span className="text-sm">{grade}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Employment Type Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employment Type</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-sm">
                              {selectedEmploymentTypes.length === 0
                                ? 'All Types'
                                : `${selectedEmploymentTypes.length} selected`}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3">
                          <div className="space-y-2">
                            {employmentTypes.map(type => (
                              <label key={type} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedEmploymentTypes.includes(type)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedEmploymentTypes([...selectedEmploymentTypes, type]);
                                    } else {
                                      setSelectedEmploymentTypes(selectedEmploymentTypes.filter(t => t !== type));
                                    }
                                  }}
                                />
                                <span className="text-sm">{type}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            <CardContent className="p-0">
              {/* DataTable */}
              <DataTable
                data={searchFilteredEnrollments}
                columns={trainingRecordColumns.map(col => ({ 
                  ...col, 
                  hidden: columnVisibility[col.key] === false 
                }))}
                actions={[
                  {
                    label: 'View Details',
                    onClick: (row: TrainingEnrollment) => {
                      toast.info(`Viewing details for ${row.employeeName}`);
                    },
                  },
                  ...(isHROrAdmin ? [{
                    label: 'Update Progress',
                    onClick: (row: TrainingEnrollment) => {
                      handleOpenProgressSheet(row);
                    },
                  }] : []),
                ]}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
                emptyMessage={
                  searchQuery 
                    ? 'No training records found. Try adjusting your search query.'
                    : enrollments.length === 0
                    ? 'Start by creating training programs and enrolling employees'
                    : 'No training records found. Try adjusting your filters.'
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skill Gaps Tab */}
        <TabsContent value="skill-gaps" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl">Skill Gap Analysis</CardTitle>
              <CardDescription className="mt-1">
                Identify skill gaps across the organization and prioritize training needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillGaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Award className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No skill gaps found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Skill gap data will appear here once assessments are conducted.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b-2">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Skill Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Employees Affected
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Critical
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          High
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Medium
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Low
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Avg Gap Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {skillGaps.map((gap, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">
                            {gap.skillName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {gap.category ? (
                              <Badge variant="outline" className="text-xs">{gap.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <Badge variant="secondary" className="font-medium">
                              {gap.employeesWithGap}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {gap.criticalCount > 0 ? (
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold text-sm">
                                {gap.criticalCount}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {gap.highCount > 0 ? (
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-bold text-sm">
                                {gap.highCount}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {gap.mediumCount > 0 ? (
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 font-bold text-sm">
                                {gap.mediumCount}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {gap.lowCount > 0 ? (
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-sm">
                                {gap.lowCount}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Progress value={gap.avgGapScore} className="h-2 flex-1" />
                              <span className="font-medium text-xs whitespace-nowrap">
                                {gap.avgGapScore.toFixed(1)}/100
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Training Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl">{isEmployee ? 'My Training Programs' : 'Training Programs'}</CardTitle>
              <CardDescription className="mt-1">
                {isEmployee ? 'All your assigned training programs with progress tracking' : 'All available training programs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEmployee ? (
                // Employee View - Show only assigned trainings with detailed progress
                <div className="space-y-4">
                  {myTrainings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No Training Programs Assigned</p>
                      <p className="text-sm mt-2">You don't have any active training assignments yet.</p>
                      <p className="text-xs mt-1">Contact HR for training opportunities</p>
                    </div>
                  ) : (
                    myTrainings.map((training) => {
                      const myEnrollment = enrollments.find(e => e.trainingId === training._id);
                      const trainingEnrollments = enrollments.filter(e => e.trainingId === training._id);
                      
                      return (
                        <Card key={training._id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                          <CardHeader className="bg-blue-50/30 dark:bg-blue-950/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg">{training.trainingName}</CardTitle>
                                  <Badge variant={training.status === 'Ongoing' ? 'default' : 'secondary'}>
                                    {training.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline">{training.trainingCategory}</Badge>
                                  {training.certificationAvailable && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      <Award className="h-3 w-3 mr-1" />
                                      Certification Available
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {training.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {training.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Training Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">Start Date</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(training.startDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">End Date</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(training.endDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">Duration</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {training.durationHours} hours
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs">Participants</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {training.currentEnrollments} enrolled
                                </p>
                              </div>
                            </div>

                            {/* My Progress */}
                            {myEnrollment && (
                              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <h4 className="font-medium text-sm">My Progress</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-medium">
                                      {myEnrollment.hoursCompleted} / {training.durationHours} hrs ({((myEnrollment.hoursCompleted / training.durationHours) * 100).toFixed(0)}%)
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(myEnrollment.hoursCompleted / training.durationHours) * 100} 
                                    className="h-2"
                                  />
                                  <div className="flex items-center justify-between pt-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                                      <Badge className={getCompletionStatusColor(myEnrollment.completionStatus)}>
                                        {myEnrollment.completionStatus}
                                      </Badge>
                                    </div>
                                    {training.certificationAvailable && (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Certification</p>
                                        <Badge variant="outline" className="text-xs">
                                          {myEnrollment.certificationStatus}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Other Participants */}
                            {trainingEnrollments.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Other Participants ({trainingEnrollments.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                  {trainingEnrollments.slice(0, 10).map((enrollment) => (
                                    <div 
                                      key={enrollment._id} 
                                      className="flex items-center gap-2 p-2 rounded border bg-background text-sm"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{enrollment.employeeName}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {enrollment.department}
                                        </p>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          enrollment.completionStatus === 'Completed' ? 'text-green-600 border-green-600' :
                                          enrollment.completionStatus === 'In Progress' ? 'text-blue-600 border-blue-600' :
                                          'text-gray-600 border-gray-600'
                                        }`}
                                      >
                                        {enrollment.completionStatus}
                                      </Badge>
                                    </div>
                                  ))}
                                  {trainingEnrollments.length > 10 && (
                                    <div className="col-span-2 text-center text-xs text-muted-foreground py-1">
                                      +{trainingEnrollments.length - 10} more participants
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              ) : (
                // HR/Admin View - Original grid view
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{trainings.map((training) => (
                  <Card key={training._id} className="hover:shadow-lg transition-all duration-300 border-2">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{training.trainingName}</CardTitle>
                          <Badge variant="outline" className="mt-2">{training.trainingCategory}</Badge>
                        </div>
                        <Badge variant={training.status === 'Ongoing' ? 'default' : 'secondary'}>
                          {training.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {training.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(training.startDate), 'MMM dd')} - {format(new Date(training.endDate), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{training.durationHours} hours</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{training.currentEnrollments}/{training.maxParticipants} enrolled</span>
                        </div>
                        
                        {training.certificationAvailable && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Award className="h-4 w-4" />
                            <span>Certification Available</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {isHROrAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              className="flex-1 gap-2" 
                              size="sm"
                              onClick={() => handleOpenEditSheet(training)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="default" 
                              className="flex-1 gap-2" 
                              size="sm"
                              onClick={() => handleOpenAssignSheet(training)}
                            >
                              <UserPlus className="h-4 w-4" />
                              Assign
                            </Button>
                          </>
                        )}
                        {!isHROrAdmin && (
                          <Button variant="outline" className="w-full" size="sm">
                            View Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Training Sheet */}
      <Sheet 
        open={showAddTrainingSheet} 
        onOpenChange={(open) => {
          setShowAddTrainingSheet(open);
          if (!open) {
            setIsEditMode(false);
            setSelectedTrainingForEdit(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle>{isEditMode ? 'Edit Training Program' : 'Add New Training Program'}</SheetTitle>
              <SheetDescription>
                {isEditMode ? 'Update training program details' : 'Create a new training program for employees'}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
          
          <form onSubmit={handleSubmitTraining} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainingName">Training Name *</Label>
                  <Input
                    id="trainingName"
                    name="trainingName"
                    value={trainingFormData.trainingName}
                    onChange={handleTrainingFormChange}
                    placeholder="e.g., React Advanced Development"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainingCategory">Category *</Label>
                  <Select
                    value={trainingFormData.trainingCategory}
                    onValueChange={(value) => handleTrainingSelectChange('trainingCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Safety', 'Product Knowledge', 'Sales & Marketing', 'Finance & Accounting', 'HR & Administration', 'Customer Service', 'Project Management', 'Quality Management', 'Other'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={trainingFormData.description}
                    onChange={handleTrainingFormChange}
                    placeholder="Describe the training program..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            {/* Trainer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Trainer Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trainerName">Trainer Name *</Label>
                  <Input
                    id="trainerName"
                    name="trainerName"
                    value={trainingFormData.trainerName}
                    onChange={handleTrainingFormChange}
                    placeholder="Trainer name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainerOrganization">Organization</Label>
                  <Input
                    id="trainerOrganization"
                    name="trainerOrganization"
                    value={trainingFormData.trainerOrganization}
                    onChange={handleTrainingFormChange}
                    placeholder="Training organization"
                  />
                </div>
              </div>
            </div>
            
            {/* Schedule & Logistics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Schedule & Logistics</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trainingMode">Training Mode *</Label>
                  <Select
                    value={trainingFormData.trainingMode}
                    onValueChange={(value) => handleTrainingSelectChange('trainingMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={trainingFormData.location}
                    onChange={handleTrainingFormChange}
                    placeholder="Training venue or online platform"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={trainingFormData.startDate}
                    onChange={handleTrainingFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={trainingFormData.endDate}
                    onChange={handleTrainingFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (Hours) *</Label>
                  <Input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    min="1"
                    value={trainingFormData.durationHours || ''}
                    onChange={handleTrainingFormChange}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={trainingFormData.maxParticipants || ''}
                    onChange={handleTrainingFormChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Certification */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certificationAvailable"
                  checked={trainingFormData.certificationAvailable}
                  onCheckedChange={(checked) => 
                    setTrainingFormData(prev => ({ ...prev, certificationAvailable: checked as boolean }))
                  }
                />
                <Label htmlFor="certificationAvailable" className="cursor-pointer">
                  Certification Available
                </Label>
              </div>
              
              {trainingFormData.certificationAvailable && (
                <div className="grid gap-4 md:grid-cols-2 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="certificationName">Certification Name</Label>
                    <Input
                      id="certificationName"
                      name="certificationName"
                      value={trainingFormData.certificationName}
                      onChange={handleTrainingFormChange}
                      placeholder="Certificate name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certificationValidityMonths">Validity (Months)</Label>
                    <Input
                      id="certificationValidityMonths"
                      name="certificationValidityMonths"
                      type="number"
                      min="0"
                      value={trainingFormData.certificationValidityMonths || ''}
                      onChange={handleTrainingFormChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Skills & Prerequisites */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Skills & Prerequisites</h3>
              
              <div className="space-y-3">
                <Label>Skills to be Acquired</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Enter skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainingFormData.skillsToBeAcquired.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Prerequisites</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentPrerequisite}
                    onChange={(e) => setCurrentPrerequisite(e.target.value)}
                    placeholder="Enter prerequisite"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                  />
                  <Button type="button" variant="outline" onClick={addPrerequisite}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainingFormData.prerequisites.map((prereq, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {prereq}
                      <button type="button" onClick={() => removePrerequisite(prereq)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddTrainingSheet(false);
                  setIsEditMode(false);
                  setSelectedTrainingForEdit(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update Training' : 'Create Training'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Assign Employees Sheet */}
      <Sheet open={showAssignSheet} onOpenChange={setShowAssignSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle>Assign Employees to Training</SheetTitle>
              <SheetDescription>
                Select employees to enroll in "{selectedTrainingForAssign?.trainingName}"
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Training Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training:</span>
                    <span className="font-medium">{selectedTrainingForAssign?.trainingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{selectedTrainingForAssign?.trainingCategory}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{selectedTrainingForAssign?.durationHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>
                      {selectedTrainingForAssign && format(new Date(selectedTrainingForAssign.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Slots:</span>
                    <span className={
                      (selectedTrainingForAssign?.maxParticipants || 0) - (selectedTrainingForAssign?.currentEnrollments || 0) <= 5 
                        ? 'text-red-600 font-medium' 
                        : ''
                    }>
                      {(selectedTrainingForAssign?.maxParticipants || 0) - (selectedTrainingForAssign?.currentEnrollments || 0)} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Count */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selected Employees:</span>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3">
                  {selectedEmployees.length}
                </Badge>
                {selectedEmployees.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployees([])}
                    className="h-7 text-xs"
                  >
                    Clear All
                  </Button>
                )}
                {filteredEmployeesForAssignment.length > 0 && selectedEmployees.length < filteredEmployeesForAssignment.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployees(filteredEmployeesForAssignment.map(e => e._id))}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                )}
              </div>
            </div>

            {/* Employee List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-3">
              <div className="sticky top-0 bg-background pb-2 mb-2 border-b z-10">
                <Input
                  placeholder="Search employees by name, ID, or department..."
                  className="w-full"
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                />
              </div>
              
              {filteredEmployeesForAssignment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No employees found</p>
                  {employeeSearchQuery && (
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  )}
                </div>
              ) : (
                filteredEmployeesForAssignment.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border"
                    onClick={() => handleToggleEmployee(employee._id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedEmployees.includes(employee._id)}
                        onCheckedChange={() => handleToggleEmployee(employee._id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{employee.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{employee.employeeId}</span>
                          <span>•</span>
                          <span>{employee.department}</span>
                          <span>•</span>
                          <span>{employee.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {employee.grade}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignSheet(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignEmployees}
                disabled={isSubmitting || selectedEmployees.length === 0}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Assign {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Progress Tracking Sheet */}
      <Sheet open={showProgressSheet} onOpenChange={setShowProgressSheet}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle>Update Training Progress</SheetTitle>
              <SheetDescription>
                Track completion and certification status
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Employee & Training Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-medium">{selectedEnrollment?.employeeName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedEnrollment?.employeeId} • {selectedEnrollment?.department}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Training Program</p>
                    <p className="font-medium">{selectedEnrollment?.trainingName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {selectedEnrollment?.trainingCategory}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedEnrollment?.durationHours} hours
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Form */}
            <div className="space-y-4">
              {/* Completion Status */}
              <div className="space-y-2">
                <Label htmlFor="completionStatus">Completion Status *</Label>
                <Select
                  value={progressUpdateData.completionStatus}
                  onValueChange={(value) => 
                    setProgressUpdateData(prev => ({ ...prev, completionStatus: value }))
                  }
                >
                  <SelectTrigger id="completionStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hours Completed */}
              <div className="space-y-2">
                <Label htmlFor="hoursCompleted">Hours Completed *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="hoursCompleted"
                    type="number"
                    min="0"
                    max={selectedEnrollment?.durationHours || 0}
                    value={progressUpdateData.hoursCompleted}
                    onChange={(e) => 
                      setProgressUpdateData(prev => ({ 
                        ...prev, 
                        hoursCompleted: Number(e.target.value) 
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    / {selectedEnrollment?.durationHours} hrs
                  </span>
                </div>
                <Progress 
                  value={(progressUpdateData.hoursCompleted / (selectedEnrollment?.durationHours || 1)) * 100} 
                  className="mt-2" 
                />
              </div>

              {/* Certification Status */}
              <div className="space-y-2">
                <Label htmlFor="certificationStatus">Certification Status</Label>
                <Select
                  value={progressUpdateData.certificationStatus}
                  onValueChange={(value) => 
                    setProgressUpdateData(prev => ({ ...prev, certificationStatus: value }))
                  }
                >
                  <SelectTrigger id="certificationStatus">
                    <SelectValue placeholder="Select certification status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Progress Summary</span>
                    <Badge variant={progressUpdateData.completionStatus === 'Completed' ? 'default' : 'secondary'}>
                      {progressUpdateData.completionStatus}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion:</span>
                      <span className="font-medium">
                        {((progressUpdateData.hoursCompleted / (selectedEnrollment?.durationHours || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certification:</span>
                      <Badge variant="outline" className="text-xs">
                        {progressUpdateData.certificationStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProgressSheet(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProgress}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Update Progress
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default TrainingDashboard;
