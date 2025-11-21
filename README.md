# PM WebApp - RDF-Powered Project Management

A modern project management application powered by **semantic web technologies** with **automatic reasoning**.

## 🎯 Quick Start

### Prerequisites
- **Node.js 20+**
- **Docker** (for Fuseki)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start Fuseki (RDF database with reasoning)
docker-compose up -d

# 4. Start the application
npm run dev
```

**That's it!**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Fuseki Admin**: http://localhost:3030

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│  Next.js Frontend (React)           │
│  - Kanban Board                      │
│  - Task Table                        │
│  - Gantt Chart                       │
│  - Dependencies View                 │
│  - Insights & Reasoning              │
│  - Import (TTL, Jira, etc.)          │
└────────────┬─────────────────────────┘
             │ HTTP REST API
             ↓
┌──────────────────────────────────────┐
│  TypeScript Backend (Hono)           │
│  - REST API endpoints                │
│  - Business logic                    │
│  - Data mapping                      │
└────────────┬─────────────────────────┘
             │ SPARQL Queries
             ↓
┌──────────────────────────────────────┐
│  Fuseki (Jena) with Inference        │
│  - RDF Triple Store (TDB2)           │
│  - Automatic Reasoning               │
│    • Temporal (Allen's Interval)     │
│    • RDFS (domain/range/subClass)    │
│    • Custom PM Rules                 │
│  - SPARQL Query Engine               │
└──────────────────────────────────────┘
```

## ✨ Features

### Core PM Features
- ✅ **Kanban Board** - Drag-and-drop task management
- ✅ **Task Table** - Detailed task list with filtering
- ✅ **Gantt Chart** - Timeline visualization
- ✅ **Dependencies** - Task relationships and critical path
- ✅ **User Stories** - Scrum Reference Ontology support

### Advanced Features
- ✅ **Semantic Reasoning** - Automatic inference of:
  - Blocked tasks (dependencies not complete)
  - Critical tasks (high priority)
  - Task overruns (missed deadlines)
  - Story completion (all tasks done)
  - Temporal relationships (before/during/overlaps)
- ✅ **Critical Path Analysis** - CPM algorithm
- ✅ **Import/Export**:
  - RDF Turtle (.ttl) files
  - Jira integration (projects, issues, sprints)
  - GitHub (coming soon)
  - Asana (coming soon)

### Data Features
- ✅ **RDF Knowledge Graph** - Linked data representation
- ✅ **SPARQL Queries** - Powerful semantic queries
- ✅ **Ontology-Driven** - PM Ontology + Scrum Reference Ontology
- ✅ **Automatic Inference** - Rules execute in Fuseki (Java performance)

## 🧠 Reasoning & Inference

This app uses **Jena's inference engine** with custom rules. See [FUSEKI_SETUP.md](./FUSEKI_SETUP.md) for details.

### Example: Automatic Blocked Task Detection

**Rule** (in `fuseki/rules/custom.rules`):
```
[BlockedTask:
  (?task pm:dependsOn ?predecessor)
  (?predecessor pm:status ?status)
  notEqual(?status, "done")
  ->
  (?task pm:isBlocked true)
]
```

**Result:** When you query for blocked tasks, Fuseki automatically infers which tasks are blocked based on their dependencies. **No backend code needed!**

### Example: Temporal Reasoning

**Data:**
```turtle
pm:Task1 time:hasInterval [
  time:hasBeginning "2025-01-01T09:00:00Z" ;
  time:hasEnd "2025-01-05T17:00:00Z"
] .

pm:Sprint1 time:hasInterval [
  time:hasBeginning "2025-01-01T00:00:00Z" ;
  time:hasEnd "2025-01-15T23:59:59Z"
] .
```

**Automatic Inference:**
```turtle
pm:Task1 time:intervalDuring pm:Sprint1 .
pm:Sprint1 sro:contains pm:Task1 .
```

**Allen's 13 interval relations** are automatically computed!

## 📂 Project Structure

