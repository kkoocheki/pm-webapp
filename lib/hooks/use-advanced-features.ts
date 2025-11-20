/**
 * React Query Hooks for Advanced Features
 * Import, Analytics, and Reasoning capabilities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import { ReasoningRequest } from '@/lib/api/backend-types';

// ==================== Import Hooks ====================

/**
 * Hook to import a TTL file
 */
export function useImportTtl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      projectName,
      overwrite,
    }: {
      file: File;
      projectName: string;
      overwrite?: boolean;
    }) => {
      return api.import.importTtl(file, projectName, overwrite);
    },
    onSuccess: () => {
      // Invalidate project list to show new project
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ==================== Analytics Hooks ====================

/**
 * Hook to fetch critical path analysis
 */
export function useCriticalPath(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  return useQuery({
    queryKey: ['critical-path', projectSlug],
    queryFn: () => api.analytics.getCriticalPath(projectSlug),
    staleTime: 60000, // 1 minute
  });
}

// ==================== Reasoning Hooks ====================

/**
 * Hook to apply semantic reasoning
 */
export function useApplyReasoning() {
  return useMutation({
    mutationFn: (request: ReasoningRequest) => api.reasoning.applyReasoning(request),
  });
}

/**
 * Hook to get user story status with reasoning
 */
export function useUserStoryStatus(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  return useQuery({
    queryKey: ['reasoning', 'user-stories', projectSlug],
    queryFn: () => api.reasoning.getUserStoryStatus(projectSlug),
    staleTime: 60000,
  });
}

/**
 * Hook to get task status with reasoning (critical, blocked, etc.)
 */
export function useTaskStatus(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  return useQuery({
    queryKey: ['reasoning', 'tasks', projectSlug],
    queryFn: () => api.reasoning.getTaskStatus(projectSlug),
    staleTime: 60000,
  });
}

/**
 * Hook to get sprint metrics with reasoning
 */
export function useSprintMetrics(projectSlug: string, sprintIri: string) {
  return useQuery({
    queryKey: ['reasoning', 'sprint', projectSlug, sprintIri],
    queryFn: () => api.reasoning.getSprintMetrics(projectSlug, sprintIri),
    enabled: !!sprintIri,
    staleTime: 60000,
  });
}

/**
 * Hook to list all inference rules
 */
export function useInferenceRules() {
  return useQuery({
    queryKey: ['reasoning', 'rules'],
    queryFn: () => api.reasoning.listInferenceRules(),
    staleTime: Infinity, // Rules don't change
  });
}

/**
 * Hook to validate ontology
 */
export function useValidateOntology(projectSlug: string = DEFAULT_PROJECT_SLUG) {
  return useQuery({
    queryKey: ['reasoning', 'validate', projectSlug],
    queryFn: () => api.reasoning.validateOntology(projectSlug),
    staleTime: 60000,
  });
}

/**
 * Hook to check reasoning engine health
 */
export function useReasoningHealth() {
  return useQuery({
    queryKey: ['reasoning', 'health'],
    queryFn: () => api.reasoning.checkHealth(),
    refetchInterval: 60000, // Check every minute
  });
}
