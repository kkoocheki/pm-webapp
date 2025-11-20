'use client';

import { useState, useEffect } from 'react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/kanban';
import { useAppStore } from '@/lib/stores/app-store';
import { tasksToKanbanFormat, taskKanbanColumns } from '@/lib/adapters/kanban-adapter';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function TaskKanbanBoard() {
  const rdfTasks = useAppStore((state) => state.tasks);
  const kanbanTasks = tasksToKanbanFormat(rdfTasks);
  const [tasks, setTasks] = useState(kanbanTasks);

  // Update local state when store changes
  useEffect(() => {
    setTasks(tasksToKanbanFormat(rdfTasks));
  }, [rdfTasks]);

  return (
    <div className="h-[600px]">
      <KanbanProvider
        columns={taskKanbanColumns}
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
                      {task.priority && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: 
                              task.priority === 'high' ? '#EF4444' :
                              task.priority === 'medium' ? '#F59E0B' : '#6B7280',
                            color: 'white',
                          }}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <p className="m-0 text-muted-foreground text-xs">
                        👤 {task.assignee}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      {task.start && task.end && (
                        <p className="m-0 text-muted-foreground text-xs">
                          {dateFormatter.format(task.start)} - {dateFormatter.format(task.end)}
                        </p>
                      )}
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
