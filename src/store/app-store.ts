import { create } from 'zustand';

interface ComplaintFilters {
  status: string;
  categoryId: string;
  departmentId: string;
  isFlagged: boolean;
  search: string;
  page: number;
}

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  filters: ComplaintFilters;
  setFilter: <K extends keyof ComplaintFilters>(key: K, value: ComplaintFilters[K]) => void;
  resetFilters: () => void;

  selectedComplaintId: number | null;
  setSelectedComplaintId: (id: number | null) => void;
}

const initialFilters: ComplaintFilters = {
  status: 'ALL',
  categoryId: 'ALL',
  departmentId: 'ALL',
  isFlagged: false,
  search: '',
  page: 1,
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        // Reset page to 1 when changing other filters
        ...(key !== 'page' ? { page: 1 } : {}),
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  selectedComplaintId: null,
  setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),
}));
