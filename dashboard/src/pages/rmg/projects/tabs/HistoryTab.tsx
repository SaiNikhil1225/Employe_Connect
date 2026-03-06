import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const mockHistory = [
  { id: 1, action: 'Project Created', user: 'John Doe', timestamp: new Date('2025-10-15T09:00:00'), details: 'Project initiated' },
  { id: 2, action: 'Budget Updated', user: 'Jane Smith', timestamp: new Date('2025-10-20T14:30:00'), details: 'Budget changed from $1.0M to $1.2M' },
  { id: 3, action: 'Team Member Added', user: 'John Doe', timestamp: new Date('2025-10-22T10:15:00'), details: 'Sarah Johnson added as Senior Designer' },
  { id: 4, action: 'Status Changed', user: 'John Doe', timestamp: new Date('2025-10-24T11:00:00'), details: 'Status changed from Draft to Active' },
  { id: 5, action: 'Milestone Completed', user: 'System', timestamp: new Date('2025-10-25T16:45:00'), details: 'Project kickoff milestone marked complete' },
];

export function HistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockHistory.map((entry) => (
            <div key={entry.id} className="border-l-2 border-primary pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="text-sm text-muted-foreground">{entry.user}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(entry.timestamp, 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              <p className="text-sm">{entry.details}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
