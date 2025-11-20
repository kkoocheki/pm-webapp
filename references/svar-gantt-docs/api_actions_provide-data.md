# provide-data

**Source:** https://docs.svar.dev/react/gantt/api/actions/provide-data

---

- 

- API
- Actions
- provide-dataOn this page
# provide-data

### Description[​](#description)

Provides new data for a branch

You should call this action to provide data for a branch.

### Usage[​](#usage)

```javascript
"provide-data": ({
  id: string | number,
  data: {
   tasks?: ITask[],
   links?: ILInk[]
  };
}) => boolean|void;

```

### Parameters[​](#parameters)

- `id` - (required) the ID of the task for which data should be provided

- `data` - (required) new data provided for a branch (the [tasks](/react/gantt/api/properties/tasks) and [links](/react/gantt/api/properties/links) arrays)

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

In the example below we listen to the [`request-data`](/react/gantt/api/actions/request-data) action with the help of the [`api.on()`](/react/gantt/api/methods/on) method, fetch the tasks branch data from the server and pass it to the component by calling the `provide-data` action.

```javascript
import { useState, useEffect } from "react";
import { Gantt } from "@svar-ui/react-gantt";

const server = "https://some-server";

export default function App() {
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

  function init(api) {
    api.on("request-data", ev => {
      Promise.all([
        fetch(`${server}/tasks/${ev.id}`).then(res => res.json()),
        fetch(`${server}/links/${ev.id}`).then(res => res.json()),
      ]).then(([tasks, links]) => {
        api.exec("provide-data", {
          id: ev.id,
          data: {
            tasks,
            links,
          },
        });
      });
    });
  }

  return <Gantt init={init} tasks={tasks} links={links} />;
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousopen-taskNextrender-data
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
