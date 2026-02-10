import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { format } from 'date-fns';

interface FieldsTabProps {
  project: Project;
}

export function FieldsTab({ project }: FieldsTabProps) {
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
    <div className="space-y-6">
      {/* Basic Details */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg">Basic Details</CardTitle>
          <CardDescription>Core project information and identifiers</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project ID</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.projectId || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.projectName || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Name</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.accountName || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Legal Entity</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.legalEntity || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HubSpot Deal ID</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.hubspotDealId || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer ID</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.customerId || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing Type</label>
              <div className="mt-2">
                <Badge variant="outline" className="font-semibold bg-blue-50 text-blue-700 border-blue-200">
                  {project.billingType}
                </Badge>
              </div>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Practice Unit</label>
              <div className="mt-2">
                <Badge variant="outline" className="font-semibold bg-purple-50 text-purple-700 border-purple-200">
                  {project.practiceUnit}
                </Badge>
              </div>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</label>
              <div className="mt-2">
                <Badge variant="outline" className="font-semibold bg-green-50 text-green-700 border-green-200">
                  {project.region}
                </Badge>
              </div>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.projectCurrency || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Value</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.estimatedValue 
                  ? `${project.projectCurrency} ${project.estimatedValue.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.industry || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Type</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.clientType || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Type</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.revenueType || 'N/A'}</p>
            </div>
            <div className="md:col-span-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{project.description || 'No description provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg">Schedule</CardTitle>
          <CardDescription>Project timeline and key dates</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Start Date</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(project.projectStartDate)}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project End Date</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(project.projectEndDate)}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.projectStartDate && project.projectEndDate
                  ? `${Math.ceil((new Date(project.projectEndDate).getTime() - new Date(project.projectStartDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : 'N/A'}
              </p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Team */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg">Status & Team</CardTitle>
          <CardDescription>Current project status and team members</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Status</label>
              <div className="mt-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Size</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">{project.teamSize || 'N/A'}</p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.budget 
                  ? `${project.projectCurrency} ${project.budget.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Manager</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.projectManager?.name || 'N/A'}
                {project.projectManager?.employeeId && (
                  <span className="block text-xs text-muted-foreground mt-1">ID: {project.projectManager.employeeId}</span>
                )}
              </p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Manager</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.deliveryManager?.name || 'N/A'}
                {project.deliveryManager?.employeeId && (
                  <span className="block text-xs text-muted-foreground mt-1">ID: {project.deliveryManager.employeeId}</span>
                )}
              </p>
            </div>
            <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilization</label>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {project.utilization !== undefined ? `${project.utilization}%` : 'N/A'}
              </p>
            </div>
            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <div className="md:col-span-3 p-4 rounded-lg border border-gray-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/80 hover:bg-white shadow-sm">
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
