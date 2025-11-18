# Getting started

**Source:** https://docs.svar.dev/react/gantt/getting_started

---

- 

- Getting startedOn this page
# Getting started

This page describes how to start with the SVAR React Gantt component in your React application.

## Step 1. Install the package[​](#step-1-install-the-package)

SVAR Gantt is an open-source library distributed under the GPLv3 license.

[Install package from NPM](/react/gantt/guides/installation_initialization).

```javascript
npm install @svar-ui/react-gantt

```

## Step 2. Create and initialize the Gantt chart[​](#step-2-create-and-initialize-the-gantt-chart)

Import the **Gantt** component to your project:

```javascript
import { Gantt } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

```

Initialize Gantt. `tasks`, `links`, `scales`, `columns` are the main Gantt elements but they are not required for the initialization stage. The example below will create an empty chart with the timescale and the area for tasks tree:

```javascript
import { Gantt } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

export default function App() {
  return <Gantt />;
}

```

The next example shows how to create a simple chart with one summary task and one task in it, and two separate tasks and one dependency link between them. The minimum scales unit is "day". You do not need to add the **columns** array for the grid area, four columns will be displayed by default: "Task name", "Start Date", "Duration", and the action button for adding tasks.

```javascript
import { Gantt } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

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

export default function App() {
  return <Gantt tasks={tasks} links={links} scales={scales} />;
}

```

More instructions about loading data you can see here [Loading data](/react/gantt/guides/loading_data).

## Step 3. Apply a theme[​](#step-3-apply-a-theme)

To add look and feel to the application, import one of the predefined themes, which will also make all elements display correctly:

- Willow

- WillowDark

Apply the desired theme by wrapping **Gantt** into the required theme component:

```javascript
import { getData } from "./common/data";
import { Gantt, Willow } from "@svar-ui/react-gantt"; //import theme and component
import "@svar-ui/react-gantt/all.css"; //import css file from the package

const data = getData();

export default function App() {
  return (
    <Willow>
      <Gantt tasks={data.tasks} />
    </Willow>
  );
}

```

## What&#x27;s next[​](#whats-next)

Now you can dive deeper into the Gantt API and get down to configuring it to your needs:

- [Guides](/react/gantt/category/guides) pages provide instructions about installation, loading data, styling, and other helpful tips to go smoothly with the Gantt configuration

- [Gantt API](/react/gantt/api/overview/api_overview) reference gives description of the Gantt functionality

- [Helpers](/react/gantt/category/helpers) pages describe the ready-made helpers that will make the process of working with the widget easy and enjoyable; the Gantt widget provides even a ready-to-use independent service for working with backend.
PreviousGantt overviewNextWhat&#x27;s new
- [Step 1. Install the package](#step-1-install-the-package)
- [Step 2. Create and initialize the Gantt chart](#step-2-create-and-initialize-the-gantt-chart)
- [Step 3. Apply a theme](#step-3-apply-a-theme)
- [What's next](#whats-next)
