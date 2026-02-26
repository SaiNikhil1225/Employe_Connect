import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Award, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface CertificationsTabProps {
  employeeId: string;
  certifications: any[];
  onUpdate: () => void;
}

export default function CertificationsTab({
  employeeId,
  certifications,
  onUpdate,
}: CertificationsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const cert = certifications[index];
    setFormData(cert);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedCerts = [...certifications];
      
      if (editingIndex !== null) {
        updatedCerts[editingIndex] = formData;
      } else {
        updatedCerts.push(formData);
      }

      const response = await employeeManagementService.updateCertifications(
        employeeId,
        updatedCerts
      );
      
      if (response.success) {
        toast.success(
          editingIndex !== null ? 'Certification updated' : 'Certification added'
        );
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save certification');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      const updatedCerts = certifications.filter((_, i) => i !== index);
      const response = await employeeManagementService.updateCertifications(
        employeeId,
        updatedCerts
      );
      
      if (response.success) {
        toast.success('Certification deleted');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete certification');
      console.error(error);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', variant: 'destructive' as const, color: 'text-red-500' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'Expiring Soon', variant: 'destructive' as const, color: 'text-orange-500' };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'Expiring', variant: 'secondary' as const, color: 'text-yellow-500' };
    }
    return { status: 'Valid', variant: 'default' as const, color: 'text-green-500' };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Certifications
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {certifications && certifications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Issuing Organization</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((cert: any, index: number) => {
                  const expiryStatus = getExpiryStatus(cert.expiryDate);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {cert.name}
                        {cert.credentialId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {cert.credentialId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{cert.issuingOrganization}</TableCell>
                      <TableCell>
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {cert.expiryDate ? (
                          new Date(cert.expiryDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {expiryStatus && (
                          <Badge variant={expiryStatus.variant}>
                            {expiryStatus.status === 'Expired' && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {expiryStatus.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {cert.credentialUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(cert.credentialUrl, '_blank')}
                            >
                              View
                            </Button>
                          )}
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
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No certifications added yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first certification
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
              {editingIndex !== null ? 'Edit Certification' : 'Add Certification'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Certification Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>

            <div>
              <Label htmlFor="organization">Issuing Organization *</Label>
              <Input
                id="organization"
                value={formData.issuingOrganization}
                onChange={(e) =>
                  setFormData({ ...formData, issuingOrganization: e.target.value })
                }
                placeholder="e.g., Amazon Web Services"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                value={formData.credentialId}
                onChange={(e) =>
                  setFormData({ ...formData, credentialId: e.target.value })
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="credentialUrl">Credential URL</Label>
              <Input
                id="credentialUrl"
                value={formData.credentialUrl}
                onChange={(e) =>
                  setFormData({ ...formData, credentialUrl: e.target.value })
                }
                placeholder="https://... (optional)"
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
                !formData.name ||
                !formData.issuingOrganization ||
                !formData.issueDate
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
