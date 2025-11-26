# State Management & Architecture Guide

## Overview

This application uses a **clean separation of concerns** for state management:

- **TanStack Query (React Query)** - ALL server state (tasks, projects, dependencies, etc.)
- **Zustand** - ONLY client UI state (sidebar, filters, selections, view preferences)
- **Next.js App Router** - File-based routing (TanStack Router is incompatible with Next.js)

## State Management Architecture

### React Query: Server State Manager

React Query manages ALL data from the backend:

```typescript
// ✅ CORRECT: Get tasks from React Query
import { useProjectData } from '@/lib/hooks/use-project-data';

function MyComponent() {
  const { data, isLoading } = useProjectData('my-project');
  const tasks = data?.tasks || [];
  const dependencies = data?.dependencies || [];

  return <TaskList tasks={tasks} />;
}
```

**Benefits:**
- Automatic caching and synchronization
- All components reading from the same cache
- Built-in loading/error states
- Automatic refetching on window focus
- Cache invalidation on mutations

### Zustand: UI State Only

Zustand stores ONLY client-side UI preferences:

```typescript
import { useUIStore } from '@/lib/stores/app-store';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarCollapsed ? 'collapsed' : ''}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

**What belongs in Zustand:**
- ✅ Sidebar collapsed state
- ✅ Command palette open/closed
- ✅ Active filters (UI state, not server data)
- ✅ Selected task IDs (for bulk operations)
- ✅ View mode (compact/comfortable/spacious)
- ✅ Zoom level (day/week/month)

**What does NOT belong in Zustand:**
- ❌ Tasks (use React Query)
- ❌ Projects (use React Query)
- ❌ Dependencies (use React Query)
- ❌ Stories/Epics (use React Query when implemented)

### Why This Separation?

**Before (Redundant):**
```typescript
// ❌ BAD: Duplicating server state in Zustand
const tasks = useAppStore((state) => state.tasks); // From Zustand
const { data } = useProjectData(); // From React Query
// Which one is the source of truth? Both have the same data!
```

**After (Clean):**
```typescript
// ✅ GOOD: Single source of truth
const { data } = useProjectData(); // React Query is the ONLY source
const tasks = data?.tasks || [];
```

## Data Flow

### Reading Data

```
Backend API
    ↓
React Query (fetch, cache)
    ↓
Components (read from cache)
```

All components reading the same query key get the SAME cached data.

### Updating Data

```
Component (mutation)
    ↓
Backend API (update)
    ↓
React Query (invalidate cache)
    ↓
Automatic refetch
    ↓
All components re-render with new data
```

## Routing Architecture

### Next.js App Router (Current)

We use **Next.js App Router** (file-based routing):

```
app/
├── (dashboard)/
│   ├── layout.tsx           # Shared layout
│   ├── page.tsx             # "/" - Kanban
│   ├── issues/
│   │   └── page.tsx         # "/issues" - Task table
│   ├── timeline/
│   │   └── page.tsx         # "/timeline" - Gantt
│   └── import/
│       └── page.tsx         # "/import" - Import page
```

**Features:**
- File-based routing (no config needed)
- Nested layouts with shared UI
- Built-in loading states (`loading.tsx`)
- Built-in error boundaries (`error.tsx`)
- Server Components support
- Type-safe with TypeScript

### Why Not TanStack Router?

**TanStack Router is incompatible with Next.js.** Next.js owns the routing layer completely.

- Next.js App Router and TanStack Router serve the same purpose
- They cannot coexist in the same app
- Next.js controls routing through its file system
- TanStack Router is for plain React apps (Vite, CRA, etc.)

**If you need TanStack Router features:**
- Type-safe routing → Next.js already has this with TypeScript
- Route loaders → Use React Query in components
- Route-level code splitting → Next.js does this automatically

## React Query Hooks

### Core Hooks

**useProjectData** - Fetch project with tasks and dependencies
```typescript
const { data, isLoading, error } = useProjectData(projectSlug);
// data = { project, tasks, dependencies }
```

**useCreateTask** - Create new task
```typescript
const createTask = useCreateTask(projectSlug);
createTask.mutate({
  title: 'New task',
  status: 'todo',
});
```

**useUpdateTask** - Update existing task
```typescript
const updateTask = useUpdateTask(projectSlug);
updateTask.mutate({
  taskId: 'task-123',
  updates: { status: 'in_progress' },
});
```

**useDeleteTask** - Delete task
```typescript
const deleteTask = useDeleteTask(projectSlug);
deleteTask.mutate('task-123');
```

### Advanced Hooks

**useCriticalPath** - Get critical path analysis
```typescript
const { data } = useCriticalPath(projectSlug);
```

**useUserStoryStatus** - Get story status with reasoning
```typescript
const { data } = useUserStoryStatus(projectSlug);
```

**useTaskStatus** - Get task status with reasoning
```typescript
const { data } = useTaskStatus(projectSlug);
```

## Component Migration Guide

### Old Pattern (Redundant)

```typescript
// ❌ OLD: Reading from Zustand
import { useAppStore } from '@/lib/stores/app-store';

