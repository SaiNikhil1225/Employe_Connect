import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
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
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface WorkHistoryTabProps {
  employeeId: string;
  workHistory: any[];
  onUpdate: () => void;
}

export default function WorkHistoryTab({
  employeeId,
  workHistory,
  onUpdate,
}: WorkHistoryTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notApplicable, setNotApplicable] = useState(false);
  
  const [formData, setFormData] = useState({
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
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    companyAddress: '',
    companyPhone: '',
    department: '',
    salaryCurrency: '',
    salaryCTC: '',
    reasonOfLeaving: '',
    reportingManagerDesignation: '',
    hrDesignation: '',
  });

  const resetForm = () => {
    setFormData({
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
      hrName: '',
      hrEmail: '',
      hrPhone: '',
      companyAddress: '',
      companyPhone: '',
      department: '',
      salaryCurrency: '',
      salaryCTC: '',
      reasonOfLeaving: '',
      reportingManagerDesignation: '',
      hrDesignation: '',
    });
    setNotApplicable(false);
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const work = workHistory[index];
    setFormData({
      companyName: work.companyName || work.company || '',
      jobTitle: work.jobTitle || work.designation || '',
      dateOfJoining: work.dateOfJoining || work.startDate || '',
      dateOfRelieving: work.dateOfRelieving || work.endDate || '',
      location: work.location || '',
      description: work.description || work.responsibilities || '',
      dateOfExit: work.dateOfExit || work.endDate || '',
      employeeCode: work.employeeCode || '',
      careerGap: work.careerGap || '',
      reportingManagerName: work.reportingManagerName || '',
      reportingManagerContact: work.reportingManagerContact || '',
      reportingManagerEmail: work.reportingManagerEmail || '',
      hrName: work.hrName || '',
      hrEmail: work.hrEmail || '',
      hrPhone: work.hrPhone || '',
      companyAddress: work.companyAddress || '',
      companyPhone: work.companyPhone || '',
      department: work.department || '',
      salaryCurrency: work.salaryCurrency || '',
      salaryCTC: work.salaryCTC || '',
      reasonOfLeaving: work.reasonOfLeaving || work.reasonForLeaving || '',
      reportingManagerDesignation: work.reportingManagerDesignation || '',
      hrDesignation: work.hrDesignation || '',
    });
    setNotApplicable(work.notApplicable || false);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedHistory = [...workHistory];
      
      const workEntry = {
        ...formData,
        notApplicable,
      };
      
      if (editingIndex !== null) {
        updatedHistory[editingIndex] = workEntry;
      } else {
        updatedHistory.push(workEntry);
      }

      const response = await employeeManagementService.updateWorkHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success(
          editingIndex !== null ? 'Work history updated' : 'Work history added'
        );
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save work history');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this work history record?')) return;

    try {
      const updatedHistory = workHistory.filter((_, i) => i !== index);
      const response = await employeeManagementService.updateWorkHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success('Work history deleted');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete work history');
      console.error(error);
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} yr ${remainingMonths} mo`;
    } else if (years > 0) {
      return `${years} yr`;
    } else {
      return `${remainingMonths} mo`;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-500" />
              Work History
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workHistory && workHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workHistory.map((work: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{work.companyName || work.company || '-'}</TableCell>
                    <TableCell>{work.jobTitle || work.designation || '-'}</TableCell>
                    <TableCell>{work.department || '-'}</TableCell>
                    <TableCell>
                      {work.dateOfJoining && work.dateOfRelieving 
                        ? calculateDuration(work.dateOfJoining, work.dateOfRelieving)
                        : work.startDate && work.endDate
                        ? calculateDuration(work.startDate, work.endDate)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {work.dateOfJoining || work.startDate 
                        ? new Date(work.dateOfJoining || work.startDate).toLocaleDateString()
                        : '-'} -{' '}
                      {work.dateOfRelieving || work.endDate
                        ? new Date(work.dateOfRelieving || work.endDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
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
              <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No work history added yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first work experience
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto px-4 pb-6">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {editingIndex !== null ? 'Edit Work Experience' : 'Add Work Experience'}
              </SheetTitle>
            </div>
            <SheetCloseButton />
          </SheetHeader>

          <SheetBody className="space-y-5 mt-6">
            {/* Not Applicable Checkbox */}
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="notApplicable"
                checked={notApplicable}
                onCheckedChange={(checked) => setNotApplicable(checked as boolean)}
              />
              <label
                htmlFor="notApplicable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Not Applicable (Check if you don't have previous work experience)
              </label>
            </div>

            {!notApplicable && (
              <>
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="Enter job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeCode">Employee Code</Label>
                      <Input
                        id="employeeCode"
                        value={formData.employeeCode}
                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                        placeholder="Enter employee code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Period */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Employment Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfJoining">Date of Joining <span className="text-red-500">*</span></Label>
                      <DatePicker
                        value={formData.dateOfJoining}
                        onChange={(date) => setFormData({ ...formData, dateOfJoining: date })}
                        placeholder="Select joining date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfRelieving">Date of Relieving <span className="text-red-500">*</span></Label>
                      <DatePicker
                        value={formData.dateOfRelieving}
                        onChange={(date) => setFormData({ ...formData, dateOfRelieving: date })}
                        placeholder="Select relieving date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfExit">Date of Exit</Label>
                      <DatePicker
                        value={formData.dateOfExit}
                        onChange={(date) => setFormData({ ...formData, dateOfExit: date })}
                        placeholder="Select exit date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="careerGap">Explain Career Gap (if any)</Label>
                      <Input
                        id="careerGap"
                        value={formData.careerGap}
                        onChange={(e) => setFormData({ ...formData, careerGap: e.target.value })}
                        placeholder="Explain any career gap"
                      />
                    </div>
                  </div>
                </div>

                {/* Reporting Manager Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Reporting Manager Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportingManagerName">Reporting Manager Full Name</Label>
                      <Input
                        id="reportingManagerName"
                        value={formData.reportingManagerName}
                        onChange={(e) => setFormData({ ...formData, reportingManagerName: e.target.value })}
                        placeholder="Enter manager's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportingManagerDesignation">Reporting Manager Designation</Label>
                      <Input
                        id="reportingManagerDesignation"
                        value={formData.reportingManagerDesignation}
                        onChange={(e) => setFormData({ ...formData, reportingManagerDesignation: e.target.value })}
                        placeholder="Enter manager's designation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportingManagerContact">Reporting Manager Contact Number</Label>
                      <Input
                        id="reportingManagerContact"
                        value={formData.reportingManagerContact}
                        onChange={(e) => setFormData({ ...formData, reportingManagerContact: e.target.value })}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportingManagerEmail">Reporting Manager Email ID (Official)</Label>
                      <Input
                        id="reportingManagerEmail"
                        type="email"
                        value={formData.reportingManagerEmail}
                        onChange={(e) => setFormData({ ...formData, reportingManagerEmail: e.target.value })}
                        placeholder="Enter official email"
                      />
                    </div>
                  </div>
                </div>

                {/* HR Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">HR Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hrName">HR Name</Label>
                      <Input
                        id="hrName"
                        value={formData.hrName}
                        onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                        placeholder="Enter HR name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hrDesignation">HR Designation</Label>
                      <Input
                        id="hrDesignation"
                        value={formData.hrDesignation}
                        onChange={(e) => setFormData({ ...formData, hrDesignation: e.target.value })}
                        placeholder="Enter HR designation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hrEmail">HR Official Email ID</Label>
                      <Input
                        id="hrEmail"
                        type="email"
                        value={formData.hrEmail}
                        onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                        placeholder="Enter HR email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hrPhone">HR Phone Number</Label>
                      <Input
                        id="hrPhone"
                        value={formData.hrPhone}
                        onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                        placeholder="Enter HR phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Company Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="companyAddress">Company Full Address</Label>
                      <Textarea
                        id="companyAddress"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        placeholder="Enter complete company address"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Company Phone Number</Label>
                      <Input
                        id="companyPhone"
                        value={formData.companyPhone}
                        onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                        placeholder="Enter company phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Salary Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaryCurrency">Salary Currency</Label>
                      <Input
                        id="salaryCurrency"
                        value={formData.salaryCurrency}
                        onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                        placeholder="e.g., INR, USD"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salaryCTC">Salary CTC</Label>
                      <Input
                        id="salaryCTC"
                        value={formData.salaryCTC}
                        onChange={(e) => setFormData({ ...formData, salaryCTC: e.target.value })}
                        placeholder="Enter CTC amount"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Job responsibilities and key achievements"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reasonOfLeaving">Reason of Leaving</Label>
                      <Input
                        id="reasonOfLeaving"
                        value={formData.reasonOfLeaving}
                        onChange={(e) => setFormData({ ...formData, reasonOfLeaving: e.target.value })}
                        placeholder="Enter reason for leaving"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetBody>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                (!notApplicable && (!formData.companyName || !formData.jobTitle || !formData.dateOfJoining || !formData.dateOfRelieving))
              }
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
