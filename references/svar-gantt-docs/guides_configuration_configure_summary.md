# Configuring summary tasks

**Source:** https://docs.svar.dev/react/gantt/guides/configuration/configure_summary

---

- 

- Guides
- Configuration
- Configuring summary tasksOn this page
# Configuring summary tasks

### Default functionality[​](#default-functionality)

A summary task is a group of tasks, milestones and other summary tasks (or other custom items created by a user). A summary task has the next default settings:

- The start and end dates of a summary task depend on child tasks. If a child task is rescheduled to start before the start date of a summary task, the summary task&#x27;s start date changes. If a child task is rescheduled to end after a summary task&#x27;s end date, the summary task&#x27;s end date changes.

- Its start and end dates cannot be changed separately. That&#x27;s why a summary task&#x27;s bar cannot be resized. A user can [drag a summary task only with its child tasks](/react/gantt/guides/user-interface/#drag-n-drop-progress-bars-change-task-dates). If a summary task is shifted, all its child tasks will be moved too.

- The progress of summary tasks is set manually in UI and does not depend on the progress of its child tasks (please, see [Change task progress](/react/gantt/guides/user-interface/#change-task-progress))

- Tasks with child tasks are not converted into summary tasks automatically, a user can convert a task into another type manually ( see [convert one task type into another](/react/gantt/guides/user-interface/#convert-one-task-type-into-another))

The Gantt API allows configuring this default behavior.

### Enabling the auto calculation of summary tasks&#x27; progress[​](#enabling-the-auto-calculation-of-summary-tasks-progress)

By default, a user can set the progress of tasks only manually. The example below demonstrates how to enable the auto calculation of summary tasks&#x27; progress that will be based on the progress of its child tasks. The formula that is applied for calculation is `∑d*p / ∑d` , where "d" is task duration in days and "p" is the task progress, and "∑" stands for a sum of all loaded tasks.

```javascript
import { useState, useRef } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

function ExampleAutoSummaryProgress() {
  const data = getData();
  const [tasks] = useState(data.tasks);
  const gApi = useRef(null);

  const dayDiff = (next, prev) => {
    const d = (next - prev) / 1000 / 60 / 60 / 24;
    return Math.ceil(Math.abs(d));
  };

  function getSummaryProgress(id) {
    const [totalProgress, totalDuration] = collectProgressFromKids(id);
    const res = totalProgress / totalDuration;
    return isNaN(res) ? 0 : Math.round(res);
  }

  function collectProgressFromKids(id) {
    let totalProgress = 0,
      totalDuration = 0;
    const kids = gApi.current.getTask(id).data;

    kids?.forEach((kid) => {
      let duration = 0;
      if (kid.type !== "milestone" && kid.type !== "summary") {
        duration = kid.duration || dayDiff(kid.end, kid.start);
        totalDuration += duration;
        totalProgress += duration * kid.progress;
      }

      const [p, d] = collectProgressFromKids(kid.id);
      totalProgress += p;
      totalDuration += d;
    });
    return [totalProgress, totalDuration];
  }

  function recalcSummaryProgress(id, self) {
    const { tasks } = gApi.current.getState();
    const task = gApi.current.getTask(id);

    if (task.type !== "milestone") {
      const summary = self && task.type === "summary" ? id : tasks.getSummaryId(id);

      if (summary) {
        const progress = getSummaryProgress(summary);
        gApi.current.exec("update-task", {
          id: summary,
          task: { progress },
        });
      }
    }
  }

  function init(api) {
    gApi.current = api;

    // provide valid progresses from start
    // will load data and then explicitly update summary tasks
    api.getState().tasks.forEach((task) => {
      recalcSummaryProgress(task.id, true);
    });

    // auto progress calculations
    api.on("add-task", ({ id }) => {
      recalcSummaryProgress(id);
    });
    api.on("update-task", ({ id }) => {
      recalcSummaryProgress(id);
    });

    api.on("delete-task", ({ source }) => {
      recalcSummaryProgress(source, true);
    });
    api.on("copy-task", ({ id }) => {
      recalcSummaryProgress(id);
    });
    api.on("move-task", ({ id, source, inProgress }) => {
      if (inProgress) return;

      if (api.getTask(id).parent !== source) recalcSummaryProgress(source, true);
      recalcSummaryProgress(id);
    });
  }

  return (
    <Gantt
      init={init}
      tasks={tasks}
      links={data.links}
      scales={data.scales}
      cellWidth={30}
    />
  );
}

```

### Making parent tasks auto convert into summary tasks[​](#making-parent-tasks-auto-convert-into-summary-tasks)

By default, a user can convert other tasks into a summary task only manually. The example below shows how to make all parent tasks automatically convert into a summary task and vice versa (from "summary" to "task" in case no child tasks found in a task).

The [`getTask`](/react/gantt/api/methods/gettask) method is used to identify if it&#x27;s a parent task. The [`api.exec()`](/react/gantt/api/methods/exec) method triggers the [`update-task`](/react/gantt/api/actions/update-task) action for a parent task and changes the task type to "summary". The same method is applied to change the task type into "task" in case the length of the data array is 0 (no child items found).
The [`getState()`](/react/gantt/api/methods/getstate) method identifies the type of each task, and the [`api.on()`](/react/gantt/api/methods/on) method listens to the [`add-task`](/react/gantt/api/actions/add-task), [`move-task`](/react/gantt/api/actions/move-task), and [`delete-task`](/react/gantt/api/actions/delete-task) actions to convert parent tasks to summary tasks and explicitly update summary tasks while loading data.

```javascript
import { useRef } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

function ExampleAutoConvertSummary({ skinSettings }) {
  const data = getData();
  const apiRef = useRef(null);

  function init(api) {
    apiRef.current = api;

    api.getState().tasks.forEach((task) => {
      if (task.data?.length) {
        toSummary(task.id, true);
      }
    });

    api.on("add-task", (ev) => {
      if (ev.mode === "child") toSummary(ev.id);
    });

    api.on("move-task", (ev) => {
      if (ev.inProgress) return;
      if (ev.mode === "child") toSummary(ev.id);
      else toTask(ev.source);
    });

    api.on("delete-task", (ev) => {
      toTask(ev.source);
    });
  }

  function toSummary(id, self) {
    const task = apiRef.current.getTask(id);
    if (!self) id = task.parent;

    if (id && task.type !== "summary") {
      apiRef.current.exec("update-task", {
        id,
        task: { type: "summary" },
      });
    }
  }

  function toTask(id) {
    const obj = apiRef.current.getTask(id);
    if (obj && !obj.data?.length) {
      apiRef.current.exec("update-task", {
        id,
        task: { type: "task" },
      });
    }
  }

  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      init={init}
    />
  );
}

```

### Disabling the ability to drag the bar of a summary task[​](#disabling-the-ability-to-drag-the-bar-of-a-summary-task)

To disable the ability to drag a summary task&#x27;s bar in UI, in the example below we apply the [`api.intercept()`](/react/gantt/api/methods/intercept) method to modify the [`drag-task`](/react/gantt/api/actions/drag-task) action for the "summary" task type. To identify the task type, we apply the [`getTask`](/react/gantt/api/methods/gettask) method.

```javascript
import { useRef } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

function ExampleDisableSummaryDrag() {
  const data = getData();
  const apiRef = useRef(null);

  function init(api) {
    apiRef.current = api;

    api.intercept("drag-task", ({ id, top }) => {
      return !(typeof top === "undefined" && api.getTask(id).type === "summary");
    });
  }

  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      init={init}
    />
  );
}

```
PreviousConfiguring scalesNextConfiguring grid area
- [Default functionality](#default-functionality)
- [Enabling the auto calculation of summary tasks' progress](#enabling-the-auto-calculation-of-summary-tasks-progress)
- [Making parent tasks auto convert into summary tasks](#making-parent-tasks-auto-convert-into-summary-tasks)
- [Disabling the ability to drag the bar of a summary task](#disabling-the-ability-to-drag-the-bar-of-a-summary-task)
