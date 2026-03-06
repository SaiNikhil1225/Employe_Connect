# Module 03 — Recognition & Celebrations

**File**: `src/pages/hr/RecognitionCelebrations.tsx`  
**Route**: `/hr/recognition-celebrations`  
**Access**: HR, SUPER_ADMIN roles  
**Lines**: ~1,728

---

## 1. Page Overview

The Recognition & Celebrations page unifies four related functions:
1. **Upcoming Birthdays** — Employees with birthdays in the next 7 days (from backend)
2. **Upcoming Anniversaries** — Employees with work anniversaries in the next 30 days
3. **Celebrations DataTable** — CRUD for manually created celebration events (birthdays, anniversaries, achievements, promotions, spot recognition, team awards)
4. **Recognition Analytics** — Per-post engagement analytics for `rec-` prefixed posts in `recognitionPostStore`

---

## 2. Features

| Feature | Description |
|---------|-------------|
| Upcoming Birthdays list | Next 7 days — `GET /api/celebrations/birthdays/upcoming?days=7` |
| Monthly Birthdays summary | `GET /api/celebrations/birthdays/month?month=&year=` |
| Upcoming Anniversaries list | Next 30 days — `GET /api/celebrations/anniversaries/upcoming?days=30` |
| Celebrations DataTable | Filterable by event type + status; sortable |
| Create Celebration (Sheet drawer) | Form with employee ID auto-fill → name/dept/location lookup |
| Mark as Celebrated | `POST /api/celebrations/:id/mark-celebrated` |
| Delete Celebration | `DELETE /api/celebrations/:id/delete` |
| Email notification flag | `sendEmail: true` triggers email on creation |
| Recognition post analytics | Analytics sheet for `rec-` prefix posts from `recognitionPostStore` |
| Date range filter | From / To date filter on celebrations table |
| Event type filter | All / Birthday / Anniversary / Achievement / Promotion / Spot-recognition / Team-award |
| Status filter | All / Draft / Scheduled / Upcoming / Celebrated / Missed |
| Create New Event (Sheet) | Separate event creation form with RSVP, venue, mode, max attendees |
| Stats cards | Total events, birthdays count, anniversaries count, filtered counts |
| Column visibility toggle | Show/hide columns in table |

---

## 3. Frontend Dependencies

### Zustand Stores

| Store | Actions Used | Data Used |
|-------|-------------|-----------|
| `useRecognitionPostStore` | `trackView`, `toggleLike`, `addReaction`, `addComment` | `posts[]` — for analytics only |

> Note: This page does **not** use `useEmployeeStore` or `useAnnouncementStore`. Employee data is fetched on-demand via `apiClient` when filling the celebration form.

### Component Dependencies

```
src/
├── components/
│   ├── analytics/
│   │   └── RecognitionAnalyticsDialog.tsx   ← Analytics sheet for rec- posts
│   ├── DataTable/                            ← Celebrations table
│   └── ui/                                  ← Shadcn/ui full set
├── store/
│   └── recognitionPostStore.ts
└── services/
    └── api.ts          ← apiClient.get('/employees/:id') for auto-fill
```

### NPM Packages Required

```json
{
  "date-fns": "^3.x",
  "lucide-react": "^0.4xx",
  "sonner": "^1.x"
}
```

---

## 4. API Endpoints

### 4.1 Celebrations CRUD

```
GET  /api/celebrations                    ?eventType=birthday&status=upcoming
POST /api/celebrations/create
DELETE /api/celebrations/:id/delete
POST /api/celebrations/:id/mark-celebrated
```

**POST /api/celebrations/create — Request Body**:
```json
{
  "employeeId": "EMP001",
  "employeeName": "Jane Doe",
  "department": "Engineering",
  "location": "Hyderabad",
  "eventType": "birthday|anniversary|achievement|promotion|spot-recognition|team-award|custom",
  "eventTitle": "Happy Birthday Jane!",
  "eventDate": "2024-07-15T00:00:00.000Z",
  "description": "Wishing Jane a wonderful birthday",
  "recognitionCategory": "excellence|innovation|leadership|teamwork|customer-service|milestone|other",
  "visibility": "public|team|private",
  "notifyEmployee": true,
  "notifyTeam": false,
  "sendEmail": true,
  "awardDetails": "Gift card $50",
  "budgetAllocated": 50,
  "status": "upcoming",
  "createdBy": "HR Admin"
}
```

