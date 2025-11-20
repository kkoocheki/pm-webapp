/**
 * SPARQL Client for GraphDB
 * Handles connection and query execution to the RDF triple store
 */

import { SPARQLConfig, SPARQLQueryResult } from './types';

export class SPARQLClient {
  private config: SPARQLConfig;

  constructor(config: SPARQLConfig) {
    this.config = config;
  }

  /**
   * Execute a SPARQL SELECT query
   */
  async query(sparql: string): Promise<SPARQLQueryResult> {
    const startTime = Date.now();
    const url = `${this.config.endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          Accept: 'application/sparql-results+json',
          ...(this.config.username &&
            this.config.password && {
              Authorization: `Basic ${Buffer.from(
                `${this.config.username}:${this.config.password}`
              ).toString('base64')}`,
            }),
        },
        body: sparql,
      });

      if (!response.ok) {
        throw new Error(
          `SPARQL query failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > 500) {
        console.warn(`Slow SPARQL query (${duration}ms):`, sparql);
      }

      return data;
    } catch (error) {
      console.error('SPARQL query error:', error);
      throw error;
    }
  }

  /**
   * Execute a SPARQL UPDATE query
   */
  async update(sparql: string): Promise<void> {
    const url = `${this.config.endpoint}/statements`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-update',
          ...(this.config.username &&
            this.config.password && {
              Authorization: `Basic ${Buffer.from(
                `${this.config.username}:${this.config.password}`
              ).toString('base64')}`,
            }),
        },
        body: sparql,
      });

      if (!response.ok) {
        throw new Error(
          `SPARQL update failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('SPARQL update error:', error);
      throw error;
    }
  }

  /**
   * Test connection to GraphDB
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT * WHERE { ?s ?p ?o } LIMIT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Initialize with environment variables
// This will be configured in Phase 2
export const sparqlClient = new SPARQLClient({
  endpoint: process.env.GRAPHDB_ENDPOINT || 'http://localhost:7200/repositories/pm',
  repository: process.env.GRAPHDB_REPOSITORY || 'pm',
  username: process.env.GRAPHDB_USERNAME,
  password: process.env.GRAPHDB_PASSWORD,
});
