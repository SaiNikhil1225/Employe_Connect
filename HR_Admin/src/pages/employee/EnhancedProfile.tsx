import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  FileText,
  Briefcase,
  Award,
  Laptop,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';
import PersonalInfoTab from '@/components/employee/PersonalInfoTab';
import MedicalInfoTab from '@/components/employee/MedicalInfoTab';
import EmergencyContactsTab from '@/components/employee/EmergencyContactsTab';
import FamilyMembersTab from '@/components/employee/FamilyMembersTab';
import EducationTab from '@/components/employee/EducationTab';
import WorkHistoryTab from '@/components/employee/WorkHistoryTab';
import CertificationsTab from '@/components/employee/CertificationsTab';
import AssetsTab from '@/components/employee/AssetsTab';
import DocumentsTab from '@/components/employee/DocumentsTab';

export default function EnhancedEmployeeProfile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user?.employeeId) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await employeeManagementService.getEmployeeProfile(user!.employeeId);
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load profile data');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadProfileData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-center">Profile data not available</p>
        </Card>
      </div>
    );
  }

  const employee = profileData.employee;
  const documents = profileData.documents || [];
  const onboarding = profileData.onboarding;
  const offboarding = profileData.offboarding;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information, documents, and employment details
        </p>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {onboarding && onboarding.status !== 'completed' && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Onboarding: {onboarding.status} ({onboarding.progressPercentage || 0}%)
          </Badge>
        )}
        {offboarding && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Offboarding: {offboarding.status}
          </Badge>
        )}
        {employee.status === 'active' && (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active Employee
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Medical
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="work-history" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Work History
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <PersonalInfoTab
            employeeId={employee.employeeId}
            employeeData={employee}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <MedicalInfoTab
            employeeId={employee.employeeId}
            medicalInfo={employee.medicalInfo}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <EmergencyContactsTab
            employeeId={employee.employeeId}
            contacts={employee.emergencyContacts || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <FamilyMembersTab
            employeeId={employee.employeeId}
            familyMembers={employee.familyMembers || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsTab
            employeeId={employee.employeeId}
            documents={documents}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <EducationTab
            employeeId={employee.employeeId}
            educationHistory={employee.educationHistory || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="work-history" className="space-y-4">
          <WorkHistoryTab
            employeeId={employee.employeeId}
            workHistory={employee.workHistory || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <CertificationsTab
            employeeId={employee.employeeId}
            certifications={employee.certifications || []}
            onUpdate={refreshData}
          />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <AssetsTab
            employeeId={employee.employeeId}
            assets={employee.assetsAssigned || []}
            onUpdate={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
