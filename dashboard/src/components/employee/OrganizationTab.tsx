import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

interface OrganizationTabProps {
  organization: any;
}

export default function OrganizationTab({ organization }: OrganizationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Organization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <Label className="text-sm text-muted-foreground">Company Name</Label>
            <p className="text-base font-medium mt-1">{organization?.companyName || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Legal Entity</Label>
            <p className="text-base font-medium mt-1">{organization?.legalEntity || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Business Unit</Label>
            <p className="text-base font-medium mt-1">{organization?.businessUnit || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Department</Label>
            <p className="text-base font-medium mt-1">{organization?.department || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Cost Center</Label>
            <p className="text-base font-medium mt-1">{organization?.costCenter || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Division</Label>
            <p className="text-base font-medium mt-1">{organization?.division || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Branch</Label>
            <p className="text-base font-medium mt-1">{organization?.branch || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
