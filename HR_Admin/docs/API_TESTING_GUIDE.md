# Employee Management API Testing Guide

## Server Status ✅
**Server Running:** http://localhost:5000  
**Status:** All routes successfully registered and operational

---

## Quick Test Commands

### 1. Test Server Health
```bash
curl http://localhost:5000/api/health
```

### 2. Get All Employees
```bash
curl http://localhost:5000/api/employees
```

### 3. Get Employee Profile (Enhanced)
Replace `EMP001` with actual employee ID:
```bash
curl http://localhost:5000/api/employees/EMP001/profile
```

### 4. Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -F "document=@/path/to/file.pdf" \
  -F "employeeId=EMP001" \
  -F "documentType=RESUME" \
  -F "documentName=Resume 2026" \
  -F "uploadedBy=HR001"
```

### 5. Get Employee Documents
```bash
curl http://localhost:5000/api/documents/employee/EMP001
```

### 6. Create Onboarding Checklist
```bash
curl -X POST http://localhost:5000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "assignedTo": "HR001",
    "expectedCompletionDate": "2026-02-28"
  }'
```

### 7. Get Onboarding Checklist
```bash
curl http://localhost:5000/api/onboarding/employee/EMP001
```

### 8. Update Medical Information
```bash
curl -X PATCH http://localhost:5000/api/employees/EMP001/medical-info \
  -H "Content-Type: application/json" \
  -d '{
    "bloodGroup": "O+",
    "allergies": ["Penicillin"],
    "insuranceProvider": "XYZ Insurance",
    "insurancePolicyNumber": "POL123456"
  }'
```

### 9. Add Emergency Contact
```bash
curl -X PATCH http://localhost:5000/api/employees/EMP001/emergency-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {
        "name": "John Doe",
        "relationship": "Spouse",
        "phone": "+1234567890",
        "email": "john@example.com",
        "isPrimary": true
      }
    ]
  }'
```

### 10. Initiate Offboarding
```bash
curl -X POST http://localhost:5000/api/offboarding/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "assignedTo": "HR001",
    "resignationDate": "2026-02-01",
    "lastWorkingDay": "2026-03-01",
    "reasonForLeaving": "Better Opportunity",
    "detailedReason": "Joining competitor with 30% raise"
  }'
```

---

## Using Postman/Thunder Client

### Collection Setup

**Base URL:** `http://localhost:5000/api`

### Endpoints to Test:

#### Employee Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees |
| GET | `/employees/:id/profile` | Get complete profile |
| PATCH | `/employees/:id/medical-info` | Update medical info |
| PATCH | `/employees/:id/emergency-contacts` | Update emergency contacts |
| PATCH | `/employees/:id/family-members` | Update family members |
| PATCH | `/employees/:id/banking-info` | Update banking info |
| POST | `/employees/:id/education` | Add education record |
| POST | `/employees/:id/work-history` | Add work history |
| POST | `/employees/:id/certifications` | Add certification |
| POST | `/employees/:id/assets` | Assign asset |
| PATCH | `/employees/:id/assets/:assetId/return` | Return asset |

#### Document Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/employee/:employeeId` | Get all documents |
| GET | `/documents/employee/:employeeId/type/:type` | Get by type |
| POST | `/documents/upload` | Upload document |
| PATCH | `/documents/:documentId/verify` | Verify document |
| PATCH | `/documents/:documentId/reject` | Reject document |
| DELETE | `/documents/:documentId` | Delete document |
| GET | `/documents/pending-verification` | Get pending docs |
| GET | `/documents/expiring-soon` | Get expiring docs |

#### Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/onboarding/` | Get all checklists |
| GET | `/onboarding/employee/:employeeId` | Get checklist |
| POST | `/onboarding/` | Create checklist |
| PATCH | `/onboarding/:employeeId/pre-joining/:taskName` | Update pre-joining task |
| PATCH | `/onboarding/:employeeId/day1/:taskName` | Update day 1 task |
| PATCH | `/onboarding/:employeeId/it/:taskName` | Update IT task |
| PATCH | `/onboarding/:employeeId/hr/:taskName` | Update HR task |
| PATCH | `/onboarding/:employeeId/training/:taskName` | Update training task |
| PATCH | `/onboarding/:employeeId/week1/:taskName` | Update week 1 task |
| PATCH | `/onboarding/:employeeId/milestone/:milestone` | Update milestone |
| GET | `/onboarding/stats/overview` | Get statistics |

#### Offboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/offboarding/` | Get all checklists |
| GET | `/offboarding/employee/:employeeId` | Get checklist |
| POST | `/offboarding/initiate` | Initiate process |
| PATCH | `/offboarding/:employeeId/exit-interview/schedule` | Schedule interview |
| PATCH | `/offboarding/:employeeId/exit-interview/complete` | Complete interview |
| PATCH | `/offboarding/:employeeId/assets/return/:assetType` | Return asset |
| PATCH | `/offboarding/:employeeId/access/revoke/:accessType` | Revoke access |
| PATCH | `/offboarding/:employeeId/knowledge-transfer` | Update KT |
| PATCH | `/offboarding/:employeeId/hr-clearance` | Update clearance |
| PATCH | `/offboarding/:employeeId/documents/issue/:docType` | Issue document |
| PATCH | `/offboarding/:employeeId/department-clearance/:dept` | Update clearance |
| PATCH | `/offboarding/:employeeId/complete` | Complete process |
| GET | `/offboarding/stats/overview` | Get statistics |

