# open-task

**Source:** https://docs.svar.dev/react/gantt/api/actions/open-task

---

- 

- API
- Actions
- open-taskOn this page
# open-task

### Description[​](#description)

Fires when expanding a branch of tasks

### Usage[​](#usage)

```javascript
"open-task": ({ 
  id: string | number,
  mode: boolean 
}) => boolean|void;

```

### Parameters[​](#parameters)

The callback of the  action takes an object with the following parameters:

- `id` - (required) the ID of a task

- `mode` - (required) defines whether a branch of tasks is opened (**true**) or closed (**false**); it&#x27;s closed by default

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

```javascript
import { getData } from "../data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function App() {
  function init(api) {
    api.exec("open-task", {
      id: 3,
      mode: true,
    });
  }

  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      init={init}
    />
  );
}

export default App;

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousmove-taskNextprovide-data
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
