import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import { employeeService, type Employee } from '@/services/employeeService';
import { toast } from 'sonner';

interface FLResourceAllocation {
  flNo: string;
  flName: string;
  allocation: number;
  billable: boolean;
}

interface ResourceWithAllocation extends Employee {
  totalAllocation: number;
  isBillable: boolean;
  allocations: FLResourceAllocation[];
}

export function ResourcePool() {
  const [resources, setResources] = useState<ResourceWithAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResourcesWithAllocations = async () => {
      try {
        setIsLoading(true);

        // Fetch all active employees
        const employees = await employeeService.getActive();

        // Fetch all active FL Resources
        const response = await fetch('/api/fl-resources?status=Active');
        if (!response.ok) throw new Error('Failed to fetch FL resources');
        const flResources = await response.json();

        // Combine employee and FL resource allocation data
        const resourcesData: ResourceWithAllocation[] = employees.map((emp) => {
          // Get FL resources for this employee
          const empFLResources = flResources.filter(
            (flr: any) => flr.employeeId === emp.employeeId
          );

          // Calculate allocation for each FL resource and total
          const allocations: FLResourceAllocation[] = empFLResources.map((flr: any) => {
            const monthlyAllocations = flr.monthlyAllocations || [];
            let avgAllocation = 0;
            
            if (monthlyAllocations.length > 0) {
              const totalMonthlyAllocation = monthlyAllocations.reduce(
                (sum: number, month: any) => sum + (month.allocation || 0), 
                0
              );
              avgAllocation = Math.round(totalMonthlyAllocation / monthlyAllocations.length);
            } else if (flr.utilizationPercentage) {
              avgAllocation = flr.utilizationPercentage;
            }

            return {
              flNo: flr.flNo,
              flName: flr.flName,
              allocation: avgAllocation,
              billable: flr.billable,
            };
          });

          // Calculate total allocation percentage
          const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0);

          // Check if any allocation is billable
          const isBillable = allocations.some((a) => a.billable);

          return {
            ...emp,
            totalAllocation,
            isBillable,
            allocations,
          };
        });

        setResources(resourcesData);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        toast.error('Failed to load resource pool data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResourcesWithAllocations();
  }, []);

  // Filter resources based on search term
  const filteredResources = resources.filter((resource) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resource.name.toLowerCase().includes(searchLower) ||
      resource.designation.toLowerCase().includes(searchLower) ||
      resource.department.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users className="h-7 w-7 text-primary" />
            Resource Pool
          </h1>
          <p className="page-description">View and manage available resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Resources</CardTitle>
              <CardDescription>Total {resources.length} employees</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, department..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No resources found matching your search' : 'No resources available'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource.employeeId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {resource.profilePhoto ? (
                      <img
                        src={resource.profilePhoto}
                        alt={resource.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {resource.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.designation}</p>
                      <p className="text-xs text-muted-foreground">{resource.employeeId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{resource.department}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.totalAllocation}% allocated
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resource.allocations.length} project{resource.allocations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant={resource.isBillable ? 'default' : 'secondary'}>
                      {resource.isBillable ? 'Billable' : 'On Bench'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
