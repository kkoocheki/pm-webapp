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
import { Task, Project, Dependency, DependencyType } from './types';

// ==================== Task Mappers ====================

/**
 * Map backend task status to frontend task status
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
    status: mapTaskStatus(backendTask.progress, backendTask.open),
    assignee: undefined, // Not in backend schema
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
 * Convert frontend task to backend task create
 */
export function taskToBackendTaskCreate(task: Partial<Task>): BackendTaskCreate {
  // Calculate progress from status
  let progress: number | null = null;
  if (task.status === 'completed') progress = 100;
  else if (task.status === 'in-progress') progress = 50;
  else if (task.status === 'not-started') progress = 0;

  return {
    name: task.title || 'Untitled Task',
    type: 'task',
    start: task.startDate || null,
    end: task.endDate || null,
    progress,
    open: task.status !== 'blocked',
    parent: task.parentId || null,
  };
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
