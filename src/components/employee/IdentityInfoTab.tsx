import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText } from 'lucide-react';

interface IdentityInfoTabProps {
  documents: any[];
}

export default function IdentityInfoTab({ documents }: IdentityInfoTabProps) {
  // Filter for identity documents
  const identityDocs = documents.filter(doc => 
    ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'].includes(doc.documentType)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Identity Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {identityDocs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {identityDocs.map((doc, index) => (
                <div key={index} className="border rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold text-sm">{doc.documentType}</h4>
                    </div>
                    <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                      {doc.status || 'Pending'}
                    </Badge>
                  </div>
                  {doc.documentNumber && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Number: <span className="font-medium text-foreground">{doc.documentNumber}</span>
                    </p>
                  )}
                  {doc.expiryDate && (
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  {doc.fileName && (
                    <p className="text-xs text-muted-foreground mt-2 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No identity documents uploaded yet</p>
              <p className="text-sm mt-1">Upload documents in the Documents tab</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
