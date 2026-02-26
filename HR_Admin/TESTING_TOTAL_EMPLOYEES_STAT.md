# Testing Leave & Attendance Overview - Total Employees Stat Card

## Quick Verification Checklist

### 1. Database Status ✅
- **Total Active Employees**: 32
- **Attendance Records**: 1,952 (last 60 days)
- **Leave Records**: 52
- **Leave Balances**: 33 configured

### 2. Backend API Status ✅  
- Server running on port 5000
- `/api/leave-attendance/kpis` endpoint working
- Returns `totalEmployees: 32` in response

### 3. Frontend Enhanced Logging ✅
Added console.log statements to help debug:
- Logs KPIs data after fetching
- Logs totalEmployees value and type
- Logs rendering details including isHRAdmin flag

## Testing Steps

### Step 1: Start Both Servers

**Backend (Terminal 1):**
\`\`\`bash
cd server
npm run dev
# Should show: Server running on port 5000
\`\`\`

**Frontend (Terminal 2):**
\`\`\`bash
npm run dev
# Should show: Local: http://localhost:3000
\`\`\`

### Step 2: Login as HR Admin

1. Navigate to `http://localhost:3000`
2. Login with HR Admin credentials:
   - Email: `hradmin@acuvate.com` or `hr001@acuvate.com`
   - Password: Check your user data
3. Verify you see "HR Admin" or similar role indicator

### Step 3: Navigate to Leave & Attendance Page

1. Click on **HR Admin** menu (or HR Process)
2. Click on **Leave & Attendance Overview**
3. Page should load with KPI cards at the top

### Step 4: Check Browser Console

Press **F12** to open DevTools, go to **Console** tab, you should see:

\`\`\`
LeaveAttendanceOverview - User permissions: { permissions: {...}, isHRAdmin: true }
Fetching dashboard data...
Dashboard data fetched: { kpisData: {...}, ... }
KPIs Data Details: {
  totalEmployees: 32,
  presentToday: <number>,
  onLeaveToday: <number>,
  attendanceType: "number"
}
Rendering KPI Cards with: {
  isHRAdmin: true,
  totalEmployees: 32,
  kpisObject: { totalEmployees: 32, ... }
}
\`\`\`

### Step 5: Verify Stat Cards Display

You should see **6 stat cards** in the top row:

| Card | Title | Expected Value |
|------|-------|----------------|
| 1 | **Total Employees** | **32** |
| 2 | Present Today | (varies, 0-32) |
| 3 | On Leave Today | (varies, 0-5) |
| 4 | Attendance Rate | (%, e.g., 75.5%) |
| 5 | Leave Utilization | (%, e.g., 12.3%) |
| 6 | Late Arrivals (MTD) | (number, e.g., 15) |

**The first card should show:**
- **Title**: "Total Employees" (blue icon with Users symbol)
- **Value**: **32** (large, bold number)
- **Background**: Light blue tint
- **Border**: Blue left border

## Troubleshooting

### Issue: Total Employees shows 0

**Check:**
1. Console log shows `totalEmployees: 0` → Backend issue
   - Verify database: `cd server; npx ts-node --transpile-only src/checkEmployeeCount.ts`
   - Should show 32 active employees
   - If 0, employee data needs to be seeded

2. Console log shows `totalEmployees: 32` but displays 0 → Frontend issue
   - Check if `isHRAdmin: false` in console
   - Non-admin users won't see this metric
   - Verify user has `canEditEmployees` permission

### Issue: Stat card not visible

**Check:**
1. Console shows `kpis: null` → API call failed
   - Check Network tab for `/kpis` request
   - Look for 401 (not authenticated) or 403 (not authorized) errors
   - Verify token is being sent in Authorization header

2. Console shows error message → Date range issue
   - Default date range is current month
   - Data spans last 60 days from today
   - Try adjusting date filter to include more days

### Issue: Shows "My Status" instead of "Total Employees"

**Cause:** User is not recognized as HR Admin

**Fix:**
1. Check console: `isHRAdmin: false`
2. Verify user's permissions include `canEditEmployees: true`
3. Check user's role is 'hr' or has proper permissions
4. Re-login if permissions were recently updated

## Expected Console Output (Full Example)

\`\`\`javascript
LeaveAttendanceOverview - User permissions: {
  permissions: {
    canEditEmployees: true,
    canManageLeaves: true,
    canManageAttendance: true,
    // ... other permissions
  },
  isHRAdmin: true
}

Fetching dashboard data...

Dashboard data fetched: {
  kpisData: {
    totalEmployees: 32,
    presentToday: 25,
    onLeaveToday: 2,
    attendanceRate: 75.5,
    leaveUtilizationRate: 12.3,
    lateArrivalsMTD: 15,
    overtimeHoursMTD: 45.5
  },
  breakdownData: [...],
  trendData: [...],
  lateArrivalsData: [...]
}

KPIs Data Details: {
  totalEmployees: 32,
  presentToday: 25,
  onLeaveToday: 2,
  attendanceType: "number"
}

Rendering KPI Cards with: {
  isHRAdmin: true,
  totalEmployees: 32,
  kpisObject: {
    totalEmployees: 32,
    presentToday: 25,
    onLeaveToday: 2,
    attendanceRate: 75.5,
    leaveUtilizationRate: 12.3,
    lateArrivalsMTD: 15,
    overtimeHoursMTD: 45.5
  }
}

HR admin data fetched: {
  requestsCount: 1,
  employeeDetailsCount: 32
}

Data loading completed successfully
\`\`\`

## Visual Reference

The Total Employees card should look like:

\`\`\`
┌─────────────────────────────────────┐
│ 📊 Total Employees            👥    │
│                                     │
│ 32                                  │
│                                     │
└─────────────────────────────────────┘
  ^ Blue left border
\`\`\`

## API Testing (Direct)

If you want to test the API directly using Postman or similar:

**Request:**
\`\`\`
GET http://localhost:5000/api/leave-attendance/kpis
Authorization: Bearer <your-jwt-token>
\`\`\`

**Expected Response:**
\`\`\`json
{
  "totalEmployees": 32,
  "presentToday": 25,
  "onLeaveToday": 2,
  "attendanceRate": 75.5,
  "leaveUtilizationRate": 12.3,
  "lateArrivalsMTD": 15,
  "overtimeHoursMTD": 45.5
}
\`\`\`

## Summary

✅ **Backend**: Returning correct data (32 employees)  
✅ **Database**: Contains 32 active employees  
✅ **Frontend**: Enhanced logging added to debug  
✅ **Display**: Card configured to show total employees for HR Admin

**Next Action**: Follow the testing steps above and check the browser console logs. Share the console output if the card is still not showing the correct value.
