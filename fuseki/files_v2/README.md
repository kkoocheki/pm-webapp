# Knoid Scrum PM Ontology v2.0.0

A comprehensive semantic web ontology for Scrum-based project management, designed to support knowledge representation, automated reasoning, and AI-powered project insights.

## Overview

The Knoid Scrum PM Ontology integrates concepts from:
- **Scrum Reference Ontology (SRO)** - Santos et al., 2021
- **Software Engineering Ontology Network (SEON)**
- **Project Management Body of Knowledge (PMBOK)**
- **W3C Time Ontology** - for temporal reasoning
- **PROV-O** - for provenance tracking

## Files Included

| File | Description |
|------|-------------|
| `scrum_pm_ontology_v2.ttl` | Main ontology with all classes, properties, and axioms |
| `custom.rules` | Jena inference rules for Scrum-specific reasoning |
| `rdfs_useful.rules` | Enhanced RDFS entailment rules with OWL extensions |
| `temporal.rules` | Allen's interval algebra for temporal reasoning |
| `example_project_scrum_aligned_v2.ttl` | Example project data demonstrating proper usage |
| `fuseki_config.ttl` | Apache Jena Fuseki server configuration |
| `sparql_queries.rq` | Collection of useful SPARQL query examples |
| `shacl_shapes.ttl` | SHACL validation shapes for data quality |

## Namespace Prefixes

```turtle
@prefix sro:    <https://www.knoid.io/ontologies/sro#> .   # Scrum Reference Ontology
@prefix pm:     <https://www.knoid.io/ontologies/pm#> .    # Project Management
@prefix spo:    <https://www.knoid.io/ontologies/spo#> .   # Software Process Ontology
@prefix eo:     <https://www.knoid.io/ontologies/eo#> .    # Enterprise Ontology
@prefix rsro:   <https://www.knoid.io/ontologies/rsro#> .  # Requirements Ontology
```

## Key Classes

### Project Structure
- `sro:ScrumProject` - A project using Scrum methodology
- `sro:Sprint` - Time-boxed iteration (1-4 weeks)
- `sro:ProductBacklog` - Prioritized list of product requirements
- `sro:SprintBacklog` - Stories selected for a sprint

### Work Items
- `sro:Epic` - Large user story decomposed into smaller stories
- `sro:UserStory` - Requirement from user's perspective
- `pm:Task` - Unit of work within a story
- `sro:AcceptanceCriterion` - Verification condition for stories

### Roles
- `sro:ProductOwner` - Maximizes product value
- `sro:ScrumMaster` - Facilitates Scrum process
- `sro:Developer` - Develops the product
- `sro:QAEngineer` - Quality assurance specialist (new in v2)

### States
- `sro:Backlog`, `sro:ToDo`, `sro:InProgress`, `sro:InReview`, `sro:Done`, `sro:Blocked`, `sro:Cancelled`

### Critical Path Method
- `pm:CriticalTask` - Task with zero float
- `pm:CriticalPath` - Longest path through project network
- `pm:Dependency` - Precedence relationship between activities

## Key Properties

### Temporal Properties
```turtle
pm:hasPlannedStart    # Planned start date (xsd:date)
pm:hasPlannedEnd      # Planned end date (xsd:date)
pm:hasActualStart     # Actual start date (xsd:date)
pm:hasActualEnd       # Actual end date (xsd:date)
pm:duration           # Duration in days (xsd:decimal)
```

### Story/Task Properties
```turtle
sro:storyPoints       # Relative sizing (xsd:decimal)
sro:storyText         # "As a... I want... So that..."
sro:hasState          # Current workflow state
sro:hasPriority       # Priority level
pm:estimatedEffort    # Estimated effort (xsd:duration)
pm:actualEffort       # Actual effort spent (xsd:duration)
```

### Relationships
```turtle
sro:decomposedInto    # Epic → UserStory
sro:hasTask           # UserStory → Task
pm:hasParent          # Child → Parent hierarchy
sro:isInSprint        # Story → Sprint assignment
pm:assignedTo         # Work item → Team member
pm:finishToStart      # Dependency shorthand
```

## Inference Rules

### Story Completion
Stories are automatically marked Done when:
- They have an `AcceptedDeliverable` that materializes them
- All child tasks are completed

### Blocked Detection
Tasks are automatically marked Blocked when:
- A predecessor with FinishToStart dependency is not Done
- They have an unresolved `Impediment`

### Critical Path
Tasks are classified as `CriticalTask` when:
- `pm:totalFloat` equals 0

### Dependency Inference
Reified dependencies automatically generate direct property edges:
```turtle
# Reified form
ex:dep a pm:Dependency ;
    pm:predecessor ex:T1 ;
    pm:successor ex:T2 ;
    pm:linkType pm:FinishToStart .

# Infers direct edge
ex:T1 pm:finishToStart ex:T2 .
```

