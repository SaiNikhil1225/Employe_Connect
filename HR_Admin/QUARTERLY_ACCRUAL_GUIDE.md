# Quarterly Leave Accrual Implementation

## Overview
The leave management system has been updated to support **quarterly accrual** for Earned Leave in the Acuvate plan. Instead of receiving all 20 days at once, employees now accrue 5 days per quarter throughout the year.

## Configuration

### Acuvate Plan - Earned Leave
- **Annual Allocation**: 20 days per year
- **Accrual Type**: Quarterly
- **Accrual Rate**: 5 days per quarter

### Quarterly Schedule

| Quarter | Months | Days Accrued | Cumulative Total |
|---------|--------|--------------|------------------|
| Q1 | January - March | 5 days | 5 days |
| Q2 | April - June | 5 days | 10 days |
| Q3 | July - September | 5 days | 15 days |
| Q4 | October - December | 5 days | 20 days |

## Current Status (February 2026)

**We are currently in Q1**, so employees with the Acuvate plan will see:
- **Earned Leave Accrued**: 5 days
- **Remaining to Accrue**: 15 days (over the next 3 quarters)

## How It Works

### Automatic Accrual Calculation
The system automatically calculates accrued leave based on the current date:

1. **On Page Load**: When an employee or HR admin views the Leave Management page, the system:
   - Checks the current date
   - Determines which quarter we're in
   - Calculates accrued days: `currentQuarter × 5 days`

2. **Dynamic Updates**: The accrual updates automatically as quarters progress:
   - **January 1, 2026**: 5 days accrued (Q1 starts)
   - **April 1, 2026**: 10 days accrued (Q2 starts)
   - **July 1, 2026**: 15 days accrued (Q3 starts)
   - **October 1, 2026**: 20 days accrued (Q4 starts)

### Leave Balance Display

In the UI, you'll see:
```
Earned Leave Card:
┌─────────────────────────────┐
│ 🏝️ Earned Leave            │
│                             │
│ Available: 5 days           │ ← Automatically updates quarterly
│ Total: 20 days              │
│ Used: 0 days                │
│ Pending: 0 days             │
│ Progress: ████░░░░ 25%      │
└─────────────────────────────┘
```

## Where to See Leave Balances

### 1. Employee Leave Page
- **Path**: Employee Dashboard → Leave (sidebar)
- **URL**: `/leave`
- **Shows**: Personal leave balance with all leave types

### 2. HR Leave Management Page
- **Path**: HR Dashboard → Leave Management (sidebar)
- **URL**: `/hr/leave-management`
- **Shows**: 
  - HR admin's personal leave balance at the top
  - All employee leave requests below
  - Ability to approve/reject requests

### 3. HR Main Dashboard
- **Path**: HR Dashboard → Home
- **URL**: `/hr/dashboard`
- **Shows**: 
  - HR admin's leave balance in a prominent card
  - All leave types with current accruals

## Technical Implementation

### Backend Changes

**File**: `server/src/routes/leaves.ts`

Added quarterly accrual calculation:
```typescript
const calculateQuarterlyAccrual = (annualAllocation: number, quarterlyRate: number, currentDate: Date = new Date()): number => {
  const month = currentDate.getMonth(); // 0-11
  let completedQuarters = 0;
  
  if (month >= 0 && month <= 2) completedQuarters = 1;  // Q1
  else if (month >= 3 && month <= 5) completedQuarters = 2;  // Q2
  else if (month >= 6 && month <= 8) completedQuarters = 3;  // Q3
  else completedQuarters = 4;  // Q4
  
  return completedQuarters * quarterlyRate;
};
```

### Leave Plan Update

**File**: `server/src/scripts/seedLeavePlans.ts`

Updated Acuvate plan:
```typescript
{
  type: 'Earned Leave',
  annualAllocation: 20,
  accrualType: 'quarterly',    // Changed from 'monthly'
  accrualRate: 5,               // Changed from 1.67
  // ... other settings
}
```

## Testing the Feature

### Step 1: Access the Application
1. Open browser: `http://localhost:5173`
2. Login as HR Admin:
   - Email: `hr@acuvate.com`
   - Password: Your HR password

### Step 2: View Leave Balance

**Option A - Main Dashboard:**
1. You'll see the leave balance section on the main page
2. Look for the "Earned Leave" card
3. It should show **5 days available** (Q1 2026)

**Option B - Leave Management Page:**
1. Click "Leave Management" in the sidebar
2. Scroll to the top to see your personal leave balance
3. Earned Leave card shows **5 days available**

**Option C - Employee View:**
1. Login as a regular employee with Acuvate plan
2. Go to "Leave" page
3. See the same quarterly accrual

### Step 3: Apply for Leave
1. Click "Apply Leave" button
2. Select "Earned Leave" from dropdown
3. Notice the available balance is **5 days** (Q1 limit)
4. Try to apply for more than 5 days - system will prevent it

### Step 4: Future Quarters
To test future quarters (for development):
- The system will automatically show more days as quarters progress
- No manual intervention needed

## Benefits

✅ **Fair Distribution**: Employees accrue leave gradually throughout the year
✅ **Prevents Early Exhaustion**: Can't use all 20 days in January
✅ **Automatic Updates**: No manual process needed - system calculates based on date
✅ **Transparent**: Employees always see current accrued amount
✅ **Flexible**: Easy to adjust rates or switch to different accrual types

## Other Leave Types

The system supports multiple accrual types:

| Accrual Type | Description | Example |
|--------------|-------------|---------|
| `quarterly` | Accrues every 3 months | Earned Leave (5 days/quarter) |
| `monthly` | Accrues every month | Casual Leave (1 day/month) |
| `yearly` | Full allocation at year start | Most other leave types |
| `on-demand` | No fixed allocation | Compensatory Off, Loss of Pay |

## Troubleshooting

### Issue: Still showing 20 days instead of 5
**Solution**: 
1. Refresh your browser (Ctrl + R)
2. Clear browser cache (Ctrl + Shift + R)
3. Check that backend server is running with latest code

### Issue: Balance not updating
**Solution**:
1. Make sure both servers are running
2. Check backend logs for errors
3. Verify employee has Acuvate plan assigned

### Issue: Different employee shows different amounts
**Solution**:
- This is normal if they joined mid-year
- The system can be enhanced to pro-rate based on joining date

## Future Enhancements

Possible improvements for consideration:

1. **Pro-rated Accrual**: For mid-year joiners
2. **Email Notifications**: Alert employees when new quarter starts
3. **Accrual History**: Show accrual timeline
4. **Custom Rules**: Different accrual rates for different roles
5. **Negative Balance**: Allow borrowing from future quarters with approval

## Contact & Support

For questions or issues with the quarterly accrual system, please contact the development team.

---

**Last Updated**: February 12, 2026  
**Version**: 1.0  
**Status**: ✅ Active & Working
