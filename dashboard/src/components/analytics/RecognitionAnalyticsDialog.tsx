import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Search,
  Trophy,
  Sparkles,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarGradient, getInitials } from '@/constants/design-system';
import { useRecognitionPostStore } from '@/store/recognitionPostStore';

interface RecognitionAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postTitle: string;
}

export function RecognitionAnalyticsDialog({
  open,
  onOpenChange,
  postId,
  postTitle,
}: RecognitionAnalyticsDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const posts = useRecognitionPostStore((s) => s.posts);
  const post = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);

  const reactions = post?.reactions || [];
  const comments = post?.comments || [];
  const viewDetails = post?.viewDetails || [];
  const views = post?.views || 0;
  const likes = post?.likes || 0;

  // Overview derived data
  const reactionBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    reactions.forEach((r) => {
      map[r.emoji] = (map[r.emoji] || 0) + 1;
    });
    return map;
  }, [reactions]);

  const sortedReactions = useMemo(
    () => [...reactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [reactions]
  );
  const firstReaction = sortedReactions[0];
  const latestReaction = sortedReactions[sortedReactions.length - 1];

  const uniqueCommenters = useMemo(
    () => new Set(comments.map((c) => c.employeeId)).size,
    [comments]
  );

  const engagementRate =
    views > 0
      ? (((reactions.length + comments.length + likes) / views) * 100).toFixed(1)
      : '0.0';

  // Timeline — merge reactions + comments + views, sort by time
  const timeline = useMemo(() => {
    const events: Array<{
      type: 'reaction' | 'comment' | 'view';
      userName: string;
      timestamp: string;
      details: string;
      emoji?: string;
    }> = [
      ...reactions.map((r) => ({
        type: 'reaction' as const,
        userName: r.userName,
        timestamp: r.timestamp,
        details: `reacted with ${r.emoji}`,
        emoji: r.emoji,
      })),
      ...comments.map((c) => ({
        type: 'comment' as const,
        userName: c.author,
        timestamp: c.timestamp,
        details: `commented: "${c.text.slice(0, 80)}${c.text.length > 80 ? '…' : ''}"`,
      })),
      ...viewDetails.map((v) => ({
        type: 'view' as const,
        userName: v.userName,
        timestamp: v.timestamp,
        details: 'viewed this post',
      })),
    ];
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [reactions, comments, viewDetails]);

  const filteredReactions = useMemo(
    () =>
      reactions.filter((r) =>
        r.userName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [reactions, searchQuery]
  );

  const filteredComments = useMemo(
    () =>
      comments.filter(
        (c) =>
          c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.text.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [comments, searchQuery]
  );

  const filteredViews = useMemo(
    () =>
      viewDetails.filter((v) =>
        v.userName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [viewDetails, searchQuery]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[900px] lg:max-w-[1100px] p-0">
        <SheetHeader>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold">Recognition Analytics</SheetTitle>
              <p className="text-sm text-muted-foreground font-normal">{postTitle}</p>
            </div>
          </div>
          <SheetCloseButton />
        </SheetHeader>

        <SheetBody className="py-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchQuery(''); }} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 h-auto p-1">
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
            </TabsList>

            {/* ─────────────── OVERVIEW ─────────────── */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{views}</div>
                    <p className="text-xs text-muted-foreground mt-1">{viewDetails.length} unique viewers</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      Reactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{reactions.length}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(reactionBreakdown).slice(0, 4).map(([emoji, count]) => (
                        <span key={emoji} className="text-xs text-muted-foreground">
                          {emoji} {count}
                        </span>
                      ))}
                      {reactions.length === 0 && (
                        <span className="text-xs text-muted-foreground">No reactions yet</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{comments.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">{uniqueCommenters} commenter{uniqueCommenters !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{engagementRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">engagement rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* First & Latest Reactions */}
              {(firstReaction || latestReaction) && firstReaction !== latestReaction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {firstReaction && (
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
                            style={{ background: getAvatarGradient(firstReaction.userName) }}
                          >
                            {getInitials(firstReaction.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{firstReaction.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {firstReaction.emoji} {format(new Date(firstReaction.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {latestReaction && (
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
                            style={{ background: getAvatarGradient(latestReaction.userName) }}
                          >
                            {getInitials(latestReaction.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{latestReaction.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {latestReaction.emoji} {format(new Date(latestReaction.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Recent Timeline */}
              {timeline.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {timeline.slice(0, 5).map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {event.type === 'reaction' && <Heart className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                          {event.type === 'comment' && <MessageCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                          {event.type === 'view' && <Eye className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: getAvatarGradient(event.userName) }}
                          >
                            {getInitials(event.userName)}
                          </div>
                          <div className="flex-1 min-w-0 text-sm">
                            <span className="font-medium">{event.userName}</span>{' '}
                            <span className="text-muted-foreground">{event.details}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {reactions.length === 0 && comments.length === 0 && views === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">No analytics data yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Data will appear once employees interact with the post</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─────────────── REACTIONS ─────────────── */}
            <TabsContent value="reactions" className="space-y-4 mt-0">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{reactions.length}</p>
                        <p className="text-xs text-muted-foreground">Total Reactions</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(reactionBreakdown).map(([emoji, count]) => (
                        <Badge key={emoji} variant="secondary" className="text-sm">
                          {emoji} {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {filteredReactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredReactions.map((reaction, idx) => (
                    <Card key={idx} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                            style={{ background: getAvatarGradient(reaction.userName) }}
                          >
                            {getInitials(reaction.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{reaction.userName}</span>
                              <Badge variant="outline" className="text-xs">{reaction.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(reaction.timestamp), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <span className="text-2xl flex-shrink-0">{reaction.emoji}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? 'No reactions match your search' : 'No reactions yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─────────────── COMMENTS ─────────────── */}
            <TabsContent value="comments" className="space-y-4 mt-0">
              <Card>
                <CardContent className="py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search comments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {filteredComments.length > 0 ? (
                <div className="space-y-3">
                  {filteredComments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                            style={{ background: getAvatarGradient(comment.author) }}
                          >
                            {getInitials(comment.author)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm truncate">{comment.author}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {format(new Date(comment.timestamp), 'MMM d, yyyy • h:mm a')}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? 'No comments match your search' : 'No comments yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─────────────── VIEWS ─────────────── */}
            <TabsContent value="views" className="space-y-4 mt-0">
              <Card>
                <CardContent className="py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              {filteredViews.length > 0 ? (
                <div className="space-y-2">
                  {filteredViews.map((view, idx) => (
                    <Card key={idx} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                            style={{ background: getAvatarGradient(view.userName) }}
                          >
                            {getInitials(view.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{view.userName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(view.timestamp), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    {filteredViews.length} unique viewer{filteredViews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Eye className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery ? 'No views match your search' : 'No views recorded yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
