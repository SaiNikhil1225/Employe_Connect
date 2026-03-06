import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Building2, Edit2, Save, X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '@/services/employeeManagementService';

interface FinancesTabProps {
  employeeId?: string;
  onUpdate?: (data: any) => Promise<void>;
  onDocumentUpdate?: () => Promise<void>;
  canEdit?: boolean;
  aadhaarDocument?: any;
  // Salary
  salary?: string;
  salaryPaymentMode?: string;
  
  // Bank Details
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  nameOnAccount?: string;
  branch?: string;
  
  // PF Details
  pfDetailsAvailable?: string;
  pfNumber?: string;
  pfJoiningDate?: string;
  nameOnPFAccount?: string;
  uan?: string;
  pfEstablishmentId?: string;
  
  // ESI Details
  esiEligible?: string;
  esiDetailsAvailable?: string;
  esiNumber?: string;
  employerESINumber?: string;
  ptEstablishmentId?: string;
  lwfEligible?: string;
  
  // Aadhaar Details
  aadhaarNumber?: string;
  enrollmentNumber?: string;
  dobInAadhaar?: string;
  fullNameAsPerAadhaar?: string;
  addressAsInAadhaar?: string;
  genderAsInAadhaar?: string;
  
  // PAN Details
  panCardAvailable?: string;
  panNumber?: string;
  fullNameAsPerPAN?: string;
  dobInPAN?: string;
  parentsNameAsPerPAN?: string;
}

