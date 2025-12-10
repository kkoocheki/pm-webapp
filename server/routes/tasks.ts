/**
 * Tasks API Routes
 * 
 * Note: Tasks in the Scrum ontology don't have pm:belongsToProject directly.
 * They are linked via pm:hasParent to User Stories, which are in Sprint Backlogs.
 * For simplicity, we use the task IRI directly (ex:<token>) for operations.
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate, escapeSparqlString, getAndIncrementTaskCounter } from '../lib/sparql';
import { mapToTask, generateUniqueToken, extractToken, generateProjectPrefix, generateTaskId } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { Task } from '../types';

const app = new Hono();

/**
 * GET /api/projects/:slug/tasks
 * List all tasks (pm:Task instances)
 * Note: Tasks are retrieved via type, not project association
 */
app.get('/projects/:slug/tasks', async (c) => {
  try {
    // Get all tasks
    const query = `
      ${PREFIX_STRING}
      SELECT ?task ?text ?description ?start_date ?end_date ?duration ?progress ?parent ?type ?priority ?status ?assignee
      WHERE {
        ?task a pm:Task .
        OPTIONAL { ?task rdfs:label ?text }
        OPTIONAL { ?task pm:taskDescription ?description }
        OPTIONAL { ?task pm:hasPlannedStart ?start_date }
        OPTIONAL { ?task pm:hasPlannedEnd ?end_date }
        OPTIONAL { ?task pm:duration ?duration }
        OPTIONAL { ?task pm:progress ?progress }
        OPTIONAL { ?task pm:hasParent ?parent }
        OPTIONAL { ?task pm:type ?type }
        OPTIONAL { ?task sro:hasPriority ?priority }
        OPTIONAL { ?task sro:hasState ?status }
        OPTIONAL { ?task pm:assignedTo ?assigneeUri . ?assigneeUri rdfs:label ?assignee }
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
 * Get a specific task by token (which is derived from IRI)
 */
app.get('/projects/:slug/tasks/:token', async (c) => {
  try {
    const { token } = c.req.param();
    const taskIRI = `${PREFIXES.ex}${token}`;

    const query = `
      ${PREFIX_STRING}
      SELECT ?task ?text ?description ?start_date ?end_date ?duration ?progress ?parent ?type ?priority ?status ?assignee
      WHERE {
        BIND(<${taskIRI}> AS ?task)
        ?task a pm:Task .
        OPTIONAL { ?task rdfs:label ?text }
        OPTIONAL { ?task pm:taskDescription ?description }
        OPTIONAL { ?task pm:hasPlannedStart ?start_date }
        OPTIONAL { ?task pm:hasPlannedEnd ?end_date }
        OPTIONAL { ?task pm:duration ?duration }
        OPTIONAL { ?task pm:progress ?progress }
        OPTIONAL { ?task pm:hasParent ?parent }
        OPTIONAL { ?task pm:type ?type }
        OPTIONAL { ?task sro:hasPriority ?priority }
        OPTIONAL { ?task sro:hasState ?status }
        OPTIONAL { ?task pm:assignedTo ?assigneeUri . ?assigneeUri rdfs:label ?assignee }
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
 * Create a new task with Jira/Linear style ID (e.g., PRO-123)
 */
app.post('/projects/:slug/tasks', async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Task>>();
    const projectIRI = `${PREFIXES.ex}${slug}`;

    // Get project name for prefix generation
    const projectQuery = `
      ${PREFIX_STRING}
      SELECT ?name
      WHERE {
        <${projectIRI}> a sro:ScrumProject ;
                        rdfs:label ?name .
      }
    `;

    const projectResults = await sparqlSelect(projectQuery);
    if (projectResults.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const projectName = projectResults[0].name;
    const projectPrefix = generateProjectPrefix(projectName);

    // Get next task number and increment counter
    const taskNumber = await getAndIncrementTaskCounter(projectIRI, PREFIX_STRING);

    // Generate the new task ID (e.g., PRO-123)
    const token = generateTaskId(projectPrefix, taskNumber);
    const text = body.text || 'Untitled Task';
    const taskIRI = `${PREFIXES.ex}${token}`;

    const triples: string[] = [
      `<${taskIRI}> a pm:Task`,
      `<${taskIRI}> pm:token "${token}"`,
      `<${taskIRI}> rdfs:label "${escapeSparqlString(text)}"@en`,
      `<${taskIRI}> pm:belongsToProject <${projectIRI}>`,
    ];

    if (body.description) triples.push(`<${taskIRI}> pm:taskDescription "${escapeSparqlString(body.description)}"`);
    if (body.start_date) triples.push(`<${taskIRI}> pm:hasPlannedStart "${body.start_date}"^^xsd:date`);
    if (body.end_date) triples.push(`<${taskIRI}> pm:hasPlannedEnd "${body.end_date}"^^xsd:date`);
    if (body.duration) triples.push(`<${taskIRI}> pm:duration "${body.duration}"^^xsd:integer`);
    if (body.progress !== undefined) triples.push(`<${taskIRI}> pm:progress "${body.progress}"^^xsd:float`);
    if (body.type) triples.push(`<${taskIRI}> pm:type "${body.type}"`);
    if (body.priority) triples.push(`<${taskIRI}> sro:hasPriority sro:${body.priority}`);
    if (body.status) triples.push(`<${taskIRI}> sro:hasState sro:${body.status}`);

    if (body.parent_token) {
      const parentIRI = `${PREFIXES.ex}${body.parent_token}`;
      triples.push(`<${taskIRI}> pm:hasParent <${parentIRI}>`);
    }

    const insertQuery = `
      ${PREFIX_STRING}
      INSERT DATA {
        ${triples.join(' .\n        ')} .
      }
    `;

    await sparqlUpdate(insertQuery);

    console.log(`[Tasks POST] Created new task with ID: ${token} (${projectPrefix}-${taskNumber})`);

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

    console.log('[Tasks PUT] Updating task:', token, 'with body:', body);

    // Build delete/insert patterns using proper RDF predicates
    const deletePatterns: string[] = [];
    const insertPatterns: string[] = [];

    if (body.text !== undefined) {
      deletePatterns.push('?task rdfs:label ?oldText');
      insertPatterns.push(`?task rdfs:label "${escapeSparqlString(body.text)}"@en`);
    }
    if (body.description !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:taskDescription ?oldDesc }');
      insertPatterns.push(`?task pm:taskDescription "${escapeSparqlString(body.description)}"`);
    }
    if (body.start_date !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:hasPlannedStart ?oldStart }');
      insertPatterns.push(`?task pm:hasPlannedStart "${body.start_date}"^^xsd:date`);
    }
    if (body.end_date !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:hasPlannedEnd ?oldEnd }');
      insertPatterns.push(`?task pm:hasPlannedEnd "${body.end_date}"^^xsd:date`);
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
      deletePatterns.push('OPTIONAL { ?task sro:hasState ?oldStatus }');
      insertPatterns.push(`?task sro:hasState sro:${body.status}`);
    }
    if (body.priority !== undefined) {
      deletePatterns.push('OPTIONAL { ?task sro:hasPriority ?oldPriority }');
      insertPatterns.push(`?task sro:hasPriority sro:${body.priority}`);
    }
    if (body.type !== undefined) {
      deletePatterns.push('OPTIONAL { ?task pm:type ?oldType }');
      insertPatterns.push(`?task pm:type "${body.type}"`);
    }

    if (insertPatterns.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    // Use DELETE WHERE + INSERT WHERE pattern which is more reliable
    const taskIRI = `${PREFIXES.ex}${token}`;
    
    // Build separate DELETE and INSERT queries for more reliable execution
    const deleteQuery = `
      ${PREFIX_STRING}
      DELETE {
        ${deletePatterns.map(p => p.replace('OPTIONAL { ', '').replace(' }', '')).join(' .\n        ')} .
      }
      WHERE {
        BIND(<${taskIRI}> AS ?task)
        ${deletePatterns.join(' .\n        ')} .
      }
    `;

    const insertQuery = `
      ${PREFIX_STRING}
      INSERT {
        ${insertPatterns.join(' .\n        ')} .
      }
      WHERE {
        BIND(<${taskIRI}> AS ?task)
        ?task a pm:Task .
      }
    `;

    console.log('[Tasks PUT] Delete query:', deleteQuery);
    console.log('[Tasks PUT] Insert query:', insertQuery);

    await sparqlUpdate(deleteQuery);
    await sparqlUpdate(insertQuery);

    return c.json({ message: 'Task updated successfully', token });
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
    const taskIRI = `${PREFIXES.ex}${token}`;

    const deleteQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?task ?p ?o .
        ?link ?lp ?lo .
      }
      WHERE {
        BIND(<${taskIRI}> AS ?task)
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
