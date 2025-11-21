# Fuseki Inference Setup Guide

## Overview

This project uses **Apache Jena Fuseki** with **built-in inference** for semantic reasoning over PM data. The inference happens natively in Java, not in the TypeScript backend.

## Architecture

```
┌─────────────────────────────────────────────┐
│  TypeScript Backend (Hono)                  │
│  - REST API                                 │
│  - Simple SPARQL queries                    │
│  - No reasoning logic needed!               │
└──────────────────┬──────────────────────────┘
                   │ HTTP/SPARQL
                   ↓
┌─────────────────────────────────────────────┐
│  Fuseki (Java) with Inference               │
│  - Generic Rule Reasoner                    │
│  - Temporal Rules (Allen's Interval)        │
│  - RDFS Rules                               │
│  - Custom PM Rules                          │
│  - TDB2 Storage                             │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
fuseki/
├── config.ttl              # Fuseki configuration
├── rules/
│   ├── temporal.rules      # Allen's interval algebra (13 relations)
│   ├── rdfs_useful.rules   # RDFS domain/range/subProperty/subClass
│   └── custom.rules        # Your PM-specific rules
├── ontology/               # Your PM and SRO ontologies
└── databases/              # TDB2 data (auto-created, in Docker volume)
```

## Inference Rules Included

### 1. Temporal Rules (`temporal.rules`)

**Allen's Interval Algebra** - 13 temporal relations:
- `time:before` - Interval before another
- `time:intervalMeets` - End of i1 == start of i2
- `time:intervalStarts` - Same start, i1 ends before i2
- `time:intervalFinishes` - Same end, i1 starts after i2
- `time:intervalDuring` - i1 completely within i2
- `time:intervalContains` - i1 completely contains i2
- `time:intervalOverlaps` - i1 starts before i2 but overlaps
- `time:intervalEquals` - Same start and end

**Example:**
```turtle
# If task has interval during sprint interval
# Then sprint contains task (automatic inference)
```

### 2. RDFS Rules (`rdfs_useful.rules`)

Core RDFS entailments:
- **rdfs:domain** - Infer subject type from property
- **rdfs:range** - Infer object type from property
- **rdfs:subPropertyOf** - Property inheritance
- **rdfs:subClassOf** - Class inheritance

### 3. PM Custom Rules (`custom.rules`)

Your PM-specific inference rules:

**Blocked Task Detection:**
```
If task depends on predecessor AND predecessor not done
→ Task is blocked
```

**Critical Task Inference:**
```
If task has high priority
→ Task is critical
```

**Story Completion:**
```
If all tasks implementing story are done
→ Story is done
```

**Sprint Task Assignment:**
```
If task interval is during sprint interval
→ Sprint contains task
```

**Task Overrun Detection:**
```
If actual end date > planned end date
→ Task has overrun
```

## How to Use

### 1. Start Fuseki

```bash
docker-compose up -d
```

This starts Fuseki on `http://localhost:3030` with:
- Dataset name: `gantt`
- All rules loaded automatically
- TDB2 storage with persistence
- Admin UI: http://localhost:3030/#/

### 2. Query with Automatic Inference

When you query, **inferred triples are automatically included**:

```sparql
PREFIX pm: <http://www.example.org/pm#>

SELECT ?task ?isBlocked WHERE {
  ?task a pm:Task .
  ?task pm:isBlocked ?isBlocked .  # This might be inferred!
}
```

### 3. Add Your Own Rules

Edit `fuseki/rules/custom.rules`:

```
# Your custom rule
[MyRule:
  (?x pm:someProperty ?y)
  greaterThan(?y, 100)
  ->
  (?x pm:isLarge true)
]
```

**Restart Fuseki** to load new rules:
```bash
docker-compose restart fuseki
```

## Rule Syntax

### Basic Structure

```
[RuleName:
  # Conditions (AND-ed together)
  (?subject ?predicate ?object)
  (?x rdf:type pm:Task)

  # Built-in functions
  greaterThan(?a, ?b)
  equal(?x, ?y)
  notEqual(?x, ?y)

  ->

  # Conclusion (new triple to infer)
  (?subject pm:inferredProperty ?value)
]
```

### Available Built-ins

| Function | Description |
|----------|-------------|
| `greaterThan(?a, ?b)` | Numeric/date comparison |
| `lessThan(?a, ?b)` | Numeric/date comparison |
| `equal(?a, ?b)` | Equality check |
| `notEqual(?a, ?b)` | Inequality check |
| `bound(?x)` | Variable is bound |
| `unbound(?x)` | Variable is not bound |
| `noValue(?s ?p ?o)` | No matching triple |
| `strConcat(?out, ?s1, ?s2)` | String concatenation |
| `regex(?text, ?pattern)` | Regex matching |

