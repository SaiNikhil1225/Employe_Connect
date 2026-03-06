import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export function Performance() {
  return (
    <div className="page-container">
      <PageHeader
        icon={TrendingUp}
        title="Performance"
        description="Track your goals and performance metrics"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Management
          </CardTitle>
          <CardDescription>
            Track your performance, goals, and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Construction className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This feature is currently under development.
                <br />
                Track your performance, goals, reviews, and feedback all in one place.
              </p>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Work in progress...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
