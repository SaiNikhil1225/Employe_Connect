import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ProjectStatus = 'On Track' | 'At Risk' | 'Review' | 'On Hold' | 'Draft' | 'Active' | 'Closed';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'On Track':
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'At Risk':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'Draft':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "font-medium",
        getStatusColor(status),
        className
      )}
    >
      {status}
    </Badge>
  );
}
