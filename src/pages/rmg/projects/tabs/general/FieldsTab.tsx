import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { format } from 'date-fns';

interface FieldsTabProps {
  project: Project;
}

export function FieldsTab({ project }: FieldsTabProps) {
  const [calculatedTeamSize, setCalculatedTeamSize] = useState<number | null>(null);
  const [calculatedBudget, setCalculatedBudget] = useState<number | null>(null);
  const [budgetConsumed, setBudgetConsumed] = useState<number>(0);
  const [isLoadingCalculations, setIsLoadingCalculations] = useState(true);

  useEffect(() => {
    const fetchCalculatedValues = async () => {
      if (!project._id && !project.id) return;
      
      const projectId = project._id || project.id;
      setIsLoadingCalculations(true);

      try {
        // Fetch FL Resources to calculate team size
        const flResourcesResponse = await fetch(`/api/fl-resources?projectId=${projectId}`);
        if (flResourcesResponse.ok) {
          const flResources = await flResourcesResponse.json();
          
          // Count unique employees (filter by unique employeeId)
          const uniqueEmployees = new Set(
            flResources
              .filter((resource: any) => resource.employeeId && resource.status === 'Active')
              .map((resource: any) => resource.employeeId)
          );
          setCalculatedTeamSize(uniqueEmployees.size);
        }

        // Fetch Financial Lines to calculate total budget
        const flResponse = await fetch(`/api/financial-lines?projectId=${projectId}`);
        if (flResponse.ok) {
          const flData = await flResponse.json();
          const financialLines = Array.isArray(flData) ? flData : (flData.data || []);
          
          // Sum all FL budgets (using expectedRevenue or revenueAmount)
          const totalBudget = financialLines.reduce((sum: number, fl: any) => {
            return sum + (fl.expectedRevenue || fl.revenueAmount || 0);
          }, 0);
          setCalculatedBudget(totalBudget);
          
          // Calculate budget consumed from actual revenue in revenuePlanning
          const totalActualRevenue = financialLines.reduce((sum: number, fl: any) => {
            const revenuePlanning = fl.revenuePlanning || [];
            const flActualRevenue = revenuePlanning.reduce((flSum: number, month: any) => {
              return flSum + (month.actualRevenue || 0);
            }, 0);
            return sum + flActualRevenue;
          }, 0);
          setBudgetConsumed(totalActualRevenue);
        }
      } catch (error) {
        console.error('Error calculating team size and budget:', error);
      } finally {
        setIsLoadingCalculations(false);
      }
    };

    fetchCalculatedValues();
  }, [project._id, project.id]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-500/10 text-green-700 border-green-500/20',
      'Draft': 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      'On Hold': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      'Closed': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Basic Details */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Basic Details</CardTitle>
          <CardDescription className="text-xs">Core project information and identifiers</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project ID</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.projectId || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project Name</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.projectName || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Account Name</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.accountName || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Legal Entity</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.legalEntity || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">HubSpot Deal ID</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.hubspotDealId || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Customer ID</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.customerId || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Billing Type</label>
              <div className="mt-1.5">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {project.billingType}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Practice Unit</label>
              <div className="mt-1.5">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {project.practiceUnit}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Region</label>
              <div className="mt-1.5">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {project.region}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Currency</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.projectCurrency || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Estimated Value</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">
                {project.estimatedValue 
                  ? `${project.projectCurrency} ${project.estimatedValue.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Industry</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.industry || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Client Type</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.clientType || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Revenue Type</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{project.revenueType || 'N/A'}</p>
            </div>
            <div className="lg:col-span-2 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <label className="text-xs text-gray-500">Description</label>
              <p className="mt-1.5 text-sm text-gray-700">{project.description || 'No description provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Schedule</CardTitle>
          <CardDescription className="text-xs">Project timeline and key dates</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project Start Date</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{formatDate(project.projectStartDate)}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project End Date</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{formatDate(project.projectEndDate)}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Duration</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">
                {project.projectStartDate && project.projectEndDate
                  ? `${Math.ceil((new Date(project.projectEndDate).getTime() - new Date(project.projectStartDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Created At</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Last Updated</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Team */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">Status & Team</CardTitle>
          <CardDescription className="text-xs">Current project status and team members</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project Status</label>
              <div className="mt-1.5">
                <Badge className={getStatusColor(project.status)} className="text-xs">
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Team Size</label>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {isLoadingCalculations ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : calculatedTeamSize !== null ? (
                    <>
                      {calculatedTeamSize}
                      <span className="text-xs text-gray-500 ml-1">
                        (Active Resources)
                      </span>
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Budget</label>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {isLoadingCalculations ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : calculatedBudget !== null && calculatedBudget > 0 ? (
                    <>
                      {project.projectCurrency} {calculatedBudget.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">
                        (Sum of FLs)
                      </span>
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Budget Consumed Till Now</label>
              <div className="mt-1.5">
                <p className="text-sm font-medium text-gray-900">
                  {isLoadingCalculations ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <>
                      {project.projectCurrency} {budgetConsumed.toLocaleString()}
                      {calculatedBudget && calculatedBudget > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({((budgetConsumed / calculatedBudget) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">(Actual Revenue)</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Project Manager</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">
                {project.projectManager?.name || 'N/A'}
                {project.projectManager?.employeeId && (
                  <span className="block text-xs text-gray-500 mt-0.5">ID: {project.projectManager.employeeId}</span>
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <label className="text-xs text-gray-500">Delivery Manager</label>
              <p className="mt-1.5 text-sm font-medium text-gray-900">
                {project.deliveryManager?.name || 'N/A'}
                {project.deliveryManager?.employeeId && (
                  <span className="block text-xs text-gray-500 mt-0.5">ID: {project.deliveryManager.employeeId}</span>
                )}
              </p>
            </div>
            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <div className="lg:col-span-2 p-3 rounded-lg border border-gray-100 bg-indigo-50/30">
                <label className="text-xs text-gray-500">Required Skills</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-white/90 hover:bg-white">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
