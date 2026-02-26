# Quick Start Guide - Leave Assignment System

## Prerequisites
- Backend server running on port 5000
- Frontend running on port 5173
- MongoDB connected
- Leave plans seeded in database

## Step 1: Verify Backend Setup

### Start the backend server:
```bash
cd server
npm run dev
```

### Test the APIs:
```bash
node test-leave-assignment.js
```

This will verify:
- Leave plans are loaded
- Employee balances are initialized
- Routes are working

## Step 2: Access the UI

### Navigate to Leave Plans Management:
1. Login as HR admin
2. Go to HR section (usually `/hr/leave-plans` or similar)
3. You should see the Leave Plans Management page

### Expected UI Layout:
```
┌─────────────────────────────────────────────────────┐
│ Leave Plans Management                              │
│ Configure leave types, manage employee allocations  │
├──────────┬──────────────────────────────────────────┤
│ Plans    │ [Configuration] [Employees] [Year-End]   │
│ ────     │                                           │
│ Acuvate  │ Employee List with Search/Filter         │
│ (250)    │ ┌──────────────────────────────────────┐ │
│          │ │ ID    Name      Dept    Balance      │ │
│ Probation│ │ INE01 John Doe  IT      12/15 days   │ │
│ (50)     │ │ [Allocate] [Adjust]                  │ │
│          │ └──────────────────────────────────────┘ │
│ UK       │                                           │
│ (30)     │                                           │
└──────────┴──────────────────────────────────────────┘
```

## Step 3: Test Allocation Flow

### Allocate Leave to Single Employee:
1. Click "Employees" tab
2. Find an employee in the list
3. Click "Allocate" button
4. Modal opens
5. Select leave type (e.g., "Casual Leave")
6. Enter days (e.g., "2")
7. Enter reason (e.g., "Additional leave for project")
8. Click "Allocate Leave"
9. Success toast appears
10. Employee balance updates automatically

### Adjust Employee Balance:
1. Click "Adjust" button for an employee
2. Choose "Add" or "Deduct"
3. Select leave type
4. Enter days
5. Enter reason
6. Preview shows before/after balance
7. Click "Add Days" or "Deduct Days"
8. Success toast appears
9. Balance updates

### Bulk Allocate:
1. Click "Bulk Allocate" button
2. Select leave type and days
3. Enter reason
4. Search/filter employees
5. Check employees to allocate to
6. Review summary at bottom
7. Click "Allocate to X Employees"
8. Success toast with count
9. All selected employees updated

## Step 4: Verify Database Changes

### View adjustment history in MongoDB:
```javascript
db.leavebalanceadjustments.find({
  employeeId: "INE001"
}).sort({ createdAt: -1 })
```

### Check updated balances:
```javascript
db.leavebalances.findOne({
  employeeId: "INE001",
  year: 2026
})
```

## Step 5: Common Issues & Solutions

### Issue 1: "Leave plan not found"
**Solution:** Run seed script to create leave plans:
```bash
cd server/src/scripts
node seedLeavePlans.ts
```

### Issue 2: "Employee has no leave balance"
**Solution:** Leave balance is auto-initialized on first access. Simply:
1. Access employee leave page as that employee, OR
2. Use GET /api/leaves/balance/:employeeId to trigger initialization

### Issue 3: Modal not opening
**Solution:** Check import paths:
- Verify modal components are in `src/components/leave/`
- Check that LeavePlansManagement page imports are correct

### Issue 4: "Access denied" error
**Solution:** Ensure user has HR role:
```javascript
db.employees.updateOne(
  { employeeId: "HR001" },
  { $set: { role: "hr" } }
)
```

### Issue 5: Routes not working
**Solution:** Verify server.ts has route registration:
```typescript
import leavePlansRoutes from './routes/leavePlans';
app.use('/api/leave-plans', leavePlansRoutes);
```

## API Endpoints Reference

### Get All Leave Plans
```
GET /api/leave-plans
Response: { success: true, data: LeavePlanConfig[] }
```

### Get Plan Employees
```
GET /api/leave-plans/:planName/employees
Response: { success: true, data: EmployeeWithBalance[] }
```

### Allocate Leave
```
POST /api/leave-plans/allocate
Body: {
  employeeId: string,
  year: number,
  leaveType: string,
  days: number,
  reason: string,
  adjustedBy: string,
  adjustedByName: string
}
Response: { success: true, data: LeaveBalance }
```

### Adjust Leave
```
POST /api/leave-plans/adjust
Body: {
  employeeId: string,
  year: number,
  leaveType: string,
  adjustmentType: 'Add' | 'Deduct',
  days: number,
  reason: string,
  adjustedBy: string,
  adjustedByName: string
}
Response: { success: true, data: LeaveBalance }
```

### Bulk Allocate
```
POST /api/leave-plans/bulk-allocate
Body: {
  employeeIds: string[],
  year: number,
  leaveType: string,
  days: number,
  reason: string,
  adjustedBy: string,
  adjustedByName: string
}
Response: { 
  success: true, 
  data: { 
    success: Array<{employeeId, message}>,
    failed: Array<{employeeId, reason}>
  } 
}
```

### Get Adjustment History
```
GET /api/leave-plans/adjustments/:employeeId?year=2026
Response: { success: true, data: LeaveBalanceAdjustment[] }
```

## Success Criteria

✅ HR can view all leave plans in sidebar
✅ Clicking plan shows employees in that plan
✅ Employee balances display correctly (allocated/used/available)
✅ Allocate modal opens and submits successfully
✅ Adjust modal opens with Add/Deduct toggle
✅ Bulk allocate allows multi-select employees
✅ Toast notifications show on success/error
✅ Database records adjustments in audit trail
✅ Balances update in real-time after changes
✅ Search and filters work in employee list

## Next Features to Implement

1. **Year-End Processing Tab** - Carry forward, reset, expire logic
2. **Leave Type Management** - Add/edit/delete leave types in plan
3. **Adjustment History View** - Show audit trail for employee
4. **Export Functionality** - Download employee balances as Excel
5. **Notifications** - Email employees when balance is adjusted
6. **Reports Dashboard** - Analytics and utilization charts

## Support

For issues or questions:
1. Check [LEAVE_ASSIGNMENT_IMPLEMENTATION.md](./LEAVE_ASSIGNMENT_IMPLEMENTATION.md)
2. Review error logs in terminal
3. Verify all files were created correctly
4. Test API endpoints with Postman/curl

---

**Implementation Date:** February 2026
**Version:** 1.0.0
**Status:** ✅ Complete and Ready for Testing
