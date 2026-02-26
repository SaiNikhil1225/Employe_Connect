import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export interface CardFilterOptions {
  timePeriod?: string;
  trainingType?: string;
  department?: string;
  location?: string;
  costRange?: string;
  certificationStatus?: string;
  trainingStatus?: string;
  trainingMode?: string;
}

interface StatCardFilterProps {
  onFilterChange: (filters: CardFilterOptions) => void;
  filterOptions: {
    showTimePeriod?: boolean;
    showTrainingType?: boolean;
    showDepartment?: boolean;
    showLocation?: boolean;
    showCostRange?: boolean;
    showCertificationStatus?: boolean;
    showTrainingStatus?: boolean;
    showTrainingMode?: boolean;
  };
  departments?: string[];
  locations?: string[];
}

const TIME_PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last 12 months' },
];

const TRAINING_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Technical Training', label: 'Technical Training' },
  { value: 'Soft Skills', label: 'Soft Skills' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Compliance', label: 'Compliance' },
];

const COST_RANGES = [
  { value: 'all', label: 'All Costs' },
  { value: '0-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1000' },
  { value: '1000-2500', label: '$1000 - $2500' },
  { value: '2500-5000', label: '$2500 - $5000' },
  { value: '5000+', label: 'Above $5000' },
];

const CERTIFICATION_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'Certified', label: 'Completed' },
  { value: 'Pending', label: 'In Progress' },
  { value: 'Expired', label: 'Expired' },
];

const TRAINING_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Not Started', label: 'Not Started' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const TRAINING_MODES = [
  { value: 'all', label: 'All Modes' },
  { value: 'Online', label: 'Online' },
  { value: 'Offline', label: 'Offline' },
  { value: 'Hybrid', label: 'Hybrid' },
];

export function StatCardFilter({ 
  onFilterChange, 
  filterOptions,
  departments = [],
  locations = []
}: StatCardFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<CardFilterOptions>({
    timePeriod: 'all',
    trainingType: 'all',
    department: 'all',
    location: 'all',
    costRange: 'all',
    certificationStatus: 'all',
    trainingStatus: 'all',
    trainingMode: 'all',
  });

  const activeFilterCount = Object.entries(filters).filter(
    ([_, value]) => value && value !== 'all'
  ).length;

  const handleFilterChange = (key: keyof CardFilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: CardFilterOptions = {
      timePeriod: 'all',
      trainingType: 'all',
      department: 'all',
      location: 'all',
      costRange: 'all',
      certificationStatus: 'all',
      trainingStatus: 'all',
      trainingMode: 'all',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter Options</h4>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {filterOptions.showTimePeriod && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Time Period</label>
              <Select 
                value={filters.timePeriod} 
                onValueChange={(value) => handleFilterChange('timePeriod', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showTrainingType && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Training Type</label>
              <Select 
                value={filters.trainingType} 
                onValueChange={(value) => handleFilterChange('trainingType', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showDepartment && departments.length > 0 && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Department</label>
              <Select 
                value={filters.department} 
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showLocation && locations.length > 0 && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Location</label>
              <Select 
                value={filters.location} 
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showCostRange && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Cost Range</label>
              <Select 
                value={filters.costRange} 
                onValueChange={(value) => handleFilterChange('costRange', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showCertificationStatus && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Certification Status</label>
              <Select 
                value={filters.certificationStatus} 
                onValueChange={(value) => handleFilterChange('certificationStatus', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showTrainingStatus && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Training Status</label>
              <Select 
                value={filters.trainingStatus} 
                onValueChange={(value) => handleFilterChange('trainingStatus', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.showTrainingMode && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Training Mode</label>
              <Select 
                value={filters.trainingMode} 
                onValueChange={(value) => handleFilterChange('trainingMode', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={applyFilters} 
            className="w-full"
            size="sm"
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
