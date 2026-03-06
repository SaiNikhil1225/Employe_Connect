import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Clock } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface EmployeeTimeTabProps {
  employeeId: string;
  employeeTime: any;
  onUpdate: () => void;
}

export default function EmployeeTimeTab({ employeeId, employeeTime, onUpdate }: EmployeeTimeTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shift: employeeTime?.shift || '',
    workingHours: employeeTime?.workingHours || '',
    workSchedule: employeeTime?.workSchedule || '',
    timeZone: employeeTime?.timeZone || '',
    workLocation: employeeTime?.workLocation || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, { employeeTime: formData });
      if (response.success) {
        toast.success('Employee time details updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update employee time details');
      }
    } catch (error: any) {
      console.error('Failed to update employee time details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update employee time details';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Employee Time
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
              <Label className="text-sm text-muted-foreground">Shift</Label>
              <p className="text-base font-medium mt-1">{employeeTime?.shift || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Working Hours</Label>
              <p className="text-base font-medium mt-1">{employeeTime?.workingHours || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Work Schedule</Label>
              <p className="text-base font-medium mt-1">{employeeTime?.workSchedule || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Time Zone</Label>
              <p className="text-base font-medium mt-1">{employeeTime?.timeZone || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Work Location</Label>
              <p className="text-base font-medium mt-1">{employeeTime?.workLocation || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift">Shift</Label>
                <Input
                  id="shift"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  placeholder="e.g., Day Shift, Night Shift"
                />
              </div>
              <div>
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="e.g., 9 AM - 6 PM"
                />
              </div>
              <div>
                <Label htmlFor="workSchedule">Work Schedule</Label>
                <Input
                  id="workSchedule"
                  value={formData.workSchedule}
                  onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                  placeholder="e.g., Monday - Friday"
                />
              </div>
              <div>
                <Label htmlFor="timeZone">Time Zone</Label>
                <Input
                  id="timeZone"
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  placeholder="e.g., IST, PST"
                />
              </div>
              <div>
                <Label htmlFor="workLocation">Work Location</Label>
                <Input
                  id="workLocation"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  placeholder="e.g., Office, Remote, Hybrid"
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
  );
}
