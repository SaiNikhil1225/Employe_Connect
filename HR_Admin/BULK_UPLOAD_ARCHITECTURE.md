# Employee Bulk Upload - Technical Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │            Employee Management Page                          │   │
│  │  ┌──────────────┐                                            │   │
│  │  │ Bulk Upload  │ ──────────────────┐                       │   │
│  │  │   Button     │                    │                       │   │
│  │  └──────────────┘                    │                       │   │
│  └─────────────────────────────────────┼───────────────────────┘   │
│                                         │                            │
│  ┌─────────────────────────────────────▼───────────────────────┐   │
│  │                  BulkUploadModal                             │   │
│  │                                                               │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ Step 1: Upload File                                    │  │   │
│  │  │  • Download template button                            │  │   │
│  │  │  • Drag & drop area                                    │  │   │
│  │  │  • File browse button                                  │  │   │
│  │  │  • File validation (type, size)                        │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                         │                                     │   │
│  │                         ▼                                     │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ Step 2: Validating                                     │  │   │
│  │  │  • Progress bar                                        │  │   │
│  │  │  • Loading animation                                   │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                         │                                     │   │
│  │                         ▼                                     │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ Step 3: Validation Report                              │  │   │
│  │  │  • Summary cards (valid/errors/warnings/auto-gen)      │  │   │
│  │  │  • Leave plan distribution                             │  │   │
│  │  │  • Detailed error list                                 │  │   │
│  │  │  • Fix errors or proceed                               │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                         │                                     │   │
│  │                         ▼                                     │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ Step 4: Processing                                     │  │   │
│  │  │  • Real-time progress (SSE)                            │  │   │
│  │  │  • Current employee being processed                    │  │   │
│  │  │  • Count: X of Y created                               │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                         │                                     │   │
│  │                         ▼                                     │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ Step 5: Complete                                       │  │   │
│  │  │  • Success message                                     │  │   │
│  │  │  • Summary of created employees                        │  │   │
│  │  │  • Upload more or close options                        │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │ HTTP/SSE
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                        BACKEND (Node.js)                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     API Routes                                  │  │
│  │  /api/employees/bulk-upload/                                    │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │ GET /template                                           │    │  │
│  │  │  └─► Generate and download Excel template              │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  │           │                                                      │  │
│  │           ▼                                                      │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │ POST /validate                                          │    │  │
│  │  │  • Multer file upload                                   │    │  │
│  │  │  • File validation (type, size, rows)                   │    │  │
│  │  │  └─► Parse Excel & validate data                        │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  │           │                                                      │  │
│  │           ▼                                                      │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │ POST /process                                           │    │  │
│  │  │  • Multer file upload                                   │    │  │
│  │  │  • Parse Excel                                          │    │  │
│  │  │  • Process employees with SSE progress                  │    │  │
│  │  │  └─► Create employee records                            │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   Services Layer                                │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────┐      │  │
│  │  │ ExcelService                                          │      │  │
│  │  │  • generateTemplate()                                 │      │  │
│  │  │    - Creates 3-sheet workbook                         │      │  │
│  │  │    - Adds data validations                            │      │  │
│  │  │    - Styles headers                                   │      │  │
│  │  │    - Adds sample data                                 │      │  │
│  │  │  • parseExcelFile()                                   │      │  │
│  │  │    - Reads Excel file                                 │      │  │
│  │  │    - Parses 49 fields per row                         │      │  │
│  │  │    - Converts dates                                   │      │  │
│  │  │    - Returns EmployeeRow[]                            │      │  │
│  │  └──────────────────────────────────────────────────────┘      │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────┐      │  │
│  │  │ BulkUploadService                                     │      │  │
│  │  │  • validateEmployees()                                │      │  │
│  │  │    - Check required fields                            │      │  │
│  │  │    - Validate formats                                 │      │  │
│  │  │    - Check duplicates                                 │      │  │
│  │  │    - Generate validation report                       │      │  │
│  │  │  • processEmployees()                                 │      │  │
│  │  │    - Auto-generate Employee ID                        │      │  │
│  │  │    - Auto-generate Official Email                     │      │  │
│  │  │    - Hash default password                            │      │  │
│  │  │    - Create employee records                          │      │  │
│  │  │    - Report progress via callback                     │      │  │
│  │  └──────────────────────────────────────────────────────┘      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             │ Mongoose ODM
                             │
