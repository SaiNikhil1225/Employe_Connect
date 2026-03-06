# Module — User Profile (Employee Profile)

**Entry file**: `src/pages/employee/Profile.tsx` → wraps `src/pages/employee/EnhancedMyProfile.tsx`  
**Real implementation**: `src/pages/employee/EnhancedMyProfile.tsx` (966 lines)  
**Route**: `/employee/profile` (own profile) | `/employee/:employeeId` (HR viewing another employee)  
**Access**: All authenticated roles (employees view own profile; HR / IT_ADMIN / SUPER_ADMIN can view & edit any profile)

---

## 1. Page Overview

The User Profile page is a multi-tab, full-lifecycle employee record viewer. It aggregates data from the Employee model across 8 focused tabs: personal details, job information, documents, finances, performance, assets, and a chronological timeline. HR admins get additional contextual actions (initiate exit, disable/enable login, PIP management).

---

## 2. Features

| Feature | Description |
|---------|-------------|
| Profile header | Avatar, name, employeeId, designation, employment status badge, photo upload |
| Quick info bar | Email, phone, location, department, business unit, reporting manager, dotted-line manager, joining date |
| 8 profile tabs | About, Profile, Job, Time, Documents, Finances, Performance, Assets |
| Breadcrumb navigation | Context-aware back button (HR Management, Directory, My Team, Leave, Attendance, Search) |
| Inline editing | Every tab supports save-in-place edits (gated by `canEditProfile`) |
| Auto-refresh | `useEffect` watches `employeeStore.employees[]` — auto-reload if store data changes |
| Photo upload | Upload to profile photo (TODO stub — triggers `loadProfileData` on complete) |
| Contextual actions menu | Download ID Card, Write Note, Request Feedback |
| HR-only actions | Reset Password, Initiate Exit, Disable / Enable Login, Add to PIP / Remove from PIP |
| Active PIP badge | `ProfileHeader` shows PIP badge when `hasActivePIP === true` |
| Initiate Exit | Opens `InitiateExitDrawer` → calls offboarding API |
| Disable / Enable Login | `PATCH /employees/:id/disable-login` / `enable-login` |
| Add to PIP | Opens `AddToPIPDrawer` |
| Remove from PIP | Finds active PIP → `PATCH /pip/:pipId/status` `{ status: 'Cancelled' }` |

---

## 3. Profile Tabs

### Tab 1 — About
Personal and contact information.

Fields: `firstName`, `middleName`, `lastName`, `displayName`, `email`, `dialCode`, `mobileNumber`, `gender`, `dateOfBirth`, `summary`, `joiningDate`, `department`, `businessUnit`, `workPhone`, `residenceNumber`, `personalEmail`, `maritalStatus`, `marriageDate`, `fatherName`, `motherName`, `spouseName`, `spouseGender`, `physicallyHandicapped`, `bloodGroup`, `nationality`, `currentAddress`, `city`, `state`, `country`, `postalCode`

**Save action**: `employeeManagementService.updatePersonalInfo(employeeId, data)` → `PUT /employees/:id`  
On save maps `dialCode + mobileNumber` → `phone` field for backend compatibility.

---

### Tab 2 — Profile
Education history, certifications, work history, skills.  
Rendered by `ProfileTab` which consumes `employeeData` + `documents[]`.  
**Component**: `src/components/profile/tabs/ProfileTab.tsx`

Includes sub-services:
- `updateEducationHistory` → `PATCH /employees/:id/education-history`
- `updateCertifications` → `PATCH /employees/:id/certifications-list`
- `addEducation` → `POST /employees/:id/education`
- `addWorkHistory` → `POST /employees/:id/work-history`
- `addCertification` → `POST /employees/:id/certifications`

---

### Tab 3 — Job
Employment type, designation, reporting structure, probation, contract dates.

Fields: `designation`, `secondaryJobTitle`, `department`, `businessUnit`, `legalEntity`, `employmentType`, `workerType`, `hireType`, `location`, `reportingManager`, `reportingManagerId`, `dottedLineManager`, `dottedLineManagerId`, `joiningDate`, `contractEndDate`, `probationEndDate`

