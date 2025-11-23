/**
 * SPARQL Client for Apache Jena Fuseki
 * Handles all RDF triple store operations
 * Using simple fetch-based approach for reliability
 */

const FUSEKI_URL = process.env.NEXT_PUBLIC_GRAPHDB_ENDPOINT || 'http://localhost:3030';
const DATASET = process.env.NEXT_PUBLIC_GRAPHDB_DATASET || 'gantt';

export const SPARQL_ENDPOINT = `${FUSEKI_URL}/${DATASET}/sparql`;
export const SPARQL_UPDATE_ENDPOINT = `${FUSEKI_URL}/${DATASET}/update`;

/**
 * Execute a SPARQL SELECT query using fetch
 */
export async function sparqlSelect<T = any>(query: string): Promise<T[]> {
  try {
    const response = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL query failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const bindings = data.results?.bindings || [];

    return bindings.map((binding: any) => {
      const row: any = {};
      for (const [key, value] of Object.entries(binding)) {
        row[key] = (value as any).value;
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
    const response = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'text/turtle',
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL CONSTRUCT failed: ${response.status} - ${errorText}`);
    }

    return await response.text();
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
    const response = await fetch(SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL ASK failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.boolean === true;
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
