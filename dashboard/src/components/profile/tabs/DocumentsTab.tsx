import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Car, 
  Plane, 
  GraduationCap, 
  Briefcase, 
  Syringe,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Globe,
  Plus,
  Upload,
  X,
  File
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  isMandatory: boolean;
  uploadedFile?: {
    fileName: string;
    uploadedDate: string;
  };
}

interface DocumentsTabProps {
  documents?: Document[];
  onAddDetails?: (documentType: string) => void;
}

const documentTypes = [
  { id: 'voter-id', name: 'Voter ID Card', icon: CreditCard, isMandatory: true },
  { id: 'driving-license', name: 'Driving License', icon: Car, isMandatory: false },
  { id: 'passport', name: 'Passport', icon: Plane, isMandatory: false },
  { id: 'educational-certificates', name: 'Educational Certificates', icon: GraduationCap, isMandatory: true },
  { id: 'previous-experience', name: 'Previous Experience Letters', icon: Briefcase, isMandatory: false },
  { id: 'covid-vaccination', name: 'COVID Vaccination Certificate(s)', icon: Syringe, isMandatory: true },
  { id: 'certifications', name: 'Certifications', icon: Award, isMandatory: false },
  { id: 'promotion-revision', name: 'Promotion & Revision Letter', icon: TrendingUp, isMandatory: false },
  { id: 'presales-feedback', name: 'Presales Contribution Feedback Form', icon: Target, isMandatory: false },
  { id: 'innovation-feedback', name: 'Innovation Contribution Feedback Form', icon: Award, isMandatory: false },
  { id: 'mentor-feedback', name: 'Mentor Contribution Feedback Form', icon: Users, isMandatory: false },
  { id: 'training-feedback', name: 'Training Sessions Feedback Form', icon: BookOpen, isMandatory: false },
  { id: 'account-mining', name: 'Account Mining Feedback Form', icon: Target, isMandatory: false },
  { id: 'domain-feedback', name: 'Domain Understanding Feedback Form', icon: Globe, isMandatory: false },
];

