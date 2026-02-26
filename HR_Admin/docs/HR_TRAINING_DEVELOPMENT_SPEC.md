# Training & Development Module - Complete Specification

## 📋 Overview

The **Training & Development Module** is a comprehensive learning management system for HR to plan, schedule, track, and analyze employee training programs. It includes enrollment management, skill gap analysis, certification tracking, and training effectiveness analytics.

---

## 🎯 Features

### Core Functionality
- **Training Program Management**: Create and manage training sessions
- **Enrollment System**: Employee self-enrollment and HR assignment
- **Skill Gap Analysis**: Identify training needs based on employee skills
- **Certification Tracking**: Track certifications earned with validity periods
- **Training Calendar**: Visual scheduling and conflict detection
- **Attendance Tracking**: Monitor actual attendance vs. registrations
- **Training Effectiveness**: Post-training assessments and feedback
- **Budget Management**: Track training costs and ROI
- **Multi-mode Support**: Online, Offline, and Hybrid training
- **Prerequisite Management**: Define training prerequisites
- **Waiting List**: Manage capacity and waitlist automatically

### Advanced Features
- Training completion certificates generation
- Skill-based training recommendations
- Department-wise training analytics
- Training completion reports
- Budget vs. actual cost analysis
- Trainer performance tracking
- Training material management
- Automated reminder notifications
- Training effectiveness surveys

---

## 🗄️ Database Collections

### 1. Training Collection
**Model File**: `server/src/models/Training.ts`

```typescript
{
  trainingId: String,                 // Auto-generated: TRN-00001
  trainingName: String,               // Training title
  trainingCategory: String,           // Enum: Technical, Soft Skills, Leadership, 
                                      // Compliance, Safety, Product Knowledge, 
                                      // Sales & Marketing, Finance & Accounting,
                                      // HR & Administration, Customer Service,
                                      // Project Management, Quality Management, Other
  description: String,                // Detailed description
  
  trainerName: String,                // Trainer/instructor name
  trainerOrganization: String,        // External vendor/internal
  trainerEmail: String,               // Contact email
  trainerPhone: String,               // Contact phone
  
  trainingMode: String,               // Enum: Online, Offline, Hybrid
  location: String,                   // Physical location (for offline/hybrid)
  virtualMeetingLink: String,         // Zoom/Teams link (for online/hybrid)
  
  startDate: Date,                    // Training start date
  endDate: Date,                      // Training end date
  durationHours: Number,              // Total duration in hours
  
  schedule: [{                        // Daily schedule
    day: String,                      // Day number or date
    startTime: String,                // Session start time
    endTime: String,                  // Session end time
    topics: [String]                  // Topics covered
  }],
  
  maxParticipants: Number,            // Maximum seats
  currentEnrollments: Number,         // Current enrolled count (default: 0)
  minParticipants: Number,            // Minimum required to run
  
  targetAudience: {
    departments: [String],            // Target departments
    designations: [String],           // Target roles
    grades: [String],                 // Target grades
    employmentTypes: [String],        // Permanent, Contract, Intern
    locations: [String]               // Target locations
  },
  
  prerequisites: [String],            // Required skills/training
  preAssessment: {                   // Pre-training assessment
    required: Boolean,
    link: String,
    passingScore: Number
  },
  
  costPerEmployee: Number,            // Cost per participant (default: 0)
  totalBudget: Number,                // Total allocated budget (default: 0)
  actualCost: Number,                 // Actual cost incurred (default: 0)
  
  certificationAvailable: Boolean,    // Certificate provided
  certificationName: String,          // Certificate title
  certificationValidityMonths: Number,// Validity period
  certificationBody: String,          // Issuing organization
  
  trainingMaterials: [{              // Learning resources
    name: String,
    url: String,
    type: String,                     // pdf, video, document, link, etc.
    size: Number,                     // File size in bytes
    uploadedAt: Date
  }],
  
  skillsToBeAcquired: [String],      // Skills covered
  learningObjectives: [String],       // Learning outcomes
  
  status: String,                     // Enum: Planned, Open, Full, Ongoing, 
                                      // Completed, Cancelled (default: Planned)
  
  postTrainingAssessment: {          // Post-training evaluation
    required: Boolean,
    link: String,
    passingScore: Number
  },
  
  feedbackFormLink: String,           // Feedback survey link
  
  isPublished: Boolean,               // Visible to employees (default: false)
  isMandatory: Boolean,               // Mandatory training (default: false)
  
  createdBy: String,                  // HR admin who created
  updatedBy: String,                  // Last updated by
  
  createdAt: Date,                    // Auto-timestamp
  updatedAt: Date                     // Auto-timestamp
}
```

