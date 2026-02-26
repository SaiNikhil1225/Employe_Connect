import { create } from 'zustand';
import hiringService from '@/services/hiringService';
import type { HiringRequest, HiringStatistics, HiringFilters } from '@/types/hiring';
import { toast } from 'sonner';

interface HiringStore {
  requests: HiringRequest[];
  currentRequest: HiringRequest | null;
  statistics: HiringStatistics | null;
  isLoading: boolean;
  error: string | null;
  filters: HiringFilters;

  // Actions
  fetchRequests: (isHR?: boolean) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: Partial<HiringRequest>) => Promise<HiringRequest>;
  updateRequest: (id: string, data: Partial<HiringRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  submitRequest: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  assignRecruiter: (id: string, recruiterId: string) => Promise<void>;
  closeRequest: (id: string, closureReason: string, closureType: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  setFilters: (filters: Partial<HiringFilters>) => void;
  clearFilters: () => void;
  setCurrentRequest: (request: HiringRequest | null) => void;
}

const defaultFilters: HiringFilters = {
  status: [],
  department: '',
  employmentType: [],
  dateRange: { start: null, end: null },
  searchQuery: ''
};

export const useHiringStore = create<HiringStore>((set, get) => ({
  requests: [],
  currentRequest: null,
  statistics: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,

  fetchRequests: async (isHR = false) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const requests = isHR 
        ? await hiringService.getAllRequests(filters)
        : await hiringService.getMyRequests(filters);
      set({ requests, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch requests';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const request = await hiringService.getRequestById(id);
      set({ currentRequest: request, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch request';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createRequest: async (data: Partial<HiringRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await hiringService.createRequest(data as any);
      set(state => ({ 
        requests: [newRequest, ...state.requests],
        isLoading: false 
      }));
      toast.success('Hiring request created successfully');
      return newRequest;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create request';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  updateRequest: async (id: string, data: Partial<HiringRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.updateRequest(id, data);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
      toast.success('Request updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update request';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  deleteRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await hiringService.deleteRequest(id);
      set(state => ({
        requests: state.requests.filter(r => r._id !== id),
        isLoading: false
      }));
      toast.success('Request deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete request';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  submitRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.submitRequest(id);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
      toast.success('Request submitted to HR successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit request';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  updateStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.updateStatus(id, status);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
      toast.success(`Request status updated to ${status}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update status';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  assignRecruiter: async (id: string, recruiterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.assignRecruiter(id, recruiterId);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
      toast.success('Recruiter assigned successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to assign recruiter';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  closeRequest: async (id: string, closureReason: string, closureType: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.closeRequest(id, closureReason, closureType);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
      toast.success('Request closed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to close request';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  fetchStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await hiringService.getStatistics();
      set({ statistics, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch statistics';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  setFilters: (newFilters: Partial<HiringFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
  },

  setCurrentRequest: (request: HiringRequest | null) => {
    set({ currentRequest: request });
  }
}));
