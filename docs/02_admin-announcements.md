# Module 02 — Admin Announcements

**File**: `src/pages/hr/AdminAnnouncements.tsx`  
**Route**: `/hr/admin-announcements`  
**Access**: HR, SUPER_ADMIN roles  
**Lines**: ~1,695

---

## 1. Page Overview

The Admin Announcements page provides full lifecycle management of internal communications: announcements, polls, surveys, and events. HR admin can create, edit, schedule, publish, archive, and delete posts. Employees see posts on their dashboards. The page includes per-post engagement analytics (views, reactions, comments, likes) and bulk management capabilities.

---

## 2. Features

| Feature | Description |
|---------|-------------|
| Status tabs | All / Published / Draft / Scheduled / Archived |
| Content types | Announcement, Poll, Survey, Event |
| Priority levels | High / Medium / Low (colour-coded) |
| List / Grid views | Toggle between DataTable and card grid layout |
| Search | Free-text search across title, description, author |
| Multi-filter panel | Type, Priority, Status[], Author[], Date range |
| Column visibility | Toggle visible columns in table view |
| Sort | title, type, priority, author, date, engagement, status |
| Pin / Unpin | Pinned posts always appear at top of sort |
| Publish workflow | draft → scheduled → published → archived |
| Per-post analytics | Open `AnnouncementAnalyticsDialog` sheet (views, reactions, comments timeline) |
| Reactions | 6 emoji: ❤️ 👍 🎉 😊 💡 👏 |
| Comments | Nested replies, edit history, per-comment likes |
| View tracking | `POST /api/announcements/:id/track-view` — logs device, browser, source, hasEngaged |
| Poll voting | Single or multi-select options, anonymous option, expiry date |
| Bulk delete | Multi-select rows → delete |
| Export | Excel / CSV / PDF of filtered list |
| Notification push | `createNotification` triggered on new announcement creation |
| Image layout | content-only \| content-with-image (left/top/right) \| image-only |

---

## 3. Frontend Dependencies

### Zustand Stores

| Store | Actions Used | Data Used |
|-------|-------------|-----------|
| `useAnnouncementStore` | `fetchAnnouncements`, `addAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `toggleLike`, `addReaction`, `addComment`, `votePoll` | `announcements[]`, `isLoading` |
| `useAuthStore` | — | `user` (current user, used for authorId, userId in engagement) |

### Component Dependencies

```
src/
├── components/
│   ├── analytics/
│   │   └── AnnouncementAnalyticsDialog.tsx   ← Per-post analytics sheet
│   ├── DataTable/                             ← Table with sort/search/export
│   └── ui/                                   ← Shadcn/ui full set
├── store/
│   ├── announcementStore.ts
│   ├── authStore.ts
│   └── notificationStore.ts    ← Side effect only
└── services/
    └── api.ts
```

### NPM Packages Required

```json
{
  "date-fns": "^3.x",
  "lucide-react": "^0.4xx",
  "sonner": "^1.x",
  "xlsx": "^0.18.x",
  "jspdf": "^2.x"
}
```

---

## 4. API Endpoints

### 4.1 Announcements CRUD
```
GET    /api/announcements
POST   /api/announcements
PUT    /api/announcements/:id
DELETE /api/announcements/:id
```

**POST / PUT Request Body** (Announcement):
```json
{
  "title": "string",
  "description": "string",
  "content": "string",
  "priority": "high|medium|low",
  "category": "General|HR|IT|Policy|Event|...",
  "author": "string",
  "authorId": "string",
  "employeeId": "string",
  "role": "string",
  "status": "draft|published|scheduled|archived",
  "scheduledAt": "ISO date string",
  "expiresAt": "ISO date string",
  "targetDepartments": ["Engineering", "HR"],
  "notifyByEmail": true,
  "isPinned": false,
  "imageUrl": "string",
  "layoutType": "content-only|content-with-image|image-only",
  "subLayout": "left-image|top-image|right-image",
  "isPoll": false,
  "pollOptions": [
    { "id": "uuid", "text": "Option text", "votes": 0, "votedBy": [] }
  ],
  "allowMultipleAnswers": false,
  "isAnonymous": false,
  "pollExpiresAt": "ISO date string"
}
```

**GET Response shape**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "mongoid",
      "id": "mongoid",
      "title": "...",
      "description": "...",
      "author": "HR Admin",
      "date": "2024-01-15T10:00:00.000Z",
      "time": "10:00 AM",
      "priority": "high",
      "likes": 5,
      "likedBy": ["EMP001"],
      "comments": [],
      "reactions": [],
      "views": 42,
      "viewDetails": [],
      "isPinned": false,
      "status": "published",
      "isPoll": false,
      "engagementRate": 35.5
    }
  ]
}
```

