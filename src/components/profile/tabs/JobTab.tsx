import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Calendar, Users, Award, Edit2, Save, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeTimeTab from '@/components/employee/EmployeeTimeTab';
import OrganizationTab from '@/components/employee/OrganizationTab';
import { useEmployeeStore } from '@/store/employeeStore';

interface JobTabProps {
  // Basic Job Info
  employeeId?: string;
  designation: string;
  secondaryJobTitle?: string;
  department: string;
  subDepartment?: string;
  businessUnit?: string;
  legalEntity?: string;
  
  // Employment Type & Location
  employmentType: string;
  workerType?: string;
  hireType?: string;
  location: string;
  
  // Reporting
  reportingManager?: string;
  reportingManagerId?: string;
  dottedLineManager?: string;
  dottedLineManagerId?: string;
  
  // Dates
  joiningDate: string;
  contractEndDate?: string;
  probationEndDate?: string;
  
  // Employee Time
  employeeTime?: any;
  
  // Organization
  organization?: any;
  
  // Permission control
  canEdit?: boolean;
  
  // Update handler
  onUpdate?: (data: any) => Promise<void>;
}

export default function JobTab({
  employeeId, designation, secondaryJobTitle, department, subDepartment, businessUnit, legalEntity,
  employmentType, workerType, hireType, location,
  reportingManager, reportingManagerId, dottedLineManager, dottedLineManagerId,
  joiningDate, contractEndDate, probationEndDate,
  employeeTime, organization,
  canEdit = true, // Default to true for backward compatibility
  onUpdate,
}: JobTabProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { activeEmployees, fetchActiveEmployees } = useEmployeeStore();
  const [formData, setFormData] = useState({
    designation: designation || '',
    secondaryJobTitle: secondaryJobTitle || '',
    subDepartment: subDepartment || '',
    businessUnit: businessUnit || '',
    legalEntity: legalEntity || '',
    workerType: workerType || '',
    hireType: hireType || '',
    location: location || '',
    reportingManagerId: reportingManagerId || '',
    dottedLineManagerId: dottedLineManagerId || '',
  });

  useEffect(() => {
    fetchActiveEmployees();
  }, [fetchActiveEmployees]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (onUpdate) {
        // Clean up data before sending
        const dataToSend = { ...formData };
        // Convert "none" to empty string for manager fields
        if (dataToSend.reportingManagerId === 'none') {
          dataToSend.reportingManagerId = '';
        }
        if (dataToSend.dottedLineManagerId === 'none') {
          dataToSend.dottedLineManagerId = '';
        }
        await onUpdate(dataToSend);
      }
      toast.success('Job information updated successfully');
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to update job information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      designation: designation || '',
      secondaryJobTitle: secondaryJobTitle || '',
      subDepartment: subDepartment || '',
      businessUnit: businessUnit || '',
      legalEntity: legalEntity || '',
      workerType: workerType || '',
      hireType: hireType || '',
      location: location || '',
      reportingManagerId: reportingManagerId || '',
      dottedLineManagerId: dottedLineManagerId || '',
    });
    setEditingSection(null);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Job Details</span>
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Organization</span>
        </TabsTrigger>
        <TabsTrigger value="employment" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Employment</span>
        </TabsTrigger>
      </TabsList>

      {/* Job Details Tab */}
      <TabsContent value="details" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Information Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Job Information
                </div>
                {canEdit && editingSection !== 'jobInfo' && (
                  <Button onClick={() => setEditingSection('jobInfo')} variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Employee ID
                  </label>
                  <p className="text-base font-medium text-gray-900">{employeeId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Designation
                  </label>
                  {editingSection === 'jobInfo' ? (
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="Designation"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{designation}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Secondary Job Title
                  </label>
                  {editingSection === 'jobInfo' ? (
                    <Input
                      value={formData.secondaryJobTitle}
                      onChange={(e) => setFormData({ ...formData, secondaryJobTitle: e.target.value })}
                      placeholder="Secondary job title"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{secondaryJobTitle || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Location
                  </label>
                  {editingSection === 'jobInfo' ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-base font-medium text-gray-900">{location}</p>
                    </div>
                  )}
                </div>
              </div>
              {editingSection === 'jobInfo' && (
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

          {/* Reporting Structure */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-purple-600" />
                  Reporting Structure
                </div>
                {canEdit && editingSection !== 'reporting' && (
                  <Button onClick={() => setEditingSection('reporting')} variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Reporting Manager
                  </label>
                  {editingSection === 'reporting' ? (
                    <Select
                      value={formData.reportingManagerId}
                      onValueChange={(value) => setFormData({ ...formData, reportingManagerId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reporting manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {activeEmployees
                          .filter(emp => emp.employeeId !== employeeId)
                          .map((emp) => (
                            <SelectItem key={emp._id} value={emp.employeeId}>
                              {emp.name} ({emp.employeeId})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base font-medium text-gray-900">{reportingManager || 'Not Assigned'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Dotted Line Manager
                  </label>
                  {editingSection === 'reporting' ? (
                    <Select
                      value={formData.dottedLineManagerId}
                      onValueChange={(value) => setFormData({ ...formData, dottedLineManagerId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dotted line manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {activeEmployees
                          .filter(emp => emp.employeeId !== employeeId)
                          .map((emp) => (
                            <SelectItem key={emp._id} value={emp.employeeId}>
                              {emp.name} ({emp.employeeId})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base font-medium text-gray-900">{dottedLineManager || 'Not Assigned'}</p>
                  )}
                </div>
              </div>
              {editingSection === 'reporting' && (
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

        {/* Employee Time Tab */}
        {employeeId && (
          <EmployeeTimeTab
            employeeId={employeeId}
            employeeTime={employeeTime || {}}
            onUpdate={() => onUpdate && onUpdate({})}
          />
        )}
      </TabsContent>

      {/* Organization Tab */}
      <TabsContent value="organization" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Department Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Department Information
                </div>
                {canEdit && editingSection !== 'department' && (
                  <Button onClick={() => setEditingSection('department')} variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Department
                  </label>
                  <p className="text-base font-medium text-gray-900">{department}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Sub Department
                  </label>
                  {editingSection === 'department' ? (
                    <Input
                      value={formData.subDepartment}
                      onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                      placeholder="Sub department"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{subDepartment || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Business Unit
                  </label>
                  {editingSection === 'department' ? (
                    <Input
                      value={formData.businessUnit}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                      placeholder="Business unit"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{businessUnit || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Legal Entity
                  </label>
                  {editingSection === 'department' ? (
                    <Input
                      value={formData.legalEntity}
                      onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                      placeholder="Legal entity"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{legalEntity || 'N/A'}</p>
                  )}
                </div>
              </div>
              {editingSection === 'department' && (
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

          {/* Organization Details */}
          <OrganizationTab
            organization={{
              companyName: 'Employee Connect',
              legalEntity: legalEntity,
              businessUnit: businessUnit,
              department: department,
              subDepartment: subDepartment,
              costCenter: organization?.costCenter,
              division: organization?.division,
              branch: organization?.branch,
            }}
          />
        </div>
      </TabsContent>

      {/* Employment Tab */}
      <TabsContent value="employment" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Employment Type Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Award className="h-5 w-5 text-indigo-600" />
                  Employment Type
                </div>
                {canEdit && editingSection !== 'employmentType' && (
                  <Button onClick={() => setEditingSection('employmentType')} variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Employment Type
                  </label>
                  <p className="text-base font-medium text-gray-900">{employmentType}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Worker Type
                  </label>
                  {editingSection === 'employmentType' ? (
                    <Input
                      value={formData.workerType}
                      onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                      placeholder="Worker type"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{workerType || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Hire Type
                  </label>
                  {editingSection === 'employmentType' ? (
                    <Input
                      value={formData.hireType}
                      onChange={(e) => setFormData({ ...formData, hireType: e.target.value })}
                      placeholder="Hire type"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{hireType || 'N/A'}</p>
                  )}
                </div>
              </div>
              {editingSection === 'employmentType' && (
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

          {/* Employment Timeline */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Employment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium mb-1">Date of Joining</p>
                    <p className="text-sm font-semibold text-gray-900">{joiningDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Probation End Date</p>
                    <p className="text-sm font-semibold text-gray-900">{probationEndDate || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-medium mb-1">Contract End Date</p>
                    <p className="text-sm font-semibold text-gray-900">{contractEndDate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
