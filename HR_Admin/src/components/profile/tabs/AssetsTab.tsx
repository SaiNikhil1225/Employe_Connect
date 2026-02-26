import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Search, 
  MoreVertical, 
  Laptop, 
  Monitor, 
  Smartphone,
  Headphones,
  Keyboard,
  Mouse,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface Asset {
  id: string;
  assetType: string;
  assetName: string;
  assetId: string;
  category: string;
  assignedOn: string;
  acknowledgementStatus: 'Pending' | 'Acknowledged' | 'Rejected';
  latestCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface AssetRequest {
  id: string;
  assetType: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

interface AssetDamageCharge {
  id: string;
  assetName: string;
  damageType: string;
  chargeAmount: number;
  status: 'Pending' | 'Paid' | 'Waived';
  reportedOn: string;
}

export default function AssetsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'requests' | 'damages'>('assigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - replace with actual data from props/API
  const assignedAssets: Asset[] = [
    {
      id: '1',
      assetType: 'Laptop',
      assetName: 'Dell Latitude 5420',
      assetId: 'LAP-2024-001',
      category: 'Laptops',
      assignedOn: '2024-01-15',
      acknowledgementStatus: 'Acknowledged',
      latestCondition: 'Good'
    },
    {
      id: '2',
      assetType: 'Monitor',
      assetName: 'Dell P2422H 24"',
      assetId: 'MON-2024-045',
      category: 'Monitors',
      assignedOn: '2024-01-15',
      acknowledgementStatus: 'Acknowledged',
      latestCondition: 'Excellent'
    },
    {
      id: '3',
      assetType: 'Keyboard',
      assetName: 'Logitech K380',
      assetId: 'KEY-2024-112',
      category: 'Peripherals',
      assignedOn: '2024-01-20',
      acknowledgementStatus: 'Pending',
      latestCondition: 'Good'
    }
  ];

  const assetRequests: AssetRequest[] = [
    {
      id: '1',
      assetType: 'Headphones',
      requestedOn: '2024-02-01',
      status: 'Pending',
      reason: 'For video calls and meetings'
    }
  ];

  const damageCharges: AssetDamageCharge[] = [
    {
      id: '1',
      assetName: 'Dell Latitude 5420',
      damageType: 'Screen crack',
      chargeAmount: 150.00,
      status: 'Pending',
      reportedOn: '2024-01-28'
    }
  ];

  const getAssetIcon = (assetType: string) => {
    const type = assetType.toLowerCase();
    if (type.includes('laptop')) return <Laptop className="h-4 w-4 text-blue-600" />;
    if (type.includes('monitor')) return <Monitor className="h-4 w-4 text-purple-600" />;
    if (type.includes('phone')) return <Smartphone className="h-4 w-4 text-green-600" />;
    if (type.includes('headphone')) return <Headphones className="h-4 w-4 text-orange-600" />;
    if (type.includes('keyboard')) return <Keyboard className="h-4 w-4 text-pink-600" />;
    if (type.includes('mouse')) return <Mouse className="h-4 w-4 text-teal-600" />;
    return <Package className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Acknowledged': 'bg-green-100 text-green-700 border-green-200',
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
      'Paid': 'bg-blue-100 text-blue-700 border-blue-200',
      'Waived': 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const getConditionBadge = (condition: string) => {
    const conditionStyles = {
      'Excellent': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Good': 'bg-blue-100 text-blue-700 border-blue-200',
      'Fair': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Poor': 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${conditionStyles[condition as keyof typeof conditionStyles]}`}>
        {condition}
      </span>
    );
  };

  const filteredAssets = assignedAssets.filter(asset => 
    asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSubTab('assigned')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'assigned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Assigned Assets
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Asset Requests
              {assetRequests.filter(r => r.status === 'Pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {assetRequests.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveSubTab('damages')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSubTab === 'damages'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Asset Damage Charges
              {damageCharges.filter(d => d.status === 'Pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {damageCharges.filter(d => d.status === 'Pending').length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Assigned Assets Tab */}
      {activeSubTab === 'assigned' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assigned Assets</h3>
            <p className="text-sm text-gray-500 mt-1">Assets that are currently assigned to you.</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export to PDF</DropdownMenuItem>
                <DropdownMenuItem>Export to Excel</DropdownMenuItem>
                <DropdownMenuItem>Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Assets Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acknowledgement Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No assets found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchQuery ? 'Try adjusting your search query' : 'No assets have been assigned to you yet'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{asset.assetType}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {getAssetIcon(asset.assetType)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{asset.assetName}</div>
                              <div className="text-xs text-gray-500">{asset.assetId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{asset.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(asset.assignedOn).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(asset.acknowledgementStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getConditionBadge(asset.latestCondition)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Acknowledge Receipt</DropdownMenuItem>
                              <DropdownMenuItem>Report Issue</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Request Return</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAssets.length > 0 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredAssets.length)}</span> of{' '}
                      <span className="font-medium">{filteredAssets.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asset Requests Tab */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Asset Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Request new assets or replacement for existing ones.</p>
          </div>

          {/* Request Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Request New Asset */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    Request New Asset
                  </h4>
                  <p className="text-sm text-gray-600">
                    Submit a request for new equipment like laptop, monitor, or peripherals.
                  </p>
                </div>
              </div>
              <Button className="w-full gap-2" size="sm">
                <FileText className="h-4 w-4" />
                Submit Request
              </Button>
            </div>

            {/* Request Asset Replacement */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-sm transition-all bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    Request Asset Replacement
                  </h4>
                  <p className="text-sm text-gray-600">
                    Replace damaged, malfunctioning, or outdated assigned assets.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" size="sm">
                <FileText className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </div>

          {/* Recent Requests */}
          {assetRequests.length > 0 && (
            <div className="mt-8">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Recent Requests</h4>
              <div className="space-y-2">
                {assetRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAssetIcon(request.assetType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-semibold text-gray-900">{request.assetType}</h5>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{request.reason}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.requestedOn).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {request.status === 'Pending' && (
                            <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Damage Charges Tab */}
      {activeSubTab === 'damages' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Asset Damage Charges</h3>
            <p className="text-sm text-gray-500 mt-1">Charges for damaged or lost assets.</p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Damage Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charge Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {damageCharges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No damage charges</p>
                      <p className="text-gray-400 text-sm mt-1">You don't have any asset damage charges</p>
                    </td>
                  </tr>
                ) : (
                  damageCharges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{charge.assetName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{charge.damageType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(charge.reportedOn).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${charge.chargeAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(charge.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {charge.status === 'Pending' && (
                              <>
                                <DropdownMenuItem>Make Payment</DropdownMenuItem>
                                <DropdownMenuItem>Dispute Charge</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
