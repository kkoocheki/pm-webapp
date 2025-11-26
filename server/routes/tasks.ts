/**
 * Tasks API Routes
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate, escapeSparqlString } from '../lib/sparql';
import { mapToTask, generateUniqueToken, extractToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { Task } from '../types';

const app = new Hono();

/**
 * GET /api/projects/:slug/tasks
 * List all tasks for a project
 */
app.get('/projects/:slug/tasks', async (c) => {
  try {
    const slug = c.req.param('slug');

    const query = `
      ${PREFIX_STRING}
      SELECT ?task ?token ?text ?description ?start_date ?end_date ?duration ?progress ?parent_token ?type ?priority ?status ?assignee
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project .
        OPTIONAL { ?task pm:token ?token }
        OPTIONAL { ?task pm:title ?text }
        OPTIONAL { ?task pm:description ?description }
        OPTIONAL { ?task pm:startDate ?start_date }
        OPTIONAL { ?task pm:endDate ?end_date }
        OPTIONAL { ?task pm:duration ?duration }
        OPTIONAL { ?task pm:progress ?progress }
        OPTIONAL { ?task pm:hasParent/pm:token ?parent_token }
        OPTIONAL { ?task pm:type ?type }
        OPTIONAL { ?task pm:priority ?priority }
        OPTIONAL { ?task pm:status ?status }
        OPTIONAL { ?task pm:assignedTo/pm:name ?assignee }
      }
      ORDER BY ?start_date ?text
    `;

    const results = await sparqlSelect(query);
    const tasks = results.map(mapToTask);

    return c.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

/**
 * GET /api/projects/:slug/tasks/:token
 * Get a specific task
 */
app.get('/projects/:slug/tasks/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();

    const query = `
      ${PREFIX_STRING}
      SELECT ?task ?token ?text ?description ?start_date ?end_date ?duration ?progress ?parent_token ?type ?priority ?status ?assignee
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project ;
              pm:token "${token}" .
        BIND("${token}" AS ?token)
        OPTIONAL { ?task pm:title ?text }
        OPTIONAL { ?task pm:description ?description }
        OPTIONAL { ?task pm:startDate ?start_date }
        OPTIONAL { ?task pm:endDate ?end_date }
        OPTIONAL { ?task pm:duration ?duration }
        OPTIONAL { ?task pm:progress ?progress }
        OPTIONAL { ?task pm:hasParent/pm:token ?parent_token }
        OPTIONAL { ?task pm:type ?type }
        OPTIONAL { ?task pm:priority ?priority }
        OPTIONAL { ?task pm:status ?status }
        OPTIONAL { ?task pm:assignedTo/pm:name ?assignee }
      }
    `;

    const results = await sparqlSelect(query);
    if (results.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const task = mapToTask(results[0]);
    return c.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return c.json({ error: 'Failed to fetch task' }, 500);
  }
});

/**
 * POST /api/projects/:slug/tasks
 * Create a new task
 */
app.post('/projects/:slug/tasks', async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Task>>();

    const token = body.token || generateUniqueToken('task');
    const text = body.text || 'Untitled Task';
    const taskIRI = `${PREFIXES.pm}Task/${token}`;
    const projectIRI = `${PREFIXES.pm}Project/${slug}`;

    const triples: string[] = [
      `<${taskIRI}> a pm:Task`,
      `<${taskIRI}> pm:token "${token}"`,
      `<${taskIRI}> pm:title "${escapeSparqlString(text)}"`,
      `<${taskIRI}> pm:belongsToProject <${projectIRI}>`,
    ];

    if (body.description) triples.push(`<${taskIRI}> pm:description "${escapeSparqlString(body.description)}"`);
    if (body.start_date) triples.push(`<${taskIRI}> pm:startDate "${body.start_date}"^^xsd:date`);
    if (body.end_date) triples.push(`<${taskIRI}> pm:endDate "${body.end_date}"^^xsd:date`);
    if (body.duration) triples.push(`<${taskIRI}> pm:duration "${body.duration}"^^xsd:integer`);
    if (body.progress !== undefined) triples.push(`<${taskIRI}> pm:progress "${body.progress}"^^xsd:float`);
    if (body.type) triples.push(`<${taskIRI}> pm:type "${body.type}"`);
    if (body.priority) triples.push(`<${taskIRI}> pm:priority "${body.priority}"`);
    if (body.status) triples.push(`<${taskIRI}> pm:status "${body.status}"`);

    if (body.parent_token) {
      triples.push(`<${taskIRI}> pm:hasParent ?parent`);
      triples.push(`?parent pm:token "${body.parent_token}"`);
    }

    const insertQuery = `
      ${PREFIX_STRING}
      INSERT DATA {
        ${triples.join(' .\n        ')} .
      }
    `;

    await sparqlUpdate(insertQuery);

    const task: Task = {
      token,
      text,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      duration: body.duration,
      progress: body.progress || 0,
      parent_token: body.parent_token,
      type: body.type,
      priority: body.priority,
      status: body.status,
      iri: taskIRI,
    };

    return c.json(task, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

/**
 * PUT /api/projects/:slug/tasks/:token
 * Update a task
 */
app.put('/projects/:slug/tasks/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();
    const body = await c.req.json<Partial<Task>>();

    // Build delete/insert patterns
    const deletePatterns: string[] = [];
    const insertPatterns: string[] = [];

    if (body.text !== undefined) {
      deletePatterns.push('?task pm:title ?oldTitle');
      insertPatterns.push(`?task pm:title "${escapeSparqlString(body.text)}"`);
    }
    if (body.description !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:description ?oldDesc }');
      insertPatterns.push(`?task pm:description "${escapeSparqlString(body.description)}"`);
    }
    if (body.start_date !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:startDate ?oldStart }');
      insertPatterns.push(`?task pm:startDate "${body.start_date}"^^xsd:date`);
    }
    if (body.end_date !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:endDate ?oldEnd }');
      insertPatterns.push(`?task pm:endDate "${body.end_date}"^^xsd:date`);
    }
    if (body.duration !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:duration ?oldDur }');
      insertPatterns.push(`?task pm:duration "${body.duration}"^^xsd:integer`);
    }
    if (body.progress !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:progress ?oldProg }');
      insertPatterns.push(`?task pm:progress "${body.progress}"^^xsd:float`);
    }
    if (body.status !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:status ?oldStatus }');
      insertPatterns.push(`?task pm:status "${body.status}"`);
    }
    if (body.priority !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:priority ?oldPriority }');
      insertPatterns.push(`?task pm:priority "${body.priority}"`);
    }
    if (body.type !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:type ?oldType }');
      insertPatterns.push(`?task pm:type "${body.type}"`);
    }

    if (insertPatterns.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    const updateQuery = `
      ${PREFIX_STRING}
      DELETE {
        ${deletePatterns.join(' .\n        ')} .
      }
      INSERT {
        ${insertPatterns.join(' .\n        ')} .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project ;
              pm:token "${token}" .
        ${deletePatterns.join(' .\n        ')} .
      }
    `;

    await sparqlUpdate(updateQuery);

    return c.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

/**
 * DELETE /api/projects/:slug/tasks/:token
 * Delete a task
 */
app.delete('/projects/:slug/tasks/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();

    const deleteQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?task ?p ?o .
        ?link ?lp ?lo .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project ;
              pm:token "${token}" .
        ?task ?p ?o .
        OPTIONAL {
          ?link a pm:Dependency .
          {?link pm:source ?task} UNION {?link pm:target ?task}
          ?link ?lp ?lo .
        }
      }
    `;

    await sparqlUpdate(deleteQuery);

    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

export default app;
