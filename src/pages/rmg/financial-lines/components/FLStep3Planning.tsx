import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, FLStep3Data, RevenuePlanning } from '@/types/financialLine';
import { format, startOfMonth, addMonths, isBefore, isSameMonth, eachDayOfInterval, isWeekend, startOfDay, endOfMonth } from 'date-fns';
import { Info, SplitSquareHorizontal } from 'lucide-react';

interface FLStep3PlanningProps {
  data: Partial<FLStep3Data>;
  step1Data: FLStep1Data;
  step2Data: FLStep2Data;
  onDataChange: (data: Partial<FLStep3Data>) => void;
  onNext: (data?: Partial<FLStep3Data>) => void;  // Updated to accept optional data parameter
  onBack: () => void;
}

export function FLStep3Planning({ data, step1Data, step2Data, onDataChange, onNext, onBack }: FLStep3PlanningProps) {
  const [monthlyData, setMonthlyData] = useState<RevenuePlanning[]>(data.revenuePlanning || []);
  const [totalUnitsToSplit, setTotalUnitsToSplit] = useState<number>(0);
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

  // Get the unit label based on rate UOM
  const getUnitLabel = () => {
    switch (step1Data.rateUom) {
      case 'Hr': return 'Hours';
      case 'Day': return 'Days';
      case 'Month': return 'Months';
      default: return 'Units';
    }
  };

  const getUnitLabelShort = () => {
    switch (step1Data.rateUom) {
      case 'Hr': return 'hrs';
      case 'Day': return 'days';
      case 'Month': return 'months';
      default: return 'units';
    }
  };

  // Calculate working days in a month (excluding weekends)
  const getWorkingDaysInMonth = (monthStr: string): number => {
    const monthDate = new Date(monthStr + '-01');
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    // For partial months at start/end of project, use actual dates
    const projectStart = new Date(step1Data.scheduleStart);
    const projectEnd = new Date(step1Data.scheduleFinish);
    
    const effectiveStart = isBefore(monthStart, projectStart) ? startOfDay(projectStart) : monthStart;
    const effectiveEnd = isBefore(monthEnd, projectEnd) ? monthEnd : startOfDay(projectEnd);
    
    // Generate all days in the effective range
    const allDays = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
    
    // Filter out weekends
    const workingDays = allDays.filter(day => !isWeekend(day));
    
    return workingDays.length;
  };

  // Split total units proportionally based on working days per month
  const handleSplitRevenue = () => {
    if (totalUnitsToSplit <= 0) {
      toast({
        title: 'Validation Error',
        description: `Please enter total ${getUnitLabelShort()} to split.`,
        variant: 'destructive',
      });
      return;
    }

    if (monthlyData.length === 0) {
      toast({
        title: 'Error',
        description: 'No months available for splitting.',
        variant: 'destructive',
      });
      return;
    }

    // Calculate working days for each month
    const monthsWithWorkingDays = monthlyData.map(month => ({
      ...month,
      workingDays: getWorkingDaysInMonth(month.month),
    }));

    // Calculate total working days across all months
    const totalWorkingDays = monthsWithWorkingDays.reduce((sum, m) => sum + m.workingDays, 0);

    if (totalWorkingDays === 0) {
      toast({
        title: 'Error',
        description: 'No working days found in the selected period.',
        variant: 'destructive',
      });
      return;
    }

    // Split units proportionally based on working days
    // Formula: plannedUnits for month = (totalUnits * workingDaysInMonth) / totalWorkingDays
    const updatedMonthlyData = monthsWithWorkingDays.map(month => {
      const proportion = month.workingDays / totalWorkingDays;
      const plannedUnits = parseFloat((totalUnitsToSplit * proportion).toFixed(2));
      const plannedRevenue = plannedUnits * step1Data.billingRate;
      
      return {
        ...month,
        plannedUnits,
        plannedRevenue,
      };
    });

    // Remove the workingDays property before setting state
    const cleanedData = updatedMonthlyData.map(({ workingDays, ...rest }) => rest) as RevenuePlanning[];
    
    setMonthlyData(cleanedData);
    
    toast({
      title: 'Success',
      description: `${totalUnitsToSplit} ${getUnitLabelShort()} split across ${monthlyData.length} months based on working days.`,
    });
  };

  const handleNext = () => {
    const totalPlanned = calculateTotalPlannedRevenue();
    
    console.log('FLStep3Planning - handleNext called');
    console.log('FLStep3Planning - monthlyData:', monthlyData);
    console.log('FLStep3Planning - totalPlanned:', totalPlanned);
    
    // Warning if no revenue planned
    if (totalPlanned === 0) {
      const confirmProceed = window.confirm(
        'You haven\'t entered any planned revenue. This will result in USD 0 planned revenue. Do you want to proceed?'
      );
      if (!confirmProceed) {
        return;
      }
    }
    
    if (totalPlanned > step2Data.totalFunding) {
      toast({
        title: 'Validation Error',
        description: `Total planned revenue ($${totalPlanned.toFixed(2)}) exceeds total funding ($${step2Data.totalFunding.toFixed(2)})`,
        variant: 'destructive',
      });
      return;
    }

    const step3Data = {
      revenuePlanning: monthlyData,
      totalPlannedRevenue: totalPlanned,
    };
    
    console.log('FLStep3Planning - step3Data to pass:', step3Data);
    
    // Update parent state
    onDataChange(step3Data);
    
    // Pass data directly to onNext to avoid state timing issues
    onNext(step3Data);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">
            Enter Planned {getUnitLabel()} for Each Month
          </p>
          <p className="text-xs text-blue-700">
            Your billing rate is <span className="font-semibold">${step1Data.billingRate}/{step1Data.rateUom}</span>. 
            Revenue will be calculated as: <span className="font-semibold">{getUnitLabel()} × ${step1Data.billingRate}</span>
            {step1Data.rateUom === 'Hr' && ' (8 hours = 1 day)'}
            {step1Data.rateUom === 'Day' && ' (20-22 days = 1 month typically)'}
          </p>
        </div>
      </div>

      {/* Split Revenue Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-amber-900">
                Auto-Split by Working Days
              </label>
              <p className="text-xs text-amber-700">
                Enter total {getUnitLabelShort()} to split proportionally based on working days per month (excluding weekends).
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalUnitsToSplit || ''}
                  onChange={(e) => setTotalUnitsToSplit(parseFloat(e.target.value) || 0)}
                  placeholder={`Total ${getUnitLabelShort()} to split...`}
                  className="max-w-[200px] bg-white"
                />
                <Button 
                  onClick={handleSplitRevenue}
                  variant="outline"
                  className="gap-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900"
                >
                  <SplitSquareHorizontal className="h-4 w-4" />
                  Split Revenue
                </Button>
              </div>
            </div>
            <div className="text-xs text-amber-700 bg-amber-100 rounded-lg p-3 max-w-sm">
              <strong>Formula:</strong> Each month's {getUnitLabelShort()} = Total × (Working Days in Month ÷ Total Working Days)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Revenue Planning</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Plan your monthly {getUnitLabelShort()} and revenue allocation
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
                      <div className="text-xs text-muted-foreground">Billing Rate: ${step1Data.billingRate}/{step1Data.rateUom}</div>
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
                    <div className="space-y-0.5">
                      <div className="text-sm">📊 Planned</div>
                      <div className="text-xs text-muted-foreground">({getUnitLabel()})</div>
                    </div>
                  </td>
                  {monthlyData.map((month, index) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={month.plannedUnits}
                          onChange={(e) => updatePlannedUnits(index, parseFloat(e.target.value) || 0)}
                          placeholder={getUnitLabelShort()}
                          className="text-sm h-8"
                          title={`Enter planned ${getUnitLabelShort()} for this month`}
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
                    <div className="space-y-0.5">
                      <div className="text-sm">✅ Actual</div>
                      <div className="text-xs text-muted-foreground">({getUnitLabel()})</div>
                    </div>
                  </td>
                  {monthlyData.map((month) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          {month.actualUnits} {getUnitLabelShort()}
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
                    <div className="space-y-0.5">
                      <div className="text-sm">🔮 Forecasted</div>
                      <div className="text-xs text-muted-foreground">({getUnitLabel()})</div>
                    </div>
                  </td>
                  {monthlyData.map((month) => (
                    <td key={month.month} className="border p-2">
                      <div className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          {month.forecastedUnits} {getUnitLabelShort()}
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
