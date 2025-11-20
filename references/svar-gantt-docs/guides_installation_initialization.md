# Installation and initialization

**Source:** https://docs.svar.dev/react/gantt/guides/installation_initialization

---

- 

- Guides
- Installation and initializationOn this page
# Installation and initialization

SVAR Gantt is an open-source library distributed under the GPLv3 license.

## Installing Gantt[​](#installing-gantt)

To install the React Gantt library, you should run the following command:

```javascript
//npm
npm install @svar-ui/react-gantt

//yarn
yarn add @svar-ui/react-gantt

```

### Working with older React toolkits[​](#working-with-older-react-toolkits)

If you want to use the library with an older version of the React toolkit, you can do so by using the 1.x version of the widget

```javascript
npm install @svar-ui/react-gantt@1.2.0

```

## Initializing[​](#initializing)

Import the **Gantt** component.

```javascript
import { Gantt } from "@svar-ui/react-gantt";

```

Initialize Gantt. Such properties as `tasks`, `links`, `scales`, `columns` are core elements of the Gantt chart but they are not required for the initialization stage. The example below will create an empty chart with the timescale and the area for tasks tree:

```javascript
import { Gantt } from "@svar-ui/react-gantt";

export default function App() {
  return <Gantt />;
}

```

The next example shows how to create a simple chart one summary task and one task in it, and two separate tasks and one dependency link between them. The minimum scales unit is "day".

```javascript
import { Gantt } from "@svar-ui/react-gantt";

export default function App() {
  const tasks = [
    {
      id: 20,
      text: "New Task",
      start: new Date(2024, 5, 11),
      end: new Date(2024, 6, 12),
      duration: 1,
      progress: 2,
      type: "task",
      lazy: false,
    },
    {
      id: 47,
      text: "[1] Master project",
      start: new Date(2024, 5, 12),
      end: new Date(2024, 7, 12),
      duration: 8,
      progress: 0,
      parent: 0,
      type: "summary",
    },
    {
      id: 22,
      text: "Task",
      start: new Date(2024, 7, 11),
      end: new Date(2024, 8, 12),
      duration: 8,
      progress: 0,
      parent: 47,
      type: "task",
    },
    {
      id: 21,
      text: "New Task 2",
      start: new Date(2024, 7, 10),
      end: new Date(2024, 8, 12),
      duration: 3,
      progress: 0,
      type: "task",
      lazy: false,
    },
  ];

  const links = [{ id: 1, source: 20, target: 21, type: "e2e" }];

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" },
  ];

  return <Gantt tasks={tasks} links={links} scales={scales} />;
}

```

Now you can move forward and load data. See [Loading data](/react/gantt/guides/loading_data).
PreviousUser interface overviewNextConfiguration
- [Installing Gantt](#installing-gantt)
- [Working with older React toolkits](#working-with-older-react-toolkits)
- [Initializing](#initializing)
