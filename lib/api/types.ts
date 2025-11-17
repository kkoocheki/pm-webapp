/**
 * API Type Definitions
 * These types represent the data structures used in API communication
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'planned' | 'in-progress' | 'blocked' | 'done';

export interface Project {
  id: string;
  name: string;
  description?: string;
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
