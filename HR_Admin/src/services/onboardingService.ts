import type { OnboardingStatus, OnboardingTemplate, OnboardingChecklist, OnboardingDocument, WelcomeKit, TrainingSchedule, BuddyMentor } from '@/types/onboarding';

// Note: This is a mock implementation. Replace with actual API calls when backend is ready.
// Temporary localStorage-based storage for demo purposes
const STORAGE_KEY = 'onboarding_data';

// Helper functions for mock storage
const getMockStorage = (): Record<string, Partial<OnboardingStatus>> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const setMockStorage = (data: Record<string, Partial<OnboardingStatus>>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const updateMockEmployee = (employeeId: string, updates: Partial<OnboardingStatus>) => {
  const storage = getMockStorage();
  storage[employeeId] = { ...storage[employeeId], ...updates };
  setMockStorage(storage);
};

const getMockEmployee = (employeeId: string): Partial<OnboardingStatus> | undefined => {
  const storage = getMockStorage();
  return storage[employeeId];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class OnboardingService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private baseUrl = '/api/onboarding';

  // Get onboarding status for an employee
  async getOnboardingStatus(employeeId: string): Promise<{ success: boolean; data?: OnboardingStatus; message?: string }> {
    try {
      // Check if we have stored data for this employee
      const storedData = getMockEmployee(employeeId);
      
      // Mock implementation - replace with actual API call
      const mockData: OnboardingStatus = {
        employeeId,
        employeeName: storedData?.employeeName || 'John Doe',
        designation: storedData?.designation || 'Software Engineer',
        department: storedData?.department || 'Engineering',
        joiningDate: storedData?.joiningDate || new Date().toISOString(),
        status: storedData?.status || 'in-progress',
        progressPercentage: storedData?.progressPercentage || 45,
        currentPhase: storedData?.currentPhase || 'week-1',
        checklist: storedData?.checklist || [],
        documents: storedData?.documents || [],
        welcomeKit: storedData?.welcomeKit || [],
        trainings: storedData?.trainings || [],
        lastUpdated: storedData?.lastUpdated || new Date().toISOString(),
        hrContact: storedData?.hrContact,
        managerContact: storedData?.managerContact,
        buddy: storedData?.buddy,
        mentor: storedData?.mentor,
      };

      return { success: true, data: mockData };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch onboarding status' };
    }
  }

  // Get all onboarding employees (HR view)
  async getAllOnboardingEmployees(): Promise<{ success: boolean; data?: OnboardingStatus[]; message?: string }> {
    try {
      // Get all stored employees
      const storage = getMockStorage();
      const employees = Object.values(storage).filter(emp => emp.employeeId) as OnboardingStatus[];
      
      return { success: true, data: employees };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch onboarding employees' };
    }
  }

  // Update checklist item
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateChecklistItem(employeeId: string, checklistId: string, updates: Partial<OnboardingChecklist>): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Checklist item updated successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update checklist item' };
    }
  }

  // Upload document
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadDocument(employeeId: string, documentType: string, file: File): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Document uploaded successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to upload document' };
    }
  }

  // Verify document
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verifyDocument(employeeId: string, documentId: string, status: 'verified' | 'rejected', notes?: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Document status updated successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to verify document' };
    }
  }

  // Assign welcome kit item
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignWelcomeKitItem(employeeId: string, item: Partial<WelcomeKit>): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Welcome kit item assigned successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to assign welcome kit item' };
    }
  }

  // Schedule training
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async scheduleTraining(employeeId: string, training: Partial<TrainingSchedule>): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Training scheduled successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to schedule training' };
    }
  }

  // Assign buddy/mentor
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignBuddyMentor(employeeId: string, assignment: BuddyMentor): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Buddy/Mentor assigned successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to assign buddy/mentor' };
    }
  }

  // Get onboarding templates
  async getTemplates(): Promise<{ success: boolean; data?: OnboardingTemplate[]; message?: string }> {
    try {
      // Mock implementation
      return { success: true, data: [] };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch templates' };
    }
  }

  // Create onboarding from template
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createFromTemplate(employeeId: string, templateId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation
      return { success: true, message: 'Onboarding created from template successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create onboarding from template' };
    }
  }

  // Update onboarding status
  async updateOnboardingStatus(employeeId: string, status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'): Promise<{ success: boolean; message?: string }> {
    try {
      // Update localStorage for demo purposes
      updateMockEmployee(employeeId, {
        status,
        lastUpdated: new Date().toISOString()
      });
      
      // Mock implementation - replace with actual API call
      // await fetch(`${this.baseUrl}/${employeeId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      return { success: true, message: 'Onboarding status updated successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update onboarding status' };
    }
  }

  // Calculate onboarding progress
  calculateProgress(onboarding: OnboardingStatus): { progress: number; suggestedStatus: OnboardingStatus['status'] } {
    const totalTasks = onboarding.checklist.filter(item => item.mandatory).length;
    const completedTasks = onboarding.checklist.filter(item => 
      item.mandatory && item.status === 'completed'
    ).length;

    const totalDocs = onboarding.documents.filter(doc => doc.required).length;
    const verifiedDocs = onboarding.documents.filter(doc => 
      doc.required && doc.status === 'verified'
    ).length;

    const totalKitItems = onboarding.welcomeKit.length;
    const deliveredItems = onboarding.welcomeKit.filter(item => 
      item.status === 'delivered'
    ).length;

    const totalTrainings = onboarding.trainings.filter(t => t.mandatory).length;
    const completedTrainings = onboarding.trainings.filter(t => 
      t.mandatory && t.status === 'completed'
    ).length;

    const checklistProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
    const docsProgress = totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 100;
    const kitProgress = totalKitItems > 0 ? (deliveredItems / totalKitItems) * 100 : 100;
    const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 100;

    const overallProgress = (checklistProgress + docsProgress + kitProgress + trainingProgress) / 4;

    // Suggest status based on progress
    let suggestedStatus: OnboardingStatus['status'] = 'in-progress';
    
    if (overallProgress === 0) {
      suggestedStatus = 'not-started';
    } else if (overallProgress === 100) {
      suggestedStatus = 'completed';
    } else if (overallProgress > 0 && overallProgress < 100) {
      suggestedStatus = 'in-progress';
    }

    return {
      progress: Math.round(overallProgress),
      suggestedStatus
    };
  }

  // Initialize onboarding for new employee
  async initializeOnboarding(
    employeeId: string, 
    joiningDate: string, 
    employeeData?: { 
      employeeName?: string;
      designation?: string;
      department?: string;
    }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Store initial onboarding data in localStorage for demo
      updateMockEmployee(employeeId, {
        employeeId,
        employeeName: employeeData?.employeeName || 'New Employee',
        designation: employeeData?.designation || 'Not Set',
        department: employeeData?.department || 'Not Set',
        joiningDate,
        status: 'not-started',
        currentPhase: 'pre-joining',
        progressPercentage: 0,
        lastUpdated: new Date().toISOString(),
        checklist: [],
        documents: [],
        welcomeKit: [],
        trainings: []
      });
      
      // Mock implementation - replace with actual API call
      // await fetch(`${this.baseUrl}/initialize`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     employeeId, 
      //     joiningDate,
      //     employeeData,
      //     status: 'not-started',
      //     currentPhase: 'pre-joining'
      //   })
      // });
      return { success: true, message: 'Onboarding initialized successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to initialize onboarding' };
    }
  }
}

export const onboardingService = new OnboardingService();
