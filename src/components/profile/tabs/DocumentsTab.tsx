import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  { id: 'certifications', name: 'Professional Certifications', icon: Award, isMandatory: false },
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
  const [formData, setFormData] = useState({
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    notes: ''
  });

  const getDocumentStatus = (docId: string) => {
    return documents.find(doc => doc.id === docId);
  };

  const handleAddDetails = (docType: typeof documentTypes[0]) => {
    setSelectedDocument(docType);
    setIsDrawerOpen(true);
    setUploadedFile(null);
    setFormData({
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: '',
      notes: ''
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, PNG, and DOCX files are allowed');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error('Please upload a document');
      return;
    }
    
    // Here you would typically upload the file and save the form data
    console.log('Document Type:', selectedDocument?.id);
    console.log('File:', uploadedFile);
    console.log('Form Data:', formData);
    
    toast.success('Document uploaded successfully');
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
        const isUploaded = !!uploadedDoc?.uploadedFile;

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
                    {uploadedDoc.uploadedFile!.fileName} • Uploaded on {uploadedDoc.uploadedFile!.uploadedDate}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    No document added
                  </p>
                )}
              </div>
            </div>

            {/* Right section: Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ml-4 flex-shrink-0"
              onClick={() => handleAddDetails(docType)}
            >
              <Plus className="h-3.5 w-3.5" />
              {isUploaded ? 'View Details' : 'Add Details'}
            </Button>
          </div>
        );
      })}
    </div>

      {/* Right Drawer for Document Upload */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedDocument && (
                <>
                  <selectedDocument.icon className="h-5 w-5 text-blue-600" />
                  {selectedDocument.name}
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              Upload and provide details for this document
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Upload Document <span className="text-red-500">*</span>
              </Label>
              
              {!uploadedFile ? (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOCX (Max 5MB)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
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

            {/* Document Details Form */}
            <div className="space-y-4">
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
                  <Input
                    id="issue-date"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="expiry-date" className="text-sm font-medium">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                Upload Document
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
