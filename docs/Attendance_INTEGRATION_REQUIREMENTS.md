# Employee Connect - Integration Requirements

## Document Overview
**Version**: 1.0  
**Last Updated**: February 27, 2026  
**Purpose**: Technical requirements and integration guide for HR Attendance Overview, My Attendance, Teams & Members, and Training & Development modules

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Dependencies](#database-dependencies)
3. [HR Attendance Overview Module](#hr-attendance-overview-module)
4. [User My Attendance Module](#user-my-attendance-module)
5. [Teams & Members Module](#teams--members-module)
6. [Training & Development Module](#training--development-module)
7. [Integration Guidelines](#integration-guidelines)
8. [API Authentication](#api-authentication)
9. [Environment Setup](#environment-setup)

---

## Technology Stack

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "typescript": "^5.6.2",
  "vite": "^6.0.1",
  
  "UI Libraries": {
    "@radix-ui/react-*": "Latest",
    "lucide-react": "^0.468.0",
    "tailwindcss": "^3.4.17"
  },
  
  "State Management": {
    "zustand": "^5.0.2"
  },
  
  "Form & Validation": {
    "react-hook-form": "^7.54.2",
    "zod": "^4.3.6",
    "@hookform/resolvers": "^5.2.2"
  },
  
  "Data Handling": {
    "axios": "^1.13.2",
    "date-fns": "^4.1.0",
    "xlsx": "^0.18.5"
  },
  
  "Notifications": {
    "sonner": "^1.7.1"
  },
  
  "Tables": {
    "@tanstack/react-table": "^8.21.3"
  },
  
  "Rich Text": {
    "@tiptap/react": "^3.12.1",
    "@tiptap/starter-kit": "^3.12.1"
  },
  
  "Charts": {
    "recharts": "^2.15.0"
  }
}
```

### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "typescript": "Latest",
  "mongoose": "^8.0.3",
  
  "Authentication": {
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^6.0.0",
    "bcryptjs": "^2.4.3"
  },
  
  "Security": {
    "helmet": "^8.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^8.2.1",
    "express-validator": "^7.0.1",
    "csurf": "^1.11.0"
  },
  
  "File Handling": {
    "multer": "^2.0.2",
    "exceljs": "^4.4.0",
    "xlsx": "^0.18.5"
  },
  
  "Logging": {
    "winston": "^3.19.0",
    "winston-daily-rotate-file": "^5.0.0",
    "morgan": "^1.10.0"
  },
  
  "Environment": {
    "dotenv": "^16.3.1"
  }
}
```

---

## Database Dependencies

### MongoDB Collections Required

#### 1. AttendanceLogs Collection
**Collection Name**: `attendancelogs`

**Schema**:
```typescript
{
  employeeId: string (indexed, required)
  employeeName: string (required)
  department: string (required)
  date: Date (indexed, required)
  checkInTime?: Date
  checkOutTime?: Date
  breakDuration: number (default: 0, min: 0)
  effectiveHours: number (default: 0, min: 0)
  grossHours: number (default: 0, min: 0)
  status: 'present' | 'absent' | 'wfh' | 'leave' | 'weekly-off' | 'late' | 'half-day'
  isLate: boolean (default: false)
  lateMinutes: number (default: 0)
  hasTimeEntry: boolean (default: false)
  workLocation: 'office' | 'wfh' | 'hybrid' (default: 'office')
  regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected' (default: 'none')
  regularizationRequestId?: ObjectId (ref: 'RegularizationRequest')
  remarks?: string
  createdBy?: string
  updatedBy?: string
  timestamps: true
}
```

**Indexes**:
- `{ employeeId: 1, date: -1 }` - Composite index for employee queries
- `{ date: -1 }` - Date-based queries
- `{ department: 1 }` - Department filtering
- `{ status: 1 }` - Status filtering

#### 2. RegularizationRequests Collection
**Collection Name**: `regularizationrequests`

**Schema**:
```typescript
{
  employeeId: string (required, indexed)
  employeeName: string (required)
  department: string (required)
  date: Date (required)
  requestType: 'check-in' | 'check-out' | 'both' | 'full-day'
  proposedCheckIn?: Date
  proposedCheckOut?: Date
  reason: string (required)
  status: 'pending' | 'approved' | 'rejected' (default: 'pending')
  approvedBy?: string
  rejectedBy?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  attendanceLogId?: ObjectId (ref: 'AttendanceLog')
  timestamps: true
}
```

**Indexes**:
- `{ employeeId: 1, status: 1 }`
- `{ status: 1, createdAt: -1 }`
- `{ department: 1 }`

#### 3. WFHRequests Collection
**Collection Name**: `wfhrequests`

**Schema**:
```typescript
{
  employeeId: string (required, indexed)
  employeeName: string (required)
  department: string (required)
  date: Date (required, indexed)
  reason: string (required)
  status: 'pending' | 'approved' | 'rejected' (default: 'pending')
  approvedBy?: string
  rejectedBy?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  attendanceLogId?: ObjectId (ref: 'AttendanceLog')
  timestamps: true
}
```

**Indexes**:
- `{ employeeId: 1, date: -1 }`
- `{ status: 1 }`
- `{ date: -1 }`

#### 4. Groups Collection (Teams & Members)
**Collection Name**: `groups`

**Schema**:
```typescript
{
  groupId: string (unique)
  groupName: string (required, unique, trim)
  description: string (required, min: 10, max: 500)
  groupType: 'department' | 'project' | 'task-force' | 'committee' | 'cross-functional' | 'custom'
  category?: 'technical' | 'non-technical' | 'leadership' | 'support' | 'operations' | 'sales-marketing' | 'finance-admin'
  parentGroupId?: string (ref: 'Group')
  groupLeadId?: string (ref: 'Employee')
  department?: string
  location?: string
  maxMembers?: number (min: 0)
  status: 'active' | 'inactive' | 'archived' (default: 'active')
  visibility: 'public' | 'private' | 'restricted' (default: 'public')
  autoAssignNewHires: boolean (default: false)
  groupEmail?: string
  slackChannel?: string
  teamsChannel?: string
  createdBy: string (required)
  updatedBy?: string
  timestamps: true
}
```

**Indexes**:
- `{ groupId: 1 }` - Unique
- `{ groupName: 1 }` - Unique
- `{ status: 1, visibility: 1 }`
- `{ groupLeadId: 1 }`

#### 5. GroupMembers Collection
**Collection Name**: `groupmembers`

**Schema**:
```typescript
{
  groupId: string (required, indexed, ref: 'Group')
  employeeId: string (required, indexed, ref: 'Employee')
  employeeName: string (required)
  department: string
  designation: string
  role: 'member' | 'lead' | 'admin' | 'contributor' (default: 'member')
  joinedDate: Date (default: now)
  status: 'active' | 'inactive' | 'removed' (default: 'active')
  permissions?: string[]
  addedBy: string
  timestamps: true
}
```

**Indexes**:
- `{ groupId: 1, employeeId: 1 }` - Composite unique
- `{ employeeId: 1 }`
- `{ groupId: 1, status: 1 }`

#### 6. Trainings Collection
**Collection Name**: `trainings`

**Schema**:
```typescript
{
  trainingId: string (required, unique)
  trainingName: string (required, trim)
  trainingCategory: 'Technical' | 'Soft Skills' | 'Leadership' | 'Compliance' | 'Safety' | 'Product Knowledge' | etc.
  description: string (required)
  trainerName: string (required)
  trainerOrganization?: string
  trainingMode: 'Online' | 'Offline' | 'Hybrid' (required)
  startDate: Date (required)
  endDate: Date (required)
  durationHours: number (required, min: 0)
  maxParticipants: number (required, min: 1)
  currentEnrollments: number (default: 0)
  targetDepartments: string[]
  location?: string
  costPerEmployee: number (required, min: 0, default: 0)
  totalBudget: number (default: 0)
  certificationAvailable: boolean (default: false)
  certificationName?: string
  certificationValidityMonths?: number
  prerequisites: string[]
  trainingMaterials: Array<{ name: string, url: string, type: string }>
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled' (default: 'Scheduled')
  skillsToBeAcquired: string[]
  targetGrades: string[]
  targetEmploymentTypes: string[]
  timestamps: true
}
```

**Indexes**:
- `{ trainingId: 1 }` - Unique
- `{ status: 1, startDate: -1 }`
- `{ trainingCategory: 1 }`
- `{ targetDepartments: 1 }`

#### 7. TrainingEnrollments Collection
**Collection Name**: `trainingenrollments`

**Schema**:
```typescript
{
  trainingId: string (required, indexed, ref: 'Training')
  employeeId: string (required, indexed, ref: 'Employee')
  employeeName: string (required)
  department: string
  enrollmentDate: Date (default: now)
  status: 'Enrolled' | 'Completed' | 'Dropped' | 'Failed' | 'In Progress'
  attendance?: number (0-100)
  assessmentScore?: number (0-100)
  feedback?: string
  rating?: number (1-5)
  certificateIssued: boolean (default: false)
  certificateIssuedDate?: Date
  completionDate?: Date
  timestamps: true
}
```

**Indexes**:
- `{ trainingId: 1, employeeId: 1 }` - Composite unique
- `{ employeeId: 1, status: 1 }`
- `{ trainingId: 1 }`

#### 8. Employees Collection (Reference)
**Collection Name**: `employees`

**Key Fields Used**:
```typescript
{
  employeeId: string (unique, required)
  name: string (required)
  email: string (unique, required)
  department: string
  designation: string
  role: 'employee' | 'manager' | 'hr' | 'admin'
  reportingManager?: string
  joiningDate: Date
  status: 'active' | 'inactive'
}
```

---

## HR Attendance Overview Module

### Page Location
`src/pages/hr/AttendanceOverview.tsx`

### Features Implemented
1. **Statistics Dashboard**
   - Total employees count
   - Present employees today
   - Absent employees today
   - WFH employees today

2. **Team Attendance Logs Table**
   - Searchable by name, date, or status
   - Filterable by status (All/Present/Absent/WFH/Leave/Late)
   - Column visibility toggle
   - Columns: Employee ID, Name, Department, Date, Check In, Check Out, Effective Hours, Status, Late, Regularization Status

3. **Regularization Requests Management**
   - View all regularization requests
   - Search functionality
   - Filter by status (All/Pending/Approved/Rejected)
   - Bulk approve/reject actions
   - Individual approve/reject
   - Column toggle

4. **WFH Requests Management**
   - View all WFH requests
   - Search functionality
   - Filter by status
   - Bulk approve/reject actions
   - Individual actions
   - Column toggle

5. **Advanced Filtering**
   - Date range filters (from/to dates)
   - Department filter
   - Status filter

### API Endpoints Used

#### Statistics
```
GET /api/attendance/admin/stats?department={dept}
```
**Response**:
```json
{
  "totalEmployees": number,
  "presentToday": number,
  "absentToday": number,
  "wfhToday": number,
  "avgAttendanceRate": number,
  "avgWorkHours": number
}
```

#### Team Logs
```
GET /api/attendance/admin/team-logs?department={dept}&status={status}&startDate={date}&endDate={date}
```
**Response**:
```json
{
  "logs": [
    {
      "_id": string,
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "date": string (ISO),
      "checkInTime": string (ISO) | null,
      "checkOutTime": string (ISO) | null,
      "effectiveHours": number,
      "status": string,
      "isLate": boolean,
      "regularizationStatus": string
    }
  ]
}
```

#### Regularization Requests
```
GET /api/attendance/regularization-requests?status={status}
```
**Response**:
```json
{
  "requests": [
    {
      "_id": string,
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "date": string (ISO),
      "requestType": string,
      "proposedCheckIn": string (ISO),
      "proposedCheckOut": string (ISO),
      "reason": string,
      "status": string,
      "createdAt": string (ISO)
    }
  ]
}
```

```
PATCH /api/attendance/regularization-requests/:id/approve
```
**Headers**: `Authorization: Bearer {token}`

```
PATCH /api/attendance/regularization-requests/:id/reject
```
**Body**:
```json
{
  "reason": string
}
```

```
POST /api/attendance/bulk-approve
```
**Body**:
```json
{
  "requestIds": string[],
  "type": "regularization" | "wfh"
}
```

```
POST /api/attendance/bulk-reject
```
**Body**:
```json
{
  "requestIds": string[],
  "reason": string,
  "type": "regularization" | "wfh"
}
```

#### WFH Requests
```
GET /api/attendance/wfh-requests?status={status}
```
**Response**:
```json
{
  "requests": [
    {
      "_id": string,
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "date": string (ISO),
      "reason": string,
      "status": string,
      "approvedBy": string,
      "approvedAt": string (ISO),
      "createdAt": string (ISO)
    }
  ]
}
```

```
PATCH /api/attendance/wfh-requests/:id/approve
PATCH /api/attendance/wfh-requests/:id/reject
```

### State Management (Zustand Store)

**Store Path**: `src/store/attendanceStore.ts`

**Store Interface**:
```typescript
interface AttendanceStore {
  // State
  adminStats: AdminStats | null
  teamLogs: AttendanceLog[]
  regularizationRequests: RegularizationRequest[]
  wfhRequests: WFHRequest[]
  loading: boolean
  
  // Actions
  fetchAdminStats: (filters?: { department?: string }) => Promise<void>
  fetchTeamLogs: (filters?: FilterOptions) => Promise<void>
  fetchRegularizationRequests: () => Promise<void>
  fetchWFHRequests: () => Promise<void>
  approveRegularization: (id: string) => Promise<void>
  rejectRegularization: (id: string, reason: string) => Promise<void>
  approveWFHRequest: (id: string) => Promise<void>
  rejectWFHRequest: (id: string, reason: string) => Promise<void>
  bulkApprove: (requestIds: string[], type: 'regularization' | 'wfh') => Promise<void>
  bulkReject: (requestIds: string[], reason: string, type: 'regularization' | 'wfh') => Promise<void>
  exportData: (filters?: FilterOptions) => Promise<void>
}
```

### Component Dependencies
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
```

---

## User My Attendance Module

### Page Location
`src/pages/employee/MyAttendance.tsx`

### Features Implemented
1. **Web Clock-In/Clock-Out Widget**
   - Shows current time
   - Today's status (Present/Absent/WFH)
   - Clock In/Clock Out buttons
   - Current cumulative hours
   - Real-time duration updates

2. **Week Calendar View**
   - 7-day week view with navigation
   - Shows attendance status for each day
   - Check-in/out times display
   - Effective hours display

3. **Statistics Cards**
   - My average hours per day
   - On-time arrival rate
   - Team average hours

4. **Attendance Logs Table**
   - Searchable logs
   - Date range filtering (last week/month/3 months)
   - Columns: Date, Check In, Check Out, Hours Worked, Status, Actions
   - View details, request regularization options

5. **Request Forms**
   - WFH Request submission
   - Regularization request submission
   - Request history tracking

### API Endpoints Used

#### Employee Statistics
```
GET /api/attendance/stats?employeeId={id}
```
**Response**:
```json
{
  "me": {
    "avgHoursPerDay": number,
    "onTimeArrivalPercentage": number,
    "presentDays": number,
    "absentDays": number,
    "wfhDays": number,
    "totalDays": number
  },
  "myTeam": {
    "avgHoursPerDay": number
  }
}
```

#### Daily Timings
```
GET /api/attendance/timings/{employeeId}/{date}
```
**Response**:
```json
{
  "employeeId": string,
  "date": string (ISO),
  "checkInTime": string (ISO) | null,
  "checkOutTime": string (ISO) | null,
  "breakDuration": number,
  "effectiveHours": number,
  "cumulativeHours": number,
  "status": string,
  "sessions": [
    {
      "checkIn": string (ISO),
      "checkOut": string (ISO) | null,
      "duration": number
    }
  ]
}
```

#### Attendance Logs
```
GET /api/attendance/logs?employeeId={id}&startDate={date}&endDate={date}
```
**Response**:
```json
{
  "logs": [
    {
      "_id": string,
      "employeeId": string,
      "date": string (ISO),
      "checkInTime": string (ISO),
      "checkOutTime": string (ISO),
      "effectiveHours": number,
      "status": string,
      "isLate": boolean,
      "regularizationStatus": string
    }
  ]
}
```

#### Clock In/Out
```
POST /api/attendance/clock-in
```
**Body**:
```json
{
  "employeeId": string,
  "location": string (optional)
}
```
**Response**:
```json
{
  "success": boolean,
  "message": string,
  "checkInTime": string (ISO),
  "cumulativeHours": number
}
```

```
POST /api/attendance/clock-out
```
**Body**:
```json
{
  "employeeId": string
}
```
**Response**:
```json
{
  "success": boolean,
  "message": string,
  "checkOutTime": string (ISO),
  "effectiveHours": number,
  "cumulativeHours": number
}
```

#### Submit Regularization
```
POST /api/attendance/regularize
```
**Body**:
```json
{
  "employeeId": string,
  "date": string (ISO),
  "requestType": "check-in" | "check-out" | "both" | "full-day",
  "proposedCheckIn": string (ISO) | null,
  "proposedCheckOut": string (ISO) | null,
  "reason": string
}
```

#### Submit WFH Request
```
POST /api/attendance/wfh-request
```
**Body**:
```json
{
  "employeeId": string,
  "date": string (ISO),
  "reason": string
}
```

### Component Dependencies
```typescript
import { WebClockInModal } from '@/components/attendance/WebClockInModal'
import { WFHRequestModal } from '@/components/attendance/WFHRequestModal'
import { RegularizationModal } from '@/components/attendance/RegularizationModal'
import { useAttendanceStore } from '@/store/attendanceStore'
import { useAuthStore } from '@/store/authStore'
```

### Custom Components Required
- **WebClockInModal**: Modal for clock-in confirmation
- **WFHRequestModal**: Modal for WFH request submission
- **RegularizationModal**: Modal for attendance regularization

---

## Teams & Members Module

### Page Location
`src/pages/employee/TeamsAndMembers.tsx` (or similar)

### Features
1. **Groups/Teams Listing**
   - View all groups user is part of
   - Search groups
   - Filter by type/status

2. **Group Details**
   - Group information
   - Member list
   - Group lead information

3. **Group Management** (for leads/admins)
   - Create new groups
   - Edit group details
   - Add/remove members
   - Assign roles

### API Endpoints

#### Get Groups
```
GET /api/teams/groups?employeeId={id}&status={status}
```
**Response**:
```json
{
  "groups": [
    {
      "_id": string,
      "groupId": string,
      "groupName": string,
      "description": string,
      "groupType": string,
      "groupLeadId": string,
      "status": string,
      "memberCount": number,
      "createdAt": string (ISO)
    }
  ]
}
```

#### Get Group Details
```
GET /api/teams/groups/:id
```
**Response**:
```json
{
  "groupId": string,
  "groupName": string,
  "description": string,
  "groupType": string,
  "category": string,
  "groupLeadId": string,
  "department": string,
  "location": string,
  "maxMembers": number,
  "status": string,
  "visibility": string,
  "members": [
    {
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "designation": string,
      "role": string,
      "joinedDate": string (ISO)
    }
  ]
}
```

#### Create Group
```
POST /api/teams/groups
```
**Body**:
```json
{
  "groupName": string,
  "description": string,
  "groupType": string,
  "category": string,
  "groupLeadId": string,
  "department": string,
  "location": string,
  "maxMembers": number,
  "visibility": string
}
```

#### Update Group
```
PUT /api/teams/groups/:id
```
**Body**: Same as create

#### Get Group Members
```
GET /api/teams/groups/:groupId/members
```
**Response**:
```json
{
  "members": [
    {
      "_id": string,
      "groupId": string,
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "designation": string,
      "role": string,
      "status": string,
      "joinedDate": string (ISO)
    }
  ]
}
```

#### Add Member to Group
```
POST /api/teams/groups/:groupId/members
```
**Body**:
```json
{
  "employeeId": string,
  "role": "member" | "lead" | "admin"
}
```

#### Remove Member
```
DELETE /api/teams/groups/:groupId/members/:employeeId
```

#### Get Team Stats
```
GET /api/teams/stats?employeeId={id}
```
**Response**:
```json
{
  "totalGroups": number,
  "activeGroups": number,
  "groupsAsLead": number,
  "totalMembers": number
}
```

### Database Relationships
- Groups ↔ GroupMembers (one-to-many)
- Groups ↔ Employees (via groupLeadId)
- GroupMembers ↔ Employees (via employeeId)

---

## Training & Development Module

### Page Location
`src/pages/employee/MyTraining.tsx` (or similar)

### Features
1. **Available Trainings Catalog**
   - Browse available trainings
   - Filter by category, mode, status
   - Search trainings
   - View training details

2. **My Enrollments**
   - View enrolled trainings
   - Track progress
   - View completion status
   - Access training materials

3. **Training Enrollment**
   - Enroll in trainings
   - Prerequisites check
   - Capacity check

4. **Completion & Certification**
   - Mark completion
   - View certificates
   - Provide feedback and ratings

5. **Analytics** (for managers/HR)
   - Training hours by employee
   - Enrollment statistics
   - Skill gap analysis

### API Endpoints

#### Get All Trainings
```
GET /api/training?status={status}&category={category}&mode={mode}
```
**Response**:
```json
{
  "trainings": [
    {
      "_id": string,
      "trainingId": string,
      "trainingName": string,
      "trainingCategory": string,
      "description": string,
      "trainerName": string,
      "trainingMode": string,
      "startDate": string (ISO),
      "endDate": string (ISO),
      "durationHours": number,
      "maxParticipants": number,
      "currentEnrollments": number,
      "costPerEmployee": number,
      "status": string,
      "certificationAvailable": boolean
    }
  ]
}
```

#### Get Training Details
```
GET /api/training/:id
```
**Response**: Detailed training object with all fields

#### Get My Enrollments
```
GET /api/training/enrollments/all?employeeId={id}
```
**Response**:
```json
{
  "enrollments": [
    {
      "_id": string,
      "trainingId": string,
      "trainingName": string,
      "employeeId": string,
      "employeeName": string,
      "enrollmentDate": string (ISO),
      "status": string,
      "attendance": number,
      "assessmentScore": number,
      "certificateIssued": boolean,
      "completionDate": string (ISO)
    }
  ]
}
```

#### Enroll in Training
```
POST /api/training/:trainingId/enroll
```
**Body**:
```json
{
  "employeeId": string,
  "employeeName": string,
  "department": string
}
```
**Response**:
```json
{
  "success": boolean,
  "message": string,
  "enrollment": { ... }
}
```

#### Update Enrollment
```
PUT /api/training/enrollments/:enrollmentId
```
**Body**:
```json
{
  "status": string,
  "attendance": number,
  "assessmentScore": number,
  "feedback": string,
  "rating": number
}
```

#### Get Training Analytics
```
GET /api/training/analytics/metrics?department={dept}&startDate={date}&endDate={date}
```
**Response**:
```json
{
  "totalTrainings": number,
  "totalEnrollments": number,
  "completionRate": number,
  "averageRating": number,
  "totalHoursTrained": number,
  "categoryBreakdown": [{
    "category": string,
    "count": number
  }]
}
```

#### Get Training Hours by Employee
```
GET /api/training/analytics/hours-by-employee?department={dept}
```
**Response**:
```json
{
  "employees": [
    {
      "employeeId": string,
      "employeeName": string,
      "department": string,
      "totalHours": number,
      "completedTrainings": number,
      "ongoingTrainings": number
    }
  ]
}
```

### Database Relationships
- Trainings ↔ TrainingEnrollments (one-to-many)
- TrainingEnrollments ↔ Employees (via employeeId)
- Trainings filterable by targetDepartments, targetGrades

---

## Integration Guidelines

### 1. API Base URL Configuration
Create environment configuration:

**.env (Frontend)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

**.env (Backend)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_connect
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173
```

### 2. API Client Setup

**src/lib/apiClient.ts**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Type Definitions

Create shared type definitions in `src/types/`:

**src/types/attendance.ts**
```typescript
export interface AttendanceLog {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  effectiveHours: number;
  status: 'present' | 'absent' | 'wfh' | 'leave' | 'weekly-off' | 'late' | 'half-day';
  isLate: boolean;
  regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface RegularizationRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  requestType: 'check-in' | 'check-out' | 'both' | 'full-day';
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WFHRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}
```

**src/types/team.ts**
```typescript
export interface Group {
  _id: string;
  groupId: string;
  groupName: string;
  description: string;
  groupType: 'department' | 'project' | 'task-force' | 'committee' | 'cross-functional' | 'custom';
  groupLeadId?: string;
  status: 'active' | 'inactive' | 'archived';
  memberCount?: number;
}

export interface GroupMember {
  _id: string;
  groupId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  role: 'member' | 'lead' | 'admin';
  joinedDate: string;
}
```

**src/types/training.ts**
```typescript
export interface Training {
  _id: string;
  trainingId: string;
  trainingName: string;
  trainingCategory: string;
  description: string;
  trainerName: string;
  trainingMode: 'Online' | 'Offline' | 'Hybrid';
  startDate: string;
  endDate: string;
  durationHours: number;
  maxParticipants: number;
  currentEnrollments: number;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  certificationAvailable: boolean;
}

export interface TrainingEnrollment {
  _id: string;
  trainingId: string;
  trainingName?: string;
  employeeId: string;
  employeeName: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'Completed' | 'Dropped' | 'Failed' | 'In Progress';
  attendance?: number;
  assessmentScore?: number;
  certificateIssued: boolean;
}
```

### 4. Error Handling Pattern

All API calls should follow this pattern:

```typescript
try {
  const response = await apiClient.get('/attendance/logs');
  // Handle success
  return response.data;
} catch (error: any) {
  // Don't show error toast for auth errors (handled by interceptor)
  if (error.response?.status !== 401 && error.response?.status !== 403) {
    toast.error(error.response?.data?.message || 'Failed to fetch data');
  }
  console.error('API Error:', error);
  throw error;
}
```

### 5. Data Synchronization

**Real-time Updates**: Consider implementing WebSocket for:
- Attendance clock-in/out notifications
- Request approval notifications
- Training enrollment updates

**Polling Strategy**: For pages that need fresh data:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (!document.hidden) {
      fetchData();
    }
  }, 60000); // Refresh every minute
  
  return () => clearInterval(interval);
}, []);
```

### 6. Route Protection

Ensure routes are protected based on user roles:

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

**Route Configuration**:
```typescript
<Route path="/hr/attendance-overview" element={
  <ProtectedRoute allowedRoles={['hr', 'admin']}>
    <AttendanceOverview />
  </ProtectedRoute>
} />

<Route path="/employee/my-attendance" element={
  <ProtectedRoute allowedRoles={['employee', 'manager', 'hr', 'admin']}>
    <MyAttendance />
  </ProtectedRoute>
} />
```

---

## API Authentication

### JWT Token Structure
```json
{
  "userId": string,
  "employeeId": string,
  "email": string,
  "role": "employee" | "manager" | "hr" | "admin",
  "department": string,
  "iat": number,
  "exp": number
}
```

### Token Storage
- Store in `localStorage` with key `authToken`
- Include in all API requests via Authorization header: `Bearer {token}`
- Auto-refresh mechanism recommended before expiration

### Authentication Endpoints
```
POST /api/auth/login
```
**Body**:
```json
{
  "email": string,
  "password": string
}
```
**Response**:
```json
{
  "success": true,
  "token": string,
  "user": {
    "employeeId": string,
    "name": string,
    "email": string,
    "role": string,
    "department": string
  }
}
```

```
POST /api/auth/refresh
```
**Headers**: `Authorization: Bearer {token}`
**Response**:
```json
{
  "token": string
}
```

---

## Environment Setup

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run development server
npm run dev

# Build TypeScript
npm run build

# Run production server
npm start
```

### MongoDB Setup
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Create database indexes (run in MongoDB shell)
use employee_connect

db.attendancelogs.createIndex({ "employeeId": 1, "date": -1 })
db.attendancelogs.createIndex({ "department": 1 })
db.attendancelogs.createIndex({ "status": 1 })

db.regularizationrequests.createIndex({ "employeeId": 1, "status": 1 })
db.wfhrequests.createIndex({ "employeeId": 1, "date": -1 })

db.groups.createIndex({ "groupId": 1 }, { unique: true })
db.groupmembers.createIndex({ "groupId": 1, "employeeId": 1 }, { unique: true })

db.trainings.createIndex({ "trainingId": 1 }, { unique: true })
db.trainingenrollments.createIndex({ "trainingId": 1, "employeeId": 1 }, { unique: true })
```

---

## Integration Checklist for Other Developers

### Before Integration
- [ ] Review this entire document
- [ ] Ensure MongoDB is running with correct database name
- [ ] Verify all required collections exist
- [ ] Check backend server is running on expected port
- [ ] Confirm frontend environment variables are set

### API Integration
- [ ] Import and configure `apiClient` from `src/lib/apiClient.ts`
- [ ] Add authentication token to requests
- [ ] Implement error handling with toast notifications
- [ ] Use TypeScript interfaces from `src/types/`
- [ ] Test all CRUD operations with Postman/Thunder Client

### Frontend Component Integration
- [ ] Install all required npm packages (check package.json)
- [ ] Import ShadCN UI components as needed
- [ ] Use Zustand stores for state management (don't create duplicate stores)
- [ ] Follow existing component structure and patterns
- [ ] Ensure responsive design with Tailwind classes

### State Management
- [ ] Use existing `useAttendanceStore` for attendance features
- [ ] Create new Zustand stores for teams/training if not exists
- [ ] Don't duplicate API calls - use store actions
- [ ] Clear state on logout

### Testing
- [ ] Test all API endpoints with valid/invalid data
- [ ] Verify role-based access control
- [ ] Check date range filtering works correctly
- [ ] Test bulk operations (approve/reject)
- [ ] Verify real-time updates (if implemented)
- [ ] Test with different user roles (employee, manager, HR, admin)

### Code Standards
- [ ] Use TypeScript - no `any` types
- [ ] Follow existing naming conventions
- [ ] Add proper error handling
- [ ] Include loading states
- [ ] Add comments for complex logic
- [ ] Use functional components with hooks
- [ ] Implement proper cleanup in useEffect

### Deployment
- [ ] Update environment variables for production
- [ ] Ensure MongoDB indexes are created
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Enable security headers (helmet)
- [ ] Set up logging (winston)

---

## Common Integration Issues & Solutions

### Issue 1: CORS Errors
**Problem**: API calls blocked by CORS policy

**Solution**:
```typescript
// server/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: Date Format Inconsistencies
**Problem**: Date strings not parsing correctly

**Solution**: Always use ISO 8601 format
```typescript
import { format } from 'date-fns';

// Backend: Store as Date, send as ISO string
const dateString = new Date().toISOString();

// Frontend: Parse and format consistently
const formattedDate = format(new Date(dateString), 'MMM dd, yyyy');
```

### Issue 3: Zustand Store Not Updating UI
**Problem**: State changes but UI doesn't re-render

**Solution**: Always create new object references
```typescript
set({ logs: [...newLogs] }); // ✅ New array
set({ logs: newLogs }); // ❌ Might not trigger re-render
```

### Issue 4: Unauthorized 401 Errors
**Problem**: Token expired or invalid

**Solution**: Implement token refresh or redirect to login
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token or logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Contact & Support

For integration questions or issues:
1. Check this documentation first
2. Review existing code patterns in similar modules
3. Test API endpoints independently before frontend integration
4. Use console.log and network tab for debugging
5. Contact the backend team for API-related issues
6. Contact the frontend team for UI/component issues

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 1.0 | Feb 27, 2026 | Initial documentation | System |

---

**End of Document**