**Indexes**:
```typescript
trainingId: unique
startDate: 1
status: 1
trainingCategory: 1
isPublished: 1
```

### 2. TrainingEnrollment Collection
**Model File**: `server/src/models/TrainingEnrollment.ts`

```typescript
{
  enrollmentId: String,               // Auto-generated: ENR-00001
  trainingId: String,                 // Reference to Training
  employeeId: String,                 // Reference to Employee
  employeeName: String,               // Denormalized
  department: String,                 // Employee department
  designation: String,                // Employee designation
  email: String,                      // Employee email
  phone: String,                      // Employee phone
  
  enrollmentType: String,             // Enum: self-enrolled, hr-assigned, 
                                      // manager-nominated, auto-enrolled
  enrolledBy: String,                 // Who enrolled (self/HR/manager ID)
  enrolledAt: Date,                   // Enrollment timestamp
  
  status: String,                     // Enum: enrolled, waitlisted, confirmed, 
                                      // attended, completed, cancelled, 
                                      // no-show (default: enrolled)
  
  preAssessment: {
    completed: Boolean,
    score: Number,
    completedAt: Date,
    passed: Boolean
  },
  
  attendance: [{                      // Daily attendance
    date: Date,
    status: String,                   // present, absent, late
    checkInTime: String,
    checkOutTime: String,
    hoursAttended: Number
  }],
  totalAttendancePercentage: Number,  // Overall attendance %
  
  postAssessment: {
    completed: Boolean,
    score: Number,
    completedAt: Date,
    passed: Boolean
  },
  
  feedback: {
    rating: Number,                   // 1-5 stars
    comments: String,
    trainerRating: Number,
    contentRating: Number,
    deliveryRating: Number,
    submittedAt: Date
  },
  
  certificateIssued: Boolean,         // Certificate generated
  certificateNumber: String,          // Unique certificate ID
  certificateIssuedDate: Date,
  certificateExpiryDate: Date,
  certificateUrl: String,             // Download link
  
  skillsAcquired: [String],          // Skills gained
  completionStatus: String,           // not-started, in-progress, completed, failed
  completionDate: Date,
  
  cancellationReason: String,         // If cancelled
  cancelledBy: String,
  cancelledAt: Date,
  
  waitlistPosition: Number,           // If waitlisted
  waitlistNotified: Boolean,          // Seat available notification sent
  
  notes: String,                      // HR notes
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```typescript
enrollmentId: unique
trainingId: 1
employeeId: 1
status: 1
{ trainingId: 1, employeeId: 1 }: unique (prevent duplicate enrollments)
```

### 3. SkillGap Collection
**Model File**: `server/src/models/SkillGap.ts`

```typescript
{
  employeeId: String,                 // Reference to Employee
  employeeName: String,
  department: String,
  designation: String,
  
  currentSkills: [{                   // Employee's current skills
    skillName: String,
    proficiencyLevel: String,         // Beginner, Intermediate, Advanced, Expert
    yearsOfExperience: Number,
    lastAssessedDate: Date,
    certifications: [String]
  }],
  
  requiredSkills: [{                  // Skills needed for role
    skillName: String,
    requiredLevel: String,
    priority: String,                 // High, Medium, Low
    source: String                    // Job description, Career path, Manager feedback
  }],
  
  skillGaps: [{                       // Identified gaps
    skillName: String,
    currentLevel: String,
    requiredLevel: String,
    gapSeverity: String,              // Critical, High, Medium, Low
    recommendedTrainings: [String],   // Training IDs
    estimatedTimeToAcquire: Number,   // Hours
    businessImpact: String
  }],
  
  developmentPlan: [{                 // Learning path
    skillName: String,
    targetLevel: String,
    trainingIds: [String],
    targetDate: Date,
    status: String,                   // planned, in-progress, completed
    progress: Number                  // 0-100%
  }],
  
  assessmentDate: Date,
  assessedBy: String,                 // Manager/HR ID
  nextReviewDate: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Base URL: `/api/training`

#### 1. Get All Trainings
```http
GET /api/training
```

**Query Parameters**:
- `status`: Filter by status (Planned, Open, Ongoing, Completed, Cancelled)
- `category`: Filter by category
- `mode`: Filter by training mode (Online, Offline, Hybrid)
- `department`: Filter by target department
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `isPublished`: Show only published trainings
- `isMandatory`: Show only mandatory trainings
- `search`: Search by name or description

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f3a...",
      "trainingId": "TRN-00001",
      "trainingName": "Advanced React Development",
      "trainingCategory": "Technical",
      "trainingMode": "Online",
      "startDate": "2026-04-01",
      "endDate": "2026-04-05",
      "currentEnrollments": 28,
      "maxParticipants": 30,
      "status": "Open",
      ...
    }
  ]
}
```

#### 2. Get Training by ID
```http
GET /api/training/:id
```

#### 3. Create Training
```http
POST /api/training
```

**Request Body**:
```json
{
  "trainingName": "Leadership Development Program",
  "trainingCategory": "Leadership",
  "description": "Comprehensive leadership training for managers",
  "trainerName": "John Smith",
  "trainerOrganization": "External Vendor",
  "trainingMode": "Hybrid",
  "location": "Conference Room A",
  "virtualMeetingLink": "https://zoom.us/j/123456",
  "startDate": "2026-05-10",
  "endDate": "2026-05-12",
  "durationHours": 24,
  "maxParticipants": 25,
  "targetAudience": {
    "departments": ["Engineering", "Product"],
    "designations": ["Manager", "Senior Manager"],
    "grades": ["M1", "M2"]
  },
  "costPerEmployee": 15000,
  "totalBudget": 375000,
  "certificationAvailable": true,
  "certificationName": "Certified Leadership Professional",
  "skillsToBeAcquired": ["Team Management", "Strategic Thinking", "Decision Making"],
  "isPublished": true,
  "createdBy": "HR001"
}
```

#### 4. Update Training
```http
PUT /api/training/:id
```

#### 5. Delete Training
```http
DELETE /api/training/:id
```

#### 6. Publish/Unpublish Training
```http
PATCH /api/training/:id/publish
```

**Request Body**:
```json
{
  "isPublished": true
}
```

#### 7. Get Enrollments for Training
```http
GET /api/training/:trainingId/enrollments
```

**Response**:
```json
{
  "success": true,
  "data": {
    "training": { /* training details */ },
    "enrollments": [
      {
        "enrollmentId": "ENR-00001",
        "employeeId": "EMP001",
        "employeeName": "John Doe",
        "status": "enrolled",
        "enrolledAt": "2026-03-15",
        ...
      }
    ],
    "stats": {
      "totalEnrolled": 28,
      "confirmed": 25,
      "waitlisted": 3,
      "spotsLeft": 2
    }
  }
}
```

#### 8. Enroll Employee
```http
POST /api/training/enroll
```

**Request Body**:
```json
{
  "trainingId": "TRN-00001",
  "employeeId": "EMP001",
  "enrollmentType": "self-enrolled",
  "enrolledBy": "EMP001"
}
```

#### 9. Cancel Enrollment
```http
PATCH /api/training/enrollments/:enrollmentId/cancel
```

**Request Body**:
```json
{
  "cancellationReason": "Schedule conflict",
  "cancelledBy": "EMP001"
}
```

#### 10. Mark Attendance
```http
PATCH /api/training/enrollments/:enrollmentId/attendance
```

**Request Body**:
```json
{
  "date": "2026-04-01",
  "status": "present",
  "checkInTime": "09:00",
  "checkOutTime": "17:00",
  "hoursAttended": 8
}
```

#### 11. Submit Feedback
```http
PATCH /api/training/enrollments/:enrollmentId/feedback
```

**Request Body**:
```json
{
  "rating": 4.5,
  "comments": "Excellent training session",
  "trainerRating": 5,
  "contentRating": 4,
  "deliveryRating": 4.5
}
```

#### 12. Issue Certificate
```http
POST /api/training/enrollments/:enrollmentId/certificate
```

**Response**:
```json
{
  "success": true,
  "data": {
    "certificateNumber": "CERT-2026-00123",
    "certificateUrl": "https://storage/certificates/CERT-2026-00123.pdf",
    "issuedDate": "2026-04-05",
    "expiryDate": "2028-04-05"
  }
}
```

#### 13. Get Training Statistics
```http
GET /api/training/stats/overview
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalTrainings": 45,
    "upcoming": 12,
    "ongoing": 3,
    "completed": 28,
    "totalEnrollments": 856,
    "averageRating": 4.3,
    "totalSpent": 2450000,
    "totalBudget": 3000000,
    "certificationRate": 87.5,
    "byCategory": {
      "Technical": 18,
      "Soft Skills": 12,
      "Leadership": 8,
      "Compliance": 7
    }
  }
}
```

#### 14. Get Department-wise Analytics
```http
GET /api/training/analytics/department
```

#### 15. Get Employee Training History
```http
GET /api/training/employee/:employeeId/history
```

#### 16. Get Skill Gap Analysis
```http
GET /api/training/skillgap/:employeeId
```

#### 17. Recommend Trainings
```http
GET /api/training/recommendations/:employeeId
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "trainingId": "TRN-00015",
      "trainingName": "Advanced Python",
      "matchScore": 95,
      "reason": "Fills skill gap in Python - Advanced level",
      "priority": "High"
    }
  ]
}
```

#### 18. Upload Training Material
```http
POST /api/training/:trainingId/materials
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Training material file
- `name`: Material name
- `type`: Material type (pdf, video, etc.)

