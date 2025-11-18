'use client'

import { Gantt, Willow } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/style.css";

// Define data outside component to ensure stable references
const ganttData = {
  tasks: [
    {
      id: 1,
      text: "Project Planning",
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 15),
      progress: 100,
      type: "summary",
      open: true,
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
      open: true,
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
  ],
  links: [
    { id: 1, source: 2, target: 3, type: "e2s" },
    { id: 2, source: 3, target: 5, type: "e2s" },
    { id: 3, source: 5, target: 6, type: "s2s" },
    { id: 4, source: 6, target: 7, type: "e2s" },
    { id: 5, source: 7, target: 8, type: "e2s" },
  ],
  scales: [
    { unit: "month" as const, step: 1, format: "MMMM yyyy" },
    { unit: "day" as const, step: 1, format: "d" },
  ],
  columns: [
    { id: "text", header: "Task Name", width: 250 },
    { id: "start", header: "Start Date", align: "center" as const, width: 100 },
    { id: "duration", header: "Duration", align: "center" as const, width: 80 },
    { id: "progress", header: "Progress", align: "center" as const, width: 80 },
  ],
};

export function GanttChart() {
  return (
    <Willow>
      <div style={{ height: "600px" }}>
        <Gantt
          tasks={ganttData.tasks}
          links={ganttData.links}
          scales={ganttData.scales}
          columns={ganttData.columns}
        />
      </div>
    </Willow>
  );
}
