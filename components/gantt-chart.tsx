'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Gantt, Willow, ContextMenu, Editor, Toolbar } from '@svar-ui/react-gantt';
import type { IColumnConfig } from '@svar-ui/react-gantt';
import { useTheme } from 'next-themes';
import { useProjectData, useUpdateTask, useCreateTask, useDeleteTask } from '@/lib/hooks/use-project-data';
import { storiesAndTasksToGanttFormat } from '@/lib/adapters/gantt-adapter';
import { useUIStore } from '@/lib/stores/app-store';
import { TaskStatus } from '@/lib/api/types';
// Styles: using style.css in app/layout.tsx

const scales = [
  { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
  { unit: 'day' as const, step: 1, format: 'd' },
];

const columns: IColumnConfig[] = [
  { id: 'id', header: 'ID', width: 100 },
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
  const { theme, resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current project from Zustand store
  const currentProjectSlug = useUIStore((state) => state.currentProjectSlug);

  // Track if we're syncing to prevent loops
  const isSyncingRef = useRef(false);

  // Store pending changes from editor
  const pendingEditorChangesRef = useRef<{ id: string; changes: any } | null>(null);

  // Mutations
  const updateTaskMutation = useUpdateTask(currentProjectSlug);
  const createTaskMutation = useCreateTask(currentProjectSlug);
  const deleteTaskMutation = useDeleteTask(currentProjectSlug);

  // Store mutations in refs to avoid re-creating event handlers
  const mutationsRef = useRef({ updateTaskMutation, createTaskMutation, deleteTaskMutation });
  mutationsRef.current = { updateTaskMutation, createTaskMutation, deleteTaskMutation };

  // Get data directly from React Query cache
  const { data, isLoading } = useProjectData(currentProjectSlug);
  const tasks = data?.tasks || EMPTY_TASKS;
  const dependencies = data?.dependencies || EMPTY_DEPENDENCIES;

  // Debug logging
  useEffect(() => {
    console.log('[GanttChart] Data update:', {
      isLoading,
      tasksCount: tasks.length,
      tasks: tasks,
      dependencies: dependencies.length
    });
  }, [isLoading, tasks, dependencies]);

  // Convert data to Gantt format - will update when React Query data changes
  const ganttData = useMemo(() => {
    console.log('[Gantt] Converting tasks to Gantt format:', tasks.length, 'tasks');
    console.log('[Gantt] Input tasks:', tasks);
    const result = storiesAndTasksToGanttFormat(EMPTY_STORIES, tasks, dependencies);
    console.log('[Gantt] Converted to:', result.tasks.length, 'gantt tasks');
    console.log('[Gantt] Output gantt tasks:', result.tasks);
    console.log('[Gantt] Links:', result.links);

    // Check for tasks without dates
    const tasksWithoutDates = tasks.filter(t => !t.startDate || !t.endDate);
    if (tasksWithoutDates.length > 0) {
      console.warn('[Gantt] Tasks without dates:', tasksWithoutDates.length, tasksWithoutDates);
    }

    // Check parent-child relationships
    const tasksWithParents = result.tasks.filter(t => t.parent);
    if (tasksWithParents.length > 0) {
      console.log('[Gantt] Tasks with parents (nested):', tasksWithParents.length);
    }

    return result;
  }, [tasks, dependencies]);

  // Initialize API with event handlers
  const initGantt = useCallback((ganttApi: any) => {
    console.log('[Gantt] initGantt called, setting API');
    setApi(ganttApi);
    
    // Listen for show-editor to debug
    ganttApi.on('show-editor', ({ id }: { id: string }) => {
      console.log('[Gantt] show-editor event for task:', id);
      // Clear any pending changes when opening editor
      pendingEditorChangesRef.current = null;
    });

    // Listen for editor close to save changes
    ganttApi.on('hide-editor', ({ id }: { id: string }) => {
      console.log('[Gantt] hide-editor event for task:', id);

      // Save any pending changes when editor closes
      if (pendingEditorChangesRef.current && !isSyncingRef.current) {
        isSyncingRef.current = true;
        const { id: taskId, changes } = pendingEditorChangesRef.current;
        const fullTask = ganttApi.getTask(taskId);

        console.log('[Gantt] Saving pending changes on editor close:', taskId, changes);

        mutationsRef.current.updateTaskMutation.mutate({
          taskId,
          updates: {
            title: fullTask?.text || changes?.text,
            startDate: formatDate(fullTask?.start || changes?.start),
            endDate: formatDate(fullTask?.end || changes?.end),
            status: progressToStatus(fullTask?.progress ?? changes?.progress ?? 0),
          }
        }, {
          onSettled: () => {
            isSyncingRef.current = false;
            pendingEditorChangesRef.current = null;
          }
        });
      }
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
    
    // Track updates but don't save immediately - wait for editor close
    ganttApi.on('update-task', ({ id, task: updatedFields }: { id: string; task: any }) => {
      console.log('[Gantt] update-task event:', id, updatedFields);

      // Store pending changes instead of immediately syncing
      pendingEditorChangesRef.current = {
        id,
        changes: updatedFields
      };
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
    // Wait for theme to be resolved before mounting
    if (resolvedTheme) {
      setMounted(true);
    }
  }, [resolvedTheme]);

  // Determine which theme to use (system theme takes precedence)
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  // Don't render until:
  // 1. Component is mounted (client-side only)
  // 2. Theme is resolved (prevents flash of wrong theme)
  // 3. Data is loaded
  if (!mounted || !resolvedTheme || isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Loading Gantt chart...
      </div>
    );
  }

  // Component structure following SVAR docs best practices
  return (
    <div ref={containerRef} className="gantt-container">
      <Willow theme={isDark ? 'WillowDark' : 'Willow'} key={isDark ? 'dark' : 'light'}>
        <Toolbar api={api} />
        <ContextMenu api={api}>
          <Gantt
            tasks={ganttData.tasks}
            links={ganttData.links}
            scales={scales}
            columns={columns}
            taskTypes={taskTypes}
            cellHeight={44}
            init={initGantt}
          />
        </ContextMenu>
        {api && <Editor api={api} />}
      </Willow>
    </div>
  );
}