export default function DocumentsTab({ documents = [], onAddDetails }: DocumentsTabProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof documentTypes[0] | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notApplicable, setNotApplicable] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>('');
  const [previewFileType, setPreviewFileType] = useState<string>('');
  
  // Store saved document data by document ID
  const [savedDocuments, setSavedDocuments] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    notes: ''
  });

  // Voter ID specific form data
  const [voterIdData, setVoterIdData] = useState({
    voterIdNumber: '',
    name: '',
    parentSpouseName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    issuedOn: ''
  });

  // Driving License specific form data
  const [drivingLicenseData, setDrivingLicenseData] = useState({
    licenseNumber: '',
    name: '',
    dateOfBirth: '',
    bloodGroup: '',
    fatherName: '',
    issueDate: '',
    expiresOn: '',
    address: ''
  });

  // Passport specific form data
  const [passportData, setPassportData] = useState({
    countryCode: '',
    passportType: '',
    passportNumber: '',
    dateOfBirth: '',
    name: '',
    gender: '',
    dateOfIssue: '',
    placeOfIssue: '',
    placeOfBirth: '',
    expiresOn: '',
    address: ''
  });

  // Educational Certificates specific form data
  const [educationalData, setEducationalData] = useState({
    degree: '',
    branch: '',
    yearOfJoining: '',
    yearOfCompletion: '',
    cgpaPercentage: '',
    university: '',
  });

  // Previous Experience specific form data
  const [previousExperienceData, setPreviousExperienceData] = useState({
    companyName: '',
    jobTitle: '',
    dateOfJoining: '',
    dateOfRelieving: '',
    location: '',
    description: '',
    dateOfExit: '',
    employeeCode: '',
    careerGap: '',
    reportingManagerName: '',
    reportingManagerContact: '',
    reportingManagerEmail: '',
    reportingManagerDesignation: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    hrDesignation: '',
    companyAddress: '',
    companyPhone: '',
    department: '',
    salaryCurrency: '',
    salaryCTC: '',
    reasonOfLeaving: '',
  });

  // Promotion & Revision Letter specific form data
  const [promotionRevisionData, setPromotionRevisionData] = useState({
    expiresOn: '',
  });

  const getDocumentStatus = (docId: string) => {
    return documents.find(doc => doc.id === docId);
  };

  const handleAddDetails = (docType: typeof documentTypes[0]) => {
    setSelectedDocument(docType);
    setIsDrawerOpen(true);
    
    // Load existing data if available
    const existingData = savedDocuments[docType.id];
    
    if (existingData) {
      // Load saved file info
      setUploadedFile(existingData.uploadedFile || null);
      setNotApplicable(existingData.notApplicable || false);
      
      // Load saved form data based on document type
      if (docType.id === 'voter-id') {
        setVoterIdData(existingData.formData || {
          voterIdNumber: '',
          name: '',
          parentSpouseName: '',
          gender: '',
          dateOfBirth: '',
          address: '',
          issuedOn: ''
        });
      } else if (docType.id === 'driving-license') {
        setDrivingLicenseData(existingData.formData || {
          licenseNumber: '',
          name: '',
          dateOfBirth: '',
          bloodGroup: '',
          fatherName: '',
          issueDate: '',
          expiresOn: '',
          address: ''
        });
      } else if (docType.id === 'passport') {
        setPassportData(existingData.formData || {
          countryCode: '',
          passportType: '',
          passportNumber: '',
          dateOfBirth: '',
          name: '',
          gender: '',
          dateOfIssue: '',
          placeOfIssue: '',
          placeOfBirth: '',
          expiresOn: '',
          address: ''
        });
      } else if (docType.id === 'educational-certificates') {
        setEducationalData(existingData.formData || {
          degree: '',
          branch: '',
          yearOfJoining: '',
          yearOfCompletion: '',
          cgpaPercentage: '',
          university: '',
        });
      } else if (docType.id === 'previous-experience') {
        setPreviousExperienceData(existingData.formData || {
          companyName: '',
          jobTitle: '',
          dateOfJoining: '',
          dateOfRelieving: '',
          location: '',
          description: '',
          dateOfExit: '',
          employeeCode: '',
          careerGap: '',
          reportingManagerName: '',
          reportingManagerContact: '',
          reportingManagerEmail: '',
          reportingManagerDesignation: '',
          hrName: '',
          hrEmail: '',
          hrPhone: '',
          hrDesignation: '',
          companyAddress: '',
          companyPhone: '',
          department: '',
          salaryCurrency: '',
          salaryCTC: '',
          reasonOfLeaving: '',
        });
      } else if (docType.id === 'promotion-revision') {
        setPromotionRevisionData(existingData.formData || {
          expiresOn: '',
        });
      } else {
        setFormData(existingData.formData || {
          documentNumber: '',
          issueDate: '',
          expiryDate: '',
          issuingAuthority: '',
          notes: ''
        });
      }
    } else {
      // Reset to empty if no existing data
      setUploadedFile(null);
      setNotApplicable(false);
      setFormData({
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        issuingAuthority: '',
        notes: ''
      });
      setVoterIdData({
        voterIdNumber: '',
        name: '',
        parentSpouseName: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        issuedOn: ''
      });
      setDrivingLicenseData({
        licenseNumber: '',
        name: '',
        dateOfBirth: '',
        bloodGroup: '',
        fatherName: '',
        issueDate: '',
        expiresOn: '',
        address: ''
      });
      setPassportData({
        countryCode: '',
        passportType: '',
        passportNumber: '',
        dateOfBirth: '',
        name: '',
        gender: '',
        dateOfIssue: '',
        placeOfIssue: '',
        placeOfBirth: '',
        expiresOn: '',
        address: ''
      });
      setEducationalData({
        degree: '',
        branch: '',
        yearOfJoining: '',
        yearOfCompletion: '',
        cgpaPercentage: '',
        university: '',
      });
      setPreviousExperienceData({
        companyName: '',
        jobTitle: '',
        dateOfJoining: '',
        dateOfRelieving: '',
        location: '',
        description: '',
        dateOfExit: '',
        employeeCode: '',
        careerGap: '',
        reportingManagerName: '',
        reportingManagerContact: '',
        reportingManagerEmail: '',
        reportingManagerDesignation: '',
        hrName: '',
        hrEmail: '',
        hrPhone: '',
        hrDesignation: '',
        companyAddress: '',
        companyPhone: '',
        department: '',
        salaryCurrency: '',
        salaryCTC: '',
        reasonOfLeaving: '',
      });
      setPromotionRevisionData({
        expiresOn: '',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 20 * 1024 * 1024; // 20MB
      
      if (file.size > maxSize) {
        toast.error('File size must be less than 20MB');
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, JPEG, DOC, DOCX, PDF, XLSX, XLS files are allowed');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    // Skip file upload validation for certifications with "Not Applicable" checked
    if (selectedDocument?.id === 'certifications' && notApplicable) {
      toast.success('Certification marked as not applicable');
      setIsDrawerOpen(false);
      if (onAddDetails && selectedDocument) {
        onAddDetails(selectedDocument.id);
      }
      return;
    }

    // Skip file upload validation for promotion-revision with "Not Applicable" checked
    if (selectedDocument?.id === 'promotion-revision' && notApplicable) {
      toast.success('Promotion & Revision Letter marked as not applicable');
      setIsDrawerOpen(false);
      if (onAddDetails && selectedDocument) {
        onAddDetails(selectedDocument.id);
      }
      return;
    }

    if (!uploadedFile) {
      toast.error('Please upload a document');
      return;
    }

    // Validation for Voter ID
    if (selectedDocument?.id === 'voter-id') {
      if (!voterIdData.voterIdNumber || !voterIdData.name || !voterIdData.parentSpouseName || 
          !voterIdData.gender || !voterIdData.dateOfBirth || !voterIdData.address) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    // Validation for Driving License
    if (selectedDocument?.id === 'driving-license') {
      if (!drivingLicenseData.licenseNumber || !drivingLicenseData.name || !drivingLicenseData.dateOfBirth || 
          !drivingLicenseData.fatherName || !drivingLicenseData.issueDate || !drivingLicenseData.expiresOn || 
          !drivingLicenseData.address) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    // Validation for Passport
    if (selectedDocument?.id === 'passport') {
      if (!passportData.passportNumber || !passportData.dateOfBirth || !passportData.name || 
          !passportData.gender || !passportData.dateOfIssue || !passportData.placeOfIssue || 
          !passportData.placeOfBirth || !passportData.expiresOn || !passportData.address) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    // Validation for Educational Certificates
    if (selectedDocument?.id === 'educational-certificates') {
      if (!educationalData.degree || !educationalData.branch || !educationalData.yearOfJoining || 
          !educationalData.yearOfCompletion || !educationalData.cgpaPercentage || !educationalData.university) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    // Validation for Previous Experience
    if (selectedDocument?.id === 'previous-experience') {
      if (!previousExperienceData.companyName || !previousExperienceData.jobTitle || 
          !previousExperienceData.dateOfJoining || !previousExperienceData.dateOfRelieving) {
        toast.error('Please fill all required fields (Company Name, Job Title, Date of Joining, Date of Relieving)');
        return;
      }
    }
    
    // Here you would typically upload the file and save the form data
    console.log('Document Type:', selectedDocument?.id);
    console.log('File:', uploadedFile);
    if (selectedDocument?.id === 'voter-id') {
      console.log('Voter ID Data:', voterIdData);
    } else if (selectedDocument?.id === 'driving-license') {
      console.log('Driving License Data:', drivingLicenseData);
    } else if (selectedDocument?.id === 'passport') {
      console.log('Passport Data:', passportData);
    } else if (selectedDocument?.id === 'educational-certificates') {
      console.log('Educational Data:', educationalData);
    } else if (selectedDocument?.id === 'previous-experience') {
      console.log('Previous Experience Data:', previousExperienceData);
    } else if (selectedDocument?.id === 'promotion-revision') {
      console.log('Promotion & Revision Data:', promotionRevisionData);
    } else {
      console.log('Form Data:', formData);
    }
    
    // Save document data to state
    if (selectedDocument) {
      const documentData: any = {
        uploadedFile: uploadedFile,
        notApplicable: notApplicable,
        formData: null
      };

      // Save the appropriate form data based on document type
      if (selectedDocument.id === 'voter-id') {
        documentData.formData = voterIdData;
      } else if (selectedDocument.id === 'driving-license') {
        documentData.formData = drivingLicenseData;
      } else if (selectedDocument.id === 'passport') {
        documentData.formData = passportData;
      } else if (selectedDocument.id === 'educational-certificates') {
        documentData.formData = educationalData;
      } else if (selectedDocument.id === 'previous-experience') {
        documentData.formData = previousExperienceData;
      } else if (selectedDocument.id === 'promotion-revision') {
        documentData.formData = promotionRevisionData;
      } else {
        documentData.formData = formData;
      }

      setSavedDocuments(prev => ({
        ...prev,
        [selectedDocument.id]: documentData
      }));
      
      const isExisting = savedDocuments[selectedDocument.id];
      toast.success(isExisting ? 'Document updated successfully' : 'Document saved successfully');
    } else {
      toast.success('Document saved successfully');
    }
    setIsDrawerOpen(false);
    
    // Call the onAddDetails callback if needed
    if (onAddDetails && selectedDocument) {
      onAddDetails(selectedDocument.id);
    }
  };

  return (
    <>
      <div className="space-y-1">{documentTypes.map((docType, index) => {
        const Icon = docType.icon;
        const uploadedDoc = getDocumentStatus(docType.id);
        const savedDoc = savedDocuments[docType.id];
        const isUploaded = !!uploadedDoc?.uploadedFile || !!savedDoc?.uploadedFile || savedDoc?.notApplicable;

        return (
          <div
            key={docType.id}
            className={`flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors ${
              index !== documentTypes.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Left section: Icon + Document Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {docType.name}
                  </h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-0.5 ${
                      docType.isMandatory 
                        ? 'bg-orange-50 text-orange-700 border-orange-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {docType.isMandatory ? 'Mandatory' : 'Optional'}
                  </Badge>
                </div>
                
                {isUploaded ? (
                  <p className="text-xs text-gray-600">
                    {savedDoc?.notApplicable 
                      ? 'Marked as Not Applicable' 
                      : savedDoc?.uploadedFile?.name 
                        ? `${savedDoc.uploadedFile.name} • Saved` 
                        : uploadedDoc?.uploadedFile 
                          ? `${uploadedDoc.uploadedFile.fileName} • Uploaded on ${uploadedDoc.uploadedFile.uploadedDate}` 
                          : 'Document saved'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    No document added
                  </p>
                )}
              </div>
            </div>

            {/* Right section: Action Button - Hidden for feedback forms */}
            {!['presales-feedback', 'innovation-feedback', 'mentor-feedback', 'training-feedback', 'account-mining', 'domain-feedback'].includes(docType.id) && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 ml-4 flex-shrink-0"
                onClick={() => handleAddDetails(docType)}
              >
                <Plus className="h-3.5 w-3.5" />
                {isUploaded ? 'Edit Details' : 'Add Details'}
              </Button>
            )}
          </div>
        );
      })}
    </div>

      {/* Right Drawer for Document Upload */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-4 pb-6">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                {selectedDocument && (
                  <>
                    <selectedDocument.icon className="h-5 w-5 text-blue-600" />
                    {savedDocuments[selectedDocument.id] ? 'Edit ' : ''}{selectedDocument.name}
                  </>
                )}
              </SheetTitle>
              <SheetDescription>
                {selectedDocument && savedDocuments[selectedDocument.id] 
                  ? 'View and edit the details for this document' 
                  : 'Upload and provide details for this document'}
              </SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* File Upload Section - Hidden when Not Applicable is checked for Certifications or Promotion-Revision */}
            {!((selectedDocument?.id === 'certifications' || selectedDocument?.id === 'promotion-revision') && notApplicable) && (
              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Upload {selectedDocument?.id === 'voter-id' ? 'Voter ID Card' : selectedDocument?.id === 'driving-license' ? 'Driving License' : selectedDocument?.id === 'passport' ? 'Passport' : selectedDocument?.id === 'educational-certificates' ? 'Educational Certificate' : selectedDocument?.id === 'previous-experience' ? 'Experience Letter' : selectedDocument?.id === 'covid-vaccination' ? 'COVID Vaccination Certificate' : selectedDocument?.id === 'certifications' ? 'Certification' : selectedDocument?.id === 'promotion-revision' ? 'Promotion & Revision Letter' : 'Document'} {!notApplicable && <span className="text-red-500">*</span>}
                </Label>
              
              {!uploadedFile ? (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Supported file types: .png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</p>
                    <p className="text-xs text-gray-500">Max file size supported: 20 MB</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => {
                    const fileUrl = URL.createObjectURL(uploadedFile);
                    setPreviewFileUrl(fileUrl);
                    setPreviewFileType(uploadedFile.type);
                    setIsPreviewOpen(true);
                  }}>
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB • Click to preview
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            )}

            {/* Document Specific Form Fields */}
            {selectedDocument?.id === 'covid-vaccination' ? (
              /* COVID Vaccination - File Upload Only (No Additional Fields) */
              null
            ) : selectedDocument?.id === 'certifications' ? (
              /* Certifications - Checkbox with Not Applicable */
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="notApplicable"
                    checked={notApplicable}
                    onCheckedChange={(checked) => setNotApplicable(checked as boolean)}
                  />
                  <label
                    htmlFor="notApplicable"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Not Applicable
                  </label>
                </div>
              </div>
            ) : selectedDocument?.id === 'promotion-revision' ? (
              /* Promotion & Revision Letter - Checkbox with Not Applicable + Expires On */
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="notApplicable"
                    checked={notApplicable}
                    onCheckedChange={(checked) => setNotApplicable(checked as boolean)}
                  />
                  <label
                    htmlFor="notApplicable"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Not Applicable
                  </label>
                </div>

                {!notApplicable && (
                  <div>
                    <Label htmlFor="expiresOn" className="text-sm font-medium">
                      Expires On
                    </Label>
                    <DatePicker
                      value={promotionRevisionData.expiresOn}
                      onChange={(date) => setPromotionRevisionData({ ...promotionRevisionData, expiresOn: date })}
                      placeholder="Select expiry date"
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>
            ) : selectedDocument?.id === 'voter-id' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voter-id-number" className="text-sm font-medium">
                    VOTER ID Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="voter-id-number"
                    placeholder="Enter voter ID number"
                    value={voterIdData.voterIdNumber}
                    onChange={(e) => setVoterIdData({ ...voterIdData, voterIdNumber: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter name as per voter ID"
                    value={voterIdData.name}
                    onChange={(e) => setVoterIdData({ ...voterIdData, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="parent-spouse-name" className="text-sm font-medium">
                    Parent's / Spouse's Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parent-spouse-name"
                    placeholder="Enter parent's or spouse's name"
                    value={voterIdData.parentSpouseName}
                    onChange={(e) => setVoterIdData({ ...voterIdData, parentSpouseName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={voterIdData.gender}
                    onValueChange={(value) => setVoterIdData({ ...voterIdData, gender: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-of-birth" className="text-sm font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={voterIdData.dateOfBirth}
                    onChange={(date) => setVoterIdData({ ...voterIdData, dateOfBirth: date })}
                    placeholder="Select date of birth"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter address as per voter ID"
                    value={voterIdData.address}
                    onChange={(e) => setVoterIdData({ ...voterIdData, address: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="issued-on" className="text-sm font-medium">
                    Issued On
                  </Label>
                  <DatePicker
                    value={voterIdData.issuedOn}
                    onChange={(date) => setVoterIdData({ ...voterIdData, issuedOn: date })}
                    placeholder="Select issue date"
                    className="mt-1.5"
                  />
                </div>
              </div>
            ) : selectedDocument?.id === 'driving-license' ? (
              /* Driving License Specific Form Fields */
              <div className="space-y-4">
                <div>
                  <Label htmlFor="license-number" className="text-sm font-medium">
                    License Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="license-number"
                    placeholder="Enter driving license number"
                    value={drivingLicenseData.licenseNumber}
                    onChange={(e) => setDrivingLicenseData({ ...drivingLicenseData, licenseNumber: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="dl-name" className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dl-name"
                    placeholder="Enter name as per driving license"
                    value={drivingLicenseData.name}
                    onChange={(e) => setDrivingLicenseData({ ...drivingLicenseData, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="dl-dob" className="text-sm font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={drivingLicenseData.dateOfBirth}
                    onChange={(date) => setDrivingLicenseData({ ...drivingLicenseData, dateOfBirth: date })}
                    placeholder="Select date of birth"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="blood-group" className="text-sm font-medium">
                    Blood Group
                  </Label>
                  <Input
                    id="blood-group"
                    placeholder="Enter blood group (e.g., A+, B-, O+)"
                    value={drivingLicenseData.bloodGroup}
                    onChange={(e) => setDrivingLicenseData({ ...drivingLicenseData, bloodGroup: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="father-name" className="text-sm font-medium">
                    Father's Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="father-name"
                    placeholder="Enter father's name"
                    value={drivingLicenseData.fatherName}
                    onChange={(e) => setDrivingLicenseData({ ...drivingLicenseData, fatherName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="dl-issue-date" className="text-sm font-medium">
                    Issue Date <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={drivingLicenseData.issueDate}
                    onChange={(date) => setDrivingLicenseData({ ...drivingLicenseData, issueDate: date })}
                    placeholder="Select issue date"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="expires-on" className="text-sm font-medium">
                    Expires on <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={drivingLicenseData.expiresOn}
                    onChange={(date) => setDrivingLicenseData({ ...drivingLicenseData, expiresOn: date })}
                    placeholder="Select expiry date"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="dl-address" className="text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="dl-address"
                    placeholder="Enter address as per driving license"
                    value={drivingLicenseData.address}
                    onChange={(e) => setDrivingLicenseData({ ...drivingLicenseData, address: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            ) : selectedDocument?.id === 'passport' ? (
              /* Passport Specific Form Fields */
              <div className="space-y-4">
                {/* Two Column Grid Layout */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country-code" className="text-sm font-medium">
                      Country Code
                    </Label>
                    <Input
                      id="country-code"
                      placeholder="Enter country code (e.g., IN, US)"
                      value={passportData.countryCode}
                      onChange={(e) => setPassportData({ ...passportData, countryCode: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-type" className="text-sm font-medium">
                      Passport Type
                    </Label>
                    <Input
                      id="passport-type"
                      placeholder="Enter passport type (e.g., Ordinary, Diplomatic)"
                      value={passportData.passportType}
                      onChange={(e) => setPassportData({ ...passportData, passportType: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-number" className="text-sm font-medium">
                      Passport Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passport-number"
                      placeholder="Enter passport number"
                      value={passportData.passportNumber}
                      onChange={(e) => setPassportData({ ...passportData, passportNumber: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-dob" className="text-sm font-medium">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      value={passportData.dateOfBirth}
                      onChange={(date) => setPassportData({ ...passportData, dateOfBirth: date })}
                      placeholder="Select date of birth"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-name" className="text-sm font-medium">
                      Name (Full Name) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passport-name"
                      placeholder="Enter full name as per passport"
                      value={passportData.name}
                      onChange={(e) => setPassportData({ ...passportData, name: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-gender" className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={passportData.gender}
                      onValueChange={(value) => setPassportData({ ...passportData, gender: value })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date-of-issue" className="text-sm font-medium">
                      Date of Issue (Issued On) <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      value={passportData.dateOfIssue}
                      onChange={(date) => setPassportData({ ...passportData, dateOfIssue: date })}
                      placeholder="Select issue date"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="place-of-issue" className="text-sm font-medium">
                      Place of Issue <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="place-of-issue"
                      placeholder="Enter place of issue"
                      value={passportData.placeOfIssue}
                      onChange={(e) => setPassportData({ ...passportData, placeOfIssue: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="place-of-birth" className="text-sm font-medium">
                      Place of Birth (Birth Place) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="place-of-birth"
                      placeholder="Enter place of birth"
                      value={passportData.placeOfBirth}
                      onChange={(e) => setPassportData({ ...passportData, placeOfBirth: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passport-expires-on" className="text-sm font-medium">
                      Expires On (Expiry Date) <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      value={passportData.expiresOn}
                      onChange={(date) => setPassportData({ ...passportData, expiresOn: date })}
                      placeholder="Select expiry date"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Full Width Address Field */}
                <div>
                  <Label htmlFor="passport-address" className="text-sm font-medium">
                    Address (Your complete residential address) <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="passport-address"
                    placeholder="Enter complete residential address"
                    value={passportData.address}
                    onChange={(e) => setPassportData({ ...passportData, address: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            ) : selectedDocument?.id === 'educational-certificates' ? (
              /* Educational Certificates Specific Form Fields */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree" className="text-sm font-medium">
                      Degree <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="degree"
                      placeholder="e.g., Bachelor of Technology"
                      value={educationalData.degree}
                      onChange={(e) => setEducationalData({ ...educationalData, degree: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch" className="text-sm font-medium">
                      Branch / Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="branch"
                      placeholder="e.g., Computer Science"
                      value={educationalData.branch}
                      onChange={(e) => setEducationalData({ ...educationalData, branch: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearOfJoining" className="text-sm font-medium">
                      Year of Joining <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yearOfJoining"
                      type="number"
                      placeholder="e.g., 2018"
                      value={educationalData.yearOfJoining}
                      onChange={(e) => setEducationalData({ ...educationalData, yearOfJoining: e.target.value })}
                      className="mt-1.5"
                      min="1900"
                      max="2100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearOfCompletion" className="text-sm font-medium">
                      Year of Completion <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yearOfCompletion"
                      type="number"
                      placeholder="e.g., 2022"
                      value={educationalData.yearOfCompletion}
                      onChange={(e) => setEducationalData({ ...educationalData, yearOfCompletion: e.target.value })}
                      className="mt-1.5"
                      min="1900"
                      max="2100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cgpaPercentage" className="text-sm font-medium">
                      CGPA / Percentage <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cgpaPercentage"
                      placeholder="e.g., 8.5 CGPA or 85%"
                      value={educationalData.cgpaPercentage}
                      onChange={(e) => setEducationalData({ ...educationalData, cgpaPercentage: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="university" className="text-sm font-medium">
                      University / College <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="university"
                      placeholder="University/College name"
                      value={educationalData.university}
                      onChange={(e) => setEducationalData({ ...educationalData, university: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            ) : selectedDocument?.id === 'previous-experience' ? (
              /* Previous Experience Specific Form Fields */
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-sm font-medium">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={previousExperienceData.companyName}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, companyName: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobTitle" className="text-sm font-medium">
                        Job Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="jobTitle"
                        placeholder="Enter job title"
                        value={previousExperienceData.jobTitle}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, jobTitle: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="department" className="text-sm font-medium">
                        Department
                      </Label>
                      <Input
                        id="department"
                        placeholder="Enter department"
                        value={previousExperienceData.department}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, department: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employeeCode" className="text-sm font-medium">
                        Employee Code
                      </Label>
                      <Input
                        id="employeeCode"
                        placeholder="Enter employee code"
                        value={previousExperienceData.employeeCode}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, employeeCode: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Enter location"
                        value={previousExperienceData.location}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, location: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Period */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Employment Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfJoining" className="text-sm font-medium">
                        Date of Joining <span className="text-red-500">*</span>
                      </Label>
                      <DatePicker
                        value={previousExperienceData.dateOfJoining}
                        onChange={(date) => setPreviousExperienceData({ ...previousExperienceData, dateOfJoining: date })}
                        placeholder="Select joining date"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfRelieving" className="text-sm font-medium">
                        Date of Relieving <span className="text-red-500">*</span>
                      </Label>
                      <DatePicker
                        value={previousExperienceData.dateOfRelieving}
                        onChange={(date) => setPreviousExperienceData({ ...previousExperienceData, dateOfRelieving: date })}
                        placeholder="Select relieving date"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfExit" className="text-sm font-medium">
                        Date of Exit
                      </Label>
                      <DatePicker
                        value={previousExperienceData.dateOfExit}
                        onChange={(date) => setPreviousExperienceData({ ...previousExperienceData, dateOfExit: date })}
                        placeholder="Select exit date"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="careerGap" className="text-sm font-medium">
                        Explain Career Gap (if any)
                      </Label>
                      <Input
                        id="careerGap"
                        placeholder="Explain any career gap"
                        value={previousExperienceData.careerGap}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, careerGap: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Reporting Manager */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Reporting Manager Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportingManagerName" className="text-sm font-medium">
                        Reporting Manager Full Name
                      </Label>
                      <Input
                        id="reportingManagerName"
                        placeholder="Enter manager name"
                        value={previousExperienceData.reportingManagerName}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, reportingManagerName: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reportingManagerDesignation" className="text-sm font-medium">
                        Reporting Manager Designation
                      </Label>
                      <Input
                        id="reportingManagerDesignation"
                        placeholder="Enter manager designation"
                        value={previousExperienceData.reportingManagerDesignation}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, reportingManagerDesignation: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reportingManagerContact" className="text-sm font-medium">
                        Reporting Manager Contact Number
                      </Label>
                      <Input
                        id="reportingManagerContact"
                        placeholder="Enter contact number"
                        value={previousExperienceData.reportingManagerContact}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, reportingManagerContact: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reportingManagerEmail" className="text-sm font-medium">
                        Reporting Manager Email ID (Official)
                      </Label>
                      <Input
                        id="reportingManagerEmail"
                        type="email"
                        placeholder="Enter manager email"
                        value={previousExperienceData.reportingManagerEmail}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, reportingManagerEmail: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* HR Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">HR Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hrName" className="text-sm font-medium">
                        HR Name
                      </Label>
                      <Input
                        id="hrName"
                        placeholder="Enter HR name"
                        value={previousExperienceData.hrName}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, hrName: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hrDesignation" className="text-sm font-medium">
                        HR Designation
                      </Label>
                      <Input
                        id="hrDesignation"
                        placeholder="Enter HR designation"
                        value={previousExperienceData.hrDesignation}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, hrDesignation: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hrEmail" className="text-sm font-medium">
                        HR Official Email ID
                      </Label>
                      <Input
                        id="hrEmail"
                        type="email"
                        placeholder="Enter HR email"
                        value={previousExperienceData.hrEmail}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, hrEmail: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hrPhone" className="text-sm font-medium">
                        HR Phone Number
                      </Label>
                      <Input
                        id="hrPhone"
                        placeholder="Enter HR phone number"
                        value={previousExperienceData.hrPhone}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, hrPhone: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Company Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="companyAddress" className="text-sm font-medium">
                        Company Full Address
                      </Label>
                      <Textarea
                        id="companyAddress"
                        placeholder="Enter company address"
                        value={previousExperienceData.companyAddress}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, companyAddress: e.target.value })}
                        className="mt-1.5"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyPhone" className="text-sm font-medium">
                        Company Phone Number
                      </Label>
                      <Input
                        id="companyPhone"
                        placeholder="Enter company phone"
                        value={previousExperienceData.companyPhone}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, companyPhone: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary & Additional */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Salary & Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaryCurrency" className="text-sm font-medium">
                        Salary Currency
                      </Label>
                      <Select
                        value={previousExperienceData.salaryCurrency}
                        onValueChange={(value) => setPreviousExperienceData({ ...previousExperienceData, salaryCurrency: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="salaryCTC" className="text-sm font-medium">
                        Salary CTC
                      </Label>
                      <Input
                        id="salaryCTC"
                        placeholder="Enter CTC amount"
                        value={previousExperienceData.salaryCTC}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, salaryCTC: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your role and responsibilities"
                        value={previousExperienceData.description}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, description: e.target.value })}
                        className="mt-1.5"
                        rows={3}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="reasonOfLeaving" className="text-sm font-medium">
                        Reason of Leaving
                      </Label>
                      <Textarea
                        id="reasonOfLeaving"
                        placeholder="Enter reason for leaving"
                        value={previousExperienceData.reasonOfLeaving}
                        onChange={(e) => setPreviousExperienceData({ ...previousExperienceData, reasonOfLeaving: e.target.value })}
                        className="mt-1.5"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Document Details Form */
              <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="document-number" className="text-sm font-medium">
                    Document Number
                  </Label>
                  <Input
                    id="document-number"
                    placeholder="Enter document number"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issue-date" className="text-sm font-medium">
                      Issue Date
                    </Label>
                    <DatePicker
                      value={formData.issueDate}
                      onChange={(date) => setFormData({ ...formData, issueDate: date })}
                      placeholder="Select issue date"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiry-date" className="text-sm font-medium">
                      Expiry Date
                    </Label>
                    <DatePicker
                      value={formData.expiryDate}
                      onChange={(date) => setFormData({ ...formData, expiryDate: date })}
                      placeholder="Select expiry date"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="issuing-authority" className="text-sm font-medium">
                    Issuing Authority
                  </Label>
                  <Input
                    id="issuing-authority"
                    placeholder="Enter issuing authority"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* File Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewFileUrl && (
              <>
                {previewFileType.startsWith('image/') ? (
                  <img 
                    src={previewFileUrl} 
                    alt="Document preview" 
                    className="w-full h-auto rounded-lg"
                  />
                ) : previewFileType === 'application/pdf' ? (
                  <iframe
                    src={previewFileUrl}
                    className="w-full h-[70vh] rounded-lg border"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <File className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewFileUrl;
                        link.download = uploadedFile?.name || 'document';
                        link.click();
                      }}
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
