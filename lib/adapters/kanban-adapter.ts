/**
 * Kanban Board Adapter
 * Converts RDF-based data structures to Kanban board format
 */

import { UserStory, Task } from '@/lib/api/types';

export interface KanbanColumn {
  id: string;
  name: string;
}

export interface KanbanItem {
  id: string;
  name: string;
  column: string;
  description?: string;
  assignee?: string;
  storyPoints?: number;
  priority?: string; // low, medium, high
  start?: Date;
  end?: Date;
  progress?: number;
}

/**
 * Kanban columns based on story states
 */
export const storyKanbanColumns: KanbanColumn[] = [
  { id: 'to-do', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'done', name: 'Done' },
];

/**
 * Kanban columns based on task states
 */
export const taskKanbanColumns: KanbanColumn[] = [
  { id: 'not-started', name: 'Not Started' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
  { id: 'blocked', name: 'Blocked' },
];

/**
 * Convert user stories to Kanban items
 */
export function storiesToKanbanFormat(stories: UserStory[]): KanbanItem[] {
  return stories.map((story) => ({
    id: story.id,
    name: story.title,
    column: story.state,
    description: story.storyText,
    assignee: story.assignee,
    storyPoints: story.storyPoints,
    priority: story.priority,
  }));
}

/**
 * Map frontend priority to kanban display format
 */
function mapPriorityToKanban(priority?: Task['priority']): string | undefined {
  const priorityMap: Record<string, string> = {
    'urgent': 'high',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
    'none': 'low',
  };
  return priority ? priorityMap[priority] || 'medium' : undefined;
}

/**
 * Convert tasks to Kanban items
 */
export function tasksToKanbanFormat(tasks: Task[]): KanbanItem[] {
  return tasks.map((task) => ({
    id: task.id,
    name: task.title,
    column: task.status,
    description: task.description,
    assignee: task.assignee,
    priority: mapPriorityToKanban(task.priority),
    start: task.startDate ? new Date(task.startDate) : undefined,
    end: task.endDate ? new Date(task.endDate) : undefined,
    progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
  }));
}

/**
 * Convert Kanban item update back to story update
 */
export function kanbanToStoryUpdate(item: KanbanItem): Partial<UserStory> {
  return {
    state: item.column as 'to-do' | 'in-progress' | 'done',
  };
}

/**
 * Convert Kanban item update back to task update
 */
export function kanbanToTaskUpdate(item: KanbanItem): Partial<Task> {
  return {
    status: item.column as 'not-started' | 'in-progress' | 'completed' | 'blocked',
  };
}