export default function FinancesTab({
  employeeId,
  canEdit = true, // Default to true for backward compatibility
  aadhaarDocument,
  onDocumentUpdate,
  salary,
  salaryPaymentMode,
  accountNumber = '****',
  bankName = 'Not available',
  ifscCode = '****',
  nameOnAccount,
  branch,
  pfDetailsAvailable,
  pfNumber,
  pfJoiningDate,
  nameOnPFAccount,
  uan,
  pfEstablishmentId,
  esiEligible,
  esiDetailsAvailable,
  esiNumber,
  employerESINumber,
  ptEstablishmentId,
  lwfEligible,
  aadhaarNumber,
  enrollmentNumber,
  dobInAadhaar,
  fullNameAsPerAadhaar,
  addressAsInAadhaar,
  genderAsInAadhaar,
  panCardAvailable,
  panNumber,
  fullNameAsPerPAN,
  dobInPAN,
  parentsNameAsPerPAN,
  onUpdate,
}: FinancesTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const aadhaarFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    salary: salary || '',
    salaryPaymentMode: salaryPaymentMode || '',
    accountNumber: accountNumber || '',
    bankName: bankName || '',
    ifscCode: ifscCode || '',
    nameOnAccount: nameOnAccount || '',
    branch: branch || '',
    pfDetailsAvailable: pfDetailsAvailable || '',
    pfNumber: pfNumber || '',
    pfJoiningDate: pfJoiningDate || '',
    nameOnPFAccount: nameOnPFAccount || '',
    uan: uan || '',
    pfEstablishmentId: pfEstablishmentId || '',
    esiEligible: esiEligible || '',
    esiDetailsAvailable: esiDetailsAvailable || '',
    esiNumber: esiNumber || '',
    employerESINumber: employerESINumber || '',
    ptEstablishmentId: ptEstablishmentId || '',
    lwfEligible: lwfEligible || '',
    aadhaarNumber: aadhaarNumber || '',
    enrollmentNumber: enrollmentNumber || '',
    dobInAadhaar: dobInAadhaar || '',
    fullNameAsPerAadhaar: fullNameAsPerAadhaar || '',
    addressAsInAadhaar: addressAsInAadhaar || '',
    genderAsInAadhaar: genderAsInAadhaar || '',
    panCardAvailable: panCardAvailable || '',
    panNumber: panNumber || '',
    fullNameAsPerPAN: fullNameAsPerPAN || '',
    dobInPAN: dobInPAN || '',
    parentsNameAsPerPAN: parentsNameAsPerPAN || '',
  });

  // Update formData when props change (e.g., after successful update)
  useEffect(() => {
    setFormData({
      salary: salary || '',
      salaryPaymentMode: salaryPaymentMode || '',
      accountNumber: accountNumber || '',
      bankName: bankName || '',
      ifscCode: ifscCode || '',
      nameOnAccount: nameOnAccount || '',
      branch: branch || '',
      pfDetailsAvailable: pfDetailsAvailable || '',
      pfNumber: pfNumber || '',
      pfJoiningDate: pfJoiningDate || '',
      nameOnPFAccount: nameOnPFAccount || '',
      uan: uan || '',
      pfEstablishmentId: pfEstablishmentId || '',
      esiEligible: esiEligible || '',
      esiDetailsAvailable: esiDetailsAvailable || '',
      esiNumber: esiNumber || '',
      employerESINumber: employerESINumber || '',
      ptEstablishmentId: ptEstablishmentId || '',
      lwfEligible: lwfEligible || '',
      aadhaarNumber: aadhaarNumber || '',
      enrollmentNumber: enrollmentNumber || '',
      dobInAadhaar: dobInAadhaar || '',
      fullNameAsPerAadhaar: fullNameAsPerAadhaar || '',
      addressAsInAadhaar: addressAsInAadhaar || '',
      genderAsInAadhaar: genderAsInAadhaar || '',
      panCardAvailable: panCardAvailable || '',
      panNumber: panNumber || '',
      fullNameAsPerPAN: fullNameAsPerPAN || '',
      dobInPAN: dobInPAN || '',
      parentsNameAsPerPAN: parentsNameAsPerPAN || '',
    });
  }, [salary, salaryPaymentMode, accountNumber, bankName, ifscCode, nameOnAccount, branch, 
      pfDetailsAvailable, pfNumber, pfJoiningDate, nameOnPFAccount, uan, pfEstablishmentId,
      esiEligible, esiDetailsAvailable, esiNumber, employerESINumber, ptEstablishmentId, lwfEligible,
      aadhaarNumber, enrollmentNumber, dobInAadhaar, fullNameAsPerAadhaar, addressAsInAadhaar, genderAsInAadhaar,
      panCardAvailable, panNumber, fullNameAsPerPAN, dobInPAN, parentsNameAsPerPAN]);

  const validateAadhaar = (aadhaarNumber: string): boolean => {
    // Remove spaces and hyphens
    const cleaned = aadhaarNumber.replace(/[\s-]/g, '');
    
    // Check if it's exactly 12 digits
    if (!/^\d{12}$/.test(cleaned)) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    console.log('Saving finances - section:', editingSection);
    console.log('Data being sent:', formData);
    
    // Validate Aadhaar number if editing aadhaar section
    if (editingSection === 'aadhaar' && formData.aadhaarNumber) {
      if (!validateAadhaar(formData.aadhaarNumber)) {
        return;
      }
    }
    
    setIsSaving(true);
    try {
      await onUpdate(formData);
      console.log('Finances update complete');
      setEditingSection(null);
      toast.success('Financial information updated successfully');
    } catch (error) {
      console.error('Error updating financial information:', error);
      toast.error('Failed to update financial information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, or PDF files are allowed');
        return;
      }
      setAadhaarFile(file);
    }
  };

  const handleUploadAadhaar = async () => {
    if (!aadhaarFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    // Validate Aadhaar number before upload
    if (formData.aadhaarNumber && !validateAadhaar(formData.aadhaarNumber)) {
      return;
    }

    try {
      setUploadingAadhaar(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', aadhaarFile);
      formDataToSend.append('employeeId', employeeId);
      formDataToSend.append('documentType', 'Aadhaar Card');
      formDataToSend.append('documentNumber', formData.aadhaarNumber || '');

      const response = await documentService.uploadDocument(formDataToSend);
      if (response.success) {
        toast.success('Aadhaar document uploaded successfully');
        setAadhaarFile(null);
        if (aadhaarFileInputRef.current) {
          aadhaarFileInputRef.current.value = '';
        }
        if (onDocumentUpdate) {
          await onDocumentUpdate();
        }
      }
    } catch (error) {
      toast.error('Failed to upload Aadhaar document');
      console.error(error);
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      salary: salary || '',
      salaryPaymentMode: salaryPaymentMode || '',
      accountNumber: accountNumber || '',
      bankName: bankName || '',
      ifscCode: ifscCode || '',
      nameOnAccount: nameOnAccount || '',
      branch: branch || '',
      pfDetailsAvailable: pfDetailsAvailable || '',
      pfNumber: pfNumber || '',
      pfJoiningDate: pfJoiningDate || '',
      nameOnPFAccount: nameOnPFAccount || '',
      uan: uan || '',
      pfEstablishmentId: pfEstablishmentId || '',
      esiEligible: esiEligible || '',
      esiDetailsAvailable: esiDetailsAvailable || '',
      esiNumber: esiNumber || '',
      employerESINumber: employerESINumber || '',
      ptEstablishmentId: ptEstablishmentId || '',
      lwfEligible: lwfEligible || '',
      aadhaarNumber: aadhaarNumber || '',
      enrollmentNumber: enrollmentNumber || '',
      dobInAadhaar: dobInAadhaar || '',
      fullNameAsPerAadhaar: fullNameAsPerAadhaar || '',
      addressAsInAadhaar: addressAsInAadhaar || '',
      genderAsInAadhaar: genderAsInAadhaar || '',
      panCardAvailable: panCardAvailable || '',
      panNumber: panNumber || '',
      fullNameAsPerPAN: fullNameAsPerPAN || '',
      dobInPAN: dobInPAN || '',
      parentsNameAsPerPAN: parentsNameAsPerPAN || '',
    });
    setEditingSection(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bank Account Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Bank Account Details
            </div>
            {canEdit && editingSection !== 'bank' && (
              <Button onClick={() => setEditingSection('bank')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Bank Name
              </label>
              {editingSection === 'bank' ? (
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Enter bank name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.bankName || bankName}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Account Number
              </label>
              {editingSection === 'bank' ? (
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.accountNumber || accountNumber}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                IFSC Code
              </label>
              {editingSection === 'bank' ? (
                <Input
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="Enter IFSC code"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.ifscCode || ifscCode}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Name on Account
              </label>
              {editingSection === 'bank' ? (
                <Input
                  value={formData.nameOnAccount}
                  onChange={(e) => setFormData({ ...formData, nameOnAccount: e.target.value })}
                  placeholder="Enter name on account"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.nameOnAccount || nameOnAccount || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Branch
              </label>
              {editingSection === 'bank' ? (
                <Input
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="Enter branch"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.branch || branch || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'bank' && (
            <div className="flex gap-2 justify-end mt-6">
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provident Fund (PF) Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Provident Fund (PF) Details
            </div>
            {canEdit && editingSection !== 'pf' && (
              <Button onClick={() => setEditingSection('pf')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PF Details Available
              </label>
              {editingSection === 'pf' ? (
                <Input
                  value={formData.pfDetailsAvailable}
                  onChange={(e) => setFormData({ ...formData, pfDetailsAvailable: e.target.value })}
                  placeholder="Yes/No"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.pfDetailsAvailable || pfDetailsAvailable || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PF Number
              </label>
              {editingSection === 'pf' ? (
                <Input
                  value={formData.pfNumber}
                  onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                  placeholder="Enter PF number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.pfNumber || pfNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PF Joining Date
              </label>
              {editingSection === 'pf' ? (
                <DatePicker
                  value={formData.pfJoiningDate}
                  onChange={(date) => setFormData({ ...formData, pfJoiningDate: date })}
                  placeholder="Select PF joining date"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.pfJoiningDate || pfJoiningDate || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Name on PF Account
              </label>
              {editingSection === 'pf' ? (
                <Input
                  value={formData.nameOnPFAccount}
                  onChange={(e) => setFormData({ ...formData, nameOnPFAccount: e.target.value })}
                  placeholder="Enter name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.nameOnPFAccount || nameOnPFAccount || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                UAN
              </label>
              {editingSection === 'pf' ? (
                <Input
                  value={formData.uan}
                  onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                  placeholder="Enter UAN"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.uan || uan || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PF Establishment ID
              </label>
              {editingSection === 'pf' ? (
                <Input
                  value={formData.pfEstablishmentId}
                  onChange={(e) => setFormData({ ...formData, pfEstablishmentId: e.target.value })}
                  placeholder="Enter establishment ID"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.pfEstablishmentId || pfEstablishmentId || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'pf' && (
            <div className="flex gap-2 justify-end mt-6">
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ESI Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-purple-600" />
              ESI Details
            </div>
            {canEdit && editingSection !== 'esi' && (
              <Button onClick={() => setEditingSection('esi')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                ESI Eligible
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.esiEligible}
                  onChange={(e) => setFormData({ ...formData, esiEligible: e.target.value })}
                  placeholder="Yes/No"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.esiEligible || esiEligible || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                ESI Details Available
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.esiDetailsAvailable}
                  onChange={(e) => setFormData({ ...formData, esiDetailsAvailable: e.target.value })}
                  placeholder="Yes/No"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.esiDetailsAvailable || esiDetailsAvailable || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                ESI Number
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.esiNumber}
                  onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                  placeholder="Enter ESI number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.esiNumber || esiNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Employer ESI Number
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.employerESINumber}
                  onChange={(e) => setFormData({ ...formData, employerESINumber: e.target.value })}
                  placeholder="Enter employer ESI number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.employerESINumber || employerESINumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PT Establishment ID
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.ptEstablishmentId}
                  onChange={(e) => setFormData({ ...formData, ptEstablishmentId: e.target.value })}
                  placeholder="Enter PT establishment ID"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.ptEstablishmentId || ptEstablishmentId || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                LWF Eligible
              </label>
              {editingSection === 'esi' ? (
                <Input
                  value={formData.lwfEligible}
                  onChange={(e) => setFormData({ ...formData, lwfEligible: e.target.value })}
                  placeholder="Yes/No"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.lwfEligible || lwfEligible || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'esi' && (
            <div className="flex gap-2 justify-end mt-6">
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


