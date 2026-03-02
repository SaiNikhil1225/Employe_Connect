import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, AlertCircle, CheckCircle, Clock, Home, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import type { AttendanceLog } from '@/types/attendance';

interface AttendanceLogTableProps {
  data: AttendanceLog[];
  onRegularize?: (log: AttendanceLog) => void;
  loading?: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'present': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Present' },
    'absent': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Absent' },
    'wfh': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'WFH' },
    'leave': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Leave' },
    'weekly-off': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Weekly Off' },
    'late': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Late' },
    'half-day': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Half Day' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['absent'];
  return <Badge className={`${config.color} border`}>{config.label}</Badge>;
};

const getRegularizationBadge = (status: string) => {
  const config = {
    'none': null,
    'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
    'rejected': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' }
  };

  const item = config[status as keyof typeof config];
  if (!item) return null;

  const Icon = item.icon;
  return (
    <Badge className={`${item.color} border-0`}>
      <Icon className="mr-1 h-3 w-3" />
      {item.label}
    </Badge>
  );
};

export function AttendanceLogTable({ data, onRegularize, loading }: AttendanceLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

  const columns: ColumnDef<AttendanceLog>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <div>
            <div className="font-medium">
              {format(date, 'MMM dd, yyyy')}
            </div>
            <div className="text-xs text-gray-500">
              {format(date, 'EEEE')}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(row.original.status)}
          {row.original.workLocation === 'wfh' && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
              <Home className="mr-1 h-3 w-3" />
              WFH
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'checkInTime',
      header: 'Check In',
      cell: ({ row }) => {
        const checkIn = row.original.checkInTime;
        return checkIn ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {format(new Date(checkIn), 'h:mm a')}
            </span>
            {row.original.isLate && (
              <Badge className="bg-red-100 text-red-700 text-xs border-0">
                +{row.original.lateMinutes}m
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">--</span>
        );
      }
    },
    {
      accessorKey: 'checkOutTime',
      header: 'Check Out',
      cell: ({ row }) => {
        const checkOut = row.original.checkOutTime;
        return checkOut ? (
          <span className="font-medium">{format(new Date(checkOut), 'h:mm a')}</span>
        ) : (
          <span className="text-gray-400">--</span>
        );
      }
    },
    {
      accessorKey: 'effectiveHours',
      header: 'Effective Hours',
      cell: ({ row }) => {
        const hours = row.original.effectiveHours;
        if (!hours) return <span className="text-gray-400">0h 0m</span>;
        
        const h = Math.floor(hours);
        const m = Math.round((hours % 1) * 60);
        
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{h}h {m}m</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'breakDuration',
      header: 'Break',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Coffee className="h-4 w-4 text-gray-400" />
          <span>{row.original.breakDuration}m</span>
        </div>
      )
    },
    {
      accessorKey: 'regularizationStatus',
      header: 'Regularization',
      cell: ({ row }) => getRegularizationBadge(row.original.regularizationStatus)
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRegularize && log.regularizationStatus === 'none' && (
                <DropdownMenuItem onClick={() => onRegularize(log)}>
                  Request Regularization
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} records
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
