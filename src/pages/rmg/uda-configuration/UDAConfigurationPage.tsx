import { useEffect, useState, useMemo } from "react";
import { useUDAConfigurationStore } from "@/store/udaConfigurationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Settings2, Upload, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UDAConfigurationTable } from "./components/UDAConfigurationTable";
import { CreateUDAConfigurationDialog } from "./components/CreateUDAConfigurationDialog";
import { BulkUploadDialog } from "./components/BulkUploadDialog";
import type { UDAConfigurationFilters } from "@/types/udaConfiguration";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UDAConfigurationPage() {
  const { configurations, isLoading, fetchConfigurations } =
    useUDAConfigurationStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [filters, setFilters] = useState<UDAConfigurationFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique types dynamically from configurations
  const uniqueTypes = useMemo(() => {
    const types = configurations.map((c) => c.type);
    return Array.from(new Set(types)).sort();
  }, [configurations]);

  useEffect(() => {
    fetchConfigurations(filters);
  }, [fetchConfigurations, filters]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (
    key: keyof UDAConfigurationFilters,
    value: string,
  ) => {
    if (value === "all") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _removed, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header mb-6">
        <div className="page-header-content">
          <div className="flex items-start gap-3">
            <Settings2 className="h-7 w-7 text-primary mt-1" />
            <div>
              <h1 className="page-title">
                UDA Configuration
              </h1>
              <p className="page-description">
                Manage User Defined Attributes for Timesheet Management
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="h-4 w-4" />
                Add New
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add UDA
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBulkUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Card - Conditionally Rendered */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>
              Filter UDAs by active status, type, or search
            </CardDescription>
          </CardHeader>
        <CardContent className="pb-4 !pt-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by UDA number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.active || "all"}
              onValueChange={(value) => handleFilterChange("active", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Active Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Y">Active</SelectItem>
                <SelectItem value="N">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(filters.active || filters.type || filters.search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
        </Card>
      )}

      {/* UDA Configuration Table */}
      <Card className="border-brand-light-gray shadow-sm">
        <CardHeader>
          <CardTitle>All UDA Configurations</CardTitle>
          <CardDescription>
            {configurations.length} configuration
            {configurations.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 !pt-0">
          <UDAConfigurationTable
            configurations={configurations}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create UDA Configuration Dialog */}
      <CreateUDAConfigurationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        onSuccess={() => {
          // Clear filters and refresh to show all newly created UDAs
          setFilters({});
          setSearchQuery("");
          fetchConfigurations({});
        }}
      />
    </div>
  );
}
