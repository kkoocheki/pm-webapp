import { Task } from "./schema"

// Transform Gantt/Kanban data to task table format
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
]

// Helper functions to map data
const getStatusFromProgress = (progress: number): string => {
  if (progress === 0 || progress <= 30) return "todo"
  if (progress > 30 && progress < 100) return "in-progress"
  return "done"
}

const getPriorityFromTask = (task: typeof ganttTasks[number]): string => {
  // Summary tasks are high priority, others based on progress
  if (task.type === "summary") return "high"
  if (task.progress === 0) return "low"
  return "medium"
}

const getLabelFromType = (type: string): string => {
  if (type === "summary") return "feature"
  return "documentation"
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

// Transform to Task format
export const tasks: Task[] = ganttTasks.map((task) => ({
  id: task.id.toString(),
  title: task.text,
  status: getStatusFromProgress(task.progress),
  label: getLabelFromType(task.type),
  priority: getPriorityFromTask(task),
  dueDate: formatDate(task.end || task.start),
  progress: task.progress,
}))
