import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ColumnVisibility {
  projectName: boolean;
  owner: boolean;
  status: boolean;
  progress: boolean;
  budget: boolean;
  team: boolean;
  dueDate: boolean;
}

interface ColumnToggleProps {
  columns: ColumnVisibility;
  onToggle: (columns: ColumnVisibility) => void;
}

export function ColumnToggle({ columns, onToggle }: ColumnToggleProps) {
  const columnLabels: Record<keyof ColumnVisibility, string> = {
    projectName: 'Project Name',
    owner: 'Owner',
    status: 'Status',
    progress: 'Progress',
    budget: 'Budget Used',
    team: 'Team',
    dueDate: 'Due Date',
  };

  const toggleColumn = (key: keyof ColumnVisibility) => {
    onToggle({ ...columns, [key]: !columns[key] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2 className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-2 p-2">
          {(Object.keys(columns) as Array<keyof ColumnVisibility>).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={columns[key]}
                onCheckedChange={() => toggleColumn(key)}
                disabled={key === 'projectName'} // Always keep project name visible
              />
              <label
                htmlFor={key}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 cursor-pointer"
              >
                {columnLabels[key]}
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
