# API Integration Guide

## Overview

This application is designed to work with an RDF-based backend using SPARQL queries. The data structures are aligned with the Scrum PM Ontology.

## Current State

Currently using mock data from `lib/hooks/use-mock-data.ts` that mirrors the structure from `example_project_scrum_aligned.ttl`.

## Migration Path to Real API

### 1. Replace Mock Data Hook

Replace `useMockData()` with a real data fetching hook:

```typescript
// lib/hooks/use-api-data.ts
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { fetchProject } from '@/lib/api/client';

export function useApiData(projectId: string) {
  const setCurrentProject = useAppStore((state) => state.setCurrentProject);
  const setEpics = useAppStore((state) => state.setEpics);
  const setStories = useAppStore((state) => state.setStories);
  const setTasks = useAppStore((state) => state.setTasks);
  const setSprints = useAppStore((state) => state.setSprints);
  const setTeamMembers = useAppStore((state) => state.setTeamMembers);
  const setDependencies = useAppStore((state) => state.setDependencies);
  const setIsLoading = useAppStore((state) => state.setIsLoading);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchProject(projectId);
        setCurrentProject(data.project);
        setEpics(data.epics);
        setStories(data.stories);
        setTasks(data.tasks);
        setSprints(data.sprints);
        setTeamMembers(data.teamMembers);
        setDependencies(data.dependencies);
      } catch (error) {
        console.error('Failed to load project data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [projectId, /* ...setter functions */]);
}
```

### 2. API Client Implementation

Implement SPARQL queries in `lib/api/client.ts`:

```typescript
// lib/api/client.ts
import { Project, Epic, UserStory, Task, Sprint, TeamMember, Dependency } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchProject(projectId: string) {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  return await response.json();
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return await response.json();
}

// Similar functions for other CRUD operations
```

### 3. Backend API Endpoints

Your RDF backend should expose these REST endpoints:

- `GET /api/projects/:id` - Get project with all related data
- `GET /api/epics` - List epics
- `GET /api/stories` - List user stories
- `GET /api/tasks` - List tasks
- `GET /api/sprints` - List sprints
- `GET /api/team-members` - List team members
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### 4. SPARQL Query Examples

Example queries for your backend (from your backend_rdf):

```sparql
# Get all tasks for a project
PREFIX sro: <https://example.org/sro#>
PREFIX pm: <https://example.org/pm#>

SELECT ?task ?title ?status ?assignee ?startDate ?endDate
WHERE {
  ?project a sro:ScrumProject ;
           rdfs:label ?projectName .
  ?story sro:hasTask ?task .
  ?task rdfs:label ?title ;
        pm:hasTaskState ?status ;
        pm:assignedTo ?assignee ;
        pm:hasPlannedStart ?startDate ;
        pm:hasPlannedEnd ?endDate .
  FILTER(?projectName = "Alpha Platform Development")
}
```

### 5. Update Store Actions with API Calls

Modify store actions to call the API:

```typescript
// lib/stores/app-store.ts
updateTask: async (id, updates) => {
  set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  }));
  
  // Call API
  try {
    await updateTask(id, updates);
  } catch (error) {
    // Rollback on error
    console.error('Failed to update task:', error);
    // Revert optimistic update
  }
},
```

## Data Mapping

### RDF to TypeScript

| RDF Ontology | TypeScript Type |
|--------------|-----------------|
| `sro:ScrumProject` | `Project` |
| `sro:Epic` | `Epic` |
| `sro:UserStory` | `UserStory` |
| `pm:Task` | `Task` |
| `sro:Sprint` | `Sprint` |
| `sro:TeamMember` | `TeamMember` |
| `pm:Dependency` | `Dependency` |

### Status Mappings

| RDF State | UI State |
|-----------|----------|
| `pm:NotStarted` | `'not-started'` |
| `pm:InProgress` | `'in-progress'` |
| `pm:Completed` | `'completed'` |
| `pm:Blocked` | `'blocked'` |

## Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SPARQL_ENDPOINT=http://localhost:3030/pm-app/sparql
```

## Testing

1. Start with mock data (current implementation)
2. Implement one endpoint at a time
3. Test with your RDF backend
4. Gradually replace mock data with real API calls

## Benefits of Current Architecture

✅ **Type Safety**: All data structures are TypeScript-typed
✅ **Single Source of Truth**: Zustand store manages all state
✅ **Adapter Pattern**: Easy to swap data formats
✅ **View Independence**: Gantt, Kanban, and Table views use the same data
✅ **API Ready**: Designed to seamlessly connect to your RDF backend
