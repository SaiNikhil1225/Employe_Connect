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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
  SheetCloseButton,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Laptop, Plus, Pencil, CheckCircle, Clock } from 'lucide-react';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

interface AssetsTabProps {
  employeeId: string;
  assets: any[];
  onUpdate: () => void;
}

export default function AssetsTab({ employeeId, assets, onUpdate }: AssetsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    assetType: '',
    assetId: '',
    description: '',
    assignedDate: '',
    returnDate: '',
    condition: '',
  });

  const assetTypes = [
    'Laptop',
    'Desktop',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Mobile Phone',
    'Tablet',
    'Headset',
    'Webcam',
    'Docking Station',
    'Access Card',
    'ID Badge',
    'Other',
  ];

  const resetForm = () => {
    setFormData({
      assetType: '',
      assetId: '',
      description: '',
      assignedDate: '',
      returnDate: '',
      condition: '',
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    const asset = assets[index];
    setFormData(asset);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedAssets = [...assets];
      
      if (editingIndex !== null) {
        updatedAssets[editingIndex] = formData;
      } else {
        updatedAssets.push(formData);
      }

      const response = await employeeManagementService.updateAssets(
        employeeId,
        updatedAssets
      );
      
      if (response.success) {
        toast.success(editingIndex !== null ? 'Asset updated' : 'Asset assigned');
        setIsDialogOpen(false);
        resetForm();
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save asset');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (asset: any) => {
    if (asset.returnDate) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Returned
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <Clock className="h-3 w-3 mr-1" />
        Assigned
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-teal-500" />
              Company Assets
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Assign Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assets && assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{asset.assetType}</TableCell>
                    <TableCell>{asset.assetId}</TableCell>
                    <TableCell>{asset.description || '-'}</TableCell>
                    <TableCell>
                      {new Date(asset.assignedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {asset.returnDate
                        ? new Date(asset.returnDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{asset.condition || '-'}</TableCell>
                    <TableCell>{getStatusBadge(asset)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Laptop className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No assets assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              {editingIndex !== null ? 'Edit Asset' : 'Assign Asset'}
            </SheetTitle>
            <SheetCloseButton />
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assetType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assetId">Asset ID *</Label>
                <Input
                  id="assetId"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  placeholder="Unique asset identifier"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g., Dell Latitude 7490, 16GB RAM"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedDate">Assigned Date *</Label>
                <Input
                  id="assignedDate"
                  type="date"
                  value={formData.assignedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="returnDate">Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving || !formData.assetType || !formData.assetId || !formData.assignedDate
              }
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
