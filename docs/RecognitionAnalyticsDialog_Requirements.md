# Component Requirements — RecognitionAnalyticsDialog

**File**: `src/components/analytics/RecognitionAnalyticsDialog.tsx`  
**Type**: Reusable analytics sheet component  
**Lines**: 535  
**Used by**: `src/pages/hr/RecognitionCelebrations.tsx`

---

## 1. Component Overview

A right-side Sheet (drawer) that displays full engagement analytics for a single recognition post stored in `recognitionPostStore`. It is opened from the Celebrations DataTable when clicking the analytics icon on rows whose `_id` starts with `rec-`.

---

## 2. Props Interface

```typescript
interface RecognitionAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;       // Must match a post.id in recognitionPostStore
  postTitle: string;    // Shown as subtitle in the sheet header
}
```

---

## 3. Features / Tabs

| Tab | Contents |
|-----|----------|
| **Overview** | 4 KPI cards + First Reactor + Latest Reactor + engagement timeline list |
| **Reactions** | Searchable reactions list + emoji breakdown count per type |
| **Comments** | Searchable comments list with author avatar + timestamp |
| **Views** | Searchable viewer list with device, department, view source, timestamp |

### Overview Tab Details

| Card | Metric | Formula |
|------|--------|---------|
| Total Views | `post.views` | Raw view count |
| Reactions | `post.reactions.length` | Emoji breakdown shown inline |
| Comments | `post.comments.length` | + unique commenters count |
| Engagement % | `(reactions + comments + likes) / views × 100` | Shown as `x.x%` |

- **First to React** — earliest entry in `post.reactions[]` sorted by `timestamp` (shown only if > 1 reaction exists)
- **Latest Reaction** — most recent entry in `post.reactions[]` (shown only if differs from first)
- **Activity Timeline** — merged list of reactions + comments + views, sorted newest-first; each entry shows avatar, name, action text, and formatted time

### Reactions Tab Details

- Search box filters by `reaction.userName`
- Each row: avatar/initials, username, emoji + label, formatted timestamp
- Emoji type breakdown: counts grouped by `reaction.emoji` displayed as badges

### Comments Tab Details

- Search box filters by `comment.author` and `comment.text`
- Each row: avatar/initials, author name, comment text (max 80 chars in overview timeline, full text here), timestamp

### Views Tab Details

- Search box filters by `viewDetail.userName`
- Each row: avatar/initials, username, department, device badge (`desktop`/`mobile`), view source badge, formatted timestamp

---

## 4. Frontend Dependencies

### Zustand Store

| Store | Data consumed | Notes |
|-------|--------------|-------|
| `useRecognitionPostStore` | `posts[]` — finds post by `postId` | **Frontend-only / localStorage** — no backend API call |

### UI Component Dependencies (Shadcn/ui)

```
Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetCloseButton
Tabs, TabsContent, TabsList, TabsTrigger
Card, CardContent, CardHeader, CardTitle
Badge
Input
```

### Utility / Helper Dependencies

| Import | From | Usage |
|--------|------|-------|
| `getAvatarGradient` | `@/constants/design-system` | Avatar background gradient by name |
| `getInitials` | `@/constants/design-system` | 2-letter initials fallback for avatars |
| `format` | `date-fns` | Timestamp formatting (`MMM d, yyyy HH:mm`) |

### Icon Set (lucide-react)

```
Eye, Heart, MessageCircle, TrendingUp, BarChart3, Search, Trophy, Sparkles, Clock
```

---

## 5. Data Interfaces (from recognitionPostStore)