┌────────────────────────────▼───────────────────────────────────────────┐
│                           DATABASE (MongoDB)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     Employees Collection                        │    │
│  │                                                                  │    │
│  │  {                                                               │    │
│  │    employeeId: "EMP00001",                                       │    │
│  │    firstName: "John",                                            │    │
│  │    lastName: "Doe",                                              │    │
│  │    dateOfBirth: Date,                                            │    │
│  │    gender: "Male",                                               │    │
│  │    leavePlan: "Confirmation",                                    │    │
│  │    personalEmail: "john@gmail.com",                              │    │
│  │    officialEmail: "john.doe@company.com",                        │    │
│  │    password: "hashed_password",                                  │    │
│  │    ... (41 more fields)                                          │    │
│  │  }                                                               │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│ HR User     │
└──────┬──────┘
       │
       │ 1. Click "Bulk Upload"
       ▼
┌─────────────────────┐
│ BulkUploadModal     │
│ (Step 1: Upload)    │
└──────┬──────────────┘
       │
       │ 2. Download Template
       ▼
┌─────────────────────┐      ┌──────────────────────┐
│ GET /template       │─────►│ ExcelService         │
└─────────────────────┘      │ .generateTemplate()  │
       │                      └──────────────────────┘
       │ 3. Excel file (.xlsx)
       ▼
┌─────────────────────┐
│ HR fills data       │
│ in Excel            │
└──────┬──────────────┘
       │
       │ 4. Upload filled file
       ▼
┌─────────────────────┐
│ BulkUploadModal     │
│ (Step 2: Validate)  │
└──────┬──────────────┘
       │
       │ 5. POST /validate (FormData)
       ▼
┌─────────────────────┐      ┌──────────────────────┐
│ Multer              │─────►│ ExcelService         │
│ File Upload         │      │ .parseExcelFile()    │
└─────────────────────┘      └──────┬───────────────┘
                                     │
                                     │ EmployeeRow[]
                                     ▼
                             ┌──────────────────────┐
                             │ BulkUploadService    │
                             │ .validateEmployees() │
                             └──────┬───────────────┘
                                     │
                                     │ ValidationReport
                                     ▼
┌─────────────────────┐      ┌──────────────────────┐
│ BulkUploadModal     │◄─────│ {                    │
│ (Step 3: Report)    │      │   totalRows: 10,     │
└──────┬──────────────┘      │   validRows: 9,      │
       │                      │   errorRows: 1,      │
       │                      │   errors: [...]      │
       │ 6. Fix errors        │ }                    │
       │    and re-upload     └──────────────────────┘
       │    OR
       │ 7. Click "Create Employees"
       ▼
┌─────────────────────┐
│ BulkUploadModal     │
│ (Step 4: Process)   │
└──────┬──────────────┘
       │
       │ 8. POST /process (FormData)
       ▼
┌─────────────────────┐      ┌──────────────────────┐
│ Multer              │─────►│ ExcelService         │
│ File Upload         │      │ .parseExcelFile()    │
└─────────────────────┘      └──────┬───────────────┘
                                     │
                                     │ EmployeeRow[]
                                     ▼
                             ┌──────────────────────┐
                             │ BulkUploadService    │
                             │ .processEmployees()  │
                             └──────┬───────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │ Employee │    │ Employee │    │ Employee │
            │ Record 1 │    │ Record 2 │    │ Record N │
            └────┬─────┘    └────┬─────┘    └────┬─────┘
                 │               │               │
                 └───────┬───────┴───────┬───────┘
                         │               │
                         ▼               │ SSE Progress Updates
                 ┌──────────────┐        │
                 │   MongoDB    │        │
                 │  Employees   │        │
                 └──────────────┘        │
                                         ▼
                                 ┌──────────────────────┐
                                 │ data: {              │
                                 │   created: 5,        │
                                 │   total: 10,         │
                                 │   current: "John"    │
                                 │ }                    │
                                 └──────┬───────────────┘
                                        │
                                        ▼
                                ┌──────────────────────┐
                                │ BulkUploadModal      │
                                │ (Step 5: Complete)   │
                                └──────────────────────┘
