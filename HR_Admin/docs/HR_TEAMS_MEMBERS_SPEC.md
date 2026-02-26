# Teams & Members Module - Complete Specification

## 📋 Overview

The **Teams & Members Module** is a comprehensive group management system that enables HR to create, manage, and track teams, departments, committees, and project groups across the organization. It provides visibility into team structures, member roles, and group activities.

---

## 🎯 Features

### Core Functionality
- **Dynamic Team Creation**: Create various types of groups (Department, Project, Committee, Cross-functional, Task Force)
- **Member Management**: Add/remove members with role assignment
- **Multi-Group Membership**: Employees can belong to multiple groups
- **Role-Based Access**: Group Lead, Core Member, Member, Observer roles
- **Group Lifecycle**: Active, Inactive, Archived status management
- **Member Directory**: View all members with filtering and search
- **Group Analytics**: Member count, activity tracking, performance metrics
- **Bulk Operations**: Add multiple members at once
- **Group Templates**: Pre-configured templates for common group types
- **Hierarchy Visualization**: View parent-child group relationships

### Advanced Features
- Group activity timeline
- Member contribution tracking
- Group performance dashboards
- Cross-group reporting
- Group-based communication
- Resource allocation tracking
- Meeting scheduling for groups
- Document sharing per group
- Group goals and KPIs

---

## 🗄️ Database Collections

### 1. Group Collection
**Model File**: `server/src/models/Group.ts`

```typescript
{
  groupId: String,                    // Auto-generated: GRP-00001
  groupName: String,                  // Group display name
  description: String,                // Group purpose and details
  
  groupType: String,                  // Enum: Department, Project Team, Committee,
                                      // Cross-functional, Task Force, Interest Group,
                                      // Location-based, Custom
  
  department: String,                 // Primary department (if applicable)
  location: String,                   // Primary location
  
  parentGroupId: String,              // For hierarchical groups
  childGroups: [String],              // Sub-groups
  
  groupLead: {                        // Primary lead/manager
    employeeId: String,
    name: String,
    email: String,
    phone: String,
    assignedDate: Date
  },
  
  coLeads: [{                         // Additional leads
    employeeId: String,
    name: String,
    email: String,
    assignedDate: Date
  }],
  
  memberCount: Number,                // Total members (default: 0)
  maxMembers: Number,                 // Maximum allowed members
  minMembers: Number,                 // Minimum required members
  
  status: String,                     // Enum: Active, Inactive, Archived (default: Active)
  
  startDate: Date,                    // Group formation date
  endDate: Date,                      // Expected end date (for projects)
  actualEndDate: Date,                // Actual completion date
  
  objectives: [String],               // Group goals and objectives
  deliverables: [String],             // Expected outputs
  
  tags: [String],                     // Tags for categorization
  
  visibility: String,                 // Enum: Public, Private, Restricted (default: Public)
  allowSelfJoin: Boolean,             // Members can join without approval
  approvalRequired: Boolean,          // HR/Lead approval needed for joining
  
  meetingSchedule: {                  // Regular meeting schedule
    frequency: String,                // Daily, Weekly, Bi-weekly, Monthly
    day: String,                      // Meeting day
    time: String,                     // Meeting time
    location: String,                 // Meeting location/link
    duration: Number                  // Minutes
  },
  
  resources: [{                       // Allocated resources
    resourceType: String,             // Budget, Equipment, Software, Space
    resourceName: String,
    quantity: Number,
    allocatedAmount: Number,
    usedAmount: Number
  }],
  
  budget: {
    allocated: Number,
    spent: Number,
    remaining: Number,
    currency: String
  },
  
  kpis: [{                           // Key Performance Indicators
    kpiName: String,
    target: Number,
    actual: Number,
    unit: String,
    status: String                   // On Track, At Risk, Behind
  }],
  
  documents: [{                      // Shared documents
    documentName: String,
    documentUrl: String,
    uploadedBy: String,
    uploadedAt: Date,
    documentType: String,
    fileSize: Number
  }],
  
  communication: {
    slackChannel: String,
    teamsChannel: String,
    emailGroup: String,
    whatsappGroup: String
  },
  
  createdBy: String,                 // HR admin who created
  updatedBy: String,                 // Last updated by
  
  createdAt: Date,                   // Auto-timestamp
  updatedAt: Date                    // Auto-timestamp
}
```

