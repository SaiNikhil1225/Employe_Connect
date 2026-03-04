# Application Audit Report

**Date:** March 3, 2026
**Scope:** HR Admin, RMG Admin, Super Admin, IT Admin, Employee modules

---

## P0 — BUGS (Visible errors / broken functionality)

- [x] **1. Sidebar icons render as fallback dots**
  - `CheckSquare`, `BarChart`, `Building2`, `Settings2` referenced in `roleConfig.ts` but missing from Sidebar `iconMap`
  - Files: `src/layouts/Sidebar.tsx` (iconMap ~L56-93), `src/router/roleConfig.ts`
  - **FIXED:** Added all 5 missing icons to imports and iconMap

- [x] **2. Finance/Facilities ticket sender hardcoded as `'itadmin'`**
  - Messages from Finance/Facilities admins are incorrectly sent as "itadmin"
  - Files: `src/pages/financeadmin/FinanceTicketManagement.tsx` L153, `src/pages/facilitiesadmin/FacilitiesTicketManagement.tsx` L153
  - **FIXED:** Changed to `'financeadmin'` and `'facilitiesadmin'` respectively

- [x] **3. Stray escaped quote in MyAttendance className**
  - `className="text-lg font-semibold text-foreground\">` — broken CSS class
  - File: `src/pages/employee/MyAttendance.tsx` L750-751
  - **FIXED:** Removed stray `\"` from both classNames

- [x] **4. setState called in render body (EmployeeDashboard)**
  - `setCurrentHolidayIndex` and `setSubmittedPolls` called outside `useEffect` — can cause infinite re-renders
  - File: `src/pages/employee/EmployeeDashboard.tsx` L191-194, L210-213
  - **FIXED:** Wrapped both in `useEffect` hooks with proper dependency arrays

- [x] **5. Quick Action paths are wrong (EmployeeDashboard)**
  - MANAGER: `/approvals`, `/employees`, `/reports` — none exist
  - IT_ADMIN: `/helpdesk/queue`, `/it-admin/users`, `/it-admin/settings` — none exist
  - File: `src/pages/employee/EmployeeDashboard.tsx` L434-444
  - **FIXED:** MANAGER → `/manager/leave-approvals`, `/my-team`, `/employee/my-attendance`; IT_ADMIN → `/itadmin/tickets`, `/itadmin/dashboard`, `/employee/my-attendance`

- [x] **6. FINANCE_ADMIN / FACILITIES_ADMIN dashboard renders blank**
  - Not handled in `dashboardContent()` switch — falls through to default (nothing)
  - File: `src/pages/Dashboard.tsx` L24-41
  - **FIXED:** Added FINANCE_ADMIN → FinanceAdminDashboard, FACILITIES_ADMIN → FacilitiesAdminDashboard to both `getEffectiveRole()` and `dashboardContent()`. Default now renders EmployeeDashboard instead of null.

- [x] **7. Division by zero in Leave stats**
  - `paternityLeave.total` can be 0, producing NaN in progress bar
  - File: `src/pages/employee/Leave.tsx` L1015
  - **FIXED:** Added `total > 0` guard before division in both Progress value and percentage text

---

## P1 — ROUTING & PERMISSION MISMATCHES

- [ ] **8. Orphaned HR permissions (routes removed but permissions remain)**
  - `/hr/diversity-inclusion`, `/hr/training`, `/hr/teams` still in `rolePermissions.HR`
  - File: `src/router/roleConfig.ts` L144-148
  - **FIXED:** Removed `/hr/diversity-inclusion`, `/hr/training`, `/hr/teams` from HR rolePermissions

- [x] **9. Orphaned permissions with no route in AppRouter**
  - `/attendance` (EMPLOYEE, MANAGER, SUPER_ADMIN)
  - `/attendance-management` (SUPER_ADMIN, HR)
  - `/superadmin/configuration` (SUPER_ADMIN)
  - `/financeadmin/analytics` (FINANCE_ADMIN)
  - `/facilitiesadmin/analytics` (FACILITIES_ADMIN)
  - File: `src/router/roleConfig.ts`
  - **FIXED:** Removed all orphaned paths. Replaced `/attendance` with `/employee/my-attendance` for IT_EMPLOYEE and SUPER_ADMIN (who lacked it).

- [x] **10. Nav items with no route (clicking leads to 403)**
  - `financeadmin/analytics` and `facilitiesadmin/analytics` appear in sidebar nav but have no `<Route>`
  - Files: `src/router/roleConfig.ts` (navigationConfig), `src/router/AppRouter.tsx`
  - **FIXED:** Removed both analytics nav entries from navigationConfig