**Save action**: `employeeManagementService.updatePersonalInfo(employeeId, data)` → `PUT /employees/:id`

---

### Tab 4 — Time (Timeline)
A chronological event timeline auto-generated from employee data. **No API calls** — purely computed from `profileData.employee`.

**Event types generated**:

| Event type | Source field | Description |
|-----------|-------------|-------------|
| `anniversary` (Day 1) | `dateOfJoining` | "Joined Company" entry |
| `anniversary` (yearly) | `dateOfJoining` | One per full year served |
| `birthday` (yearly) | `dateOfBirth` | One per birthday since joining |
| `role` | `lastPromotionDate` | Promotion event |
| `salary` | `lastIncrementDate` | Salary revision, includes `lastIncrementPercentage` |
| `manager` | `managerHistory[]` | Manager change per record |
| `spoc` | `spocHistory[]` | HR SPOC change per record |
| `role` | `designationHistory[]` | Designation change per record |
| `achievement` | `educationHistory[].achievements` | Education achievement |
| `achievement` | `certifications[].issueDate` | Certification earned |

Events are sorted **descending** by date (most recent first).

---

### Tab 5 — Documents
Lists all employee documents (uploaded files).  
**Component**: `src/components/profile/tabs/DocumentsTab.tsx`  
Data: `profileData.documents[]` — fetched as part of the main profile load from `/employees/:id/profile`.

---

### Tab 6 — Finances
Banking, payroll, statutory compliance (PF, ESI, LWF), Aadhaar, PAN details.

Fields: `salary` (object), `salaryPaymentMode`, `bankAccountNumber/accountNumber`, `bankName`, `ifscCode`, `nameOnAccount`, `branch`, `pfDetailsAvailable`, `pfNumber`, `pfJoiningDate`, `nameOnPFAccount`, `uan`, `pfEstablishmentId`, `esiEligible`, `esiDetailsAvailable`, `esiNumber`, `employerESINumber`, `ptEstablishmentId`, `lwfEligible`, `aadhaarNumber`, `enrollmentNumber`, `dobInAadhaar`, `fullNameAsPerAadhaar`, `addressAsInAadhaar`, `genderAsInAadhaar`, `panCardAvailable`, `panNumber`, `fullNameAsPerPAN`, `dobInPAN`, `parentsNameAsPerPAN`

**Save actions**:
- Financial info: `employeeManagementService.updatePersonalInfo(employeeId, data)` → `PUT /employees/:id`
- Aadhaar document: uses `documentService.uploadDocument(formData)` → `POST /documents/upload`

---

### Tab 7 — Performance
Performance ratings, review cycle, skills gap.  
**Component**: `src/components/profile/tabs/PerformanceTab.tsx`

Props: `employeeId`, `overallRating`, `lastReviewDate`, `nextReviewDate`  
Fields sourced from: `employee.performanceRating`, `employee.lastReviewDate`, `employee.nextReviewDate`

---

### Tab 8 — Assets
Assigned company assets (hardware, equipment).  
**Component**: `src/components/profile/tabs/AssetsTab.tsx`

Service calls:
- `employeeManagementService.updateAssets` → `PATCH /employees/:id/assets-list`
- `employeeManagementService.assignAsset` → `POST /employees/:id/assets`
- `employeeManagementService.returnAsset` → `PATCH /employees/:id/assets/:assetId/return`

---

## 4. Frontend Dependencies

### Zustand Stores

| Store | Actions used | Data used |
|-------|-------------|-----------|
| `useAuthStore` | — | `user` (role check, own-profile check, employeeId) |
| `useEmployeeStore` | `fetchEmployees` | `employees[]` — triggers auto-refresh if store changes |

### Services

| Service | File | Purpose |
|---------|------|---------|
| `employeeManagementService` | `src/services/employeeManagementService.ts` | Profile, personal info, education, certifications, medical, emergency contacts, family, banking, assets |
| `documentService` | `src/services/employeeManagementService.ts` | Document upload, verify, reject, delete, metadata |
| `onboardingService` | `src/services/employeeManagementService.ts` | Onboarding checklist CRUD |
| `offboardingService` | `src/services/employeeManagementService.ts` | Exit process, asset return, clearance |
| `apiClient` | `src/services/api.ts` | PIP checks, login enable/disable |

