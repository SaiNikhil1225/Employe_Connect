# Super Admin Modules Integration Guide

> **Documentation for:** Leave Policy Configuration, Module Permissions, and Holiday Management
> 
> **Excluded Modules:** Dashboard, Approval Flow, HR Config (pending future changes)
> 
> **Purpose:** Complete codebase package for integrating three Super Admin modules into existing application

---

## Table of Contents

1. [Overview](#overview)
2. [Module Descriptions](#module-descriptions)
3. [Database Collections](#database-collections)
4. [Frontend Components](#frontend-components)
5. [Backend Models](#backend-models)
6. [API Endpoints](#api-endpoints)
7. [Dependencies](#dependencies)
8. [Integration Steps](#integration-steps)
9. [File Structure](#file-structure)

---

## Overview

This document provides comprehensive details for three Super Admin modules:

1. **Leave Policy Configuration** - Manage country-specific leave policies with distribution rules
2. **Module Permissions** - Control employee access to system modules with granular permissions
3. **Holiday Management** - Multi-level holiday configuration with groups, types, and bulk operations

---

## Module Descriptions

### 1. Leave Policy Configuration

Manages leave policies across different countries with configurable parameters:
- **Features:**
  - Country-specific leave policies
  - Distribution options (QUARTERLY, HALF_YEARLY, ANNUAL)
  - Carryforward and encashment rules
  - Approval requirements
  - Policy activation/deactivation
  
- **Key Capabilities:**
  - CRUD operations for leave policies
  - Unique constraint on leaveType + country combination
  - Configurable allocation, notice periods, and consecutive day limits

### 2. Module Permissions

Granular permission management system for controlling employee access:
- **Features:**
  - Module-level access control (EMPLOYEE, HR, RMG, HELPDESK, LEAVE)
  - Per-employee permission configuration
  - Admin designation per module
  - View, Add, Modify permissions
  - Department-based filtering
  - Bulk operations support
  
- **Key Capabilities:**
  - Real-time permission updates
  - Employee search across name, email, employeeId
  - Module enable/disable toggle
  - Admin role assignment

### 3. Holiday Management

Comprehensive holiday calendar system with multi-level configuration:
- **Features:**
  - Group-based holiday assignment
  - Holiday types and observance types
  - Country/Region/Client/Department hierarchy support
  - Status management (DRAFT, PUBLISHED, ARCHIVED)
  - Bulk Excel upload/download
  - Image attachments for holidays
  
- **Key Capabilities:**
  - Multi-level holiday visibility (Global → Group-specific)
  - Advanced filtering and search
  - Dashboard analytics with stats cards
  - Approval workflow for publishing
  - Year-based organization

---

## Database Collections

### 3.1 Leave Policy Collection

**Collection Name:** `leavepolicies`

**Schema Fields:**
```javascript
{
  leaveType: String (required),          // e.g., "Annual Leave", "Sick Leave"
  country: String (required),            // e.g., "India", "USA"
  allocation: Number (required),         // Number of days allocated
  distribution: String (enum),           // "QUARTERLY" | "HALF_YEARLY" | "ANNUAL"
  carryForward: Boolean,                 // Allow carry forward to next year
  maxCarryForward: Number,               // Maximum days that can be carried forward
  encashable: Boolean,                   // Can be encashed
  requiresApproval: Boolean,             // Requires manager approval
  minDaysNotice: Number,                 // Minimum notice period in days
  maxConsecutiveDays: Number,            // Maximum consecutive days allowed
  description: String,                   // Policy description
  isActive: Boolean (default: true),     // Soft delete flag
  createdAt: Date,                       // Auto-generated timestamp
  updatedAt: Date                        // Auto-generated timestamp
}
```

**Indexes:**
- Compound unique index: `{ leaveType: 1, country: 1 }`

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12345",
  "leaveType": "Annual Leave",
  "country": "India",
  "allocation": 20,
  "distribution": "ANNUAL",
  "carryForward": true,
  "maxCarryForward": 5,
  "encashable": true,
  "requiresApproval": true,
  "minDaysNotice": 7,
  "maxConsecutiveDays": 10,
  "description": "Annual paid leave for employees in India",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3.2 Module Permission Collection

**Collection Name:** `modulepermissions`

**Schema Fields:**
```javascript
{
  employeeId: String (required, ref: Employee),  // Employee identifier
  module: String (enum, required),               // "EMPLOYEE" | "HR" | "RMG" | "HELPDESK" | "LEAVE"
  enabled: Boolean (default: false),             // Module is enabled for employee
  isAdmin: Boolean (default: false),             // Employee is admin for this module
  permissions: {
    view: Boolean (default: true),               // View permission
    add: Boolean (default: false),               // Add/Create permission
    modify: Boolean (default: false)             // Edit/Modify permission
  },
  createdAt: Date,                               // Auto-generated timestamp
  updatedAt: Date                                // Auto-generated timestamp
}
```

**Indexes:**
- Compound unique index: `{ employeeId: 1, module: 1 }`

**Module Enum Values:**
- `EMPLOYEE` - Employee management module
- `HR` - Human Resources module
- `RMG` - Resource Management Group module
- `HELPDESK` - Helpdesk/ticketing module
- `LEAVE` - Leave management module

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12346",
  "employeeId": "EMP001",
  "module": "HELPDESK",
  "enabled": true,
  "isAdmin": true,
  "permissions": {
    "view": true,
    "add": true,
    "modify": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3.3 Holiday Management Collections

#### 3.3.1 Holidays Collection

**Collection Name:** `holidays`

**Schema Fields:**
```javascript
{
  name: String (required),                       // Holiday name
  date: Date (required),                         // Holiday date
  countryId: ObjectId (ref: Country),            // Country reference (optional)
  regionId: ObjectId (ref: Region),              // Region reference (optional)
  clientId: ObjectId (ref: Client),              // Client reference (optional)
  departmentId: ObjectId (ref: Department),      // Department reference (optional)
  groupIds: [ObjectId] (ref: HolidayGroup),      // Holiday group references
  typeId: ObjectId (required, ref: HolidayType), // Holiday type reference
  observanceTypeId: ObjectId (required, ref: ObservanceType), // Observance type reference
  description: String,                           // Holiday description
  notes: String,                                 // Additional notes
  imageUrl: String,                              // Image URL or base64
  status: String (enum, default: "DRAFT"),       // "DRAFT" | "PUBLISHED" | "ARCHIVED"
  isActive: Boolean (default: true),             // Soft delete flag
  createdBy: ObjectId (required, ref: User),     // Creator reference
  approvedBy: ObjectId (ref: User),              // Approver reference
  publishedAt: Date,                             // Publication timestamp
  createdAt: Date,                               // Auto-generated timestamp
  updatedAt: Date                                // Auto-generated timestamp
}
```

**Indexes (8 compound indexes for performance):**
1. `{ date: 1, status: 1 }`
2. `{ countryId: 1, date: 1 }`
3. `{ regionId: 1, date: 1 }`
4. `{ clientId: 1, date: 1 }`
5. `{ departmentId: 1, date: 1 }`
6. `{ groupIds: 1 }`
7. `{ status: 1, isActive: 1 }`
8. `{ typeId: 1, date: 1 }`

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12347",
  "name": "Christmas Day",
  "date": "2024-12-25T00:00:00.000Z",
  "typeId": "64f1234567890abcdef12350",
  "observanceTypeId": "64f1234567890abcdef12351",
  "groupIds": ["64f1234567890abcdef12352"],
  "description": "Christmas celebration",
  "notes": "Office closed",
  "status": "PUBLISHED",
  "isActive": true,
  "createdBy": "64f1234567890abcdef12348",
  "approvedBy": "64f1234567890abcdef12349",
  "publishedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 3.3.2 Holiday Types Collection

**Collection Name:** `holidaytypes`

**Schema Fields:**
```javascript
{
  name: String (required, unique),          // Type name (e.g., "Public Holiday")
  description: String,                      // Type description
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ isActive: 1 }`

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12350",
  "name": "Public Holiday",
  "description": "National public holidays",
  "isActive": true,
  "createdBy": "64f1234567890abcdef12348",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.3.3 Observance Types Collection

**Collection Name:** `observancetypes`

**Schema Fields:**
```javascript
{
  name: String (required, unique),          // Observance name (e.g., "Fixed Date")
  description: String,                      // Observance description
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ isActive: 1 }`

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12351",
  "name": "Fixed Date",
  "description": "Holiday occurs on same date each year",
  "isActive": true,
  "createdBy": "64f1234567890abcdef12348",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.3.4 Holiday Groups Collection

**Collection Name:** `holidaygroups`

**Schema Fields:**
```javascript
{
  name: String (required, unique),          // Group name (e.g., "India Team")
  description: String,                      // Group description
  employeeIds: [ObjectId] (ref: Employee),  // Array of assigned employees
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ isActive: 1 }`
- `{ employeeIds: 1 }`

**Example Document:**
```json
{
  "_id": "64f1234567890abcdef12352",
  "name": "India Bangalore Team",
  "description": "Employees based in Bangalore, India",
  "employeeIds": [
    "64f1234567890abcdef12353",
    "64f1234567890abcdef12354"
  ],
  "isActive": true,
  "createdBy": "64f1234567890abcdef12348",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3.4 Supporting Collections

#### 3.4.1 Countries Collection

**Collection Name:** `countries`

**Schema Fields:**
```javascript
{
  name: String (required, unique),          // Country name
  code: String (required, unique),          // ISO country code (2-3 chars, uppercase)
  regionId: String,                         // Optional geographical region identifier
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ code: 1 }` (unique)
- `{ isActive: 1 }`

#### 3.4.2 Regions Collection

**Collection Name:** `regions`

**Schema Fields:**
```javascript
{
  name: String (required),                  // Region name
  countryId: ObjectId (required, ref: Country), // Parent country
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- Compound unique: `{ name: 1, countryId: 1 }`
- `{ countryId: 1 }`
- `{ isActive: 1 }`

#### 3.4.3 Clients Collection

**Collection Name:** `clients`

**Schema Fields:**
```javascript
{
  name: String (required),                  // Client name
  code: String (required, unique),          // Client code (uppercase)
  regionId: ObjectId (ref: Region),         // Optional region reference
  countryId: ObjectId (required, ref: Country), // Required country reference
  contactPerson: String,                    // Contact person name
  contactEmail: String,                     // Contact email
  contactPhone: String,                     // Contact phone
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- Compound unique: `{ name: 1, regionId: 1 }`
- `{ code: 1 }` (unique)
- `{ regionId: 1 }`
- `{ countryId: 1 }`
- `{ isActive: 1 }`

#### 3.4.4 Departments Collection

**Collection Name:** `departments`

**Schema Fields:**
```javascript
{
  name: String (required, unique),          // Department name
  code: String (required, unique),          // Department code (uppercase)
  description: String,                      // Department description
  managerId: ObjectId (ref: Employee),      // Department manager reference
  isActive: Boolean (default: true),        // Active status
  createdBy: ObjectId (required, ref: User),// Creator reference
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ code: 1 }` (unique)
- `{ isActive: 1 }`
- `{ managerId: 1 }`

#### 3.4.5 Holiday Calendar Collection (Legacy)

**Collection Name:** `holidaycalendars`

> **Note:** This is a legacy collection. New holiday system uses the `holidays` collection with group-based assignment.

**Schema Fields:**
```javascript
{
  title: String (required),                 // Calendar title
  year: Number (required),                  // Calendar year
  country: String (required),               // Country name
  state: String,                            // Optional state
  client: String,                           // Optional client
  bannerImage: String,                      // Banner image URL
  holidays: [                               // Array of holiday objects
    {
      name: String (required),
      date: Date (required),
      type: String (enum),                  // "PUBLIC" | "OPTIONAL" | "REGIONAL"
      description: String
    }
  ],
  isActive: Boolean (default: true),        // Active status
  createdAt: Date,                          // Auto-generated timestamp
  updatedAt: Date                           // Auto-generated timestamp
}
```

**Indexes:**
- Compound: `{ year: 1, country: 1, state: 1 }`

---

## Frontend Components

### 4.1 Leave Policy Configuration

**Primary Component:** `src/pages/superadmin/LeavePolicyConfig.tsx` (472 lines)

**Features:**
- Policy cards grid display with visual indicators
- Add/Edit dialog with comprehensive form
- Distribution type selector (QUARTERLY/HALF_YEARLY/ANNUAL)
- Checkbox options for carryForward, encashable, requiresApproval
- Delete confirmation dialog
- Real-time updates with toast notifications

**UI Components Used:**
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - shadcn/ui
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Button`, `Input`, `Label`, `Textarea`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Checkbox` - for boolean flags
- `AlertDialog` - for delete confirmation
- `Badge` - for active/inactive status
- Icons: `Plus`, `Edit`, `Trash2`, `Calendar`, `Save`, `X` from lucide-react
- Toast: `sonner` library

**State Management:**
- `useState` for policies list, loading states, dialog visibility
- `useEffect` for initial data fetch
- Local storage for auth token

**API Integration:**
- GET `/api/superadmin/leave-policies`
- POST `/api/superadmin/leave-policy`
- PUT `/api/superadmin/leave-policy/:id`
- DELETE `/api/superadmin/leave-policy/:id`

---

### 4.2 Module Permissions

**Primary Component:** `src/pages/superadmin/PermissionsMatrix.tsx` (~1000+ lines)

**Features:**
- Module cards with permission toggles
- Employee search with name/email/employeeId
- Department-based filtering
- Tabs: All Employees vs Department view
- Bulk operations (enable/disable modules)
- Per-employee permission configuration
- Admin role assignment
- Real-time permission updates

**UI Components Used:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Switch` - for permission toggles
- `Checkbox` - for view/add/modify permissions
- `Input` - for search
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - for department filter
- `Button`
- `Badge` - for module status
- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent`
- `AlertDialog` - for confirmations
- Icons: `Users`, `Shield`, `Eye`, `Plus`, `Edit`, `Save`, `Search`, `Filter` from lucide-react
- Toast: `sonner` library

**Module Definitions (Hard-coded):**
```typescript
const MODULE_DEFINITIONS = [
  { id: 'EMPLOYEE', name: 'Employee Management', icon: Users, description: 'Manage employee records' },
  { id: 'RMG', name: 'Resource Management', icon: FileText, description: 'Resource allocation' },
  { id: 'HELPDESK', name: 'Helpdesk', icon: Ticket, description: 'Ticket management' },
  { id: 'LEAVE', name: 'Leave Management', icon: Calendar, description: 'Leave requests' },
  { id: 'HIRING', name: 'Hiring', icon: UserPlus, description: 'Recruitment module' },
  { id: 'FINANCE', name: 'Finance', icon: DollarSign, description: 'Financial operations' }
];
```

**State Management:**
- `useState` for permissions list, employees, filters, loading
- `useEffect` for data fetching
- Debounced search implementation

**API Integration:**
- GET `/api/superadmin/permissions`
- GET `/api/superadmin/permissions/:employeeId`
- POST `/api/superadmin/permissions`
- PUT `/api/superadmin/permissions/:id`
- DELETE `/api/superadmin/permissions/:id`
- GET `/api/superadmin/employees/search`

---

### 4.3 Holiday Management

#### 4.3.1 Main Management Page

**Primary Component:** `src/pages/superadmin/HolidayManagement.tsx` (~1500+ lines)

**Features:**
- Holiday list with table view
- Dashboard analytics cards (total, type distribution, monthly/weekly patterns)
- Year selector with "All Years" option
- Group-based filtering
- Search functionality
- Status badges (DRAFT, PUBLISHED, ARCHIVED)
- Sorting capabilities
- Bulk upload via Excel
- Export to Excel
- Add/Edit holiday via drawer
- Delete confirmation
- Publish workflow

**UI Components Used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Button`
- `Badge` - for status indicators
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Input` - for search
- `AlertDialog` - for delete confirmation
- `HolidayDrawer` - custom component for add/edit
- `BulkUploadHolidaysDrawer` - custom component for bulk upload
- `HolidayDashboardCards` - custom component for stats
- Icons: `Calendar`, `Plus`, `Upload`, `Download`, `Edit`, `Trash2`, `Eye`, `Search`, `Filter` from lucide-react
- Toast: `sonner` library
- Excel: `xlsx` library

**State Management:**
- Multiple useState hooks for holidays, filters, dialogs, loading
- useEffect for data fetching
- useMemo for computed values

**API Integration:**
- GET `/api/holidays` (with query params for filters)
- POST `/api/holidays`
- PUT `/api/holidays/:id`
- POST `/api/holidays/:id/publish`
- DELETE `/api/holidays/:id`
- GET `/api/holidays/config/countries`
- GET `/api/holidays/config/regions`
- GET `/api/holidays/config/clients`
- GET `/api/holidays/config/departments`
- GET `/api/holidays/config/holiday-types`
- GET `/api/holidays/config/observance-types`
- GET `/api/holidays/config/holiday-groups`

#### 4.3.2 Configuration Page

**Primary Component:** `src/pages/superadmin/HolidayConfiguration.tsx` (~800+ lines)

**Features:**
- Tabbed interface (Holiday Types | Groups)
- CRUD operations for types and groups
- Active/Inactive toggle with confirmation
- Employee assignment to groups
- Search and filter capabilities

**UI Components Used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Button`
- `Badge` - for active/inactive status
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Input`, `Label`, `Textarea`
- `Switch` - for active toggle
- `AlertDialog` - for confirmations
- Icons: `Settings`, `Plus`, `Edit`, `Trash2`, `Users`, `Tag` from lucide-react
- Toast: `sonner` library

**State Management:**
- useState for types, groups, dialogs, loading
- useEffect for data fetching

**API Integration:**
- GET `/api/holidays/config/holiday-types`
- POST `/api/holidays/config/holiday-types`
- PUT `/api/holidays/config/types/:id`
- DELETE `/api/holidays/config/types/:id`
- GET `/api/holidays/config/holiday-groups`
- POST `/api/holidays/config/holiday-groups`
- PUT `/api/holidays/config/groups/:id`
- DELETE `/api/holidays/config/groups/:id`

#### 4.3.3 Supporting Components

**Component:** `src/components/holiday/HolidayDrawer.tsx` (~400+ lines)

**Purpose:** Add/Edit holiday form in a side drawer

**Features:**
- Sheet/drawer interface
- Form validation
- Image upload with preview (max 2MB)
- Multi-select for groups
- Date picker
- Save as draft or publish
- Convert image to base64

**Component:** `src/components/holiday/BulkUploadHolidaysDrawer.tsx` (~500+ lines)

**Purpose:** Bulk upload holidays via Excel file

**Features:**
- Drag-and-drop file upload
- Excel/CSV parsing with `xlsx` library
- Template download
- Date format auto-detection (Excel serial dates, strings, date objects)
- Validation with error reporting
- Progress indicator
- Batch creation with error handling

**Template Structure:**
| Name | Date | Type | Group | Description | Notes |
|------|------|------|-------|-------------|-------|
| Christmas Day | 2026-12-25 | Public | Global | Christmas celebration | Office closed |

**Component:** `src/components/holiday/HolidayDashboardCards.tsx` (~200+ lines)

**Purpose:** Display holiday statistics dashboard

**Features:**
- 4 stat cards: Total, Type Distribution, Monthly Pattern, Weekly Pattern
- Dynamic calculation based on filtered holidays
- Visual display with icons
- Responsive grid layout

---

### 4.4 Services Layer

**Service File:** `src/services/holidayService.ts` (~300+ lines)

**Purpose:** API abstraction layer for holiday operations

**Exports:**
- `getHolidays(filters)` - Fetch holidays with filters
- `getHolidayById(id)` - Get single holiday
- `createHoliday(data)` - Create new holiday
- `updateHoliday(id, data)` - Update holiday
- `publishHoliday(id)` - Publish draft holiday
- `deleteHoliday(id)` - Soft delete holiday
- `getEmployeeVisibleHolidays(params)` - Get employee-accessible holidays
- Configuration APIs: getCountries, createCountry, updateCountry, deleteCountry
- Configuration APIs: getRegions, createRegion, updateRegion, deleteRegion
- Configuration APIs: getClients, createClient, updateClient, deleteClient
- Configuration APIs: getDepartments, createDepartment
- Configuration APIs: getHolidayTypes, createHolidayType, updateHolidayType, deleteHolidayType
- Configuration APIs: getObservanceTypes, createObservanceType
- Configuration APIs: getHolidayGroups, createHolidayGroup, updateHolidayGroup, deleteHolidayGroup

**Authentication:** Uses token from localStorage (`auth-token`)

---

## Backend Models

### 5.1 Leave Policy Model

**File:** `server/src/models/LeavePolicy.ts` (85 lines)

**Interface:**
```typescript
interface ILeavePolicy extends Document {
    leaveType: string;
    country: string;
    allocation: number;
    distribution: 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
    carryForward: boolean;
    maxCarryForward?: number;
    encashable: boolean;
    requiresApproval: boolean;
    minDaysNotice?: number;
    maxConsecutiveDays?: number;
    description?: string;
    isActive: boolean;
}
```

**Exports:**
- Mongoose model: `LeavePolicy`
- Interface: `ILeavePolicy`
- Export statement: `export { LeavePolicy }`

---

### 5.2 Module Permission Model

**File:** `server/src/models/ModulePermission.ts` (58 lines)

**Interface:**
```typescript
interface IModulePermission extends Document {
    employeeId: string;
    module: 'EMPLOYEE' | 'HR' | 'RMG' | 'HELPDESK' | 'LEAVE';
    enabled: boolean;
    isAdmin: boolean;
    permissions: {
        view: boolean;
        add: boolean;
        modify: boolean;
    };
}
```

**Exports:**
- Mongoose model: `ModulePermission`
- Interface: `IModulePermission`
- Export statement: `export { ModulePermission }`

---

### 5.3 Holiday Models

#### 5.3.1 Holiday Model

**File:** `server/src/models/Holiday.ts` (118 lines)

**Interface:**
```typescript
interface IHoliday extends Document {
    name: string;
    date: Date;
    countryId?: mongoose.Types.ObjectId;
    regionId?: mongoose.Types.ObjectId;
    clientId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    groupIds?: mongoose.Types.ObjectId[];
    typeId: mongoose.Types.ObjectId;
    observanceTypeId: mongoose.Types.ObjectId;
    description?: string;
    notes?: string;
    imageUrl?: string;
    status: HolidayStatus;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    publishedAt?: Date;
}

enum HolidayStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}
```

**Exports:**
- Mongoose model: `Holiday`
- Enum: `HolidayStatus`
- Interface: `IHoliday`
- Export statements: `export default mongoose.model<IHoliday>('Holiday', HolidaySchema);` and `export { HolidayStatus };`

#### 5.3.2 Holiday Type Model

**File:** `server/src/models/HolidayType.ts` (42 lines)

**Interface:**
```typescript
interface IHolidayType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
}
```

**Exports:**
- Default export: Mongoose model

#### 5.3.3 Observance Type Model

**File:** `server/src/models/ObservanceType.ts` (42 lines)

**Interface:**
```typescript
interface IObservanceType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
}
```

**Exports:**
- Default export: Mongoose model

#### 5.3.4 Holiday Group Model

**File:** `server/src/models/HolidayGroup.ts` (52 lines)

**Interface:**
```typescript
interface IHolidayGroup extends Document {
    name: string;
    description?: string;
    employeeIds: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
}
```

**Exports:**
- Default export: Mongoose model

#### 5.3.5 Supporting Models

**Country Model:** `server/src/models/Country.ts` (52 lines)
**Region Model:** `server/src/models/Region.ts` (48 lines)
**Client Model:** `server/src/models/Client.ts` (68 lines)
**Department Model:** `server/src/models/Department.ts` (58 lines)
**Holiday Calendar Model (Legacy):** `server/src/models/HolidayCalendar.ts` (80 lines)

---

## API Endpoints

### 6.1 Leave Policy Endpoints

**Base URL:** `/api/superadmin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/leave-policies` | Get all active leave policies | SUPER_ADMIN |
| POST | `/leave-policy` | Create or update policy (upsert) | SUPER_ADMIN |
| PUT | `/leave-policy/:id` | Update specific policy | SUPER_ADMIN |
| DELETE | `/leave-policy/:id` | Soft delete policy (isActive=false) | SUPER_ADMIN |

**Request Body Example (POST/PUT):**
```json
{
  "leaveType": "Annual Leave",
  "country": "India",
  "allocation": 20,
  "distribution": "ANNUAL",
  "carryForward": true,
  "maxCarryForward": 5,
  "encashable": true,
  "requiresApproval": true,
  "minDaysNotice": 7,
  "maxConsecutiveDays": 10,
  "description": "Annual paid leave policy"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Leave policy saved successfully",
  "data": { /* policy object */ }
}
```

---

### 6.2 Module Permission Endpoints

**Base URL:** `/api/superadmin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/permissions` | Get all permissions with employee details | SUPER_ADMIN |
| GET | `/permissions/:employeeId` | Get permissions for specific employee | SUPER_ADMIN |
| POST | `/permissions` | Create or update permission (upsert) | SUPER_ADMIN |
| PUT | `/permissions/:id` | Update permission by ID | SUPER_ADMIN |
| DELETE | `/permissions/:id` | Delete permission | SUPER_ADMIN |
| GET | `/employees/search?q={query}` | Search employees for assignment | SUPER_ADMIN |

**Request Body Example (POST/PUT):**
```json
{
  "employeeId": "EMP001",
  "module": "HELPDESK",
  "enabled": true,
  "isAdmin": true,
  "permissions": {
    "view": true,
    "add": true,
    "modify": true
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Permission updated successfully",
  "data": { /* permission object with employee details */ }
}
```

---

### 6.3 Holiday Management Endpoints

**Base URL:** `/api/holidays`

#### 6.3.1 Holiday CRUD

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all holidays with filters & pagination | Authenticated |
| GET | `/:id` | Get single holiday by ID | Authenticated |
| POST | `/` | Create new holiday (as DRAFT) | SUPER_ADMIN, HR_ADMIN |
| PUT | `/:id` | Update holiday details | SUPER_ADMIN, HR_ADMIN |
| POST | `/:id/publish` | Publish a draft holiday | SUPER_ADMIN, HR_ADMIN |
| DELETE | `/:id` | Soft delete holiday | SUPER_ADMIN |
| GET | `/employee/visible` | Get holidays visible to employee | Authenticated |

**Query Parameters for GET /:**
- `status` - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `countryId` - Filter by country
- `regionId` - Filter by region
- `clientId` - Filter by client
- `groupId` - Filter by holiday group (primary method)
- `year` - Filter by year
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Request Body Example (POST):**
```json
{
  "name": "Christmas Day",
  "date": "2024-12-25",
  "typeId": "64f1234567890abcdef12350",
  "observanceTypeId": "64f1234567890abcdef12351",
  "groupIds": ["64f1234567890abcdef12352"],
  "description": "Christmas celebration",
  "notes": "Office closed",
  "imageUrl": "data:image/png;base64,...",
  "isGlobal": false
}
```

#### 6.3.2 Configuration Endpoints

**Countries:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/countries` | Get all countries | Authenticated |
| POST | `/config/countries` | Create country | SUPER_ADMIN |
| PUT | `/config/countries/:id` | Update country | SUPER_ADMIN |
| DELETE | `/config/countries/:id` | Delete country | SUPER_ADMIN |

**Regions:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/regions?countryId={id}` | Get regions (optional filter) | Authenticated |
| POST | `/config/regions` | Create region | SUPER_ADMIN |
| PUT | `/config/regions/:id` | Update region | SUPER_ADMIN |
| DELETE | `/config/regions/:id` | Delete region | SUPER_ADMIN |

**Clients:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/clients?regionId={id}&countryId={id}` | Get clients | Authenticated |
| POST | `/config/clients` | Create client | SUPER_ADMIN |
| PUT | `/config/clients/:id` | Update client | SUPER_ADMIN |
| DELETE | `/config/clients/:id` | Delete client | SUPER_ADMIN |

**Departments:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/departments` | Get active departments | Authenticated |
| POST | `/config/departments` | Create department | SUPER_ADMIN |

**Holiday Types:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/holiday-types` | Get all holiday types | Authenticated |
| POST | `/config/holiday-types` | Create holiday type | SUPER_ADMIN |
| PUT | `/config/types/:id` | Update holiday type | SUPER_ADMIN |
| DELETE | `/config/types/:id` | Delete holiday type | SUPER_ADMIN |

**Observance Types:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/observance-types` | Get active observance types | Authenticated |
| POST | `/config/observance-types` | Create observance type | SUPER_ADMIN |

**Holiday Groups:**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/config/holiday-groups` | Get all groups with employees | Authenticated |
| POST | `/config/holiday-groups` | Create holiday group | SUPER_ADMIN |
| PUT | `/config/groups/:id` | Update holiday group | SUPER_ADMIN |
| DELETE | `/config/groups/:id` | Delete holiday group | SUPER_ADMIN |

---

## Dependencies

### 7.1 NPM Packages (Frontend)

**Core Dependencies:**
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "axios": "^1.x",
  "sonner": "^1.x",
  "lucide-react": "^0.x",
  "xlsx": "^0.18.x",
  "date-fns": "^3.x"
}
```

**UI Component Library (shadcn/ui):**
- `@/components/ui/card`
- `@/components/ui/button`
- `@/components/ui/dialog`
- `@/components/ui/sheet`
- `@/components/ui/table`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/textarea`
- `@/components/ui/select`
- `@/components/ui/checkbox`
- `@/components/ui/switch`
- `@/components/ui/badge`
- `@/components/ui/tabs`
- `@/components/ui/alert`
- `@/components/ui/alert-dialog`
- `@/components/ui/tooltip`
- `@/components/ui/progress`
- `@/components/ui/date-picker`
- `@/components/ui/multi-select`

**Custom Component:**
- `@/components/ui/multi-select` - Multi-select dropdown (ensure this exists in your project)

**Utilities:**
- `@/lib/utils` - cn() utility function

### 7.2 NPM Packages (Backend)

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "bcryptjs": "^2.x"
}
```

**Middleware Required:**
- `authMiddleware` / `authenticateToken` - JWT authentication
- `authorizeRoles` - Role-based access control

---

## Integration Steps

### 8.1 Prerequisites

1. **Existing Infrastructure:**
   - MongoDB instance running
   - Express.js backend server
   - React frontend with TypeScript
   - Authentication system with JWT tokens
   - User/Employee collections in database

2. **Required Models:**
   - `User` model with role field
   - `Employee` model with employeeId, name, email, department fields

3. **UI Component Library:**
   - shadcn/ui components installed
   - Tailwind CSS configured

### 8.2 Backend Integration

#### Step 1: Copy Model Files

Copy the following model files to `server/src/models/`:

**Leave Policy:**
- `LeavePolicy.ts`

**Module Permissions:**
- `ModulePermission.ts`

**Holiday Management:**
- `Holiday.ts`
- `HolidayType.ts`
- `ObservanceType.ts`
- `HolidayGroup.ts`
- `Country.ts`
- `Region.ts`
- `Client.ts`
- `Department.ts`
- `HolidayCalendar.ts` (legacy, optional)

#### Step 2: Copy Route Files

Copy the following route files to `server/src/routes/`:

- `holidays.ts` - All holiday management endpoints
- Update `superAdmin.ts` with leave policy, permission, and employee search routes

**Required Routes from superAdmin.ts:**
- Lines 1098-1130: Employee search endpoint (`GET /employees/search`)
- Lines 1132-1254: Module permission routes (GET, POST, PUT, DELETE `/permissions`)
- Lines 1543-1655: Leave policy routes (GET, POST, PUT, DELETE `/leave-policy`)
- Lines 1657-1764: Holiday calendar routes (GET, POST, PUT, DELETE `/holiday-calendar`) - Legacy, optional

#### Step 3: Register Routes

In your main server file (`server/src/index.ts` or `server/src/app.ts`):

```typescript
import holidayRoutes from './routes/holidays';
import superAdminRoutes from './routes/superAdmin';

// Register routes
app.use('/api/holidays', holidayRoutes);
app.use('/api/superadmin', superAdminRoutes);
```

#### Step 4: Middleware Setup

Ensure authentication and authorization middleware is properly configured:

```typescript
// Example middleware structure in server/src/middleware/auth.ts
export const authMiddleware = (req, res, next) => {
  // Verify JWT token from Authorization header
  // Attach user info to req.user
};

export const authorizeRoles = (...roles: string[]) => {
  return (req, res, next) => {
    // Check if req.user.role is in allowed roles
  };
};
```

### 8.3 Frontend Integration

#### Step 1: Copy Component Files

**Page Components:**
- `src/pages/superadmin/LeavePolicyConfig.tsx`
- `src/pages/superadmin/PermissionsMatrix.tsx`
- `src/pages/superadmin/HolidayManagement.tsx`
- `src/pages/superadmin/HolidayConfiguration.tsx`

**Supporting Components:**
- `src/components/holiday/HolidayDrawer.tsx`
- `src/components/holiday/BulkUploadHolidaysDrawer.tsx`
- `src/components/holiday/HolidayDashboardCards.tsx`

#### Step 2: Copy Type Definitions

- `src/types/superAdmin.ts` - All Super Admin types (use only Leave Policy and Permission types)
- `src/types/holiday.ts` - All Holiday module types

#### Step 3: Copy Service Layer

- `src/services/holidayService.ts` - Holiday API service

#### Step 4: Install Required Packages

```bash
# Frontend packages
npm install sonner xlsx date-fns

# Ensure shadcn/ui components are installed
npx shadcn-ui@latest add card button dialog sheet table input label textarea select checkbox switch badge tabs alert alert-dialog tooltip progress
```

#### Step 5: Update Routing

Add routes to your React Router configuration:

```typescript
// In your router configuration file
import { LeavePolicyConfig } from '@/pages/superadmin/LeavePolicyConfig';
import { PermissionsMatrix } from '@/pages/superadmin/PermissionsMatrix';
import { HolidayManagement } from '@/pages/superadmin/HolidayManagement';
import { HolidayConfiguration } from '@/pages/superadmin/HolidayConfiguration';

// Add to routes
{
  path: '/superadmin',
  children: [
    { path: 'leave-policies', element: <LeavePolicyConfig /> },
    { path: 'permissions', element: <PermissionsMatrix /> },
    { path: 'holidays', element: <HolidayManagement /> },
    { path: 'holiday-config', element: <HolidayConfiguration /> }
  ]
}
```

#### Step 6: Update Navigation

Add menu items to your Super Admin navigation:

```typescript
const superAdminMenuItems = [
  { path: '/superadmin/leave-policies', label: 'Leave Policies', icon: Calendar },
  { path: '/superadmin/permissions', label: 'Module Permissions', icon: Shield },
  { path: '/superadmin/holidays', label: 'Holiday Calendar', icon: Calendar },
  { path: '/superadmin/holiday-config', label: 'Holiday Configuration', icon: Settings },
];
```

### 8.4 Environment Configuration

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Frontend (vite config or environment):**
```env
VITE_API_URL=http://localhost:5000/api
```

Update API base URL in `holidayService.ts` if different:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 8.5 Database Initialization

**Create Indexes:**

MongoDB will automatically create indexes based on model schemas when documents are first inserted. However, you can manually create them:

```javascript
// Connect to MongoDB
use your_database;

// Leave Policies
db.leavepolicies.createIndex({ leaveType: 1, country: 1 }, { unique: true });

// Module Permissions
db.modulepermissions.createIndex({ employeeId: 1, module: 1 }, { unique: true });

// Holidays (8 indexes)
db.holidays.createIndex({ date: 1, status: 1 });
db.holidays.createIndex({ countryId: 1, date: 1 });
db.holidays.createIndex({ regionId: 1, date: 1 });
db.holidays.createIndex({ clientId: 1, date: 1 });
db.holidays.createIndex({ departmentId: 1, date: 1 });
db.holidays.createIndex({ groupIds: 1 });
db.holidays.createIndex({ status: 1, isActive: 1 });
db.holidays.createIndex({ typeId: 1, date: 1 });

// Holiday Types
db.holidaytypes.createIndex({ name: 1 }, { unique: true });
db.holidaytypes.createIndex({ isActive: 1 });

// Observance Types
db.observancetypes.createIndex({ name: 1 }, { unique: true });
db.observancetypes.createIndex({ isActive: 1 });

// Holiday Groups
db.holidaygroups.createIndex({ name: 1 }, { unique: true });
db.holidaygroups.createIndex({ isActive: 1 });
db.holidaygroups.createIndex({ employeeIds: 1 });

// Countries
db.countries.createIndex({ name: 1 }, { unique: true });
db.countries.createIndex({ code: 1 }, { unique: true });
db.countries.createIndex({ isActive: 1 });

// Regions
db.regions.createIndex({ name: 1, countryId: 1 }, { unique: true });
db.regions.createIndex({ countryId: 1 });
db.regions.createIndex({ isActive: 1 });

// Clients
db.clients.createIndex({ name: 1, regionId: 1 }, { unique: true });
db.clients.createIndex({ code: 1 }, { unique: true });
db.clients.createIndex({ regionId: 1 });
db.clients.createIndex({ countryId: 1 });
db.clients.createIndex({ isActive: 1 });

// Departments
db.departments.createIndex({ name: 1 }, { unique: true });
db.departments.createIndex({ code: 1 }, { unique: true });
db.departments.createIndex({ isActive: 1 });
db.departments.createIndex({ managerId: 1 });
```

---

## File Structure

### 9.1 Complete File List

#### Frontend Files

```
src/
├── pages/
│   └── superadmin/
│       ├── LeavePolicyConfig.tsx          (472 lines)
│       ├── PermissionsMatrix.tsx          (~1000+ lines)
│       ├── HolidayManagement.tsx          (~1500+ lines)
│       └── HolidayConfiguration.tsx       (~800+ lines)
│
├── components/
│   ├── holiday/
│   │   ├── HolidayDrawer.tsx              (~400+ lines)
│   │   ├── BulkUploadHolidaysDrawer.tsx   (~500+ lines)
│   │   └── HolidayDashboardCards.tsx      (~200+ lines)
│   │
│   └── ui/                                 [shadcn/ui components]
│       ├── card.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── checkbox.tsx
│       ├── switch.tsx
│       ├── badge.tsx
│       ├── tabs.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── tooltip.tsx
│       ├── progress.tsx
│       ├── date-picker.tsx
│       └── multi-select.tsx
│
├── services/
│   └── holidayService.ts                  (~300+ lines)
│
├── types/
│   ├── superAdmin.ts                      (Full file)
│   └── holiday.ts                         (Full file)
│
└── lib/
    └── utils.ts                           [cn() utility function]
```

#### Backend Files

```
server/
├── src/
│   ├── models/
│   │   ├── LeavePolicy.ts                 (85 lines)
│   │   ├── ModulePermission.ts            (58 lines)
│   │   ├── Holiday.ts                     (118 lines)
│   │   ├── HolidayType.ts                 (42 lines)
│   │   ├── ObservanceType.ts              (42 lines)
│   │   ├── HolidayGroup.ts                (52 lines)
│   │   ├── Country.ts                     (52 lines)
│   │   ├── Region.ts                      (48 lines)
│   │   ├── Client.ts                      (68 lines)
│   │   ├── Department.ts                  (58 lines)
│   │   ├── HolidayCalendar.ts             (80 lines) [Legacy - Optional]
│   │   ├── Employee.ts                    (Required - reference)
│   │   └── User.ts                        (Required - reference)
│   │
│   ├── routes/
│   │   ├── holidays.ts                    (~450+ lines)
│   │   └── superAdmin.ts                  (1764 lines - extract relevant sections)
│   │
│   └── middleware/
│       └── auth.ts                        (Required - implementation not included)
```

---

## Detailed API Specifications

### 10.1 Leave Policy API Details

#### GET /api/superadmin/leave-policies

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1234567890abcdef12345",
      "leaveType": "Annual Leave",
      "country": "India",
      "allocation": 20,
      "distribution": "ANNUAL",
      "carryForward": true,
      "maxCarryForward": 5,
      "encashable": true,
      "requiresApproval": true,
      "minDaysNotice": 7,
      "maxConsecutiveDays": 10,
      "description": "Annual paid leave policy",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/superadmin/leave-policy

**Request:**
```json
{
  "leaveType": "Sick Leave",
  "country": "USA",
  "allocation": 10,
  "distribution": "QUARTERLY",
  "carryForward": false,
  "encashable": false,
  "requiresApproval": false,
  "description": "Sick leave policy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave policy saved successfully",
  "data": { /* created policy object */ }
}
```

**Note:** This endpoint uses upsert logic. If a policy with same leaveType + country exists, it will be updated.

---

### 10.2 Module Permission API Details

#### GET /api/superadmin/permissions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1234567890abcdef12346",
      "employeeId": "EMP001",
      "module": "HELPDESK",
      "enabled": true,
      "isAdmin": true,
      "permissions": {
        "view": true,
        "add": true,
        "modify": true
      },
      "employee": {
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP001",
        "designation": "Senior Developer",
        "department": "IT"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/superadmin/permissions

**Request:**
```json
{
  "employeeId": "EMP002",
  "module": "LEAVE",
  "enabled": true,
  "isAdmin": false,
  "permissions": {
    "view": true,
    "add": true,
    "modify": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permission updated successfully",
  "data": { /* created/updated permission object */ }
}
```

**Note:** Uses upsert logic based on employeeId + module combination.

#### GET /api/superadmin/employees/search?q={query}

**Purpose:** Search employees for permission assignment

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john@example.com",
      "designation": "Senior Developer",
      "department": "IT"
    }
  ]
}
```

---

### 10.3 Holiday Management API Details

#### GET /api/holidays

**Query Parameters:**
- `status` - DRAFT | PUBLISHED | ARCHIVED
- `countryId` - Country ObjectId
- `regionId` - Region ObjectId
- `clientId` - Client ObjectId
- `groupId` - Holiday Group ObjectId (primary filtering)
- `year` - Year number (e.g., 2024)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "holidays": [
      {
        "_id": "64f1234567890abcdef12347",
        "name": "Christmas Day",
        "date": "2024-12-25T00:00:00.000Z",
        "typeId": {
          "_id": "64f1234567890abcdef12350",
          "name": "Public Holiday"
        },
        "observanceTypeId": {
          "_id": "64f1234567890abcdef12351",
          "name": "Fixed Date"
        },
        "groupIds": [
          {
            "_id": "64f1234567890abcdef12352",
            "name": "Global",
            "description": "All employees"
          }
        ],
        "description": "Christmas celebration",
        "notes": "Office closed",
        "imageUrl": "data:image/png;base64,...",
        "status": "PUBLISHED",
        "isActive": true,
        "createdBy": {
          "_id": "64f1234567890abcdef12348",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "approvedBy": {
          "_id": "64f1234567890abcdef12349",
          "name": "Super Admin",
          "email": "superadmin@example.com"
        },
        "publishedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### POST /api/holidays

**Request:**
```json
{
  "name": "New Year's Day",
  "date": "2025-01-01",
  "typeId": "64f1234567890abcdef12350",
  "observanceTypeId": "64f1234567890abcdef12351",
  "groupIds": ["64f1234567890abcdef12352"],
  "description": "New Year celebration",
  "notes": "Office closed",
  "isGlobal": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created holiday with populated references */ }
}
```

**Note:** Holiday is created with status "DRAFT" by default.

#### POST /api/holidays/:id/publish

**Purpose:** Publish a draft holiday

**Response:**
```json
{
  "success": true,
  "data": { /* published holiday with approvedBy and publishedAt populated */ }
}
```

#### GET /api/holidays/employee/visible

**Purpose:** Get holidays visible to authenticated employee based on their group assignment

**Query Parameters:**
- `countryId` - Filter by country
- `regionId` - Filter by region
- `clientId` - Filter by client
- `groupId` - Employee's holiday group
- `year` - Filter by year

**Response:**
```json
{
  "success": true,
  "data": [ /* array of published holidays visible to employee */ ]
}
```

**Visibility Logic:**
1. Global holidays (no country/region/client/group specified)
2. Group-based holidays (if employee is in the group)
3. Country-level holidays (legacy support)
4. Region-level holidays (legacy support)
5. Client-level holidays (legacy support)

---

### 10.4 Configuration API Details

All configuration endpoints follow similar patterns:

**GET** - Returns all items (active and inactive)
**POST** - Creates new item with `createdBy` set to authenticated user
**PUT** - Updates existing item
**DELETE** - Hard deletes item (or soft delete for specific models)

**Standard Response Format:**
```json
{
  "success": true,
  "data": [ /* array of items */ ]
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Additional Notes

### 11.1 Authentication Flow

All API requests require:
1. JWT token in `Authorization` header: `Bearer {token}`
2. Token stored in localStorage with key: `auth-token`

**Frontend Token Retrieval:**
```typescript
const token = localStorage.getItem('auth-token');
```

**Backend Token Verification:**
```typescript
// Implemented in authMiddleware
// Extracts user info and attaches to req.user
req.user = {
  id: 'userId',
  userId: 'employeeId',
  role: 'SUPER_ADMIN',
  // ... other user fields
};
```

### 11.2 Role-Based Access Control

**Required Roles:**
- **Leave Policy:** SUPER_ADMIN
- **Module Permissions:** SUPER_ADMIN
- **Holiday Management:**
  - View: Any authenticated user
  - Create/Edit/Delete: SUPER_ADMIN, HR_ADMIN
  - Publish: SUPER_ADMIN, HR_ADMIN

### 11.3 Data Relationships

**Module Permissions → Employee:**
- `employeeId` (String) references `Employee.employeeId`
- Manual population required (not ObjectId reference)

**Holidays → Multiple References:**
- `typeId` → HolidayType
- `observanceTypeId` → ObservanceType
- `groupIds` → HolidayGroup (array)
- `countryId` → Country (optional)
- `regionId` → Region (optional)
- `clientId` → Client (optional)
- `departmentId` → Department (optional)
- `createdBy` → User
- `approvedBy` → User (optional)

**Holiday Groups → Employees:**
- `employeeIds` → Employee (array of ObjectIds)

**Regions → Countries:**
- `countryId` → Country

**Clients → Countries & Regions:**
- `countryId` → Country (required)
- `regionId` → Region (optional)

### 11.4 Validation Rules

**Leave Policy:**
- `leaveType` + `country` must be unique
- `allocation` must be positive number
- `maxCarryForward` only if `carryForward` is true

**Module Permission:**
- `employeeId` + `module` must be unique
- Employee must exist in database
- Module must be one of enum values

**Holiday:**
- `name` and `date` are required
- `typeId` and `observanceTypeId` must reference existing documents
- Status can only be changed via publish endpoint
- Image size limited to 2MB (frontend validation)

**Holiday Types/Groups:**
- `name` must be unique
- Active status toggle requires confirmation

### 11.5 Excel Bulk Upload Specification

**Template Columns:**
1. **Name** (required) - Holiday name
2. **Date** (required) - Format: YYYY-MM-DD or Excel date serial
3. **Type** (required) - Must match existing holiday type name (case-insensitive)
4. **Group** (optional) - Must match existing group name (case-insensitive) or "Global"
5. **Description** (optional) - Holiday description
6. **Notes** (optional) - Additional notes

**Date Format Support:**
- Excel serial numbers (e.g., 44927 for 2023-01-01)
- ISO format (YYYY-MM-DD)
- Date strings parseable by JavaScript Date

**Validation:**
- All required fields must be present
- Holiday type must exist in system
- Holiday group must exist if specified (or use "Global")
- Date must be valid

**Processing:**
- Holidays are created with status "ACTIVE" (PUBLISHED)
- Default observance type is used if not specified
- Progress indicator shown during upload
- Errors are collected and displayed

---

## Testing Checklist

### 12.1 Leave Policy Module

- [ ] Create policy with all fields
- [ ] Create duplicate policy (should fail with unique constraint error)
- [ ] Update existing policy
- [ ] Delete policy (should set isActive=false)
- [ ] Verify quarterly distribution option saves correctly
- [ ] Test carryForward with/without maxCarryForward
- [ ] Verify UI displays all policies in grid format

### 12.2 Module Permission Module

- [ ] Search for employee
- [ ] Assign permission to new employee
- [ ] Enable/disable module for employee
- [ ] Toggle admin status
- [ ] Toggle view/add/modify permissions
- [ ] Filter by department
- [ ] Verify bulk operations work
- [ ] Check tab switching (All Employees vs Department)
- [ ] Verify duplicate permission (same employeeId + module) is prevented

### 12.3 Holiday Management Module

**Holiday Calendar:**
- [ ] Create holiday as draft
- [ ] Edit draft holiday
- [ ] Publish draft holiday
- [ ] Archive holiday
- [ ] Delete holiday
- [ ] Filter by year
- [ ] Filter by group
- [ ] Search holidays
- [ ] View dashboard stats
- [ ] Upload holiday image
- [ ] Export holidays to Excel

**Configuration:**
- [ ] Create holiday type
- [ ] Toggle holiday type active/inactive
- [ ] Create holiday group
- [ ] Assign employees to group
- [ ] Update group details

**Bulk Upload:**
- [ ] Download template
- [ ] Upload valid Excel file
- [ ] Handle validation errors
- [ ] Verify progress indicator
- [ ] Check error reporting for invalid rows

**Supporting Entities:**
- [ ] Create country with unique code
- [ ] Create region under country
- [ ] Create client under region/country
- [ ] Create department

---

## Known Dependencies on Other Modules

### 13.1 Employee Module

**Required for:**
- Module Permissions (employee lookup, validation)
- Holiday Groups (employee assignment)

**Required Fields:**
- `employeeId` (String, unique)
- `name` (String)
- `email` (String, unique)
- `department` (String)
- `designation` (String)
- `status` (String: 'active' | 'inactive' | 'on-leave')
- `isActive` (Boolean)
- `holidayGroupId` (ObjectId, optional) - References HolidayGroup

**Required Indexes:**
- `{ employeeId: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ department: 1, status: 1 }`

### 13.2 User Module

**Required for:**
- Authentication (all modules)
- Created by tracking (all models)
- Approval tracking (holidays)

**Required Fields:**
- `_id` (ObjectId)
- `name` (String)
- `email` (String)
- `role` (String)
- `employeeId` (String, optional)
- `isActive` (Boolean)

**Required Roles:**
- `SUPER_ADMIN` - Full access to all modules
- `HR_ADMIN` - Holiday management access (optional)

### 13.3 Authentication Middleware

**Required Middleware:**

```typescript
// authMiddleware or authenticateToken
// Extract and verify JWT token
// Attach user info to req.user

// authorizeRoles(...roles)
// Check if req.user.role is in allowed roles list
```

**User Object Structure on req.user:**
```typescript
{
  id: string,           // User _id
  userId: string,       // employeeId or fallback to _id
  role: string,         // User role
  email: string,        // User email
  name: string          // User name
}
```

---

## Configuration Examples

### 14.1 Initial Data Seeding

**Holiday Types (Recommended):**
```javascript
[
  { name: "Public Holiday", description: "National public holidays", isActive: true },
  { name: "Optional Holiday", description: "Optional holidays employees can choose", isActive: true },
  { name: "Regional Holiday", description: "Region-specific holidays", isActive: true },
  { name: "Festival", description: "Cultural or religious festivals", isActive: true }
]
```

**Observance Types (Recommended):**
```javascript
[
  { name: "Fixed Date", description: "Same date every year", isActive: true },
  { name: "Floating Date", description: "Date varies each year", isActive: true },
  { name: "Lunar Calendar", description: "Based on lunar calendar", isActive: true }
]
```

**Holiday Groups (Example):**
```javascript
[
  { name: "Global", description: "All employees worldwide", employeeIds: [], isActive: true },
  { name: "India Team", description: "Employees in India", employeeIds: [...], isActive: true },
  { name: "US Team", description: "Employees in USA", employeeIds: [...], isActive: true }
]
```

**Module Permissions (Example Role Setup):**
```javascript
// Super Admin - All modules enabled with full permissions
{
  employeeId: "ADMIN001",
  module: "EMPLOYEE",
  enabled: true,
  isAdmin: true,
  permissions: { view: true, add: true, modify: true }
}

// HR Manager - HR and LEAVE modules
{
  employeeId: "HR001",
  module: "HR",
  enabled: true,
  isAdmin: true,
  permissions: { view: true, add: true, modify: true }
}

// Regular Employee - Limited access
{
  employeeId: "EMP001",
  module: "LEAVE",
  enabled: true,
  isAdmin: false,
  permissions: { view: true, add: false, modify: false }
}
```

---

## Troubleshooting

### 15.1 Common Issues

**Issue:** "Employee not found" when creating permission
- **Solution:** Ensure employee exists in Employee collection with matching employeeId

**Issue:** Duplicate key error on leave policy creation
- **Solution:** A policy with same leaveType + country already exists. Use update instead.

**Issue:** Holidays not visible to employee
- **Solution:** Check employee's holidayGroupId and ensure holidays are assigned to that group, or create global holidays

**Issue:** Cannot upload Excel file
- **Solution:** Install `xlsx` package: `npm install xlsx`

**Issue:** Images not displaying
- **Solution:** Images are stored as base64 data URLs. Check browser console for CORS or data URL issues.

**Issue:** Permission changes not reflecting
- **Solution:** Clear browser cache or localStorage. Check network tab for API errors.

### 15.2 Debug Tips

**Backend:**
```typescript
// Enable detailed logging
console.log('Request body:', req.body);
console.log('User info:', req.user);
console.log('Query params:', req.query);
```

**Frontend:**
```typescript
// Check API responses
console.log('Response data:', response.data);

// Verify token
const token = localStorage.getItem('auth-token');
console.log('Auth token:', token);
```

---

## Migration Strategy

### 16.1 From Existing System

If you have existing leave policies, permissions, or holidays:

1. **Export existing data** from your current system
2. **Transform to new schema format** (see examples above)
3. **Import via MongoDB:**
   ```bash
   mongoimport --db your_database --collection leavepolicies --file leave_policies.json --jsonArray
   mongoimport --db your_database --collection modulepermissions --file permissions.json --jsonArray
   mongoimport --db your_database --collection holidays --file holidays.json --jsonArray
   ```

4. **Verify indexes are created:**
   ```bash
   db.leavepolicies.getIndexes()
   db.modulepermissions.getIndexes()
   db.holidays.getIndexes()
   ```

### 16.2 Testing Data

**Sample Leave Policies:**
```javascript
db.leavepolicies.insertMany([
  {
    leaveType: "Annual Leave",
    country: "India",
    allocation: 20,
    distribution: "ANNUAL",
    carryForward: true,
    maxCarryForward: 5,
    encashable: true,
    requiresApproval: true,
    minDaysNotice: 7,
    maxConsecutiveDays: 10,
    description: "Annual paid leave",
    isActive: true
  },
  {
    leaveType: "Sick Leave",
    country: "India",
    allocation: 12,
    distribution: "QUARTERLY",
    carryForward: false,
    encashable: false,
    requiresApproval: false,
    description: "Medical leave",
    isActive: true
  }
]);
```

**Sample Module Permissions:**
```javascript
db.modulepermissions.insertMany([
  {
    employeeId: "EMP001",
    module: "HELPDESK",
    enabled: true,
    isAdmin: true,
    permissions: { view: true, add: true, modify: true }
  },
  {
    employeeId: "EMP001",
    module: "LEAVE",
    enabled: true,
    isAdmin: false,
    permissions: { view: true, add: true, modify: false }
  }
]);
```

---

## API Base URL Configuration

### Frontend Service Configuration

In `src/services/holidayService.ts`, update the API base URL:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Environment Variables

**Development:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Production:**
```env
VITE_API_URL=https://your-production-domain.com/api
```

---

## UI Component Dependencies

### shadcn/ui Installation

If shadcn/ui is not already installed:

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add table
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress
```

### Custom Components Needed

**Multi-Select Component:** `src/components/ui/multi-select.tsx`

This is a custom component not part of standard shadcn/ui. Ensure it's implemented in your project or use an alternative multi-select solution.

**Date Picker Component:** `src/components/ui/date-picker.tsx`

Can be implemented using shadcn/ui's calendar and popover components.

---

## Architecture Overview

### Module Independence

Each module is designed to be independent but shares common infrastructure:

**Shared Infrastructure:**
- Authentication middleware
- User/Employee collections
- Error handling patterns
- Response formats

**Independent Features:**
- Separate collections
- Isolated routes
- Module-specific UI components
- No cross-module dependencies

### Extensibility

**Adding New Leave Types:**
- Leave types are free-form strings (not enum)
- Simply create new policy with desired leaveType name

**Adding New Modules to Permissions:**
- Update MODULE_DEFINITIONS in PermissionsMatrix.tsx
- Update ModulePermission model enum to include new module
- No backend changes needed for UI-only modules

**Adding New Holiday Visibility Levels:**
- Current: Global, Country, Region, Client, Group-based
- Extend Holiday model with new optional references
- Update API filters in holidays route
- Update HolidayDrawer form with new fields

---

## Quick Start Guide

### For the Receiving Developer

1. **Copy files** from this package to your project:
   - All frontend files (pages, components, services, types)
   - All backend files (models, routes)

2. **Install dependencies:**
   ```bash
   # Frontend
   cd frontend
   npm install sonner xlsx date-fns
   
   # Backend
   cd ../server
   npm install express mongoose bcryptjs
   ```

3. **Configure environment:**
   - Set MongoDB connection string
   - Set JWT secret
   - Update API base URL in holidayService.ts

4. **Register routes:**
   - Import and mount `/api/holidays` and `/api/superadmin` routes
   - Ensure auth middleware is applied

5. **Add navigation:**
   - Add Super Admin menu items to your navigation
   - Add protected routes for each page

6. **Initialize database:**
   - Start MongoDB
   - Run application to auto-create collections
   - Seed initial data (holiday types, observance types, groups)

7. **Test each module:**
   - Create test leave policy
   - Assign permission to test employee
   - Create test holiday and publish

---

## Support Information

### Code Owners
- **Original Developer:** Praveen Uppala
- **Organization:** Acuvate Software Private Limited

### Module Version
- **Leave Policy Config:** v1.0
- **Module Permissions:** v1.0
- **Holiday Management:** v2.0 (Group-based system)

### Last Updated
- February 2024

---

## Appendix: Complete Route Mapping

### Super Admin Routes (`/api/superadmin`)

```
✓ GET    /leave-policies                    - List all policies
✓ POST   /leave-policy                      - Create/update policy (upsert)
✓ PUT    /leave-policy/:id                  - Update specific policy
✓ DELETE /leave-policy/:id                  - Delete policy

✓ GET    /permissions                       - List all permissions
✓ GET    /permissions/:employeeId           - Get employee permissions
✓ POST   /permissions                       - Create/update permission (upsert)
✓ PUT    /permissions/:id                   - Update permission
✓ DELETE /permissions/:id                   - Delete permission

✓ GET    /employees/search?q={query}        - Search employees
```

### Holiday Routes (`/api/holidays`)

```
✓ GET    /                                  - List holidays (with filters)
✓ GET    /:id                               - Get single holiday
✓ POST   /                                  - Create holiday (DRAFT)
✓ PUT    /:id                               - Update holiday
✓ POST   /:id/publish                       - Publish holiday
✓ DELETE /:id                               - Delete holiday
✓ GET    /employee/visible                  - Get employee-visible holidays

✓ GET    /config/countries                  - List countries
✓ POST   /config/countries                  - Create country
✓ PUT    /config/countries/:id              - Update country
✓ DELETE /config/countries/:id              - Delete country

✓ GET    /config/regions?countryId={id}     - List regions
✓ POST   /config/regions                    - Create region
✓ PUT    /config/regions/:id                - Update region
✓ DELETE /config/regions/:id                - Delete region

✓ GET    /config/clients?regionId={id}&countryId={id} - List clients
✓ POST   /config/clients                    - Create client
✓ PUT    /config/clients/:id                - Update client
✓ DELETE /config/clients/:id                - Delete client

✓ GET    /config/departments                - List departments
✓ POST   /config/departments                - Create department

✓ GET    /config/holiday-types              - List holiday types
✓ POST   /config/holiday-types              - Create holiday type
✓ PUT    /config/types/:id                  - Update holiday type
✓ DELETE /config/types/:id                  - Delete holiday type

✓ GET    /config/observance-types           - List observance types
✓ POST   /config/observance-types           - Create observance type

✓ GET    /config/holiday-groups             - List holiday groups
✓ POST   /config/holiday-groups             - Create holiday group
✓ PUT    /config/groups/:id                 - Update holiday group
✓ DELETE /config/groups/:id                 - Delete holiday group
```

---

## End of Documentation

This documentation provides complete information for integrating the three Super Admin modules. For questions or issues during integration, refer to the inline comments in the source files or test the APIs using the provided examples.

**Next Steps:**
1. Review this documentation thoroughly
2. Set up your development environment
3. Copy files systematically (models → routes → components)
4. Test each module independently
5. Deploy to staging for full integration testing

Good luck with the integration! 🚀
