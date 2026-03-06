import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-brand-green" />}
          <h2 className="text-xl font-semibold text-brand-navy">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-sm text-brand-slate">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
