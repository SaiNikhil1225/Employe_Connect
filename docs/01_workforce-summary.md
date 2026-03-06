# Module 01 — Workforce Summary

**File**: `src/pages/hr/WorkforceSummary.tsx`  
**Route**: `/hr/workforce-summary`  
**Access**: HR, SUPER_ADMIN roles  
**Lines**: ~2,966

---

## 1. Page Overview

The Workforce Summary page is the primary HR analytics and employee management hub. It combines:
- Real-time employee KPI cards (headcount, attrition, demographics, age, tenure)
- Interactive filter panel (date range, department, location, employment type, experience, salary)
- Full employee DataTable with sort, search, column visibility, and bulk export
- Recharts-based analytics visualisations (demographics donut, age/tenure bars, department horizontal bar)
- Quick access to holiday management, new joiner onboarding, and bulk employee upload

---

## 2. Features

| Feature | Description |
|---------|-------------|
| KPI Cards | Total Employees, Attrition Rate, Demographics (M/F), Avg Age, Avg Tenure |
| Date range filter | From/To date picker popover to filter all analytics |
| Multi-select filters | Department, Location, Employment Type, Experience range, Salary range |
| `hasAnyFilters` guard | Department Count card hidden when any filter is active |
| Employee DataTable | 15 rows/page, sort by any column, global search, column visibility toggle |
| Bulk export | Excel / CSV / PDF of filtered employee list |
| Sticky columns | Employee ID + Name columns always visible |
| Demographics chart | Recharts `PieChart` (donut) — Male / Female breakdown |
| Age distribution | Recharts `BarChart` — age group buckets |
| Tenure distribution | Recharts `BarChart` — years of service buckets |
| Department count | Recharts horizontal `BarChart` (hidden when filters active) |
| Holiday management | Add/Edit/Delete holidays via `AddHolidayModal`, `EditHolidayModal`, `HolidaysDialog` |
| Employee CRUD | Add/Edit employee via `AddEditEmployeeModal` |
| Bulk upload | Excel template upload via `BulkUploadModal` |
| PIP count badge | Active PIP employees count on KPI card |
| Profile navigation | Click employee row → `sessionStorage.setItem('profileReferrer', '/hr/workforce')` → navigate to `/employee/:id` |

---

## 3. Frontend Dependencies

### Zustand Stores

| Store | Actions Used | Data Used |
|-------|-------------|-----------|
| `useAuthStore` | — | `user` (current user object) |
| `useEmployeeStore` | `fetchEmployees`, `getBirthdays`, `getAnniversaries`, `getNewJoiners` | `employees[]` |
| `useAttendanceStore` | `checkIn`, `checkOut`, `getTodayRecord` | `todayRecord` |
| `useAnnouncementStore` | `fetchAnnouncements`, `toggleLike`, `addComment`, `addReaction`, `deleteAnnouncement` | `announcements[]` |
| `useHolidayStore` | `fetchHolidays` | `holidays[]` |
| `useLeaveStore` | `fetchLeaveBalance` | `leaveBalance`, `leaves[]` |

### Component Dependencies

```
src/
├── components/
│   ├── DataTable/          ← Employee table (reusable)
│   ├── modals/
│   │   ├── AddHolidayModal.tsx
│   │   ├── EditHolidayModal.tsx
│   │   ├── HolidaysDialog.tsx
│   │   ├── AddEditEmployeeModal.tsx
│   │   └── BulkUploadModal.tsx
│   └── ui/                 ← Full Shadcn/ui component set
├── services/
│   └── api.ts              ← apiClient (Axios instance)
└── store/
    ├── authStore.ts
    ├── employeeStore.ts
    ├── attendanceStore.ts
    ├── announcementStore.ts
    ├── holidayStore.ts
    └── leaveStore.ts
```

### NPM Packages Required

```json
{
  "recharts": "^2.x",
  "date-fns": "^3.x",
  "lucide-react": "^0.4xx",
  "sonner": "^1.x",
  "xlsx": "^0.18.x",
  "jspdf": "^2.x",
  "jspdf-autotable": "^3.x"
}
```

---

## 4. API Endpoints