### Component Tree

```
EnhancedMyProfile
├── ProfileHeader                        src/components/profile/ProfileHeader.tsx
├── QuickInfoBar                         src/components/profile/QuickInfoBar.tsx
├── TabNavigation                        src/components/profile/TabNavigation.tsx
├── ContextualActionMenu                 src/components/profile/ContextualActionMenu.tsx
├── InitiateExitDrawer                   src/components/profile/InitiateExitDrawer.tsx
├── DisableLoginModal                    src/components/profile/DisableLoginModal.tsx
├── EnableLoginModal                     src/components/profile/EnableLoginModal.tsx
├── AddToPIPDrawer                       src/components/profile/AddToPIPDrawer.tsx
└── Tab content
    ├── AboutTab                         src/components/profile/tabs/AboutTab.tsx
    ├── ProfileTab                       src/components/profile/tabs/ProfileTab.tsx
    ├── JobTab                           src/components/profile/tabs/JobTab.tsx
    ├── TimeTab                          src/components/profile/tabs/TimeTab.tsx
    ├── DocumentsTab                     src/components/profile/tabs/DocumentsTab.tsx
    ├── FinancesTab                      src/components/profile/tabs/FinancesTab.tsx
    ├── PerformanceTab                   src/components/profile/tabs/PerformanceTab.tsx
    └── AssetsTab                        src/components/profile/tabs/AssetsTab.tsx
```

### NPM Packages Required

```json
{
  "react-router-dom": "^6.x",
  "date-fns": "^3.x",
  "lucide-react": "^0.4xx",
  "sonner": "^1.x"
}
```

---

## 5. API Endpoints

### 5.1 Profile Load

```
GET /api/employees/:employeeId/profile
```
Returns full employee object + `documents[]` in one response:
```json
{
  "success": true,
  "data": {
    "employee": { ...all fields... },
    "documents": [ ...EmployeeDocument[] ... ]
  }
}
```

---

### 5.2 Personal / Job / Finances Info Update

```
PUT /api/employees/:employeeId
Body: { ...any employee fields to update... }
```

---

### 5.3 Specific PATCH Endpoints

```
PATCH /api/employees/:employeeId/medical-info
PATCH /api/employees/:employeeId/emergency-contacts   Body: { contacts: EmergencyContact[] }
PATCH /api/employees/:employeeId/family-members       Body: { members: FamilyMember[] }
PATCH /api/employees/:employeeId/contact-info
PATCH /api/employees/:employeeId/banking-info
PATCH /api/employees/:employeeId/education-history    Body: { educationHistory: EducationRecord[] }
PATCH /api/employees/:employeeId/certifications-list  Body: { certifications: Certification[] }
PATCH /api/employees/:employeeId/assets-list          Body: { assets: Asset[] }
PATCH /api/employees/:employeeId/disable-login
PATCH /api/employees/:employeeId/enable-login
```

---

### 5.4 Add Sub-Records

```
POST /api/employees/:employeeId/education       Body: EducationRecord
POST /api/employees/:employeeId/work-history    Body: WorkHistory
POST /api/employees/:employeeId/certifications  Body: Certification
POST /api/employees/:employeeId/assets          Body: Asset
```

---

### 5.5 Asset Return

```
PATCH /api/employees/:employeeId/assets/:assetId/return
Body: { returnDate, condition, notes }
```

---

### 5.6 PIP Endpoints

```
GET  /api/pip/employee/:employeeId             Returns array of PIP records
PATCH /api/pip/:pipId/status                   Body: { status: 'Cancelled' | 'Active' | ... }
```

---

### 5.7 Document Endpoints

```
GET    /api/documents/employee/:employeeId
GET    /api/documents/employee/:employeeId/type/:documentType
POST   /api/documents/upload                   Body: FormData (multipart)
PATCH  /api/documents/:documentId/verify       Body: { verifiedBy }
PATCH  /api/documents/:documentId/reject       Body: { verifiedBy, rejectionReason }
DELETE /api/documents/:documentId
PATCH  /api/documents/:documentId/metadata
GET    /api/documents/pending-verification
GET    /api/documents/expiring-soon
```

