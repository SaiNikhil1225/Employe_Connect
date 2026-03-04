import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/auth/Login';
import { NotAuthorized } from '@/pages/errors/NotAuthorized';
import { Dashboard } from '@/pages/Dashboard';

// Employee Pages
import { Profile } from '@/pages/employee/Profile';
import { MyTeam } from '@/pages/employee/MyTeam';
import MyAttendance from '@/pages/employee/MyAttendance';
import { Leave } from '@/pages/employee/Leave';
import { Payroll } from '@/pages/employee/Payroll';
import { Performance } from '@/pages/employee/Performance';
import { Documents } from '@/pages/employee/Documents';
import Helpdesk from '@/pages/employee/Helpdesk';
import { EmployeeDirectory } from '@/pages/employee/EmployeeDirectory';

// Manager Pages
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard';
import { ManagerLeaveApprovals } from '@/pages/manager/ManagerLeaveApprovals';

// IT Admin Pages
import { ITAdminDashboard } from '@/pages/itadmin/ITAdminDashboard';
import { ITTicketManagement } from '@/pages/itadmin/ITTicketManagement';

// Finance Admin Pages
import { FinanceAdminDashboard } from '@/pages/financeadmin/FinanceAdminDashboard';
import { FinanceTicketManagement } from '@/pages/financeadmin/FinanceTicketManagement';

// Facilities Admin Pages
import { FacilitiesAdminDashboard } from '@/pages/facilitiesadmin/FacilitiesAdminDashboard';
import { FacilitiesTicketManagement } from '@/pages/facilitiesadmin/FacilitiesTicketManagement';

// Approver Pages
import ApproverPage from '@/pages/approver/ApproverPage';

// HR Pages
import AttendanceOverview from '@/pages/hr/AttendanceOverview';
import { PayrollManagement } from '@/pages/hr/PayrollManagement';
import { PerformanceManagement } from '@/pages/hr/PerformanceManagement';
import { NewAnnouncement } from '@/pages/hr/NewAnnouncement';
import { AdminAnnouncements } from '@/pages/hr/AdminAnnouncements';
import { WorkforceSummary } from '@/pages/hr/WorkforceSummary';
import { RecognitionCelebrations } from '@/pages/hr/RecognitionCelebrations';

// RMG Pages
import { Utilization } from '@/pages/rmg/Utilization';
import { CustomerListPage } from '@/pages/rmg/customers/CustomerListPage';
import { ProjectListPage } from '@/pages/rmg/projects/ProjectListPage';
import { ProjectDetailPage } from '@/pages/rmg/projects/ProjectDetailPage';
import { FinancialLineListPage } from '@/pages/rmg/financial-lines/FinancialLineListPage';
import { CustomerPOListPage } from '@/pages/rmg/customer-pos/CustomerPOListPage';
import ConfigurationPage from '@/pages/rmg/ConfigurationPage';
import WeeklyTimesheet from '@/pages/rmg/uda-configuration/WeeklyTimesheet';
import { UDAConfigurationPage } from '@/pages/rmg/uda-configuration/UDAConfigurationPage';
import EmployeeHoursReport from '@/pages/rmg/uda-configuration/EmployeeHoursReport';

// Super Admin Pages
import { SuperAdminDashboard } from '@/pages/superadmin/SuperAdminDashboard';
import { CategoryManagement } from '@/pages/superadmin/CategoryManagement';
import { UserManagement } from '@/pages/superadmin/UserManagement';
import { ApproverOverview } from '@/pages/superadmin/ApproverOverview';
import LeavePolicyConfig from '@/pages/superadmin/LeavePolicyConfig';
import PermissionsMatrix from '@/pages/superadmin/PermissionsMatrix';
import { HolidayManagement } from '@/pages/superadmin/HolidayManagement';
import { HolidayConfiguration } from '@/pages/superadmin/HolidayConfiguration';
import HelpdeskConfig from '@/pages/superadmin/HelpdeskConfig';
import RegionRegexConfig from '@/pages/superadmin/RegionRegexConfig';

// Wrapper component for viewing other employee profiles
function ProfileWithParams() {
  const { employeeId } = useParams<{ employeeId: string }>();
  return <Profile employeeId={employeeId} />;
}

function DefaultRedirect() {
  const user = useAuthStore((state) => state.user);
  
  // Redirect based on user role
  if (user?.role === 'HR') {
    return <Navigate to="/hr/workforce-summary" replace />;
  }
  
  // Default to dashboard for other roles
  return <Navigate to="/dashboard" replace />;
}

