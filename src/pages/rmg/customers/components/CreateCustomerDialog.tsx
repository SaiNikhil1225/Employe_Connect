import { useState } from 'react';
import { useCustomerStore } from '@/store/customerStore';
import type { Customer, CustomerFormData } from '@/types/customer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CustomerForm } from './CustomerForm';
import { toast } from 'sonner';

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  customer,
}: CreateCustomerDialogProps) {
  const { createCustomer, updateCustomer } = useCustomerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      if (customer) {
        const id = customer._id || customer.id!;
        await updateCustomer(id, data);
        toast.success('Customer updated successfully');
        onOpenChange(false);
      } else {
        const newCustomer = await createCustomer(data);
        setCreatedCustomer(newCustomer);
        toast.success('Customer created successfully');
        // Keep dialog open briefly to show the generated customer number
        setTimeout(() => {
          onOpenChange(false);
          setCreatedCustomer(null);
        }, 2000);
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${customer ? 'update' : 'create'} customer`;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full overflow-hidden !w-[60vw] max-w-none">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle>{customer ? 'Edit' : 'Create New'} Customer</SheetTitle>
          <SheetDescription>
            {customer ? 'Update the customer details below.' : 'Add a new customer to your database.'} Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <CustomerForm
            key={createdCustomer?._id || customer?._id || 'new'}
            onSubmit={handleSubmit}
            defaultValues={(customer || createdCustomer) ? {
              customerNo: (customer || createdCustomer)?.customerNo || '',
              customerName: (customer || createdCustomer)?.customerName || '',
              industry: (customer || createdCustomer)?.industry || '',
              region: (customer || createdCustomer)?.region,
              regionHead: (customer || createdCustomer)?.regionHead || '',
              hubspotRecordId: (customer || createdCustomer)?.hubspotRecordId || '',
              status: (customer || createdCustomer)?.status || 'Active',
            } : undefined}
            isLoading={isLoading}
            submitLabel={customer ? 'Update Customer' : 'Create Customer'}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
