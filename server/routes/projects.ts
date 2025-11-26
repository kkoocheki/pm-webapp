/**
 * Projects API Routes
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate, sparqlConstruct, escapeSparqlString } from '../lib/sparql';
import { mapToProject, mapToTask, mapToLink, generateToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { ProjectData, Project } from '../types';

const app = new Hono();

/**
 * GET /api/projects
 * List all projects (Scrum Projects)
 */
app.get('/', async (c) => {
  try {
    const query = `
      ${PREFIX_STRING}
      SELECT ?project ?name ?description ?start_date ?end_date
      WHERE {
        ?project a sro:ScrumProject .
        ?project rdfs:label ?name .
        OPTIONAL { ?project rdfs:comment ?description }
        OPTIONAL { ?project pm:hasPlannedStart ?start_date }
        OPTIONAL { ?project pm:hasPlannedEnd ?end_date }
      }
      ORDER BY ?name
    `;

    const results = await sparqlSelect(query);
    const projects = results.map((row: any) => ({
      ...mapToProject(row),
      // Derive slug from IRI (last segment)
      slug: row.project ? row.project.split('/').pop() : 'unknown',
    }));

    return c.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

/**
 * GET /api/projects/:slug
 * Get project with tasks and links (Scrum-aligned)
 */
app.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const projectIRI = `${PREFIXES.ex}${slug}`;

    // Get project (Scrum Project)
    const projectQuery = `
      ${PREFIX_STRING}
      SELECT ?project ?name ?description ?start_date ?end_date
      WHERE {
        BIND(<${projectIRI}> AS ?project)
        ?project a sro:ScrumProject ;
                 rdfs:label ?name .
        OPTIONAL { ?project rdfs:comment ?description }
        OPTIONAL { ?project pm:hasPlannedStart ?start_date }
        OPTIONAL { ?project pm:hasPlannedEnd ?end_date }
      }
    `;

    const projectResults = await sparqlSelect(projectQuery);
    if (projectResults.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const projectRow = projectResults[0];

    // Get Epics (top-level summary items)
    const epicsQuery = `
      ${PREFIX_STRING}
      SELECT ?item ?name ?start ?end WHERE {
        ?item a sro:Epic .
        ?item rdfs:label ?name .
        OPTIONAL { ?item pm:hasPlannedStart ?start }
        OPTIONAL { ?item pm:hasPlannedEnd ?end }
      }
      ORDER BY ?start ?name
    `;

    // Get User Stories (mid-level summary items)
    // Note: Epic -> Story relationship is sro:hasUserStory (reverse lookup)
    const storiesQuery = `
      ${PREFIX_STRING}
      SELECT ?item ?name ?parent ?start ?end ?state ?priority WHERE {
        ?item a sro:UserStory .
        ?item rdfs:label ?name .
        OPTIONAL { ?parent sro:hasUserStory ?item }
        OPTIONAL { ?item pm:hasPlannedStart ?start }
        OPTIONAL { ?item pm:hasPlannedEnd ?end }
        OPTIONAL { ?item sro:hasState ?state }
        OPTIONAL { ?item sro:hasPriority ?priority }
      }
      ORDER BY ?start ?name
    `;

    // Get Tasks (leaf items)
    const tasksQuery = `
      ${PREFIX_STRING}
      SELECT ?item ?name ?parent ?start ?end ?progress ?assignee ?state ?priority WHERE {
        ?item a pm:Task .
        ?item rdfs:label ?name .
        OPTIONAL { ?item pm:hasParent ?parent }
        OPTIONAL { ?item pm:hasPlannedStart ?start }
        OPTIONAL { ?item pm:hasPlannedEnd ?end }
        OPTIONAL { ?item pm:progress ?progress }
        OPTIONAL { ?item pm:assignedTo ?assigneeUri . ?assigneeUri rdfs:label ?assignee }
        OPTIONAL { ?item sro:hasState ?state }
        OPTIONAL { ?item pm:hasTaskState ?state }
        OPTIONAL { ?item sro:hasPriority ?priority }
      }
      ORDER BY ?start ?name
    `;

    const [epicsResults, storiesResults, tasksResults] = await Promise.all([
      sparqlSelect(epicsQuery),
      sparqlSelect(storiesQuery),
      sparqlSelect(tasksQuery),
    ]);

    // Map Epics as "project" type (top level, no parent)
    // Using "project" type for epics to distinguish from user stories
    const epics = epicsResults.map((row: any) => ({
      iri: row.item,
      project: projectRow.project,
      parent: null, // No parent for epics - IRI string or null
      type: 'project' as const,
      name: row.name || 'Untitled Epic',
      start: row.start || null,
      end: row.end || null,
      progress: 0,
      open: true,
    }));

    // Helper to extract local name from IRI (e.g., "https://example.org/sro#ToDo" -> "ToDo")
    const extractLocalName = (iri: string | null): string | null => {
      if (!iri) return null;
      const hashIndex = iri.lastIndexOf('#');
      if (hashIndex !== -1) return iri.substring(hashIndex + 1);
      const slashIndex = iri.lastIndexOf('/');
      if (slashIndex !== -1) return iri.substring(slashIndex + 1);
      return iri;
    };

    // Map User Stories as "summary" type (parent = epic IRI)
    const stories = storiesResults.map((row: any) => ({
      iri: row.item,
      project: projectRow.project,
      parent: row.parent || null, // Parent is IRI string or null
      type: 'summary' as const,
      name: row.name || 'Untitled Story',
      start: row.start || null,
      end: row.end || null,
      progress: 0,
      open: true,
      state: extractLocalName(row.state),
      priority: extractLocalName(row.priority),
    }));

    // Map Tasks as "task" type (parent = story IRI)
    const tasks = tasksResults.map((row: any) => ({
      iri: row.item,
      project: projectRow.project,
      parent: row.parent || null, // Parent is IRI string or null
      type: 'task' as const,
      name: row.name || 'Untitled Task',
      start: row.start || null,
      end: row.end || null,
      progress: row.progress ? parseInt(row.progress) : 0,
      open: true,
      state: extractLocalName(row.state),
      priority: extractLocalName(row.priority),
      assignee: row.assignee || null,
    }));

    // Combine all items: Epics first, then Stories, then Tasks
    const allItems = [...epics, ...stories, ...tasks];

    // Get links/dependencies
    const linksQuery = `
      ${PREFIX_STRING}
      SELECT ?source ?target ?type
      WHERE {
        ?source pm:finishToStart ?target .
        BIND("e2s" AS ?type)
      }
    `;

    const linksResults = await sparqlSelect(linksQuery);
    const links = linksResults.map((row: any) => ({
      iri: `${row.source}-${row.target}`,
      project: projectRow.project,
      source: row.source,
      target: row.target,
      type: 'e2s' as const,
    }));

    // Return in BackendProjectDetail format (flat structure)
    const data = {
      iri: projectRow.project,
      name: projectRow.name || 'Untitled Project',
      description: projectRow.description || null,
      start: projectRow.start_date || null,
      end: projectRow.end_date || null,
      tasks: allItems,
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
                        pm:name "${escapeSparqlString(name)}" ${body.description ? `; pm:description "${escapeSparqlString(body.description)}"` : ''} ${body.start_date ? `; pm:startDate "${body.start_date}"^^xsd:date` : ''} ${body.end_date ? `; pm:endDate "${body.end_date}"^^xsd:date` : ''} ${body.status ? `; pm:status "${escapeSparqlString(body.status || '')}"` : ''} .
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
    if (body.name) updates.push(`pm:name "${escapeSparqlString(body.name)}"`);
    if (body.description !== undefined) updates.push(`pm:description "${escapeSparqlString(body.description)}"`);
    if (body.start_date) updates.push(`pm:startDate "${body.start_date}"^^xsd:date`);
    if (body.end_date) updates.push(`pm:endDate "${body.end_date}"^^xsd:date`);
    if (body.status) updates.push(`pm:status "${escapeSparqlString(body.status)}"`);

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