function TaskList() {
  const tasks = useAppStore((state) => state.tasks);

  return <div>{tasks.map(task => ...)}</div>;
}
```

### New Pattern (Correct)

```typescript
// ✅ NEW: Reading from React Query
import { useProjectData } from '@/lib/hooks/use-project-data';

function TaskList() {
  const { data, isLoading } = useProjectData(DEFAULT_PROJECT_SLUG);
  const tasks = data?.tasks || [];

  if (isLoading) return <div>Loading...</div>;

  return <div>{tasks.map(task => ...)}</div>;
}
```

## Zustand Store API

### UI State Only

```typescript
import { useUIStore } from '@/lib/stores/app-store';

const {
  // Project
  currentProjectSlug,
  setCurrentProjectSlug,

  // Sidebar
  sidebarCollapsed,
  toggleSidebar,

  // Modals
  commandPaletteOpen,
  setCommandPaletteOpen,

  // View preferences
  kanbanViewMode,
  setKanbanViewMode,
  ganttZoomLevel,
  setGanttZoomLevel,

  // Filters
  activeFilters,
  setActiveFilters,
  clearFilters,

  // Selections
  selectedTaskIds,
  toggleTaskSelection,
  clearTaskSelection,
  selectAllTasks,
} = useUIStore();
```

### Persisted State

UI preferences are automatically saved to localStorage:
- `currentProjectSlug`
- `sidebarCollapsed`
- `kanbanViewMode`
- `ganttZoomLevel`

Other state (filters, selections) is NOT persisted (resets on page reload).

## Best Practices

### 1. Always Use React Query for Server Data

```typescript
// ✅ DO THIS
const { data } = useProjectData(projectSlug);
const tasks = data?.tasks || [];

// ❌ DON'T DO THIS
const tasks = useAppStore((state) => state.tasks);
```

### 2. Always Handle Loading States

```typescript
// ✅ DO THIS
const { data, isLoading, error } = useProjectData(projectSlug);

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;

// ❌ DON'T DO THIS
const { data } = useProjectData(projectSlug);
const tasks = data.tasks; // Crash! data might be undefined
```

### 3. Use Optimistic Updates for Mutations

```typescript
// ✅ DO THIS - Immediate UI feedback
const updateTask = useUpdateTask(projectSlug);
updateTask.mutate(
  { taskId, updates },
  {
    onSuccess: () => {
      // React Query automatically refetches
      toast.success('Task updated!');
    },
  }
);
```

### 4. Leverage React Query Cache

```typescript
// Multiple components using the same query
// Only ONE network request, shared cache!

function ComponentA() {
  const { data } = useProjectData('my-project'); // Fetch
}

function ComponentB() {
  const { data } = useProjectData('my-project'); // From cache!
}

