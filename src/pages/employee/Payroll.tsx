import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export function Payroll() {
  return (
    <div className="page-container">
      <PageHeader
        icon={Wallet}
        title="My Payroll"
        description="View your salary and payslips"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payroll Information
          </CardTitle>
          <CardDescription>
            Access your salary details and payslips
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
                View your salary breakdown, download payslips, and tax documents.
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

