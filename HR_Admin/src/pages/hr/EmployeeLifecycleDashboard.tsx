import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Users,
  UserPlus,
  UserMinus,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { onboardingService, offboardingService, documentService } from '@/services/employeeManagementService';
import { toast } from 'sonner';

export default function EmployeeLifecycleDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [onboardingList, setOnboardingList] = useState<any[]>([]);
  const [offboardingList, setOffboardingList] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await onboardingService.getStatistics();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Load active onboarding processes
      const onboardingResponse = await onboardingService.getAllChecklists();
      if (onboardingResponse.success) {
        setOnboardingList(onboardingResponse.data);
      }

      // Load active offboarding processes
      const offboardingResponse = await offboardingService.getAllChecklists();
      if (offboardingResponse.success) {
        setOffboardingList(offboardingResponse.data);
      }

      // Load pending documents
      const pendingResponse = await documentService.getPendingVerification();
      if (pendingResponse.success) {
        setPendingDocs(pendingResponse.data);
      }

      // Load expiring documents
      const expiringResponse = await documentService.getExpiringDocuments();
      if (expiringResponse.success) {
        setExpiringDocs(expiringResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId: string, approved: boolean) => {
    try {
      const response = approved
        ? await documentService.verifyDocument(documentId)
        : await documentService.rejectDocument(documentId, 'Document verification failed');
      
      if (response.success) {
        toast.success(approved ? 'Document verified' : 'Document rejected');
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Failed to process document');
      console.error(error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    if (progress >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employee Lifecycle Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor employee lifecycle and document verification
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Active Onboarding"
          value={stats?.onboarding?.active || 0}
          icon={UserPlus}
          color="bg-blue-500"
          trend={`${stats?.onboarding?.thisMonth || 0} this month`}
        />
        <StatCard
          title="Active Offboarding"
          value={stats?.offboarding?.active || 0}
          icon={UserMinus}
          color="bg-orange-500"
          trend={`${stats?.offboarding?.thisMonth || 0} this month`}
        />
        <StatCard
          title="Pending Verifications"
          value={pendingDocs.length}
          icon={FileCheck}
          color="bg-purple-500"
        />
        <StatCard
          title="Expiring Documents"
          value={expiringDocs.length}
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="onboarding">
            <UserPlus className="h-4 w-4 mr-2" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="offboarding">
            <UserMinus className="h-4 w-4 mr-2" />
            Offboarding
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileCheck className="h-4 w-4 mr-2" />
            Document Verification
          </TabsTrigger>
          <TabsTrigger value="expiring">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Expiring Documents
          </TabsTrigger>
        </TabsList>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Active Onboarding Processes</CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead>Buddy</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingList.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.employeeId?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.employeeId?.employeeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.employeeId?.department || '-'}</TableCell>
                        <TableCell>
                          {item.joiningDate
                            ? new Date(item.joiningDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{item.buddyAssigned || 'Not assigned'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getProgressColor(item.overallProgress)}`}>
                              {item.overallProgress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/hr/onboarding/${item._id}`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active onboarding processes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offboarding Tab */}
        <TabsContent value="offboarding">
          <Card>
            <CardHeader>
              <CardTitle>Active Offboarding Processes</CardTitle>
            </CardHeader>
            <CardContent>
              {offboardingList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Working Day</TableHead>
                      <TableHead>Exit Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offboardingList.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.employeeId?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.employeeId?.employeeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.employeeId?.department || '-'}</TableCell>
                        <TableCell>
                          {item.lastWorkingDay
                            ? new Date(item.lastWorkingDay).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.exitType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getProgressColor(item.overallProgress)}`}>
                              {item.overallProgress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/hr/offboarding/${item._id}`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserMinus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active offboarding processes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Verification Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Pending Document Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDocs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Uploaded On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDocs.map((doc: any) => (
                      <TableRow key={doc._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doc.employeeId?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.employeeId?.employeeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.documentType}</TableCell>
                        <TableCell>{doc.documentNumber || '-'}</TableCell>
                        <TableCell>
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyDocument(doc._id, true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerifyDocument(doc._id, false)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending document verifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Documents Tab */}
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Documents (Next 90 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringDocs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringDocs.map((doc: any) => {
                      const daysRemaining = Math.floor(
                        (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={doc._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{doc.employeeId?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {doc.employeeId?.employeeId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{doc.documentType}</TableCell>
                          <TableCell>{doc.documentNumber || '-'}</TableCell>
                          <TableCell>
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={daysRemaining < 30 ? 'destructive' : 'secondary'}>
                              {daysRemaining} days
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No documents expiring soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
