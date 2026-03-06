import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Briefcase } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface ExperienceTabProps {
  employeeId: string;
  experience: any;
  onUpdate: () => void;
}

export default function ExperienceTab({ employeeId, experience, onUpdate }: ExperienceTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    totalExperience: experience?.totalExperience || '',
    experienceInMonths: experience?.experienceInMonths || '',
    previousCompany: experience?.previousCompany || '',
    previousDesignation: experience?.previousDesignation || '',
    yearsOfExperience: experience?.yearsOfExperience || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, formData);
      if (response.success) {
        toast.success('Experience details updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update experience details');
      }
    } catch (error: any) {
      console.error('Failed to update experience details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update experience details';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Experience
            </CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label className="text-sm text-muted-foreground">Total Experience</Label>
                <p className="text-base font-medium mt-1">{experience?.totalExperience || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Experience in Months</Label>
                <p className="text-base font-medium mt-1">{experience?.experienceInMonths || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Previous Company</Label>
                <p className="text-base font-medium mt-1">{experience?.previousCompany || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Previous Designation</Label>
                <p className="text-base font-medium mt-1">{experience?.previousDesignation || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Years of Experience</Label>
                <p className="text-base font-medium mt-1">{experience?.yearsOfExperience || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalExperience">Total Experience</Label>
                  <Input
                    id="totalExperience"
                    value={formData.totalExperience}
                    onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="experienceInMonths">Experience in Months</Label>
                  <Input
                    id="experienceInMonths"
                    type="number"
                    value={formData.experienceInMonths}
                    onChange={(e) => setFormData({ ...formData, experienceInMonths: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="previousCompany">Previous Company</Label>
                  <Input
                    id="previousCompany"
                    value={formData.previousCompany}
                    onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="previousDesignation">Previous Designation</Label>
                  <Input
                    id="previousDesignation"
                    value={formData.previousDesignation}
                    onChange={(e) => setFormData({ ...formData, previousDesignation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
