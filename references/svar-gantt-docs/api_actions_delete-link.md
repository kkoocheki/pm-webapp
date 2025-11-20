# delete-link

**Source:** https://docs.svar.dev/react/gantt/api/actions/delete-link

---

- 

- API
- Actions
- delete-linkOn this page
# delete-link

### Description[​](#description)

Fires when deleting a link

### Usage[​](#usage)

```javascript
"delete-link": ({
   id:  string | number;
}) => boolean|void;

```

### Parameters[​](#parameters)

The callback of the **delete-link** action can take an object with the following parameters:

- `id` - (required) the ID of a link to be deleted

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function init(api) {
  api.on("delete-link", ev => {
    console.log("The id of the deleted link:", ev.id);
  });
}

export default function App() {
  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      init={init}
    />
  );
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previouscopy-taskNextdelete-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
