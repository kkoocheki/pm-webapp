import {
  CheckCircle,
  Circle,
  Timer,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bug,
  FileText,
  Layers,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
    icon: Bug,
  },
  {
    value: "feature",
    label: "Feature",
    icon: Layers,
  },
  {
    value: "documentation",
    label: "Documentation",
    icon: FileText,
  },
]

export const statuses = [
  {
    value: "todo",
    label: "To Do",
    icon: Circle,
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
  },
]

export const priorities = [
  {
    value: "low",
    label: "Low",
    icon: ArrowDown,
  },
  {
    value: "medium",
    label: "Medium",
    icon: ArrowRight,
  },
  {
    value: "high",
    label: "High",
    icon: ArrowUp,
  },
]