**Indexes**:
```typescript
groupId: unique
groupType: 1
status: 1
department: 1
'groupLead.employeeId': 1
```

### 2. GroupMember Collection
**Model File**: `server/src/models/GroupMember.ts`

```typescript
{
  _id: ObjectId,                     // Auto-generated MongoDB ID
  groupId: String,                   // Reference to Group
  employeeId: String,                // Reference to Employee
  
  roleInGroup: String,               // Enum: Lead, Co-Lead, Core Member, Member,
                                     // Observer, Contributor (default: Member)
  
  assignedAt: Date,                  // Join date
  assignedBy: String,                // Who added (HR/Manager ID)
  
  status: String,                    // Enum: Active, Inactive, Left (default: Active)
  
  responsibilities: [String],        // Member's specific responsibilities
  
  joinType: String,                  // Enum: Assigned, Self-joined, Invited, Transferred
  approvalStatus: String,            // Enum: Pending, Approved, Rejected (if approval required)
  approvedBy: String,                // Who approved
  approvedAt: Date,
  
  contribution: {                    // Member contribution tracking
    tasksCompleted: Number,
    hoursContributed: Number,
    lastActiveDate: Date,
    contributionScore: Number        // 0-100
  },
  
  attendance: {                      // Meeting attendance
    totalMeetings: Number,
    attended: Number,
    attendancePercentage: Number
  },
  
  skills: [String],                  // Skills member brings to group
  
  exitDate: Date,                    // If left
  exitReason: String,                // Reason for leaving
  exitedBy: String,                  // Who removed
  
  notes: String,                     // HR/Lead notes about member
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```typescript
groupId: 1
employeeId: 1
{ groupId: 1, employeeId: 1 }: unique (prevent duplicates)
status: 1
roleInGroup: 1
```

---

## 🔌 API Endpoints

### Base URL: `/api/teams`

#### 1. Get All Groups
```http
GET /api/teams/groups
```

**Query Parameters**:
- `status`: Filter by status (Active, Inactive, Archived)
- `groupType`: Filter by type
- `department`: Filter by department
- `location`: Filter by location
- `search`: Search by name or description
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort direction (asc/desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 25)

**Response**:
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "_id": "64f3a...",
        "groupId": "GRP-00001",
        "groupName": "Frontend Development Team",
        "groupType": "Project Team",
        "department": "Engineering",
        "memberCount": 12,
        "status": "Active",
        "groupLead": {
          "employeeId": "EMP001",
          "name": "John Doe",
          "email": "john@company.com"
        },
        ...
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 25,
      "pages": 2
    }
  }
}
```

#### 2. Get Group by ID
```http
GET /api/teams/groups/:groupId
```

**Response**: Includes group details with full member list

#### 3. Create Group
```http
POST /api/teams/groups
```

**Request Body**:
```json
{
  "groupName": "AI Research Committee",
  "description": "Explore AI applications in our products",
  "groupType": "Committee",
  "department": "Engineering",
  "location": "Bangalore",
  "groupLead": {
    "employeeId": "EMP001",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@company.com"
  },
  "maxMembers": 15,
  "objectives": [
    "Research AI trends",
    "Evaluate AI tools",
    "Propose AI implementations"
  ],
  "visibility": "Public",
  "allowSelfJoin": false,
  "approvalRequired": true,
  "createdBy": "HR001"
}
```

