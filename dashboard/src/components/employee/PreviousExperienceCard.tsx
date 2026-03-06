import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pencil, Briefcase, Save, X } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { useEmployeeStore } from '@/store/employeeStore';
import { toast } from 'sonner';
import { 
  getExperienceBreakdown, 
  getYearsOptions, 
  getMonthsOptions,
  validateExperience 
} from '@/lib/experienceUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreviousExperienceCardProps {
  employeeId: string;
  dateOfJoining?: string;
  previousExperience?: {
    years?: number;
    months?: number;
  };
  onUpdate: () => void;
}

export default function PreviousExperienceCard({ 
  employeeId, 
  dateOfJoining,
  previousExperience, 
  onUpdate 
}: PreviousExperienceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    years: previousExperience?.years || 0,
    months: previousExperience?.months || 0,
  });
  const [saving, setSaving] = useState(false);
  const { fetchEmployees } = useEmployeeStore();

  // Sync formData when previousExperience prop changes
  useEffect(() => {
    setFormData({
      years: previousExperience?.years || 0,
      months: previousExperience?.months || 0,
    });
  }, [previousExperience]);

  // Calculate experience breakdown
  const experienceData = getExperienceBreakdown(
    { years: formData.years, months: formData.months },
    dateOfJoining
  );

  const handleSave = async () => {
    // Validate experience
    const validation = validateExperience(formData.years, formData.months);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, {
        previousExperience: {
          years: formData.years,
          months: formData.months,
        }
      });
      
      if (response.success) {
        toast.success('Previous experience updated successfully');
        setIsEditing(false);
        // Refresh both the profile page and the employee store
        onUpdate();
        await fetchEmployees();
      } else {
        toast.error(response.message || 'Failed to update experience');
      }
    } catch (error: any) {
      console.error('Failed to update experience:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update experience';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      years: previousExperience?.years || 0,
      months: previousExperience?.months || 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Experience Summary
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label className="text-sm text-muted-foreground">Previous Experience</Label>
                <p className="text-base font-medium mt-1">{experienceData.previousExperience.formatted}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Before joining Acuvate</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Acuvate Experience</Label>
                <p className="text-base font-medium mt-1">{experienceData.acuvateExperience.formatted}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dateOfJoining ? `Since ${new Date(dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Auto-calculated'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Total Experience</Label>
                <p className="text-base font-medium mt-1">{experienceData.totalExperience.formatted}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Previous + Acuvate combined</p>
              </div>
              </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years">Previous Experience - Years</Label>
                  <Select
                    value={formData.years.toString()}
                    onValueChange={(value) => setFormData({ ...formData, years: parseInt(value) })}
                  >
                    <SelectTrigger id="years">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {getYearsOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="months">Previous Experience - Months</Label>
                  <Select
                    value={formData.months.toString()}
                    onValueChange={(value) => setFormData({ ...formData, months: parseInt(value) })}
                  >
                    <SelectTrigger id="months">
                      <SelectValue placeholder="Select months" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthsOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 border border-blue-200 rounded bg-blue-50 dark:bg-blue-950/20">
                <p className="text-xs text-muted-foreground mb-1">Live Preview:</p>
                <p className="text-sm">
                  <span className="font-medium">Previous:</span> {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).previousExperience.formatted} • 
                  <span className="font-medium ml-2">Acuvate:</span> {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).acuvateExperience.formatted} • 
                  <span className="font-medium ml-2">Total:</span> {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).totalExperience.formatted}
                </p>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
