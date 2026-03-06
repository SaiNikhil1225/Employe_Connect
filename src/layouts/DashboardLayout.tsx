import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalHelpdeskProvider, useGlobalHelpdesk } from '@/contexts/GlobalHelpdeskContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ModulePermissionsProvider } from '@/contexts/ModulePermissionsContext';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { RaiseRequestDrawer } from '@/components/helpdesk/RaiseRequestDrawer';

function DashboardLayoutContent() {
  const { isDrawerOpen, closeDrawer, submitRequest, isSubmitting } = useGlobalHelpdesk();
  const { canAccessPath, isLoading } = useModulePermissions();
  const location = useLocation();

  // Block access to module-restricted routes (only after permissions are loaded)
  if (!isLoading && !canAccessPath(location.pathname)) {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin" role="main">
          <div className="mx-auto max-w-[1920px] p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Helpdesk Drawer */}
      <RaiseRequestDrawer
        open={isDrawerOpen}
        onOpenChange={closeDrawer}
        onSubmit={submitRequest}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <GlobalHelpdeskProvider>
      <ModulePermissionsProvider>
        <ProfileProvider>
          <DashboardLayoutContent />
        </ProfileProvider>
      </ModulePermissionsProvider>
    </GlobalHelpdeskProvider>
  );
}
