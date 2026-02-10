import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const mockChanges = [
  { id: 1, type: 'Status Change', description: 'Status changed from Draft to Active', user: 'John Doe', date: new Date('2025-10-24') },
  { id: 2, type: 'Budget Update', description: 'Budget increased to $1.5M', user: 'Jane Smith', date: new Date('2025-10-20') },
  { id: 3, type: 'Team Member', description: 'Added Sarah Johnson to project team', user: 'John Doe', date: new Date('2025-10-18') },
];

export function ProjectChangesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Changes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockChanges.map((change) => (
            <div key={change.id} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{change.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(change.date, 'MMM dd, yyyy')}
                </span>
              </div>
              <p className="text-sm font-medium">{change.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Changed by {change.user}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
