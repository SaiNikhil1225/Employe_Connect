import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Download,
  Search,
  Trophy,
  Sparkles,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarGradient, getInitials } from '@/constants/design-system';
import axios from 'axios';
import { toast } from 'sonner';

interface AnnouncementAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: number | string;
  announcementTitle: string;
}

interface AnalyticsOverview {
  views: { total: number; unique: number };
  reactions: { total: number; breakdown: Record<string, number> };
  comments: { total: number; uniqueCommenters: number };
  shares: number;
  engagementRate: number;
  departmentViews: Array<{ department: string; count: number }>;
  firstReaction?: { userName: string; timestamp: string };
  latestReaction?: { userName: string; timestamp: string };
}

interface Reaction {
  employeeId: string;
  userName: string;
  department: string;
  role: string;
  emoji: string;
  label: string;
  timestamp: string;
  device?: string;
  location?: string;
}

interface Comment {
  id: string;
  employeeId: string;
  userName: string;
  department: string;
  role: string;
  text: string;
  timestamp: string;
  likesCount: number;
  replies?: Comment[];
}

interface View {
  employeeId: string;
  userName: string;
  department: string;
  role: string;
  timestamp: string;
  duration?: number;
  device?: string;
  browser?: string;
  viewSource?: string;
  hasEngaged: boolean;
}

interface TimelineEvent {
  type: 'view' | 'reaction' | 'comment';
  employeeId: string;
  userName: string;
  department: string;
  timestamp: string;
  details: string;
}

