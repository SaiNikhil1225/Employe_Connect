import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, BarChart3 } from 'lucide-react';

export function Utilization() {
  const utilizationData = [
    { department: 'Engineering', utilization: 82, billable: 45, bench: 8 },
    { department: 'Design', utilization: 75, billable: 12, bench: 4 },
    { department: 'Product', utilization: 88, billable: 15, bench: 2 },
    { department: 'DevOps', utilization: 90, billable: 18, bench: 2 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <BarChart3 className="h-7 w-7 text-primary" />
            Resource Utilization
          </h1>
          <p className="page-description">Track resource productivity and efficiency</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 text-primary">
              <TrendingUp className="h-3 w-3" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,840</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Bench</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Resources available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Target: 80%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department-wise Utilization</CardTitle>
          <CardDescription>Resource utilization across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {utilizationData.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{dept.department}</span>
                  </div>
                  <span className="text-sm font-semibold">{dept.utilization}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      dept.utilization >= 80 ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ width: `${dept.utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {dept.billable} billable
                  </span>
                  <span>{dept.bench} on bench</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilization Trends</CardTitle>
          <CardDescription>Monthly utilization over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart visualization would go here (Recharts integration)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
