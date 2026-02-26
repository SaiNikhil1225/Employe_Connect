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
  FilePenLine,
  Eye,
  Lock,
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { leavePlanService } from '@/services/leaveService';
import { useProfile } from '@/contexts/ProfileContext';
import type { LeavePlanConfig, EmployeeWithBalance } from '@/types/leave';
import { LEAVE_PLAN_COLORS } from '@/types/leave';
// import { AllocateLeaveModal } from '@/components/leave/AllocateLeaveModal';
// import { AdjustLeaveModal } from '@/components/leave/AdjustLeaveModal';
// import { BulkAllocateModal } from '@/components/leave/BulkAllocateModal';
import { Skeleton } from '@/components/ui/skeleton';

export function LeavePlansManagement() {
  const { permissions } = useProfile();
  const [plans, setPlans] = useState<LeavePlanConfig[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LeavePlanConfig | null>(null);
  const [employees, setEmployees] = useState<EmployeeWithBalance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  const [showAddLeaveTypeModal, setShowAddLeaveTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<any>(null);
  const [newLeaveType, setNewLeaveType] = useState({
    type: '',
    annualAllocation: 0,
    accrualType: 'annual',
    carryForwardAllowed: false,
    maxCarryForward: 0,
    encashmentAllowed: false,
    maxEncashment: 0,
    noticePeriodDays: 0,
    maxConsecutiveDays: 365,
    requiresMedicalCertificate: false,
    paidLeave: true
  });

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

  const handleAddLeaveType = async () => {
    if (!selectedPlan || !newLeaveType.type || newLeaveType.annualAllocation <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const updatedPlan = await leavePlanService.addLeaveType(selectedPlan._id!, newLeaveType);
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(plan => plan._id === updatedPlan._id ? updatedPlan : plan));
      setNewLeaveType({
        type: '',
        annualAllocation: 0,
        accrualType: 'annual',
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: true
      });
      setShowAddLeaveTypeModal(false);
      toast.success('Leave type added successfully');
    } catch (error) {
      console.error('Error adding leave type:', error);
      toast.error('Failed to add leave type');
    }
  };

  const handleEditLeaveType = (leaveType: any) => {
    setEditingLeaveType(leaveType);
    setNewLeaveType({
      type: leaveType.type,
      annualAllocation: leaveType.annualAllocation,
      accrualType: leaveType.accrualType || 'annual',
      carryForwardAllowed: leaveType.carryForwardAllowed || false,
      maxCarryForward: leaveType.maxCarryForward || 0,
      encashmentAllowed: leaveType.encashmentAllowed || false,
      maxEncashment: leaveType.maxEncashment || 0,
      noticePeriodDays: leaveType.noticePeriodDays || 0,
      maxConsecutiveDays: leaveType.maxConsecutiveDays || 365,
      requiresMedicalCertificate: leaveType.requiresMedicalCertificate || false,
      paidLeave: leaveType.paidLeave !== false
    });
    setShowAddLeaveTypeModal(true);
  };

  const handleUpdateLeaveType = async () => {
    if (!selectedPlan || !editingLeaveType || !newLeaveType.type || newLeaveType.annualAllocation <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const updatedPlan = await leavePlanService.updateLeaveType(selectedPlan._id!, editingLeaveType._id, newLeaveType);
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(plan => plan._id === updatedPlan._id ? updatedPlan : plan));
      setNewLeaveType({
        type: '',
        annualAllocation: 0,
        accrualType: 'annual',
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: true
      });
      setEditingLeaveType(null);
      setShowAddLeaveTypeModal(false);
      toast.success('Leave type updated successfully');
    } catch (error) {
      console.error('Error updating leave type:', error);
      toast.error('Failed to update leave type');
    }
  };

  const handleDeleteLeaveType = async (leaveTypeId: string) => {
    if (!selectedPlan) return;

    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      const updatedPlan = await leavePlanService.deleteLeaveType(selectedPlan._id!, leaveTypeId);
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(plan => plan._id === updatedPlan._id ? updatedPlan : plan));
      toast.success('Leave type deleted successfully');
    } catch (error) {
      console.error('Error deleting leave type:', error);
      toast.error('Failed to delete leave type');
    }
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
                      <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          setEditingLeaveType(null);
                          setNewLeaveType({
                            type: '',
                            annualAllocation: 0,
                            accrualType: 'annual',
                            carryForwardAllowed: false,
                            maxCarryForward: 0,
                            encashmentAllowed: false,
                            maxEncashment: 0,
                            noticePeriodDays: 0,
                            maxConsecutiveDays: 365,
                            requiresMedicalCertificate: false,
                            paidLeave: true
                          });
                          setShowAddLeaveTypeModal(true);
                        }}
                      >
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
                          {!selectedPlan.leaveTypes || selectedPlan.leaveTypes.length === 0 ? (
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
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditLeaveType(lt)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => lt._id && handleDeleteLeaveType(lt._id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                                  {emp.leaveBalance && emp.leaveBalance.leaveTypes && emp.leaveBalance.leaveTypes.length > 0 ? (
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

      {/* Add/Edit Leave Type Modal */}
      {showAddLeaveTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50" onClick={() => {
          setShowAddLeaveTypeModal(false);
          setEditingLeaveType(null);
        }}>
          <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-2xl h-screen flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}
              </h2>
              <button
                onClick={() => {
                  setShowAddLeaveTypeModal(false);
                  setEditingLeaveType(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Leave Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Leave Type Name *
                  </label>
                  <select
                    value={newLeaveType.type}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Compensatory Off">Compensatory Off</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Bereavement Leave">Bereavement Leave</option>
                    <option value="Marriage Leave">Marriage Leave</option>
                    <option value="Loss of Pay">Loss of Pay</option>
                    <option value="Annual Leave">Annual Leave</option>
                  </select>
                </div>

                {/* Annual Allocation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Annual Allocation (Days) *
                  </label>
                  <Input
                    type="number"
                    value={newLeaveType.annualAllocation}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, annualAllocation: parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>

                {/* Accrual Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accrual Type
                  </label>
                  <select
                    value={newLeaveType.accrualType}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, accrualType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                    <option value="on-demand">On Demand</option>
                  </select>
                </div>

                {/* Carry Forward Section */}
                <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="carryForward"
                      checked={newLeaveType.carryForwardAllowed}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, carryForwardAllowed: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="carryForward" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow Carry Forward to Next Year
                    </label>
                  </div>

                  {/* Max Carry Forward */}
                  {newLeaveType.carryForwardAllowed && (
                    <div className="pl-7">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum Carry Forward Days
                      </label>
                      <Input
                        type="number"
                        value={newLeaveType.maxCarryForward}
                        onChange={(e) => setNewLeaveType({ ...newLeaveType, maxCarryForward: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {/* Encashment Section */}
                <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="encashment"
                      checked={newLeaveType.encashmentAllowed}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, encashmentAllowed: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="encashment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow Encashment at Year End
                    </label>
                  </div>

                  {/* Max Encashment */}
                  {newLeaveType.encashmentAllowed && (
                    <div className="pl-7">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum Encashment Days
                      </label>
                      <Input
                        type="number"
                        value={newLeaveType.maxEncashment}
                        onChange={(e) => setNewLeaveType({ ...newLeaveType, maxEncashment: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {/* Notice Period and Max Consecutive Days - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notice Period (Days)
                    </label>
                    <Input
                      type="number"
                      value={newLeaveType.noticePeriodDays}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, noticePeriodDays: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0 for no notice required"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Consecutive Days
                    </label>
                    <Input
                      type="number"
                      value={newLeaveType.maxConsecutiveDays}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, maxConsecutiveDays: parseInt(e.target.value) || 365 })}
                      min="1"
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3 pt-2">
                  {/* Medical Certificate */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      id="medicalCert"
                      checked={newLeaveType.requiresMedicalCertificate}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, requiresMedicalCertificate: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="medicalCert" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Requires Medical Certificate
                    </label>
                  </div>

                  {/* Paid Leave */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      id="paidLeave"
                      checked={newLeaveType.paidLeave}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, paidLeave: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="paidLeave" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Paid Leave
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddLeaveTypeModal(false);
                  setEditingLeaveType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingLeaveType ? handleUpdateLeaveType : handleAddLeaveType}
                disabled={!newLeaveType.type || newLeaveType.annualAllocation <= 0}
              >
                {editingLeaveType ? 'Update' : 'Add'} Leave Type
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
