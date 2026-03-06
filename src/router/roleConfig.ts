import type { UserRole } from '@/types';

export type RoutePermission = {
  path: string;
  label: string;
  icon?: string;
  roles: UserRole[];
  children?: {
    path: string;
    label: string;
    icon?: string;
    roles?: UserRole[];
  }[];
};

export const rolePermissions: Record<UserRole, string[]> = {
  EMPLOYEE: [
    '/dashboard',
    '/profile',
    '/my-team',
    '/employee/my-attendance-enhanced',
    '/leave',
    '/payroll',
    '/performance',
    '/documents',
    '/employees-directory',
    '/helpdesk',
    '/financeadmin/tickets',
    '/facilitiesadmin/tickets',
    '/rmg/timesheet',
    '/rmg/employee-hours-report',
  ],
  MANAGER: [
    '/dashboard',
    '/manager/dashboard',
    '/manager/leave-approvals',
    '/manager/attendance-approvals',
    '/profile',
    '/my-team',
    '/employee/my-attendance-enhanced',
    '/leave',
    '/payroll',
    '/performance',
    '/documents',
    '/helpdesk',
    '/employees-directory',
    '/rmg/timesheet',
    '/rmg/employee-hours-report',
  ],
  IT_ADMIN: [
    '/dashboard',
    '/itadmin/dashboard',
    '/itadmin/tickets',
    '/profile',
    '/my-team',
    '/employee/my-attendance-enhanced',
    '/leave',
    '/payroll',
    '/performance',
    '/documents',
    '/employees-directory',
  ],
  IT_EMPLOYEE: [
    '/dashboard',
    '/itadmin/tickets',
    '/profile',
    '/my-team',
    '/employee/my-attendance-enhanced',
    '/leave',
    '/payroll',
    '/performance',
    '/documents',
    '/employees-directory',
  ],
  L1_APPROVER: [
    '/dashboard',
    '/approver',
    '/profile',
    '/employees-directory',
  ],
  L2_APPROVER: [
    '/dashboard',
    '/approver',
    '/profile',
    '/employees-directory',
  ],
  L3_APPROVER: [
    '/dashboard',
    '/approver',
    '/profile',
    '/employees-directory',
  ],
  SUPER_ADMIN: [
    '/dashboard',
    '/superadmin/dashboard',
    '/superadmin/categories',
    '/superadmin/approvers',
    '/superadmin/users',
    '/superadmin/permissions',
    '/superadmin/leave-policies',
    '/superadmin/holidays',
    '/superadmin/holiday-config',
    '/superadmin/helpdesk-config',
    '/superadmin/region-regex-config',
    '/profile',
    '/employees-directory',
    // Full access to all routes
    '/my-team',
    '/employee/my-attendance-enhanced',
    '/leave',
    '/payroll',
    '/performance',
    '/documents',
    '/helpdesk',
    '/approver',
    '/itadmin/dashboard',
    '/itadmin/tickets',
    '/manager/dashboard',
    '/manager/leave-approvals',
    '/payroll-management',
    '/performance-management',
    '/utilization',
    '/new-announcement',
    '/rmg/customers',
    '/rmg/projects',
    '/rmg/financial-lines',
    '/rmg/customer-pos',
  ],
  HR: [
    '/dashboard',
    '/profile',
    '/my-team',
    '/employees-directory',
    '/employees',
    '/hr/attendance-overview',
    '/payroll-management',
    '/performance-management',
    '/new-announcement',
    '/admin-announcements',
    '/hr/workforce-summary',
    '/hr/leave-attendance-overview',
    '/hr/recognition-celebrations',
  ],
  RMG: [
    '/dashboard',
    '/utilization',
    '/rmg/customers',
    '/rmg/projects',
    '/rmg/financial-lines',
    '/rmg/customer-pos',
    '/rmg/configuration',
    '/rmg/uda-configuration',
    '/rmg/timesheet',
    '/rmg/employee-hours-report',
    '/rmg/employees',
  ],
  FINANCE_ADMIN: [
    '/dashboard',
    '/financeadmin/dashboard',
    '/financeadmin/tickets',
    '/profile',
    '/employees-directory',
  ],
  FACILITIES_ADMIN: [
    '/dashboard',
    '/facilitiesadmin/dashboard',
    '/facilitiesadmin/tickets',
    '/profile',
    '/employees-directory',
  ],
};

