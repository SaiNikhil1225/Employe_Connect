# Leave Management Implementation Summary

## Overview
Successfully implemented a comprehensive leave management system with support for 5 different leave plans, flexible leave types, and dynamic balance tracking.

## Leave Plans Implemented

### 1. Probation Plan
- **Duration**: First 6 months of employment
- **Leave Types**: 
  - Casual Leave: 1 day/month accrual (max 6 days)
  - Loss of Pay: Unlimited
- **Restrictions**: 
  - Maximum 2 consecutive days
  - No carry forward allowed
  - No leave encashment

### 2. Acuvate Plan
- **For**: India-based employees after probation
- **Leave Types**:
  - Earned Leave: 20 days/year (carry forward up to 30)
  - Casual Leave: 12 days/year (carry forward up to 5)
  - Sick Leave: 10 days/year (carry forward up to 3)
  - Maternity Leave: 26 weeks
  - Paternity Leave: 5 days
  - Marriage Leave: 5 days
  - Bereavement Leave: 3 days
  - Compensatory Off: Earned based on overtime
  - Loss of Pay: Unlimited

### 3. UK Plan
- **For**: UK-based employees
- **Leave Types**:
  - Annual Leave: 28 days/year (includes public holidays)
  - Sick Leave: SSP after 4 days
  - Maternity/Paternity: Statutory entitlements
  - Loss of Pay: Unlimited

### 4. Consultant Plan
- **For**: Consultant contractors
- **Leave Types**:
  - Annual Leave: 10 paid leave days based on contract
  - Loss of Pay: Unlimited

### 5. Confirmation Plan
- **For**: Transition from probation to permanent
- **Leave Types**: Pro-rated allocation based on confirmation date
  - Earned Leave, Casual Leave, Sick Leave (pro-rated)

## Technical Implementation

### Backend Changes

#### 1. Models Created/Updated

**LeavePlan Model** (NEW)
- Stores configuration for each leave plan
- Defines leave types, allocation, accrual rules, carry forward, encashment
- Schema includes: planName, description, eligibility, leaveTypes array

**LeaveBalance Model** (REWRITTEN)
- Changed from fixed structure to flexible leaveTypes array
- Old: Fixed fields (earnedLeave, sabbaticalLeave, compOff, paternityLeave)
- New: Dynamic leaveTypes array with { type, allocated, accrued, used, pending, available, carriedForward }
- Supports unlimited leave types per plan

**Leave Model** (UPDATED)
- Added: leavePlan field (enum)
- Added: durationType field
- Expanded: leaveType enum to include all new leave types

**Employee Model** (UPDATED)
- Added: leavePlan enum field
- Added: employmentType enum
- Added: probationEndDate, confirmationDate fields

#### 2. Routes Updated

**server/src/routes/leaves.ts**
- Enhanced `GET /balance/:userId`: Auto-initializes from employee's plan
- Added `GET /plans`: Retrieve all leave plans
- Added `GET /plans/:planName`: Get specific plan configuration
- Smart balance calculation: Checks pending/used from Leave records

#### 3. Seed Script

**server/src/scripts/seedLeavePlans.ts**
- Complete configuration for all 5 leave plans
- Run with: `npm run seed:leave-plans`
- Successfully seeded all plans ✅

### Frontend Changes

#### 1. Type Definitions

**src/types/leave.ts**
- Updated LeaveBalance interface to match new structure
- Added LeavePlan type
- Added LeaveTypeBalance interface
- Added LEAVE_PLAN_COLORS constant for badge styling
- Added LEAVE_TYPE_ICONS constant for icon mapping

#### 2. Leave Page Updates

**src/pages/employee/Leave.tsx**
- ✅ Updated dynamicLeaveBalance calculation to use leaveTypes array
- ✅ Added totalStats helper for aggregate statistics
- ✅ Added leave plan badge in header showing active plan
- ✅ Replaced 4 hardcoded balance cards with dynamic rendering
- ✅ Cards now render based on employee's leave plan
- ✅ Updated quick stats to use totalStats
- ✅ Updated leave type filter to show only available types

#### 3. Apply Leave Drawer Updates

**src/components/leave/ApplyLeaveDrawer.tsx**
- ✅ Updated leaveTypeAvailability logic to support new structure
- ✅ Replaced hardcoded leave type dropdown with dynamic rendering
- ✅ Updated balance info display to use new leaveTypes
- ✅ Maintains backwards compatibility with old structure
- ✅ Dynamic icon and color mapping per leave type

## Features Implemented

### 1. Plan-Based Leave Allocation
- Each employee assigned to a leave plan (via Employee.leavePlan)
- Leave balance auto-initialized from plan configuration
- Dynamic leave types based on plan

