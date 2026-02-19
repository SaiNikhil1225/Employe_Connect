import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { MoreHorizontal, Trash2, Pencil, Eye, Copy, Archive, Download, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import type { FinancialLine } from '@/types/financialLine';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FinancialLineTableSkeleton } from './FinancialLineTableSkeleton';
import { CreateFLForm } from './CreateFLForm';

interface FinancialLineTableProps {
  data: FinancialLine[];
  loading: boolean;
}

export function FinancialLineTable({ data, loading }: FinancialLineTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedFL, setSelectedFL] = useState<FinancialLine | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingFL, setEditingFL] = useState<FinancialLine | null>(null);
  const { deleteFL, fetchFLs } = useFinancialLineStore();

  const handleViewClick = (fl: FinancialLine) => {
    // View details in a modal/drawer - showing FL information
    toast.info(`View details for FL ${fl.flNo} - Feature in development. All FL data is visible in the table.`);
  };

  const handleEditClick = (fl: FinancialLine) => {
    setEditingFL(fl);
    setIsEditFormOpen(true);
  };

  const handleDeleteClick = (fl: FinancialLine) => {
    setSelectedFL(fl);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFL) {
      try {
        await deleteFL(selectedFL._id);
        toast.success(`FL ${selectedFL.flNo} deleted successfully`);
        setIsDeleteOpen(false);
        setSelectedFL(null);
      } catch {
        toast.error('Failed to delete financial line');
      }
    }
  };

  const handleDuplicate = () => {
    toast.info('Duplicate feature coming soon');
  };

  const handleArchive = () => {
    toast.info('Archive feature coming soon');
  };

  const handleBulkExport = () => {
    const selectedFLs = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    const csvContent = [
      ['FL No', 'FL Name', 'Contract Type', 'Location Type', 'Start Date', 'End Date', 'Bill Rate', 'Currency', 'Effort', 'Planned Revenue', 'Status'].join(','),
      ...selectedFLs.map(fl => [
        fl.flNo,
        fl.flName,
        fl.contractType,
        fl.locationType,
        format(new Date(fl.scheduleStart), 'yyyy-MM-dd'),
        format(new Date(fl.scheduleFinish), 'yyyy-MM-dd'),
        fl.billingRate,
        fl.currency,
        fl.effort || 0,
        fl.totalPlannedRevenue || 0,
        fl.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-lines-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success(`Exported ${selectedFLs.length} FL(s)`);
  };

  const handleBulkDelete = async () => {
    const selectedFLs = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    try {
      const deletePromises = selectedFLs.map(fl => deleteFL(fl._id));
      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedFLs.length} FL(s)`);
      setRowSelection({});
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete some financial lines');
    }
  };

  const columns: ColumnDef<FinancialLine>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'flNo',
      header: 'FL No',
      cell: ({ row }) => (
        <div className="font-medium text-primary whitespace-nowrap">{row.getValue('flNo')}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'flName',
      header: 'FL Name',
      cell: ({ row }) => (
        <div className="min-w-[200px] truncate font-medium">{row.getValue('flName')}</div>
      ),
    },
    {
      accessorKey: 'contractType',
      header: 'Contract Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal whitespace-nowrap">
          {row.getValue('contractType')}
        </Badge>
      ),
    },
    {
      accessorKey: 'locationType',
      header: 'Location Type',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal whitespace-nowrap">
          {row.getValue('locationType')}
        </Badge>
      ),
    },
    {
      accessorKey: 'scheduleStart',
      header: 'Start Date',
      cell: ({ row }) => {
        const date = row.getValue('scheduleStart') as string;
        return (
          <div className="text-sm whitespace-nowrap">
            {format(new Date(date), 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'scheduleFinish',
      header: 'End Date',
      cell: ({ row }) => {
        const date = row.getValue('scheduleFinish') as string;
        return (
          <div className="text-sm whitespace-nowrap">
            {format(new Date(date), 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'billingRate',
      header: 'Billing Rate',
      cell: ({ row }) => {
        const rate = row.getValue('billingRate') as number;
        const currency = row.original.currency;
        return (
          <div className="font-semibold whitespace-nowrap">
            {currency} {rate.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'rateUom',
      header: 'Rate Unit',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('rateUom')}</div>
      ),
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original.projectId;
        if (typeof project === 'string') {
          // Only ID, no name
          return <span>{project}</span>;
        } else if (project && typeof project === 'object') {
          // Object with projectId and projectName
          return <span>{project.projectId} - {project.projectName}</span>;
        } else {
          return <span>-</span>;
        }
      },
    },
    {
      accessorKey: 'totalPlannedRevenue',
      header: 'Planned Revenue',
      cell: ({ row }) => {
        const revenue = row.getValue('totalPlannedRevenue') as number || 0;
        const currency = row.original.currency;
        return (
          <div className="font-semibold text-green-600 whitespace-nowrap">
            {currency} {revenue.toLocaleString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const fl = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewClick(fl)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(fl)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(fl)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId: (row) => row._id,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
  });

  if (loading) {
    return <FinancialLineTableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No financial lines found. Create your first FL to get started.
      </div>
    );
  }

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 mb-4 bg-muted/50 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {table.getFilteredSelectedRowModel().rows.length} FL{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    
                    return (
                      <TableHead 
                        key={header.id} 
                        className={`font-semibold whitespace-nowrap ${
                          header.id === 'select'
                            ? 'w-[40px] sticky left-0 bg-muted z-20'
                            : header.id === 'flNo'
                            ? 'sticky left-[40px] bg-muted z-20'
                            : header.id === 'actions' 
                            ? 'sticky right-0 bg-muted z-20' 
                            : ''
                        }`}
                        style={{
                          ...(header.id === 'select' && {
                            boxShadow: '4px 0 8px -2px rgba(0,0,0,0.1)',
                            backgroundColor: 'hsl(var(--muted))'
                          }),
                          ...(header.id === 'flNo' && {
                            boxShadow: '4px 0 8px -2px rgba(0,0,0,0.1)',
                            backgroundColor: 'hsl(var(--muted))'
                          }),
                          ...(header.id === 'actions' && {
                            boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.1)',
                            backgroundColor: 'hsl(var(--muted))'
                          })
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={isSortable ? 'flex items-center gap-2 cursor-pointer select-none' : ''}
                            onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {isSortable && (
                              <span className="ml-auto">
                                {sortDirection === 'asc' ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : sortDirection === 'desc' ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={`${
                        cell.column.id === 'select'
                          ? 'w-[40px] sticky left-0 bg-background z-20'
                          : cell.column.id === 'flNo'
                          ? 'sticky left-[40px] bg-background z-20'
                          : cell.column.id === 'actions' 
                          ? 'sticky right-0 bg-background z-20' 
                          : ''
                      }`}
                      style={{
                        ...(cell.column.id === 'select' && {
                          boxShadow: '4px 0 8px -2px rgba(0,0,0,0.1)',
                          backgroundColor: 'hsl(var(--background))'
                        }),
                        ...(cell.column.id === 'flNo' && {
                          boxShadow: '4px 0 8px -2px rgba(0,0,0,0.1)',
                          backgroundColor: 'hsl(var(--background))'
                        }),
                        ...(cell.column.id === 'actions' && {
                          boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.1)',
                          backgroundColor: 'hsl(var(--background))'
                        })
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length} financial lines
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>First</Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
            <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last</Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete FL "{selectedFL?.flNo}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Financial Lines?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {table.getFilteredSelectedRowModel().rows.length} FL{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {table.getFilteredSelectedRowModel().rows.length} FL{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit FL Form */}
      <CreateFLForm
        open={isEditFormOpen}
        onOpenChange={(open) => {
          setIsEditFormOpen(open);
          if (!open) setEditingFL(null);
        }}
        editData={editingFL}
        isEditMode={true}
        onSuccess={() => {
          fetchFLs();
          toast.success('Financial Line updated successfully');
        }}
      />
    </>
  );
}
