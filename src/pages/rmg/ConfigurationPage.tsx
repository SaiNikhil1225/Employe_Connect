import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Info } from 'lucide-react';
import { CONFIG_TYPES } from '@/services/configService';
import { useAuthStore } from '@/store/authStore';
import ConfigSection from './ConfigSection';

const ConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(CONFIG_TYPES[0].value);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'RMG' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <div className="page-header-content">
          <div className="flex items-start gap-3">
            <Settings className="h-7 w-7 text-primary mt-1" />
            <div>
              <h1 className="page-title">Configuration</h1>
              <p className="page-description">Manage system master data for dropdowns and configuration values</p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Admin Notice */}
      {!isAdmin && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have read-only access to this page. Only Admin users can add, edit, or delete configurations.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {CONFIG_TYPES.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CONFIG_TYPES.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-6">
              <ConfigSection type={type.value} label={type.label} />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default ConfigurationPage;
