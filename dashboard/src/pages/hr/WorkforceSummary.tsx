import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useHolidayStore } from '@/store/holidayStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { useLeaveStore } from '@/store/leaveStore';
import apiClient from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetCloseButton } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Clock, TrendingUp, FileText, Users, CalendarDays, Plane, LogIn, LogOut, Megaphone, Cake, Gift, UserPlus, Heart, MessageCircle, Send, Plus, Flame, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, Tag, BadgeCheck, Eye, Share2, Pin, BarChart3, CheckCircle2, Pencil, AlertCircle, Trash2, MoreVertical, Palmtree, Award, Baby, Briefcase, Circle, Upload, Search, Filter, Download, X, ArrowUpDown, ArrowUp, ArrowDown, Minus, ExternalLink, Edit3, Columns3, PieChart, User, UserX } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LabelList, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useProfile } from '@/contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AddHolidayModal } from '@/components/modals/AddHolidayModal';
import { EditHolidayModal } from '@/components/modals/EditHolidayModal';
import { HolidaysDialog } from '@/components/modals/HolidaysDialog';
import { EmployeeCard } from '@/components/dashboard/EmployeeCard';
import { AddEditEmployeeModal } from '@/components/modals/AddEditEmployeeModal';
import { BulkUploadModal } from '@/components/employee/BulkUploadModal';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { getAvatarGradient, getInitials } from '@/constants/design-system';
import type { Holiday } from '@/store/holidayStore';
import { toast } from 'sonner';
import { LEAVE_TYPE_ICONS, LEAVE_PLAN_COLORS } from '@/types/leave';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { differenceInMonths, differenceInYears, parseISO, differenceInCalendarYears } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌅', gradient: 'from-orange-400 to-yellow-400' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️', gradient: 'from-blue-400 to-cyan-400' };
  return { text: 'Good Evening', emoji: '🌙', gradient: 'from-indigo-400 to-purple-400' };
};

