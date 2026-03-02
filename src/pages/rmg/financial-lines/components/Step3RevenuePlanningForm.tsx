import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, InfoIcon, SplitSquareHorizontal } from 'lucide-react';
import type { FLRevenuePlanning, RevenuePlanning } from '@/types/financialLine';
import { format, eachMonthOfInterval, parseISO, eachDayOfInterval, isWeekend, startOfMonth, endOfMonth, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface Step3FormProps {
  scheduleStart: string;
  scheduleEnd: string;
  unitRate: number;
  fundingValue: number;
  defaultValues?: Partial<FLRevenuePlanning>;
  onNext: (data: FLRevenuePlanning) => void;
  onBack: () => void;
}

export function Step3RevenuePlanningForm({
  scheduleStart,
  scheduleEnd,
  unitRate,
  fundingValue,
  defaultValues,
  onNext,
  onBack,
}: Step3FormProps) {
  const [revenuePlanning, setRevenuePlanning] = useState<RevenuePlanning[]>([]);
  const [totalUnitsToSplit, setTotalUnitsToSplit] = useState<number>(0);

  useEffect(() => {
    if (defaultValues?.revenuePlanning && defaultValues.revenuePlanning.length > 0) {
      setRevenuePlanning(defaultValues.revenuePlanning);
    } else {
      // Generate monthly rows from scheduleStart to scheduleEnd
      const months = eachMonthOfInterval({
        start: parseISO(scheduleStart),
        end: parseISO(scheduleEnd),
      });

      const planning = months.map((date) => ({
        month: format(date, 'MMM yyyy'),
        plannedUnits: 0,
        plannedRevenue: 0,
        actualUnits: 0,
        forecastedUnits: 0,
        variance: 0,
      }));

      setRevenuePlanning(planning);
    }
  }, [scheduleStart, scheduleEnd, defaultValues]);

  const handlePlannedUnitsChange = (index: number, value: string) => {
    const units = parseFloat(value) || 0;
    const revenue = units * unitRate;
    
    setRevenuePlanning((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, plannedUnits: units, plannedRevenue: revenue }
          : item
      )
    );
  };

  const handleForecastedUnitsChange = (index: number, value: string) => {
    const units = parseFloat(value) || 0;
    const variance = units - revenuePlanning[index].plannedUnits;
    
    setRevenuePlanning((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, forecastedUnits: units, variance }
          : item
      )
    );
  };

  // Calculate working days in a month (excluding weekends)
  const getWorkingDaysInMonth = (monthStr: string): number => {
    // Parse month string like "Jan 2024" or "MMM yyyy"
    const monthDate = parseISO(format(new Date(monthStr), 'yyyy-MM') + '-01');
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    // For partial months at start/end of project, use actual dates
    const projectStart = parseISO(scheduleStart);
    const projectEnd = parseISO(scheduleEnd);
    
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
      toast.error('Please enter total units to split.');
      return;
    }

    if (revenuePlanning.length === 0) {
      toast.error('No months available for splitting.');
      return;
    }

    // Calculate working days for each month
    const monthsWithWorkingDays = revenuePlanning.map(item => ({
      ...item,
      workingDays: getWorkingDaysInMonth(item.month),
    }));

    // Calculate total working days across all months
    const totalWorkingDays = monthsWithWorkingDays.reduce((sum, m) => sum + m.workingDays, 0);

    if (totalWorkingDays === 0) {
      toast.error('No working days found in the selected period.');
      return;
    }

    // Split units proportionally based on working days
    const updatedPlanning = monthsWithWorkingDays.map(item => {
      const proportion = item.workingDays / totalWorkingDays;
      const plannedUnits = parseFloat((totalUnitsToSplit * proportion).toFixed(2));
      const plannedRevenue = plannedUnits * unitRate;
      const variance = item.forecastedUnits - plannedUnits;
      
      return {
        month: item.month,
        plannedUnits,
        plannedRevenue,
        actualUnits: item.actualUnits,
        forecastedUnits: item.forecastedUnits,
        variance,
      };
    });
    
    setRevenuePlanning(updatedPlanning);
    toast.success(`${totalUnitsToSplit} units split across ${revenuePlanning.length} months based on working days.`);
  };

  const totalPlannedRevenue = revenuePlanning.reduce(
    (sum, item) => sum + item.plannedRevenue,
    0
  );

  const exceedsFunding = totalPlannedRevenue > fundingValue;

  const handleNext = () => {
    onNext({ revenuePlanning });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <div className="flex justify-between">
            <span>Total Funding Value: <strong>{fundingValue.toLocaleString()}</strong></span>
            <span>Unit Rate: <strong>{unitRate}</strong></span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Split Revenue Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-amber-900">
                Auto-Split by Working Days
              </label>
              <p className="text-xs text-amber-700">
                Enter total units to split proportionally based on working days per month (excluding weekends).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={totalUnitsToSplit || ''}
                onChange={(e) => setTotalUnitsToSplit(parseFloat(e.target.value) || 0)}
                placeholder="Total units..."
                className="max-w-[150px] bg-white"
              />
              <Button 
                onClick={handleSplitRevenue}
                variant="outline"
                className="gap-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900"
                type="button"
              >
                <SplitSquareHorizontal className="h-4 w-4" />
                Split
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Planned Units</TableHead>
              <TableHead className="text-right">Planned Revenue</TableHead>
              <TableHead className="text-right">Forecasted Units</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revenuePlanning.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.month}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.plannedUnits}
                    onChange={(e) => handlePlannedUnitsChange(index, e.target.value)}
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.plannedRevenue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.forecastedUnits}
                    onChange={(e) => handleForecastedUnitsChange(index, e.target.value)}
                    className="text-right"
                  />
                </TableCell>
                <TableCell className={`text-right ${item.variance < 0 ? 'text-destructive' : item.variance > 0 ? 'text-green-600' : ''}`}>
                  {item.variance.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                {revenuePlanning.reduce((sum, item) => sum + item.plannedUnits, 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totalPlannedRevenue.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {revenuePlanning.reduce((sum, item) => sum + item.forecastedUnits, 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {revenuePlanning.reduce((sum, item) => sum + item.variance, 0).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {exceedsFunding && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Total planned revenue ({totalPlannedRevenue.toLocaleString()}) exceeds funding value ({fundingValue.toLocaleString()})!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={exceedsFunding}>
          Next
        </Button>
      </div>
    </div>
  );
}
