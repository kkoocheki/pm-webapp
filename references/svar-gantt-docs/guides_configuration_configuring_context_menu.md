# Configuring the context menu

**Source:** https://docs.svar.dev/react/gantt/guides/configuration/configuring_context_menu

---

- 

- Guides
- Configuration
- Configuring context menuOn this page
# Configuring the context menu

info
The description of the **ContextMenu** component see here: **ContextMenu helper**

### Adding default context menu[​](#adding-default-context-menu)

To add a context menu with default menu options, import the **ContextMenu** component from "@svar-ui/react-gantt" and wrap the Gantt component with the **ContextMenu** component. You should also create an API ref (using React&#x27;s useRef) and pass it to both **ContextMenu** (via the api prop) and **Gantt** (via ref) so the helper can access the Gantt API.

Example:

```javascript
import { useState } from "react";
import { getData } from "../data";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

export default function Example() {
  const [api, setApi] = useState(null);
  const data = getData();

  return (
    <ContextMenu api={api}>
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

### Configuring menu options[​](#configuring-menu-options)

To customize menu options, import the **ContextMenu** component and pass a custom options array to its options prop. To add subitems, add objects to the data array inside an option object.

Example:

```javascript
import { useState } from "react";
import { getData } from "../data";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

export default function ExampleWithOptions() {
  const [api, setApi] = useState(null);
  const data = getData();

  const options = [
    {
      id: "add-task",
      text: "Add",
      icon: "wxi-plus",
      data: [{ id: "add-task:child", text: "Child task" }],
    },
    { type: "separator" },
    {
      id: "edit-task",
      text: "Edit",
      icon: "wxi-edit",
    },
    { id: "cut-task", text: "Cut", icon: "wxi-content-cut" },
  ];

  return (
    <ContextMenu api={api} options={options}>
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

You can also import the ready-made [`defaultMenuOptions`](/react/gantt/helpers/defaultmenuoptions) array, modify the required parameters, and pass the modified array to the **ContextMenu**.

### Showing context menu for specific tasks[​](#showing-context-menu-for-specific-tasks)

The resolver property of the **ContextMenu** component allows you to define for which tasks the menu should be shown.

The example below shows how to show the context menu only for tasks with an id > 2.

```javascript
import { useState } from "react";
import { getData } from "../data";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

export default function ExampleWithResolver() {
  const [api, setApi] = useState(null);
  const data = getData();

  // show menu for certain tasks
  function resolver(id) {
    return id > 2;
  }

  return (
    <ContextMenu api={api} resolver={resolver}>
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

### Filtering menu options[​](#filtering-menu-options)

In the example below we hide the "Delete" menu option for the "summary" task type:

```javascript
import { getData } from "../data";
import { Gantt, ContextMenu } from "@svar-ui/react-gantt";

export default function ExampleWithFilter() {
  const [api, setApi] = useState(null);
  const data = getData();

  const filterMenu = (option, task) => {
    const type = task.type;
    if (option.id === "delete-task" && type === "summary") return false;
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
PreviousAdding tooltipsNextConfiguring chart sizes
- [Adding default context menu](#adding-default-context-menu)
- [Configuring menu options](#configuring-menu-options)
- [Showing context menu for specific tasks](#showing-context-menu-for-specific-tasks)
- [Filtering menu options](#filtering-menu-options)
