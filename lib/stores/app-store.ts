/**
 * Global Application State Store
 * Using Zustand for simple, lightweight state management
 */

import { create } from 'zustand';
import { Task, Project, Insight } from '@/lib/api/types';

interface AppState {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Insights
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  chatPanelOpen: boolean;
  setChatPanelOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentProject: null,
  tasks: [],
  insights: [],
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  chatPanelOpen: false,
  isLoading: false,

  // Actions
  setCurrentProject: (project) => set({ currentProject: project }),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  setInsights: (insights) => set({ insights }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
