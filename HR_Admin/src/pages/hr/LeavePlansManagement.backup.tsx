import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Users, 
  Settings, 
  CalendarClock, 
  Plus,
  Edit,
  ChevronRight,
  UserPlus,
  FilePenLine
} from 'lucide-react';
import { toast } from 'sonner';
import { leavePlanService } from '@/services/leaveService';
import type { LeavePlanConfig, EmployeeWithBalance } from '@/types/leave';
import { LEAVE_PLAN_COLORS } from '@/types/leave';
// import { AllocateLeaveModal } from '@/components/leave/AllocateLeaveModal';
// import { AdjustLeaveModal } from '@/components/leave/AdjustLeaveModal';
// import { BulkAllocateModal } from '@/components/leave/BulkAllocateModal';
import { Skeleton } from '@/components/ui/skeleton';

export function LeavePlansManagement() {
  const [plans, setPlans] = useState<LeavePlanConfig[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LeavePlanConfig | null>(null);
  const [employees, setEmployees] = useState<EmployeeWithBalance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');

  useEffect(() => {
    loadPlans().catch(err => {
      console.error('Error in loadPlans effect:', err);
    });
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      loadPlanEmployees(selectedPlan.planName).catch(err => {
        console.error('Error in loadPlanEmployees effect:', err);
      });
    }
  }, [selectedPlan]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await leavePlanService.getAllPlans();
      console.log('Loaded plans:', data);
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error('Failed to load leave plans:', error);
      toast.error('Failed to load leave plans');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanEmployees = async (planName: string) => {
    try {
      const data = await leavePlanService.getPlanEmployees(planName);
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const handleAllocateLeave = (_employee: EmployeeWithBalance) => {
    toast.info('Allocate modal - Coming soon!');
  };

  const handleAdjustLeave = (_employee: EmployeeWithBalance) => {
    toast.info('Adjust modal - Coming soon!');
  };

  const handleBulkAllocate = () => {
    toast.info('Bulk allocate modal - Coming soon!');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-9">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Plans Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure leave types, manage employee allocations, and monitor utilization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Leave Plans List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leave Plans</CardTitle>
              <CardDescription>Select a plan to manage</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {plans.map((plan) => (
                  <button
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left transition-colors hover:bg-accent ${
                      selectedPlan?._id === plan._id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={LEAVE_PLAN_COLORS[plan.planName]}>
                            {plan.planName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{plan.employeeCount || 0} employees</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area - Tabbed Interface */}
        <div className="lg:col-span-9">
          {selectedPlan && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedPlan.planName}</CardTitle>
                    <CardDescription className="mt-1">{selectedPlan.description}</CardDescription>
                  </div>
                  <Badge className={LEAVE_PLAN_COLORS[selectedPlan.planName]}>
                    {selectedPlan.planName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="configuration" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger value="employees" className="gap-2">
                      <Users className="h-4 w-4" />
                      Employees ({selectedPlan.employeeCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="year-end" className="gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Year-End Processing
                    </TabsTrigger>
                  </TabsList>

                  {/* Configuration Tab */}
                  <TabsContent value="configuration" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Leave Types</h3>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Leave Type
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Annual Quota</TableHead>
                            <TableHead>Accrual Type</TableHead>
                            <TableHead>Carry Forward</TableHead>
                            <TableHead>Encashment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPlan.leaveTypes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No leave types configured for this plan
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedPlan.leaveTypes.map((lt) => (
                              <TableRow key={lt._id || lt.type}>
                                <TableCell className="font-medium">{lt.type}</TableCell>
                                <TableCell>{lt.annualAllocation} days</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {lt.accrualType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {lt.carryForwardAllowed ? (
                                    <span className="text-xs">
                                      Max {lt.maxCarryForward} days
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Not allowed</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {lt.encashmentAllowed ? (
                                    <span className="text-xs">
                                      Max {lt.maxEncashment} days
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Not allowed</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Employees Tab */}
                  <TabsContent value="employees" className="space-y-4 mt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search employees..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={handleBulkAllocate} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Bulk Allocate
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Leave Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No employees found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEmployees.map((emp) => (
                              <TableRow key={emp.employeeId}>
                                <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                                <TableCell className="font-medium">{emp.name}</TableCell>
                                <TableCell>{emp.department}</TableCell>
                                <TableCell>{emp.designation}</TableCell>
                                <TableCell>
                                  {emp.leaveBalance ? (
                                    <div className="text-xs space-y-1">
                                      {emp.leaveBalance.leaveTypes.map((lt) => (
                                        <div key={lt.type} className="flex items-center gap-2">
                                          <span className="text-muted-foreground w-24 truncate">{lt.type}:</span>
                                          <span className="font-medium">{lt.available}/{lt.allocated}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Not initialized</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAllocateLeave(emp)}
                                    >
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Allocate
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAdjustLeave(emp)}
                                    >
                                      <FilePenLine className="h-4 w-4 mr-1" />
                                      Adjust
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Year-End Processing Tab */}
                  <TabsContent value="year-end" className="space-y-4 mt-6">
                    <div className="text-center py-12">
                      <CalendarClock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Year-End Processing</h3>
                      <p className="text-muted-foreground mb-6">
                        Configure and execute year-end leave balance processing
                      </p>
                      <Button disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Modals - Temporarily disabled */}
      {/* {selectedEmployee && (
        <>
          <AllocateLeaveModal
            open={showAllocateModal}
            onOpenChange={setShowAllocateModal}
            employee={selectedEmployee}
            leavePlan={selectedPlan!}
            onSuccess={handleAllocationSuccess}
            currentUser={user!}
          />

          <AdjustLeaveModal
            open={showAdjustModal}
            onOpenChange={setShowAdjustModal}
            employee={selectedEmployee}
            leavePlan={selectedPlan!}
            onSuccess={handleAllocationSuccess}
            currentUser={user!}
          />
        </>
      )}

      {selectedPlan && (
        <BulkAllocateModal
          open={showBulkAllocateModal}
          onOpenChange={setShowBulkAllocateModal}
          leavePlan={selectedPlan}
          employees={employees}
          onSuccess={handleAllocationSuccess}
          currentUser={user!}
        />
      )} */}
    </div>
  );
}
