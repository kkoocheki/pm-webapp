'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Gantt, Willow, ContextMenu, Editor, Toolbar } from '@svar-ui/react-gantt';
import type { IColumnConfig } from '@svar-ui/react-gantt';
import { useProjectData, useUpdateTask, useCreateTask, useDeleteTask } from '@/lib/hooks/use-project-data';
import { storiesAndTasksToGanttFormat } from '@/lib/adapters/gantt-adapter';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import { TaskStatus } from '@/lib/api/types';
// Styles: using style.css in app/layout.tsx

const scales = [
  { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
  { unit: 'day' as const, step: 1, format: 'd' },
];

const columns: IColumnConfig[] = [
  { id: 'text', header: 'Task Name', width: 250, flexgrow: 1 },
  { id: 'start', header: 'Start Date', align: 'center' as const, width: 120 },
  { id: 'end', header: 'End Date', align: 'center' as const, width: 120 },
  { id: 'duration', header: 'Duration', align: 'center' as const, width: 80 },
  { id: 'progress', header: 'Progress', align: 'center' as const, width: 80 },
];

const taskTypes = [
  { id: 'task', label: 'Task' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'summary', label: 'Summary task' },
  { id: 'project', label: 'Project' },
];

// Empty array constant to avoid recreating on every render
const EMPTY_STORIES: any[] = [];
const EMPTY_TASKS: any[] = [];
const EMPTY_DEPENDENCIES: any[] = [];

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Map Gantt progress to frontend TaskStatus
function progressToStatus(progress: number): TaskStatus {
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'not-started';
}

interface GanttChartProps {
  showAddButton?: boolean;
  onCreateTask?: () => void;
}

export function GanttChart({ showAddButton = false, onCreateTask }: GanttChartProps) {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<any>(null);
  
  // Track if we're syncing to prevent loops
  const isSyncingRef = useRef(false);
  
  // Mutations
  const updateTaskMutation = useUpdateTask(DEFAULT_PROJECT_SLUG);
  const createTaskMutation = useCreateTask(DEFAULT_PROJECT_SLUG);
  const deleteTaskMutation = useDeleteTask(DEFAULT_PROJECT_SLUG);
  
  // Store mutations in refs to avoid re-creating event handlers
  const mutationsRef = useRef({ updateTaskMutation, createTaskMutation, deleteTaskMutation });
  mutationsRef.current = { updateTaskMutation, createTaskMutation, deleteTaskMutation };

  // Get data directly from React Query cache
  const { data } = useProjectData(DEFAULT_PROJECT_SLUG);
  const tasks = data?.tasks || EMPTY_TASKS;
  const dependencies = data?.dependencies || EMPTY_DEPENDENCIES;

  // Convert data to Gantt format - will update when React Query data changes
  const ganttData = useMemo(() => {
    console.log('[Gantt] Converting tasks to Gantt format:', tasks.length, 'tasks');
    const result = storiesAndTasksToGanttFormat(EMPTY_STORIES, tasks, dependencies);
    console.log('[Gantt] Converted to:', result.tasks.length, 'gantt tasks');
    return result;
  }, [tasks, dependencies]);

  // Initialize API with event handlers
  const initGantt = useCallback((ganttApi: any) => {
    console.log('[Gantt] initGantt called, setting API');
    setApi(ganttApi);
    
    // Listen for show-editor to debug
    ganttApi.on('show-editor', ({ id }: { id: string }) => {
      console.log('[Gantt] show-editor event for task:', id);
    });
    
    // Show editor when adding a task
    ganttApi.on('add-task', ({ id }: { id: string }) => {
      console.log('[Gantt] add-task event:', id);
      ganttApi.exec('show-editor', { id });
      
      // Sync to backend
      if (!isSyncingRef.current) {
        isSyncingRef.current = true;
        const task = ganttApi.getTask(id);
        if (task) {
          mutationsRef.current.createTaskMutation.mutate({
            title: task.text || 'New Task',
            startDate: formatDate(task.start),
            endDate: formatDate(task.end),
            status: progressToStatus(task.progress || 0),
          }, {
            onSettled: () => {
              isSyncingRef.current = false;
            }
          });
        } else {
          isSyncingRef.current = false;
        }
      }
    });
    
    // Sync updates to backend
    ganttApi.on('update-task', ({ id, task: updatedFields }: { id: string; task: any }) => {
      console.log('[Gantt] update-task event:', id, updatedFields);
      
      if (!isSyncingRef.current) {
        isSyncingRef.current = true;
        const fullTask = ganttApi.getTask(id);
        
        mutationsRef.current.updateTaskMutation.mutate({
          taskId: id,
          updates: {
            title: fullTask?.text || updatedFields?.text,
            startDate: formatDate(fullTask?.start || updatedFields?.start),
            endDate: formatDate(fullTask?.end || updatedFields?.end),
            status: progressToStatus(fullTask?.progress ?? updatedFields?.progress ?? 0),
          }
        }, {
          onSettled: () => {
            isSyncingRef.current = false;
          }
        });
      }
    });
    
    // Sync deletes to backend
    ganttApi.on('delete-task', ({ id }: { id: string }) => {
      console.log('[Gantt] delete-task event:', id);
      
      if (!isSyncingRef.current) {
        isSyncingRef.current = true;
        mutationsRef.current.deleteTaskMutation.mutate(id, {
          onSettled: () => {
            isSyncingRef.current = false;
          }
        });
      }
    });
  }, []); // Empty deps - only create once

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Loading Gantt chart...
      </div>
    );
  }

  // Component structure following SVAR docs:
  // <Willow> for theming
  //   <Toolbar api={api} /> - horizontal toolbar with action buttons
  //   <ContextMenu api={api}> - right-click context menu wrapper
  //     <Gantt ... /> - main gantt chart
  //   </ContextMenu>
  //   <Editor api={api} /> - sidebar/modal editor for task details
  // </Willow>
  return (
    <Willow>
      <Toolbar api={api} />
      <ContextMenu api={api}>
        <div style={{ height: '550px' }}>
          <Gantt
            tasks={ganttData.tasks}
            links={ganttData.links}
            scales={scales}
            columns={columns}
            taskTypes={taskTypes}
            cellHeight={44}
            init={initGantt}
          />
        </div>
      </ContextMenu>
      {api && <Editor api={api} />}
    </Willow>
  );
}
