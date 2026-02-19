import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, FundingAllocation, UOM } from '@/types/financialLine';
import { useEffect } from 'react';
import axios from 'axios';

interface FLStep2FundingProps {
  data: Partial<FLStep2Data>;
  step1Data: FLStep1Data;
  onDataChange: (data: Partial<FLStep2Data>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FLStep2Funding({ data, step1Data, onDataChange, onNext, onBack }: FLStep2FundingProps) {
  const [fundingRows, setFundingRows] = useState<FundingAllocation[]>(data.funding || []);
  const { pos, fetchPOs } = useCustomerPOStore();
  const { toast } = useToast();
  const [poAllocations, setPOAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  // Filter POs by project
  const projectPOs = pos.filter(po => {
    if (typeof po.projectId === 'object' && po.projectId !== null) {
      return po.projectId._id === step1Data.projectId;
    }
    return po.projectId === step1Data.projectId;
  });

  // Fetch existing allocations for each PO
  useEffect(() => {
    const fetchPOAllocations = async () => {
      try {
        const response = await axios.get(`/api/financial-lines?projectId=${step1Data.projectId}`);
        const allFLs = response.data.data || [];
        
        // Calculate total allocated amount per PO
        const allocations: Record<string, number> = {};
        
        allFLs.forEach((fl: any) => {
          if (fl.funding && Array.isArray(fl.funding)) {
            fl.funding.forEach((allocation: any) => {
              const poNo = allocation.poNo;
              const amount = allocation.fundingAmountPoCurrency || 0;
              allocations[poNo] = (allocations[poNo] || 0) + amount;
            });
          }
        });
        
        console.log('PO Allocations calculated:', allocations);
        setPOAllocations(allocations);
      } catch (error) {
        console.error('Error fetching PO allocations:', error);
      }
    };

    if (step1Data.projectId && projectPOs.length > 0) {
      fetchPOAllocations();
    }
  }, [step1Data.projectId, projectPOs.length]);

  const addFundingRow = () => {
    const newRow: FundingAllocation = {
      poNo: '',
      contractNo: '',
      projectCurrency: step1Data.currency,
      poCurrency: '',
      unitRate: step1Data.billingRate,
      fundingUnits: 0,
      uom: step1Data.rateUom,
      fundingValueProject: 0,
      fundingAmountPoCurrency: 0,
      availablePOLineInPO: 0,
      availablePOLineInProject: 0,
    };
    setFundingRows([...fundingRows, newRow]);
  };

  const removeFundingRow = (index: number) => {
    setFundingRows(fundingRows.filter((_, i) => i !== index));
  };

  const updateFundingRow = (index: number, field: keyof FundingAllocation, value: string | number | UOM) => {
    const updated = [...fundingRows];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill contract no and currency when PO is selected
    if (field === 'poNo' && value) {
      const selectedPO = projectPOs.find(po => po.poNo === value);
      if (selectedPO) {
        updated[index].contractNo = selectedPO.contractNo;
        updated[index].poCurrency = selectedPO.poCurrency;
        
        // Calculate available balance: PO Amount - Already Allocated
        const alreadyAllocated = poAllocations[selectedPO.poNo] || 0;
        const availableBalance = selectedPO.poAmount - alreadyAllocated;
        
        console.log(`PO ${selectedPO.poNo}: Total=${selectedPO.poAmount}, Allocated=${alreadyAllocated}, Available=${availableBalance}`);
        
        updated[index].availablePOLineInPO = availableBalance;
        updated[index].availablePOLineInProject = availableBalance;
      }
    }

    // Calculation Logic:
    // 1. If Funding Units or Unit Rate changes → Calculate Funding Value
    if (field === 'fundingUnits' || field === 'unitRate') {
      const unitRate = field === 'unitRate' ? (value as number) : updated[index].unitRate;
      const fundingUnits = field === 'fundingUnits' ? (value as number) : updated[index].fundingUnits;
      
      if (unitRate && fundingUnits) {
        updated[index].fundingValueProject = unitRate * fundingUnits;
        updated[index].fundingAmountPoCurrency = updated[index].fundingValueProject;
      }
    }
    
    // 2. If Funding Value changes → Calculate Funding Units (reverse calculation)
    if (field === 'fundingValueProject') {
      const fundingValue = value as number;
      const unitRate = updated[index].unitRate;
      
      if (unitRate && unitRate > 0) {
        updated[index].fundingUnits = fundingValue / unitRate;
        updated[index].fundingAmountPoCurrency = fundingValue;
      } else if (unitRate === 0) {
        toast({
          title: 'Calculation Error',
          description: 'Unit Rate must be greater than 0 to calculate Funding Units',
          variant: 'destructive',
        });
        // Reset to previous value or 0
        updated[index].fundingValueProject = 0;
        updated[index].fundingUnits = 0;
      }
    }

    setFundingRows(updated);
  };

  const calculateTotalFunding = () => {
    return fundingRows.reduce((sum, row) => sum + row.fundingValueProject, 0);
  };

  const handleNext = () => {
    if (fundingRows.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one PO funding allocation is required',
        variant: 'destructive',
      });
      return;
    }

    const invalidRow = fundingRows.find(row => {
      if (!row.poNo) return true;
      if (row.fundingValueProject <= 0) return true;
      if (row.unitRate <= 0) return true;
      return false;
    });
    
    if (invalidRow) {
      toast({
        title: 'Validation Error',
        description: 'All funding rows must have: PO selected, Unit Rate > 0, and Funding Value > 0',
        variant: 'destructive',
      });
      return;
    }

    const totalFunding = calculateTotalFunding();
    onDataChange({
      funding: fundingRows,
      totalFunding,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PO Funding Allocation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Allocate funding from Customer POs to this Financial Line
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Funding</div>
            <div className="text-2xl font-bold text-brand-green">
              ${calculateTotalFunding().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Day-Based Calculation:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Funding Value = Billing Rate × Number of Working Days</strong></li>
                <li>Edit <strong>Funding Days</strong> or <strong>Billing Rate</strong> → <strong>Funding Value</strong> auto-calculates</li>
                <li>Edit <strong>Funding Value</strong> directly → <strong>Funding Days</strong> auto-calculates</li>
              </ul>
            </div>
            
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-2 text-left text-sm font-medium">S.No</th>
                    <th className="border p-2 text-left text-sm font-medium">PO No *</th>
                    <th className="border p-2 text-left text-sm font-medium">Contract No</th>
                    <th className="border p-2 text-left text-sm font-medium">Project Currency</th>
                    <th className="border p-2 text-left text-sm font-medium">PO Currency</th>
                    <th className="border p-2 text-left text-sm font-medium">Billing Rate *</th>
                    <th className="border p-2 text-left text-sm font-medium">Working</th>
                    <th className="border p-2 text-left text-sm font-medium">UOM</th>
                    <th className="border p-2 text-left text-sm font-medium">Funding Value (Project) *</th>
                    <th className="border p-2 text-left text-sm font-medium">Available PO Line</th>
                    <th className="border p-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingRows.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2">
                        <Select
                          value={row.poNo}
                          onValueChange={(value) => updateFundingRow(index, 'poNo', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select PO" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectPOs.map((po) => (
                              <SelectItem key={po._id} value={po.poNo}>
                                {po.poNo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border p-2">
                        <Input value={row.contractNo} disabled className="bg-gray-50" />
                      </td>
                      <td className="border p-2">
                        <Input value={row.projectCurrency} disabled className="bg-gray-50" />
                      </td>
                      <td className="border p-2">
                        <Input value={row.poCurrency} disabled className="bg-gray-50" />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.unitRate}
                          onChange={(e) => updateFundingRow(index, 'unitRate', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.fundingUnits}
                          onChange={(e) => updateFundingRow(index, 'fundingUnits', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border p-2">
                        <Select
                          value={row.uom}
                          onValueChange={(value) => updateFundingRow(index, 'uom', value as UOM)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hr">Hr</SelectItem>
                            <SelectItem value="Day">Day</SelectItem>
                            <SelectItem value="Month">Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.fundingValueProject}
                          onChange={(e) => updateFundingRow(index, 'fundingValueProject', parseFloat(e.target.value) || 0)}
                          className="font-semibold"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={row.availablePOLineInProject.toFixed(2)}
                          disabled
                          className="bg-gray-50"
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFundingRow(index)}
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

            {/* Add Row Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addFundingRow}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funding Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden buttons controlled by parent */}
      <button type="button" onClick={handleNext} className="hidden" id="step2-next" />
      <button type="button" onClick={onBack} className="hidden" id="step2-back" />
    </div>
  );
}
