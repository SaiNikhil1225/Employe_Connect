import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import type { Project, ProjectFormData } from '@/types/project';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetCloseButton,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ProjectForm } from './ProjectForm';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight } from 'lucide-react';

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
  const navigate = useNavigate();
  const { updateProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showEndDateAlert, setShowEndDateAlert] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ProjectFormData | null>(null);

  // Check if project end date has been extended
  const isEndDateExtended = (newEndDate: string, originalEndDate: Date | string | undefined): boolean => {
    if (!originalEndDate || !newEndDate) return false;
    const original = new Date(originalEndDate);
    const updated = new Date(newEndDate);
    return updated > original;
  };

  const handleSubmit = async (data: ProjectFormData) => {
    if (!project) {
      toast.error('Project not found');
      return;
    }

    // Check if end date was extended
    if (isEndDateExtended(data.projectEndDate, project.projectEndDate)) {
      // Store the form data and show the alert dialog
      setPendingFormData(data);
      setShowEndDateAlert(true);
      return;
    }

    // No extension — save directly
    await performUpdate(data);
  };

  const performUpdate = async (data: ProjectFormData) => {
    if (!project) return;

    const projectId = project._id || project.id || '';
    setIsLoading(true);
    try {
      await updateProject(projectId, data);
      toast.success('Project updated successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update project';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExtension = async () => {
    setShowEndDateAlert(false);
    if (pendingFormData) {
      await performUpdate(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleGoToFinancialLines = async () => {
    setShowEndDateAlert(false);
    if (pendingFormData) {
      await performUpdate(pendingFormData);
      setPendingFormData(null);
      // Navigate to the project detail page, financials tab
      const projectId = project?._id || project?.id || '';
      onOpenChange(false);
      navigate(`/rmg/projects/${projectId}?tab=financials&subtab=fls`);
    }
  };

  const handleCancelExtension = () => {
    setShowEndDateAlert(false);
    setPendingFormData(null);
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
    // Debug: Edit Project Info available
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-6xl p-0">
        <SheetHeader>
          <div className="flex-1">
            <SheetTitle className="text-xl font-semibold text-brand-navy dark:text-gray-100">
              Edit Project
            </SheetTitle>
            <SheetDescription className="text-sm text-brand-slate dark:text-gray-400">
              Update project details and schedule information for {project?.projectName || 'this project'}.
            </SheetDescription>
          </div>
          <SheetCloseButton />
        </SheetHeader>
        
        <SheetBody>
          {project && (
            <ProjectForm
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isLoading={isLoading}
              isEditMode={true}
              submitLabel="Update Project"
            />
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>

    {/* End Date Extension Alert Dialog */}
    <AlertDialog open={showEndDateAlert} onOpenChange={setShowEndDateAlert}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-lg">Project Timeline Extended</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-3 text-sm leading-relaxed">
            Project timeline extended. Please extend the <strong>Planned Cost</strong> and <strong>Planned Revenue</strong> for the extended duration.
          </AlertDialogDescription>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
            <p>• Update Planned Revenue in Financial Lines for the new months</p>
            <p>• Verify PO Funding covers the extended timeline</p>
            <p>• Adjust Planned Costs to reflect additional resources/duration</p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleCancelExtension} className="sm:order-1">
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirmExtension} className="sm:order-2">
            Save & Review Later
          </Button>
          <Button onClick={handleGoToFinancialLines} className="sm:order-3 gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <ArrowRight className="h-4 w-4" />
            Save & Go to Financial Lines
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
