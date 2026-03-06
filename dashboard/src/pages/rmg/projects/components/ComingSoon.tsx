import { Construction, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComingSoonProps {
  title?: string;
  description?: string;
  estimatedDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is under development and will be available soon.",
  estimatedDate,
  priority = 'medium'
}: ComingSoonProps) {
  const priorityConfig = {
    high: { label: 'High Priority', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    medium: { label: 'Medium Priority', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    low: { label: 'Low Priority', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
  };

  return (
    <Card className="border-dashed border-2 border-brand-light-gray rounded-lg shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center p-6">
        <div className="rounded-full bg-brand-green/10 p-6 mb-4 animate-pulse">
          <Construction className="h-12 w-12 text-brand-green" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold text-brand-navy">
            {title}
          </h3>
          <Badge className={priorityConfig[priority].color} variant="outline">
            {priorityConfig[priority].label}
          </Badge>
        </div>
        <p className="text-sm text-brand-slate max-w-md mb-4">
          {description}
        </p>
        {estimatedDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Clock className="h-3 w-3" />
            <span>Expected: {estimatedDate}</span>
          </div>
        )}
        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground max-w-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-left">
            This feature is actively being developed. Check back soon or contact your administrator for more information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