---

### 5.8 Onboarding Endpoints

```
GET   /api/onboarding
GET   /api/onboarding/employee/:employeeId
POST  /api/onboarding
PATCH /api/onboarding/:employeeId/pre-joining/:taskName
PATCH /api/onboarding/:employeeId/day1/:taskName
PATCH /api/onboarding/:employeeId/it/:taskName
PATCH /api/onboarding/:employeeId/hr/:taskName
PATCH /api/onboarding/:employeeId/training/:taskName
PATCH /api/onboarding/:employeeId/week1/:taskName
PATCH /api/onboarding/:employeeId/milestone/:milestoneName
GET   /api/onboarding/stats/overview
```

---

### 5.9 Offboarding Endpoints (Initiate Exit)

```
GET   /api/offboarding
GET   /api/offboarding/employee/:employeeId
POST  /api/offboarding/initiate
PATCH /api/offboarding/:employeeId/exit-interview/schedule
PATCH /api/offboarding/:employeeId/exit-interview/complete
PATCH /api/offboarding/:employeeId/assets/return/:assetType
PATCH /api/offboarding/:employeeId/access/revoke/:accessType
PATCH /api/offboarding/:employeeId/knowledge-transfer
PATCH /api/offboarding/:employeeId/hr-clearance
PATCH /api/offboarding/:employeeId/documents/issue/:documentType
PATCH /api/offboarding/:employeeId/department-clearance/:department
PATCH /api/offboarding/:employeeId/complete
GET   /api/offboarding/stats/overview
```

---

## 6. Database Collections & Schemas

### 6.1 `employees` (Model: `server/src/models/Employee.ts`)

#### Identity & Auth

| Field | Type | Notes |
|-------|------|-------|
| `employeeId` | String (unique, required) | Primary key |
| `name` | String (required) | Full display name |
| `email` | String (unique, required) | Login email |
| `password` | String (select: false) | Hashed — optional |
| `role` | String enum | EMPLOYEE, MANAGER, HR, RMG, IT_ADMIN, IT_EMPLOYEE, L1/L2/L3_APPROVER, SUPER_ADMIN |
| `isActive` | Boolean | Account active flag |
| `hasLoginAccess` | Boolean | True only if password set + role requires login |

#### Personal Info (About Tab)

| Field | Type |
|-------|------|
| `firstName`, `middleName`, `lastName` | String |
| `displayName` | String |
| `dialCode`, `mobileNumber`, `phone` | String |
| `gender` | String |
| `dateOfBirth` | String (ISO) |
| `maritalStatus`, `marriageDate` | String |
| `fatherName`, `motherName`, `spouseName`, `spouseGender` | String |
| `physicallyHandicapped` | Boolean |
| `bloodGroup`, `nationality` | String |
| `personalEmail`, `workPhone`, `residenceNumber` | String |
| `currentAddress`, `city`, `state`, `country`, `postalCode` | String / Mixed |
| `summary` | String (bio) |

#### Job Info (Job Tab)

| Field | Type |
|-------|------|
| `designation` | String (required) |
| `secondaryJobTitle` | String |
| `department` | String (required) |
| `businessUnit`, `legalEntity` | String |
| `employmentType`, `workerType`, `hireType` | String |
| `location` | String |
| `dateOfJoining` | String (ISO) |
| `contractEndDate`, `probationEndDate` | String (ISO) |
| `reportingManager` | Mixed (object with `.name`) |
| `reportingManagerId`, `dottedLineManagerId` | String |
| `dottedLineManager` | Mixed |
| `status` | String: `active\|inactive\|on-leave` |

#### Timeline Source Fields (Time Tab)

| Field | Type | Notes |
|-------|------|-------|
| `lastPromotionDate` | String | ISO date |
| `lastIncrementDate` | String | ISO date |
| `lastIncrementPercentage` | Number | e.g. 12 |
| `currentGrade` | String | Grade level |
| `managerHistory[]` | Array | `{ managerName, startDate, notes }` |
| `spocHistory[]` | Array | `{ spocName, startDate, notes }` |
| `designationHistory[]` | Array | `{ designation, startDate, promotionType, grade, notes }` |
| `educationHistory[]` | Array | See `EducationRecord` interface |
| `certifications[]` | Array | See `Certification` interface |

