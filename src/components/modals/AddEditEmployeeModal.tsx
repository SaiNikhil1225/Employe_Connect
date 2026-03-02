import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetCloseButton } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useEmployeeStore } from '@/store/employeeStore';
import { onboardingServiceAPI } from '@/services/onboardingServiceAPI';
import type { Employee } from '@/services/employeeService';
import { employeeService, type CompanySettings, type TaxIdConfig } from '@/services/employeeService';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import apiClient from '@/services/api';
import { 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  CheckCircle2,
  User,
  Briefcase,
  Phone,
  Users,
  Wallet,
  X,
  Camera,
  Eye,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess?: () => void;
}

export function AddEditEmployeeModal({ open, onClose, employee, onSuccess }: AddEditEmployeeModalProps) {
  const navigate = useNavigate();
  const { addEmployee, updateEmployee, getNextEmployeeId, activeEmployees, fetchActiveEmployees, fetchEmployees } = useEmployeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingEmployeeId, setIsLoadingEmployeeId] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{ isChecking: boolean; isValid: boolean; message: string }>({ isChecking: false, isValid: true, message: '' });
  const [panValidation, setPanValidation] = useState<{ isChecking: boolean; isValid: boolean; message: string }>({ isChecking: false, isValid: true, message: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [currentTaxIdConfig, setCurrentTaxIdConfig] = useState<TaxIdConfig | null>(null);
  const [createdEmployeeData, setCreatedEmployeeData] = useState<{
    employeeId: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    hireType: string;
  } | null>(null);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    employeeId: '',
    displayName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    dialCode: '+1',
    mobileNumber: '',
    gender: '',
    dateOfBirth: '',
    
    // Step 2: Employment Details
    dateOfJoining: '',
    contractDuration: '',
    contractEndDate: '',
    legalEntity: '',
    department: '',
    subDepartment: '',
    businessUnit: '',
    designation: '',
    secondaryJobTitle: '',
    location: '',
    workerType: '',
    hireType: '',
    dottedLineManagerId: '',
    reportingManagerId: '',
    leavePlan: '',
    holidayPlan: '',
    
    // Step 3: Contact Information
    workPhone: '',
    residenceNumber: '',
    personalEmail: '',
    
    // Step 4: Family & Personal Details
    maritalStatus: '',
    marriageDate: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    spouseGender: '',
    physicallyHandicapped: 'No',
    bloodGroup: '',
    nationality: '',
    
    // Step 5: PAN Details
    panCardAvailable: 'No',
    panNumber: '',
    fullNameAsPerPAN: '',
    dobInPAN: '',
    parentsNameAsPerPAN: '',
    
    // Step 6: Bank & Salary Details
    salaryPaymentMode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    nameOnAccount: '',
    branch: '',
    
    // Legacy fields
    profilePhoto: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch company settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await employeeService.getCompanySettings();
        setCompanySettings(settings);
      } catch (error) {
        console.error('Failed to fetch company settings:', error);
        toast.error('Failed to load company settings');
      }
    };
    fetchSettings();
  }, []);

  // Update tax ID config when location changes
  useEffect(() => {
    if (companySettings && formData.location) {
      const selectedLocation = companySettings.locations.find((loc: { name: string; country: string }) => loc.name === formData.location);
      if (selectedLocation) {
        const taxConfig = companySettings.taxIdConfigs.find((config: TaxIdConfig) => config.country === selectedLocation.country);
        setCurrentTaxIdConfig(taxConfig || null);
      }
    }
  }, [formData.location, companySettings]);

  // Auto-set holiday plan based on location
  useEffect(() => {
    if (formData.location && !employee) {
      let holidayPlan = 'India'; // Default
      
      if (formData.location.includes('India')) {
        holidayPlan = 'India';
      } else if (formData.location.includes('USA')) {
        holidayPlan = 'USA';
      } else if (formData.location.includes('UK')) {
        holidayPlan = 'UK';
      } else if (formData.location.includes('Remote')) {
        holidayPlan = 'Remote';
      }
      
      setFormData(prev => ({ ...prev, holidayPlan }));
    }
  }, [formData.location, employee]);

  useEffect(() => {
    console.log('🔄 AddEditEmployeeModal useEffect:', { open, hasEmployee: !!employee, employeeEmail: employee?.email || 'none' });
    if (open) {
      fetchActiveEmployees();
      setCurrentStep(1);
      if (employee) {
        console.log('✏️ EDIT MODE - Loading employee:', employee.email);
        // Edit mode - populate form with all employee fields
        const nameParts = employee.name.split(' ');
        
        // Helper function to format dates for input fields
        const formatDateForInput = (dateStr: string | undefined) => {
          if (!dateStr) return '';
          try {
            return new Date(dateStr).toISOString().split('T')[0];
          } catch {
            return '';
          }
        };
        
        setFormData({
          // Step 1: Basic Information
          employeeId: employee.employeeId || '',
          displayName: employee.name || '',
          firstName: nameParts[0] || '',
          middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
          lastName: nameParts[nameParts.length - 1] || '',
          email: employee.email || '',
          password: '',  // Don't populate password for security
          dialCode: (employee as any).dialCode || '+1',
          mobileNumber: employee.phone || '',
          gender: (employee as any).gender || '',
          dateOfBirth: formatDateForInput(employee.dateOfBirth),
          
          // Step 2: Employment Details
          dateOfJoining: formatDateForInput(employee.dateOfJoining),
          contractDuration: '',
          contractEndDate: formatDateForInput((employee as any).contractEndDate),
          legalEntity: (employee as any).legalEntity || '',
          department: employee.department || '',
          subDepartment: (employee as any).subDepartment || '',
          businessUnit: employee.businessUnit || '',
          designation: employee.designation || '',
          secondaryJobTitle: (employee as any).secondaryJobTitle || '',
          location: employee.location || '',
          workerType: (employee as any).workerType || '',
          hireType: (employee as any).hireType || '',
          dottedLineManagerId: employee.dottedLineManagerId || '',
          reportingManagerId: employee.reportingManagerId || '',
          leavePlan: (employee as any).leavePlan || '',
          holidayPlan: (employee as any).holidayPlan || 'India',
          
          // Step 3: Contact Information
          workPhone: (employee as any).workPhone || '',
          residenceNumber: (employee as any).residenceNumber || '',
          personalEmail: (employee as any).personalEmail || '',
          
          // Step 4: Family & Personal Details
          maritalStatus: (employee as any).maritalStatus || '',
          marriageDate: formatDateForInput((employee as any).marriageDate),
          fatherName: (employee as any).fatherName || '',
          motherName: (employee as any).motherName || '',
          spouseName: (employee as any).spouseName || '',
          spouseGender: (employee as any).spouseGender || '',
          physicallyHandicapped: (employee as any).physicallyHandicapped || 'No',
          bloodGroup: (employee as any).bloodGroup || '',
          nationality: (employee as any).nationality || '',
          
          // Step 5: PAN Details
          panCardAvailable: (employee as any).panCardAvailable || 'No',
          panNumber: (employee as any).panNumber || '',
          fullNameAsPerPAN: (employee as any).fullNameAsPerPAN || '',
          dobInPAN: formatDateForInput((employee as any).dobInPAN),
          parentsNameAsPerPAN: (employee as any).parentsNameAsPerPAN || '',
          
          // Step 6: Bank & Salary Details
          salaryPaymentMode: (employee as any).salaryPaymentMode || '',
          bankName: (employee as any).bankName || '',
          accountNumber: (employee as any).accountNumber || '',
          ifscCode: (employee as any).ifscCode || '',
          nameOnAccount: (employee as any).nameOnAccount || '',
          branch: (employee as any).branch || '',
          
          // Legacy fields
          profilePhoto: employee.profilePhoto || '',
          status: employee.status || 'active',
        });
        setProfilePreview(employee.profilePhoto || '');
      } else {
        console.log('➕ ADD MODE - Resetting form. Current email:', formData.email);
        // Add mode - reset form to empty values
        console.log('Add mode - resetting form to empty values');
        setFormData({
          employeeId: '',
          displayName: '',
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          password: '',
          dialCode: '+1',
          mobileNumber: '',
          gender: '',
          dateOfBirth: '',
          dateOfJoining: '',
          contractDuration: '',
          contractEndDate: '',
          legalEntity: '',
          department: '',
          subDepartment: '',
          businessUnit: '',
          designation: '',
          secondaryJobTitle: '',
          location: '',
          workerType: '',
          hireType: '',
          dottedLineManagerId: '',
          reportingManagerId: '',
          leavePlan: '',
          holidayPlan: 'India',
          workPhone: '',
          residenceNumber: '',
          personalEmail: '',
          maritalStatus: '',
          marriageDate: '',
          fatherName: '',
          motherName: '',
          spouseName: '',
          spouseGender: '',
          physicallyHandicapped: 'No',
          bloodGroup: '',
          nationality: '',
          panCardAvailable: 'No',
          panNumber: '',
          fullNameAsPerPAN: '',
          dobInPAN: '',
          parentsNameAsPerPAN: '',
          salaryPaymentMode: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          nameOnAccount: '',
          branch: '',
          profilePhoto: '',
          status: 'active',
        });
        setProfilePreview('');
        setEmailValidation({ isChecking: false, isValid: true, message: '' });
        console.log('✅ Form reset complete. Email should now be empty:', '');
      }
    } else {
      // Reset form when closed
      setCurrentStep(1);
      setFormData({
        employeeId: '',
        displayName: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        dialCode: '+1',
        mobileNumber: '',
        gender: '',
        dateOfBirth: '',
        dateOfJoining: '',
        contractEndDate: '',
        legalEntity: '',
        department: '',
        subDepartment: '',
        businessUnit: '',
        designation: '',
        secondaryJobTitle: '',
        location: '',
        workerType: '',
        hireType: '',
        dottedLineManagerId: '',
        reportingManagerId: '',
        leavePlan: '',
        holidayPlan: 'India',
        contractDuration: '',
        workPhone: '',
        residenceNumber: '',
        personalEmail: '',
        maritalStatus: '',
        marriageDate: '',
        fatherName: '',
        motherName: '',
        spouseName: '',
        spouseGender: '',
        physicallyHandicapped: 'No',
        bloodGroup: '',
        nationality: '',
        panCardAvailable: 'No',
        panNumber: '',
        fullNameAsPerPAN: '',
        dobInPAN: '',
        parentsNameAsPerPAN: '',
        salaryPaymentMode: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        nameOnAccount: '',
        branch: '',
        profilePhoto: '',
        status: 'active',
      });
      setProfilePreview('');
    }
  }, [open, employee, getNextEmployeeId, fetchActiveEmployees]);

  // Auto-generate employee ID when hire type changes (only in add mode)
  useEffect(() => {
    if (open && !employee && formData.hireType) {
      setIsLoadingEmployeeId(true);
      getNextEmployeeId(formData.hireType).then(nextId => {
        setFormData(prev => ({ ...prev, employeeId: nextId }));
        setIsLoadingEmployeeId(false);
      }).catch(error => {
        console.error('Failed to get next employee ID:', error);
        toast.error('Failed to generate employee ID');
        setIsLoadingEmployeeId(false);
      });
    }
  }, [formData.hireType, open, employee, getNextEmployeeId]);

  // Email validation - check for duplicates
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || formData.email.length < 5) {
        setEmailValidation({ isChecking: false, isValid: true, message: '' });
        return;
      }

      setEmailValidation({ isChecking: true, isValid: true, message: '' });
      
      try {
        const response = await fetch(`http://localhost:5000/api/employees/validate/email?email=${encodeURIComponent(formData.email)}&excludeId=${employee?._id || ''}`);
        const data = await response.json();
        
        if (data.exists) {
          setEmailValidation({ isChecking: false, isValid: false, message: 'This email is already registered' });
        } else {
          setEmailValidation({ isChecking: false, isValid: true, message: '' });
        }
      } catch (error) {
        setEmailValidation({ isChecking: false, isValid: true, message: '' });
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email, employee?._id]);

  // PAN validation - check database when PAN is typed
  useEffect(() => {
    const checkPAN = async () => {
      if (!formData.panNumber || formData.panNumber.length < 10) {
        setPanValidation({ isChecking: false, isValid: true, message: '' });
        return;
      }

      setPanValidation({ isChecking: true, isValid: true, message: '' });
      
      try {
        const response = await fetch(`http://localhost:5000/api/employees/validate/pan?panNumber=${encodeURIComponent(formData.panNumber)}&excludeId=${employee?._id || ''}`);
        const data = await response.json();
        
        if (data.exists) {
          setPanValidation({ isChecking: false, isValid: false, message: 'This PAN number is already registered' });
        } else {
          setPanValidation({ isChecking: false, isValid: true, message: '' });
        }
      } catch (error) {
        setPanValidation({ isChecking: false, isValid: true, message: '' });
      }
    };

    const timer = setTimeout(checkPAN, 500);
    return () => clearTimeout(timer);
  }, [formData.panNumber, employee?._id]);

  // Recalculate contract end date when joining date or duration changes
  useEffect(() => {
    if (formData.dateOfJoining && formData.contractDuration && formData.contractDuration !== 'custom') {
      const startDate = new Date(formData.dateOfJoining);
      const months = parseInt(formData.contractDuration);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
      
      const formattedEndDate = endDate.toISOString().split('T')[0];
      if (formData.contractEndDate !== formattedEndDate) {
        setFormData(prev => ({ ...prev, contractEndDate: formattedEndDate }));
      }
    }
  }, [formData.dateOfJoining, formData.contractDuration]);

  // Auto-generate employee ID when reaching Step 6
  useEffect(() => {
    const generateEmployeeId = async () => {
      if (currentStep === 6 && !employee && formData.hireType && !formData.employeeId && emailValidation.isValid) {
        setIsLoadingEmployeeId(true);
        try {
          const nextId = await getNextEmployeeId(formData.hireType);
          setFormData(prev => ({ ...prev, employeeId: nextId }));
          toast.success(`Employee ID generated: ${nextId}`);
        } catch (error) {
          toast.error('Failed to generate Employee ID');
        } finally {
          setIsLoadingEmployeeId(false);
        }
      }
    };

    generateEmployeeId();
  }, [currentStep, formData.hireType, employee, formData.employeeId, emailValidation.isValid, getNextEmployeeId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
      });
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 5MB',
      });
      e.target.value = ''; // Reset input
      return;
    }

    // Store file for upload later
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProfilePicture = async (employeeId: string) => {
    if (!selectedFile) return null;

    try {
      setUploadingPhoto(true);
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', selectedFile);

      const response = await apiClient.post(
        `/employees/${employeeId}/profile-picture`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return response.data.data.profilePhoto;
      }
      return null;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload profile picture');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    setSelectedFile(null);
    setProfilePreview('');
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Please complete all required fields in Steps 1 and 2');
      setCurrentStep(1); // Go back to first step
      return;
    }
    
    setIsSubmitting(true);

    // Construct full name from parts
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(' ') || formData.displayName;

    // Map new fields to legacy structure for backward compatibility
    const employeeData = {
      ...formData,
      name: fullName,
      phone: formData.mobileNumber || formData.workPhone,
    };

    try {
      // Additional validations
      if (formData.reportingManagerId === formData.employeeId) {
        toast.error('Employee cannot be their own reporting manager');
        setIsSubmitting(false);
        return;
      }

      if (formData.dottedLineManagerId === formData.employeeId) {
        toast.error('Employee cannot be their own dotted line manager');
        setIsSubmitting(false);
        return;
      }

      if (employee?._id) {
        // Update existing employee
        await updateEmployee(employee._id, employeeData);
        
        // Upload profile picture if selected
        if (selectedFile) {
          await handleUploadProfilePicture(formData.employeeId);
        }
        
        // Refresh employee data to get updated profile picture
        await fetchEmployees();
        
        toast.success('Employee updated successfully');
      } else {
        // Create new employee
        const response = await addEmployee(employeeData);
        
        // Check if response contains the generated employee ID
        if (response && response.employeeId) {
          // Store the created employee data for success dialog
          setCreatedEmployeeData({
            employeeId: response.employeeId,
            name: response.name || fullName,
            email: response.email || formData.email,
            department: response.department || formData.department,
            designation: response.designation || formData.designation,
            hireType: response.hireType || formData.workerType || 'Full-Time'
          });
          
          // Upload profile picture if selected
          if (selectedFile && response.employeeId) {
            await handleUploadProfilePicture(response.employeeId);
          }
          
          // Refresh employee data
          await fetchEmployees();
          
          // Close the form modal
          onClose();
          
          // Show success dialog with generated employee ID
          setShowSuccessDialog(true);
          
          // Initialize onboarding for new employee
          if (response.employeeId && formData.joiningDate) {
            try {
              const onboardingResponse = await onboardingServiceAPI.initializeOnboarding(
                response.employeeId,
                formData.joiningDate,
                {
                  employeeName: fullName,
                  designation: formData.designation,
                  department: formData.department
                }
              );
              if (onboardingResponse.success) {
                console.log('Onboarding workflow initialized');
              }
            } catch (error) {
              console.error('Failed to initialize onboarding:', error);
              // Don't fail the whole operation if onboarding init fails
            }
          }
        } else {
          // Fallback if response format is different
          toast.success('Employee added successfully');
          onClose();
          onSuccess?.();
        }
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Employee data being sent:', employeeData);
      const err = error as { 
        response?: { 
          data?: { 
            message?: string;
            field?: string;
            error?: string | {
              message?: string;
              details?: Array<{ field: string; message: string }>;
            };
          } 
        }; 
        message?: string 
      };
      
      // Check for specific field errors (PAN or Email duplicate)
      if (err.response?.data?.field) {
        const field = err.response.data.field;
        const message = err.response.data.message || 'This value already exists';
        toast.error(message, { duration: 5000 });
        
        // Navigate to the appropriate step
        if (field === 'panNumber' || field === 'email') {
          setCurrentStep(1);
        }
        return;
      }
      
      // Check for detailed validation errors
      if (err.response?.data?.error && typeof err.response.data.error === 'object' && 'details' in err.response.data.error) {
        const details = err.response.data.error.details;
        const errorMessages = details.map(d => `${d.field}: ${d.message}`).join('\n');
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        const errorObj = err.response?.data?.error;
        const errorMessage = 
          (typeof errorObj === 'object' && errorObj?.message) || 
          (typeof errorObj === 'string' ? errorObj : null) ||
          err.response?.data?.message || 
          err.message || 
          'Operation failed';
        console.error('Full error response:', err.response?.data);
        // Don't show error toast if employee was stored locally
        if (!errorMessage.includes('stored locally')) {
          toast.error(errorMessage);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1: Basic Information - Only basic fields
        if (!formData.firstName || !formData.lastName) {
          toast.error('First Name and Last Name are required');
          return false;
        }
        if (!formData.email) {
          toast.error('Email is required');
          return false;
        }
        if (!formData.gender) {
          toast.error('Gender is required');
          return false;
        }
        if (!formData.dateOfBirth) {
          toast.error('Date of Birth is required');
          return false;
        }
        // Legal Entity and Location validation (now in Step 1)
        if (!formData.legalEntity) {
          toast.error('Legal Entity is required');
          return false;
        }
        if (!formData.location) {
          toast.error('Location is required');
          return false;
        }
        break;
      case 2:
        // Step 2: Employment Details
        if (!formData.hireType) {
          toast.error('Hire Type is required');
          return false;
        }
        if (!formData.dateOfJoining) {
          toast.error('Date Joined is required');
          return false;
        }
        if (!formData.department) {
          toast.error('Department is required');
          return false;
        }
        if (!formData.businessUnit) {
          toast.error('Business Unit is required');
          return false;
        }
        if (!formData.designation) {
          toast.error('Job Title is required');
          return false;
        }
        if (!formData.location) {
          toast.error('Location is required');
          return false;
        }
        if (!formData.workerType) {
          toast.error('Worker Type is required');
          return false;
        }
        if (!formData.leavePlan) {
          toast.error('Leave Plan is required');
          return false;
        }
        if (!formData.holidayPlan) {
          toast.error('Holiday Plan is required');
          return false;
        }
        break;
      case 5:
        // Step 5: Bank & Salary - Employee ID should be auto-generated by now
        if (!employee && !formData.employeeId) {
          toast.error('Employee Number is required. Please ensure Hire Type is selected in Step 2.');
          return false;
        }
        break;
      // Steps 3, 5 don't have required fields
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Employment Details', icon: Briefcase },
    { number: 3, title: 'Contact Information', icon: Phone },
    { number: 4, title: 'Family & Personal', icon: Users },
    { number: 5, title: 'Bank & Salary', icon: Wallet },
  ];

  return (
    <>
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent className="!w-[70%] overflow-hidden flex flex-col p-0">
        {/* Header - Fixed */}
        <div className="px-6 pt-6 pb-4 border-b bg-background">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="text-2xl">{employee ? 'Edit Employee' : 'Add New Employee'}</SheetTitle>
              <SheetDescription>
                {employee ? 'Update employee information' : 'Complete all steps to onboard a new employee'}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>
        </div>

        {/* Stepper Navigation - Fixed */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative',
                        isActive && 'border-primary bg-primary text-primary-foreground shadow-lg scale-110',
                        isCompleted && 'border-green-500 bg-green-500 text-white',
                        !isActive && !isCompleted && 'border-gray-300 bg-background text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 stroke-[3]" />
                      ) : (
                        <StepIcon className={cn('h-5 w-5', isActive && 'animate-pulse')} />
                      )}
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full border-2 border-primary animate-ping opacity-20" />
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] mt-2 text-center font-medium transition-colors leading-tight px-1',
                      isActive && 'text-primary font-semibold',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center pt-6 px-2">
                      <div
                        className={cn(
                          'h-1 w-full min-w-[20px] rounded-full transition-all duration-500',
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        )}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span className="font-medium">{Math.round(((currentStep - 1) / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">Personal and identification details</p>
                </div>
              </div>
              
              {/* BACKUP - Profile Picture Upload (commented out as per request) */}
              {/* <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <div className="relative group">
                  {profilePreview || (employee && formData.profilePhoto) ? (
                    <div className="relative">
                      <img
                        src={profilePreview || formData.profilePhoto}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : formData.firstName || formData.lastName || formData.displayName ? (
                    <EmployeeAvatar
                      employee={{
                        employeeId: formData.employeeId || 'temp',
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        name: formData.displayName,
                        profilePhoto: formData.profilePhoto,
                      }}
                      size="3xl"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <Label
                    htmlFor="profilePhotoUpload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </Label>
                  <Input
                    id="profilePhotoUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a photo or we'll use your initials
                  </p>
                </div>
              </div> */}
              
              {/* BACKUP - Old Profile Photo Upload (commented out as per request) */}
              {/* <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="profilePhoto" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </div>
                    <Input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Label>
                </div>
              </div> */}

              <div className="grid grid-cols-2 gap-4">
                {/* Legal Entity and Location - Dynamic from Super Admin */}
                <div className="space-y-2">
                  <Label htmlFor="legalEntity">Legal Entity *</Label>
                  <Select
                    value={formData.legalEntity}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, legalEntity: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySettings?.legalEntities.map((entity: string) => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySettings?.locations.map((location: { name: string; country: string }) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.location && currentTaxIdConfig && (
                    <p className="text-xs text-muted-foreground">
                      📋 Country: {currentTaxIdConfig.country} - {currentTaxIdConfig.fieldLabel} required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="off"
                    className={!emailValidation.isValid ? 'border-red-500' : ''}
                  />
                  {emailValidation.isChecking && (
                    <p className="text-xs text-muted-foreground">Checking email...</p>
                  )}
                  {!emailValidation.isChecking && !emailValidation.isValid && (
                    <p className="text-xs text-red-500">{emailValidation.message}</p>
                  )}
                  {!emailValidation.isChecking && emailValidation.isValid && formData.email && (
                    <p className="text-xs text-green-600">✓ Email available</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter login password"
                    required={!employee}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    User will login with email and this password
                  </p>
                </div>

                {/* BACKUP - Phone Number fields (commented out as per request) */}
                {/* <div className="space-y-2">
                  <Label htmlFor="dialCode">Dial Code</Label>
                  <Select
                    value={formData.dialCode}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, dialCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1 (US/Canada)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (India)</SelectItem>
                      <SelectItem value="+61">+61 (Australia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    required
                  />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <DatePicker
                    value={formData.dateOfBirth}
                    onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                    placeholder="Select birth date"
                  />
                </div>

                {/* Tax ID Field - Dynamic based on Location */}
                {currentTaxIdConfig && (
                  <div className="space-y-2">
                    <Label htmlFor={currentTaxIdConfig.fieldName}>
                      {currentTaxIdConfig.fieldLabel} {currentTaxIdConfig.country === 'India' ? '' : '(Optional)'}
                    </Label>
                    <Input
                      id={currentTaxIdConfig.fieldName}
                      value={formData.panNumber}
                      onChange={(e) => {
                        const value = currentTaxIdConfig.country === 'India' || currentTaxIdConfig.country === 'UK' 
                          ? e.target.value.toUpperCase() 
                          : e.target.value;
                        setFormData(prev => ({ ...prev, panNumber: value }));
                      }}
                      placeholder={currentTaxIdConfig.placeholder}
                      maxLength={currentTaxIdConfig.maxLength}
                      className={!panValidation.isValid ? 'border-red-500' : ''}
                    />
                    {panValidation.isChecking && (
                      <p className="text-xs text-muted-foreground">Checking {currentTaxIdConfig.fieldLabel.toLowerCase()}...</p>
                    )}
                    {!panValidation.isChecking && !panValidation.isValid && (
                      <p className="text-xs text-red-500">{panValidation.message}</p>
                    )}
                    {!panValidation.isChecking && panValidation.isValid && formData.panNumber && formData.panNumber.length >= (currentTaxIdConfig.maxLength || 10) && (
                      <p className="text-xs text-green-600">✓ {currentTaxIdConfig.fieldLabel} available</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      📍 Required format for {currentTaxIdConfig.country}: {currentTaxIdConfig.placeholder}
                    </p>
                  </div>
                )}
                {!currentTaxIdConfig && formData.location && (
                  <div className="space-y-2 col-span-2">
                    <p className="text-xs text-amber-600">
                      ⚠️ Please select a valid location to see the tax identification field
                    </p>
                  </div>
                )}

                {currentTaxIdConfig && (
                  <div className="space-y-2">
                    <Label htmlFor="fullNameAsPerPAN">
                      Full Name as per {currentTaxIdConfig.country === 'India' ? 'PAN Card' : currentTaxIdConfig.fieldLabel}
                    </Label>
                    <Input
                      id="fullNameAsPerPAN"
                      value={formData.fullNameAsPerPAN}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullNameAsPerPAN: e.target.value }))}
                      placeholder={`Full name matching ${currentTaxIdConfig.fieldLabel}`}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Employment Details</h3>
                  <p className="text-sm text-muted-foreground">Job position and organizational information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Job Title *</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subDepartment">Sub Department</Label>
                  <Input
                    id="subDepartment"
                    value={formData.subDepartment}
                    onChange={(e) => setFormData(prev => ({ ...prev, subDepartment: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessUnit">Business Unit *</Label>
                  <Select
                    value={formData.businessUnit}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, businessUnit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
                      <SelectItem value="Finance & Operations">Finance & Operations</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireType">Hire Type *</Label>
                  <Select
                    value={formData.hireType}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, hireType: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hire type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Employee ID format: Contract=ACUC, Permanent=ACUA, Intern=ACUI, Management=ACUM
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workerType">Worker Type *</Label>
                  <Select
                    value={formData.workerType}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, workerType: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date Joined *</Label>
                  <DatePicker
                    value={formData.dateOfJoining}
                    onChange={(date) => setFormData(prev => ({ ...prev, dateOfJoining: date }))}
                    placeholder="Select joining date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Contract Duration</Label>
                  <Select
                    value={formData.contractDuration}
                    onValueChange={(value: string) => {
                      setFormData(prev => ({ ...prev, contractDuration: value }));
                      
                      // Auto-calculate end date if not custom
                      if (value !== 'custom' && value !== '' && formData.dateOfJoining) {
                        const startDate = new Date(formData.dateOfJoining);
                        const months = parseInt(value);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + months);
                        
                        const formattedEndDate = endDate.toISOString().split('T')[0];
                        setFormData(prev => ({ ...prev, contractEndDate: formattedEndDate }));
                      } else if (value === '') {
                        setFormData(prev => ({ ...prev, contractEndDate: '' }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">1 Year</SelectItem>
                      <SelectItem value="24">2 Years</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Show calculated end date or date picker for custom */}
                  {formData.contractDuration === 'custom' ? (
                    <div className="mt-2">
                      <DatePicker
                        value={formData.contractEndDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, contractEndDate: date }))}
                        placeholder="Select custom end date"
                      />
                    </div>
                  ) : formData.contractEndDate && formData.contractDuration ? (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Contract ends on: {new Date(formData.contractEndDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  ) : null}
                </div>

                {/* BACKUP - Dotted Line Manager (commented out as per request) */}
                {/* <div className="space-y-2">
                  <Label htmlFor="dottedLineManagerId">Dotted Line Manager</Label>
                  <Select
                    value={formData.dottedLineManagerId || 'none'}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, dottedLineManagerId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dotted line manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {activeEmployees
                        .filter(emp => emp.employeeId !== formData.employeeId)
                        .map(emp => (
                          <SelectItem key={emp.employeeId} value={emp.employeeId}>
                            {emp.name} ({emp.employeeId})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div> */}

                {/* BACKUP - Reporting Manager (commented out as per request) */}
                {/* <div className="space-y-2">
                  <Label htmlFor="reportingManagerId">Reporting Manager's Employee Number</Label>
                  <Select
                    value={formData.reportingManagerId || 'none'}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, reportingManagerId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {activeEmployees
                        .filter(emp => emp.employeeId !== formData.employeeId)
                        .map(emp => (
                          <SelectItem key={emp.employeeId} value={emp.employeeId}>
                            {emp.name} ({emp.employeeId})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              {/* Leave Plan Assignment */}
              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-primary">📋</span>
                  Leave Plan Assignment
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="leavePlan">Leave Plan *</Label>
                  <Select
                    value={formData.leavePlan}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, leavePlan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Probation">Probation Leave Plan</SelectItem>
                      <SelectItem value="Acuvate">Acuvate Leave Plan (Standard)</SelectItem>
                      <SelectItem value="Confirmation">Confirmation Leave Plan</SelectItem>
                      <SelectItem value="Consultant">Consultant Leave Plan</SelectItem>
                      <SelectItem value="UK">UK Leave Plan</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    ℹ️ Leave plan determines employee's leave entitlements, accrual rates, and policies.
                    {formData.workerType === 'Contract' && ' Recommended: Consultant Leave Plan'}
                    {formData.workerType === 'Intern' && ' Recommended: Probation Leave Plan'}
                    {formData.location?.includes('UK') && ' Recommended: UK Leave Plan'}
                  </p>
                </div>
              </div>

              {/* Holiday Plan Assignment */}
              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-primary">🌍</span>
                  Holiday Plan Assignment
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="holidayPlan">Holiday Plan *</Label>
                  <Select
                    value={formData.holidayPlan}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, holidayPlan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select holiday plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    ℹ️ Holiday plan determines which regional holidays apply to this employee.
                    {formData.location?.includes('India') && ' Recommended: India'}
                    {formData.location?.includes('USA') && ' Recommended: USA'}
                    {formData.location?.includes('UK') && ' Recommended: UK'}
                    {formData.location?.includes('Remote') && ' Recommended: Remote'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">Phone numbers and email addresses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workPhone">Work Phone</Label>
                  <Input
                    id="workPhone"
                    type="tel"
                    value={formData.workPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, workPhone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceNumber">Residence Number</Label>
                  <Input
                    id="residenceNumber"
                    type="tel"
                    value={formData.residenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, residenceNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Family & Personal Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Family & Personal Details</h3>
                  <p className="text-sm text-muted-foreground">Family members and personal information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, maritalStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marriageDate">Marriage Date</Label>
                  <DatePicker
                    value={formData.marriageDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, marriageDate: date }))}
                    placeholder="Select marriage date"
                    disabled={formData.maritalStatus === 'Single'}
                    className={formData.maritalStatus === 'Single' ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                  {formData.maritalStatus === 'Single' && (
                    <p className="text-xs text-muted-foreground">Only for married employees</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouseName">Spouse Name</Label>
                  <Input
                    id="spouseName"
                    value={formData.spouseName}
                    onChange={(e) => setFormData(prev => ({ ...prev, spouseName: e.target.value }))}
                    disabled={formData.maritalStatus === 'Single'}
                  />
                  {formData.maritalStatus === 'Single' && (
                    <p className="text-xs text-muted-foreground">Only for married employees</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouseGender">Spouse Gender</Label>
                  <Select
                    value={formData.spouseGender}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, spouseGender: value }))}
                    disabled={formData.maritalStatus === 'Single'}
                  >
                    <SelectTrigger className={formData.maritalStatus === 'Single' ? 'opacity-50 cursor-not-allowed' : ''}>
                      <SelectValue placeholder="Select spouse gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.maritalStatus === 'Single' && (
                    <p className="text-xs text-muted-foreground">Only for married employees</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physicallyHandicapped">Physically Handicapped</Label>
                  <Select
                    value={formData.physicallyHandicapped}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, physicallyHandicapped: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, bloodGroup: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bank & Salary Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Bank & Salary Details</h3>
                  <p className="text-sm text-muted-foreground">Banking information and payment details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryPaymentMode">Salary Payment Mode</Label>
                  <Select
                    value={formData.salaryPaymentMode}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, salaryPaymentMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    disabled={formData.salaryPaymentMode === 'Cash'}
                  />
                  {formData.salaryPaymentMode === 'Cash' && (
                    <p className="text-xs text-muted-foreground">Only for bank-based payments</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    disabled={formData.salaryPaymentMode === 'Cash'}
                  />
                  {formData.salaryPaymentMode === 'Cash' && (
                    <p className="text-xs text-muted-foreground">Only for bank-based payments</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                    disabled={formData.salaryPaymentMode === 'Cash'}
                  />
                  {formData.salaryPaymentMode === 'Cash' && (
                    <p className="text-xs text-muted-foreground">Only for bank-based payments</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameOnAccount">Name on the Account</Label>
                  <Input
                    id="nameOnAccount"
                    value={formData.nameOnAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameOnAccount: e.target.value }))}
                    disabled={formData.salaryPaymentMode === 'Cash'}
                  />
                  {formData.salaryPaymentMode === 'Cash' && (
                    <p className="text-xs text-muted-foreground">Only for bank-based payments</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                    disabled={formData.salaryPaymentMode === 'Cash'}
                  />
                  {formData.salaryPaymentMode === 'Cash' && (
                    <p className="text-xs text-muted-foreground">Only for bank-based payments</p>
                  )}
                </div>
              </div>
            </div>
          )}

          </form>
        </div>

        {/* Footer Navigation - Fixed */}
        <div className="px-6 py-4 border-t bg-background flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="min-w-[120px]"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="min-w-[120px]">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Success Drawer - Show Generated Employee ID */}
    <Sheet open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-2 pb-4 border-b">
          <div className="flex-1">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <CheckCircle2 className="h-9 w-9 text-white" />
            </div>
            <div className="space-y-0.5">
              <SheetTitle className="text-center text-xl font-bold text-gray-900">
                Employee Created!
              </SheetTitle>
              <SheetDescription className="text-center text-xs text-gray-500">
                New employee added successfully
              </SheetDescription>
            </div>
          </div>
          <SheetCloseButton />
        </SheetHeader>
        
        {createdEmployeeData && (
          <div className="mt-5 space-y-4 pb-4">
            {/* Employee ID Card - Bright Design */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-4 shadow-md">
              <div className="relative z-10">
                <p className="mb-1 text-xs font-medium text-cyan-100">Employee ID</p>
                <p className="text-2xl font-bold tracking-tight text-white">
                  {createdEmployeeData.employeeId}
                </p>
                <div className="mt-2 inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 backdrop-blur-sm">
                  <span className="text-xs font-medium text-white">
                    {createdEmployeeData.employeeId.startsWith('ACUC') && 'Contract'}
                    {createdEmployeeData.employeeId.startsWith('ACUA') && 'Permanent'}
                    {createdEmployeeData.employeeId.startsWith('ACUI') && 'Intern'}
                    {createdEmployeeData.employeeId.startsWith('ACUM') && 'Management'}
                  </span>
                </div>
              </div>
              <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10"></div>
            </div>
            
            {/* Employee Details - Compact List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Details</h3>
              <div className="space-y-1.5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Name</span>
                  <span className="text-xs font-semibold text-gray-900">{createdEmployeeData.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Email</span>
                  <span className="text-xs font-medium text-gray-800">{createdEmployeeData.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Department</span>
                  <span className="text-xs font-medium text-gray-800">{createdEmployeeData.department}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Designation</span>
                  <span className="text-xs font-medium text-gray-800">{createdEmployeeData.designation}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-600">Type</span>
                  <span className="text-xs font-medium text-gray-800">{createdEmployeeData.hireType}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Compact Layout */}
            <div className="space-y-2 pt-2 border-t">
              <Button
                onClick={() => {
                  if (createdEmployeeData?.employeeId) {
                    setShowSuccessDialog(false);
                    onClose();
                    sessionStorage.setItem('profileReferrer', '/hr/employee-management');
                    navigate(`/employee/profile/${createdEmployeeData.employeeId}`);
                  } else {
                    toast.error('Employee ID not available');
                  }
                }}
                variant="default"
                className="w-full h-9 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-sm"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Profile
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setCreatedEmployeeData(null);
                    // Reset form for adding another employee
                    setCurrentStep(1);
                    setFormData({
                      employeeId: '',
                      displayName: '',
                      firstName: '',
                      middleName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      dialCode: '+1',
                      mobileNumber: '',
                      gender: '',
                      dateOfBirth: '',
                      dateOfJoining: '',
                      contractDuration: '',
                      contractEndDate: '',
                      legalEntity: '',
                      department: '',
                      subDepartment: '',
                      businessUnit: '',
                      designation: '',
                      secondaryJobTitle: '',
                      location: '',
                      workerType: '',
                      hireType: '',
                      dottedLineManagerId: '',
                      reportingManagerId: '',
                      leavePlan: '',
                      holidayPlan: 'India',
                      workPhone: '',
                      residenceNumber: '',
                      personalEmail: '',
                      maritalStatus: '',
                      marriageDate: '',
                      fatherName: '',
                      motherName: '',
                      spouseName: '',
                      spouseGender: '',
                      physicallyHandicapped: 'No',
                      bloodGroup: '',
                      nationality: '',
                      panCardAvailable: 'No',
                      panNumber: '',
                      fullNameAsPerPAN: '',
                      dobInPAN: '',
                      parentsNameAsPerPAN: '',
                      salaryPaymentMode: '',
                      bankName: '',
                      accountNumber: '',
                      ifscCode: '',
                      nameOnAccount: '',
                      branch: '',
                      profilePhoto: '',
                      status: 'active' as 'active' | 'inactive',
                    });
                    onSuccess?.();
                  }}
                  variant="outline"
                  className="h-9 text-sm border-teal-500 text-teal-700 hover:bg-teal-50"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Another
                </Button>
                
                <Button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setCreatedEmployeeData(null);
                    onSuccess?.();
                  }}
                  variant="outline"
                  className="h-9 text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}