- [x] **11. Routes with no permission (unreachable)**
  - `/leave-management` and `/recruitment` have routes but no role has these paths in `rolePermissions`
  - File: `src/router/AppRouter.tsx`
  - **FIXED:** Removed both routes and their imports (LeaveManagement, Recruitment)

- [x] **12. `/rmg/financial-lines` missing from nav**
  - Route and permission exist but no `navigationConfig` entry — unreachable from sidebar
  - File: `src/router/roleConfig.ts`
  - **FIXED:** Added nav entry with label "Financial Lines", icon "DollarSign", roles ['RMG']

- [x] **13. `/superadmin/users` not in nav**
  - Route exists but no sidebar entry
  - File: `src/router/roleConfig.ts`
  - **FIXED:** Added nav entry with label "User Management", icon "Users", roles ['SUPER_ADMIN']

- [x] **14. CustomerPOListPage completely unrouted**
  - Full page exists with no route, permission, or nav entry
  - File: `src/pages/rmg/customer-pos/CustomerPOListPage.tsx`
  - **FIXED:** Added route `/rmg/customer-pos` in AppRouter, permission in RMG & SUPER_ADMIN rolePermissions, nav entry with label "Customer POs" for RMG

---

## P1 — HARDCODED URLs (will break in production)

- [x] **15. 48+ instances of `http://localhost:5000` across codebase**
  - HR module (~31): TeamsMembers, TrainingDashboard, RecognitionCelebrations, AddTrainingForm, DiversityInclusion, AdminAnnouncements, WorkforceSummary
  - Super Admin (~17): PermissionsMatrix, HelpdeskConfig, RegionRegexConfig, LeavePolicyConfig
  - Employee (4): EnhancedMyProfile
  - Components: PIPTable, AddToPIPDrawer, InitiateExitDrawer, AddEditEmployeeModal, AnnouncementAnalyticsDialog
  - Services: holidayService, analyticsService, rmgAnalyticsService
  - RMG: WeeklyTimesheet
  - **FIXED:** All 69 hardcoded URLs replaced with `${API_URL}/...` using `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'` at module scope. Standardized env var name to `VITE_API_URL` across all files.

---

## P2 — UI CONSISTENCY ISSUES

### Page Layout (3 conflicting patterns)

- [x] **16. Non-standard page layouts**
  - **Standard** (`page-container` + `page-header` + `page-title`): Utilization, CustomerList, ProjectList, MyTeam, Helpdesk, ManagerDashboard, ManagerLeaveApprovals, FinanceAdminDashboard, FacilitiesAdminDashboard
  - **`space-y-6` with custom header**: WorkforceSummary, AttendanceOverview, RecognitionCelebrations, all Super Admin pages, RMGDashboard, EmployeeDashboard
  - **`container mx-auto py-6` with box header**: FinancialLineListPage, CustomerPOListPage, ProjectDetailPage, Leave.tsx
  - **FIXED:** Standardized 8 files (WorkforceSummary, AttendanceOverview, RecognitionCelebrations, SuperAdminDashboard, PermissionsMatrix, LeavePolicyConfig, HelpdeskConfig, RegionRegexConfig) to use `page-container`, `page-header`, `page-title`, `page-description` CSS classes. RMG decorated-header pages kept as intentional variant.

### Avatar Pattern (3 conflicting patterns)

- [x] **17. Mixed avatar implementations**
  - **Standard** (`getAvatarGradient` + `getInitials` from design-system): Topbar, MyTeam, WorkforceSummary, EmployeeDashboard
  - **Old** (`getAvatarColor` from `@/lib/avatarUtils`): ManagerLeaveApprovals L12/L563, PIPTable L22
  - **Inline** (`bg-primary/10` or Avatar with no gradient): Utilization, ResourcePool, UserManagement, ApproverOverview, ITAdminDashboard
  - **FIXED:** Replaced `getAvatarColor` with `getAvatarGradient` + `getInitials` from design-system in ManagerLeaveApprovals.tsx and PIPTable.tsx. Consolidated duplicate design-system imports.

### Feature Parity Gap

- [x] **18. IT Admin vs Finance/Facilities dashboard feature gap** — SKIPPED (major feature work, not a quick fix)

---

## P2 — DEAD CODE & UNUSED FILES

- [x] **19. Dead HR files (never rendered/routed)**
  - `src/pages/hr/HRDashboard.tsx` (1,577 lines) — KEPT (still rendered in Dashboard.tsx for HR role)
  - `src/pages/hr/LeaveAttendanceOverview.tsx` (1,868 lines) — DELETED
  - `src/pages/hr/AttendanceManagement.tsx` (485 lines) — DELETED
  - `src/services/leaveAttendanceOverviewService.ts` — DELETED (only consumer was LeaveAttendanceOverview)

