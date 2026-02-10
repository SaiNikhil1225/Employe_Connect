import { create } from 'zustand';
import axios from 'axios';
import type { FinancialLine, FinancialLineFormData, FinancialLineFilters } from '@/types/financialLine';

interface FinancialLineStore {
  fls: FinancialLine[];
  loading: boolean;
  error: string | null;
  filters: FinancialLineFilters;
  fetchFLs: () => Promise<void>;
  createFL: (data: FinancialLineFormData) => Promise<void>;
  updateFL: (id: string, data: Partial<FinancialLineFormData>) => Promise<void>;
  deleteFL: (id: string) => Promise<void>;
  setFilter: (key: keyof FinancialLineFilters, value: string) => void;
  clearFilters: () => void;
}

const initialFilters: FinancialLineFilters = {
  search: '',
  status: '',
  locationType: '',
  contractType: '',
  projectId: ''
};

export const useFinancialLineStore = create<FinancialLineStore>((set, get) => ({
  fls: [],
  loading: false,
  error: null,
  filters: initialFilters,

  fetchFLs: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.locationType) params.append('locationType', filters.locationType);
      if (filters.contractType) params.append('contractType', filters.contractType);
      if (filters.projectId) params.append('projectId', filters.projectId);

      console.log('fetchFLs - Fetching with filters:', filters);
      console.log('fetchFLs - API URL:', `/api/financial-lines?${params.toString()}`);
      
      const response = await axios.get(`/api/financial-lines?${params.toString()}`);
      console.log('fetchFLs - Received FLs:', response.data.data.length);
      console.log('fetchFLs - FL data:', response.data.data);
      
      set({ fls: response.data.data, loading: false });
    } catch (error: unknown) {
      console.error('fetchFLs - Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch financial lines';
      set({ error: message, loading: false });
    }
  },

  createFL: async (data: FinancialLineFormData) => {
    set({ loading: true, error: null });
    try {
      console.log('createFL - Sending data:', data);
      const response = await axios.post('/api/financial-lines', data);
      console.log('createFL - Response:', response.data);
      console.log('createFL - Created FL:', response.data.data);
      
      set((state) => ({
        fls: [response.data.data, ...state.fls],
        loading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create financial line';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateFL: async (id: string, data: Partial<FinancialLineFormData>) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/financial-lines/${id}`, data);
      set((state) => ({
        fls: state.fls.map((fl) => (fl._id === id ? response.data.data : fl)),
        loading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update financial line';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteFL: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/financial-lines/${id}`);
      set((state) => ({
        fls: state.fls.filter((fl) => fl._id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete financial line';
      set({ error: message, loading: false });
      throw error;
    }
  },

  setFilter: (key: keyof FinancialLineFilters, value: string) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  }
}));
