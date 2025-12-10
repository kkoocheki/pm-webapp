/**
 * CSV Parser for Linear and Jira formats
 */

import { generateToken } from './mappers';
import { PREFIXES, PREFIX_STRING } from '../types';

export interface LinearCSVRow {
  ID: string;
  Team: string;
  Title: string;
  Description: string;
  Status: string;
  Estimate: string;
  Priority: string;
  'Project ID': string;
  Project: string;
  Creator: string;
  Assignee: string;
  Labels: string;
  'Cycle Number': string;
  'Cycle Name': string;
  'Cycle Start': string;
  'Cycle End': string;
  Created: string;
  Updated: string;
  Started: string;
  Triaged: string;
  Completed: string;
  Canceled: string;
  Archived: string;
  'Due Date': string;
  'Parent issue': string;
  Initiatives: string;
  'Project Milestone ID': string;
  'Project Milestone': string;
  'SLA Status': string;
  UUID: string;
}

export interface JiraCSVRow {
  Summary: string;
  'Issue key': string;
  'Issue id': string;
  'Issue Type': string;
  Status: string;
  'Project key': string;
  'Project name': string;
  Priority: string;
  Assignee: string;
  Created: string;
  Updated: string;
  Description: string;
  Sprint: string;
  Parent: string;
  'Parent key': string;
  [key: string]: string; // Allow additional custom fields
}

/**
 * Parse CSV content into array of objects
 */
function parseCSV<T = any>(csvContent: string): T[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse rows
  const rows: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as T);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quotes properly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Convert Linear CSV to SPARQL triples
 */
