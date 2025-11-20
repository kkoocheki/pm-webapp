'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GanttChart } from '@/components/gantt-chart';
import { TaskKanbanBoard } from '@/components/kanban-board';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { useAppStore } from '@/lib/stores/app-store';
import { tasksToTableFormat } from '@/lib/adapters/table-adapter';

export default function IssuesPage() {
  const rdfTasks = useAppStore((state) => state.tasks);
  const tasks = tasksToTableFormat(rdfTasks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">
            Manage and track all your project tasks
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

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
              <TaskKanbanBoard />
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
                  <GanttChart />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
