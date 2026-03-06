import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Info, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { CreatePOForm } from '@/pages/rmg/customer-pos/components/CreatePOForm';
import { useCustomerPOStore } from '@/store/customerPOStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CustomerPOTabProps {
  projectId?: string;
}

export function CustomerPOTab({ projectId }: CustomerPOTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { pos, loading, fetchPOs } = useCustomerPOStore();
  const [financialLines, setFinancialLines] = useState<any[]>([]);

  // Fetch POs and Financial Lines when component mounts
  useEffect(() => {
    fetchPOs();
    if (projectId) {
      fetchFinancialLines();
    }
  }, [fetchPOs, projectId]);

  // Fetch financial lines for the project
  const fetchFinancialLines = async () => {
    try {
      const response = await fetch(`/api/financial-lines?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched financial lines:', data.data);
        setFinancialLines(data.data || []);
      } else {
        console.error('Failed to fetch financial lines:', response.status);
      }
    } catch (error) {
      console.error('Error fetching financial lines:', error);
    }
  };

  // Filter POs by projectId if provided (with null-safe checks)
  const projectPOs = projectId 
    ? pos.filter((po) => {
        if (!po || !po.projectId) return false;
        return po.projectId === projectId || (typeof po.projectId === 'object' && po.projectId?._id === projectId);
      })
    : pos;

  // Calculate allocated fund for each PO
  const calculateAllocatedFund = (poNo: string) => {
    let total = 0;
    financialLines.forEach((fl) => {
      // Check if this FL has funding allocations for this PO
      if (fl.funding && Array.isArray(fl.funding)) {
        fl.funding.forEach((allocation: any) => {
          if (allocation.poNo === poNo) {
            const amount = allocation.fundingAmountPoCurrency || 0;
            total += amount;
            console.log(`FL ${fl.flNo} allocated ${amount} to PO ${poNo}`);
          }
        });
      }
    });
    console.log(`Total allocated to PO ${poNo}: ${total}`);
    return total;
  };

  // Get allocation details for tooltip
  const getAllocationDetails = (poNo: string) => {
    const allocations: any[] = [];
    financialLines.forEach((fl) => {
      if (fl.funding && Array.isArray(fl.funding)) {
        fl.funding.forEach((allocation: any) => {
          if (allocation.poNo === poNo) {
            allocations.push({
              flNo: fl.flNo,
              flName: fl.flName,
              amount: allocation.fundingAmountPoCurrency || 0
            });
          }
        });
      }
    });
    return allocations;
  };

  const handleSuccess = () => {
    setIsCreateOpen(false);
    fetchPOs(); // Refresh the PO list
    if (projectId) {
      fetchFinancialLines(); // Also refresh financial lines
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {projectPOs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total PO Value</div>
              <div className="text-2xl font-bold text-brand-navy">
                ${projectPOs.reduce((sum, po) => sum + po.poAmount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Allocated</div>
              <div className="text-2xl font-bold text-brand-green">
                ${projectPOs.reduce((sum, po) => sum + calculateAllocatedFund(po.poNo), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Remaining Budget</div>
              <div className="text-2xl font-bold text-amber-600">
                ${projectPOs.reduce((sum, po) => sum + (po.poAmount - calculateAllocatedFund(po.poNo)), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Financial Lines</div>
              <div className="text-2xl font-bold text-brand-navy">
                {financialLines.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-brand-navy">Customer Purchase Orders</CardTitle>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-brand-green hover:bg-brand-green-dark gap-2"
          >
            <Plus className="h-4 w-4" />
            Create PO
          </Button>
        </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading POs...</div>
        ) : projectPOs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No purchase orders yet</div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Contract No</th>
                  <th className="text-left p-3 font-medium">PO No</th>
                  <th className="text-left p-3 font-medium">PO Start Date</th>
                  <th className="text-left p-3 font-medium">PO Value</th>
                  <th className="text-left p-3 font-medium">Currency</th>
                  <th className="text-left p-3 font-medium">Allocated Fund</th>
                  <th className="text-left p-3 font-medium">Total PO Value</th>
                </tr>
              </thead>
              <tbody>
                {projectPOs.map((po) => {
                  const allocatedFund = calculateAllocatedFund(po.poNo);
                  const allocationDetails = getAllocationDetails(po.poNo);
                  const remainingFund = po.poAmount - allocatedFund;
                  const allocationPercentage = (allocatedFund / po.poAmount) * 100;
                  
                  return (
                    <tr key={po._id} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-medium">{po.contractNo}</td>
                      <td className="p-3">{po.poNo}</td>
                      <td className="p-3">{format(new Date(po.poStartDate), 'MMM dd, yyyy')}</td>
                      <td className="p-3">${po.poAmount.toLocaleString()}</td>
                      <td className="p-3">{po.poCurrency}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={
                            allocatedFund > 0 
                              ? "font-medium text-brand-green"
                              : "font-medium text-muted-foreground"
                          }>
                            ${allocatedFund.toLocaleString()}
                          </span>
                          {allocationDetails.length > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="space-y-2">
                                    <p className="font-semibold">Allocated to Financial Lines:</p>
                                    {allocationDetails.map((detail, idx) => (
                                      <div key={idx} className="text-sm">
                                        <span className="font-medium">{detail.flNo}</span> - {detail.flName}
                                        <br />
                                        <span className="text-brand-green">${detail.amount.toLocaleString()}</span>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t">
                                      <p className="text-sm">
                                        <span className="font-medium">Total Allocated:</span> ${allocatedFund.toLocaleString()} ({allocationPercentage.toFixed(1)}%)
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium">Remaining:</span> <span className={remainingFund < 0 ? "text-red-600 font-semibold" : ""}>${remainingFund.toLocaleString()}</span>
                                      </p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">No allocations yet</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {allocationPercentage > 100 && (
                            <Badge variant="destructive" className="text-xs">Over-allocated</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-semibold">${po.poAmount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>

    <CreatePOForm
      open={isCreateOpen}
      onOpenChange={setIsCreateOpen}
      defaultProjectId={projectId}
      onSuccess={handleSuccess}
    />
    </div>
  );
}
