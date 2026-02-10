import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/store/customerStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, UserCheck, UserX, TrendingUp, MapPin } from 'lucide-react';
import { CustomerTable } from './components/CustomerTable';
import { CreateCustomerDialog } from './components/CreateCustomerDialog';
import { StatCard } from '@/components/common/StatCard';
import type { CustomerFilters } from '@/types/customer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CustomerListPage() {
  const { customers, isLoading, fetchCustomers } = useCustomerStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const inactiveCustomers = customers.filter(c => c.status === 'Inactive').length;
  const regions = Array.from(new Set(customers.map(c => c.region).filter(Boolean))).length;

  // Mock trend data (in real app, compare with last month from API)
  const trends = {
    total: { value: 5, direction: 'up' as const },
    active: { value: 8, direction: 'up' as const },
    inactive: { value: 12, direction: 'down' as const, isPositive: true },
    regions: { value: 0, direction: 'up' as const },
  };

  const handleStatClick = (status?: string) => {
    if (status) {
      handleFilterChange('status', status);
    } else {
      // Clear all filters
      setFilters({});
      setSearchQuery('');
    }
  };

  useEffect(() => {
    fetchCustomers(filters);
  }, [fetchCustomers, filters]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    if (value === 'all') {
      const { [key]: _removed, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-primary/5 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Customers</h1>
                <p className="text-sm text-muted-foreground">Manage your customer database</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatCard
            label="Total"
            value={totalCustomers}
            icon={Users}
            color="blue"
            trend={trends.total}
            tooltip="Total number of customers in the database. Click to clear filters."
            onClick={() => handleStatClick()}
          />
          <StatCard
            label="Active"
            value={activeCustomers}
            icon={UserCheck}
            color="green"
            trend={trends.active}
            tooltip={`${activeCustomers} active customers (${totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% of total). Click to filter active customers.`}
            onClick={() => handleStatClick('Active')}
          />
          <StatCard
            label="Inactive"
            value={inactiveCustomers}
            icon={UserX}
            color="orange"
            trend={trends.inactive}
            tooltip={`${inactiveCustomers} inactive customers. Trend down is positive. Click to filter inactive customers.`}
            onClick={() => handleStatClick('Inactive')}
          />
          <StatCard
            label="Regions"
            value={regions}
            icon={MapPin}
            color="purple"
            trend={regions > 0 ? trends.regions : undefined}
            tooltip={`Customers across ${regions} different regions: UK, India, USA, ME, Other.`}
          />
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter customers by status, region, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or customer number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Region Filter */}
            <Select
              value={filters.region || 'all'}
              onValueChange={(value) => handleFilterChange('region', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="ME">Middle East</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(filters.status || filters.region || filters.search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {customers.length} customer{customers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTable customers={customers} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
