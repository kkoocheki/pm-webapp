/**
 * React Query Hooks for Project Data
 * React Query manages ALL server state - no Zustand syncing needed
 * Components read directly from React Query cache for unified data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { DEFAULT_PROJECT_SLUG, API_CONFIG, ENDPOINTS } from '@/lib/api/config';
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
      // Convert frontend task format to backend format
      const backendData = taskToBackendTaskCreate(taskData);
      console.log('[useCreateTask] Creating task with data:', backendData);
      
      // Call the API directly with proper field names
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.tasks(projectSlug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[useCreateTask] Failed:', error);
        throw new Error(`Failed to create task: ${error}`);
      }
      
      const result = await response.json();
      console.log('[useCreateTask] Success:', result);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch - React Query handles cache update
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
    onError: (error) => {
      console.error('[useCreateTask] Error:', error);
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
      // Convert frontend task format to backend format
      const backendData = taskToBackendTaskCreate(updates);
      console.log('[useUpdateTask] Updating task', taskId, 'with data:', backendData);
      
      // Call the API directly with proper field names
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.task(projectSlug, taskId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[useUpdateTask] Failed:', error);
        throw new Error(`Failed to update task: ${error}`);
      }
      
      const result = await response.json();
      console.log('[useUpdateTask] Success:', result);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch - React Query handles cache update
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectSlug) });
    },
    onError: (error) => {
      console.error('[useUpdateTask] Error:', error);
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
