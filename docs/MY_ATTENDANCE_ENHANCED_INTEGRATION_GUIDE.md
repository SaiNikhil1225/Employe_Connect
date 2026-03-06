# My Attendance Enhanced - Integration Guide

## Overview
This document provides a comprehensive guide for integrating the **My Attendance Enhanced** page (`/employee/my-attendance-enhanced`) into another codebase. This page is a full-featured employee attendance management system with KPI tracking, clock-in/out functionality, WFH requests, regularization requests, and attendance logs.

---

## Frontend Files to Share

### 📄 Main Page
```
src/pages/employee/MyAttendanceEnhanced.tsx
```

### 🎨 Attendance Components
```
src/components/attendance/KPICard.tsx
src/components/attendance/WebClockInModal.tsx
src/components/attendance/WFHRequestDrawer.tsx
src/components/attendance/RegularizationDrawer.tsx
```

### 🧩 UI Components (Required Dependencies)
```
src/components/ui/right-drawer.tsx
src/components/ui/card.tsx
src/components/ui/button.tsx
src/components/ui/select.tsx
src/components/ui/tabs.tsx
src/components/ui/badge.tsx
src/components/ui/data-table.tsx
src/components/ui/label.tsx
src/components/ui/input.tsx
src/components/ui/textarea.tsx
src/components/ui/calendar.tsx
src/components/ui/popover.tsx
src/components/ui/alert.tsx
src/components/ui/scroll-area.tsx
src/components/ui/employee-avatar.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/checkbox.tsx
```

### 🗄️ State Management (Zustand Stores)
```
src/store/attendanceStore.ts
src/store/authStore.ts
src/store/employeeStore.ts
```

### 📡 Services
```
src/services/api.ts             # API client instance
```

### 📋 Types
```
src/types/attendance.ts          # Attendance-related TypeScript interfaces
src/types/employee.ts            # Employee-related TypeScript interfaces (if exists)
```

### 🛠️ Utilities
```
src/lib/utils.ts                 # Contains cn() utility for className merge
src/lib/ipUtils.ts               # IP address utilities for clock-in/out
```

---

## Backend Files to Share

### 🗂️ Models (MongoDB/Mongoose)
```
server/src/models/AttendanceLog.ts
server/src/models/WFHRequest.ts
server/src/models/RegularizationRequest.ts
server/src/models/Employee.ts
server/src/models/Attendance.ts
server/src/models/AttendancePolicy.ts
```

### 🚦 Routes
```
server/src/routes/attendance.ts
```

### 🔐 Middleware (if applicable)
```
server/src/middleware/validation.ts      # Attendance validation middleware
server/src/middleware/auth.ts            # Authentication middleware
```

---

## Database Collections

### 1. **attendancelogs** Collection

**Purpose**: Stores daily attendance records for employees

