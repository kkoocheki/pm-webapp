/**
 * React Query Hooks for Project Data
 * These hooks integrate API calls with the Zustand store
 * ensuring all views share the same data source
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import { backendProjectDetailToProject, taskToBackendTaskCreate, backendTaskToTask } from '@/lib/api/mappers';
import { useAppStore } from '@/lib/stores/app-store';
import { Task } from '@/lib/api/types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
};

/**
 * Hook to fetch and sync project data with all tasks and dependencies
 * This is the main hook that populates the Zustand store
 */
export function useProjectData(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const {
    setCurrentProject,
    setTasks,
    setDependencies,
    setIsLoading,
  } = useAppStore();

  return useQuery({
    queryKey: projectKeys.detail(projectSlug),
    queryFn: async () => {
      setIsLoading(true);
      try {
        const projectDetail = await api.projects.getProject(projectSlug);
        const { project, tasks, dependencies } = backendProjectDetailToProject(projectDetail);

        // Sync with Zustand store
        setCurrentProject(project);
        setTasks(tasks);
        setDependencies(dependencies);

        return { project, tasks, dependencies };
      } finally {
        setIsLoading(false);
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const queryClient = useQueryClient();
  const { addTask } = useAppStore();

  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const backendTaskCreate = taskToBackendTaskCreate(taskData);
      const backendTask = await api.tasks.createTask(projectSlug, backendTaskCreate);
      return backendTaskToTask(backendTask);
    },
    onSuccess: (newTask) => {
      // Update Zustand store
      addTask(newTask);

      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const queryClient = useQueryClient();
  const { updateTask } = useAppStore();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const backendTaskCreate = taskToBackendTaskCreate(updates);
      const backendTask = await api.tasks.updateTask(projectSlug, taskId, backendTaskCreate);
      return backendTaskToTask(backendTask);
    },
    onSuccess: (updatedTask) => {
      // Update Zustand store
      updateTask(updatedTask.id, updatedTask);

      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const queryClient = useQueryClient();
  const { deleteTask } = useAppStore();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.tasks.deleteTask(projectSlug, taskId);
      return taskId;
    },
    onSuccess: (taskId) => {
      // Update Zustand store
      deleteTask(taskId);

      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
  });
}

/**
 * Hook to check backend health
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health.checkHealth(),
    refetchInterval: 60000, // Check every minute
    retry: 3,
  });
}
