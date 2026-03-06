import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { GraduationCap, Plus, Pencil, Trash2, Upload, File, X } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface EducationTabProps {
  employeeId: string;
  educationHistory: any[];
  onUpdate: () => void;
}

export default function EducationTab({
  employeeId,
  educationHistory,
  onUpdate,
}: EducationTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    yearOfJoining: '',
    yearOfCompletion: '',
    cgpaPercentage: '',
    university: '',
    documentUrl: '',
  });

  const resetForm = () => {
    setFormData({
      degree: '',
      branch: '',
      yearOfJoining: '',
      yearOfCompletion: '',
      cgpaPercentage: '',
      university: '',
      documentUrl: '',
    });
    setUploadedFile(null);
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const education = educationHistory[index];
    setFormData({
      degree: education.degree || '',
      branch: education.branch || education.fieldOfStudy || '',
      yearOfJoining: education.yearOfJoining || (education.startDate ? new Date(education.startDate).getFullYear().toString() : ''),
      yearOfCompletion: education.yearOfCompletion || (education.endDate ? new Date(education.endDate).getFullYear().toString() : ''),
      cgpaPercentage: education.cgpaPercentage || education.grade || '',
      university: education.university || education.institution || '',
      documentUrl: education.documentUrl || '',
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedHistory = [...educationHistory];
      
      if (editingIndex !== null) {
        updatedHistory[editingIndex] = formData;
      } else {
        updatedHistory.push(formData);
      }

      const response = await employeeManagementService.updateEducationHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success(
          editingIndex !== null ? 'Education updated' : 'Education added'
        );
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save education record');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      const updatedHistory = educationHistory.filter((_, i) => i !== index);
      const response = await employeeManagementService.updateEducationHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success('Education record deleted');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete education record');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              Education History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {educationHistory && educationHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Degree</TableHead>
                  <TableHead>Branch / Specialization</TableHead>
                  <TableHead>University / College</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>CGPA / %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationHistory.map((education: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{education.degree}</TableCell>
                    <TableCell>{education.branch || education.fieldOfStudy || '-'}</TableCell>
                    <TableCell>{education.university || education.institution || '-'}</TableCell>
                    <TableCell>
                      {education.yearOfJoining || (education.startDate ? new Date(education.startDate).getFullYear() : '-')} -{' '}
                      {education.yearOfCompletion || (education.endDate ? new Date(education.endDate).getFullYear() : '-')}
                    </TableCell>
                    <TableCell>{education.cgpaPercentage || education.grade || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No education records added yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first education record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {editingIndex !== null ? 'Edit Education' : 'Add Education'}
            </SheetTitle>
            <SheetCloseButton />
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g., Bachelor of Technology"
                />
              </div>
              <div>
                <Label htmlFor="branch">Branch / Specialization <span className="text-red-500">*</span></Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="university">University / College <span className="text-red-500">*</span></Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder="University/College name"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="yearOfJoining">Year of Joining <span className="text-red-500">*</span></Label>
                <Input
                  id="yearOfJoining"
                  type="number"
                  value={formData.yearOfJoining}
                  onChange={(e) =>
                    setFormData({ ...formData, yearOfJoining: e.target.value })
                  }
                  placeholder="e.g., 2018"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <Label htmlFor="yearOfCompletion">Year of Completion <span className="text-red-500">*</span></Label>
                <Input
                  id="yearOfCompletion"
                  type="number"
                  value={formData.yearOfCompletion}
                  onChange={(e) => setFormData({ ...formData, yearOfCompletion: e.target.value })}
                  placeholder="e.g., 2022"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <Label htmlFor="cgpaPercentage">CGPA / Percentage <span className="text-red-500">*</span></Label>
                <Input
                  id="cgpaPercentage"
                  value={formData.cgpaPercentage}
                  onChange={(e) => setFormData({ ...formData, cgpaPercentage: e.target.value })}
                  placeholder="e.g., 8.5 CGPA or 85%"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Add Attachment
              </Label>
              
              {!uploadedFile ? (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 20 MB</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const maxSize = 20 * 1024 * 1024; // 20MB
                        
                        if (file.size > maxSize) {
                          toast.error('File size must be less than 20MB');
                          return;
                        }
                        
                        setUploadedFile(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => {
                    const fileUrl = URL.createObjectURL(uploadedFile);
                    window.open(fileUrl, '_blank');
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !formData.degree ||
                !formData.branch ||
                !formData.university ||
                !formData.yearOfJoining ||
                !formData.yearOfCompletion ||
                !formData.cgpaPercentage
              }
            >
              {saving ? 'Saving...' : 'Save Document'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
