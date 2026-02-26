# Recognition & Celebrations Module - Complete Specification

## 📋 Overview

The **Recognition & Celebrations Module** is a comprehensive HR tool for managing employee recognition, milestones, birthdays, work anniversaries, and custom celebrations. It enables HR to acknowledge achievements, boost morale, and maintain a culture of appreciation.

---

## 🎯 Features

### Core Functionality
- **Birthday Tracking**: Automatic birthday detection and celebration scheduling
- **Work Anniversary Management**: Multi-year milestone tracking (1, 5, 10, 15, 20, 25+ years)
- **Achievement Recognition**: Spot recognition, awards, promotions
- **Team Awards**: Department and team-based recognition
- **Custom Celebrations**: Flexible event creation for any occasion
- **Automated Notifications**: Email and in-app notifications to employees and teams
- **Budget Tracking**: Track allocated vs. used celebration budgets
- **Status Management**: Draft, Scheduled, Upcoming, Celebrated, Missed

### UI Features
- Multi-view display (Calendar, List, Card views)
- Advanced filtering (Event type, Status, Department, Location, Date range, Milestone)
- Bulk actions (Mark multiple as celebrated/missed, Send bulk emails)
- Quick stats dashboard (Upcoming events, Total budget, Celebrated count)
- Export to Excel/CSV
- Rich celebration creation form with media upload
- Employee search and auto-populate

---

## 🗄️ Database Collections

### 1. Celebrations Collection
**Model File**: `server/src/models/Celebration.ts`

```typescript
{
  celebrationId: String,              // Auto-generated: CEL-00001
  employeeId: String,                 // Reference to Employee
  employeeName: String,               // Denormalized for quick access
  department: String,                 // Employee's department
  location: String,                   // Employee's location
  
  eventType: String,                  // Enum: birthday, anniversary, achievement, 
                                      // promotion, spot-recognition, team-award, custom
  eventTitle: String,                 // Display title
  eventDate: Date,                    // When to celebrate
  description: String,                // Celebration details
  
  recognitionCategory: String,        // Enum: excellence, innovation, leadership, 
                                      // teamwork, customer-service, milestone, other
  milestoneYears: Number,             // For anniversaries (1, 5, 10, 15, 20, 25+)
  
  status: String,                     // Enum: draft, scheduled, upcoming, 
                                      // celebrated, missed (default: upcoming)
  visibility: String,                 // Enum: public, team, private (default: public)
  
  notifyEmployee: Boolean,            // Send notification to employee
  notifyTeam: Boolean,                // Send notification to team
  sendEmail: Boolean,                 // Send email notification
  
  awardDetails: String,               // Trophy, certificate, gift details
  budgetAllocated: Number,            // Budget for this celebration (default: 0)
  budgetUsed: Number,                 // Actual amount spent (default: 0)
  
  celebratedBy: String,               // HR admin who marked as celebrated
  celebratedDate: Date,               // When it was actually celebrated
  
  createdBy: String,                  // HR admin who created
  message: String,                    // Custom message for employee
  avatar: String,                     // Employee profile image URL
  
  createdAt: Date,                    // Auto-timestamp
  updatedAt: Date                     // Auto-timestamp
}
```

**Indexes**:
```typescript
celebrationId: unique
eventDate: 1 (ascending)
employeeId: 1
status: 1
department: 1
```

---

## 🔌 API Endpoints

### Base URL: `/api/celebrations`

#### 1. Get All Celebrations
```http
GET /api/celebrations
```

