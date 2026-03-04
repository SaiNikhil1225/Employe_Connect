import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import type { Employee } from '@/services/employeeService';
import { cn } from '@/lib/utils';
import { getAvatarGradient, getInitials } from '@/constants/design-system';

export function MyTeam() {
  const user = useAuthStore((state) => state.user);
  const employees = useEmployeeStore((state) => state.employees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const navigate = useNavigate();

  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  // Find the current user's reporting manager
  const currentUserEmployee = useMemo(() => {
    return employees.find((emp: Employee) => emp.employeeId === user?.employeeId);
  }, [employees, user]);

  const myManagerId = useMemo(() => {
    const rm = currentUserEmployee?.reportingManager;
    if (!rm) return null;
    if (typeof rm === 'object') {
      const manager = rm as { employeeId?: string; name?: string };
      return manager.employeeId || manager.name || null;
    }
    return rm as string;
  }, [currentUserEmployee]);

  // Show teammates = employees who share the same reporting manager
  const teamMembers = useMemo(() => {
    if (!myManagerId) return [];
    return employees
      .filter((emp: Employee) => {
        if (emp.employeeId === user?.employeeId) return false;
        if (!emp.reportingManager) return false;
        if (typeof emp.reportingManager === 'object') {
          const manager = emp.reportingManager as { employeeId?: string; name?: string };
          return manager.employeeId === myManagerId || manager.name === myManagerId;
        }
        return emp.reportingManager === myManagerId;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, user, myManagerId]);

  // Format date helper
  const formatBirthday = (dateStr?: string) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Not specified';
    }
  };

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    const actualStatus = status || 'active';
    return actualStatus.toLowerCase() === 'active'
      ? 'bg-brand-green-light text-brand-green dark:bg-brand-green/20 dark:text-brand-green-light'
      : 'bg-gray-100 text-brand-slate dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users className="h-7 w-7 text-primary" />
            My Team
          </h1>
          <p className="page-description">
            {teamMembers.length} teammate{teamMembers.length !== 1 ? 's' : ''} in your team
          </p>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {teamMembers.map((member: Employee) => (
            <Card
              key={member.employeeId}
              className="group relative border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              onClick={() => {
                sessionStorage.setItem('profileReferrer', '/employee/my-team');
                navigate(`/employee/profile/${member.employeeId}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  sessionStorage.setItem('profileReferrer', '/employee/my-team');
                  navigate(`/employee/profile/${member.employeeId}`);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${member.name}'s profile`}
            >
              <CardContent className="p-5">
                {/* Header: Name + Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {member.name}
                    </h3>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0',
                      getStatusBadge(member.status)
                    )}
                  >
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Designation */}
                <p className="text-xs text-brand-slate dark:text-gray-400 mb-4">
                  {member.designation}
                </p>

                {/* Profile Picture */}
                <div className="flex justify-center mb-4">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${getAvatarGradient(member.name)} flex items-center justify-center text-white text-xl font-bold border-2 border-border`}>
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>

                {/* Contact Information - Two Column Layout */}
                <div className="space-y-2.5">
                  {/* Email */}
                  <div className="flex items-start gap-2">
                    <Mail
                      className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
                      aria-label="Email"
                    />
                    <span className="text-xs text-muted-foreground break-all leading-relaxed">
                      {member.email}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin
                      className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
                      aria-label="Location"
                    />
                    <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
                      {member.location || 'Not specified'}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-2">
                    <Phone
                      className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
                      aria-label="Phone"
                    />
                    <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
                      {member.phone || 'Not specified'}
                    </span>
                  </div>

                  {/* Birthday */}
                  <div className="flex items-start gap-2">
                    <Calendar
                      className="h-4 w-4 text-brand-slate dark:text-gray-400 mt-0.5 flex-shrink-0"
                      aria-label="Birthday"
                    />
                    <span className="text-xs text-brand-navy dark:text-gray-300 leading-relaxed">
                      {formatBirthday(member.dateOfBirth)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-border">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto text-brand-slate/50 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No team members found
            </h3>
            <p className="text-brand-slate dark:text-gray-400 max-w-md mx-auto">
              No teammates found. You may not have a reporting manager assigned yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
