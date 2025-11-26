/**
 * Global UI State Store
 * Using Zustand ONLY for client-side UI state
 * Server data (tasks, projects, etc.) is managed by React Query
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Current project (just the slug for routing)
  currentProjectSlug: string;
  setCurrentProjectSlug: (slug: string) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Chat panel
  chatPanelOpen: boolean;
  setChatPanelOpen: (open: boolean) => void;

  // View preferences
  kanbanViewMode: 'compact' | 'comfortable' | 'spacious';
  setKanbanViewMode: (mode: 'compact' | 'comfortable' | 'spacious') => void;

  ganttZoomLevel: 'day' | 'week' | 'month';
  setGanttZoomLevel: (level: 'day' | 'week' | 'month') => void;

  // Filters (UI state only - actual filtering happens in queries)
  activeFilters: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    sprint?: string;
    epic?: string;
  };
  setActiveFilters: (filters: UIState['activeFilters']) => void;
  clearFilters: () => void;

  // Selected items (for bulk operations)
  selectedTaskIds: string[];
  toggleTaskSelection: (id: string) => void;
  clearTaskSelection: () => void;
  selectAllTasks: (ids: string[]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      currentProjectSlug: process.env.NEXT_PUBLIC_DEFAULT_PROJECT || 'demo-project',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      chatPanelOpen: false,
      kanbanViewMode: 'comfortable',
      ganttZoomLevel: 'week',
      activeFilters: {},
      selectedTaskIds: [],

      // Project Actions
      setCurrentProjectSlug: (slug) => set({ currentProjectSlug: slug }),

      // Sidebar Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Command Palette Actions
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Chat Panel Actions
      setChatPanelOpen: (open) => set({ chatPanelOpen: open }),

      // View Preference Actions
      setKanbanViewMode: (mode) => set({ kanbanViewMode: mode }),
      setGanttZoomLevel: (level) => set({ ganttZoomLevel: level }),

      // Filter Actions
      setActiveFilters: (filters) => set({ activeFilters: filters }),
      clearFilters: () => set({ activeFilters: {} }),

      // Selection Actions
      toggleTaskSelection: (id) =>
        set((state) => ({
          selectedTaskIds: state.selectedTaskIds.includes(id)
            ? state.selectedTaskIds.filter((taskId) => taskId !== id)
            : [...state.selectedTaskIds, id],
        })),
      clearTaskSelection: () => set({ selectedTaskIds: [] }),
      selectAllTasks: (ids) => set({ selectedTaskIds: ids }),
    }),
    {
      name: 'pm-ui-state', // localStorage key
      partialize: (state) => ({
        // Only persist UI preferences, not runtime state
        currentProjectSlug: state.currentProjectSlug,
        sidebarCollapsed: state.sidebarCollapsed,
        kanbanViewMode: state.kanbanViewMode,
        ganttZoomLevel: state.ganttZoomLevel,
      }),
    }
  )
);

// Backwards compatibility alias (will remove after updating components)
export const useAppStore = useUIStore;
