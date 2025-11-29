'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GanttChart } from '@/components/gantt-chart';
import { TaskKanbanBoard } from '@/components/kanban-board';
import { getColumns } from './components/columns';
import { DataTable } from './components/data-table';
import { useProjectData, useDeleteTask } from '@/lib/hooks/use-project-data';
import { tasksToTableFormat } from '@/lib/adapters/table-adapter';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import { TaskEditDialog } from '@/components/task-edit-dialog';
import { Task } from '@/lib/api/types';

export default function IssuesPage() {
  // Get tasks directly from React Query cache
  const { data, isLoading } = useProjectData(DEFAULT_PROJECT_SLUG);
  const rdfTasks = data?.tasks || [];
  const tasks = tasksToTableFormat(rdfTasks);
  
  const deleteTaskMutation = useDeleteTask(DEFAULT_PROJECT_SLUG);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handle create new task
  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

  // Handle edit task
  const handleEditTask = useCallback((taskInfo: { id: string; title: string }) => {
    const task = rdfTasks.find((t) => t.id === taskInfo.id);
    if (task) {
      setSelectedTask(task);
      setDialogMode('edit');
      setDialogOpen(true);
    }
  }, [rdfTasks]);

  // Handle delete task
  const handleDeleteTask = useCallback((taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  }, [deleteTaskMutation]);

  // Create columns with edit/delete handlers
  const columns = useMemo(() => getColumns({
    onEdit: handleEditTask,
    onDelete: handleDeleteTask,
  }), [handleEditTask, handleDeleteTask]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">
            Manage and track all your project tasks
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      ) : null}

      <Tabs defaultValue="list" className="w-full" suppressHydrationWarning>
        <TabsList suppressHydrationWarning>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>
                View all tasks in a list format with sorting and filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={tasks} columns={columns} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>
                Drag and drop tasks between status columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskKanbanBoard onCreateTask={handleCreateTask} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
              <CardDescription>
                See tasks on a Gantt chart timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="gantt-cell">
                <div className="gantt-box">
                  <GanttChart showAddButton onCreateTask={handleCreateTask} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        mode={dialogMode}
      />
    </div>
  );
}
