import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, FLStep3Data, RevenuePlanning } from '@/types/financialLine';
import { format, startOfMonth, addMonths, isBefore, isSameMonth } from 'date-fns';

interface FLStep3PlanningProps {
  data: Partial<FLStep3Data>;
  step1Data: FLStep1Data;
  step2Data: FLStep2Data;
  onDataChange: (data: Partial<FLStep3Data>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FLStep3Planning({ data, step1Data, step2Data, onDataChange, onNext, onBack }: FLStep3PlanningProps) {
  const [monthlyData, setMonthlyData] = useState<RevenuePlanning[]>(data.revenuePlanning || []);
  const { toast } = useToast();

  // Generate months between schedule start and finish
  useEffect(() => {
    if (step1Data.scheduleStart && step1Data.scheduleFinish) {
      const start = new Date(step1Data.scheduleStart);
      const end = new Date(step1Data.scheduleFinish);
      const months: RevenuePlanning[] = [];

      let current = startOfMonth(start);
      while (isBefore(current, end) || isSameMonth(current, end)) {
        const monthKey = format(current, 'yyyy-MM');
        const existingData = monthlyData.find(m => m.month === monthKey);
        months.push(existingData || {
          month: monthKey,
          plannedUnits: 0,
          plannedRevenue: 0,
          actualUnits: 0,
          actualRevenue: 0,
          forecastedUnits: 0,
          forecastedRevenue: 0,
        });
        current = addMonths(current, 1);
      }

      setMonthlyData(months);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1Data.scheduleStart, step1Data.scheduleFinish]);

  const updatePlannedUnits = (index: number, units: number) => {
    const updated = [...monthlyData];
    updated[index].plannedUnits = units;
    updated[index].plannedRevenue = units * step1Data.billingRate;
    setMonthlyData(updated);
  };

  const calculateTotalPlannedRevenue = () => {
    return monthlyData.reduce((sum, month) => sum + month.plannedRevenue, 0);
  };

  const handleNext = () => {
    const totalPlanned = calculateTotalPlannedRevenue();
    
    if (totalPlanned > step2Data.totalFunding) {
      toast({
        title: 'Validation Error',
        description: `Total planned revenue ($${totalPlanned.toFixed(2)}) exceeds total funding ($${step2Data.totalFunding.toFixed(2)})`,
        variant: 'destructive',
      });
      return;
    }

    onDataChange({
      revenuePlanning: monthlyData,
      totalPlannedRevenue: totalPlanned,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Revenue Planning</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Plan your monthly units and revenue allocation
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Total Funding</div>
              <div className="text-xl font-bold text-blue-600">
                ${step2Data.totalFunding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Total Planned Revenue</div>
              <div className={`text-xl font-bold ${calculateTotalPlannedRevenue() > step2Data.totalFunding ? 'text-red-600' : 'text-brand-green'}`}>
                ${calculateTotalPlannedRevenue().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-left text-sm font-medium sticky left-0 bg-muted/50">FL Info</th>
                  {monthlyData.map((month) => (
                    <th key={month.month} className="border p-2 text-center text-sm font-medium min-w-[100px]">
                      {format(new Date(month.month + '-01'), 'MMM yyyy')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* FL Details Row */}
                <tr className="bg-blue-50">
                  <td className="border p-2 sticky left-0 bg-blue-50">
                    <div className="space-y-1">
                      <div className="font-semibold">{step1Data.flName}</div>
                      <div className="text-xs text-muted-foreground">Type: {step1Data.contractType}</div>
                      <div className="text-xs text-muted-foreground">Rate: ${step1Data.billingRate}/{step1Data.rateUom}</div>
                      <div className="text-xs text-muted-foreground">Funded: ${step2Data.totalFunding.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Expected: ${step1Data.expectedRevenue.toFixed(2)}</div>
                    </div>
                  </td>
                  {monthlyData.map((month, idx) => (
                    <td key={`empty-${month.month}-${idx}`} className="border p-2"></td>
                  ))}
                </tr>

                {/* Planned Row (Editable) */}
                <tr>
                  <td className="border p-2 font-medium sticky left-0 bg-white">
                    <div className="text-sm">📊 Planned</div>
                  </td>
                  {monthlyData.map((month, index) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={month.plannedUnits}
                          onChange={(e) => updatePlannedUnits(index, parseFloat(e.target.value) || 0)}
                          placeholder="Units"
                          className="text-sm h-8"
                        />
                        <div className="text-xs text-center font-semibold text-brand-green">
                          ${month.plannedRevenue.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Actual Row (Read-only) */}
                <tr className="bg-gray-50">
                  <td className="border p-2 font-medium sticky left-0 bg-gray-50">
                    <div className="text-sm">✅ Actual</div>
                  </td>
                  {monthlyData.map((month) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          {month.actualUnits} units
                        </div>
                        <div className="text-xs text-center font-semibold">
                          ${month.actualRevenue.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Forecasted Row (Read-only) */}
                <tr className="bg-amber-50">
                  <td className="border p-2 font-medium sticky left-0 bg-amber-50">
                    <div className="text-sm">🔮 Forecasted</div>
                  </td>
                  {monthlyData.map((month) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          {month.forecastedUnits} units
                        </div>
                        <div className="text-xs text-center font-semibold">
                          ${month.forecastedRevenue.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden buttons controlled by parent */}
      <button type="button" onClick={handleNext} className="hidden" id="step3-next" />
      <button type="button" onClick={onBack} className="hidden" id="step3-back" />
    </div>
  );
}
