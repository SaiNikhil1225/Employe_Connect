import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download, X, Copy, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { AvatarGroup } from './AvatarGroup';
import { ProjectTableSkeleton } from './ProjectTableSkeleton';
import { ProjectEmptyState } from './ProjectEmptyState';
import type { ColumnVisibility } from './ColumnToggle';

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  onCreateProject?: () => void;
  columnVisibility?: ColumnVisibility;
}

export function ProjectTable({ projects, isLoading, onCreateProject, columnVisibility }: ProjectTableProps) {
  const navigate = useNavigate();
  const { deleteProject } = useProjectStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Default column visibility if not provided
  const columns = columnVisibility || {
    projectName: true,
    owner: true,
    status: true,
    progress: true,
    budget: true,
    team: true,
    dueDate: true,
  };

  const handleBulkExport = () => {
    const selectedProjects = sortedProjects.filter(p => selectedRows.has(p._id || p.id || ''));
    
    // Convert to CSV
    const headers = ['Project ID', 'Project Name', 'Status', 'Owner', 'Start Date', 'End Date', 'Budget'];
    const csvData = selectedProjects.map(p => [
      p.projectId,
      p.projectName,
      p.status,
      p.projectManager?.name || 'Unassigned',
      p.projectStartDate ? format(new Date(p.projectStartDate), 'yyyy-MM-dd') : '',
      p.projectEndDate ? format(new Date(p.projectEndDate), 'yyyy-MM-dd') : '',
      p.estimatedValue || p.budget || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedProjects.length} project(s)`);
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedRows).map(id => deleteProject(id));
      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedRows.size} project(s)`);
      setSelectedRows(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete some projects');
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon based on current sort state
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3 w-3" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-3 w-3" />
      : <ArrowDown className="ml-2 h-3 w-3" />;
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aValue: any;
    let bValue: any;

    switch (key) {
      case 'projectName':
        aValue = a.projectName.toLowerCase();
        bValue = b.projectName.toLowerCase();
        break;
      case 'owner':
        aValue = (a.projectManager?.name || '').toLowerCase();
        bValue = (b.projectManager?.name || '').toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'progress':
        aValue = a.utilization || 0;
        bValue = b.utilization || 0;
        break;
      case 'budget':
        aValue = a.estimatedValue || a.budget || 0;
        bValue = b.estimatedValue || b.budget || 0;
        break;
      case 'dueDate':
        aValue = a.projectEndDate ? new Date(a.projectEndDate).getTime() : 0;
        bValue = b.projectEndDate ? new Date(b.projectEndDate).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = sortedProjects.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'PM';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '-';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : currency === 'AED' ? 'AED ' : '';
    return `${currencySymbol}${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getTeamMembers = (project: Project) => {
    const members: Array<{ id: string; name: string; avatar: string }> = [];
    
    if (project.projectManager?.name) {
      members.push({
        id: project.projectManager.employeeId || 'pm',
        name: project.projectManager.name,
        avatar: ''
      });
    }
    
    if (project.deliveryManager?.name && project.deliveryManager.name !== project.projectManager?.name) {
      members.push({
        id: project.deliveryManager.employeeId || 'dm',
        name: project.deliveryManager.name,
        avatar: ''
      });
    }
    
    return members;
  };

  const toggleRowSelection = (projectId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    const currentPageIds = paginatedProjects.map(p => p._id || p.id || '');
    const allCurrentSelected = currentPageIds.every(id => selectedRows.has(id));
    
    if (allCurrentSelected) {
      // Deselect all on current page
      const newSelection = new Set(selectedRows);
      currentPageIds.forEach(id => newSelection.delete(id));
      setSelectedRows(newSelection);
    } else {
      // Select all on current page
      const newSelection = new Set(selectedRows);
      currentPageIds.forEach(id => newSelection.add(id));
      setSelectedRows(newSelection);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject?._id && !selectedProject?.id) return;
    
    const id = selectedProject._id || selectedProject.id!;
    
    try {
      await deleteProject(id);
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete project';
      toast.error(message);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (project: Project) => {
    // TODO: Implement project duplication
    toast.info('Duplicate feature coming soon');
  };

  const handleArchive = (project: Project) => {
    // TODO: Implement project archival
    toast.info('Archive feature coming soon');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Draft':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      case 'Closed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <ProjectTableSkeleton />;
  }

  if (projects.length === 0) {
    return <ProjectEmptyState onCreateProject={onCreateProject || (() => {})} />;
  }

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 mb-4 bg-muted/50 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.size} project{selectedRows.size > 1 ? 's' : ''} selected
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
                  checked={
                    paginatedProjects.length > 0 &&
                    paginatedProjects.every(p => selectedRows.has(p._id || p.id || ''))
                  }
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'projectName' ? 'font-semibold' : ''}`}
                  onClick={() => handleSort('projectName')}
                >
                  Project Name
                  {getSortIcon('projectName')}
                </Button>
              </TableHead>
              {columns.owner && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'owner' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('owner')}
                  >
                    Owner
                    {getSortIcon('owner')}
                  </Button>
                </TableHead>
              )}
              {columns.status && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'status' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
              )}
              {columns.progress && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'progress' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('progress')}
                  >
                    Progress
                    {getSortIcon('progress')}
                  </Button>
                </TableHead>
              )}
              {columns.budget && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'budget' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('budget')}
                  >
                    Budget Used
                    {getSortIcon('budget')}
                  </Button>
                </TableHead>
              )}
              {columns.team && <TableHead className="normal-case !font-medium !tracking-normal whitespace-nowrap">Team</TableHead>}
              {columns.dueDate && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`-ml-3 h-8 whitespace-nowrap data-[state=open]:bg-accent ${sortConfig?.key === 'dueDate' ? 'font-semibold' : ''}`}
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date
                    {getSortIcon('dueDate')}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-right normal-case !font-medium !tracking-normal whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.map((project) => {
              const projectId = project._id || project.id || '';
              const progress = project.utilization || 0;
              const ownerName = project.projectManager?.name || 'Unassigned';
              const teamMembers = getTeamMembers(project);
              
              return (
                <TableRow 
                  key={projectId}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/rmg/projects/${projectId}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(projectId)}
                      onCheckedChange={() => toggleRowSelection(projectId)}
                      aria-label={`Select ${project.projectName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.projectName}</div>
                      <div className="text-xs text-muted-foreground">{project.projectId}</div>
                    </div>
                  </TableCell>
                  {columns.owner && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={ownerName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(ownerName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{ownerName}</span>
                      </div>
                    </TableCell>
                  )}
                  {columns.status && (
                    <TableCell>
                      <StatusBadge status={project.status as any} />
                    </TableCell>
                  )}
                  {columns.progress && (
                    <TableCell>
                      <div className="w-32">
                        <ProgressBar value={progress} />
                      </div>
                    </TableCell>
                  )}
                  {columns.budget && (
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(project.estimatedValue || project.budget, project.projectCurrency)}
                      </span>
                    </TableCell>
                  )}
                  {columns.team && (
                    <TableCell>
                      {teamMembers.length > 0 ? (
                        <AvatarGroup members={teamMembers} max={3} size="sm" />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  {columns.dueDate && (
                    <TableCell>
                      <span className="text-sm">
                        {project.projectEndDate
                          ? format(new Date(project.projectEndDate), 'MMM dd, yyyy')
                          : '-'}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/rmg/projects/${projectId}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(project)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(project)}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} projects
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Page Size Selector */}
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

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
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
              This will permanently delete project "{selectedProject?.projectName}".
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
            <AlertDialogTitle>Delete Multiple Projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRows.size} project{selectedRows.size > 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRows.size} Project{selectedRows.size > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
