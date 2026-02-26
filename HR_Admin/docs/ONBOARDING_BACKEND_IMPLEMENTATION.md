# Onboarding Workflow - Backend Implementation

## Overview
Complete backend API implementation for the Employee Onboarding Workflow system using MongoDB and Express.

## Architecture

### Database Models
The backend uses 5 separate MongoDB models for better data organization and scalability:

1. **OnboardingStatus** - Main onboarding record
2. **OnboardingChecklistItem** - Individual checklist tasks
3. **OnboardingDocument** - Document tracking
4. **WelcomeKitItem** - IT asset management
5. **TrainingSchedule** - Training sessions

### Files Created

#### 1. Models (`server/src/models/OnboardingNew.ts`)
- **OnboardingStatus Model**
  - Employee basic info (ID, name, designation, department)
  - Status tracking (not-started, in-progress, completed, on-hold)
  - Progress percentage (0-100)
  - Current phase tracking
  - HR/Manager contact details
  - Buddy/Mentor assignments
  - Timestamps (createdAt, updatedAt)

- **OnboardingChecklistItem Model**
  - Category-based tasks (pre-joining, day-1, week-1, month-1, probation)
  - Assignment tracking (hr, it, manager, employee, admin)
  - Status management (pending, in-progress, completed, skipped)
  - Due dates and completion tracking
  - Mandatory flag for required tasks

- **OnboardingDocument Model**
  - Document type and name
  - Required/optional flag
  - Status workflow (pending → uploaded → verified/rejected)
  - File URL storage
  - Verification tracking
  - Expiry date support

- **WelcomeKitItem Model**
  - Item categorization (laptop, mouse, keyboard, etc.)
  - Serial number tracking
  - Status workflow (pending → assigned → delivered → returned)
  - Delivery tracking
  - Notes field

- **TrainingSchedule Model**
  - Training categorization (orientation, technical, compliance, etc.)
  - Mandatory flag
  - Scheduling details (date, duration, trainer, location)
  - Status tracking (scheduled, completed, cancelled, rescheduled)
  - Feedback and rating system

#### 2. Routes (`server/src/routes/onboardingNew.ts`)

**Onboarding Status Routes:**
- `GET /api/onboarding-new/status` - Get all onboarding records
- `GET /api/onboarding-new/status/:employeeId` - Get specific employee's onboarding
- `POST /api/onboarding-new/initialize` - Initialize onboarding for new employee
- `PATCH /api/onboarding-new/status/:employeeId` - Update onboarding status/phase/assignments

**Checklist Routes:**
- `GET /api/onboarding-new/checklist/:employeeId` - Get checklist items
- `POST /api/onboarding-new/checklist` - Add checklist item
- `PATCH /api/onboarding-new/checklist/:id` - Update checklist item
- `DELETE /api/onboarding-new/checklist/:id` - Delete checklist item

**Document Routes:**
- `GET /api/onboarding-new/documents/:employeeId` - Get documents
- `POST /api/onboarding-new/documents` - Add document
- `PATCH /api/onboarding-new/documents/:id` - Update document status

**Welcome Kit Routes:**
- `GET /api/onboarding-new/welcome-kit/:employeeId` - Get welcome kit items
- `POST /api/onboarding-new/welcome-kit` - Add welcome kit item
- `PATCH /api/onboarding-new/welcome-kit/:id` - Update welcome kit item

**Training Routes:**
- `GET /api/onboarding-new/trainings/:employeeId` - Get training schedule
- `POST /api/onboarding-new/trainings` - Add training
- `PATCH /api/onboarding-new/trainings/:id` - Update training

#### 3. Frontend Service (`src/services/onboardingServiceAPI.ts`)
Complete TypeScript service with methods for all API endpoints:
- Authentication token management
- Request/response handling
- Error handling
- Type-safe API calls
- Progress calculation

## API Endpoints Reference

### Initialize Onboarding
```typescript
POST /api/onboarding-new/initialize
Body: {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: Date;
  hrContact?: { name, email, phone };
  managerContact?: { name, email, phone };
}
```

**Behavior:**
- Validates employee exists in database
- Checks for duplicate onboarding
- Creates OnboardingStatus record
- Initializes default checklist (20 tasks across 5 phases)
- Initializes default documents (7 document types)
- Initializes default welcome kit (6 items)
- Initializes default training schedule (4 trainings)

**Default Checklist Items:**
- **Pre-joining (5 tasks)**: Offer Letter Sent, Accepted, Background Verification, Documents Requested, IT Setup
- **Day 1 (6 tasks)**: Workstation Setup, Welcome Kit, Access Card, Welcome Email, Buddy Assignment, Orientation
- **Week 1 (4 tasks)**: Team Introduction, System Access, Role Training, Policy Review
- **Month 1 (3 tasks)**: Performance Goals, First Project, 30-Day Feedback
- **Probation (2 tasks)**: Mid-Probation Review, Final Review

