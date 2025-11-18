# POST /links

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_routes/post_links

---

- 

- Helpers
- RestDataProvider
- REST routes
- POST /linksOn this page
# POST /links

### Description[​](#description)

Creates a new link

The route handles the HTTP POST request made to the `/links` path.

### Payload[​](#payload)

The server needs to receive a JSON object with data for the new link. See parameters description here: [`links`](/react/gantt/api/properties/links)

```javascript
{
   "id": "temp://1710929724740",
   "source": 69,
   "target": 70,
   "type": "s2s"
}

```

### Response[​](#response)

The server returns a JSON object with the new link ID.

Example:

```javascript
{
  "id": 17 
}

```

The HTTP status code shows whether the request succeeds (response.status == 200) or fails (response.status == 500).

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)
PreviousGET /tasksNextPOST /tasks
- [Description](#description)
- [Payload](#payload)
- [Response](#response)
