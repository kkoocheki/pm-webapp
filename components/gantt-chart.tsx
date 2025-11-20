'use client';

import { useEffect, useState, useMemo } from 'react';
import { Gantt, Willow } from '@svar-ui/react-gantt';
import { useAppStore } from '@/lib/stores/app-store';
import { storiesAndTasksToGanttFormat } from '@/lib/adapters/gantt-adapter';

const scales = [
  { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
  { unit: 'day' as const, step: 1, format: 'd' },
];

const columns = [
  { id: 'text', header: 'Task Name', width: 250 },
  { id: 'start', header: 'Start Date', align: 'center' as const, width: 100 },
  { id: 'duration', header: 'Duration', align: 'center' as const, width: 80 },
  { id: 'progress', header: 'Progress', align: 'center' as const, width: 80 },
];

export function GanttChart() {
  const [mounted, setMounted] = useState(false);

  // Subscribe to store changes to get reactive data
  const stories = useAppStore((state) => state.stories);
  const tasks = useAppStore((state) => state.tasks);
  const dependencies = useAppStore((state) => state.dependencies);

  // Convert data to Gantt format - will update when store changes
  const ganttData = useMemo(() => {
    return storiesAndTasksToGanttFormat(stories, tasks, dependencies);
  }, [stories, tasks, dependencies]);

  const handleInit = useMemo(() => (api: any) => {
    api.intercept('scroll-chart', () => {
      return false;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Loading Gantt chart...
      </div>
    );
  }

  return (
    <Willow>
      <Gantt
        tasks={ganttData.tasks}
        links={ganttData.links}
        scales={scales}
        columns={columns}
        init={handleInit}
      />
    </Willow>
  );
}