#### Finance Fields (Finances Tab)

| Field | Type |
|-------|------|
| `salary` | Object `{ basic, hra, allowances, gross }` |
| `salaryPaymentMode` | String |
| `bankAccountNumber` / `accountNumber` | String |
| `bankName`, `ifscCode`, `nameOnAccount`, `branch` | String |
| `pfDetailsAvailable`, `pfNumber`, `pfJoiningDate`, `nameOnPFAccount`, `uan`, `pfEstablishmentId` | String/Boolean |
| `esiEligible`, `esiDetailsAvailable`, `esiNumber`, `employerESINumber`, `ptEstablishmentId`, `lwfEligible` | String/Boolean |
| `aadhaarNumber`, `enrollmentNumber`, `dobInAadhaar`, `fullNameAsPerAadhaar`, `addressAsInAadhaar`, `genderAsInAadhaar` | String |
| `panCardAvailable`, `panNumber`, `fullNameAsPerPAN`, `dobInPAN`, `parentsNameAsPerPAN` | String/Boolean |

#### Medical / Emergency / Family (Profile Tab)

| Field | Type |
|-------|------|
| `medicalInfo` | Object — see `MedicalInfo` interface |
| `emergencyContacts[]` | Array — see `EmergencyContact` interface |
| `familyMembers[]` | Array — see `FamilyMember` interface |

#### Performance Fields (Performance Tab)

| Field | Type |
|-------|------|
| `performanceRating` | Number |
| `lastReviewDate` | String (ISO) |
| `nextReviewDate` | String (ISO) |

#### Asset Fields (Assets Tab)

| Field | Type |
|-------|------|
| `assets[]` | Array — see `Asset` interface |

---

### 6.2 `employeedocuments` (Model: `server/src/models/EmployeeDocument.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `employeeId` | String | Reference to employee |
| `documentType` | String | Aadhaar Card, PAN, Degree, etc. |
| `documentName` | String | Display name |
| `documentUrl` | String | Storage URL |
| `fileSize` | Number | Bytes |
| `mimeType` | String | |
| `uploadedBy` | String | EmployeeId |
| `uploadedDate` | Date | |
| `verificationStatus` | String | `pending\|verified\|rejected` |
| `verifiedBy`, `verifiedDate` | String / Date | |
| `rejectionReason` | String | |
| `expiryDate` | Date | For expiry tracking |
| `isActive` | Boolean | |
| `metadata` | Object | `{ documentNumber, issueDate, issuingAuthority, version }` |

---

### 6.3 `pips` (Model: `server/src/models/PIP.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `employeeId` | String | Reference to employee |
| `status` | String | `Pending\|Acknowledged\|Active\|Completed\|Cancelled` |
| `startDate` | Date | |
| `endDate` | Date | |
| `reason` | String | |

Active PIP = status in `['Pending', 'Acknowledged', 'Active']`

---

### 6.4 `onboardingchecklists` (Model: `server/src/models/OnboardingChecklist.ts`)

| Field | Type |
|-------|------|
| `employeeId` | String |
| `status` | `pending\|in-progress\|completed` |
| `startDate`, `expectedCompletionDate`, `actualCompletionDate` | Date |
| `progressPercentage` | Number |
| Task groups | `preJoiningTasks`, `day1Tasks`, `itTasks`, `hrTasks`, `trainingTasks`, `week1Tasks`, `milestones` |

---

### 6.5 `offboardingchecklists` (Model: `server/src/models/OffboardingChecklist.ts`)

| Field | Type |
|-------|------|
| `employeeId` | String |
| `status` | `not-initiated\|in-progress\|completed` |
| `initiatedDate`, `resignationDate`, `lastWorkingDay`, `expectedClearanceDate`, `actualClearanceDate` | Date |
| `reasonForLeaving`, `detailedReason` | String |
| `progressPercentage` | Number |
| `eligibleForRehire` | Boolean |
| Process sub-docs | `exitInterview`, `itAssetReturn`, `accessRevocation`, `knowledgeTransfer`, `hrClearance`, `documents`, `departmentClearances` |

