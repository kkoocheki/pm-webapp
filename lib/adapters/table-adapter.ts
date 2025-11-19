/**
 * Data Table Adapter
 * Converts RDF Task data to DataTable format
 */

import { Task as RDFTask } from '@/lib/api/types';
import { Task as TableTask } from '../app/(dashboard)/issues/data/schema';

/**
 * Convert RDF tasks to data table format
 */
export function tasksToTableFormat(tasks: RDFTask[]): TableTask[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    label: task.parentId ? 'feature' : 'task', // Simple heuristic
    priority: 'medium', // Default, could be enhanced with priority field
    progress: calculateProgress(task.status),
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
