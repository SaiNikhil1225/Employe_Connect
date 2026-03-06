import { create } from 'zustand';
import apiClient from '@/services/api';
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
      
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.status && filters.status.trim()) params.append('status', filters.status);
      if (filters.locationType && filters.locationType.trim()) params.append('locationType', filters.locationType);
      if (filters.contractType && filters.contractType.trim()) params.append('contractType', filters.contractType);
      if (filters.projectId && filters.projectId.trim()) params.append('projectId', filters.projectId);

      const response = await apiClient.get(`/financial-lines?${params.toString()}`);
      
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
      const response = await apiClient.post('/financial-lines', data);
      
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
      const response = await apiClient.put(`/financial-lines/${id}`, data);
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
      await apiClient.delete(`/financial-lines/${id}`);
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
    // Normalize space character to empty string (treats " " as "no filter")
    const normalizedValue = value.trim() === '' ? '' : value;
    set((state) => ({
      filters: { ...state.filters, [key]: normalizedValue }
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  }
}));
