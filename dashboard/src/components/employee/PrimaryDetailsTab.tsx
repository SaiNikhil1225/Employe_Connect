import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { User, Edit2, Save, X } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface PrimaryDetailsTabProps {
  employeeId: string;
  primaryDetails: any;
  onUpdate: () => void;
}

export default function PrimaryDetailsTab({ employeeId, primaryDetails, onUpdate }: PrimaryDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: primaryDetails?.firstName || '',
    middleName: primaryDetails?.middleName || '',
    lastName: primaryDetails?.lastName || '',
    dateOfBirth: primaryDetails?.dateOfBirth || '',
    gender: primaryDetails?.gender || '',
    maritalStatus: primaryDetails?.maritalStatus || '',
    nationality: primaryDetails?.nationality || '',
    bloodGroup: primaryDetails?.bloodGroup || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, formData);
      if (response.success) {
        toast.success('Primary details updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update primary details');
      }
    } catch (error: any) {
      console.error('Failed to update primary details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update primary details';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: primaryDetails?.firstName || '',
      middleName: primaryDetails?.middleName || '',
      lastName: primaryDetails?.lastName || '',
      dateOfBirth: primaryDetails?.dateOfBirth || '',
      gender: primaryDetails?.gender || '',
      maritalStatus: primaryDetails?.maritalStatus || '',
      nationality: primaryDetails?.nationality || '',
      bloodGroup: primaryDetails?.bloodGroup || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-green-600 dark:text-green-500" />
              Primary Details
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label className="text-sm text-muted-foreground">First Name</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.firstName || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Middle Name</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.middleName || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Last Name</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.lastName || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.dateOfBirth ? new Date(primaryDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Gender</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.gender || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Marital Status</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.maritalStatus || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Nationality</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.nationality || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Blood Group</Label>
                <p className="text-base font-medium mt-1">{primaryDetails?.bloodGroup || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker
                    value={formData.dateOfBirth}
                    onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                    placeholder="Select date of birth"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input
                    id="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          {isEditing && (
            <div className="flex gap-2 justify-end mt-6">
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm">
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
