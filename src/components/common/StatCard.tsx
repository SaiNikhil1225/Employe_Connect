import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    isPositive?: boolean;
  };
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    progress: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-500/10',
    icon: 'text-green-500',
    progress: 'bg-green-500',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-500',
    progress: 'bg-purple-500',
  },
  orange: {
    bg: 'bg-orange-500/10',
    icon: 'text-orange-500',
    progress: 'bg-orange-500',
  },
  red: {
    bg: 'bg-red-500/10',
    icon: 'text-red-500',
    progress: 'bg-red-500',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  showProgress = false,
  progressValue,
  progressMax = 100,
  tooltip,
  onClick,
  className,
}: StatCardProps) {
  const colors = colorClasses[color];
  const isClickable = !!onClick;

  const content = (
    <div
      className={cn(
        'bg-background/80 backdrop-blur rounded-lg p-3 border transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
          <Icon className={cn('h-4 w-4', colors.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-foreground">{value}</p>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  trend.isPositive !== false
                    ? trend.direction === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    : trend.direction === 'up'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {showProgress && progressValue !== undefined && (
        <div className="mt-2 space-y-1">
          <Progress 
            value={(progressValue / progressMax) * 100} 
            className={cn('h-1.5', `[&>div]:${colors.progress}`)}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{progressValue}</span>
            <span>{progressMax}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
