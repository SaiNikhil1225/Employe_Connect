import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { CreatePOForm } from '@/pages/rmg/customer-pos/components/CreatePOForm';
import { useCustomerPOStore } from '@/store/customerPOStore';

interface CustomerPOTabProps {
  projectId?: string;
}

export function CustomerPOTab({ projectId }: CustomerPOTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { pos, loading, fetchPOs } = useCustomerPOStore();

  // Fetch POs when component mounts and when projectId changes
  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  // Filter POs by projectId if provided (with null-safe checks)
  const projectPOs = projectId 
    ? pos.filter((po) => {
        if (!po || !po.projectId) return false;
        return po.projectId === projectId || po.projectId?._id === projectId;
      })
    : pos;

  const handleSuccess = () => {
    setIsCreateOpen(false);
    fetchPOs(); // Refresh the PO list
  };

  return (
    <div className="space-y-4">
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
                {projectPOs.map((po) => (
                  <tr key={po._id} className="border-t hover:bg-muted/50">
                    <td className="p-3 font-medium">{po.contractNo}</td>
                    <td className="p-3">{po.poNo}</td>
                    <td className="p-3">{format(new Date(po.poStartDate), 'MMM dd, yyyy')}</td>
                    <td className="p-3">${po.poAmount.toLocaleString()}</td>
                    <td className="p-3">{po.poCurrency}</td>
                    <td className="p-3">$0</td>
                    <td className="p-3 font-semibold">${po.poAmount.toLocaleString()}</td>
                  </tr>
                ))}
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
