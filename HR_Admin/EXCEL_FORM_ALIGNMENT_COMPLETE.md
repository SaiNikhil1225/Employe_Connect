# Excel Bulk Upload Template - Form Alignment Complete

## Summary
The Excel bulk upload template has been successfully updated to match the 9-step employee form structure with all 66 fields aligned.

## Changes Made

### 1. **EmployeeRow Interface** (`excelService.ts` lines 46-117)
Updated to include all 66 fields organized in 9 steps:
- **Step 1: Basic Information** (11 fields)
- **Step 2: Employment Details** (14 fields)
- **Step 3: Contact Information** (3 fields)
- **Step 4: Family & Personal** (9 fields)
- **Step 5: PF Details** (6 fields)
- **Step 6: ESI & Other Statutory** (6 fields)
- **Step 7: Aadhaar Details** (6 fields)
- **Step 8: PAN Details** (5 fields)
- **Step 9: Bank Details** (6 fields)

### 2. **Column Definitions** (`excelService.ts` lines 140-233)
All 66 columns defined with:
- Proper headers (with * for required fields)
- Appropriate widths
- Correct field keys matching the interface

### 3. **Dropdown Validations** (`excelService.ts` lines 254-276)
Added comprehensive dropdowns for:
- **Dial Code** (Column H): +1, +44, +91, +61
- **Gender** (Column J): Male, Female, Other
- **Legal Entity** (Column O): Acuvate Software Pvt. Ltd., Acuvate Inc., Acuvate UK Ltd.
- **Business Unit** (Column S): Microsoft, AWS, Acuvate IP, DevOps
- **Worker Type** (Column W): Full-time, Part-time, Contract, Intern
- **Hire Type** (Column X): Employee, Contractor, Consultant, Intern
- **Location** (Column V): Bangalore, Hyderabad, Mumbai, Delhi, USA, UK, Remote
- **Leave Plan** (Column AA): Probation, Acuvate, Confirmation, Consultant, UK
- **Payment Mode** (Column BM): Bank Transfer, Cash, Cheque
- **Marital Status** (Column AF): Single, Married, Divorced, Widowed
- **Blood Group** (Column AL): A+, A-, B+, B-, AB+, AB-, O+, O-
- **Yes/No Fields**: Multiple columns for PF, ESI, PAN availability

### 4. **Sample Data** (`excelService.ts` lines 286-368)
Complete sample row with all 66 fields:
```
Employee ID: (auto-generated)
Display Name: John Michael Smith
First Name: John
Middle Name: Michael
Last Name: Smith
Email: john.smith@acuvate.com
Password: Welcome@123
Dial Code: +91
Mobile Number: 9876543210
Gender: Male
Date of Birth: 15/01/1990
... (all 66 fields populated)
```

### 5. **Cell Notes** (`excelService.ts` lines 377-381)
Updated for new column positions:
- **A2**: Employee ID - Auto-generates based on Hire Type
- **C2**: First Name - Enter as per official documents
- **F2**: Email - Will be used for login
- **G2**: Password - For employee login (must be secure)
- **AA2**: Leave Plan - Select appropriate plan

### 6. **Instructions Sheet** (`excelService.ts` lines 387-455)
Complete rewrite with 9-step process:
- Each step clearly documented with field counts
- Required vs optional fields clearly marked
- Important notes about auto-generation
- Hire Type to Employee ID format mapping
- Date format requirements
- Dropdown usage guidelines

### 7. **Reference Data Sheet** (`excelService.ts` lines 470-520)
Expanded to include all dropdown options:
- 13 columns of reference data
- Leave Plans with descriptions
- All new dropdown constants
- Yes/No options
- Covers all selection fields in the template

### 8. **Parser Header Mapping** (`excelService.ts` lines 567-655)
Complete `headerToKey` mapping for all 66 fields:
- Organized by 9 steps
- Matches exact column headers from template
- Maps to correct interface field names
- Handles all required and optional fields

## Field Alignment Details

### Fields Matching Form Structure

| Step | Form Fields | Excel Columns | Status |
|------|-------------|---------------|--------|
| 1. Basic Info | 11 | 11 (A-K) | ✅ Aligned |
| 2. Employment | 14 | 14 (L-AA) | ✅ Aligned |
| 3. Contact | 3 | 3 (AB-AD) | ✅ Aligned |
| 4. Family | 9 | 9 (AE-AM) | ✅ Aligned |
| 5. PF | 6 | 6 (AN-AS) | ✅ Aligned |
| 6. ESI | 6 | 6 (AT-AY) | ✅ Aligned |
| 7. Aadhaar | 6 | 6 (AZ-BE) | ✅ Aligned |
| 8. PAN | 5 | 5 (BF-BJ) | ✅ Aligned |
| 9. Bank | 6 | 6 (BK-BQ) | ✅ Aligned |
| **Total** | **66** | **66** | ✅ **Complete** |

### New Fields Added to Excel (Not in Old Template)

**Step 1: Basic Information**
- `employeeId` - Auto-generated based on hire type
- `displayName` - Auto-generated from first + last name
- `email` - Official email for login
- `password` - Initial login password
- `dialCode` - Country code for mobile

**Step 2: Employment**
- `legalEntity` - Company entity
- `subDepartment` - For organizational structure
- `businessUnit` - Project/practice area
- `hireType` - Determines employee ID format (INE/IRC/ICA/IAU)
- `dottedLineManagerId` - Matrix reporting
- `reportingManagerId` - Direct manager

**Step 4: Family**
- `marriageDate` - For anniversary tracking
- `spouseGender` - For dependent benefits
- `physicallyHandicapped` - For statutory compliance
- `nationality` - For visa/work permit tracking

