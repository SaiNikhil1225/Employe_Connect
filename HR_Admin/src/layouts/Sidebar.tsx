import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHiringStore } from '@/store/hiringStore';
import { useProfile } from '@/contexts/ProfileContext';
import { getNavigationForRole } from '@/router/roleConfig';
import { profileService } from '@/services/profileService';
import { cn } from '@/lib/utils';
import acuvateLogo from '@/assets/acuvateLogo_light.png';
import acuvateIcon from '@/assets/acu_v_icon.png';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  User,
  Users,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Headphones,
  ClipboardCheck,
  Shield,
  Ticket,
  CalendarCheck,
  ClipboardList,
  Wallet,
  UserPlus,
  Target,
  Database,
  GitBranch,
  Activity,
  LineChart,
  BarChart3,
  CircleDot,
  Settings,
  Eye,
  GraduationCap,
  Award,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Icon map for navigation - only imports icons that are actually used
// This improves bundle size by avoiding importing all lucide-react icons
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  Users,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Headphones,
  ClipboardCheck,
  Shield,
  Ticket,
  CalendarCheck,
  ClipboardList,
  Wallet,
  UserPlus,
  Target,
  Database,
  GitBranch,
  Activity,
  LineChart,
  BarChart3,
  CircleDot,
  Settings,
  Eye,
  GraduationCap,
  Award,
  MessageSquare,
};

