'use client';

import { useState } from 'react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/kanban';

// Kanban columns
const columns = [
  { id: 'todo', name: 'To Do', color: '#6B7280' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'done', name: 'Done', color: '#10B981' },
];

// Transform Gantt data to Kanban format
const ganttTasks = [
  {
    id: 1,
    text: "Project Planning",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 15),
    progress: 100,
    type: "summary",
  },
  {
    id: 2,
    text: "Requirements Analysis",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 8),
    duration: 7,
    progress: 100,
    parent: 1,
    type: "task",
  },
  {
    id: 3,
    text: "Design Phase",
    start: new Date(2024, 0, 8),
    end: new Date(2024, 0, 15),
    duration: 7,
    progress: 100,
    parent: 1,
    type: "task",
  },
  {
    id: 4,
    text: "Development",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 1, 28),
    progress: 60,
    type: "summary",
  },
  {
    id: 5,
    text: "Frontend Development",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 1, 15),
    duration: 31,
    progress: 75,
    parent: 4,
    type: "task",
  },
  {
    id: 6,
    text: "Backend Development",
    start: new Date(2024, 0, 22),
    end: new Date(2024, 1, 28),
    duration: 37,
    progress: 50,
    parent: 4,
    type: "task",
  },
  {
    id: 7,
    text: "Testing",
    start: new Date(2024, 1, 28),
    end: new Date(2024, 2, 15),
    duration: 16,
    progress: 30,
    type: "task",
  },
  {
    id: 8,
    text: "Deployment",
    start: new Date(2024, 2, 15),
    end: new Date(2024, 2, 22),
    duration: 7,
    progress: 0,
    type: "task",
  },
];

// Helper function to determine column based on progress
const getColumnFromProgress = (progress: number): string => {
  if (progress === 0 || progress <= 30) return 'todo';
  if (progress > 30 && progress < 100) return 'in-progress';
  return 'done';
};

// Transform tasks to Kanban items
const initialKanbanTasks = ganttTasks.map((task) => ({
  id: task.id.toString(),
  name: task.text,
  column: getColumnFromProgress(task.progress),
  progress: task.progress,
  start: task.start,
  end: task.end,
  type: task.type,
}));

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function TaskKanbanBoard() {
  const [tasks, setTasks] = useState(initialKanbanTasks);

  return (
    <div className="h-[600px]">
      <KanbanProvider
        columns={columns}
        data={tasks}
        onDataChange={setTasks}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(task: typeof tasks[number]) => (
                <KanbanCard
                  column={column.id}
                  id={task.id}
                  key={task.id}
                  name={task.name}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="m-0 flex-1 font-medium text-sm">
                        {task.name}
                      </p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: task.type === 'summary' ? '#3B82F6' : '#8B5CF6',
                          color: 'white',
                        }}
                      >
                        {task.type === 'summary' ? 'Summary' : 'Task'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="m-0 text-muted-foreground text-xs">
                        {dateFormatter.format(task.start)} - {dateFormatter.format(task.end)}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
