# 🔐 Hiring Module - Login Credentials

## Dedicated Users for Hiring Module Testing

Run the seeding script first:
```bash
cd server
npx ts-node src/seedHiringUsers.ts
```

---

## 👔 HIRING MANAGERS
*Can create, edit, submit, and track their own hiring requests*

### 1. Engineering Manager
- **Name:** Alex Martinez
- **Email:** `hiring.manager@company.com`
- **Password:** `HiringManager@123`
- **Role:** MANAGER
- **Department:** Engineering
- **Employee ID:** HM001
- **Access:**
  - Create new hiring requests
  - Save as draft or submit to HR
  - Edit/delete draft requests
  - Track status of submitted requests
  - View "My Hiring Requests" dashboard

### 2. Marketing Manager  
- **Name:** Rachel Thompson
- **Email:** `hiring.manager2@company.com`
- **Password:** `HiringManager@123`
- **Role:** MANAGER
- **Department:** Marketing
- **Employee ID:** HM002
- **Access:** Same as above

### 3. Sales Manager
- **Name:** Daniel Kim
- **Email:** `hiring.manager3@company.com`
- **Password:** `HiringManager@123`
- **Role:** MANAGER
- **Department:** Sales
- **Employee ID:** HM003
- **Access:** Same as above

---

## 👥 HR TEAM
*Can view, manage, and close all hiring requests across the organization*

### 4. HR Recruiter
- **Name:** Jessica Williams
- **Email:** `hr.recruiter@company.com`
- **Password:** `HRRecruiter@123`
- **Role:** HR
- **Department:** Human Resources
- **Employee ID:** HR002
- **Access:**
  - View all hiring requests dashboard
  - View statistics (total, submitted, open, in-progress, closed)
  - Filter and search all requests
  - Update request status (Submitted → Open → In Progress)
  - Assign recruiters to requests
  - Close requests (mark as Filled or Cancelled)
  - Add closure details (hire date, filled by, notes)

### 5. Talent Acquisition Manager
- **Name:** Kevin Brown
- **Email:** `hr.talent@company.com`
- **Password:** `HRTalent@123`
- **Role:** HR
- **Department:** Human Resources
- **Employee ID:** HR003
- **Access:** Same as above

---

## 🔄 Complete Testing Workflow

### Step 1: Create Request (as Hiring Manager)
1. Login with `hiring.manager@company.com` / `HiringManager@123`
2. Click "My Hiring Requests" in sidebar
3. Click "New Request" button
4. Fill out the form:
   - Job Title: "Senior Frontend Developer"
   - Employment Type: Full-Time
   - Hiring Type: New Position
   - Department: Engineering
   - Budget Range: $80,000 - $120,000
   - Work Location: Hybrid
   - Required Skills, Justification, etc.
5. Choose action:
   - **"Save as Draft"** - Keep for later editing
   - **"Submit to HR"** - Send for HR review

### Step 2: Review & Manage (as HR)
1. Logout and login with `hr.recruiter@company.com` / `HRRecruiter@123`
2. Click "Hiring Requests" in sidebar
3. View statistics dashboard showing:
   - Total requests
   - Submitted (pending action)
   - Open (active recruiting)
   - In Progress (interviews)
   - Closed (completed)
4. Click on the submitted request
5. Take actions:
   - **Update Status** → Change to "Open" (start recruiting)
   - **Assign Recruiter** → Assign to yourself or team member
   - **Update Status** → Change to "In Progress" (interviews ongoing)
   - **Close Request** → Mark as "Position Filled"
     - Enter filled by name
     - Enter actual start date
     - Add closure notes

### Step 3: Verify Activity Log
1. On the request details page, scroll down to "Activity Timeline"
2. See all actions logged:
   - Request created by hiring manager
   - Submitted to HR
   - Status changes
   - Recruiter assignment
   - Request closure

---

## 📊 Menu Items by Role

### MANAGER Role Menu:
- Dashboard
- **My Hiring Requests** ← Hiring Module
- My Team
- Approvals (if also L1/L2/L3 approver)
- Profile
- Settings

### HR Role Menu:
- Dashboard
- **Hiring Requests** ← Hiring Module
- All Employees
- Onboarding
- Leave Management
- Performance
- Payroll
- Profile
- Settings

---

## 🚀 Quick Start Commands

```bash
# 1. Start MongoDB
start-mongodb.bat

# 2. Seed hiring users (run once)
cd server
npx ts-node src/seedHiringUsers.ts

# 3. Start backend server
npm run dev

# 4. Start frontend (new terminal)
cd ..
npm run dev

# 5. Open browser
http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] All 5 users created successfully
- [ ] Can login as hiring manager (hiring.manager@company.com)
- [ ] "My Hiring Requests" menu item visible
- [ ] Can create and submit hiring request
- [ ] Can login as HR (hr.recruiter@company.com)
- [ ] "Hiring Requests" menu item visible
- [ ] Can see statistics dashboard
- [ ] Can view submitted request
- [ ] Can update status and close request
- [ ] Activity timeline shows all actions

---

## 🔒 Security Notes

- All passwords are hashed using bcrypt with 10 salt rounds
- Passwords are not stored in plain text in the database
- Authentication uses JWT tokens with 7-day expiration
- Login requires both email AND password match
- Account must have `hasLoginAccess: true` and `isActive: true`

---

## 📝 Need More Users?

To add more hiring managers or HR users, edit the `hiringUsers` array in:
```
server/src/seedHiringUsers.ts
```

Then run the seed script again. Existing users will be skipped automatically.