export function AnnouncementAnalyticsDialog({
  open,
  onOpenChange,
  announcementId,
  announcementTitle,
}: AnnouncementAnalyticsDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterReaction, setFilterReaction] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');

  useEffect(() => {
    if (open && announcementId) {
      fetchAnalytics();
    }
  }, [open, announcementId, activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const baseURL = 'http://localhost:5000';
      console.log(`Fetching analytics for announcement ${announcementId}, tab: ${activeTab}`);
      
      if (activeTab === 'overview') {
        const response = await axios.get(`${baseURL}/api/announcements/${announcementId}/analytics`);
        console.log('Overview analytics response:', response.data);
        setOverview(response.data);
      } else if (activeTab === 'reactions') {
        const { data } = await axios.get(`${baseURL}/api/announcements/${announcementId}/analytics/reactions`);
        console.log('Reactions analytics response:', data);
        setReactions(data.data?.reactions || []);
      } else if (activeTab === 'comments') {
        const { data } = await axios.get(`${baseURL}/api/announcements/${announcementId}/analytics/comments`);
        console.log('Comments analytics response:', data);
        setComments(data.data?.comments || []);
      } else if (activeTab === 'views') {
        const { data } = await axios.get(`${baseURL}/api/announcements/${announcementId}/analytics/views`);
        console.log('Views analytics response:', data);
        setViews(data.data?.views || []);
      } else if (activeTab === 'timeline') {
        const { data } = await axios.get(`${baseURL}/api/announcements/${announcementId}/analytics/timeline`);
        console.log('Timeline analytics response:', data);
        setTimeline(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load analytics', {
        description: error.response?.data?.message || error.message || 'Please check if the announcement exists and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments
  const departments = useMemo(() => {
    if (activeTab === 'reactions') {
      return Array.from(new Set(reactions.map(r => r.department)));
    } else if (activeTab === 'views') {
      return Array.from(new Set(views.map(v => v.department)));
    }
    return [];
  }, [activeTab, reactions, views]);

  // Get unique reaction types
  const reactionTypes = useMemo(() => {
    return Array.from(new Set(reactions.map(r => r.emoji)));
  }, [reactions]);

  // Get unique devices
  const devices = useMemo(() => {
    if (views.length > 0) {
      return Array.from(new Set(views.map(v => v.device).filter(Boolean)));
    }
    return [];
  }, [views]);

  // Filtered data
  const filteredReactions = useMemo(() => {
    return reactions.filter(reaction => {
      const matchesSearch = (reaction.userName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDepartment === 'all' || reaction.department === filterDepartment;
      const matchesReaction = filterReaction === 'all' || reaction.emoji === filterReaction;
      return matchesSearch && matchesDept && matchesReaction;
    });
  }, [reactions, searchQuery, filterDepartment, filterReaction]);

  const filteredViews = useMemo(() => {
    return views.filter(view => {
      const matchesSearch = (view.userName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDepartment === 'all' || view.department === filterDepartment;
      const matchesDevice = filterDevice === 'all' || view.device === filterDevice;
      return matchesSearch && matchesDept && matchesDevice;
    });
  }, [views, searchQuery, filterDepartment, filterDevice]);

  const filteredTimeline = useMemo(() => {
    return timeline.filter(event => {
      return (event.userName || '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [timeline, searchQuery]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[900px] lg:max-w-[1100px] p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-6 py-5 border-b bg-background">
          <SheetTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Analytics</h2>
              <p className="text-sm text-muted-foreground font-normal">{announcementTitle}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="reactions" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Reactions</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Comments</span>
              </TabsTrigger>
              <TabsTrigger value="views" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Views</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : overview ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Total Views</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overview.views?.total || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overview.views?.unique || 0} unique viewers
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">Reactions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overview.reactions?.total || 0}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {overview.reactions?.breakdown && Object.entries(overview.reactions.breakdown).slice(0, 3).map(([emoji, count]) => (
                          <span key={emoji} className="text-xs text-muted-foreground">
                            {emoji} {count}
                          </span>
                        ))}
                        {(!overview.reactions?.breakdown || Object.keys(overview.reactions.breakdown).length === 0) && (
                          <span className="text-xs text-muted-foreground">No reactions</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">Comments</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overview.comments?.total || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overview.comments?.uniqueCommenters || 0} commenters
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Engagement</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {(overview.engagementRate || 0).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">engagement rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* First & Latest Engagement */}
                {(overview.firstReaction || overview.latestReaction) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.firstReaction && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            First to React
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ background: getAvatarGradient(overview.firstReaction.userName || 'Unknown') }}
                            >
                              {getInitials(overview.firstReaction.userName || 'Unknown')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{overview.firstReaction.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(overview.firstReaction.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {overview.latestReaction && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Latest Reaction
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ background: getAvatarGradient(overview.latestReaction.userName || 'Unknown') }}
                            >
                              {getInitials(overview.latestReaction.userName || 'Unknown')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{overview.latestReaction.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(overview.latestReaction.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Department Breakdown */}
                {overview.departmentViews && overview.departmentViews.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Views by Department
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {overview.departmentViews.map((dept, idx) => {
                          const maxViews = Math.max(...overview.departmentViews.map(d => d.count));
                          const percentage = (dept.count / maxViews) * 100;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{dept.department}</span>
                                <span className="text-muted-foreground">{dept.count}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full transition-all" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No analytics data available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Data will appear once users interact</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reactions Tab */}
          <TabsContent value="reactions" className="space-y-4 mt-0">
            {/* Header with Stats */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{reactions.length}</p>
                      <p className="text-xs text-muted-foreground">Total Reactions</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterReaction} onValueChange={setFilterReaction}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Reactions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reactions</SelectItem>
                      {reactionTypes.map(emoji => (
                        <SelectItem key={emoji} value={emoji}>{emoji} {emoji}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reactions List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : filteredReactions.length > 0 ? (
              <div className="space-y-2">
                {filteredReactions.map((reaction, idx) => (
                  <Card key={idx} className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                          style={{ background: getAvatarGradient(reaction.userName || 'Unknown') }}
                        >
                          {getInitials(reaction.userName || 'Unknown')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{reaction.userName}</span>
                            {idx === 0 && (
                              <Badge variant="secondary" className="text-xs font-normal">First</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{reaction.department}</span>
                            <span>•</span>
                            <span>{format(new Date(reaction.timestamp), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                        <div className="text-2xl flex-shrink-0">{reaction.emoji}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No reactions yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Be the first to react!</p>
                </CardContent>
              </Card>
            )}
            
            {filteredReactions.length > 0 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                Showing {filteredReactions.length} of {reactions.length} reactions
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4 mt-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                          style={{ background: getAvatarGradient(comment.userName || 'Unknown') }}
                        >
                          {getInitials(comment.userName || 'Unknown')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">
                              {comment.userName || comment.employeeId || 'Unknown User'}
                            </span>
                            {comment.department && (
                              <Badge variant="outline" className="text-xs">
                                {comment.department}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp 
                                ? format(new Date(comment.timestamp), 'MMM d, yyyy • h:mm a')
                                : 'Date not available'}
                            </span>
                            {comment.role && (
                              <Badge variant="secondary" className="text-xs">
                                {comment.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
                          {comment.likesCount > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                              <span className="text-xs text-muted-foreground">
                                {comment.likesCount}
                              </span>
                            </div>
                          )}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 pl-3 border-l-2 border-muted space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                    style={{ background: getAvatarGradient(reply.userName || 'Unknown') }}
                                  >
                                    {getInitials(reply.userName || 'Unknown')}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-medium text-sm truncate">
                                        {reply.userName || reply.employeeId || 'Unknown User'}
                                      </span>
                                      {reply.department && (
                                        <Badge variant="outline" className="text-xs py-0 h-4">
                                          {reply.department}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground block mb-1">
                                      {reply.timestamp 
                                        ? format(new Date(reply.timestamp), 'MMM d, yyyy • h:mm a')
                                        : 'Date not available'}
                                    </span>
                                    <p className="text-sm text-foreground">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Start the conversation!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Views Tab */}
          <TabsContent value="views" className="space-y-4 mt-0">
            {/* Filters */}
            <Card>
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 h-9"
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDevice} onValueChange={setFilterDevice}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {devices.filter(d => d).map(device => (
                        <SelectItem key={device} value={device!}>{device}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Views Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : filteredViews.length > 0 ? (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViews.map((view, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ background: getAvatarGradient(view.userName || 'Unknown') }}
                            >
                              {getInitials(view.userName || 'Unknown')}
                            </div>
                            <span className="font-medium text-sm">{view.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{view.department}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(view.timestamp), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {view.duration ? `${Math.round(view.duration / 1000)}s` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {view.device === 'mobile' ? (
                              <Smartphone className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Monitor className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">{view.device || 'Unknown'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No views yet</p>
                </CardContent>
              </Card>
            )}
            {filteredViews.length > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Showing {filteredViews.length} of {views.length} views
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-0">
            {/* Search */}
            <Card>
              <CardContent className="py-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search timeline..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 pl-9 h-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : filteredTimeline.length > 0 ? (
              <div className="space-y-2">
                {filteredTimeline.map((event, idx) => {
                  // Generate description based on event type
                  let description = '';
                  if (event.type === 'view') {
                    description = 'viewed this announcement';
                  } else if (event.type === 'reaction') {
                    const reactionEvent = event as any;
                    description = `reacted with ${reactionEvent.emoji} ${reactionEvent.label || ''}`;
                  } else if (event.type === 'comment') {
                    const commentEvent = event as any;
                    description = `commented: "${commentEvent.text?.substring(0, 100) || ''}${commentEvent.text?.length > 100 ? '...' : ''}"`;
                  }
                  
                  return (
                    <Card key={idx}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {event.type === 'view' && <Eye className="h-4 w-4 text-purple-500" />}
                          {event.type === 'reaction' && <Heart className="h-4 w-4 text-red-500" />}
                          {event.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                          
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ background: getAvatarGradient(event.userName || 'Unknown') }}
                          >
                            {getInitials(event.userName || 'Unknown')}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-semibold">{event.userName}</span>
                              {' '}
                              <span className="text-muted-foreground">{description}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              {event.department && (
                                <>
                                  <span>{event.department}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{format(new Date(event.timestamp), 'MMM d, h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}