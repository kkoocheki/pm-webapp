# API Documentation

## Base URL

Development: `http://localhost:3000/api`

## Authentication

*Authentication will be added in Phase 5*

For now, all endpoints are publicly accessible.

## Common Response Format

All API responses follow this structure:

```typescript
{
  "data": T,           // Response data (type varies by endpoint)
  "error"?: string,    // Error message (only present if error occurred)
  "timestamp": string  // ISO 8601 timestamp
}
```

## Error Responses

```typescript
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Endpoints

### Tasks

#### GET /api/tasks
Get all tasks.

**Query Parameters:**
- `status` (optional) - Filter by status: `planned`, `in-progress`, `blocked`, `done`
- `assignee` (optional) - Filter by assignee ID
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "task-123",
      "title": "Implement authentication",
      "description": "Add JWT-based auth",
      "status": "in-progress",
      "assignee": "user-alice",
      "startDate": "2024-01-15",
      "endDate": "2024-01-22",
      "dependencies": ["task-122"],
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### GET /api/tasks/:id
Get a specific task by ID.

**Response:**
```json
{
  "data": {
    "id": "task-123",
    "title": "Implement authentication",
    "description": "Add JWT-based auth",
    "status": "in-progress",
    "assignee": "user-alice",
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "dependencies": ["task-122"],
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New task",
  "description": "Task description",
  "status": "planned",
  "assignee": "user-alice",
  "startDate": "2024-01-20",
  "endDate": "2024-01-25",
  "dependencies": ["task-100"]
}
```

**Response:**
```json
{
  "data": {
    "id": "task-124",
    "title": "New task",
    ...
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### PUT /api/tasks/:id
Update a task.

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "data": {
    "id": "task-124",
    "title": "Updated title",
    "status": "in-progress",
    ...
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### DELETE /api/tasks/:id
Delete a task.

**Response:**
```json
{
  "data": {
    "id": "task-124",
    "deleted": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### GET /api/tasks/:id/dependencies
Get all dependencies for a task (including transitive).

**Response:**
```json
{
  "data": [
    {
      "id": "task-122",
      "title": "Setup database",
      "status": "done"
    },
    {
      "id": "task-121",
      "title": "Setup infrastructure",
      "status": "done"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Projects

#### GET /api/projects
Get all projects.

**Response:**
```json
{
  "data": [
    {
      "id": "project-main",
      "name": "Main Project",
      "description": "Primary development",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### GET /api/projects/:id
Get a specific project.

**Response:**
```json
{
  "data": {
    "id": "project-main",
    "name": "Main Project",
    "description": "Primary development",
    "taskCount": 24,
    "completedTasks": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Reasoning / AI Insights

#### GET /api/reasoning/insights
Get AI-generated insights about the project.

**Response:**
```json
{
  "data": [
    {
      "id": "insight-1",
      "type": "risk",
      "severity": "high",
      "title": "Critical path task delayed",
      "description": "Task 'Implement API' is 3 days behind schedule and affects 5 dependent tasks",
      "affectedTasks": ["task-123", "task-124", "task-125"],
      "recommendation": "Consider reassigning resources or adjusting timeline",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "insight-2",
      "type": "optimization",
      "severity": "medium",
      "title": "Potential parallelization",
      "description": "Tasks 'Build frontend' and 'Write docs' can be executed in parallel",
      "affectedTasks": ["task-130", "task-131"],
      "recommendation": "Start both tasks simultaneously to save 5 days",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### POST /api/reasoning/chat
Send a message to the AI assistant.

**Request Body:**
```json
{
  "message": "What tasks are blocking my project?"
}
```

**Response (Server-Sent Events):**
```
event: message
data: {"content": "Analyzing your project dependencies...", "type": "thinking"}

event: message
data: {"content": "I found 2 blocking tasks:", "type": "text"}

event: message
data: {"content": "1. Task 'Database migration' (blocked by infrastructure setup)", "type": "text"}

event: done
data: {"conversationId": "conv-123"}
```

---

## SPARQL Query Examples

These are the underlying SPARQL queries used by the API:

### Get All Tasks
```sparql
PREFIX pm: <http://myapp.com/ontology#>

SELECT ?task ?title ?status ?assignee
WHERE {
  ?task rdf:type pm:Task .
  ?task pm:title ?title .
  ?task pm:hasStatus ?status .
  OPTIONAL { ?task pm:assignedTo ?assignee }
}
```

### Get Task Dependencies
```sparql
PREFIX pm: <http://myapp.com/ontology#>

SELECT ?dependency ?depTitle
WHERE {
  pm:task-123 pm:dependsOn+ ?dependency .
  ?dependency pm:title ?depTitle .
}
```

---

## Rate Limiting

*To be implemented in Phase 5*

---

## Webhooks

*To be implemented in Phase 5*

---

## Next Steps

1. Implement all endpoints (Phase 2)
2. Add request validation with Zod
3. Add authentication (Phase 5)
4. Add rate limiting (Phase 5)
5. Add webhook support (Phase 5)