### 4.2 Engagement Endpoints

```
POST /api/announcements/:id/like
Body: { "userId": "EMP001", "userName": "John", "department": "Engineering", "role": "EMPLOYEE" }

POST /api/announcements/:id/react
Body: { "oderId": "EMP001", "userName": "John", "emoji": "❤️", "label": "Love" }

POST /api/announcements/:id/comment
Body: { "id": "uuid", "author": "John", "userName": "John", "employeeId": "EMP001",
        "department": "Engineering", "role": "EMPLOYEE", "text": "Great post!",
        "time": "10:05 AM", "timestamp": "ISO date" }

POST /api/announcements/:id/vote
Body: { "optionIds": ["opt1"], "oderId": "EMP001" }

POST /api/announcements/:id/track-view
Body: {
  "employeeId": "EMP001",
  "userName": "John Doe",
  "department": "Engineering",
  "role": "EMPLOYEE",
  "device": "desktop|mobile",
  "browser": "Chrome",
  "viewSource": "dashboard|email|direct-link|notification"
}
```

### 4.3 Notification Side-Effect (on create)
```
POST /api/notifications
Body: {
  "title": "🔴 New Announcement",
  "description": "HR Admin posted: Policy Update",
  "type": "announcement",
  "role": "all",
  "meta": { "announcementId": "id", "priority": "high", "actionUrl": "/dashboard" }
}
```

---

## 5. Database Collections & Schemas

### 5.1 `announcements` (Model: `server/src/models/Announcement.ts`)

#### Core fields

| Field | Type | Notes |
|-------|------|-------|
| `title` | String (required) | Post title |
| `description` | String | Summary text |
| `content` | String | Rich text / HTML |
| `priority` | String enum | `low\|medium\|high\|Medium\|High\|Critical` |
| `category` | String enum | General, HR, IT, Policy, Event, etc. |
| `author` | String | Display name of poster |
| `authorId` / `employeeId` | String | EmployeeId of poster |
| `role` | String | Role of poster |
| `status` | String | `draft\|published\|scheduled\|archived` |
| `scheduledAt` | Date | Publish time for scheduled posts |
| `expiresAt` | Date | Auto-archive time |
| `targetDepartments` | String[] | Audience restriction |
| `notifyByEmail` | Boolean | Trigger email notification |
| `isPinned` | Boolean | Float to top |
| `imageUrl` | String | Attached image URL |
| `layoutType` | String | `content-only\|content-with-image\|image-only` |
| `subLayout` | String | `left-image\|top-image\|right-image` |
| `likes` | Number | Aggregate like count |
| `likedBy` | String[] | Array of employeeIds |

#### Engagement sub-documents

**Reaction** (array):
```
employeeId, userName, department, role, emoji, label, timestamp, device, location
```

**Comment** (array):
```
id, employeeId, userName, department, role, text, timestamp, device,
likedBy[], likesCount, replies[], isEdited, editHistory[]
```

**ViewDetail** (array):
```
employeeId, userName, department, role, location, timestamp, duration(secs),
device, browser, viewSource, hasEngaged
```

#### Analytics aggregated fields
```
views, viewsCount, reactionsCount, commentsCount, sharesCount, engagementRate,
firstReactedBy, firstReactedAt, latestReactedBy, latestReactedAt,
firstCommentedBy, firstCommentedAt
```

