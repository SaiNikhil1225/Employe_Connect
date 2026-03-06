import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { FLStep1Data, FLStep2Data, FLStep3Data, RevenuePlanning } from '@/types/financialLine';
import { format, startOfMonth, addMonths, isBefore, isSameMonth, eachDayOfInterval, isWeekend, startOfDay, endOfMonth } from 'date-fns';
import { Info, SplitSquareHorizontal, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showZeroRevenueConfirm, setShowZeroRevenueConfirm] = useState(false);

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

  // Split total capacity hours proportionally based on working days per month
  const handleSplitRevenue = () => {
    if (monthlyData.length === 0) {
      toast.error('No months available for splitting.');
      return;
    }

    // Calculate working days for each month
    const monthsWithWorkingDays = monthlyData.map(month => ({
      ...month,
      workingDays: getWorkingDaysInMonth(month.month),
    }));

    // Total capacity hours is the value to split (working days × 8h)
    const totalCapacityHours = monthsWithWorkingDays.reduce((sum, m) => sum + m.workingDays * 8, 0);

    if (totalCapacityHours === 0) {
      toast.error('No working days found in the selected period.');
      return;
    }

    // Split proportionally: each month gets (monthCapacity / totalCapacity) × totalCapacityHours
    const updatedMonthlyData = monthsWithWorkingDays.map(month => {
      const monthCapacity = month.workingDays * 8;
      const proportion = monthCapacity / totalCapacityHours;
      const plannedUnits = parseFloat((totalCapacityHours * proportion).toFixed(2));
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

    toast.success(`${totalCapacityHours} ${getUnitLabelShort()} split across ${monthlyData.length} months based on working days.`);
  };

  const handleNext = () => {
    const totalPlanned = calculateTotalPlannedRevenue();
    
    // Warning if no revenue planned
    if (totalPlanned === 0) {
      setShowZeroRevenueConfirm(true);
      return;
    }
    
    proceedToNext(totalPlanned);
  };

  const proceedToNext = (totalPlanned?: number) => {
    const total = totalPlanned ?? calculateTotalPlannedRevenue();
    
    if (total > step2Data.totalFunding) {
      toast.error(`Total planned revenue ($${total.toFixed(2)}) exceeds total funding ($${step2Data.totalFunding.toFixed(2)})`);
      return;
    }

    const step3Data = {
      revenuePlanning: monthlyData,
      totalPlannedRevenue: total,
    };
    
    // Update parent state
    onDataChange(step3Data);
    
    // Pass data directly to onNext to avoid state timing issues
    onNext(step3Data);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner + Capacity Breakdown — 30/70 row */}
      <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-3">

        {/* Left: Billing info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              Enter Planned {getUnitLabel()} for Each Month
            </p>
            <p className="text-xs text-blue-700">
              Your billing rate is <span className="font-semibold">${step1Data.billingRate}/{step1Data.rateUom}</span>.{' '}
              Revenue will be calculated as: <span className="font-semibold">{getUnitLabel()} × ${step1Data.billingRate}</span>
              {step1Data.rateUom === 'Hr' && ' (8 hours = 1 day)'}
              {step1Data.rateUom === 'Day' && ' (20-22 days = 1 month typically)'}
            </p>
          </div>
        </div>

        {/* Right: Monthly Capacity Breakdown */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-amber-900">Monthly Capacity Breakdown</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-amber-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs space-y-2">
                  <div>
                    <p className="font-semibold">Capacity:</p>
                    <p>Working Days × 8 hours</p>
                    <p className="text-muted-foreground text-xs">(Weekends excluded)</p>
                  </div>
                  <div>
                    <p className="font-semibold">Formula:</p>
                    <p>Month Allocation = (Month Capacity ÷ Total Capacity) × Total {getUnitLabelShort()}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {monthlyData.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              {monthlyData.map(month => {
                const workingDays = getWorkingDaysInMonth(month.month);
                const capacityHours = workingDays * 8;
                return (
                  <div key={month.month} className="bg-white border border-amber-200 rounded-md px-2.5 py-1.5 text-xs">
                    <span className="font-medium text-amber-900">{format(new Date(month.month + '-01'), 'MMM yyyy')}</span>
                    <span className="text-amber-700 ml-1">
                      {workingDays}d × 8h = <strong>{capacityHours}h</strong>
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 border border-amber-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-amber-900">
                  Total: {monthlyData.reduce((sum, m) => sum + getWorkingDaysInMonth(m.month) * 8, 0)}h
                </div>
                <Button
                  onClick={handleSplitRevenue}
                  variant="outline"
                  size="sm"
                  className="h-[28px] gap-1.5 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs px-2.5"
                >
                  <SplitSquareHorizontal className="h-3.5 w-3.5" />
                  Split Revenue
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSplitRevenue}
              variant="outline"
              className="gap-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
              Split Revenue
            </Button>
          )}
        </div>

      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Revenue Planning</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Plan your monthly {getUnitLabelShort()} and revenue allocation
              </p>
              {/* FL Details inline strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="text-sm font-semibold text-foreground">{step1Data.flName}</span>
                <span className="text-xs text-muted-foreground">Type: <span className="font-medium text-foreground">{step1Data.contractType}</span></span>
                <span className="text-xs text-muted-foreground">Billing Rate: <span className="font-medium text-foreground">${step1Data.billingRate}/{step1Data.rateUom}</span></span>
                <span className="text-xs text-muted-foreground">Funded: <span className="font-medium text-blue-600">${step2Data.totalFunding.toFixed(2)}</span></span>
                <span className="text-xs text-muted-foreground">Expected: <span className="font-medium text-foreground">${step1Data.expectedRevenue.toFixed(2)}</span></span>
              </div>
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
                  <th className="border p-2 text-left text-sm font-medium sticky left-0 bg-muted/50">Month</th>
                  {monthlyData.map((month) => (
                    <th key={month.month} className="border p-2 text-center text-sm font-medium min-w-[100px]">
                      {format(new Date(month.month + '-01'), 'MMM yyyy')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* Capacity Hours Row (Read-only) */}
                <tr className="bg-indigo-50">
                  <td className="border p-2 font-medium sticky left-0 bg-indigo-50">
                    <div className="space-y-0.5">
                      <div className="text-sm">⏱️ Capacity</div>
                      <div className="text-xs text-muted-foreground">(Working Days × 8h)</div>
                    </div>
                  </td>
                  {monthlyData.map((month) => {
                    const workingDays = getWorkingDaysInMonth(month.month);
                    const capacityHours = workingDays * 8;
                    return (
                      <td key={`capacity-${month.month}`} className="border p-2">
                        <div className="space-y-0.5 text-center">
                          <div className="text-xs text-indigo-700 font-semibold">
                            {capacityHours}h
                          </div>
                          <div className="text-[10px] text-indigo-500">
                            {workingDays} days
                          </div>
                        </div>
                      </td>
                    );
                  })}
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

      {/* Zero Revenue Confirmation Dialog */}
      <AlertDialog open={showZeroRevenueConfirm} onOpenChange={setShowZeroRevenueConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Planned Revenue</AlertDialogTitle>
            <AlertDialogDescription>
              You haven&apos;t entered any planned revenue. This will result in USD 0 planned revenue. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedToNext(0)}>
              Proceed with $0
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
