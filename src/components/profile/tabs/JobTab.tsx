import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Briefcase, MapPin, Calendar, Users, Award, Edit2, Save, X, Building2, Check, ChevronsUpDown, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import EmployeeTimeTab from '@/components/employee/EmployeeTimeTab';
import OrganizationTab from '@/components/employee/OrganizationTab';
import { useEmployeeStore } from '@/store/employeeStore';
import { getHolidayGroups } from '@/services/holidayService';
import type { HolidayGroup } from '@/types/holiday';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getAuthToken = () => localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token') || '';

interface JobTabProps {
  // Basic Job Info
  employeeId?: string;
  designation: string;
  secondaryJobTitle?: string;
  department: string;
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
  
  // Probation
  probationPolicy?: string;
  
  // Employee Time
  employeeTime?: any;
  
  // Organization
  organization?: any;
  
  // Holiday Configuration
  holidayGroupId?: string;

  // Permission control
  canEdit?: boolean;
  isHRAdmin?: boolean;
  
  // Update handler
  onUpdate?: (data: any) => Promise<void>;
}

export default function JobTab({
  employeeId, designation, secondaryJobTitle, department, businessUnit, legalEntity,
  employmentType, workerType, hireType, location,
  reportingManager, reportingManagerId, dottedLineManager, dottedLineManagerId,
  joiningDate, contractEndDate, probationEndDate, probationPolicy,
  employeeTime, organization,
  holidayGroupId,
  canEdit = true, // Default to true for backward compatibility
  isHRAdmin = false,
  onUpdate,
}: JobTabProps) {
  // Persist active tab across component remounts using sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem('jobTab-activeTab');
    return saved || 'details';
  });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [reportingManagerOpen, setReportingManagerOpen] = useState(false);
  const [dottedLineManagerOpen, setDottedLineManagerOpen] = useState(false);
  const { activeEmployees, fetchActiveEmployees } = useEmployeeStore();
  const [holidayGroups, setHolidayGroups] = useState<HolidayGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(holidayGroupId || 'none');
  const [isEditingHoliday, setIsEditingHoliday] = useState(false);
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);
  const [formData, setFormData] = useState({
    designation: designation || '',
    department: department || '',
    businessUnit: businessUnit || '',
    legalEntity: legalEntity || '',
    employmentType: employmentType || '',
    workerType: workerType || '',
    hireType: hireType || '',
    location: location || '',
    reportingManagerId: reportingManagerId || '',
    dottedLineManagerId: dottedLineManagerId || '',
    probationPolicy: probationPolicy || 'Default Probation Policy',
  });

  // Calculate probation end date (6 months from joining)
  const calculateProbationEndDate = (joiningDateStr: string) => {
    if (!joiningDateStr) return null;
    const joinDate = new Date(joiningDateStr);
    const probationEnd = new Date(joinDate);
    probationEnd.setMonth(probationEnd.getMonth() + 6);
    return probationEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Check if employee is in probation
  const isInProbation = employmentType === 'Probation' || employmentType === 'probation';
  const calculatedProbationEndDate = calculateProbationEndDate(joiningDate);
  const formattedJoiningDate = joiningDate ? new Date(joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  useEffect(() => {
    fetchActiveEmployees();
  }, [fetchActiveEmployees]);

  useEffect(() => {
    getHolidayGroups().then(setHolidayGroups).catch(() => {});
  }, []);

  // Sync selectedGroupId when prop changes
  useEffect(() => {
    setSelectedGroupId(holidayGroupId || 'none');
  }, [holidayGroupId]);

  // Update formData when props change (e.g., after successful update)
  useEffect(() => {
    console.log('JobTab props updated:', { department, businessUnit, legalEntity });
    setFormData({
      designation: designation || '',
      department: department || '',
      businessUnit: businessUnit || '',
      legalEntity: legalEntity || '',
      employmentType: employmentType || '',
      workerType: workerType || '',
      hireType: hireType || '',
      location: location || '',
      reportingManagerId: reportingManagerId || '',
      dottedLineManagerId: dottedLineManagerId || '',
      probationPolicy: probationPolicy || 'Default Probation Policy',
    });
  }, [designation, department, businessUnit, legalEntity, employmentType, workerType, hireType, location, reportingManagerId, dottedLineManagerId, probationPolicy]);

  // Fixed list of departments
  const availableDepartments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'HR',
    'Operations'
  ];

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
        console.log('Saving job info - section:', editingSection);
        console.log('Data being sent:', dataToSend);
        await onUpdate(dataToSend);
        console.log('Update successful, data should refresh from parent');
      }
      toast.success('Job information updated successfully');
      setEditingSection(null);
    } catch (error: any) {
      console.error('Failed to update job information:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed validation errors if available
      if (error.response?.data?.error?.details) {
        const details = error.response.data.error.details;
        const errorMessages = details.map((d: any) => `${d.field}: ${d.message}`).join('\n');
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update job information');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHolidayGroup = async () => {
    if (!employeeId) return;
    try {
      setIsSavingHoliday(true);
      // Find the employee's MongoDB _id from activeEmployees store
      const empRecord = activeEmployees.find(e => e.employeeId === employeeId);
      const mongoId = empRecord?._id;
      if (!mongoId) {
        toast.error('Could not resolve employee record');
        return;
      }
      await axios.patch(
        `${API_BASE}/holidays/config/groups/set-employee-group`,
        { employeeId: mongoId, groupId: selectedGroupId },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      toast.success('Holiday group updated successfully');
      setIsEditingHoliday(false);
    } catch (err) {
      console.error('Failed to update holiday group:', err);
      toast.error('Failed to update holiday group');
    } finally {
      setIsSavingHoliday(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      designation: designation || '',
      department: department || '',
      businessUnit: businessUnit || '',
      legalEntity: legalEntity || '',
      employmentType: employmentType || '',
      workerType: workerType || '',
      hireType: hireType || '',
      location: location || '',
      reportingManagerId: reportingManagerId || '',
      dottedLineManagerId: dottedLineManagerId || '',
      probationPolicy: probationPolicy || 'Default Probation Policy',
    });
    setEditingSection(null);
  };

  // Save active tab to sessionStorage whenever it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    sessionStorage.setItem('jobTab-activeTab', value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                {isHRAdmin && editingSection !== 'jobInfo' && (
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
                      onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      placeholder="Designation"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{designation}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Location
                  </label>
                  {editingSection === 'jobInfo' ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                {isHRAdmin && editingSection !== 'reporting' && (
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
                    Reporting Manager (L1 Manager)
                  </label>
                  {editingSection === 'reporting' ? (
                    <Popover open={reportingManagerOpen} onOpenChange={setReportingManagerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={reportingManagerOpen}
                          className="w-full justify-between"
                        >
                          {formData.reportingManagerId && formData.reportingManagerId !== 'none'
                            ? activeEmployees.find(emp => emp.employeeId === formData.reportingManagerId)?.name || 'Select reporting manager...'
                            : "Select reporting manager..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search employee..." />
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, reportingManagerId: 'none' }));
                                setReportingManagerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.reportingManagerId === 'none' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              No Manager
                            </CommandItem>
                            {activeEmployees
                              .filter(emp => emp.employeeId !== employeeId)
                              .map((emp) => (
                                <CommandItem
                                  key={emp._id}
                                  value={`${emp.name} ${emp.employeeId}`}
                                  onSelect={() => {
                                    setFormData(prev => ({ ...prev, reportingManagerId: emp.employeeId }));
                                    setReportingManagerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.reportingManagerId === emp.employeeId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {emp.name} ({emp.employeeId})
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-base font-medium text-gray-900">{reportingManager || 'Not Assigned'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Dotted Line Manager
                  </label>
                  {editingSection === 'reporting' ? (
                    <Popover open={dottedLineManagerOpen} onOpenChange={setDottedLineManagerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={dottedLineManagerOpen}
                          className="w-full justify-between"
                        >
                          {formData.dottedLineManagerId && formData.dottedLineManagerId !== 'none'
                            ? activeEmployees.find(emp => emp.employeeId === formData.dottedLineManagerId)?.name || 'Select dotted line manager...'
                            : "Select dotted line manager..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search employee..." />
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, dottedLineManagerId: 'none' }));
                                setDottedLineManagerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.dottedLineManagerId === 'none' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              No Manager
                            </CommandItem>
                            {activeEmployees
                              .filter(emp => emp.employeeId !== employeeId)
                              .map((emp) => (
                                <CommandItem
                                  key={emp._id}
                                  value={`${emp.name} ${emp.employeeId}`}
                                  onSelect={() => {
                                    setFormData(prev => ({ ...prev, dottedLineManagerId: emp.employeeId }));
                                    setDottedLineManagerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.dottedLineManagerId === emp.employeeId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {emp.name} ({emp.employeeId})
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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

        {/* Holiday Configuration Widget */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CalendarDays className="h-5 w-5 text-orange-600" />
                Holiday Configuration
              </div>
              {isHRAdmin && !isEditingHoliday && (
                <Button onClick={() => setIsEditingHoliday(true)} variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Holiday Group
                </label>
                {isEditingHoliday ? (
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select holiday group..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {holidayGroups.filter(g => g.isActive).map(g => (
                        <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {holidayGroups.find(g => g._id === selectedGroupId)?.name || 'Not Assigned'}
                  </p>
                )}
              </div>
            </div>
            {isEditingHoliday && (
              <div className="flex gap-2 justify-end mt-4">
                <Button
                  onClick={() => { setIsEditingHoliday(false); setSelectedGroupId(holidayGroupId || 'none'); }}
                  variant="outline"
                  size="sm"
                  disabled={isSavingHoliday}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveHolidayGroup} disabled={isSavingHoliday} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingHoliday ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Time Tab */}
        {employeeId && (
          <EmployeeTimeTab
            employeeId={employeeId}
            employeeTime={employeeTime || {}}
            onUpdate={() => onUpdate && onUpdate({})}
            canEdit={isHRAdmin}
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
                {isHRAdmin && editingSection !== 'department' && (
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
                  {editingSection === 'department' ? (
                    <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={departmentOpen}
                          className="w-full justify-between"
                        >
                          {formData.department || "Select department..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search department..." />
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {availableDepartments.map((dept) => (
                              <CommandItem
                                key={dept}
                                value={dept}
                                onSelect={() => {
                                  console.log('Department selected:', dept);
                                  setFormData(prev => ({ ...prev, department: dept }));
                                  setDepartmentOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.department === dept ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {dept}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-base font-medium text-gray-900">{department}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Business Unit
                  </label>
                  {editingSection === 'department' ? (
                    <Input
                      value={formData.businessUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessUnit: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, legalEntity: e.target.value }))}
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
              companyName: 'OneAcu – Your Unified Workplace',
              legalEntity: legalEntity,
              businessUnit: businessUnit,
              department: department,
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
                {isHRAdmin && editingSection !== 'employmentType' && (
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
                  {editingSection === 'employmentType' && isHRAdmin ? (
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Probation">Probation</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base font-medium text-gray-900">{employmentType}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Worker Type
                  </label>
                  {editingSection === 'employmentType' && isHRAdmin ? (
                    <Input
                      value={formData.workerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, workerType: e.target.value }))}
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
                  {editingSection === 'employmentType' && isHRAdmin ? (
                    <Input
                      value={formData.hireType}
                      onChange={(e) => setFormData(prev => ({ ...prev, hireType: e.target.value }))}
                      placeholder="Hire type"
                    />
                  ) : (
                    <p className="text-base font-medium text-gray-900">{hireType || 'N/A'}</p>
                  )}
                </div>
              </div>
              {editingSection === 'employmentType' && isHRAdmin && (
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

        {/* Probation Information Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Award className="h-5 w-5 text-purple-600" />
                Probation Information
              </div>
              {isHRAdmin && editingSection !== 'probation' && (
                <Button onClick={() => setEditingSection('probation')} variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* In Probation Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    In Probation?
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-purple-700 mb-1">
                        {isInProbation ? 'Yes' : 'No'}
                      </p>
                      {isInProbation && calculatedProbationEndDate && (
                        <p className="text-sm text-purple-600">
                          {formattedJoiningDate} - {calculatedProbationEndDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Probation Policy */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Probation Policy
                  </label>
                  {editingSection === 'probation' && isHRAdmin ? (
                    <Input
                      value={formData.probationPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, probationPolicy: e.target.value }))}
                      placeholder="Enter probation policy"
                      className="h-11"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 min-h-[76px]">
                      <p className="text-base font-medium text-gray-900">
                        {formData.probationPolicy}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {editingSection === 'probation' && isHRAdmin && (
                <div className="flex gap-2 justify-end pt-4 border-t">
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
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
