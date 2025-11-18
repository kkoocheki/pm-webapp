# ContextMenu

**Source:** https://docs.svar.dev/react/gantt/helpers/context_menu

---

- 

- Helpers
- ContextMenuOn this page
# ContextMenu

### Description[​](#description)

ContextMenu helper

### Usage[​](#usage)

```javascript
<ContextMenu at={at} resolver={resolver} handler={handler} options={options} filter={filter} />

```

You can import the component from *@svar-ui/react-gantt* .

### Parameters[​](#parameters)

All parameters description you can find here: [ContextMenu](https://docs.svar.dev/react/core/menu/contextmenu/api/#properties)

### Example[​](#example)

In the example below we hide the "Delete" menu option for the project type. You should also pass the `api` object to **ContextMenu** (for more details, refer to [How to access Gantt API](/react/gantt/api/how_to_access_api)). Other usage examples see here: [Configuring Context Menu](/react/gantt/guides/configuration/configuring_context_menu).

```javascript
import { useState, useCallback } from "react";
import { getData } from "../data";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

export default function Example() {
  // expose the Gantt instance as `api` for ContextMenu
  const [api, setApi] = useState(null);
  const data = getData();

  const filterMenu = (option, task) => {
    // hide the "delete" item for projects
    const type = task.type;
    if (option.id === "delete-task" && type === "project") return false;
    return true;
  };

  return (
    <ContextMenu api={api} filter={filterMenu}>
      <Gantt
        init={setApi}
        tasks={data.tasks}
        links={data.links}
        scales={data.scales}
      />
    </ContextMenu>
  );
}

```

**Related articles**:

- [How to access Gantt API](/react/gantt/api/how_to_access_api)

- [Configuring Context Menu](/react/gantt/guides/configuration/configuring_context_menu)

- [defaultMenuOptions](/react/gantt/helpers/defaultmenuoptions)
PreviousPUT /tasks/{taskId}NextEditor
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
