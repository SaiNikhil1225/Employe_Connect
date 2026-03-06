import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/store/customerStore';
import type { Project } from '@/types/project';

interface CustomerInfoTabProps {
  project?: Project;
}

export function CustomerInfoTab({ project }: CustomerInfoTabProps) {
  const { selectedCustomer, fetchCustomerById, isLoading } = useCustomerStore();
  const [customerNotFound, setCustomerNotFound] = useState(false);

  useEffect(() => {
    if (project?.customerId) {
      setCustomerNotFound(false);
      fetchCustomerById(project.customerId).catch(() => {
        setCustomerNotFound(true);
      });
    }
  }, [project?.customerId, fetchCustomerById]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Loading customer information...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (customerNotFound || !project?.customerId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No customer information available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                <p className="text-base font-semibold">{selectedCustomer?.customerName || project.accountName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Code</p>
                <p className="text-base font-semibold">{selectedCustomer?.customerNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-base font-semibold">{selectedCustomer?.industry || project.industry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p className="text-base">{selectedCustomer?.region || project.region || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedCustomer?.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCustomer?.status || 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">HubSpot Record ID</p>
                <p className="text-base">{selectedCustomer?.hubspotRecordId || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
