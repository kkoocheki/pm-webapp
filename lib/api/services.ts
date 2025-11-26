/**
 * API Services
 * Service layer for communicating with the FastAPI backend
 */

import { apiClient } from './client';
import { API_CONFIG, ENDPOINTS } from './config';
import {
  BackendProject,
  BackendProjectCreate,
  BackendProjectDetail,
  BackendTask,
  BackendTaskCreate,
  BackendLink,
  BackendLinkCreate,
  BackendImportResult,
  CriticalPathResult,
  ReasoningRequest,
  ReasoningResponse,
  UserStoryStatus,
  TaskStatus,
  SprintMetrics,
  InferenceRule,
  OntologyValidation,
  ReasoningHealth,
  JiraImportRequest,
  JiraImportResult,
  JiraProject,
} from './backend-types';

// ==================== Project Services ====================

export const projectService = {
  /**
   * List all projects
   */
  async listProjects(): Promise<BackendProject[]> {
    const response = await apiClient.get<BackendProject[]>(ENDPOINTS.projects);
    return response;
  },

  /**
   * Get a single project with tasks and links
   */
  async getProject(projectSlug: string): Promise<BackendProjectDetail> {
    const response = await apiClient.get<BackendProjectDetail>(
      ENDPOINTS.project(projectSlug)
    );
    return response;
  },

  /**
   * Create a new project
   */
  async createProject(data: BackendProjectCreate): Promise<BackendProject> {
    const response = await apiClient.post<BackendProject>(ENDPOINTS.projects, data);
    return response;
  },

  /**
   * Update a project
   */
  async updateProject(
    projectSlug: string,
    data: BackendProjectCreate
  ): Promise<BackendProject> {
    const response = await apiClient.put<BackendProject>(
      ENDPOINTS.project(projectSlug),
      data
    );
    return response;
  },

  /**
   * Delete a project
   */
  async deleteProject(projectSlug: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.project(projectSlug));
  },
};

// ==================== Task Services ====================

export const taskService = {
  /**
   * List all tasks for a project
   */
  async listTasks(projectSlug: string): Promise<BackendTask[]> {
    const response = await apiClient.get<BackendTask[]>(ENDPOINTS.tasks(projectSlug));
    return response;
  },

  /**
   * Get a single task
   */
  async getTask(projectSlug: string, taskToken: string): Promise<BackendTask> {
    const response = await apiClient.get<BackendTask>(
      ENDPOINTS.task(projectSlug, taskToken)
    );
    return response;
  },

  /**
   * Create a new task
   */
  async createTask(projectSlug: string, data: BackendTaskCreate): Promise<BackendTask> {
    const response = await apiClient.post<BackendTask>(
      ENDPOINTS.tasks(projectSlug),
      data
    );
    return response;
  },

  /**
   * Update a task
   */
  async updateTask(
    projectSlug: string,
    taskToken: string,
    data: BackendTaskCreate
  ): Promise<BackendTask> {
    const response = await apiClient.put<BackendTask>(
      ENDPOINTS.task(projectSlug, taskToken),
      data
    );
    return response;
  },

  /**
   * Delete a task
   */
  async deleteTask(projectSlug: string, taskToken: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.task(projectSlug, taskToken));
  },
};

// ==================== Link/Dependency Services ====================

export const linkService = {
  /**
   * List all links for a project
   */
  async listLinks(projectSlug: string): Promise<BackendLink[]> {
    const response = await apiClient.get<BackendLink[]>(ENDPOINTS.links(projectSlug));
    return response;
  },

  /**
   * Get a single link
   */
  async getLink(projectSlug: string, linkToken: string): Promise<BackendLink> {
    const response = await apiClient.get<BackendLink>(
      ENDPOINTS.link(projectSlug, linkToken)
    );
    return response;
  },

  /**
   * Create a new link
   */
  async createLink(projectSlug: string, data: BackendLinkCreate): Promise<BackendLink> {
    const response = await apiClient.post<BackendLink>(
      ENDPOINTS.links(projectSlug),
      data
    );
    return response;
  },

  /**
   * Update a link
   */
  async updateLink(
    projectSlug: string,
    linkToken: string,
    data: BackendLinkCreate
  ): Promise<BackendLink> {
    const response = await apiClient.put<BackendLink>(
      ENDPOINTS.link(projectSlug, linkToken),
      data
    );
    return response;
  },

  /**
   * Delete a link
   */
  async deleteLink(projectSlug: string, linkToken: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.link(projectSlug, linkToken));
  },
};

