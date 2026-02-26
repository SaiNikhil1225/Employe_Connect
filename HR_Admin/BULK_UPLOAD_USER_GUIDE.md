# Quick Start Guide: Employee Bulk Upload

## For HR Users

### Step 1: Access Bulk Upload
1. Navigate to **Employee Management** page
2. Click the **"Bulk Upload"** button (next to "Add Employee")

### Step 2: Download Template
1. In the Bulk Upload modal, click **"Download Excel Template"**
2. The template will download as `Employee_Bulk_Upload_Template.xlsx`
3. Open the file in Microsoft Excel or Google Sheets

### Step 3: Understand the Template

The template has **3 sheets**:

#### Sheet 1: Employee Data
- Contains 49 columns for all employee information
- Blue header row with field names
- Row 2 has sample data (delete before uploading)
- Some columns have dropdown lists (Gender, Blood Group, Marital Status, Employment Status, Leave Plan)

#### Sheet 2: Instructions
- Detailed instructions for each field
- Important notes about format requirements
- Leave plan descriptions
- Upload steps

#### Sheet 3: Reference Data
- Master data for dropdowns
- Leave plan options with descriptions

### Step 4: Fill Employee Data

#### Required Fields (marked with *)
You MUST fill these fields:
1. First Name
2. Last Name
3. Date of Birth (DD/MM/YYYY)
4. Gender (use dropdown)
5. Marital Status (use dropdown)
6. Date of Joining (DD/MM/YYYY)
7. Department
8. Designation
9. Role
10. Employment Status (use dropdown)
11. Location
12. Worker Type
13. **Leave Plan** (use dropdown - see options below)
14. Personal Email
15. Phone Number (10 digits)

#### Auto-Generated Fields (optional - leave empty)
- **Employee ID**: Will be auto-generated as EMP00001, EMP00002, etc.
- **Official Email**: Will be auto-generated as firstname.lastname@company.com

#### Leave Plan Options
Select one from dropdown:
- **Probation**: For employees in probation period
- **Acuvate**: For employees on Acuvate projects
- **Confirmation**: For confirmed/permanent employees
- **Consultant**: For consultants/contractors
- **UK**: For UK-based employees

#### Tips for Filling Data
- Use the **dropdown arrows** for predefined fields
- Dates must be in **DD/MM/YYYY** format (e.g., 15/01/1990)
- Phone should be **10 digits** without country code
- Don't worry about Employee ID and Official Email - they'll be generated automatically
- Delete the sample data row (row 2) before uploading

### Step 5: Upload the File

1. Save your Excel file
2. In the Bulk Upload modal, either:
   - **Drag and drop** the file into the upload area, OR
   - Click **"Browse Files"** and select the file
3. Click **"Upload & Validate"**

### Step 6: Review Validation Report

The system will validate your data and show:

#### Summary Cards
- **Green**: Number of valid rows
- **Red**: Number of errors
- **Yellow**: Number of warnings
- **Blue**: Number of auto-generated fields

#### Leave Plan Distribution
- Shows how many employees for each leave plan

#### Errors List (if any)
- Each error shows:
  - Row number in Excel
  - Field name
  - Current value
  - Error message
  - Severity (error/warning/info)

### Step 7: Fix Errors (if needed)

If you see errors:
1. Note the row numbers and error messages
2. Open your Excel file
3. Fix the errors (the validation report tells you exactly what's wrong)
4. Save the file
5. Upload again
6. Repeat until you see "0 errors"

### Step 8: Create Employees

Once validation passes (0 errors):
1. Click **"Create X Employees"** button
2. Watch the progress bar
3. See real-time updates as each employee is created
4. Wait for completion message

### Step 9: Done!

- All employees are now created in the system
- Default password for all: **Welcome@123**
- Employees will appear in the Employee Management list
- You can:
  - Click "Close" to exit
  - Click "Upload More" to add more employees

## Common Issues & Solutions

### Issue: "Invalid file type"
**Solution**: Make sure you're uploading a `.xlsx` file (not `.csv` or `.txt`)

### Issue: "No employee data found"
**Solution**: 
- Make sure you filled data starting from row 3 (row 2 is sample)
- Check that first name is filled for each employee

### Issue: "Email already exists"
**Solution**: 
- Check if employee is already in the system
- Use a different personal email address

### Issue: "Phone Number already exists"
**Solution**: 
- Check if employee is already in the system
- Verify the phone number is correct

### Issue: "Invalid PAN format"
**Solution**: 
- PAN must be in format: ABCDE1234F
- 5 letters, 4 digits, 1 letter
- All uppercase

### Issue: "Aadhaar must be 12 digits"
**Solution**: 
- Enter 12-digit Aadhaar number
- Spaces are optional (1234 5678 9012 or 123456789012)

### Issue: "Date of Birth: Employee must be at least 18 years old"
**Solution**: 
- Check the date is correct
- Make sure format is DD/MM/YYYY (not MM/DD/YYYY)

### Issue: "Invalid Leave Plan"
**Solution**: 
- Use the dropdown in Excel (don't type manually)
- Valid options: Probation, Acuvate, Confirmation, Consultant, UK

## Tips for Success

1. **Start Small**: Try uploading 2-3 employees first to test
2. **Use Dropdowns**: Always use the dropdown arrows for predefined fields
3. **Check Dates**: Common mistake is MM/DD/YYYY instead of DD/MM/YYYY
4. **Auto-Generate**: Leave Employee ID and Official Email empty - system will generate them
5. **Unique Values**: Make sure emails and phone numbers are unique
6. **Review Sample**: Look at the sample row (row 2) for examples
7. **Read Instructions**: Check Sheet 2 for detailed field descriptions
8. **Save Often**: Save your Excel file after making changes

## Need Help?

- Check the **Instructions** sheet in the template
- Review the **Reference Data** sheet for valid values
- Contact IT Support or HR Team for assistance

## Quick Reference

### File Requirements
- Format: `.xlsx` or `.xls`
- Max size: 5MB
- Max rows: 1000 employees

### Date Format
- Always: DD/MM/YYYY
- Example: 15/01/1990

### Phone Format
- 10 digits only
- No country code
- Example: 9876543210

### PAN Format
- ABCDE1234F
- 5 letters + 4 digits + 1 letter

### Aadhaar Format
- 12 digits
- Spaces optional
- Example: 1234 5678 9012

### Default Password
- All new employees: **Welcome@123**
- Ask employees to change on first login

---

**That's it! You're ready to bulk upload employees. Happy uploading! 🚀**
