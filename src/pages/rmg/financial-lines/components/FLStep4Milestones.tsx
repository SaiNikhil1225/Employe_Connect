import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, FLStep4Data, PaymentMilestone } from '@/types/financialLine';
import { format, isBefore, isAfter } from 'date-fns';

interface FLStep4MilestonesProps {
  data: Partial<FLStep4Data>;
  step1Data: FLStep1Data;
  step2Data: FLStep2Data;
  onDataChange: (data: Partial<FLStep4Data>) => void;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function FLStep4Milestones({ data, step1Data, step2Data, onDataChange, onBack, onComplete }: FLStep4MilestonesProps) {
  const [milestones, setMilestones] = useState<PaymentMilestone[]>(data.paymentMilestones || []);
  const { toast } = useToast();

  const addMilestone = () => {
    const newMilestone: PaymentMilestone = {
      milestoneName: '',
      dueDate: '',
      amount: 0,
      notes: '',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof PaymentMilestone, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const calculateTotalMilestones = () => {
    return milestones.reduce((sum, milestone) => sum + (milestone.amount || 0), 0);
  };

  const validateMilestones = () => {
    if (milestones.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one payment milestone is required',
        variant: 'destructive',
      });
      return false;
    }

    const invalidMilestone = milestones.find(m => !m.milestoneName || !m.dueDate || m.amount <= 0);
    if (invalidMilestone) {
      toast({
        title: 'Validation Error',
        description: 'All milestones must have a name, due date, and amount greater than 0',
        variant: 'destructive',
      });
      return false;
    }

    const totalMilestones = calculateTotalMilestones();
    if (Math.abs(totalMilestones - step2Data.totalFunding) > 0.01) {
      toast({
        title: 'Validation Error',
        description: `Total milestone amount ($${totalMilestones.toFixed(2)}) must equal total funding ($${step2Data.totalFunding.toFixed(2)})`,
        variant: 'destructive',
      });
      return false;
    }

    // Validate due dates are within FL schedule
    const scheduleStart = new Date(step1Data.scheduleStart);
    const scheduleFinish = new Date(step1Data.scheduleFinish);
    
    const invalidDate = milestones.find(m => {
      const dueDate = new Date(m.dueDate);
      return isBefore(dueDate, scheduleStart) || isAfter(dueDate, scheduleFinish);
    });

    if (invalidDate) {
      toast({
        title: 'Validation Error',
        description: 'All milestone due dates must be within FL schedule start and finish dates',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleComplete = () => {
    if (!validateMilestones()) {
      return;
    }

    onDataChange({
      paymentMilestones: milestones,
    });
    onComplete();
  };

  const totalMilestones = calculateTotalMilestones();
  const isBalanced = Math.abs(totalMilestones - step2Data.totalFunding) < 0.01;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Milestones</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Define payment milestones for this Financial Line
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Total Funding</div>
              <div className="text-xl font-bold text-blue-600">
                ${step2Data.totalFunding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Total Milestones</div>
              <div className={`text-xl font-bold ${isBalanced ? 'text-brand-green' : 'text-red-600'}`}>
                ${totalMilestones.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {!isBalanced && (
                <div className="text-xs text-red-600 font-medium">
                  ⚠️ Must match total funding
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-2 text-left text-sm font-medium">S.No</th>
                    <th className="border p-2 text-left text-sm font-medium">Milestone Name *</th>
                    <th className="border p-2 text-left text-sm font-medium">Due Date *</th>
                    <th className="border p-2 text-left text-sm font-medium">Amount *</th>
                    <th className="border p-2 text-left text-sm font-medium">Notes</th>
                    <th className="border p-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2">
                        <Input
                          value={milestone.milestoneName}
                          onChange={(e) => updateMilestone(index, 'milestoneName', e.target.value)}
                          placeholder="e.g., Phase 1 Completion"
                        />
                      </td>
                      <td className="border p-2">
                        <DatePicker
                          value={milestone.dueDate}
                          onChange={(date) => updateMilestone(index, 'dueDate', date)}
                          placeholder="Select date"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={milestone.notes || ''}
                          onChange={(e) => updateMilestone(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Milestone Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FL Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle>Financial Line Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">FL Name</div>
              <div className="font-semibold">{step1Data.flName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contract Type</div>
              <div className="font-semibold">{step1Data.contractType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-semibold">{step1Data.locationType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-semibold">
                {format(new Date(step1Data.scheduleStart), 'MMM yyyy')} - {format(new Date(step1Data.scheduleFinish), 'MMM yyyy')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Billing Rate</div>
              <div className="font-semibold">${step1Data.billingRate}/{step1Data.rateUom}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expected Revenue</div>
              <div className="font-semibold text-brand-green">${step1Data.expectedRevenue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Funding</div>
              <div className="font-semibold text-blue-600">${step2Data.totalFunding.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Milestones</div>
              <div className="font-semibold">{milestones.length} milestones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden buttons controlled by parent */}
      <button type="button" onClick={handleComplete} className="hidden" id="step4-complete" />
      <button type="button" onClick={onBack} className="hidden" id="step4-back" />
    </div>
  );
}
