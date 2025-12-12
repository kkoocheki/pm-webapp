/**
 * Mappers to convert between SPARQL results and API types
 */

import type { Task, Link, Project } from '../types';

/**
 * Generate a unique token/slug from a string
 */
export function generateToken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate a unique token with timestamp (legacy - for non-task items)
 */
export function generateUniqueToken(prefix: string = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate project prefix from project name (first 3 letters, uppercase)
 * Examples: "ProjectAlpha" -> "PRO", "Marketing Campaign" -> "MAR"
 */
export function generateProjectPrefix(projectName: string): string {
  // Remove special characters and get letters only
  const letters = projectName.replace(/[^a-zA-Z]/g, '');

  // Take first 3 letters and uppercase
  const prefix = letters.substring(0, 3).toUpperCase();

  // If less than 3 letters, pad with 'X'
  return prefix.padEnd(3, 'X');
}

/**
 * Generate task ID in Jira/Linear style: PREFIX-NUMBER
 * @param projectPrefix - 3-letter project prefix (e.g., "PRO")
 * @param taskNumber - Sequential task number (e.g., 123)
 * @returns Task ID (e.g., "PRO-123")
 */
export function generateTaskId(projectPrefix: string, taskNumber: number): string {
  return `${projectPrefix}-${taskNumber}`;
}

/**
 * Extract token from IRI
 */
export function extractToken(iri: string): string {
  const parts = iri.split(/[/#]/);
  return parts[parts.length - 1];
}

/**
 * Map SPARQL result to Task
 */
export function mapToTask(row: any): Task {
  return {
    token: row.token || extractToken(row.task || row.iri),
    text: row.text || row.title || row.name || 'Untitled Task',
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    duration: row.duration ? parseInt(row.duration) : undefined,
    progress: row.progress ? parseFloat(row.progress) : 0,
    parent_token: row.parent_token,
    type: row.type,
    priority: row.priority,
    status: row.status,
    assignee: row.assignee,
    iri: row.task || row.iri,
  };
}

/**
 * Map SPARQL result to Link
 */
export function mapToLink(row: any): Link {
  return {
    token: row.token || extractToken(row.link || row.iri),
    source_token: row.source_token || extractToken(row.source),
    target_token: row.target_token || extractToken(row.target),
    type: row.type || 'finish_to_start',
    lag: row.lag ? parseInt(row.lag) : 0,
    iri: row.link || row.iri,
  };
}

/**
 * Map SPARQL result to Project
 */
export function mapToProject(row: any): Project {
  return {
    slug: row.slug || extractToken(row.project || row.iri),
    name: row.name || row.title || 'Untitled Project',
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    iri: row.project || row.iri,
  };
}

/**
 * Convert date to ISO string if it's a Date object
 */
export function toISODate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  return new Date(dateStr);
}

/**
 * Calculate duration in days between two dates
 */
export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
