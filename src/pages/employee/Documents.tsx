import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Construction } from 'lucide-react';

export function Documents() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <FolderOpen className="h-7 w-7 text-primary" />
            Documents
          </h1>
          <p className="page-description">Access company policies and personal documents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Management
          </CardTitle>
          <CardDescription>
            Access and manage your company documents
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Construction className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This feature is currently under development.
                <br />
                Access company policies, personal documents, and important files.
              </p>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Work in progress...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
