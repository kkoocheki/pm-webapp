/**
 * Gantt Chart Adapter
 * Converts RDF-based data structures to Gantt chart format
 */

import { Task, UserStory, Epic, Dependency } from '@/lib/api/types';

export interface GanttTask {
  id: number;
  text: string;
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  type: 'task' | 'summary' | 'milestone';
  parent?: number;
}

export interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: 'e2s' | 's2s' | 'e2e' | 's2e'; // end-to-start, start-to-start, end-to-end, start-to-end
}

export interface GanttData {
  tasks: GanttTask[];
  links: GanttLink[];
}

/**
 * Map task itemType to Gantt display type
 * 'project' (Epic) -> 'summary' (displayed as summary/parent row)
 * 'summary' (UserStory) -> 'summary' (displayed as summary/parent row)
 * 'task' (Task) -> 'task' (displayed as regular task bar)
 */
function mapItemTypeToGanttType(itemType?: Task['itemType']): GanttTask['type'] {
  if (itemType === 'project' || itemType === 'summary') {
    return 'summary';
  }
  return 'task';
}

/**
 * Convert stories and tasks to Gantt format
 * Uses itemType to determine display: 'project'/'summary' -> summary rows, 'task' -> task bars
 */
export function storiesAndTasksToGanttFormat(
  stories: UserStory[],
  tasks: Task[],
  dependencies: Dependency[]
): GanttData {
  const ganttTasks: GanttTask[] = [];
  const ganttLinks: GanttLink[] = [];

  // Map to track original IDs to Gantt numeric IDs
  const idMap = new Map<string, number>();
  let nextId = 1;

  // Add stories as summary tasks (legacy support)
  stories.forEach((story) => {
    const storyId = nextId++;
    idMap.set(story.id, storyId);

    ganttTasks.push({
      id: storyId,
      text: story.title,
      start: story.actualStart ? new Date(story.actualStart) : new Date(story.startDate || Date.now()),
      end: story.actualEnd ? new Date(story.actualEnd) : new Date(story.endDate || Date.now()),
      duration: calculateDuration(
        story.actualStart || story.startDate,
        story.actualEnd || story.endDate
      ),
      progress: story.state === 'done' ? 100 : story.state === 'in-progress' ? 50 : 0,
      type: 'summary',
    });
  });

  // Process tasks - first pass: assign IDs to all items (in order: project/epics first, then summary/stories, then tasks)
  // Sort by itemType to ensure parents are processed before children
  const sortedTasks = [...tasks].sort((a, b) => {
    const order = { 'project': 0, 'summary': 1, 'task': 2 };
    const aOrder = order[a.itemType || 'task'] ?? 2;
    const bOrder = order[b.itemType || 'task'] ?? 2;
    return aOrder - bOrder;
  });

  // Assign numeric IDs first
  sortedTasks.forEach((task) => {
    const taskId = nextId++;
    idMap.set(task.id, taskId);
  });

  // Second pass: create Gantt tasks with parent references
  sortedTasks.forEach((task) => {
    const taskNumericId = idMap.get(task.id)!;
    const parentGanttId = task.parentId ? idMap.get(task.parentId) : undefined;

    ganttTasks.push({
      id: taskNumericId,
      text: task.title,
      start: task.actualStart ? new Date(task.actualStart) : new Date(task.startDate || Date.now()),
      end: task.actualEnd ? new Date(task.actualEnd) : new Date(task.endDate || Date.now()),
      duration: calculateDuration(
        task.actualStart || task.startDate,
        task.actualEnd || task.endDate
      ),
      progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
      type: mapItemTypeToGanttType(task.itemType),
      parent: parentGanttId,
    });
  });

  // Convert dependencies to links
  let linkId = 1;
  dependencies.forEach((dep) => {
    const sourceId = idMap.get(dep.predecessorId);
    const targetId = idMap.get(dep.successorId);

    if (sourceId && targetId) {
      ganttLinks.push({
        id: linkId++,
        source: sourceId,
        target: targetId,
        type: dependencyTypeToGanttType(dep.linkType),
      });
    }
  });

  return {
    tasks: ganttTasks,
    links: ganttLinks,
  };
}

/**
 * Convert epics to Gantt format (simplified view)
 */
export function epicsToGanttFormat(epics: Epic[]): GanttData {
  const ganttTasks: GanttTask[] = epics.map((epic, index) => ({
    id: index + 1,
    text: epic.title,
    start: new Date(epic.startDate || Date.now()),
    end: new Date(epic.endDate || Date.now()),
    duration: calculateDuration(epic.startDate, epic.endDate),
    progress: 0, // Would need to calculate from child stories
    type: 'summary',
  }));

  return {
    tasks: ganttTasks,
    links: [],
  };
}

/**
 * Calculate duration in days between two dates
 */
function calculateDuration(start?: string, end?: string): number {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
}

/**
 * Convert RDF dependency type to Gantt link type
 */
function dependencyTypeToGanttType(
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
): 'e2s' | 's2s' | 'e2e' | 's2e' {
  const typeMap = {
    'finish-to-start': 'e2s' as const,
    'start-to-start': 's2s' as const,
    'finish-to-finish': 'e2e' as const,
    'start-to-finish': 's2e' as const,
  };
  return typeMap[type];
}
