import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/hooks/useProfile';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { HRDashboard } from '@/pages/hr/HRDashboard';
import { RMGDashboard } from '@/pages/rmg/RMGDashboard';
import { SuperAdminDashboard } from '@/pages/superadmin/SuperAdminDashboard';
import { FinanceAdminDashboard } from '@/pages/financeadmin/FinanceAdminDashboard';
import { FacilitiesAdminDashboard } from '@/pages/facilitiesadmin/FacilitiesAdminDashboard';
import { ITAdminDashboard } from '@/pages/itadmin/ITAdminDashboard';


export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { activeProfile } = useProfile();


  if (!user) return null;

  // Map activeProfile to effective role for dashboard rendering
  const getEffectiveRole = () => {
    switch (activeProfile) {
      case 'HR_USER':
        return 'EMPLOYEE'; // HR User sees employee dashboard
      case 'HR_ADMIN':
        return 'HR'; // HR Admin sees HR dashboard
      case 'RMG_USER':
        return 'EMPLOYEE'; // RMG User sees employee dashboard
      case 'RMG_ADMIN':
        return 'RMG'; // RMG Admin sees RMG dashboard
      case 'SUPER_ADMIN':
        return 'SUPER_ADMIN';
      case 'MANAGER':
        return 'MANAGER';
      case 'IT_ADMIN':
        return 'IT_ADMIN';
      case 'FINANCE_ADMIN':
        return 'FINANCE_ADMIN';
      case 'FACILITIES_ADMIN':
        return 'FACILITIES_ADMIN';
      case 'EMPLOYEE':
        return 'EMPLOYEE';
      default:
        return user.role; // Use actual role as fallback
    }
  };

  const effectiveRole = getEffectiveRole();

  const dashboardContent = () => {
    switch (effectiveRole) {
      case 'EMPLOYEE':
      case 'MANAGER':
      case 'IT_ADMIN':
        return <EmployeeDashboard />;
      case 'HR':
        return <HRDashboard />;
      case 'RMG':
        return <RMGDashboard />;
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'FINANCE_ADMIN':
        return <FinanceAdminDashboard />;
      case 'FACILITIES_ADMIN':
        return <FacilitiesAdminDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="animate-in fade-in-50 duration-500">
      {dashboardContent()}
    </div>
  );
}
