# Workforce Summary & Diversity & Inclusion - Integration Guide

## Overview

This document provides a complete integration guide for merging the **Workforce Summary** and **Diversity & Inclusion** pages into another developer's codebase. These pages are part of the HR Process mode and provide comprehensive employee analytics, diversity metrics, and workforce management capabilities.

---

## 📋 Table of Contents

1. [Pages Overview](#pages-overview)
2. [Frontend Files](#frontend-files)
3. [Backend Files](#backend-files)
4. [Database Collections](#database-collections)
5. [Dependencies](#dependencies)
6. [API Endpoints](#api-endpoints)
7. [Integration Steps](#integration-steps)
8. [Configuration](#configuration)
9. [Testing](#testing)

---

## 📊 Pages Overview

### 1. Workforce Summary Page
**Route:** `/hr/workforce-summary`

**Features:**
- Real-time workforce statistics (Total Headcount, Active Employees, New Hires, Exits, Attrition Rate)
- Date range filtering
- Export functionality (Excel, CSV, PDF)
- Employee directory with DataTable
- Column visibility toggle
- Sticky columns (Employee ID, Name)
- Search and advanced filtering (Department, Location, Grade, Employment Type)
- Experience calculations (Acuvate, Previous, Total)
- Employee profile navigation
- Stat card click-to-filter functionality

### 2. Diversity & Inclusion Page
**Route:** `/hr/diversity-inclusion`

**Features:**
- Diversity KPI cards (Total Employees, Gender Distribution, Women in Leadership)
- Gender distribution chart
- Department-wise diversity breakdown
- Date range and gender filtering
- Employee directory with diversity metrics
- Column visibility toggle
- Export functionality
- Age and tenure analytics
- Leadership diversity tracking

---

## 📁 Frontend Files

### Core Pages
```
src/pages/hr/
├── WorkforceSummary.tsx          (2124 lines) - Main workforce analytics page
└── DiversityInclusion.tsx        (1244 lines) - Diversity metrics and analytics
```

### Components
```
src/components/
├── ui/
│   ├── data-table.tsx            - Reusable DataTable component with pagination
│   ├── date-picker.tsx           - Date range picker
│   ├── employee-avatar.tsx       - Employee avatar component
│   ├── badge.tsx                 - Badge component
│   ├── button.tsx                - Button component
│   ├── card.tsx                  - Card component
│   ├── checkbox.tsx              - Checkbox component
│   ├── dropdown-menu.tsx         - Dropdown menu component
│   ├── input.tsx                 - Input component
│   ├── popover.tsx               - Popover component
│   ├── select.tsx                - Select component
│   └── ...other shadcn/ui components
│
└── modals/
    └── AddEditEmployeeModal.tsx  - Employee form (includes holidayPlan field)
```

### Services
```
src/services/
├── employeeService.ts            - Employee CRUD operations
└── api.ts                        - Base API client configuration
```

### Store
```
src/store/
└── employeeStore.ts              - Employee state management (Zustand)
```

### Types
```
src/types/
└── index.ts                      - TypeScript interfaces for Employee, User, etc.
```

### Routing
```
src/routes/
└── index.tsx                     - Route definitions
```

### Layout
```
src/layouts/
└── Sidebar.tsx                   - Navigation sidebar with HR menu items
```

---

## 🗄️ Backend Files

### Routes
```
server/src/routes/
├── employees.ts                  - Employee API routes
├── bulkUpload.ts                 - Bulk upload routes
└── index.ts                      - Route registration
```

### Models
```
server/src/models/
├── Employee.ts                   - Employee schema with holidayPlan field
└── User.ts                       - User authentication schema
```

### Services
```
server/src/services/
├── excelService.ts               - Excel template generation (includes holidayPlan)
└── bulkUploadService.ts          - Excel upload validation (includes holidayPlan)
```

### Middleware
```
server/src/middleware/
├── auth.ts                       - Authentication middleware
└── roleCheck.ts                  - Role-based access control
```

---

## 🗃️ Database Collections

### 1. `employees` Collection

**Schema Structure:**
```javascript
{
  // Basic Information
  employeeId: String (unique, required) // Auto-generated: ACUA/ACUC/ACUI/ACUM
  name: String (required)
  firstName: String
  middleName: String
  lastName: String
  email: String (unique, required)
  phone: String
  dialCode: String (default: '+1')
  gender: String // Male, Female, Other
  dateOfBirth: Date
  
  // Employment Details
  department: String (required)
  subDepartment: String
  businessUnit: String
  designation: String (required)
  secondaryJobTitle: String
  location: String (required)
  legalEntity: String
  workerType: String // Permanent, Full-Time, Part-Time, Contract, Intern, Management
  hireType: String // Permanent, Contract, Intern, Management
  dateOfJoining: Date (required)
  contractDuration: String
  contractEndDate: Date
  
  // Leave & Holiday Management **NEW FIELDS**
  leavePlan: String // Probation, Acuvate, Confirmation, Consultant, UK
  holidayPlan: String (required, default: 'India') // India, USA, UK, Remote
  
  // Contact Information
  workPhone: String
  residenceNumber: String
  personalEmail: String
  
  // Reporting Structure
  reportingManagerId: String
  dottedLineManagerId: String
  
  // Family & Personal
  maritalStatus: String // Single, Married, Divorced, Widowed
  marriageDate: Date
  fatherName: String
  motherName: String
  spouseName: String
  spouseGender: String
  physicallyHandicapped: String (default: 'No')
  bloodGroup: String // A+, A-, B+, B-, AB+, AB-, O+, O-
  nationality: String
  
  // Tax & Financial
  panNumber: String // PAN/SSN/NIN based on location
  fullNameAsPerPAN: String
  dobInPAN: Date
  parentsNameAsPerPAN: String
  panCardAvailable: String (default: 'No')
  
  // Bank Details
  salaryPaymentMode: String // Bank Transfer, Cash, Cheque
  bankName: String
  accountNumber: String
  ifscCode: String
  nameOnAccount: String
  branch: String
  
  // Experience (Auto-calculated)
  acuvateExp: Object { years: Number, months: Number }
  previousExperience: String // Format: "2.5" (years)
  totalExp: Object { years: Number, months: Number }
  
  // Profile
  profilePhoto: String // URL or base64
  status: String (default: 'active') // active, inactive
  role: String // EMPLOYEE, HR, MANAGER, SUPER_ADMIN, etc.
  
  // Diversity Analytics Fields
  age: Number (calculated)
  tenure: Number (calculated in years)
  isLeadership: Boolean // Based on role and designation
  
  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
```javascript
employeeId: unique
email: unique
department: 1
location: 1
status: 1
dateOfJoining: 1
holidayPlan: 1 // NEW INDEX
```

### 2. `users` Collection

**Schema Structure:**
```javascript
{
  employeeId: String (required, unique)
  email: String (required, unique)
  password: String (hashed)
  role: String // EMPLOYEE, HR, MANAGER, SUPER_ADMIN, IT_ADMIN, L1_APPROVER, L2_APPROVER, L3_APPROVER
  isActive: Boolean (default: true)
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 📦 Dependencies

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-table": "^8.x",
    "zustand": "^4.x",
    "axios": "^1.x",
    "date-fns": "^2.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",
    "sonner": "^1.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-popover": "^2.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-checkbox": "^1.x",
    "@radix-ui/react-dialog": "^1.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### Backend Dependencies (package.json)
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "exceljs": "^4.x",
    "multer": "^1.x",
    "date-fns": "^2.x"
  },
  "devDependencies": {
    "@types/express": "^4.x",
    "@types/node": "^20.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "nodemon": "^3.x"
  }
}
```

---

## 🔌 API Endpoints

### Employee Endpoints

#### 1. Get All Employees
```
GET /api/employees
Headers: Authorization: Bearer <token>
Response: Array of employee objects
```

#### 2. Get Employee by ID
```
GET /api/employees/:employeeId
Headers: Authorization: Bearer <token>
Response: Single employee object
```

#### 3. Create Employee
```
POST /api/employees
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body: {
  firstName: string (required)
  lastName: string (required)
  email: string (required)
  department: string (required)
  designation: string (required)
  location: string (required)
  dateOfJoining: string (required)
  leavePlan: string (required)
  holidayPlan: string (required) // NEW FIELD
  ... other fields
}
Response: Created employee object
```

#### 4. Update Employee
```
PUT /api/employees/:id
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body: Partial employee object
Response: Updated employee object
```

#### 5. Delete Employee
```
DELETE /api/employees/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message: string }
```

#### 6. Bulk Upload
```
POST /api/bulk-upload/upload
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body: FormData with Excel file
Response: {
  success: boolean
  summary: { total, successful, failed }
  results: Array
  errors: Array
}
```

#### 7. Download Excel Template
```
GET /api/bulk-upload/template
Headers: Authorization: Bearer <token>
Response: Excel file download (includes holidayPlan column)
```

---

## 🔧 Integration Steps

### Step 1: Database Setup

```bash
# Connect to MongoDB
mongosh

# Switch to database
use employee_connect

# Create indexes
db.employees.createIndex({ "employeeId": 1 }, { unique: true })
db.employees.createIndex({ "email": 1 }, { unique: true })
db.employees.createIndex({ "department": 1 })
db.employees.createIndex({ "location": 1 })
db.employees.createIndex({ "holidayPlan": 1 })
db.employees.createIndex({ "status": 1 })

db.users.createIndex({ "employeeId": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
```

### Step 2: Backend Integration

1. **Copy Backend Files:**
```bash
# Copy models
cp server/src/models/Employee.ts <target>/server/src/models/

# Copy routes
cp server/src/routes/employees.ts <target>/server/src/routes/
cp server/src/routes/bulkUpload.ts <target>/server/src/routes/

# Copy services
cp server/src/services/excelService.ts <target>/server/src/services/
cp server/src/services/bulkUploadService.ts <target>/server/src/services/

# Copy middleware
cp server/src/middleware/auth.ts <target>/server/src/middleware/
cp server/src/middleware/roleCheck.ts <target>/server/src/middleware/
```

2. **Update server/src/index.ts:**
```typescript
import employeeRoutes from './routes/employees';
import bulkUploadRoutes from './routes/bulkUpload';

// Register routes
app.use('/api/employees', employeeRoutes);
app.use('/api/bulk-upload', bulkUploadRoutes);
```

3. **Update .env file:**
```env
MONGODB_URI=mongodb://localhost:27017/employee_connect
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### Step 3: Frontend Integration

1. **Copy Frontend Files:**
```bash
# Copy pages
cp src/pages/hr/WorkforceSummary.tsx <target>/src/pages/hr/
cp src/pages/hr/DiversityInclusion.tsx <target>/src/pages/hr/

# Copy components
cp src/components/ui/data-table.tsx <target>/src/components/ui/
cp src/components/ui/employee-avatar.tsx <target>/src/components/ui/
cp src/components/modals/AddEditEmployeeModal.tsx <target>/src/components/modals/

# Copy services
cp src/services/employeeService.ts <target>/src/services/
cp src/services/api.ts <target>/src/services/

# Copy store
cp src/store/employeeStore.ts <target>/src/store/

# Copy types
cp src/types/index.ts <target>/src/types/
```

2. **Update Routes (src/routes/index.tsx):**
```typescript
import WorkforceSummary from '@/pages/hr/WorkforceSummary';
import DiversityInclusion from '@/pages/hr/DiversityInclusion';

// HR Routes (Protected - requires HR or SUPER_ADMIN role)
{
  path: '/hr/workforce-summary',
  element: (
    <ProtectedRoute requiredRoles={['HR', 'SUPER_ADMIN']}>
      <WorkforceSummary />
    </ProtectedRoute>
  ),
},
{
  path: '/hr/diversity-inclusion',
  element: (
    <ProtectedRoute requiredRoles={['HR', 'SUPER_ADMIN']}>
      <DiversityInclusion />
    </ProtectedRoute>
  ),
}
```

3. **Update Sidebar Navigation (src/layouts/Sidebar.tsx):**
```typescript
// HR Menu Items
{
  label: 'Workforce Summary',
  path: '/hr/workforce-summary',
  icon: <Users className="h-4 w-4" />,
  allowedRoles: ['HR', 'SUPER_ADMIN'],
},
{
  label: 'Diversity & Inclusion',
  path: '/hr/diversity-inclusion',
  icon: <UsersRound className="h-4 w-4" />,
  allowedRoles: ['HR', 'SUPER_ADMIN'],
}
```

### Step 4: Install Dependencies

```bash
# Frontend
cd <target>
npm install

# Backend
cd <target>/server
npm install exceljs date-fns
```

### Step 5: Update Employee Schema

If you have existing employees in the database, run this migration:

```javascript
// MongoDB migration script
db.employees.updateMany(
  { holidayPlan: { $exists: false } },
  { 
    $set: { 
      holidayPlan: 'India',
      leavePlan: 'Acuvate'
    } 
  }
)

// Verify
db.employees.find({ holidayPlan: { $exists: true } }).count()
```

---

## ⚙️ Configuration

### 1. API Base URL Configuration

**src/services/api.ts:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Environment Variables (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Role-Based Access Control

Ensure these roles are defined in your User model:
- `SUPER_ADMIN` - Full access
- `HR` - Access to HR Process mode
- `MANAGER` - Limited access
- `EMPLOYEE` - Basic access

### 3. Profile Context (Mode Switching)

Ensure ProfileContext supports these modes:
```typescript
HR_USER: {
  value: 'HR_USER',
  label: 'My Workplace',
  icon: '👁️',
}
HR_ADMIN: {
  value: 'HR_ADMIN',
  label: 'HR process',
  icon: '⚙️',
}
```

---

## 🧪 Testing

### 1. Backend Testing

```bash
# Test employee creation
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "department": "Engineering",
    "designation": "Software Engineer",
    "location": "India - Bangalore",
    "dateOfJoining": "2024-01-15",
    "leavePlan": "Acuvate",
    "holidayPlan": "India",
    "hireType": "Permanent",
    "workerType": "Full-Time",
    "businessUnit": "Technology"
  }'

# Test get all employees
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>"

# Test Excel template download
curl http://localhost:5000/api/bulk-upload/template \
  -H "Authorization: Bearer <token>" \
  -o template.xlsx
```

### 2. Frontend Testing

1. **Login as HR User:**
   - Email: `hr@company.com`
   - Role: `HR` or `SUPER_ADMIN`

2. **Switch to HR Process Mode:**
   - Click profile dropdown in header
   - Select "HR process" mode

3. **Test Workforce Summary:**
   - Navigate to `/hr/workforce-summary`
   - Verify stat cards display correctly
   - Test date range filtering
   - Test department/location filters
   - Test column toggle
   - Test search functionality
   - Test export (Excel/CSV/PDF)
   - Click stat cards to filter table

4. **Test Diversity & Inclusion:**
   - Navigate to `/hr/diversity-inclusion`
   - Verify diversity KPIs
   - Check gender distribution chart
   - Test department breakdown
   - Test gender and date filters
   - Test column visibility toggle
   - Verify Leadership metrics

5. **Test Employee Creation:**
   - Click "Add New Employee"
   - Fill all required fields
   - Verify Holiday Plan dropdown
   - Check location-based auto-selection
   - Submit and verify success

6. **Test Bulk Upload:**
   - Download Excel template
   - Verify Holiday Plan column exists
   - Fill sample data
   - Upload and check validation
   - Verify employees created with holidayPlan

---

## 📊 Data Migration (If Existing Database)

If you're integrating into an existing system with employee data:

```javascript
// Step 1: Add holidayPlan field to existing employees
db.employees.updateMany(
  {},
  [
    {
      $set: {
        holidayPlan: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$location", regex: "India" } }, then: "India" },
              { case: { $regexMatch: { input: "$location", regex: "USA" } }, then: "USA" },
              { case: { $regexMatch: { input: "$location", regex: "UK" } }, then: "UK" },
              { case: { $regexMatch: { input: "$location", regex: "Remote" } }, then: "Remote" }
            ],
            default: "India"
          }
        }
      }
    }
  ]
)

// Step 2: Set default leavePlan if missing
db.employees.updateMany(
  { leavePlan: { $exists: false } },
  { $set: { leavePlan: "Acuvate" } }
)

// Step 3: Calculate isLeadership field
db.employees.updateMany(
  {},
  [
    {
      $set: {
        isLeadership: {
          $or: [
            { $in: ["$role", ["MANAGER", "HR", "SUPER_ADMIN"]] },
            { $regexMatch: { input: "$designation", regex: "Manager|Director|VP|Head|Lead", options: "i" } }
          ]
        }
      }
    }
  ]
)

// Verify
db.employees.find({ holidayPlan: { $exists: true } }).limit(5).pretty()
```

---

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors:**
```typescript
// server/src/index.ts
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

2. **Authentication Issues:**
- Verify JWT token in localStorage
- Check token expiration
- Ensure Authorization header is sent

3. **Data Not Displaying:**
- Check API endpoint connection
- Verify MongoDB connection
- Check browser console for errors
- Verify employee data exists in DB

4. **Holiday Plan Not Showing:**
- Run migration script to add field
- Verify field exists in Employee schema
- Check column visibility toggle

---

## 📄 File Checklist

### Frontend Files to Copy:
- [ ] `src/pages/hr/WorkforceSummary.tsx`
- [ ] `src/pages/hr/DiversityInclusion.tsx`
- [ ] `src/components/ui/data-table.tsx`
- [ ] `src/components/ui/employee-avatar.tsx`
- [ ] `src/components/modals/AddEditEmployeeModal.tsx`
- [ ] `src/services/employeeService.ts`
- [ ] `src/store/employeeStore.ts`
- [ ] `src/types/index.ts`

### Backend Files to Copy:
- [ ] `server/src/models/Employee.ts`
- [ ] `server/src/routes/employees.ts`
- [ ] `server/src/routes/bulkUpload.ts`
- [ ] `server/src/services/excelService.ts`
- [ ] `server/src/services/bulkUploadService.ts`
- [ ] `server/src/middleware/auth.ts`

### Configuration Updates:
- [ ] Update routes in `src/routes/index.tsx`
- [ ] Update sidebar in `src/layouts/Sidebar.tsx`
- [ ] Register routes in `server/src/index.ts`
- [ ] Update `.env` files (frontend & backend)
- [ ] Install dependencies

### Database Tasks:
- [ ] Create indexes
- [ ] Run migration script (if existing data)
- [ ] Verify holidayPlan field

---

## 🚀 Deployment Checklist

### Pre-deployment:
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations complete
- [ ] Build succeeds without errors
- [ ] API endpoints accessible

### Production Configuration:
```env
# Frontend (.env.production)
VITE_API_URL=https://api.yourcompany.com/api

# Backend (.env.production)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/employee_connect
JWT_SECRET=<secure_production_secret>
NODE_ENV=production
PORT=5000
```

---

## 📞 Support & References

### Key Features Summary:
- ✅ Workforce Summary with real-time stats
- ✅ Diversity & Inclusion analytics
- ✅ Holiday Plan management (location-based)
- ✅ DataTable with column toggle
- ✅ Export functionality (Excel/CSV/PDF)
- ✅ Advanced filtering and search
- ✅ Bulk upload with validation
- ✅ Role-based access control

### Related Documentation:
- `BULK_UPLOAD_IMPLEMENTATION.md` - Bulk upload details
- `PROFILE_FIELDS_IMPLEMENTATION_SUMMARY.md` - Employee form fields
- `DESIGN_SYSTEM.md` - UI component guidelines
- `HR_ADMIN_PERMISSION_FIX.md` - Permission structure

---

## ✅ Post-Integration Verification

Run this checklist after integration:

```bash
# 1. Backend health check
curl http://localhost:5000/api/health

# 2. Employee count
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>" | jq 'length'

# 3. Database verification
mongosh --eval "use employee_connect; db.employees.countDocuments()"

# 4. Frontend build
npm run build

# 5. Check for console errors
# Open browser DevTools > Console
# Navigate to /hr/workforce-summary
# Navigate to /hr/diversity-inclusion
```

---

## 📝 Notes

1. **Holiday Plan Field:** This is a NEW field added on February 25, 2026. Ensure all existing employees get this field populated via migration script.

2. **Leave Plan Field:** Already existed but ensure it's present in all employee records.

3. **Data Table Component:** The DataTable component is reusable and used across multiple pages. Keep it generic.

4. **Column Toggle:** Automatically includes all columns except sticky columns (Employee ID, Name).

5. **Export Feature:** Requires proper CORS configuration for file downloads.

6. **Role Permissions:** Only HR and SUPER_ADMIN roles should access these pages.

---

**Integration Date:** February 25, 2026  
**Version:** 1.0  
**Status:** Ready for Merge  
**Compatibility:** MongoDB 6.x+, Node.js 18.x+, React 18.x+
