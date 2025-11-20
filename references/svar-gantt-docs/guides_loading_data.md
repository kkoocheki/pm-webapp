# Loading data

**Source:** https://docs.svar.dev/react/gantt/guides/loading_data

---

- 

- Guides
- Loading dataOn this page
# Loading data

### Preparing data[​](#preparing-data)

The following types of information can be loaded into Gantt:

- [`tasks`](/react/gantt/api/properties/tasks) - an array of objects with data on tasks

```javascript
const tasks = [
  {
    id: 1,
    open: true,
    start: new Date(2023, 11, 6),
    duration: 8,
    text: "React Gantt Widget",
    progress: 60,
    type: "summary"
  },
  {
    id: 2,
    parent: 1,
    start: new Date(2023, 11, 6),
    duration: 4,
    text: "Lib-Gantt",
    progress: 80
  },
  {
    id: 3,
    parent: 1,
    start: new Date(2023, 11, 11),
    duration: 4,
    text: "UI Layer",
    progress: 30
  },
  {
    id: 4,
    start: new Date(2023, 11, 12),
    duration: 8,
    text: "Documentation",
    progress: 10,
    type: "summary"
  },
  {
    id: 5,
    parent: 4,
    start: new Date(2023, 11, 10),
    duration: 1,
    text: "Overview",
    progress: 30
  },
  {
    id: 6,
    parent: 4,
    start: new Date(2023, 12, 11),
    duration: 8,
    text: "API reference",
    progress: 0
  }
];

```

- [`columns`](/react/gantt/api/properties/columns) - an array of objects with data on columns for the table part (grid area with tasks tree)

```javascript
const columns = [
  { id: "text", header: "Task name", flexgrow: 2 },
  {
    id: "start",
    header: "Start date",
    flexgrow: 1,
    align: "center",
  },
  {
    id: "duration",
    header: "Duration",
    align: "center",
    flexgrow: 1,
  },
  {
    id: "add-task",
    header: "",
    width: 50,
    align: "center",
  },
];

```

- [`links`](/react/gantt/api/properties/links) - an array of objects with data for links (dependencies between items)

```javascript
const links = [
  { id: 1, source: 3, target: 4, type: "e2s" },
  { id: 2, source: 1, target: 2, type: "e2s" },
  { id: 21, source: 8, target: 1, type: "s2s" },
  { id: 22, source: 1, target: 6, type: "s2s" },
];

```

- [`scales`](/react/gantt/api/properties/scales) - an array of objects with data for time scales

```javascript
const scales = [
  { unit: "month", step: 1, format: "MMMM yyy" },
  { unit: "day", step: 1, format: "d", css: dayStyle },
];

```

To pass tasks, columns, links, and scales to Gantt, import data and initialize the component:

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

<Gantt
  tasks={data.tasks}
  links={data.links}
  scales={data.scales}
/>

```

### Loading data from a local source[​](#loading-data-from-a-local-source)

You can load predefined data from a separate file at the initialization stage.

First, include the data file and import the **Gantt** component:

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

```

Then pass the loaded data to Gantt:

```javascript
const data = getData();

<Gantt
  tasks={data.tasks}
  links={data.links}
  scales={data.scales}
/>

```

### Loading data from the server[​](#loading-data-from-the-server)

You can also load server data. Fetch data from the server and pass it to Gantt via the same props.

Example using the native fetch API and React state/hooks:

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";

const server = "https://some-backend-url";

function Example() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(server + "/tasks").then(res => res.json()),
      fetch(server + "/links").then(res => res.json()),
    ]).then(([t, l]) => {
      setTasks(t);
      setLinks(l);
    });
  }, []);

  return <Gantt tasks={tasks} links={links} />;
}

```

Alternatively, use the ready-made **RestDataProvider** service and connect it to the backend. Import it and apply the [`getData`](/react/gantt/helpers/rest_methods/getdata_method) method. See: [Working with server](/react/gantt/guides/working_with_server/#connecting-restdataprovider-to-the-backend).

Example with RestDataProvider:

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const server = new RestDataProvider("https://some_backend_url");

function Example() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    server.getData().then(data => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, []);

  const init = api => {
    api.setNext(server);
  };

  return <Gantt tasks={tasks} links={links} init={init} />;
}

```

### Dynamic data loading[​](#dynamic-data-loading)

The widget also allows loading data dynamically. To enable it, in the [`tasks`](/react/gantt/api/properties/tasks) array set the **lazy** field to **true** for task branches whose child tasks you want to load dynamically. Configure your server so the content of these child tasks is not loaded during the initial load.

Example of the tasks array:

```javascript
const tasks = [
  {
    id: 1,
    open: false,
    start: new Date(2020, 11, 6),
    duration: 8,
    text: "React Gantt Widget",
    progress: 60,
    type: "summary",
    lazy: true
  },
  {
    id: 3,
    open: false,
    start: new Date(2020, 11, 7),
    duration: 8,
    text: "React Gantt Widget",
    progress: 68,
    type: "summary",
    lazy: true
  },
];

```

When such task branches are opened in the UI, Gantt will issue the [`request-data`](/react/gantt/api/actions/request-data) action with the folder id as a parameter. Listen to this action with the [`api.on()`](/react/gantt/api/methods/on) method, fetch the branch data from the server and return it to the component by calling the [`provide-data`](/react/gantt/api/actions/provide-data) action.

Example showing how to handle dynamic loading in React:

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";

const server = "https://some-backend-url";

function Example() {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(server + "/tasks").then(res => res.json()),
      fetch(server + "/links").then(res => res.json()),
    ]).then(([t, l]) => {
      setTasks(t);
      setLinks(l);
    });
  }, []);

  const init = api => {
    api.on("request-data", ev => {
      Promise.all([
        fetch(server + `/tasks/${ev.id}`).then(res => res.json()),
        fetch(server + `/links/${ev.id}`).then(res => res.json()),
      ]).then(([tasksBranch, linksBranch]) => {
        api.exec("provide-data", {
          id: ev.id,
          data: {
            tasks: tasksBranch,
            links: linksBranch,
          },
        });
      });
    });
  };

  return <Gantt init={init} tasks={tasks} links={links} />;
}

```
PreviousZoomingNextFullscreen mode
- [Preparing data](#preparing-data)
- [Loading data from a local source](#loading-data-from-a-local-source)
- [Loading data from the server](#loading-data-from-the-server)
- [Dynamic data loading](#dynamic-data-loading)
