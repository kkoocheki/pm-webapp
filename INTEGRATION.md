# Backend Integration Documentation

## Overview

This document describes the integration of the PM_APP backend (FastAPI + RDF/SPARQL) with the Next.js frontend, implementing a unified data management approach where all three views (Kanban, Task Table, and Gantt Chart) share the same data source.

## Architecture

### Data Flow

```
Backend (FastAPI + Fuseki)
         ↓
    API Services
         ↓
  React Query Hooks
         ↓
   Zustand Store (Single Source of Truth)
         ↓
    ┌────┴────┐──────┐
    ↓         ↓      ↓
 Kanban   Table   Gantt
```

### Key Components

1. **Backend API** (`lib/api/`)
   - `config.ts` - API endpoint configuration
   - `client.ts` - HTTP client with error handling
   - `backend-types.ts` - TypeScript types matching backend schemas
   - `services.ts` - Service layer for all API operations
   - `mappers.ts` - Bidirectional data transformations

2. **Data Fetching** (`lib/hooks/`)
   - `use-project-data.ts` - React Query hooks for data fetching and mutations
   - Integrates with Zustand store for state synchronization

3. **State Management** (`lib/stores/`)
   - `app-store.ts` - Zustand store (already existed, now populated from API)
   - Single source of truth for all views

4. **Data Loading** (`components/`)
   - `data-loader.tsx` - Component that fetches and syncs data on mount
   - `providers/query-provider.tsx` - React Query provider setup

## Backend API Endpoints

The backend (from PM_APP) provides the following REST API endpoints:

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{slug}` - Get project with tasks and links
- `POST /api/projects` - Create new project
- `PUT /api/projects/{slug}` - Update project
- `DELETE /api/projects/{slug}` - Delete project

### Tasks
- `GET /api/projects/{slug}/tasks` - List all tasks
- `GET /api/projects/{slug}/tasks/{token}` - Get specific task
- `POST /api/projects/{slug}/tasks` - Create task
- `PUT /api/projects/{slug}/tasks/{token}` - Update task
- `DELETE /api/projects/{slug}/tasks/{token}` - Delete task

### Links/Dependencies
- `GET /api/projects/{slug}/links` - List all links
- `GET /api/projects/{slug}/links/{token}` - Get specific link
- `POST /api/projects/{slug}/links` - Create link
- `PUT /api/projects/{slug}/links/{token}` - Update link
- `DELETE /api/projects/{slug}/links/{token}` - Delete link

## Data Synchronization Strategy

### Shared Data Approach

All three views read from the **same Zustand store**, ensuring they always display the same data:

1. **Data Loading**
   - `DataLoader` component wraps the dashboard layout
   - On mount, it fetches the project data from the backend via `useProjectData()` hook
   - React Query automatically updates the Zustand store with the fetched data

2. **View Rendering**
   - **Kanban Board** (`components/kanban-board.tsx`)
     - Subscribes to `useAppStore((state) => state.tasks)`
     - Automatically re-renders when store updates
     - When cards are moved, calls `useUpdateTask()` mutation to sync with backend

   - **Task Table** (`app/(dashboard)/issues/page.tsx`)
     - Subscribes to `useAppStore((state) => state.tasks)`
     - Uses `DataTable` component with table adapter
     - Automatically re-renders when store updates

   - **Gantt Chart** (`components/gantt-chart.tsx`)
     - Subscribes to `useAppStore((state) => state.tasks/stories/dependencies)`
     - Uses `useMemo` to recalculate when any store data changes
     - Automatically re-renders when store updates

3. **Data Mutations**
   - When data is modified (e.g., moving a Kanban card):
     - Optimistic UI update (immediate feedback)
     - API call to backend via React Query mutation
     - On success, React Query invalidates the cache and refetches
     - Zustand store is updated with fresh data
     - All three views automatically re-render with new data

### Benefits

✅ **Single Source of Truth** - All views read from the same Zustand store
✅ **No Redundant Loading** - Data is fetched once and shared across all views
✅ **Automatic Synchronization** - Changes in one view instantly reflect in others
✅ **Optimistic Updates** - UI responds immediately while API call is in flight
✅ **Cache Management** - React Query handles caching, refetching, and stale data
✅ **Type Safety** - Full TypeScript support throughout the stack

## Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# GraphDB / Fuseki Configuration
NEXT_PUBLIC_GRAPHDB_ENDPOINT=http://localhost:3030
NEXT_PUBLIC_GRAPHDB_DATASET=gantt
GRAPHDB_USERNAME=
GRAPHDB_PASSWORD=

# Default Project
NEXT_PUBLIC_DEFAULT_PROJECT=demo-project
```

### Backend Setup

