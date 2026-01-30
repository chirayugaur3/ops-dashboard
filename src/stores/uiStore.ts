// PURPOSE: Zustand store for UI state management
// Manages theme, modals, filters, and UI preferences
// Keeps server state in React Query, UI state here - clean separation

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DashboardFilters, Exception } from '@/types';
import { getTodayRange } from '@/lib/utils';

// =============================================================================
// Theme Store
// =============================================================================

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  effectiveTheme: 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: 'dark',
      setTheme: (theme) => {
        const effectiveTheme = theme === 'system'
          ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        set({ theme, effectiveTheme });
        
        // Update document class for Tailwind dark mode
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =============================================================================
// Dashboard Filters Store
// =============================================================================

interface FiltersState {
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setDateRange: (start: string, end: string) => void;
  setLocation: (locationId: string | undefined) => void;
}

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: getTodayRange(),
  locationId: undefined,
  employeeId: undefined,
  exceptionType: undefined,
  exceptionStatus: undefined,
};

export const useFiltersStore = create<FiltersState>()((set) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setDateRange: (start, end) =>
    set((state) => ({
      filters: { ...state.filters, dateRange: { start, end } },
    })),
  setLocation: (locationId) =>
    set((state) => ({ filters: { ...state.filters, locationId } })),
}));

// =============================================================================
// Modal State Store
// =============================================================================

interface ModalState {
  // Shift detail modal
  shiftModalOpen: boolean;
  selectedEmployeeId: string | null;
  selectedEmployeeName: string;
  openShiftModal: (employeeId: string, name: string) => void;
  closeShiftModal: () => void;

  // Resolve dialog
  resolveDialogOpen: boolean;
  selectedException: Exception | null;
  openResolveDialog: (exception: Exception) => void;
  closeResolveDialog: () => void;

  // Generic confirmation dialog
  confirmDialogOpen: boolean;
  confirmDialogConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
  openConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  // Shift modal
  shiftModalOpen: false,
  selectedEmployeeId: null,
  selectedEmployeeName: '',
  openShiftModal: (employeeId, name) =>
    set({
      shiftModalOpen: true,
      selectedEmployeeId: employeeId,
      selectedEmployeeName: name,
    }),
  closeShiftModal: () =>
    set({
      shiftModalOpen: false,
      selectedEmployeeId: null,
      selectedEmployeeName: '',
    }),

  // Resolve dialog
  resolveDialogOpen: false,
  selectedException: null,
  openResolveDialog: (exception) =>
    set({ resolveDialogOpen: true, selectedException: exception }),
  closeResolveDialog: () =>
    set({ resolveDialogOpen: false, selectedException: null }),

  // Confirm dialog
  confirmDialogOpen: false,
  confirmDialogConfig: null,
  openConfirmDialog: (title, message, onConfirm) =>
    set({
      confirmDialogOpen: true,
      confirmDialogConfig: { title, message, onConfirm },
    }),
  closeConfirmDialog: () =>
    set({ confirmDialogOpen: false, confirmDialogConfig: null }),
}));

// =============================================================================
// UI Preferences Store
// =============================================================================

interface UIPreferencesState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Table preferences
  exceptionsPageSize: number;
  setExceptionsPageSize: (size: number) => void;

  // Map preferences
  mapClusteringEnabled: boolean;
  toggleMapClustering: () => void;

  // Auto-refresh
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number; // in seconds
  setAutoRefresh: (enabled: boolean, interval?: number) => void;
}

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Table
      exceptionsPageSize: 10,
      setExceptionsPageSize: (size) => set({ exceptionsPageSize: size }),

      // Map
      mapClusteringEnabled: true,
      toggleMapClustering: () =>
        set((state) => ({ mapClusteringEnabled: !state.mapClusteringEnabled })),

      // Auto-refresh
      autoRefreshEnabled: true,
      autoRefreshInterval: 60,
      setAutoRefresh: (enabled, interval) =>
        set((state) => ({
          autoRefreshEnabled: enabled,
          autoRefreshInterval: interval ?? state.autoRefreshInterval,
        })),
    }),
    {
      name: 'ui-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =============================================================================
// Notification Store (for toast messages)
// =============================================================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto-remove after duration
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));
