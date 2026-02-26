import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, Heart, Phone, Mail, Droplet, Edit2, Save, X, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AboutTabProps {
  // Basic Information
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  dialCode?: string;
  mobileNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  
  // Employment
  summary?: string;
  joiningDate: string;
  department: string;
  businessUnit: string;
  
  // Contact Information
  workPhone?: string;
  residenceNumber?: string;
  personalEmail?: string;
  
  // Family & Personal Details
  maritalStatus?: string;
  marriageDate?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  spouseGender?: string;
  physicallyHandicapped?: string;
  bloodGroup?: string;
  nationality?: string;
  
  // Address Details
  currentAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  
  // Update handler
  onUpdate?: (data: any) => Promise<void>;
}

export default function AboutTab({ 
  firstName, middleName, lastName, displayName,
  email, dialCode, mobileNumber, gender, dateOfBirth,
  summary, joiningDate, department, businessUnit,
  workPhone, residenceNumber, personalEmail,
  maritalStatus, marriageDate, fatherName, motherName, spouseName, spouseGender,
  physicallyHandicapped, bloodGroup, nationality,
  currentAddress, city, state, country, postalCode,
  emergencyContactName, emergencyContactRelationship, emergencyContactPhone, emergencyContactEmail,
  onUpdate
}: AboutTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: firstName || '',
    middleName: middleName || '',
    lastName: lastName || '',
    displayName: displayName || '',
    dialCode: dialCode || '+1',
    mobileNumber: mobileNumber || '',
    gender: gender || '',
    dateOfBirth: dateOfBirth || '',
    summary: summary || '',
    workPhone: workPhone || '',
    residenceNumber: residenceNumber || '',
    personalEmail: personalEmail || '',
    maritalStatus: maritalStatus || '',
    marriageDate: marriageDate || '',
    fatherName: fatherName || '',
    motherName: motherName || '',
    spouseName: spouseName || '',
    spouseGender: spouseGender || '',
    physicallyHandicapped: physicallyHandicapped || 'No',
    bloodGroup: bloodGroup || '',
    nationality: nationality || '',
    currentAddress: currentAddress || '',
    city: city || '',
    state: state || '',
    country: country || '',
    postalCode: postalCode || '',
    emergencyContactName: emergencyContactName || '',
    emergencyContactRelationship: emergencyContactRelationship || '',
    emergencyContactPhone: emergencyContactPhone || '',
    emergencyContactEmail: emergencyContactEmail || '',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (onUpdate) {
        await onUpdate(formData);
      }
      toast.success('Profile updated successfully');
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      displayName: displayName || '',
      dialCode: dialCode || '+1',
      mobileNumber: mobileNumber || '',
      gender: gender || '',
      dateOfBirth: dateOfBirth || '',
      summary: summary || '',
      workPhone: workPhone || '',
      residenceNumber: residenceNumber || '',
      personalEmail: personalEmail || '',
      maritalStatus: maritalStatus || '',
      marriageDate: marriageDate || '',
      fatherName: fatherName || '',
      motherName: motherName || '',
      spouseName: spouseName || '',
      spouseGender: spouseGender || '',
      physicallyHandicapped: physicallyHandicapped || 'No',
      bloodGroup: bloodGroup || '',
      nationality: nationality || '',
      currentAddress: currentAddress || '',
      city: city || '',
      state: state || '',
      country: country || '',
      postalCode: postalCode || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactRelationship: emergencyContactRelationship || '',
      emergencyContactPhone: emergencyContactPhone || '',
      emergencyContactEmail: emergencyContactEmail || '',
    });
    setEditingSection(null);
  };
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-blue-600" />
              Professional Summary
            </div>
            {editingSection !== 'summary' && (
              <Button onClick={() => setEditingSection('summary')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingSection === 'summary' ? (
            <div className="space-y-4">
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Enter your professional summary..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 leading-relaxed">
              {summary || 'No professional summary available.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-purple-600" />
              Personal Information
            </div>
            {editingSection !== 'personal' && (
              <Button onClick={() => setEditingSection('personal')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                First Name
              </label>
              {editingSection === 'personal' ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{firstName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Middle Name
              </label>
              {editingSection === 'contact' ? (
                <Input
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="Middle name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{middleName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Last Name
              </label>
              {editingSection === 'contact' ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{lastName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Date of Birth
              </label>
              {editingSection === 'contact' ? (
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{dateOfBirth || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Gender
              </label>
              {editingSection === 'contact' ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900">{gender || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Blood Group
              </label>
              {editingSection === 'contact' ? (
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-red-500" />
                  <p className="text-base font-medium text-gray-900">{bloodGroup || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Nationality
              </label>
              {editingSection === 'contact' ? (
                <Input
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Nationality"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{nationality || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Physically Handicapped
              </label>
              {editingSection === 'contact' ? (
                <select
                  value={formData.physicallyHandicapped}
                  onChange={(e) => setFormData({ ...formData, physicallyHandicapped: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900">{physicallyHandicapped || 'No'}</p>
              )}
            </div>
          </div>
          {editingSection === 'personal' && (
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

      {/* Contact Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5 text-emerald-600" />
              Contact Information
            </div>
            {editingSection !== 'contact' && (
              <Button onClick={() => setEditingSection('contact')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Mobile Number
              </label>
              {editingSection === 'contact' ? (
                <div className="flex gap-2">
                  <Input
                    value={formData.dialCode}
                    onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                    placeholder="+1"
                    className="w-20"
                  />
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="Mobile number"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">
                    {dialCode && mobileNumber ? `${dialCode} ${mobileNumber}` : 'N/A'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Work Phone
              </label>
              {editingSection === 'contact' ? (
                <Input
                  value={formData.workPhone}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                  placeholder="Work phone"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">{workPhone || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Residence Number
              </label>
              {editingSection === 'contact' ? (
                <Input
                  value={formData.residenceNumber}
                  onChange={(e) => setFormData({ ...formData, residenceNumber: e.target.value })}
                  placeholder="Residence number"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">{residenceNumber || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Company Email
              </label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-base font-medium text-gray-900">{email || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Personal Email
              </label>
              {editingSection === 'contact' ? (
                <Input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  placeholder="Personal email"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">{personalEmail || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
          {editingSection === 'contact' && (
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

      {/* Family Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 text-pink-600" />
              Family Details
            </div>
            {editingSection !== 'family' && (
              <Button onClick={() => setEditingSection('family')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Marital Status
              </label>
              {editingSection === 'family' ? (
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900">{maritalStatus || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Marriage Date
              </label>
              {editingSection === 'family' ? (
                <Input
                  type="date"
                  value={formData.marriageDate}
                  onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{marriageDate || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Father's Name
              </label>
              {editingSection === 'family' ? (
                <Input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="Father's name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{fatherName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Mother's Name
              </label>
              {editingSection === 'family' ? (
                <Input
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="Mother's name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{motherName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Spouse Name
              </label>
              {editingSection === 'family' ? (
                <Input
                  value={formData.spouseName}
                  onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                  placeholder="Spouse name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{spouseName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Spouse Gender
              </label>
              {editingSection === 'family' ? (
                <select
                  value={formData.spouseGender}
                  onChange={(e) => setFormData({ ...formData, spouseGender: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-base font-medium text-gray-900">{spouseGender || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'family' && (
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

      {/* Address Details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-teal-600" />
              Address Details
            </div>
            {editingSection !== 'address' && (
              <Button onClick={() => setEditingSection('address')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Current Address
              </label>
              {editingSection === 'address' ? (
                <Textarea
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="Enter current address"
                  rows={3}
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{currentAddress || 'N/A'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  City
                </label>
                {editingSection === 'address' ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{city || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  State
                </label>
                {editingSection === 'address' ? (
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Enter state"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{state || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Country
                </label>
                {editingSection === 'address' ? (
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Enter country"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{country || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Postal Code
                </label>
                {editingSection === 'address' ? (
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="Enter postal code"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{postalCode || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
          {editingSection === 'address' && (
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

      {/* Emergency Contact */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              Emergency Contact
            </div>
            {editingSection !== 'emergency' && (
              <Button onClick={() => setEditingSection('emergency')} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Contact Name
              </label>
              {editingSection === 'emergency' ? (
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Enter contact name"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{emergencyContactName || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Relationship
              </label>
              {editingSection === 'emergency' ? (
                <Input
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{emergencyContactRelationship || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Phone Number
              </label>
              {editingSection === 'emergency' ? (
                <Input
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{emergencyContactPhone || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Email Address
              </label>
              {editingSection === 'emergency' ? (
                <Input
                  type="email"
                  value={formData.emergencyContactEmail}
                  onChange={(e) => setFormData({ ...formData, emergencyContactEmail: e.target.value })}
                  placeholder="Enter email address"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">{emergencyContactEmail || 'N/A'}</p>
              )}
            </div>
          </div>
          {editingSection === 'emergency' && (
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