interface MenuSection {
  title?: string;
  items: Array<{
    path: string;
    label: string;
    icon: string;
    action?: () => void;
  }>;
}

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { permissions } = useProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Hiring statistics for notification badge (HR users only)
  const statistics = useHiringStore((state) => state.statistics);
  const fetchStatistics = useHiringStore((state) => state.fetchStatistics);

  // PIP badge state
  const [hasActivePIP, setHasActivePIP] = useState(false);

  // Fetch user profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?.employeeId) {
        try {
          const profile = await profileService.getProfile(user.employeeId);
          if (profile.photo && profile.photo !== user.avatar) {
            updateUser({ avatar: profile.photo });
          }
        } catch (error) {
          // Silently fail - photo is optional
        }
      }
    };

    fetchProfilePhoto();
  }, [user?.employeeId, user?.avatar, updateUser]);

  // Fetch hiring statistics for HR users to show notification badge
  useEffect(() => {
    if (user?.role === 'HR' || user?.role === 'SUPER_ADMIN') {
      fetchStatistics();
      
      // Refresh statistics every 2 minutes
      const interval = setInterval(() => {
        fetchStatistics();
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [user?.role, fetchStatistics]);

  // Check for active PIP
  useEffect(() => {
    const checkActivePIP = async () => {
      if (!user?.employeeId) {
        setHasActivePIP(false);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/pip/employee/${user.employeeId}`);
        
        // Ensure we have a valid response with data array
        if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // Only show PIP badge if there's actually a valid PIP record with matching employee ID
          const activePIP = response.data.data.find((pip: any) => 
            pip && 
            pip.employeeId === user.employeeId && // Strict employee ID match
            pip.status && 
            ['Pending', 'Acknowledged', 'Active'].includes(pip.status) &&
            pip.pipNumber // Ensure it has a valid PIP number
          );
          setHasActivePIP(!!activePIP);
        } else {
          // No data or invalid response - no active PIP
          setHasActivePIP(false);
        }
      } catch (error) {
        // If error (404, etc.), means no PIPs exist for this employee
        setHasActivePIP(false);
      }
    };

    checkActivePIP();
    
    // Refresh PIP status every 5 minutes
    const interval = setInterval(() => {
      checkActivePIP();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [user?.employeeId]);

  if (!user) return null;

  const navigation = getNavigationForRole(user.role);
  
  // Filter navigation based on active profile permissions
  const filteredNavigation = navigation.filter(item => {
    // Hide admin-only features in HR User mode
    if (permissions.isHRUser) {
      const adminPaths = [
        '/leave-plans',
        '/leave-management',
        '/reports',
        '/payroll-management',
        '/admin-announcements',
        '/new-announcement',
        '/hr/workforce-summary',
        '/hr/leave-attendance-overview',  // Hide leave & attendance overview in user mode
        '/hr/training',  // Hide admin training in user mode
        '/hr/training/add',  // Hide add training in user mode
      ];
      return !adminPaths.includes(item.path);
    }
    
    // Hide specific menu items for HR admin users on all pages (not in HR User view-only mode)
    if (user.role === 'HR' && !permissions.isHRUser) {
      const hiddenPaths = [
        '/dashboard',
        '/reports',
        '/payroll-management',
        '/leave-management',
        '/my-training-development',  // Hide user training in admin mode
        '/attendance',  // Hide My Leave & Attendance in admin mode
      ];
      return !hiddenPaths.includes(item.path);
    }
    
    return true;
  });
  
  // Calculate pending hiring requests for HR users
  const pendingHiringCount = 
    (user.role === 'HR' || user.role === 'SUPER_ADMIN') && statistics
      ? (statistics.byStatus.submitted || 0) + (statistics.byStatus.open || 0)
      : 0;

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || iconMap.CircleDot;
  };

  // Organize navigation into sections
  const menuSections: MenuSection[] = [
    {
      items: filteredNavigation.map(item => ({
        path: item.path,
        label: item.label,
        icon: item.icon || 'CircleDot',
      })),
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out rounded-r-3xl shadow-lg",
          isCollapsed ? "w-20" : "w-[220px]",
          "bg-gray-900 border-r border-gray-800"
        )}
        role="navigation"
        aria-label="Sidebar"
      >
        {/* Header with Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <div>
                <img 
                  src={acuvateLogo} 
                  alt="Acuvate" 
                  className="h-8 w-auto object-contain"
                />
              </div>
            )}
            {isCollapsed && (
              <div className="h-10 w-10 flex items-center justify-center">
                <img 
                  src={acuvateIcon} 
                  alt="Acuvate" 
                  className="h-8 w-8 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Active Profile Indicator - Only show for HR/Admin users in HR User mode */}
        {permissions.isHRUser && (
          <div className={cn(
            "mx-3 mt-3 mb-2 p-2.5 rounded-lg transition-all duration-200",
            "bg-blue-950/50 border border-blue-800/50"
          )}>
            {!isCollapsed ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    View Only Mode
                  </span>
                </div>
                <p className="text-[10px] text-blue-300/70 leading-tight">
                  Switch to HR Admin in header for full access
                </p>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <Eye className="h-4 w-4 text-blue-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">View Only Mode</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <nav
          className="flex-1 p-3 overflow-y-auto scrollbar-thin"
          aria-label="Main navigation"
        >
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {/* Section Items */}
              <ul className="space-y-1" role="list">
                {section.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = location.pathname === item.path;

                  const handleClick = (e: React.MouseEvent) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                  };

                  const linkContent = (
                    <Link
                      to={item.path}
                      onClick={handleClick}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                        isCollapsed && "justify-center px-2",
                        isActive
                          ? "bg-brand-green/20 text-brand-green"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                          isActive && "scale-110"
                        )} 
                        aria-hidden="true" 
                      />

                      {!isCollapsed && (
                        <>
                          <span className={cn(
                            "font-medium text-sm whitespace-nowrap transition-opacity duration-300 flex-1",
                            isCollapsed ? "opacity-0" : "opacity-100"
                          )}>
                            {item.label}
                          </span>
                          
                          {/* Notification badge for Hiring Requests (HR only) */}
                          {item.path === '/hiring/all-requests' && pendingHiringCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold bg-red-500 hover:bg-red-600"
                            >
                              {pendingHiringCount > 99 ? '99+' : pendingHiringCount}
                            </Badge>
                          )}
                          
                          {/* PIP badge for Performance menu (Employees with active PIP) */}
                          {item.path === '/performance' && hasActivePIP && (
                            <div className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-amber-500 animate-pulse">
                              <span className="text-[10px] text-white font-bold">PIP</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Show badge on collapsed sidebar too */}
                      {isCollapsed && item.path === '/hiring/all-requests' && pendingHiringCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">
                            {pendingHiringCount > 9 ? '9+' : pendingHiringCount}
                          </span>
                        </div>
                      )}
                      
                      {/* PIP badge for collapsed sidebar */}
                      {isCollapsed && item.path === '/performance' && hasActivePIP && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.path}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="fixed -right-3 top-20 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-md bg-brand-green text-white hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-gray-900"
          style={{ left: isCollapsed ? '68px' : '208px' }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
