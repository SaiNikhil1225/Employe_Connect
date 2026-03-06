import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Pencil, Plus, X, Heart, AlertTriangle } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface MedicalInfoTabProps {
  employeeId: string;
  medicalInfo: any;
  onUpdate: () => void;
}

export default function MedicalInfoTab({ employeeId, medicalInfo, onUpdate }: MedicalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: medicalInfo?.bloodGroup || '',
    allergies: medicalInfo?.allergies || [],
    chronicConditions: medicalInfo?.chronicConditions || [],
    medications: medicalInfo?.medications || [],
    insuranceProvider: medicalInfo?.insuranceProvider || '',
    insurancePolicyNumber: medicalInfo?.insurancePolicyNumber || '',
    insuranceValidUntil: medicalInfo?.insuranceValidUntil || '',
    lastCheckupDate: medicalInfo?.lastCheckupDate || '',
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updateMedicalInfo(employeeId, formData);
      if (response.success) {
        toast.success('Medical information updated successfully');
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update medical information');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'allergies' | 'chronicConditions' | 'medications', value: string) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      });
      if (type === 'allergies') setNewAllergy('');
      if (type === 'chronicConditions') setNewCondition('');
      if (type === 'medications') setNewMedication('');
    }
  };

  const removeItem = (type: 'allergies' | 'chronicConditions' | 'medications', index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Medical Information
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Blood Group */}
              <div>
                <Label className="text-sm text-muted-foreground">Blood Group</Label>
                <p className="text-lg font-semibold">
                  {medicalInfo?.bloodGroup || (
                    <span className="text-muted-foreground text-sm">Not specified</span>
                  )}
                </p>
              </div>

              {/* Allergies */}
              <div>
                <Label className="text-sm text-muted-foreground">Allergies</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {medicalInfo?.allergies && medicalInfo.allergies.length > 0 ? (
                    medicalInfo.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None reported</span>
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <Label className="text-sm text-muted-foreground">Chronic Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {medicalInfo?.chronicConditions && medicalInfo.chronicConditions.length > 0 ? (
                    medicalInfo.chronicConditions.map((condition: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {condition}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None reported</span>
                  )}
                </div>
              </div>

              {/* Medications */}
              <div>
                <Label className="text-sm text-muted-foreground">Current Medications</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {medicalInfo?.medications && medicalInfo.medications.length > 0 ? (
                    medicalInfo.medications.map((medication: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {medication}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              </div>

              {/* Insurance Provider */}
              <div>
                <Label className="text-sm text-muted-foreground">Insurance Provider</Label>
                <p className="text-base">
                  {medicalInfo?.insuranceProvider || (
                    <span className="text-muted-foreground text-sm">Not specified</span>
                  )}
                </p>
              </div>

              {/* Insurance Policy Number */}
              <div>
                <Label className="text-sm text-muted-foreground">Policy Number</Label>
                <p className="text-base">
                  {medicalInfo?.insurancePolicyNumber || (
                    <span className="text-muted-foreground text-sm">Not specified</span>
                  )}
                </p>
              </div>

              {/* Insurance Valid Until */}
              <div>
                <Label className="text-sm text-muted-foreground">Insurance Valid Until</Label>
                <p className="text-base">
                  {medicalInfo?.insuranceValidUntil
                    ? new Date(medicalInfo.insuranceValidUntil).toLocaleDateString()
                    : <span className="text-muted-foreground text-sm">Not specified</span>}
                </p>
              </div>

              {/* Last Checkup */}
              <div>
                <Label className="text-sm text-muted-foreground">Last Medical Checkup</Label>
                <p className="text-base">
                  {medicalInfo?.lastCheckupDate
                    ? new Date(medicalInfo.lastCheckupDate).toLocaleDateString()
                    : <span className="text-muted-foreground text-sm">Not specified</span>}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Blood Group */}
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  placeholder="e.g., O+, A-, AB+"
                />
              </div>

              {/* Allergies */}
              <div>
                <Label>Allergies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy"
                    onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addItem('allergies', newAllergy)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy: string, index: number) => (
                    <Badge key={index} variant="destructive" className="cursor-pointer">
                      {allergy}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeItem('allergies', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <Label>Chronic Conditions</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition"
                    onKeyPress={(e) => e.key === 'Enter' && addItem('chronicConditions', newCondition)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addItem('chronicConditions', newCondition)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.chronicConditions.map((condition: string, index: number) => (
                    <Badge key={index} variant="outline" className="cursor-pointer">
                      {condition}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeItem('chronicConditions', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <Label>Current Medications</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add medication"
                    onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addItem('medications', newMedication)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medications.map((medication: string, index: number) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {medication}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeItem('medications', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Insurance Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceProvider: e.target.value })
                    }
                    placeholder="Provider name"
                  />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, insurancePolicyNumber: e.target.value })
                    }
                    placeholder="Policy number"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Insurance Valid Until</Label>
                  <DatePicker
                    value={formData.insuranceValidUntil}
                    onChange={(date) => setFormData({ ...formData, insuranceValidUntil: date })}
                    placeholder="Select valid until date"
                  />
                </div>
                <div>
                  <Label htmlFor="lastCheckup">Last Medical Checkup</Label>
                  <DatePicker
                    value={formData.lastCheckupDate}
                    onChange={(date) => setFormData({ ...formData, lastCheckupDate: date })}
                    placeholder="Select last checkup date"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
