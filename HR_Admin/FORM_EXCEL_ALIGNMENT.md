# Employee Form & Excel Template Alignment

## Current Mismatch

### Excel Template Structure (9 Steps, 49 Fields)

**Step 1: Basic Information (7 fields)**
- First Name *
- Middle Name
- Last Name *
- Date of Birth *
- Gender *
- Blood Group
- Marital Status *

**Step 2: Employment Details (10 fields)**
- Employee ID (Auto-generated if empty)
- Date of Joining *
- Department *
- Designation *
- Role *
- Employment Status *
- Location *
- Reporting Manager
- Worker Type *
- Leave Plan *

**Step 3: Contact Information (5 fields)**
- Personal Email *
- Official Email (Auto-generated)
- Phone Number *
- Emergency Contact Name
- Emergency Contact Phone

**Step 4: Family & Personal (9 fields)**
- Father's Name
- Mother's Name
- Spouse's Name
- Number of Children
- Current Address
- Permanent Address
- City
- State
- Pincode

**Step 5: PF Details (4 fields)**
- PF Number
- UAN Number
- PF Joining Date
- Previous PF Number

**Step 6: ESI Details (3 fields)**
- ESI Number
- ESI Joining Date
- Dispensary

**Step 7: Aadhaar Details (3 fields)**
- Aadhaar Number
- Aadhaar Name
- Aadhaar DOB

**Step 8: PAN Details (2 fields)**
- PAN Number
- PAN Name

**Step 9: Bank Details (6 fields)**
- Bank Name
- Account Number
- IFSC Code
- Branch Name
- Account Holder Name
- Account Type

---

## Changes Required in AddEditEmployeeModal

### Step 1: Basic Information
**Remove:**
- Email (move to Step 3)
- Password (move to Step 3)
- Dial Code (remove)
- Mobile Number (move to Step 3 as Phone Number)

**Add:**
- Blood Group
- Marital Status

**Final Step 1 Fields:**
1. First Name *
2. Middle Name
3. Last Name *
4. Date of Birth *
5. Gender *
6. Blood Group
7. Marital Status *

### Step 2: Employment Details
**Remove:**
- Contract End Date
- Legal Entity
- Sub Department
- Business Unit
- Secondary Job Title
- Hire Type (used only for ID generation)
- Dotted Line Manager

**Add:**
- Employee ID (auto-generated, read-only)
- Role * (e.g., Developer, Manager, Analyst)
- Employment Status * (Active, Inactive, On Leave, Terminated)
- Reporting Manager (text or dropdown)

**Keep:**
- Date of Joining *
- Department *
- Designation *
- Location *
- Worker Type *
- Leave Plan *

**Final Step 2 Fields:**
1. Employee ID (Auto-generated, shown when form opens for add mode)
2. Date of Joining *
3. Department *
4. Designation *
5. Role *
6. Employment Status * (default: Active)
7. Location *
8. Reporting Manager
9. Worker Type *
10. Leave Plan *

### Step 3: Contact Information
**Add:**
- Personal Email * (move from Step 1)
- Official Email (Auto-generated based on name, read-only)
- Phone Number * (was Mobile Number in Step 1)
- Emergency Contact Name
- Emergency Contact Phone
- Password * (for login, only in add mode)

**Remove:**
- Work Phone
- Residence Number

**Final Step 3 Fields:**
1. Personal Email *
2. Official Email (Auto-generated, read-only)
3. Phone Number *
4. Emergency Contact Name
5. Emergency Contact Phone
6. Password * (only for new employees)

### Step 4: Family & Personal
**Remove:**
- Marriage Date
- Spouse Gender
- Physically Handicapped
- Nationality

**Add:**
- Number of Children
- Current Address
- Permanent Address
- City
- State
- Pincode

**Keep:**
- Father Name
- Mother Name
- Spouse Name

**Final Step 4 Fields:**
1. Father's Name
2. Mother's Name
3. Spouse's Name
4. Number of Children
5. Current Address
6. Permanent Address
7. City
8. State
9. Pincode

### Step 5: PF Details
**Replace all current fields with:**
1. PF Number
2. UAN Number
3. PF Joining Date
4. Previous PF Number

### Step 6: ESI Details
**Replace all current fields with:**
1. ESI Number
2. ESI Joining Date
3. Dispensary

### Step 7: Aadhaar Details
**Keep these simplified fields:**
1. Aadhaar Number
2. Aadhaar Name (Full Name as Per Aadhaar)
3. Aadhaar DOB

**Remove:**
- Enrollment Number
- Address As In Aadhaar
- Gender As In Aadhaar

### Step 8: PAN Details
**Keep these simplified fields:**
1. PAN Number
2. PAN Name (Full Name as Per PAN)

**Remove:**
- PAN Card Available toggle
- DOB In PAN
- Parents Name As Per PAN

### Step 9: Bank Details
**Keep these simplified fields:**
1. Bank Name
2. Account Number
3. IFSC Code
4. Branch Name
5. Account Holder Name
6. Account Type

**Remove:**
- Salary Payment Mode
- Name On Account (use Account Holder Name)

---

## Implementation Notes

1. **Employee ID**: Auto-generate when form opens in add mode (based on Hire Type selected in a preliminary field or Worker Type)
2. **Official Email**: Auto-generate from First + Last name when both are filled
3. **Password**: Only show in add mode, not in edit mode
4. **Role**: Add dropdown with common roles: Developer, Manager, Team Lead, Analyst, Designer, etc.
5. **Employment Status**: Default to "Active" in add mode
6. **Reporting Manager**: Allow entering name or Employee ID
7. **Blood Group**: Dropdown with A+, A-, B+, B-, AB+, AB-, O+, O-
8. **Marital Status**: Dropdown with Single, Married, Divorced, Widowed
9. **Worker Type**: Full-Time, Part-Time, Contract, Intern
10. **Account Type**: Savings, Current

---

## Field Count Summary

| Step | Name | Excel Fields | Current Form | Aligned Form |
|------|------|--------------|--------------|--------------|
| 1 | Basic Information | 7 | 8 | 7 |
| 2 | Employment Details | 10 | 15 | 10 |
| 3 | Contact Information | 5 (+password) | 3 | 6 |
| 4 | Family & Personal | 9 | 9 | 9 |
| 5 | PF Details | 4 | 6 | 4 |
| 6 | ESI Details | 3 | 6 | 3 |
| 7 | Aadhaar Details | 3 | 6 | 3 |
| 8 | PAN Details | 2 | 5 | 2 |
| 9 | Bank Details | 6 | 6 | 6 |
| **Total** | | **49** | **64** | **50** |

---

## Next Steps

1. Update formData state to match Excel template fields
2. Restructure each step's JSX to show correct fields
3. Update validation logic
4. Update submit handler to map form data correctly
5. Add auto-generation for Employee ID and Official Email
6. Test with bulk upload to ensure data consistency
