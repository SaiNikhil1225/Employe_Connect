/**
 * Employee Avatar Component
 * Displays employee profile pictures or initials-based avatars
 * Consistent across the entire application
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { getAvatarData, AVATAR_SIZES, type AvatarSize } from '@/lib/avatarUtils';
import { User } from 'lucide-react';

interface EmployeeAvatarProps {
  employee: {
    employeeId: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    profilePhoto?: string;
  };
  size?: AvatarSize;
  className?: string;
  onClick?: () => void;
  showTooltip?: boolean;
}

export function EmployeeAvatar({ 
  employee, 
  size = 'md', 
  className,
  onClick,
  showTooltip = false,
}: EmployeeAvatarProps) {
  const avatarData = getAvatarData(employee);
  const sizeConfig = AVATAR_SIZES[size];
  
  const displayName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  const containerClasses = cn(
    'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 font-semibold select-none transition-all duration-200',
    onClick && 'cursor-pointer hover:scale-105 hover:shadow-lg',
    className
  );

  const containerStyle: React.CSSProperties = {
    width: sizeConfig.size,
    height: sizeConfig.size,
    minWidth: sizeConfig.size,
    minHeight: sizeConfig.size,
  };

  return (
    <div 
      className={containerClasses}
      style={containerStyle}
      onClick={onClick}
      title={showTooltip ? displayName : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Profile picture of ${displayName}`}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: avatarData.backgroundColor,
          color: avatarData.textColor,
          fontSize: sizeConfig.fontSize,
        }}
      >
        {avatarData.initials !== '??' ? (
          <span className="font-bold">{avatarData.initials}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>
    </div>
  );
}

/**
 * Avatar Group Component
 * Displays multiple avatars in a row with overlap
 */
interface AvatarGroupProps {
  employees: Array<{
    employeeId: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    profilePhoto?: string;
  }>;
  size?: AvatarSize;
  max?: number;
  className?: string;
}

export function AvatarGroup({ 
  employees, 
  size = 'sm', 
  max = 5,
  className 
}: AvatarGroupProps) {
  const displayEmployees = employees.slice(0, max);
  const remaining = employees.length - max;
  const sizeConfig = AVATAR_SIZES[size];

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayEmployees.map((employee, index) => (
        <div
          key={employee.employeeId || index}
          className="ring-2 ring-background"
          style={{ zIndex: displayEmployees.length - index }}
        >
          <EmployeeAvatar employee={employee} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold ring-2 ring-background"
          style={{
            width: sizeConfig.size,
            height: sizeConfig.size,
            fontSize: sizeConfig.fontSize,
            zIndex: 0,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

/**
 * Avatar with Name Component
 * Displays avatar with name next to it
 */
interface AvatarWithNameProps {
  employee: {
    employeeId: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    profilePhoto?: string;
    designation?: string;
  };
  size?: AvatarSize;
  showDesignation?: boolean;
  className?: string;
  onClick?: () => void;
}

export function AvatarWithName({
  employee,
  size = 'md',
  showDesignation = false,
  className,
  onClick,
}: AvatarWithNameProps) {
  const displayName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  return (
    <div 
      className={cn('flex items-center gap-3', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <EmployeeAvatar employee={employee} size={size} />
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm truncate">{displayName}</span>
        {showDesignation && employee.designation && (
          <span className="text-xs text-muted-foreground truncate">{employee.designation}</span>
        )}
      </div>
    </div>
  );
}
