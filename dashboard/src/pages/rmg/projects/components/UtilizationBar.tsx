import { cn } from '@/lib/utils';

interface UtilizationBarProps {
  value: number;
  className?: string;
}

export function UtilizationBar({ value, className }: UtilizationBarProps) {
  const getUtilizationColor = (utilization: number) => {
    if (utilization === 0) return { bg: 'bg-gray-400', label: 'Allocated' };
    if (utilization <= 60) return { bg: 'bg-blue-500', label: 'Allocated' };
    if (utilization <= 85) return { bg: 'bg-green-500', label: 'Allocated' };
    if (utilization <= 100) return { bg: 'bg-yellow-500', label: 'Allocated' };
    return { bg: 'bg-red-500', label: 'Overloaded' };
  };

  const { bg, label } = getUtilizationColor(value);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            bg
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
