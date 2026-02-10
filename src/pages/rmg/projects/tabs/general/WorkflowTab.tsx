import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

const workflowStages = [
  { id: 1, name: 'Initiated', status: 'completed' },
  { id: 2, name: 'Planning', status: 'completed' },
  { id: 3, name: 'In Progress', status: 'current' },
  { id: 4, name: 'Review', status: 'pending' },
  { id: 5, name: 'Completed', status: 'pending' },
];

export function WorkflowTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {workflowStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${
                    stage.status === 'completed' ? 'bg-green-100' :
                    stage.status === 'current' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className={`h-6 w-6 ${
                        stage.status === 'current' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <p className={`text-sm mt-2 font-medium ${
                    stage.status === 'current' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {stage.name}
                  </p>
                </div>
                {index < workflowStages.length - 1 && (
                  <div className={`h-0.5 w-20 mx-2 ${
                    stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-8">
            <Button variant="outline">Reject</Button>
            <Button>Approve & Move Forward</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
