# Configuring toolbar

**Source:** https://docs.svar.dev/react/gantt/guides/configuration/toolbar

---

- 

- Guides
- Configuration
- Configuring toolbarOn this page
# Configuring toolbar

The widget provides two possible ways to configure the Toolbar:

- using the internal **Toolbar** component of Gantt (import from *@svar-ui/react-gantt*) and the [defaultToolbarButtons](/react/gantt/helpers/defaulttoolbarbuttons) array

- using the external **Toolbar** component with configurable data (import from *@svar-ui/react-toolbar*)

### Adding the default toolbar[​](#adding-the-default-toolbar)

To add a toolbar, import the **Toolbar** component of Gantt, and add the **Toolbar** tag. You should also use the **api** object and pass it to the **Toolbar**.

```javascript
import { useState } from "react";
import { getData } from "./common/data";
import { Gantt, Toolbar } from "@svar-ui/react-gantt";

export default function Example() {
  const data = getData();

  // store the Gantt API instance
  const [api, setApi] = useState(null);

  return (
    <>
      <Toolbar api={api} />
      <Gantt init={setApi} tasks={data.tasks} />
    </>
  );
}

```

### Configuring the set of buttons in the toolbar[​](#configuring-the-set-of-buttons-in-the-toolbar)

To configure the toolbar (the set of buttons in the toolbar and their appearance), import the **Toolbar** component of Gantt and make necessary changes to the **items** array. Do not forget to add the **items** attribute to the **Toolbar** tag.

```javascript
import { useState } from "react";
import { getData } from "../data";
import { Gantt, Toolbar } from "@svar-ui/react-gantt";

export default function ToolbarCustomItems() {
  const data = getData();

  const [api, setApi] = useState(null);

  const items = [
    {
      id: "add-task",
      comp: "button",
      icon: "wxi-plus",
      text: "Add task",
      type: "primary",
    },
    {
      id: "edit-task",
      comp: "button",
      icon: "wxi-edit",
      text: "edit",
      type: "link",
    },
  ];

  return (
    <>
      <Toolbar api={api} items={items} />
      <Gantt init={setApi} tasks={data.tasks} />
    </>
  );
}

```

You can also customize the Toolbar by importing and changing the [defaultToolbarButtons](/react/gantt/helpers/defaulttoolbarbuttons) array.

```javascript
import { useState } from "react";
import { getData } from "../data";
import {
  Gantt,
  Toolbar,
  defaultToolbarButtons,
} from "@svar-ui/react-gantt";

export default function ToolbarFilterDefault() {
  const data = getData();

  const [api, setApi] = useState(null);

  // remove indentation buttons
  const items = defaultToolbarButtons.filter((b) => {
    return b.id?.indexOf("indent") === -1;
  });

  return (
    <>
      <Toolbar api={api} items={items} />
      <Gantt init={setApi} tasks={data.tasks} />
    </>
  );
}

```

### Adding a custom toolbar[​](#adding-a-custom-toolbar)

The example below shows how to add a custom toolbar by applying the external **Toolbar** component. We import the **Toolbar** component, add functions to handle the actions using the [`api.exec()`](/react/gantt/api/methods/exec) method, and modify the `items` array.

```javascript
import { useState } from "react";
import { getData } from "../data";
import { Gantt } from "@svar-ui/react-gantt";
import { Toolbar } from "@svar-ui/react-toolbar";

export default function CustomToolbarExample() {
  const data = getData();

  const [api, setApi] = useState(null);
  const [selected, setSelected] = useStoreLater(api, "selected");
  
  function handleAdd() {
    if (!api) return;
    api.exec("add-task", {
      task: {
        text: "New task",
      },
      target: selected[0],
      mode: "after",
    });
  }

  function handleDelete() {
    if (!api) return;
    const order = getActionOrder(true);
    order.forEach((id) => api.exec("delete-task", { id }));
  }

  function handleMove(mode) {
    if (!api) return;
    const changeDir = mode === "down";
    const order = getActionOrder(changeDir);
    order.forEach((id) => api.exec("move-task", { id, mode }));
  }

  function getActionOrder(changeDir) {
    // sort by visible order and level
    const tasks = selected
      .map((id) => api.getTask(id))
      .sort((a, b) => {
        return a.$level - b.$level || a.$y - b.$y;
      });
    const idOrder = tasks.map((o) => o.id);

    // reverse for deleting/moving tasks down
    if (changeDir) return idOrder.reverse();
    return idOrder;
  }

  const allItems = [
    {
      comp: "button",
      type: "primary",
      text: "Add task",
      handler: handleAdd,
    },
    {
      comp: "button",
      text: "Delete task",
      handler: handleDelete,
    },
    {
      comp: "button",
      type: "primary",
      text: "Move task down",
      handler: () => handleMove("down"),
    },
    {
      comp: "button",
      type: "primary",
      text: "Move task up",
      handler: () => handleMove("up"),
    },
  ];
  
  const items = useMemo(() => {
    return selected ? allItems : [allItems[0]];
  });

  return (
    <>
      <Toolbar items={items} />
      <div className="gtcell">
        <Gantt
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          init={setApi}
        />
      </div>
    </>
  );
}

```
PreviousConfiguring grid areaNextZooming
- [Adding the default toolbar](#adding-the-default-toolbar)
- [Configuring the set of buttons in the toolbar](#configuring-the-set-of-buttons-in-the-toolbar)
- [Adding a custom toolbar](#adding-a-custom-toolbar)
