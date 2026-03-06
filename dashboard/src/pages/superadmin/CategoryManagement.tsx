/**
 * Category Management Page
 * Manage helpdesk categories with approval flow configuration
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  X,
  Layers,
  Monitor,
  Building2,
  Wallet,
  ShieldCheck,
  ShieldOff,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
  Settings2,
  ArrowRight,
  Info,
  UserCircle2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderCog
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/services/superAdminService';
import type {
  SubCategoryConfig,
  CategoryFormData,
  HighLevelCategory
} from '@/types/superAdmin';

const HIGH_LEVEL_CATEGORIES: HighLevelCategory[] = ['Location', 'Department', 'Designation', 'IT Support', 'Finance', 'Facilities'];

const PROCESSING_QUEUES = ['IT Support', 'Facilities Team', 'Finance Team', 'HR Team', 'General'];
const SPECIALIST_QUEUES = ['Hardware Team', 'Software Team', 'Network Team', 'Facilities', 'Finance', 'General'];

const getApprovalFlowLabel = (config?: ApprovalConfig) => {
  if (!config) return 'Not Configured';
  const levels: string[] = [];
  // Check if level is enabled AND has approvers
  if (config.l1?.enabled && config.l1.approvers?.length > 0) levels.push('L1');
  if (config.l2?.enabled && config.l2.approvers?.length > 0) levels.push('L2');
  if (config.l3?.enabled && config.l3.approvers?.length > 0) levels.push('L3');
  return levels.length > 0 ? levels.join(' → ') : 'Not Configured';
};

const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'Location': return <Building2 className="h-4 w-4" />;
    case 'Department': return <Layers className="h-4 w-4" />;
    case 'Designation': return <UserCircle2 className="h-4 w-4" />;
    case 'IT Support': return <Monitor className="h-4 w-4" />;
    case 'Finance': return <Wallet className="h-4 w-4" />;
    case 'Facilities': return <Building2 className="h-4 w-4" />;
    default: return <FolderOpen className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Location': return 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
    case 'Department': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    case 'Designation': return 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
    case 'IT Support': return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary dark:border-primary/20';
    case 'Finance': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
    case 'Facilities': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
    default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

function StatsCard({ title, value, icon, description, colorClass = 'bg-primary/10 text-primary' }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loading Component
function CategoryTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-40 flex-1" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Visual Approval Flow Component
function ApprovalFlowIndicator({ config, requiresApproval }: { config?: ApprovalConfig; requiresApproval: boolean }) {
  if (!requiresApproval) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ShieldOff className="h-3 w-3" />
        No Approval
      </Badge>
    );
  }

  // Check both enabled AND has approvers for a level to be truly configured
  const levels = [
    { key: 'l1', label: 'L1', enabled: config?.l1?.enabled && (config?.l1?.approvers?.length ?? 0) > 0, color: 'bg-blue-500' },
    { key: 'l2', label: 'L2', enabled: config?.l2?.enabled && (config?.l2?.approvers?.length ?? 0) > 0, color: 'bg-yellow-500' },
    { key: 'l3', label: 'L3', enabled: config?.l3?.enabled && (config?.l3?.approvers?.length ?? 0) > 0, color: 'bg-red-500' }
  ];

  const enabledLevels = levels.filter(l => l.enabled);

  if (enabledLevels.length === 0) {
    return (
      <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
        <AlertCircle className="h-3 w-3" />
        Not Configured
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {levels.map((level, index) => (
              <div key={level.key} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${level.enabled
                    ? `${level.color} text-white`
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                    }`}
                >
                  {level.label}
                </div>
                {index < levels.length - 1 && (
                  <ChevronRight className={`h-3 w-3 mx-0.5 ${level.enabled ? 'text-muted-foreground' : 'text-gray-300 dark:text-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Approval Flow: {getApprovalFlowLabel(config)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Empty State Component
function EmptyState({ onAddCategory }: { onAddCategory: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <FolderPlus className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Categories help organize helpdesk requests. Create your first category to start configuring approval workflows.
      </p>
      <Button onClick={onAddCategory}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Category
      </Button>
    </div>
  );
}

// Queue suggestions based on category
const QUEUE_SUGGESTIONS: Record<string, { processing: string; specialist: string }> = {
  'Location': { processing: 'HR Team', specialist: 'General' },
  'Department': { processing: 'HR Team', specialist: 'General' },
  'Designation': { processing: 'HR Team', specialist: 'General' },
  'IT Support': { processing: 'IT Support', specialist: 'Hardware Team' },
  'Finance': { processing: 'Finance Team', specialist: 'Finance' },
  'Facilities': { processing: 'Facilities Team', specialist: 'Facilities' }
};

// Section Header Component
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}

function SectionHeader({ icon, title, description, badge }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {title}
            {badge}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<SubCategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Category dropdown filter for dashboard AND table filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sorting and pagination state
  const [sortField, setSortField] = useState<string>('category');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SubCategoryConfig | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<SubCategoryConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Form mode: 'category' or 'subcategory'
  const [formMode, setFormMode] = useState<'category' | 'subcategory'>('category');

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Simplified form state - just text fields
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('');

  // Group categories by category name
  const groupedCategories = useMemo(() => {
    const grouped: Record<string, SubCategoryConfig[]> = {};
    const filteredCategories = selectedCategory === 'all'
      ? categories
      : categories.filter(c => c.highLevelCategory === selectedCategory);

    filteredCategories.forEach(cat => {
      const key = cat.category;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(cat);
    });

    return grouped;
  }, [categories, selectedCategory]);

  // Get unique category names for sub-category dropdown
  const uniqueCategoryNames = useMemo(() => {
    const names = new Set<string>();
    categories.forEach(c => names.add(c.category));
    return Array.from(names).sort();
  }, [categories]);

  // Calculate stats - filter by selectedCategory if not 'all'
  const stats = useMemo(() => {
    const filteredCategories = selectedCategory === 'all'
      ? categories
      : categories.filter(c => c.highLevelCategory === selectedCategory);

    const total = Object.keys(groupedCategories).length; // Count unique categories
    // Only count actual subcategories (exclude category-only entries with empty subCategory)
    const actualSubCategoriesCount = filteredCategories.filter(c => c.subCategory && c.subCategory.trim() !== '');
    const totalSubCategories = actualSubCategoriesCount.length;
    const active = actualSubCategoriesCount.filter(c => c.isActive).length;
    const requiresApproval = actualSubCategoriesCount.filter(c => c.requiresApproval).length;

    return { total, totalSubCategories, active, requiresApproval };
  }, [categories, selectedCategory, groupedCategories]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories({
        highLevelCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        isActive: filterStatus !== 'all' ? filterStatus : undefined
      });
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, filterStatus]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sorting logic
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted and filtered categories
  const sortedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
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
  }, [categories, sortField, sortDirection]);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterStatus]);

  const handleOpenForm = (mode: 'category' | 'subcategory', category?: SubCategoryConfig) => {
    if (category) {
      // When editing, auto-detect mode based on whether it's a category-level item
      const isCategory = category.category === category.subCategory;
      const detectedMode = isCategory ? 'category' : 'subcategory';

      setFormMode(detectedMode);
      setEditingCategory(category);
      setCategoryName(category.category || '');
      setSubCategoryName(category.subCategory || '');
      setSelectedParentCategory(category.category || '');
    } else {
      // When creating new, use the provided mode
      setFormMode(mode);
      setEditingCategory(null);
      setCategoryName('');
      setSubCategoryName('');
      setSelectedParentCategory('');
    }
    setIsFormOpen(true);
  };

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

  const handleSave = async () => {
    // Validate that a config item is selected (not 'all') - only for NEW categories
    if (!editingCategory && selectedCategory === 'all') {
      toast.error('Please select a Config Item from the dropdown before adding');
      return;
    }

    // Validate required fields based on mode
    if (formMode === 'category' && !categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (formMode === 'subcategory') {
      if (!selectedParentCategory) {
        toast.error('Please select a parent category');
        return;
      }
      if (!subCategoryName.trim()) {
        toast.error('Sub-category name is required');
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare data based on form mode
      let finalCategoryName: string;
      let finalSubCategoryName: string;

      if (formMode === 'category') {
        // Creating a category - no subcategory by default
        finalCategoryName = categoryName.trim();
        finalSubCategoryName = ''; // Empty subcategory for category-only creation
      } else {
        // Creating a sub-category - use selected parent and new sub-category name
        finalCategoryName = selectedParentCategory;
        finalSubCategoryName = subCategoryName.trim();
      }

      const categoryData: CategoryFormData = {
        highLevelCategory: selectedCategory as HighLevelCategory,
        category: finalCategoryName,
        subCategory: finalSubCategoryName,
        requiresApproval: editingCategory?.requiresApproval ?? false,
        processingQueue: editingCategory?.processingQueue ?? (selectedCategory as string),
        specialistQueue: editingCategory?.specialistQueue ?? `${finalCategoryName} Team`,
        order: editingCategory?.order ?? 999,
        isActive: editingCategory?.isActive ?? true,
        approvalConfig: editingCategory?.approvalConfig ?? {
          l1: { enabled: false, approvers: [] },
          l2: { enabled: false, approvers: [] },
          l3: { enabled: false, approvers: [] }
        }
      };

      if (editingCategory) {
        // When editing, preserve the highLevelCategory
        await updateCategory(editingCategory.id, {
          ...categoryData,
          highLevelCategory: editingCategory.highLevelCategory,
          category: finalCategoryName,
          subCategory: finalSubCategoryName
        });
        toast.success('Updated successfully');
      } else {
        await createCategory(categoryData);
        toast.success(formMode === 'category' ? 'Category created successfully' : 'Sub-category created successfully');
      }
      setIsFormOpen(false);
      setCategoryName('');
      setSubCategoryName('');
      setSelectedParentCategory('');
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      // Extract detailed error message from backend response
      const errorMessage = err.response?.data?.message
        || err.response?.data?.error?.message
        || err.message
        || 'Failed to save category';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast.success('Category deleted successfully');
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };

  // Quick toggle active status
  const handleQuickToggleActive = async (category: SubCategoryConfig) => {
    try {
      // Pass all required fields to prevent backend validation errors
      await updateCategory(category.id, {
        highLevelCategory: category.highLevelCategory,
        category: category.category,
        subCategory: category.subCategory,
        requiresApproval: category.requiresApproval,
        processingQueue: category.processingQueue,
        specialistQueue: category.specialistQueue,
        order: category.order,
        isActive: !category.isActive,
        approvalConfig: category.approvalConfig
      });
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (err) {
      console.error('Error toggling category:', err);
      toast.error('Failed to update category status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderCog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Configure helpdesk categories and approval workflows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Config Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Config Items</SelectItem>
              {HIGH_LEVEL_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  <span className="flex items-center gap-2">
                    {getCategoryIcon(category)} {category}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={() => handleOpenForm('category')} disabled={selectedCategory === 'all'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category / Sub-Category
                  </Button>
                </span>
              </TooltipTrigger>
              {selectedCategory === 'all' && (
                <TooltipContent>
                  Select a Config Item first
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
            <CardTitle className="text-sm font-medium">Total Sub-Categories</CardTitle>
            <FolderPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSubCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Approval Flow</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.requiresApproval}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <CategoryTableSkeleton />
          ) : Object.keys(groupedCategories).length === 0 ? (
            <EmptyState onAddCategory={() => handleOpenForm('category')} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead className="w-[25%]">Category Name</TableHead>
                    <TableHead className="w-[25%]">Config Items</TableHead>
                    <TableHead className="w-[25%]">No.of Sub-Categories</TableHead>
                    <TableHead className="cursor-pointer w-[25%]" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(paginatedGroupedCategories).map(([categoryName, subCategories]) => {
                    const isExpanded = expandedCategories.has(categoryName);
                    const firstSubCategory = subCategories[0];
                    // Filter out entries with empty subcategory field (category-only entries)
                    const actualSubCategories = subCategories.filter(c => c.subCategory && c.subCategory.trim() !== '');
                    const activeCount = actualSubCategories.filter(c => c.isActive).length;

                    return (
                      <>
                        {/* Category Row */}
                        <TableRow
                          key={categoryName}
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
                            <Badge
                              variant="outline"
                              className={`gap-1.5 ${getCategoryColor(firstSubCategory.highLevelCategory)}`}
                            >
                              {getCategoryIcon(firstSubCategory.highLevelCategory)}
                              {firstSubCategory.highLevelCategory}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {actualSubCategories.length} item{actualSubCategories.length !== 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {activeCount} of {actualSubCategories.length} active
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {/* Sub-Category Rows (shown when expanded) */}
                        {isExpanded && actualSubCategories.map((subCategory) => (
                          <TableRow key={subCategory.id} className="group bg-background">
                            <TableCell></TableCell>
                            <TableCell className="pl-12">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ArrowRight className="h-3 w-3" />
                                {subCategory.subCategory}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`gap-1.5 ${getCategoryColor(subCategory.highLevelCategory)}`}
                              >
                                {getCategoryIcon(subCategory.highLevelCategory)}
                                {subCategory.highLevelCategory}
                              </Badge>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant={subCategory.isActive ? 'default' : 'secondary'}
                                        className={`cursor-pointer ${subCategory.isActive ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                        onClick={() => handleQuickToggleActive(subCategory)}
                                      >
                                        {subCategory.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Click to {subCategory.isActive ? 'deactivate' : 'activate'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleOpenForm('subcategory', subCategory)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit sub-category</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setDeletingCategory(subCategory);
                                            setIsDeleteOpen(true);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete sub-category</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table >

              {/* Pagination */}
              {
                totalPages > 1 && (
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
                )
              }
            </>
          )}
        </CardContent>
      </Card>

      {/* Simple Category Form Sheet */}
      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingCategory(null);
            setCategoryName('');
            setSubCategoryName('');
            setSelectedParentCategory('');
          }
        }
        }
      >
        <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {editingCategory ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingCategory
                ? `Edit ${formMode === 'category' ? 'Category' : 'Sub-Category'}`
                : 'Add Category / Sub-Category'}
            </SheetTitle>
            <SheetCloseButton />
          </SheetHeader>

          <SheetBody className="space-y-4">
            {editingCategory && (
              <div className="space-y-2">
                <Label>Config Item</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  {getCategoryIcon(editingCategory.highLevelCategory)}
                  <span className="font-medium">{editingCategory.highLevelCategory}</span>
                  <Badge variant="outline" className="ml-auto">Locked</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Config Item cannot be changed when editing
                </p>
              </div>
            )}

            {/* Mode Selection - Only show when creating new */}
            {!editingCategory && (
              <div className="space-y-3">
                <Label>What would you like to create?</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mode-category"
                      name="creation-mode"
                      checked={formMode === 'category'}
                      onChange={() => {
                        setFormMode('category');
                        setSelectedParentCategory('');
                        setSubCategoryName('');
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="mode-category" className="font-normal cursor-pointer">
                      New Category
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mode-subcategory"
                      name="creation-mode"
                      checked={formMode === 'subcategory'}
                      onChange={() => {
                        setFormMode('subcategory');
                        setCategoryName('');
                      }}
                      className="h-4 w-4"
                      disabled={uniqueCategoryNames.length === 0}
                    />
                    <Label
                      htmlFor="mode-subcategory"
                      className={`font-normal ${uniqueCategoryNames.length === 0 ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      Sub-Category under existing
                    </Label>
                  </div>
                </div>
                {uniqueCategoryNames.length === 0 && formMode === 'subcategory' && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Create a category first before adding sub-categories
                  </p>
                )}
              </div>
            )}

            {/* Category Mode: Show only Category Name */}
            {formMode === 'category' && (
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Hardware, Software, Facilities..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a unique category name. This will be the parent for sub-categories.
                </p>
              </div>
            )}

            {/* Subcategory Mode: Show Parent Category Dropdown + Subcategory Name */}
            {formMode === 'subcategory' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category *</Label>
                  <Select
                    value={selectedParentCategory}
                    onValueChange={setSelectedParentCategory}
                    disabled={!!editingCategory}
                  >
                    <SelectTrigger id="parentCategory">
                      <SelectValue placeholder="Select existing category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategoryNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            {name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {editingCategory
                      ? 'Parent category cannot be changed when editing'
                      : 'Select an existing category to add this sub-category under'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategoryName">Sub-Category Name *</Label>
                  <Input
                    id="subCategoryName"
                    placeholder="e.g., Desktop Issues, Laptop Issues..."
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a unique sub-category name under the selected category.
                  </p>
                </div>
              </>
            )}
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
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      < AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.subCategory}"? This will deactivate the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </div >
  );
}

export default CategoryManagement;

