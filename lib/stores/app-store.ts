/**
 * Global Application State Store
 * Using Zustand for simple, lightweight state management
 */

import { create } from 'zustand';
import { Task, Project, Insight, UserStory, Epic, Sprint, TeamMember, Dependency } from '@/lib/api/types';

interface AppState {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Epics
  epics: Epic[];
  setEpics: (epics: Epic[]) => void;
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, updates: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;

  // User Stories
  stories: UserStory[];
  setStories: (stories: UserStory[]) => void;
  addStory: (story: UserStory) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  deleteStory: (id: string) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Sprints
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;

  // Team Members
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;

  // Dependencies
  dependencies: Dependency[];
  setDependencies: (deps: Dependency[]) => void;
  addDependency: (dep: Dependency) => void;
  deleteDependency: (id: string) => void;

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
  epics: [],
  stories: [],
  tasks: [],
  sprints: [],
  teamMembers: [],
  dependencies: [],
  insights: [],
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  chatPanelOpen: false,
  isLoading: false,

  // Project Actions
  setCurrentProject: (project) => set({ currentProject: project }),

  // Epic Actions
  setEpics: (epics) => set({ epics }),
  addEpic: (epic) => set((state) => ({ epics: [...state.epics, epic] })),
  updateEpic: (id, updates) =>
    set((state) => ({
      epics: state.epics.map((epic) =>
        epic.id === id ? { ...epic, ...updates } : epic
      ),
    })),
  deleteEpic: (id) =>
    set((state) => ({
      epics: state.epics.filter((epic) => epic.id !== id),
    })),

  // User Story Actions
  setStories: (stories) => set({ stories }),
  addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),
  updateStory: (id, updates) =>
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === id ? { ...story, ...updates } : story
      ),
    })),
  deleteStory: (id) =>
    set((state) => ({
      stories: state.stories.filter((story) => story.id !== id),
    })),

  // Task Actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
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

  // Sprint Actions
  setSprints: (sprints) => set({ sprints }),
  addSprint: (sprint) => set((state) => ({ sprints: [...state.sprints, sprint] })),
  updateSprint: (id, updates) =>
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === id ? { ...sprint, ...updates } : sprint
      ),
    })),
  deleteSprint: (id) =>
    set((state) => ({
      sprints: state.sprints.filter((sprint) => sprint.id !== id),
    })),

  // Team Member Actions
  setTeamMembers: (teamMembers) => set({ teamMembers }),

  // Dependency Actions
  setDependencies: (dependencies) => set({ dependencies }),
  addDependency: (dep) => set((state) => ({ dependencies: [...state.dependencies, dep] })),
  deleteDependency: (id) =>
    set((state) => ({
      dependencies: state.dependencies.filter((dep) => dep.id !== id),
    })),

  // Insight Actions
  setInsights: (insights) => set({ insights }),

  // UI Actions
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
