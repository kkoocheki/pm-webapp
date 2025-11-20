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
