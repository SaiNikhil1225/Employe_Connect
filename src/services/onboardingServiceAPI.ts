import type { OnboardingStatus, OnboardingChecklist, OnboardingDocument, WelcomeKit, TrainingSchedule, BuddyMentor } from '@/types/onboarding';

class OnboardingServiceAPI {
  private baseUrl = '/api/onboarding-new';

  // Helper to get auth token
  private getAuthToken(): string {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    return token || '';
  }

  // Helper for API requests
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('API Request:', url, options.method || 'GET');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          ...options.headers,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', response.status, text.substring(0, 200));
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Expected JSON but got ${contentType || 'unknown'}`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      return result;
    } catch (error: any) {
      console.error('API request failed:', error);
      return { success: false, message: error.message || 'Network error' };
    }
  }

  // ==================== ONBOARDING STATUS ====================

  // Get onboarding status for an employee
  async getOnboardingStatus(employeeId: string): Promise<{ success: boolean; data?: OnboardingStatus; message?: string }> {
    return this.request<OnboardingStatus>(`/status/${employeeId}`);
  }

  // Get all onboarding employees (HR view)
  async getAllOnboardingEmployees(): Promise<{ success: boolean; data?: OnboardingStatus[]; message?: string }> {
    return this.request<OnboardingStatus[]>('/status');
  }

  // Initialize onboarding for new employee
  async initializeOnboarding(
    employeeId: string, 
    joiningDate: string, 
    employeeData?: { 
      employeeName?: string;
      designation?: string;
      department?: string;
      hrContact?: {
        name: string;
        email: string;
        phone: string;
      };
      managerContact?: {
        name: string;
        email: string;
        phone: string;
      };
    }
  ): Promise<{ success: boolean; message?: string }> {
    return this.request('/initialize', {
      method: 'POST',
      body: JSON.stringify({ 
        employeeId, 
        employeeName: employeeData?.employeeName || 'New Employee',
        designation: employeeData?.designation || 'Not Set',
        department: employeeData?.department || 'Not Set',
        joiningDate,
        hrContact: employeeData?.hrContact,
        managerContact: employeeData?.managerContact
      }),
    });
  }

  // Update onboarding status
  async updateOnboardingStatus(
    employeeId: string, 
    status: 'not-started' | 'in-progress' | 'completed' | 'on-hold',
    updates?: {
      currentPhase?: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation' | 'completed';
      buddy?: BuddyMentor;
      mentor?: BuddyMentor;
    }
  ): Promise<{ success: boolean; message?: string }> {
    return this.request(`/status/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...updates }),
    });
  }

  // ==================== CHECKLIST ====================

  // Get checklist items for an employee
  async getChecklistItems(employeeId: string): Promise<{ success: boolean; data?: OnboardingChecklist[]; message?: string }> {
    return this.request<OnboardingChecklist[]>(`/checklist/${employeeId}`);
  }

  // Add checklist item
  async addChecklistItem(employeeId: string, item: Partial<OnboardingChecklist>): Promise<{ success: boolean; message?: string }> {
    return this.request('/checklist', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...item }),
    });
  }

  // Update checklist item
  async updateChecklistItem(itemId: string, updates: Partial<OnboardingChecklist>): Promise<{ success: boolean; message?: string }> {
    return this.request(`/checklist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete checklist item
  async deleteChecklistItem(itemId: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/checklist/${itemId}`, {
      method: 'DELETE',
    });
  }

  // ==================== DOCUMENTS ====================

  // Get documents for an employee
  async getDocuments(employeeId: string): Promise<{ success: boolean; data?: OnboardingDocument[]; message?: string }> {
    return this.request<OnboardingDocument[]>(`/documents/${employeeId}`);
  }

  // Add document
  async addDocument(employeeId: string, document: Partial<OnboardingDocument>): Promise<{ success: boolean; message?: string }> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...document }),
    });
  }

  // Update document (for upload, verify, reject)
  async updateDocument(documentId: string, updates: Partial<OnboardingDocument>): Promise<{ success: boolean; message?: string }> {
    return this.request(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Verify document
  async verifyDocument(documentId: string, status: 'verified' | 'rejected', verifiedBy?: string, rejectionReason?: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        status, 
        verifiedBy,
        rejectionReason,
        verifiedDate: status === 'verified' ? new Date().toISOString() : undefined
      }),
    });
  }

  // Upload document (mock - for now just updates status)
  async uploadDocument(employeeId: string, documentType: string, file: File): Promise<{ success: boolean; message?: string }> {
    // In a real implementation, this would upload the file to a storage service
    // For now, we'll just update the document status
    try {
      const documentsResponse = await this.getDocuments(employeeId);
      if (!documentsResponse.success || !documentsResponse.data) {
        return { success: false, message: 'Failed to fetch documents' };
      }

      const document = documentsResponse.data.find(doc => doc.documentType === documentType);
      if (!document || !document.id) {
        return { success: false, message: 'Document not found' };
      }

      return this.updateDocument(document.id, {
        status: 'uploaded',
        uploadedDate: new Date().toISOString(),
        fileUrl: `uploads/${employeeId}/${file.name}` // Mock file URL
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to upload document' };
    }
  }

  // ==================== WELCOME KIT ====================

  // Get welcome kit items for an employee
  async getWelcomeKitItems(employeeId: string): Promise<{ success: boolean; data?: WelcomeKit[]; message?: string }> {
    return this.request<WelcomeKit[]>(`/welcome-kit/${employeeId}`);
  }

  // Add welcome kit item
  async addWelcomeKitItem(employeeId: string, item: Partial<WelcomeKit>): Promise<{ success: boolean; message?: string }> {
    return this.request('/welcome-kit', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...item }),
    });
  }

  // Update welcome kit item
  async updateWelcomeKitItem(itemId: string, updates: Partial<WelcomeKit>): Promise<{ success: boolean; message?: string }> {
    return this.request(`/welcome-kit/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Assign welcome kit item
  async assignWelcomeKitItem(itemId: string, serialNumber?: string, notes?: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/welcome-kit/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'assigned',
        assignedDate: new Date().toISOString(),
        serialNumber,
        notes
      }),
    });
  }

  // ==================== TRAININGS ====================

  // Get training schedule for an employee
  async getTrainings(employeeId: string): Promise<{ success: boolean; data?: TrainingSchedule[]; message?: string }> {
    return this.request<TrainingSchedule[]>(`/trainings/${employeeId}`);
  }

  // Add training
  async addTraining(employeeId: string, training: Partial<TrainingSchedule>): Promise<{ success: boolean; message?: string }> {
    return this.request('/trainings', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...training }),
    });
  }

  // Update training
  async updateTraining(trainingId: string, updates: Partial<TrainingSchedule>): Promise<{ success: boolean; message?: string }> {
    return this.request(`/trainings/${trainingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Schedule training
  async scheduleTraining(employeeId: string, training: Partial<TrainingSchedule>): Promise<{ success: boolean; message?: string }> {
    return this.addTraining(employeeId, {
      ...training,
      status: 'scheduled'
    });
  }

  // Complete training with feedback
  async completeTraining(trainingId: string, feedback?: string, rating?: number): Promise<{ success: boolean; message?: string }> {
    return this.updateTraining(trainingId, {
      status: 'completed',
      completionDate: new Date().toISOString(),
      feedback,
      rating
    });
  }

  // ==================== BUDDY/MENTOR ====================

  // Assign buddy
  async assignBuddy(employeeId: string, buddy: BuddyMentor): Promise<{ success: boolean; message?: string }> {
    return this.request(`/status/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        buddy: {
          ...buddy,
          assignedDate: new Date().toISOString()
        }
      }),
    });
  }

  // Assign mentor
  async assignMentor(employeeId: string, mentor: BuddyMentor): Promise<{ success: boolean; message?: string }> {
    return this.request(`/status/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        mentor: {
          ...mentor,
          assignedDate: new Date().toISOString()
        }
      }),
    });
  }

  // ==================== PROGRESS CALCULATION ====================

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
}

export const onboardingServiceAPI = new OnboardingServiceAPI();
export default onboardingServiceAPI;
