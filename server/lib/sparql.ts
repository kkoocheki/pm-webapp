/**
 * SPARQL Client for Apache Jena Fuseki
 * Handles all RDF triple store operations
 */

import { QueryEngine } from '@comunica/query-sparql';
import { Parser, Generator } from 'sparqljs';

const FUSEKI_URL = process.env.NEXT_PUBLIC_GRAPHDB_ENDPOINT || 'http://localhost:3030';
// Available datasets: ds-owl (OWL inference), ds-rdfs (RDFS inference), ds-rules (custom rules), ds-base (no inference)
const DATASET = process.env.NEXT_PUBLIC_GRAPHDB_DATASET || 'ds-rules';

export const SPARQL_ENDPOINT = `${FUSEKI_URL}/${DATASET}/sparql`;
export const SPARQL_UPDATE_ENDPOINT = `${FUSEKI_URL}/${DATASET}/update`;

const engine = new QueryEngine();
const parser = new Parser();
const generator = new Generator();

/**
 * Execute a SPARQL SELECT query
 */
export async function sparqlSelect<T = any>(query: string): Promise<T[]> {
  try {
    const bindingsStream = await engine.queryBindings(query, {
      sources: [SPARQL_ENDPOINT],
    });

    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => {
      const row: any = {};
      // @ts-ignore - Comunica types are inconsistent
      for (const [key, value] of binding.entries()) {
        row[key] = value.value;
      }
      return row as T;
    });
  } catch (error) {
    console.error('SPARQL SELECT error:', error);
    throw new Error(`SPARQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a SPARQL CONSTRUCT query
 */
export async function sparqlConstruct(query: string): Promise<string> {
  try {
    const quadStream = await engine.queryQuads(query, {
      sources: [SPARQL_ENDPOINT],
    });

    const quads = await quadStream.toArray();

    // Convert quads to Turtle format
    const { Writer } = await import('n3');
    const writer = new Writer();

    for (const quad of quads) {
      writer.addQuad(quad);
    }

    return new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } catch (error) {
    console.error('SPARQL CONSTRUCT error:', error);
    throw new Error(`SPARQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a SPARQL ASK query
 */
export async function sparqlAsk(query: string): Promise<boolean> {
  try {
    const result = await engine.queryBoolean(query, {
      sources: [SPARQL_ENDPOINT],
    });
    return result;
  } catch (error) {
    console.error('SPARQL ASK error:', error);
    throw new Error(`SPARQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a SPARQL UPDATE query
 */
export async function sparqlUpdate(query: string): Promise<void> {
  try {
    const response = await fetch(SPARQL_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-update',
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL update failed: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('SPARQL UPDATE error:', error);
    throw new Error(`SPARQL update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload RDF data (Turtle format) to Fuseki
 */
export async function uploadRDF(data: string, graph?: string): Promise<void> {
  try {
    const url = graph
      ? `${FUSEKI_URL}/${DATASET}/data?graph=${encodeURIComponent(graph)}`
      : `${FUSEKI_URL}/${DATASET}/data`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: data,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RDF upload failed: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('RDF upload error:', error);
    throw new Error(`RDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all triples in a graph or the default graph
 */
export async function clearGraph(graph?: string): Promise<void> {
  const graphClause = graph ? `GRAPH <${graph}>` : '';
  const query = `
    DELETE {
      ${graphClause} {
        ?s ?p ?o
      }
    }
    WHERE {
      ${graphClause} {
        ?s ?p ?o
      }
    }
  `;
  await sparqlUpdate(query);
}

/**
 * Check if Fuseki is available
 */
export async function checkFusekiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${FUSEKI_URL}/$/ping`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Escape a string for use in SPARQL literals
 */
export function escapeSparqlString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Create a SPARQL IRI reference
 */
export function iri(uri: string): string {
  return `<${uri}>`;
}

/**
 * Create a SPARQL literal
 */
export function literal(value: string | number | boolean, datatype?: string): string {
  if (typeof value === 'number') {
    return `"${value}"^^<http://www.w3.org/2001/XMLSchema#integer>`;
  }
  if (typeof value === 'boolean') {
    return `"${value}"^^<http://www.w3.org/2001/XMLSchema#boolean>`;
  }
  if (datatype) {
    return `"${escapeSparqlString(value)}"^^<${datatype}>`;
  }
  return `"${escapeSparqlString(value)}"`;
}
