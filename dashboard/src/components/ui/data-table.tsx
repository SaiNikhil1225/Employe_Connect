import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreHorizontal,
  Columns3,
} from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  sticky?: 'left' | 'right';
}

export interface DataTableAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  condition?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  hideColumnToggle?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  emptyMessage = 'No data available',
  onRowClick,
  hideColumnToggle = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach(col => {
      initial[col.key] = !col.hidden;
    });
    return initial;
  });

  // Reset to page 1 when data changes (e.g., after create/update/delete operations)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Update column visibility when columns prop changes
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {};
    columns.forEach(col => {
      newVisibility[col.key] = !col.hidden;
    });
    setColumnVisibility(newVisibility);
  }, [columns]);

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return columns.some((column) => {
      const value = row[column.key];
      if (value == null) return false;
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    // Handle null/undefined values
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      aVal = aVal.getTime();
      bVal = bVal.getTime();
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      // Try to parse as dates
      const dateA = new Date(aVal);
      const dateB = new Date(bVal);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        aVal = dateA.getTime();
        bVal = dateB.getTime();
      }
    }

    // Compare values
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Get cell value
  const getCellValue = (row: T, column: DataTableColumn<T>) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return value;
  };

  // Get visible columns
  const visibleColumns = columns.filter(col => columnVisibility[col.key] !== false);

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Get alignment class
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div>
      {/* Search and Column Visibility */}
      <div className="flex items-center gap-2">
        {searchable && (
          <>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
            </div>
          </>
        )}
        {!hideColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={searchable ? "" : "ml-auto"}>
                <Columns3 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel className="text-xs font-medium">Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.key}
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer py-1.5 px-2"
                  >
                    <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility(column.key)}>
                      <Checkbox
                        checked={columnVisibility[column.key] !== false}
                        onCheckedChange={() => toggleColumnVisibility(column.key)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="flex-1 text-xs">{column.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column, index) => {
                const isSticky = column.sticky;
                
                // Calculate left offset for sticky columns
                let leftOffset = 0;
                if (isSticky === 'left') {
                  for (let i = 0; i < index; i++) {
                    if (visibleColumns[i].sticky === 'left') {
                      const width = visibleColumns[i].width || '150px';
                      leftOffset += parseInt(width) || 150;
                    }
                  }
                }
                
                const stickyClasses = isSticky === 'left' 
                  ? 'sticky z-10 bg-background border-r' 
                  : isSticky === 'right' 
                  ? 'sticky right-0 z-10 bg-background border-l' 
                  : '';
                
                const stickyStyle = isSticky === 'left' ? { left: `${leftOffset}px` } : {};
                
                return (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width, ...stickyStyle }}
                    className={`whitespace-nowrap ${getAlignmentClass(column.align)} ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    } ${stickyClasses}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={`flex items-center gap-2 ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                );
              })}
              {actions && actions.length > 0 && (
                <TableHead className="w-[100px] text-left whitespace-nowrap sticky right-0 z-10 bg-background border-l">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground"
>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map((column, colIndex) => {
                    const isSticky = column.sticky;
                    
                    // Calculate left offset for sticky columns
                    let leftOffset = 0;
                    if (isSticky === 'left') {
                      for (let i = 0; i < colIndex; i++) {
                        if (visibleColumns[i].sticky === 'left') {
                          const width = visibleColumns[i].width || '150px';
                          leftOffset += parseInt(width) || 150;
                        }
                      }
                    }
                    
                    const stickyClasses = isSticky === 'left' 
                      ? 'sticky z-10 bg-background border-r' 
                      : isSticky === 'right' 
                      ? 'sticky right-0 z-10 bg-background border-l' 
                      : '';
                    
                    const stickyStyle = isSticky === 'left' ? { left: `${leftOffset}px` } : {};
                    
                    return (
                      <TableCell 
                        key={column.key} 
                        className={`${getAlignmentClass(column.align)} ${stickyClasses}`}
                        style={stickyStyle}
                      >
                        {getCellValue(row, column)}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell className="sticky right-0 z-10 bg-background border-l">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions
                            .filter(action => !action.condition || action.condition(row))
                            .map((action, actionIdx) => (
                            <DropdownMenuItem
                              key={actionIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={
                                action.variant === 'destructive'
                                  ? 'text-destructive focus:text-destructive'
                                  : ''
                              }
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{' '}
              {sortedData.length} entries
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm font-medium px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
