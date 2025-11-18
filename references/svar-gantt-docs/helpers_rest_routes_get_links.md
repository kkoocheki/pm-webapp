# GET /links

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_routes/get_links

---

- 

- Helpers
- RestDataProvider
- REST routes
- GET /linksOn this page
# GET /links

### Description[​](#description)

Gets data on links

The route handles the HTTP GET request made to the `/links` path.

### Payload[​](#payload)

No payload is required.

### Response[​](#response)

The server returns a JSON array with data on links.

Example:

```javascript
[
   {
      "id": 9,
      "source": 60,
      "target": 61,
      "type": "e2s"
   },
   {
      "id": 10,
      "source": 48,
      "target": 49,
      "type": "s2s"
   },
   {
      "id": 11,
      "source": 54,
      "target": 56,
      "type": "e2s"
   },
   {
      "id": 12,
      "source": 56,
      "target": 58,
      "type": "s2s"
   },
   {
      "id": 13,
      "source": 49,
      "target": 50,
      "type": "e2s"
   },
   {
      "id": 14,
      "source": 56,
      "target": 57,
      "type": "s2s"
   },
   {
      "id": 15,
      "source": 53,
      "target": 54,
      "type": "s2s"
   },
   {
      "id": 16,
      "source": 64,
      "target": 65,
      "type": "e2s"
   }
]

```

The HTTP status code shows whether the request succeeds (response.status == 200) or fails (response.status == 500).

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)
PreviousDELETE /tasks/{taskId}NextGET /links/{taskId}
- [Description](#description)
- [Payload](#payload)
- [Response](#response)
