import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployeeStore } from '@/store/employeeStore';

interface UploadEmployeesModalProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedEmployee {
  // Step 1: Basic Information
  employeeId: string;
  displayName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  dialCode?: string;
  mobileNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  
  // Step 2: Employment Details
  dateOfJoining?: string;
  contractEndDate?: string;
  legalEntity?: string;
  department: string;
  subDepartment?: string;
  businessUnit?: string;
  designation?: string;
  secondaryJobTitle?: string;
  location?: string;
  workerType?: string;
  dottedLineManagerId?: string;
  reportingManagerId?: string;
  
  // Step 3: Contact Information
  workPhone?: string;
  residenceNumber?: string;
  personalEmail?: string;
  
  // Step 4: Family & Personal Details
  maritalStatus?: string;
  marriageDate?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  spouseGender?: string;
  physicallyHandicapped?: string;
  bloodGroup?: string;
  nationality?: string;
  
  // Step 5: Provident Fund Details
  pfEstablishmentId?: string;
  pfDetailsAvailable?: string;
  pfNumber?: string;
  pfJoiningDate?: string;
  nameOnPFAccount?: string;
  uan?: string;
  
  // Step 6: ESI & Statutory Details
  esiEligible?: string;
  employerESINumber?: string;
  esiDetailsAvailable?: string;
  esiNumber?: string;
  ptEstablishmentId?: string;
  lwfEligible?: string;
  
  // Step 7: Aadhaar Details
  aadhaarNumber?: string;
  enrollmentNumber?: string;
  dobInAadhaar?: string;
  fullNameAsPerAadhaar?: string;
  addressAsInAadhaar?: string;
  genderAsInAadhaar?: string;
  
  // Step 8: PAN Details
  panCardAvailable?: string;
  panNumber?: string;
  fullNameAsPerPAN?: string;
  dobInPAN?: string;
  parentsNameAsPerPAN?: string;
  
  // Step 9: Bank & Salary Details
  salaryPaymentMode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  nameOnAccount?: string;
  branch?: string;
  
