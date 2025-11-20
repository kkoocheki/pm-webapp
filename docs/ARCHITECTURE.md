# Architecture Documentation

## Overview

This is an RDF-based project management application built with Next.js 14, React, and TypeScript. The application uses GraphDB (or Apache Jena Fuseki) as a triple store with SPARQL for querying and OWL 2 RL reasoning.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18+ (functional components only)
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### State Management
- **Global State**: Zustand
- **Server State**: TanStack Query (React Query)

### Specialized Libraries
- **Drag & Drop**: @hello-pangea/dnd (Kanban board)
- **Graph Visualization**: reactflow (dependency graph)
- **Gantt Chart**: react-gantt-chart or dhtmlx-gantt
- **Charts**: recharts

### Backend
- **API Routes**: Next.js API routes (app/api/)
- **Database**: Ontotext GraphDB (RDF triple store)
- **Query Language**: SPARQL 1.1
- **Reasoning**: OWL 2 RL profile

## Project Structure

```
rdf-pm-app/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Route group with shared layout
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home
│   │   ├── issues/              # Task management
│   │   ├── timeline/            # Gantt chart view
│   │   ├── dependencies/        # Dependency graph
│   │   └── insights/            # AI insights
│   ├── api/                     # API routes
│   │   ├── tasks/               # Task CRUD endpoints
│   │   ├── projects/            # Project endpoints
│   │   └── reasoning/           # AI reasoning endpoints
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── sidebar.tsx              # Collapsible sidebar
│   ├── top-bar.tsx              # Top navigation
│   ├── gantt-chart.tsx          # Gantt visualization
│   ├── kanban-board.tsx         # Kanban board
│   ├── dependency-graph.tsx     # Dependency visualization
│   ├── task-list.tsx            # Task list component
│   ├── command-palette.tsx      # Command palette (⌘K)
│   └── chat-panel.tsx           # AI chat panel
│
├── lib/                         # Utilities and libraries
│   ├── api/                     # API client and types
│   │   ├── client.ts            # Fetch wrapper
│   │   └── types.ts             # API type definitions
│   ├── sparql/                  # SPARQL/RDF utilities
│   │   ├── client.ts            # GraphDB connection
│   │   ├── queries.ts           # Query templates
│   │   └── types.ts             # RDF type definitions
│   ├── stores/                  # State management
│   │   └── app-store.ts         # Zustand global store
│   └── utils.ts                 # Utility functions
│
└── docs/                        # Documentation
    ├── ARCHITECTURE.md          # This file
    ├── RDF_MODEL.md             # RDF ontology documentation
    └── API.md                   # API documentation
```

## Data Flow

### 1. Client → API → GraphDB

```
User Action (UI)
  ↓
React Component
  ↓
API Client (lib/api/client.ts)
  ↓
Next.js API Route (app/api/.../route.ts)
  ↓
SPARQL Client (lib/sparql/client.ts)
  ↓
GraphDB (SPARQL endpoint)
```

### 2. GraphDB → API → Client

```
GraphDB (SPARQL response)
  ↓
SPARQL Client (parse results)
  ↓
Next.js API Route (transform to API types)
  ↓
API Response
  ↓
TanStack Query (cache)
  ↓
React Component (render)
```

## Key Design Decisions

### 1. Why Next.js App Router?
- Server components for better performance
- Simplified data fetching
- Built-in API routes
- File-based routing

### 2. Why Zustand over Redux?
- Simpler API, less boilerplate
- No need for complex middleware
- Better TypeScript support
- Smaller bundle size

### 3. Why TanStack Query?
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Built-in loading/error states

### 4. Why shadcn/ui?
- Copy-paste components (no package dependency)
- Full customization control
- Tailwind CSS integration
- Accessible by default

### 5. Why SPARQL over GraphQL?
- Direct RDF querying (no translation layer)
- Native reasoning support
- Standard W3C query language
- Better for graph traversal

## State Management Strategy

### Global State (Zustand)
- Current project
- Tasks list
- UI state (sidebar, modals, etc.)
- User preferences

### Server State (TanStack Query)
- API data (tasks, projects, insights)
- Automatic caching
- Background refetching
- Optimistic updates

### Local State (useState)
- Form inputs
- UI toggles
- Component-specific state

## API Design

All API routes follow REST conventions:

- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

Responses use a consistent format:

```typescript
{
  "data": T,           // Response data
  "error": string,     // Error message (if any)
  "timestamp": string  // ISO timestamp
}
```

## Security Considerations

1. **SPARQL Injection Prevention**
   - All queries use parameterized templates
   - Input sanitization in API routes
   - No direct user input in SPARQL queries

2. **Authentication** (Phase 5+)
   - NextAuth.js for authentication
   - JWT tokens
   - Role-based access control (RBAC)

3. **Data Validation**
   - Zod schemas for API inputs
   - Type checking with TypeScript
   - Server-side validation

## Performance Optimization

1. **React Server Components**
   - Initial data fetching on server
   - Reduced client-side JavaScript

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic with Next.js)

3. **Caching Strategy**
   - TanStack Query cache (5 minutes default)
   - Next.js static generation where possible
   - SPARQL query result caching

4. **Image Optimization**
   - Next.js Image component
   - WebP format
   - Lazy loading

## Testing Strategy (Phase 5+)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright
- **SPARQL Query Tests**: Custom test suite

## Deployment

- **Hosting**: Vercel (recommended) or self-hosted
- **GraphDB**: Self-hosted or cloud instance
- **Environment Variables**: `.env.local` for development

## Next Steps

See individual phase documentation for implementation details:
- Phase 1: Foundation ✅ (completed)
- Phase 2: Backend & API
- Phase 3: Core Features
- Phase 4: Advanced Features
- Phase 5: Polish & Production