[Full list](https://jena.apache.org/documentation/inference/#RULEbuiltins)

## Querying Inferred Data

### Check What Was Inferred

```sparql
PREFIX pm: <http://www.example.org/pm#>

SELECT ?task ?property ?value WHERE {
  ?task a pm:Task .
  ?task ?property ?value .

  # Filter to only inferred properties
  FILTER(?property IN (pm:isBlocked, pm:isCritical, pm:hasOverrun))
}
```

### Trace Derivations (Debug)

The config has `inf:derivationLogging true`, so you can trace how inferences were made using Jena's Java API (not exposed via SPARQL, but useful in development).

## Performance

### Inference Mode

Config uses **forward chaining** (`inf:mode "forward"`):
- ✅ **Fast queries** - Inferences computed once on data load
- ✅ **No query overhead** - Results pre-computed
- ❌ **Slower updates** - Re-computes inferences on data change

For read-heavy workloads (like this app), forward chaining is optimal.

### Caching

Config enables **TGC caching** (`rr:enableTGCCaching true`):
- Caches transitive closure results
- Faster for subclass/subproperty hierarchies

## Integration with TypeScript Backend

The backend **doesn't need reasoning logic anymore**:

```typescript
// Before: Manual reasoning in TypeScript
export async function getBlockedTasks(projectSlug: string) {
  // ... complex logic to determine if task is blocked ...
}

// After: Just query Fuseki (it does reasoning)
export async function getBlockedTasks(projectSlug: string) {
  return sparqlSelect(`
    SELECT ?task WHERE {
      ?task pm:isBlocked true .
    }
  `);
}
```

**Fuseki does all the work!** 🎉

## Monitoring & Debugging

### Check Fuseki is Running

```bash
curl http://localhost:3030/$/ping
```

### View Dataset Info

```bash
curl http://localhost:3030/$/stats/gantt
```

### Check Loaded Rules

Rules are loaded from files at startup. Check logs:

```bash
docker-compose logs fuseki | grep "rules"
```

### Fuseki Admin UI

Visit: http://localhost:3030/#/

- View datasets
- Run queries manually
- Upload data
- Check statistics

## Common Issues

### Rules Not Loading

**Problem:** New rules don't take effect

**Solution:** Restart Fuseki
```bash
docker-compose restart fuseki
```

### Slow Queries

**Problem:** Queries take too long

**Solutions:**
1. Reduce rule complexity
2. Use indexes (TDB2 auto-indexes)
3. Switch to backward chaining for specific rules
4. Limit inference to needed predicates

### Inference Not Happening

**Problem:** Expected inferences don't appear

**Debug:**
1. Check rule syntax in `.rules` files
2. Verify data matches rule conditions
3. Check Fuseki logs for rule errors
4. Test with simpler rule first

## Adding Temporal Reasoning

Your data needs OWL Time ontology structure:

```turtle
@prefix time: <http://www.w3.org/2006/time#> .
@prefix pm: <http://www.example.org/pm#> .

# Task with temporal interval
pm:Task1 a pm:Task ;
  pm:title "Implement feature" ;
  time:hasInterval [
    a time:Interval ;
    time:hasBeginning [
      a time:Instant ;
      time:inXSDDateTimeStamp "2025-01-01T09:00:00Z"^^xsd:dateTimeStamp
    ] ;
    time:hasEnd [
      a time:Instant ;
      time:inXSDDateTimeStamp "2025-01-05T17:00:00Z"^^xsd:dateTimeStamp
    ]
  ] .

# Temporal rules will automatically infer:
# - If Task1 before Task2
# - If Task1 during Sprint1
# - If Task1 overlaps Task2
# etc.
```

## Resources

- [Jena Rule Syntax](https://jena.apache.org/documentation/inference/#RULEsyntax)
- [Built-in Functions](https://jena.apache.org/documentation/inference/#RULEbuiltins)
- [OWL Time Ontology](https://www.w3.org/TR/owl-time/)
- [Allen's Interval Algebra](https://en.wikipedia.org/wiki/Allen%27s_interval_algebra)
- [Your Original Repo](https://github.com/kkoocheki/jena-fuseki-inf-main)

## Next Steps

1. ✅ Start Fuseki: `docker-compose up -d`
2. ✅ Start backend: `npm run dev`
3. 📝 Add your PM data with temporal intervals
4. 🔍 Query and see automatic inferences!
5. ➕ Add more custom rules as needed

**Your rules are now part of the knowledge graph!**
