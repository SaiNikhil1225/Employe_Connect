import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { configService, type ConfigMaster } from '@/services/configService';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import ConfigFormSheet from './ConfigFormSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfigSectionProps {
  type: string;
  label: string;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ type, label }) => {
  const [configs, setConfigs] = useState<ConfigMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigMaster | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<ConfigMaster | null>(null);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  
  // Check if user is RMG or SUPER_ADMIN (both can manage configs)
  const isAdmin = user?.role === 'RMG' || user?.role === 'SUPER_ADMIN';

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await configService.getByType(type);
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleAdd = () => {
    setEditingConfig(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (config: ConfigMaster) => {
    setEditingConfig(config);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;

    try {
      await configService.delete(type, deletingConfig._id!);
      toast({
        title: 'Success',
        description: 'Configuration deleted successfully',
      });
      fetchConfigs();
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete configuration',
        variant: 'destructive',
      });
    } finally {
      setDeletingConfig(null);
    }
  };

  const handleToggleStatus = async (config: ConfigMaster) => {
    try {
      const newStatus = config.status === 'Active' ? 'Inactive' : 'Active';
      await configService.update(type, config._id!, {
        name: config.name,
        description: config.description,
        status: newStatus,
      });
      toast({
        title: 'Success',
        description: `Configuration ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`,
      });
      fetchConfigs();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsSheetOpen(false);
    setEditingConfig(null);
    fetchConfigs();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="text-sm text-gray-600">
            {configs.length} {configs.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      {/* Table */}
      {configs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No configurations found. Click "Add New" to create one.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Updated</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config._id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {config.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={config.status === 'Active' ? 'default' : 'secondary'}
                    >
                      {config.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {config.createdAt
                      ? new Date(config.createdAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {config.updatedAt
                      ? new Date(config.updatedAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(config)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(config)}>
                            {config.status === 'Active' ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingConfig(config)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Sheet */}
      <ConfigFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        type={type}
        label={label}
        config={editingConfig}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingConfig}
        onOpenChange={() => setDeletingConfig(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingConfig?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConfigSection;