**Schema**:
```typescript
{
  employeeId: String,              // Required, Indexed
  employeeName: String,            // Required
  department: String,              // Required
  date: Date,                      // Required, Indexed
  checkInTime: Date,               // Optional (null if not checked in)
  checkOutTime: Date,              // Optional (null if not checked out)
  breakDuration: Number,           // Minutes (default: 0)
  effectiveHours: Number,          // Hours (default: 0)
  grossHours: Number,              // Hours (default: 0)
  status: String,                  // Enum: ['present', 'absent', 'wfh', 'leave', 'weekly-off', 'late', 'half-day']
  isLate: Boolean,                 // Default: false
  isEarlyLogout: Boolean,          // Default: false
  lateMinutes: Number,             // Default: 0
  hasTimeEntry: Boolean,           // Default: false
  workLocation: String,            // Enum: ['office', 'wfh', 'hybrid']
  regularizationStatus: String,    // Enum: ['none', 'pending', 'approved', 'rejected']
  regularizationRequestId: ObjectId,  // Reference to RegularizationRequest
  remarks: String,                 // Optional
  ipAddress: String,               // IP address of clock-in/out
  shift: String,                   // Enum: ['General', 'USA', 'UK', 'MiddleEast']
  shiftTiming: String,             // e.g., "9:00 AM - 6:00 PM"
  approvedBy: String,              // Optional
  createdBy: String,               // Optional
  updatedBy: String,               // Optional
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

**Indexes**:
- `employeeId` (ascending)
- `date` (ascending)
- `{ employeeId: 1, date: -1 }` (compound)

---

### 2. **wfhrequests** Collection

**Purpose**: Stores Work From Home (WFH) requests submitted by employees

**Schema**:
```typescript
{
  employeeId: String,              // Required, Indexed
  employeeName: String,            // Required
  department: String,              // Required
  fromDate: Date,                  // Required, Indexed
  toDate: Date,                    // Required, Indexed
  reason: String,                  // Required (min: 10, max: 500 chars)
  status: String,                  // Enum: ['pending', 'approved', 'rejected'], Default: 'pending'
  approvedBy: String,              // Optional
  approvedAt: Date,                // Optional
  rejectedBy: String,              // Optional
  rejectedAt: Date,                // Optional
  rejectionReason: String,         // Optional
  reportingManagerId: String,      // Optional
  reportingManagerName: String,    // Optional
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

**Indexes**:
- `{ employeeId: 1, status: 1 }`
- `{ status: 1, fromDate: -1 }`
- `{ department: 1, fromDate: -1 }`
- `{ reportingManagerId: 1, status: 1 }`

---

### 3. **regularizationrequests** Collection

**Purpose**: Stores attendance regularization requests (late arrival, early departure, missing punch, etc.)

**Schema**:
```typescript
{
  employeeId: String,              // Required, Indexed
  employeeName: String,            // Required
  department: String,              // Required
  date: Date,                      // Required, Indexed
  requestType: String,             // Enum: ['late-arrival', 'early-departure', 'missing-punch', 'wfh-conversion', 'general-regularization']
  reason: String,                  // Required (min: 10, max: 500 chars)
  proposedCheckIn: Date,           // Optional
  proposedCheckOut: Date,          // Optional
  originalCheckIn: Date,           // Optional
  originalCheckOut: Date,          // Optional
  status: String,                  // Enum: ['pending', 'approved', 'rejected'], Default: 'pending'
  approvedBy: String,              // Optional
  approvedAt: Date,                // Optional
  rejectedBy: String,              // Optional
  rejectedAt: Date,                // Optional
  rejectionReason: String,         // Optional
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

**Indexes**:
- `{ employeeId: 1, status: 1 }`
- `{ status: 1, createdAt: -1 }`
- `{ department: 1, status: 1 }`

---

### 4. **employees** Collection

**Purpose**: Stores employee master data

**Required Fields** (for attendance integration):
```typescript
{
  employeeId: String,              // Required, Unique
  name: String,                    // Required
  email: String,                   // Required, Unique
  department: String,              // Required
  designation: String,             // Optional
  role: String,                    // Enum: ['EMPLOYEE', 'MANAGER', 'HR', 'RMG', 'IT_ADMIN', etc.]
  reportingManagerId: String,      // Optional
  reportingManagerName: String,    // Optional
  isActive: Boolean,               // Default: true
  avatarUrl: String,               // Optional (for employee avatar display)
  phone: String,                   // Optional
}
```

---

## API Endpoints Required

### Employee Attendance APIs

#### 1. **GET /attendance/stats**
- **Description**: Fetch attendance KPIs for an employee
- **Query Params**: 
  - `employeeId` (optional - defaults to current user)
  - `includeTeam` (optional - boolean)
- **Response**:
```typescript
{
  success: boolean;
  data: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    wfhDays: number;
    totalHours: number;
    avgCheckInTime: string;
    avgCheckOutTime: string;
    avgWorkingHours: number;
  }
}
```

#### 2. **GET /attendance/logs**
- **Description**: Fetch attendance logs for an employee
- **Query Params**:
  - `employeeId` (optional - defaults to current user)
  - `startDate` (optional)
  - `endDate` (optional)
  - `status` (optional)
- **Response**:
```typescript
{
  success: boolean;
  data: AttendanceLog[];
}
```

#### 3. **POST /attendance/clock-in**
- **Description**: Clock in for the day
- **Body**:
```typescript
{
  ipAddress: string;
}
```
- **Response**:
```typescript
{
  success: boolean;
  data: AttendanceLog;
  message: string;
}
```

#### 4. **POST /attendance/clock-out**
- **Description**: Clock out for the day
- **Body**:
```typescript
{
  ipAddress: string;
}
```
- **Response**:
```typescript
{
  success: boolean;
  data: AttendanceLog;
  message: string;
  stats: {
    totalHours: string;
    effectiveHours: string;
  }
}
```

#### 5. **GET /attendance/regularization-requests**
- **Description**: Fetch regularization requests
- **Query Params**:
  - `employeeId` (optional)
  - `status` (optional)
  - `startDate` (optional)
  - `endDate` (optional)
- **Response**:
```typescript
{
  success: boolean;
  data: RegularizationRequest[];
}
```

#### 6. **POST /attendance/regularize**
- **Description**: Submit a regularization request
- **Body**:
```typescript
{
  date: string;
  requestType: 'late-arrival' | 'early-departure' | 'missing-punch' | 'wfh-conversion' | 'general-regularization';
  reason: string;
  proposedCheckIn?: string;
  proposedCheckOut?: string;
}
```
- **Response**:
```typescript
{
  success: boolean;
  data: RegularizationRequest;
  message: string;
}
```

#### 7. **GET /attendance/wfh-requests**
- **Description**: Fetch WFH requests
- **Query Params**:
  - `employeeId` (optional)
  - `status` (optional)
  - `startDate` (optional)
  - `endDate` (optional)
- **Response**:
```typescript
{
  success: boolean;
  data: WFHRequest[];
}
```

#### 8. **POST /attendance/wfh-request**
- **Description**: Submit a WFH request
- **Body**:
```typescript
{
  fromDate: string;
  toDate: string;
  reason: string;
  notifyEmployees?: string[];  // Array of employee IDs to notify
}
```
- **Response**:
```typescript
{
  success: boolean;
  data: WFHRequest;
  message: string;
}
```

#### 9. **GET /attendance/timings/:employeeId/:date**
- **Description**: Get daily timings for a specific date
- **Response**:
```typescript
{
  success: boolean;
  data: {
    checkIn: string;
    checkOut: string;
    breaks: Array<{start: string, end: string}>;
    totalHours: number;
  }
}
```

#### 10. **GET /attendance/policy**
- **Description**: Get attendance policy settings
- **Response**:
```typescript
{
  success: boolean;
  data: {
    workingHoursPerDay: number;
    lateThresholdMinutes: number;
    earlyDepartureThresholdMinutes: number;
    shifts: Array<{name: string, timing: string}>;
  }
}
```

---

## Package Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "zustand": "^5.0.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "date-fns": "^4.1.0",
    "lucide-react": "latest",
    "sonner": "^1.7.1",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "vite": "^7.2.2",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
```

