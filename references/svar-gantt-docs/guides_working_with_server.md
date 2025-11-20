# Working with server

**Source:** https://docs.svar.dev/react/gantt/guides/working_with_server

---

- 

- BackendOn this page
# Working with server

The Gantt library allows working both with the client and server data. The widget doesn&#x27;t impose any special requirements on the backend. It can be easily connected with any backend platform.

You are free to create your custom server script or if you want to use the ready-made built-in backend, you can find the needed script in the following repository: [Go backend](https://github.com/svar-widgets/gantt-backend-go)

### RestDataProvider[​](#restdataprovider)

To automate the process of working with the server, you can use the ready-made helper which is the **RestDataProvider** service.

The **RestDataProvider** service:

- 

listens to the following actions and sends REST requests (via its [`send()`](/react/gantt/helpers/rest_methods/send_method) method) to perform the corresponding data operations on the backend:

- 

**"add-task"**

- 

**"update-task"**

- 

**"delete-task"**

- 

**"add-link"**

- 

**"update-link"**

- 

**"delete-link"**

- 

**"move-task"**

- 

**"copy-task"**

- 

provides a special method for loading data: [`getData()`](/react/gantt/helpers/rest_methods/getdata_method) gets a promise with tasks and links data

- 

offers the debounce functionality to avoid excessive server requests

### Connecting RestDataProvider to the backend[​](#connecting-restdataprovider-to-the-backend)

To connect **RestDataProvider** to the backend, you need to import the **RestDataProvider** component from *@svar-ui/gantt-data-provider*, and then create an instance by providing the path to your server in the constructor.
You should also include **RestDataProvider** into the **Event Bus** order via the [`api.setNext()`](/react/gantt/api/methods/setnext) method to send the corresponding requests to the server.
To load data, apply the [`getData`](/react/gantt/helpers/rest_methods/getdata_method) method.

```javascript
import { useState, useEffect, useRef, useCallback } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const url = "https://some_backend_url";
const server = new RestDataProvider(url);

function App() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  
  useEffect(() => {
    server.getData().then(data => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, []);

  const init = useCallback((api) => {
    api.intercept("update-task", (data) => {
      data.custom = "custom event";
    });

    api.setNext(server);
  }, []);

  return (
    <Gantt
      tasks={tasks}
      links={links}
      init={init}
    />
  );
}

```

### Enabling the batch mode[​](#enabling-the-batch-mode)

RestDataProvider also supports **batching** that allows putting multiple API calls into one HTTP request using a single batch request. It&#x27;s possible to send requests of different types in one batch ("PUT"|"POST"|"DELETE"). RestDataProvider will combine all individual requests into one batch request. Please, refer to [batchURL](/react/gantt/helpers/rest_routes/post_batch).

To switch to the batch mode, in the constructor define the *batchURL* that will be applied to send multiple combined requests (e.g., `POST https://master--svar-gantt-go-project.io/batch`).

```javascript
new RestDataProvider(
  "https://master--svar-gantt-go-project.io",
  { batchURL: "batch" }
);

```

The example below demonstrates how to enable the batch mode for updating data on tasks and links in case mass editing takes place.

```javascript
import { useState, useEffect, useRef, useCallback } from "react";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

const restProvider = new RestDataProvider(
  "https://master--svar-gantt-go--myproject.io",
  { batchURL: "batch" }
);

function App() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  
  const [api, setApi] = useState(null);

  useEffect(() => {
    restProvider.getData().then(({ tasks: t, links: l }) => {
      setTasks(t);
      setLinks(l);
    });
  }, []);

  const init = useCallback((api) => {
    api.setNext(restProvider);

    api.on("request-data", (ev) => {
      restProvider.getData(ev.id).then(({ tasks, links }) => {
        api.exec("provide-data", {
          id: ev.id,
          data: {
            tasks,
            links,
          },
        });
      });
    });
  }, []);

  return (
    <ContextMenu api={api}>
      <Gantt init={init} tasks={tasks} links={links} />
    </ContextMenu>
  );
}

```

**Related articles**:

- [api.intercept()](/react/gantt/api/methods/intercept)

- [api.setNext()](/react/gantt/api/methods/setnext)

- [getData()](/react/gantt/helpers/rest_methods/getdata_method)

- [batchURL](/react/gantt/helpers/rest_routes/post_batch)

- [provide-data](/react/gantt/api/actions/provide-data)

- [request-data](/react/gantt/api/actions/request-data)

- [send()](/react/gantt/helpers/rest_methods/send_method)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)
PreviousStylingNextAPI overview
- [RestDataProvider](#restdataprovider)
- [Connecting RestDataProvider to the backend](#connecting-restdataprovider-to-the-backend)
- [Enabling the batch mode](#enabling-the-batch-mode)
