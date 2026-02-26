# User Leave & Attendance Page Enhancement

## 📋 Overview
Enhanced the **My Attendance & Leave** page (`/attendance`) for regular employees with comprehensive leave tracking, detailed history, and user-focused statistics.

**Route:** `/attendance`  
**Component:** `src/pages/employee/Attendance.tsx`  
**Available for:** EMPLOYEE, MANAGER, IT_ADMIN roles

---

## ✨ New Features Added

### 1. **Enhanced Stat Cards (4 Cards)**

Now displays 4 comprehensive stat cards instead of 3:

#### **Available Leave** (Blue)
- Shows total available leave days remaining
- Calculated across all leave types
- Icon: CalendarDays

#### **Leaves Taken** (Green) - NEW
- Shows total leave days consumed this year
- Counts only approved leaves
- Icon: CheckCircle

#### **Pending Requests** (Orange)
- Shows count of leave requests awaiting approval
- Animated pulse effect for visibility
- Icon: Clock

#### **Approval Rate** (Purple) - NEW
- Shows percentage of leaves approved
- Displays "X of Y approved" subtitle
- Icon: BarChart3

---

### 2. **Complete Leave History Table**

Comprehensive table showing ALL leave requests with full details:

#### **Columns:**
1. **Leave Type** - With color-coded indicators
   - Casual Leave: Purple
   - Earned Leave: Blue
   - Sick Leave: Red
   - Compensatory Off: Orange
   - Maternity Leave: Pink
   - Paternity Leave: Green

2. **Dates** - Start and end dates
   - Shows date range for multi-day leaves
   - Displays half-day badge if applicable

3. **Days** - Number of leave days

4. **Status** - Color-coded badges
   - ✅ Approved (Green)
   - ⏰ Pending (Orange, animated pulse)
   - ❌ Rejected (Red)
   - ⭕ Cancelled (Gray)

5. **Applied On** - Date when leave was requested

6. **Approved/Rejected By** - Shows:
   - Approver name
   - Approval/Rejection date
   - "Pending" if not yet processed

7. **Reason/Comments** - Shows:
   - Rejection reason (if rejected)
   - Cancellation reason (if cancelled)
   - Original justification (for other statuses)
   - Manager remarks/notes

#### **Features:**
- ✅ Row color coding based on status
- ✅ Sorted by most recent first (applied date)
- ✅ Empty state with "Request Your First Leave" button
- ✅ Summary footer showing approved/pending/rejected counts

---

### 3. **Existing Features Retained**

#### **Leave Balance Overview Table**
- Detailed breakdown by leave type
- Shows: Allocated, Used, Pending, Available, Carried Forward
- Utilization percentage with progress bar
- "Apply" button for each leave type (when available > 0)
- Total row with aggregated statistics

#### **Upcoming Approved Leaves**
- Shows next 5 upcoming approved leaves
- Date range and leave type
- Days count and justification

#### **Pending Leave Requests**
- Shows last 3 pending requests
- Applied date visible
- Quick visual identification

#### **Attendance Records**
- Daily attendance with check-in/check-out times
- Effective hours and gross hours
- Period filters (30 Days, Oct, Sep, Aug, etc.)
- Status indicators (Present, Absent, Leave, W-Off, Holiday)

#### **Request Leave Button**
- Primary action button in header
- Opens ApplyLeaveDrawer component
- Pre-selects leave type when clicked from "Apply" buttons

---

## 📊 Statistics Calculations

### Enhanced Leave Stats:
```typescript
{
  pending: number,           // Leaves with status 'pending'
  upcoming: number,          // Approved leaves in next 30 days
  totalAvailable: number,    // Sum of available days across all types
  approved: number,          // Total approved leaves count
  rejected: number,          // Total rejected leaves count
  approvalRate: string,      // (approved / totalRequests) * 100
  totalLeavesTaken: number,  // Sum of days from approved leaves
  totalRequests: number      // Total leave requests count
}
```

---

## 🎨 Visual Enhancements

### Row Color Coding in Leave History:
- **Approved:** Light green background (`bg-green-50`)
- **Rejected:** Light red background (`bg-red-50`)
- **Pending:** Light orange background (`bg-orange-50`)
- **Cancelled:** Light gray background (`bg-gray-50`)

### Badge Styling:
- **Approved:** Green badge with CheckCircle icon
- **Pending:** Orange badge with Clock icon (animated pulse)
- **Rejected:** Red badge with XCircle icon
- **Cancelled:** Secondary badge with Circle icon

### Status-Based Text Colors:
- **Approver names:** Green for approved, Red for rejected, Gray for cancelled
- **Summary counters:** Matching colors for visual consistency

---

## 📱 User Experience Improvements

### 1. **Complete Transparency**
- Users can see full leave history including rejections
- Rejection reasons are clearly displayed
- Manager remarks visible for all requests

### 2. **Quick Actions**
- "Request Leave" button prominently placed in header
- "Apply" buttons in leave balance table for quick requests
- Pre-selection of leave type when applicable

### 3. **Comprehensive Information**
- All dates, approvers, and reasons in one place
- No need to navigate multiple pages
- Summary statistics for quick overview

### 4. **Visual Hierarchy**
- Stat cards at top for immediate insights
- Leave balance breakdown with detailed table
- Complete history with searchable/scrollable table
- Attendance records at bottom for daily tracking

