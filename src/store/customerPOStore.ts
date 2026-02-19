import { create } from 'zustand';
import axios from 'axios';
import type { CustomerPO, CustomerPOFormData, CustomerPOFilters } from '@/types/customerPO';

interface CustomerPOStore {
  pos: CustomerPO[];
  loading: boolean;
  error: string | null;
  filters: CustomerPOFilters;
  fetchPOs: () => Promise<void>;
  createPO: (data: CustomerPOFormData) => Promise<void>;
  updatePO: (id: string, data: Partial<CustomerPOFormData>) => Promise<void>;
  deletePO: (id: string) => Promise<void>;
  setFilter: (key: keyof CustomerPOFilters, value: string) => void;
  clearFilters: () => void;
}

const initialFilters: CustomerPOFilters = {
  search: '',
  status: '',
  bookingEntity: '',
  customerId: '',
  projectId: ''
};

export const useCustomerPOStore = create<CustomerPOStore>((set, get) => ({
  pos: [],
  loading: false,
  error: null,
  filters: initialFilters,

  fetchPOs: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.status && filters.status.trim()) params.append('status', filters.status);
      if (filters.bookingEntity && filters.bookingEntity.trim()) params.append('bookingEntity', filters.bookingEntity);
      if (filters.customerId && filters.customerId.trim()) params.append('customerId', filters.customerId);
      if (filters.projectId && filters.projectId.trim()) params.append('projectId', filters.projectId);

      const response = await axios.get(`/api/customer-pos?${params.toString()}`);
      set({ pos: response.data.data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer POs';
      set({ error: message, loading: false });
    }
  },

  createPO: async (data: CustomerPOFormData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/customer-pos', data);
      set((state) => ({
        pos: [response.data.data, ...state.pos],
        loading: false
      }));
    } catch (error: any) {
      let message = 'Failed to create customer PO';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          message = 'API endpoint not found. Please ensure the backend server is running.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        } else {
          message = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request made but no response
        message = 'No response from server. Please check if the backend server is running on port 5000.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      console.error('Create PO Error:', error);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updatePO: async (id: string, data: Partial<CustomerPOFormData>) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/customer-pos/${id}`, data);
      set((state) => ({
        pos: state.pos.map((po) => (po._id === id ? response.data.data : po)),
        loading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update customer PO';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deletePO: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/customer-pos/${id}`);
      set((state) => ({
        pos: state.pos.filter((po) => po._id !== id),
        loading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete customer PO';
      set({ error: message, loading: false });
      throw error;
    }
  },

  setFilter: (key: keyof CustomerPOFilters, value: string) => {
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
