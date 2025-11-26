/**
 * Import API Routes
 * Handles TTL file import and Jira import
 */

import { Hono } from 'hono';
import { uploadRDF, sparqlSelect, sparqlUpdate } from '../lib/sparql';
import { generateToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { ImportResult, JiraImportRequest, JiraImportResult, JiraProject } from '../types';
import { Version2Client } from 'jira.js';

const app = new Hono();

/**
 * POST /api/import/ttl
 * Import a project from a Turtle (.ttl) file
 */
app.post('/ttl', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const projectName = formData.get('project_name') as string;
    const overwrite = formData.get('overwrite') === 'true';

    if (!file || !projectName) {
      return c.json({ error: 'file and project_name are required' }, 400);
    }

    const ttlContent = await file.text();
    const projectSlug = generateToken(projectName);
    const graphIRI = `${PREFIXES.pm}graph/${projectSlug}`;

    // If overwrite, clear the existing graph
    if (overwrite) {
      await sparqlUpdate(`
        ${PREFIX_STRING}
        DROP SILENT GRAPH <${graphIRI}>
      `);
    }

    // Upload the RDF data to the graph
    await uploadRDF(ttlContent, graphIRI);

    // Count what was imported
    const countQuery = `
      ${PREFIX_STRING}
      SELECT
        (COUNT(DISTINCT ?task) AS ?tasks)
        (COUNT(DISTINCT ?dep) AS ?dependencies)
        (COUNT(DISTINCT ?story) AS ?stories)
        (COUNT(DISTINCT ?sprint) AS ?sprints)
      WHERE {
        GRAPH <${graphIRI}> {
          OPTIONAL { ?task a pm:Task }
          OPTIONAL { ?dep a pm:Dependency }
          OPTIONAL { ?story a sro:UserStory }
          OPTIONAL { ?sprint a sro:Sprint }
        }
      }
    `;

    const counts = await sparqlSelect(countQuery);
    const result: ImportResult = {
      project_slug: projectSlug,
      project_iri: graphIRI,
      tasks_created: parseInt(counts[0]?.tasks || '0'),
      dependencies_created: parseInt(counts[0]?.dependencies || '0'),
      user_stories_created: parseInt(counts[0]?.stories || '0'),
      sprints_created: parseInt(counts[0]?.sprints || '0'),
      message: `Successfully imported ${counts[0]?.tasks || 0} tasks and ${counts[0]?.dependencies || 0} dependencies`,
    };

    return c.json(result, 201);
  } catch (error) {
    console.error('Error importing TTL:', error);
    return c.json({ error: 'Failed to import TTL file' }, 500);
  }
});

/**
 * GET /api/import/jira/projects
 * List available Jira projects
 */
app.get('/jira/projects', async (c) => {
  try {
    const jiraUrl = c.req.query('url');
    const email = c.req.query('email');
    const apiToken = c.req.query('token');

    if (!jiraUrl || !email || !apiToken) {
      return c.json({ error: 'url, email, and token are required' }, 400);
    }

    const client = new Version2Client({
      host: jiraUrl,
      authentication: {
        basic: {
          email,
          apiToken,
        },
      },
    });

    const projects = await client.projects.searchProjects();

    const jiraProjects: JiraProject[] = (projects.values || []).map((p: any) => ({
      key: p.key,
      name: p.name,
      description: p.description,
    }));

    return c.json(jiraProjects);
  } catch (error) {
    console.error('Error fetching Jira projects:', error);
    return c.json({ error: 'Failed to fetch Jira projects. Check your credentials.' }, 500);
  }
});

/**
 * POST /api/import/jira
 * Import a project from Jira
 */
app.post('/jira', async (c) => {
  try {
    const body = await c.req.json<JiraImportRequest>();

    if (!body.jira_url || !body.email || !body.api_token || !body.project_key) {
      return c.json({ error: 'jira_url, email, api_token, and project_key are required' }, 400);
    }

    const client = new Version2Client({
      host: body.jira_url,
      authentication: {
        basic: {
          email: body.email,
          apiToken: body.api_token,
        },
      },
    });

    // Get project details
    const project = await client.projects.getProject({ projectIdOrKey: body.project_key });
    const projectName = body.project_name || project.name || body.project_key;
    const projectSlug = generateToken(projectName);
    const projectIRI = `${PREFIXES.pm}Project/${projectSlug}`;

    // Search for all issues in the project
    const jql = `project = ${body.project_key} ORDER BY created ASC`;
    const searchResult = await client.issueSearch.searchForIssuesUsingJql({
      jql,
      maxResults: 1000,
      fields: ['summary', 'description', 'status', 'issuetype', 'priority', 'assignee', 'parent', 'subtasks', 'issuelinks', 'epic', 'sprint'],
    });

    const issues = searchResult.issues || [];

    // Statistics
    let epicsCreated = 0;
    let storiesCreated = 0;
    let tasksCreated = 0;
    let subtasksCreated = 0;
    let dependenciesCreated = 0;

    // Create project
    await sparqlUpdate(`
      ${PREFIX_STRING}
      INSERT DATA {
        <${projectIRI}> a pm:Project ;
                        pm:slug "${projectSlug}" ;
                        pm:name "${projectName}" .
      }
    `);

    // Import issues
    const triples: string[] = [];

    for (const issue of issues) {
      const issueType = issue.fields.issuetype?.name?.toLowerCase() || 'task';
      const token = generateToken(`${issue.key}-${issue.fields.summary}`);
      const taskIRI = `${PREFIXES.pm}Task/${token}`;

      triples.push(`<${taskIRI}> a pm:Task`);
      triples.push(`<${taskIRI}> pm:token "${token}"`);
      triples.push(`<${taskIRI}> pm:title "${issue.fields.summary?.replace(/"/g, '\\"') || 'Untitled'}"`);
      triples.push(`<${taskIRI}> pm:belongsToProject <${projectIRI}>`);
      triples.push(`<${taskIRI}> pm:type "${issueType}"`);
      triples.push(`<${taskIRI}> pm:status "${issue.fields.status?.name || 'To Do'}"`);

      if (issue.fields.description) {
        triples.push(`<${taskIRI}> pm:description "${issue.fields.description.replace(/"/g, '\\"')}"`);
      }

      if (issue.fields.priority?.name) {
        triples.push(`<${taskIRI}> pm:priority "${issue.fields.priority.name}"`);
      }

      if (issue.fields.assignee?.displayName) {
        triples.push(`<${taskIRI}> pm:assignedTo "${issue.fields.assignee.displayName}"`);
      }

      // Count by type
      if (issueType === 'epic') epicsCreated++;
      else if (issueType === 'story') storiesCreated++;
      else if (issueType === 'sub-task') subtasksCreated++;
      else tasksCreated++;
    }

    // Insert all triples
    if (triples.length > 0) {
      await sparqlUpdate(`
        ${PREFIX_STRING}
        INSERT DATA {
          ${triples.join(' .\n          ')} .
        }
      `);
    }

    const result: JiraImportResult = {
      project_name: projectName,
      project_slug: projectSlug,
      project_iri: projectIRI,
      issues_imported: issues.length,
      epics_created: epicsCreated,
      stories_created: storiesCreated,
      tasks_created: tasksCreated,
      subtasks_created: subtasksCreated,
      dependencies_created: dependenciesCreated,
      sprints_created: 0,
      users_imported: new Set(issues.map(i => i.fields.assignee?.accountId).filter(Boolean)).size,
    };

    return c.json(result, 201);
  } catch (error) {
    console.error('Error importing from Jira:', error);
    return c.json({ error: 'Failed to import from Jira' }, 500);
  }
});

export default app;