function ComponentC() {
  const { data } = useProjectData('my-project'); // From cache!
}
```

### 5. Invalidate Caches After Mutations

```typescript
// This is already done in our hooks!
const updateTask = useUpdateTask(projectSlug);
// After mutation completes, automatically invalidates:
// queryClient.invalidateQueries({ queryKey: ['projects', projectSlug] });
// → All components refetch fresh data
```

## Common Patterns

### Filtering in UI

```typescript
function TaskList() {
  const { data } = useProjectData(projectSlug);
  const { activeFilters } = useUIStore();

  const filteredTasks = useMemo(() => {
    let tasks = data?.tasks || [];

    if (activeFilters.status?.length) {
      tasks = tasks.filter(t => activeFilters.status.includes(t.status));
    }

    if (activeFilters.priority?.length) {
      tasks = tasks.filter(t => activeFilters.priority.includes(t.priority));
    }

    return tasks;
  }, [data?.tasks, activeFilters]);

  return <div>{filteredTasks.map(...)}</div>;
}
```

### Bulk Selection

```typescript
function TaskTable() {
  const { data } = useProjectData(projectSlug);
  const { selectedTaskIds, toggleTaskSelection } = useUIStore();

  const handleSelectAll = () => {
    const allIds = data?.tasks.map(t => t.id) || [];
    useUIStore.getState().selectAllTasks(allIds);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach(id => deleteTask.mutate(id));
  };

  return (
    <Table>
      <Checkbox onChange={handleSelectAll} />
      {data?.tasks.map(task => (
        <Row
          selected={selectedTaskIds.includes(task.id)}
          onSelect={() => toggleTaskSelection(task.id)}
        />
      ))}
    </Table>
  );
}
```

### View Mode Switching

```typescript
function KanbanBoard() {
  const { kanbanViewMode, setKanbanViewMode } = useUIStore();

  return (
    <div>
      <ViewModeSelector
        value={kanbanViewMode}
        onChange={setKanbanViewMode}
      />
      <Board className={`mode-${kanbanViewMode}`}>
        {/* Cards adjust based on view mode */}
      </Board>
    </div>
  );
}
```

## Future Enhancements

### Stories & Epics (TODO)

Currently, stories and epics are not implemented in the backend. Once added:

1. Create backend endpoints:
   - `GET /api/stories/:projectSlug`
   - `GET /api/epics/:projectSlug`

2. Add React Query hooks:
   ```typescript
   export function useStories(projectSlug: string) {
     return useQuery({
       queryKey: ['stories', projectSlug],
       queryFn: () => api.stories.list(projectSlug),
     });
   }
   ```

3. Update Gantt chart:
   ```typescript
   const { data: projectData } = useProjectData(projectSlug);
   const { data: stories } = useStories(projectSlug);

   const ganttData = storiesAndTasksToGanttFormat(
     stories || [],
     projectData?.tasks || [],
     projectData?.dependencies || []
   );
   ```

## Troubleshooting

### "Data is undefined" Error

```typescript
// ❌ WRONG
const { data } = useProjectData(projectSlug);
console.log(data.tasks); // Crash if data is undefined!

// ✅ CORRECT
const { data, isLoading } = useProjectData(projectSlug);
if (isLoading) return <Spinner />;
console.log(data.tasks); // Safe, data is guaranteed
```

### "Stale Data" Issue

React Query caches data for 30 seconds by default. If you need fresh data:

```typescript
const { data, refetch } = useProjectData(projectSlug);

// Manual refetch
<button onClick={() => refetch()}>Refresh</button>
```

Or invalidate cache:
```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['projects', projectSlug] });
```

### "Component Not Updating" Issue

Make sure you're using React Query, not Zustand for server data:

```typescript
// ❌ Won't update when data changes
const tasks = useAppStore((state) => state.tasks);

// ✅ Automatically updates when data changes
const { data } = useProjectData(projectSlug);
const tasks = data?.tasks || [];
```

## Summary

- **React Query** = Server state (tasks, projects, all backend data)
- **Zustand** = UI state (sidebar, filters, selections, preferences)
- **Next.js App Router** = Routing (file-based, no TanStack Router needed)
- **Single source of truth** = React Query cache, all components read from it
- **Automatic synchronization** = Cache invalidation + refetching

This architecture provides:
- ✅ Clean separation of concerns
- ✅ No data duplication
- ✅ Automatic cache management
- ✅ Type-safe data flow
- ✅ Optimistic updates
- ✅ Persistent UI preferences
