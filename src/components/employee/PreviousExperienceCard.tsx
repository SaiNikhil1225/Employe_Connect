import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pencil, Briefcase, Award, Calendar, TrendingUp } from 'lucide-react';
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
      }
    } catch (error) {
      toast.error('Failed to update experience');
      console.error(error);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience Summary
          </CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            {/* Previous Experience (User Editable) */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <Label className="text-sm font-semibold text-foreground">Previous Experience</Label>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {experienceData.previousExperience.formatted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Experience before joining Acuvate
              </p>
            </div>

            {/* Acuvate Experience (Auto-calculated) */}
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-sm font-semibold text-foreground">Acuvate Experience</Label>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {experienceData.acuvateExperience.formatted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dateOfJoining ? `Since joining on ${new Date(dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Auto-calculated from joining date'}
              </p>
            </div>

            {/* Total Experience (Calculated) */}
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold text-foreground">Total Experience</Label>
              </div>
              <p className="text-3xl font-bold text-primary">
                {experienceData.totalExperience.formatted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Previous + Acuvate combined
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>
                    Update your previous work experience (before joining Acuvate). 
                    Your Acuvate and Total experience will be calculated automatically.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years">Years</Label>
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
                  <Label htmlFor="months">Months</Label>
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

              {/* Live Preview */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">Preview</Label>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Previous</p>
                    <p className="text-lg font-bold text-foreground">
                      {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).previousExperience.formatted}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Acuvate</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).acuvateExperience.formatted}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-lg font-bold text-primary">
                      {getExperienceBreakdown({ years: formData.years, months: formData.months }, dateOfJoining).totalExperience.formatted}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
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
  );
}
