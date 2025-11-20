/**
 * API Type Definitions
 * These types represent the data structures used in API communication
 * Aligned with the Scrum PM Ontology (sro:) and Project Management Ontology (pm:)
 */

// Task (pm:Task)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedEffort?: string; // ISO 8601 duration
  actualEffort?: string; // ISO 8601 duration
  dependencies?: string[];
  parentId?: string; // Reference to parent UserStory or Epic
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';

// UserStory (sro:UserStory)
export interface UserStory {
  id: string;
  title: string;
  storyText: string;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  priority: number;
  state: StoryState;
  startDate?: string;
  endDate?: string;
  actualStart?: string;
  actualEnd?: string;
  assignee?: string;
  parentEpicId?: string;
  sprintId?: string;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export type StoryState = 'to-do' | 'in-progress' | 'done';

// Epic (sro:Epic)
export interface Epic {
  id: string;
  title: string;
  description?: string;
  priority: number;
  businessValue?: number;
  startDate?: string;
  endDate?: string;
  assignee?: string;
  stories?: UserStory[];
  createdAt: string;
  updatedAt: string;
}

// Sprint (sro:Sprint)
export interface Sprint {
  id: string;
  name: string;
  sprintNumber: number;
  goal?: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  duration: string; // ISO 8601 duration
  projectId: string;
  stories?: UserStory[];
  createdAt: string;
  updatedAt: string;
}

// Team Member (sro:TeamMember with role specializations)
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  projectIds?: string[];
}

export type TeamRole = 'product-owner' | 'scrum-master' | 'developer' | 'qa-engineer';

// Dependency (pm:Dependency)
export interface Dependency {
  id: string;
  predecessorId: string;
  successorId: string;
  linkType: DependencyType;
  lagDuration?: string; // ISO 8601 duration
}

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

// Project (sro:ScrumProject)
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  actualStart?: string;
  actualEnd?: string;
  epics?: Epic[];
  sprints?: Sprint[];
  teamMembers?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedTasks: string[];
  recommendation?: string;
  createdAt: string;
}

export type InsightType =
  | 'risk'
  | 'opportunity'
  | 'conflict'
  | 'optimization'
  | 'prediction';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
