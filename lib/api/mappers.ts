/**
 * Data Mappers
 * Convert between backend API types and frontend application types
 */

import {
  BackendTask,
  BackendTaskCreate,
  BackendProject,
  BackendProjectDetail,
  BackendLink,
  BackendLinkCreate,
} from './backend-types';
import { Task, Project, Dependency, DependencyType, TaskItemType, TaskPriority, TaskStatus } from './types';

// ==================== Task Mappers ====================

/**
 * Map RDF state to frontend task status
 * RDF states: ToDo, InProgress, Done, InReview, Completed, Blocked
 */
function mapRdfStateToStatus(state?: string | null, progress?: number | null, open?: boolean | null): TaskStatus {
  if (state) {
    const stateMap: Record<string, TaskStatus> = {
      'ToDo': 'not-started',
      'InProgress': 'in-progress',
      'Done': 'completed',
      'Completed': 'completed',
      'InReview': 'in-progress',
      'Blocked': 'blocked',
    };
    if (stateMap[state]) return stateMap[state];
  }
  // Fallback to progress-based status
  if (progress === 100) return 'completed';
  if (progress && progress > 0) return 'in-progress';
  if (open === false) return 'blocked';
  return 'not-started';
}

/**
 * Map RDF priority to frontend priority
 * RDF priorities: Urgent, High, Medium, Low, NoPriority
 */
function mapRdfPriorityToPriority(priority?: string | null): TaskPriority {
  if (!priority) return 'medium';
  const priorityMap: Record<string, TaskPriority> = {
    'Urgent': 'urgent',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
    'NoPriority': 'none',
  };
  return priorityMap[priority] || 'medium';
}

/**
 * Map backend task status to frontend task status (legacy fallback)
 */
function mapTaskStatus(progress?: number | null, open?: boolean | null): Task['status'] {
  if (progress === 100) return 'completed';
  if (progress && progress > 0) return 'in-progress';
  if (open === false) return 'blocked';
  return 'not-started';
}

/**
 * Extract task token (ID) from IRI
 * Example: https://pm.example.com/resource/project/demo/task/abc123 -> abc123
 */
function extractTokenFromIri(iri: string): string {
  const parts = iri.split('/');
  return parts[parts.length - 1];
}

/**
 * Convert backend task to frontend task
 */
