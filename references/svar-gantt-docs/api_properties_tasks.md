# tasks

**Source:** https://docs.svar.dev/react/gantt/api/properties/tasks

---

- 

- API
- Properties
- tasksOn this page
# tasks

### Description[​](#description)

Optional. Defines tasks in Gantt

### Usage[​](#usage)

```javascript
tasks?: {
    id?: string | number,
    // start is mandatory in incoming data; end or duration is optional - but one of them must be
    start?: Date,
    end?: Date,
    duration?:number,
    data?: ITask[],
    
    open?: boolean,
    text?: string,
    details?: string,
    progress?: number,
    type?: "task" | "summary" | "milestone" | string,
    parent?: string | number,  
    
    [key: string]: any
  }[];

```

### Parameters[​](#parameters)

Each task object in the array of tasks has the following parameters:

- 

`id` - (optional) the task ID

- 

`start` - (optional) the start date of a task

- 

`end`  -  (optional) the end date of a task; you should specify either the end date or duration not both

- 

`duration` - (optional) task duration in days

- 

`open` - (optional) if **true**, in case a task has subtasks, the branch is open at initialization; if **false**, then it&#x27;s closed.

- 

`lazy` - (optional) if **true**, enables dynamic loading of child tasks (when the task branch is opened, the request for tasks data is sent to the backend), which means their content will not be loaded during the initial loading; if **false**, all tasks data is loaded at the initialization

- 

`text` - (optional) a task name; in case of no text name, set to ""

- 

`progress` - (optional) task progress which is the percentage value from 0 to 100

- 

`parent` - (optional) the parent task ID; in case of no parent, set to 0

- 

`type` - (optional) the task type which can be one of the following: "task", "summary", "milestone" or a custom one

- 

`key` - (optional) allows defining additional custom fields for each task object.

info
The date format should be one of the supported by [date-fns](https://date-fns.org/)

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const { links, scales, columns } = getData();

const tasks = [
  {
    id: 1,
    open: true,
    start: new Date(2020, 11, 6),
    duration: 8,
    text: "React Gantt Widget",
    progress: 60,
    type: "summary"
  },
  {
    id: 2,
    parent: 1,
    start: new Date(2020, 11, 6),
    duration: 4,
    text: "Lib-Gantt",
    progress: 80
  },
];

export default function App() {
  return <Gantt tasks={tasks} scales={scales} columns={columns} links={links} />;
}

```
PreviousstartNexttaskTemplate
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
