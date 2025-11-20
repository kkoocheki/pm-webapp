/**
 * Projects API Routes
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate, sparqlConstruct } from '../lib/sparql';
import { mapToProject, mapToTask, mapToLink, generateToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { Project, ProjectData } from '../types';

const app = new Hono();

/**
 * GET /api/projects
 * List all projects
 */
app.get('/', async (c) => {
  try {
    const query = `
      ${PREFIX_STRING}
      SELECT ?project ?slug ?name ?description ?start_date ?end_date ?status
      WHERE {
        ?project a pm:Project .
        ?project pm:slug ?slug .
        ?project pm:name ?name .
        OPTIONAL { ?project pm:description ?description }
        OPTIONAL { ?project pm:startDate ?start_date }
        OPTIONAL { ?project pm:endDate ?end_date }
        OPTIONAL { ?project pm:status ?status }
      }
      ORDER BY ?name
    `;

    const results = await sparqlSelect(query);
    const projects = results.map(mapToProject);

    return c.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

/**
 * GET /api/projects/:slug
 * Get project with tasks and links
 */
app.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Get project
    const projectQuery = `
      ${PREFIX_STRING}
      SELECT ?project ?slug ?name ?description ?start_date ?end_date ?status
      WHERE {
        ?project a pm:Project ;
                 pm:slug "${slug}" ;
                 pm:name ?name .
        BIND("${slug}" AS ?slug)
        OPTIONAL { ?project pm:description ?description }
        OPTIONAL { ?project pm:startDate ?start_date }
        OPTIONAL { ?project pm:endDate ?end_date }
        OPTIONAL { ?project pm:status ?status }
      }
    `;

    const projectResults = await sparqlSelect(projectQuery);
    if (projectResults.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const project = mapToProject(projectResults[0]);

    // Get tasks
    const tasksQuery = `
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

    const tasksResults = await sparqlSelect(tasksQuery);
    const tasks = tasksResults.map(mapToTask);

    // Get links
    const linksQuery = `
      ${PREFIX_STRING}
      SELECT ?link ?token ?source ?source_token ?target ?target_token ?type ?lag
      WHERE {
        ?project pm:slug "${slug}" .
        ?link a pm:Dependency .
        ?link pm:source ?source ;
              pm:target ?target .
        ?source pm:belongsToProject ?project ;
                pm:token ?source_token .
        ?target pm:belongsToProject ?project ;
                pm:token ?target_token .
        OPTIONAL { ?link pm:token ?token }
        OPTIONAL { ?link pm:type ?type }
        OPTIONAL { ?link pm:lag ?lag }
      }
    `;

    const linksResults = await sparqlSelect(linksQuery);
    const links = linksResults.map(mapToLink);

    const data: ProjectData = {
      project,
      tasks,
      links,
    };

    return c.json(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json<Partial<Project>>();
    const slug = body.slug || generateToken(body.name || 'project');
    const name = body.name || 'Untitled Project';
    const projectIRI = `${PREFIXES.pm}Project/${slug}`;

    const insertQuery = `
      ${PREFIX_STRING}
      INSERT DATA {
        <${projectIRI}> a pm:Project ;
                        pm:slug "${slug}" ;
                        pm:name "${name}" ${body.description ? `; pm:description "${body.description}"` : ''} ${body.start_date ? `; pm:startDate "${body.start_date}"^^xsd:date` : ''} ${body.end_date ? `; pm:endDate "${body.end_date}"^^xsd:date` : ''} ${body.status ? `; pm:status "${body.status}"` : ''} .
      }
    `;

    await sparqlUpdate(insertQuery);

    const project: Project = {
      slug,
      name,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      status: body.status,
      iri: projectIRI,
    };

    return c.json(project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

/**
 * PUT /api/projects/:slug
 * Update a project
 */
app.put('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Project>>();

    // Build update query
    const updates: string[] = [];
    if (body.name) updates.push(`pm:name "${body.name}"`);
    if (body.description !== undefined) updates.push(`pm:description "${body.description}"`);
    if (body.start_date) updates.push(`pm:startDate "${body.start_date}"^^xsd:date`);
    if (body.end_date) updates.push(`pm:endDate "${body.end_date}"^^xsd:date`);
    if (body.status) updates.push(`pm:status "${body.status}"`);

    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    const updateQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?project ?p ?o
      }
      INSERT {
        ?project a pm:Project ;
                 pm:slug "${slug}" ;
                 ${updates.join(' ;\n                 ')} .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?project ?p ?o .
        FILTER(?p != rdf:type && ?p != pm:slug)
      }
    `;

    await sparqlUpdate(updateQuery);

    return c.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

/**
 * DELETE /api/projects/:slug
 * Delete a project and all associated tasks and links
 */
app.delete('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    const deleteQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?task ?tp ?to .
        ?link ?lp ?lo .
        ?project ?pp ?po .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?project ?pp ?po .
        OPTIONAL {
          ?task pm:belongsToProject ?project .
          ?task ?tp ?to .
        }
        OPTIONAL {
          ?link a pm:Dependency .
          ?link pm:source ?source .
          ?link pm:target ?target .
          ?source pm:belongsToProject ?project .
          ?link ?lp ?lo .
        }
      }
    `;

    await sparqlUpdate(deleteQuery);

    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

export default app;
