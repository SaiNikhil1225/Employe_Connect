import ExcelJS from 'exceljs';
import { Response } from 'express';

// Leave plan options
const LEAVE_PLANS = ['Probation', 'Acuvate', 'Confirmation', 'Consultant', 'UK'];

// Holiday plan options
const HOLIDAY_PLANS = ['India', 'USA', 'UK', 'Remote'];

// Gender options
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// Blood group options
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Marital status options
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];

// Dial code options
const DIAL_CODES = ['+1', '+44', '+91', '+61'];

// Legal Entity options (will be dynamic from DB in future)
const LEGAL_ENTITIES = [
  'Acuvate Software Private Limited',
  'Acuvate UK Limited',
  'Acuvate Inc. (USA)'
];

// Location options (will be dynamic from DB in future)
const LOCATIONS = [
  'India - Bangalore',
  'India - Hyderabad',
  'India - Mumbai',
  'USA - San Francisco, CA',
  'USA - New York, NY',
  'USA - Austin, TX',
  'UK - London',
  'Remote'
];

// Business Unit options - MATCHES Add Employee form exactly
const BUSINESS_UNITS = ['Technology', 'Marketing & Sales', 'Finance & Operations', 'Human Resources'];

// Department options - MATCHES Add Employee form exactly
const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations'
];

// Worker Type options - MATCHES Add Employee form exactly
const WORKER_TYPES = ['Permanent', 'Full-Time', 'Part-Time', 'Contract', 'Intern', 'Management'];

// Hire Type options
const HIRE_TYPES = ['Permanent', 'Contract', 'Intern', 'Management'];

// Yes/No options
const YES_NO_OPTIONS = ['Yes', 'No'];

// Payment Mode options
const PAYMENT_MODES = ['Bank Transfer', 'Cash', 'Cheque'];

// Nationality options
const NATIONALITIES = ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Other'];

// Contract Duration options
const CONTRACT_DURATIONS = ['1', '3', '6', '12', '24', 'custom'];

export interface EmployeeRow {
  // Step 1: Basic Information (11 fields - matches Add Employee form)
  legalEntity: string;
  location: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password?: string;
  gender: string;
  dateOfBirth: Date;
  panNumber?: string;
  fullNameAsPerPAN?: string;

  // Step 2: Employment Details (11 fields - matches Add Employee form)
  designation: string;
  department: string;
  subDepartment?: string;
  businessUnit: string;
  hireType: string;
  workerType: string;
  dateOfJoining: Date;
  contractDuration?: string;
  contractEndDate?: Date;
  leavePlan: string;
  holidayPlan: string;

  // Step 3: Contact Information (3 fields)
  workPhone?: string;
  residenceNumber?: string;
  personalEmail?: string;

  // Step 4: Family & Personal Details (9 fields)
  maritalStatus?: string;
  marriageDate?: Date;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  spouseGender?: string;
  physicallyHandicapped?: string;
  bloodGroup?: string;
  nationality?: string;

  // Step 5: Bank & Salary Details (6 fields)
  salaryPaymentMode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  nameOnAccount?: string;
  branch?: string;
}