**GET /api/celebrations — Response Shape**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "mongoid",
      "celebrationId": "CEL-00001",
      "employeeId": "EMP001",
      "employeeName": "Jane Doe",
      "department": "Engineering",
      "location": "Hyderabad",
      "eventType": "birthday",
      "eventTitle": "Happy Birthday Jane!",
      "eventDate": "2024-07-15T00:00:00.000Z",
      "description": "...",
      "status": "upcoming",
      "visibility": "public",
      "notifyEmployee": true,
      "notifyTeam": false,
      "sendEmail": true,
      "budgetAllocated": 50,
      "budgetUsed": 0,
      "celebratedBy": null,
      "celebratedDate": null,
      "createdBy": "HR Admin",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**POST /api/celebrations/:id/mark-celebrated — Request Body**:
```json
{ "celebratedBy": "HR Admin" }
```

### 4.2 Birthday Endpoints

```
GET /api/celebrations/birthdays/upcoming?days=7
```
**Response**: `{ "success": true, "data": [ { employeeId, name, department, location, birthdayDate, daysUntil, email, phone, profilePhoto? } ] }`

```
GET /api/celebrations/birthdays/month?month=6&year=2024
```
**Response**: `{ "success": true, "data": { "total": 5, "employees": [...] } }`

### 4.3 Anniversary Endpoints

```
GET /api/celebrations/anniversaries/upcoming?days=30
```
**Response**: `{ "success": true, "data": [ { employeeId, name, department, location, anniversaryDate, yearsOfService, milestoneType, daysUntil, email, phone, profilePhoto? } ] }`

### 4.4 Employee Auto-fill (on form)

```
GET /api/employees/:employeeId
```
Used when HR types an employee ID in the form — auto-fills name, department, location.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": "EMP001",
    "name": "Jane Doe",
    "firstName": "Jane",
    "lastName": "Doe",
    "department": "Engineering",
    "location": "Hyderabad"
  }
}
```

---

## 5. Database Collections & Schemas

### 5.1 `celebrations` (Model: `server/src/models/Celebration.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `celebrationId` | String (unique, auto-gen) | Format: `CEL-00001` |
| `employeeId` | String (required, ref: Employee) | The employee being celebrated |
| `employeeName` | String (required) | Denormalized display name |
| `department` | String | Denormalized department |
| `location` | String | Denormalized location |
| `eventType` | String enum | `birthday\|anniversary\|achievement\|promotion\|spot-recognition\|team-award\|custom` |
| `eventTitle` | String (required) | Title of the event |
| `eventDate` | Date (required) | When the event occurs |
| `description` | String | Event details |
| `recognitionCategory` | String enum | `excellence\|innovation\|leadership\|teamwork\|customer-service\|milestone\|other` |
| `milestoneYears` | Number | For anniversary events (1, 5, 10, 15, 20, 25+) |
| `status` | String enum | `draft\|scheduled\|upcoming\|celebrated\|missed` |
| `visibility` | String enum | `public\|team\|private` |
| `notifyEmployee` | Boolean | Send notification to the employee |
| `notifyTeam` | Boolean | Send notification to team |
| `sendEmail` | Boolean | Trigger email |
| `awardDetails` | String | Trophy, certificate, gift description |
| `budgetAllocated` | Number | Budget in currency units |
| `budgetUsed` | Number | Actual spend |
| `celebratedBy` | String | HR admin who marked as celebrated |
| `celebratedDate` | Date | When it was marked celebrated |
| `createdBy` | String (required) | HR admin who created |
| `message` | String | Optional personal message |
| `avatar` | String | URL to profile image |
| `createdAt` | Date | Auto (timestamps: true) |
| `updatedAt` | Date | Auto (timestamps: true) |

### 5.2 `employees` — Fields needed by celebration auto-fill

```
employeeId, name, firstName, lastName, department, location, email, phone,
dateOfBirth, dateOfJoining, profilePhoto/avatar
```

The birthday/anniversary upcoming endpoints are computed from `dateOfBirth` and `dateOfJoining` fields on `Employee` documents.

---

## 6. State Interfaces

### Core Data Types

```typescript
interface Birthday {
  employeeId: string;
  name: string;
  department: string;
  location: string;
  birthdayDate: string;
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
  anniversaryDate: string;
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
  eventDate: string;
  description: string;
  status: 'draft' | 'scheduled' | 'upcoming' | 'celebrated' | 'missed';
  milestoneYears?: number;
  budgetAllocated?: number;
  budgetUsed?: number;
  celebratedBy?: string;
  celebratedDate?: string;
  publishedBy?: string;
  publishedAt?: string;
}
```

### Create Celebration Form Data

```typescript
interface FormData {
  employeeId: string;
  employeeName: string;
  department: string;
  location: string;
  eventType: string;           // 'birthday' | 'anniversary' | 'achievement' | ...
  eventTitle: string;
  eventDate: Date;
  description: string;
  recognitionCategory: string;
  visibility: 'public' | 'team' | 'private';
  notifyEmployee: boolean;
  notifyTeam: boolean;
  sendEmail: boolean;
  awardDetails: string;
  budgetAllocated: number;
}
```

