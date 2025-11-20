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
    value: "not-started",
    label: "Not Started",
    icon: Circle,
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
  },
  {
    value: "blocked",
    label: "Blocked",
    icon: Circle,
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
