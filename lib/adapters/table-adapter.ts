/**
 * Data Table Adapter
 * Converts RDF Task data to DataTable format
 */

import { Task as RDFTask } from '@/lib/api/types';
import { Task as TableTask } from '@/app/(dashboard)/issues/data/schema';

/**
 * Map frontend priority to table priority format
 */
function mapPriorityToTableFormat(priority?: RDFTask['priority']): TableTask['priority'] {
  // Map 'urgent' to 'high' since table only has low/medium/high
  const priorityMap: Record<string, TableTask['priority']> = {
    'urgent': 'high',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',
    'none': 'low',
  };
  return priorityMap[priority || 'medium'] || 'medium';
}

/**
 * Convert RDF tasks to data table format
 */
export function tasksToTableFormat(tasks: RDFTask[]): TableTask[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    label: task.parentId ? 'feature' : 'task', // Simple heuristic
    priority: mapPriorityToTableFormat(task.priority),
    progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
    dueDate: task.endDate,
  }));
}

/**
 * Calculate progress percentage based on status
 */
function calculateProgress(status: RDFTask['status']): number {
  const progressMap = {
    'not-started': 0,
    'in-progress': 50,
    'completed': 100,
    'blocked': 25,
  };
  return progressMap[status] || 0;
}
