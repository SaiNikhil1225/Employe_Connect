# Onboarding Workflow - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Employee Connect project set up

### Step 1: Start MongoDB
```bash
# If using local MongoDB
mongod

# OR if using start script
.\start-mongodb.bat
```

### Step 2: Start Backend Server
```bash
cd server
npm install  # if first time
npm run dev
```

**Expected output:**
```
🚀 MongoDB Server running on http://localhost:5000
📊 Database: MongoDB (rmg-portal)
🔐 JWT Authentication enabled
```

### Step 3: Start Frontend
```bash
# In project root
npm install  # if first time
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 📋 How to Use

### 1. Create a New Employee
1. Login as **HR** or **SUPER_ADMIN**
2. Navigate to **Employee Management**
3. Click **"Add Employee"** button
4. Fill in employee details:
   - Employee ID (auto-generated)
   - Full Name
   - Designation
   - Department
   - Joining Date ⚠️ **Important**
   - Email, Phone, etc.
5. Click **"Submit"**

**Result:**
- ✅ Employee created
- ✅ Onboarding initialized automatically
- ✅ Toast notification: "Onboarding workflow initialized"

### 2. View Onboarding
1. Go to **Employee Management**
2. Find the employee
3. Click **⋮ (three dots)** menu
4. Select **"View Onboarding"** 📋

**What you'll see:**
- Employee details card
- Progress bar (0% initially)
- Status buttons (In Progress, On Hold, Complete)
- 4 tabs:
  - **Checklist** - 20 default tasks
  - **Documents** - 7 document types
  - **Welcome Kit** - 6 IT items
  - **Trainings** - 4 training sessions

### 3. Update Onboarding Status
1. On Onboarding Dashboard
2. Click status button:
   - **In Progress** - Active onboarding
   - **On Hold** - Temporarily paused
   - **Complete** - Fully done (requires 100% progress)

**Result:**
- ✅ Status updates in database
- ✅ Toast confirmation
- ✅ Persists on refresh

### 4. Complete Tasks
**Checklist:**
1. Go to **Checklist** tab
2. Click checkbox next to task
3. Progress updates automatically

**Documents:**
1. Go to **Documents** tab
2. Click **"Upload"** button (when available)
3. Select document file
4. Status changes: Pending → Uploaded
5. HR verifies: Uploaded → Verified

**Welcome Kit:**
1. Go to **Welcome Kit** tab
2. Click **"Assign"** button
3. Enter serial number (for hardware)
4. Mark as **Delivered**

**Trainings:**
1. Go to **Trainings** tab
2. Click **"Schedule"** to set date
3. After completion, mark as **Completed**
4. Add feedback and rating

### 5. View All Onboarding (HR View)
1. Click **"Onboarding"** in sidebar
2. See all employees being onboarded

**Features:**
- **Stats Cards** - Total, In Progress, Completed, On Hold
- **Search** - By name, department, designation
- **Filters** - By status, by phase
- **Click employee** → Go to their dashboard

---

## 🔍 Quick Reference

### Default Checklist Tasks (20 total)

**Pre-joining (5 tasks):**
- Offer Letter Sent
- Offer Letter Accepted
- Background Verification
- Documents Requested
- IT Setup Request

**Day 1 (6 tasks):**
- Workstation Setup
- Welcome Kit Preparation
- Access Card Issued
- Welcome Email
- Buddy Assignment
- Orientation Session

**Week 1 (4 tasks):**
- Team Introduction
- System Access
- Role Training
- Policy Review

**Month 1 (3 tasks):**
- Performance Goals
- First Project Assignment
- 30-Day Feedback

**Probation (2 tasks):**
- Mid-Probation Review
- Final Probation Review

### Default Documents (7 types)
- PAN Card ✅ Required
- Aadhaar Card ✅ Required
- Educational Certificates ✅ Required
- Previous Employment Letters (optional)
- Bank Details ✅ Required
- Address Proof ✅ Required
- Passport Photos ✅ Required

### Default Welcome Kit (6 items)
- Laptop (IT equipment)
- Mouse
- Keyboard
- Headset
- Employee ID Card
- Company Handbook

### Default Trainings (4 sessions)
- Company Orientation ✅ Mandatory
- IT Security & Compliance ✅ Mandatory
- HR Policies ✅ Mandatory
- Department Overview ✅ Mandatory

---

## 📊 Progress Calculation

Progress is calculated automatically:

```
Checklist:    (Completed Mandatory / Total Mandatory) × 25%
Documents:    (Verified Required / Total Required) × 25%
Welcome Kit:  (Delivered / Total) × 25%
Trainings:    (Completed Mandatory / Total Mandatory) × 25%
────────────────────────────────────────────────────────
Total:        Sum of above = 0-100%
```

**Example:**
- ✅ 5/20 checklist tasks done = 25% → 6.25%
- ✅ 2/7 documents verified = 28% → 7%
- ✅ 3/6 welcome kit delivered = 50% → 12.5%
- ✅ 1/4 trainings completed = 25% → 6.25%
- **Total Progress = 32%**

---

## 🎯 Status vs Progress

| Status | Progress | Meaning |
|--------|----------|---------|
| Not Started | 0% | Initialized, no action taken |
| In Progress | 1-99% | Actively onboarding |
| On Hold | Any% | Temporarily paused |
| Completed | 100% | All mandatory items done |

**Note:** "Complete" button is disabled until 100% progress.

---

## 🔐 Permissions

| Role | Can View | Can Edit |
|------|----------|----------|
| HR | All employees | All employees |
| SUPER_ADMIN | All employees | All employees |
| Manager | Team only* | Team only* |
| Employee | Own only* | Limited* |

*Future enhancement

---

## 🐛 Troubleshooting

### Issue: Onboarding not initialized
**Check:**
1. Employee has joining date?
2. Backend server running?
3. MongoDB connected?
4. Browser console for errors

### Issue: Progress not updating
**Check:**
1. Is the item marked as mandatory/required?
2. Is the status set to "completed"/"verified"/"delivered"?
3. Refresh the page
4. Check browser network tab

### Issue: Can't access onboarding
**Check:**
1. Are you logged in as HR/SUPER_ADMIN?
2. Check browser console for 401 errors
3. Try logging out and back in

### Issue: "Complete" button disabled
**This is normal!** Complete button only enables at 100% progress.

---

## 📱 Tips & Best Practices

### For HR:
1. ✅ Always set joining date when creating employee
2. ✅ Review onboarding regularly
3. ✅ Verify documents promptly
4. ✅ Assign buddy/mentor early
5. ✅ Use "On Hold" status if delays occur

### For IT:
1. ✅ Complete pre-joining tasks before Day 1
2. ✅ Update welcome kit serial numbers
3. ✅ Mark items as delivered when shipped

### For Managers:
1. ✅ Complete Week 1 introductions
2. ✅ Set Month 1 performance goals
3. ✅ Conduct probation reviews on time

---

## 📞 Need Help?

**Documentation:**
- [Backend Implementation](ONBOARDING_BACKEND_IMPLEMENTATION.md)
- [API Migration Guide](ONBOARDING_API_MIGRATION.md)
- [Complete Summary](ONBOARDING_COMPLETE_SUMMARY.md)

**Common Questions:**

**Q: Can I customize the default tasks?**
A: Yes! Add/edit tasks in the Checklist tab. Default tasks are just starting points.

**Q: Can I add more documents?**
A: Yes! Click "Add Document" in Documents tab to add custom document types.

**Q: What if employee hasn't joined yet?**
A: Status stays "Not Started" until HR sets it to "In Progress" when they join.

**Q: Can I skip tasks?**
A: Yes! Non-mandatory tasks can be skipped. Mandatory tasks must be completed for 100%.

**Q: How do I assign a buddy?**
A: Use the "Assign Buddy" button in the Buddy section (future enhancement).

---

## 🎉 Success!

You're all set! The onboarding workflow is now managing your employee onboarding process with:
- ✅ Automated initialization
- ✅ Progress tracking
- ✅ Document management
- ✅ IT asset tracking
- ✅ Training scheduling
- ✅ Real-time updates

**Happy Onboarding! 🚀**

---

*Last Updated: January 29, 2026*
