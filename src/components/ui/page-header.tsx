import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** LucideIcon component to display in the icon box */
  icon: LucideIcon;
  /** Page title text */
  title: string;
  /** Optional subtitle / description (string or ReactNode for dynamic content) */
  description?: React.ReactNode;
  /** Action buttons / controls rendered on the right side */
  actions?: React.ReactNode;
  /** Additional classes for the outer wrapper */
  className?: string;
}

/**
 * Standardized page header component used across all pages.
 * Matches the reference design from HR → Engagement & Communication.
 *
 * Layout:
 *   [Icon box]  [Title]          [Action buttons]
 *               [Subtitle]
 */
export function PageHeader({ icon: Icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-start gap-3 flex-1">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
