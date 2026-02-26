import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pencil, UserCog } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface EmployeeDetailsTabProps {
  employeeId: string;
  employeeDetails: any;
  onUpdate: () => void;
}

export default function EmployeeDetailsTab({ employeeId, employeeDetails, onUpdate }: EmployeeDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    flexibleToTravel: employeeDetails?.flexibleToTravel || false,
    futureAspiredRole: employeeDetails?.futureAspiredRole || '',
    interestedInOnsite: employeeDetails?.interestedInOnsite || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, formData);
      if (response.success) {
        toast.success('Employee details updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update employee details');
      console.error(error);
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
              <UserCog className="h-5 w-5 text-cyan-500" />
              Employee Details
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
            <div className="space-y-6">
              <div className="border-b pb-5">
                <Label className="text-sm font-medium text-muted-foreground uppercase">Are you flexible to travel?</Label>
                <p className="text-base font-semibold mt-2">
                  {employeeDetails?.flexibleToTravel ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="border-b pb-5">
                <Label className="text-sm font-medium text-muted-foreground uppercase">What is your future aspired role?</Label>
                <p className="text-base font-semibold mt-2">
                  {employeeDetails?.futureAspiredRole || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground uppercase">Will you be interested in onsite opportunities?</Label>
                <p className="text-base font-semibold mt-2">
                  {employeeDetails?.interestedInOnsite ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="flexibleToTravel">ARE YOU FLEXIBLE TO TRAVEL?</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      type="button"
                      variant={formData.flexibleToTravel ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, flexibleToTravel: true })}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.flexibleToTravel ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, flexibleToTravel: false })}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="futureAspiredRole">WHAT IS YOUR FUTURE ASPIRED ROLE?</Label>
                  <input
                    id="futureAspiredRole"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                    value={formData.futureAspiredRole}
                    onChange={(e) => setFormData({ ...formData, futureAspiredRole: e.target.value })}
                    placeholder="e.g., Senior Developer, Team Lead, Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="interestedInOnsite">WILL YOU BE INTERESTED IN ONSITE OPPORTUNITIES?</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      type="button"
                      variant={formData.interestedInOnsite ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, interestedInOnsite: true })}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.interestedInOnsite ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, interestedInOnsite: false })}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
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
