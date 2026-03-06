import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-brand-green" />}
          <h1 className="text-3xl font-bold text-brand-navy dark:text-gray-100">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-base text-brand-slate">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
