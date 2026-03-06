import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { CreditCard, Upload, Edit2, Save, X, FileText, User, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface IdentityInfoTabProps {
  employeeId: string;
  location: string;
  identityData?: {
    aadhaar?: {
      number?: string;
      enrollmentNumber?: string;
      name?: string;
      dateOfBirth?: string;
      gender?: string;
      address?: string;
      photoUrl?: string;
      documentUrl?: string;
    };
    pan?: {
      number?: string;
      name?: string;
      fatherName?: string;
      dateOfBirth?: string;
      photoUrl?: string;
      documentUrl?: string;
    };
    ssn?: {
      number?: string;
      documentUrl?: string;
    };
    driverLicense?: {
      number?: string;
      state?: string;
      expiryDate?: string;
      documentUrl?: string;
    };
    taxId?: {
      number?: string;
      documentUrl?: string;
    };
  };
  onUpdate?: () => void;
}

export default function IdentityInfoTab({ 
  employeeId, 
  location, 
  identityData = {},
  onUpdate 
}: IdentityInfoTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<{ [key: string]: string }>({});

  // Form data states
  const [aadhaarData, setAadhaarData] = useState({
    number: identityData.aadhaar?.number || '',
    enrollmentNumber: identityData.aadhaar?.enrollmentNumber || '',
    name: identityData.aadhaar?.name || '',
    dateOfBirth: identityData.aadhaar?.dateOfBirth || '',
    gender: identityData.aadhaar?.gender || '',
    address: identityData.aadhaar?.address || '',
    photoUrl: identityData.aadhaar?.photoUrl || '',
    documentUrl: identityData.aadhaar?.documentUrl || '',
  });

  const [panData, setPanData] = useState({
    number: identityData.pan?.number || '',
    name: identityData.pan?.name || '',
    fatherName: identityData.pan?.fatherName || '',
    dateOfBirth: identityData.pan?.dateOfBirth || '',
    photoUrl: identityData.pan?.photoUrl || '',
    documentUrl: identityData.pan?.documentUrl || '',
  });

  const [ssnData, setSsnData] = useState({
    number: identityData.ssn?.number || '',
    documentUrl: identityData.ssn?.documentUrl || '',
  });

  const [driverLicenseData, setDriverLicenseData] = useState({
    number: identityData.driverLicense?.number || '',
    state: identityData.driverLicense?.state || '',
    expiryDate: identityData.driverLicense?.expiryDate || '',
    documentUrl: identityData.driverLicense?.documentUrl || '',
  });

  const [taxIdData, setTaxIdData] = useState({
    number: identityData.taxId?.number || '',
    documentUrl: identityData.taxId?.documentUrl || '',
  });

  // Location detection - defaults to India if not specified
  const locationLower = location?.toLowerCase() || '';
  const isUSA = locationLower.includes('usa') || locationLower.includes('united states') || locationLower.includes('america');
  // Default to India for most cases unless explicitly USA
  const isIndia = !isUSA || locationLower.includes('india') || locationLower.includes('bangalore') || locationLower.includes('mumbai') || locationLower.includes('delhi') || locationLower.includes('hyderabad') || locationLower.includes('chennai') || locationLower.includes('pune');

  // Debug logging
  console.log('IdentityInfoTab - Location:', location);
  console.log('IdentityInfoTab - isIndia:', isIndia);
  console.log('IdentityInfoTab - isUSA:', isUSA);

  const handleFileUpload = async (file: File, docType: string, field: string) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '')) {
      toast.error('Invalid file format. Only PDF, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${sizeMB}MB) exceeds 5MB limit`);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);
      formData.append('field', field);

      // TODO: Replace with actual upload endpoint
      // const response = await apiClient.post(`/employees/${employeeId}/upload-identity-doc`, formData);
      
      // For now, create a local URL
      const fileUrl = URL.createObjectURL(file);
      const uploadKey = `${docType}_${field}`;
      
      // Store filename
      setUploadedFileName(prev => ({ ...prev, [uploadKey]: file.name }));
      
      // Update the appropriate state based on document type
      if (docType === 'aadhaar' && field === 'document') {
        setAadhaarData(prev => ({ ...prev, documentUrl: fileUrl }));
      } else if (docType === 'aadhaar' && field === 'photo') {
        setAadhaarData(prev => ({ ...prev, photoUrl: fileUrl }));
      } else if (docType === 'pan' && field === 'document') {
        setPanData(prev => ({ ...prev, documentUrl: fileUrl }));
      } else if (docType === 'pan' && field === 'photo') {
        setPanData(prev => ({ ...prev, photoUrl: fileUrl }));
      } else if (docType === 'ssn') {
        setSsnData(prev => ({ ...prev, documentUrl: fileUrl }));
      } else if (docType === 'driverLicense') {
        setDriverLicenseData(prev => ({ ...prev, documentUrl: fileUrl }));
      } else if (docType === 'taxId') {
        setTaxIdData(prev => ({ ...prev, documentUrl: fileUrl }));
      }

      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.success(`${file.name} (${fileSizeMB}MB) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (docType: string) => {
    try {
      setIsSaving(true);
      
      let dataToSave: any = {};
      if (docType === 'aadhaar') {
        // Validate Aadhaar number (12 digits)
        if (aadhaarData.number && !/^\d{12}$/.test(aadhaarData.number)) {
          toast.error('Aadhaar number must be exactly 12 digits');
          return;
        }
        if (!aadhaarData.documentUrl) {
          toast.error('Please upload Aadhaar document');
          return;
        }
        dataToSave = { aadhaar: aadhaarData };
      } else if (docType === 'pan') {
        // Validate PAN number format
        if (panData.number && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panData.number)) {
          toast.error('PAN must be in format: ABCDE1234F');
          return;
        }
        if (!panData.documentUrl) {
          toast.error('Please upload PAN document');
          return;
        }
        dataToSave = { pan: panData };
      } else if (docType === 'ssn') {
        if (!ssnData.documentUrl) {
          toast.error('Please upload SSN document');
          return;
        }
        dataToSave = { ssn: ssnData };
      } else if (docType === 'driverLicense') {
        if (!driverLicenseData.documentUrl) {
          toast.error('Please upload Driver License document');
          return;
        }
        dataToSave = { driverLicense: driverLicenseData };
      } else if (docType === 'taxId') {
        if (!taxIdData.documentUrl) {
          toast.error('Please upload Tax ID document');
          return;
        }
        dataToSave = { taxId: taxIdData };
      }

      // TODO: Replace with actual API call
      // await apiClient.patch(`/employees/${employeeId}/identity-documents`, dataToSave);
      
      console.log('Saving identity data:', dataToSave);
      toast.success('Identity information updated successfully');
      setEditingSection(null);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to save identity information:', error);
      toast.error('Failed to update identity information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (docType: string) => {
    if (docType === 'aadhaar') {
      setAadhaarData({
        number: identityData.aadhaar?.number || '',
        enrollmentNumber: identityData.aadhaar?.enrollmentNumber || '',
        name: identityData.aadhaar?.name || '',
        dateOfBirth: identityData.aadhaar?.dateOfBirth || '',
        gender: identityData.aadhaar?.gender || '',
        address: identityData.aadhaar?.address || '',
        photoUrl: identityData.aadhaar?.photoUrl || '',
        documentUrl: identityData.aadhaar?.documentUrl || '',
      });
    } else if (docType === 'pan') {
      setPanData({
        number: identityData.pan?.number || '',
        name: identityData.pan?.name || '',
        fatherName: identityData.pan?.fatherName || '',
        dateOfBirth: identityData.pan?.dateOfBirth || '',
        photoUrl: identityData.pan?.photoUrl || '',
        documentUrl: identityData.pan?.documentUrl || '',
      });
    }
    setEditingSection(null);
  };

  // India - Aadhaar Card Form
  const renderAadhaarCard = () => (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Aadhaar Card (Photo ID / Address Proof)
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
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Aadhaar Number <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'aadhaar' ? (
              <Input
                value={aadhaarData.number}
                onChange={(e) => setAadhaarData(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.number || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Enrollment Number
            </Label>
            {editingSection === 'aadhaar' ? (
              <Input
                value={aadhaarData.enrollmentNumber}
                onChange={(e) => setAadhaarData(prev => ({ ...prev, enrollmentNumber: e.target.value }))}
                placeholder="Enrollment number (if available)"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.enrollmentNumber || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Name (As per Aadhaar) <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'aadhaar' ? (
              <Input
                value={aadhaarData.name}
                onChange={(e) => setAadhaarData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name as per Aadhaar"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'aadhaar' ? (
              <DatePicker
                value={aadhaarData.dateOfBirth}
                onChange={(date) => setAadhaarData(prev => ({ ...prev, dateOfBirth: date }))}
                placeholder="Select date of birth"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.dateOfBirth || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Gender <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'aadhaar' ? (
              <select
                value={aadhaarData.gender}
                onChange={(e) => setAadhaarData(prev => ({ ...prev, gender: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.gender || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Address (As per Aadhaar) <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'aadhaar' ? (
              <textarea
                value={aadhaarData.address}
                onChange={(e) => setAadhaarData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address as per Aadhaar"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{aadhaarData.address || 'Not provided'}</p>
            )}
          </div>

          {/* Upload section - always visible in edit mode OR when no document exists */}
          {(editingSection === 'aadhaar' || !aadhaarData.documentUrl) && (
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-3 block">
                Upload Aadhaar Document <span className="text-red-500">*</span>
              </Label>
              
              {!aadhaarData.documentUrl ? (
                <label
                  htmlFor="aadhaar-file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload Aadhaar</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <Input
                    id="aadhaar-file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'aadhaar', 'document');
                    }}
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFileName.aadhaar_document || 'Aadhaar Card'}
                      </p>
                      <p className="text-xs text-green-600">✓ Document uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={aadhaarData.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                    >
                      View
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAadhaarData(prev => ({ ...prev, documentUrl: '' }));
                        setUploadedFileName(prev => ({ ...prev, aadhaar_document: '' }));
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show uploaded document when not in edit mode AND document exists */}
          {editingSection !== 'aadhaar' && aadhaarData.documentUrl && (
            <div className="md:col-span-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Uploaded Document
              </Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium flex-1">
                  {uploadedFileName.aadhaar_document || 'Aadhaar document attached'}
                </span>
                <a 
                  href={aadhaarData.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
                >
                  View
                </a>
              </div>
            </div>
          )}
        </div>

        {editingSection === 'aadhaar' && (
          <div className="flex gap-2 justify-end mt-6">
            <Button onClick={() => handleCancel('aadhaar')} variant="outline" size="sm" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => handleSave('aadhaar')} disabled={isSaving || isUploading} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // India - PAN Card Form
  const renderPANCard = () => (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-green-600" />
            PAN Card (Tax Identity / Payroll)
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
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Permanent Account Number (PAN) <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'pan' ? (
              <Input
                value={panData.number}
                onChange={(e) => setPanData(prev => ({ ...prev, number: e.target.value.toUpperCase().slice(0, 10) }))}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{panData.number || 'Not provided'}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Name (As per PAN) <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'pan' ? (
              <Input
                value={panData.name}
                onChange={(e) => setPanData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name as per PAN"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{panData.name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Father's Name <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'pan' ? (
              <Input
                value={panData.fatherName}
                onChange={(e) => setPanData(prev => ({ ...prev, fatherName: e.target.value }))}
                placeholder="Father's name as per PAN"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{panData.fatherName || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            {editingSection === 'pan' ? (
              <DatePicker
                value={panData.dateOfBirth}
                onChange={(date) => setPanData(prev => ({ ...prev, dateOfBirth: date }))}
                placeholder="Select date of birth"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">{panData.dateOfBirth || 'Not provided'}</p>
            )}
          </div>

          {/* Upload section - always visible in edit mode OR when no document exists */}
          {(editingSection === 'pan' || !panData.documentUrl) && (
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-3 block">
                Upload PAN Document <span className="text-red-500">*</span>
              </Label>
              
              {!panData.documentUrl ? (
                <label
                  htmlFor="pan-file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload PAN Card</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <Input
                    id="pan-file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pan', 'document');
                    }}
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFileName.pan_document || 'PAN Card'}
                      </p>
                      <p className="text-xs text-green-600">✓ Document uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={panData.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                    >
                      View
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPanData(prev => ({ ...prev, documentUrl: '' }));
                        setUploadedFileName(prev => ({ ...prev, pan_document: '' }));
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show uploaded document when not in edit mode AND document exists */}
          {editingSection !== 'pan' && panData.documentUrl && (
            <div className="md:col-span-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Uploaded Document
              </Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium flex-1">
                  {uploadedFileName.pan_document || 'PAN card document attached'}
                </span>
                <a 
                  href={panData.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
                >
                  View
                </a>
              </div>
            </div>
          )}
        </div>

        {editingSection === 'pan' && (
          <div className="flex gap-2 justify-end mt-6">
            <Button onClick={() => handleCancel('pan')} variant="outline" size="sm" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => handleSave('pan')} disabled={isSaving || isUploading} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // USA - Documents (simplified for now, can be expanded)
  const renderUSADocuments = () => (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            USA Identity Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please upload required identity documents for USA employees:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Social Security Number (SSN)</li>
            <li>Driver's License</li>
            <li>Tax ID</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Document management for USA employees coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {isIndia ? (
        <>
          {renderAadhaarCard()}
          {renderPANCard()}
        </>
      ) : isUSA ? (
        renderUSADocuments()
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Identity Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Identity document requirements vary by location</p>
              <p className="text-sm mt-1">Current location: {location || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