#### 4. Update Group
```http
PUT /api/teams/groups/:groupId
```

#### 5. Delete Group
```http
DELETE /api/teams/groups/:groupId
```

**Query Parameters**:
- `permanent`: If true, permanently delete; otherwise archive

#### 6. Change Group Status
```http
PATCH /api/teams/groups/:groupId/status
```

**Request Body**:
```json
{
  "status": "Inactive",
  "reason": "Project completed"
}
```

#### 7. Get Group Members
```http
GET /api/teams/groups/:groupId/members
```

**Query Parameters**:
- `roleInGroup`: Filter by role
- `status`: Filter by member status
- `sortBy`: Sort field (default: assignedAt)

**Response**:
```json
{
  "success": true,
  "data": {
    "group": { /* group details */ },
    "members": [
      {
        "_id": "64f3a...",
        "groupId": "GRP-00001",
        "employeeId": "EMP001",
        "roleInGroup": "Lead",
        "status": "Active",
        "assignedAt": "2026-01-15",
        "employee": {
          "employeeId": "EMP001",
          "name": "John Doe",
          "email": "john@company.com",
          "department": "Engineering",
          "designation": "Senior Engineer",
          "profilePhoto": "https://..."
        },
        ...
      }
    ],
    "stats": {
      "total": 12,
      "active": 11,
      "inactive": 1,
      "byRole": {
        "Lead": 1,
        "Core Member": 3,
        "Member": 8
      }
    }
  }
}
```

#### 8. Add Member to Group
```http
POST /api/teams/members
```

**Request Body**:
```json
{
  "groupId": "GRP-00001",
  "employeeId": "EMP025",
  "roleInGroup": "Member",
  "responsibilities": ["Code reviews", "Documentation"],
  "assignedBy": "HR001",
  "joinType": "Assigned"
}
```

#### 9. Bulk Add Members
```http
POST /api/teams/members/bulk
```

**Request Body**:
```json
{
  "groupId": "GRP-00001",
  "members": [
    {
      "employeeId": "EMP025",
      "roleInGroup": "Member"
    },
    {
      "employeeId": "EMP026",
      "roleInGroup": "Core Member"
    }
  ],
  "assignedBy": "HR001"
}
```

#### 10. Update Member Role
```http
PATCH /api/teams/members/:memberId/role
```

**Request Body**:
```json
{
  "roleInGroup": "Core Member",
  "updatedBy": "HR001"
}
```

#### 11. Remove Member from Group
```http
DELETE /api/teams/members/:memberId
```

**Request Body**:
```json
{
  "exitReason": "Moved to another team",
  "removedBy": "HR001"
}
```

#### 12. Get Member's Groups
```http
GET /api/teams/members/employee/:employeeId
```

**Response**: All groups the employee is part of

#### 13. Get Group Statistics
```http
GET /api/teams/stats/overview
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalGroups": 45,
    "activeGroups": 38,
    "inactiveGroups": 5,
    "archivedGroups": 2,
    "totalMembers": 456,
    "averageGroupSize": 10.1,
    "byType": {
      "Department": 12,
      "Project Team": 18,
      "Committee": 8,
      "Cross-functional": 7
    },
    "largestGroup": {
      "groupId": "GRP-00012",
      "groupName": "Engineering Department",
      "memberCount": 45
    },
    "mostActiveGroups": [ /* top 5 */ ]
  }
}
```

#### 14. Get Department-wise Groups
```http
GET /api/teams/analytics/department
```

#### 15. Search Members
```http
GET /api/teams/members/search
```

**Query Parameters**:
- `q`: Search query
- `department`: Filter by department
- `designation`: Filter by designation
- `skills`: Filter by skills
- `availability`: Filter available members (not at max groups)

#### 16. Get Group Activity Timeline
```http
GET /api/teams/groups/:groupId/activity
```

**Response**: Timeline of group events (member joins/leaves, status changes, etc.)