export function backendTaskToTask(backendTask: BackendTask): Task {
  const taskId = extractTokenFromIri(backendTask.iri);

  return {
    id: taskId,
    title: backendTask.name,
    description: undefined, // Backend doesn't have description in basic schema
    status: mapRdfStateToStatus(backendTask.state, backendTask.progress, backendTask.open),
    itemType: backendTask.type as TaskItemType, // Preserve type: 'project' | 'summary' | 'task'
    priority: mapRdfPriorityToPriority(backendTask.priority),
    assignee: backendTask.assignee || undefined,
    startDate: backendTask.start || undefined,
    endDate: backendTask.end || undefined,
    actualStart: undefined,
    actualEnd: undefined,
    estimatedEffort: undefined,
    actualEffort: undefined,
    dependencies: [], // Will be populated separately from links
    parentId: backendTask.parent ? extractTokenFromIri(backendTask.parent) : undefined,
    createdAt: new Date().toISOString(), // Backend doesn't track this
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Convert frontend task to backend task create (for the Hono backend)
 * Maps frontend field names to backend field names
 */
export function taskToBackendTaskCreate(task: Partial<Task>): Record<string, any> {
  // Calculate progress from status
  let progress: number | undefined = undefined;
  if (task.status === 'completed') progress = 100;
  else if (task.status === 'in-progress') progress = 50;
  else if (task.status === 'not-started') progress = 0;
  else if (task.status === 'blocked') progress = 0;

  // Map frontend status to RDF state
  const stateMap: Record<TaskStatus, string> = {
    'not-started': 'ToDo',
    'in-progress': 'InProgress',
    'completed': 'Completed',
    'blocked': 'Blocked',
  };

  // Map frontend priority to RDF priority
  const priorityMap: Record<TaskPriority, string> = {
    'urgent': 'Urgent',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'none': 'NoPriority',
  };

  const result: Record<string, any> = {};
  
  // Map frontend field names to backend field names
  if (task.title !== undefined) result.text = task.title;
  if (task.description !== undefined) result.description = task.description;
  if (task.startDate !== undefined) result.start_date = task.startDate;
  if (task.endDate !== undefined) result.end_date = task.endDate;
  if (progress !== undefined) result.progress = progress;
  if (task.status !== undefined) result.status = stateMap[task.status];
  if (task.priority !== undefined) result.priority = priorityMap[task.priority];
  if (task.itemType !== undefined) result.type = task.itemType;
  if (task.parentId !== undefined) result.parent_token = task.parentId;
  if (task.assignee !== undefined) result.assignee = task.assignee;

  return result;
}

// ==================== Link/Dependency Mappers ====================

/**
 * Map backend link type to frontend dependency type
 */
function mapLinkType(backendType: BackendLink['type']): DependencyType {
  const typeMap: Record<BackendLink['type'], DependencyType> = {
    'e2s': 'finish-to-start',
    'e2e': 'finish-to-finish',
    's2s': 'start-to-start',
    's2e': 'start-to-finish',
  };
  return typeMap[backendType];
}

/**
 * Map frontend dependency type to backend link type
 */
function mapDependencyType(frontendType: DependencyType): BackendLink['type'] {
  const typeMap: Record<DependencyType, BackendLink['type']> = {
    'finish-to-start': 'e2s',
    'finish-to-finish': 'e2e',
    'start-to-start': 's2s',
    'start-to-finish': 's2e',
  };
  return typeMap[frontendType];
}

/**
 * Convert backend link to frontend dependency
 */
export function backendLinkToDependency(backendLink: BackendLink): Dependency {
  return {
    id: extractTokenFromIri(backendLink.iri),
    predecessorId: extractTokenFromIri(backendLink.source),
    successorId: extractTokenFromIri(backendLink.target),
    linkType: mapLinkType(backendLink.type),
    lagDuration: undefined, // Not in backend schema
  };
}

/**
 * Convert frontend dependency to backend link create
 */
export function dependencyToBackendLinkCreate(
  dependency: Partial<Dependency>,
  projectIri: string
): BackendLinkCreate {
  return {
    project: projectIri,
    source: dependency.predecessorId || '',
    target: dependency.successorId || '',
    type: dependency.linkType ? mapDependencyType(dependency.linkType) : 'e2s',
  };
}

// ==================== Project Mappers ====================

/**
 * Convert backend project to frontend project
 */
export function backendProjectToProject(backendProject: BackendProject): Project {
  return {
    id: extractTokenFromIri(backendProject.iri),
    name: backendProject.name,
    description: backendProject.description || undefined,
    startDate: backendProject.start || undefined,
    endDate: backendProject.end || undefined,
    actualStart: undefined,
    actualEnd: undefined,
    epics: [],
    sprints: [],
    teamMembers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Convert backend project detail to frontend project with tasks and dependencies
 */
export function backendProjectDetailToProject(
  backendProjectDetail: BackendProjectDetail
): {
  project: Project;
  tasks: Task[];
  dependencies: Dependency[];
} {
  const project = backendProjectToProject(backendProjectDetail);
  const tasks = backendProjectDetail.tasks.map(backendTaskToTask);
  const dependencies = backendProjectDetail.links.map(backendLinkToDependency);

  // Populate task dependencies
  tasks.forEach((task) => {
    task.dependencies = dependencies
      .filter((dep) => dep.successorId === task.id)
      .map((dep) => dep.predecessorId);
  });

  return { project, tasks, dependencies };
}
