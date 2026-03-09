# Holiday Calendar Assignment — Implementation Plan

## Current Status

### What EXISTS

| Area | File | Status |
|---|---|---|
| Individual Holiday CRUD | `src/pages/superadmin/HolidayManagement.tsx` | ✅ Done |
| Holiday Types & Groups config | `src/pages/superadmin/HolidayConfiguration.tsx` | ✅ Done |
| `HolidayCalendar` Mongoose model | `server/src/models/HolidayCalendar.ts` | ✅ Done |
| `holidayCalendarId` field on Employee | `server/src/models/Employee.ts` | ✅ Done |
| Timesheet holiday restriction (frontend) | `src/pages/rmg/uda-configuration/WeeklyTimesheet.tsx` | ✅ Done |
| Timesheet holiday endpoint (fallback) | `server/src/routes/timesheets.ts` — `GET /api/timesheets/holidays/:employeeId` | ✅ Done |

### What is MISSING (full implementation gap)

| # | Area | Status |
|---|---|---|
| 1 | Backend CRUD routes for `HolidayCalendar` | ❌ Not implemented |
| 2 | Super Admin UI — Holiday Calendars list/create/edit | ❌ Not implemented |
| 3 | Super Admin UI — Assign calendar to individual employee | ❌ Not implemented |
| 4 | Super Admin UI — Bulk-assign by location / department | ❌ Not implemented |
| 5 | Frontend service functions for `HolidayCalendar` API | ❌ Not implemented |
| 6 | Auto-reassign calendar on employee transfer | ❌ Not implemented |

---

## Implementation Tasks

### Task 1 — Backend: `HolidayCalendar` CRUD Routes

**File:** `server/src/routes/holidayCalendars.ts` *(new file)*

Endpoints to implement:

```
GET    /api/holiday-calendars              — list all calendars (with pagination/filter by year/country)
POST   /api/holiday-calendars              — create a new calendar
GET    /api/holiday-calendars/:id          — get single calendar with holidays[]
PUT    /api/holiday-calendars/:id          — update calendar metadata
DELETE /api/holiday-calendars/:id          — delete calendar (only if no employees assigned)
PATCH  /api/holiday-calendars/:id/holidays — replace/add holidays array
```

Employee assignment endpoints:

```
GET    /api/holiday-calendars/:id/employees           — list employees assigned to this calendar
POST   /api/holiday-calendars/:id/assign              — assign calendar to one or more employees
POST   /api/holiday-calendars/:id/assign-by-location  — bulk-assign to all employees matching location
POST   /api/holiday-calendars/:id/assign-by-dept      — bulk-assign to all employees matching department
DELETE /api/holiday-calendars/:id/unassign/:empId     — unassign calendar from single employee
```

**Register in `server/src/server.ts`:**
```ts
import holidayCalendarRoutes from './routes/holidayCalendars';
app.use('/api/holiday-calendars', holidayCalendarRoutes);
```

---

### Task 2 — Frontend: Service Layer

**File:** `src/services/holidayCalendarService.ts` *(new file)*

Functions needed:
- `getHolidayCalendars(filters?)` — list all
- `createHolidayCalendar(data)` — create
- `updateHolidayCalendar(id, data)` — update
- `deleteHolidayCalendar(id)` — delete
- `getHolidayCalendarById(id)` — single
- `assignCalendarToEmployees(id, employeeIds[])` — assign to specific employees
- `bulkAssignByLocation(id, location)` — bulk by location
- `bulkAssignByDepartment(id, department)` — bulk by department
- `getAssignedEmployees(calendarId)` — get employees assigned to a calendar

---

### Task 3 — Super Admin UI: Holiday Calendars Page

**File:** `src/pages/superadmin/HolidayCalendars.tsx` *(new file)*

**Layout — two panels:**

#### Left / List Panel
- Table with columns: Title, Year, Country, State/Client, No. of Holidays, No. of Employees Assigned, Actions
- "New Calendar" button → opens create drawer
- Filter by year, country

#### Right / Detail Drawer (Sheet)
When a calendar is selected / "New Calendar" clicked:

**Tab 1 — Calendar Details**
- Fields: Title, Year, Country, State (optional), Client (optional), Banner Image (optional)
- Holidays sub-table: Name, Date, Type (PUBLIC/OPTIONAL/REGIONAL), Description — add/edit/delete rows
- Import holidays from CSV/Excel button

**Tab 2 — Employee Assignment**
- Three assignment modes (radio/segment):
  1. **Manual** — multi-select employee picker (search by name/ID/department)
  2. **By Location** — location dropdown → "Assign All" button
  3. **By Department** — department dropdown → "Assign All" button
- Currently assigned employees list (with remove button per row)
- Badge showing total count

---

### Task 4 — Super Admin UI: Register New Page

**File:** `src/pages/superadmin/index.ts`

Add export:
```ts
export { HolidayCalendars } from './HolidayCalendars';
```

**File:** `src/router/AppRouter.tsx`

Add route under Super Admin section:
```tsx
<ProtectedRoute requiredPath="/superadmin/holiday-calendars">
  <HolidayCalendars />
</ProtectedRoute>
```

**File:** Sidebar / navigation config — add "Holiday Calendars" nav item under the Super Admin section, next to existing "Holiday Management" and "Holiday Configuration" entries.

---

### Task 5 — Super Admin UI: UserManagement Integration (optional)

In `src/pages/superadmin/UserManagement.tsx`, inside the employee detail/edit drawer, add a **"Holiday Calendar"** field:
- Dropdown of available `HolidayCalendar` records
- Shows the currently assigned calendar name (or "None")
- On change → calls `assignCalendarToEmployees(calendarId, [employeeId])`

---

### Task 6 — Auto-Reassign on Employee Transfer

**Backend** — in the employee transfer / location-change API handler (`PUT /api/employees/:id`):

```ts
// If location or department changed, find a matching calendar and auto-assign
if (updatedEmployee.location !== previousLocation || updatedEmployee.department !== previousDepartment) {
  const matchingCalendar = await HolidayCalendar.findOne({
    country: mapLocationToCountry(updatedEmployee.location),
    state: updatedEmployee.location,
    isActive: true
  }).sort({ year: -1 });

  if (matchingCalendar) {
    updatedEmployee.holidayCalendarId = matchingCalendar._id;
  }
}
```

---

## Data Model Reference

### `HolidayCalendar` (existing — `server/src/models/HolidayCalendar.ts`)

```ts
{
  title: string;
  year: number;
  country: string;
  state?: string;
  client?: string;
  bannerImage?: string;
  holidays: Array<{
    name: string;
    date: Date;
    type?: 'PUBLIC' | 'OPTIONAL' | 'REGIONAL';
    description?: string;
  }>;
  isActive: boolean;
}
```

### `Employee.holidayCalendarId` (existing — added to `server/src/models/Employee.ts`)

```ts
holidayCalendarId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'HolidayCalendar',
  default: null
}
```

---

## Implementation Order (Recommended)

1. **Task 1** — Backend routes (`holidayCalendars.ts` + register in `server.ts`)
2. **Task 2** — Frontend service (`holidayCalendarService.ts`)
3. **Task 3** — Super Admin page (`HolidayCalendars.tsx`)
4. **Task 4** — Register route and nav link
5. **Task 5** — UserManagement integration (quick win)
6. **Task 6** — Auto-reassign on transfer (backend only)
