/**
 * Backend API Type Definitions
 * These types match the FastAPI backend schemas from PM_APP
 */

// Project types
export interface BackendProject {
  iri: string;
  name: string;
  description?: string | null;
  start?: string | null; // ISO date string
  end?: string | null; // ISO date string
  external_id?: string | null;
}

export interface BackendProjectCreate {
  iri?: string | null;
  name: string;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  external_id?: string | null;
}

// Task types
export type BackendTaskType = 'project' | 'summary' | 'task';

export interface BackendTask {
  iri: string;
  project: string; // IRI
  parent?: string | null; // IRI
  type: BackendTaskType;
  name: string;
  start?: string | null; // ISO date string
  end?: string | null; // ISO date string
  progress?: number | null; // 0-100
  open?: boolean | null;
  external_id?: string | null;
}

export interface BackendTaskCreate {
  iri?: string | null;
  project?: string | null;
  parent?: string | null;
  type?: BackendTaskType;
  name: string;
  start?: string | null;
  end?: string | null;
  progress?: number | null;
  open?: boolean | null;
  external_id?: string | null;
}

// Link/Dependency types
export type BackendLinkType = 'e2s' | 'e2e' | 's2s' | 's2e';

export interface BackendLink {
  iri: string;
  project: string; // IRI
  source: string; // IRI
  target: string; // IRI
  type: BackendLinkType;
}

export interface BackendLinkCreate {
  iri?: string | null;
  project?: string | null;
  source: string;
  target: string;
  type?: BackendLinkType;
}

// Project detail with tasks and links
export interface BackendProjectDetail extends BackendProject {
  tasks: BackendTask[];
  links: BackendLink[];
}

// Import result
export interface BackendImportResult {
  project_name: string;
  project_slug: string;
  project_iri: string;
  tasks_created: number;
  dependencies_created: number;
  sprints_created: number;
}

// Analytics types
export interface CriticalPathResult {
  critical_path: CriticalPathTask[];
  total_duration: number;
  project_start: string;
  project_end: string;
}

export interface CriticalPathTask {
  iri: string;
  name: string;
  early_start: number;
  early_finish: number;
  late_start: number;
  late_finish: number;
  total_float: number;
  is_critical: boolean;
  duration: number;
}

// Reasoning types
export type ReasonerType = 'rdfs' | 'owl_dl' | 'owl_full' | 'jena_rules' | 'combined';

export interface ReasoningRequest {
  project_slug: string;
  reasoner_type?: ReasonerType;
  include_inferred_only?: boolean;
}

export interface ReasoningResponse {
  project: string;
  reasoner_type: string;
  total_triples: number;
  inferred_triples: number;
  done_stories: string[];
  critical_tasks: string[];
  blocked_tasks: BlockedTaskInfo[];
  success: boolean;
}

export interface BlockedTaskInfo {
  task: string;
  blocker: string;
}

export interface UserStoryStatus {
  iri: string;
  name?: string | null;
  is_done: boolean;
  story_points?: number | null;
  has_technical_debt?: boolean | null;
}

export interface TaskStatus {
  iri: string;
  name?: string | null;
  is_critical: boolean;
  is_blocked: boolean;
  blocked_by: string[];
  total_float?: number | null;
}

export interface SprintMetrics {
  iri: string;
  name?: string | null;
  completed_story_points?: number | null;
  goal_achieved?: boolean | null;
  is_at_risk?: boolean | null;
  has_blocked_critical_tasks?: boolean | null;
}

export interface InferenceRule {
  name: string;
  description: string;
  example?: string | null;
}

export interface OntologyValidation {
  project: string;
  valid: boolean;
  errors: string[];
  error_count: number;
}

export interface ReasoningHealth {
  status: string;
  ontology_loaded: boolean;
  rules_loaded: boolean;
  error?: string;
}

// Jira Integration types
export interface JiraConfig {
  url: string;
  email: string;
  api_token: string;
  project_key?: string;
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

export interface JiraProject {
  key: string;
  name: string;
  description?: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  issue_type: string;
  status: string;
  assignee?: string;
  priority?: string;
  created: string;
  updated: string;
  story_points?: number;
}

// GitHub Integration types (placeholder)
export interface GitHubImportRequest {
  repository: string;
  access_token: string;
  project_name?: string;
  include_issues?: boolean;
  include_pull_requests?: boolean;
}

// Asana Integration types (placeholder)
export interface AsanaImportRequest {
  workspace_id: string;
  project_id: string;
  access_token: string;
  project_name?: string;
}

