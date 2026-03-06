import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetBody,
    SheetCloseButton
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Monitor,
    Building2,
    Wallet,
    Settings2,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Search,
    UserCircle2,
    X,
    AlertTriangle,
    ShieldCheck,
    Layers,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    GitBranch,
    ChevronRight,
    ChevronDown,
    FolderOpen,
    ArrowRight,
    Headset
} from 'lucide-react';
import type {
    SubCategoryConfig,
    ApproverInfo,
    EmployeeSearchResult,
    HighLevelCategory
} from '@/types/superAdmin';
import { searchEmployees } from '@/services/superAdminService';

const FIXED_TABS = ['IT Support', 'Facilities', 'Finance'] as const;
type TabType = typeof FIXED_TABS[number];

const getTabIcon = (tab: TabType) => {
    switch (tab) {
        case 'IT Support': return <Monitor className="h-4 w-4" />;
        case 'Facilities': return <Building2 className="h-4 w-4" />;
        case 'Finance': return <Wallet className="h-4 w-4" />;
    }
};

export default function HelpdeskConfigPage() {
    const [activeTab, setActiveTab] = useState<TabType>('IT Support');
    const [categories, setCategories] = useState<SubCategoryConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [isApprovalSheetOpen, setIsApprovalSheetOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SubCategoryConfig | null>(null);
    const [saving, setSaving] = useState(false);

    // Sorting and pagination state
    const [sortField, setSortField] = useState<string>('category');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Expanded categories state
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Employee search state for approval configuration
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [searchResults, setSearchResults] = useState<EmployeeSearchResult[]>([]);
    const [searchingEmployees, setSearchingEmployees] = useState(false);
    const [activeLevel, setActiveLevel] = useState<'l1' | 'l2' | 'l3' | null>(null);

    // Approval config state
    const [tempApprovalConfig, setTempApprovalConfig] = useState<{
        l1: { enabled: boolean; approvers: ApproverInfo[] };
        l2: { enabled: boolean; approvers: ApproverInfo[] };
        l3: { enabled: boolean; approvers: ApproverInfo[] };
    }>({
        l1: { enabled: false, approvers: [] },
        l2: { enabled: false, approvers: [] },
        l3: { enabled: false, approvers: [] }
    });

    // Load categories
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch('http://localhost:5000/api/superadmin/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Search employees
    useEffect(() => {
        const search = async () => {
            if (employeeSearch.length < 1) {
                setSearchResults([]);
                return;
            }
            try {
                setSearchingEmployees(true);
                const results = await searchEmployees(employeeSearch);
                setSearchResults(results);
            } catch (err) {
                console.error('Error searching employees:', err);
            } finally {
                setSearchingEmployees(false);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [employeeSearch]);

    // Filter categories by active tab
    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.highLevelCategory === activeTab);
    }, [categories, activeTab]);

    // Group categories by category name
    const groupedCategories = useMemo(() => {
        const grouped: Record<string, SubCategoryConfig[]> = {};
        filteredCategories.forEach(cat => {
            const key = cat.category;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(cat);
        });
        return grouped;
    }, [filteredCategories]);

    // Toggle category expansion
    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    // Calculate dashboard stats
    const stats = useMemo(() => {
        const total = categories.length;
        const byConfigItem = {
            'IT Support': categories.filter(c => c.highLevelCategory === 'IT Support').length,
            'Facilities': categories.filter(c => c.highLevelCategory === 'Facilities').length,
            'Finance': categories.filter(c => c.highLevelCategory === 'Finance').length
        };
        const withApproval = categories.filter(c => c.requiresApproval).length;
        const active = categories.filter(c => c.isActive).length;

        return { total, byConfigItem, withApproval, active };
    }, [categories]);

    // Sorting logic
    const sortedCategories = useMemo(() => {
        const sorted = [...filteredCategories].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortField) {
                case 'category':
                    aVal = a.category?.toLowerCase() || '';
                    bVal = b.category?.toLowerCase() || '';
                    break;
                case 'subCategory':
                    aVal = a.subCategory?.toLowerCase() || '';
                    bVal = b.subCategory?.toLowerCase() || '';
                    break;
                case 'approvalFlow':
                    aVal = a.requiresApproval ? 1 : 0;
                    bVal = b.requiresApproval ? 1 : 0;
                    break;
                case 'status':
                    aVal = a.isActive ? 1 : 0;
                    bVal = b.isActive ? 1 : 0;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredCategories, sortField, sortDirection]);

    // Pagination logic - paginate grouped categories
    const paginatedGroupedCategories = useMemo(() => {
        const categoryNames = Object.keys(groupedCategories);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedNames = categoryNames.slice(startIndex, endIndex);

        const paginatedGroups: Record<string, SubCategoryConfig[]> = {};
        paginatedNames.forEach(name => {
            paginatedGroups[name] = groupedCategories[name];
        });
        return paginatedGroups;
    }, [groupedCategories, currentPage]);

    const totalPages = Math.ceil(Object.keys(groupedCategories).length / itemsPerPage);

    // Reset to page 1 when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get approval flow label
    const getApprovalFlowLabel = (category: SubCategoryConfig) => {
        const config = category.approvalConfig;
        if (!config || !category.requiresApproval) return 'No Approval';

        const levels: string[] = [];
        if (config.l1?.enabled) levels.push('L1');
        if (config.l2?.enabled) levels.push('L2');
        if (config.l3?.enabled) levels.push('L3');

        return levels.length > 0 ? levels.join(' → ') : 'Not Configured';
    };

    // Get approval flow count for display
    const getApprovalFlowCount = (category: SubCategoryConfig) => {
        const config = category.approvalConfig;
        if (!config || !category.requiresApproval) return 0;

        let count = 0;
        if (config.l1?.enabled) count++;
        if (config.l2?.enabled) count++;
        if (config.l3?.enabled) count++;

        return count;
    };

    // Configure approval flow
    const handleConfigureApproval = (category: SubCategoryConfig) => {
        setEditingCategory(category);
        setTempApprovalConfig({
            l1: category.approvalConfig?.l1 || { enabled: false, approvers: [] },
            l2: category.approvalConfig?.l2 || { enabled: false, approvers: [] },
            l3: category.approvalConfig?.l3 || { enabled: false, approvers: [] }
        });
        setIsApprovalSheetOpen(true);
    };

    // Add approver to level
    const handleAddApprover = (level: 'l1' | 'l2' | 'l3', employee: EmployeeSearchResult) => {
        const approvers = tempApprovalConfig[level].approvers;
        if (approvers.some(a => a.employeeId === employee.employeeId)) {
            toast.error('This employee is already added as an approver');
            return;
        }

        setTempApprovalConfig({
            ...tempApprovalConfig,
            [level]: {
                ...tempApprovalConfig[level],
                approvers: [
                    ...approvers,
                    {
                        employeeId: employee.employeeId,
                        name: employee.name,
                        email: employee.email,
                        designation: employee.designation || ''
                    }
                ]
            }
        });
        setEmployeeSearch('');
        setSearchResults([]);
        setActiveLevel(null);
    };

    // Remove approver from level
    const handleRemoveApprover = (level: 'l1' | 'l2' | 'l3', employeeId: string) => {
        setTempApprovalConfig({
            ...tempApprovalConfig,
            [level]: {
                ...tempApprovalConfig[level],
                approvers: tempApprovalConfig[level].approvers.filter(a => a.employeeId !== employeeId)
            }
        });
    };

    // Toggle level
    const handleToggleLevel = (level: 'l1' | 'l2' | 'l3', enabled: boolean) => {
        setTempApprovalConfig({
            ...tempApprovalConfig,
            [level]: {
                ...tempApprovalConfig[level],
                enabled
            }
        });
    };

    // Save approval config
    const handleSaveApproval = async () => {
        if (!editingCategory) return;

        try {
            setSaving(true);
            const token = localStorage.getItem('auth-token');
            const hasAnyApproval = tempApprovalConfig.l1.enabled || tempApprovalConfig.l2.enabled || tempApprovalConfig.l3.enabled;

            const response = await fetch(`http://localhost:5000/api/superadmin/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...editingCategory,
                    requiresApproval: hasAnyApproval,
                    approvalConfig: tempApprovalConfig
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Approval workflow saved successfully');
                setIsApprovalSheetOpen(false);
                loadCategories();
            } else {
                toast.error(data.message || 'Failed to save approval workflow');
            }
        } catch (error) {
            console.error('Error saving approval:', error);
            toast.error('Failed to save approval workflow');
        } finally {
            setSaving(false);
        }
    };

    // Toggle category status
    const handleToggleStatus = async (category: SubCategoryConfig) => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`http://localhost:5000/api/superadmin/categories/${category.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...category,
                    isActive: !category.isActive
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`);
                loadCategories();
            } else {
                toast.error(data.message || 'Failed to update category status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update category status');
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Headset className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Helpdesk Configuration</h1>
                            <p className="text-muted-foreground">Configure approval workflows for helpdesk categories</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">With Approval Flow</CardTitle>
                            <GitBranch className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.withApproval}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">By Config Item</CardTitle>
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">IT Support</span>
                                    <span className="font-medium">{stats.byConfigItem['IT Support']}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Facilities</span>
                                    <span className="font-medium">{stats.byConfigItem['Facilities']}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Finance</span>
                                    <span className="font-medium">{stats.byConfigItem['Finance']}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
                    <TabsList className="bg-background border border-border">
                        {FIXED_TABS.map(tab => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                {getTabIcon(tab)}
                                <span className="ml-2">{tab}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Tab Content */}
                    {FIXED_TABS.map(tab => (
                        <TabsContent key={tab} value={tab} className="mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    ) : Object.keys(paginatedGroupedCategories).length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No categories found for {tab}.
                                        </div>
                                    ) : (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[60px]"></TableHead>
                                                        <TableHead className="w-[25%]">Category Name</TableHead>
                                                        <TableHead className="w-[25%]">No.of Sub-Categories</TableHead>
                                                        <TableHead className="w-[25%]">Approval Flow</TableHead>
                                                        <TableHead className="w-[25%]">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(paginatedGroupedCategories).map(([categoryName, subCategories]) => {
                                                        const isExpanded = expandedCategories.has(categoryName);
                                                        const activeCount = subCategories.filter(c => c.isActive).length;
                                                        const withApprovalCount = subCategories.filter(c => c.requiresApproval).length;

                                                        return (
                                                            <React.Fragment key={categoryName}>
                                                                {/* Category Row */}
                                                                <TableRow
                                                                    className="group bg-muted/30 hover:bg-muted/50 cursor-pointer font-medium"
                                                                    onClick={() => toggleCategory(categoryName)}
                                                                >
                                                                    <TableCell>
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                            {isExpanded ? (
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            ) : (
                                                                                <ChevronRight className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </TableCell>
                                                                    <TableCell className="font-semibold">
                                                                        <div className="flex items-center gap-2">
                                                                            <FolderOpen className="h-4 w-4" />
                                                                            {categoryName}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary">
                                                                            {subCategories.length} item{subCategories.length !== 1 ? 's' : ''}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {withApprovalCount} with approval
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {activeCount} of {subCategories.length} active
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>

                                                                {/* Sub-Category Rows */}
                                                                {isExpanded && subCategories.map((category) => (
                                                                    <TableRow key={category.id} className="group bg-background">
                                                                        <TableCell></TableCell>
                                                                        <TableCell className="pl-12">
                                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                                <ArrowRight className="h-3 w-3" />
                                                                                {category.subCategory || '-'}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell></TableCell>
                                                                        <TableCell>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="flex items-center gap-2 cursor-help">
                                                                                        {category.requiresApproval ? (
                                                                                            <>
                                                                                                <Badge variant="outline" className="text-xs">
                                                                                                    {getApprovalFlowLabel(category)}
                                                                                                </Badge>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                    ({getApprovalFlowCount(category)} {getApprovalFlowCount(category) === 1 ? 'level' : 'levels'})
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Badge variant="secondary" className="text-xs">
                                                                                                No Approval
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="max-w-xs">
                                                                                    <div className="space-y-2">
                                                                                        {!category.requiresApproval ? (
                                                                                            <p className="text-xs">Only IT Manager approval required</p>
                                                                                        ) : (
                                                                                            <>
                                                                                                {category.approvalConfig?.l1?.enabled && (
                                                                                                    <div>
                                                                                                        <p className="text-xs font-semibold mb-1">L1 Approval:</p>
                                                                                                        {category.approvalConfig.l1.approvers.length > 0 ? (
                                                                                                            <ul className="text-xs space-y-0.5">
                                                                                                                {category.approvalConfig.l1.approvers.map(a => (
                                                                                                                    <li key={a.employeeId}>• {a.name} ({a.email})</li>
                                                                                                                ))}
                                                                                                            </ul>
                                                                                                        ) : (
                                                                                                            <p className="text-xs text-muted-foreground italic">No approvers assigned</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                {category.approvalConfig?.l2?.enabled && (
                                                                                                    <div>
                                                                                                        <p className="text-xs font-semibold mb-1">L2 Approval:</p>
                                                                                                        {category.approvalConfig.l2.approvers.length > 0 ? (
                                                                                                            <ul className="text-xs space-y-0.5">
                                                                                                                {category.approvalConfig.l2.approvers.map(a => (
                                                                                                                    <li key={a.employeeId}>• {a.name} ({a.email})</li>
                                                                                                                ))}
                                                                                                            </ul>
                                                                                                        ) : (
                                                                                                            <p className="text-xs text-muted-foreground italic">No approvers assigned</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                {category.approvalConfig?.l3?.enabled && (
                                                                                                    <div>
                                                                                                        <p className="text-xs font-semibold mb-1">L3 Approval:</p>
                                                                                                        {category.approvalConfig.l3.approvers.length > 0 ? (
                                                                                                            <ul className="text-xs space-y-0.5">
                                                                                                                {category.approvalConfig.l3.approvers.map(a => (
                                                                                                                    <li key={a.employeeId}>• {a.name} ({a.email})</li>
                                                                                                                ))}
                                                                                                            </ul>
                                                                                                        ) : (
                                                                                                            <p className="text-xs text-muted-foreground italic">No approvers assigned</p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-2">
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Badge
                                                                                            variant={category.isActive ? 'default' : 'secondary'}
                                                                                            className={`cursor-pointer ${category.isActive ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                                                                            onClick={() => handleToggleStatus(category)}
                                                                                        >
                                                                                            {category.isActive ? 'Active' : 'Inactive'}
                                                                                        </Badge>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        Click to {category.isActive ? 'deactivate' : 'activate'}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() => handleConfigureApproval(category)}
                                                                                            >
                                                                                                <Settings2 className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>Configure Approval Flow</TooltipContent>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                                        {Math.min(currentPage * itemsPerPage, Object.keys(groupedCategories).length)} of{' '}
                                                        {Object.keys(groupedCategories).length} categories
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                                        {Math.min(currentPage * itemsPerPage, sortedCategories.length)} of {sortedCategories.length} categories
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Approval Configuration Sheet */}
                <Sheet open={isApprovalSheetOpen} onOpenChange={setIsApprovalSheetOpen}>
                    <SheetContent className="w-full sm:max-w-[50vw] flex flex-col p-0">
                        <SheetHeader>
                            <div className="flex-1">
                                <SheetTitle>Configure Approval Flow</SheetTitle>
                                <SheetDescription>
                                    {editingCategory && (
                                        <span>
                                            {editingCategory.category} → {editingCategory.subCategory}
                                        </span>
                                    )}
                                </SheetDescription>
                            </div>
                            <SheetCloseButton />
                        </SheetHeader>

                        <SheetBody className="p-6">
                        <div className="space-y-6">
                            {/* L1 Approval Level */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                            L1
                                        </div>
                                        <Label className="text-sm font-semibold">L1 Approval</Label>
                                    </div>
                                    <Switch
                                        checked={tempApprovalConfig.l1.enabled}
                                        onCheckedChange={(checked) => handleToggleLevel('l1', checked)}
                                    />
                                </div>

                                {tempApprovalConfig.l1.enabled && (
                                    <>
                                        {/* Employee Search for L1 */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search and add managers..."
                                                value={activeLevel === 'l1' ? employeeSearch : ''}
                                                onFocus={() => setActiveLevel('l1')}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                            {activeLevel === 'l1' && searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {searchResults.map(emp => (
                                                        <button
                                                            key={emp.employeeId}
                                                            className="w-full p-3 text-left hover:bg-muted flex items-center justify-between"
                                                            onClick={() => handleAddApprover('l1', emp)}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium">{emp.name}</div>
                                                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* L1 Approvers List */}
                                        <div className="space-y-2">
                                            {tempApprovalConfig.l1.approvers.map(approver => (
                                                <div key={approver.employeeId} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle2 className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <div className="text-sm font-medium">{approver.name}</div>
                                                            <div className="text-xs text-muted-foreground">{approver.email}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleRemoveApprover('l1', approver.employeeId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {tempApprovalConfig.l1.approvers.length === 0 && (
                                                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 rounded-lg">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    No managers assigned
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* L2 Approval Level */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">
                                            L2
                                        </div>
                                        <Label className="text-sm font-semibold">L2 Approval</Label>
                                    </div>
                                    <Switch
                                        checked={tempApprovalConfig.l2.enabled}
                                        onCheckedChange={(checked) => handleToggleLevel('l2', checked)}
                                    />
                                </div>

                                {tempApprovalConfig.l2.enabled && (
                                    <>
                                        {/* Employee Search for L2 */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search and add RMG personnel..."
                                                value={activeLevel === 'l2' ? employeeSearch : ''}
                                                onFocus={() => setActiveLevel('l2')}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                            {activeLevel === 'l2' && searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {searchResults.map(emp => (
                                                        <button
                                                            key={emp.employeeId}
                                                            className="w-full p-3 text-left hover:bg-muted flex items-center justify-between"
                                                            onClick={() => handleAddApprover('l2', emp)}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium">{emp.name}</div>
                                                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* L2 Approvers List */}
                                        <div className="space-y-2">
                                            {tempApprovalConfig.l2.approvers.map(approver => (
                                                <div key={approver.employeeId} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle2 className="h-4 w-4 text-yellow-600" />
                                                        <div>
                                                            <div className="text-sm font-medium">{approver.name}</div>
                                                            <div className="text-xs text-muted-foreground">{approver.email}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleRemoveApprover('l2', approver.employeeId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {tempApprovalConfig.l2.approvers.length === 0 && (
                                                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 rounded-lg">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    No RMG personnel assigned
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* L3 Approval Level */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                                            L3
                                        </div>
                                        <Label className="text-sm font-semibold">L3 Approval</Label>
                                    </div>
                                    <Switch
                                        checked={tempApprovalConfig.l3.enabled}
                                        onCheckedChange={(checked) => handleToggleLevel('l3', checked)}
                                    />
                                </div>

                                {tempApprovalConfig.l3.enabled && (
                                    <>
                                        {/* Employee Search for L3 */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search and add executives..."
                                                value={activeLevel === 'l3' ? employeeSearch : ''}
                                                onFocus={() => setActiveLevel('l3')}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                            {activeLevel === 'l3' && searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {searchResults.map(emp => (
                                                        <button
                                                            key={emp.employeeId}
                                                            className="w-full p-3 text-left hover:bg-muted flex items-center justify-between"
                                                            onClick={() => handleAddApprover('l3', emp)}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium">{emp.name}</div>
                                                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* L3 Approvers List */}
                                        <div className="space-y-2">
                                            {tempApprovalConfig.l3.approvers.map(approver => (
                                                <div key={approver.employeeId} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle2 className="h-4 w-4 text-red-600" />
                                                        <div>
                                                            <div className="text-sm font-medium">{approver.name}</div>
                                                            <div className="text-xs text-muted-foreground">{approver.email}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleRemoveApprover('l3', approver.employeeId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {tempApprovalConfig.l3.approvers.length === 0 && (
                                                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 rounded-lg">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    No executives assigned
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        </SheetBody>

                        <SheetFooter>
                            <Button variant="outline" onClick={() => setIsApprovalSheetOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveApproval} disabled={saving}>
                                {saving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Save Configuration
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </TooltipProvider>
    );
}
