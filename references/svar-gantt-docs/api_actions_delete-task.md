# delete-task

**Source:** https://docs.svar.dev/react/gantt/api/actions/delete-task

---

- 

- API
- Actions
- delete-taskOn this page
# delete-task

### Description[​](#description)

Fires when deleting a task

### Usage[​](#usage)

```javascript
"delete-task": ({
  id:  string | number,
  source?: string | number
}) => boolean|void;

```

### Parameters[​](#parameters)

The callback of the **delete-task** action can take an object with the following parameters:

- `id` - (required) the ID of a task to be deleted

- `source` - (optional) the ID of a source task that is deleted

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

Use the [`api.exec`](/react/gantt/api/methods/exec) method to trigger the action:

```javascript
import { useState } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";
import { Button } from "@svar-ui/react-core";

const data = getData();

export default function Example() {
  const [api, setApi] = useState(null);
  const [selected, setSelected] = useState(null);

  function handleDelete() {
    api?.exec("delete-task", { id: selected });
  }

  return (
    <>
      <Toolbar>
        {selected && <Button onClick={handleDelete}>Delete task</Button>}
      </Toolbar>

      <Gantt tasks={data.tasks} init={setApi} />
    </>
  );
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousdelete-linkNextdrag-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
