/**
 * Holiday Calendar Management Page
 * Manage holidays with multi-level configuration
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
    Calendar,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Send,
    Download,
    Eye,
    Building2,
    Tag,
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HolidayDrawer } from '@/components/holiday/HolidayDrawer';
import { BulkUploadHolidaysDrawer } from '@/components/holiday/BulkUploadHolidaysDrawer';
import { HolidayDashboardCards } from '@/components/holiday/HolidayDashboardCards';
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
import { toast } from 'sonner';
import {
    getHolidays,
    getHolidayById,
    publishHoliday,
    deleteHoliday,
    bulkDeleteHolidays,
    getHolidayTypes,
    getObservanceTypes,
    getHolidayGroups
} from '@/services/holidayService';
import type {
    Holiday,
    HolidayType,
    ObservanceType,
    HolidayGroup
} from '@/types/holiday';

const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case 'PUBLISHED': return 'bg-primary';
        case 'DRAFT': return 'bg-orange-500';
        case 'ARCHIVED': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
};

const formatDate = (date: string | Date) => {
    // Extract UTC date components to avoid timezone shifts
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth();
    const day = dateObj.getUTCDate();
    
    // Create a date in local timezone with the UTC components
    const localDate = new Date(year, month, day);
    
    return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export function HolidayManagement() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [allHolidaysForDashboard, setAllHolidaysForDashboard] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<number | 'all'>(2026);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
    const [sortField, setSortField] = useState<'date' | 'name' | 'type' | 'status'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Configuration data
    const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([]);
    const [observanceTypes, setObservanceTypes] = useState<ObservanceType[]>([]);
    const [holidayGroups, setHolidayGroups] = useState<HolidayGroup[]>([]);

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [viewingHoliday, setViewingHoliday] = useState<Holiday | null>(null);
    const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);

    // Form state - removed, now handled by HolidayDrawer component

    // Fetch configuration data
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const [typesData, observanceData, groupsData] = await Promise.all([
                    getHolidayTypes(),
                    getObservanceTypes(),
                    getHolidayGroups()
                ]);
                setHolidayTypes(typesData);
                setObservanceTypes(observanceData);
                setHolidayGroups(groupsData);
                console.log('Configuration loaded:', {
                    types: typesData.length,
                    groups: groupsData.length
                });
            } catch (err) {
                console.error('Failed to load configuration:', err);
                toast.error('Failed to load configuration data');
            }
        };
        loadConfig();
    }, []);

    const fetchHolidays = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: currentPage,
                limit: 10
            };

            if (filterYear !== 'all') filters.year = filterYear;
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (filterGroup !== 'all') filters.groupId = filterGroup;

            const response = await getHolidays(filters);
            setHolidays(response.data.holidays);
            setTotalPages(response.data.pagination?.totalPages || 1);

            // Fetch all holidays for dashboard (without pagination)
            const allFilters: any = {};
            if (filterYear !== 'all') allFilters.year = filterYear;
            if (filterStatus !== 'all') allFilters.status = filterStatus;
            if (filterGroup !== 'all') allFilters.groupId = filterGroup;

            const allResponse = await getHolidays({ ...allFilters, limit: 1000 });
            setAllHolidaysForDashboard(allResponse.data.holidays);
        } catch (err) {
            console.error('Error fetching holidays:', err);
            toast.error('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterGroup, filterYear, currentPage]);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    // Removed old form handlers - now handled by HolidayDrawer component
    // handleOpenForm, handleImageChange, handleToggleRegion, handleSave

    const handleViewHoliday = async (holiday: Holiday) => {
        try {
            const fullHoliday = await getHolidayById(holiday._id);
            setViewingHoliday(fullHoliday);
            setIsViewOpen(true);
        } catch (err) {
            console.error('Error fetching holiday details:', err);
            toast.error('Failed to load holiday details');
        }
    };

    const handlePublish = async (holiday: Holiday) => {
        try {
            await publishHoliday(holiday._id);
            toast.success('Holiday published successfully');
            fetchHolidays();
        } catch (err) {
            console.error('Error publishing holiday:', err);
            toast.error('Failed to publish holiday');
        }
    };

    const handleDelete = async () => {
        if (!deletingHoliday) return;

        try {
            await deleteHoliday(deletingHoliday._id);
            toast.success('Holiday deleted successfully');
            setIsDeleteOpen(false);
            setDeletingHoliday(null);
            fetchHolidays();
        } catch (err) {
            console.error('Error deleting holiday:', err);
            toast.error('Failed to delete holiday');
        }
    };

    const handleExportExcel = () => {
        // Create proper Excel workbook
        const wb = XLSX.utils.book_new();

        // Prepare data for export
        const excelData = holidays.map(h => ({
            'Date': formatDate(h.date),
            'Name': h.name,
            'Country': typeof h.countryId === 'object' ? h.countryId.name : '',
            'Region': typeof h.regionId === 'object' ? h.regionId.name : '',
            'Type': typeof h.typeId === 'object' ? h.typeId.name : '',
            'Client': typeof h.clientId === 'object' ? h.clientId.name : '',
            'Groups': h.groupIds?.map(gId => typeof gId === 'object' ? gId.name : gId).join(', ') || '',
            'Status': h.status
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 },  // Date
            { wch: 25 },  // Name
            { wch: 20 },  // Country
            { wch: 15 },  // Region
            { wch: 15 },  // Type
            { wch: 20 },  // Client
            { wch: 30 },  // Groups (wider for multiple groups)
            { wch: 10 }   // Status
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Holidays');
        XLSX.writeFile(wb, `holidays_${filterYear === 'all' ? 'all_years' : filterYear}.xlsx`);
        toast.success('Excel exported successfully');
    };

    const handleBulkPublish = async () => {
        try {
            let successCount = 0;
            let errorCount = 0;

            for (const holidayId of selectedHolidays) {
                try {
                    await publishHoliday(holidayId);
                    successCount++;
                } catch (error) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} holiday(s) published successfully`);
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} holiday(s) failed to publish`);
            }

            setSelectedHolidays([]);
            fetchHolidays();
        } catch (error) {
            toast.error('Failed to publish holidays');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await bulkDeleteHolidays(selectedHolidays);
            toast.success(`${selectedHolidays.length} holiday(s) deleted successfully`);
            setIsBulkDeleteOpen(false);
            setSelectedHolidays([]);
            fetchHolidays();
        } catch (error) {
            console.error('Error deleting holidays:', error);
            toast.error('Failed to delete holidays');
        }
    };

    const handleSelectHoliday = (holidayId: string) => {
        setSelectedHolidays(prev =>
            prev.includes(holidayId)
                ? prev.filter(id => id !== holidayId)
                : [...prev, holidayId]
        );
    };

    const handleSelectAll = () => {
        if (selectedHolidays.length === holidays.length) {
            setSelectedHolidays([]);
        } else {
            setSelectedHolidays(holidays.map(h => h._id));
        }
    };

    const handleSort = (field: 'date' | 'name' | 'type' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Sort holidays
    const sortedHolidays = useMemo(() => {
        return [...holidays].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'type':
                    aValue = typeof a.typeId === 'object' ? a.typeId.name : '';
                    bValue = typeof b.typeId === 'object' ? b.typeId.name : '';
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [holidays, sortField, sortDirection]);

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Holiday Calendar</h1>
                            <p className="text-muted-foreground">Manage holidays by groups and publish to employees</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Year and Group Filters */}
                        <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(v === 'all' ? 'all' : Number(v))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterGroup} onValueChange={setFilterGroup}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {holidayGroups.filter(g => g.isActive).map(group => (
                                    <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Bulk Upload
                        </Button>
                        {selectedHolidays.length > 0 && (
                            <>
                                <Button onClick={handleBulkPublish} variant="default">
                                    <Send className="h-4 w-4 mr-2" />
                                    Publish Selected ({selectedHolidays.length})
                                </Button>
                                <Button onClick={() => setIsBulkDeleteOpen(true)} variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected ({selectedHolidays.length})
                                </Button>
                            </>
                        )}
                        <Button onClick={() => {
                            setEditingHoliday(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Holiday
                        </Button>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <HolidayDashboardCards
                    holidays={allHolidaysForDashboard}
                    selectedYear={filterYear}
                    selectedGroup={filterGroup}
                />

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            {/* Left side - Search and Status */}
                            <div className="flex gap-4 flex-1">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search holidays..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[160px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Right side - Export Excel */}
                            <div className="flex gap-2 items-center">
                                <Button variant="outline" onClick={handleExportExcel}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Holidays Table */}
                <Card>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No holidays found.
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedHolidays.length === holidays.length && holidays.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300"
                                                />
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                                                <div className="flex items-center gap-1">
                                                    Date
                                                    {sortField === 'date' ? (
                                                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                                <div className="flex items-center gap-1">
                                                    Holiday Name
                                                    {sortField === 'name' ? (
                                                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                                                <div className="flex items-center gap-1">
                                                    Type
                                                    {sortField === 'type' ? (
                                                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    {sortField === 'status' ? (
                                                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedHolidays
                                            .filter(h => !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((holiday) => (
                                                <TableRow key={holiday._id}>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedHolidays.includes(holiday._id)}
                                                            onChange={() => handleSelectHoliday(holiday._id)}
                                                            className="rounded border-gray-300"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatDate(holiday.date)}
                                                    </TableCell>
                                                    <TableCell className="cursor-pointer" onClick={() => handleViewHoliday(holiday)}>
                                                        <div className="font-medium">{holiday.name}</div>
                                                        {holiday.description && (
                                                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                                {holiday.description}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {typeof holiday.typeId === 'object' && holiday.typeId ? holiday.typeId.name : '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadgeColor(holiday.status)}>
                                                            {holiday.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleViewHoliday(holiday)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View details</TooltipContent>
                                                            </Tooltip>
                                                            {holiday.status !== 'PUBLISHED' && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setEditingHoliday(holiday);
                                                                                    setIsFormOpen(true);
                                                                                }}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit holiday</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handlePublish(holiday)}
                                                                            >
                                                                                <Send className="h-4 w-4 text-primary" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Publish holiday</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setDeletingHoliday(holiday);
                                                                            setIsDeleteOpen(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Delete holiday</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
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

                {/* Holiday Form Drawer */}
                <HolidayDrawer
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    holiday={editingHoliday}
                    holidayTypes={holidayTypes}
                    observanceTypes={observanceTypes}
                    holidayGroups={holidayGroups}
                    onSuccess={() => {
                        fetchHolidays();
                        setIsFormOpen(false);
                        setEditingHoliday(null);
                    }}
                />

                {/* Bulk Upload Drawer */}
                <BulkUploadHolidaysDrawer
                    open={isBulkUploadOpen}
                    onOpenChange={setIsBulkUploadOpen}
                    holidayTypes={holidayTypes}
                    observanceTypes={observanceTypes}
                    holidayGroups={holidayGroups}
                    onSuccess={() => {
                        fetchHolidays();
                        setFilterYear('all');
                    }}
                />

                {/* View Holiday Sheet */}
                <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Holiday Details
                            </SheetTitle>
                            <SheetCloseButton />
                        </SheetHeader>

                        {viewingHoliday && (
                            <SheetBody className="space-y-4">
                                {viewingHoliday.imageUrl && (
                                    <img
                                        src={viewingHoliday.imageUrl}
                                        alt={viewingHoliday.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                )}
                                <div>
                                    <h3 className="text-2xl font-semibold">{viewingHoliday.name}</h3>
                                    <p className="text-muted-foreground">{formatDate(viewingHoliday.date)}</p>
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        <Badge className={getStatusBadgeColor(viewingHoliday.status)}>
                                            {viewingHoliday.status}
                                        </Badge>
                                    </div>
                                </div>

                                {viewingHoliday.description && (
                                    <div>
                                        <h4 className="font-medium mb-1">Description</h4>
                                        <p className="text-sm text-muted-foreground">{viewingHoliday.description}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">Holiday Type</p>
                                    <p className="font-medium">
                                        {typeof viewingHoliday.typeId === 'object' && viewingHoliday.typeId ? viewingHoliday.typeId.name : '-'}
                                    </p>
                                </div>
                            </SheetBody>
                        )}

                        <SheetFooter>
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                                Close
                            </Button>
                            {viewingHoliday && viewingHoliday.status !== 'PUBLISHED' && (
                                <Button onClick={() => {
                                    setIsViewOpen(false);
                                    setEditingHoliday(viewingHoliday);
                                    setIsFormOpen(true);
                                }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Holiday
                                </Button>
                            )}
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{deletingHoliday?.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Bulk Delete Confirmation */}
                <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Multiple Holidays</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {selectedHolidays.length} selected holiday(s)? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                                Delete {selectedHolidays.length} Holiday(s)
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}

export default HolidayManagement;
