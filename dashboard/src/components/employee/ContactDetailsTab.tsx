import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Edit2, Save, X } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface ContactDetailsTabProps {
  employeeId: string;
  contactDetails: any;
  onUpdate: () => void;
}

export default function ContactDetailsTab({ employeeId, contactDetails, onUpdate }: ContactDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: contactDetails?.mobileNumber || '',
    alternateNumber: contactDetails?.alternateNumber || '',
    personalEmail: contactDetails?.personalEmail || '',
    workEmail: contactDetails?.workEmail || '',
    residenceNumber: contactDetails?.residenceNumber || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updateContactInfo(employeeId, formData);
      if (response.success) {
        toast.success('Contact details updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update contact details');
      }
    } catch (error: any) {
      console.error('Failed to update contact details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update contact details';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      mobileNumber: contactDetails?.mobileNumber || '',
      alternateNumber: contactDetails?.alternateNumber || '',
      personalEmail: contactDetails?.personalEmail || '',
      workEmail: contactDetails?.workEmail || '',
      residenceNumber: contactDetails?.residenceNumber || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Contact Details
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
                <Label className="text-sm text-muted-foreground">Mobile Number</Label>
                <p className="text-base font-medium mt-1">{contactDetails?.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Alternate Number</Label>
                <p className="text-base font-medium mt-1">{contactDetails?.alternateNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Personal Email</Label>
                <p className="text-base font-medium mt-1">{contactDetails?.personalEmail || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Work Email</Label>
                <p className="text-base font-medium mt-1">{contactDetails?.workEmail || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Residence Number</Label>
                <p className="text-base font-medium mt-1">{contactDetails?.residenceNumber || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="alternateNumber">Alternate Number</Label>
                  <Input
                    id="alternateNumber"
                    value={formData.alternateNumber}
                    onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="workEmail">Work Email</Label>
                  <Input
                    id="workEmail"
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="residenceNumber">Residence Number</Label>
                  <Input
                    id="residenceNumber"
                    value={formData.residenceNumber}
                    onChange={(e) => setFormData({ ...formData, residenceNumber: e.target.value })}
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
