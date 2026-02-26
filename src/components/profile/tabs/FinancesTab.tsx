import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface FinancesTabProps {
  onUpdate?: (data: any) => Promise<void>;
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

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      await onUpdate(formData);
      setEditingSection(null);
      toast.success('Financial information updated successfully');
    } catch (error) {
      console.error('Error updating financial information:', error);
      toast.error('Failed to update financial information');
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6">
      {/* Bank Account Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Bank Account Details
            </div>
            {editingSection !== 'bank' && (
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
            {editingSection !== 'pf' && (
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
                <Input
                  type="date"
                  value={formData.pfJoiningDate}
                  onChange={(e) => setFormData({ ...formData, pfJoiningDate: e.target.value })}
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
            {editingSection !== 'esi' && (
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

      {/* Aadhaar Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-orange-600" />
              Aadhaar Details
            </div>
            {editingSection !== 'aadhaar' && (
              <Button onClick={() => setEditingSection('aadhaar')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Aadhaar Number
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="Enter Aadhaar number"
                  maxLength={12}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.aadhaarNumber || aadhaarNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Enrollment Number
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  placeholder="Enter enrollment number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.enrollmentNumber || enrollmentNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Date of Birth (as per Aadhaar)
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  type="date"
                  value={formData.dobInAadhaar}
                  onChange={(e) => setFormData({ ...formData, dobInAadhaar: e.target.value })}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.dobInAadhaar || dobInAadhaar || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Full Name (as per Aadhaar)
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  value={formData.fullNameAsPerAadhaar}
                  onChange={(e) => setFormData({ ...formData, fullNameAsPerAadhaar: e.target.value })}
                  placeholder="Enter name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.fullNameAsPerAadhaar || fullNameAsPerAadhaar || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Gender (as per Aadhaar)
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  value={formData.genderAsInAadhaar}
                  onChange={(e) => setFormData({ ...formData, genderAsInAadhaar: e.target.value })}
                  placeholder="Male/Female/Other"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.genderAsInAadhaar || genderAsInAadhaar || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Address (as per Aadhaar)
              </label>
              {editingSection === 'aadhaar' ? (
                <Input
                  value={formData.addressAsInAadhaar}
                  onChange={(e) => setFormData({ ...formData, addressAsInAadhaar: e.target.value })}
                  placeholder="Enter address"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.addressAsInAadhaar || addressAsInAadhaar || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'aadhaar' && (
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

      {/* PAN Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-red-600" />
              PAN Card Details
            </div>
            {editingSection !== 'pan' && (
              <Button onClick={() => setEditingSection('pan')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PAN Card Available
              </label>
              {editingSection === 'pan' ? (
                <Input
                  value={formData.panCardAvailable}
                  onChange={(e) => setFormData({ ...formData, panCardAvailable: e.target.value })}
                  placeholder="Yes/No"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.panCardAvailable || panCardAvailable || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                PAN Number
              </label>
              {editingSection === 'pan' ? (
                <Input
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="Enter PAN number"
                  maxLength={10}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.panNumber || panNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Full Name (as per PAN)
              </label>
              {editingSection === 'pan' ? (
                <Input
                  value={formData.fullNameAsPerPAN}
                  onChange={(e) => setFormData({ ...formData, fullNameAsPerPAN: e.target.value })}
                  placeholder="Enter name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.fullNameAsPerPAN || fullNameAsPerPAN || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Date of Birth (as per PAN)
              </label>
              {editingSection === 'pan' ? (
                <Input
                  type="date"
                  value={formData.dobInPAN}
                  onChange={(e) => setFormData({ ...formData, dobInPAN: e.target.value })}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.dobInPAN || dobInPAN || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Parent's Name (as per PAN)
              </label>
              {editingSection === 'pan' ? (
                <Input
                  value={formData.parentsNameAsPerPAN}
                  onChange={(e) => setFormData({ ...formData, parentsNameAsPerPAN: e.target.value })}
                  placeholder="Enter parent's name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{formData.parentsNameAsPerPAN || parentsNameAsPerPAN || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'pan' && (
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