---

## Setup and Integration Instructions

### Frontend Integration

#### Step 1: Copy Files
1. Copy all files from the **Frontend Files to Share** section to your project
2. Maintain the same directory structure to avoid import path issues

#### Step 2: Update Import Paths
If your project structure differs, update the following:
- Path aliases in `tsconfig.json` (ensure `@/` maps to `src/`)
- Update component imports if you use a different component library structure

#### Step 3: Configure Zustand Stores
```typescript
// Ensure these stores are initialized in your app
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
```

#### Step 4: Add Route
```typescript
// In your router configuration (e.g., React Router)
import MyAttendanceEnhanced from '@/pages/employee/MyAttendanceEnhanced';

{
  path: '/employee/my-attendance-enhanced',
  element: <MyAttendanceEnhanced />
}
```

#### Step 5: API Client Configuration
Ensure your `src/services/api.ts` is configured:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Step 6: Tailwind Configuration
Ensure Tailwind is configured with the required utilities:
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other colors
      },
    },
  },
  plugins: [],
}
```

---

### Backend Integration

#### Step 1: Copy Models and Routes
1. Copy all files from **Backend Files to Share** to your backend project
2. Maintain the directory structure (`models/`, `routes/`, `middleware/`)

#### Step 2: Database Connection
Ensure MongoDB connection is established:
```typescript
// server/src/index.ts or app.ts
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emp_connect')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
```

#### Step 3: Register Routes
```typescript
// server/src/app.ts
import attendanceRoutes from './routes/attendance';

app.use('/api/attendance', attendanceRoutes);
```

#### Step 4: Create Indexes
Run the following in MongoDB shell or via a migration script:
```javascript
// For AttendanceLogs collection
db.attendancelogs.createIndex({ employeeId: 1 });
db.attendancelogs.createIndex({ date: 1 });
db.attendancelogs.createIndex({ employeeId: 1, date: -1 });

