/**
 * CSV Generator for Linear and Jira formats
 */

import type { Task } from '../types';

/**
 * Escape CSV field value
 */
function escapeCSV(value: string | undefined | null): string {
  if (!value) return '';
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format date for Linear CSV
 * Output: "Sun Nov 02 2025 19:00:00 GMT+0000 (GMT)"
 */
function formatLinearDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toUTCString().replace('GMT', 'GMT+0000 (GMT)');
  } catch {
    return '';
  }
}

/**
 * Format date for Jira CSV
 * Output: "02/Nov/25 7:00 PM"
 */
function formatJiraDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day}/${month}/${year} ${time}`;
  } catch {
    return '';
  }
}

/**
 * Generate Linear format CSV
 */
export function generateLinearCSV(tasks: Task[], projectName: string): string {
  const headers = [
    'ID',
    'Team',
    'Title',
    'Description',
    'Status',
    'Estimate',
    'Priority',
    'Project ID',
    'Project',
    'Creator',
    'Assignee',
    'Labels',
    'Cycle Number',
    'Cycle Name',
    'Cycle Start',
    'Cycle End',
    'Created',
    'Updated',
    'Started',
    'Triaged',
    'Completed',
    'Canceled',
    'Archived',
    'Due Date',
    'Parent issue',
    'Initiatives',
    'Project Milestone ID',
    'Project Milestone',
    'SLA Status',
    'UUID',
  ];

  const rows: string[] = [headers.map(escapeCSV).join(',')];

  // Group tasks by parent to identify epics and stories
  const tasksMap = new Map(tasks.map(t => [t.token, t]));

  for (const task of tasks) {
    const row = [
      escapeCSV(task.title?.substring(0, 10) || task.token), // ID (use prefix of title or token)
      escapeCSV('Team'), // Team (default)
      escapeCSV(task.title),
      escapeCSV(task.description),
      escapeCSV(task.status || 'Backlog'),
      escapeCSV(task.storyPoints?.toString() || ''),
      escapeCSV(task.priority || 'Medium'),
      escapeCSV(''), // Project ID (UUID would go here)
      escapeCSV(projectName),
      escapeCSV(task.createdBy || ''),
      escapeCSV(task.assignedTo || ''),
      escapeCSV(''), // Labels
      escapeCSV(''), // Cycle Number (would need sprint data)
      escapeCSV(''), // Cycle Name
      escapeCSV(''), // Cycle Start
      escapeCSV(''), // Cycle End
      escapeCSV(formatLinearDate(task.createdAt)),
      escapeCSV(formatLinearDate(task.updatedAt)),
      escapeCSV(formatLinearDate(task.startedAt)),
      escapeCSV(''), // Triaged
      escapeCSV(formatLinearDate(task.completedAt)),
      escapeCSV(''), // Canceled
      escapeCSV(''), // Archived
      escapeCSV(formatLinearDate(task.dueDate)),
      escapeCSV(''), // Parent issue (would need parent token)
      escapeCSV(''), // Initiatives
      escapeCSV(''), // Project Milestone ID
      escapeCSV(''), // Project Milestone
      escapeCSV(''), // SLA Status
      escapeCSV(task.token), // UUID
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate Jira format CSV
 */
export function generateJiraCSV(tasks: Task[], projectName: string): string {
  const headers = [
    'Summary',
    'Issue key',
    'Issue id',
    'Issue Type',
    'Status',
    'Project key',
    'Project name',
    'Project type',
    'Project lead',
    'Project lead id',
    'Project description',
    'Priority',
    'Resolution',
    'Assignee',
    'Assignee Id',
    'Reporter',
    'Reporter Id',
    'Creator',
    'Creator Id',
    'Created',
    'Updated',
    'Last Viewed',
    'Resolved',
    'Due date',
    'Votes',
    'Description',
    'Environment',
    'Watchers',
    'Watchers Id',
    'Original estimate',
    'Remaining Estimate',
    'Time Spent',
    'Work Ratio',
    'Σ Original Estimate',
    'Σ Remaining Estimate',
    'Σ Time Spent',
    'Security Level',
    'Inward issue link (Blocks)',
    'Outward issue link (Blocks)',
    'Custom field (Development)',
    'Custom field (Issue color)',
    'Custom field (Rank)',
    'Sprint',
    'Custom field (Start date)',
    'Custom field (Story point estimate)',
    'Custom field (Team)',
    'Custom field (Vulnerability)',
    'Parent',
    'Parent key',
    'Parent summary',
    'Status Category',
    'Status Category Changed',
  ];

  const rows: string[] = [headers.map(escapeCSV).join(',')];

  for (const task of tasks) {
    const issueType = task.type || 'Task';
    const projectKey = projectName.substring(0, 3).toUpperCase();

    const row = [
      escapeCSV(task.title),
      escapeCSV(`${projectKey}-${task.token?.substring(0, 4)}`), // Issue key
      escapeCSV(task.token), // Issue id
      escapeCSV(issueType.charAt(0).toUpperCase() + issueType.slice(1)),
      escapeCSV(task.status || 'To Do'),
      escapeCSV(projectKey),
      escapeCSV(projectName),
      escapeCSV('software'), // Project type
      escapeCSV(''), // Project lead
      escapeCSV(''), // Project lead id
      escapeCSV(''), // Project description
      escapeCSV(task.priority || 'Medium'),
      escapeCSV(''), // Resolution
      escapeCSV(task.assignedTo || ''),
      escapeCSV(''), // Assignee Id
      escapeCSV(task.createdBy || ''),
      escapeCSV(''), // Reporter Id
      escapeCSV(task.createdBy || ''),
      escapeCSV(''), // Creator Id
      escapeCSV(formatJiraDate(task.createdAt)),
      escapeCSV(formatJiraDate(task.updatedAt)),
      escapeCSV(''), // Last Viewed
      escapeCSV(formatJiraDate(task.completedAt)),
      escapeCSV(formatJiraDate(task.dueDate)),
      escapeCSV('0'), // Votes
      escapeCSV(task.description),
      escapeCSV(''), // Environment
      escapeCSV(''), // Watchers
      escapeCSV(''), // Watchers Id
      escapeCSV(''), // Original estimate
      escapeCSV(''), // Remaining Estimate
      escapeCSV(''), // Time Spent
      escapeCSV(''), // Work Ratio
      escapeCSV(''), // Σ Original Estimate
      escapeCSV(''), // Σ Remaining Estimate
      escapeCSV(''), // Σ Time Spent
      escapeCSV(''), // Security Level
      escapeCSV(''), // Inward issue link (Blocks)
      escapeCSV(''), // Outward issue link (Blocks)
      escapeCSV(''), // Custom field (Development)
      escapeCSV(''), // Custom field (Issue color)
      escapeCSV(''), // Custom field (Rank)
      escapeCSV(''), // Sprint
      escapeCSV(formatJiraDate(task.startedAt)), // Custom field (Start date)
      escapeCSV(task.storyPoints?.toString() || ''), // Custom field (Story point estimate)
      escapeCSV(''), // Custom field (Team)
      escapeCSV(''), // Custom field (Vulnerability)
      escapeCSV(''), // Parent
      escapeCSV(''), // Parent key
      escapeCSV(''), // Parent summary
      escapeCSV('To Do'), // Status Category
      escapeCSV(formatJiraDate(task.updatedAt)), // Status Category Changed
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}
