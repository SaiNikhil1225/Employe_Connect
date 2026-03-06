/**
 * Holiday Configuration Management Page
 * Manage all holiday-related configuration entities
 */

import { useEffect, useState } from 'react';
import {
    Settings,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Tag,
    Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
    getHolidayTypes,
    createHolidayType,
    updateHolidayType,
    getHolidayGroups,
    createHolidayGroup,
    updateHolidayGroup,
    deleteHolidayType,
    deleteHolidayGroup
} from '@/services/holidayService';
import type {
    HolidayType,
    HolidayGroup
} from '@/types/holiday';
import { PageHeader } from '@/components/ui/page-header';

export function HolidayConfiguration() {
    const [activeTab, setActiveTab] = useState('types');

    // Data states
    const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([]);
    const [holidayGroups, setHolidayGroups] = useState<HolidayGroup[]>([]);

    // Dialog states
    const [saving, setSaving] = useState(false);

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isToggleOpen, setIsToggleOpen] = useState(false);

    // Editing states
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ item: any; type: string } | null>(null);
    const [toggleItem, setToggleItem] = useState<{ item: any; type: string } | null>(null);

    // Form data for holiday types and groups
    const HOLIDAY_TYPE_OPTIONS = [
        'General',
        'Optional',
        'National',
        'Public',
        'Other'
    ];
    const [typeForm, setTypeForm] = useState({ name: '', description: '' });
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });

    // Load all configuration data
    const loadAllData = async () => {
        try {
            const [holidayTypesData, groupsData] = await Promise.all([
                getHolidayTypes(),
                getHolidayGroups()
            ]);
            setHolidayTypes(holidayTypesData);
            setHolidayGroups(groupsData);
        } catch (err) {
            console.error('Failed to load configuration:', err);
            toast.error('Failed to load configuration data');
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleOpenForm = (entityType: string, item?: any) => {
        if (item) {
            // Edit mode
            setEditingItem(item);
            switch (entityType) {
                case 'types':
                    setTypeForm({ name: item.name, description: item.description || '' });
                    break;
                case 'groups':
                    setGroupForm({ name: item.name, description: item.description || '' });
                    break;
            }
        } else {
            // Add mode
            setEditingItem(null);
            setTypeForm({ name: '', description: '' });
            setGroupForm({ name: '', description: '' });
        }
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            switch (activeTab) {
                case 'types':
                    if (!typeForm.name.trim()) {
                        toast.error('Type name is required');
                        return;
                    }

                    if (editingItem) {
                        await updateHolidayType(editingItem._id, typeForm);
                        toast.success('Type updated successfully');
                    } else {
                        await createHolidayType(typeForm);
                        toast.success('Type created successfully');
                    }
                    loadAllData();
                    break;

                case 'groups':
                    if (!groupForm.name.trim()) {
                        toast.error('Group name is required');
                        return;
                    }

                    if (editingItem) {
                        await updateHolidayGroup(editingItem._id, groupForm);
                        toast.success('Group updated successfully');
                    } else {
                        await createHolidayGroup(groupForm);
                        toast.success('Group created successfully');
                    }
                    loadAllData();
                    break;
            }

            setIsFormOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error(`Failed to ${editingItem ? 'update' : 'create'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnable = (item: any, type: string) => {
        setToggleItem({ item, type });
        setIsToggleOpen(true);
    };

    const confirmToggle = async () => {
        if (!toggleItem) return;

        try {
            const newStatus = !toggleItem.item.isActive;

            switch (toggleItem.type) {
                case 'type':
                    await updateHolidayType(toggleItem.item._id, { isActive: newStatus } as any);
                    toast.success(`Type ${newStatus ? 'enabled' : 'disabled'}`);
                    loadAllData();
                    break;
                case 'group':
                    await updateHolidayGroup(toggleItem.item._id, { isActive: newStatus } as any);
                    toast.success(`Group ${newStatus ? 'enabled' : 'disabled'}`);
                    loadAllData();
                    break;
            }
            setIsToggleOpen(false);
            setToggleItem(null);
        } catch (error) {
            console.error('Failed to toggle status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = (item: any, type: string) => {
        setDeletingItem({ item, type });
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;

        try {
            switch (deletingItem.type) {
                case 'type':
                    await deleteHolidayType(deletingItem.item._id);
                    toast.success('Type deleted successfully');
                    loadAllData();
                    break;
                case 'group':
                    await deleteHolidayGroup(deletingItem.item._id);
                    toast.success('Group deleted successfully');
                    loadAllData();
                    break;
            }
            setIsDeleteOpen(false);
            setDeletingItem(null);
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to delete item');
        }
    };

    const renderFormContent = () => {
        switch (activeTab) {
            case 'types':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Holiday Type *</Label>
                            <Select
                                value={typeForm.name}
                                onValueChange={(v) => setTypeForm({ ...typeForm, name: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a holiday type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {HOLIDAY_TYPE_OPTIONS.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={typeForm.description}
                                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                placeholder="Brief description"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 'groups':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Group Name *</Label>
                            <Input
                                value={groupForm.name}
                                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                placeholder="e.g., Engineering Team"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={groupForm.description}
                                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                                placeholder="Brief description"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getDialogTitle = () => {
        switch (activeTab) {
            case 'types': return editingItem ? 'Edit Holiday Type' : 'Add Holiday Type';
            case 'groups': return editingItem ? 'Edit Holiday Group' : 'Add Holiday Group';
            default: return 'Add Item';
        }
    };

    return (
        <TooltipProvider>
            <div className="page-container">
                {/* Header */}
                <PageHeader
                    icon={Settings}
                    title="Holiday Configuration"
                    description="Manage holiday types and groups for your organization"
                />

                {/* Configuration Tabs */}
                <Card>
                    <CardContent className="pt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="types">
                                    <Tag className="h-4 w-4 mr-2" />
                                    Holiday Types
                                </TabsTrigger>
                                <TabsTrigger value="groups">
                                    <Users className="h-4 w-4 mr-2" />
                                    Groups
                                </TabsTrigger>
                            </TabsList>

                            {/* Holiday Types Tab */}
                            <TabsContent value="types" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Holiday Types ({holidayTypes.length})</h3>
                                    <Button onClick={() => handleOpenForm('types')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Type
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {holidayTypes.map((type) => (
                                            <TableRow key={type._id} className={!type.isActive ? 'opacity-50 bg-muted/30' : ''}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="outline">{type.name}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{type.description || '-'}</TableCell>
                                                <TableCell>{new Date(type.createdAt!).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={type.isActive ? 'default' : 'secondary'}>
                                                        {type.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleOpenForm('types', type)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit type</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center">
                                                                    <Switch
                                                                        checked={type.isActive}
                                                                        onCheckedChange={() => handleToggleEnable(type, 'type')}
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {type.isActive ? 'Disable' : 'Enable'} to hide from dropdowns
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(type, 'type')}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete type</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {holidayTypes.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    No holiday types found. Add your first type.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Holiday Groups Tab */}
                            <TabsContent value="groups" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Holiday Groups ({holidayGroups.length})</h3>
                                    <Button onClick={() => handleOpenForm('groups')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Group
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Employees</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {holidayGroups.map((group) => (
                                            <TableRow key={group._id} className={!group.isActive ? 'opacity-50 bg-muted/30' : ''}>
                                                <TableCell className="font-medium">{group.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{group.description || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{group.employeeIds?.length || 0} employees</Badge>
                                                </TableCell>
                                                <TableCell>{new Date(group.createdAt!).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={group.isActive ? 'default' : 'secondary'}>
                                                        {group.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleOpenForm('groups', group)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit group</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center">
                                                                    <Switch
                                                                        checked={group.isActive}
                                                                        onCheckedChange={() => handleToggleEnable(group, 'group')}
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {group.isActive ? 'Disable' : 'Enable'} to hide from dropdowns
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(group, 'group')}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete group</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {holidayGroups.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    No groups found. Add your first group.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card >

                {/* Add/Edit Sheet */}
                <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {activeTab === 'types' ? <Tag className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                                {getDialogTitle()}
                            </SheetTitle>
                            <SheetCloseButton />
                        </SheetHeader>

                        <SheetBody>
                            {renderFormContent()}
                        </SheetBody>

                        <SheetFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this {deletingItem?.type}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setIsDeleteOpen(false);
                                setDeletingItem(null);
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Toggle Enable/Disable Confirmation Dialog */}
                <AlertDialog open={isToggleOpen} onOpenChange={setIsToggleOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm {toggleItem?.item.isActive ? 'Disable' : 'Enable'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to {toggleItem?.item.isActive ? 'disable' : 'enable'} this {toggleItem?.type}?
                                {toggleItem?.item.isActive && ' It will be hidden from dropdowns.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setIsToggleOpen(false);
                                setToggleItem(null);
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={confirmToggle}>
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div >
        </TooltipProvider >
    );
}

export default HolidayConfiguration;
