import { StatusBadge } from './StatusBadge';
import type { ProjectStatus } from './StatusBadge';
import { Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectHeaderProps {
  projectName: string;
  projectId: string;
  hubspotDealId?: string;
  status: string;
  projectManager: string;
  startDate: Date | string;
  endDate: Date | string;
  budget: number | string;
}

export function ProjectHeader({
  projectName,
  projectId,
  hubspotDealId,
  status,
  projectManager,
  startDate,
  endDate,
  budget,
}: ProjectHeaderProps) {
  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{projectName}</h1>
        <StatusBadge status={status as ProjectStatus} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Project ID</p>
          <p className="font-medium mt-1">{projectId}</p>
        </div>
        
        {hubspotDealId && (
          <div>
            <p className="text-muted-foreground">HubSpot Deal ID</p>
            <p className="font-medium mt-1">{hubspotDealId}</p>
          </div>
        )}
        
        <div>
          <p className="text-muted-foreground">Project Manager</p>
          <p className="font-medium mt-1">{projectManager}</p>
        </div>
        
        <div>
          <p className="text-muted-foreground">Start Date</p>
          <p className="font-medium mt-1">{format(new Date(startDate), 'MMM dd, yyyy')}</p>
        </div>
        
        <div>
          <p className="text-muted-foreground">End Date</p>
          <p className="font-medium mt-1">{format(new Date(endDate), 'MMM dd, yyyy')}</p>
        </div>
        
        <div>
          <p className="text-muted-foreground">Budget</p>
          <p className="font-medium mt-1">{formatCurrency(budget)}</p>
        </div>
      </div>
    </div>
  );
}