---

## 🔄 Page Structure (Top to Bottom)

```
1. Page Header
   └─ Title: "My Attendance & Leave"
   └─ Action: "Request Leave" button

2. Quick Stats (4 cards)
   └─ Available Leave | Leaves Taken | Pending | Approval Rate

3. Leave Balance Overview Table
   └─ Detailed breakdown by leave type with utilization

4. Upcoming Leaves & Pending Requests (2 columns)
   └─ Next 5 upcoming | Last 3 pending

5. Complete Leave History Table ⭐ NEW
   └─ All leaves with dates, status, approvers, reasons
   └─ Summary footer with counts

6. Attendance Records
   └─ Daily attendance with period filters
```

---

## 🔗 Navigation Path

**For Employees:**
1. Login to portal
2. Click **"Leave & Remote Work"** or **"My Attendance & Leave"** in sidebar
3. Route: `/attendance`
4. View all leave and attendance data
5. Click **"Request Leave"** to apply for new leave

**Menu Item:** "My Attendance & Leave" (Calendar icon)  
**Available for:** EMPLOYEE, MANAGER, IT_ADMIN roles

---

## 📋 Sample Leave History Display

```
Leave Type         | Dates              | Days | Status    | Applied On  | Approved By | Reason
-------------------|-----------------------|------|-----------|-------------|-------------|------------------
Casual Leave       | Feb 20 - Feb 22, 2026 | 3    | ✅ Approved | Feb 15, 2026 | John Smith  | Family function
                   |                       |      |           |             | Feb 16, 2026|
-------------------|-----------------------|------|-----------|-------------|-------------|------------------
Earned Leave       | Feb 10, 2026          | 0.5  | ⏰ Pending | Feb 08, 2026 | Pending     | Doctor appointment
                   | Half Day - First Half |      |           |             |             |
-------------------|-----------------------|------|-----------|-------------|-------------|------------------
Sick Leave         | Feb 05, 2026          | 1    | ❌ Rejected| Feb 04, 2026 | Jane Doe    | Rejection: Insufficient
                   |                       |      |           |             | Feb 04, 2026| documentation provided
```

---

## ✅ Testing Checklist

- [x] Stat cards display correct calculations
- [x] Leave history shows all statuses (approved, pending, rejected, cancelled)
- [x] Dates formatted correctly (MMM dd, yyyy)
- [x] Approval/rejection details visible
- [x] Color coding applied correctly
- [x] Empty state displays when no leaves
- [x] Request leave button opens drawer
- [x] Pre-selection works from "Apply" buttons
- [x] Summary footer shows accurate counts
- [x] Responsive layout on mobile/tablet
- [x] Dark mode compatibility
- [x] No TypeScript errors

---

## 🎯 User Benefits

1. **Complete Visibility:** See entire leave history in one place
2. **Transparency:** View approval/rejection reasons
3. **Quick Insights:** 4 stat cards for instant overview
4. **Easy Access:** One-click leave request from multiple places
5. **Detailed Tracking:** All dates, approvers, and comments visible
6. **Combined View:** Both leave and attendance data on same page
7. **Status Clarity:** Color-coded badges for instant recognition

---

## 🚀 Next Steps (Optional Enhancements)

### Potential Future Improvements:
1. **Export to PDF/Excel:** Download leave history report
2. **Filter & Search:** Filter by status, date range, leave type
3. **Leave Balance Chart:** Visual representation of utilization
4. **Calendar View:** Monthly calendar showing leave days
5. **Quick Stats Tooltips:** Hover for detailed breakdowns
6. **Leave Trends:** Monthly/quarterly leave patterns
7. **Team Leave Calendar:** See team members' leave dates
8. **Leave Cancellation:** Cancel pending/approved leaves
9. **Notifications:** Real-time updates on approval/rejection
10. **Comments/Discussion:** Add comments to leave requests

---

## 📝 Technical Implementation

### File Modified:
- `src/pages/employee/Attendance.tsx` (729 lines → 990 lines)

### Changes Made:
1. Enhanced `leaveStats` calculation with additional metrics
2. Updated stat cards grid from 3 to 4 columns
3. Added new stat cards: "Leaves Taken" and "Approval Rate"
4. Added complete leave history table with 7 columns
5. Implemented status-based row styling
6. Added summary footer with counts
7. Maintained existing functionality (leave balance, attendance records)

### Dependencies:
- All existing imports retained
- No new dependencies added
- Uses existing UI components (Card, Table, Badge, Button)
- Uses existing date formatting (date-fns)

---

## ✨ Summary

The enhanced **My Attendance & Leave** page now provides employees with:
- **4 comprehensive stat cards** for quick insights
- **Complete leave history table** showing all requests with full details
- **Transparent approval process** with approver names and comments
- **Visual status indicators** with color-coded badges
- **Seamless integration** with existing attendance tracking

This creates a **single-page dashboard** where employees can:
1. View available leave balances
2. Request new leaves
3. Track pending requests
4. See complete leave history
5. Monitor attendance records
6. Understand approval/rejection reasons

**Route:** `/attendance`  
**Status:** ✅ Implemented & Tested  
**TypeScript Errors:** None  
**Backward Compatible:** Yes