export function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <DefaultRedirect /> : <Login />}
        />
        <Route path="/403" element={<NotAuthorized />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <DefaultRedirect />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route element={<DashboardLayout />}>
          {/* Common Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPath="/dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredPath="/profile">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile/:employeeId"
            element={
              <ProtectedRoute requiredPath="/my-team">
                <ProfileWithParams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-team"
            element={
              <ProtectedRoute requiredPath="/my-team">
                <MyTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/my-attendance"
            element={
              <ProtectedRoute requiredPath="/employee/my-attendance">
                <MyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave"
            element={
              <ProtectedRoute requiredPath="/leave">
                <Leave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute requiredPath="/payroll">
                <Payroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute requiredPath="/performance">
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute requiredPath="/documents">
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helpdesk"
            element={
              <ProtectedRoute requiredPath="/helpdesk">
                <Helpdesk />
              </ProtectedRoute>
            }
          />

          {/* Common Routes (All Roles) */}
          <Route
            path="/employees-directory"
            element={
              <ProtectedRoute requiredPath="/employees-directory">
                <EmployeeDirectory />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredPath="/manager/dashboard">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/leave-approvals"
            element={
              <ProtectedRoute requiredPath="/manager/leave-approvals">
                <ManagerLeaveApprovals />
              </ProtectedRoute>
            }
          />

          {/* IT Admin Routes */}
          <Route
            path="/itadmin/dashboard"
            element={
              <ProtectedRoute requiredPath="/itadmin/dashboard">
                <ITAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itadmin/tickets"
            element={
              <ProtectedRoute requiredPath="/itadmin/tickets">
                <ITTicketManagement />
              </ProtectedRoute>
            }
          />
          {/* Finance Admin Routes */}
          <Route
            path="/financeadmin/dashboard"
            element={
              <ProtectedRoute requiredPath="/financeadmin/dashboard">
                <FinanceAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeadmin/tickets"
            element={
              <ProtectedRoute requiredPath="/financeadmin/tickets">
                <FinanceTicketManagement />
              </ProtectedRoute>
            }
          />

          {/* Facilities Admin Routes */}
          <Route
            path="/facilitiesadmin/dashboard"
            element={
              <ProtectedRoute requiredPath="/facilitiesadmin/dashboard">
                <FacilitiesAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilitiesadmin/tickets"
            element={
              <ProtectedRoute requiredPath="/facilitiesadmin/tickets">
                <FacilitiesTicketManagement />
              </ProtectedRoute>
            }
          />

          {/* Approver Routes */}
          <Route
            path="/approver"
            element={
              <ProtectedRoute requiredPath="/approver">
                <ApproverPage />
              </ProtectedRoute>
            }
          />

          {/* HR Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredPath="/employees">
                <EmployeeDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/attendance-overview"
            element={
              <ProtectedRoute requiredPath="/hr/attendance-overview">
                <AttendanceOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll-management"
            element={
              <ProtectedRoute requiredPath="/payroll-management">
                <PayrollManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance-management"
            element={
              <ProtectedRoute requiredPath="/performance-management">
                <PerformanceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-announcement"
            element={
              <ProtectedRoute requiredPath="/new-announcement">
                <NewAnnouncement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-announcements"
            element={
              <ProtectedRoute requiredPath="/admin-announcements">
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/workforce-summary"
            element={
              <ProtectedRoute requiredPath="/hr/workforce-summary">
                <WorkforceSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave-attendance-overview"
            element={
              <ProtectedRoute requiredPath="/hr/leave-attendance-overview">
                <ManagerLeaveApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/recognition-celebrations"
            element={
              <ProtectedRoute requiredPath="/hr/recognition-celebrations">
                <RecognitionCelebrations />
              </ProtectedRoute>
            }
          />

          {/* RMG Routes */}
          <Route
            path="/utilization"
            element={
              <ProtectedRoute requiredPath="/utilization">
                <Utilization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/employees"
            element={
              <ProtectedRoute requiredPath="/rmg/employees">
                <EmployeeDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/customers"
            element={
              <ProtectedRoute requiredPath="/rmg/customers">
                <CustomerListPage />
              </ProtectedRoute>
            }
          />
          <Route            path="/rmg/financial-lines"
            element={
              <ProtectedRoute requiredPath="/rmg/financial-lines">
                <FinancialLineListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/customer-pos"
            element={
              <ProtectedRoute requiredPath="/rmg/customer-pos">
                <CustomerPOListPage />
              </ProtectedRoute>
            }
          />
          <Route            path="/rmg/projects"
            element={
              <ProtectedRoute requiredPath="/rmg/projects">
                <ProjectListPage />
              </ProtectedRoute>
            }
          />
          <Route            path="/rmg/projects/:id"
            element={
              <ProtectedRoute requiredPath="/rmg/projects">
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/configuration"
            element={
              <ProtectedRoute requiredPath="/rmg/configuration">
                <ConfigurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/uda-configuration"
            element={
              <ProtectedRoute requiredPath="/rmg/uda-configuration">
                <UDAConfigurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/timesheet"
            element={
              <ProtectedRoute requiredPath="/rmg/timesheet">
                <WeeklyTimesheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rmg/employee-hours-report"
            element={
              <ProtectedRoute requiredPath="/rmg/employee-hours-report">
                <EmployeeHoursReport />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute requiredPath="/superadmin/dashboard">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/categories"
            element={
              <ProtectedRoute requiredPath="/superadmin/categories">
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute requiredPath="/superadmin/users">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/approvers"
            element={
              <ProtectedRoute requiredPath="/superadmin/approvers">
                <ApproverOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/permissions"
            element={
              <ProtectedRoute requiredPath="/superadmin/permissions">
                <PermissionsMatrix />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/leave-policies"
            element={
              <ProtectedRoute requiredPath="/superadmin/leave-policies">
                <LeavePolicyConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/holidays"
            element={
              <ProtectedRoute requiredPath="/superadmin/holidays">
                <HolidayManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/holiday-config"
            element={
              <ProtectedRoute requiredPath="/superadmin/holiday-config">
                <HolidayConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/helpdesk-config"
            element={
              <ProtectedRoute requiredPath="/superadmin/helpdesk-config">
                <HelpdeskConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/region-regex-config"
            element={
              <ProtectedRoute requiredPath="/superadmin/region-regex-config">
                <RegionRegexConfig />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
        </Route>

        {/* Catch all - redirect to 403 */}
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
