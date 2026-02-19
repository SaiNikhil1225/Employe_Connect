import { useState } from 'react';
import type { Customer } from '@/types/customer';
import { useCustomerStore } from '@/store/customerStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Copy, Archive, Download, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { CustomerTableSkeleton } from './CustomerTableSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { ColumnVisibility } from './ColumnToggle';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  columnVisibility?: ColumnVisibility;
}

export function CustomerTable({ customers, isLoading, columnVisibility }: CustomerTableProps) {
  const { deleteCustomer } = useCustomerStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Default column visibility if not provided
  const cols = columnVisibility || {
    customerNumber: true,
    customerName: true,
    industry: true,
    region: true,
    regionHead: true,
    status: true,
    createdAt: true,
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCustomer?._id && !selectedCustomer?.id) return;
    
    const id = selectedCustomer._id || selectedCustomer.id!;
    
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete customer';
      toast.error(message);
    }
  };

  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (customer: Customer) => {
    toast.info('Duplicate feature coming soon');
  };

  const handleArchive = (customer: Customer) => {
    toast.info('Archive feature coming soon');
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3 w-3" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-3 w-3" />
      : <ArrowDown className="ml-2 h-3 w-3" />;
  };

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    const currentPageIds = paginatedCustomers.map(c => c._id || c.id || '');
    const allCurrentSelected = currentPageIds.every(id => selectedRows.has(id));
    
    if (allCurrentSelected) {
      const newSelection = new Set(selectedRows);
      currentPageIds.forEach(id => newSelection.delete(id));
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set(selectedRows);
      currentPageIds.forEach(id => newSelection.add(id));
      setSelectedRows(newSelection);
    }
  };

  const handleBulkExport = () => {
    const selectedCustomers = customers.filter(c => selectedRows.has(c._id || c.id || ''));
    const csvContent = [
      ['Customer No', 'Customer Name', 'Industry', 'Region', 'Region Head', 'Status', 'Created'].join(','),
      ...selectedCustomers.map(c => [
        c.customerNo,
        c.customerName,
        c.industry,
        c.region,
        c.regionHead || '',
        c.status,
        c.createdAt ? format(new Date(c.createdAt), 'yyyy-MM-dd') : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success(`Exported ${selectedCustomers.length} customer(s)`);
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedRows).map(id => deleteCustomer(id));
      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedRows.size} customer(s)`);
      setSelectedRows(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete some customers');
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aValue: any;
    let bValue: any;

    switch (key) {
      case 'customerNo':
        aValue = a.customerNo.toLowerCase();
        bValue = b.customerNo.toLowerCase();
        break;
      case 'customerName':
        aValue = a.customerName.toLowerCase();
        bValue = b.customerName.toLowerCase();
        break;
      case 'industry':
        aValue = a.industry?.toLowerCase() || '';
        bValue = b.industry?.toLowerCase() || '';
        break;
      case 'region':
        aValue = a.region?.toLowerCase() || '';
        bValue = b.region?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalItems = sortedCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        variant="search"
        title="No customers found"
        description="Try adjusting your search query or filters to find what you're looking for."
      />
    );
  }

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 mb-4 bg-muted/50 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.size} customer{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
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
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedRows.has(c._id || c.id || ''))}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all on page"
                />
              </TableHead>
              {cols.customerNumber && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'customerNo' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('customerNo')}
                  >
                    Customer Number
                    {getSortIcon('customerNo')}
                  </Button>
                </TableHead>
              )}
              {cols.customerName && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'customerName' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('customerName')}
                  >
                    Customer Name
                    {getSortIcon('customerName')}
                  </Button>
                </TableHead>
              )}
              {cols.industry && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'industry' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('industry')}
                  >
                    Industry
                    {getSortIcon('industry')}
                  </Button>
                </TableHead>
              )}
              {cols.region && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'region' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('region')}
                  >
                    Region
                    {getSortIcon('region')}
                  </Button>
                </TableHead>
              )}
              {cols.regionHead && <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Region Head</TableHead>}
              {cols.status && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'status' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
              )}
              {cols.createdAt && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap ${sortConfig?.key === 'createdAt' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created Date
                    {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-right normal-case !font-medium !tracking-normal whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => {
              const customerId = customer._id || customer.id || '';
              return (
                <TableRow key={customerId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(customerId)}
                      onCheckedChange={() => toggleRowSelection(customerId)}
                      aria-label={`Select ${customer.customerName}`}
                    />
                  </TableCell>
                  {cols.customerNumber && <TableCell className="font-medium">{customer.customerNo}</TableCell>}
                  {cols.customerName && <TableCell>{customer.customerName}</TableCell>}
                  {cols.industry && <TableCell>{customer.industry}</TableCell>}
                  {cols.region && <TableCell>{customer.region}</TableCell>}
                  {cols.regionHead && <TableCell>{customer.regionHead || '-'}</TableCell>}
                  {cols.status && (
                    <TableCell>
                      <Badge
                        variant={customer.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                  )}
                  {cols.createdAt && (
                    <TableCell>
                      {customer.createdAt
                        ? format(new Date(customer.createdAt), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(customer)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(customer)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(customer)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} customers
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete customer "{selectedCustomer?.customerName}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Customers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRows.size} customer{selectedRows.size > 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRows.size} Customer{selectedRows.size > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={selectedCustomer}
      />
    </>
  );
}
