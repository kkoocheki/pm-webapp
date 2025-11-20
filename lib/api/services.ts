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
  health: healthService,
};