#### 17. Export Group Data
```http
GET /api/teams/groups/:groupId/export
```

**Query Parameters**:
- `format`: Excel, CSV, PDF

---

## 📦 Component Structure

### Page Component
**File**: `src/pages/hr/TeamsMembers.tsx`

**Main Component**: `TeamsMembers`

**State Management**:
```typescript
const [groups, setGroups] = useState<Group[]>([]);
const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
const [members, setMembers] = useState<GroupMember[]>([]);
const [view, setView] = useState<'groups' | 'members' | 'analytics'>('groups');
const [filters, setFilters] = useState({
  status: 'all',
  groupType: 'all',
  department: 'all',
  location: 'all',
  search: ''
});
const [stats, setStats] = useState({
  totalGroups: 0,
  activeGroups: 0,
  totalMembers: 0,
  averageGroupSize: 0
});
```

**Key Functions**:
- `fetchGroups()`: Load all groups with filters
- `fetchGroupMembers()`: Load members for a group
- `handleCreateGroup()`: Show create group form
- `handleEditGroup()`: Edit existing group
- `handleDeleteGroup()`: Archive/delete group
- `handleAddMember()`: Add single member
- `handleBulkAddMembers()`: Add multiple members
- `handleRemoveMember()`: Remove member from group
- `handleUpdateMemberRole()`: Change member role
- `handleExportGroup()`: Export group data
- `applyFilters()`: Filter groups

### Sub-Components

#### 1. GroupForm (Sheet/Dialog)
**Purpose**: Create/Edit group
**Props**: `group, onSave, onClose, employees, departments`

#### 2. GroupCard
**Purpose**: Display group in card view
**Props**: `group, onEdit, onDelete, onViewMembers, onViewDetails`

#### 3. MemberManagementSheet
**Purpose**: Manage group members
**Props**: `group, members, onAddMember, onRemoveMember, onUpdateRole`

#### 4. AddMemberDialog
**Purpose**: Add member(s) to group
**Props**: `group, allEmployees, existingMembers, onAdd, onClose`

#### 5. GroupDetailsPanel
**Purpose**: Show detailed group information
**Props**: `group, members, stats, onEdit`

#### 6. GroupHierarchyTree
**Purpose**: Visualize group hierarchy
**Props**: `groups, onGroupSelect`

#### 7. MemberCard
**Purpose**: Display member details
**Props**: `member, employee, onEdit, onRemove`

#### 8. GroupAnalyticsDashboard
**Purpose**: Analytics and insights
**Props**: `stats, groupData, memberData, trendData`

---

## 🔧 Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "lucide-react": "^0.263.1",
    "sonner": "^1.0.0",
    "axios": "^1.5.0",
    "date-fns": "^2.30.0",
    "react-flow-renderer": "^10.3.17"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