**Step 5: PF**
- `pfEstablishmentId` - Employer PF ID
- `pfDetailsAvailable` - Yes/No flag
- `nameOnPFAccount` - As per PF records

**Step 6: ESI**
- `esiEligible` - Eligibility flag
- `employerESINumber` - Employer ESI ID
- `esiDetailsAvailable` - Yes/No flag
- `ptEstablishmentId` - Professional Tax ID
- `lwfEligible` - Labour Welfare Fund flag

**Step 7: Aadhaar**
- `enrollmentNumber` - Aadhaar enrollment ID
- `addressAsInAadhaar` - For verification
- `genderAsInAadhaar` - For matching

**Step 8: PAN**
- `panCardAvailable` - Yes/No flag
- `dobInPAN` - Date of birth as per PAN
- `parentsNameAsPerPAN` - As per PAN card

**Step 9: Bank**
- `salaryPaymentMode` - Bank Transfer/Cash/Cheque
- Changed `accountHolderName` → `nameOnAccount`
- Changed `branchName` → `branch`

### Fields Removed from Excel (Were in Old Template)

These fields were in the old template but not in the form:
- `role` - Replaced by designation
- `employmentStatus` - Removed (not in form)
- `emergencyContactName` - Not in form
- `emergencyContactPhone` - Not in form
- `numberOfChildren` - Not in form
- `currentAddress` - Not in form
- `permanentAddress` - Not in form
- `city` - Not in form
- `state` - Not in form
- `pincode` - Not in form
- `uanNumber` - Changed to just `uan`
- `previousPfNumber` - Not in form
- `esiJoiningDate` - Not in form
- `dispensary` - Not in form
- `aadhaarName` → Changed to `fullNameAsPerAadhaar`
- `aadhaarDob` → Changed to `dobInAadhaar`
- `panName` → Changed to `fullNameAsPerPAN`
- `accountType` - Not in form

## Important Notes

### Auto-Generation Logic
The template now supports two auto-generated fields:

1. **Employee ID** - Based on `hireType`:
   - Employee → `INE` prefix
   - Contractor → `IRC` prefix
   - Consultant → `ICA` prefix
   - Intern → `IAU` prefix

2. **Display Name** - Concatenates `firstName + " " + middleName + " " + lastName`

### Required Fields (marked with *)
- **Step 1**: First Name, Last Name, Email, Mobile Number, Gender, Date of Birth
- **Step 2**: Date of Joining, Legal Entity, Department, Business Unit, Designation, Location, Worker Type, Hire Type, Leave Plan
- All other fields are optional

## Next Steps & Recommendations

### ✅ Completed
1. EmployeeRow interface updated (66 fields)
2. Column definitions aligned (all 9 steps)
3. Dropdown validations configured (13 different dropdowns)
4. Sample data updated (complete example)
5. Cell notes updated (correct column references)
6. Instructions sheet rewritten (9-step documentation)
7. Reference data sheet expanded (all dropdowns)
8. Parser headerToKey mapping updated (66 field mappings)

### ⚠️ Requires Attention

**bulkUploadService.ts Validation Logic**
The validation service still references old field structure. It needs updates:

1. **Remove validations for deleted fields**:
   - `role` (line ~173)
   - `employmentStatus` (line ~180)
   - `maritalStatus` as required (line ~100) - now optional

2. **Add validations for new required fields**:
   - `email` - Must be valid and unique
   - `legalEntity` - Must be selected
   - `businessUnit` - Must be selected
   - `hireType` - Must be selected
   - `workerType` - Must be selected

3. **Update auto-generation logic**:
   - Employee ID should be generated based on `hireType`
   - Display Name should be generated from first + last name

4. **Add dropdown value validations**:
   - Validate against LEGAL_ENTITIES constant
   - Validate against BUSINESS_UNITS constant
   - Validate against HIRE_TYPES constant
   - Validate against WORKER_TYPES constant
   - Validate against LOCATIONS constant
   - Validate Yes/No fields accept only "Yes" or "No"

5. **Update field mappings in processEmployees()**:
   - Map new fields to employee model
   - Handle new statutory fields (PF, ESI, Aadhaar, PAN)
   - Handle new employment fields (legal entity, business unit, hire type)

## Testing Checklist

Before deploying, test the following:

- [ ] Download Excel template from bulk upload modal
- [ ] Verify all 66 columns present in correct order
- [ ] Verify all dropdown menus work in Excel
- [ ] Verify sample data is complete and correct
- [ ] Verify Instructions sheet is readable and helpful
- [ ] Verify Reference Data sheet has all options
- [ ] Fill template with test data
- [ ] Upload filled template
- [ ] Verify parsing works correctly
- [ ] Verify validation catches errors in new fields
- [ ] Verify auto-generation works for Employee ID and Display Name
- [ ] Verify employees are created with all fields populated correctly

## File Locations

- **Excel Service**: `server/src/services/excelService.ts`
- **Bulk Upload Service**: `server/src/services/bulkUploadService.ts` (needs updates)
- **Employee Model**: `server/src/models/Employee.ts` (verify schema matches)
- **Add Employee Form**: `src/components/employees/AddEditEmployeeModal.tsx` (reference)

## Conclusion

The Excel bulk upload template is now fully aligned with the 9-step employee form structure. All 66 fields are present in the same order and organization as the form. The template includes comprehensive dropdowns, sample data, and documentation.

**Next Action Required**: Update `bulkUploadService.ts` validation logic to match the new field structure and add validations for new required fields.