---

## 📦 Component Structure

### Page Component
**File**: `src/pages/hr/TrainingDashboard.tsx`

**Main Component**: `TrainingDashboard`

**State Management**:
```typescript
const [trainings, setTrainings] = useState<Training[]>([]);
const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
const [view, setView] = useState<'list' | 'calendar' | 'analytics'>('list');
const [filters, setFilters] = useState({
  status: 'all',
  category: 'all',
  mode: 'all',
  department: 'all',
  dateRange: null,
  search: ''
});
const [stats, setStats] = useState({
  total: 0,
  upcoming: 0,
  ongoing: 0,
  completed: 0,
  totalEnrollments: 0,
  averageRating: 0
});
```

**Key Functions**:
- `fetchTrainings()`: Load all trainings with filters
- `handleCreateTraining()`: Show create training form
- `handleEditTraining()`: Edit existing training
- `handleDeleteTraining()`: Soft delete training
- `handlePublishTraining()`: Publish/unpublish training
- `handleViewEnrollments()`: View enrolled employees
- `handleEnrollEmployee()`: Enroll employee manually
- `handleMarkAttendance()`: Mark daily attendance
- `handleIssueCertificate()`: Generate certificate
- `handleExportReport()`: Export training reports
- `applyFilters()`: Filter trainings

