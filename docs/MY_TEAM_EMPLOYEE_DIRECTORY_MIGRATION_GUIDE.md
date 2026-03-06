# My Team & Employee Directory - Migration Guide

## Document Information

- **Created Date**: March 4, 2026
- **Purpose**: Complete migration guide for My Team and Employee Directory functionality
- **System**: Keka Replica Application

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [API Services & Endpoints](#api-services--endpoints)
4. [Frontend Components](#frontend-components)
5. [Database Collections](#database-collections)
6. [Changes Summary](#changes-summary)
7. [Migration Steps](#migration-steps)
8. [Dependencies](#dependencies)

---

## Overview

This document details the implementation of real-time attendance tracking, leave management, and holiday integration for the **My Team** page, along with the comprehensive **Employee Directory** structure with multiple views.

### Key Features Implemented

#### My Team Page

1. **Real-time Attendance Status**: Shows "IN", "NOT IN YET", "Holiday", or "Leave" based on actual data
2. **Holiday Integration**: Checks holidays collection and displays holiday status
3. **Leave Management**: Displays approved leaves from leaves collection
4. **Team Calendar**: Timeline view showing team members' leaves for the month
5. **Late Arrivals Tracking**: Card with count and detailed drawer view
6. **Attendance Statistics**: Real-time stats for on-time, late, WFH, and off employees

#### Employee Directory Page

1. **Three Tab Views**:
   - **Employee Directory Tab**: Card-based grid view with comprehensive filters
   - **Organization Tree Tab**: Hierarchical tree view showing reporting structure
   - **Organization Chart Tab**: Visual organizational chart with zoom controls

2. **Advanced Filtering System**:
   - Business Unit Filter
   - Department Filter
   - Location Filter
   - Designation Filter
   - Experience Level Filter
   - Real-time search across multiple fields

3. **Employee Card Display**:
   - Profile photos with color-coded avatars
   - Status badges (active/inactive)
   - Department and designation
   - Contact information (email, phone)
   - Location and joining date
   - Direct reports count
   - Click to view detailed profile

4. **Organization Tree Features**:
   - Expandable/collapsible nodes
   - Shows direct reports and reporting manager
   - Toggle between "My Organization", "Department View", and "Top View"
   - Visual hierarchy with connecting lines
   - Count badges for teams

5. **Organization Chart Features**:
   - Interactive zoom controls (zoom in/out/reset)
   - Multiple view modes (Me, Department, Top)
   - Group by department option
   - Drag/scroll navigation
   - Visual connectors showing reporting relationships

---

## File Structure

### Frontend Files

```
src/
├── pages/
│   └── employee/
│       ├── MyTeam.tsx                          # Main My Team page component
│       └── EmployeeDirectory.tsx               # Employee Directory with 3 tabs
│
├── services/
│   ├── attendanceService.ts                    # Attendance API calls
│   ├── leaveService.ts                         # Leave management API calls
│   ├── holidayService.ts                       # Holiday API calls
│   ├── employeeService.ts                      # Employee data API calls
│   └── managerAssignmentService.ts             # Organization tree API calls
│
├── types/
│   ├── leave.ts                                # Leave type definitions
│   └── holiday.ts                              # Holiday type definitions
│
├── components/
│   └── ui/
│       ├── sheet.tsx                           # Drawer/Sheet component
│       ├── card.tsx                            # Card component
│       ├── badge.tsx                           # Badge component
│       ├── input.tsx                           # Input component
│       ├── tabs.tsx                            # Tabs component
│       ├── popover.tsx                         # Popover component
│       ├── accordion.tsx                       # Accordion component
│       ├── checkbox.tsx                        # Checkbox component
│       ├── button.tsx                          # Button component
│       └── employee-avatar.tsx                 # Employee avatar component
│
└── store/
    ├── authStore.ts                            # Authentication state
    └── employeeStore.ts                        # Employee data state
```

### Backend Files

```
server/
├── src/
│   ├── routes/
│   │   ├── attendance.ts                       # Attendance routes
│   │   ├── leaves.ts                           # Leave routes
│   │   ├── holidays.ts                         # Holiday routes
│   │   └── employees.ts                        # Employee routes
│   │
│   ├── models/
│   │   ├── Attendance.ts                       # Attendance schema
│   │   ├── Leave.ts                            # Leave schema
│   │   ├── Holiday.ts                          # Holiday schema
│   │   └── Employee.ts                         # Employee schema
│   │
│   └── middleware/
│       └── validation.ts                       # Request validation
```

---

## API Services & Endpoints

### 1. Attendance Service

**File**: `src/services/attendanceService.ts`

#### Methods Added/Modified:

```typescript
// Get attendance records by date
getAttendanceByDate(date: string): Promise<AttendanceRecord[]>
// Endpoint: GET /api/attendance?startDate={date}&endDate={date}

// Get attendance by employee and date
getAttendanceByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceRecord[]>
// Endpoint: GET /api/attendance?employeeId={id}&startDate={date}&endDate={date}
```

#### Interface Additions:

```typescript
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status:
    | "Present"
    | "Absent"
    | "Late"
    | "Half Day"
    | "Leave"
    | "Holiday"
    | "Weekend";
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  notes?: string;
}
```

**Backend Route**: `server/src/routes/attendance.ts`

- GET `/api/attendance` - Returns attendance records with query filters

---

### 2. Leave Service

**File**: `src/services/leaveService.ts`

#### Methods Used:

```typescript
// Get all leaves
getAll(): Promise<LeaveRequest[]>
// Endpoint: GET /api/leaves

// Get leaves by user
getByUserId(userId: string): Promise<LeaveRequest[]>
// Endpoint: GET /api/leaves/user/{userId}
```

**Backend Route**: `server/src/routes/leaves.ts`

- GET `/api/leaves` - Returns all leaves with optional status filter
- GET `/api/leaves/user/:userId` - Returns leaves for specific user

---

### 3. Holiday Service

**File**: `src/services/holidayService.ts`

#### Methods Used:

```typescript
// Get holidays with filters
getHolidays(filters?: HolidayFilters): Promise<HolidaysResponse>
// Endpoint: GET /api/holidays?year={year}&status={status}
```

**Backend Route**: `server/src/routes/holidays.ts`

- GET `/api/holidays` - Returns holidays with pagination and filters

---

### 4. Employee Service

**File**: `src/services/employeeService.ts`

#### Methods Used:

```typescript
// Managed through employeeStore
// Uses existing employee management endpoints
```

---

## Frontend Components

### My Team Component

**Path**: `src/pages/employee/MyTeam.tsx`

#### State Management:

```typescript
// Local state
const [searchQuery, setSearchQuery] = useState("");
const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
const [holidays, setHolidays] = useState<Holiday[]>([]);
const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
const [lateEmployeesDrawerOpen, setLateEmployeesDrawerOpen] = useState(false);
const [currentMonth, setCurrentMonth] = useState(new Date());

// Zustand store
const user = useAuthStore((state) => state.user);
const employees = useEmployeeStore((state) => state.employees);
const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
```

#### Key Functions:

```typescript
// Get current date in YYYY-MM-DD format
const currentDate = useMemo(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
}, []);

// Determine badge color based on status
getStatusBadge(employeeId: string): string

// Determine status text based on attendance/leave/holiday
getStatusText(employeeId: string): string

// Calculate attendance statistics
attendanceStats: {
  total: number;
  onTime: number;
  late: number;
  lateEmployees: AttendanceRecord[];
  wfh: number;
  remote: number;
  off: number;
  notInYet: number;
}
```

#### Data Fetching:

```typescript
// Fetch attendance data for today
useEffect(() => {
  const fetchAttendanceData = async () => {
    const data = await attendanceService.getAttendanceByDate(currentDate);
    setAttendanceData(data);
  };
  fetchAttendanceData();
}, [currentDate]);

// Fetch holidays for current year
useEffect(() => {
  const fetchHolidays = async () => {
    const response = await getHolidays({ year: year as any });
    if (response.success && response.data) {
      setHolidays(response.data.holidays);
    }
  };
  fetchHolidays();
}, []);

// Fetch approved leaves
useEffect(() => {
  const fetchLeaves = async () => {
    const data = await leaveService.getAll();
    const approvedLeaves = data.filter((leave) => leave.status === "approved");
    setLeaves(approvedLeaves);
  };
  fetchLeaves();
}, []);
```

---

## Database Collections

### 1. Attendance Logs Collection

**Collection Name**: `attendancelogs` or `attendances`

**Schema**:

```javascript
{
  _id: ObjectId,
  employeeId: String,          // Employee ID
  date: String,                // Date in YYYY-MM-DD format
  status: String,              // 'Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Holiday', 'Weekend'
  checkIn: String,             // Check-in time (HH:mm format)
  checkOut: String,            // Check-out time (HH:mm format)
  workHours: Number,           // Total work hours
  notes: String,               // Additional notes
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `employeeId`
- `date`
- Compound: `{ employeeId: 1, date: 1 }`

---

### 2. Leaves Collection

**Collection Name**: `leaves`

**Schema**:

```javascript
{
  _id: ObjectId,
  employeeId: String,          // Employee ID
  employeeName: String,        // Employee name
  leaveType: String,           // 'Earned Leave', 'Sabbatical Leave', 'Comp Off', 'Paternity Leave', 'Maternity Leave', 'Sick Leave'
  startDate: Date,             // Leave start date
  endDate: Date,               // Leave end date
  days: Number,                // Number of days
  isHalfDay: Boolean,
  halfDayType: String,         // 'first_half', 'second_half', null
  reason: String,
  justification: String,
  status: String,              // 'pending', 'approved', 'rejected', 'cancelled'
  appliedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  rejectedBy: String,
  rejectionReason: String,
  cancelledOn: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `employeeId`
- `status`
- `startDate`
- `endDate`

---

### 3. Holidays Collection

**Collection Name**: `holidays`

**Schema**:

```javascript
{
  _id: ObjectId,
  name: String,                // Holiday name
  date: Date,                  // Holiday date
  countryId: ObjectId,         // Reference to Country
  regionId: ObjectId,          // Reference to Region
  clientId: ObjectId,          // Reference to Client
  departmentId: ObjectId,      // Reference to Department
  groupIds: [ObjectId],        // Array of HolidayGroup references
  typeId: ObjectId,            // Reference to HolidayType
  observanceTypeId: ObjectId,  // Reference to ObservanceType
  description: String,
  notes: String,
  imageUrl: String,
  status: String,              // 'DRAFT', 'PUBLISHED', 'ARCHIVED'
  isActive: Boolean,
  createdBy: ObjectId,
  approvedBy: ObjectId,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `date`
- `status`
- `isActive`

---

### 4. Employees Collection

**Collection Name**: `employees`

**Relevant Fields**:

```javascript
{
  _id: ObjectId,
  employeeId: String,          // Unique employee ID
  name: String,
  email: String,
  phone: String,
  designation: String,
  department: String,
  location: String,
  reportingManagerId: String,  // Manager's employeeId
  profilePhoto: String,
  status: String,              // Not currently used for attendance status
  joiningDate: Date,
  // ... other fields
}
```

---

## Frontend Components - Detailed Documentation

### 1. Employee Directory Component (`EmployeeDirectory.tsx`)

#### Component Overview

- **File Path**: `src/pages/employee/EmployeeDirectory.tsx`
- **Size**: 3,218 lines of code
- **Tabs**: 3 main views (Directory, Organization Tree, Organization Chart)
- **Filters**: 5 independent filter categories
- **View Modes**: 3 organizational views (Me, Department, Top)

This is a comprehensive multi-tab interface providing card-based directory, hierarchical tree view, and visual organizational chart.

#### Tab 1: Employee Directory (Card View)

**Grid Layout**: Responsive grid adapts from 1-5 columns based on screen size.

**Employee Cards Display**:

- Name with active/inactive status badge
- Designation
- Profile photo or color-coded initials avatar
- Email with icon
- Location with map pin
- Phone with phone icon
- Birthday formatted as "MMM DD"

**Interactive Features**:

- Click cards to navigate to employee profile
- Hover animations with scale effect
- Keyboard navigation support (Enter/Space)
- Focus-visible accessibility rings

**Search**: Real-time search across name, employeeId, email, and department (case-insensitive).

**Five Filter Categories** (all multi-select with checkbox interface):

1. **Business Unit** - Shows unique business units from active employees
2. **Department** - Auto-selects current user's department on mount
3. **Location** - Office locations filter
4. **Designation** - Job titles filter
5. **Total Experience** - Ranges: "0-2 years", "2-5 years", "5-10 years", "10+ years"
   - Calculates: `totalExperience = previousExperience + yearsSinceJoining`

**Filter Logic**: Applies AND logic between categories, OR logic within each category. All filtering is client-side.

**State Management**:

```typescript
const [searchQuery, setSearchQuery] = useState<string>("");
const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
  [],
);
const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
```

**API Calls**: Single call to `employeeService.getEmployees()` on mount. No additional calls for filtering.

#### Tab 2: Organization Tree

**Three View Modes**:

1. **Me View** (Default) - Shows user's position with reporting manager and direct reports
2. **Department View** - Department hierarchy from department head
3. **Top View** - Full organization from top-level employees

**Features**:

- Expandable/collapsible employee nodes
- Direct reports count badges
- Reporting manager section with toggle to view full team
- Hierarchical indentation with connecting lines
- Compact employee cards (photo/avatar, name, designation, ID)

**Zoom Controls**:

- Zoom In/Out buttons (10% increments, 10%-200% range)
- Reset to default (50%)
- Mouse wheel zoom (Ctrl/Cmd + scroll)

**Data Structure**:

```typescript
interface OrganizationTree {
  employee: Employee;
  reportingManager: Employee | null;
  dottedLineManager: Employee | null;
  directReports: DirectReport[];
}
```

**Tree Building**: Recursive algorithm builds trees from root employee based on reportingManagerId relationships. Caches all subtrees in Map for efficient rendering.

**State Management**:

```typescript
const [orgTree, setOrgTree] = useState<OrganizationTree | null>(null);
const [orgChartView, setOrgChartView] = useState<"me" | "department" | "top">(
  "me",
);
const [expandedDirectReports, setExpandedDirectReports] = useState<Set<string>>(
  new Set(),
);
const [directReportTrees, setDirectReportTrees] = useState<
  Map<string, OrganizationTree>
>(new Map());
const [zoomLevel, setZoomLevel] = useState(0.5);
```

**API Calls**: Uses same employee data from initial `employeeService.getEmployees()` call. Tree built client-side.

#### Tab 3: Organization Chart

**View Modes**: Same three modes as Organization Tree (Me, Department, Top)

**Chart Features**:

- Visual tree layout with connecting lines
- Same zoom controls as Organization Tree
- **Group by Department** toggle - groups employees by department with headers
- Interactive nodes (click to view profile, hover effects)
- Drag to pan when zoomed
- Consistent hash-based color coding per employee

**Color Algorithm**: 12 predefined colors, hash employee ID to generate consistent color index.

**Mouse Wheel Zoom**: Implemented with both React synthetic events and native event listeners for cross-browser compatibility.

**Rendering**: Scales entire chart container with CSS transform. Recursively renders employee cards with connecting lines.

**State**: Shares same state as Organization Tree (orgTree, zoomLevel, orgChartView, expansion states).

**API Calls**: No additional calls beyond initial employee fetch.

---

### 2. My Team Component (`MyTeam.tsx`)

#### Component Overview

Displays team dashboard with real-time attendance tracking, leave calendar, and late arrivals monitoring.

---

## Changes Summary

### My Team Page (`src/pages/employee/MyTeam.tsx`)

#### 1. Imports Added:

```typescript
import { Clock, X } from "lucide-react";
import {
  attendanceService,
  type AttendanceRecord,
} from "@/services/attendanceService";
import { leaveService } from "@/services/leaveService";
import { getHolidays } from "@/services/holidayService";
import type { LeaveRequest } from "@/types/leave";
import type { Holiday } from "@/types/holiday";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
```

#### 2. Status Logic Changes:

**Before**: Used static `employee.status` field

```typescript
// Old logic
const actualStatus = status || "active";
return actualStatus.toLowerCase() === "active" ? "ON DUTY" : "NOT IN YET";
```

**After**: Dynamic status based on attendance logs, holidays, and leaves

```typescript
// New logic - Priority order:
1. Check holidays collection → "Holiday"
2. Check leaves collection (status='approved') → "Leave"
3. Check attendancelogs (status='Present') → "IN"
4. Default → "NOT IN YET"
```

#### 3. Attendance Statistics:

**Before**: Placeholder values

```typescript
{
  total: activeEmployees.length,
  onTime: activeEmployees.length, // Placeholder
  late: 0, // Placeholder
  // ...
}
```

**After**: Real calculations

```typescript
{
  total: totalEmployees,
  onTime: calculatedFromCheckInTime,  // Before or at 10:00 AM
  late: lateArrivals.length,          // After 10:00 AM
  lateEmployees: lateArrivals,        // Full records for drawer
  off: employeesOnLeave.length,
  notInYet: calculatedNotInYet
}
```

#### 4. Team Calendar:

**Before**: Simple grid with small dots

```typescript
// 7-column traditional calendar grid
// Small colored dots for leaves
```

**After**: Timeline view matching screenshot

```typescript
// Horizontal timeline with:
// - Employee names and photos in left column
// - Days of month as columns
// - Larger colored circles (24px) for leave days
// - Only shows employees with leaves
// - Horizontal scroll for long months
```

#### 5. Late Arrivals Card:

**Before**: Simple count display

```typescript
<p className="text-2xl font-bold">{attendanceStats.late}</p>
```

**After**: Count + "View Employees" button + Drawer

```typescript
<p className="text-2xl font-bold">{attendanceStats.late}</p>
{attendanceStats.late > 0 && (
  <button onClick={() => setLateEmployeesDrawerOpen(true)}>
    View Employees
  </button>
)}
```

#### 6. Late Employees Drawer Added:

New component showing:

- Search functionality
- Employee details (name, department, location, job title)
- Clock-in time
- Delay calculation (hours/minutes late)
- Assigned shift

---

## Migration Steps

### Step 1: Backend Setup

1. **Verify Database Collections**:

   ```bash
   # Check if collections exist in MongoDB
   use your_database_name
   db.getCollectionNames()
   # Should include: attendancelogs, leaves, holidays, employees
   ```

2. **Verify Backend Routes**:
   - Ensure routes exist: `server/src/routes/attendance.ts`
   - Ensure routes exist: `server/src/routes/leaves.ts`
   - Ensure routes exist: `server/src/routes/holidays.ts`

3. **Test API Endpoints**:

   ```bash
   # Test attendance endpoint
   curl http://localhost:5000/api/attendance?startDate=2026-03-04&endDate=2026-03-04

   # Test leaves endpoint
   curl http://localhost:5000/api/leaves

   # Test holidays endpoint
   curl http://localhost:5000/api/holidays?year=2026
   ```

### Step 2: Frontend Services Update

1. **Update Attendance Service** (`src/services/attendanceService.ts`):
   - Add `AttendanceRecord` interface
   - Add `getAttendanceByDate()` method
   - Add `getAttendanceByEmployeeAndDate()` method

2. **Verify Leave Service** (`src/services/leaveService.ts`):
   - Ensure `getAll()` method exists
   - Ensure `getByUserId()` method exists

3. **Verify Holiday Service** (`src/services/holidayService.ts`):
   - Ensure `getHolidays()` method exists with filters support

### Step 3: Install Dependencies

```bash
# If not already installed
npm install lucide-react
npm install @radix-ui/react-dialog  # For Sheet component
npm install zustand                  # For state management
```

### Step 4: Update My Team Component

1. **Replace** `src/pages/employee/MyTeam.tsx` with the updated version

2. **Key sections to verify**:
   - Import statements
   - State initialization
   - useEffect hooks for data fetching
   - getStatusBadge and getStatusText functions
   - attendanceStats calculation
   - Team Calendar rendering
   - Late Employees Drawer

### Step 5: Verify UI Components

Ensure these components exist in `src/components/ui/`:

- `sheet.tsx` (Drawer component)
- `card.tsx`
- `badge.tsx`
- `input.tsx`

### Step 6: Test the Implementation

1. **Test Attendance Status**:
   - Add attendance record with status='Present' → Should show "IN"
   - No attendance record → Should show "NOT IN YET"

2. **Test Holiday Detection**:
   - Add holiday record for today → Should show "Holiday"

3. **Test Leave Detection**:
   - Add approved leave for today → Should show "Leave"

4. **Test Late Arrivals**:
   - Add attendance with checkIn after 10:00 AM
   - Verify count updates
   - Click "View Employees" → Drawer should open
   - Verify delay calculation

5. **Test Team Calendar**:
   - Add approved leaves for team members
   - Navigate months using arrows
   - Verify colored circles appear on leave days
   - Verify correct colors by leave type

### Step 7: Data Migration (If Needed)

If migrating from another system:

1. **Export Data**:

   ```javascript
   // Export attendance logs
   mongoexport --db=source_db --collection=attendancelogs --out=attendancelogs.json

   // Export leaves
   mongoexport --db=source_db --collection=leaves --out=leaves.json

   // Export holidays
   mongoexport --db=source_db --collection=holidays --out=holidays.json
   ```

2. **Import Data**:

   ```javascript
   // Import to new system
   mongoimport --db=target_db --collection=attendancelogs --file=attendancelogs.json
   mongoimport --db=target_db --collection=leaves --file=leaves.json
   mongoimport --db=target_db --collection=holidays --file=holidays.json
   ```

3. **Verify Field Mappings**:
   - Ensure date formats match (YYYY-MM-DD for dates)
   - Ensure employeeId references are correct
   - Ensure status values match enum values

---

## Dependencies

### Frontend Dependencies:

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.x",
    "@radix-ui/react-dialog": "^1.x",
    "zustand": "^4.x",
    "axios": "^1.x"
  }
}
```

### Backend Dependencies:

```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "cors": "^2.x"
  }
}
```

---

## API Call Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   My Team Page                       │
│                    (MyTeam.tsx)                      │
└────────────────┬────────────────────────────────────┘
                 │
                 │ On Component Mount
                 │
        ┌────────┼────────┬──────────────┐
        │        │        │              │
        ▼        ▼        ▼              ▼
   ┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
   │Attendance│ │Leaves│ │ Holidays │ │Employees │
   │ Service  │ │Service│ │ Service  │ │  Store   │
   └────┬─────┘ └───┬──┘ └────┬─────┘ └────┬─────┘
        │           │         │             │
        │           │         │             │
        ▼           ▼         ▼             ▼
   ┌────────────────────────────────────────────┐
   │         Backend API (Express)              │
   │  /api/attendance  /api/leaves  /api/holidays
   └────────────────┬───────────────────────────┘
                    │
                    ▼
            ┌──────────────┐
            │   MongoDB    │
            │  Collections │
            └──────────────┘
```

---

## Status Priority Logic

```
Check Status in Order:

1. Is Today a Holiday?
   YES → Show "Holiday" (Purple Badge)
   NO → Continue

2. Is Employee on Approved Leave?
   YES → Show "Leave" (Blue Badge)
   NO → Continue

3. Does Employee Have Attendance Record with status='Present'?
   YES → Show "IN" (Green Badge)
   NO → Continue

4. DEFAULT
   → Show "NOT IN YET" (Orange Badge)
```

---

## Late Arrival Calculation

```typescript
// Employee is considered late if check-in time > 10:00 AM

const [hours, minutes] = checkIn.split(":").map(Number);
const checkInMinutes = hours * 60 + minutes;
const standardTime = 10 * 60; // 10:00 AM = 600 minutes

if (checkInMinutes > standardTime) {
  // Calculate delay
  const delayMinutes = checkInMinutes - standardTime;
  const delayHours = Math.floor(delayMinutes / 60);
  const delayMins = delayMinutes % 60;

  // Display: "1h 30m" or "45m"
}
```

---

## Troubleshooting

### Issue 1: Status shows "NOT IN YET" even when employee is present

**Solution**: Check attendance log for today:

- Verify `status` field is exactly `'Present'` (case-sensitive)
- Verify `date` field matches current date in YYYY-MM-DD format
- Verify `employeeId` matches employee record

### Issue 2: Late arrivals count is 0 but employees are late

**Solution**: Check attendance logs:

- Verify `checkIn` field exists and is in HH:mm format
- Verify time parsing logic (should compare against 10:00 AM)

### Issue 3: Team calendar shows "Nobody is on leave"

**Solution**: Check leaves collection:

- Verify leave records exist for the selected month
- Verify `status` field is `'approved'`
- Verify `startDate` and `endDate` overlap with selected month
- Verify `employeeId` matches team member records

### Issue 4: Holiday status not showing

**Solution**: Check holidays collection:

- Verify holiday record exists for current date
- Verify `date` field format
- Verify `status` is `'PUBLISHED'` (if using status filter)
- Verify `isActive` is `true`

---

## Additional Notes

### Performance Considerations:

1. **Attendance Data**: Fetched only for current date to minimize payload
2. **Leaves Data**: Filters for approved leaves only
3. **Team Calendar**: Lazy renders only employees with leaves
4. **Memoization**: Uses `useMemo` for expensive calculations

### Security Considerations:

1. All API calls require authentication token
2. Users can only see their teammates (same reporting manager)
3. Sensitive employee data is not exposed in attendance logs

### Future Enhancements:

1. Real-time updates using WebSocket
2. Filters for team calendar (by leave type, employee)
3. Export functionality for attendance reports
4. Mobile responsive improvements for calendar
5. Notification for late arrivals

---

## Support & Contact

For issues during migration:

1. Verify all API endpoints are working using the test commands
2. Check browser console for error messages
3. Verify database collections have proper indexes
4. Ensure employee relationships (reportingManagerId) are set correctly

---

## Version History

| Version | Date          | Changes                                                                |
| ------- | ------------- | ---------------------------------------------------------------------- |
| 1.0     | March 4, 2026 | Initial implementation with real-time attendance, leaves, and holidays |

---

**End of Migration Guide**
