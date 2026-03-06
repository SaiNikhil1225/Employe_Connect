import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface FamilyMembersTabProps {
  employeeId: string;
  familyMembers: any[];
  onUpdate: () => void;
}

export default function FamilyMembersTab({
  employeeId,
  familyMembers,
  onUpdate,
}: FamilyMembersTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    phoneNumber: '',
    occupation: '',
    isDependent: false,
    isNominee: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      dateOfBirth: '',
      phoneNumber: '',
      occupation: '',
      isDependent: false,
      isNominee: false,
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const member = familyMembers[index];
    setFormData(member);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedMembers = [...familyMembers];
      
      if (editingIndex !== null) {
        updatedMembers[editingIndex] = formData;
      } else {
        updatedMembers.push(formData);
      }

      const response = await employeeManagementService.updateFamilyMembers(
        employeeId,
        updatedMembers
      );
      
      if (response.success) {
        toast.success(
          editingIndex !== null ? 'Family member updated' : 'Family member added'
        );
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save family member');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this family member?')) return;

    try {
      const updatedMembers = familyMembers.filter((_, i) => i !== index);
      const response = await employeeManagementService.updateFamilyMembers(
        employeeId,
        updatedMembers
      );
      
      if (response.success) {
        toast.success('Family member deleted');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete family member');
      console.error(error);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Family Members
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {familyMembers && familyMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Dependent</TableHead>
                  <TableHead>Nominee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.map((member: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.relationship}</TableCell>
                    <TableCell>{calculateAge(member.dateOfBirth)}</TableCell>
                    <TableCell>{member.occupation || '-'}</TableCell>
                    <TableCell>
                      {member.isDependent && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {member.isNominee && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No family members added yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first family member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Family Member' : 'Add Family Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  placeholder="e.g., Spouse, Child, Parent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <DatePicker
                  value={formData.dateOfBirth}
                  onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                  placeholder="Select date of birth"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
                placeholder="Optional"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDependent"
                  checked={formData.isDependent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDependent: checked as boolean })
                  }
                />
                <label
                  htmlFor="isDependent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Is Dependent
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNominee"
                  checked={formData.isNominee}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isNominee: checked as boolean })
                  }
                />
                <label
                  htmlFor="isNominee"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Is Nominee
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.relationship || !formData.dateOfBirth}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
