import type { HiringStatus } from '@/types/hiring';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: HiringStatus;
  className?: string;
}

const statusConfig: Record<HiringStatus, { label: string; variant: string; className: string }> = {
  'Draft': {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  },
  'Submitted': {
    label: 'Submitted',
    variant: 'default',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
  },
  'Open': {
    label: 'Open',
    variant: 'default',
    className: 'bg-green-100 text-green-700 hover:bg-green-100'
  },
  'In Progress': {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
  },
  'Closed': {
    label: 'Closed',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  }
};

export function HiringStatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
