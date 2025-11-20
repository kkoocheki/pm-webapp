# add-task

**Source:** https://docs.svar.dev/react/gantt/api/actions/add-task

---

- 

- API
- Actions
- add-taskOn this page
# add-task

### Description[​](#description)

Fires when adding a new task

### Usage[​](#usage)

```javascript
"add-task": (ev: {
  id?: string | number,
  task: Partial<ITask>,
  target?: string | number,
  mode?: "before" | "after" | "child",
  show?: "x" | "y" | "xy" | boolean
}) => boolean | void;

```

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Parameters[​](#parameters)

The callback of the **add-task** action can take an object with the following parameters:

- `id` - (optional) the id of a new task

- `target` - (required) the task ID before or after which a new task will be added

- `task` - (required) the task object. The list of parameters you can see here: [tasks](/react/gantt/api/properties/tasks).

- `mode` - (required) specifies where to place a task: **before** - before the task which id is specified, after it (**after**), or creates the child task for the target (**child**)

- `show` - (optional) determines whether and how to scroll to the new task after creation:

- "x" - scroll horizontally

- "y" - scroll vertically

- "xy" - scroll both axes

- true - scroll in both directions

- false - do not scroll

### Example[​](#example)

Use the [`api.exec`](/react/gantt/api/methods/exec) method to trigger the action:

```javascript
import { useState } from "react";
import { getData } from "./common/data";
import { Gantt, Toolbar } from "@svar-ui/react-gantt";
import { Button } from "@svar-ui/react-core";

export default function App() {
  const data = getData();
  const [api, setApi] = useState(null);

  function init(apiInstance) {
    // store Gantt API instance
    setApi(apiInstance);
  }

  function handleAdd() {
    // trigger the add-task action
    api?.exec("add-task", { task: {} });
  }

  return (
    <>
      <Toolbar>
        <Button type="primary" onClick={handleAdd}>Add task</Button>
      </Toolbar>

      <Gantt
        tasks={data.tasks}
        links={data.links}
        scales={data.scales}
        columns={data.columns}
        init={init}
      />
    </>
  );
}

```

In the example below we use the [`api.intercept()`](/react/gantt/api/methods/intercept) method to change the **task** variable value replacing it with the relevant data from the **add-task** action:

```javascript
import { useState } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

export default function App() {
  const data = getData();
  const [task, setTask] = useState(null);

  function init(api) {
    api.intercept("add-task", data => {
      setTask(data.task);
    });
  }

  return (
    <Gantt
      tasks={data.tasks}
      init={init}
    />
  );
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousadd-linkNextcopy-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