- [x] **20. Dead Employee files**
  - `src/pages/employee/Profile.old.tsx` (1,075 lines) — DELETED
  - `src/pages/employee/Attendance.tsx` (238 lines) — DELETED
  - `src/pages/employee/ITHelpdesk.tsx` — DELETED

- [x] **21. EmployeeHoursReport.tsx massive dead code**
  - **FIXED:** Removed 1 unused component (MultiProjectAllocationChart), 1 helper (isEndingSoon), 3 unused state variables, 8 unused useMemos, 2 unused functions, 1 unused useEffect, and 15 unused imports. File reduced significantly.

- [x] **22. WeeklyTimesheet.tsx needs decomposition** — SKIPPED (5,992 lines, requires major refactoring)

---

## P2 — MOCK/PLACEHOLDER DATA IN PRODUCTION

- [x] **23. Pages with 100% mock data (no API)**
  - **FIXED:** Added "DEMO DATA" amber banners to PayrollManagement, PerformanceManagement, Recruitment, RMGDashboard.
  - Replaced hardcoded "40h" and "95%" in EmployeeDashboard with "—" (em-dash).

---

## P3 — CODE QUALITY

### Console Logs

- [x] **24. 70+ console.log statements in production code**
  - **FIXED:** Removed 90 console statements across 4 files: MyAttendance (64), RecognitionCelebrations (17), AttendanceOverview (3), AdminAnnouncements (6). LeaveAttendanceOverview/DiversityInclusion/TeamsMembers already deleted in P2.

### Unused Imports

- [x] **25. 20+ unused imports across pages**
  - **FIXED:** Removed unused Dialog imports + Settings/FileType/MessageSquare from ITTicketManagement.tsx, removed KpiCard from ProjectListPage.tsx. EmployeeDashboard/EmployeeHoursReport/Leave.tsx imports verified as actively used.
  - EmployeeHoursReport already cleaned in P2 #21.

### TODO/FIXME Comments

- [x] **26. 12 TODO/FIXME comments remain** — NOTED (these are legitimate placeholders for future features, not bugs)

### Other Code Quality

- [x] **27. Hardcoded year arrays**
  - **FIXED:** Replaced `[2024, 2025, 2026, 2027]` with dynamic `Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)` in ManagerLeaveApprovals.tsx.

- [x] **28. Missing loading states** — SKIPPED (requires new UI components and API integration per page)

- [x] **29. Two different toast systems**
  - **FIXED:** Migrated 10 files (ConfigFormSheet, ConfigSection, CreateFLWizard, FLStep1-4, CreateFLForm, CreatePOForm, CreateCustomerPODialog) from `useToast()` hook to `sonner` `toast`. 32 toast calls converted.

- [x] **30. Browser `confirm()` instead of AlertDialog**
  - **FIXED:** Replaced browser `confirm()` with AlertDialog component in LeavePolicyConfig.tsx with proper delete confirmation UI.

- [x] **31. Sidebar profile mapping gap**
  - **FIXED:** Added explicit `FINANCE_ADMIN` and `FACILITIES_ADMIN` cases to `getEffectiveRole()` switch in Sidebar.tsx.

---

## P3 — RESPONSIVE & DARK MODE

- [x] **32. No max-width on main content**
  - **FIXED:** Added `max-w-[1920px]` to main content wrapper in DashboardLayout.tsx to prevent infinite stretch on ultrawide monitors.

- [x] **33. Search hidden on mobile with no alternative**
  - **FIXED:** Added mobile search toggle button (Search icon, visible `lg:hidden`) in Topbar.tsx with collapsible GlobalSearch row below the header.

- [x] **34. Missing dark mode variants in MyAttendance**
  - **FIXED:** Added 23 dark mode variants across the file: `dark:text-gray-100/200/300`, `dark:bg-gray-800`, `dark:ring-gray-700`, `dark:border-gray-700`, `dark:hover:bg-gray-800/50`.

- [x] **35. IT Admin tab labels overflow on small screens**
  - **FIXED:** Changed TabsList from `grid grid-cols-4` to `flex overflow-x-auto` with `flex-1 min-w-[140px]` on each trigger for horizontal scrolling on small screens.

- [x] **36. Excessive polling interval**
  - **FIXED:** Changed polling from 5 seconds to 60 seconds. Reduced triple stacked setTimeout refreshes on clock-in/clock-out to single delayed refresh (1s).

---

## Fix Priority Order

1. **P0 items (1-7)** — Fix bugs causing visible errors
2. **P1 items (8-15)** — Fix routing mismatches and hardcoded URLs
3. **P2 items (16-23)** — Standardize UI, remove dead code, replace mock data
4. **P3 items (24-36)** — Code quality, responsive, dark mode improvements
