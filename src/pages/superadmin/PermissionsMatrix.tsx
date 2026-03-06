import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetBody,
    SheetCloseButton,
} from '@/components/ui/sheet';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
    Search,
    Shield,
    Edit2,
    Save,
    X,
    Users,
    ChevronRight,
    UserCheck,
    UserX,
    Settings,
    Eye,
    Plus,
    Lock,
    LockOpen,
    Building2,
    CheckSquare,
    XSquare
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

// Module definitions with enabled/disabled status
// Note: HIRING and FINANCE are not yet in the DB schema — kept as disabled placeholders.
const MODULE_DEFINITIONS = [
    { name: 'Employee', key: 'EMPLOYEE', enabled: true, icon: '👤', color: 'bg-blue-100 dark:bg-blue-900 border-blue-300' },
    { name: 'RMG', key: 'RMG', enabled: true, icon: '📊', color: 'bg-purple-100 dark:bg-purple-900 border-purple-300', description: 'Resource Management Group' },
    { name: 'Helpdesk', key: 'HELPDESK', enabled: true, icon: '🎫', color: 'bg-orange-100 dark:bg-orange-900 border-orange-300', description: 'IT, Facilities & Finance Support' },
    { name: 'Leave Management', key: 'LEAVE', enabled: true, icon: '🏖️', color: 'bg-pink-100 dark:bg-pink-900 border-pink-300' },
    { name: 'HR', key: 'HR', enabled: true, icon: '🏢', color: 'bg-teal-100 dark:bg-teal-900 border-teal-300', description: 'HR Administration' },
    { name: 'Hiring', key: 'HIRING', enabled: false, icon: '👥', color: 'bg-cyan-100 dark:bg-cyan-900 border-cyan-300', description: 'Coming soon' },
    { name: 'Finance', key: 'FINANCE', enabled: false, icon: '💰', color: 'bg-green-100 dark:bg-green-900 border-green-300', description: 'Coming soon' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
}

interface EmployeePermission {
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    enabled: boolean;
    isAdmin: boolean;
    permissions: {
        view: boolean;
        add: boolean;
        modify: boolean;
    };
}

interface ModuleSummary {
    module: string;
    totalEnabled: number;
    totalAdmins: number;
    users: EmployeePermission[];
}

export default function PermissionsMatrix() {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState<typeof MODULE_DEFINITIONS[0] | null>(null);
    const [moduleUsers, setModuleUsers] = useState<EmployeePermission[]>([]);
    const [originalModuleUsers, setOriginalModuleUsers] = useState<EmployeePermission[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState('');
    const [moduleSummaries, setModuleSummaries] = useState<Record<string, { enabled: number; admins: number }>>({});
    const [activeTab, setActiveTab] = useState<'all' | 'department'>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

    // Load all employees from the directory
    const loadAllEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                toast.error('No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/employees`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                toast.error('Session expired. Please log in again.');
                // Could redirect to login here if needed
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setAllEmployees(data.data || []);
                await loadModuleSummaries();
            } else {
                toast.error(data.message || 'Failed to load employees');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    // Load summaries for all modules
    const loadModuleSummaries = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                console.warn('No token available for loading module summaries');
                return;
            }

            const response = await fetch(
                `${API_URL}/superadmin/permissions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Handle auth errors silently for summaries (not critical)
            if (response.status === 401 || response.status === 403) {
                console.warn('Authentication failed while loading module summaries');
                return;
            }

            const data = await response.json();
            if (data.success) {
                const summaries: Record<string, { enabled: number; admins: number }> = {};

                MODULE_DEFINITIONS.forEach(mod => {
                    summaries[mod.key] = { enabled: 0, admins: 0 };
                });

                data.data.forEach((permission: any) => {
                    const moduleKey = permission.module;
                    if (summaries[moduleKey]) {
                        if (permission.enabled) summaries[moduleKey].enabled++;
                        if (permission.isAdmin) summaries[moduleKey].admins++;
                    }
                });

                setModuleSummaries(summaries);
            }
        } catch (error) {
            console.error('Error loading module summaries:', error);
            // Don't show toast error for summaries - it's not critical
        }
    };

    useEffect(() => {
        loadAllEmployees();
    }, []);

    const handleViewModule = async (module: typeof MODULE_DEFINITIONS[0]) => {
        if (!module.enabled) {
            toast.error('This module is currently disabled');
            return;
        }

        setSelectedModule(module);
        setDrawerOpen(true);
        setSearchFilter('');
        setActiveTab('all');
        setSelectedDepartment('all');
        setEditingUser(null);

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                toast.error('No authentication token found. Please log in again.');
                setDrawerOpen(false);
                return;
            }

            // Get permissions for this module
            const permResponse = await fetch(
                `${API_URL}/superadmin/permissions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (permResponse.status === 401 || permResponse.status === 403) {
                toast.error('Session expired. Please log in again.');
                setDrawerOpen(false);
                return;
            }

            const permData = await permResponse.json();

            // Create a map of employee permissions for this module
            const permissionsMap = new Map<string, any>();
            if (permData.success) {
                console.log('Permissions data:', permData.data);
                permData.data
                    .filter((p: any) => p.module === module.key)
                    .forEach((p: any) => {
                        // employeeId is now a direct string in the response
                        const empId = p.employeeId;
                        console.log(`Permission for ${empId}:`, { enabled: p.enabled, module: p.module });
                        permissionsMap.set(empId, p);
                    });
            }

            console.log('Permissions map:', Array.from(permissionsMap.entries()));

            // Merge all employees with their permissions
            const employeePermissions: EmployeePermission[] = allEmployees.map(emp => {
                const existingPerm = permissionsMap.get(emp.employeeId);
                const userPerm = {
                    employeeId: emp.employeeId,
                    name: emp.name,
                    email: emp.email,
                    department: emp.department,
                    designation: emp.designation,
                    enabled: existingPerm ? existingPerm.enabled : false,
                    isAdmin: existingPerm ? existingPerm.isAdmin : false,
                    permissions: existingPerm ? existingPerm.permissions : {
                        view: false,
                        add: false,
                        modify: false,
                    },
                };
                if (existingPerm) {
                    console.log(`Employee ${emp.employeeId} (${emp.name}): enabled=${userPerm.enabled}`);
                }
                return userPerm;
            });

            // Deduplicate by employeeId (keep the first occurrence)
            const uniqueEmployeePermissions = Array.from(
                new Map(employeePermissions.map(emp => [emp.employeeId, emp])).values()
            );

            if (employeePermissions.length !== uniqueEmployeePermissions.length) {
                console.warn(`Removed ${employeePermissions.length - uniqueEmployeePermissions.length} duplicate employee entries`);
            }

            setModuleUsers(uniqueEmployeePermissions);
            setOriginalModuleUsers(JSON.parse(JSON.stringify(uniqueEmployeePermissions)));
        } catch (error) {
            console.error('Error loading module users:', error);
            toast.error('Failed to load module users');
        }
    };

    const handleTogglePermission = (employeeId: string, field: string, value: boolean) => {
        setModuleUsers(prev =>
            prev.map(user => {
                if (user.employeeId === employeeId) {
                    if (field === 'isAdmin') {
                        // When admin is toggled on, automatically enable the module
                        // and grant all sub-permissions
                        return {
                            ...user,
                            isAdmin: value,
                            enabled: value ? true : user.enabled, // enabling admin also enables the module
                            permissions: {
                                view: value ? true : user.permissions.view,
                                add: value ? true : user.permissions.add,
                                modify: value ? true : user.permissions.modify,
                            }
                        };
                    } else if (field === 'enabled') {
                        return { ...user, enabled: value };
                    } else {
                        return {
                            ...user,
                            permissions: { ...user.permissions, [field]: value }
                        };
                    }
                }
                return user;
            })
        );
    };

    const handleSaveUserPermission = async (employeeId: string) => {
        const user = moduleUsers.find(u => u.employeeId === employeeId);
        if (!user || !selectedModule) return;

        // Check original state before changes
        const originalUser = originalModuleUsers.find(u => u.employeeId === employeeId);
        const wasEnabled = originalUser?.enabled || false;
        const isNowEnabled = user.enabled;

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                toast.error('No authentication token found. Please log in again.');
                return;
            }

            console.log('Saving permission for:', user.employeeId, 'Module:', selectedModule.key);

            const response = await fetch(
                `${API_URL}/superadmin/permissions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        employeeId: user.employeeId,
                        module: selectedModule.key,
                        enabled: user.enabled,
                        isAdmin: user.isAdmin,
                        permissions: user.permissions
                    }),
                }
            );

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                console.error('Permission update failed:', errorData);
                throw new Error(errorData.message || `Failed to update: ${response.status}`);
            }

            if (errorData.success) {
                toast.success('Permission updated successfully');

                // Create notification if module is being newly enabled
                if (!wasEnabled && isNowEnabled) {
                    try {
                        await fetch(`${API_URL}/superadmin/notifications`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                employeeId: user.employeeId,
                                module: selectedModule.key,
                                moduleName: selectedModule.name,
                                message: `The ${selectedModule.name} module has been enabled for you. You can now access it from your dashboard.`,
                            }),
                        });
                    } catch (notifError) {
                        console.warn('Failed to create notification:', notifError);
                        // Don't fail the whole operation if notification fails
                    }
                }

                setEditingUser(null);
                // Update original state
                const updatedOriginal = originalModuleUsers.map(u =>
                    u.employeeId === employeeId ? { ...user } : u
                );
                setOriginalModuleUsers(updatedOriginal);
                await loadModuleSummaries();
            } else {
                toast.error(errorData.message || 'Failed to update permission');
            }
        } catch (error) {
            console.error('Error saving permission:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save permission';
            toast.error(errorMessage);
        }
    };

    const handleCancelEdit = (employeeId: string) => {
        // Reset the user to original state
        const original = originalModuleUsers.find(u => u.employeeId === employeeId);
        if (original) {
            setModuleUsers(prev =>
                prev.map(u => u.employeeId === employeeId ? { ...original } : u)
            );
        }
        setEditingUser(null);
    };

    // Get unique departments
    const departments = Array.from(new Set(allEmployees.map(emp => emp.department).filter(Boolean)));

    const filteredUsers = moduleUsers.filter(user => {
        if (!searchFilter && (activeTab === 'all' || selectedDepartment === 'all')) return true;

        const search = searchFilter.toLowerCase();
        const matchesSearch = !searchFilter || (
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.employeeId.toLowerCase().includes(search)
        );

        const matchesDepartment = activeTab === 'all' ||
            selectedDepartment === 'all' ||
            user.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                icon={Shield}
                title="Module Permissions"
                description="View and manage module access permissions across all employees"
            />

            {/* Module Cards */}
            {loading ? (
                <div className="text-center py-12">Loading employees and permissions...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MODULE_DEFINITIONS.map(module => {
                        const summary = moduleSummaries[module.key] || { enabled: 0, admins: 0 };
                        return (
                            <Card
                                key={module.key}
                                className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${module.color} ${!module.enabled ? 'opacity-60' : ''}`}
                                onClick={() => module.enabled && handleViewModule(module)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{module.icon}</span>
                                            <span>{module.name}</span>
                                        </div>
                                        {module.enabled ? (
                                            <LockOpen className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        )}
                                    </CardTitle>
                                    {module.description && (
                                        <CardDescription className="text-xs">
                                            {module.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {module.enabled ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                    Enabled Users
                                                </span>
                                                <Badge variant="secondary">{summary.enabled}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    Module Admins
                                                </span>
                                                <Badge variant="secondary">{summary.admins}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4" />
                                                    Total Employees
                                                </span>
                                                <Badge>{allEmployees.length}</Badge>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewModule(module);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Manage Access
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Badge variant="secondary" className="gap-2">
                                                <Lock className="h-3 w-3" />
                                                Module Disabled
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Module Users Drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-6xl p-0">
                    {/* Fixed Header */}
                    <SheetHeader>
                        <div className="flex-1">
                            <SheetTitle className="flex items-center gap-2">
                                <span className="text-2xl">{selectedModule?.icon}</span>
                                <div>
                                    <div>{selectedModule?.name} Module - Access Control</div>
                                    {selectedModule?.description && (
                                        <div className="text-sm font-normal text-muted-foreground">{selectedModule.description}</div>
                                    )}
                                </div>
                            </SheetTitle>
                            <SheetDescription>
                                Manage employee access permissions for this module
                            </SheetDescription>
                        </div>
                        <SheetCloseButton />
                    </SheetHeader>

                    {/* Scrollable Body */}
                    <SheetBody className="p-6">
                        <div className="space-y-4">
                        {/* Tabs for All vs Department View */}
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'department')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    All Employees
                                </TabsTrigger>
                                <TabsTrigger value="department" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    By Department
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4 mt-4">
                                {/* Search Filter and Bulk Actions */}
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search employees by name, email, or ID..."
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Badge variant="outline" className="px-3 py-2">
                                        {filteredUsers.filter(u => u.enabled).length} / {filteredUsers.length} Enabled
                                    </Badge>
                                </div>

                                            {/* Users Table */}
                                <div className="border rounded-lg">
                                    {filteredUsers.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {searchFilter ? 'No employees match your search' : 'No employees found'}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10">
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Employee</TableHead>
                                                    <TableHead className="w-[120px] text-center">Admin</TableHead>
                                                    <TableHead className="w-[100px] text-center">View</TableHead>
                                                    <TableHead className="w-[100px] text-center">Add</TableHead>
                                                    <TableHead className="w-[100px] text-center">Modify</TableHead>
                                                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.map(user => {
                                                    const isEditing = editingUser === user.employeeId;
                                                    return (
                                                        <TableRow key={user.employeeId} className={user.enabled ? 'bg-green-50/50 dark:bg-green-950/20' : ''}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        {user.name}
                                                                        {user.enabled && <Badge variant="outline" className="text-xs">Active</Badge>}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {user.employeeId} • {user.designation} • {user.department}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Switch
                                                                    checked={user.isAdmin}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'isAdmin', checked)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.view}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'view', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.add}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'add', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.modify}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'modify', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {isEditing ? (
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleSaveUserPermission(user.employeeId)}
                                                                        >
                                                                            <Save className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleCancelEdit(user.employeeId)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setEditingUser(user.employeeId)}
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="department" className="space-y-4 mt-4">
                                {/* Department Selector and Bulk Actions */}
                                <div className="flex items-center gap-2">{/* ... department filters ... */}
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search employees..."
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Badge variant="outline" className="px-3 py-2">
                                        {filteredUsers.filter(u => u.enabled).length} / {filteredUsers.length} Enabled
                                    </Badge>
                                </div>

                                {/* Users Table (same as All tab) */}
                                <div className="border rounded-lg">
                                    {filteredUsers.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {searchFilter ? 'No employees match your search' : selectedDepartment === 'all' ? 'Select a department' : 'No employees found in this department'}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10">
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Employee</TableHead>
                                                    <TableHead className="w-[120px] text-center">Admin</TableHead>
                                                    <TableHead className="w-[100px] text-center">View</TableHead>
                                                    <TableHead className="w-[100px] text-center">Add</TableHead>
                                                    <TableHead className="w-[100px] text-center">Modify</TableHead>
                                                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.map(user => {
                                                    const isEditing = editingUser === user.employeeId;
                                                    return (
                                                        <TableRow key={user.employeeId} className={user.enabled ? 'bg-green-50/50 dark:bg-green-950/20' : ''}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        {user.name}
                                                                        {user.enabled && <Badge variant="outline" className="text-xs">Active</Badge>}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {user.employeeId} • {user.designation} • {user.department}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Switch
                                                                    checked={user.isAdmin}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'isAdmin', checked)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.view}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'view', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.add}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'add', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />\n                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Checkbox
                                                                    checked={user.permissions.modify}
                                                                    onCheckedChange={(checked) =>
                                                                        handleTogglePermission(user.employeeId, 'modify', checked as boolean)
                                                                    }
                                                                    disabled={!isEditing}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {isEditing ? (
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleSaveUserPermission(user.employeeId)}
                                                                        >
                                                                            <Save className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleCancelEdit(user.employeeId)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setEditingUser(user.employeeId)}
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                        </div>
                    </SheetBody>

                    {/* Fixed Footer */}
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                            Close
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

