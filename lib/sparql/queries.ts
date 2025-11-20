/**
 * SPARQL Query Templates
 * Parameterized queries for common operations
 */

import { QueryTemplate } from './types';

/**
 * Get all tasks with their basic properties
 */
export const GET_ALL_TASKS: QueryTemplate = {
  name: 'getAllTasks',
  description: 'Retrieve all tasks with their properties',
  query: `
    PREFIX pm: <http://myapp.com/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?task ?title ?status ?assignee ?startDate ?endDate
    WHERE {
      ?task rdf:type pm:Task .
      ?task pm:title ?title .
      ?task pm:hasStatus ?status .
      OPTIONAL { ?task pm:assignedTo ?assignee }
      OPTIONAL { ?task pm:startDate ?startDate }
      OPTIONAL { ?task pm:endDate ?endDate }
    }
    ORDER BY ?startDate
    LIMIT 100
  `,
};

/**
 * Get task by ID with all properties
 */
export const GET_TASK_BY_ID: QueryTemplate = {
  name: 'getTaskById',
  description: 'Get a specific task by its ID',
  parameters: ['taskId'],
  query: `
    PREFIX pm: <http://myapp.com/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?title ?description ?status ?assignee ?startDate ?endDate
    WHERE {
      pm:{{taskId}} rdf:type pm:Task .
      pm:{{taskId}} pm:title ?title .
      pm:{{taskId}} pm:hasStatus ?status .
      OPTIONAL { pm:{{taskId}} pm:description ?description }
      OPTIONAL { pm:{{taskId}} pm:assignedTo ?assignee }
      OPTIONAL { pm:{{taskId}} pm:startDate ?startDate }
      OPTIONAL { pm:{{taskId}} pm:endDate ?endDate }
    }
  `,
};

/**
 * Get task dependencies (using transitive property)
 */
export const GET_TASK_DEPENDENCIES: QueryTemplate = {
  name: 'getTaskDependencies',
  description: 'Get all dependencies for a task (transitive)',
  parameters: ['taskId'],
  query: `
    PREFIX pm: <http://myapp.com/ontology#>

    SELECT ?dependency ?depTitle ?depStatus
    WHERE {
      pm:{{taskId}} pm:dependsOn+ ?dependency .
      ?dependency pm:title ?depTitle .
      ?dependency pm:hasStatus ?depStatus .
    }
    ORDER BY ?depTitle
  `,
};

/**
 * Get blocked tasks
 */
export const GET_BLOCKED_TASKS: QueryTemplate = {
  name: 'getBlockedTasks',
  description: 'Find all tasks that are blocked',
  query: `
    PREFIX pm: <http://myapp.com/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?task ?title ?assignee
    WHERE {
      ?task rdf:type pm:Task .
      ?task pm:hasStatus "blocked" .
      ?task pm:title ?title .
      OPTIONAL { ?task pm:assignedTo ?assignee }
    }
    ORDER BY ?title
  `,
};

/**
 * Get tasks by status
 */
export const GET_TASKS_BY_STATUS: QueryTemplate = {
  name: 'getTasksByStatus',
  description: 'Get all tasks with a specific status',
  parameters: ['status'],
  query: `
    PREFIX pm: <http://myapp.com/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?task ?title ?assignee ?startDate ?endDate
    WHERE {
      ?task rdf:type pm:Task .
      ?task pm:hasStatus "{{status}}" .
      ?task pm:title ?title .
      OPTIONAL { ?task pm:assignedTo ?assignee }
      OPTIONAL { ?task pm:startDate ?startDate }
      OPTIONAL { ?task pm:endDate ?endDate }
    }
    ORDER BY ?startDate
  `,
};

/**
 * Find critical path (tasks with no remaining dependencies)
 */
export const GET_CRITICAL_PATH: QueryTemplate = {
  name: 'getCriticalPath',
  description: 'Identify tasks on the critical path',
  query: `
    PREFIX pm: <http://myapp.com/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?task ?title ?startDate ?endDate
    WHERE {
      ?task rdf:type pm:Task .
      ?task pm:title ?title .
      ?task pm:startDate ?startDate .
      ?task pm:endDate ?endDate .

      # Tasks that other tasks depend on
      ?otherTask pm:dependsOn ?task .

      # Not already completed
      FILTER(?status != "done")
    }
    ORDER BY ?startDate
  `,
};

/**
 * Utility function to replace parameters in query templates
 */
export function buildQuery(
  template: QueryTemplate,
  params: Record<string, string>
): string {
  let query = template.query;

  if (template.parameters) {
    for (const param of template.parameters) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      query = query.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    }
  }

  return query;
}
