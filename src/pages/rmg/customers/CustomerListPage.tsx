import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/store/customerStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, UserCheck, UserX, TrendingUp, MapPin, X, Filter } from 'lucide-react';
import { CustomerTable } from './components/CustomerTable';
import { CreateCustomerDialog } from './components/CreateCustomerDialog';
import { StatCard } from '@/components/common/StatCard';
import { ColumnToggle, type ColumnVisibility } from './components/ColumnToggle';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    customerNumber: true,
    customerName: true,
    industry: true,
    region: true,
    regionHead: true,
    status: true,
    createdAt: true,
  });

  // Filter options
  const statusOptions: Option[] = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  const regionOptions: Option[] = [
    { label: 'UK', value: 'UK' },
    { label: 'India', value: 'India' },
    { label: 'USA', value: 'USA' },
    { label: 'ME', value: 'ME' },
    { label: 'Other', value: 'Other' },
  ];

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
      setSelectedStatuses([status]);
    } else {
      clearAllFilters();
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedRegions([]);
    setFilters({});
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    selectedStatuses.length +
    selectedRegions.length;

  const removeFilter = (type: 'status' | 'region' | 'search', value?: string) => {
    switch (type) {
      case 'status':
        setSelectedStatuses(selectedStatuses.filter(s => s !== value));
        break;
      case 'region':
        setSelectedRegions(selectedRegions.filter(r => r !== value));
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  useEffect(() => {
    fetchCustomers(filters);
  }, [fetchCustomers, filters]);

  useEffect(() => {
    // Real-time search with debouncing
    const timeoutId = setTimeout(() => {
      const newFilters: CustomerFilters = {};
      
      if (searchQuery) {
        newFilters.search = searchQuery;
      }
      
      if (selectedStatuses.length > 0) {
        newFilters.statuses = selectedStatuses;
      }
      
      if (selectedRegions.length > 0) {
        newFilters.regions = selectedRegions;
      }
      
      setFilters(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatuses, selectedRegions]);

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <div className="page-header-content">
          <div className="flex items-start gap-3">
            <Users className="h-7 w-7 text-primary mt-1" />
            <div>
              <h1 className="page-title">Customers</h1>
              <p className="page-description">Manage your customer database</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>
                {customers.length} customer{customers.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <ColumnToggle 
                columns={columnVisibility} 
                onToggle={setColumnVisibility}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 !pt-0">
          {/* Filters Section */}
          {showFilters && (
            <Card className="border-muted shadow-none hover:shadow-none">
              <CardContent className="pb-4 !pt-0 !px-0">
                <div className="space-y-4">
                  {/* Filters Row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Search Input */}
                    <div className="w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or customer number..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 border-brand-light-gray focus:ring-brand-green focus:border-brand-green"
                          aria-label="Search customers"
                        />
                      </div>
                    </div>

                    {/* Status Multi-Select */}
                    <div className="w-[180px]">
                      <MultiSelect
                        options={statusOptions}
                        selected={selectedStatuses}
                        onChange={setSelectedStatuses}
                        placeholder="Status"
                        className="border-brand-light-gray"
                      />
                    </div>

                    {/* Region Multi-Select */}
                    <div className="w-[180px]">
                      <MultiSelect
                        options={regionOptions}
                        selected={selectedRegions}
                        onChange={setSelectedRegions}
                        placeholder="Region"
                        className="border-brand-light-gray"
                      />
                    </div>
                  </div>

                  {/* Active Filter Chips */}
                  {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-light-gray">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">Active Filters ({activeFilterCount}):</span>
                      </div>
                      
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                          Search: "{searchQuery}"
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('search')}
                          />
                        </Badge>
                      )}
                      
                      {selectedStatuses.map((status) => (
                        <Badge key={status} variant="secondary" className="gap-1">
                          Status: {status}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('status', status)}
                          />
                        </Badge>
                      ))}
                      
                      {selectedRegions.map((region) => (
                        <Badge key={region} variant="secondary" className="gap-1">
                          Region: {region}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFilter('region', region)}
                          />
                        </Badge>
                      ))}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-7 text-xs"
                        aria-label="Clear all filters"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Table */}
          <CustomerTable 
            customers={customers} 
            isLoading={isLoading}
            columnVisibility={columnVisibility}
          />
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