## Quick Start

### 1. Start Fuseki Server

```bash
# Create directory structure
mkdir -p DB/knoid rules ontology data

# Copy files
cp scrum_pm_ontology_v2.ttl ontology/
cp example_project_scrum_aligned_v2.ttl data/
cp *.rules rules/

# Start Fuseki
fuseki-server --config=fuseki_config.ttl
```

### 2. Load Data

```bash
# Load ontology
curl -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary @ontology/scrum_pm_ontology_v2.ttl \
  http://localhost:3030/knoid/data

# Load example data
curl -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary @data/example_project_scrum_aligned_v2.ttl \
  http://localhost:3030/knoid/data
```

### 3. Run SPARQL Queries

Access the Fuseki UI at `http://localhost:3030/` or use curl:

```bash
curl -X POST \
  -H "Content-Type: application/sparql-query" \
  -H "Accept: application/sparql-results+json" \
  --data-binary @sparql_queries.rq \
  http://localhost:3030/knoid/query
```

### 4. Validate Data with SHACL

```bash
# Using Apache Jena SHACL
shacl validate --shapes shacl_shapes.ttl --data data/example_project_scrum_aligned_v2.ttl
```

## Example Data Structure

The example project demonstrates:

```
ProjectAlpha (ScrumProject)
├── ProductBacklog1
│   ├── E1: User Onboarding (Epic)
│   │   ├── S1: Signup with Email (Done)
│   │   │   ├── T1: Design signup API
│   │   │   ├── T2: Implement signup API
│   │   │   └── T3: QA signup API
│   │   ├── S2: Profile Creation (Done)
│   │   └── S3: Welcome Tour (InProgress)
│   ├── E2: Reporting Dashboard (Epic)
│   │   ├── S4: Metrics Ingestion (Done)
│   │   ├── S5: Chart Components (InReview)
│   │   └── S6: Export to CSV (ToDo)
│   └── E3: Payments Integration (Epic)
│       ├── S7: Payment Provider Selection (Done)
│       ├── S8: Checkout Flow (InProgress)
│       └── S9: Refunds and Webhooks (ToDo)
├── Sprint1 (2 weeks)
├── Sprint2 (2 weeks)
└── Sprint3 (2 weeks)
```

## Version 2.0 Changes

### New Property Declarations
- `sro:sprintNumber` - Sequential sprint identifier
- `sro:sprintDuration` - Sprint length (xsd:duration)
- `sro:storyText` - Full user story text
- `pm:taskDescription` - Detailed task description
- `pm:estimatedEffort` / `pm:actualEffort` - Effort tracking
- `sro:acceptedBy` / `sro:acceptanceDate` - Acceptance tracking

### New Classes
- `sro:QAEngineer` - QA role as Developer subclass
- `sro:Blocked` - Blocked state
- `sro:Impediment` - Blockers/obstacles
- `sro:Risk` / `sro:RiskLevel` - Risk management

### Namespace Fixes
- Properties now use correct namespaces (eo:name, eo:email, spo:participatesIn)
- Consistent property usage across ontology and example data

### Enhanced Rules
- 16 sections of inference rules covering all major use cases
- Bidirectional dependency inference
- Blocked task detection
- Sprint context propagation

## API Integration

### FastAPI Example

```python
from rdflib import Graph, Namespace
from SPARQLWrapper import SPARQLWrapper, JSON

SRO = Namespace("https://www.knoid.io/ontologies/sro#")
PM = Namespace("https://www.knoid.io/ontologies/pm#")

def get_sprint_stories(sprint_uri: str):
    sparql = SPARQLWrapper("http://localhost:3030/knoid/query")
    sparql.setQuery(f"""
        PREFIX sro: <https://www.knoid.io/ontologies/sro#>
        PREFIX eo: <https://www.knoid.io/ontologies/eo#>
        
        SELECT ?story ?name ?state ?points
        WHERE {{
            ?story sro:isInSprint <{sprint_uri}> ;
                   eo:name ?name ;
                   sro:hasState ?state .
            OPTIONAL {{ ?story sro:storyPoints ?points }}
        }}
    """)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()
```

## License

This ontology is provided as part of the Knoid.io platform.

## References

1. Santos, L. O., et al. (2021). Scrum Reference Ontology. Applied Ontology.
2. W3C. (2017). Time Ontology in OWL. https://www.w3.org/TR/owl-time/
3. W3C. (2013). PROV-O: The PROV Ontology. https://www.w3.org/TR/prov-o/
4. PMI. (2017). Project Management Body of Knowledge (PMBOK® Guide).

---

**Version**: 2.0.0  
**Date**: 2025-11-27  
**Author**: Knoid Development Team
