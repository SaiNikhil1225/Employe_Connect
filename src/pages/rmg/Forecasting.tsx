import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, AlertTriangle, TrendingUp } from 'lucide-react';

export function Forecasting() {
  const demands = [
    { id: 1, project: 'AI Platform', startDate: '2025-12-01', role: 'ML Engineer', count: 5, priority: 'high' },
    { id: 2, project: 'Mobile App Phase 2', startDate: '2025-12-15', role: 'React Native Dev', count: 3, priority: 'medium' },
    { id: 3, project: 'Cloud Migration', startDate: '2026-01-01', role: 'DevOps Engineer', count: 4, priority: 'high' },
    { id: 4, project: 'Data Analytics', startDate: '2026-01-15', role: 'Data Engineer', count: 2, priority: 'low' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <TrendingUp className="h-7 w-7 text-primary" />
            Demand Forecasting
          </h1>
          <p className="page-description">Plan for upcoming resource requirements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Next 3 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resources Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Total demand</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Skills Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Positions to hire</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.8M</div>
            <p className="text-xs text-muted-foreground">Quarterly estimate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Resource Demands</CardTitle>
          <CardDescription>Project resource requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demands.map((demand) => (
              <div key={demand.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{demand.project}</p>
                      <p className="text-sm text-muted-foreground">Starts {demand.startDate}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      demand.priority === 'high'
                        ? 'destructive'
                        : demand.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {demand.priority} priority
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{demand.role}</p>
                    <p className="text-xs text-muted-foreground">{demand.count} resources needed</p>
                  </div>
                  {demand.priority === 'high' && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">Immediate attention</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills Gap Analysis</CardTitle>
          <CardDescription>Required vs available skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SkillGap skill="ML Engineers" required={8} available={3} />
            <SkillGap skill="React Native Developers" required={5} available={2} />
            <SkillGap skill="DevOps Engineers" required={6} available={4} />
            <SkillGap skill="Data Engineers" required={4} available={3} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SkillGap({ skill, required, available }: { skill: string; required: number; available: number }) {
  const gap = required - available;
  const percentage = (available / required) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{skill}</span>
        <span className="text-sm text-muted-foreground">
          {available}/{required} available
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 80 ? 'bg-primary' : percentage >= 50 ? 'bg-muted' : 'bg-destructive'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {gap > 0 && (
        <p className="text-xs text-destructive">Gap: {gap} resources needed</p>
      )}
    </div>
  );
}