### Create New Event Form Data

```typescript
interface NewEventFormData {
  title: string;
  description: string;
  eventType: 'celebration' | 'team-event' | 'training' | 'social';
  category: 'company-wide' | 'department' | 'team';
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
  targetAudience: 'all' | 'department' | 'team';
  selectedDepartments: string[];
}
```

### Page Filter State

```typescript
interface CelebrationsFilterState {
  searchQuery: string;
  eventTypeFilter: 'all' | 'birthday' | 'anniversary' | 'achievement' | 'promotion' | 'spot-recognition' | 'team-award';
  statusFilter: 'all' | 'draft' | 'scheduled' | 'upcoming' | 'celebrated' | 'missed';
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  columnVisibility: Record<string, boolean>;
}
```

---

## 7. recognitionPostStore Interface

**File**: `src/store/recognitionPostStore.ts`

```typescript
interface RecognitionPost {
  id: string;                // 'rec-{employeeId}-{timestamp}'
  title: string;
  message: string;           // HTML rich text
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

interface RecognitionPostStore {
  posts: RecognitionPost[];
  addPost: (post: Omit<RecognitionPost, 'id' | 'likes' | 'likedBy' | 'reactions' | 'comments' | 'views' | 'viewDetails'>) => void;
  updatePost: (id: string, updates: Partial<RecognitionPost>) => void;
  deletePost: (id: string) => void;
  updateStatus: (id: string, status: 'draft' | 'published') => void;
  toggleLike: (id: string, userId: string) => void;
  addReaction: (id: string, reaction: ReactionDetail) => void;
  addComment: (id: string, comment: CommentDetail) => void;
  trackView: (id: string, viewerDetails: ViewDetail) => void;
}
```

> **Note**: `recognitionPostStore` uses Zustand with `persist` — data is stored in `localStorage`, not MongoDB. It is frontend-only. If the integrating module requires server-side persistence of recognition posts, a new API + model must be created.

---

## 8. RecognitionAnalyticsDialog

**File**: `src/components/analytics/RecognitionAnalyticsDialog.tsx`  
**Opens as**: right-side Sheet (~535 lines)  
**Shows for**: Only rows where `_id` starts with `rec-`

**Props**:
```typescript
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;        // The 'rec-...' id
  postTitle: string;     // Display title in header
}
```

**Tabs**:
1. **Overview** — 4 stat cards (views, likes, reactions, comments), First Reaction info, Latest Reaction info, engagement timeline chart
2. **Reactions** — Searchable reaction list + emoji type breakdown bar chart
3. **Comments** — All comments with timestamps
4. **Views** — Viewer list with name, department, device, timestamp

---

## 9. Integration Points / Data Dependencies

| Dependency | Source module | Data needed |
|-----------|--------------|-------------|
| Employee records | Employee module | `GET /api/employees/:id` for form auto-fill |
| Birthday data | Employee module (backend computed) | `dateOfBirth` field on Employee doc |
| Anniversary data | Employee module (backend computed) | `dateOfJoining` field on Employee doc |
| Recognition posts | `recognitionPostStore` (localStorage) | Posts for analytics only |
| Auth user | Auth module | `user` for `createdBy` field |

---

## 10. Side Effects / Events

- **On create celebration**: `fetchCelebrations()` re-runs to refresh the table
- **On mark celebrated**: Status updated to `'celebrated'`, `celebratedBy` and `celebratedDate` set
- **On delete**: Row removed from `celebrations[]` local state + server
- **Filter changes** (`eventTypeFilter`, `statusFilter`): triggers `fetchCelebrations()` via `useEffect`
- **`sendEmail: true`**: Backend should trigger email notification (implementation in server email service)
- **Analytics button visibility**: Only shown when row `_id` starts with `rec-` (i.e. is a recognition post stored in `recognitionPostStore`)

---

## 11. Backend Route Requirements

The following Express routes must be implemented:

```
router.get('/birthdays/upcoming', ...)         // Query: ?days=7 — scan employees.dateOfBirth
router.get('/birthdays/month', ...)            // Query: ?month=&year= — scan employees.dateOfBirth
router.get('/anniversaries/upcoming', ...)     // Query: ?days=30 — scan employees.dateOfJoining
router.get('/', ...)                           // Query: ?eventType=&status= — list celebrations
router.post('/create', ...)                    // Create celebration
router.post('/:id/mark-celebrated', ...)       // Mark status = 'celebrated'
router.delete('/:id/delete', ...)              // Delete celebration
```

All mounted under `/api/celebrations`.
