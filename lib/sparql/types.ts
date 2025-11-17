/**
 * SPARQL and RDF Type Definitions
 */

export interface SPARQLConfig {
  endpoint: string;
  repository: string;
  username?: string;
  password?: string;
}

export interface SPARQLQueryResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, SPARQLBinding>[];
  };
}

export interface SPARQLBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string;
  'xml:lang'?: string;
}

export interface RDFTask {
  uri: string;
  title: string;
  status: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
}

export interface QueryTemplate {
  name: string;
  query: string;
  description: string;
  parameters?: string[];
}