```

## Component Hierarchy

```
EmployeeManagement (Page)
│
├─── AddEditEmployeeModal (Individual employee)
│
├─── UploadEmployeesModal (Legacy upload)
│
└─── BulkUploadModal (NEW - Bulk upload)
     │
     ├─── Step 1: Upload
     │    ├─── Download Template Button
     │    ├─── Drag & Drop Area
     │    └─── File Browse Input
     │
     ├─── Step 2: Validating
     │    └─── Progress Bar
     │
     ├─── Step 3: Validation Report
     │    ├─── Summary Cards
     │    │    ├─── Valid Rows (Green)
     │    │    ├─── Error Rows (Red)
     │    │    ├─── Warning Rows (Yellow)
     │    │    └─── Auto-Generated (Blue)
     │    ├─── Leave Plan Distribution
     │    └─── Errors List
     │         └─── Error Items
     │              ├─── Severity Icon
     │              ├─── Row Number
     │              ├─── Field Name
     │              ├─── Error Message
     │              └─── Current Value
     │
     ├─── Step 4: Processing
     │    ├─── Loading Animation
     │    ├─── Progress Bar
     │    └─── Status Text
     │
     └─── Step 5: Complete
          ├─── Success Icon
          ├─── Summary Text
          ├─── Close Button
          └─── Upload More Button
```

## File Structure

```
Employe_Connect-main/
│
├── src/
│   ├── components/
│   │   └── employee/
│   │       └── BulkUploadModal.tsx          (NEW - Main upload UI)
│   │
│   └── pages/
│       └── hr/
│           └── EmployeeManagement.tsx       (UPDATED - Added bulk upload button)
│
├── server/
│   └── src/
│       ├── routes/
│       │   └── bulkUpload.ts                (NEW - API routes)
│       │
│       ├── services/
│       │   ├── excelService.ts              (NEW - Excel operations)
│       │   └── bulkUploadService.ts         (NEW - Validation & processing)
│       │
│       └── server.ts                        (UPDATED - Added route)
│
├── BULK_UPLOAD_IMPLEMENTATION.md            (NEW - Technical doc)
├── BULK_UPLOAD_USER_GUIDE.md                (NEW - User guide)
└── BULK_UPLOAD_ARCHITECTURE.md              (This file)
```

## Technology Stack

### Frontend
- **React**: UI framework
- **TypeScript**: Type safety
- **Shadcn UI**: Component library
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **Fetch API**: HTTP requests

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **Multer**: File upload middleware
- **ExcelJS**: Excel file generation/parsing
- **Bcrypt**: Password hashing
- **Mongoose**: MongoDB ODM

### Database
- **MongoDB**: Document database

## Security Considerations

1. **File Upload**
   - File type validation (.xlsx only)
   - File size limit (5MB)
   - Memory storage (no disk writes)
   - Sanitized filenames

2. **Data Validation**
   - Required field checks
   - Format validations
   - Duplicate checks
   - Age verification

3. **Password Security**
   - Bcrypt hashing
   - Default password: Welcome@123
   - Users should change on first login

4. **API Security**
   - Rate limiting (inherited from server config)
   - Input sanitization
   - Error handling
   - Authentication required (existing middleware)

## Performance Optimization

1. **Frontend**
   - Lazy loading of modal
   - Progress indicators
   - SSE for real-time updates
   - No page reload needed

2. **Backend**
   - Stream processing
   - Memory-efficient Excel parsing
   - Batch database operations
   - Connection pooling (MongoDB)

3. **Limits**
   - Max file size: 5MB
   - Max rows: 1000
   - Prevents server overload

## Error Handling

### Frontend
- File type validation
- File size validation
- Network error handling
- User-friendly error messages
- Retry mechanism

### Backend
- Multer error handling
- Excel parsing errors
- Database errors
- Validation errors
- Proper HTTP status codes

## Testing Strategy

### Unit Tests (Recommended)
- ExcelService.generateTemplate()
- ExcelService.parseExcelFile()
- BulkUploadService.validateEmployees()
- BulkUploadService.processEmployees()

### Integration Tests (Recommended)
- Template download
- File upload and validation
- Employee creation
- SSE streaming

### E2E Tests (Recommended)
- Complete upload workflow
- Error handling
- Progress tracking
- Success confirmation

## Monitoring & Logging

### Recommended Logging Points
1. Template download requests
2. File upload attempts
3. Validation results
4. Processing start/end
5. Individual employee creation
6. Errors and exceptions

### Metrics to Track
- Upload success rate
- Average validation time
- Average processing time
- Error frequency by type
- Employee creation rate

---

**Version**: 1.0.0  
**Last Updated**: February 9, 2026  
**Maintained By**: Development Team
