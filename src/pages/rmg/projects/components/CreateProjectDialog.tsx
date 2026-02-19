import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import type { ProjectFormData } from '@/types/project';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProjectForm } from './ProjectForm';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const { createProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await createProject(data);
      toast.success('Project created successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create project';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-6xl p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-brand-navy dark:text-gray-100">
              Create New Project
            </SheetTitle>
            <SheetDescription className="text-sm text-brand-slate dark:text-gray-400">
              Add a new project to your portfolio. Fill in the basic details and schedule information.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ProjectForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Project"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
