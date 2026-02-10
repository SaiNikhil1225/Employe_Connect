import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CustomerInfoTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
              <p className="text-base font-semibold">Acme Corporation</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Code</p>
              <p className="text-base font-semibold">ACME-001</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Manager</p>
              <p className="text-base font-semibold">John Smith</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
              <p className="text-base">contact@acme.com</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Billing Address</p>
              <p className="text-base">123 Business St, Suite 100<br />New York, NY 10001</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
