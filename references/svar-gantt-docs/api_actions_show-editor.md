# show-editor

**Source:** https://docs.svar.dev/react/gantt/api/actions/show-editor

---

- 

- API
- Actions
- show-editorOn this page
# show-editor

### Description[​](#description)

Fires when opening the Editor dialog for a task

### Usage[​](#usage)

```javascript
"show-editor": ({
  id: string | number
}) => boolean|void;

```

### Parameters[​](#parameters)

The callback of the **show-editor** action can take an array where each object has the following parameters:

- `id` - (required) the ID of the task for which the Editor dialog should be opened

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

In the example below we use [`api.intercept()`](/react/gantt/api/methods/intercept) to hide a default edit form by returning **false**.

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function App() {
  function init(api) {
    api.intercept("show-editor", (data) => {
      return false;
    });
  }

  return <Gantt tasks={data.tasks} init={init} />;
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousselect-taskNextsort-tasks
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
