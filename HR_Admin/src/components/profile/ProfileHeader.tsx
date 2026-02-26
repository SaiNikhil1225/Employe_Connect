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
    <div className="relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 rounded-t-xl" />
      
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
              className="border-4 border-white shadow-lg"
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
              <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
              <Badge className={cn('px-3 py-1 font-medium', statusInfo.className)}>
                {statusInfo.label}
              </Badge>
              {hasActivePIP && (
                <Badge className="px-3 py-1 font-medium bg-orange-50 text-orange-700 border-orange-200 border flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Under PIP
                </Badge>
              )}
            </div>
            <p className="text-base text-gray-600">
              {designation}
              {employeeId && <span className="text-gray-500 ml-2">({employeeId})</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