export class ExcelService {
  async generateTemplate(res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Employee Data
    const dataSheet = workbook.addWorksheet('Employee Data', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Define columns - MATCHING ADD EMPLOYEE FORM (EXACT MATCH)
    dataSheet.columns = [
      // Step 1: Basic Information (11 fields - matches form)
      { header: 'Legal Entity *', key: 'legalEntity', width: 35 },
      { header: 'Location *', key: 'location', width: 30 },
      { header: 'First Name *', key: 'firstName', width: 20 },
      { header: 'Middle Name', key: 'middleName', width: 20 },
      { header: 'Last Name *', key: 'lastName', width: 20 },
      { header: 'Email *', key: 'email', width: 35 },
      { header: 'Password', key: 'password', width: 20 },
      { header: 'Gender *', key: 'gender', width: 12 },
      { header: 'Date of Birth * (DD/MM/YYYY)', key: 'dateOfBirth', width: 25 },
      { header: 'PAN Number / Tax ID', key: 'panNumber', width: 25 },
      { header: 'Full Name as per Tax Document', key: 'fullNameAsPerPAN', width: 35 },

      // Step 2: Employment Details (10 fields - matches form)
      { header: 'Designation *', key: 'designation', width: 30 },
      { header: 'Department *', key: 'department', width: 25 },
      { header: 'Sub Department', key: 'subDepartment', width: 25 },
      { header: 'Business Unit *', key: 'businessUnit', width: 25 },
      { header: 'Hire Type *', key: 'hireType', width: 20 },
      { header: 'Worker Type *', key: 'workerType', width: 20 },
      { header: 'Date of Joining * (DD/MM/YYYY)', key: 'dateOfJoining', width: 30 },
      { header: 'Contract Duration (months)', key: 'contractDuration', width: 25 },
      { header: 'Contract End Date (DD/MM/YYYY)', key: 'contractEndDate', width: 30 },
      { header: 'Leave Plan *', key: 'leavePlan', width: 20 },
      { header: 'Holiday Plan *', key: 'holidayPlan', width: 20 },

      // Step 3: Contact Information (3 fields)
      { header: 'Work Phone', key: 'workPhone', width: 20 },
      { header: 'Residence Number', key: 'residenceNumber', width: 20 },
      { header: 'Personal Email', key: 'personalEmail', width: 30 },

      // Step 4: Family & Personal Details (9 fields)
      { header: 'Marital Status', key: 'maritalStatus', width: 20 },
      { header: 'Marriage Date (DD/MM/YYYY)', key: 'marriageDate', width: 25 },
      { header: 'Father Name', key: 'fatherName', width: 25 },
      { header: 'Mother Name', key: 'motherName', width: 25 },
      { header: 'Spouse Name', key: 'spouseName', width: 25 },
      { header: 'Spouse Gender', key: 'spouseGender', width: 15 },
      { header: 'Physically Handicapped', key: 'physicallyHandicapped', width: 25 },
      { header: 'Blood Group', key: 'bloodGroup', width: 15 },
      { header: 'Nationality', key: 'nationality', width: 20 },

      // Step 5: Bank & Salary Details (6 fields)
      { header: 'Salary Payment Mode', key: 'salaryPaymentMode', width: 25 },
      { header: 'Bank Name', key: 'bankName', width: 30 },
      { header: 'Account Number', key: 'accountNumber', width: 25 },
      { header: 'IFSC Code', key: 'ifscCode', width: 20 },
      { header: 'Name on Account', key: 'nameOnAccount', width: 30 },
      { header: 'Branch', key: 'branch', width: 30 },
    ];

    // Style header row
    dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    dataSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    dataSheet.getRow(1).height = 35;

    // Add data validations with dropdowns
    const addDropdownValidation = (column: string, values: string[], startRow = 2, endRow = 1000) => {
      const worksheet = dataSheet as any;
      if (worksheet.dataValidations) {
        worksheet.dataValidations.add(`${column}${startRow}:${column}${endRow}`, {
          type: 'list',
          allowBlank: true,
          formulae: [`"${values.join(',')}"`],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: `Please select from: ${values.join(', ')}`
        });
      }
    };

    // Add dropdowns - Column letters CORRECTED to match exact column positions
    addDropdownValidation('A', LEGAL_ENTITIES); // Col 1: Legal Entity
    addDropdownValidation('B', LOCATIONS); // Col 2: Location
    addDropdownValidation('H', GENDER_OPTIONS); // Col 8: Gender
    addDropdownValidation('M', DEPARTMENTS); // Col 13: Department
    addDropdownValidation('O', BUSINESS_UNITS); // Col 15: Business Unit
    addDropdownValidation('P', HIRE_TYPES); // Col 16: Hire Type
    addDropdownValidation('Q', WORKER_TYPES); // Col 17: Worker Type
    addDropdownValidation('S', CONTRACT_DURATIONS); // Col 19: Contract Duration
    addDropdownValidation('U', LEAVE_PLANS); // Col 21: Leave Plan
    addDropdownValidation('V', HOLIDAY_PLANS); // Col 22: Holiday Plan
    addDropdownValidation('Z', MARITAL_STATUS); // Col 26: Marital Status
    addDropdownValidation('AE', GENDER_OPTIONS); // Col 31: Spouse Gender
    addDropdownValidation('AF', YES_NO_OPTIONS); // Col 32: Physically Handicapped
    addDropdownValidation('AG', BLOOD_GROUP_OPTIONS); // Col 33: Blood Group
    addDropdownValidation('AH', NATIONALITIES); // Col 34: Nationality
    addDropdownValidation('AI', PAYMENT_MODES); // Col 35: Salary Payment Mode

    // Add sample data row - Matches form exactly
    const sampleRow = dataSheet.addRow({
      legalEntity: 'Acuvate Software Private Limited',
      location: 'India - Bangalore',
      firstName: 'John',
      middleName: 'Kumar',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      password: 'Welcome@123',
      gender: 'Male',
      dateOfBirth: '15/01/1990',
      panNumber: 'ABCDE1234F',
      fullNameAsPerPAN: 'John Kumar Doe',
      
      designation: 'Software Engineer',
      department: 'Engineering',
      subDepartment: 'Frontend',
      businessUnit: 'Technology',
      hireType: 'Permanent',
      workerType: 'Full-Time',
      dateOfJoining: '01/06/2024',
      contractDuration: '12',
      contractEndDate: '01/06/2025',
      leavePlan: 'Acuvate',
      holidayPlan: 'India',
      
      workPhone: '+91-80-12345678',
      residenceNumber: '',
      personalEmail: 'john.kumar@gmail.com',
      
      maritalStatus: 'Married',
      marriageDate: '10/05/2018',
      fatherName: 'Rajesh Doe',
      motherName: 'Sunita Doe',
      spouseName: 'Jane Doe',
      spouseGender: 'Female',
      physicallyHandicapped: 'No',
      bloodGroup: 'O+',
      nationality: 'Indian',
      
      salaryPaymentMode: 'Bank Transfer',
      bankName: 'HDFC Bank',
      accountNumber: '12345678901234',
      ifscCode: 'HDFC0001234',
      nameOnAccount: 'John Kumar Doe',
      branch: 'Bangalore Main Branch'
    });

    // Style sample row
    sampleRow.font = { italic: true, color: { argb: 'FF808080' } };
    sampleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F3F3' }
    };

    // Add helpful notes to key cells (CORRECTED column positions)
    dataSheet.getCell('A2').note = 'Select the legal entity from dropdown. Must match company registration.';
    dataSheet.getCell('B2').note = 'Select location from dropdown. This determines tax ID requirements (PAN for India, SSN for USA, etc.)';
    dataSheet.getCell('C2').note = 'First name as per official documents';
    dataSheet.getCell('F2').note = 'Official email will be used for login. Must be unique.';
    dataSheet.getCell('G2').note = 'Initial password for employee login. Employee can change later.';
    dataSheet.getCell('J2').note = 'For India: PAN Number (ABCDE1234F format)\nFor USA: SSN (123-45-6789)\nFor UK: NIN (AB123456C)\nFor others: Tax ID';
    dataSheet.getCell('L2').note = 'Job title/designation (e.g., Software Engineer, Manager)';
    dataSheet.getCell('R2').note = 'Date of joining the company';
    dataSheet.getCell('S2').note = 'Contract duration in months: 1, 3, 6, 12, 24, or custom';
    dataSheet.getCell('U2').note = 'Select leave plan:\n• Probation: For new joiners\n• Acuvate: Standard plan\n• Confirmation: Confirmed employees\n• Consultant: For consultants\n• UK: UK employees';
    dataSheet.getCell('V2').note = 'Select holiday plan based on location:\n• India: Indian holidays\n• USA: US holidays\n• UK: UK holidays\n• Remote: No specific regional holidays';

    // Sheet 2: Instructions
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.getColumn(1).width = 100;

    const instructions = [
      { text: 'Employee Bulk Upload Instructions', bold: true, size: 16, color: '4472C4' },
      { text: 'Template EXACTLY matches the Add Employee form - 5 Steps', bold: true, size: 12, color: '2E75B6' },
      { text: '' },
      { text: 'Step 1: Basic Information (11 fields)', bold: true, size: 12, color: '2E75B6' },
      { text: '✓ Required: Legal Entity*, Location*, First Name*, Last Name*, Email*, Gender*, Date of Birth*' },
      { text: '○ Optional: Middle Name, Password, PAN Number/Tax ID, Full Name as per Tax Document' },
      { text: '➤ Legal Entity and Location are FIRST fields (Super Admin configurable)' },
      { text: '➤ Tax ID field (PAN/SSN/NIN) changes based on location:' },
      { text: '  • India → PAN Number (ABCDE1234F)' },
      { text: '  • USA → Social Security Number (123-45-6789)' },
      { text: '  • UK → National Insurance Number (AB123456C)' },
      { text: '  • Others → Generic Tax ID' },
      { text: '' },
      { text: 'Step 2: Employment Details (11 fields)', bold: true, size: 12, color: '2E75B6' },
      { text: '✓ Required: Designation*, Department*, Business Unit*, Hire Type*, Worker Type*, Date of Joining*, Leave Plan*, Holiday Plan*' },
      { text: '○ Optional: Sub Department, Contract Duration, Contract End Date' },
      { text: '➤ Contract Duration: Enter months (1, 3, 6, 12, 24, custom)' },
      { text: '➤ Holiday Plan auto-sets based on location (India, USA, UK, Remote)' },
      { text: '➤ Employee ID will auto-generate (ACUA/ACUC/ACUI/ACUM based on hire type)' },
      { text: '' },
      { text: 'Step 3: Contact Information (3 fields)', bold: true, size: 12, color: '2E75B6' },
      { text: '○ All Optional: Work Phone, Residence Number, Personal Email' },
      { text: '' },
      { text: 'Step 4: Family & Personal Details (9 fields)', bold: true, size: 12, color: '2E75B6' },
      { text: '○ All Optional: Marital Status, Marriage Date, Father Name, Mother Name' },
      { text: '○ Spouse Name, Spouse Gender, Physically Handicapped, Blood Group, Nationality' },
      { text: '' },
      { text: 'Step 5: Bank & Salary Details (6 fields)', bold: true, size: 12, color: '2E75B6' },
      { text: '○ All Optional: Salary Payment Mode, Bank Name, Account Number, IFSC Code' },
      { text: '○ Name on Account, Branch' },
      { text: '' },
      { text: 'Important Notes:', bold: true, size: 12, color: 'C00000' },
      { text: '📅 All dates must be in DD/MM/YYYY format (e.g., 15/01/1990, 01/06/2024)' },
      { text: '📧 Email addresses must be valid and unique across all employees' },
      { text: '🆔 Employee ID will auto-generate: ACUA (Permanent), ACUC (Contract), ACUI (Intern), ACUM (Management)' },
      { text: '✋ Delete or clear the sample row (row 2) before uploading your data' },
      { text: '⚠️ Fields marked with * are Required' },
      { text: '📊 Use dropdowns for selection fields (Gender, Department, Location, etc.)' },
      { text: '' },
      { text: 'Leave Plan Guide:', bold: true, size: 12 },
      { text: '• Probation: For new employees in probation period (typically 3-6 months)' },
      { text: '• Acuvate: Standard leave plan for regular employees' },
      { text: '• Confirmation: For confirmed/permanent employees' },
      { text: '• Consultant: For consultants and contract employees' },
      { text: '• UK: Special plan for UK-based employees' },
      { text: '' },
      { text: 'Holiday Plan Guide:', bold: true, size: 12 },
      { text: '• India: Indian public holidays apply (Default)' },
      { text: '• USA: US federal holidays apply' },
      { text: '• UK: UK bank holidays apply' },
      { text: '• Remote: No specific regional holidays' },
      { text: '➤ Holiday plan automatically determined by location selected' },
      { text: '' },
      { text: 'Steps to Upload:', bold: true, size: 12 },
      { text: '1️⃣ Fill the "Employee Data" sheet with employee information' },
      { text: '2️⃣ Start from row 3 (row 2 is sample - delete it before upload)' },
      { text: '3️⃣ Ensure all required fields (*) are filled' },
      { text: '4️⃣ Use dropdown lists for standardized fields' },
      { text: '5️⃣ Save the file and upload through bulk upload interface' },
      { text: '6️⃣ Review validation report for any errors' },
      { text: '7️⃣ Fix errors and re-upload if needed' },
      { text: '8️⃣ Confirm to create employees' },
      { text: '' },
      { text: 'Data Validation:', bold: true, size: 12 },
      { text: '✓ Email format validation and uniqueness check' },
      { text: '✓ Tax ID format validation (PAN/SSN/NIN based on location)' },
      { text: '✓ Date format validation (must be DD/MM/YYYY)' },
      { text: '✓ Required field checks' },
      { text: '' },
      { text: 'Need Help?', bold: true, size: 12, color: '2E75B6' },
      { text: 'Contact HR Team or IT Support for assistance with bulk uploads' },
      { text: 'Email: hr@company.com | Support: support@company.com' },
    ];

    instructions.forEach((instruction) => {
      const row = instructionsSheet.addRow([instruction.text]);
      if (instruction.bold) {
        row.font = { bold: true, size: instruction.size || 11 };
        if (instruction.color) {
          row.font = { ...row.font, color: { argb: `FF${instruction.color}` } };
        }
      }
      row.alignment = { wrapText: true };
    });

    // Sheet 3: Reference Data
    const referenceSheet = workbook.addWorksheet('Reference Data');
    
    referenceSheet.columns = [
      { header: 'Legal Entities', key: 'legalEntity', width: 35 },
      { header: 'Locations', key: 'location', width: 30 },
      { header: 'Departments', key: 'department', width: 25 },
      { header: 'Business Units', key: 'businessUnit', width: 25 },
      { header: 'Worker Types', key: 'workerType', width: 20 },
      { header: 'Hire Types', key: 'hireType', width: 20 },
      { header: 'Leave Plans', key: 'leavePlan', width: 20 },
      { header: 'Holiday Plans', key: 'holidayPlan', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Blood Groups', key: 'bloodGroup', width: 15 },
      { header: 'Marital Status', key: 'maritalStatus', width: 20 },
      { header: 'Nationalities', key: 'nationality', width: 20 },
      { header: 'Payment Modes', key: 'paymentMode', width: 20 },
      { header: 'Dial Codes', key: 'dialCode', width: 15 },
    ];

    referenceSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    referenceSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };

    // Add reference data
    const maxRows = Math.max(
      LEGAL_ENTITIES.length,
      LOCATIONS.length,
      DEPARTMENTS.length,
      BUSINESS_UNITS.length,
      WORKER_TYPES.length,
      HIRE_TYPES.length,
      LEAVE_PLANS.length,
      HOLIDAY_PLANS.length,
      GENDER_OPTIONS.length,
      BLOOD_GROUP_OPTIONS.length,
      MARITAL_STATUS.length,
      NATIONALITIES.length,
      PAYMENT_MODES.length,
      DIAL_CODES.length
    );

    for (let i = 0; i < maxRows; i++) {
      referenceSheet.addRow({
        legalEntity: LEGAL_ENTITIES[i] || '',
        location: LOCATIONS[i] || '',
        department: DEPARTMENTS[i] || '',
        businessUnit: BUSINESS_UNITS[i] || '',
        workerType: WORKER_TYPES[i] || '',
        hireType: HIRE_TYPES[i] || '',
        leavePlan: LEAVE_PLANS[i] || '',
        holidayPlan: HOLIDAY_PLANS[i] || '',
        gender: GENDER_OPTIONS[i] || '',
        bloodGroup: BLOOD_GROUP_OPTIONS[i] || '',
        maritalStatus: MARITAL_STATUS[i] || '',
        nationality: NATIONALITIES[i] || '',
        paymentMode: PAYMENT_MODES[i] || '',
        dialCode: DIAL_CODES[i] || ''
      });
    }

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Employee_Bulk_Upload_Template.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  async parseExcelFile(buffer: Buffer): Promise<EmployeeRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet('Employee Data');
    if (!worksheet) {
      throw new Error('Employee Data sheet not found');
    }

    // Header to key mapping - EXACTLY matches Add Employee form
    const headerToKey: Record<string, string> = {
      // Step 1: Basic Information (11 fields - matches form)
      'Legal Entity *': 'legalEntity',
      'Location *': 'location',
      'First Name *': 'firstName',
      'Middle Name': 'middleName',
      'Last Name *': 'lastName',
      'Email *': 'email',
      'Password': 'password',
      'Gender *': 'gender',
      'Date of Birth * (DD/MM/YYYY)': 'dateOfBirth',
      'PAN Number / Tax ID': 'panNumber',
      'Full Name as per Tax Document': 'fullNameAsPerPAN',

      // Step 2: Employment Details (11 fields - matches form)
      'Designation *': 'designation',
      'Department *': 'department',
      'Sub Department': 'subDepartment',
      'Business Unit *': 'businessUnit',
      'Hire Type *': 'hireType',
      'Worker Type *': 'workerType',
      'Date of Joining * (DD/MM/YYYY)': 'dateOfJoining',
      'Contract Duration (months)': 'contractDuration',
      'Contract End Date (DD/MM/YYYY)': 'contractEndDate',
      'Leave Plan *': 'leavePlan',
      'Holiday Plan *': 'holidayPlan',

      // Step 3: Contact Information (3 fields)
      'Work Phone': 'workPhone',
      'Residence Number': 'residenceNumber',
      'Personal Email': 'personalEmail',

      // Step 4: Family & Personal (9 fields)
      'Marital Status': 'maritalStatus',
      'Marriage Date (DD/MM/YYYY)': 'marriageDate',
      'Father Name': 'fatherName',
      'Mother Name': 'motherName',
      'Spouse Name': 'spouseName',
      'Spouse Gender': 'spouseGender',
      'Physically Handicapped': 'physicallyHandicapped',
      'Blood Group': 'bloodGroup',
      'Nationality': 'nationality',

      // Step 5: Bank Details (6 fields)
      'Salary Payment Mode': 'salaryPaymentMode',
      'Bank Name': 'bankName',
      'Account Number': 'accountNumber',
      'IFSC Code': 'ifscCode',
      'Name on Account': 'nameOnAccount',
      'Branch': 'branch',
    };

    // Build column mapping
    const headerRow = worksheet.getRow(1);
    const columnMap: Record<number, string> = {};
    
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const headerText = cell.value?.toString().trim();
      if (headerText && headerToKey[headerText]) {
        columnMap[colNumber] = headerToKey[headerText];
      }
    });

    const employees: EmployeeRow[] = [];

    // Skip header and sample rows, start from row 3
    for (let rowNumber = 3; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const employee: any = {};
      let hasAnyData = false;
      
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const key = columnMap[colNumber];
        let value = cell.value;

        if (value !== null && value !== undefined && value !== '') {
          hasAnyData = true;
        }

        if (key && value !== null && value !== undefined && value !== '') {
          // Handle hyperlink cells
          if (typeof value === 'object' && 'text' in value) {
            value = value.text;
          }

          // Handle dates
          if (value instanceof Date) {
            employee[key] = value;
          } else if (typeof value === 'string' && key.toLowerCase().includes('date')) {
            // Parse DD/MM/YYYY format
            const parts = value.trim().split(/[\/\-]/);
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1;
              const year = parseInt(parts[2]);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                employee[key] = new Date(year, month, day);
              } else {
                employee[key] = value.toString().trim();
              }
            } else {
              employee[key] = value.toString().trim();
            }
          } else if (typeof value === 'number' && key.toLowerCase().includes('date')) {
            // Excel date number
            employee[key] = new Date((value - 25569) * 86400 * 1000);
          } else {
            employee[key] = value.toString().trim();
          }
        }
      });

      // Only add if row has essential fields
      if (employee.firstName && employee.lastName) {
        employees.push(employee as EmployeeRow);
      }
    }

    return employees;
  }
}

export const excelService = new ExcelService();
