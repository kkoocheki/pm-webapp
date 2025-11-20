/**
 * Links/Dependencies API Routes
 */

import { Hono } from 'hono';
import { sparqlSelect, sparqlUpdate } from '../lib/sparql';
import { mapToLink, generateUniqueToken } from '../lib/mappers';
import { PREFIX_STRING, PREFIXES } from '../types';
import type { Link } from '../types';

const app = new Hono();

/**
 * GET /api/projects/:slug/links
 * List all links for a project
 */
app.get('/projects/:slug/links', async (c) => {
  try {
    const slug = c.req.param('slug');

    const query = `
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

    const results = await sparqlSelect(query);
    const links = results.map(mapToLink);

    return c.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return c.json({ error: 'Failed to fetch links' }, 500);
  }
});

/**
 * GET /api/projects/:slug/links/:token
 * Get a specific link
 */
app.get('/projects/:slug/links/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();

    const query = `
      ${PREFIX_STRING}
      SELECT ?link ?token ?source ?source_token ?target ?target_token ?type ?lag
      WHERE {
        ?project pm:slug "${slug}" .
        ?link a pm:Dependency ;
              pm:token "${token}" .
        ?link pm:source ?source ;
              pm:target ?target .
        ?source pm:belongsToProject ?project ;
                pm:token ?source_token .
        ?target pm:belongsToProject ?project ;
                pm:token ?target_token .
        BIND("${token}" AS ?token)
        OPTIONAL { ?link pm:type ?type }
        OPTIONAL { ?link pm:lag ?lag }
      }
    `;

    const results = await sparqlSelect(query);
    if (results.length === 0) {
      return c.json({ error: 'Link not found' }, 404);
    }

    const link = mapToLink(results[0]);
    return c.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    return c.json({ error: 'Failed to fetch link' }, 500);
  }
});

/**
 * POST /api/projects/:slug/links
 * Create a new link
 */
app.post('/projects/:slug/links', async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json<Partial<Link>>();

    if (!body.source_token || !body.target_token) {
      return c.json({ error: 'source_token and target_token are required' }, 400);
    }

    const token = body.token || generateUniqueToken('link');
    const linkIRI = `${PREFIXES.pm}Dependency/${token}`;
    const type = body.type || 'finish_to_start';
    const lag = body.lag || 0;

    const insertQuery = `
      ${PREFIX_STRING}
      INSERT {
        <${linkIRI}> a pm:Dependency ;
                     pm:token "${token}" ;
                     pm:source ?source ;
                     pm:target ?target ;
                     pm:type "${type}" ;
                     pm:lag "${lag}"^^xsd:integer .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?source pm:belongsToProject ?project ;
                pm:token "${body.source_token}" .
        ?target pm:belongsToProject ?project ;
                pm:token "${body.target_token}" .
      }
    `;

    await sparqlUpdate(insertQuery);

    const link: Link = {
      token,
      source_token: body.source_token,
      target_token: body.target_token,
      type,
      lag,
      iri: linkIRI,
    };

    return c.json(link, 201);
  } catch (error) {
    console.error('Error creating link:', error);
    return c.json({ error: 'Failed to create link' }, 500);
  }
});

/**
 * PUT /api/projects/:slug/links/:token
 * Update a link
 */
app.put('/projects/:slug/links/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();
    const body = await c.req.json<Partial<Link>>();

    const updates: string[] = [];
    if (body.type) updates.push(`pm:type "${body.type}"`);
    if (body.lag !== undefined) updates.push(`pm:lag "${body.lag}"^^xsd:integer`);

    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    const updateQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?link pm:type ?oldType .
        ?link pm:lag ?oldLag .
      }
      INSERT {
        ?link ${updates.join(' ;\n              ')} .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?link a pm:Dependency ;
              pm:token "${token}" .
        OPTIONAL { ?link pm:type ?oldType }
        OPTIONAL { ?link pm:lag ?oldLag }
      }
    `;

    await sparqlUpdate(updateQuery);

    return c.json({ message: 'Link updated successfully' });
  } catch (error) {
    console.error('Error updating link:', error);
    return c.json({ error: 'Failed to update link' }, 500);
  }
});

/**
 * DELETE /api/projects/:slug/links/:token
 * Delete a link
 */
app.delete('/projects/:slug/links/:token', async (c) => {
  try {
    const { slug, token } = c.req.param();

    const deleteQuery = `
      ${PREFIX_STRING}
      DELETE {
        ?link ?p ?o .
      }
      WHERE {
        ?project pm:slug "${slug}" .
        ?link a pm:Dependency ;
              pm:token "${token}" .
        ?link ?p ?o .
      }
    `;

    await sparqlUpdate(deleteQuery);

    return c.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return c.json({ error: 'Failed to delete link' }, 500);
  }
});

export default app;