**Query Parameters**:
- `eventType`: Filter by type (birthday, anniversary, achievement, etc.)
- `status`: Filter by status (draft, scheduled, upcoming, celebrated, missed)
- `department`: Filter by department
- `location`: Filter by location
- `dateFrom`: Start date filter (ISO format)
- `dateTo`: End date filter (ISO format)
- `milestone`: Filter anniversaries by milestone years (1, 5, 10, etc.)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f3a...",
      "celebrationId": "CEL-00001",
      "employeeId": "EMP001",
      "employeeName": "John Doe",
      "department": "Engineering",
      "eventType": "birthday",
      "eventTitle": "John's Birthday Celebration",
      "eventDate": "2026-03-15T00:00:00.000Z",
      "status": "upcoming",
      ...
    }
  ]
}
```

#### 2. Get Celebration by ID
```http
GET /api/celebrations/:id
```

#### 3. Create Celebration
```http
POST /api/celebrations
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "employeeName": "John Doe",
  "department": "Engineering",
  "location": "Bangalore",
  "eventType": "achievement",
  "eventTitle": "Employee of the Month",
  "eventDate": "2026-03-20",
  "description": "Outstanding performance in Q1",
  "recognitionCategory": "excellence",
  "visibility": "public",
  "notifyEmployee": true,
  "notifyTeam": true,
  "sendEmail": true,
  "budgetAllocated": 5000,
  "awardDetails": "Certificate and Gift Voucher",
  "message": "Congratulations on your exceptional work!",
  "createdBy": "HR001"
}
```

#### 4. Update Celebration
```http
PUT /api/celebrations/:id
```

#### 5. Mark as Celebrated
```http
PATCH /api/celebrations/:id/celebrate
```

**Request Body**:
```json
{
  "celebratedBy": "HR001",
  "budgetUsed": 4500,
  "celebratedDate": "2026-03-20"
}
```

#### 6. Mark as Missed
```http
PATCH /api/celebrations/:id/missed
```

#### 7. Bulk Mark as Celebrated
```http
POST /api/celebrations/bulk-celebrate
```

**Request Body**:
```json
{
  "celebrationIds": ["CEL-00001", "CEL-00002"],
  "celebratedBy": "HR001"
}
```

#### 8. Send Celebration Email
```http
POST /api/celebrations/:id/send-email
```

#### 9. Get Upcoming Birthdays
```http
GET /api/celebrations/upcoming/birthdays
```

**Query Parameters**:
- `days`: Number of days to look ahead (default: 30)
- `department`: Filter by department

#### 10. Get Upcoming Anniversaries
```http
GET /api/celebrations/upcoming/anniversaries
```

**Query Parameters**:
- `days`: Number of days to look ahead (default: 60)
- `milestoneOnly`: Show only milestone years (5, 10, 15, etc.)

#### 11. Delete Celebration
```http
DELETE /api/celebrations/:id
```

#### 12. Get Statistics
```http
GET /api/celebrations/stats/overview
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCelebrations": 145,
    "upcoming": 23,
    "celebrated": 98,
    "missed": 12,
    "totalBudgetAllocated": 250000,
    "totalBudgetUsed": 187500,
    "byEventType": {
      "birthday": 52,
      "anniversary": 18,
      "achievement": 45,
      "promotion": 12,
      "spot-recognition": 18
    },
    "upcomingThisMonth": 12,
    "milestoneAnniversaries": 5
  }
}
```

---

## 📦 Component Structure

### Page Component
**File**: `src/pages/hr/RecognitionCelebrations.tsx`

**Main Component**: `RecognitionCelebrations`

**State Management**:
```typescript
const [celebrations, setCelebrations] = useState<Celebration[]>([]);
const [filteredCelebrations, setFilteredCelebrations] = useState<Celebration[]>([]);
const [loading, setLoading] = useState(false);
const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'cards'>('list');
const [selectedCelebrations, setSelectedCelebrations] = useState<string[]>([]);
const [filters, setFilters] = useState({
  eventType: 'all',
  status: 'all',
  department: 'all',
  location: 'all',
  dateFrom: null,
  dateTo: null,
  search: ''
});
const [stats, setStats] = useState({
  total: 0,
  upcoming: 0,
  celebrated: 0,
  totalBudget: 0
});
```

**Key Functions**:
- `fetchCelebrations()`: Load all celebrations with filters
- `handleCreateCelebration()`: Show create form
- `handleEditCelebration()`: Edit existing celebration
- `handleMarkCelebrated()`: Mark single/multiple as celebrated
- `handleMarkMissed()`: Mark as missed
- `handleSendEmail()`: Send celebration notification
- `handleBulkActions()`: Process bulk operations
- `handleExport()`: Export to Excel/CSV
- `applyFilters()`: Apply filter criteria

### Sub-Components

#### 1. CelebrationForm (Sheet/Dialog)
**Purpose**: Create/Edit celebration
**Props**: `celebration, onSave, onClose, employees`

#### 2. CelebrationCard
**Purpose**: Display celebration in card view
**Props**: `celebration, onEdit, onDelete, onMarkCelebrated`

#### 3. CelebrationCalendar
**Purpose**: Calendar view of celebrations
**Props**: `celebrations, onDateSelect, onEventClick`

#### 4. StatsCards
**Purpose**: Display quick statistics
**Props**: `stats`

#### 5. FilterPanel
**Purpose**: Advanced filtering
**Props**: `filters, onFilterChange, departments, locations`

#### 6. BulkActionToolbar
**Purpose**: Bulk operations
**Props**: `selectedCount, onMarkCelebrated, onMarkMissed, onSendEmail, onClear`

---

## 🔧 Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.263.1",
    "sonner": "^1.0.0",
    "axios": "^1.5.0"
  }
}
```

