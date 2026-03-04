import { create } from 'zustand';
import { holidayService } from '@/services/holidayService';
import { toast } from 'sonner';

export interface Holiday {
  id: number | string;
  date: string;
  name: string;
  type: string;
  backgroundImage?: string;
}

interface HolidayState {
  holidays: Holiday[];
  isLoading: boolean;
  error: string | null;

  fetchHolidays: () => Promise<void>;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<void>;
  updateHoliday: (id: number | string, updates: Partial<Holiday>) => Promise<void>;
  deleteHoliday: (id: number | string) => Promise<void>;
  getUpcomingHolidays: () => Holiday[];
}

export const useHolidayStore = create<HolidayState>((set, get) => ({
      holidays: [],
      isLoading: false,
      error: null,

      fetchHolidays: async () => {
        set({ isLoading: true, error: null });

        try {
          const data = await holidayService.getAll();
      const holidays = data.map(item => {
        // Extract type name if it's an object (populated), otherwise use the string
        const typeName = typeof item.typeId === 'object' && item.typeId && 'name' in item.typeId 
          ? item.typeId.name 
          : 'Holiday';
        
        // Store date in ISO format to avoid timezone issues
        // This will be "2026-01-01T00:00:00.000Z" format
        return {
          id: item._id || '',
          date: item.date, // Keep ISO format
          name: item.name,
          type: typeName,
          backgroundImage: item.imageUrl || ''
        };
      });

          set({ holidays, isLoading: false });
        } catch (error) {
          set({ 
            error: 'Failed to load holidays. Please check your connection.',
            isLoading: false
          });
          toast.error('Failed to load holidays. Please try again.');
        }
      },

      addHoliday: async (holiday) => {
        set({ isLoading: true, error: null });
        try {
          const newHoliday = await holidayService.create(holiday);
          // Extract type name if it's an object (populated), otherwise use the string
          const typeName = typeof newHoliday.typeId === 'object' && newHoliday.typeId && 'name' in newHoliday.typeId 
            ? newHoliday.typeId.name 
            : 'Holiday';

          const transformed: Holiday = {
            id: newHoliday._id || `temp-${Date.now()}`,
            date: newHoliday.date, // Keep ISO format
            name: newHoliday.name,
            type: typeName,
            backgroundImage: newHoliday.imageUrl || ''
          };

          set(state => ({
            holidays: [...state.holidays, transformed],
            isLoading: false
          }));
        } catch {
          const newId = Math.max(...get().holidays.map(h => typeof h.id === 'number' ? h.id : 0), 0) + 1;
          set(state => ({
            holidays: [...state.holidays, { ...holiday, id: newId }],
            isLoading: false,
            error: 'Added offline. Will sync when online.'
          }));
        }
      },

      updateHoliday: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _, ...serviceUpdates } = updates;
          await holidayService.update(id, serviceUpdates);
          set(state => ({
            holidays: state.holidays.map(h =>
              h.id === id ? { ...h, ...updates } : h
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to update holiday', isLoading: false });
          throw error; // Re-throw so the modal can handle it
        }
      },

      deleteHoliday: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (get().holidays.length === 0) {
            // Using fallback data, delete locally
            set(state => ({ holidays: state.holidays.filter(h => h.id !== id), isLoading: false }));
          } else {
            await holidayService.delete(id);
            set(state => ({
              holidays: state.holidays.filter(h => h.id !== id),
              isLoading: false
            }));
          }
        } catch {
          set({ error: 'Failed to delete holiday', isLoading: false });
          toast.error('Failed to delete holiday');
        }
      },

      getUpcomingHolidays: () => {
        const holidays = get().holidays;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Parse and sort holidays by actual date using UTC methods
        const sortedHolidays = holidays
          .map(h => {
            const dateObj = new Date(h.date);
            // Get UTC date string for comparison
            const dateStr = `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`;
            return {
              ...h,
              dateStr,
              year: dateObj.getUTCFullYear(),
              month: dateObj.getUTCMonth()
            };
          })
          .filter(h => h.dateStr >= todayStr) // Remove past holidays
          .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

        if (sortedHolidays.length === 0) {
          return [];
        }

        // Find current month holidays using UTC
        const currentMonth = today.getUTCMonth();
        const currentYear = today.getUTCFullYear();
        const currentMonthHolidays = sortedHolidays.filter(h =>
          h.month === currentMonth && h.year === currentYear
        );

        // If current month has holidays, return them
        if (currentMonthHolidays.length > 0) {
          return currentMonthHolidays.map(({ dateStr, year, month, ...h }) => h);
        }

        // Find next month with holidays
        const firstUpcoming = sortedHolidays[0];
        const targetMonth = firstUpcoming.month;
        const targetYear = firstUpcoming.year;

        return sortedHolidays
          .filter(h => h.month === targetMonth && h.year === targetYear)
          .map(({ dateStr, year, month, ...h }) => h);
      }
    })
);