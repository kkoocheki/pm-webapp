'use client';

import { Gantt, Willow } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
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
  const stories = useAppStore((state) => state.stories);
  const tasks = useAppStore((state) => state.tasks);
  const dependencies = useAppStore((state) => state.dependencies);

  const ganttData = storiesAndTasksToGanttFormat(stories, tasks, dependencies);

  return (
    <Willow>
      <div className="h-[600px] w-full rounded-lg border">
        <Gantt
          tasks={ganttData.tasks}
          links={ganttData.links}
          scales={scales}
          columns={columns}
        />
      </div>
    </Willow>
  );
}
