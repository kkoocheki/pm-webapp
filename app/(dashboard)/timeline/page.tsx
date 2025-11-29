'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Plus } from 'lucide-react';
import { GanttChart } from '@/components/gantt-chart';
import { TaskEditDialog } from '@/components/task-edit-dialog';

export default function TimelinePage() {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle create new task
  const handleCreateTask = useCallback(() => {
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">
            Visualize project schedule with Gantt chart
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Gantt Chart</h2>
          <p className="text-sm text-muted-foreground">
            Interactive timeline showing task schedules and dependencies. Drag tasks to reschedule, resize to change duration.
          </p>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="gantt-cell">
            <div className="gantt-box">
              <GanttChart onCreateTask={handleCreateTask} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Create Dialog */}
      <TaskEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={null}
        mode="create"
      />
    </div>
  );
}
