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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, UserX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SkillTags } from './SkillTag';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Resource {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  department: string;
  skills: string[];
  utilization: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  startDate?: string;
  endDate?: string;
  allocatedPercent?: number;
  allocatedHour?: number;
  actualHours?: number;
  approvedHours?: number;
}

interface ResourceTableProps {
  resources: Resource[];
  isLoading?: boolean;
  onView?: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onRemove?: (resource: Resource) => void;
  onRelease?: (resource: Resource) => void;
  visibleColumns?: string[];
}

export function ResourceTable({ resources, isLoading, onView, onEdit, onRemove, onRelease, visibleColumns }: ResourceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Check if specific hour columns should be shown
  const showAllocatedPercent = !visibleColumns || visibleColumns.includes('allocated-percent');
  const showAllocatedHour = !visibleColumns || visibleColumns.includes('allocated-hour');
  const showActual = !visibleColumns || visibleColumns.includes('actual');
  const showApproved = !visibleColumns || visibleColumns.includes('approved');

  // Define columns
  const columns: ColumnDef<Resource>[] = [
    {
      accessorKey: 'name',
      header: 'Resource',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={row.original.avatar} alt={row.getValue('name')} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(row.getValue('name'))}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{row.getValue('name')}</div>
            <div className="text-sm text-muted-foreground truncate">{row.original.role}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{row.getValue('department')}</span>
      ),
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <SkillTags skills={row.getValue('skills')} maxVisible={2} />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.getValue('startDate') ? format(new Date(row.getValue('startDate')), 'MMM dd, yyyy') : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.getValue('endDate') ? format(new Date(row.getValue('endDate')), 'MMM dd, yyyy') : '-'}
        </span>
      ),
    },
  ];

  // Add conditional columns based on visibleColumns
  if (showAllocatedPercent) {
    columns.push({
      accessorKey: 'allocatedPercent',
      header: 'Allocated (%)',
      cell: ({ row }) => (
        <span className="text-sm font-medium whitespace-nowrap">{row.original.allocatedPercent || 0}%</span>
      ),
    });
  }

  if (showAllocatedHour) {
    columns.push({
      accessorKey: 'allocatedHour',
      header: 'Allocated (Hr)',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{row.original.allocatedHour || 0} hrs</span>
      ),
    });
  }

  if (showActual) {
    columns.push({
      accessorKey: 'actualHours',
      header: 'Actual Hours',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{row.original.actualHours || 0} hrs</span>
      ),
    });
  }

  if (showApproved) {
    columns.push({
      accessorKey: 'approvedHours',
      header: 'Approved Hours',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{row.original.approvedHours || 0} hrs</span>
      ),
    });
  }

  // Status column
  columns.push({
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge 
        variant="secondary"
        className={`${getStatusColor(row.getValue('status'))} whitespace-nowrap`}
      >
        {row.getValue('status')}
      </Badge>
    ),
  });

  // Actions column
  columns.push({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onView?.(row.original)} disabled={!onView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(row.original)} disabled={!onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onRelease?.(row.original)}
            disabled={!onRelease || row.original.status === 'Inactive'}
            className="text-orange-600"
          >
            <UserX className="mr-2 h-4 w-4" />
            Release Resource
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive" 
            onClick={() => onRemove?.(row.original)}
            disabled={!onRemove}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  });

  const table = useReactTable({
    data: resources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading resources...</div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground font-medium">No resources found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add resources to this project to get started
        </p>
      </div>
    );
  }

  return (
    <>
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
                          header.id === 'name' 
                            ? 'sticky left-0 bg-muted z-20' 
                            : header.id === 'actions' 
                            ? 'sticky right-0 bg-muted z-20' 
                            : ''
                        }`}
                        style={{
                          ...(header.id === 'name' && {
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
                        cell.column.id === 'name' 
                          ? 'sticky left-0 bg-background z-20' 
                          : cell.column.id === 'actions' 
                          ? 'sticky right-0 bg-background z-20' 
                          : ''
                      }`}
                      style={{
                        ...(cell.column.id === 'name' && {
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} resources
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
    </>
  );
}