---

## Sample Request Bodies

### Update Medical Information
```json
{
  "bloodGroup": "O+",
  "allergies": ["Penicillin", "Pollen"],
  "chronicConditions": [],
  "medications": ["Aspirin"],
  "insuranceProvider": "XYZ Health Insurance",
  "insurancePolicyNumber": "POL123456789",
  "insuranceValidUntil": "2027-12-31",
  "lastCheckupDate": "2026-01-15"
}
```

### Add Education Record
```json
{
  "degree": "Bachelor of Technology",
  "institution": "MIT",
  "university": "MIT University",
  "fieldOfStudy": "Computer Science",
  "startDate": "2015-08-01",
  "endDate": "2019-05-31",
  "grade": "3.8 GPA",
  "achievements": "Dean's List"
}
```

### Add Work History
```json
{
  "companyName": "Tech Corp",
  "designation": "Software Engineer",
  "department": "Engineering",
  "startDate": "2019-07-01",
  "endDate": "2024-12-31",
  "currentlyWorking": false,
  "responsibilities": "Developed web applications using React and Node.js",
  "reasonForLeaving": "Career growth",
  "managerName": "Jane Smith",
  "managerContact": "jane@techcorp.com",
  "salary": 80000
}
```

### Assign Asset
```json
{
  "assetType": "Laptop",
  "assetId": "LAP-2024-001",
  "serialNumber": "SN123456789",
  "assignedDate": "2026-01-27",
  "status": "assigned",
  "condition": "New"
}
```

### Update Pre-Joining Task
```json
{
  "completed": true,
  "completedBy": "HR001",
  "notes": "All documents verified successfully"
}
```

### Update Day 1 Task (Buddy Assignment)
```json
{
  "completed": true,
  "completedBy": "HR001",
  "buddyEmployeeId": "EMP050",
  "buddyName": "Sarah Johnson"
}
```

### Complete Exit Interview
```json
{
  "feedback": {
    "workEnvironment": "Excellent",
    "management": "Very good",
    "compensation": "Competitive",
    "careerGrowth": "Good opportunities",
    "workLifeBalance": "Satisfactory",
    "wouldRecommend": true,
    "wouldRejoin": true,
    "suggestions": "More flexible work hours"
  },
  "notes": "Employee leaving on good terms"
}
```

### Update HR Clearance (Final Settlement)
```json
{
  "finalSettlement.calculated": true,
  "finalSettlement.totalAmount": 15000,
  "finalSettlement.processed": true,
  "finalSettlement.paymentMode": "Bank Transfer"
}
```

---

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* ... data object ... */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 2,
    "inProgress": 5,
    "completed": 3
  }
}
```

---

## Document Types Enum

Use these values for `documentType` field:

**Identity Documents:**
- `AADHAAR_CARD`
- `PAN_CARD`
- `PASSPORT`
- `DRIVING_LICENSE`
- `VOTER_ID`

**Educational Documents:**
- `DEGREE_CERTIFICATE`
- `MARKSHEET`
- `EXPERIENCE_CERTIFICATE`
- `RELIEVING_LETTER`

**Employment Documents:**
- `OFFER_LETTER`
- `APPOINTMENT_LETTER`
- `SALARY_SLIP`
- `FORM_16`
- `BANK_STATEMENT`

**Medical Documents:**
- `MEDICAL_CERTIFICATE`
- `INSURANCE_CARD`
- `VACCINATION_CERTIFICATE`

**Other:**
- `PROFILE_PHOTO`
- `RESUME`
- `REFERENCE_LETTER`
- `OTHER`

---

## Testing Workflow

### Complete Onboarding Workflow Test

1. **Create employee** (use existing endpoint)
2. **Create onboarding checklist**
3. **Upload documents**
4. **Update pre-joining tasks**
5. **Complete Day 1 tasks**
6. **Assign IT assets**
7. **Complete HR tasks**
8. **Schedule and complete trainings**
9. **Conduct 30-60-90 day reviews**
10. **Mark onboarding complete**

### Complete Offboarding Workflow Test

1. **Initiate offboarding**
2. **Schedule exit interview**
3. **Complete exit interview**
4. **Record asset returns**
5. **Revoke all access**
6. **Update knowledge transfer**
7. **Calculate final settlement**
8. **Issue documents**
9. **Obtain department clearances**
10. **Complete offboarding**

---

## Notes

- Replace `:employeeId`, `:documentId`, `:taskName`, etc. with actual values
- All dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- File uploads require `multipart/form-data` content type
- Most endpoints require JSON content type: `application/json`
- Add authentication headers when authentication is enabled

---

## Monitoring & Logs

Server logs will show:
- Request/response details
- Database operations
- Error messages
- File upload confirmations

Check terminal output for real-time logs.

---

**Server Started:** January 27, 2026  
**Base URL:** http://localhost:5000/api  
**Status:** ✅ All endpoints operational
