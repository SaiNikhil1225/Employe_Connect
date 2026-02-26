import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import {
  Users,
  UserPlus,
  Plus,
  Trash2,
  AlertTriangle,
  FolderOpen,
  Award,
  MoreVertical,
  Filter,
  X,
  Calendar,
  Search,
  Columns3,
  ChevronDown,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuthStore } from '@/store/authStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface Group {
  _id: string;
  groupId: string;
  groupName: string;
  description: string;
  groupType: string;
  department?: string;
  location?: string;
  status: string;
  memberCount: number;
  groupLead?: {
    employeeId: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface GroupMember {
  _id: string;
  groupId: string;
  employeeId: string;
  roleInGroup: string;
  assignedAt: string;
  status: string;
  employee?: {
    employeeId: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    location: string;
    profilePhoto?: string;
  };
  group?: {
    groupId: string;
    groupName: string;
    groupType: string;
  };
  allGroups?: Array<{
    groupId: string;
    groupName: string;
    groupType: string;
    roleInGroup: string;
  }>;
}

interface Stats {
  totalGroups: number;
  totalMembers: number;
  unassignedUsers: number;
  avgGroupSize: number;
}

export function TeamsMembers() {
  const { permissions } = useProfile();
  const user = useAuthStore((state) => state.user);
  const currentEmployeeId = user?.employeeId;
  const isHRUser = permissions.canEditEmployees; // HR can see all data

  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalMembers: 0,
    unassignedUsers: 0,
    avgGroupSize: 0,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [employees, setEmployees] = useState<Array<{ employeeId: string; name: string; email: string; department: string }>>([]);
  
  // Dialog states
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewMembersDialog, setShowViewMembersDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter selections for Show/Hide Filters section
  const [departmentTypeFilter, setDepartmentTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Search and column visibility states
  const [groupsSearchQuery, setGroupsSearchQuery] = useState('');
  const [membersSearchQuery, setMembersSearchQuery] = useState('');
  const [showGroupsColumnToggle, setShowGroupsColumnToggle] = useState(false);
  const [showMembersColumnToggle, setShowMembersColumnToggle] = useState(false);
  const [groupsColumnVisibility, setGroupsColumnVisibility] = useState<Record<string, boolean>>({});
  const [membersColumnVisibility, setMembersColumnVisibility] = useState<Record<string, boolean>>({});

  // Date range filtering states for stat cards
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // Form states
  const [groupForm, setGroupForm] = useState({
    groupName: '',
    description: '',
    groupType: 'custom',
    department: '',
    location: '',
    status: 'active',
    visibility: 'public',
  });

  const [memberForm, setMemberForm] = useState({
    groupId: '',
    employeeId: '',
    roleInGroup: 'member',
  });

  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchQuery) return employees;
    const query = employeeSearchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.employeeId.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  }, [employees, employeeSearchQuery]);

  // Filter data based on user role
  // HR users see all data, regular users see only their groups and team members
  const userGroups = useMemo(() => {
    if (isHRUser) {
      return groups; // HR sees all groups
    }
    // Regular users see only groups they are members of
    const userGroupIds = members
      .filter(m => m.employeeId === currentEmployeeId)
      .map(m => m.groupId);
    return groups.filter(g => userGroupIds.includes(g.groupId));
  }, [groups, members, currentEmployeeId, isHRUser]);

  const userMembers = useMemo(() => {
    if (isHRUser) {
      return members; // HR sees all members
    }
    // Regular users see only members from their groups
    const userGroupIds = members
      .filter(m => m.employeeId === currentEmployeeId)
      .map(m => m.groupId);
    return members.filter(m => userGroupIds.includes(m.groupId));
  }, [members, currentEmployeeId, isHRUser]);

  // Get unique values for filters (based on user's visible data)
  const uniqueGroupTypes = useMemo(() => {
    return Array.from(new Set(userGroups.map(g => g.groupType))).filter(Boolean).sort();
  }, [userGroups]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(userGroups.map(g => g.status))).filter(Boolean).sort();
  }, [userGroups]);

  const uniqueDepartments = useMemo(() => {
    const groupDepts = userGroups.map(g => g.department).filter(Boolean);
    const memberDepts = userMembers.map(m => m.employee?.department).filter(Boolean);
    return Array.from(new Set([...groupDepts, ...memberDepts])).filter((d): d is string => d !== undefined).sort();
  }, [userGroups, userMembers]);

  // Clear Show/Hide filter section
  const clearFilters = () => {
    setDepartmentTypeFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setFromDate(undefined);
    setToDate(undefined);
  };

  // Apply filters to groups (for tables - using Show/Hide filter section)
  const filteredGroups = useMemo(() => {
    let filtered = userGroups; // Use user-specific groups

    // Department Type filter
    if (departmentTypeFilter !== 'all') {
      filtered = filtered.filter(g => g.groupType === departmentTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(g => g.department === departmentFilter);
    }
    
    // Date range filter
    if (fromDate || toDate) {
      filtered = filtered.filter(g => {
        if (!g.createdAt) return false;
        const createdDate = new Date(g.createdAt);
        
        if (fromDate && toDate) {
          return createdDate >= fromDate && createdDate <= toDate;
        } else if (fromDate) {
          return createdDate >= fromDate;
        } else if (toDate) {
          return createdDate <= toDate;
        }
        return true;
      });
    }

    return filtered;
  }, [userGroups, departmentTypeFilter, statusFilter, departmentFilter, fromDate, toDate]);

  // Apply filters to members (for tables - using Show/Hide filter section)
  const filteredMembers = useMemo(() => {
    let filtered = userMembers; // Use user-specific members

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(m => m.employee?.department === departmentFilter);
    }

    // Status filter (filter by associated group status)
    if (statusFilter !== 'all') {
      const groupsWithStatus = userGroups.filter(g => g.status === statusFilter).map(g => g.groupId);
      filtered = filtered.filter(m => groupsWithStatus.includes(m.groupId));
    }
    
    // Apply date range filter
    if (fromDate || toDate) {
      filtered = filtered.filter(m => {
        if (!m.assignedAt) return false;
        const assignedDate = new Date(m.assignedAt);
        
        if (fromDate && toDate) {
          return assignedDate >= fromDate && assignedDate <= toDate;
        } else if (fromDate) {
          return assignedDate >= fromDate;
        } else if (toDate) {
          return assignedDate <= toDate;
        }
        return true;
      });
    }

    return filtered;
  }, [userMembers, departmentFilter, statusFilter, fromDate, toDate, userGroups]);
  
  // Apply search filter on top of other filters for groups
  const searchFilteredGroups = useMemo(() => {
    if (!groupsSearchQuery.trim()) return filteredGroups;
    
    const query = groupsSearchQuery.toLowerCase();
    return filteredGroups.filter(group => 
      group.groupName?.toLowerCase().includes(query) ||
      group.groupId?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      group.department?.toLowerCase().includes(query)
    );
  }, [filteredGroups, groupsSearchQuery]);
  
  // Apply search filter on top of other filters for members
  const searchFilteredMembers = useMemo(() => {
    if (!membersSearchQuery.trim()) return filteredMembers;
    
    const query = membersSearchQuery.toLowerCase();
    return filteredMembers.filter(member =>
      member.employee?.name?.toLowerCase().includes(query) ||
      member.employee?.employeeId?.toLowerCase().includes(query) ||
      member.employee?.email?.toLowerCase().includes(query) ||
      member.employee?.department?.toLowerCase().includes(query)
    );
  }, [filteredMembers, membersSearchQuery]);
  
  // Column toggle helpers
  const toggleGroupsColumnVisibility = (columnKey: string) => {
    setGroupsColumnVisibility(prev => ({
      ...prev,
      [columnKey]: prev[columnKey] === false ? true : false
    }));
  };
  
  const toggleMembersColumnVisibility = (columnKey: string) => {
    setMembersColumnVisibility(prev => ({
      ...prev,
      [columnKey]: prev[columnKey] === false ? true : false
    }));
  };
  
  // Export function
  const exportToExcel = () => {
    toast.success('Exporting data...');
    // TODO: Implement Excel export
  };

  // Compute filtered stats based on Show/Hide filters (affects stat cards)
  const filteredStats = useMemo(() => {
    let groupsToCount = userGroups;
    let membersToCount = userMembers;
    
    // Apply Department Type filter
    if (departmentTypeFilter !== 'all') {
      groupsToCount = groupsToCount.filter(g => g.groupType === departmentTypeFilter);
    }
    
    // Apply Status filter
    if (statusFilter !== 'all') {
      groupsToCount = groupsToCount.filter(g => g.status === statusFilter);
      // Also filter members by group status
      const groupIdsWithStatus = groupsToCount.map(g => g.groupId);
      membersToCount = membersToCount.filter(m => groupIdsWithStatus.includes(m.groupId));
    }
    
    // Apply Department filter
    if (departmentFilter !== 'all') {
      groupsToCount = groupsToCount.filter(g => g.department === departmentFilter);
      membersToCount = membersToCount.filter(m => m.employee?.department === departmentFilter);
    }

    // Apply date range filter
    if (fromDate || toDate) {
      groupsToCount = groupsToCount.filter(g => {
        if (!g.createdAt) return false;
        const createdDate = new Date(g.createdAt);
        if (fromDate && toDate) {
          return createdDate >= fromDate && createdDate <= toDate;
        } else if (fromDate) {
          return createdDate >= fromDate;
        } else if (toDate) {
          return createdDate <= toDate;
        }
        return true;
      });

      membersToCount = membersToCount.filter(m => {
        if (!m.assignedAt) return false;
        const assignedDate = new Date(m.assignedAt);
        if (fromDate && toDate) {
          return assignedDate >= fromDate && assignedDate <= toDate;
        } else if (fromDate) {
          return assignedDate >= fromDate;
        } else if (toDate) {
          return assignedDate <= toDate;
        }
        return true;
      });
    }

    // Calculate filtered stats
    const filteredTotalGroups = groupsToCount.length;
    const filteredTotalMembers = membersToCount.length;
    const filteredAvgGroupSize = filteredTotalGroups > 0 
      ? Math.round(filteredTotalMembers / filteredTotalGroups) 
      : 0;

    // Get unique employee IDs from filtered members
    const assignedEmployeeIds = new Set(membersToCount.map(m => m.employeeId));
    const totalEmployees = employees.length;
    const filteredUnassignedUsers = isHRUser 
      ? totalEmployees - assignedEmployeeIds.size
      : 0; // Not relevant for regular users

    return {
      totalGroups: filteredTotalGroups,
      totalMembers: filteredTotalMembers,
      unassignedUsers: Math.max(0, filteredUnassignedUsers),
      avgGroupSize: filteredAvgGroupSize
    };
  }, [userGroups, userMembers, departmentTypeFilter, statusFilter, departmentFilter, fromDate, toDate, isHRUser, employees]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch members
  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams/groups?limit=100');
      const result = await response.json();
      if (result.success) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');

    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams/members?limit=100');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');

    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      const result = await response.json();
      
      console.log('Employees API response:', result);
      
      // Handle different response formats
      let employeeData = [];
      if (Array.isArray(result)) {
        employeeData = result;
      } else if (result.data && Array.isArray(result.data)) {
        employeeData = result.data;
      } else if (result.employees && Array.isArray(result.employees)) {
        employeeData = result.employees;
      }
      
      const formattedEmployees = employeeData
        .filter((emp: any) => emp.status === 'active') // Only show active employees
        .map((emp: any) => ({
          employeeId: emp.employeeId || emp.id || '',
          name: emp.name || 'Unknown',
          email: emp.email || '',
          department: emp.department || 'N/A'
        }));
      
      console.log('Formatted employees:', formattedEmployees.length);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    setLoadingGroupMembers(true);
    try {
      const response = await fetch(`http://localhost:5000/api/teams/groups/${groupId}/members`);
      const result = await response.json();
      
      if (result.success) {
        setGroupMembers(result.data);
      } else {
        toast.error('Failed to fetch department members');
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load department members');
    } finally {
      setLoadingGroupMembers(false);
    }
  };

  const handleAddGroup = async () => {
    try {
      if (!groupForm.groupName || !groupForm.description) {
        toast.error('Department name and description are required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/teams/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...groupForm,
          createdBy: 'HR001', // TODO: Get from auth context
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Department created successfully');
        setShowAddGroupDialog(false);
        setGroupForm({
          groupName: '',
          description: '',
          groupType: 'custom',
          department: '',
          location: '',
          status: 'active',
          visibility: 'public',
        });
        fetchGroups();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create department');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`http://localhost:5000/api/teams/groups/${selectedGroup.groupId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Department deleted successfully');
        setShowDeleteDialog(false);
        setSelectedGroup(null);
        fetchGroups();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete department');
    }
  };

  const handleAddMember = async () => {
    try {
      if (!memberForm.groupId || !memberForm.employeeId) {
        toast.error('Please select both department and employee');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/teams/groups/${memberForm.groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: memberForm.employeeId,
          roleInGroup: memberForm.roleInGroup,
          assignedBy: 'HR001', // TODO: Get from auth context
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Member added successfully');
        setShowAddMemberDialog(false);
        setEmployeeSearchQuery('');
        setMemberForm({
          groupId: '',
          employeeId: '',
          roleInGroup: 'member',
        });
        fetchMembers();
        fetchGroups();
        fetchStats();
      } else {
        toast.error(result.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    }
  };

  const groupTypeColors: Record<string, string> = {
    department: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    project: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'task-force': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    committee: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'cross-functional': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    custom: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const groupColumns = [
    {
      key: 'groupId',
      label: 'Department ID',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'groupName',
      label: 'Department Name',
      sortable: true,
      render: (_value: any, row: Group) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <div className="font-semibold">{row.groupName}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {row.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'groupType',
      label: 'Type',
      sortable: true,
      render: (value: any) => (
        <Badge className={groupTypeColors[value] || groupTypeColors.custom}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'memberCount',
      label: 'Members',
      sortable: true,
      render: (value: any) => (
        <Badge variant="outline" className="font-semibold">
          {value} members
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any) => (
        <Badge className={statusColors[value]}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: Group) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedGroup(row);
              fetchGroupMembers(row.groupId);
              setShowViewMembersDialog(true);
            }}>
              <Users className="h-4 w-4 mr-2" />
              View Members
            </DropdownMenuItem>
            {isHRUser && (
              <DropdownMenuItem onClick={() => {
                setSelectedGroup(row);
                setShowDeleteDialog(true);
              }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Department
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const memberColumns = [
    {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      render: (_value: any, row: GroupMember) => (
        <div className="flex items-center gap-2">
          <EmployeeAvatar
            employee={{
              employeeId: row.employee?.employeeId || '',
              name: row.employee?.name || 'Unknown',
              profilePhoto: row.employee?.profilePhoto,
            }}
            size="sm"
          />
          <div>
            <div className="font-medium">{row.employee?.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.employee?.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_value: any, row: GroupMember) => row.employee?.email || 'N/A',
    },
    {
      key: 'allGroups',
      label: 'Groups',
      sortable: false,
      render: (value: any) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((group: any) => (
            <Badge key={group.groupId} variant="outline" className="text-xs">
              {group.groupName}
            </Badge>
          ))}
          {value?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'roleInGroup',
      label: 'Role',
      sortable: true,
      render: (value: any) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (_value: any, row: GroupMember) => row.employee?.department || 'N/A',
    },
    ...(isHRUser ? [{
      key: 'actions',
      label: 'Actions',
      render: () => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // TODO: Implement remove member
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }] : []),
  ];

  // Columns for group members dialog DataTable
  const groupMemberColumns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_value: any, row: GroupMember) => (
        <div className="flex items-center gap-2">
          <EmployeeAvatar
            employee={{
              employeeId: row.employee?.employeeId || '',
              name: row.employee?.name || 'Unknown',
              profilePhoto: row.employee?.profilePhoto,
            }}
            size="sm"
          />
          <div>
            <div className="font-medium">{row.employee?.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.employee?.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (_value: any, row: GroupMember) => row.employee?.email || 'N/A',
    },
    {
      key: 'department',
      label: 'Department',
      render: (_value: any, row: GroupMember) => row.employee?.department || 'N/A',
    },
    {
      key: 'designation',
      label: 'Designation',
      render: (_value: any, row: GroupMember) => row.employee?.designation || 'N/A',
    },
    {
      key: 'location',
      label: 'Location',
      render: (_value: any, row: GroupMember) => row.employee?.location || 'N/A',
    },
    {
      key: 'roleInGroup',
      label: 'Role',
      render: (value: any) => (
        <Badge 
          variant="secondary"
          className={
            value === 'lead' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : value === 'deputy'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : value === 'coordinator'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : ''
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Assigned Date',
      render: (value: any) => value ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A',
    },
    ...(isHRUser ? [{
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: GroupMember) => (
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
          onClick={async () => {
            if (!confirm(`Remove ${row.employee?.name} from this group?`)) return;
            
            try {
              const response = await fetch(
                `http://localhost:5000/api/teams/groups/${selectedGroup?.groupId}/members/${row.employeeId}`,
                { method: 'DELETE' }
              );
              const result = await response.json();
              
              if (result.success) {
                toast.success('Member removed successfully');
                fetchGroupMembers(selectedGroup!.groupId);
                fetchStats();
                fetchGroups();
              } else {
                toast.error(result.message || 'Failed to remove member');
              }
            } catch (error) {
              console.error('Error removing member:', error);
              toast.error('Failed to remove member');
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header Section - Matching WorkforceSummary UI */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Teams & Members</h2>
            <p className="text-sm text-muted-foreground">
              {isHRUser 
                ? 'Manage organizational departments and team assignments'
                : 'View your departments and team members'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)} 
            className="gap-2 h-10"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>

          {/* HR-only actions */}
          {isHRUser && (
            <>
              <Button onClick={() => setShowAddMemberDialog(true)} variant="outline" className="h-10">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button onClick={() => setShowAddGroupDialog(true)} className="h-10">
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Filter Section */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Departments & Members</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department Type</Label>
                <Select value={departmentTypeFilter} onValueChange={setDepartmentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueGroupTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards - Matching WorkforceSummary UI */}
      <div className={`grid gap-4 ${isHRUser ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm cursor-pointer" onClick={() => setActiveTab('groups')}>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHRUser ? 'Total Departments' : 'My Departments'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{filteredStats.totalGroups}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) ? 'Filtered results' : isHRUser ? 'All departments' : 'Your departments'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm cursor-pointer" onClick={() => setActiveTab('members')}>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHRUser ? 'Total Members' : 'Team Members'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{filteredStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) ? 'Filtered results' : isHRUser ? 'All members' : 'Your team'}
            </p>
          </CardContent>
        </Card>

        {isHRUser && (
          <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm cursor-pointer" onClick={() => setActiveTab('members')}>
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{filteredStats.unassignedUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) ? 'Filtered results' : 'Users without departments'}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-md transition-shadow rounded-xl shadow-sm cursor-pointer" onClick={() => setActiveTab('groups')}>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Department Size</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{filteredStats.avgGroupSize}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) ? 'Filtered average' : 'Average members'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="groups">
              <FolderOpen className="h-4 w-4 mr-2" />
              {isHRUser ? 'Groups' : 'My Groups'} ({userGroups.length})
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              {isHRUser ? 'Members' : 'Team Members'} ({userMembers.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="groups" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{isHRUser ? 'All Departments' : 'My Departments'}</CardTitle>
                  <CardDescription className="mt-1">
                    {searchFilteredGroups.length} {searchFilteredGroups.length === 1 ? 'department' : 'departments'}
                    {(departmentTypeFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) && ' (filtered)'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search departments..."
                      value={groupsSearchQuery}
                      onChange={(e) => setGroupsSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-9"
                    />
                    {groupsSearchQuery && (
                      <button
                        onClick={() => setGroupsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Column Toggle */}
                  <DropdownMenu open={showGroupsColumnToggle} onOpenChange={setShowGroupsColumnToggle}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        <Columns3 className="h-4 w-4" />
                        Columns
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {groupColumns
                        .filter(col => !['groupId', 'groupName', 'actions'].includes(col.key))
                        .map(col => (
                          <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={groupsColumnVisibility[col.key] !== false}
                            onCheckedChange={() => toggleGroupsColumnVisibility(col.key)}
                          >
                            {col.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        <Download className="h-4 w-4" />
                        Export
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportToExcel}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export to Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={groupColumns.map(col => ({
                  ...col,
                  hidden: ['groupId', 'groupName', 'actions'].includes(col.key) ? false : groupsColumnVisibility[col.key] === false
                }))}
                data={searchFilteredGroups}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{isHRUser ? 'All Members' : 'My Team Members'}</CardTitle>
                  <CardDescription className="mt-1">
                    {searchFilteredMembers.length} {searchFilteredMembers.length === 1 ? 'member' : 'members'}
                    {(departmentFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate) && ' (filtered)'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={membersSearchQuery}
                      onChange={(e) => setMembersSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-9"
                    />
                    {membersSearchQuery && (
                      <button
                        onClick={() => setMembersSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Column Toggle */}
                  <DropdownMenu open={showMembersColumnToggle} onOpenChange={setShowMembersColumnToggle}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        <Columns3 className="h-4 w-4" />
                        Columns
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {memberColumns
                        .filter(col => !['employee', 'actions'].includes(col.key))
                        .map(col => (
                          <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={membersColumnVisibility[col.key] !== false}
                            onCheckedChange={() => toggleMembersColumnVisibility(col.key)}
                          >
                            {col.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        <Download className="h-4 w-4" />
                        Export
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportToExcel}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export to Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={memberColumns.map(col => ({
                  ...col,
                  hidden: ['employee', 'actions'].includes(col.key) ? false : membersColumnVisibility[col.key] === false
                }))}
                data={searchFilteredMembers}
                searchable={false}
                hideColumnToggle={true}
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Add a new organizational department or team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Department Name *</Label>
              <Input
                id="groupName"
                placeholder="e.g., Engineering Department"
                value={groupForm.groupName}
                onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the department..."
                rows={3}
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupType">Department Type</Label>
                <Select
                  value={groupForm.groupType}
                  onValueChange={(value) => setGroupForm({ ...groupForm, groupType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="project">Project Team</SelectItem>
                    <SelectItem value="task-force">Task Force</SelectItem>
                    <SelectItem value="committee">Committee</SelectItem>
                    <SelectItem value="cross-functional">Cross-functional</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={groupForm.status}
                  onValueChange={(value) => setGroupForm({ ...groupForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGroupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGroup}>Create Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={(open) => {
        setShowAddMemberDialog(open);
        if (!open) setEmployeeSearchQuery('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Department</DialogTitle>
            <DialogDescription>
              Assign an employee to a department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="selectGroup">Select Department *</Label>
              <Select
                value={memberForm.groupId}
                onValueChange={(value) => setMemberForm({ ...memberForm, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.groupId} value={group.groupId}>
                      {group.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selectEmployee">Employee *</Label>
              <Select
                value={memberForm.employeeId}
                onValueChange={(value) => setMemberForm({ ...memberForm, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <Input
                      placeholder="Search by ID, name, department..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        {employeeSearchQuery ? 'No employees found' : 'No employees available'}
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.employeeId} - {employee.name} ({employee.department})
                        </SelectItem>
                      ))
                    )}
                  </div>
                  {employeeSearchQuery && filteredEmployees.length > 0 && (
                    <div className="sticky bottom-0 bg-background border-t p-2">
                      <p className="text-xs text-muted-foreground text-center">
                        Showing {filteredEmployees.length} of {employees.length} employees
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleInGroup">Role in Group</Label>
              <Select
                value={memberForm.roleInGroup}
                onValueChange={(value) => setMemberForm({ ...memberForm, roleInGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="deputy">Deputy Lead</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddMemberDialog(false);
              setEmployeeSearchQuery('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={showViewMembersDialog} onOpenChange={setShowViewMembersDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedGroup?.groupName} - Members
            </DialogTitle>
            <DialogDescription>
              View and manage members of this department
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {loadingGroupMembers ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                  <p className="text-sm text-muted-foreground">Loading members...</p>
                </div>
              </div>
            ) : groupMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No Members Yet</h3>
                <p className="text-sm text-muted-foreground">
                  This department doesn't have any members assigned.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-semibold">
                      {groupMembers.length} {groupMembers.length === 1 ? 'Member' : 'Members'}
                    </Badge>
                    <Badge className={groupTypeColors[selectedGroup?.groupType || 'custom']}>
                      {selectedGroup?.groupType}
                    </Badge>
                  </div>
                </div>
                
                <DataTable
                  columns={groupMemberColumns}
                  data={groupMembers}
                  searchPlaceholder="Search members..."
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowViewMembersDialog(false);
                setGroupMembers([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGroup?.groupName}"?
              {selectedGroup?.memberCount && selectedGroup.memberCount > 0 ? (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  This department has {selectedGroup.memberCount} member(s). Please remove all members before deleting.
                </span>
              ) : (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={selectedGroup?.memberCount ? selectedGroup.memberCount > 0 : false}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
