import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Construction } from 'lucide-react';

export function Payroll() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Wallet className="h-7 w-7 text-primary" />
            My Payroll
          </h1>
          <p className="page-description">View your salary and payslips</p>
        </div>
      </div>

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
          <CardTitle>Current Month - {currentPayroll.month} {currentPayroll.year}</CardTitle>
          <CardDescription>Your salary breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Net Salary</p>
            <p className="text-4xl font-bold">${currentPayroll.netSalary.toLocaleString()}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">EARNINGS</h3>
              <div className="space-y-2">
                <SalaryItem label="Basic Salary" amount={currentPayroll.basicSalary} positive />
                <SalaryItem label="Allowances" amount={currentPayroll.allowances} positive />
              </div>
              <div className="pt-2 border-t">
                <SalaryItem
                  label="Gross Salary"
                  amount={currentPayroll.basicSalary + currentPayroll.allowances}
                  positive
                  bold
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">DEDUCTIONS</h3>
              <div className="space-y-2">
                <SalaryItem label="Deductions" amount={currentPayroll.deductions} />
                <SalaryItem label="Tax" amount={currentPayroll.tax} />
              </div>
              <div className="pt-2 border-t">
                <SalaryItem
                  label="Total Deductions"
                  amount={currentPayroll.deductions + currentPayroll.tax}
                  bold
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>Download previous payslips</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payroll history available</p>
          ) : (
            <div className="space-y-3">
              {payrollHistory.map((payroll) => (
                <div key={payroll._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{payroll.month} {payroll.year}</p>
                      <p className="text-sm text-muted-foreground">
                        ${payroll.netSalary.toLocaleString()} • {payroll.paymentStatus}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalaryItem({
  label,
  amount,
  positive = false,
  bold = false,
}: {
  label: string;
  amount: number;
  positive?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={bold ? 'font-semibold' : 'text-sm'}>{label}</span>
      <span className={`${bold ? 'font-bold text-lg' : 'text-sm'} ${positive ? 'text-green-600' : ''}`}>
        ${amount.toLocaleString()}
      </span>
    </div>
  );
}
