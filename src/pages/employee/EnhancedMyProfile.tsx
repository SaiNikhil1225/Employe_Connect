import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { employeeManagementService } from '@/services/employeeManagementService';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';

// Import new enhanced components
import ProfileHeader from '@/components/profile/ProfileHeader';
import QuickInfoBar from '@/components/profile/QuickInfoBar';
import TabNavigation, { defaultTabs } from '@/components/profile/TabNavigation';
import ContextualActionMenu, { defaultActions } from '@/components/profile/ContextualActionMenu';
import type { ActionItem } from '@/components/profile/ContextualActionMenu';
import InitiateExitDrawer from '@/components/profile/InitiateExitDrawer';
import DisableLoginModal from '@/components/profile/DisableLoginModal';
import EnableLoginModal from '@/components/profile/EnableLoginModal';
import AddToPIPDrawer from '@/components/profile/AddToPIPDrawer';
import axios from 'axios';

// Import tab content components
import AboutTab from '@/components/profile/tabs/AboutTab';
import ProfileTab from '@/components/profile/tabs/ProfileTab';
import JobTab from '@/components/profile/tabs/JobTab';
import TimeTab from '@/components/profile/tabs/TimeTab';
import DocumentsTab from '@/components/profile/tabs/DocumentsTab';
import FinancesTab from '@/components/profile/tabs/FinancesTab';
import PerformanceTab from '@/components/profile/tabs/PerformanceTab';
import AssetsTab from '@/components/profile/tabs/AssetsTab';

interface EnhancedMyProfileProps {
  employeeId?: string;
}

