import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { CustomerPOForm } from './CustomerPOForm';
import { useCustomerPOStore } from '@/store/customerPOStore';
import type { CustomerPO, CustomerPOFormData } from '@/types/customerPO';
import { toast } from 'sonner';

interface CreateCustomerPODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  po?: CustomerPO;
  onSuccess?: () => void;
}

export function CreateCustomerPODialog({
  open,
  onOpenChange,
  po,
  onSuccess,
}: CreateCustomerPODialogProps) {
  const { createPO, updatePO } = useCustomerPOStore();

  const handleSubmit = async (data: CustomerPOFormData) => {
    try {
      if (po) {
        await updatePO(po._id, data);
        toast.success('Customer PO updated successfully');
      } else {
        await createPO(data);
        toast.success('Customer PO created successfully');
      }
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0">
        <SheetHeader>
          <div className="flex-1">
            <SheetTitle>{po ? 'Edit' : 'Create'} Customer PO</SheetTitle>
            <SheetDescription>
              {po
                ? 'Update the customer purchase order details below.'
                : 'Fill in the details to create a new customer purchase order.'}
            </SheetDescription>
          </div>
          <SheetCloseButton />
        </SheetHeader>
        <SheetBody>
          <CustomerPOForm po={po} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