// ==================== Import/Export Services ====================

export const importService = {
  /**
   * Import a Turtle (.ttl) file to create a project
   */
  async importTtl(file: File, projectName: string, overwrite: boolean = false): Promise<BackendImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_name', projectName);
    formData.append('overwrite', String(overwrite));

    const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.importTtl}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Import failed');
    }

    return response.json();
  },

  /**
   * Import from Jira
   */
  async importJira(request: JiraImportRequest): Promise<JiraImportResult> {
    const response = await apiClient.post<JiraImportResult>(
      ENDPOINTS.importJira,
      request
    );
    return response;
  },

  /**
   * List available Jira projects (for selection)
   */
  async listJiraProjects(jiraUrl: string, email: string, apiToken: string): Promise<JiraProject[]> {
    const response = await apiClient.get<JiraProject[]>(
      ENDPOINTS.jiraProjects(jiraUrl, email, apiToken)
    );
    return response;
  },
};

// ==================== Analytics Services ====================

export const analyticsService = {
  /**
   * Get critical path analysis for a project
   */
  async getCriticalPath(projectSlug: string): Promise<CriticalPathResult> {
    const response = await apiClient.get<CriticalPathResult>(
      ENDPOINTS.criticalPath(projectSlug)
    );
    return response;
  },
};

// ==================== Reasoning Services ====================

export const reasoningService = {
  /**
   * Apply semantic reasoning to a project
   */
  async applyReasoning(request: ReasoningRequest): Promise<ReasoningResponse> {
    const response = await apiClient.post<ReasoningResponse>(
      ENDPOINTS.reasoningApply,
      request
    );
    return response;
  },

  /**
   * Get reasoning-inferred status for all user stories
   */
  async getUserStoryStatus(projectSlug: string): Promise<UserStoryStatus[]> {
    const response = await apiClient.get<UserStoryStatus[]>(
      ENDPOINTS.reasoningUserStories(projectSlug)
    );
    return response;
  },

  /**
   * Get reasoning-inferred status for all tasks
   */
  async getTaskStatus(projectSlug: string): Promise<TaskStatus[]> {
    const response = await apiClient.get<TaskStatus[]>(
      ENDPOINTS.reasoningTasks(projectSlug)
    );
    return response;
  },

  /**
   * Get reasoning-computed metrics for a sprint
   */
  async getSprintMetrics(projectSlug: string, sprintIri: string): Promise<SprintMetrics> {
    const response = await apiClient.get<SprintMetrics>(
      ENDPOINTS.reasoningSprint(projectSlug, sprintIri)
    );
    return response;
  },

  /**
   * List all available inference rules
   */
  async listInferenceRules(): Promise<InferenceRule[]> {
    const response = await apiClient.get<InferenceRule[]>(ENDPOINTS.reasoningRules);
    return response;
  },

  /**
   * Validate ontology consistency
   */
  async validateOntology(projectSlug: string): Promise<OntologyValidation> {
    const response = await apiClient.get<OntologyValidation>(
      ENDPOINTS.reasoningValidate(projectSlug)
    );
    return response;
  },

  /**
   * Check reasoning engine health
   */
  async checkHealth(): Promise<ReasoningHealth> {
    const response = await apiClient.get<ReasoningHealth>(ENDPOINTS.reasoningHealth);
    return response;
  },
};

// ==================== Health Check ====================

export const healthService = {
  /**
   * Check backend health
   */
  async checkHealth(): Promise<{
    status: string;
    version: string;
    fuseki: string;
    fuseki_endpoint: string;
    cache: string;
    namespace: string;
  }> {
    const response = await apiClient.get(ENDPOINTS.health);
    return response;
  },
};

// Export all services
export const api = {
  projects: projectService,
  tasks: taskService,
  links: linkService,
  import: importService,
  analytics: analyticsService,
  reasoning: reasoningService,
  health: healthService,
};
