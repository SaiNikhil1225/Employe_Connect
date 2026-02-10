import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
  className?: string;
  onClick?: () => void;
}

export function KpiCard({ title, value, icon: Icon, badge, className, onClick }: KpiCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-brand-light-gray shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-brand-green/50",
        !onClick && "hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-slate mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-bold tracking-tight text-brand-navy mb-3">
              {value}
            </h3>
            {badge && (
              <Badge 
                variant={badge.variant || 'secondary'}
                className={cn(
                  "text-xs font-normal",
                  badge.variant === 'success' && "bg-brand-green-light text-brand-green hover:bg-brand-green-light border-brand-green/20",
                  badge.variant === 'destructive' && "bg-red-100 text-red-800 hover:bg-red-100"
                )}
              >
                {badge.text}
              </Badge>
            )}
          </div>
          <div className={cn(
            "rounded-full p-3 transition-colors",
            onClick ? "bg-brand-green/10 group-hover:bg-brand-green/20" : "bg-brand-green/10"
          )}>
            <Icon className="h-6 w-6 text-brand-green" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
