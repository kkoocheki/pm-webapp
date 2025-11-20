/**
 * Server-side types for the TypeScript backend
 * These match the backend-types.ts in lib/api/
 */

// Prefixes for RDF ontologies
export const PREFIXES = {
  pm: 'http://www.example.org/pm#',
  sro: 'http://www.example.org/sro#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  owl: 'http://www.w3.org/2002/07/owl#',
};

export const PREFIX_STRING = `
PREFIX pm: <${PREFIXES.pm}>
PREFIX sro: <${PREFIXES.sro}>
PREFIX rdf: <${PREFIXES.rdf}>
PREFIX rdfs: <${PREFIXES.rdfs}>
PREFIX xsd: <${PREFIXES.xsd}>
PREFIX owl: <${PREFIXES.owl}>
`;

// Project types
export interface Project {
  slug: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  iri?: string;
}

// Task types
export interface Task {
  token: string;
  text: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  progress?: number;
  parent_token?: string;
  type?: string;
  priority?: string;
  status?: string;
  assignee?: string;
  iri?: string;
}

// Link/Dependency types
export interface Link {
  token: string;
  source_token: string;
  target_token: string;
  type?: string;
  lag?: number;
  iri?: string;
}

// Full project data
export interface ProjectData {
  project: Project;
  tasks: Task[];
  links: Link[];
}

// Import result types
export interface ImportResult {
  project_slug: string;
  project_iri: string;
  tasks_created: number;
  dependencies_created: number;
  user_stories_created: number;
  sprints_created: number;
  message: string;
}

// Jira types
export interface JiraProject {
  key: string;
  name: string;
  description?: string;
}

export interface JiraImportRequest {
  jira_url: string;
  email: string;
  api_token: string;
  project_key: string;
  project_name?: string;
  include_subtasks?: boolean;
  include_epics?: boolean;
}

export interface JiraImportResult {
  project_name: string;
  project_slug: string;
  project_iri: string;
  issues_imported: number;
  epics_created: number;
  stories_created: number;
  tasks_created: number;
  subtasks_created: number;
  dependencies_created: number;
  sprints_created: number;
  users_imported: number;
}

// Analytics types
export interface CriticalPathAnalysis {
  critical_path: string[];
  critical_path_duration: number;
  task_timing: TaskTiming[];
  has_cycles: boolean;
}

export interface TaskTiming {
  task_token: string;
  task_name: string;
  duration: number;
  early_start: number;
  early_finish: number;
  late_start: number;
  late_finish: number;
  total_float: number;
  is_critical: boolean;
}

// Reasoning types
export interface ReasoningRequest {
  project_slug: string;
  apply_rules?: boolean;
  validate_ontology?: boolean;
}

export interface TaskStatusResult {
  critical_tasks: TaskInfo[];
  blocked_tasks: TaskInfo[];
  at_risk_tasks: TaskInfo[];
  total_tasks: number;
  critical_count: number;
  blocked_count: number;
  at_risk_count: number;
}

export interface TaskInfo {
  token: string;
  text: string;
  status?: string;
  reason?: string;
  dependencies?: string[];
}

export interface UserStoryStatusResult {
  done_stories: number;
  in_progress_stories: number;
  todo_stories: number;
  total_stories: number;
  stories: UserStoryInfo[];
}

export interface UserStoryInfo {
  iri: string;
  title: string;
  status: string;
  tasks_total: number;
  tasks_completed: number;
  completion_percentage: number;
}

export interface InferenceRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  conclusion: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}
