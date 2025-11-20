# getData()

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_methods/getdata_method

---

- 

- Helpers
- RestDataProvider
- REST methods
- getData()On this page
# getData()

### Description[​](#description)

Gets a promise with an array of tasks and links objects

info
The **getData()** method is a part of the **RestDataProvider** service intended for working with a server

### Usage[​](#usage)

```javascript
getData(): Promise<[]>

```

### Response[​](#response)

The **getData()** method sends a request to the server by the **GET** method and returns **a promise** with data on links and tasks. For the examples of returned objects, see [tasks](/react/gantt/api/properties/tasks) and [links](/react/gantt/api/properties/links).

### Examples[​](#examples)

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const url = "https://some_backend_url";
const server = new RestDataProvider(url);

function MyGantt() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    server.getData().then(data => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, []);

  return <Gantt tasks={tasks} links={links} />;
}

```

### parseDates() method[​](#parsedates-method)

**Description**: `getData()` applies the `parseDates()` method to parse dates (start, end, base_start, base_end from [tasks](/react/gantt/api/properties/tasks)) to Date object (as *new Date(string)*).

**Usage**:

```javascript
parseDates(task) => task

```

If you need to change the parsing method, you can redefine it as in the example below: create a new class that extends RestDataProvider, override the `parseDates()` method, and then use an instance of this class as the provider.

```javascript
class MyProvider extends RestDataProvider {
  parseDates(task) {
    // parse dates by the method you prefer
    return task;
  }
}

const restProvider = new MyProvider(serverUrl);

```

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)

- [api.intercept()](/react/gantt/api/methods/intercept)

- [api.setNext()](/react/gantt/api/methods/setnext)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)
PreviousREST methodsNextsend()
- [Description](#description)
- [Usage](#usage)
- [Response](#response)
- [Examples](#examples)
- [parseDates() method](#parsedates-method)