### UI Components (ShadCN)
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
```

### Icons (Lucide React)
```typescript
import {
  Cake, Award, Calendar, Filter, Plus, Download, Mail, 
  Trash2, Check, Gift, ChevronDown, Search, X, Loader2, 
  PartyPopper, Columns3, FileText
} from 'lucide-react';
```

### Utilities
```typescript
import { toast } from 'sonner';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuthStore } from '@/store/authStore';
```

---

## 🎨 UI/UX Patterns

### Color Coding by Event Type
```typescript
const eventTypeColors = {
  'birthday': 'bg-pink-100 text-pink-700 border-pink-200',
  'anniversary': 'bg-purple-100 text-purple-700 border-purple-200',
  'achievement': 'bg-blue-100 text-blue-700 border-blue-200',
  'promotion': 'bg-green-100 text-green-700 border-green-200',
  'spot-recognition': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'team-award': 'bg-orange-100 text-orange-700 border-orange-200',
  'custom': 'bg-gray-100 text-gray-700 border-gray-200'
};
```

### Status Badges
```typescript
const statusBadges = {
  'draft': <Badge variant="outline">Draft</Badge>,
  'scheduled': <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>,
  'upcoming': <Badge className="bg-yellow-100 text-yellow-700">Upcoming</Badge>,
  'celebrated': <Badge className="bg-green-100 text-green-700">Celebrated</Badge>,
  'missed': <Badge variant="destructive">Missed</Badge>
};
```

---

## 📊 Data Table Configuration

```typescript
const columns = [
  {
    key: 'celebrationId',
    label: 'ID',
    sortable: true,
    width: '120px'
  },
  {
    key: 'employeeName',
    label: 'Employee',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <EmployeeAvatar name={row.employeeName} src={row.avatar} size="sm" />
        <div>
          <p className="font-medium">{row.employeeName}</p>
          <p className="text-xs text-muted-foreground">{row.employeeId}</p>
        </div>
      </div>
    )
  },
  {
    key: 'eventType',
    label: 'Type',
    sortable: true,
    render: (row) => (
      <Badge className={eventTypeColors[row.eventType]}>
        {row.eventType}
      </Badge>
    )
  },
  {
    key: 'eventDate',
    label: 'Date',
    sortable: true,
    render: (row) => format(new Date(row.eventDate), 'MMM dd, yyyy')
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (row) => statusBadges[row.status]
  },
  {
    key: 'budgetAllocated',
    label: 'Budget',
    sortable: true,
    align: 'right',
    render: (row) => `₹${row.budgetAllocated.toLocaleString()}`
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
    width: '100px'
  }
];
```

---

## 🔄 Integration Points

### 1. Employee Data Integration
```typescript
// Fetch employee details when creating celebration
const fetchEmployeeDetails = async (employeeId: string) => {
  const response = await fetch(`/api/employees/${employeeId}`);
  const { data } = await response.json();
  return {
    employeeId: data.employeeId,
    employeeName: data.name,
    department: data.department,
    location: data.location,
    dateOfBirth: data.dateOfBirth,
    dateOfJoining: data.dateOfJoining,
    avatar: data.profilePhoto
  };
};
```

### 2. Notification Integration
```typescript
// After creating/updating celebration
await fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({
    recipientId: celebration.employeeId,
    type: 'celebration',
    title: `${celebration.eventTitle}`,
    message: celebration.message,
    link: `/celebrations/${celebration.celebrationId}`
  })
});
```

### 3. Email Integration
```typescript
// Send celebration email
await fetch(`/api/celebrations/${celebrationId}/send-email`, {
  method: 'POST',
  body: JSON.stringify({
    to: employee.email,
    cc: teamEmails,
    subject: `Celebrating ${eventTitle}`,
    template: 'celebration',
    data: celebration
  })
});
```

---

## 🚀 Implementation Checklist

### Backend Setup
- [x] Create Celebration model with schema
- [x] Implement celebration routes
- [x] Add celebration statistics endpoint
- [x] Set up celebration ID auto-generation
- [ ] Add email notification service
- [ ] Implement bulk operations
- [ ] Add celebration reminders cron job

### Frontend Setup
- [x] Create RecognitionCelebrations page component
- [x] Build celebration form (Sheet)
- [x] Implement data table with sorting/filtering
- [x] Add multi-view support (List/Calendar/Cards)
- [x] Create filter panel
- [x] Add bulk action toolbar
- [ ] Implement Excel export
- [ ] Add celebration calendar view
- [ ] Build celebration analytics dashboard

### Testing
- [ ] Test celebration CRUD operations
- [ ] Verify auto-detection of birthdays/anniversaries
- [ ] Test bulk operations
- [ ] Verify email notifications
- [ ] Test filter combinations
- [ ] Validate budget tracking
- [ ] Test milestone detection

---

## 📝 Usage Example

```typescript
// In your HR dashboard
import RecognitionCelebrations from '@/pages/hr/RecognitionCelebrations';

function HRDashboard() {
  return (
    <div>
      <RecognitionCelebrations />
    </div>
  );
}
```

---

## 🔐 Access Control

**Allowed Roles**: `HR`, `SUPER_ADMIN`, `RMG`

**Permissions**:
- **HR/SUPER_ADMIN**: Full access (create, edit, delete, mark celebrated)
- **RMG**: View and create only
- **Managers**: View celebrations for their team
- **Employees**: View public celebrations only

---

## 📈 Future Enhancements

1. **Automated Birthday/Anniversary Detection**: Cron job to auto-create celebrations
2. **Social Feed Integration**: Post celebrations to company feed
3. **E-Cards**: Digital greeting cards for employees
4. **Gift Integration**: Link to gift/voucher ordering system
5. **Analytics Dashboard**: Celebration trends, engagement metrics
6. **Mobile App**: Push notifications for celebrations
7. **Gamification**: Recognition points and leaderboards

---

## 📞 Support

For integration support or questions, contact the development team or refer to:
- API Documentation: `docs/BACKEND_API_SPEC.md`
- Component Library: `docs/DESIGN_SYSTEM.md`
- Database Schema: `server/src/models/Celebration.ts`
