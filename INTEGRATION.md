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
