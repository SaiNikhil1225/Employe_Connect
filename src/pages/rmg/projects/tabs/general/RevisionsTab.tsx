import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const mockRevisions = [
  { id: 1, version: 'v1.3', summary: 'Updated budget and timeline', createdBy: 'John Doe', date: new Date('2025-10-24') },
  { id: 2, version: 'v1.2', summary: 'Added new team members', createdBy: 'Jane Smith', date: new Date('2025-10-20') },
  { id: 3, version: 'v1.1', summary: 'Initial project setup', createdBy: 'John Doe', date: new Date('2025-10-15') },
];

export function RevisionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Revisions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRevisions.map((revision) => (
            <div key={revision.id} className="border rounded-lg p-4 hover:bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{revision.version}</Badge>
                  <span className="font-medium">{revision.summary}</span>
                </div>
                <Button variant="ghost" size="sm">Compare</Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Created by {revision.createdBy} on {format(revision.date, 'MMM dd, yyyy')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
