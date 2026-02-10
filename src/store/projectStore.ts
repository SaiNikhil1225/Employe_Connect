import { create } from 'zustand';
import axios from 'axios';
import type { Project, ProjectFormData, ProjectStats, ProjectFilters } from '@/types/project';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  stats: ProjectStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,
  stats: null,
  isLoading: false,
  error: null,

  fetchProjects: async (filters?: ProjectFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.region) params.append('region', filters.region);
      if (filters?.billingType) params.append('billingType', filters.billingType);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.search) {
        params.append('search', filters.search);
        if (filters?.searchScope) {
          params.append('searchScope', filters.searchScope);
        }
      }
      
      // Handle array filters
      if (filters?.statuses && filters.statuses.length > 0) {
        filters.statuses.forEach(s => params.append('statuses[]', s));
      }
      if (filters?.regions && filters.regions.length > 0) {
        filters.regions.forEach(r => params.append('regions[]', r));
      }
      if (filters?.owners && filters.owners.length > 0) {
        filters.owners.forEach(o => params.append('owners[]', o));
      }
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/projects?${params.toString()}`);
      let projects = response.data.data;
      
      // Client-side health filtering based on utilization
      if (filters?.health && filters.health.length > 0) {
        projects = projects.filter((project: Project) => {
          const utilization = project.utilization ?? 0;
          return filters.health?.some(healthCategory => {
            switch (healthCategory) {
              case 'excellent':
                return utilization >= 80;
              case 'good':
                return utilization >= 60 && utilization < 80;
              case 'fair':
                return utilization >= 40 && utilization < 60;
              case 'at-risk':
                return utilization >= 20 && utilization < 40;
              case 'critical':
                return utilization < 20;
              default:
                return false;
            }
          });
        });
      }
      
      set({ projects, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch projects';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      set({ selectedProject: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch project';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      // Validate required fields
      if (!data.customerId) {
        throw new Error('Customer is required. Please select a customer from the Account Name dropdown.');
      }

      // Use provided projectId or generate new one
      let projectId = data.projectId;
      if (!projectId) {
        // Fetch next project ID from backend
        const response = await api.get('/projects/next-id');
        projectId = response.data.data;
      }
      
      // Transform the data to match backend schema
      const projectData = {
        projectId,
        projectName: data.projectName,
        customerId: data.customerId,
        accountName: data.accountName,
        legalEntity: data.legalEntity,
        hubspotDealId: data.hubspotDealId || '',
        billingType: data.billingType,
        practiceUnit: data.practiceUnit,
        region: data.region,
        // Transform manager fields from string to object
        projectManager: data.projectManager ? {
          name: data.projectManager,
          employeeId: '' // Will be populated later when we have employee data
        } : undefined,
        deliveryManager: data.deliveryManager ? {
          name: data.deliveryManager,
          employeeId: '' // Will be populated later when we have employee data
        } : undefined,
        industry: data.industry || '',
        clientType: data.clientType || '',
        revenueType: data.revenueType || '',
        projectStartDate: data.projectStartDate,
        projectEndDate: data.projectEndDate,
        projectCurrency: data.projectCurrency,
        estimatedValue: data.estimatedValue || 0,
        status: data.status || 'Draft',
        description: data.projectDescription || ''
      };

      const response = await axios.post(`${API_URL}/projects`, projectData);
      const newProject = response.data.data;
      
      set(state => ({
        projects: [newProject, ...state.projects],
        isLoading: false
      }));

      return newProject;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create project';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<ProjectFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/projects/${id}`, data);
      const updatedProject = response.data.data;
      
      set(state => ({
        projects: state.projects.map(p => 
          p._id === id || p.id === id ? updatedProject : p
        ),
        selectedProject: state.selectedProject?._id === id || state.selectedProject?.id === id 
          ? updatedProject 
          : state.selectedProject,
        isLoading: false
      }));

      return updatedProject;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update project';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/projects/${id}`);
      
      set(state => ({
        projects: state.projects.filter(p => p._id !== id && p.id !== id),
        selectedProject: state.selectedProject?._id === id || state.selectedProject?.id === id
          ? null
          : state.selectedProject,
        isLoading: false
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete project';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/stats`);
      set({ stats: response.data.data });
    } catch (error: unknown) {
      console.error('Failed to fetch project stats:', error);
    }
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  clearError: () => {
    set({ error: null });
  }
}));