---

## 7. Key Interfaces (from `employeeManagementService.ts`)

```typescript
interface MedicalInfo {
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceValidUntil?: string;
  lastCheckupDate?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
}

interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  dependent?: boolean;
  nomineePercentage?: number;
}

interface EducationRecord {
  degree?: string;
  institution?: string;
  university?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  achievements?: string;
  documentUrl?: string;
}

interface WorkHistory {
  companyName?: string;
  designation?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  responsibilities?: string;
  reasonForLeaving?: string;
  managerName?: string;
  managerContact?: string;
  salary?: number;
  documentUrl?: string;
}

interface Certification {
  name?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  documentUrl?: string;
}

interface Asset {
  assetType?: string;
  assetId?: string;
  serialNumber?: string;
  assignedDate?: string;
  returnDate?: string;
  status?: 'assigned' | 'returned' | 'damaged' | 'lost';
  condition?: string;
  notes?: string;
}
```

---

## 8. Permissions / RBAC

| Action | Condition |
|--------|-----------|
| View own profile | Any authenticated role |
| View another employee's profile | HR, IT_ADMIN, SUPER_ADMIN |
| Edit any profile tab | Own profile OR HR/IT_ADMIN/SUPER_ADMIN (`canEditProfile`) |
| See HR contextual actions (Exit, PIP, Login) | `isHRAdmin && !isOwnProfile` |
| Disable / Enable login | HR, SUPER_ADMIN |
| Add / Remove from PIP | HR, SUPER_ADMIN |
| Initiate Exit | HR, SUPER_ADMIN |
| Verify / Reject documents | HR, SUPER_ADMIN |

```typescript
const isHRAdmin = user?.role === 'HR' || user?.role === 'IT_ADMIN' || user?.role === 'SUPER_ADMIN';
const isOwnProfile = !propEmployeeId || propEmployeeId === user?.employeeId;
const canEditProfile = isOwnProfile || isHRAdmin;
```

---

## 9. Integration Points / Data Dependencies

| Dependency | Source module | What is needed |
|-----------|--------------|----------------|
| Auth / session | Auth module | `user.employeeId`, `user.role` |
| Employee records | Employee module | Full employee document from `/employees/:id/profile` |
| Documents | Document module | `documents[]` from profile response |
| PIP status | Performance module | `GET /pip/employee/:id` on page load |
| Employee store sync | WorkforceSummary / HR modules | `fetchEmployees()` after any profile save — keeps workforce table in sync |
| Onboarding checklist | Onboarding module | Read/write via `onboardingService` |
| Offboarding / Exit | Offboarding module | Initiated from `InitiateExitDrawer` |
| Notifications | Notification module | Not directly used — downstream from PIP/exit workflows |

---

## 10. Side Effects / Events

- **On any profile save**: `refreshData()` calls both `loadProfileData()` + `fetchEmployees()` — refreshes store so WorkforceSummary and other pages see updated data
- **On disable/enable login**: Re-fetches profile, updates `employeeAccountActive` flag
- **On remove from PIP**: `PATCH /pip/:id/status` to `Cancelled` → re-checks `hasActivePIP` → hides PIP badge
- **On Add to PIP**: `AddToPIPDrawer` submits PIP creation → `checkActivePIP()` re-runs → shows PIP badge
- **On initiate exit**: Creates offboarding record → exit workflow begins
- **Navigation context**: `sessionStorage.profileReferrer` is read to show correct breadcrumb label (set by Workforce / Directory / Team pages before navigating here)

---

## 11. Breadcrumb Context Map

| Referring path | Breadcrumb shown |
|---------------|-----------------|
| `/hr/employee-management` or `/hr/workforce` | HR Management |
| `/employee/directory` | Employee Directory |
| `/hr/attendance` | HR Attendance |
| `/hr/leave` | Leave Management |
| `/employee/my-team` | My Team |
| `/search` or `global` | Search Results |
| Own profile (no referrer) | Dashboard |
| Default fallback | Employees |
