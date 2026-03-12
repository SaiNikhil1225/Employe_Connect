import { cn } from '@/lib/utils';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface AvatarGroupProps {
  members: TeamMember[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ members, max = 3, size = 'md', className }: AvatarGroupProps) {
  const displayMembers = members.slice(0, max);
  const remainingCount = members.length - max;

  const sizeMap: Record<'sm' | 'md' | 'lg', 'xs' | 'sm' | 'md'> = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  };

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayMembers.map((member) => (
        <div key={member.id} className="ring-2 ring-background rounded-full">
          <EmployeeAvatar
            employee={{ employeeId: member.id, name: member.name, profilePhoto: member.avatar }}
            size={sizeMap[size]}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background h-6 w-6">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
