import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ExportColumn {
  id: string;
  label: string;
  defaultSelected: boolean;
}

interface ExportColumnSelectorProps {
  open: boolean;
  onClose: () => void;
  onExport: (selectedColumns: string[], format: 'excel' | 'csv' | 'pdf') => void;
  format: 'excel' | 'csv' | 'pdf';
}

const AVAILABLE_COLUMNS: ExportColumn[] = [
  { id: 'employeeId', label: 'Employee ID', defaultSelected: true },
  { id: 'name', label: 'Name', defaultSelected: true },
  { id: 'designation', label: 'Designation', defaultSelected: true },
  { id: 'department', label: 'Department', defaultSelected: true },
  { id: 'location', label: 'Location', defaultSelected: true },
  { id: 'email', label: 'Email', defaultSelected: true },
  { id: 'phone', label: 'Mobile', defaultSelected: true },
  { id: 'dateOfJoining', label: 'Date of Joining', defaultSelected: false },
  { id: 'previousExp', label: 'Previous Experience', defaultSelected: true },
  { id: 'previousExpYears', label: 'Previous Exp (Years)', defaultSelected: false },
  { id: 'previousExpMonths', label: 'Previous Exp (Months)', defaultSelected: false },
  { id: 'acuvateExp', label: 'Acuvate Experience', defaultSelected: true },
  { id: 'acuvateExpMonths', label: 'Acuvate Exp (Months)', defaultSelected: false },
  { id: 'totalExp', label: 'Total Experience', defaultSelected: true },
  { id: 'totalExpMonths', label: 'Total Exp (Months)', defaultSelected: false },
  { id: 'status', label: 'Status', defaultSelected: true },
];

export default function ExportColumnSelector({
  open,
  onClose,
  onExport,
  format,
}: ExportColumnSelectorProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.defaultSelected).map(col => col.id)
  );

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map(col => col.id));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      return;
    }
    onExport(selectedColumns, format);
    onClose();
  };

  const getFormatLabel = () => {
    switch (format) {
      case 'excel':
        return 'Excel';
      case 'csv':
        return 'CSV';
      case 'pdf':
        return 'PDF';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Columns to Export ({getFormatLabel()})</DialogTitle>
          <DialogDescription>
            Choose the columns you want to include in your export. Select at least one column.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select/Deselect All */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Deselect All
            </Button>
            <div className="ml-auto text-sm text-muted-foreground flex items-center">
              {selectedColumns.length} of {AVAILABLE_COLUMNS.length} columns selected
            </div>
          </div>

          {/* Column List */}
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_COLUMNS.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => handleToggleColumn(column.id)}
                  />
                  <Label
                    htmlFor={column.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Category Legends */}
          <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Basic Info</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Experience</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Detailed Metrics</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export {selectedColumns.length} Column{selectedColumns.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
