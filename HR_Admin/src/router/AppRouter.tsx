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
import { Attendance } from '@/pages/employee/Attendance';
import { Leave } from '@/pages/employee/Leave';
import { Payroll } from '@/pages/employee/Payroll';
import { Performance } from '@/pages/employee/Performance';
import { Documents } from '@/pages/employee/Documents';
import Helpdesk from '@/pages/employee/Helpdesk';

// Manager Pages
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard';
import { ManagerLeaveApprovals } from '@/pages/manager/ManagerLeaveApprovals';

// IT Admin Pages
import { ITAdminDashboard } from '@/pages/itadmin/ITAdminDashboard';
import { ITTicketManagement } from '@/pages/itadmin/ITTicketManagement';
import { ITAnalytics } from '@/pages/itadmin/ITAnalytics';

// Approver Pages
import ApproverPage from '@/pages/approver/ApproverPage';

// HR Pages
import { EmployeeManagement } from '@/pages/hr/EmployeeManagement';
import { EmployeeDirectory } from '@/pages/hr/EmployeeDirectory';
import { AttendanceManagement } from '@/pages/hr/AttendanceManagement';
import { LeaveManagement } from '@/pages/hr/LeaveManagement';
import { LeavePlansManagement } from '@/pages/hr/LeavePlansManagement';
import { PayrollManagement } from '@/pages/hr/PayrollManagement';
import { Recruitment } from '@/pages/hr/Recruitment';
import { PerformanceManagement } from '@/pages/hr/PerformanceManagement';
import { DiversityInclusion } from '@/pages/hr/DiversityInclusion';
import { NewAnnouncement } from '@/pages/hr/NewAnnouncement';
import { AdminAnnouncements } from '@/pages/hr/AdminAnnouncements';
import { TrainingDashboard } from '@/pages/hr/TrainingDashboard';
import { AddTrainingForm } from '@/pages/hr/AddTrainingForm';
import { MyTrainingDevelopment } from '@/pages/hruser/MyTrainingDevelopment';
import { RecognitionCelebrations } from '@/pages/hr/RecognitionCelebrations';
import { TeamsMembers } from '@/pages/hr/TeamsMembers';
import { LeaveAttendanceOverview } from '@/pages/hr/LeaveAttendanceOverview';
import { WorkforceSummary } from '@/pages/hr/WorkforceSummary';

// RMG Pages
import { ResourcePool } from '@/pages/rmg/ResourcePool';
import { Allocations } from '@/pages/rmg/Allocations';
import { Utilization } from '@/pages/rmg/Utilization';
import { Forecasting } from '@/pages/rmg/Forecasting';

// Super Admin Pages
import { SuperAdminDashboard } from '@/pages/superadmin/SuperAdminDashboard';
import { CategoryManagement } from '@/pages/superadmin/CategoryManagement';
import { UserManagement } from '@/pages/superadmin/UserManagement';
import { ApproverOverview } from '@/pages/superadmin/ApproverOverview';

// Common Pages
import { Reports } from '@/pages/Reports';
import { Employees } from '@/pages/Employees';

// Onboarding Pages
import OnboardingList from '@/pages/onboarding/OnboardingList';
import OnboardingDashboard from '@/pages/onboarding/OnboardingDashboard';

// Hiring Pages
import {
  MyHiringRequestsPage,
  AllHiringRequestsPage,
  HiringRequestFormPage,
  HiringRequestDetailsPage,
} from '@/pages/hiring';

// Wrapper component for viewing other employee profiles
function ProfileWithParams() {
  const { employeeId } = useParams<{ employeeId: string }>();
  return <Profile employeeId={employeeId} />;
}

// Wrapper component for onboarding dashboard
function OnboardingDashboardWithParams() {
  const { employeeId } = useParams<{ employeeId: string }>();
  return <OnboardingDashboard />;
}

export function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route path="/403" element={<NotAuthorized />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
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
              <ProtectedRoute requiredPath="/employees-directory">
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
            path="/attendance"
            element={
              <ProtectedRoute requiredPath="/attendance">
                <Attendance />
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
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* Onboarding Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requiredPath="/onboarding">
                <OnboardingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/:employeeId"
            element={
              <ProtectedRoute requiredPath="/onboarding">
                <OnboardingDashboardWithParams />
              </ProtectedRoute>
            }
          />

          {/* Hiring Routes */}
          <Route
            path="/hiring/my-requests"
            element={
              <ProtectedRoute requiredPath="/hiring/my-requests">
                <MyHiringRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring/all-requests"
            element={
              <ProtectedRoute requiredPath="/hiring/all-requests">
                <AllHiringRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring/new"
            element={
              <ProtectedRoute requiredPath="/hiring/new">
                <HiringRequestFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring/edit/:id"
            element={
              <ProtectedRoute requiredPath="/hiring/edit/:id">
                <HiringRequestFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring/:id"
            element={
              <ProtectedRoute requiredPath="/hiring/:id">
                <HiringRequestDetailsPage />
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
          <Route
            path="/itadmin/analytics"
            element={
              <ProtectedRoute requiredPath="/itadmin/analytics">
                <ITAnalytics />
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
            path="/hr/workforce-summary"
            element={
              <ProtectedRoute requiredPath="/hr/workforce-summary">
                <WorkforceSummary />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/employees"
            element={
              <ProtectedRoute requiredPath="/employees">
                <EmployeeManagement />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/employees-directory"
            element={
              <ProtectedRoute requiredPath="/employees-directory">
                <EmployeeDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance-management"
            element={
              <ProtectedRoute requiredPath="/attendance-management">
                <AttendanceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-management"
            element={
              <ProtectedRoute requiredPath="/leave-management">
                <LeaveManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-plans"
            element={
              <ProtectedRoute requiredPath="/leave-plans">
                <LeavePlansManagement />
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
            path="/recruitment"
            element={
              <ProtectedRoute requiredPath="/recruitment">
                <Recruitment />
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
            path="/diversity-inclusion"
            element={
              <ProtectedRoute requiredPath="/diversity-inclusion">
                <DiversityInclusion />
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
            path="/hr/training"
            element={
              <ProtectedRoute requiredPath="/hr/training">
                <TrainingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/training/add"
            element={
              <ProtectedRoute requiredPath="/hr/training/add">
                <AddTrainingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-training-development"
            element={
              <ProtectedRoute requiredPath="/my-training-development">
                <MyTrainingDevelopment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/recognition"
            element={
              <ProtectedRoute requiredPath="/hr/recognition">
                <RecognitionCelebrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/teams-members"
            element={
              <ProtectedRoute requiredPath="/hr/teams-members">
                <TeamsMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave-attendance-overview"
            element={
              <ProtectedRoute requiredPath="/hr/leave-attendance-overview">
                <LeaveAttendanceOverview />
              </ProtectedRoute>
            }
          />

          {/* RMG Routes */}
          <Route
            path="/resource-pool"
            element={
              <ProtectedRoute requiredPath="/resource-pool">
                <ResourcePool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allocations"
            element={
              <ProtectedRoute requiredPath="/allocations">
                <Allocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/utilization"
            element={
              <ProtectedRoute requiredPath="/utilization">
                <Utilization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forecasting"
            element={
              <ProtectedRoute requiredPath="/forecasting">
                <Forecasting />
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

          {/* Common Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPath="/reports">
                <Reports />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all - redirect to 403 */}
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
