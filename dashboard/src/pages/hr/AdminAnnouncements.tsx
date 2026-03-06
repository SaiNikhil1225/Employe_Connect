import { useState, useEffect, useMemo } from 'react';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useAuthStore } from '@/store/authStore';
import type { Announcement, PollOption } from '@/store/announcementStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Megaphone, 
  Trash2, 
  Search, 
  Eye, 
  BarChart3, 
  Calendar,
  AlertTriangle,
  MessageCircle,
  Heart,
  Pin,
  Filter,
  Pencil,
  Flame,
  ChevronDown,
  Plus,
  List,
  Grid,
  X,
  FileEdit,
  Rocket,
  Archive,
  CheckCircle2,
  Columns3,
  Download,
  FileText,
  Clock,
  Tag,
  ChevronUp,
  TrendingUp,
  Trophy,
  Sparkles,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAvatarGradient, getInitials } from '@/constants/design-system';
import { AnnouncementAnalyticsDialog } from '@/components/analytics/AnnouncementAnalyticsDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

type SortColumn = 'title' | 'type' | 'priority' | 'author' | 'date' | 'engagement' | 'status';
type SortDirection = 'asc' | 'desc' | null;
type StatusTab = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';

export function AdminAnnouncements() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { announcements, fetchAnnouncements, deleteAnnouncement, toggleLike, addComment: addAnnouncementComment, addReaction, isLoading } = useAnnouncementStore();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'announcement' | 'poll' | 'survey' | 'event'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterAuthor, setFilterAuthor] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  
  // Sort states
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // UI states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedPosts, setExpandedPosts] = useState<Record<string | number, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string | number, string>>({});
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  // Date filter states
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [trackedViews, setTrackedViews] = useState<Set<number | string>>(new Set());
  
  // Get current hour for greeting
  const currentHour = new Date().getHours();

  const trackAnnouncementView = async (announcementId: number | string) => {
    if (!user?.employeeId || trackedViews.has(announcementId)) return;
    
    try {
      setTrackedViews(prev => new Set([...prev, announcementId]));
      await fetch(`http://localhost:5000/api/announcements/${announcementId}/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          userName: user.name || user.employeeId,
          department: user.department || 'Unknown',
          role: user.role || 'Employee',
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split(' ').pop()?.split('/')[0] || 'Unknown',
          viewSource: 'dashboard'
        })
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // Reaction emojis
  const reactionEmojis = [
    { emoji: '❤️', label: 'Love' },
    { emoji: '👍', label: 'Like' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '😊', label: 'Happy' },
    { emoji: '💡', label: 'Insightful' },
    { emoji: '👏', label: 'Applause' },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Helper function to get announcement status
  const getStatus = (announcement: Announcement): StatusTab => {
    // Default to 'published' if status is not set
    if (!announcement.status) return 'published';
    if (announcement.status === 'draft') return 'draft';
    if (announcement.status === 'scheduled') return 'scheduled';
    if (announcement.status === 'archived') return 'archived';
    return 'published';
  };

  // Sort and filter announcements
  const processedAnnouncements = useMemo(() => {
    if (!announcements) return [];
    
    let filtered = [...announcements];
    
    // Filter by tab/status
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => getStatus(a) === activeTab);
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => {
        if (filterType === 'poll') {
          return a.isPoll === true;
        } else if (filterType === 'announcement') {
          return !a.isPoll;
        } else if (filterType === 'survey' || filterType === 'event') {
          // These types aren't implemented yet - show nothing for now
          // Once you add a 'type' field to Announcement, update this logic
          return false;
        }
        return true;
      });
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }
    
    // Filter by date range
    if (fromDate || toDate) {
      filtered = filtered.filter(announcement => {
        const annDate = new Date(announcement.date);
        
        if (fromDate && toDate) {
          return annDate >= fromDate && annDate <= toDate;
        } else if (fromDate) {
          return annDate >= fromDate;
        } else if (toDate) {
          return annDate <= toDate;
        }
        return true;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      if (!sortDirection) return 0;
      
      let comparison = 0;
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortColumn) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = (a.isPoll ? 'Poll' : 'Announcement').localeCompare(b.isPoll ? 'Poll' : 'Announcement');
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'engagement':
          const engagementA = (a.likes || 0) + (a.comments?.length || 0);
          const engagementB = (b.likes || 0) + (b.comments?.length || 0);
          comparison = engagementA - engagementB;
          break;
        case 'status':
          comparison = getStatus(a).localeCompare(getStatus(b));
          break;
      }
      
      return comparison * direction;
    });
    
    return filtered;
  }, [announcements, activeTab, searchQuery, filterType, filterPriority, fromDate, toDate, sortColumn, sortDirection]);

  // Sort handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn('date');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Calculate completion percentage for drafts
  const getCompletionPercent = (announcement: Announcement): number => {
    let completion = 0;
    if (announcement.title && announcement.title.length > 0) completion += 25;
    if (announcement.description && announcement.description.length >= 20) completion += 25;
    if (announcement.category) completion += 25;
    if (announcement.priority) completion += 25;
    return completion;
  };

  // Render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const toggleExpand = (postId: number | string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLike = async (announcementId: number | string) => {
    if (!user?.employeeId) return;
    
    try {
      const userName = user.name || user.email || 'Unknown User';
      console.log('Liking announcement with user details:', {
        employeeId: user.employeeId,
        userName,
        department: user.department,
        role: user.role
      });
      
      await toggleLike(announcementId, user.employeeId, {
        userName,
        department: user.department || 'Unknown',
        role: user.role || 'Employee',
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleReaction = async (announcementId: number | string, emoji: string, label: string) => {
    if (!user?.employeeId) return;
    
    try {
      await addReaction(announcementId, user.employeeId, user.name || 'Admin', emoji, label);
      toast.success(`Reacted with ${emoji}`);
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleAddComment = async (announcementId: number | string) => {
    const commentText = newComment[announcementId]?.trim();
    if (!commentText || !user) return;

    try {
      const commentData = {
        employeeId: user.employeeId || user.id,
        author: user.name || 'Admin',
        userName: user.name || 'Admin',
        department: user.department || 'Unknown',
        role: user.role || 'Employee',
        text: commentText,
        time: new Date().toISOString(),
        device: 'desktop',
      };
      
      console.log('Adding comment with data:', commentData);
      
      await addAnnouncementComment(announcementId, commentData);
      setNewComment(prev => ({ ...prev, [announcementId]: '' }));
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const isExpired = (announcement: Announcement) => {
    if (!announcement.expiresAt) return false;
    return new Date(announcement.expiresAt) < new Date();
  };

  // Filter announcements
  const filteredAnnouncements = processedAnnouncements;

  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAnnouncement) {
      await deleteAnnouncement(selectedAnnouncement.id);
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleViewClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  const getTypeBadge = (isPoll: boolean) => {
    return isPoll 
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getFilteredStats = () => {
    // Use processedAnnouncements which already has all filters applied
    const filtered = processedAnnouncements;

    // Calculate stats for filtered announcements
    return {
      totalAnnouncements: filtered.filter(a => !a.isPoll && getStatus(a) === 'published').length,
      totalPolls: filtered.filter(a => a.isPoll && getStatus(a) === 'published').length,
      highPriorityCount: filtered.filter(a => a.priority === 'high').length,
      totalEngagement: filtered.reduce((sum, a) => sum + (a.likes || 0) + (a.comments?.length || 0), 0),
      draftCount: filtered.filter(a => getStatus(a) === 'draft').length,
      publishedCount: filtered.filter(a => getStatus(a) === 'published').length,
    };
  };

  // Stats
  const filteredStats = getFilteredStats();
  const totalAnnouncements = filteredStats.totalAnnouncements;
  const totalPolls = filteredStats.totalPolls;
  const highPriorityCount = filteredStats.highPriorityCount;
  const totalEngagement = filteredStats.totalEngagement;
  const draftCount = filteredStats.draftCount;
  const publishedCount = filteredStats.publishedCount;
  const scheduledCount = processedAnnouncements.filter(a => getStatus(a) === 'scheduled').length;
  const archivedCount = processedAnnouncements.filter(a => getStatus(a) === 'archived').length;

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Type',
      'Priority',
      'Author',
      'Role',
      'Status',
      'Date',
      'Likes',
      'Comments',
      'Views'
    ];
    
    const rows = filteredAnnouncements.map(announcement => [
      announcement.id,
      announcement.title || 'Untitled',
      announcement.isPoll ? 'Poll' : 'Announcement',
      announcement.priority,
      announcement.author,
      announcement.role,
      getStatus(announcement),
      format(new Date(announcement.date), 'yyyy-MM-dd'),
      announcement.likes || 0,
      announcement.comments?.length || 0,
      announcement.viewsCount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `announcements_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Announcements exported to CSV successfully');
  };

  const exportToExcel = () => {
    toast.info('Excel export will be available soon. Using CSV for now.');
    exportToCSV();
  };

  // Define DataTable columns
  const announcementTableColumns: DataTableColumn<Announcement>[] = useMemo(() => {
    const columns: DataTableColumn<Announcement>[] = [];

    // Progress column for drafts
    if (activeTab === 'draft') {
      columns.push({
        key: 'progress',
        label: 'Progress',
        sortable: false,
        align: 'left',
        render: (_, announcement) => {
          const completion = getCompletionPercent(announcement);
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      completion === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      completion >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      completion >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      'bg-gradient-to-r from-red-500 to-orange-500'
                    }`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {completion}%
              </span>
            </div>
          );
        },
      });
    }

    // Title column
    columns.push({
      key: 'title',
      label: 'Title',
      sortable: true,
      align: 'left',
      render: (_, announcement) => (
          <div className="flex items-center gap-2">
            {announcement.isPinned && (
              <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
            )}
            <span className="font-medium truncate max-w-[250px]">
              {announcement.title || <span className="text-muted-foreground italic">Untitled</span>}
            </span>
          </div>
      ),
    });

    // Status column for 'all' tab
    if (activeTab === 'all') {
      columns.push({
        key: 'status',
        label: 'Status',
        sortable: true,
        align: 'left',
        render: (_, announcement) => (
          <Badge className={`font-semibold capitalize ${
            getStatus(announcement) === 'draft' 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              : getStatus(announcement) === 'scheduled'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
              : getStatus(announcement) === 'archived'
              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
          }`}>
            {getStatus(announcement) === 'draft' && <FileEdit className="h-3 w-3 mr-1" />}
            {getStatus(announcement) === 'scheduled' && <Rocket className="h-3 w-3 mr-1" />}
            {getStatus(announcement) === 'archived' && <Archive className="h-3 w-3 mr-1" />}
            {getStatus(announcement) === 'published' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {getStatus(announcement)}
          </Badge>
        ),
      });
    }

    // Type column
    columns.push({
      key: 'type',
      label: 'Type',
      sortable: true,
      align: 'left',
      render: (_, announcement) => (
        <Badge className={`font-semibold ${
          announcement.isPoll 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
            : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
        }`}>
          {announcement.isPoll ? (
            <><BarChart3 className="h-3 w-3 mr-1" /> Poll</>
          ) : (
            <><Megaphone className="h-3 w-3 mr-1" /> Announcement</>
          )}
        </Badge>
      ),
    });

    // Priority column
    columns.push({
      key: 'priority',
      label: 'Priority',
      sortable: true,
      align: 'left',
      render: (_, announcement) => (
        <Badge className={`font-semibold ${
          announcement.priority === 'high' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
            : announcement.priority === 'medium'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
        }`}>
          {announcement.priority === 'high' && <Flame className="h-3 w-3 mr-1" />}
          {announcement.priority === 'medium' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {announcement.priority === 'low' && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {announcement.priority}
        </Badge>
      ),
    });

    // Author column (with name and role)
    columns.push({
      key: 'author',
      label: 'Published By',
      sortable: true,
      align: 'left',
      render: (_, announcement) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(announcement.author)} flex items-center justify-center text-white text-xs font-semibold`}>
            {getInitials(announcement.author)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{announcement.author}</span>
            <span className="text-xs text-muted-foreground">{announcement.role || 'N/A'}</span>
          </div>
        </div>
      ),
    });

    // Date column (with time)
    columns.push({
      key: 'date',
      label: activeTab === 'draft' ? 'Modified' : 'Published On',
      sortable: true,
      align: 'left',
      render: (_, announcement) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-purple-500" />
            <span className="font-medium">
              {format(new Date(announcement.date), 'MMM dd, yyyy')}
            </span>
          </div>
          {announcement.time && (
            <span className="text-xs text-muted-foreground ml-4">
              {announcement.time}
            </span>
          )}
        </div>
      ),
    });

    // Engagement column for non-draft tabs
    if (activeTab !== 'draft') {
      columns.push({
        key: 'engagement',
        label: 'Engagement',
        sortable: true,
        align: 'left',
        render: (_, announcement) => (
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              {announcement.likes || 0}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
              {announcement.comments?.length || 0}
            </span>
            {announcement.isPoll && (
              <span className="flex items-center gap-1 font-semibold">
                <BarChart3 className="h-4 w-4 text-purple-500 fill-purple-500" />
                {announcement.totalVotes || 0}
              </span>
            )}
          </div>
        ),
      });
    }

    return columns;
  }, [activeTab]);

  // Define DataTable actions
  const announcementTableActions: DataTableAction<Announcement>[] = useMemo(() => {
    const actions: DataTableAction<Announcement>[] = [];

    const isDraft = activeTab === 'draft';

    if (isDraft) {
      actions.push(
        {
          label: 'Edit Draft',
          onClick: (announcement) => navigate(`/new-announcement`, { state: { draft: announcement } }),
        },
        {
          label: 'Delete',
          onClick: (announcement) => handleDeleteClick(announcement),
        }
      );
    } else {
      actions.push(
        {
          label: 'View Details',
          onClick: (announcement) => handleViewClick(announcement),
        },
        {
          label: 'View Analytics',
          onClick: (announcement) => {
            setSelectedAnnouncement(announcement);
            setAnalyticsDialogOpen(true);
          },
        },
        {
          label: 'Repost',
          onClick: (announcement) => {
            navigate('/new-announcement', { 
              state: { 
                repostAnnouncement: announcement 
              } 
            });
          },
        },
        {
          label: 'Edit',
          onClick: (announcement) => navigate(`/new-announcement`, { state: { editAnnouncement: announcement } }),
        },
        {
          label: 'Delete',
          onClick: (announcement) => handleDeleteClick(announcement),
        }
      );
    }

    return actions;
  }, [activeTab, navigate, handleViewClick, handleDeleteClick, setSelectedAnnouncement, setAnalyticsDialogOpen]);

  return (
    <div className="page-container">
      {/* Engagement Management Section - Matching WorkforceSummary UI */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Engagement & Communication</h2>
            <p className="text-sm text-muted-foreground">
              Manage announcements, polls, and organizational communication
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(fromDate || toDate || activeTab !== 'all' || filterType !== 'all' || filterPriority !== 'all') && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>

          <Button
            onClick={() => navigate('/new-announcement')}
            className="h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Expandable Filter Section */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Announcements</h4>
              <Button variant="ghost" size="sm" onClick={() => {
                setFromDate(undefined);
                setToDate(undefined);
                setActiveTab('all');
                setFilterType('all');
                setFilterPriority('all');
              }} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={activeTab} onValueChange={(value: StatusTab) => setActiveTab(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</label>
                <Select value={filterType} onValueChange={(value: 'all' | 'announcement' | 'poll' | 'survey' | 'event') => {
                  if (value === 'survey' || value === 'event') {
                    toast.info(`${value.charAt(0).toUpperCase() + value.slice(1)} type is not yet implemented. Please use Announcement or Poll filters.`);
                  }
                  setFilterType(value);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="poll">Polls</SelectItem>
                    <SelectItem value="survey">Surveys</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
                <Select value={filterPriority} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setFilterPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards - Matching WorkforceSummary UI */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(fromDate || toDate || activeTab !== 'all') ? 'Filtered results' : 'Live announcements'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FileEdit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(fromDate || toDate || activeTab !== 'all') ? 'Filtered results' : 'In progress'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Polls</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalPolls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(fromDate || toDate || activeTab !== 'all') ? 'Filtered results' : 'Active polls'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Flame className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(fromDate || toDate || activeTab !== 'all') ? 'Filtered results' : 'Urgent items'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalEngagement}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(fromDate || toDate || activeTab !== 'all') ? 'Filtered results' : 'Total interactions'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table - Matching WorkforceSummary UI */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl">
                {activeTab === 'all' && 'All Announcements'}
                {activeTab === 'published' && 'Published Announcements'}
                {activeTab === 'draft' && 'Draft Announcements'}
                {activeTab === 'scheduled' && 'Scheduled Announcements'}
                {activeTab === 'archived' && 'Archived Announcements'}
              </CardTitle>
              <CardDescription className="mt-1">
                {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'item' : 'items'}
                {(searchQuery || filterType !== 'all' || filterPriority !== 'all' || activeTab !== 'all') && ' (filtered)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-1" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Cards
                </Button>
              </div>

              {/* Column Toggle Dropdown */}
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
                    {announcementTableColumns.map((column) => (
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg m-4">
              <div className="p-3 mx-auto w-fit rounded-full bg-muted mb-3">
                <Megaphone className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold mb-1">No announcements found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === 'draft' ? 'Start creating a draft to see it here' : 'Try adjusting your filters or search query'}
              </p>
              {activeTab === 'draft' && (
                <Button
                  onClick={() => navigate('/new-announcement')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Draft
                </Button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <DataTable
              data={filteredAnnouncements}
              columns={announcementTableColumns.map(col => ({ 
                ...col, 
                hidden: columnVisibility[col.key] === false 
              }))}
              actions={announcementTableActions}
              searchable={false}
              hideColumnToggle={true}
              pageSize={10}
              emptyMessage={
                activeTab === 'draft' 
                  ? 'No draft announcements. Start creating one to see it here.' 
                  : 'No announcements found. Try adjusting your filters or search query.'
              }
              onRowClick={(announcement) => handleViewClick(announcement)}
            />
          ) : (
            // Card View - Enhanced Modern Design
            <div className="p-6 space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {filteredAnnouncements.map((announcement) => {
                  const isLiked = user?.employeeId ? announcement.likedBy.includes(user.employeeId) : false;
                  const isExpanded = expandedPosts[announcement.id] || false;
                  const isDraft = getStatus(announcement) === 'draft';
                  
                  // Track view when card is rendered
                  if (viewMode === 'cards') {
                    trackAnnouncementView(announcement.id);
                  }
                  
                  return (
                    <Card 
                      key={announcement.id} 
                      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        announcement.isPinned 
                          ? 'shadow-lg' 
                          : ''
                      } ${
                        isDraft 
                          ? 'bg-amber-50/50 dark:bg-amber-950/10' 
                          : 'bg-card'
                      }`}
                    >
                      {/* Priority Indicator Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        announcement.priority === 'high' 
                          ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500'
                          : announcement.priority === 'medium'
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500'
                      }`} />
                      
                      <CardHeader className="pb-3">
                        {/* Header Row */}
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-full ${getAvatarGradient(announcement.author)} flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0`}>
                            {getInitials(announcement.author)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm truncate">{announcement.author}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {announcement.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{announcement.date}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{announcement.time}</span>
                            </div>
                          </div>
                          
                          {/* Top Right Badges */}
                          <div className="flex flex-col gap-1.5 items-end">
                            {announcement.isPinned && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            <Badge className={`shadow-sm ${
                              announcement.priority === 'high' 
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : announcement.priority === 'medium'
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}>
                              {announcement.priority === 'high' && <Flame className="h-3 w-3 mr-1" />}
                              {announcement.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Type & Category Badges */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Badge className={`shadow-sm ${
                            announcement.isPoll 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                          }`}>
                            {announcement.isPoll ? (
                              <><BarChart3 className="h-3.5 w-3.5 mr-1" /> Poll</>
                            ) : (
                              <><Megaphone className="h-3.5 w-3.5 mr-1" /> Announcement</>
                            )}
                          </Badge>
                          {announcement.category && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {announcement.category}
                            </Badge>
                          )}
                          {isDraft && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
                              <FileEdit className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Title */}
                        <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-2">
                          {announcement.title}
                        </h3>
                        
                        {/* Description */}
                        <div 
                          className={`text-sm text-muted-foreground leading-relaxed ${
                            isExpanded ? '' : 'line-clamp-3'
                          }`}
                          dangerouslySetInnerHTML={{ __html: announcement.description }}
                        />
                        
                        {announcement.description.length > 150 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(announcement.id)}
                            className="text-primary hover:text-primary/80 h-8 px-2 -ml-2"
                          >
                            {isExpanded ? (
                              <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
                            ) : (
                              <><ChevronDown className="h-4 w-4 mr-1" /> Read More</>
                            )}
                          </Button>
                        )}
                        
                        {/* Image */}
                        {announcement.imageUrl && (
                          <div className="relative rounded-lg overflow-hidden shadow-sm">
                            <img 
                              src={announcement.imageUrl} 
                              alt={announcement.title}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}

                        {/* Poll Options */}
                        {announcement.isPoll && announcement.pollOptions && (
                          <div className="space-y-2.5 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Poll Results
                              </span>
                              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                {announcement.totalVotes || 0} votes
                              </Badge>
                            </div>
                            {announcement.pollOptions.map((option) => {
                              const percentage = announcement.totalVotes 
                                ? Math.round((option.votes / announcement.totalVotes) * 100)
                                : 0;
                              return (
                                <div key={option.id} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{option.text}</span>
                                    <span className="font-bold text-purple-600 dark:text-purple-400">
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="relative h-2 bg-white/50 dark:bg-gray-900/50 rounded-full overflow-hidden">
                                    <div 
                                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-sm"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Engagement Metrics */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 py-2.5 px-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                            <div className="flex items-center gap-1.5 group hover:scale-105 transition-transform cursor-pointer"
                              title={`${announcement.reactionsCount || announcement.likes || 0} reactions`}>
                              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500/70 group-hover:text-red-500'}`} />
                              <span className="text-sm font-semibold">{announcement.reactionsCount || announcement.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 group hover:scale-105 transition-transform cursor-pointer"
                              title={`${announcement.commentsCount || announcement.comments?.length || 0} comments`}>
                              <MessageCircle className="h-4 w-4 text-blue-500/70 group-hover:text-blue-500" />
                              <span className="text-sm font-semibold">{announcement.commentsCount || announcement.comments?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 group hover:scale-105 transition-transform cursor-pointer"
                              title={`${announcement.viewsCount || announcement.views || 0} views`}>
                              <Eye className="h-4 w-4 text-purple-500/70 group-hover:text-purple-500" />
                              <span className="text-sm font-semibold">{announcement.viewsCount || announcement.views || 0}</span>
                            </div>
                            {announcement.isPoll && (
                              <div className="flex items-center gap-1.5 group hover:scale-105 transition-transform cursor-pointer"
                                title={`${announcement.totalVotes || 0} votes`}>
                                <BarChart3 className="h-4 w-4 text-amber-500/70 group-hover:text-amber-500" />
                                <span className="text-sm font-semibold">{announcement.totalVotes || 0}</span>
                              </div>
                            )}
                            <div className="flex-1" />
                            <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {(announcement.viewsCount ?? 0) > 0 
                                ? `${((((announcement.reactionsCount || announcement.likes || 0) + (announcement.commentsCount || announcement.comments?.length || 0)) / (announcement.viewsCount ?? 1)) * 100).toFixed(0)}% engaged`
                                : '0% engaged'
                              }
                            </Badge>
                          </div>
                          
                          {/* Quick Analytics Summary */}
                          {((announcement.viewsCount ?? 0) > 0 || (announcement.reactionsCount ?? 0) > 0 || (announcement.commentsCount ?? 0) > 0) && (
                            <div className="grid grid-cols-3 gap-2 px-1">
                              {announcement.firstReactedBy && (
                                <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                  <Trophy className="h-3.5 w-3.5 text-red-500 mx-auto mb-1" />
                                  <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 truncate">
                                    {announcement.firstReactedBy}
                                  </p>
                                  <p className="text-[9px] text-red-600/70 dark:text-red-400/70">First to react</p>
                                </div>
                              )}
                              {announcement.firstCommentedBy && (
                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                  <MessageCircle className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                                  <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 truncate">
                                    {announcement.firstCommentedBy}
                                  </p>
                                  <p className="text-[9px] text-blue-600/70 dark:text-blue-400/70">First comment</p>
                                </div>
                              )}
                              {announcement.latestReactedBy && announcement.latestReactedBy !== announcement.firstReactedBy && (
                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                  <Sparkles className="h-3.5 w-3.5 text-purple-500 mx-auto mb-1" />
                                  <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 truncate">
                                    {announcement.latestReactedBy}
                                  </p>
                                  <p className="text-[9px] text-purple-600/70 dark:text-purple-400/70">Latest reaction</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Comments Section (Expanded) */}
                        {isExpanded && announcement.comments && announcement.comments.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <MessageCircle className="h-3.5 w-3.5" />
                              Comments ({announcement.comments.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {announcement.comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-2 p-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                  <div className={`w-7 h-7 rounded-full ${getAvatarGradient(comment.author)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                                    {getInitials(comment.author)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-semibold text-xs truncate">{comment.author}</span>
                                      <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Add Comment (Expanded) */}
                        {isExpanded && (
                          <div className="flex gap-2 pt-2">
                            <Input
                              placeholder="Write a comment..."
                              value={newComment[announcement.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(announcement.id);
                                }
                              }}
                              className="flex-1 h-9 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(announcement.id)}
                              disabled={!newComment[announcement.id]?.trim()}
                              className="h-9 bg-primary"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Footer Actions */}
                        <div className="mt-4 pt-3 bg-muted/30 -mx-6 px-6 -mb-6 pb-4 rounded-b-lg">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(announcement.id)}
                              className={`h-8 ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
                            >
                              <Heart className={`h-3.5 w-3.5 mr-1.5 ${isLiked ? 'fill-red-500' : ''}`} />
                              Like
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(announcement.id)}
                              className="h-8 hover:text-blue-500"
                            >
                              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                              Comment
                            </Button>
                            
                            <div className="flex-1" />
                            
                            {/* Admin Quick Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAnnouncement(announcement);
                                  setAnalyticsDialogOpen(true);
                                }}
                                className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                title="Analytics"
                              >
                                <BarChart3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/new-announcement`, { state: { edit: announcement } })}
                                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(announcement)}
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md border-t-4 border-t-red-500">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl">
                {selectedAnnouncement?.status === 'draft' ? 'Delete Draft?' : 'Delete Announcement?'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {selectedAnnouncement?.status === 'draft' 
                ? 'This draft will be permanently deleted. This action cannot be undone.'
                : 'This will permanently delete this announcement and all associated data. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnnouncement && (
            <div className="space-y-3 my-4 p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-red-900 dark:text-red-100 min-w-[80px]">Title:</span>
                <span className="text-sm text-red-800 dark:text-red-200">{selectedAnnouncement.title}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-red-900 dark:text-red-100 min-w-[80px]">Author:</span>
                <span className="text-sm text-red-800 dark:text-red-200">{selectedAnnouncement.author}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-red-900 dark:text-red-100 min-w-[80px]">Created:</span>
                <span className="text-sm text-red-800 dark:text-red-200">
                  {format(new Date(selectedAnnouncement.date), 'MMM dd, yyyy h:mm a')}
                </span>
              </div>
              {selectedAnnouncement.status !== 'draft' && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-red-900 dark:text-red-100 min-w-[80px]">Engagement:</span>
                  <span className="text-sm text-red-800 dark:text-red-200">
                    {(selectedAnnouncement.likes || 0)} reactions, {(selectedAnnouncement.comments?.length || 0)} comments
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-2"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedAnnouncement?.status === 'draft' ? 'Draft' : 'Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.isPoll ? (
                <BarChart3 className="h-5 w-5 text-purple-500" />
              ) : (
                <Megaphone className="h-5 w-5 text-blue-500" />
              )}
              {selectedAnnouncement?.title}
            </DialogTitle>
            <DialogDescription>
              Posted by {selectedAnnouncement?.author} on{' '}
              {selectedAnnouncement?.date && format(new Date(selectedAnnouncement.date), 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge className={getTypeBadge(selectedAnnouncement?.isPoll || false)}>
                {selectedAnnouncement?.isPoll ? 'Poll' : 'Announcement'}
              </Badge>
              <Badge className={getPriorityBadge(selectedAnnouncement?.priority || 'low')}>
                {selectedAnnouncement?.priority}
              </Badge>
              {selectedAnnouncement?.category && (
                <Badge variant="outline">{selectedAnnouncement.category}</Badge>
              )}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{selectedAnnouncement?.description}</p>
            </div>

            {selectedAnnouncement?.imageUrl && (
              <img 
                src={selectedAnnouncement.imageUrl} 
                alt="Announcement" 
                className="rounded-lg max-h-64 object-cover"
              />
            )}

            {/* Poll Options */}
            {selectedAnnouncement?.isPoll && selectedAnnouncement?.pollOptions && (
              <div className="space-y-2">
                <h4 className="font-semibold">Poll Results</h4>
                {selectedAnnouncement.pollOptions.map((option: PollOption) => {
                  const totalVotes = selectedAnnouncement.totalVotes || 
                    (selectedAnnouncement.pollOptions || []).reduce((sum: number, o: PollOption) => sum + (o.votes || 0), 0);
                  const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={option.id} className="relative overflow-hidden border rounded-lg p-3">
                      <div 
                        className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span>{option.text}</span>
                        <span className="font-semibold">{percentage}% ({option.votes || 0} votes)</span>
                      </div>
                    </div>
                  );
                })}
                <p className="text-sm text-muted-foreground">
                  Total votes: {selectedAnnouncement.totalVotes || 0}
                </p>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                {selectedAnnouncement?.likes || 0} likes
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                {selectedAnnouncement?.comments?.length || 0} comments
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete {selectedAnnouncement?.isPoll ? 'Poll' : 'Announcement'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      {selectedAnnouncement && (
        <AnnouncementAnalyticsDialog
          open={analyticsDialogOpen}
          onOpenChange={setAnalyticsDialogOpen}
          announcementId={selectedAnnouncement.id}
          announcementTitle={selectedAnnouncement.title}
        />
      )}
    </div>
  );
}
