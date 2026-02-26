import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface WorkHistoryTabProps {
  employeeId: string;
  workHistory: any[];
  onUpdate: () => void;
}

export default function WorkHistoryTab({
  employeeId,
  workHistory,
  onUpdate,
}: WorkHistoryTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company: '',
    designation: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
    achievements: '',
    reasonForLeaving: '',
  });

  const resetForm = () => {
    setFormData({
      company: '',
      designation: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
      achievements: '',
      reasonForLeaving: '',
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const work = workHistory[index];
    setFormData(work);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedHistory = [...workHistory];
      
      if (editingIndex !== null) {
        updatedHistory[editingIndex] = formData;
      } else {
        updatedHistory.push(formData);
      }

      const response = await employeeManagementService.updateWorkHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success(
          editingIndex !== null ? 'Work history updated' : 'Work history added'
        );
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save work history');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this work history record?')) return;

    try {
      const updatedHistory = workHistory.filter((_, i) => i !== index);
      const response = await employeeManagementService.updateWorkHistory(
        employeeId,
        updatedHistory
      );
      
      if (response.success) {
        toast.success('Work history deleted');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete work history');
      console.error(error);
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} yr ${remainingMonths} mo`;
    } else if (years > 0) {
      return `${years} yr`;
    } else {
      return `${remainingMonths} mo`;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-500" />
              Work History
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workHistory && workHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workHistory.map((work: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{work.company}</TableCell>
                    <TableCell>{work.designation}</TableCell>
                    <TableCell>
                      {calculateDuration(work.startDate, work.endDate)}
                    </TableCell>
                    <TableCell>
                      {new Date(work.startDate).toLocaleDateString()} -{' '}
                      {new Date(work.endDate).toLocaleDateString()}
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
              <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No work history added yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first work experience
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Work Experience' : 'Add Work Experience'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="responsibilities">Responsibilities *</Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData({ ...formData, responsibilities: e.target.value })
                }
                placeholder="Key responsibilities and duties"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
                placeholder="Notable achievements (optional)"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="reasonForLeaving">Reason for Leaving</Label>
              <Input
                id="reasonForLeaving"
                value={formData.reasonForLeaving}
                onChange={(e) =>
                  setFormData({ ...formData, reasonForLeaving: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !formData.company ||
                !formData.designation ||
                !formData.startDate ||
                !formData.endDate ||
                !formData.responsibilities
              }
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
