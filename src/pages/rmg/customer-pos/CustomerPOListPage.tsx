import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomerPOStore } from '@/store/customerPOStore';
import { useCustomerStore } from '@/store/customerStore';
import { useProjectStore } from '@/store/projectStore';
import { StatCard } from '@/components/common/StatCard';
import { CustomerPOTable } from './components/CustomerPOTable';
import { CreateCustomerPODialog } from './components/CreateCustomerPODialog';
import { useState } from 'react';

export function CustomerPOListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { pos = [], loading, filters, fetchPOs, setFilter } = useCustomerPOStore();
  const { customers = [], fetchCustomers } = useCustomerStore();
  const { projects = [], fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchPOs();
    fetchCustomers({});
    fetchProjects({});
  }, [fetchPOs, fetchCustomers, fetchProjects]);

  useEffect(() => {
    fetchPOs();
  }, [filters, fetchPOs]);

  const activeCustomers = customers?.filter((c) => c.status === 'Active') || [];
  const activeProjects = projects?.filter((p) => p.status === 'Active') || [];

  // Calculate KPIs
  const totalPOs = pos.length;
  const activePOs = pos.filter(po => po.status === 'Active').length;
  const closedPOs = pos.filter(po => po.status === 'Closed').length;
  const expiredPOs = pos.filter(po => po.status === 'Expired').length;
  const totalPOValue = pos.reduce((sum, po) => sum + (po.contractValue || 0), 0);

  // Mock trend data (in real app, compare with last month from API)
  const trends = {
    total: { value: 6, direction: 'up' as const },
    active: { value: 10, direction: 'up' as const },
    closed: { value: 8, direction: 'up' as const },
    expired: { value: 20, direction: 'down' as const, isPositive: true },
    value: { value: 15, direction: 'up' as const },
  };

  const handleStatClick = (status?: string) => {
    if (status) {
      setFilter('status', status);
    } else {
      // Clear all filters
      setFilter('search', '');
      setFilter('status', ' ');
      setFilter('bookingEntity', ' ');
      setFilter('customerId', ' ');
      setFilter('projectId', ' ');
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Customer POs</h1>
                <p className="text-sm text-muted-foreground">Manage purchase orders and contracts</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New PO
          </Button>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <StatCard
            label="Total"
            value={totalPOs}
            icon={FileText}
            color="blue"
            trend={trends.total}
            tooltip="Total number of purchase orders. Click to clear filters."
            onClick={() => handleStatClick()}
          />
          <StatCard
            label="Active"
            value={activePOs}
            icon={CheckCircle2}
            color="green"
            trend={trends.active}
            tooltip={`${activePOs} active purchase orders (${totalPOs > 0 ? Math.round((activePOs / totalPOs) * 100) : 0}% of total). Click to filter.`}
            onClick={() => handleStatClick('Active')}
          />
          <StatCard
            label="Closed"
            value={closedPOs}
            icon={XCircle}
            color="purple"
            trend={trends.closed}
            tooltip={`${closedPOs} closed purchase orders. Click to filter.`}
            onClick={() => handleStatClick('Closed')}
          />
          <StatCard
            label="Expired"
            value={expiredPOs}
            icon={Clock}
            color={expiredPOs > 0 ? 'orange' : 'green'}
            trend={trends.expired}
            tooltip={`${expiredPOs} expired purchase orders. Trend down is positive. Click to filter.`}
            onClick={() => handleStatClick('Expired')}
          />
          <StatCard
            label="Total Value"
            value={formatCurrency(totalPOValue)}
            icon={DollarSign}
            color="blue"
            trend={trends.value}
            tooltip={`Combined value of all purchase orders: ${formatCurrency(totalPOValue)}`}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter customer POs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Input
              placeholder="Search by contract no, PO no..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
            
            <Select value={filters.status} onValueChange={(value) => setFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.bookingEntity} onValueChange={(value) => setFilter('bookingEntity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Booking Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Entities</SelectItem>
                <SelectItem value="Eviden">Eviden</SelectItem>
                <SelectItem value="Habile">Habile</SelectItem>
                <SelectItem value="Akraya">Akraya</SelectItem>
                <SelectItem value="ECIS">ECIS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.customerId} onValueChange={(value) => setFilter('customerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Customers</SelectItem>
                {activeCustomers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.projectId} onValueChange={(value) => setFilter('projectId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Projects</SelectItem>
                {activeProjects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {typeof project.projectName === 'string' ? project.projectName : 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            {pos.length} {pos.length === 1 ? 'PO' : 'POs'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerPOTable data={pos} loading={loading} />
        </CardContent>
      </Card>

      <CreateCustomerPODialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchPOs();
        }}
      />
    </div>
  );
}
