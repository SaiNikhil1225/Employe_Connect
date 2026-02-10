import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { FinancialLineTable } from '../../../financial-lines/components/FinancialLineTable';
import { CreateFLForm } from '../../../financial-lines/components/CreateFLForm';

export function MarginDetailsTab() {
  return (
    <Card className="border-brand-light-gray shadow-sm">
      <CardHeader>
        <CardTitle className="text-brand-navy">Margin Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-brand-slate py-12">
          Margin breakdown and calculations will be displayed here
        </div>
      </CardContent>
    </Card>
  );
}

interface FLSTabProps {
  projectId?: string;
}

export function FLSTab({ projectId }: FLSTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { fls = [], loading, filters, fetchFLs, setFilter } = useFinancialLineStore();

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCreateOpen(true);
  };

  // Initial fetch and project filter setup
  useEffect(() => {
    if (projectId) {
      setFilter('projectId', projectId);
    }
    fetchFLs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // Zustand functions are stable

  // Filter FLs for this project
  const projectFLs = projectId 
    ? fls.filter(fl => {
        const flProjectId = typeof fl.projectId === 'string' ? fl.projectId : fl.projectId?._id;
        return flProjectId === projectId;
      })
    : fls;

  return (
    <div className="space-y-6">
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-brand-navy">Filters</CardTitle>
              <CardDescription className="text-brand-slate">Search and filter financial lines</CardDescription>
            </div>
            <Button 
              type="button"
              onClick={handleCreateClick}
              className="bg-brand-green hover:bg-brand-green-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Financial Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by FL no, name..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
            />
            
            <Select value={filters.status} onValueChange={(value) => setFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.locationType} onValueChange={(value) => setFilter('locationType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Locations</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
                <SelectItem value="Offshore">Offshore</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.contractType} onValueChange={(value) => setFilter('contractType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Contract Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Types</SelectItem>
                <SelectItem value="T&M">T&M</SelectItem>
                <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                <SelectItem value="Retainer">Retainer</SelectItem>
                <SelectItem value="Milestone-based">Milestone-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">Financial Lines</CardTitle>
          <CardDescription className="text-brand-slate">
            {projectFLs.length} {projectFLs.length === 1 ? 'FL' : 'FLs'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialLineTable data={projectFLs} loading={loading} />
        </CardContent>
      </Card>

      <CreateFLForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultProjectId={projectId}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchFLs();
        }}
      />
    </div>
  );
}

export function PlannedCostsTab() {
  return (
    <Card className="border-brand-light-gray shadow-sm">
      <CardHeader>
        <CardTitle className="text-brand-navy">Planned Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-brand-slate py-12">
          Planned cost allocation will be displayed here
        </div>
      </CardContent>
    </Card>
  );
}

export function ActualCostsTab() {
  return (
    <Card className="border-brand-light-gray shadow-sm">
      <CardHeader>
        <CardTitle className="text-brand-navy">Actual Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-brand-slate py-12">
          Actual incurred costs will be displayed here
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueDetailsTab() {
  return (
    <Card className="border-brand-light-gray shadow-sm">
      <CardHeader>
        <CardTitle className="text-brand-navy">Revenue Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-brand-slate py-12">
          Revenue recognition data will be displayed here
        </div>
      </CardContent>
    </Card>
  );
}
