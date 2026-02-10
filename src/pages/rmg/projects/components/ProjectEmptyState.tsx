import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectEmptyStateProps {
  onCreateProject: () => void;
}

export function ProjectEmptyState({ onCreateProject }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="rounded-full bg-muted p-6 mb-6">
        <FolderKanban className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Heading */}
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        No projects yet
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first project. Track budgets, manage resources, 
        and monitor progress all in one place.
      </p>

      {/* CTA Button */}
      <Button 
        size="lg" 
        onClick={onCreateProject}
        className="bg-brand-green hover:bg-brand-green-dark"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Your First Project
      </Button>

      {/* Additional Help Text */}
      <p className="text-xs text-muted-foreground mt-6">
        Need help? Check out our{' '}
        <a href="#" className="text-brand-green hover:underline">
          getting started guide
        </a>
      </p>
    </div>
  );
}