```
pm-webapp/
├── app/                    # Next.js app directory
│   ├── (dashboard)/        # Dashboard pages
│   │   ├── page.tsx        # Kanban board
│   │   ├── issues/         # Task table
│   │   ├── timeline/       # Gantt chart
│   │   ├── dependencies/   # Critical path
│   │   ├── insights/       # Reasoning results
│   │   └── import/         # Import page
│   └── layout.tsx
├── components/             # React components
├── lib/
│   ├── api/                # API client & types
│   ├── hooks/              # React Query hooks
│   └── stores/             # Zustand state
├── server/                 # TypeScript backend
│   ├── index.ts            # Main server
│   ├── lib/
│   │   ├── sparql.ts       # SPARQL client
│   │   └── mappers.ts      # Data mappers
│   ├── routes/             # API routes
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── links.ts
│   │   ├── import.ts
│   │   ├── analytics.ts
│   │   └── reasoning.ts
│   └── types/              # Backend types
├── fuseki/                 # Fuseki configuration
│   ├── config.ttl          # Dataset config
│   ├── rules/              # Inference rules
│   │   ├── temporal.rules
│   │   ├── rdfs_useful.rules
│   │   └── custom.rules
│   └── ontology/           # PM & SRO ontologies
├── docker-compose.yml      # Fuseki setup
└── package.json
```

## 🔧 Development

### Commands

```bash
# Development (frontend + backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build
npm run build:backend

# Lint
npm run lint
```

### Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_PORT=8000

# Fuseki
NEXT_PUBLIC_GRAPHDB_ENDPOINT=http://localhost:3030
NEXT_PUBLIC_GRAPHDB_DATASET=gantt

# Default project
NEXT_PUBLIC_DEFAULT_PROJECT=demo-project
```

### Adding Custom Inference Rules

1. Edit `fuseki/rules/custom.rules`
2. Add your rule:
   ```
   [MyRule:
     (?x pm:property ?y)
     greaterThan(?y, 100)
     ->
     (?x pm:isLarge true)
   ]
   ```
3. Restart Fuseki: `docker-compose restart fuseki`
4. Query and see inferred triples!

See [FUSEKI_SETUP.md](./FUSEKI_SETUP.md) for full rule syntax and examples.

## 📖 Documentation

- **[FUSEKI_SETUP.md](./FUSEKI_SETUP.md)** - Fuseki configuration & inference rules
- **[TYPESCRIPT_BACKEND.md](./TYPESCRIPT_BACKEND.md)** - Backend architecture & migration
- **[INTEGRATION.md](./INTEGRATION.md)** - API integration details

## 🚀 Deployment

### Docker Compose (Recommended)

```yaml
services:
  fuseki:
    # ... (see docker-compose.yml)

  backend:
    build: .
    command: npm run start:backend

  frontend:
    build: .
    command: npm run start
```

### Single Container

Build and run everything in one container (see `TYPESCRIPT_BACKEND.md`).

## 🧪 Testing

```bash
# Start Fuseki
docker-compose up -d

# Test health
curl http://localhost:3030/$/ping

# Test backend
curl http://localhost:8000/health

# Test query
curl http://localhost:8000/api/projects
```

## 🎓 Technologies

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Server state
- **Zustand** - Client state
- **@svar-ui/react-gantt** - Gantt chart

### Backend
- **Hono** - Web framework
- **tsx** - TypeScript execution
- **@comunica/query-sparql** - SPARQL client
- **n3** - RDF parsing
- **jira.js** - Jira integration

### Database & Reasoning
- **Apache Jena Fuseki** - RDF triple store
- **TDB2** - Storage backend
- **Jena Rules Engine** - Forward/backward chaining
- **OWL Time** - Temporal ontology
- **PM Ontology** - Project management concepts
- **Scrum Reference Ontology (SRO)** - Agile/Scrum concepts

## 📚 Learn More

- [Apache Jena Documentation](https://jena.apache.org/documentation/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [OWL Time Ontology](https://www.w3.org/TR/owl-time/)
- [Allen's Interval Algebra](https://en.wikipedia.org/wiki/Allen%27s_interval_algebra)
- [Jena Inference Rules](https://jena.apache.org/documentation/inference/)

## 🤝 Contributing

This is a personal/academic project. Feel free to fork and adapt!

## 📄 License

MIT

## 🙏 Acknowledgments

- Based on [jena-fuseki-inf-main](https://github.com/kkoocheki/jena-fuseki-inf-main) for inference configuration
- Uses [PM_APP](https://github.com/kkoocheki/PM_APP) ontologies and concepts
- Built with Jena, Next.js, and modern web technologies
