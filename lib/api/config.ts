/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const ENDPOINTS = {
  // Projects
  projects: '/api/projects',
  project: (slug: string) => `/api/projects/${slug}`,

  // Tasks
  tasks: (projectSlug: string) => `/api/projects/${projectSlug}/tasks`,
  task: (projectSlug: string, taskToken: string) => `/api/projects/${projectSlug}/tasks/${taskToken}`,

  // Links/Dependencies
  links: (projectSlug: string) => `/api/projects/${projectSlug}/links`,
  link: (projectSlug: string, linkToken: string) => `/api/projects/${projectSlug}/links/${linkToken}`,

  // Analytics
  criticalPath: (projectSlug: string) => `/api/projects/${projectSlug}/critical-path`,

  // Import/Export
  importTtl: '/api/import/ttl',

  // Reasoning
  reasoningApply: '/api/reasoning/apply',
  reasoningUserStories: (projectSlug: string) => `/api/reasoning/user-stories/${projectSlug}`,
  reasoningTasks: (projectSlug: string) => `/api/reasoning/tasks/${projectSlug}`,
  reasoningSprint: (projectSlug: string, sprintIri: string) => `/api/reasoning/sprints/${projectSlug}/${sprintIri}`,
  reasoningRules: '/api/reasoning/rules',
  reasoningValidate: (projectSlug: string) => `/api/reasoning/validate/${projectSlug}`,
  reasoningHealth: '/api/reasoning/health',

  // Health
  health: '/health',
} as const;

export const DEFAULT_PROJECT_SLUG = process.env.NEXT_PUBLIC_DEFAULT_PROJECT || 'demo-project';
