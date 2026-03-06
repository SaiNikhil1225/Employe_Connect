import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';

interface ProfileHeaderProps {
  avatar?: string;
  name: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  designation: string;
  employmentStatus: 'active' | 'inactive' | 'on-leave' | 'probation';
  hasActivePIP?: boolean;
  isOwnProfile?: boolean;
  onPhotoUpload?: (file: File) => void;
  quickActions?: React.ReactNode;
}

const statusConfig = {
  active: { label: 'Active', variant: 'default' as const, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700 border-gray-300' },
  'on-leave': { label: 'On Leave', variant: 'outline' as const, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  probation: { label: 'Probation', variant: 'outline' as const, className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function ProfileHeader({
  avatar,
  name,
  employeeId,
  firstName,
  lastName,
  designation,
  employmentStatus,
  hasActivePIP = false,
  isOwnProfile = false,
  onPhotoUpload,
  quickActions,
}: ProfileHeaderProps) {
  const statusInfo = statusConfig[employmentStatus] || statusConfig.active;

  // Log employee data for debugging
  console.log('👤 Profile Header - Received Data:', {
    employeeId,
    name,
    firstName,
    lastName,
    avatar,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Cover Background with Pattern */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90" />
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
      
      {/* Quick Actions Dropdown - Top Right */}
      {quickActions && (
        <div className="absolute top-4 right-4 z-10">
          {quickActions}
        </div>
      )}
      
      <div className="relative px-8 py-10">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <EmployeeAvatar
              employee={{
                employeeId: employeeId || 'unknown',
                name: name,
                firstName: firstName,
                lastName: lastName,
                profilePhoto: avatar,
              }}
              size="xl"
              className="border-4 border-white shadow-xl ring-2 ring-white/50"
            />
            
            {isOwnProfile && (
              <>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    asChild
                  >
                    <span>
                      <Camera className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </>
            )}
          </div>

          {/* Name and Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-white drop-shadow-md">{name}</h1>
              <Badge className={cn('px-3 py-1 font-medium shadow-sm', statusInfo.className)}>
                {statusInfo.label}
              </Badge>
              {hasActivePIP && (
                <Badge className="px-3 py-1 font-medium bg-orange-50 text-orange-700 border-orange-200 border flex items-center gap-1.5 shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Under PIP
                </Badge>
              )}
            </div>
            <p className="text-base text-white/95 drop-shadow-sm">
              {designation}
              {employeeId && <span className="text-white/80 ml-2">({employeeId})</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