### Sub-Components

#### 1. TrainingForm (Sheet/Dialog)
**Purpose**: Create/Edit training program
**Props**: `training, onSave, onClose, departments, designations`

#### 2. TrainingCard
**Purpose**: Display training in card view
**Props**: `training, onEdit, onDelete, onViewDetails, onEnroll`

#### 3. EnrollmentManager (Sheet)
**Purpose**: Manage enrollments for a training
**Props**: `training, enrollments, onEnroll, onCancel, onMarkAttendance`

#### 4. AttendanceSheet
**Purpose**: Mark attendance for multiple employees
**Props**: `training, enrollments, date, onSave`

#### 5. TrainingCalendar
**Purpose**: Calendar view of trainings
**Props**: `trainings, onDateSelect, onTrainingClick`

#### 6. TrainingAnalytics
**Purpose**: Analytics dashboard
**Props**: `stats, departmentData, categoryData, trendData`

#### 7. SkillGapAnalysis
**Purpose**: Employee skill gap view
**Props**: `employeeId, skillGaps, recommendedTrainings`

#### 8. CertificateGenerator
**Purpose**: Generate training certificates
**Props**: `enrollment, training, onGenerate`

---

## 🔧 Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.263.1",
    "sonner": "^1.0.0",
    "axios": "^1.5.0",
    "recharts": "^2.8.0",
    "react-big-calendar": "^1.8.5",
    "jspdf": "^2.5.1"
  }
}
```

### UI Components (ShadCN)
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
```

