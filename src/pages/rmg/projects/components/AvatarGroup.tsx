import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayMembers.map((member) => (
        <Avatar 
          key={member.id} 
          className={cn(
            "border-2 border-background ring-1 ring-gray-200",
            sizeClasses[size]
          )}
        >
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <Avatar 
          className={cn(
            "border-2 border-background bg-gray-100 ring-1 ring-gray-200",
            sizeClasses[size]
          )}
        >
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
