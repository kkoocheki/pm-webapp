# POST /tasks

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_routes/post_tasks

---

- 

- Helpers
- RestDataProvider
- REST routes
- POST /tasksOn this page
# POST /tasks

### Description[​](#description)

Creates a new task

The route handles the HTTP POST request made to the `/tasks` path.

### Payload[​](#payload)

The server needs to receive a JSON object with data for the new task: `task` object, task position (`mode`) and id of the target task if needed. The description of the task object see here: [`tasks`](/react/gantt/api/properties/tasks) property.

```javascript
{
  "task":{
    "text": "New Task",
    "parent": 20,
    "start": "2024-06-21 00:00:00",
    "duration": 1,
    "end": "2024-06-22 00:00:00",
    "id": "temp://1710851071459",
    "progress": 0,
    "type": "task",
    "details": "", // the description field in the task editor
  },
  "mode": "after",  // or "before", "child"
  "target": 123458765 //id of target task if mode is provided

}

```

### Response[​](#response)

The server returns a JSON object with the new task ID.

Example:

```javascript
{
  "id":13
}

```

The HTTP status code shows whether the request succeeds (response.status == 200) or fails (response.status == 500).

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)
PreviousPOST /linksNextPOST /{batchURL}
- [Description](#description)
- [Payload](#payload)
- [Response](#response)