export default function EnhancedMyProfile({ employeeId: propEmployeeId }: EnhancedMyProfileProps) {
  const { user } = useAuthStore();
  const { fetchEmployees } = useEmployeeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showInitiateExitDrawer, setShowInitiateExitDrawer] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showAddToPIPDrawer, setShowAddToPIPDrawer] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [hasActivePIP, setHasActivePIP] = useState(false);
  const [isRemovingFromPIP, setIsRemovingFromPIP] = useState(false);

  const targetEmployeeId = propEmployeeId || user?.employeeId;
  const isOwnProfile = !propEmployeeId || propEmployeeId === user?.employeeId;

  // Track navigation for breadcrumb
  useEffect(() => {
    // Store the referrer path from location state or current path
    const referrerPath = (location.state as any)?.from || sessionStorage.getItem('lastVisitedPath');
    if (referrerPath) {
      sessionStorage.setItem('profileReferrer', referrerPath);
    }
  }, [location.state]);

  useEffect(() => {
    if (targetEmployeeId) {
      loadProfileData();
      checkActivePIP();
    }
  }, [targetEmployeeId]);

  const checkActivePIP = async () => {
    if (!targetEmployeeId) {
      console.log('EnhancedMyProfile: No targetEmployeeId for PIP check');
      setHasActivePIP(false);
      return;
    }
    console.log('EnhancedMyProfile: Checking active PIP for:', targetEmployeeId);
    try {
      const response = await axios.get(`http://localhost:5000/api/pip/employee/${targetEmployeeId}`);
      console.log('EnhancedMyProfile: PIP check response:', response.data);
      
      // Ensure we have a valid response with data array
      if (response.data.success && Array.isArray(response.data.data)) {
        const activePIP = response.data.data.find((pip: any) => 
          pip && pip.status && ['Pending', 'Acknowledged', 'Active'].includes(pip.status)
        );
        console.log('EnhancedMyProfile: Active PIP found:', activePIP);
        setHasActivePIP(!!activePIP);
      } else {
        // No data or invalid response - no active PIP
        console.log('EnhancedMyProfile: No PIP data found');
        setHasActivePIP(false);
      }
    } catch (error: any) {
      // If 404 or any error, means no PIPs exist for this employee
      console.log('EnhancedMyProfile: PIP check error (expected for new employees):', error.message);
      setHasActivePIP(false);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await employeeManagementService.getEmployeeProfile(targetEmployeeId!);
      console.log('Profile API Response:', response);
      if (response.success) {
        console.log('Profile Data:', response.data);
        setProfileData(response.data);
      } else {
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error: any) {
      toast.error('Failed to load profile data');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (_file: File) => {
    try {
      // TODO: Implement photo upload logic
      toast.success('Photo uploaded successfully');
      loadProfileData();
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const refreshData = async () => {
    await loadProfileData();
    // Refresh employee store to update data across all views (workforce page, etc.)
    await fetchEmployees();
  };

  const handleDisableLogin = async () => {
    setIsDisabling(true);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/employees/${targetEmployeeId}/disable-login`
      );
      
      if (response.data.success) {
        toast.success(`Login disabled for ${profileData.employee.name}`);
        setShowDisableModal(false);
        await loadProfileData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to disable login');
      }
    } catch (error: any) {
      console.error('Failed to disable login:', error);
      const errorMessage = error.response?.data?.message || 'Failed to disable login';
      toast.error(errorMessage);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleEnableLogin = async () => {
    setIsEnabling(true);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/employees/${targetEmployeeId}/enable-login`
      );
      
      if (response.data.success) {
        toast.success(`Login enabled for ${profileData.employee.name}`);
        setShowEnableModal(false);
        await loadProfileData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to enable login');
      }
    } catch (error: any) {
      console.error('Failed to enable login:', error);
      const errorMessage = error.response?.data?.message || 'Failed to enable login';
      toast.error(errorMessage);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleRemoveFromPIP = async () => {
    if (!targetEmployeeId) {
      toast.error('Employee ID not found');
      return;
    }

    setIsRemovingFromPIP(true);
    try {
      // First, get the active PIP
      const pipsResponse = await axios.get(`http://localhost:5000/api/pip/employee/${targetEmployeeId}`);
      
      if (pipsResponse.data.success && Array.isArray(pipsResponse.data.data)) {
        const activePIP = pipsResponse.data.data.find((pip: any) => 
          pip && pip.status && ['Pending', 'Acknowledged', 'Active'].includes(pip.status)
        );

        if (!activePIP) {
          toast.error('No active PIP found for this employee');
          return;
        }

        // Cancel the PIP by updating its status
        const cancelResponse = await axios.patch(
          `http://localhost:5000/api/pip/${activePIP._id}/status`,
          { status: 'Cancelled' }
        );

        if (cancelResponse.data.success) {
          toast.success(`${profileData.employee.name} has been removed from PIP`);
          // Refresh PIP status
          await checkActivePIP();
          await loadProfileData();
        } else {
          toast.error('Failed to remove employee from PIP');
        }
      } else {
        toast.error('No PIP records found');
      }
    } catch (error: any) {
      console.error('Failed to remove from PIP:', error);
      toast.error(error.response?.data?.message || 'Failed to remove employee from PIP');
    } finally {
      setIsRemovingFromPIP(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData || !profileData.employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-center text-gray-600">Profile data not available</p>
          <p className="text-xs text-center text-gray-400 mt-2">
            {profileData ? 'Employee data missing' : 'Profile data is null'}
          </p>
          {profileData && (
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded max-w-md overflow-auto">
              {JSON.stringify(Object.keys(profileData), null, 2)}
            </pre>
          )}
        </Card>
      </div>
    );
  }

  const employee = profileData.employee;
  const documents = profileData.documents || [];

  // Check if current user is HR/Admin
  const isHRAdmin = user?.role === 'HR' || user?.role === 'IT_ADMIN' || user?.role === 'SUPER_ADMIN';
  const employeeAccountActive = employee?.isActive && employee?.hasLoginAccess;
  
  // Determine if current user can edit this profile
  // User can edit if: viewing own profile OR user is HR Admin
  const canEditProfile = isOwnProfile || isHRAdmin;

  // Define contextual actions
  const actions: ActionItem[] = [
    {
      id: 'id-card',
      label: 'Download ID Card',
      icon: defaultActions[0].icon,
      onClick: () => toast.info('ID Card download feature coming soon'),
    },
    {
      id: 'write-note',
      label: 'Write Note',
      icon: defaultActions[1].icon,
      onClick: () => toast.info('Note feature coming soon'),
    },
    {
      id: 'request-feedback',
      label: 'Request Feedback',
      icon: defaultActions[2].icon,
      onClick: () => toast.info('Feedback request feature coming soon'),
    },
  ];

  // Add HR admin actions if viewing another employee's profile
  if (isHRAdmin && !isOwnProfile) {
    actions.push(
      {
        id: 'reset-password',
        label: 'Reset Password',
        icon: defaultActions[3].icon,
        onClick: () => toast.info('Password reset feature coming soon'),
      },
      {
        id: 'initiate-exit',
        label: 'Initiate Exit',
        icon: defaultActions[4].icon,
        variant: 'warning' as const,
        onClick: () => setShowInitiateExitDrawer(true),
      },
      employeeAccountActive
        ? {
            id: 'disable-login',
            label: 'Disable Login',
            icon: defaultActions[5].icon,
            variant: 'destructive' as const,
            onClick: () => setShowDisableModal(true),
          }
        : {
            id: 'enable-login',
            label: 'Enable Login',
            icon: defaultActions[6].icon,
            onClick: () => setShowEnableModal(true),
          },
      hasActivePIP
        ? {
            id: 'remove-from-pip',
            label: 'Remove Employee from PIP',
            icon: defaultActions[7].icon,
            variant: 'default' as const,
            onClick: handleRemoveFromPIP,
          }
        : {
            id: 'add-to-pip',
            label: 'Add Employee to PIP',
            icon: defaultActions[7].icon,
            variant: 'warning' as const,
            onClick: () => setShowAddToPIPDrawer(true),
          }
    );
  }

  // Format data for components
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTenure = (joiningDate?: string) => {
    if (!joiningDate) return 'N/A';
    const start = new Date(joiningDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const employmentStatus = employee.status === 'active' ? 'active' : 'inactive';

  // Breadcrumb handler
  const handleGoBack = () => {
    // If there's a previous page in history, go back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Otherwise, go to employee management
      navigate('/hr/employee-management');
    }
  };

  // Determine breadcrumb context from the referring page or current path
  const getBreadcrumbContext = () => {
    // First check location state
    const state = location.state as { from?: string; breadcrumb?: string } | null;
    if (state?.breadcrumb) {
      return state.breadcrumb;
    }
    
    // Then check sessionStorage for the referrer path
    const referrerPath = sessionStorage.getItem('profileReferrer') || '';
    
    // Check specific paths
    if (referrerPath.includes('/hr/employee-management') || referrerPath.includes('/hr/workforce')) {
      return 'HR Management';
    } else if (referrerPath.includes('/employee/directory')) {
      return 'Employee Directory';
    } else if (referrerPath.includes('/hr/attendance')) {
      return 'HR Attendance';
    } else if (referrerPath.includes('/hr/leave')) {
      return 'Leave Management';
    } else if (referrerPath.includes('/employee/my-team')) {
      return 'My Team';
    } else if (referrerPath.includes('/search') || referrerPath.includes('global')) {
      return 'Search Results';
    } else if (isOwnProfile) {
      return 'Dashboard';
    }
    
    // Default
    return 'Employees';
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto">
        {/* Breadcrumbs */}
        <div className="px-8 py-2 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="h-7 px-2 gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">{getBreadcrumbContext()}</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-900 font-medium">{employee.name}</span>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white shadow-sm mb-6">
          <ProfileHeader
            avatar={employee.photo || employee.profilePhoto}
            name={employee.name}
            employeeId={employee.employeeId}
            firstName={employee.firstName}
            lastName={employee.lastName}
            designation={employee.designation}
            employmentStatus={employmentStatus}
            isOwnProfile={isOwnProfile}
            onPhotoUpload={handlePhotoUpload}
            quickActions={<ContextualActionMenu actions={actions} />}
            hasActivePIP={hasActivePIP}
          />

          {/* Quick Info Bar */}
          <div className="px-8 pt-6 pb-8">
            <QuickInfoBar
              email={employee.email}
              phone={employee.phone}
              location={employee.location || 'Not specified'}
              department={employee.department}
              businessUnit={employee.businessUnit}
              reportingManager={employee.reportingManager?.name || 'Not Assigned'}
              dottedLineManager={employee.dottedLineManager?.name || 'Not Assigned'}
              joiningDate={formatDate(employee.dateOfJoining)}
            />
          </div>
        </div>

        {/* Tabs and Content Card */}
        <div className="bg-white shadow-sm">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={defaultTabs}
          />

          {/* Content Area */}
          <div className="px-8 pb-8 pt-6">
            <div className="max-w-6xl">
              {/* Tab Content */}
              {activeTab === 'about' && (
                <AboutTab
                  // Basic Information
                  firstName={employee.firstName}
                  middleName={employee.middleName}
                  lastName={employee.lastName}
                  displayName={employee.displayName || employee.name}
                  email={employee.email}
                  dialCode={employee.dialCode}
                  mobileNumber={employee.mobileNumber || employee.phone}
                  gender={employee.gender}
                  dateOfBirth={formatDate(employee.dateOfBirth)}
                  
                  // Employment
                  summary={employee.summary}
                  joiningDate={formatDate(employee.dateOfJoining)}
                  department={employee.department}
                  businessUnit={employee.businessUnit || 'Not specified'}
                  
                  // Contact Information
                  workPhone={employee.workPhone}
                  residenceNumber={employee.residenceNumber}
                  personalEmail={employee.personalEmail}
                  
                  // Family & Personal Details
                  maritalStatus={employee.maritalStatus}
                  marriageDate={formatDate(employee.marriageDate)}
                  fatherName={employee.fatherName}
                  motherName={employee.motherName}
                  spouseName={employee.spouseName}
                  spouseGender={employee.spouseGender}
                  physicallyHandicapped={employee.physicallyHandicapped}
                  bloodGroup={employee.bloodGroup}
                  nationality={employee.nationality}
                  
                  // Address Details
                  currentAddress={employee.currentAddress}
                  city={employee.city}
                  state={employee.state}
                  country={employee.country}
                  postalCode={employee.postalCode}
                  
                  // Emergency Contact
                  emergencyContactName={employee.emergencyContactName}
                  emergencyContactRelationship={employee.emergencyContactRelationship}
                  emergencyContactPhone={employee.emergencyContactPhone}
                  emergencyContactEmail={employee.emergencyContactEmail}
                  
                  // Permission control
                  canEdit={canEditProfile}
                  
                  // Update handler
                  onUpdate={async (data) => {
                    await employeeManagementService.updatePersonalInfo(targetEmployeeId!, data);
                    await refreshData();
                  }}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  employeeId={employee.employeeId}
                  employeeData={employee}
                  documents={documents}
                  onUpdate={refreshData}
                />
              )}

              {activeTab === 'job' && (
                <JobTab
                  // Basic Job Info
                  employeeId={employee.employeeId}
                  designation={employee.designation}
                  secondaryJobTitle={employee.secondaryJobTitle}
                  department={employee.department}
                  subDepartment={employee.subDepartment}
                  businessUnit={employee.businessUnit}
                  legalEntity={employee.legalEntity}
                  
                  // Employment Type & Location
                  employmentType={employee.employmentType || employee.hireType || 'Full Time'}
                  workerType={employee.workerType}
                  hireType={employee.hireType}
                  location={employee.location || 'Not specified'}
                  
                  // Reporting
                  reportingManager={employee.reportingManager?.name}
                  reportingManagerId={employee.reportingManagerId}
                  dottedLineManager={employee.dottedLineManager?.name}
                  dottedLineManagerId={employee.dottedLineManagerId}
                  
                  // Dates
                  joiningDate={formatDate(employee.dateOfJoining)}
                  contractEndDate={formatDate(employee.contractEndDate)}
                  probationEndDate={formatDate(employee.probationEndDate)}
                  
                  // Permission control
                  canEdit={canEditProfile}
                  
                  // Update handler
                  onUpdate={async (data) => {
                    await employeeManagementService.updatePersonalInfo(targetEmployeeId!, data);
                    await refreshData();
                  }}
                />
              )}

              {activeTab === 'time' && (
                <TimeTab
                  totalTenure={calculateTenure(employee.dateOfJoining)}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsTab
                  documents={documents}
                />
              )}

              {activeTab === 'finances' && (
                <FinancesTab
                  // Salary
                  salary={employee.salary}
                  salaryPaymentMode={employee.salaryPaymentMode}
                  
                  // Bank Details
                  accountNumber={employee.bankAccountNumber || employee.accountNumber}
                  bankName={employee.bankName}
                  ifscCode={employee.ifscCode}
                  nameOnAccount={employee.nameOnAccount}
                  branch={employee.branch}
                  
                  // PF Details
                  pfDetailsAvailable={employee.pfDetailsAvailable}
                  pfNumber={employee.pfNumber}
                  pfJoiningDate={formatDate(employee.pfJoiningDate)}
                  nameOnPFAccount={employee.nameOnPFAccount}
                  uan={employee.uan}
                  pfEstablishmentId={employee.pfEstablishmentId}
                  
                  // ESI Details
                  esiEligible={employee.esiEligible}
                  esiDetailsAvailable={employee.esiDetailsAvailable}
                  esiNumber={employee.esiNumber}
                  employerESINumber={employee.employerESINumber}
                  ptEstablishmentId={employee.ptEstablishmentId}
                  lwfEligible={employee.lwfEligible}
                  
                  // Aadhaar Details
                  aadhaarNumber={employee.aadhaarNumber}
                  enrollmentNumber={employee.enrollmentNumber}
                  dobInAadhaar={formatDate(employee.dobInAadhaar)}
                  fullNameAsPerAadhaar={employee.fullNameAsPerAadhaar}
                  addressAsInAadhaar={employee.addressAsInAadhaar}
                  genderAsInAadhaar={employee.genderAsInAadhaar}
                  
                  // PAN Details
                  panCardAvailable={employee.panCardAvailable}
                  panNumber={employee.panNumber}
                  fullNameAsPerPAN={employee.fullNameAsPerPAN}
                  dobInPAN={formatDate(employee.dobInPAN)}
                  parentsNameAsPerPAN={employee.parentsNameAsPerPAN}

                  // Permission control
                  canEdit={canEditProfile}

                  // Update handler
                  onUpdate={async (data) => {
                    await employeeManagementService.updatePersonalInfo(targetEmployeeId!, data);
                    await refreshData();
                  }}
                />
              )}

              {activeTab === 'performance' && (
                <PerformanceTab
                  employeeId={employee.employeeId}
                  overallRating={employee.performanceRating}
                  lastReviewDate={formatDate(employee.lastReviewDate)}
                  nextReviewDate={formatDate(employee.nextReviewDate)}
                />
              )}

              {activeTab === 'assets' && (
                <AssetsTab />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Initiate Exit Drawer */}
      <InitiateExitDrawer
        open={showInitiateExitDrawer}
        onClose={() => setShowInitiateExitDrawer(false)}
        employeeName={employee.name || `${employee.firstName} ${employee.lastName}`}
        employeeId={employee.employeeId}
      />

      {/* Disable Login Modal */}
      <DisableLoginModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={handleDisableLogin}
        employeeName={employee.name || `${employee.firstName} ${employee.lastName}`}
        isDisabling={isDisabling}
      />

      {/* Enable Login Modal */}
      <EnableLoginModal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
        onConfirm={handleEnableLogin}
        employeeName={employee.name || `${employee.firstName} ${employee.lastName}`}
        isEnabling={isEnabling}
      />

      {/* Add to PIP Drawer */}
      <AddToPIPDrawer
        isOpen={showAddToPIPDrawer}
        onClose={() => setShowAddToPIPDrawer(false)}
        employeeId={employee.employeeId}
        employeeName={employee.name || `${employee.firstName} ${employee.lastName}`}
        employeeAvatar={employee.profilePhoto || employee.avatar}
        onSuccess={() => {
          checkActivePIP();
          loadProfileData();
        }}
      />
    </div>
  );
}