#### Poll fields
```
isPoll, pollOptions[{id, text, votes, votedBy[]}],
allowMultipleAnswers, isAnonymous, pollExpiresAt, totalVotes
```

---

## 6. State Interfaces

### StatusTab
```typescript
type StatusTab = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';
```

### SortColumn
```typescript
type SortColumn = 'title' | 'type' | 'priority' | 'author' | 'date' | 'engagement' | 'status';
```

### Filter State
```typescript
interface AnnouncementsFilterState {
  searchQuery: string;
  activeTab: StatusTab;
  filterType: 'all' | 'announcement' | 'poll' | 'survey' | 'event';
  filterPriority: 'all' | 'high' | 'medium' | 'low';
  filterStatus: string[];
  filterAuthor: string[];
  fromDate: Date | undefined;
  toDate: Date | undefined;
  sortColumn: SortColumn | null;
  sortDirection: 'asc' | 'desc' | null;
  viewMode: 'table' | 'cards';
  columnVisibility: Record<string, boolean>;
}
```

### Announcement Interface (from store)
```typescript
interface Announcement {
  id: number | string;
  title: string;
  description: string;
  author: string;
  authorId?: string;
  employeeId?: string;
  role: string;
  date: string;
  time: string;
  avatar: string;
  priority: 'high' | 'medium' | 'low';
  likes: number;
  liked?: boolean;
  likedBy: string[];
  reactions?: Reaction[];
  comments: Comment[];
  imageUrl?: string;
  isPinned?: boolean;
  category?: string;
  views?: number;
  viewDetails?: ViewDetail[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  expiresAt?: string;
  scheduledAt?: string;
  targetDepartments?: string[];
  notifyByEmail?: boolean;
  layoutType?: 'content-only' | 'content-with-image' | 'image-only';
  subLayout?: 'left-image' | 'top-image' | 'right-image';
  isPoll?: boolean;
  pollOptions?: PollOption[];
  allowMultipleAnswers?: boolean;
  isAnonymous?: boolean;
  pollExpiresAt?: string;
  totalVotes?: number;
  engagementRate?: number;
}
```

---

## 7. AnnouncementAnalyticsDialog

**File**: `src/components/analytics/AnnouncementAnalyticsDialog.tsx`  
**Opens as**: right-side Sheet (drawer)  
**Triggered by**: "Analytics" action on each row/card (bar chart icon)

**Props**:
```typescript
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement;   // Full announcement object passed directly
}
```

**Tabs**:
1. **Overview** — Total views, reactions, comments, engagement rate; first/latest reactor; activity timeline chart
2. **Views** — Table of viewer: name, department, role, device, time, hasEngaged flag
3. **Reactions** — List with emoji filter, breakdown pie chart
4. **Comments** — Thread view with reply depth

---

## 8. Integration Points / Data Dependencies

| Dependency | Source module | Data needed |
|-----------|--------------|-------------|
| Auth user | Auth module | `user.employeeId`, `user.name`, `user.department`, `user.role` |
| Employee reference | Employee module | Author name/avatar on display only |
| Notifications | Notification module | `createNotification()` on publish |
| Dashboard display | Employee/HR Dashboard | Reads `useAnnouncementStore.announcements[]` |

---

## 9. Side Effects / Events

- **On create**: Triggers `createNotification` with `role: 'all'` → pushes to notification bell for all users
- **On like/react/comment**: Updates Zustand store optimistically + persists to MongoDB via API
- **On view**: `POST .../track-view` logs analytics on card expand (session-deduped per `trackedViews` Set)
- **On schedule**: `status = 'scheduled'`, `scheduledAt` set — backend must poll/cron to auto-publish
- **On archive**: Moves to archived tab, still retrievable

---

## 10. Reaction Emojis Reference

```typescript
const reactionEmojis = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '👍', label: 'Like' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '💡', label: 'Insightful' },
  { emoji: '👏', label: 'Applause' },
];
```
