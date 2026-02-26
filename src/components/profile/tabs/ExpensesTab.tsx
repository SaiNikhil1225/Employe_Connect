import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ExpensesTabProps {
  expenses?: Expense[];
}

export default function ExpensesTab({ expenses = [] }: ExpensesTabProps) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter((exp) => exp.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Receipt className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingExpenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Receipt className="h-5 w-5 text-blue-600" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                    <Badge
                      className={
                        expense.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : expense.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No expenses recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