1. Clone the PM_APP repository
2. Navigate to `backend_rdf/`
3. Set up Fuseki and start the backend:
   ```bash
   docker-compose up -d  # Start Fuseki
   pip install -r requirements.txt
   python -m app  # Start FastAPI server
   ```

## Usage Example

### Fetching Data

```typescript
import { useProjectData } from '@/lib/hooks/use-project-data';

function MyComponent() {
  const { data, isLoading, error } = useProjectData('my-project');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Project: {data.project.name}</div>;
}
```

### Updating a Task

```typescript
import { useUpdateTask } from '@/lib/hooks/use-project-data';

function MyComponent() {
  const updateTask = useUpdateTask('my-project');

  const handleUpdate = () => {
    updateTask.mutate({
      taskId: 'task-123',
      updates: { status: 'completed' }
    });
  };

  return <button onClick={handleUpdate}>Complete Task</button>;
}
```

### Reading from Store

```typescript
import { useAppStore } from '@/lib/stores/app-store';

function MyComponent() {
  const tasks = useAppStore((state) => state.tasks);

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

## Testing

To test the integration:

1. **Start the backend** (FastAPI + Fuseki)
2. **Ensure you have test data** in the backend
3. **Start the frontend**: `npm run dev`
4. **Navigate to** http://localhost:3000
5. **Test the views**:
   - Issues page → List, Kanban, and Timeline tabs all show the same tasks
   - Move a card in Kanban → Change should persist and reflect in other views
   - Refresh the page → Data should load from backend

## Type Safety

The system maintains type safety throughout:

- **Backend Types** (`backend-types.ts`) - Match FastAPI Pydantic schemas
- **Frontend Types** (`types.ts`) - Application domain types
- **Mappers** (`mappers.ts`) - Bidirectional type-safe transformations
- **API Services** - Fully typed with generics
- **React Query** - Type-safe hooks with inferred types

## Error Handling

- **API Client** - Catches fetch errors and throws with descriptive messages
- **React Query** - Automatic retry logic (configurable)
- **DataLoader** - Displays user-friendly error messages
- **Optimistic Updates** - Rollback on failure

## Performance Optimizations

- **React Query Caching** - Reduces unnecessary API calls
- **useMemo** - Prevents expensive recalculations
- **Selective Subscriptions** - Components only subscribe to needed store slices
- **Optimistic Updates** - Immediate UI feedback
- **Stale-While-Revalidate** - Shows cached data while fetching fresh data

## Future Enhancements

- [ ] Add WebSocket support for real-time updates
- [ ] Implement offline support with service workers
- [ ] Add bulk operations (multi-task updates)
- [ ] Enhance error recovery with retry mechanisms
- [ ] Add data validation with Zod
- [ ] Implement CRUD operations for all entity types (currently only tasks)

## Advanced Features

### Import/Export

The application now supports importing RDF Turtle (.ttl) files to create projects:

**Import Dialog** (`components/import-dialog.tsx`)
- Upload .ttl files containing RDF project data
- Auto-generates project name from filename
- Option to overwrite existing projects
- Shows import status and statistics (tasks created, dependencies created)

**Usage:**
1. Click "Import Project" button in the top bar
2. Select a .ttl file (supports both PM and SRO ontology namespaces)
3. Provide a project name or use the auto-generated one
4. Choose whether to overwrite existing data
5. View import results (tasks, dependencies, sprints created)

**API Endpoint:**
- `POST /api/import/ttl` - Upload and import Turtle file

### Analytics - Critical Path Method (CPM)

The **Dependencies** page now displays real-time Critical Path Method analysis:

**Features:**
- Total project duration calculation
- Critical path identification (tasks with zero float)
- Early start/finish times
- Late start/finish times
- Total float calculation for each task
- Visual highlighting of critical tasks

**API Endpoint:**
- `GET /api/projects/{slug}/critical-path` - Compute CPM analysis

**Critical Path Metrics:**
- **Total Duration:** Minimum time to complete the project
- **Critical Tasks:** Tasks that cannot be delayed without delaying the project
- **Float:** Slack time available before a task delays the project
- **Early/Late Times:** Scheduling constraints for each task

### Semantic Reasoning Engine

The **Insights** page now features a complete semantic reasoning system powered by OWL 2 RL, RDFS, and Jena Rules:

**Reasoning Capabilities:**

1. **Blocked Task Detection**
   - Automatically identifies tasks blocked by incomplete dependencies
   - Shows which tasks are blocking others
   - Transitive dependency reasoning

2. **Critical Path Tasks**
   - Infers critical tasks based on float calculations
   - Identifies tasks on the critical path
   - Risk analysis for project delays

3. **User Story Completion**
   - Determines which stories are "done" based on accepted deliverables
   - Calculates completed story points
   - Identifies stories with technical debt

4. **Inference Rules** (8 rules):
   - Done User Story detection
   - Successfully Performed Task detection
   - Epic Completion inference
   - Blocked Task Detection
   - Critical Path Task identification
   - Sprint Goal Achievement
   - Technical Debt Detection
   - Transitive Dependency reasoning

**Reasoner Types:**
- `rdfs` - RDFS reasoning only
- `owl_dl` - OWL DL reasoning
- `owl_full` - OWL Full reasoning
- `jena_rules` - Custom Jena rules
- `combined` - All reasoning methods (recommended)

**API Endpoints:**
- `POST /api/reasoning/apply` - Apply reasoning to a project
- `GET /api/reasoning/user-stories/{slug}` - Get story status with inferences
- `GET /api/reasoning/tasks/{slug}` - Get task status with inferences
- `GET /api/reasoning/sprints/{slug}/{iri}` - Get sprint metrics
- `GET /api/reasoning/rules` - List all inference rules
- `GET /api/reasoning/validate/{slug}` - Validate ontology consistency
- `GET /api/reasoning/health` - Check reasoning engine health

**Usage:**
1. Navigate to the Insights page
2. Click "Run Reasoning" to apply semantic inference
3. View inferred insights:
   - Critical path tasks
   - Blocked tasks with blockers
   - Done user stories
   - Technical debt indicators
4. See reasoning statistics (total triples, inferred triples)

### React Query Hooks

**Advanced Features Hooks** (`lib/hooks/use-advanced-features.ts`):

```typescript
// Import
useImportTtl() - Import TTL files

