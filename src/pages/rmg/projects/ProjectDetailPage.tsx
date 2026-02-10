import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, DollarSign, Users, BarChart3, ArrowLeft } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectHeader } from './components/ProjectHeader';
import { ResourceTable } from './components/ResourceTable';

// General Info Sub-tabs
import { FieldsTab } from './tabs/general/FieldsTab';
import { CustomerInfoTab } from './tabs/general/CustomerInfoTab';

// Financials Sub-tabs
import { FinancialSummaryTab } from './tabs/financials/FinancialSummaryTab';
import { CustomerPOTab } from './tabs/financials/CustomerPOTab';
import { MarginDetailsTab, FLSTab, PlannedCostsTab, ActualCostsTab, RevenueDetailsTab } from './tabs/financials/FinancialsSubTabs';

// Components
import { ComingSoon } from './components/ComingSoon';

// Mock resource data
const mockResources = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Designer',
    department: 'Design',
    skills: ['UI/UX', 'Figma', 'Prototyping', 'Design Systems'],
    utilization: 75,
    status: 'Active' as const,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Lead Engineer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    utilization: 92,
    status: 'Active' as const,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Marketing Manager',
    department: 'Marketing',
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    utilization: 60,
    status: 'Active' as const,
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Backend Developer',
    department: 'Engineering',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    utilization: 0,
    status: 'On Leave' as const,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Product Manager',
    department: 'Product',
    skills: ['Agile', 'JIRA', 'Roadmapping', 'Stakeholder Management'],
    utilization: 105,
    status: 'Active' as const,
  },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById } = useProjectStore();
  const [isInitialLoading, setIsInitialLoading] = useState(!selectedProject);
  const [primaryTab, setPrimaryTab] = useState('general');
  const [generalSubTab, setGeneralSubTab] = useState('fields');
  const [financialSubTab, setFinancialSubTab] = useState('summary');
  const [resourceSubTab, setResourceSubTab] = useState('request');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('resourcewise');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('wsp');

  useEffect(() => {
    if (id) {
      setIsInitialLoading(true);
      fetchProjectById(id).finally(() => setIsInitialLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // fetchProjectById is stable in Zustand store

  // Filter resources based on search
  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  if (isInitialLoading && !selectedProject) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground font-medium">Project not found</p>
          <Button onClick={() => navigate('/rmg/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/rmg/projects')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

      {/* Project Header */}
      <div className="bg-background/80 backdrop-blur rounded-lg border">
        <ProjectHeader
          projectName={selectedProject.projectName}
          projectId={selectedProject.projectId}
          hubspotDealId={selectedProject.hubspotDealId}
          status={selectedProject.status}
          projectManager={selectedProject.projectManager?.name || 'Unassigned'}
          startDate={selectedProject.projectStartDate}
          endDate={selectedProject.projectEndDate}
          budget={selectedProject.estimatedValue || 1200000}
        />
      </div>
      </div>

      {/* Primary Tabs */}
      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="w-full">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger 
            value="financials"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-green data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-brand-green data-[state=active]:font-semibold px-6 py-3 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">In Dev</Badge>
          </TabsTrigger>
        </TabsList>

        {/* General Info Tab with Sub-tabs */}
        <TabsContent value="general" className="mt-6">
          <Tabs value={generalSubTab} onValueChange={setGeneralSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="fields" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Fields</TabsTrigger>
              <TabsTrigger value="customer-info" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Customer Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields">{selectedProject && <FieldsTab project={selectedProject} />}</TabsContent>
            <TabsContent value="customer-info">{selectedProject && <CustomerInfoTab project={selectedProject} />}</TabsContent>
          </Tabs>
        </TabsContent>

        {/* Financials Tab with Sub-tabs */}
        <TabsContent value="financials" className="mt-6">
          <Tabs value={financialSubTab} onValueChange={setFinancialSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="summary" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Summary</TabsTrigger>
              <TabsTrigger value="margin" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Margin Details
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="po" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Customer PO</TabsTrigger>
              <TabsTrigger value="fls" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">FL's</TabsTrigger>
              <TabsTrigger value="planned" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Planned Costs
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="actual" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Actual Cost
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Revenue Details
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary"><FinancialSummaryTab /></TabsContent>
            <TabsContent value="margin"><MarginDetailsTab /></TabsContent>
            <TabsContent value="po"><CustomerPOTab projectId={selectedProject?._id || selectedProject?.id} /></TabsContent>
            <TabsContent value="fls"><FLSTab projectId={selectedProject?._id || selectedProject?.id} /></TabsContent>
            <TabsContent value="planned"><PlannedCostsTab /></TabsContent>
            <TabsContent value="actual"><ActualCostsTab /></TabsContent>
            <TabsContent value="revenue"><RevenueDetailsTab /></TabsContent>
          </Tabs>
        </TabsContent>

        {/* Resources Tab with Sub-tabs */}
        <TabsContent value="resources" className="mt-6">
          <Tabs value={resourceSubTab} onValueChange={setResourceSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="request" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Resource Request
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">
                Resource Details
                <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1.5">In Dev</Badge>
              </TabsTrigger>
              <TabsTrigger value="allocated" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Allocated Resource</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request">
              <ComingSoon 
                title="Resource Request" 
                description="Resource request management system with approval workflows is under development."
                priority="high"
                estimatedDate="Q2 2026"
              />
            </TabsContent>
            <TabsContent value="details">
              <ComingSoon 
                title="Resource Details" 
                description="Detailed resource information view with skills, availability, and performance metrics."
                priority="medium"
                estimatedDate="Q2 2026"
              />
            </TabsContent>
            <TabsContent value="allocated">
              <div className="space-y-6">
                {/* Resource Toolbar */}
                <Card className="border-brand-light-gray shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                      <div className="flex flex-col md:flex-row gap-4 flex-1">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                          <Input
                            placeholder="Filter resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>

                        {/* Type Filter */}
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Project Filter */}
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wsp">WSP</SelectItem>
                            <SelectItem value="alpha">Alpha</SelectItem>
                            <SelectItem value="beta">Beta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Add Resource Button */}
                      <Button className="bg-brand-green hover:bg-brand-green-dark text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Add Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Table */}
                <Card className="border-brand-light-gray shadow-sm rounded-lg">
                  <CardContent className="p-6">
                    <ResourceTable resources={filteredResources} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Analytics Tab with Sub-tabs */}
        <TabsContent value="analytics" className="mt-6">
          <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab}>
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="resourcewise" className="data-[state=active]:text-brand-green data-[state=active]:border-b-2 data-[state=active]:border-brand-green">Resource Wise MOM Hours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resourcewise">
              <ComingSoon 
                title="Resource Wise MOM Hours" 
                description="Comprehensive analytics showing resource-wise month-over-month hours with trend analysis and forecasting."
                priority="high"
                estimatedDate="Q1 2026"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
