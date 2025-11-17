# RDF Data Model Documentation

## Overview

This application uses RDF (Resource Description Framework) to represent project management data as a knowledge graph. This enables powerful reasoning capabilities and flexible querying with SPARQL.

## Namespace Prefixes

```turtle
@prefix pm: <http://myapp.com/ontology#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
```

## Core Classes

### pm:Task
Main entity representing a work item.

**Properties:**
- `pm:title` (string) - Task title
- `pm:description` (string) - Detailed description
- `pm:hasStatus` (TaskStatus) - Current status
- `pm:assignedTo` (pm:User) - Assigned user
- `pm:startDate` (xsd:date) - Start date
- `pm:endDate` (xsd:date) - End date
- `pm:dependsOn` (pm:Task) - Task dependencies (transitive)
- `pm:estimatedHours` (xsd:integer) - Estimated effort
- `pm:actualHours` (xsd:integer) - Actual effort

**Example:**
```turtle
pm:task-123 rdf:type pm:Task ;
    pm:title "Implement authentication" ;
    pm:description "Add JWT-based auth to API" ;
    pm:hasStatus pm:in-progress ;
    pm:assignedTo pm:user-alice ;
    pm:startDate "2024-01-15"^^xsd:date ;
    pm:endDate "2024-01-22"^^xsd:date ;
    pm:dependsOn pm:task-122 ;
    pm:estimatedHours 16 .
```

### pm:Project
Container for related tasks.

**Properties:**
- `pm:name` (string) - Project name
- `pm:description` (string) - Project description
- `pm:hasTask` (pm:Task) - Tasks in this project
- `pm:startDate` (xsd:date) - Project start
- `pm:targetDate` (xsd:date) - Target completion

**Example:**
```turtle
pm:project-main rdf:type pm:Project ;
    pm:name "Main Project" ;
    pm:description "Primary development project" ;
    pm:hasTask pm:task-123 ;
    pm:startDate "2024-01-01"^^xsd:date ;
    pm:targetDate "2024-12-31"^^xsd:date .
```

### pm:User
Represents a team member.

**Properties:**
- `pm:name` (string) - Full name
- `pm:email` (string) - Email address
- `pm:role` (string) - Role/title

**Example:**
```turtle
pm:user-alice rdf:type pm:User ;
    pm:name "Alice Johnson" ;
    pm:email "alice@example.com" ;
    pm:role "Senior Developer" .
```

## Task Status Values

```turtle
pm:planned rdf:type pm:TaskStatus .
pm:in-progress rdf:type pm:TaskStatus .
pm:blocked rdf:type pm:TaskStatus .
pm:done rdf:type pm:TaskStatus .
```

## Object Properties

### pm:dependsOn
Represents task dependencies.

**Characteristics:**
- **Transitive**: If A depends on B, and B depends on C, then A depends on C
- **Domain**: pm:Task
- **Range**: pm:Task

```turtle
pm:dependsOn rdf:type owl:ObjectProperty ;
    rdf:type owl:TransitiveProperty ;
    rdfs:domain pm:Task ;
    rdfs:range pm:Task .
```

### pm:assignedTo
Links tasks to users.

**Characteristics:**
- **Functional**: A task can only be assigned to one user
- **Domain**: pm:Task
- **Range**: pm:User

```turtle
pm:assignedTo rdf:type owl:ObjectProperty ;
    rdf:type owl:FunctionalProperty ;
    rdfs:domain pm:Task ;
    rdfs:range pm:User .
```

## Reasoning Rules

### OWL 2 RL Profile

The system uses OWL 2 RL reasoning to infer new facts:

#### 1. Transitive Dependencies
```turtle
# If task A depends on B, and B depends on C
# Then A transitively depends on C
pm:task-a pm:dependsOn pm:task-b .
pm:task-b pm:dependsOn pm:task-c .
# Inferred:
pm:task-a pm:dependsOn pm:task-c .
```