  // Legacy fields
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export function UploadEmployeesModal({ open, onClose }: UploadEmployeesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { bulkUploadEmployees } = useEmployeeStore();

  const downloadTemplate = () => {
    // Create headers array with proper formatting
    const headers = [
      // Step 1: Basic Information
      'Employee ID',
      'Display Name',
      'First Name',
      'Middle Name',
      'Last Name',
      'Email',
      'Dial Code',
      'Mobile Number',
      'Gender',
      'Date Of Birth',
      
      // Step 2: Employment Details
      'Date Of Joining',
      'Contract End Date',
      'Legal Entity',
      'Department',
      'Sub Department',
      'Business Unit',
      'Designation',
      'Secondary Job Title',
      'Location',
      'Worker Type',
      'Dotted Line Manager ID',
      'Reporting Manager ID',
      
      // Step 3: Contact Information
      'Work Phone',
      'Residence Number',
      'Personal Email',
      
      // Step 4: Family & Personal Details
      'Marital Status',
      'Marriage Date',
      'Father Name',
      'Mother Name',
      'Spouse Name',
      'Spouse Gender',
      'Physically Handicapped',
      'Blood Group',
      'Nationality',
      
      // Step 5: Provident Fund Details
      'PF Establishment ID',
      'PF Details Available',
      'PF Number',
      'PF Joining Date',
      'Name On PF Account',
      'UAN',
      
      // Step 6: ESI & Statutory Details
      'ESI Eligible',
      'Employer ESI Number',
      'ESI Details Available',
      'ESI Number',
      'PT Establishment ID',
      'LWF Eligible',
      
      // Step 7: Aadhaar Details
      'Aadhaar Number',
      'Enrollment Number',
      'DOB In Aadhaar',
      'Full Name As Per Aadhaar',
      'Address As In Aadhaar',
      'Gender As In Aadhaar',
      
      // Step 8: PAN Details
      'PAN Card Available',
      'PAN Number',
      'Full Name As Per PAN',
      'DOB In PAN',
      'Parents Name As Per PAN',
      
      // Step 9: Bank & Salary Details
      'Salary Payment Mode',
      'Bank Name',
      'Account Number',
      'IFSC Code',
      'Name On Account',
      'Branch',
      
      // Status
      'Status',
    ];

    const sampleData = [
      // Sample row with values
      'EMP999',
      'John Doe',
      'John',
      'M',
      'Doe',
      'john.doe@company.com',
      '+1',
      '1234567890',
      'Male',
      '1990-05-20',
      
      '2024-01-15',
      '2025-01-15',
      'Company Inc.',
      'Engineering',
      'Software Development',
      'Technology',
      'Software Engineer',
      'Developer',
      'New York',
      'Full Time',
      '',
      'EMP001',
      
      '1234567890',
      '0987654321',
      'john@personal.com',
      
      'Married',
      '2015-06-10',
      'James Doe',
      'Jane Doe',
      'Mary Doe',
      'Female',
      'No',
      'O+',
      'American',
      
      'PF123456',
      'Yes',
      'PF987654321',
      '2024-01-15',
      'John M Doe',
      'UAN123456789012',
      
      'Yes',
      'ESI123456',
      'Yes',
      'ESI987654321',
      'PT123456',
      'No',
      
      '123456789012',
      'EN123456789012345',
      '1990-05-20',
      'John M Doe',
      '123 Main St, New York',
      'Male',
      
      'Yes',
      'ABCDE1234F',
      'John M Doe',
      '1990-05-20',
      'James Doe',
      
      'Bank Transfer',
      'ABC Bank',
      '1234567890',
      'ABCD0001234',
      'John M Doe',
      'Main Branch',
      
      'active',
    ];

    // Create worksheet with headers and sample data
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    
    // Set column widths for better readability
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Make header row bold (requires styling, but XLSX basic doesn't support it natively)
    // The headers will still be properly formatted as text

    XLSX.writeFile(wb, 'Employee_Upload_Template.xlsx');
    toast.success('Template downloaded successfully');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    parseExcelFile(file);
  };

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    setValidationErrors([]);
    setParsedData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        toast.error('Excel file is empty');
        setIsProcessing(false);
        return;
      }

      // Parse and validate data
      const errors: string[] = [];
      const employees: ParsedEmployee[] = [];
      const seenIds = new Set<string>();

      (jsonData as Record<string, unknown>[]).forEach((row, index: number) => {
        const rowNum = index + 2; // Excel rows start at 1, plus header row

        // Helper function to get value from row (handles both spaced and non-spaced headers)
        const getValue = (...keys: string[]): string => {
          for (const key of keys) {
            const value = row[key] || row[key.replace(/\s/g, '')] || row[key.toLowerCase()] || row[key.toUpperCase()];
            if (value !== undefined && value !== null && value !== '') {
              return String(value).trim();
            }
          }
          return '';
        };

        // Map Excel columns to employee object
        const employeeId = getValue('Employee ID', 'EmployeeID', 'employeeId');
        const firstName = getValue('First Name', 'FirstName', 'firstName');
        const lastName = getValue('Last Name', 'LastName', 'lastName');
        const email = getValue('Email', 'email');
        const department = getValue('Department', 'department');

        // Validate required fields
        if (!employeeId) {
          errors.push(`Row ${rowNum}: Employee ID is required`);
          return;
        }
        if (!email) {
          errors.push(`Row ${rowNum}: Email is required`);
          return;
        }
        if (!department) {
          errors.push(`Row ${rowNum}: Department is required`);
          return;
        }

        // Check for duplicate IDs in the file
        if (seenIds.has(employeeId)) {
          errors.push(`Row ${rowNum}: Duplicate Employee ID "${employeeId}" in file`);
          return;
        }
        seenIds.add(employeeId);

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Row ${rowNum}: Invalid email format "${email}"`);
          return;
        }

        // Construct full name from parts
        const name = [firstName, getValue('Middle Name', 'MiddleName'), lastName].filter(Boolean).join(' ');

        employees.push({
          // Step 1: Basic Information
          employeeId,
          displayName: getValue('Display Name', 'DisplayName'),
          firstName,
          middleName: getValue('Middle Name', 'MiddleName'),
          lastName,
          email,
          dialCode: getValue('Dial Code', 'DialCode') || '+1',
          mobileNumber: getValue('Mobile Number', 'MobileNumber'),
          gender: getValue('Gender'),
          dateOfBirth: getValue('Date Of Birth', 'DateOfBirth'),
          
          // Step 2: Employment Details
          dateOfJoining: getValue('Date Of Joining', 'DateOfJoining'),
          contractEndDate: getValue('Contract End Date', 'ContractEndDate'),
          legalEntity: getValue('Legal Entity', 'LegalEntity'),
          department,
          subDepartment: getValue('Sub Department', 'SubDepartment'),
          businessUnit: getValue('Business Unit', 'BusinessUnit'),
          designation: getValue('Designation'),
          secondaryJobTitle: getValue('Secondary Job Title', 'SecondaryJobTitle'),
          location: getValue('Location'),
          workerType: getValue('Worker Type', 'WorkerType'),
          dottedLineManagerId: getValue('Dotted Line Manager ID', 'DottedLineManagerId'),
          reportingManagerId: getValue('Reporting Manager ID', 'ReportingManagerId'),
          
          // Step 3: Contact Information
          workPhone: getValue('Work Phone', 'WorkPhone'),
          residenceNumber: getValue('Residence Number', 'ResidenceNumber'),
          personalEmail: getValue('Personal Email', 'PersonalEmail'),
          
          // Step 4: Family & Personal Details
          maritalStatus: getValue('Marital Status', 'MaritalStatus'),
          marriageDate: getValue('Marriage Date', 'MarriageDate'),
          fatherName: getValue('Father Name', 'FatherName'),
          motherName: getValue('Mother Name', 'MotherName'),
          spouseName: getValue('Spouse Name', 'SpouseName'),
          spouseGender: getValue('Spouse Gender', 'SpouseGender'),
          physicallyHandicapped: getValue('Physically Handicapped', 'PhysicallyHandicapped') || 'No',
          bloodGroup: getValue('Blood Group', 'BloodGroup'),
          nationality: getValue('Nationality'),
          
          // Step 5: Provident Fund Details
          pfEstablishmentId: getValue('PF Establishment ID', 'PFEstablishmentId'),
          pfDetailsAvailable: getValue('PF Details Available', 'PFDetailsAvailable') || 'No',
          pfNumber: getValue('PF Number', 'PFNumber'),
          pfJoiningDate: getValue('PF Joining Date', 'PFJoiningDate'),
          nameOnPFAccount: getValue('Name On PF Account', 'NameOnPFAccount'),
          uan: getValue('UAN'),
          
          // Step 6: ESI & Statutory Details
          esiEligible: getValue('ESI Eligible', 'ESIEligible') || 'No',
          employerESINumber: getValue('Employer ESI Number', 'EmployerESINumber'),
          esiDetailsAvailable: getValue('ESI Details Available', 'ESIDetailsAvailable') || 'No',
          esiNumber: getValue('ESI Number', 'ESINumber'),
          ptEstablishmentId: getValue('PT Establishment ID', 'PTEstablishmentId'),
          lwfEligible: getValue('LWF Eligible', 'LWFEligible') || 'No',
          
          // Step 7: Aadhaar Details
          aadhaarNumber: getValue('Aadhaar Number', 'AadhaarNumber'),
          enrollmentNumber: getValue('Enrollment Number', 'EnrollmentNumber'),
          dobInAadhaar: getValue('DOB In Aadhaar', 'DOBInAadhaar'),
          fullNameAsPerAadhaar: getValue('Full Name As Per Aadhaar', 'FullNameAsPerAadhaar'),
          addressAsInAadhaar: getValue('Address As In Aadhaar', 'AddressAsInAadhaar'),
          genderAsInAadhaar: getValue('Gender As In Aadhaar', 'GenderAsInAadhaar'),
          
          // Step 8: PAN Details
          panCardAvailable: getValue('PAN Card Available', 'PANCardAvailable') || 'No',
          panNumber: getValue('PAN Number', 'PANNumber'),
          fullNameAsPerPAN: getValue('Full Name As Per PAN', 'FullNameAsPerPAN'),
          dobInPAN: getValue('DOB In PAN', 'DOBInPAN'),
          parentsNameAsPerPAN: getValue('Parents Name As Per PAN', 'ParentsNameAsPerPAN'),
          
          // Step 9: Bank & Salary Details
          salaryPaymentMode: getValue('Salary Payment Mode', 'SalaryPaymentMode'),
          bankName: getValue('Bank Name', 'BankName'),
          accountNumber: getValue('Account Number', 'AccountNumber'),
          ifscCode: getValue('IFSC Code', 'IFSCCode'),
          nameOnAccount: getValue('Name On Account', 'NameOnAccount'),
          branch: getValue('Branch'),
          
          // Legacy fields
          name,
          phone: getValue('Mobile Number', 'MobileNumber', 'Work Phone', 'WorkPhone'),
          status: (getValue('Status').toLowerCase() === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
        });
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error(`Found ${errors.length} validation error(s)`);
      } else {
        setParsedData(employees);
        toast.success(`Successfully parsed ${employees.length} employee(s)`);
      }
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error('Failed to parse Excel file. Please check the format.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to upload');
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUploadEmployees(parsedData);
      toast.success(`Successfully uploaded ${parsedData.length} employee(s)`);
      setParsedData([]);
      setValidationErrors([]);
      onClose();
    } catch (error) {
      console.error('Failed to upload employees:', error);
      toast.error('Failed to upload employees. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setParsedData([]);
      setValidationErrors([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Employees from Excel</DialogTitle>
          <DialogDescription>
            Upload employee data from an Excel file. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted-color/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Download Template</p>
                <p className="text-sm text-muted-foreground">
                  Get the Excel template with sample data
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Excel File</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Excel File
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: .xlsx, .xls
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Validation Errors</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-800 max-h-40 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    Ready to Upload ({parsedData.length} employees)
                  </p>
                  <div className="mt-3 max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100 sticky top-0">
                        <tr className="text-left text-green-900">
                          <th className="px-2 py-1">ID</th>
                          <th className="px-2 py-1">Name</th>
                          <th className="px-2 py-1">Email</th>
                          <th className="px-2 py-1">Department</th>
                          <th className="px-2 py-1">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-green-800">
                        {parsedData.slice(0, 10).map((emp, index) => (
                          <tr key={index} className="border-t border-green-200">
                            <td className="px-2 py-1">{emp.employeeId}</td>
                            <td className="px-2 py-1">{emp.name}</td>
                            <td className="px-2 py-1">{emp.email}</td>
                            <td className="px-2 py-1">{emp.department}</td>
                            <td className="px-2 py-1">{emp.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <p className="text-xs text-green-700 mt-2 px-2">
                        ... and {parsedData.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={parsedData.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {parsedData.length} Employee(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
