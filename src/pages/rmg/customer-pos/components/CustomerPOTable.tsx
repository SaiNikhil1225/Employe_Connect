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
import { MoreHorizontal, Pencil, Trash2, Eye, Copy, Archive, Download, X } from 'lucide-react';
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
import { toast } from 'sonner';
import type { CustomerPO } from '@/types/customerPO';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { CreateCustomerPODialog } from './CreateCustomerPODialog';
import { CustomerPOTableSkeleton } from './CustomerPOTableSkeleton';
import { format } from 'date-fns';

interface CustomerPOTableProps {
  data: CustomerPO[];
  loading: boolean;
}

export function CustomerPOTable({ data, loading }: CustomerPOTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<CustomerPO | null>(null);
  const { deletePO, fetchPOs } = useCustomerPOStore();

  const handleEdit = (po: CustomerPO) => {
    setSelectedPO(po);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (po: CustomerPO) => {
    setSelectedPO(po);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPO) {
      await deletePO(selectedPO._id);
      setIsDeleteOpen(false);
      setSelectedPO(null);
    }
  };

  const handleDuplicate = (po: CustomerPO) => {
    toast.info('Duplicate feature coming soon');
  };

  const handleArchive = (po: CustomerPO) => {
    toast.info('Archive feature coming soon');
  };

  const handleBulkExport = () => {
    const selectedPOs = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    const csvContent = [
      ['Contract No', 'PO No', 'Customer', 'Project', 'Booking Entity', 'PO Amount', 'Currency', 'Validity Date', 'Status'].join(','),
      ...selectedPOs.map(po => [
        po.contractNo,
        po.poNo,
        typeof po.customerId === 'object' ? po.customerId?.customerName : '',
        typeof po.projectId === 'object' ? po.projectId?.projectName : '',
        po.bookingEntity,
        po.poAmount,
        po.poCurrency,
        format(new Date(po.poValidityDate), 'yyyy-MM-dd'),
        po.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-pos-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success(`Exported ${selectedPOs.length} PO(s)`);
  };

  const handleBulkDelete = async () => {
    const selectedPOs = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    try {
      const deletePromises = selectedPOs.map(po => deletePO(po._id));
      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedPOs.length} PO(s)`);
      setRowSelection({});
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete some POs');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Closed':
        return 'secondary';
      case 'Expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const columns: ColumnDef<CustomerPO>[] = [
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
    },
    {
      accessorKey: 'contractNo',
      header: 'Contract No',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('contractNo')}</div>
      ),
    },
    {
      accessorKey: 'poNo',
      header: 'PO No',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('poNo')}</div>
      ),
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }) => {
        const customer = row.original.customerId;
        if (typeof customer === 'object' && customer !== null) {
          return <div>{customer.customerName}</div>;
        }
        return <div>-</div>;
      },
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original.projectId;
        if (typeof project === 'object' && project !== null) {
          return <div>{project.projectName}</div>;
        }
        return <div>-</div>;
      },
    },
    {
      accessorKey: 'bookingEntity',
      header: 'Booking Entity',
    },
    {
      accessorKey: 'poAmount',
      header: 'PO Amount',
      cell: ({ row }) => {
        const amount = row.getValue('poAmount') as number;
        const currency = row.original.poCurrency;
        return (
          <div className="font-medium">
            {currency} {amount.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'poValidityDate',
      header: 'Validity Date',
      cell: ({ row }) => {
        const date = row.getValue('poValidityDate') as string;
        return <div>{format(new Date(date), 'MMM dd, yyyy')}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const po = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(po)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(po)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleArchive(po)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(po)}
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
    return <CustomerPOTableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customer POs found. Create your first PO to get started.
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
              {table.getFilteredSelectedRowModel().rows.length} PO{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''} selected
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length} POs
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

      {selectedPO && (
        <CreateCustomerPODialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          po={selectedPO}
          onSuccess={() => {
            setIsEditOpen(false);
            setSelectedPO(null);
            fetchPOs();
          }}
        />
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the PO "{selectedPO?.poNo}". This action cannot be undone.
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
            <AlertDialogTitle>Delete Multiple POs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {table.getFilteredSelectedRowModel().rows.length} PO{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {table.getFilteredSelectedRowModel().rows.length} PO{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