export function linearCSVToTriples(csvContent: string, projectName: string): {
  triples: string[];
  projectSlug: string;
  projectIRI: string;
  stats: { tasks: number; epics: number; stories: number; sprints: Set<string> };
} {
  const rows = parseCSV<LinearCSVRow>(csvContent);
  const projectSlug = generateToken(projectName);
  const projectIRI = `${PREFIXES.pm}Project/${projectSlug}`;
  const triples: string[] = [];

  let tasksCount = 0;
  let epicsCount = 0;
  let storiesCount = 0;
  const sprints = new Set<string>();

  // Create project
  const projectNameEscaped = projectName.replace(/"/g, '\\"');
  triples.push(`<${projectIRI}> a pm:Project`);
  triples.push(`<${projectIRI}> pm:slug "${projectSlug}"`);
  triples.push(`<${projectIRI}> pm:name "${projectNameEscaped}"`);

  for (const row of rows) {
    const token = generateToken(row.ID || row.Title);
    const taskIRI = `${PREFIXES.pm}Task/${token}`;

    // Determine if this is an Epic or User Story based on parent
    const isEpic = !row['Parent issue'];
    const isStory = !!row['Parent issue'];

    if (isEpic) epicsCount++;
    if (isStory) storiesCount++;
    tasksCount++;

    // Basic task properties
    triples.push(`<${taskIRI}> a pm:Task`);
    if (isEpic) triples.push(`<${taskIRI}> a sro:Epic`);
    if (isStory) triples.push(`<${taskIRI}> a sro:UserStory`);

    triples.push(`<${taskIRI}> pm:token "${token}"`);
    triples.push(`<${taskIRI}> pm:title "${row.Title.replace(/"/g, '\\"')}"`);
    triples.push(`<${taskIRI}> pm:belongsToProject <${projectIRI}>`);

    if (row.Description) {
      triples.push(`<${taskIRI}> pm:description "${row.Description.replace(/"/g, '\\"')}"`);
    }

    if (row.Status) {
      // Map Linear status to SRO status
      let sroStatus = 'sro:ToDo';
      if (row.Status === 'Completed') sroStatus = 'sro:Done';
      else if (row.Status === 'In Progress') sroStatus = 'sro:InProgress';
      else if (row.Status === 'In Review') sroStatus = 'sro:InReview';
      else if (row.Status === 'Canceled' || row.Status === 'Cancelled') sroStatus = 'sro:Cancelled';

      triples.push(`<${taskIRI}> sro:hasState ${sroStatus}`);
      triples.push(`<${taskIRI}> pm:status "${row.Status}"`);
    }

    if (row.Priority) {
      triples.push(`<${taskIRI}> pm:priority "${row.Priority}"`);
    }

    if (row.Assignee) {
      triples.push(`<${taskIRI}> pm:assignedTo "${row.Assignee}"`);
    }

    if (row.Estimate) {
      triples.push(`<${taskIRI}> sro:storyPoints ${row.Estimate}`);
    }

    // Sprint/Cycle information
    if (row['Cycle Name']) {
      const sprintToken = generateToken(row['Cycle Name']);
      const sprintIRI = `${PREFIXES.pm}Sprint/${sprintToken}`;
      sprints.add(row['Cycle Name']);

      triples.push(`<${taskIRI}> sro:assignedToSprint <${sprintIRI}>`);

      // Create sprint if needed
      triples.push(`<${sprintIRI}> a sro:Sprint`);
      triples.push(`<${sprintIRI}> pm:name "${row['Cycle Name'].replace(/"/g, '\\"')}"`);
      if (row['Cycle Number']) {
        triples.push(`<${sprintIRI}> sro:sprintNumber ${row['Cycle Number']}`);
      }
      if (row['Cycle Start']) {
        triples.push(`<${sprintIRI}> sro:startDate "${convertLinearDate(row['Cycle Start'])}"`);
      }
      if (row['Cycle End']) {
        triples.push(`<${sprintIRI}> sro:endDate "${convertLinearDate(row['Cycle End'])}"`);
      }
    }

    // Parent relationship (Epic -> Story)
    if (row['Parent issue']) {
      const parentToken = generateToken(row['Parent issue']);
      const parentIRI = `${PREFIXES.pm}Task/${parentToken}`;
      triples.push(`<${taskIRI}> sro:partOfEpic <${parentIRI}>`);
    }

    // Dates
    if (row.Created) {
      triples.push(`<${taskIRI}> pm:createdAt "${convertLinearDate(row.Created)}"`);
    }
    if (row.Updated) {
      triples.push(`<${taskIRI}> pm:updatedAt "${convertLinearDate(row.Updated)}"`);
    }
    if (row.Completed) {
      triples.push(`<${taskIRI}> pm:completedAt "${convertLinearDate(row.Completed)}"`);
    }
  }

  return {
    triples,
    projectSlug,
    projectIRI,
    stats: {
      tasks: tasksCount,
      epics: epicsCount,
      stories: storiesCount,
      sprints,
    },
  };
}

/**
 * Convert Jira CSV to SPARQL triples
 */
export function jiraCSVToTriples(csvContent: string, projectName: string): {
  triples: string[];
  projectSlug: string;
  projectIRI: string;
  stats: { tasks: number; epics: number; stories: number; sprints: Set<string> };
} {
  const rows = parseCSV<JiraCSVRow>(csvContent);
  const projectSlug = generateToken(projectName);
  const projectIRI = `${PREFIXES.pm}Project/${projectSlug}`;
  const triples: string[] = [];

  let tasksCount = 0;
  let epicsCount = 0;
  let storiesCount = 0;
  const sprints = new Set<string>();

  // Create project
  const projectNameEscaped = projectName.replace(/"/g, '\\"');
  triples.push(`<${projectIRI}> a pm:Project`);
  triples.push(`<${projectIRI}> pm:slug "${projectSlug}"`);
  triples.push(`<${projectIRI}> pm:name "${projectNameEscaped}"`);

  for (const row of rows) {
    const token = generateToken(row['Issue key'] || row.Summary);
    const taskIRI = `${PREFIXES.pm}Task/${token}`;

    const issueType = row['Issue Type']?.toLowerCase() || 'task';
    const isEpic = issueType === 'epic';
    const isStory = issueType === 'story';

    if (isEpic) epicsCount++;
    if (isStory) storiesCount++;
    tasksCount++;

    // Basic task properties
    triples.push(`<${taskIRI}> a pm:Task`);
    if (isEpic) triples.push(`<${taskIRI}> a sro:Epic`);
    if (isStory) triples.push(`<${taskIRI}> a sro:UserStory`);

    triples.push(`<${taskIRI}> pm:token "${token}"`);
    triples.push(`<${taskIRI}> pm:title "${row.Summary.replace(/"/g, '\\"')}"`);
    triples.push(`<${taskIRI}> pm:belongsToProject <${projectIRI}>`);
    triples.push(`<${taskIRI}> pm:type "${issueType}"`);

    if (row.Description) {
      triples.push(`<${taskIRI}> pm:description "${row.Description.replace(/"/g, '\\"')}"`);
    }

    if (row.Status) {
      // Map Jira status to SRO status
      const statusLower = row.Status.toLowerCase();
      let sroStatus = 'sro:ToDo';
      if (statusLower.includes('done') || statusLower.includes('closed')) sroStatus = 'sro:Done';
      else if (statusLower.includes('progress')) sroStatus = 'sro:InProgress';
      else if (statusLower.includes('review')) sroStatus = 'sro:InReview';

      triples.push(`<${taskIRI}> sro:hasState ${sroStatus}`);
      triples.push(`<${taskIRI}> pm:status "${row.Status}"`);
    }

    if (row.Priority) {
      triples.push(`<${taskIRI}> pm:priority "${row.Priority}"`);
    }

    if (row.Assignee) {
      triples.push(`<${taskIRI}> pm:assignedTo "${row.Assignee}"`);
    }

    // Sprint information
    if (row.Sprint) {
      const sprintToken = generateToken(row.Sprint);
      const sprintIRI = `${PREFIXES.pm}Sprint/${sprintToken}`;
      sprints.add(row.Sprint);

      triples.push(`<${taskIRI}> sro:assignedToSprint <${sprintIRI}>`);
      triples.push(`<${sprintIRI}> a sro:Sprint`);
      triples.push(`<${sprintIRI}> pm:name "${row.Sprint.replace(/"/g, '\\"')}"`);
    }

    // Parent relationship (Epic -> Story)
    if (row['Parent key']) {
      const parentToken = generateToken(row['Parent key']);
      const parentIRI = `${PREFIXES.pm}Task/${parentToken}`;
      triples.push(`<${taskIRI}> sro:partOfEpic <${parentIRI}>`);
    }

    // Dates
    if (row.Created) {
      triples.push(`<${taskIRI}> pm:createdAt "${convertJiraDate(row.Created)}"`);
    }
    if (row.Updated) {
      triples.push(`<${taskIRI}> pm:updatedAt "${convertJiraDate(row.Updated)}"`);
    }
  }

  return {
    triples,
    projectSlug,
    projectIRI,
    stats: {
      tasks: tasksCount,
      epics: epicsCount,
      stories: storiesCount,
      sprints,
    },
  };
}

/**
 * Convert Linear date format to ISO 8601
 * Input: "Sun Nov 02 2025 19:00:00 GMT+0000 (GMT)"
 * Output: "2025-11-02T19:00:00Z"
 */
function convertLinearDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString();
  } catch {
    return '';
  }
}

/**
 * Convert Jira date format to ISO 8601
 * Input: "02/Nov/25 7:00 PM"
 * Output: "2025-11-02T19:00:00Z"
 */
function convertJiraDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString();
  } catch {
    return '';
  }
}
