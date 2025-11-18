'use client';

import { Gantt, Willow } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';

interface GanttTask {
  id: number;
  text: string;
  start: Date;
  end: Date;
  duration?: number;
  progress?: number;
  type?: 'task' | 'summary' | 'milestone';
  parent?: number;
}

interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: 'e2s' | 'e2e' | 's2s' | 's2e';
}

interface GanttScale {
  unit: 'year' | 'month' | 'week' | 'day' | 'hour';
  step: number;
  format: string;
}

interface GanttChartProps {
  tasks?: GanttTask[];
  links?: GanttLink[];
  scales?: GanttScale[];
}

// Sample data for demonstration
const defaultTasks: GanttTask[] = [
  {
    id: 1,
    text: 'Project Planning',
    start: new Date(2024, 10, 18),
    end: new Date(2024, 10, 25),
    type: 'summary',
  },
  {
    id: 2,
    text: 'Define requirements',
    start: new Date(2024, 10, 18),
    end: new Date(2024, 10, 20),
    duration: 3,
    progress: 100,
    type: 'task',
    parent: 1,
  },
  {
    id: 3,
    text: 'Create project plan',
    start: new Date(2024, 10, 20),
    end: new Date(2024, 10, 25),
    duration: 5,
    progress: 60,
    type: 'task',
    parent: 1,
  },
  {
    id: 4,
    text: 'Development Phase',
    start: new Date(2024, 10, 25),
    end: new Date(2024, 11, 15),
    type: 'summary',
  },
  {
    id: 5,
    text: 'Setup infrastructure',
    start: new Date(2024, 10, 25),
    end: new Date(2024, 10, 28),
    duration: 3,
    progress: 100,
    type: 'task',
    parent: 4,
  },
  {
    id: 6,
    text: 'Implement API',
    start: new Date(2024, 10, 28),
    end: new Date(2024, 11, 5),
    duration: 7,
    progress: 45,
    type: 'task',
    parent: 4,
  },
  {
    id: 7,
    text: 'Build frontend',
    start: new Date(2024, 11, 5),
    end: new Date(2024, 11, 15),
    duration: 10,
    progress: 20,
    type: 'task',
    parent: 4,
  },
  {
    id: 8,
    text: 'Testing & Deployment',
    start: new Date(2024, 11, 15),
    end: new Date(2024, 11, 20),
    type: 'summary',
  },
  {
    id: 9,
    text: 'QA Testing',
    start: new Date(2024, 11, 15),
    end: new Date(2024, 11, 18),
    duration: 3,
    progress: 0,
    type: 'task',
    parent: 8,
  },
  {
    id: 10,
    text: 'Production deployment',
    start: new Date(2024, 11, 20),
    end: new Date(2024, 11, 20),
    duration: 0,
    progress: 0,
    type: 'milestone',
    parent: 8,
  },
];

const defaultLinks: GanttLink[] = [
  { id: 1, source: 2, target: 3, type: 'e2s' },
  { id: 2, source: 3, target: 5, type: 'e2s' },
  { id: 3, source: 5, target: 6, type: 'e2s' },
  { id: 4, source: 6, target: 7, type: 'e2s' },
  { id: 5, source: 7, target: 9, type: 'e2s' },
  { id: 6, source: 9, target: 10, type: 'e2s' },
];

const defaultScales: GanttScale[] = [
  { unit: 'month', step: 1, format: 'MMMM yyyy' },
  { unit: 'day', step: 1, format: 'd' },
];

export function GanttChart({ tasks, links, scales }: GanttChartProps) {
  const ganttTasks = tasks || defaultTasks;
  const ganttLinks = links || defaultLinks;
  const ganttScales = scales || defaultScales;

  return (
    <Willow>
      <div className="h-[600px] w-full rounded-lg border">
        <Gantt
          tasks={ganttTasks}
          links={ganttLinks}
          scales={ganttScales}
        />
      </div>
    </Willow>
  );
}