// For WFHRequests collection
db.wfhrequests.createIndex({ employeeId: 1, status: 1 });
db.wfhrequests.createIndex({ status: 1, fromDate: -1 });

// For RegularizationRequests collection
db.regularizationrequests.createIndex({ employeeId: 1, status: 1 });
db.regularizationrequests.createIndex({ status: 1, createdAt: -1 });
```

#### Step 5: Seed Sample Data (Optional)
Use the following script to create sample attendance records for testing:
```javascript
// scripts/seed-attendance.js
const mongoose = require('mongoose');
const AttendanceLog = require('./server/src/models/AttendanceLog');

// Add sample attendance logs for testing
// See attached seed script for full implementation
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/emp_connect
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

---

## Features Included

### ✅ Implemented Features

1. **KPI Dashboard**
   - Present Days, Absent Days, Late Days, WFH Days
   - Total Hours Worked, Average Check-in/Check-out Time
   - Real-time statistics with date range filters

2. **Clock In/Out**
   - Web-based clock in with IP address capture
   - Running timer display (updates every second)
   - Check-out with automatic hours calculation

3. **Attendance Logs Table**
   - Sortable columns (Date, Check-in, Check-out, Gross Hours, Status)
   - Sticky Actions column (always visible on right)
   - Date range filtering (This Week, This Month, Last 3/6 Months, Last Year)
   - Status badges with color coding

4. **Work From Home (WFH) Requests**
   - Date range selection with calendar picker
   - Reason input with character limit
   - Notify employees feature (dropdown + badge chips pattern)
   - Request status tracking

5. **Regularization Requests**
   - Multiple request types (Late arrival, Early departure, Missing punch, etc.)
   - Proposed timing updates
   - Reason submission with validation

6. **Enhanced UI/UX**
   - Tabbed interface (Attendance Logs, WFH Requests, Regularization)
   - Right drawers for forms (WFH, Regularization)
   - Modal for clock-in with IP display
   - Responsive design with Tailwind CSS
   - Card-based layout with proper spacing

---

## Testing Checklist

### Frontend Testing
- [ ] Page loads without errors at `/employee/my-attendance-enhanced`
- [ ] KPI cards display correct statistics
- [ ] Clock-in modal shows IP address correctly
- [ ] Running timer updates every second after clock-in
- [ ] Attendance logs table displays records with correct sorting
- [ ] Actions column remains sticky on horizontal scroll
- [ ] Date range filter updates data correctly
- [ ] WFH drawer opens and closes properly
- [ ] WFH notify field allows selecting multiple employees
- [ ] Regularization drawer submits requests successfully
- [ ] Tabs switch between Logs, WFH, and Regularization

### Backend Testing
- [ ] GET /attendance/stats returns correct KPIs
- [ ] GET /attendance/logs returns filtered records
- [ ] POST /attendance/clock-in creates attendance record
- [ ] POST /attendance/clock-out updates record and calculates hours
- [ ] POST /attendance/wfh-request creates WFH request
- [ ] POST /attendance/regularize creates regularization request
- [ ] All API endpoints return proper error messages for invalid requests

### Database Testing
- [ ] AttendanceLogs collection stores records correctly
- [ ] WFHRequests collection tracks request status
- [ ] RegularizationRequests collection handles different request types
- [ ] Indexes are created for performance optimization

---

## Known Issues and Limitations

1. **IP Address Detection**: Requires client-side IP detection utility (`ipUtils.ts`). May need configuration for proxy/VPN environments.

2. **Time Zone Handling**: Dates are stored in UTC. Ensure proper conversion for display based on user's timezone.

3. **File Uploads**: WFH attachment upload is defined but may need backend implementation for file storage (e.g., AWS S3, local storage).

4. **Notifications**: The notify employees feature stores IDs but doesn't send actual notifications. Implement email/push notification service as needed.

5. **Approval Workflow**: The page shows pending requests but approval UI is separate (typically for managers). Ensure approval routes are implemented.

---

## Support and Contact

For questions or issues during integration, please contact:
- **Developer**: Praveen Uppala
- **Project**: Keka Replica - Emp Connect
- **Date Created**: March 4, 2026

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Mar 4, 2026 | Initial integration guide created |

---

**End of Integration Guide**
