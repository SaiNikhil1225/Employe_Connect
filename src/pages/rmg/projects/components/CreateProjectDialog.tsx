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
      <SheetContent className="flex flex-col h-full overflow-hidden !w-[60vw] max-w-none">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Add a new project to your portfolio. Fill in the basic details and schedule information.
          </SheetDescription>
        </SheetHeader>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
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