```

### Icons (Lucide React)
```typescript
import {
  Users, UserPlus, Plus, Trash2, Edit, MoreVertical,
  Filter, Search, Download, FolderOpen, Award,
  AlertTriangle, X, Calendar, Columns3, ChevronDown, FileText
} from 'lucide-react';
```

---

## 🎨 UI/UX Patterns

### Group Type Color Coding
```typescript
const groupTypeColors = {
  'Department': 'bg-blue-100 text-blue-700',
  'Project Team': 'bg-green-100 text-green-700',
  'Committee': 'bg-purple-100 text-purple-700',
  'Cross-functional': 'bg-orange-100 text-orange-700',
  'Task Force': 'bg-red-100 text-red-700',
  'Interest Group': 'bg-pink-100 text-pink-700',
  'Custom': 'bg-gray-100 text-gray-700'
};
```

### Role Badges
```typescript
const roleBadges = {
  'Lead': <Badge className="bg-purple-600 text-white">Lead</Badge>,
  'Co-Lead': <Badge className="bg-purple-400 text-white">Co-Lead</Badge>,
  'Core Member': <Badge className="bg-blue-500 text-white">Core</Badge>,
  'Member': <Badge variant="outline">Member</Badge>,
  'Observer': <Badge variant="secondary">Observer</Badge>
};
```

---

## 📊 Data Table Configuration

```typescript
const groupColumns = [
  {
    key: 'groupId',
    label: 'Group ID',
    sortable: true,
    width: '120px'
  },
  {
    key: 'groupName',
    label: 'Group Name',
    sortable: true,
    render: (row) => (
      <div>
        <p className="font-medium">{row.groupName}</p>
        <p className="text-xs text-muted-foreground">{row.description}</p>
      </div>
    )
  },
  {
    key: 'groupType',
    label: 'Type',
    sortable: true,
    render: (row) => (
      <Badge className={groupTypeColors[row.groupType]}>
        {row.groupType}
      </Badge>
    )
  },
  {
    key: 'groupLead',
    label: 'Lead',
    render: (row) => (
      <div className="flex items-center gap-2">
        <EmployeeAvatar name={row.groupLead?.name} size="sm" />
        <span>{row.groupLead?.name}</span>
      </div>
    )
  },
  {
    key: 'memberCount',
    label: 'Members',
    sortable: true,
    align: 'center',
    render: (row) => (
      <div className="flex items-center justify-center gap-1">
        <Users className="h-4 w-4" />
        <span>{row.memberCount}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
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

### 1. Employee Directory Integration
```typescript
// Fetch available employees to add to group
const availableEmployees = await fetch('/api/employees?status=active');
```

### 2. Project Management Integration
```typescript
// Link groups to projects
await fetch(`/api/projects/${projectId}/team`, {
  method: 'PATCH',
  body: JSON.stringify({ groupId: 'GRP-00001' })
});
```

### 3. Communication Tool Integration
```typescript
// Create Slack channel for group
await fetch('/api/integrations/slack/create-channel', {
  method: 'POST',
  body: JSON.stringify({
    channelName: group.groupName,
    members: members.map(m => m.email)
  })
});
```

---

## 🚀 Implementation Checklist

### Backend
- [x] Create Group model
- [x] Create GroupMember model
- [x] Implement group routes (CRUD)
- [x] Implement member routes
- [x] Add group statistics endpoint
- [ ] Add group hierarchy support
- [ ] Add activity timeline tracking
- [ ] Add group analytics
- [ ] Implement bulk operations

### Frontend
- [x] Create TeamsMembers page
- [x] Build group form
- [x] Implement member management
- [x] Add group card view
- [ ] Build hierarchy visualization
- [ ] Add analytics dashboard
- [ ] Implement bulk member operations
- [ ] Add export functionality
- [ ] Build activity timeline

### Testing
- [ ] Test group CRUD operations
- [ ] Verify member add/remove
- [ ] Test bulk operations
- [ ] Validate role changes
- [ ] Test group hierarchy
- [ ] Verify statistics accuracy
- [ ] Test filters and search

---

## 📝 Usage Example

```typescript
// In your HR dashboard
import TeamsMembers from '@/pages/hr/TeamsMembers';

function HRApp() {
  return (
    <div>
      <TeamsMembers />
    </div>
  );
}
```

---

## 🔐 Access Control

**Allowed Roles**: `HR`, `SUPER_ADMIN`, `RMG`, `MANAGER`

**Permissions**:
- **HR/SUPER_ADMIN**: Full access (create, edit, delete groups and members)
- **MANAGER**: Manage own team groups, view other groups
- **GROUP LEAD**: Manage own group members
- **EMPLOYEES**: View public groups, join if allowed

---

## 📞 Support

For integration support, refer to:
- API Documentation: `docs/BACKEND_API_SPEC.md`
- Group Model: `server/src/models/Group.ts`
- GroupMember Model: `server/src/models/GroupMember.ts`