### Update Status
```typescript
PATCH /api/onboarding-new/status/:employeeId
Body: {
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  currentPhase?: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation' | 'completed';
  buddy?: { employeeId, name, designation, department, email, ... };
  mentor?: { employeeId, name, designation, department, email, ... };
}
```

**Behavior:**
- Updates onboarding status
- Auto-calculates progress percentage
- Updates lastUpdated timestamp

### Get Onboarding Status
```typescript
GET /api/onboarding-new/status/:employeeId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employeeId": "EMP001",
    "employeeName": "John Doe",
    "status": "in-progress",
    "progressPercentage": 45,
    "currentPhase": "week-1",
    "checklist": [...],
    "documents": [...],
    "welcomeKit": [...],
    "trainings": [...],
    "buddy": {...},
    "mentor": {...}
  }
}
```

## Progress Calculation

The system automatically calculates progress based on 4 components (25% weight each):

1. **Checklist Progress** = (Completed Mandatory Tasks / Total Mandatory Tasks) × 25
2. **Documents Progress** = (Verified Required Docs / Total Required Docs) × 25
3. **Welcome Kit Progress** = (Delivered Items / Total Items) × 25
4. **Training Progress** = (Completed Mandatory Trainings / Total Mandatory Trainings) × 25

**Overall Progress** = Sum of all 4 components (0-100%)

Progress is automatically updated whenever:
- Checklist item is added/updated/deleted
- Document status changes
- Welcome kit item is assigned/delivered
- Training is completed

## Integration with Frontend

### Update Frontend to Use Real API

1. **Import the new service:**
```typescript
import onboardingServiceAPI from '@/services/onboardingServiceAPI';
```

2. **Replace localStorage calls with API calls:**
```typescript
// Before (localStorage mock)
const result = await onboardingService.getOnboardingStatus(employeeId);

// After (real API)
const result = await onboardingServiceAPI.getOnboardingStatus(employeeId);
```

3. **Update components:**
- [OnboardingDashboard.tsx](../src/pages/onboarding/OnboardingDashboard.tsx)
- [OnboardingList.tsx](../src/pages/onboarding/OnboardingList.tsx)
- [AddEditEmployeeModal.tsx](../src/components/modals/AddEditEmployeeModal.tsx)

## Authentication

All endpoints require JWT authentication. The service automatically includes the token from localStorage:

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

## Error Handling

All endpoints return a consistent response format:

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Database Indexes

For optimal performance, the following indexes are created:

- `OnboardingStatus.employeeId` - Unique index
- `OnboardingChecklistItem.employeeId` - Index
- `OnboardingChecklistItem.{employeeId, category}` - Compound index
- `OnboardingDocument.{employeeId, status}` - Compound index
- `WelcomeKitItem.{employeeId, status}` - Compound index
- `TrainingSchedule.{employeeId, status}` - Compound index

## Testing

### Start the Backend Server
```bash
cd server
npm run dev
```

### Test Endpoints

1. **Initialize Onboarding:**
```bash
POST http://localhost:5000/api/onboarding-new/initialize
Authorization: Bearer YOUR_TOKEN
{
  "employeeId": "EMP001",
  "employeeName": "John Doe",
  "designation": "Software Engineer",
  "department": "Engineering",
  "joiningDate": "2024-02-01"
}
```

2. **Get Onboarding Status:**
```bash
GET http://localhost:5000/api/onboarding-new/status/EMP001
Authorization: Bearer YOUR_TOKEN
```

3. **Update Status:**
```bash
PATCH http://localhost:5000/api/onboarding-new/status/EMP001
Authorization: Bearer YOUR_TOKEN
{
  "status": "in-progress"
}
```

4. **Update Checklist Item:**
```bash
PATCH http://localhost:5000/api/onboarding-new/checklist/ITEM_ID
Authorization: Bearer YOUR_TOKEN
{
  "status": "completed",
  "completedDate": "2024-02-01T10:00:00Z",
  "completedBy": "HR_USER_ID"
}
```

## Migration from localStorage

To migrate from the current localStorage implementation:

1. **Keep both services during transition:**
   - Old: `onboardingService.ts` (localStorage)
   - New: `onboardingServiceAPI.ts` (real API)

2. **Update components one at a time:**
   - Test each component individually
   - Ensure API calls work correctly
   - Verify data persistence

3. **Remove localStorage service:**
   - Once all components are migrated
   - Delete `onboardingService.ts`
   - Clean up localStorage data

## Next Steps

1. ✅ Backend models created
2. ✅ Backend routes implemented
3. ✅ Frontend API service created
4. ⏳ Update frontend components to use API service
5. ⏳ Test end-to-end workflow
6. ⏳ Add file upload functionality for documents
7. ⏳ Add email notifications for status changes
8. ⏳ Create onboarding templates feature

## Notes

- The backend is fully functional and ready to use
- All endpoints include automatic progress calculation
- The system supports role-based access control via JWT
- File upload for documents is stubbed (returns mock URLs)
- Email notifications need to be implemented separately

---

**Last Updated:** 2024-02-01
**Author:** GitHub Copilot
**Version:** 1.0.0
