import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api';
import { useRecognitionPostStore } from '@/store/recognitionPostStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetBody, SheetCloseButton } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { DataTable } from '@/components/ui/data-table';
import {
  Cake,
  Award,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Download,
  Mail,
  Trash2,
  Check,
  Gift,
  ChevronDown,
  Search,
  X,
  Loader2,
  PartyPopper,
  Columns3,
  FileText,
  Clock,
  Pin,
  Users,
  User,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { RecognitionAnalyticsDialog } from '@/components/analytics/RecognitionAnalyticsDialog';
import { toast } from 'sonner';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface Birthday {
  employeeId: string;
  name: string;
  department: string;
  location: string;
  birthdayDate: Date;
  daysUntil: number;
  email: string;
  phone: string;
  profilePhoto?: string;
}

interface Anniversary {
  employeeId: string;
  name: string;
  department: string;
  location: string;
  anniversaryDate: Date;
  yearsOfService: number;
  milestoneType: string;
  daysUntil: number;
  email: string;
  phone: string;
  profilePhoto?: string;
}

interface Celebration {
  _id: string;
  celebrationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  location: string;
  eventType: string;
  eventTitle: string;
  eventDate: Date;
  description: string;
  status: string;
  milestoneYears?: number;
  budgetAllocated?: number;
  budgetUsed?: number;
  celebratedBy?: string;
  celebratedDate?: Date;
  publishedBy?: string;
  publishedAt?: string;
}

interface NewEventFormData {
  title: string;
  description: string;
  eventType: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  mode: 'in-person' | 'virtual' | 'hybrid';
  venue: string;
  address: string;
  virtualLink: string;
  enableRSVP: boolean;
  maxAttendees: string;
  organizer: string;
  contactEmail: string;
  targetAudience: 'all' | 'departments' | 'custom';
  selectedDepartments: string[];
}

export function RecognitionCelebrations() {
  const navigate = useNavigate();
  const recognitionPosts = useRecognitionPostStore(s => s.posts);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [monthBirthdays, setMonthBirthdays] = useState<any>(null);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<Anniversary[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date range filter for stat cards
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Table filters
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // DataTable UI State
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Analytics dialog state
  const [analyticsPostId, setAnalyticsPostId] = useState<string | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCelebration, setSelectedCelebration] = useState<Celebration | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);

  // New Event form state
  const [newEventData, setNewEventData] = useState<NewEventFormData>({
    title: '',
    description: '',
    eventType: 'celebration',
    category: 'company-wide',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    mode: 'in-person',
    venue: '',
    address: '',
    virtualLink: '',
    enableRSVP: false,
    maxAttendees: '',
    organizer: '',
    contactEmail: '',
    targetAudience: 'all',
    selectedDepartments: [],
  });

  const resetNewEventForm = () => {
    setNewEventData({
      title: '',
      description: '',
      eventType: 'celebration',
      category: 'company-wide',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      mode: 'in-person',
      venue: '',
      address: '',
      virtualLink: '',
      enableRSVP: false,
      maxAttendees: '',
      organizer: '',
      contactEmail: '',
      targetAudience: 'all',
      selectedDepartments: [],
    });
  };

  const handleCreateNewEvent = () => {
    if (!newEventData.title.trim()) {
      toast.error('Please enter Event Title');
      return;
    }
    if (!newEventData.description.trim()) {
      toast.error('Please enter Event Description');
      return;
    }
    if (!newEventData.startDate) {
      toast.error('Please select Start Date');
      return;
    }
    if (!newEventData.startTime) {
      toast.error('Please select Start Time');
      return;
    }
    if ((newEventData.mode === 'in-person' || newEventData.mode === 'hybrid') && !newEventData.venue.trim()) {
      toast.error('Please enter Venue Name');
      return;
    }
    if ((newEventData.mode === 'virtual' || newEventData.mode === 'hybrid') && !newEventData.virtualLink.trim()) {
      toast.error('Please enter Virtual Meeting Link');
      return;
    }
    toast.success('Event created successfully!');
    setShowAddEventDialog(false);
    resetNewEventForm();
  };

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    location: '',
    eventType: 'birthday',
    eventTitle: '',
    eventDate: new Date(),
    description: '',
    recognitionCategory: '',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: false,
    sendEmail: true,
    awardDetails: '',
    budgetAllocated: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch celebrations when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchCelebrations();
    }
  }, [eventTypeFilter, statusFilter]);

  // Auto-fill employee details when Employee ID changes
  const handleEmployeeIdChange = async (employeeId: string) => {
    setFormData({ ...formData, employeeId });

    // Only fetch if we have a valid employee ID (at least 4 characters)
    if (employeeId.trim().length >= 4) {
      setIsLoadingEmployee(true);
      try {
        const response = await apiClient.get(`/employees/${employeeId.trim()}`);
        
        if (response.data.success && response.data.data) {
          const employee = response.data.data;
          setFormData(prev => ({
            ...prev,
            employeeId: employee.employeeId,
            employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
            department: employee.department || '',
            location: employee.location || '',
          }));
          toast.success(`Employee found: ${employee.name || `${employee.firstName} ${employee.lastName}`}`);
        } else if (employeeId.trim().length >= 5) {
          // Only show error if they've typed a full ID
          toast.error('Employee not found');
          // Clear the auto-filled fields
          setFormData(prev => ({
            ...prev,
            employeeName: '',
            department: '',
            location: '',
          }));
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        // Only show error for complete IDs
        if (employeeId.trim().length >= 5) {
          toast.error('Failed to fetch employee details');
        }
      } finally {
        setIsLoadingEmployee(false);
      }
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUpcomingBirthdays(),
        fetchMonthBirthdays(),
        fetchUpcomingAnniversaries(),
        fetchCelebrations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load celebration data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingBirthdays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/celebrations/birthdays/upcoming?days=7');
      const result = await response.json();
      if (result.success) {
        console.log('Upcoming Birthdays:', result.data.length, 'employees');
        setUpcomingBirthdays(result.data);
      } else {
        console.error('Failed to fetch birthdays:', result.message);
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const fetchMonthBirthdays = async () => {
    try {
      const now = new Date();
      const response = await fetch(`http://localhost:5000/api/celebrations/birthdays/month?month=${now.getMonth()}&year=${now.getFullYear()}`);
      const result = await response.json();
      if (result.success) {
        console.log('Month Birthdays:', result.data.total, 'total');
        setMonthBirthdays(result.data);
      } else {
        console.error('Failed to fetch month birthdays:', result.message);
      }
    } catch (error) {
      console.error('Error fetching month birthdays:', error);
    }
  };

  const fetchUpcomingAnniversaries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/celebrations/anniversaries/upcoming?days=30');
      const result = await response.json();
      if (result.success) {
        console.log('Upcoming Anniversaries:', result.data.length, 'employees');
        setUpcomingAnniversaries(result.data);
      } else {
        console.error('Failed to fetch anniversaries:', result.message);
      }
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
    }
  };

  const fetchCelebrations = async () => {
    try {
      const params = new URLSearchParams();
      if (eventTypeFilter !== 'all') params.append('eventType', eventTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://localhost:5000/api/celebrations?${params}`);
      const result = await response.json();
      if (result.success) {
        console.log('Celebrations loaded:', result.data.length, 'events');
        setCelebrations(result.data);
      } else {
        console.error('Failed to fetch celebrations:', result.message);
      }
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    }
  };

  // Apply date filter to stats
  const getFilteredStats = () => {
    // Apply event type and status filters to celebrations
    let filtered = celebrations;
    
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.eventType === eventTypeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Apply date range filter if set
    if (dateFrom || dateTo) {
      const from = dateFrom ? startOfDay(dateFrom) : new Date(0);
      const to = dateTo ? endOfDay(dateTo) : new Date(8640000000000000);
      
      filtered = filtered.filter(c => {
        const date = new Date(c.eventDate);
        return isWithinInterval(date, { start: from, end: to });
      });
    }
    
    // Calculate stats from filtered celebrations
    const birthdayEvents = filtered.filter(c => c.eventType === 'birthday');
    const anniversaryEvents = filtered.filter(c => c.eventType === 'anniversary');
    
    return {
      birthdays: birthdayEvents.length,
      monthBirthdays: birthdayEvents.length,
      anniversaries: anniversaryEvents.length,
      totalEvents: filtered.length
    };
  };

  const stats = getFilteredStats();

  const handleCreateCelebration = async () => {
    // Validation
    if (!formData.employeeId.trim()) {
      toast.error('Please enter Employee ID');
      return;
    }
    if (!formData.employeeName.trim()) {
      toast.error('Please enter Employee Name');
      return;
    }
    if (!formData.eventTitle.trim()) {
      toast.error('Please enter Event Title');
      return;
    }
    if (!formData.department.trim()) {
      toast.error('Please enter Department');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter Location');
      return;
    }

    try {
      const payload = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        department: formData.department,
        location: formData.location,
        eventType: formData.eventType,
        eventTitle: formData.eventTitle,
        eventDate: formData.eventDate.toISOString(),
        description: formData.description,
        recognitionCategory: formData.recognitionCategory || undefined,
        visibility: formData.visibility,
        notifyEmployee: formData.notifyEmployee,
        notifyTeam: formData.notifyTeam,
        sendEmail: formData.sendEmail,
        awardDetails: formData.awardDetails || undefined,
        budgetAllocated: formData.budgetAllocated,
        status: 'upcoming',
        createdBy: 'HR Admin' // TODO: Get from auth context
      };

      const response = await fetch('http://localhost:5000/api/celebrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Celebration event created successfully');
        setShowAddDialog(false);
        fetchCelebrations();
        resetForm();
      } else {
        toast.error(result.message || 'Failed to create celebration event');
      }
    } catch (error) {
      console.error('Error creating celebration:', error);
      toast.error('Failed to create celebration event');
    }
  };

  const handleMarkCelebrated = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/celebrations/${id}/mark-celebrated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celebratedBy: 'HR Admin' })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Marked as celebrated');
        fetchCelebrations();
      }
    } catch (error) {
      console.error('Error marking celebrated:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCelebration = async () => {
    if (!selectedCelebration) return;
    try {
      const response = await fetch(`http://localhost:5000/api/celebrations/${selectedCelebration._id}/delete`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Celebration deleted');
        setShowDeleteDialog(false);
        setSelectedCelebration(null);
        fetchCelebrations();
      }
    } catch (error) {
      console.error('Error deleting celebration:', error);
      toast.error('Failed to delete celebration');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      department: '',
      location: '',
      eventType: 'birthday',
      eventTitle: '',
      eventDate: new Date(),
      description: '',
      recognitionCategory: '',
      visibility: 'public',
      notifyEmployee: true,
      notifyTeam: false,
      sendEmail: true,
      awardDetails: '',
      budgetAllocated: 0
    });
  };

  const clearFilters = () => {
    setEventTypeFilter('all');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchQuery('');
  };

  const filteredCelebrations = useMemo(() => {
    // Convert recognition posts from store to Celebration shape
    const storePosts: Celebration[] = recognitionPosts.map(p => ({
      _id: p.id,
      celebrationId: p.id,
      employeeId: '',
      employeeName: p.employeeName,
      department: p.selectedAudienceDepts.join(', ') || 'All',
      location: '',
      eventType: p.type,
      eventTitle: p.title || `${p.type === 'birthday' ? 'Birthday' : 'Anniversary'} - ${p.employeeName}`,
      eventDate: p.type === 'birthday' && p.birthdayDate
        ? new Date(p.birthdayDate + 'T00:00:00')
        : p.joiningDate
        ? new Date(p.joiningDate + 'T00:00:00')
        : new Date(),
      description: p.message,
      status: p.status,
      milestoneYears: typeof p.yearsOfService === 'number' ? p.yearsOfService : undefined,
      publishedBy: p.publishedBy,
      publishedAt: p.publishedAt,
    }));

    const allItems = [...storePosts, ...celebrations];

    return allItems.filter(cel => {
      const matchesType = eventTypeFilter === 'all' || cel.eventType === eventTypeFilter;
      const matchesStatus = statusFilter === 'all' || cel.status === statusFilter;
      const matchesDate = (() => {
        if (!dateFrom && !dateTo) return true;
        const eventDate = new Date(cel.eventDate);
        if (dateFrom && dateTo) return isWithinInterval(eventDate, { start: startOfDay(dateFrom), end: endOfDay(dateTo) });
        if (dateFrom) return eventDate >= startOfDay(dateFrom);
        if (dateTo) return eventDate <= endOfDay(dateTo);
        return true;
      })();
      if (!matchesType || !matchesStatus || !matchesDate) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (cel.employeeName?.toLowerCase().includes(query) || false) ||
        (cel.employeeId?.toLowerCase().includes(query) || false) ||
        (cel.eventTitle?.toLowerCase().includes(query) || false) ||
        (cel.publishedBy?.toLowerCase().includes(query) || false)
      );
    });
  }, [celebrations, recognitionPosts, searchQuery, eventTypeFilter, statusFilter, dateFrom, dateTo]);
  
  // Column definitions for celebrations table
  const celebrationColumns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      width: '130px',
      render: (value: string) => (
        <div className="text-xs font-mono text-muted-foreground">
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      sortable: true,
      width: '200px',
      render: (_value: any, row: Celebration) => {
        const nameParts = row.employeeName?.split(' ') || [];
        return (
          <div className="flex items-center gap-2">
            <EmployeeAvatar
              employee={{
                employeeId: row.employeeId || '',
                name: row.employeeName || 'Unknown',
                firstName: nameParts[0] || 'Unknown',
                lastName: nameParts[1] || ''
              }}
              size="sm"
            />
            <div>
              <div className="text-sm font-medium">{row.employeeName || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">{row.employeeId || 'N/A'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'eventType',
      label: 'Event Type',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'eventTitle',
      label: 'Event Title',
      sortable: true,
      width: '180px',
      render: (value: string, row: Celebration) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {value || 'Untitled'}
            {row.milestoneYears && (
              <span>{getMilestoneBadge(row.milestoneYears)}</span>
            )}
          </div>
          {row.description && (
            <div className="text-xs text-muted-foreground line-clamp-1" title={row.description}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'eventDate',
      label: 'Event Date',
      sortable: true,
      width: '140px',
      render: (value: Date) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <div className="text-sm">{format(date, 'MMM dd, yyyy')}</div>
            <div className="text-xs text-muted-foreground">{getDaysUntilEvent(date)}</div>
          </div>
        );
      },
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      width: '120px',
      render: (value: string, row: Celebration) => (
        <div className="flex flex-col">
          <div className="text-sm">{value || 'N/A'}</div>
          {row.location && (
            <div className="text-xs text-muted-foreground">{row.location}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '150px',
      render: (value: string, row: Celebration) => (
        <div className="flex flex-col gap-1">
          <Badge className={getStatusColor(value || 'upcoming')}>
            {value || 'upcoming'}
          </Badge>
          {value === 'celebrated' && row.celebratedBy && (
            <div className="text-xs text-muted-foreground">
              by {row.celebratedBy}
            </div>
          )}
          {value === 'celebrated' && row.celebratedDate && (
            <div className="text-xs text-muted-foreground">
              {format(new Date(row.celebratedDate), 'MMM dd')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'publishedBy',
      label: 'Published By',
      sortable: true,
      width: '160px',
      render: (_value: string, row: Celebration) => {
        if (!row.publishedBy) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-medium">{row.publishedBy}</div>
            {row.publishedAt && (
              <div className="text-xs text-muted-foreground">
                {format(new Date(row.publishedAt), 'MMM dd, yyyy')}<br/>
                <span>{format(new Date(row.publishedAt), 'hh:mm a')}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: '_id',
      label: 'Actions',
      width: '120px',
      render: (_value: string, row: Celebration) => (
        <div className="flex items-center justify-center gap-2">
          {row.status === 'upcoming' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkCelebrated(row._id)}
              title="Mark as celebrated"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {row._id.startsWith('rec-') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnalyticsPostId(row._id)}
              title="View analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info('Email feature coming soon')}
            title="Send email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCelebration(row);
              setShowDeleteDialog(true);
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const getMilestoneBadge = (years?: number) => {
    if (!years) return null;
    if (years >= 20) return '💎';
    if (years >= 10) return '🥇';
    if (years >= 5) return '🥈';
    return '🥉';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      celebrated: 'bg-green-100 text-green-700',
      missed: 'bg-red-100 text-red-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDaysUntilEvent = (eventDate: Date) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === -1) return 'Yesterday';
    return `${Math.abs(diffDays)} days ago`;
  };

  const exportToExcel = () => {
    toast.success('Exporting to Excel...');
    // TODO: Implement Excel export
  };
  
  // Column toggle helper
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: prev[columnKey] === false ? true : false
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Recognition & Celebrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Matching WorkforceSummary UI */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <PartyPopper className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Recognition & Celebrations</h2>
            <p className="text-sm text-muted-foreground">
              Manage employee celebrations and recognition events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)} 
            className="gap-2 h-10"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(eventTypeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
          <Button onClick={() => navigate('/hr/recognition-new-event')} className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </Button>
        </div>
      </div>

      {/* Expandable Filter Section */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Celebrations</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Type</Label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="celebrated">Celebrated</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards - Matching WorkforceSummary UI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Birthdays
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Cake className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.birthdays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(eventTypeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) ? 'Filtered results' : 'Next 7 days'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Month Birthdays
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.monthBirthdays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(eventTypeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) ? 'Filtered results' : (monthBirthdays?.weeks && `Week 1: ${monthBirthdays.weeks[0]} | Week 2: ${monthBirthdays.weeks[1]}`)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Work Anniversaries
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.anniversaries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(eventTypeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) ? 'Filtered results' : 'Next 30 days'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(eventTypeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) ? 'Filtered results' : 'All celebrations'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Celebrations Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">All Celebrations</CardTitle>
              <CardDescription className="mt-1">
                {filteredCelebrations.length} {filteredCelebrations.length === 1 ? 'event' : 'events'}
                {(eventTypeFilter !== 'all' || statusFilter !== 'all') && ' (filtered)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search celebrations..."
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
                    {celebrationColumns
                      .filter(column => !['employeeId', 'employeeName', '_id'].includes(column.key))
                      .map((column) => (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Active Filter Badges */}
          {(eventTypeFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {eventTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Type: {eventTypeFilter}
                  <button onClick={() => setEventTypeFilter('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredCelebrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No celebrations found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery 
                  ? 'No celebrations match your search. Try adjusting your search query.'
                  : 'Start by adding celebration events or adjust your filters'}
              </p>
            </div>
          ) : (
            <DataTable
              data={filteredCelebrations}
              columns={celebrationColumns.map(col => ({ 
                ...col, 
                hidden: ['employeeId', 'employeeName', '_id'].includes(col.key) ? false : columnVisibility[col.key] === false 
              }))}
              searchable={false}
              hideColumnToggle={true}
              pageSize={15}
              emptyMessage={
                searchQuery 
                  ? 'No celebrations found. Try adjusting your search query.'
                  : 'No celebrations found. Start by adding celebration events.'
              }

            />
          )}
        </CardContent>
      </Card>

      {/* Add Celebration Drawer */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent className="w-[600px] sm:w-[600px] flex flex-col p-0">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle>Add New Celebration Event</SheetTitle>
              <SheetDescription>
                Create a new celebration or recognition event for an employee
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
          <SheetBody>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee ID <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    value={formData.employeeId}
                    onChange={(e) => handleEmployeeIdChange(e.target.value)}
                    placeholder="EMP001 or ACUA001"
                    disabled={isLoadingEmployee}
                  />
                  {isLoadingEmployee && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter Employee ID to auto-fill details
                </p>
              </div>
              <div>
                <Label>Employee Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="John Doe"
                  disabled={isLoadingEmployee}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering"
                  disabled={isLoadingEmployee}
                />
              </div>
              <div>
                <Label>Location <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="New York"
                  disabled={isLoadingEmployee}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type <span className="text-red-500">*</span></Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Work Anniversary</SelectItem>
                    <SelectItem value="achievement">Achievement Award</SelectItem>
                    <SelectItem value="spot-recognition">Spot Recognition</SelectItem>
                    <SelectItem value="custom">Custom Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Event Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      selected={formData.eventDate}
                      onSelect={(date) => date && setFormData({ ...formData, eventDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>Event Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.eventTitle}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                placeholder="5 Year Work Anniversary"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Congratulations on 5 years of dedication..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Recognition Category</Label>
                <Select value={formData.recognitionCategory} onValueChange={(value) => setFormData({ ...formData, recognitionCategory: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellence">Excellence</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="customer-service">Customer Service</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget Allocated</Label>
                <Input
                  type="number"
                  value={formData.budgetAllocated}
                  onChange={(e) => setFormData({ ...formData, budgetAllocated: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.sendEmail}
                onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked as boolean })}
              />
              <Label>Send email notification</Label>
            </div>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCelebration}>Create Event</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add New Event Dialog - Matching NewAnnouncement Events Tab UI */}
      <Dialog open={showAddEventDialog} onOpenChange={(open) => { setShowAddEventDialog(open); if (!open) resetNewEventForm(); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-amber-600" />
              Add New Event
            </DialogTitle>
            <DialogDescription>
              Create a new celebration or recognition event for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* LEFT SECTION - Event Form */}
            <div className="space-y-4">
              {/* Event Details */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEventTitle">Event Title *</Label>
                    <Input
                      id="newEventTitle"
                      placeholder="e.g., Annual Town Hall Meeting 2026"
                      value={newEventData.title}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newEventDesc">Description *</Label>
                    <Textarea
                      id="newEventDesc"
                      placeholder="Describe the event, agenda, and what attendees should know..."
                      value={newEventData.description}
                      onChange={(e) => setNewEventData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Type *</Label>
                      <Select
                        value={newEventData.eventType}
                        onValueChange={(value) => setNewEventData(prev => ({ ...prev, eventType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="celebration">Celebration</SelectItem>
                          <SelectItem value="town-hall">Town Hall Meeting</SelectItem>
                          <SelectItem value="training">Training/Workshop</SelectItem>
                          <SelectItem value="team-building">Team Building</SelectItem>
                          <SelectItem value="awards">Awards Ceremony</SelectItem>
                          <SelectItem value="social">Social Event</SelectItem>
                          <SelectItem value="meeting">Business Meeting</SelectItem>
                          <SelectItem value="wellness">Wellness Activity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={newEventData.category}
                        onValueChange={(value) => setNewEventData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company-wide">Company-Wide</SelectItem>
                          <SelectItem value="department">Department-Specific</SelectItem>
                          <SelectItem value="location">Location-Specific</SelectItem>
                          <SelectItem value="team">Team Event</SelectItem>
                          <SelectItem value="optional">Optional/Social</SelectItem>
                          <SelectItem value="mandatory">Mandatory/Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={newEventData.startDate}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={newEventData.startTime}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newEventData.endDate}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time *</Label>
                      <Input
                        type="time"
                        value={newEventData.endTime}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pin className="h-5 w-5 text-amber-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Event Mode *</Label>
                    <Select
                      value={newEventData.mode}
                      onValueChange={(value: 'in-person' | 'virtual' | 'hybrid') => setNewEventData(prev => ({ ...prev, mode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="virtual">Virtual (Online)</SelectItem>
                        <SelectItem value="hybrid">Hybrid (In-Person + Virtual)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newEventData.mode === 'in-person' || newEventData.mode === 'hybrid') && (
                    <>
                      <div className="space-y-2">
                        <Label>Venue Name *</Label>
                        <Input
                          placeholder="e.g., Conference Room A, Main Auditorium"
                          value={newEventData.venue}
                          onChange={(e) => setNewEventData(prev => ({ ...prev, venue: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea
                          placeholder="Full address with building/floor details"
                          value={newEventData.address}
                          onChange={(e) => setNewEventData(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  {(newEventData.mode === 'virtual' || newEventData.mode === 'hybrid') && (
                    <div className="space-y-2">
                      <Label>Virtual Meeting Link *</Label>
                      <Input
                        placeholder="Zoom/Teams/Meet link"
                        value={newEventData.virtualLink}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, virtualLink: e.target.value }))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RSVP & Settings */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    RSVP & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Enable RSVP</Label>
                      <p className="text-xs text-muted-foreground">Allow attendees to confirm attendance</p>
                    </div>
                    <Switch
                      checked={newEventData.enableRSVP}
                      onCheckedChange={(checked) => setNewEventData(prev => ({ ...prev, enableRSVP: checked }))}
                    />
                  </div>

                  {newEventData.enableRSVP && (
                    <div className="space-y-2">
                      <Label>Max Attendees (optional)</Label>
                      <Input
                        type="number"
                        placeholder="Leave blank for unlimited"
                        value={newEventData.maxAttendees}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organizer</Label>
                      <Input
                        value={newEventData.organizer}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, organizer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={newEventData.contactEmail}
                        onChange={(e) => setNewEventData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience *</Label>
                    <Select
                      value={newEventData.targetAudience}
                      onValueChange={(value: 'all' | 'departments' | 'custom') => setNewEventData(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="departments">Specific Departments</SelectItem>
                        <SelectItem value="custom">Custom List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SECTION - Preview */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Event Preview</CardTitle>
                  <CardDescription>How your event will appear to employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{newEventData.title || 'Event Title'}</h3>
                        <Badge className="mt-1" variant="outline">{newEventData.eventType || 'Event Type'}</Badge>
                      </div>
                      <Badge className="bg-amber-500 text-white">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Event
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {newEventData.description || 'Event description will appear here...'}
                    </p>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">
                          {newEventData.startDate ? new Date(newEventData.startDate).toLocaleDateString() : 'Date'}
                          {newEventData.startTime && ` at ${newEventData.startTime}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>
                          {newEventData.startTime || 'Start Time'} - {newEventData.endTime || 'End Time'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Pin className="h-4 w-4 text-amber-600" />
                        <span>
                          {newEventData.mode === 'virtual' ? 'Virtual Event' :
                           newEventData.mode === 'hybrid' ? 'Hybrid Event' :
                           newEventData.venue || 'Venue Name'}
                        </span>
                      </div>

                      {newEventData.enableRSVP && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-amber-600" />
                          <span>RSVP Required</span>
                          {newEventData.maxAttendees && (
                            <span className="text-muted-foreground">• Max {newEventData.maxAttendees} attendees</span>
                          )}
                        </div>
                      )}
                    </div>

                    {newEventData.enableRSVP && (
                      <div className="pt-3 border-t">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          RSVP Now
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <User className="h-3 w-3 inline mr-1" />
                      Organized by {newEventData.organizer || 'Organizer'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => { setShowAddEventDialog(false); resetNewEventForm(); }}>Cancel</Button>
            <Button onClick={handleCreateNewEvent} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recognition Analytics Dialog */}
      <RecognitionAnalyticsDialog
        open={!!analyticsPostId}
        onOpenChange={(open) => { if (!open) setAnalyticsPostId(null); }}
        postId={analyticsPostId || ''}
        postTitle={
          recognitionPosts.find(p => p.id === analyticsPostId)?.title ||
          filteredCelebrations.find(c => c._id === analyticsPostId)?.eventTitle ||
          'Recognition Post'
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Celebration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this celebration event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCelebration} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
