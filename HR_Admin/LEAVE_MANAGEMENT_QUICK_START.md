# Leave Management - Quick Start Guide

## For Employees

### View Your Leave Balance
1. Navigate to **Leave Management** page
2. Your leave plan badge is displayed at the top (e.g., "Acuvate Plan", "Probation Plan")
3. Balance cards show each leave type available in your plan:
   - Available days
   - Used days
   - Pending approval days
   - Total allocated days

### Apply for Leave
1. Click **Apply** button on any leave type card, OR
2. Click **Apply forLeave** button in the header
3. Select:
   - Leave type (only types in your plan are shown)
   - Start and end dates
   - Full day or half day
   - Justification
4. Click **Submit**

### Track Leave Status
- **Pending**: Awaiting manager approval (shown in orange)
- **Approved**: Leave confirmed (shown in green)
- **Rejected**: Leave denied (shown in red)
- **Cancelled**: You cancelled the leave

## For HR/Admins

### Assign Leave Plan to Employee

#### Option 1: MongoDB Compass
```javascript
// Update employee record
db.employees.updateOne(
  { employeeId: "EMP001" },
  {
    $set: {
      leavePlan: "Acuvate",  // Options: Probation, Acuvate, UK, Consultant, Confirmation
      employmentType: "permanent",  // permanent, probation, consultant
      probationEndDate: null,  // Set if on probation
      confirmationDate: "2024-01-15T00:00:00.000Z"  // Set when confirmed
    }
  }
)
```

#### Option 2: Backend API (Future Enhancement)
- Navigate to HR Admin Panel
- Select Employee
- Choose Leave Plan
- Save

### Seed Leave Plans (First Time Setup)
```bash
cd server
npm run seed:leave-plans
```

This creates 5 leave plans:
- ✅ Probation
- ✅ Acuvate
- ✅ UK
- ✅ Consultant
- ✅ Confirmation

### Manually Initialize Leave Balance
If auto-initialization doesn't work:

```javascript
db.leavebalances.insertOne({
  employeeId: "EMP001",
  year: 2024,
  leavePlan: "Acuvate",
  leaveTypes: [
    {
      type: "Earned Leave",
      allocated: 20,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 20,
      carriedForward: 0,
      carryForwardExpiry: null
    },
    {
      type: "Casual Leave",
      allocated: 12,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 12,
      carriedForward: 0,
      carryForwardExpiry: null
    },
    {
      type: "Sick Leave",
      allocated: 10,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 10,
      carriedForward: 0,
      carryForwardExpiry: null
    }
  ],
  lastUpdated: new Date().toISOString(),
  lastAccrualDate: null
})
```

## Leave Plan Details

### Probation Plan
**Who**: New employees (first 6 months)
**Leave Types**:
- Casual Leave: 1 day/month (max 6)
- Loss of Pay: Unlimited

**Rules**:
- Max 2 consecutive days
- No carry forward
- 1-day notice required

---

### Acuvate Plan
**Who**: India employees after probation
**Leave Types**:
- Earned Leave: 20 days/year
- Casual Leave: 12 days/year
- Sick Leave: 10 days/year
- Maternity: 26 weeks
- Paternity: 5 days
- Marriage: 5 days
- Bereavement: 3 days
- Comp Off: As earned
- Loss of Pay: Unlimited

**Rules**:
- Earned: Carry forward up to 30 days
- Casual: Carry forward up to 5 days
- Sick: Medical certificate required >5 days
- Maternity: 4 weeks notice
- Marriage: 2 weeks notice

---

### UK Plan
**Who**: UK-based employees
**Leave Types**:
- Annual Leave: 28 days/year (includes public holidays)
- Sick Leave: SSP after 4 days
- Maternity: Statutory 52 weeks
- Paternity: Statutory 2 weeks
- Loss of Pay: Unlimited

**Rules**:
- Annual: Carry forward up to 5 days
- Must use carry forward by June 30
- Encashment allowed (max 10 days)

---

### Consultant Plan
**Who**: Contractors/Consultants
**Leave Types**:
- Annual Leave: 10 paid days
- Loss of Pay: Unlimited

**Rules**:
- Pro-rated based on contract
- No carry forward
- Min contract length required

---

### Confirmation Plan
**Who**: Transitioning from probation to permanent
**Leave Types**:
- Pro-rated Earned, Casual, Sick Leave

**Rules**:
- Allocation calculated from confirmation date
- Transitions to Acuvate plan at year-end

## Troubleshooting

### Employee sees "No leave balances available"
**Solution**:
1. Check employee has `leavePlan` assigned in database
2. Verify leave plans exist: `db.leaveplans.count()` should be 5
3. Refresh the page to trigger auto-initialization

### Wrong leave types showing
**Solution**:
1. Check employee's `leavePlan` field matches their location/status
2. Update plan: `db.employees.updateOne({ employeeId: "X" }, { $set: { leavePlan: "Acuvate" }})`
3. Refresh page

### Balance not updating after approval
**Solution**:
1. Check Leave record has correct `status: 'approved'`
2. Backend recalculates on page load
3. Clear browser cache and refresh

### Apply button disabled
**Solution**:
1. Select dates first (leaveDays must be > 0)
2. Check if sufficient balance exists
3. Look for insufficient balance message in dropdown

## API Endpoints

### Get Employee Leave Balance
```
GET /api/leaves/balance/:userId
```

### Get All Leave Plans
```
GET /api/leaves/plans
```

### Get Specific Leave Plan
```
GET /api/leaves/plans/:planName
```

### Apply for Leave
```
POST /api/leaves
Body: {
  employeeId, startDate, endDate, leaveType, justification, ...
}
```

### Get Employee's Leave History
```
GET /api/leaves?userId=EMP001
```

## Balance Calculation Logic

```
For each leave type:
  allocated = Annual allocation from plan
  accrued = Monthly accrual (if applicable)
  used = SUM(approved leaves)
  pending = SUM(pending leaves)
  carriedForward = Previous year balance
  available = (allocated + accrued + carriedForward) - used - pending
```

## Database Collections

### leaveplans
- Stores configuration for each leave plan
- 5 documents (one per plan)

### leavebalances
- One document per employee per year
- Contains dynamic leaveTypes array

### leaves
- Individual leave requests
- Linked to employee via employeeId
- Status: pending / approved / rejected

### employees
- Contains leavePlan assignment
- Also: employmentType, probationEndDate, confirmationDate

## Color Coding

| Leave Type | Color |
|-----------|--------|
| Casual Leave | Purple |
| Earned Leave | Blue |
| Sick Leave | Red |
| Compensatory Off | Orange |
| Maternity Leave | Pink |
| Paternity Leave | Green |
| Bereavement | Gray |
| Marriage | Yellow |
| Loss of Pay | Slate |
| Annual Leave | Indigo |

## Icons

| Leave Type | Icon |
|-----------|------|
| Casual Leave | 🌴 Palmtree |
| Earned Leave | ✈️ Plane |
| Sick Leave | ❤️ Heart |
| Compensatory Off | 🏆 Award |
| Maternity Leave | 👶 Baby |
| Paternity Leave | 💼 Briefcase |
| Bereavement | ⚠️ AlertCircle |
| Marriage | ✨ Sparkles |
| Loss of Pay | ⭕ Circle |
| Annual Leave | 📅 Calendar |

---

## Support Contact

For questions or issues:
- Technical: Check implementation documentation
- Leave Policy: Contact HR
- System Access: Contact IT Admin

**Last Updated**: January 2025
