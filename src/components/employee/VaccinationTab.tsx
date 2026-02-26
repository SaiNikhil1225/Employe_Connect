import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Syringe } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface VaccinationTabProps {
  employeeId: string;
  vaccination: any;
  onUpdate: () => void;
}

export default function VaccinationTab({ employeeId, vaccination, onUpdate }: VaccinationTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: vaccination?.vaccineName || '',
    dose1Date: vaccination?.dose1Date || '',
    dose2Date: vaccination?.dose2Date || '',
    boosterDate: vaccination?.boosterDate || '',
    vaccinationStatus: vaccination?.vaccinationStatus || '',
    certificateNumber: vaccination?.certificateNumber || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, { vaccination: formData });
      if (response.success) {
        toast.success('Vaccination details updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update vaccination details');
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
              <Syringe className="h-5 w-5 text-teal-500" />
              Vaccination Details
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
                <Label className="text-sm text-muted-foreground">Vaccine Name</Label>
                <p className="text-base font-medium mt-1">{vaccination?.vaccineName || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Vaccination Status</Label>
                <p className="text-base font-medium mt-1">{vaccination?.vaccinationStatus || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Dose 1 Date</Label>
                <p className="text-base font-medium mt-1">{vaccination?.dose1Date ? new Date(vaccination.dose1Date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Dose 2 Date</Label>
                <p className="text-base font-medium mt-1">{vaccination?.dose2Date ? new Date(vaccination.dose2Date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Booster Date</Label>
                <p className="text-base font-medium mt-1">{vaccination?.boosterDate ? new Date(vaccination.boosterDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Certificate Number</Label>
                <p className="text-base font-medium mt-1">{vaccination?.certificateNumber || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vaccineName">Vaccine Name</Label>
                  <Input
                    id="vaccineName"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vaccinationStatus">Vaccination Status</Label>
                  <Input
                    id="vaccinationStatus"
                    value={formData.vaccinationStatus}
                    onChange={(e) => setFormData({ ...formData, vaccinationStatus: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dose1Date">Dose 1 Date</Label>
                  <Input
                    id="dose1Date"
                    type="date"
                    value={formData.dose1Date}
                    onChange={(e) => setFormData({ ...formData, dose1Date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dose2Date">Dose 2 Date</Label>
                  <Input
                    id="dose2Date"
                    type="date"
                    value={formData.dose2Date}
                    onChange={(e) => setFormData({ ...formData, dose2Date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="boosterDate">Booster Date</Label>
                  <Input
                    id="boosterDate"
                    type="date"
                    value={formData.boosterDate}
                    onChange={(e) => setFormData({ ...formData, boosterDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
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