// Analytics
useCriticalPath(projectSlug) - Get critical path analysis

// Reasoning
useApplyReasoning() - Run semantic reasoning
useTaskStatus(projectSlug) - Get task insights
useUserStoryStatus(projectSlug) - Get story insights
useSprintMetrics(projectSlug, sprintIri) - Get sprint metrics
useInferenceRules() - List available rules
useValidateOntology(projectSlug) - Validate consistency
useReasoningHealth() - Check engine health
```

## Updated Data Types

**Analytics Types:**
- `CriticalPathResult` - CPM analysis results
- `CriticalPathTask` - Individual task on critical path with timing data

**Reasoning Types:**
- `ReasoningRequest` - Reasoning configuration
- `ReasoningResponse` - Reasoning results with inferences
- `UserStoryStatus` - Story status with semantic inferences
- `TaskStatus` - Task status with blocking info and criticality
- `SprintMetrics` - Computed sprint metrics
- `InferenceRule` - Rule documentation
- `OntologyValidation` - Consistency check results
- `ReasoningHealth` - Engine health status

## Pages Updated

### Insights Page (`/insights`)
- Interactive reasoning engine interface
- Real-time metrics (critical tasks, blocked tasks, done stories, technical debt)
- Detailed lists of blocked and critical tasks
- Done user stories with story points
- Active inference rules display
- Reasoning engine health status

### Dependencies Page (`/dependencies`)
- Full Critical Path Method (CPM) analysis
- Project duration and timeline
- Detailed task scheduling information
- Early/late start and finish times
- Float calculations
- Educational content about CPM concepts

### Top Bar
- Import Project button for easy access to TTL file import
- Accessible from any page in the dashboard

## Technology Stack Additions

- **Semantic Reasoning:** OWL 2 RL + RDFS + Jena Rules
- **Knowledge Graph:** Apache Jena Fuseki (RDF triple store)
- **Ontologies:** PM Ontology + Scrum Reference Ontology (SRO)
- **Import Format:** RDF Turtle (.ttl)

## Future Enhancements

- [ ] Export functionality (export project to TTL)
- [ ] Real-time reasoning updates via WebSocket
- [ ] Custom SPARQL query interface
- [ ] Dependency graph visualization with reactflow
- [ ] Advanced reasoning configurations
- [ ] Historical reasoning analysis
- [ ] Sprint-level reasoning insights
- [ ] Team performance analytics

## Complete Feature List

✅ **Core Features:**
- Project, Task, Link CRUD operations
- Shared data management (Zustand + React Query)
- Three synchronized views (Kanban, Table, Gantt)
- Optimistic updates

✅ **Advanced Features:**
- TTL file import
- Critical Path Method (CPM) analysis
- Semantic reasoning engine (8 inference rules)
- Blocked task detection
- User story completion inference
- Technical debt identification
- Ontology validation

✅ **UI Components:**
- Import dialog with file upload
- Critical path visualization
- Reasoning insights dashboard
- Health monitoring
- Error handling and loading states

