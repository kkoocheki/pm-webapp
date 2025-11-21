/**
 * React Query Hooks for Project Data
 * React Query manages ALL server state - no Zustand syncing needed
 * Components read directly from React Query cache for unified data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import { backendProjectDetailToProject, taskToBackendTaskCreate, backendTaskToTask } from '@/lib/api/mappers';
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
 * Hook to fetch project data with all tasks and dependencies
 * React Query manages caching and synchronization
 */
export function useProjectData(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  return useQuery({
    queryKey: projectKeys.detail(projectSlug),
    queryFn: async () => {
      const projectDetail = await api.projects.getProject(projectSlug);
      return backendProjectDetailToProject(projectDetail);
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

  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const backendTaskCreate = taskToBackendTaskCreate(taskData);
      const backendTask = await api.tasks.createTask(projectSlug, backendTaskCreate);
      return backendTaskToTask(backendTask);
    },
    onSuccess: () => {
      // Invalidate and refetch - React Query handles cache update
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const backendTaskCreate = taskToBackendTaskCreate(updates);
      const backendTask = await api.tasks.updateTask(projectSlug, taskId, backendTaskCreate);
      return backendTaskToTask(backendTask);
    },
    onSuccess: () => {
      // Invalidate and refetch - React Query handles cache update
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.tasks.deleteTask(projectSlug, taskId);
      return taskId;
    },
    onSuccess: () => {
      // Invalidate and refetch - React Query handles cache update
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