export const navigationConfig: RoutePermission[] = [
  // Common Dashboard
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    roles: ['EMPLOYEE', 'MANAGER', 'IT_ADMIN', 'IT_EMPLOYEE', 'L1_APPROVER', 'L2_APPROVER', 'L3_APPROVER', 'RMG', 'FINANCE_ADMIN', 'FACILITIES_ADMIN'],
  },
  // Super Admin Routes
  {
    path: '/superadmin/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/superadmin/users',
    label: 'User Management',
    icon: 'Users',
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/superadmin/approval-flow',
    label: 'Approval Flow',
    icon: 'GitBranch',
    roles: ['SUPER_ADMIN'],
    children: [
      {
        path: '/superadmin/categories',
        label: 'Category Management',
        icon: 'FolderCog',
      },
      {
        path: '/superadmin/helpdesk-config',
        label: 'Helpdesk Config',
        icon: 'Headset',
      },
    ],
  },
  {
    path: '/superadmin/region-regex-config',
    label: 'Regex Validation',
    icon: 'Globe',
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/superadmin/permissions',
    label: 'Module Permissions',
    icon: 'Shield',
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/superadmin/leave-policies',
    label: 'Leave Policy Config',
    icon: 'Calendar',
    roles: ['SUPER_ADMIN'],
  },
  {
    path: '/superadmin/holidays',
    label: 'Holidays',
    icon: 'CalendarDays',
    roles: ['SUPER_ADMIN'],
    children: [
      {
        path: '/superadmin/holidays',
        label: 'Calendar',
        icon: 'Calendar',
      },
      {
        path: '/superadmin/holiday-config',
        label: 'Configuration',
        icon: 'Settings',
      },
    ],
  },
  // Approver Routes
  {
    path: '/approver',
    label: 'Approvals',
    icon: 'CheckSquare',
    roles: ['L1_APPROVER', 'L2_APPROVER', 'L3_APPROVER'],
  },
  // Employee Routes - Me Section
  {
    path: '/me',
    label: 'Me',
    icon: 'User',
    roles: ['EMPLOYEE', 'MANAGER', 'IT_ADMIN'],
    children: [
      {
        path: '/leave',
        label: 'Leave',
        icon: 'Calendar',
      },
      {
        path: '/employee/my-attendance-enhanced',
        label: 'Attendance',
        icon: 'Clock',
      },
      {
        path: '/performance',
        label: 'Performance',
        icon: 'TrendingUp',
      },
      {
        path: '/rmg/timesheet',
        label: 'Timesheet',
        icon: 'Clock',
      },
      {
        path: '/rmg/employee-hours-report',
        label: 'Productivity',
        icon: 'BarChart3',
      },
    ],
  },
  {
    path: '/payroll',
    label: 'My Payroll',
    icon: 'DollarSign',
    roles: ['EMPLOYEE', 'MANAGER', 'IT_ADMIN'],
  },
  // Organization Section
  {
    path: '/organization',
    label: 'Organization',
    icon: 'Network',
    roles: ['EMPLOYEE', 'MANAGER', 'IT_ADMIN', 'IT_EMPLOYEE'],
    children: [
      {
        path: '/my-team',
        label: 'My Team',
        icon: 'Users',
      },
      {
        path: '/employees-directory',
        label: 'Employee Directory',
        icon: 'Users',
      },
    ],
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: 'FileText',
    roles: ['EMPLOYEE', 'MANAGER', 'IT_ADMIN'],
  },
  {
    path: '/helpdesk',
    label: 'Helpdesk',
    icon: 'Headphones',
    roles: ['EMPLOYEE', 'MANAGER'],
  },
  // Manager Routes
  {
    path: '/manager/leave-approvals',
    label: 'Leave Approvals',
    icon: 'ClipboardCheck',
    roles: ['MANAGER'],
  },
  {
    path: '/manager/attendance-approvals',
    label: 'Attendance Approvals',
    icon: 'CalendarCheck',
    roles: ['MANAGER'],
  },
  // IT Admin Routes
  {
    path: '/itadmin/dashboard',
    label: 'IT Admin Dashboard',
    icon: 'Shield',
    roles: ['IT_ADMIN'],
  },
  {
    path: '/itadmin/tickets',
    label: 'Ticket Management',
    icon: 'Ticket',
    roles: ['IT_ADMIN', 'IT_EMPLOYEE'],
  },
  // Finance Admin Routes
  {
    path: '/financeadmin/dashboard',
    label: 'Finance Admin Dashboard',
    icon: 'Wallet',
    roles: ['FINANCE_ADMIN'],
  },
  {
    path: '/financeadmin/tickets',
    label: 'Finance Tickets',
    icon: 'Ticket',
    roles: ['FINANCE_ADMIN', 'EMPLOYEE'],
  },

  // Facilities Admin Routes
  {
    path: '/facilitiesadmin/dashboard',
    label: 'Facilities Admin Dashboard',
    icon: 'Building2',
    roles: ['FACILITIES_ADMIN'],
  },
  {
    path: '/facilitiesadmin/tickets',
    label: 'Facilities Tickets',
    icon: 'Ticket',
    roles: ['FACILITIES_ADMIN', 'EMPLOYEE'],
  },

  // HR Routes
  {
    path: '/hr/workforce-summary',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    roles: ['HR'],
  },
  {
    path: '/hr/attendance-overview',
    label: 'Attendance Overview',
    icon: 'CalendarCheck',
    roles: ['HR'],
  },
  {
    path: '/hr/leave-attendance-overview',
    label: 'Leave Approvals',
    icon: 'ClipboardList',
    roles: ['HR'],
  },
  {
    path: '/performance-management',
    label: 'Performance Overview',
    icon: 'Target',
    roles: ['HR'],
  },
  {
    path: '/hr/recognition-celebrations',
    label: 'Recognition & Celebrations',
    icon: 'Award',
    roles: ['HR'],
  },
  {
    path: '/admin-announcements',
    label: 'Engagement & Communication',
    icon: 'Megaphone',
    roles: ['HR'],
  },
  {
    path: '/payroll-management',
    label: 'Payroll Management',
    icon: 'Wallet',
    roles: ['HR'],
  },
  // RMG Routes
  {
    path: '/utilization',
    label: 'Utilization',
    icon: 'Activity',
    roles: ['RMG'],
  },
  {
    path: '/rmg/employees',
    label: 'Employees',
    icon: 'Users',
    roles: ['RMG'],
  },
  {
    path: '/rmg/customers',
    label: 'Customers',
    icon: 'Users',
    roles: ['RMG'],
  },
  {
    path: '/rmg/projects',
    label: 'Projects',
    icon: 'FolderKanban',
    roles: ['RMG'],
  },
  {
    path: '/rmg/configuration',
    label: 'Configuration',
    icon: 'Settings',
    roles: ['RMG'],
  },
  {
    path: '/rmg/uda-configuration',
    label: 'UDA Configuration',
    icon: 'Settings2',
    roles: ['RMG'],
  },
];

export function hasPermission(userRole: UserRole, path: string): boolean {
  return rolePermissions[userRole]?.includes(path) || false;
}

export function getNavigationForRole(userRole: UserRole): RoutePermission[] {
  return navigationConfig.filter((nav) => nav.roles.includes(userRole));
}
