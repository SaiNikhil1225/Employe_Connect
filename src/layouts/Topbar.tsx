import { Moon, Sun, LogOut, User, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { getAvatarGradient, getInitials } from '@/constants/design-system';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearch } from '@/components/search/GlobalSearch';
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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
        <div className="flex-shrink-0 min-w-0" style={{ width: '20%' }}>
          <h2 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white truncate">
            {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate font-normal">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Search - Desktop centered */}
        <div className="flex-1 hidden lg:flex justify-center items-center px-4">
          <div className="w-full max-w-2xl">
            <GlobalSearch />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>

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
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white overflow-hidden bg-gradient-to-br ${getAvatarGradient(user?.name || '')}`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {getInitials(user?.name || '')}
                    </span>
                  )}
                </div>
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
                onClick={() => {
                  sessionStorage.setItem('profileReferrer', '/dashboard');
                  navigate('/profile');
                }}
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

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-900">
          <GlobalSearch />
        </div>
      )}
    </header>
  );
}
