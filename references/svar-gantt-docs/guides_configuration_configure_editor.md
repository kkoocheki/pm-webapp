# Configuring the task editor

**Source:** https://docs.svar.dev/react/gantt/guides/configuration/configure_editor

---

- 

- Guides
- Configuration
- Configuring task editorOn this page
# Configuring the task editor

## Basic usage[​](#basic-usage)

To use the task editor in React, import both `Gantt` and a standalone `Editor` component (based on SVAR Editor) from `@svar-ui/react-gantt` and pass the `api` reference to both. In React you typically obtain the component&#x27;s imperative API via a ref and expose it to the Editor via a prop.

Example:

```javascript
import { useRef, useState, useEffect } from "react";
import { Gantt, Editor } from "@svar-ui/react-gantt";

export default function App() {
  const [api, setApi] = useState(null);

  return (
    <>
      <Gantt init={setApi} />
      {api && <Editor api={api} />}
    </>
  );
}

```

## Configuring the Editor[​](#configuring-the-editor)

The task editor dialog allows you to configure a set of fields (controls) for viewing and editing task data. The task editor modal dialog consists of configurable fields (controls) for managing task data. To define the editor fields, use the `items` property of the standalone `Editor` component.

Supported editor field types include:

- text and textarea

- date

- slider

- select

- counter

- links

For example, to define a simple text input field, add its name to the `comp` field:

```javascript
import { useRef, useState, useEffect } from "react";
import { Gantt, Editor } from "@svar-ui/react-gantt";

export default function App() {
  const [api, setApi] = useState(null);

  const items = [
    {
      key: "text",
      comp: "text",
      label: "Name",
      config: {
        placeholder: "Add task name",
      },
    },
  ];

  return (
    <>
      <Gantt init={setApi} />
      {api && <Editor api={api} items={items} />}
    </>
  );
}

```

To configure the default editor fields, import the `defaultEditorItems` array, modify it as needed, and pass the updated array to the Editor component via the `items` prop.

The example below shows how to remove the "Description" field (which uses the key `"details"`) from the editor:

```javascript
import { useRef, useState, useEffect } from "react";
import { Gantt, Editor, defaultEditorItems } from "@svar-ui/react-gantt";

export default function App() {
  const [api, setApi] = useState(null);

  const items = defaultEditorItems.filter((item) => item.key !== "details");

  return (
    <>
      <Gantt init={setApi} />
      {api && <Editor api={api} items={items} />}
    </>
  );
}

```

The next example demonstrates how to selectively use specific fields from `defaultEditorItems` to configure a custom editor layout, and how to customize the editor&#x27;s bottom toolbar with Save/Delete/Close buttons.

```javascript
import { useRef, useState, useEffect } from "react";
import { getData } from "../data";
import { Gantt, Editor, defaultEditorItems } from "@svar-ui/react-gantt";

export default function App() {
  const data = getData();

  const [api, setApi] = useState(null);
  
  // Define only the fields you want to include
  const keys = ["text", "type", "start", "end", "duration", "progress", "details"];
  const items = keys.map((key) => defaultEditorItems.find((op) => op.key === key));

  const bottomBar = {
    items: [
      { comp: "button", type: "secondary", text: "Close", id: "close" },
      { comp: "spacer" },
      { comp: "button", type: "danger", text: "Delete", id: "delete" },
      { comp: "button", type: "primary", text: "Save", id: "save" },
    ],
  };

  return (
    <>
      <Gantt init={setApi} tasks={data.tasks} links={data.links} scales={data.scales} />
      {api && <Editor api={api} items={items} bottomBar={bottomBar} topBar={false} placement="modal" />}
    </>
  );
}

```

The next example demonstrates how to enable the TimePicker for items with `comp: "date"`:

```javascript
import { useRef, useState, useEffect } from "react";
import { Gantt, Editor, defaultEditorItems } from "@svar-ui/react-gantt";
import { getData } from "../data";

export default function App() {
  const { tasks, links } = getData();

  const [api, setApi] = useState(null);

  const items = defaultEditorItems.map((ed) => ({
    ...ed,
    ...(ed.comp === "date" && { config: { time: true } }),
  }));

  return (
    <>
      <Gantt init={setApi} tasks={tasks} links={links} durationUnit={"hour"} />
      {api && <Editor api={api} items={items} />}
    </>
  );
}

```

**Related articles**:

- [Adding a custom editor dialog](/react/gantt/guides/configuration/adding_custom_dialog)

- [defaultTaskTypes](/react/gantt/helpers/defaulttasktypes)
PreviousConfiguring chart sizesNextConfiguring scales
- [Basic usage](#basic-usage)
- [Configuring the Editor](#configuring-the-editor)