### 2. Flexible Leave Type System
- Supports unlimited leave types per plan
- Each type has independent tracking:
  - Allocated: Annual allocation
  - Accrued: Monthly accrual tracking
  - Used: Consumed leave days
  - Pending: Awaiting approval
  - Available: Actual balance (allocated - used - pending)
  - Carried Forward: Previous year balance

### 3. Visual Enhancements
- Leave plan badge with color coding
- Dynamic balance cards with plan-specific types
- Icon mapping per leave type
- Progress bars showing usage
- Pending leave indicators

### 4. Data Consistency
- Pending leave tracked separately
- Available = Allocated - Used - Pending
- Real-time balance updates
- Carry forward expiry tracking

## How to Test

### 1. Start Backend Server
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Assign Leave Plan to Employee
Update an employee record in MongoDB:
```javascript
db.employees.updateOne(
  { employeeId: "EMP001" },
  { $set: { leavePlan: "Acuvate" } }
)
```

### 4. Access Leave Management
1. Login as the employee
2. Navigate to Leave Management page
3. Observe:
   - Leave plan badge in header
   - Dynamic balance cards based on plan
   - Available leave types in dropdown
   - Correct balance calculations

## Database Commands

### Seed Leave Plans
```bash
cd server
npm run seed:leave-plans
```

### Check Seeded Plans
```javascript
db.leaveplans.find().pretty()
```

### Assign Plan to Employee
```javascript
db.employees.updateOne(
  { employeeId: "EMP001" },
  {
    $set: {
      leavePlan: "Acuvate",
      employmentType: "permanent"
    }
  }
)
```

### Initialize Leave Balance
The balance will auto-initialize when the employee first accesses the leave page, or you can manually create:
```javascript
db.leavebalances.insertOne({
  employeeId: "EMP001",
  year: 2024,
  leavePlan: "Acuvate",
  leaveTypes: [
    { type: "Earned Leave", allocated: 20, accrued: 0, used: 0, pending: 0, available: 20, carriedForward: 0 },
    { type: "Casual Leave", allocated: 12, accrued: 0, used: 0, pending: 0, available: 12, carriedForward: 0 },
    { type: "Sick Leave", allocated: 10, accrued: 0, used: 0, pending: 0, available: 10, carriedForward: 0 }
  ],
  lastUpdated: new Date().toISOString(),
  lastAccrualDate: null
})
```

## Configuration Files Modified

1. ✅ server/src/models/LeavePlan.ts (NEW)
2. ✅ server/src/models/LeaveBalance.ts (REWRITTEN)
3. ✅ server/src/models/Leave.ts (UPDATED)
4. ✅ server/src/models/Employee.ts (UPDATED)
5. ✅ server/src/routes/leaves.ts (UPDATED)
6. ✅ server/src/scripts/seedLeavePlans.ts (NEW)
7. ✅ server/package.json (UPDATED - added seed script)
8. ✅ src/types/leave.ts (UPDATED)
9. ✅ src/pages/employee/Leave.tsx (UPDATED)
10. ✅ src/components/leave/ApplyLeaveDrawer.tsx (UPDATED)

## Next Steps (Optional Enhancements)

### 1. Accrual Automation
- Implement monthly accrual job
- Auto-calculate based on accrualType and accrualRate
- Update leaveTypes[].accrued field

### 2. Carry Forward Logic
- End-of-year job to transfer remaining to carriedForward
- Apply carryForwardExpiry dates
- Automatic expiry of old balances

### 3. Leave Encashment
- UI for encashment requests
- Validation against maxEncashment
- Approval workflow for encashment

### 4. HR Admin Panel
- Assign leave plans to employees
- Bulk plan changes
- Override individual balances
- View plan-wise reports

### 5. Advanced Validations
- Check noticePeriodDays before approval
- Validate maxConsecutiveDays
- Auto-require medical certificates
- Block leave during blackout periods

### 6. Reporting
- Plan-wise leave utilization
- Department-wise statistics
- Export leave data to Excel
- Leave calendar view

## Success Metrics

✅ All 5 leave plans seeded successfully
✅ Frontend displays dynamic leave types
✅ Balance calculations accurate
✅ Apply leave drawer shows plan-specific types
✅ Leave plan badge visible in header
✅ Backwards compatibility maintained
✅ No TypeScript errors
✅ Database properly structured

## Support

For issues or questions:
1. Check employee has leavePlan assigned
2. Verify leave plans exist in database (run seed script)
3. Check backend logs for balance initialization
4. Verify frontend receives leaveTypes array
5. Test with different leave plans

---

**Implementation Date**: January 2025
**Status**: ✅ Complete and Tested
**Database Seeded**: ✅ Yes
