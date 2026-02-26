import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  GraduationCap,
  Package,
  Users,
  Upload,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
} from 'lucide-react';
import type { OnboardingStatus } from '@/types/onboarding';
import { onboardingServiceAPI } from '@/services/onboardingServiceAPI';
import { toast } from 'sonner';
import { getInitials } from '@/constants/design-system';

const OnboardingDashboard: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOnboardingData();
  }, [employeeId]);

  const loadOnboardingData = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    const response = await onboardingServiceAPI.getOnboardingStatus(employeeId);
    
    if (response.success && response.data) {
      // Calculate actual progress
      const { progress } = onboardingServiceAPI.calculateProgress(response.data);
      const updatedData = {
        ...response.data,
        progressPercentage: progress,
      };
      setOnboarding(updatedData);
    } else {
      toast.error(response.message || 'Failed to load onboarding data');
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: 'not-started' | 'in-progress' | 'completed' | 'on-hold') => {
    if (!employeeId || !onboarding) return;
    
    setUpdatingStatus(true);
    const response = await onboardingServiceAPI.updateOnboardingStatus(employeeId, newStatus);
    
    if (response.success) {
      toast.success(`Onboarding status updated to ${newStatus.replace('-', ' ')}`);
      setOnboarding({ ...onboarding, status: newStatus });
    } else {
      toast.error(response.message || 'Failed to update status');
    }
    setUpdatingStatus(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'probation':
        return 'bg-purple-100 text-purple-800';
      case 'month-1':
        return 'bg-blue-100 text-blue-800';
      case 'week-1':
        return 'bg-cyan-100 text-cyan-800';
      case 'day-1':
        return 'bg-indigo-100 text-indigo-800';
      case 'pre-joining':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 mb-4">No onboarding data found</p>
        <Button onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Onboarding Dashboard</h1>
            <p className="text-gray-500">Track and manage employee onboarding progress</p>
          </div>
        </div>
        <Badge className={getPhaseColor(onboarding.currentPhase)}>
          {onboarding.currentPhase.replace('-', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(onboarding.employeeName)}
              </div>
              <div>
                <CardTitle className="text-2xl">{onboarding.employeeName}</CardTitle>
                <CardDescription className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{onboarding.designation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{onboarding.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joining Date: {new Date(onboarding.joiningDate).toLocaleDateString()}</span>
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">Overall Progress</div>
              <div className="text-3xl font-bold text-blue-600">{onboarding.progressPercentage}%</div>
              <Progress value={onboarding.progressPercentage} className="w-40 mt-2" />
              
              {/* Status Update Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <Button
                  size="sm"
                  variant={onboarding.status === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={updatingStatus || onboarding.status === 'in-progress'}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant={onboarding.status === 'on-hold' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('on-hold')}
                  disabled={updatingStatus || onboarding.status === 'on-hold'}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  On Hold
                </Button>
                <Button
                  size="sm"
                  variant={onboarding.status === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('completed')}
                  disabled={updatingStatus || onboarding.status === 'completed' || onboarding.progressPercentage < 100}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
                  title={onboarding.progressPercentage < 100 ? 'Complete all mandatory tasks first' : ''}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              </div>
              {onboarding.progressPercentage < 100 && (
                <p className="text-xs text-gray-500 mt-2">
                  Complete {100 - onboarding.progressPercentage}% more to mark as completed
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Cards */}
      {(onboarding.hrContact || onboarding.managerContact || onboarding.buddy || onboarding.mentor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {onboarding.hrContact && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  HR Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{onboarding.hrContact.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{onboarding.hrContact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{onboarding.hrContact.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {onboarding.managerContact && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{onboarding.managerContact.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{onboarding.managerContact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{onboarding.managerContact.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {onboarding.buddy && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Buddy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{onboarding.buddy.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-3 w-3" />
                  <span>{onboarding.buddy.designation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{onboarding.buddy.email}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {onboarding.mentor && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{onboarding.mentor.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-3 w-3" />
                  <span>{onboarding.mentor.designation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{onboarding.mentor.email}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="welcome-kit" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Welcome Kit
          </TabsTrigger>
          <TabsTrigger value="trainings" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Trainings
          </TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Checklist</CardTitle>
              <CardDescription>Track tasks and milestones throughout the onboarding process</CardDescription>
            </CardHeader>
            <CardContent>
              {onboarding.checklist.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No checklist items yet</p>
              ) : (
                <div className="space-y-4">
                  {['pre-joining', 'day-1', 'week-1', 'month-1', 'probation'].map((phase) => {
                    const phaseItems = onboarding.checklist.filter(item => item.category === phase);
                    if (phaseItems.length === 0) return null;

                    return (
                      <div key={phase} className="space-y-2">
                        <h3 className="font-semibold text-lg capitalize">{phase.replace('-', ' ')}</h3>
                        {phaseItems.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : item.status === 'in-progress' ? (
                              <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{item.task}</p>
                                  <p className="text-sm text-gray-500">{item.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {item.assignedTo}
                                    </Badge>
                                    {item.mandatory && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload and verify required documents</CardDescription>
            </CardHeader>
            <CardContent>
              {onboarding.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No documents required yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {onboarding.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.documentName}</p>
                          <p className="text-sm text-gray-500">{doc.documentType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        {doc.status === 'pending' && (
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Welcome Kit Tab */}
        <TabsContent value="welcome-kit">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Kit & Assets</CardTitle>
              <CardDescription>IT assets and welcome kit items assigned</CardDescription>
            </CardHeader>
            <CardContent>
              {onboarding.welcomeKit.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onboarding.welcomeKit.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-500 capitalize">{item.itemType}</p>
                          {item.serialNumber && (
                            <p className="text-xs text-gray-400 mt-1">SN: {item.serialNumber}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      {item.assignedDate && (
                        <p className="text-xs text-gray-500">
                          Assigned: {new Date(item.assignedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trainings Tab */}
        <TabsContent value="trainings">
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
              <CardDescription>Upcoming and completed training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {onboarding.trainings.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No trainings scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {onboarding.trainings.map((training) => (
                    <div key={training.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{training.trainingName}</p>
                            {training.mandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Mandatory
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 capitalize mt-1">
                            {training.trainingType} • {training.duration}
                          </p>
                          {training.scheduledDate && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(training.scheduledDate).toLocaleString()}</span>
                            </div>
                          )}
                          {training.trainer && (
                            <p className="text-sm text-gray-600 mt-1">
                              Trainer: {training.trainer}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(training.status)}>
                          {training.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnboardingDashboard;
