/**
 * Centralized mock data for all task-related components
 * This data is used by: Gantt Chart, Kanban Board, and Data Table
 */

export interface MockTask {
  id: number
  title: string
  start: Date
  end: Date
  duration: number
  progress: number
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  label: 'bug' | 'feature' | 'documentation'
  type: 'task' | 'summary' | 'milestone'
  parent?: number
  assignee?: string
  description?: string
}

/**
 * Mock task data - Single source of truth
 */
export const mockTasks: MockTask[] = [
  // Project Planning Phase
  {
    id: 1,
    title: "Project Planning",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 15),
    duration: 14,
    progress: 100,
    status: 'done',
    priority: 'high',
    label: 'feature',
    type: 'summary',
    assignee: 'Sarah Chen',
    description: 'Complete planning phase for the project'
  },
  {
    id: 2,
    title: "Requirements Analysis",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 8),
    duration: 7,
    progress: 100,
    status: 'done',
    priority: 'high',
    label: 'documentation',
    type: 'task',
    parent: 1,
    assignee: 'Sarah Chen',
    description: 'Gather and document all project requirements'
  },
  {
    id: 3,
    title: "Design Phase",
    start: new Date(2024, 0, 8),
    end: new Date(2024, 0, 15),
    duration: 7,
    progress: 100,
    status: 'done',
    priority: 'high',
    label: 'feature',
    type: 'task',
    parent: 1,
    assignee: 'Mike Johnson',
    description: 'Create UI/UX designs and system architecture'
  },

  // Development Phase
  {
    id: 4,
    title: "Development",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 1, 28),
    duration: 44,
    progress: 60,
    status: 'in-progress',
    priority: 'high',
    label: 'feature',
    type: 'summary',
    assignee: 'Dev Team',
    description: 'Main development phase'
  },
  {
    id: 5,
    title: "Frontend Development",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 1, 15),
    duration: 31,
    progress: 75,
    status: 'in-progress',
    priority: 'high',
    label: 'feature',
    type: 'task',
    parent: 4,
    assignee: 'Alex Kim',
    description: 'Build React components and user interface'
  },
  {
    id: 6,
    title: "Backend Development",
    start: new Date(2024, 0, 22),
    end: new Date(2024, 1, 28),
    duration: 37,
    progress: 50,
    status: 'in-progress',
    priority: 'high',
    label: 'feature',
    type: 'task',
    parent: 4,
    assignee: 'Jamie Lee',
    description: 'Develop API endpoints and database schema'
  },

  // Testing Phase
  {
    id: 7,
    title: "Testing",
    start: new Date(2024, 1, 28),
    end: new Date(2024, 2, 15),
    duration: 16,
    progress: 30,
    status: 'in-progress',
    priority: 'medium',
    label: 'bug',
    type: 'task',
    assignee: 'Taylor Smith',
    description: 'Comprehensive testing and bug fixes'
  },
  {
    id: 8,
    title: "Unit Testing",
    start: new Date(2024, 1, 28),
    end: new Date(2024, 2, 7),
    duration: 8,
    progress: 40,
    status: 'in-progress',
    priority: 'medium',
    label: 'bug',
    type: 'task',
    parent: 7,
    assignee: 'Taylor Smith',
    description: 'Write and execute unit tests'
  },
  {
    id: 9,
    title: "Integration Testing",
    start: new Date(2024, 2, 7),
    end: new Date(2024, 2, 15),
    duration: 8,
    progress: 20,
    status: 'todo',
    priority: 'medium',
    label: 'bug',
    type: 'task',
    parent: 7,
    assignee: 'Chris Park',
    description: 'Test component integration'
  },

  // Deployment Phase
  {
    id: 10,
    title: "Deployment",
    start: new Date(2024, 2, 15),
    end: new Date(2024, 2, 22),
    duration: 7,
    progress: 0,
    status: 'todo',
    priority: 'high',
    label: 'feature',
    type: 'task',
    assignee: 'Jordan Davis',
    description: 'Deploy to production environment'
  },

  // Documentation
  {
    id: 11,
    title: "Documentation",
    start: new Date(2024, 2, 1),
    end: new Date(2024, 2, 20),
    duration: 19,
    progress: 15,
    status: 'todo',
    priority: 'low',
    label: 'documentation',
    type: 'task',
    assignee: 'Morgan White',
    description: 'Create user and developer documentation'
  },

  // Bug Fixes
  {
    id: 12,
    title: "Fix Login Authentication Bug",
    start: new Date(2024, 2, 5),
    end: new Date(2024, 2, 8),
    duration: 3,
    progress: 80,
    status: 'in-progress',
    priority: 'high',
    label: 'bug',
    type: 'task',
    assignee: 'Alex Kim',
    description: 'Resolve authentication token expiration issue'
  },
  {
    id: 13,
    title: "Performance Optimization",
    start: new Date(2024, 2, 10),
    end: new Date(2024, 2, 17),
    duration: 7,
    progress: 0,
    status: 'todo',
    priority: 'medium',
    label: 'feature',
    type: 'task',
    assignee: 'Jamie Lee',
    description: 'Optimize database queries and API response times'
  },
  {
    id: 14,
    title: "Mobile Responsiveness",
    start: new Date(2024, 2, 8),
    end: new Date(2024, 2, 14),
    duration: 6,
    progress: 25,
    status: 'in-progress',
    priority: 'medium',
    label: 'feature',
    type: 'task',
    assignee: 'Alex Kim',
    description: 'Ensure UI works on mobile devices'
  },
]

/**
 * Mock links/dependencies between tasks
 */
export interface MockLink {
  id: number
  source: number
  target: number
  type: 'e2s' | 'e2e' | 's2s' | 's2e'
}

export const mockLinks: MockLink[] = [
  { id: 1, source: 2, target: 3, type: 'e2s' },
  { id: 2, source: 3, target: 5, type: 'e2s' },
  { id: 3, source: 5, target: 6, type: 's2s' },
  { id: 4, source: 6, target: 7, type: 'e2s' },
  { id: 5, source: 8, target: 9, type: 'e2s' },
  { id: 6, source: 7, target: 10, type: 'e2s' },
]
