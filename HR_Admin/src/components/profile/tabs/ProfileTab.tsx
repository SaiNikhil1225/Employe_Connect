import { useState } from 'react';
import MedicalInfoTab from '@/components/employee/MedicalInfoTab';
import EmergencyContactsTab from '@/components/employee/EmergencyContactsTab';
import FamilyMembersTab from '@/components/employee/FamilyMembersTab';
import EducationTab from '@/components/employee/EducationTab';
import ContactDetailsTab from '@/components/employee/ContactDetailsTab';
import PrimaryDetailsTab from '@/components/employee/PrimaryDetailsTab';
import ExperienceTab from '@/components/employee/ExperienceTab';
import PreviousExperienceCard from '@/components/employee/PreviousExperienceCard';
import VaccinationTab from '@/components/employee/VaccinationTab';
import IdentityInfoTab from '@/components/employee/IdentityInfoTab';
import EmployeeDetailsTab from '@/components/employee/EmployeeDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, Briefcase, Heart } from 'lucide-react';

interface ProfileTabProps {
  employeeId: string;
  employeeData: any;
  documents?: any[];
  onUpdate: () => void;
}

export default function ProfileTab({ employeeId, employeeData, documents = [], onUpdate }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
        <TabsTrigger value="basic" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Basic Info</span>
        </TabsTrigger>
        <TabsTrigger value="family" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Family</span>
        </TabsTrigger>
        <TabsTrigger value="professional" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Professional</span>
        </TabsTrigger>
        <TabsTrigger value="health" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Health</span>
        </TabsTrigger>
      </TabsList>

      {/* Basic Information */}
      <TabsContent value="basic" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <PrimaryDetailsTab
            employeeId={employeeId}
            primaryDetails={{
              firstName: employeeData.firstName,
              middleName: employeeData.middleName,
              lastName: employeeData.lastName,
              dateOfBirth: employeeData.dateOfBirth,
              gender: employeeData.gender,
              maritalStatus: employeeData.maritalStatus,
              nationality: employeeData.nationality,
              bloodGroup: employeeData.bloodGroup,
            }}
            onUpdate={onUpdate}
          />
          <ContactDetailsTab
            employeeId={employeeId}
            contactDetails={{
              mobileNumber: employeeData.phone || employeeData.mobileNumber,
              alternateNumber: employeeData.alternateNumber,
              personalEmail: employeeData.personalEmail,
              workEmail: employeeData.email,
              residenceNumber: employeeData.residenceNumber,
            }}
            onUpdate={onUpdate}
          />
        </div>
        <IdentityInfoTab documents={documents} />
      </TabsContent>

      {/* Family & Emergency Contacts */}
      <TabsContent value="family" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FamilyMembersTab
            employeeId={employeeId}
            familyMembers={employeeData.familyMembers || []}
            onUpdate={onUpdate}
          />
          <EmergencyContactsTab
            employeeId={employeeId}
            contacts={employeeData.emergencyContacts || []}
            onUpdate={onUpdate}
          />
        </div>
      </TabsContent>

      {/* Professional Background */}
      <TabsContent value="professional" className="space-y-6 mt-6">
        <PreviousExperienceCard
          employeeId={employeeId}
          dateOfJoining={employeeData.dateOfJoining}
          previousExperience={employeeData.previousExperience}
          onUpdate={onUpdate}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <EducationTab
            employeeId={employeeId}
            educationHistory={employeeData.educationHistory || []}
            onUpdate={onUpdate}
          />
          <ExperienceTab
            employeeId={employeeId}
            experience={{
              totalExperience: employeeData.totalExperience,
              experienceInMonths: employeeData.experienceInMonths,
              previousCompany: employeeData.previousCompany,
              previousDesignation: employeeData.previousDesignation,
              yearsOfExperience: employeeData.yearsOfExperience,
            }}
            onUpdate={onUpdate}
          />
        </div>
        <EmployeeDetailsTab
          employeeId={employeeId}
          employeeDetails={{
            flexibleToTravel: employeeData.flexibleToTravel,
            futureAspiredRole: employeeData.futureAspiredRole,
            interestedInOnsite: employeeData.interestedInOnsite,
          }}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Health Information */}
      <TabsContent value="health" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <MedicalInfoTab
            employeeId={employeeId}
            medicalInfo={employeeData.medicalInfo}
            onUpdate={onUpdate}
          />
          <VaccinationTab
            employeeId={employeeId}
            vaccination={employeeData.vaccination || {}}
            onUpdate={onUpdate}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