### Icons (Lucide React)
```typescript
import {
  GraduationCap, BookOpen, Calendar, Users, TrendingUp,
  Plus, Edit, Trash2, Download, Upload, Award, CheckCircle,
  XCircle, Clock, DollarSign, BarChart, Filter, Search
} from 'lucide-react';
```

---

## 🎨 UI/UX Patterns

### Status Color Coding
```typescript
const statusColors = {
  'Planned': 'bg-gray-100 text-gray-700',
  'Open': 'bg-green-100 text-green-700',
  'Full': 'bg-yellow-100 text-yellow-700',
  'Ongoing': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-purple-100 text-purple-700',
  'Cancelled': 'bg-red-100 text-red-700'
};
```

### Training Mode Icons
```typescript
const modeIcons = {
  'Online': <Monitor className="h-4 w-4" />,
  'Offline': <MapPin className="h-4 w-4" />,
  'Hybrid': <Layers className="h-4 w-4" />
};
```

---

## 📊 Reports & Analytics

### Available Reports
1. **Training Completion Report**: By department, category, time period
2. **Enrollment Report**: Active enrollments, waitlist, cancellations
3. **Budget Report**: Allocated vs. spent, cost per employee
4. **Effectiveness Report**: Ratings, feedback analysis, skill acquisition
5. **Certification Report**: Issued certificates, expiring certificates
6. **Attendance Report**: Attendance percentages, no-shows
7. **Skill Gap Report**: Department-wise skill gaps, training recommendations

---

## 🔄 Integration Points

### 1. Employee Profile Integration
```typescript
// Show training history in employee profile
const trainingHistory = await fetch(`/api/training/employee/${employeeId}/history`);
```

### 2. Notification System
```typescript
// Send training reminders
await sendNotification({
  recipientId: enrollment.employeeId,
  type: 'training-reminder',
  title: 'Training Tomorrow',
  message: `${training.trainingName} starts tomorrow at ${training.startTime}`
});
```

### 3. Calendar Integration
```typescript
// Add to employee calendar
await addToCalendar({
  employeeId: enrollment.employeeId,
  title: training.trainingName,
  startDate: training.startDate,
  endDate: training.endDate,
  location: training.location || training.virtualMeetingLink
});
```

---

## 🚀 Implementation Checklist

### Backend
- [x] Create Training model
- [x] Create TrainingEnrollment model
- [x] Create SkillGap model
- [x] Implement training routes (CRUD)
- [x] Implement enrollment routes
- [ ] Add certificate generation service
- [ ] Add skill gap analysis engine
- [ ] Add training recommendation algorithm
- [ ] Set up training reminder cron jobs

### Frontend
- [x] Create TrainingDashboard page
- [x] Build training form  
- [x] Implement enrollment management
- [ ] Add attendance tracking UI
- [ ] Build analytics dashboard
- [ ] Implement skill gap analysis view
- [ ] Add certificate generation UI
- [ ] Create training calendar view
- [ ] Build training material upload
- [ ] Add feedback submission form

### Testing
- [ ] Test training CRUD operations
- [ ] Verify enrollment workflow
- [ ] Test waitlist functionality
- [ ] Validate attendance tracking
- [ ] Test certificate generation
- [ ] Verify skill gap analysis
- [ ] Test training recommendations
- [ ] Validate budget calculations

---

## 📝 Usage Example

```typescript
// In your HR dashboard
import TrainingDashboard from '@/pages/hr/TrainingDashboard';

function HRApp() {
  return (
    <div>
      <TrainingDashboard />
    </div>
  );
}
```

---

## 🔐 Access Control

**Allowed Roles**: `HR`, `SUPER_ADMIN`, `RMG`, `MANAGER`

**Permissions**:
- **HR/SUPER_ADMIN**: Full access (create, edit, delete, manage enrollments)
- **MANAGER**: View team trainings, nominate team members, view reports
- **EMPLOYEES**: View published trainings, self-enroll, view own history

---

## 📞 Support

For integration support, refer to:
- API Documentation: `docs/BACKEND_API_SPEC.md`
- Training Model: `server/src/models/Training.ts`
- Enrollment Model: `server/src/models/TrainingEnrollment.ts`
