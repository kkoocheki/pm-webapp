# send()

**Source:** https://docs.svar.dev/react/gantt/helpers/rest_methods/send_method

---

- 

- Helpers
- RestDataProvider
- REST methods
- send()On this page
# send()

### Description[​](#description)

Sends a necessary HTTP request to the server and returns a promise with or without data depending on the request

All requests to the server are made with the **send()** method which is a part of the **RestDataProvider** service.

### Usage[​](#usage)

```javascript
send(
   url: string,
   method: "GET" | "POST" | "PUT" | "DELETE" | string,
   data?: object,
   headers?: object,
): Promise<obj[]>

```

### Parameters[​](#parameters)

NameTypeDescription`url`string*Required*. A path to the server where a request is sent to.`method`string*Required*. An HTTP method type (Get, Post, Put, Delete)`data`object*Optional*. Parameters that are sent to the server. By default, parameters of the fired event are sent.  But you are free to add additional parameters with the custom object. See the examples below.`headers`object*Optional*. A default header is the **Content-Type** header set to *application/json*. More optional headers can be added with the **customHeaders** parameter. See the examples below.

### Response[​](#response)

The method returns the promise object with or without data depending on the request.

A promise is returned in response to the success request status. In case of the failed request (response.status == 500), an exception with an error text is thrown.

### Examples[​](#examples)

The following examples demonstrate how to add more headers to the **send()** method.

```javascript
const customHeaders = {
   "Authorization": "Bearer",
   "Custom header": "some value",
};

api.intercept("add-task", obj => {
   restDataProvider.send("tasks", "POST", obj, customHeaders);
});

```

Or you can add headers by redefining RestDataProvider, which can give you more control of the data you send to the server:

```javascript
import { useState, useEffect, useMemo } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const url = "https://some_backend_url";

class MyDataProvider extends RestDataProvider {
  send(url, method, data, headers) {
    headers = { ...headers, SomeToken: "abc" };
    return super.send(url, method, data, headers);
  }
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  const server = useMemo(() => new MyDataProvider(url), []);

  useEffect(() => {
    server.getData().then(data => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, [server]);

  function init(api) {
    api.setNext(server);
  }

  return <Gantt tasks={tasks} links={links} init={init} />;
}

```

The example below shows how to add additional parameters to the request. You don&#x27;t need to call the `send()` method manually here as it&#x27;s called via the [`api.setNext()`](/react/gantt/api/methods/setnext) method.

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const url = "https://some_backend_url";
const server = new RestDataProvider(url);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    server.getData().then(data => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, []);

  function init(api) {
    api.intercept("update-task", data => {
      data.custom = "custom event";
    });
    api.setNext(server);
  }

  return <Gantt tasks={tasks} links={links} init={init} />;
}

```

If you send an arbitrary request that is not managed by the Gantt API, you can pass the parameters object into the `send()` method of the RestDataProvider manually:

```javascript
const customEndpoint = `projects/1`;
const params = {
   lastModified: Date.now()
};
restProvider.send(customEndpoint, "PUT", params).then(data => {
   // handle response
});

```

### formatDate() method[​](#formatdate-method)

**Description**: when data is sent via the `send()` method, the Date objects are formatted to strings: "yyyy-MM-dd HH:mm:ss".

**Usage**:

```javascript
formatDate(date) => string

```

If you need to format dates to a different format, you can redefine it as in the example below: create a new class for RestDataProvider, set the required format with the `formatDate()` method, and then apply this new class for RestDataProvider.

```javascript
class MyProvider extends RestDataProvider {
  formatDate(date) {
    const string = /* convert date to string */;
    return string;
  }
}

const restProvider = new MyProvider(serverUrl);

```

**Related articles**:

- [Working with server](/react/gantt/guides/working_with_server)

- [api.intercept()](/react/gantt/api/methods/intercept)

- [api.setNext()](/react/gantt/api/methods/setnext)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)
PreviousgetData()NextREST routes
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Response](#response)
- [Examples](#examples)
- [formatDate() method](#formatdate-method)
