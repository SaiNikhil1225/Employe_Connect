import { Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { ProfileSwitcher } from '@/components/profile/ProfileSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className="h-16 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-20"
      role="banner"
    >
      <div className="h-full px-4 md:px-6 flex items-center gap-4">
        <div className="flex-shrink-0 min-w-0 flex items-center">
          <h1 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            ACUVATE SOFTWARE PRIVATE LIMITED
          </h1>
        </div>

        {/* Search - Centered */}
        <div className="flex-1 hidden lg:flex justify-center items-center px-4">
          <div className="w-full max-w-2xl">
            <GlobalSearch />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
          {/* Profile Switcher - For HR/Admin users */}
          <ProfileSwitcher />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-orange-500 fill-orange-500" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600 fill-blue-600" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User profile menu"
                aria-haspopup="true"
              >
                <EmployeeAvatar
                  employee={{
                    employeeId: user?.employeeId || user?._id || 'default',
                    name: user?.name || '',
                    profilePhoto: user?.avatar,
                  }}
                  size="md"
                />
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" role="menu">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
                role="menuitem"
              >
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                role="menuitem"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
