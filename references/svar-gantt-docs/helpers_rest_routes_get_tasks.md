# GET /tasks

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_routes/get_tasks

---

- 

- Helpers
- RestDataProvider
- REST routes
- GET /tasksOn this page
# GET /tasks

### Description[​](#description)

Gets data on tasks

The route handles the HTTP GET request made to the `/tasks` path.

### Payload[​](#payload)

No payload is required.

### Response[​](#response)

The server returns a JSON array with data on tasks.

Example:

```javascript
[
   {
      "id": 20,
      "text": "New Task",
      "start": "2024-06-21 00:00:00",
      "end": "2024-06-22 00:00:00",
      "duration": 1,
      "progress": 2,
      "parent": 0,
      "type": "task",
      "lazy": false
   },
   {
      "id": 47,
      "text": "[1] Master project",
      "start": "2024-06-10 00:00:00",
      "end": "2024-06-18 00:00:00",
      "duration": 8,
      "progress": 0,
      "parent": 0,
      "type": "summary",
      "lazy": true
   },
   {
      "id": 21,
      "text": "New Task",
      "start": "2024-06-13 00:00:00",
      "end": "2024-06-14 00:00:00",
      "duration": 1,
      "progress": 0,
      "parent": 20,
      "type": "task",
      "lazy": false
   }
]

```

The HTTP status code shows whether the request succeeds (response.status == 200) or fails (response.status == 500).

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)
PreviousGET /links/{taskId}NextPOST /links
- [Description](#description)
- [Payload](#payload)
- [Response](#response)
