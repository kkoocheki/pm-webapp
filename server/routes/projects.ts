/**
 * Projects API Routes
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate, sparqlConstruct, escapeSparqlString, initializeTaskCounter } from '../lib/sparql';
import { mapToProject, mapToTask, mapToLink, generateToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { ProjectData, Project } from '../types';
import { generateLinearCSV, generateJiraCSV } from '../lib/csv-generator';

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

/**
 * POST /api/projects/:slug/initialize-counter
 * Initialize task counter for a project based on existing tasks
 */
app.post('/:slug/initialize-counter', async (c) => {
  try {
    const slug = c.req.param('slug');
    const projectIRI = `${PREFIXES.ex}${slug}`;

    await initializeTaskCounter(projectIRI, PREFIX_STRING);

    return c.json({ message: 'Task counter initialized successfully' });
  } catch (error) {
    console.error('Error initializing task counter:', error);
    return c.json({ error: 'Failed to initialize task counter' }, 500);
  }
});

/**
 * POST /api/projects/:slug/migrate-all-ids
 * Re-ID all entities (Epics, UserStories, Tasks) with new Jira/Linear-style IDs (PREFIX-###)
 * This will update all entity tokens, IRIs, and references
 */
app.post('/:slug/migrate-all-ids', async (c) => {
  try {
    const slug = c.req.param('slug');
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
    const projectPrefix = generateToken(projectName).substring(0, 3).toUpperCase();

    console.log(`[Migration] Starting entity ID migration for project: ${projectName} (${projectPrefix})`);

    // Get all UserStories
    const storiesQuery = `
      ${PREFIX_STRING}
      SELECT ?entity ?text ?start_date ?end_date ?priority ?status ?assignee ?parent ?story_text ?story_points
      WHERE {
        ?entity a sro:UserStory .
        OPTIONAL { ?entity rdfs:label ?text }
        OPTIONAL { ?entity pm:hasPlannedStart ?start_date }
        OPTIONAL { ?entity pm:hasPlannedEnd ?end_date }
        OPTIONAL { ?entity sro:hasPriority ?priority }
        OPTIONAL { ?entity sro:hasState ?status }
        OPTIONAL { ?entity pm:assignedTo ?assigneeUri . ?assigneeUri rdfs:label ?assignee }
        OPTIONAL { ?entity pm:hasParent ?parent }
        OPTIONAL { ?entity sro:storyText ?story_text }
        OPTIONAL { ?entity sro:storyPoints ?story_points }
      }
      ORDER BY ?start_date ?entity
    `;

    // Get all Tasks
    const tasksQuery = `
      ${PREFIX_STRING}
      SELECT ?entity ?text ?description ?start_date ?end_date ?duration ?progress ?parent ?type ?priority ?status ?assignee
      WHERE {
        ?entity a pm:Task .
        OPTIONAL { ?entity rdfs:label ?text }
        OPTIONAL { ?entity pm:taskDescription ?description }
        OPTIONAL { ?entity pm:hasPlannedStart ?start_date }
        OPTIONAL { ?entity pm:hasPlannedEnd ?end_date }
        OPTIONAL { ?entity pm:duration ?duration }
        OPTIONAL { ?entity pm:progress ?progress }
        OPTIONAL { ?entity pm:hasParent ?parent }
        OPTIONAL { ?entity pm:type ?type }
        OPTIONAL { ?entity sro:hasPriority ?priority }
        OPTIONAL { ?entity sro:hasState ?status }
        OPTIONAL { ?entity pm:assignedTo ?assigneeUri . ?assigneeUri rdfs:label ?assignee }
      }
      ORDER BY ?start_date ?entity
    `;

    const [stories, tasks] = await Promise.all([
      sparqlSelect(storiesQuery),
      sparqlSelect(tasksQuery),
    ]);

    console.log(`[Migration] Found ${stories.length} user stories and ${tasks.length} tasks to migrate`);

    // Create a mapping from old IRI to new token
    const iriMapping = new Map<string, string>();
    let counter = 1;

    // First pass: create the mapping for user stories
    for (const story of stories) {
      const oldIRI = story.entity;
      const newToken = `${projectPrefix}-${counter}`;
      iriMapping.set(oldIRI, newToken);
      counter++;
    }

    // Then map tasks
    for (const task of tasks) {
      const oldIRI = task.entity;
      const newToken = `${projectPrefix}-${counter}`;
      iriMapping.set(oldIRI, newToken);
      counter++;
    }

    console.log(`[Migration] Created IRI mapping for ${iriMapping.size} entities`);

    // Second pass: migrate UserStories first
    for (const story of stories) {
      const oldIRI = story.entity;
      const newToken = iriMapping.get(oldIRI)!;
      const newIRI = `${PREFIXES.ex}${newToken}`;

      console.log(`[Migration] Migrating UserStory ${oldIRI} -> ${newToken}`);

      // Delete the old story
      await sparqlUpdate(`
        ${PREFIX_STRING}
        DELETE { <${oldIRI}> ?p ?o } WHERE { <${oldIRI}> ?p ?o }
      `);

      // Insert the story with new IRI
      const triples: string[] = [
        `<${newIRI}> a sro:UserStory`,
        `<${newIRI}> rdfs:label "${escapeSparqlString(story.text || 'Untitled Story')}"@en`,
      ];

      if (story.story_text) triples.push(`<${newIRI}> sro:storyText "${escapeSparqlString(story.story_text)}"@en`);
      if (story.story_points) triples.push(`<${newIRI}> sro:storyPoints "${story.story_points}"^^xsd:integer`);
      if (story.start_date) triples.push(`<${newIRI}> pm:hasPlannedStart "${story.start_date}"^^xsd:date`);
      if (story.end_date) triples.push(`<${newIRI}> pm:hasPlannedEnd "${story.end_date}"^^xsd:date`);

      if (story.priority) {
        const priorityValue = story.priority.split(/[#/]/).pop();
        triples.push(`<${newIRI}> sro:hasPriority sro:${priorityValue}`);
      }

      if (story.status) {
        const statusValue = story.status.split(/[#/]/).pop();
        triples.push(`<${newIRI}> sro:hasState sro:${statusValue}`);
      }

      if (story.assignee) {
        const assigneeToken = generateToken(story.assignee);
        const assigneeIRI = `${PREFIXES.ex}${assigneeToken}`;
        triples.push(`<${newIRI}> pm:assignedTo <${assigneeIRI}>`);
      }

      if (story.parent) {
        const newParentToken = iriMapping.get(story.parent);
        if (newParentToken) {
          triples.push(`<${newIRI}> pm:hasParent <${PREFIXES.ex}${newParentToken}>`);
        } else {
          triples.push(`<${newIRI}> pm:hasParent <${story.parent}>`);
        }
      }

      await sparqlUpdate(`
        ${PREFIX_STRING}
        INSERT DATA { ${triples.join(' .\n          ')} . }
      `);
    }

    // Third pass: migrate Tasks
    for (const task of tasks) {
      const oldIRI = task.entity;
      const newToken = iriMapping.get(oldIRI)!;
      const newIRI = `${PREFIXES.ex}${newToken}`;

      console.log(`[Migration] Migrating Task ${oldIRI} -> ${newToken}`);

      // Delete the old task
      await sparqlUpdate(`
        ${PREFIX_STRING}
        DELETE { <${oldIRI}> ?p ?o } WHERE { <${oldIRI}> ?p ?o }
      `);

      // Insert the task with new IRI
      const triples: string[] = [
        `<${newIRI}> a pm:Task`,
        `<${newIRI}> pm:token "${newToken}"`,
        `<${newIRI}> rdfs:label "${escapeSparqlString(task.text || 'Untitled Task')}"@en`,
        `<${newIRI}> pm:belongsToProject <${projectIRI}>`,
      ];

      if (task.description) triples.push(`<${newIRI}> pm:taskDescription "${escapeSparqlString(task.description)}"`);
      if (task.start_date) triples.push(`<${newIRI}> pm:hasPlannedStart "${task.start_date}"^^xsd:date`);
      if (task.end_date) triples.push(`<${newIRI}> pm:hasPlannedEnd "${task.end_date}"^^xsd:date`);
      if (task.duration) triples.push(`<${newIRI}> pm:duration "${task.duration}"^^xsd:integer`);
      if (task.progress) triples.push(`<${newIRI}> pm:progress "${task.progress}"^^xsd:float`);
      if (task.type) triples.push(`<${newIRI}> pm:type "${task.type}"`);

      if (task.priority) {
        const priorityValue = task.priority.split(/[#/]/).pop();
        triples.push(`<${newIRI}> sro:hasPriority sro:${priorityValue}`);
      }

      if (task.status) {
        const statusValue = task.status.split(/[#/]/).pop();
        triples.push(`<${newIRI}> sro:hasState sro:${statusValue}`);
      }

      if (task.assignee) {
        const assigneeToken = generateToken(task.assignee);
        const assigneeIRI = `${PREFIXES.ex}${assigneeToken}`;
        triples.push(`<${newIRI}> pm:assignedTo <${assigneeIRI}>`);
      }

      if (task.parent) {
        const newParentToken = iriMapping.get(task.parent);
        if (newParentToken) {
          triples.push(`<${newIRI}> pm:hasParent <${PREFIXES.ex}${newParentToken}>`);
        } else {
          triples.push(`<${newIRI}> pm:hasParent <${task.parent}>`);
        }
      }

      await sparqlUpdate(`
        ${PREFIX_STRING}
        INSERT DATA { ${triples.join(' .\n          ')} . }
      `);
    }

    // Third pass: update dependencies/links
    const linksQuery = `
      ${PREFIX_STRING}
      SELECT ?link ?source ?target ?type
      WHERE {
        ?link a pm:Dependency .
        ?link pm:source ?source .
        ?link pm:target ?target .
        OPTIONAL { ?link pm:type ?type }
      }
    `;

    const links = await sparqlSelect(linksQuery);
    console.log(`[Migration] Found ${links.length} links to update`);

    for (const link of links) {
      const newSourceToken = iriMapping.get(link.source);
      const newTargetToken = iriMapping.get(link.target);

      // Only update if both source and target were remapped
      if (newSourceToken && newTargetToken) {
        const newSourceIRI = `${PREFIXES.ex}${newSourceToken}`;
        const newTargetIRI = `${PREFIXES.ex}${newTargetToken}`;

        console.log(`[Migration] Updating link: ${link.source} -> ${link.target}`);

        // Delete old link
        const deleteLinkQuery = `
          ${PREFIX_STRING}
          DELETE {
            <${link.link}> ?p ?o .
          }
          WHERE {
            <${link.link}> ?p ?o .
          }
        `;

        await sparqlUpdate(deleteLinkQuery);

        // Insert new link
        const newLinkIRI = `${PREFIXES.ex}link-${newSourceToken}-${newTargetToken}`;
        const insertLinkQuery = `
          ${PREFIX_STRING}
          INSERT DATA {
            <${newLinkIRI}> a pm:Dependency ;
                            pm:source <${newSourceIRI}> ;
                            pm:target <${newTargetIRI}> ${link.type ? `; pm:type "${link.type}"` : ''} .
          }
        `;

        await sparqlUpdate(insertLinkQuery);
      }
    }

    // Update the counter to total entities migrated
    const totalEntities = stories.length + tasks.length;
    const updateCounterQuery = `
      ${PREFIX_STRING}
      DELETE {
        <${projectIRI}> pm:taskCounter ?oldCounter .
      }
      INSERT {
        <${projectIRI}> pm:taskCounter ${totalEntities} .
      }
      WHERE {
        <${projectIRI}> a sro:ScrumProject .
        OPTIONAL { <${projectIRI}> pm:taskCounter ?oldCounter }
      }
    `;

    await sparqlUpdate(updateCounterQuery);

    console.log(`[Migration] Migration complete! Counter set to ${totalEntities}`);

    return c.json({
      message: 'Entity IDs migrated successfully',
      storiesUpdated: stories.length,
      tasksUpdated: tasks.length,
      totalUpdated: totalEntities,
      linksUpdated: links.filter(l => iriMapping.has(l.source) && iriMapping.has(l.target)).length,
      newCounter: totalEntities,
      prefix: projectPrefix
    });
  } catch (error) {
    console.error('Error migrating entity IDs:', error);
    return c.json({ error: 'Failed to migrate entity IDs', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * POST /api/projects/:slug/migrate-task-ids
 * Legacy endpoint - redirects to migrate-all-ids
 */
app.post('/:slug/migrate-task-ids', async (c) => {
  const slug = c.req.param('slug');
  return c.redirect(`/api/projects/${slug}/migrate-all-ids`, 307);
});

/**
 * POST /api/projects/:slug/fix-story-labels
 * Fix UserStory labels by extracting titles from storyText
 */
app.post('/:slug/fix-story-labels', async (c) => {
  try {
    const slug = c.req.param('slug');

    console.log('[Fix Labels] Fixing UserStory labels');

    // Get all UserStories with "Untitled Story" labels
    const storiesQuery = `
      ${PREFIX_STRING}
      SELECT ?story ?storyText
      WHERE {
        ?story a sro:UserStory .
        ?story rdfs:label "Untitled Story"@en .
        ?story sro:storyText ?storyText .
      }
    `;

    const stories = await sparqlSelect(storiesQuery);
    console.log(`[Fix Labels] Found ${stories.length} stories to fix`);

    let fixed = 0;
    for (const story of stories) {
      // Extract title from storyText
      // Format: "As a [role], I want [feature] so that [benefit]"
      // Extract the "I want [feature]" part
      const storyText = story.storyText;
      let title = 'Untitled Story';

      const wantMatch = storyText.match(/I want (.+?) so that/i);
      if (wantMatch) {
        title = wantMatch[1].trim();
        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);
      } else {
        // Fallback: use first 50 characters
        title = storyText.substring(0, 50);
      }

      // Update the label
      const updateQuery = `
        ${PREFIX_STRING}
        DELETE {
          <${story.story}> rdfs:label "Untitled Story"@en .
        }
        INSERT {
          <${story.story}> rdfs:label "${escapeSparqlString(title)}"@en .
        }
        WHERE {
          <${story.story}> a sro:UserStory .
        }
      `;

      await sparqlUpdate(updateQuery);
      console.log(`[Fix Labels] Fixed ${story.story}: "${title}"`);
      fixed++;
    }

    return c.json({
      message: 'UserStory labels fixed successfully',
      storiesFixed: fixed
    });
  } catch (error) {
    console.error('Error fixing story labels:', error);
    return c.json({ error: 'Failed to fix story labels', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/projects/:slug/export/csv
 * Export project data to CSV (Linear or Jira format)
 */
app.get('/:slug/export/csv', async (c) => {
  try {
    const slug = c.req.param('slug');
    const format = c.req.query('format') || 'linear'; // Default to Linear format

    if (format !== 'linear' && format !== 'jira') {
      return c.json({ error: 'Invalid format. Must be "linear" or "jira"' }, 400);
    }

    // Get project name
    const projectQuery = `
      ${PREFIX_STRING}
      SELECT ?name
      WHERE {
        ?project a sro:ScrumProject ;
                 pm:slug "${slug}" ;
                 rdfs:label ?name .
      }
    `;

    const projectResults = await sparqlSelect(projectQuery);
    if (projectResults.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const projectName = projectResults[0].name || slug;

    // Get all tasks/stories for the project
    const tasksQuery = `
      ${PREFIX_STRING}
      SELECT ?task ?title ?description ?status ?priority ?assignee ?type
             ?story_points ?created_at ?updated_at ?started_at ?completed_at ?due_date ?created_by
      WHERE {
        ?project pm:slug "${slug}" .
        ?task pm:belongsToProject ?project .
        OPTIONAL { ?task pm:title ?title }
        OPTIONAL { ?task pm:description ?description }
        OPTIONAL { ?task pm:status ?status }
        OPTIONAL { ?task pm:priority ?priority }
        OPTIONAL { ?task pm:assignedTo ?assignee }
        OPTIONAL { ?task pm:type ?type }
        OPTIONAL { ?task sro:storyPoints ?story_points }
        OPTIONAL { ?task pm:createdAt ?created_at }
        OPTIONAL { ?task pm:updatedAt ?updated_at }
        OPTIONAL { ?task pm:startedAt ?started_at }
        OPTIONAL { ?task pm:completedAt ?completed_at }
        OPTIONAL { ?task pm:dueDate ?due_date }
        OPTIONAL { ?task pm:createdBy ?created_by }
      }
      ORDER BY ?created_at
    `;

    const tasksResults = await sparqlSelect(tasksQuery);

    // Map to Task objects
    const tasks = tasksResults.map((row: any) => ({
      token: row.task?.split('/').pop() || '',
      title: row.title || 'Untitled',
      description: row.description || '',
      status: row.status || '',
      priority: row.priority || '',
      assignedTo: row.assignee || '',
      type: row.type || 'Task',
      storyPoints: row.story_points ? parseInt(row.story_points) : undefined,
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || '',
      startedAt: row.started_at || '',
      completedAt: row.completed_at || '',
      dueDate: row.due_date || '',
      createdBy: row.created_by || '',
    }));

    // Generate CSV based on format
    const csvContent = format === 'linear'
      ? generateLinearCSV(tasks, projectName)
      : generateJiraCSV(tasks, projectName);

    // Set headers for file download
    const filename = `${slug}_${format}_export_${new Date().toISOString().split('T')[0]}.csv`;

    c.header('Content-Type', 'text/csv; charset=utf-8');
    c.header('Content-Disposition', `attachment; filename="${filename}"`);

    return c.body(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return c.json({ error: 'Failed to export CSV', details: error.message }, 500);
  }
});

export default app;
