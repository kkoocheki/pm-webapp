# move-task

**Source:** https://docs.svar.dev/react/gantt/api/actions/move-task

---

- 

- API
- Actions
- move-taskOn this page
# move-task

### Description[​](#description)

Fires when moving a task

### Usage[​](#usage)

```javascript
"move-task": ({
   id:  string | number,
   mode: "before" | "after" | "up" | "down" | "child",
   target?: string | number,
   source?: string | number,
   inProgress?: boolean
}) => boolean|void;

```

### Parameters[​](#parameters)

The callback of the **move-task** action can take an object with the following parameters:

- `id` - (required) the task ID

- `mode` - (required) specifies where to move a task with the next values:

- **up** - move up

- **down** - move down

- **before** - move before the target task if the target task id is specified

- **after** - move after the target task if the target task id is specified

- **child** - move to a new parent

- `target` - (optional) the id of a task before/after which to move the current task

- `source` - (optional) the id of a source task that is moved

- `inProgress` - (optional) **true** marks that the process of moving a task is still in progress (a task is being dragged by user); **false** specified that a user has released a mouse after after dragging a task.

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

Use the [`api.exec()`](/react/gantt/api/methods/exec) method to trigger the action:

```javascript
import { useRef } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";
import { Button } from "@svar-ui/react-core";

export default function Example() {
  const data = getData();
  const apiRef = useRef(null);

  function handleMove(mode) {
    const api = apiRef.current;
    if (!api) return;
    const selected = api.getState().selected;
    api.exec("move-task", { id: selected, mode });
  }

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          handleMove("up");
        }}
      >
        Move task up
      </Button>

      <Gantt tasks={data.tasks} ref={apiRef} />
    </>
  );
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousindent-taskNextopen-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