#### 2. Critical Path Detection
Tasks on the critical path are identified by:
- Having other tasks depend on them
- Not being completed
- Being part of the longest dependency chain

#### 3. Blocked Task Inference
A task is considered blocked if:
- Its status is explicitly `pm:blocked`, OR
- It depends on tasks that are not yet done

## Common SPARQL Patterns

### 1. Get All Tasks with Status
```sparql
SELECT ?task ?title ?status
WHERE {
  ?task rdf:type pm:Task .
  ?task pm:title ?title .
  ?task pm:hasStatus ?status .
}
```

### 2. Find Transitive Dependencies
```sparql
SELECT ?dependency ?depTitle
WHERE {
  pm:task-123 pm:dependsOn+ ?dependency .
  ?dependency pm:title ?depTitle .
}
```

### 3. Find Tasks Assigned to User
```sparql
SELECT ?task ?title
WHERE {
  ?task rdf:type pm:Task .
  ?task pm:title ?title .
  ?task pm:assignedTo pm:user-alice .
}
```

### 4. Calculate Project Progress
```sparql
SELECT ?project (COUNT(?done) AS ?completed) (COUNT(?total) AS ?totalTasks)
WHERE {
  ?project rdf:type pm:Project .
  ?project pm:hasTask ?total .
  OPTIONAL {
    ?total pm:hasStatus pm:done .
    BIND(?total AS ?done)
  }
}
GROUP BY ?project
```

### 5. Find Critical Path
```sparql
SELECT ?task ?title ?startDate ?endDate
WHERE {
  ?task rdf:type pm:Task .
  ?task pm:title ?title .
  ?task pm:startDate ?startDate .
  ?task pm:endDate ?endDate .

  # Tasks that other tasks depend on
  ?otherTask pm:dependsOn ?task .

  # Not completed
  FILTER NOT EXISTS { ?task pm:hasStatus pm:done }
}
ORDER BY ?startDate
```

## Sample Data

```turtle
# Users
pm:user-alice rdf:type pm:User ;
    pm:name "Alice Johnson" ;
    pm:email "alice@example.com" .

pm:user-bob rdf:type pm:User ;
    pm:name "Bob Smith" ;
    pm:email "bob@example.com" .

# Project
pm:project-main rdf:type pm:Project ;
    pm:name "Main Project" ;
    pm:hasTask pm:task-1, pm:task-2, pm:task-3 .

# Tasks
pm:task-1 rdf:type pm:Task ;
    pm:title "Setup infrastructure" ;
    pm:hasStatus pm:done ;
    pm:assignedTo pm:user-alice ;
    pm:startDate "2024-01-01"^^xsd:date ;
    pm:endDate "2024-01-05"^^xsd:date .

pm:task-2 rdf:type pm:Task ;
    pm:title "Implement API" ;
    pm:hasStatus pm:in-progress ;
    pm:assignedTo pm:user-bob ;
    pm:dependsOn pm:task-1 ;
    pm:startDate "2024-01-06"^^xsd:date ;
    pm:endDate "2024-01-15"^^xsd:date .

pm:task-3 rdf:type pm:Task ;
    pm:title "Build frontend" ;
    pm:hasStatus pm:planned ;
    pm:assignedTo pm:user-alice ;
    pm:dependsOn pm:task-2 ;
    pm:startDate "2024-01-16"^^xsd:date ;
    pm:endDate "2024-01-30"^^xsd:date .
```

## Loading Data into GraphDB

### Using Turtle Files
```bash
curl -X POST \
  -H "Content-Type: application/x-turtle" \
  --data-binary @data.ttl \
  http://localhost:7200/repositories/pm/statements
```

### Using SPARQL UPDATE
```sparql
INSERT DATA {
  pm:task-new rdf:type pm:Task ;
    pm:title "New Task" ;
    pm:hasStatus pm:planned .
}
```

## Next Steps

1. Define additional classes (Milestone, Sprint, etc.)
2. Add more properties (priority, tags, etc.)
3. Create custom reasoning rules
4. Define SHACL shapes for validation