```typescript
interface RecognitionPost {
  id: string;                // e.g. 'rec-EMP001-1709000000000'
  title: string;
  message: string;           // HTML
  type: 'birthday' | 'anniversary' | 'achievement' | 'other';
  employeeId: string;
  employeeName: string;
  department: string;
  publishedBy: string;
  publishedAt: string;
  status: 'draft' | 'published';
  likes: number;
  likedBy: string[];
  reactions: ReactionDetail[];
  comments: CommentDetail[];
  views: number;
  viewDetails: ViewDetail[];
}

interface ReactionDetail {
  employeeId: string;
  userName: string;
  emoji: string;             // '❤️' | '👍' | '🎉' | '😊' | '💡' | '👏'
  label: string;             // 'Love' | 'Like' | 'Celebrate' | 'Happy' | 'Insightful' | 'Applause'
  timestamp: string;         // ISO date string
}

interface CommentDetail {
  id: string;
  employeeId: string;
  author: string;
  userName?: string;
  department?: string;
  text: string;
  timestamp: string;         // ISO date string
  likedBy?: string[];
  likesCount?: number;
}

interface ViewDetail {
  employeeId: string;
  userName: string;
  department?: string;
  role?: string;
  timestamp: string;         // ISO date string
  device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  viewSource?: 'dashboard' | 'email' | 'direct-link' | 'notification';
  hasEngaged?: boolean;
}
```

---

## 6. Computed Derived Values

| Variable | Computation |
|----------|-------------|
| `reactionBreakdown` | `Record<emoji, count>` — grouped from `reactions[]` |
| `sortedReactions` | `reactions` sorted ascending by `timestamp` |
| `firstReaction` | `sortedReactions[0]` |
| `latestReaction` | `sortedReactions[sortedReactions.length - 1]` |
| `uniqueCommenters` | `new Set(comments.map(c => c.employeeId)).size` |
| `engagementRate` | `((reactions.length + comments.length + likes) / views * 100).toFixed(1)` |
| `timeline` | Merged reactions + comments + viewDetails, sorted descending by timestamp |
| `filteredReactions` | `reactions` filtered by `searchQuery` on `userName` |
| `filteredComments` | `comments` filtered by `searchQuery` on `author` or `text` |
| `filteredViews` | `viewDetails` filtered by `searchQuery` on `userName` |

---

## 7. Sheet Layout

```
SheetContent (max-width: 900px / 1100px responsive)
├── SheetHeader
│   ├── BarChart3 icon + "Recognition Analytics" title
│   ├── postTitle subtitle
│   └── SheetCloseButton
└── SheetBody
    └── Tabs (4 tabs, resets searchQuery on tab change)
        ├── Overview
        ├── Reactions
        ├── Comments
        └── Views
```

---

## 8. State

```typescript
const [activeTab, setActiveTab] = useState('overview');    // Current tab
const [searchQuery, setSearchQuery] = useState('');        // Resets on tab change
```

---

## 9. Integration Requirements

### Who opens this component

```tsx
// In RecognitionCelebrations.tsx
const [analyticsOpen, setAnalyticsOpen] = useState(false);
const [analyticsPostId, setAnalyticsPostId] = useState<string | null>(null);
const [analyticsPostTitle, setAnalyticsPostTitle] = useState('');

// Triggered by bar chart icon button — only on rows where row._id.startsWith('rec-')
<RecognitionAnalyticsDialog
  open={analyticsOpen}
  onOpenChange={setAnalyticsOpen}
  postId={analyticsPostId ?? ''}
  postTitle={analyticsPostTitle}
/>
```

### Required store data before opening

The `postId` must exist in `recognitionPostStore.posts[]`. The store is populated by `addPost()` when HR publishes a recognition post from the Celebrations page. The post `id` format is `rec-{employeeId}-{timestamp}`.

### No backend API calls

This component is **entirely frontend-driven**. All data is read from `recognitionPostStore` which persists to `localStorage` via Zustand `persist`. There are **no network requests** inside this component.

---

## 10. Design System Usage

```typescript
// Avatar gradient — deterministic colour from name string
const gradient = getAvatarGradient(userName);
// Returns a CSS class string like 'from-blue-500 to-indigo-600'

// Initials fallback
const initials = getInitials(userName);
// Returns first 2 characters of formatted name, e.g. 'JD'
```

Both helpers imported from `src/constants/design-system.ts`.
