import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function StatCardSkeleton() {
  return (
    <Card className="p-6 bg-background/80 backdrop-blur hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
      </div>
    </Card>
  );
}