export function WorkforceSummary() {
  const navigate = useNavigate();
  const { permissions } = useProfile();
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const greeting = getGreeting();
  const { checkIn, checkOut, getTodayRecord } = useAttendanceStore();
  const todayRecord = getTodayRecord(user?.employeeId || '');

  // Store data
  const announcements = useAnnouncementStore((state) => state.announcements);
  const { toggleLike, addComment: addAnnouncementComment, fetchAnnouncements, addReaction, deleteAnnouncement } = useAnnouncementStore();
  const isLoadingAnnouncements = useAnnouncementStore((state) => state.isLoading);
  const announcementError = useAnnouncementStore((state) => state.error);
  const { fetchHolidays } = useHolidayStore();
  const allHolidays = useHolidayStore((state) => state.holidays);
  const { employees, fetchEmployees, getBirthdays, getAnniversaries, getNewJoiners } = useEmployeeStore();
  const leaves = useLeaveStore((state) => state.leaves);
  const leaveBalance = useLeaveStore((state) => state.leaveBalance);
  const { fetchLeaveBalance } = useLeaveStore();
  const [showAllHolidaysModal, setShowAllHolidaysModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);
  const [employeeToInactivate, setEmployeeToInactivate] = useState<any>(null);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [employeeToActivate, setEmployeeToActivate] = useState<any>(null);
  const [pipCount, setPipCount] = useState(0);
  const [employeeTab, setEmployeeTab] = useState<'active' | 'inactive'>('active');

  // Employee DataTable State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedExperienceRange, setSelectedExperienceRange] = useState<string>('');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const rowsPerPage = 15;
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    employeeIdText: false,
    email: false,
    phone: false,
    nationality: false,
    personalEmail: false,
    address: false,
    currentCTC: false,
    previousCTC: false,
    totalExp: false,
    acuvateExp: false,
  });
  
  // Export column selection
  const [showExportColumnsDialog, setShowExportColumnsDialog] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>([
    'employeeId', 'email', 'phone', 'name', 'designation', 'department', 
    'location', 'gender', 'dateOfBirth', 'age', 'maritalStatus', 
    'dateOfJoining', 'employmentType', 'reportingManager'
  ]);

  // Date range filtering states
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [selectedKPIFilter, setSelectedKPIFilter] = useState<string | null>(null);

  // Workforce statistics state
  const [workforceStats, setWorkforceStats] = useState({
    totalHeadcount: 0,
    activeEmployees: 0,
    newHiresMTD: 0,
    newHiresYTD: 0,
    exitsMTD: 0,
    exitsYTD: 0,
    attritionRate: 0,
    trends: {
      headcountChange: 0,
      activeChange: 0
    }
  });

  // Clear date filters
  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilterApplied(false);
  };

  // Apply filter
  const applyFilter = () => {
    if (!fromDate && !toDate) {
      toast.error('Please select at least one date');
      return;
    }
    setFilterApplied(true);
    setShowFilterPopover(false);
    toast.success('Date range filter applied');
  };

  // Fetch workforce statistics
  const fetchWorkforceStats = async () => {
    try {
      const response = await apiClient.get('/employees/stats/workforce');
      if (response.data.success) {
        setWorkforceStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workforce stats:', error);
    }
  };

  // Fetch PIP count
  const fetchPIPCount = async () => {
    try {
      const response = await apiClient.get('/pip/active-count');
      if (response.data.success) {
        setPipCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch PIP count:', error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchAnnouncements();
    fetchHolidays();
    fetchEmployees();
    fetchWorkforceStats();
    fetchPIPCount();
    if (user?.employeeId) {
      fetchLeaveBalance(user.employeeId);
    }
  }, [fetchAnnouncements, fetchHolidays, fetchEmployees, fetchLeaveBalance, user?.employeeId]);

  // Auto-refresh workforce stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkforceStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Modal states
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showEditHolidayModal, setShowEditHolidayModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  
  // Holiday navigation state
  const selectedYear = new Date().getFullYear(); // Fixed to current year
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [indexInitialized, setIndexInitialized] = useState(false);

  // Get all holidays for the selected year, sorted by date
  const yearHolidays = useMemo(() => {
    return (allHolidays || [])
      .filter(holiday => {
        const holidayYear = new Date(holiday.date).getFullYear();
        return holidayYear === selectedYear;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allHolidays, selectedYear]);

  // Smart default index logic
  const getDefaultHolidayIndex = useMemo(() => {
    if (yearHolidays.length === 0) return 0;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 1. Check if today is a holiday
    const todayHolidayIndex = yearHolidays.findIndex(holiday => 
      holiday.date === todayStr
    );
    if (todayHolidayIndex !== -1) {
      return todayHolidayIndex;
    }
    
    // 2. Find next upcoming holiday
    const upcomingHolidayIndex = yearHolidays.findIndex(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate > today;
    });
    if (upcomingHolidayIndex !== -1) {
      return upcomingHolidayIndex;
    }
    
    // 3. Fallback to first holiday of the year
    return 0;
  }, [yearHolidays]);

  // Initialize holiday index based on the computed default
  if (!indexInitialized && yearHolidays.length > 0) {
    setCurrentHolidayIndex(getDefaultHolidayIndex);
    setIndexInitialized(true);
  }

  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowEditHolidayModal(true);
  };

  // Holiday navigation functions with boundary handling
  const handlePrevHoliday = () => {
    if (isTransitioning || yearHolidays.length <= 1 || currentHolidayIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentHolidayIndex(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextHoliday = () => {
    if (isTransitioning || yearHolidays.length <= 1 || currentHolidayIndex >= yearHolidays.length - 1) return;
    setIsTransitioning(true);
    setCurrentHolidayIndex(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Navigation state helpers
  const isPrevDisabled = currentHolidayIndex <= 0 || yearHolidays.length <= 1;
  const isNextDisabled = currentHolidayIndex >= yearHolidays.length - 1 || yearHolidays.length <= 1;

  // Format holiday date with day name
  const formatHolidayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const teamLeaves = leaves.filter(l => l.status === 'approved');
  const birthdays = getBirthdays();
  const anniversaries = getAnniversaries();
  const newJoiners = getNewJoiners();

  const formatLeaveDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate === endDate) {
      return format(start, 'MMM dd, yyyy');
    }
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const [reactionDialogOpen, setReactionDialogOpen] = useState(false);
  const [selectedAnnouncementReactions, setSelectedAnnouncementReactions] = useState<{ id: number; title: string } | null>(null);
  const [activeReactionTab, setActiveReactionTab] = useState('all');
  const [announcementsTab, setAnnouncementsTab] = useState<'published' | 'drafts'>('published');
  
  // Poll voters drawer state
  const [pollVotersDrawerOpen, setPollVotersDrawerOpen] = useState(false);
  const [selectedPollData, setSelectedPollData] = useState<{
    pollTitle: string;
    options: Array<{ id: string; text: string; voters: string[]; votes: number }>;
    isAnonymous: boolean;
    totalVotes: number;
  } | null>(null);
  const [activePollTab, setActivePollTab] = useState('option-0');
  
  // Get current user ID - prioritize authenticated user's employeeId
  const currentUserId = user?.employeeId || user?.email || 'anonymous';
  const pollStorageKey = `pollVotes_${currentUserId}`;

  // Compute initial poll state based on announcements data
  const initialPollState = useMemo(() => {
    const alreadyVoted: Record<number, boolean> = {};
    const userSelections: Record<number, string[]> = {};
    
    // Load from user-specific localStorage
    const savedVotes = JSON.parse(localStorage.getItem(pollStorageKey) || '{}');
    
    announcements.forEach(announcement => {
      if (announcement.isPoll && announcement.pollOptions) {
        // Check if THIS user has voted by looking at votedBy arrays
        const votedOptions: string[] = [];
        announcement.pollOptions.forEach(option => {
          if (option.votedBy && option.votedBy.includes(currentUserId)) {
            votedOptions.push(option.id);
          }
        });
        
        // Only mark as voted if THIS user's ID is in votedBy
        if (votedOptions.length > 0) {
          alreadyVoted[announcement.id] = true;
          userSelections[announcement.id] = votedOptions;
        } else if (savedVotes[announcement.id]) {
          // Fallback to user-specific localStorage
          alreadyVoted[announcement.id] = true;
          userSelections[announcement.id] = savedVotes[announcement.id];
        }
      }
    });
    
    return { alreadyVoted, userSelections };
  }, [announcements, currentUserId, pollStorageKey]);

  const [selectedPollOptions, setSelectedPollOptions] = useState<Record<number, string[]>>({});
  const [submittedPolls, setSubmittedPolls] = useState<Record<number, boolean>>({});
  const [pollStateInitialized, setPollStateInitialized] = useState(false);
  
  // Sync initial poll state when announcements load (only once)
  if (!pollStateInitialized && Object.keys(initialPollState.alreadyVoted).length > 0) {
    setSubmittedPolls(initialPollState.alreadyVoted);
    setSelectedPollOptions(initialPollState.userSelections);
    setPollStateInitialized(true);
  }

  // Poll option selection handler (before submit)
  const handlePollOptionSelect = (announcementId: number, optionId: string) => {
    const currentSelections = selectedPollOptions[announcementId] || [];
    const announcement = announcements.find(a => a.id === announcementId);
    
    if (!announcement?.isPoll || submittedPolls[announcementId]) return;
    
    if (announcement.allowMultipleAnswers) {
      // Toggle selection for multiple choice
      if (currentSelections.includes(optionId)) {
        setSelectedPollOptions(prev => ({
          ...prev,
          [announcementId]: currentSelections.filter(id => id !== optionId)
        }));
      } else {
        setSelectedPollOptions(prev => ({
          ...prev,
          [announcementId]: [...currentSelections, optionId]
        }));
      }
    } else {
      // Single choice - replace selection
      setSelectedPollOptions(prev => ({
        ...prev,
        [announcementId]: [optionId]
      }));
    }
  };

  // Submit poll vote
  const handlePollSubmit = (announcementId: number) => {
    const selections = selectedPollOptions[announcementId] || [];
    if (selections.length === 0) return;
    
    // Update vote counts in the store with THIS user's ID
    useAnnouncementStore.getState().votePoll(announcementId, selections, currentUserId);
    
    // Save to user-specific localStorage for persistence
    const savedVotes = JSON.parse(localStorage.getItem(pollStorageKey) || '{}');
    savedVotes[announcementId] = selections;
    localStorage.setItem(pollStorageKey, JSON.stringify(savedVotes));
    
    setSubmittedPolls(prev => ({ ...prev, [announcementId]: true }));
  };

  const hasSubmittedPoll = (announcementId: number) => {
    return submittedPolls[announcementId] || false;
  };

  const hasSelections = (announcementId: number) => {
    return (selectedPollOptions[announcementId] || []).length > 0;
  };

  const isOptionSelected = (announcementId: number, optionId: string) => {
    return (selectedPollOptions[announcementId] || []).includes(optionId);
  };

  // Show poll voters drawer with all options (HR feature)
  const showPollVoters = (announcement: typeof announcements[0]) => {
    if (!announcement.pollOptions) return;
    
    const options = announcement.pollOptions.map(opt => ({
      id: opt.id,
      text: opt.text,
      voters: opt.votedBy || [],
      votes: opt.votes || 0
    }));
    
    setSelectedPollData({
      pollTitle: announcement.title,
      options,
      isAnonymous: announcement.isAnonymous || false,
      totalVotes: announcement.totalVotes || options.reduce((sum, o) => sum + o.votes, 0)
    });
    setActivePollTab('option-0');
    setPollVotersDrawerOpen(true);
  };

  // Get employee name from employeeId
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return employee?.name || employeeId;
  };

  // Emoji reactions configuration
  const reactionEmojis = [
    { emoji: 'ðŸ‘', label: 'Like', color: 'text-primary' },
    { emoji: 'â¤ï¸', label: 'Love', color: 'text-destructive' },
    { emoji: 'ðŸŽ‰', label: 'Celebrate', color: 'text-yellow-500' },
    { emoji: 'ðŸ‘', label: 'Applause', color: 'text-primary' },
    { emoji: 'ðŸ”¥', label: 'Fire', color: 'text-orange-500' },
  ];

  // Category colors configuration
  const categoryColors: Record<string, string> = {
    general: 'bg-muted text-muted-foreground',
    policy: 'bg-primary/10 text-primary',
    event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    announcement: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    hr: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    urgent: 'bg-destructive/10 text-destructive',
    celebration: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  const toggleExpand = (postId: number) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = useMemo(() => {
    if (!announcements) return [];
    return [...announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [announcements]);

  // Helper function to check if announcement/poll is expired
  const isExpired = (announcement: typeof announcements[0]) => {
    const now = new Date();
    if (announcement.expiresAt) {
      return new Date(announcement.expiresAt) < now;
    }
    if (announcement.isPoll && announcement.pollExpiresAt) {
      return new Date(announcement.pollExpiresAt) < now;
    }
    return false;
  };

  const handleLike = (postId: number) => {
    if (!user?.employeeId) return;
    toggleLike(postId, user.employeeId);
  };

  // Handle adding a reaction with emoji
  const handleReaction = (postId: number, emoji: string, label: string) => {
    if (!user?.employeeId) return;
    addReaction(postId, user.employeeId, user.name || 'Unknown', emoji, label);
  };

  // Show reactions dialog
  const handleShowReactions = (announcementId: number, title: string) => {
    setSelectedAnnouncementReactions({ id: announcementId, title });
    setReactionDialogOpen(true);
  };

  // Get reactions for selected announcement
  const getSelectedAnnouncementReactions = () => {
    if (!selectedAnnouncementReactions) return [];
    const announcement = announcements.find(a => a.id === selectedAnnouncementReactions.id);
    return announcement?.reactions || [];
  };

  // Group reactions by emoji for display
  const groupReactionsByEmoji = (reactions: Array<{ emoji: string; label: string; userName: string; timestamp: string }>) => {
    const grouped: Record<string, { emoji: string; label: string; users: Array<{ userName: string; timestamp: string }> }> = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { emoji: r.emoji, label: r.label, users: [] };
      }
      grouped[r.emoji].users.push({ userName: r.userName, timestamp: r.timestamp });
    });
    return Object.values(grouped);
  };

  const handleAddComment = (postId: number) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText || !user?.employeeId) return;

    addAnnouncementComment(postId, {
      author: user.name || 'You',
      text: commentText,
      time: 'Just now'
    });

    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  // Draft management functions
  const [drafts, setDrafts] = useState<any[]>([]);

  const loadDrafts = () => {
    const savedDrafts = localStorage.getItem('announcementDrafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  };

  const handleEditDraft = (draft: any) => {
    navigate('/announcements/new', { state: { draft } });
  };

  const handleDeleteDraft = (draftId: number) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      const updatedDrafts = drafts.filter(d => d.id !== draftId);
      localStorage.setItem('announcementDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      toast({
        title: 'Draft deleted',
        description: 'Draft has been removed successfully.',
      });
    }
  };

  const formatDraftDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  // Calculate filtered stats when filter is applied
  const getFilteredStats = () => {
    const hasDateFilter = fromDate || toDate;
    const hasOtherFilters = selectedDepartments.length > 0 || selectedLocations.length > 0 || 
                           selectedEmploymentTypes.length > 0 || selectedExperienceRange !== '' || 
                           salaryMin !== '' || salaryMax !== '';
    
    // Show default stats if no filters are active
    if (!hasDateFilter && !hasOtherFilters) {
      return {
        totalHeadcount: workforceStats.totalHeadcount,
        activeEmployees: workforceStats.activeEmployees,
        newHires: workforceStats.newHiresYTD,
        newHiresMTD: workforceStats.newHiresMTD,
        exits: workforceStats.exitsYTD,
        exitsMTD: workforceStats.exitsMTD,
        attritionRate: workforceStats.attritionRate,
        trend: workforceStats.trends.headcountChange,
        activeTrend: workforceStats.trends.activeChange
      };
    }

    // For Total Headcount: Apply all filters EXCEPT date range
    let headcountFiltered = employees;
    
    // Department filter
    if (selectedDepartments.length > 0) {
      headcountFiltered = headcountFiltered.filter(emp => selectedDepartments.includes(emp.department));
    }
    
    // Location filter
    if (selectedLocations.length > 0) {
      headcountFiltered = headcountFiltered.filter(emp => selectedLocations.includes(emp.location));
    }
    
    // Employment type filter
    if (selectedEmploymentTypes.length > 0) {
      headcountFiltered = headcountFiltered.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }
    
    // Experience range filter
    if (selectedExperienceRange) {
      headcountFiltered = headcountFiltered.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        
        switch(selectedExperienceRange) {
          case '0-2':
            return totalYears <= 2;
          case '3-5':
            return totalYears >= 3 && totalYears <= 5;
          case '6-10':
            return totalYears >= 6 && totalYears <= 10;
          case '10+':
            return totalYears > 10;
          default:
            return true;
        }
      });
    }
    
    // Salary range filter
    if (salaryMin || salaryMax) {
      headcountFiltered = headcountFiltered.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }
    
    // For Exits and other date-based stats: apply ALL filters including date range
    let filteredEmployees = employees;
    
    // Date range filter
    if (hasDateFilter) {
      filteredEmployees = filteredEmployees.filter(emp => {
        const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
        if (!joinDate) return false;

        if (fromDate && toDate) {
          return joinDate >= fromDate && joinDate <= toDate;
        } else if (fromDate) {
          return joinDate >= fromDate;
        } else if (toDate) {
          return joinDate <= toDate;
        }
        return true;
      });
    }
    
    // Department filter
    if (selectedDepartments.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => selectedDepartments.includes(emp.department));
    }
    
    // Location filter
    if (selectedLocations.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => selectedLocations.includes(emp.location));
    }
    
    // Employment type filter
    if (selectedEmploymentTypes.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }
    
    // Experience range filter
    if (selectedExperienceRange) {
      filteredEmployees = filteredEmployees.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        
        switch(selectedExperienceRange) {
          case '0-2':
            return totalYears <= 2;
          case '3-5':
            return totalYears >= 3 && totalYears <= 5;
          case '6-10':
            return totalYears >= 6 && totalYears <= 10;
          case '10+':
            return totalYears > 10;
          default:
            return true;
        }
      });
    }
    
    // Salary range filter
    if (salaryMin || salaryMax) {
      filteredEmployees = filteredEmployees.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }

    // Total Headcount excludes date range filter
    const totalInRange = headcountFiltered.length;
    // Exits use fully filtered employees (including date range)
    const exitsInRange = filteredEmployees.filter(e => e.status === 'inactive').length;
    const activeInRange = filteredEmployees.filter(e => e.status === 'active').length;

    return {
      totalHeadcount: totalInRange,
      activeEmployees: activeInRange,
      newHires: filteredEmployees.length,
      newHiresMTD: 0,
      exits: exitsInRange,
      exitsMTD: 0,
      attritionRate: totalInRange > 0 ? ((exitsInRange / totalInRange) * 100).toFixed(1) : 0,
      trend: 0,
      activeTrend: 0
    };
  };

  const filteredStats = getFilteredStats();
  
  // Check if any filters are active
  const hasAnyFilters = fromDate || toDate || selectedDepartments.length > 0 || 
                        selectedLocations.length > 0 || selectedEmploymentTypes.length > 0 || 
                        selectedExperienceRange !== '' || salaryMin !== '' || salaryMax !== '';
  
  // Calculate recent joined (current month)
  const recentJoinedCount = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // If date filters are applied, use the filtered range
    if (fromDate || toDate) {
      return employees.filter(emp => {
        const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
        if (!joinDate) return false;

        if (fromDate && toDate) {
          return joinDate >= fromDate && joinDate <= toDate;
        } else if (fromDate) {
          return joinDate >= fromDate;
        } else if (toDate) {
          return joinDate <= toDate;
        }
        return false;
      }).length;
    }
    
    // Otherwise show current month joiners
    return employees.filter(emp => {
      const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
      if (!joinDate) return false;
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
  }, [employees, fromDate, toDate]);

  // Calculate gender statistics (exclude date range, but include other filters)
  const genderStats = useMemo(() => {
    let empsForGenderCalc = employees;
    
    // Apply all filters EXCEPT date range
    if (selectedDepartments.length > 0) {
      empsForGenderCalc = empsForGenderCalc.filter(emp => selectedDepartments.includes(emp.department));
    }
    
    if (selectedLocations.length > 0) {
      empsForGenderCalc = empsForGenderCalc.filter(emp => selectedLocations.includes(emp.location));
    }
    
    if (selectedEmploymentTypes.length > 0) {
      empsForGenderCalc = empsForGenderCalc.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }
    
    if (selectedExperienceRange) {
      empsForGenderCalc = empsForGenderCalc.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        
        switch(selectedExperienceRange) {
          case '0-2':
            return totalYears <= 2;
          case '3-5':
            return totalYears >= 3 && totalYears <= 5;
          case '6-10':
            return totalYears >= 6 && totalYears <= 10;
          case '10+':
            return totalYears > 10;
          default:
            return true;
        }
      });
    }
    
    if (salaryMin || salaryMax) {
      empsForGenderCalc = empsForGenderCalc.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }
    
    const maleCount = empsForGenderCalc.filter(e => e.gender?.toLowerCase() === 'male').length;
    const femaleCount = empsForGenderCalc.filter(e => e.gender?.toLowerCase() === 'female').length;
    return { male: maleCount, female: femaleCount };
  }, [employees, selectedDepartments, selectedLocations, selectedEmploymentTypes, 
      selectedExperienceRange, salaryMin, salaryMax]);

  // Calculate exit breakdown (notice period vs already exited)
  const exitStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Apply all filters EXCEPT date range (same as Total Headcount)
    let filteredForExits = employees;
    
    if (selectedDepartments.length > 0) {
      filteredForExits = filteredForExits.filter(emp => selectedDepartments.includes(emp.department));
    }
    if (selectedLocations.length > 0) {
      filteredForExits = filteredForExits.filter(emp => selectedLocations.includes(emp.location));
    }
    if (selectedEmploymentTypes.length > 0) {
      filteredForExits = filteredForExits.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }
    if (selectedExperienceRange) {
      filteredForExits = filteredForExits.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        
        switch(selectedExperienceRange) {
          case '0-2':
            return totalYears <= 2;
          case '3-5':
            return totalYears >= 3 && totalYears <= 5;
          case '6-10':
            return totalYears >= 6 && totalYears <= 10;
          case '10+':
            return totalYears > 10;
          default:
            return true;
        }
      });
    }
    if (salaryMin || salaryMax) {
      filteredForExits = filteredForExits.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }
    
    // In Notice Period: offboarding in-progress OR lastWorkingDay is in future
    const inNoticePeriod = filteredForExits.filter(e => {
      if (e.offboarding?.status === 'in-progress') return true;
      if (e.offboarding?.lastWorkingDay) {
        const lastDay = new Date(e.offboarding.lastWorkingDay);
        lastDay.setHours(0, 0, 0, 0);
        return lastDay >= today && e.status === 'active';
      }
      return false;
    }).length;
    
    // Already Exited: status is inactive
    const alreadyExited = filteredForExits.filter(e => e.status === 'inactive').length;
    
    return { inNoticePeriod, alreadyExited };
  }, [employees, selectedDepartments, selectedLocations, selectedEmploymentTypes, 
      selectedExperienceRange, salaryMin, salaryMax]);

  // Filter employees for stats (excludes search and tab filters, only uses filter selections)
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Apply filters only (not search or tab)
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(emp => selectedDepartments.includes(emp.department));
    }

    if (selectedLocations.length > 0) {
      filtered = filtered.filter(emp => selectedLocations.includes(emp.location));
    }

    if (selectedEmploymentTypes.length > 0) {
      filtered = filtered.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }
    
    // Experience range filter
    if (selectedExperienceRange) {
      filtered = filtered.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        
        switch(selectedExperienceRange) {
          case '0-2':
            return totalYears <= 2;
          case '3-5':
            return totalYears >= 3 && totalYears <= 5;
          case '6-10':
            return totalYears >= 6 && totalYears <= 10;
          case '10+':
            return totalYears > 10;
          default:
            return true;
        }
      });
    }
    
    // Salary range filter
    if (salaryMin || salaryMax) {
      filtered = filtered.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }

    return filtered;
  }, [employees, selectedDepartments, selectedLocations, selectedEmploymentTypes, selectedExperienceRange, salaryMin, salaryMax]);

  // Calculate New Hires — respects date range if applied, otherwise current month
  const newHiresThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (fromDate || toDate) {
      return filteredEmployees.filter(emp => {
        if (emp.status !== 'active') return false;
        const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
        if (!joinDate) return false;
        if (fromDate && toDate) return joinDate >= fromDate && joinDate <= toDate;
        if (fromDate) return joinDate >= fromDate;
        if (toDate) return joinDate <= toDate;
        return false;
      }).length;
    }

    return filteredEmployees.filter(emp => {
      if (emp.status !== 'active') return false;
      const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
      if (!joinDate) return false;
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
  }, [filteredEmployees, fromDate, toDate]);

  // Calculate Exits — respects date range if applied, otherwise current month
  const exitsThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (fromDate || toDate) {
      return filteredEmployees.filter(emp => {
        if (emp.status !== 'inactive') return false;
        if (emp.offboarding?.lastWorkingDay) {
          const exitDate = new Date(emp.offboarding.lastWorkingDay);
          if (fromDate && toDate) return exitDate >= fromDate && exitDate <= toDate;
          if (fromDate) return exitDate >= fromDate;
          if (toDate) return exitDate <= toDate;
        }
        return false;
      }).length;
    }

    return filteredEmployees.filter(emp => {
      if (emp.status !== 'inactive') return false;
      if (emp.offboarding?.lastWorkingDay) {
        const exitDate = new Date(emp.offboarding.lastWorkingDay);
        return exitDate.getMonth() === currentMonth && exitDate.getFullYear() === currentYear;
      }
      return false;
    }).length;
  }, [filteredEmployees, fromDate, toDate]);

  // Calculate Attrition Rate - (Exits / Average Employees) × 100
  const attritionRate = useMemo(() => {
    const totalActive = filteredEmployees.filter(e => e.status === 'active').length;
    const totalInactive = filteredEmployees.filter(e => e.status === 'inactive').length;
    const avgEmployees = (totalActive + totalInactive) / 2;
    
    if (avgEmployees === 0) return '0.0';
    
    return ((totalInactive / avgEmployees) * 100).toFixed(1);
  }, [filteredEmployees]);

  // Calculate Department Count
  const departmentData = useMemo(() => {
    const deptCount: Record<string, number> = {};
    
    filteredEmployees.filter(e => e.status === 'active').forEach(emp => {
      const dept = emp.department || 'Unassigned';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    
    return Object.entries(deptCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredEmployees]);

  // Calculate Age Distribution
  const ageDistribution = useMemo(() => {
    const ageGroups: Record<string, { male: number; female: number; other: number }> = {
      '20-30': { male: 0, female: 0, other: 0 },
      '31-40': { male: 0, female: 0, other: 0 },
      '41-50': { male: 0, female: 0, other: 0 },
      '50+':   { male: 0, female: 0, other: 0 },
    };

    filteredEmployees.filter(e => e.status === 'active').forEach(emp => {
      if (emp.dateOfBirth) {
        const age = differenceInCalendarYears(new Date(), new Date(emp.dateOfBirth));
        const bucket = age <= 30 ? '20-30' : age <= 40 ? '31-40' : age <= 50 ? '41-50' : '50+';
        const gender = (emp.gender || '').toLowerCase();
        if (gender === 'male') ageGroups[bucket].male++;
        else if (gender === 'female') ageGroups[bucket].female++;
        else ageGroups[bucket].other++;
      }
    });

    return Object.entries(ageGroups).map(([name, counts]) => ({
      name,
      Male: counts.male,
      Female: counts.female,
      Other: counts.other,
      total: counts.male + counts.female + counts.other,
    }));
  }, [filteredEmployees]);

  // Calculate Average Age
  const averageAge = useMemo(() => {
    const activeEmployees = filteredEmployees.filter(e => {
      if (e.status !== 'active' || !e.dateOfBirth) return false;
      const d = new Date(e.dateOfBirth);
      return !isNaN(d.getTime());
    });
    if (activeEmployees.length === 0) return 0;
    
    const totalAge = activeEmployees.reduce((sum, emp) => {
      const age = differenceInCalendarYears(new Date(), new Date(emp.dateOfBirth!));
      return sum + (isNaN(age) ? 0 : age);
    }, 0);
    
    const result = Math.round(totalAge / activeEmployees.length);
    return isNaN(result) ? 0 : result;
  }, [filteredEmployees]);

  // Calculate Tenure Distribution
  const tenureDistribution = useMemo(() => {
    const tenureGroups = {
      '0-1 yr': 0,
      '1-3 yrs': 0,
      '3-5 yrs': 0,
      '5+ yrs': 0
    };
    
    filteredEmployees.filter(e => e.status === 'active').forEach(emp => {
      if (emp.dateOfJoining) {
        const years = differenceInYears(new Date(), new Date(emp.dateOfJoining));
        if (years < 1) tenureGroups['0-1 yr']++;
        else if (years < 3) tenureGroups['1-3 yrs']++;
        else if (years < 5) tenureGroups['3-5 yrs']++;
        else tenureGroups['5+ yrs']++;
      }
    });
    
    return Object.entries(tenureGroups).map(([name, value]) => ({ name, value }));
  }, [filteredEmployees]);

  // Calculate Average Tenure
  const averageTenure = useMemo(() => {
    if (!filteredEmployees || filteredEmployees.length === 0) return "0.0";
    
    const activeEmployees = filteredEmployees.filter(e => {
      if (e.status !== 'active' || !e.dateOfJoining) return false;
      const d = new Date(e.dateOfJoining);
      return !isNaN(d.getTime());
    });
    if (activeEmployees.length === 0) return "0.0";
    
    const totalMonths = activeEmployees.reduce((sum, emp) => {
      const months = differenceInMonths(new Date(), new Date(emp.dateOfJoining!));
      return sum + (isNaN(months) ? 0 : months);
    }, 0);
    
    const avgMonths = totalMonths / activeEmployees.length;
    const result = avgMonths / 12;
    return isNaN(result) ? "0.0" : result.toFixed(1);
  }, [filteredEmployees]);

  // Chart colors
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const stats = [
    { 
      label: 'Total Headcount', 
      value: filteredStats.totalHeadcount.toString(), 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400',
      trend: filteredStats.trend,
      details: [
        { label: 'Male', value: genderStats.male, color: 'text-blue-600' },
        { label: 'Female', value: genderStats.female, color: 'text-pink-600' }
      ]
    },
    { 
      label: 'Recent Joined', 
      value: recentJoinedCount.toString(), 
      subValue: fromDate || toDate ? 'In selected range' : 'This month',
      icon: UserPlus, 
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      label: 'Exits', 
      value: (exitStats.inNoticePeriod + exitStats.alreadyExited).toString(),
      attritionRate: filteredStats.attritionRate,
      icon: TrendingUp, 
      color: 'text-red-600 dark:text-red-400',
      details: [
        { label: 'Notice Period', value: exitStats.inNoticePeriod, color: 'text-orange-600' },
        { label: 'Exited', value: exitStats.alreadyExited, color: 'text-red-600' }
      ]
    },
    { 
      label: 'PIP Count', 
      value: pipCount.toString(),
      subValue: 'Active PIPs',
      icon: AlertCircle, 
      color: 'text-orange-600 dark:text-orange-400'
    },
  ];

  // Icon mapping for leave types
  const iconMap: Record<string, any> = {
    Palmtree,
    Plane,
    Heart,
    Award,
    Baby,
    Briefcase,
    AlertCircle,
    Sparkles,
    Circle,
    Calendar,
  };

  // Get dynamic leave balance with used/pending calculations
  const dynamicLeaveBalance = leaveBalance?.leaveTypes || [];

  // Calculate total stats
  const totalStats = {
    allocated: dynamicLeaveBalance.reduce((sum, lt) => sum + (lt.allocated || 0), 0),
    available: dynamicLeaveBalance.reduce((sum, lt) => sum + (lt.available || 0), 0),
    used: dynamicLeaveBalance.reduce((sum, lt) => sum + (lt.used || 0), 0),
    pending: dynamicLeaveBalance.reduce((sum, lt) => sum + (lt.pending || 0), 0),
  };

  const leaveBalances = [
    { type: 'Approved Leaves', balance: leaves.filter(l => l.status === 'approved').length, total: 60 },
    { type: 'Pending Approvals', balance: leaves.filter(l => l.status === 'pending').length, total: 15 },
    { type: 'Rejected Requests', balance: leaves.filter(l => l.status === 'rejected').length, total: 10 },
    { type: 'On Leave Today', balance: 8, total: 20 },
  ];

  // Separate today's and upcoming birthdays (already done by the store)
  const todayBirthdays = birthdays.filter(b => b.isToday);
  const upcomingBirthdays = birthdays.filter(b => b.isUpcoming);

  // Employee DataTable Helper Functions
  // Calculate Acuvate Experience (Company Experience from Joining Date)
  const calculateAcuvateExp = (dateOfJoining: string) => {
    try {
      if (!dateOfJoining || dateOfJoining.trim() === '') {
        return { years: 0, months: 0 };
      }

      const joinDate = parseISO(dateOfJoining);
      
      if (isNaN(joinDate.getTime())) {
        return { years: 0, months: 0 };
      }

      const now = new Date();
      const years = differenceInYears(now, joinDate);
      const months = differenceInMonths(now, joinDate) % 12;
      
      return { years, months };
    } catch {
      return { years: 0, months: 0 };
    }
  };

  // Get Previous Experience from user profile
  const getPreviousExp = (previousExperience?: { years?: number; months?: number }) => {
    const years = previousExperience?.years || 0;
    const months = previousExperience?.months || 0;
    return { years, months };
  };

  // Calculate Total Experience (Acuvate + Previous)
  const calculateTotalExp = (dateOfJoining: string, previousExperience?: { years?: number; months?: number }) => {
    try {
      const acuvate = calculateAcuvateExp(dateOfJoining);
      const previous = getPreviousExp(previousExperience);
      
      const totalMonths = (acuvate.years * 12 + acuvate.months) + (previous.years * 12 + previous.months);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      
      return { years, months };
    } catch {
      return { years: 0, months: 0 };
    }
  };

  const formatExperience = (years: number, months: number) => {
    if (years === 0 && months === 0) return 'N/A';
    if (years === 0) return `${months}m`;
    if (months === 0) return `${years}y`;
    return `${years}y ${months}m`;
  };

  const formatDate = (dateString: string | undefined | null, formatStr: string = 'dd MMM yyyy'): string => {
    try {
      if (!dateString || dateString.trim() === '') {
        return 'N/A';
      }
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return format(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  // Define table columns for employee directory
  const employeeTableColumns: DataTableColumn<any>[] = [
    {
      key: 'employeeId',
      label: 'Employee',
      sortable: true,
      align: 'left',
      width: '240px',
      sticky: 'left',
      render: (_, employee) => (
        <div className="flex items-center gap-2.5">
          <EmployeeAvatar employee={employee} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-sm leading-tight truncate">{employee.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{employee.designation || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeIdText',
      label: 'Employee ID',
      sortable: false,
      align: 'left',
      width: '120px',
      render: (_, employee) => <span className="text-sm font-mono text-muted-foreground">{employee.employeeId}</span>,
    },
    {
      key: 'email',
      label: 'Email ID',
      sortable: true,
      align: 'left',
      width: '220px',
      render: (value) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      key: 'phone',
      label: 'Phone Number',
      sortable: false,
      align: 'left',
      width: '130px',
      hidden: true,
      render: (value) => <span className="text-sm text-muted-foreground">{value || 'N/A'}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      align: 'left',
      width: '150px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
      align: 'left',
      width: '100px',
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => <span className="text-sm">{value ? formatDate(value) : 'N/A'}</span>,
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      align: 'left',
      width: '80px',
      render: (_, employee) => {
        if (!employee.dateOfBirth) return <span className="text-sm text-muted-foreground">N/A</span>;
        const age = differenceInCalendarYears(new Date(), new Date(employee.dateOfBirth));
        return <span className="text-sm font-medium">{age}</span>;
      },
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => (
        <Badge variant="secondary" className="text-xs">
          {value || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'dateOfJoining',
      label: 'Hire Date',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => <span className="text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'workerType',
      label: 'Employment Type',
      sortable: false,
      align: 'left',
      width: '140px',
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value || 'Full-time'}
        </Badge>
      ),
    },
    {
      key: 'reportingManager',
      label: 'Reporting Manager',
      sortable: true,
      align: 'left',
      width: '180px',
      render: (_, employee) => (
        <span className="text-sm">{employee.reportingManager?.name || 'N/A'}</span>
      ),
    },
    // Hidden columns (available via toggle)
    {
      key: 'nationality',
      label: 'Nationality',
      sortable: true,
      align: 'left',
      width: '120px',
      hidden: true,
      render: (value) => <span className="text-sm">{value || 'N/A'}</span>,
    },
    {
      key: 'personalEmail',
      label: 'Personal Email',
      sortable: true,
      align: 'left',
      width: '220px',
      hidden: true,
      render: (value) => <span className="text-sm text-muted-foreground">{value || 'N/A'}</span>,
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      align: 'left',
      width: '250px',
      hidden: true,
      render: (value) => <span className="text-sm">{value || 'N/A'}</span>,
    },
    {
      key: 'currentCTC',
      label: 'Current CTC',
      sortable: true,
      align: 'right',
      width: '130px',
      hidden: true,
      render: (value) => (
        <span className="text-sm font-medium">
          {value ? `₹${(value / 100000).toFixed(2)}L` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'previousCTC',
      label: 'Previous CTC',
      sortable: true,
      align: 'right',
      width: '130px',
      hidden: true,
      render: (value) => (
        <span className="text-sm font-medium">
          {value ? `₹${(value / 100000).toFixed(2)}L` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'totalExp',
      label: 'Total Experience',
      sortable: true,
      align: 'left',
      width: '150px',
      hidden: true,
      render: (_, employee) => {
        const exp = calculateTotalExp(employee.dateOfJoining, employee.previousExperience);
        return (
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatExperience(exp.years, exp.months)}
          </span>
        );
      },
    },
    {
      key: 'acuvateExp',
      label: 'Acuvate Experience',
      sortable: true,
      align: 'left',
      width: '160px',
      hidden: true,
      render: (_, employee) => {
        const exp = calculateAcuvateExp(employee.dateOfJoining);
        return (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {formatExperience(exp.years, exp.months)}
          </span>
        );
      },
    },
  ];

  // Define table actions
  const employeeTableActions: DataTableAction<any>[] = [
    {
      label: 'View Profile',
      onClick: (employee) => handleViewEmployee(employee.employeeId),
    },
    {
      label: 'Edit Employee',
      onClick: (employee) => handleEditEmployee(employee),
    },
    {
      label: 'Mark Inactive',
      onClick: (employee) => {
        setEmployeeToInactivate(employee);
        setShowInactiveDialog(true);
      },
      condition: (employee) => employeeTab === 'active',
    },
    {
      label: 'Move to Active',
      onClick: (employee) => {
        setEmployeeToActivate(employee);
        setShowActivateDialog(true);
      },
      condition: (employee) => employeeTab === 'inactive',
    },
  ];

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(employees.map(emp => emp.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(employees.map(emp => emp.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [employees]);

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Consultant', 'Intern'];

  // Filter and search employees for data table (includes tab and search filters)
  const filteredAndSearchedEmployees = useMemo(() => {
    // First filter by tab (active/inactive)
    let filtered = employees.filter(emp => {
      if (employeeTab === 'active') {
        return emp.status === 'active';
      } else {
        return emp.status === 'inactive';
      }
    });

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employeeId?.toLowerCase().includes(query) ||
        emp.name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query) ||
        emp.designation?.toLowerCase().includes(query) ||
        emp.location?.toLowerCase().includes(query) ||
        emp.phone?.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(emp => selectedDepartments.includes(emp.department));
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(emp => selectedLocations.includes(emp.location));
    }

    // Employment type filter
    if (selectedEmploymentTypes.length > 0) {
      filtered = filtered.filter(emp => {
        const empType = emp.workerType || 'Full-time';
        return selectedEmploymentTypes.includes(empType);
      });
    }

    // Experience range filter
    if (selectedExperienceRange) {
      filtered = filtered.filter(emp => {
        const exp = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        const totalYears = exp.years;
        switch (selectedExperienceRange) {
          case '0-2': return totalYears <= 2;
          case '3-5': return totalYears >= 3 && totalYears <= 5;
          case '6-10': return totalYears >= 6 && totalYears <= 10;
          case '10+': return totalYears > 10;
          default: return true;
        }
      });
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      filtered = filtered.filter(emp => {
        const salary = emp.currentCTC || 0;
        const min = salaryMin ? parseFloat(salaryMin) : 0;
        const max = salaryMax ? parseFloat(salaryMax) : Infinity;
        return salary >= min && salary <= max;
      });
    }

    return filtered;
  }, [employees, employeeTab, searchQuery, selectedDepartments, selectedLocations, selectedEmploymentTypes, selectedExperienceRange, salaryMin, salaryMax]);

  // Sort employees
  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredAndSearchedEmployees];
    
    sorted.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'employeeId':
          aValue = a.employeeId?.toLowerCase() || '';
          bValue = b.employeeId?.toLowerCase() || '';
          break;
        case 'department':
          aValue = a.department?.toLowerCase() || '';
          bValue = b.department?.toLowerCase() || '';
          break;
        case 'designation':
          aValue = a.designation?.toLowerCase() || '';
          bValue = b.designation?.toLowerCase() || '';
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'dateOfJoining':
          try {
            const dateA = a.dateOfJoining ? parseISO(a.dateOfJoining) : new Date(0);
            const dateB = b.dateOfJoining ? parseISO(b.dateOfJoining) : new Date(0);
            aValue = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
            bValue = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          } catch {
            aValue = 0;
            bValue = 0;
          }
          break;
        case 'acuvateExp':
          const acuvateA = calculateAcuvateExp(a.dateOfJoining);
          const acuvateB = calculateAcuvateExp(b.dateOfJoining);
          aValue = acuvateA.years * 12 + acuvateA.months;
          bValue = acuvateB.years * 12 + acuvateB.months;
          break;
        case 'previousExp':
          const prevA = getPreviousExp(a.previousExperience);
          const prevB = getPreviousExp(b.previousExperience);
          aValue = prevA.years * 12 + prevA.months;
          bValue = prevB.years * 12 + prevB.months;
          break;
        case 'totalExp':
          const totalA = calculateTotalExp(a.dateOfJoining, a.previousExperience);
          const totalB = calculateTotalExp(b.dateOfJoining, b.previousExperience);
          aValue = totalA.years * 12 + totalA.months;
          bValue = totalB.years * 12 + totalB.months;
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredAndSearchedEmployees, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedEmployees.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedEmployees, currentPage]);

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  //Clear all filters
  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedEmploymentTypes([]);
    setSelectedExperienceRange('');
    setSalaryMin('');
    setSalaryMax('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedDepartments.length > 0 || selectedLocations.length > 0 || 
                           selectedEmploymentTypes.length > 0 || selectedExperienceRange !== '' || 
                           salaryMin !== '' || salaryMax !== '' || 
                           searchQuery.trim() !== '';

  // Define all available columns for export
  const availableColumns = [
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'email', label: 'Email ID' },
    { id: 'phone', label: 'Phone Number' },
    { id: 'name', label: 'Name' },
    { id: 'designation', label: 'Designation' },
    { id: 'department', label: 'Department' },
    { id: 'location', label: 'Location' },
    { id: 'gender', label: 'Gender' },
    { id: 'dateOfBirth', label: 'Date of Birth' },
    { id: 'age', label: 'Age' },
    { id: 'maritalStatus', label: 'Marital Status' },
    { id: 'dateOfJoining', label: 'Hire Date' },
    { id: 'employmentType', label: 'Employment Type' },
    { id: 'reportingManager', label: 'Reporting Manager' },
    { id: 'nationality', label: 'Nationality' },
    { id: 'personalEmail', label: 'Personal Email' },
    { id: 'address', label: 'Address' },
    { id: 'currentCTC', label: 'Current CTC' },
    { id: 'previousCTC', label: 'Previous CTC' },
    { id: 'totalExp', label: 'Total Experience' },
    { id: 'acuvateExp', label: 'Acuvate Experience' },
    { id: 'previousExp', label: 'Previous Experience' },
    { id: 'businessUnit', label: 'Business Unit' },
  ];

  const toggleExportColumn = (columnId: string) => {
    setSelectedExportColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const getColumnValue = (emp: any, columnId: string): string => {
    switch (columnId) {
      case 'employeeId':
        return emp.employeeId || '';
      case 'name':
        return emp.name || '';
      case 'email':
        return emp.email || '';
      case 'phone':
        return emp.phone || 'N/A';
      case 'department':
        return emp.department || '';
      case 'designation':
        return emp.designation || '';
      case 'location':
        return emp.location || '';
      case 'gender':
        return emp.gender || 'N/A';
      case 'dateOfBirth':
        return emp.dateOfBirth ? formatDate(emp.dateOfBirth) : 'N/A';
      case 'age':
        if (!emp.dateOfBirth) return 'N/A';
        return differenceInCalendarYears(new Date(), new Date(emp.dateOfBirth)).toString();
      case 'maritalStatus':
        return emp.maritalStatus || 'N/A';
      case 'dateOfJoining':
        return formatDate(emp.dateOfJoining);
      case 'employmentType':
        return emp.workerType || 'Full-time';
      case 'reportingManager':
        return emp.reportingManager?.name || 'N/A';
      case 'nationality':
        return emp.nationality || 'N/A';
      case 'personalEmail':
        return emp.personalEmail || 'N/A';
      case 'address':
        return emp.address || 'N/A';
      case 'currentCTC':
        return emp.currentCTC ? `₹${(emp.currentCTC / 100000).toFixed(2)}L` : 'N/A';
      case 'previousCTC':
        return emp.previousCTC ? `₹${(emp.previousCTC / 100000).toFixed(2)}L` : 'N/A';
      case 'acuvateExp':
        const acuvate = calculateAcuvateExp(emp.dateOfJoining);
        return formatExperience(acuvate.years, acuvate.months);
      case 'previousExp':
        const previous = getPreviousExp(emp.previousExperience);
        return formatExperience(previous.years, previous.months);
      case 'totalExp':
        const total = calculateTotalExp(emp.dateOfJoining, emp.previousExperience);
        return formatExperience(total.years, total.months);
      case 'businessUnit':
        return emp.businessUnit || 'N/A';
      default:
        return '';
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = selectedExportColumns.map(colId => 
      availableColumns.find(col => col.id === colId)?.label || colId
    );
    
    const rows = sortedEmployees.map(emp => 
      selectedExportColumns.map(colId => getColumnValue(emp, colId))
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Employee data exported to CSV');
    setShowExportColumnsDialog(false);
  };

  const exportToExcel = () => {
    toast.info('Excel export will be available soon. Using CSV for now.');
    exportToCSV();
  };

  const exportToPDF = () => {
    toast.info('PDF export will be available soon. Using CSV for now.');
    exportToCSV();
  };

  // View employee profile
  const handleViewEmployee = (employeeId: string) => {
    sessionStorage.setItem('profileReferrer', '/hr/workforce');
    navigate(`/employee/profile/${employeeId}`);
  };

  // Edit employee
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowAddEmployeeModal(true);
  };

  // Mark employee as inactive
  const handleMarkInactive = async () => {
    if (!employeeToInactivate) return;
    
    try {
      await useEmployeeStore.getState().markInactive(employeeToInactivate._id);
      toast.success(`${employeeToInactivate.name} marked as inactive`);
      setShowInactiveDialog(false);
      setEmployeeToInactivate(null);
      fetchEmployees();
      fetchWorkforceStats();
      fetchPIPCount();
    } catch (error) {
      console.error('Failed to mark employee as inactive:', error);
      toast.error('Failed to mark employee as inactive');
    }
  };

  // Activate employee
  const handleActivateEmployee = async () => {
    if (!employeeToActivate) return;
    
    try {
      await useEmployeeStore.getState().activateEmployee(employeeToActivate._id);
      toast.success(`${employeeToActivate.name} moved to active`);
      setShowActivateDialog(false);
      setEmployeeToActivate(null);
      fetchEmployees();
      fetchWorkforceStats();
      fetchPIPCount();
    } catch (error) {
      console.error('Failed to activate employee:', error);
      toast.error('Failed to activate employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border p-6">
        <div className="relative z-10">
          {/* Greeting & User Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 border-2">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {greeting.text}, {user?.name}! {greeting.emoji}
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300">
                    HR
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Dashboard
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Management Section */}
      {permissions.canEditEmployees && (
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">Workforce Summary</h2>
              <p className="text-sm text-muted-foreground">Filter by date range and manage employees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
                {/* Filter Button */}
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilterPopover ? 'Hide Filters' : 'Show Filters'}
                </Button>

                <Button variant="outline" onClick={() => setShowBulkUploadModal(true)} className="h-10">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button onClick={() => setShowAddEmployeeModal(true)} className="h-10">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
        </div>
      )}

      {/* Active Filter Chips — shown when any filter is applied */}
      {permissions.canEditEmployees && hasAnyFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 mr-1">Active Filters:</span>

          {fromDate && (
            <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
              <Calendar className="h-3 w-3" />
              From: {format(fromDate, 'MMM dd, yyyy')}
              <button onClick={() => setFromDate(undefined)} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {toDate && (
            <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
              <Calendar className="h-3 w-3" />
              To: {format(toDate, 'MMM dd, yyyy')}
              <button onClick={() => setToDate(undefined)} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {selectedDepartments.map(d => (
            <Badge key={d} variant="secondary" className="gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
              Dept: {d}
              <button onClick={() => setSelectedDepartments(prev => prev.filter(x => x !== d))} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {selectedLocations.map(l => (
            <Badge key={l} variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
              Loc: {l}
              <button onClick={() => setSelectedLocations(prev => prev.filter(x => x !== l))} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {selectedEmploymentTypes.map(t => (
            <Badge key={t} variant="secondary" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
              Type: {t}
              <button onClick={() => setSelectedEmploymentTypes(prev => prev.filter(x => x !== t))} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {selectedExperienceRange && (
            <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
              Exp: {selectedExperienceRange} yrs
              <button onClick={() => setSelectedExperienceRange('')} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {(salaryMin || salaryMax) && (
            <Badge variant="secondary" className="gap-1 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs">
              Salary: {salaryMin ? `₹${Number(salaryMin).toLocaleString()}` : '0'} – {salaryMax ? `₹${Number(salaryMax).toLocaleString()}` : '∞'}
              <button onClick={() => { setSalaryMin(''); setSalaryMax(''); }} className="ml-1 hover:text-red-600"><X className="h-3 w-3" /></button>
            </Badge>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => { clearDateFilters(); clearAllFilters(); setFilterApplied(false); setShowFilterPopover(false); }}
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Expandable Filter Section */}
      {permissions.canEditEmployees && showFilterPopover && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Employees</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowFilterPopover(false)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date Pickers */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select from date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={fromDate}
                      onSelect={(date) => {
                        setFromDate(date);
                        setShowFromCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select to date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date);
                        setShowToCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Department Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                <Select
                  value={selectedDepartments[0] || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedDepartments([]);
                    } else {
                      setSelectedDepartments([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                <Select
                  value={selectedLocations[0] || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedLocations([]);
                    } else {
                      setSelectedLocations([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employment Type</label>
                <Select
                  value={selectedEmploymentTypes[0] || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedEmploymentTypes([]);
                    } else {
                      setSelectedEmploymentTypes([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {employmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Experience Range Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</label>
                <Select
                  value={selectedExperienceRange || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedExperienceRange('');
                    } else {
                      setSelectedExperienceRange(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select experience range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience Levels</SelectItem>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Salary Range Filter - Min */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salary Min (₹)</label>
                <Input
                  type="number"
                  placeholder="Enter minimum salary"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Salary Range Filter - Max */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salary Max (₹)</label>
                <Input
                  type="number"
                  placeholder="Enter maximum salary"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Selected Range Display */}
            {(fromDate || toDate) && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {fromDate && toDate
                    ? `Date Range: ${format(fromDate, 'MMM dd, yyyy')} → ${format(toDate, 'MMM dd, yyyy')}`
                    : fromDate
                    ? `From: ${format(fromDate, 'MMM dd, yyyy')}`
                    : `Until: ${format(toDate!, 'MMM dd, yyyy')}`}
                </p>
              </div>
            )}

          </div>
        </Card>
      )}

      {/* Stats Cards - 5 in a single row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* 1. Total Employees */}
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Employees</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
              {filteredEmployees.filter(e => e.status === 'active').length}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><UserPlus className="h-3 w-3" /> New Hires</span>
                <span className="font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">{newHiresThisMonth}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Exits</span>
                <span className="font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">{exitsThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Attrition Rate */}
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attrition Rate</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-3">{attritionRate}%</div>
            <Progress value={parseFloat(attritionRate)} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span><span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Demographics */}
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Demographics</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-pink-100 dark:bg-pink-900/30">
                <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={[{ name: 'Male', value: genderStats.male }, { name: 'Female', value: genderStats.female }]}
                      cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2} dataKey="value">
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ec4899" />
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}`, '']} contentStyle={{ fontSize: 10 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-blue-50 dark:bg-blue-950/30 flex-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">Male</div>
                    <div className="text-muted-foreground">{genderStats.male} ({genderStats.male + genderStats.female > 0 ? ((genderStats.male / (genderStats.male + genderStats.female)) * 100).toFixed(0) : 0}%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-pink-50 dark:bg-pink-950/30 flex-1">
                  <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-pink-700 dark:text-pink-300">Female</div>
                    <div className="text-muted-foreground">{genderStats.female} ({genderStats.male + genderStats.female > 0 ? ((genderStats.female / (genderStats.male + genderStats.female)) * 100).toFixed(0) : 0}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Average Age */}
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Average Age</span>
              <span className="text-lg font-bold text-pink-600">{averageAge} yrs</span>
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution} margin={{ top: 2, right: 4, left: 8, bottom: 14 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 8 }} width={20} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 9 }}
                    formatter={(value: number, name: string, props: any) => {
                      const total = props.payload?.total || 1;
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                      return [`${value} (${pct}%)`, name];
                    }} />
                  <Bar dataKey="Male"   stackId="a" fill="#0EA5E9" radius={[0,0,0,0]} />
                  <Bar dataKey="Female" stackId="a" fill="#F43F5E" radius={[0,0,0,0]} />
                  <Bar dataKey="Other"  stackId="a" fill="#A855F7" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px]">
              {[{ label: 'Male', color: '#0EA5E9' }, { label: 'Female', color: '#F43F5E' }, { label: 'Other', color: '#A855F7' }].map(g => (
                <div key={g.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: g.color }} />
                  <span className="text-muted-foreground">{g.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Average Tenure */}
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Tenure</span>
              <span className="text-lg font-bold text-purple-600">{averageTenure} yrs</span>
            </div>
            <div className="h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={tenureDistribution} cx="50%" cy="50%" outerRadius={46} paddingAngle={2} dataKey="value"
                    label={({ value }) => value > 0 ? value : ''} labelLine={false}>
                    {tenureDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'][index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ fontSize: 10 }} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] mt-1">
              {tenureDistribution.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: ['#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'][idx] }} />
                  <span className="text-muted-foreground truncate">{t.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Chart - Full Width (hidden when filters are active) */}
      {!hasAnyFilters && (
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Department Count</CardTitle>
              <CardDescription className="text-xs mt-1">Top 10 departments by employee count</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{departmentData.length} Depts</span>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ top: 2, right: 40, left: 4, bottom: 2 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }}
                    tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(value) => [`${value}`, 'Employees']} />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" style={{ fontSize: 9, fill: '#6b7280' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee DataTable - Only for HR Admin and Super Admin */}
      {permissions.canEditEmployees && (
        <Card className="overflow-hidden" data-table="employee-directory">
          <CardHeader className="bg-muted/30 pb-0 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Employee Directory</CardTitle>
                <CardDescription className="mt-1">
                  {sortedEmployees.length} {sortedEmployees.length === 1 ? 'employee' : 'employees'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
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
                      {employeeTableColumns.map((column) => (
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
                    <DropdownMenuItem onClick={() => setShowExportColumnsDialog(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export to CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowExportColumnsDialog(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export to Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowExportColumnsDialog(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export to PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
          </CardHeader>
          
          {/* Tabs for Active/Inactive Employees */}
          <div className="px-6 pt-4 pb-0 bg-muted/20">
            <div className="flex gap-1 border-b border-border">
              <button
                onClick={() => setEmployeeTab('active')}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-colors relative ${
                  employeeTab === 'active'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                Active Employees ({employees.filter(e => e.status === 'active').length})
                {employeeTab === 'active' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                onClick={() => setEmployeeTab('inactive')}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-colors relative ${
                  employeeTab === 'inactive'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserX className="h-4 w-4" />
                Inactive Employees ({employees.filter(e => e.status === 'inactive').length})
                {employeeTab === 'inactive' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Table */}
            <DataTable
              data={sortedEmployees}
              columns={employeeTableColumns.map(col => ({ 
                ...col, 
                hidden: columnVisibility[col.key] !== undefined 
                  ? columnVisibility[col.key] === false 
                  : (col.hidden || false)
              }))}
              actions={employeeTableActions}
              searchable={false}
              hideColumnToggle={true}
              pageSize={15}
              emptyMessage={hasActiveFilters 
                ? 'No employees found. Try adjusting your search filters to see more results.'
                : employeeTab === 'active' 
                  ? 'No active employees in the system yet.'
                  : 'No inactive employees in the system.'}
              onRowClick={(employee) => handleViewEmployee(employee.employeeId)}
            />
          </CardContent>
        </Card>
      )}

      {/* Single Column Layout */}
      <div className="space-y-8">
        {/* Content removed: Holiday Calendar, Team Leave Details, Web Check-In, Leave Statistics, Team Celebrations */}
      </div>

      {/* Modals */}
      <AddHolidayModal
        open={showHolidayModal}
        onOpenChange={setShowHolidayModal}
      />

      <EditHolidayModal
        open={showEditHolidayModal}
        onOpenChange={setShowEditHolidayModal}
        holiday={selectedHoliday}
      />

      {/* All Holidays Modal - Modern Enterprise Style */}
      <HolidaysDialog
        open={showAllHolidaysModal}
        onOpenChange={setShowAllHolidaysModal}
        holidays={allHolidays}
        onEditHoliday={handleEditHoliday}
        showEditButton={true}
      />

      {/* Reactions Drawer */}
      <Sheet open={reactionDialogOpen} onOpenChange={setReactionDialogOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Reactions
              </SheetTitle>
              <SheetDescription>
                {selectedAnnouncementReactions?.title || 'See who reacted to this post'}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
          
          {getSelectedAnnouncementReactions().length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">No reactions yet</p>
              <p className="text-sm">Be the first to react!</p>
            </div>
          ) : (
            <div className="mt-4">
              {/* Reaction Tabs */}
              <Tabs value={activeReactionTab} onValueChange={setActiveReactionTab} className="w-full">
                <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                  <TabsTrigger 
                    value="all" 
                    className="flex-1 min-w-[60px] data-[state=active]:bg-background"
                  >
                    All ({getSelectedAnnouncementReactions().length})
                  </TabsTrigger>
                  {groupReactionsByEmoji(getSelectedAnnouncementReactions()).map((group) => (
                    <TabsTrigger 
                      key={group.emoji} 
                      value={group.emoji}
                      className="flex-1 min-w-[50px] data-[state=active]:bg-background"
                    >
                      {group.emoji} {group.users.length}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* All Reactions Tab */}
                <TabsContent value="all" className="mt-4 space-y-2">
                  {getSelectedAnnouncementReactions().map((reaction, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(reaction.userName)} flex items-center justify-center text-white text-sm font-semibold`}>
                        {getInitials(reaction.userName)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reaction.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reaction.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-2xl">{reaction.emoji}</span>
                    </div>
                  ))}
                </TabsContent>
                
                {/* Individual Emoji Tabs */}
                {groupReactionsByEmoji(getSelectedAnnouncementReactions()).map((group) => (
                  <TabsContent key={group.emoji} value={group.emoji} className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <span className="text-3xl">{group.emoji}</span>
                      <span className="font-semibold text-lg">{group.label}</span>
                      <Badge variant="secondary" className="ml-auto">{group.users.length}</Badge>
                    </div>
                    {group.users.map((userReaction, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(userReaction.userName)} flex items-center justify-center text-white text-sm font-semibold`}>
                          {getInitials(userReaction.userName)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{userReaction.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(userReaction.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Poll Voters Drawer - HR can see who voted for each option */}
      <Sheet open={pollVotersDrawerOpen} onOpenChange={setPollVotersDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Poll Voters
              </SheetTitle>
              <SheetDescription>
                {selectedPollData?.pollTitle}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
          
          {selectedPollData && (
            <div className="mt-6">
              {/* Poll Summary */}
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Votes</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {selectedPollData?.totalVotes || 0}
                  </Badge>
                </div>
              </div>

              {selectedPollData?.isAnonymous ? (
                <div className="p-6 text-center bg-muted/30 rounded-lg">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Anonymous Poll</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Voter identities are hidden for this poll.
                  </p>
                </div>
              ) : (
                <Tabs value={activePollTab} onValueChange={setActivePollTab} className="w-full">
                  <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                    {selectedPollData?.options?.map((option, index) => (
                      <TabsTrigger 
                        key={option.id} 
                        value={`option-${index}`}
                        className="flex-1 min-w-[80px] text-xs py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        Option {index + 1}
                        <Badge variant="outline" className="ml-1 text-[10px] px-1">
                          {option.votes}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {selectedPollData?.options?.map((option, index) => (
                    <TabsContent key={option.id} value={`option-${index}`} className="mt-4">
                      {/* Option Text */}
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Option {index + 1}</p>
                        <p className="font-semibold">{option.text}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                        </p>
                      </div>

                      {/* Voters List */}
                      {option.voters.length === 0 ? (
                        <div className="p-4 text-center bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">No votes for this option</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4" />
                            {option.voters.length} {option.voters.length === 1 ? 'person' : 'people'} voted
                          </p>
                          {option.voters.map((voterId, voterIndex) => {
                            const voterName = getEmployeeName(voterId);
                            return (
                              <div 
                                key={voterIndex} 
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(voterName)} flex items-center justify-center text-white text-sm font-semibold`}>
                                  {getInitials(voterName)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{voterName}</p>
                                  <p className="text-xs text-muted-foreground">{voterId}</p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Employee Modal - Only for HR Admin and Super Admin */}
      {permissions.canEditEmployees && (
        <AddEditEmployeeModal 
          open={showAddEmployeeModal}
          onClose={() => {
            setShowAddEmployeeModal(false);
            setEditingEmployee(null);
          }}
          employee={editingEmployee}
          onSuccess={() => {
            fetchEmployees();
            fetchWorkforceStats();
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Bulk Upload Modal - Only for HR Admin and Super Admin */}
      {permissions.canEditEmployees && (
        <BulkUploadModal 
          open={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            fetchEmployees();
            fetchWorkforceStats();
          }}
        />
      )}

      {/* Export Column Selection Sheet */}
      <Sheet open={showExportColumnsDialog} onOpenChange={setShowExportColumnsDialog}>
        <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Select Columns to Export
              </SheetTitle>
              <SheetDescription>
                Choose which columns you want to include in the export file. Selected: {selectedExportColumns.length} of {availableColumns.length}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedExportColumns(availableColumns.map(col => col.id))}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedExportColumns([])}
              >
                Deselect All
              </Button>
            </div>

            <div className="space-y-2">
              {availableColumns.map(column => (
                <div key={column.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg border border-transparent hover:border-border transition-colors">
                  <Checkbox
                    id={`export-col-${column.id}`}
                    checked={selectedExportColumns.includes(column.id)}
                    onCheckedChange={() => toggleExportColumn(column.id)}
                  />
                  <label
                    htmlFor={`export-col-${column.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setShowExportColumnsDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={exportToCSV}
              disabled={selectedExportColumns.length === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedExportColumns.length})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mark Inactive Confirmation Dialog */}
      <AlertDialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Employee as Inactive</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark <strong>{employeeToInactivate?.name}</strong> as inactive? 
              This will remove them from active employee lists and they will no longer have access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowInactiveDialog(false);
              setEmployeeToInactivate(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkInactive}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to Active Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Employee to Active</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move <strong>{employeeToActivate?.name}</strong> to active status? 
              This will restore their access to the system and they will appear in active employee lists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowActivateDialog(false);
              setEmployeeToActivate(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleActivateEmployee}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
