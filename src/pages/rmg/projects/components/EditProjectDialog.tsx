import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { Project, ProjectFormData } from '@/types/project';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProjectForm } from './ProjectForm';
import { toast } from 'sonner';

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: EditProjectDialogProps) {
  const { updateProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    if (!project) {
      console.error('❌ No project available for update');
      toast.error('Project not found');
      return;
    }
    
    const projectId = project._id || project.id || '';
    console.log('📤 EditProjectDialog handleSubmit called');
    console.log('Project ID:', projectId);
    console.log('Form data:', data);
    
    setIsLoading(true);
    try {
      console.log('🔄 Calling updateProject...');
      await updateProject(projectId, data);
      console.log('✅ Update successful');
      toast.success('Project updated successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('❌ Update failed:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update project';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert date to YYYY-MM-DD format
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    // If it's already a string, extract YYYY-MM-DD part
    if (typeof date === 'string') {
      // Handle ISO format: "2024-01-15T00:00:00.000Z" -> "2024-01-15"
      return date.split('T')[0];
    }
    
    // If it's a Date object, format it
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert project to form default values
  const defaultValues = project ? ({
    projectId: project.projectId,
    customerId: typeof project.customerId === 'object' && project.customerId !== null 
      ? String((project.customerId as {_id?: string; id?: string})._id || (project.customerId as {_id?: string; id?: string}).id || project.customerId)
      : (project.customerId || ''),  // Handle ObjectId or string
    projectName: project.projectName,
    projectDescription: project.description || '',
    accountName: project.accountName || '',  // Ensure it's always a string
    hubspotDealId: project.hubspotDealId || '',
    legalEntity: project.legalEntity,
    projectManager: project.projectManager?.name || '',
    deliveryManager: project.deliveryManager?.name || '',
    dealOwner: project.dealOwner?.name || '',
    billingType: project.billingType,
    practiceUnit: project.practiceUnit,
    region: project.region,
    industry: project.industry || '',
    regionHead: project.regionHead || '',
    leadSource: project.leadSource || '',
    revenueType: project.revenueType || '',
    clientType: project.clientType || '',
    projectWonThroughRFP: project.projectWonThroughRFP || false,
    projectStartDate: formatDateForInput(project.projectStartDate),
    projectEndDate: formatDateForInput(project.projectEndDate),
    projectCurrency: project.projectCurrency,
    status: project.status,
  } as Partial<ProjectFormData>) : {};

  // Debug logging for customer fields
  if (project && open) {
    console.log('🔍 Edit Project Debug Info:', {
      projectId: project.projectId,
      projectName: project.projectName,
      customerId: project.customerId,
      accountName: project.accountName,
      'customerId type': typeof project.customerId,
      'accountName type': typeof project.accountName,
      dealOwner: project.dealOwner,
      regionHead: project.regionHead,
      leadSource: project.leadSource,
      defaultValues: {
        customerId: defaultValues.customerId,
        accountName: defaultValues.accountName,
        'customerId type': typeof defaultValues.customerId,
        'accountName type': typeof defaultValues.accountName,
        dealOwner: defaultValues.dealOwner,
        regionHead: defaultValues.regionHead,
        leadSource: defaultValues.leadSource,
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-6xl p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-brand-navy dark:text-gray-100">
              Edit Project
            </SheetTitle>
            <SheetDescription className="text-sm text-brand-slate dark:text-gray-400">
              Update project details and schedule information for {project?.projectName || 'this project'}.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {project && (
            <ProjectForm
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isLoading={isLoading}
              isEditMode={true}
              submitLabel="Update Project"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