### 4.1 Workforce Stats
```
GET /api/employees/stats/workforce
```
**Response shape**:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 120,
    "maleCount": 70,
    "femaleCount": 50,
    "attritionRate": 8.5,
    "avgAge": 32,
    "avgTenure": 3.2,
    "newJoinersThisMonth": 5,
    "departmentBreakdown": [
      { "department": "Engineering", "count": 45 }
    ],
    "locationBreakdown": [
      { "location": "Hyderabad", "count": 80 }
    ],
    "ageDistribution": [
      { "range": "20-25", "count": 15 }
    ],
    "tenureDistribution": [
      { "range": "0-1 yr", "count": 20 }
    ]
  }
}
```

### 4.2 PIP Active Count
```
GET /api/pip/active-count
```
**Response shape**:
```json
{ "success": true, "count": 3 }
```

### 4.3 Employee List (via employeeStore)
```
GET /api/employees
GET /api/employees/:employeeId
POST /api/employees
PUT /api/employees/:employeeId
DELETE /api/employees/:employeeId
POST /api/employees/bulk-upload       ← Excel file upload
```

### 4.4 Holiday Routes (via holidayStore)
```
GET    /api/holidays
POST   /api/holidays
PUT    /api/holidays/:id
DELETE /api/holidays/:id
```

### 4.5 Leave Balance (via leaveStore)
```
GET /api/leaves/balance/:employeeId
GET /api/leaves?employeeId=:id
```

---

## 5. Database Collections & Schemas

### 5.1 `employees` (Model: `server/src/models/Employee.ts`)

Key fields relevant to Workforce Summary:

| Field | Type | Notes |
|-------|------|-------|
| `employeeId` | String (unique) | Primary key used across all modules |
| `name` | String | Display name |
| `email` | String (unique) | Login email |
| `role` | String (enum) | EMPLOYEE, MANAGER, HR, SUPER_ADMIN, etc. |
| `department` | String | Used for grouping/filtering |
| `designation` | String | Job title |
| `location` | String | Office location |
| `dateOfJoining` | String | ISO date — used for tenure calculation |
| `dateOfBirth` | String | ISO date — used for age calculation & birthday events |
| `gender` | String | Used for demographics chart |
| `status` | String: `active`\|`inactive`\|`on-leave` | Filters active headcount |
| `experience` | Number | Years of experience |
| `reportingManager` | Mixed | Manager reference |
| `profilePhoto` / `avatar` | String | URL to photo |
| `skills` | String[] | Skills list |
| `salary` | Object | `{ basic, hra, allowances, gross }` |
| `isActive` | Boolean | Used to exclude terminated employees |

### 5.2 `pips` (Model: `server/src/models/PIP.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `employeeId` | String | Reference to employee |
| `status` | String | `active` | `completed` | `cancelled` |
| `startDate` | Date | PIP start |
| `endDate` | Date | PIP end |
| `reason` | String | Performance issue description |

### 5.3 `holidays` (Model: `server/src/models/Holiday.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Holiday name |
| `date` | Date | Holiday date |
| `type` | String | `national` \| `regional` \| `optional` |
| `description` | String | Details |
| `isActive` | Boolean | — |

---

## 6. Filter State Interface

```typescript
interface WorkforceFilters {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  selectedDepartments: string[];
  selectedLocations: string[];
  selectedEmploymentTypes: string[];
  selectedExperienceRange: [number, number] | null;
  salaryMin: number | undefined;
  salaryMax: number | undefined;
}
```
`hasAnyFilters = fromDate || toDate || selectedDepartments.length > 0 || selectedLocations.length > 0 || ...`

---

## 7. WorkforceStats Interface

```typescript
interface WorkforceStats {
  totalEmployees: number;
  maleCount: number;
  femaleCount: number;
  attritionRate: number;
  avgAge: number;
  avgTenure: number;
  newJoinersThisMonth: number;
  departmentBreakdown: { department: string; count: number }[];
  locationBreakdown: { location: string; count: number }[];
  ageDistribution: { range: string; count: number }[];
  tenureDistribution: { range: string; count: number }[];
}
```

---

## 8. Integration Points / Data Dependencies

| Dependency | Source module | Data needed |
|-----------|--------------|-------------|
| Employee profiles | Employee module | Full `employees[]` array |
| Attendance today | Attendance module | `checkIn`, `checkOut`, `todayRecord` |
| Leave balances | Leave module | `leaveBalance` per employee |
| Holiday list | Holiday module | `holidays[]` for calendar sidebar |
| Announcements | Admin Announcements module | `announcements[]` for sidebar widget |
| PIP count | Performance module | `GET /api/pip/active-count` |
| Workforce stats | Computed by backend | `GET /api/employees/stats/workforce` |

---

## 9. Side Effects / Events

- Clicking employee row sets `sessionStorage.profileReferrer = '/hr/workforce'` before navigating to `/employee/:employeeId`
- Employee add/edit triggers `fetchEmployees()` refetch
- Bulk upload triggers `fetchEmployees()` refetch
- Attendance check-in/out updates `todayRecord` in `attendanceStore`

---

## 10. Export Features

The DataTable supports three export formats via toolbar buttons:
- **Excel** — using `xlsx` package
- **CSV** — native download
- **PDF** — using `jspdf` + `jspdf-autotable`

All exports respect the currently active filters and column visibility settings.
