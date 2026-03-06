import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const mockChecklist = [
  { id: 1, task: 'Project kickoff meeting completed', completed: true },
  { id: 2, task: 'Requirements gathering completed', completed: true },
  { id: 3, task: 'Design mockups approved', completed: false },
  { id: 4, task: 'Development environment setup', completed: false },
  { id: 5, task: 'First sprint planning', completed: false },
];

export function ChecklistsTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Checklist</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mockChecklist.filter(item => item.completed).length} of {mockChecklist.length} tasks completed
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockChecklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <Checkbox checked={item.completed} />
              <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
