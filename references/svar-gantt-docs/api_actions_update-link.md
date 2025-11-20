# update-link

**Source:** https://docs.svar.dev/react/gantt/api/actions/update-link

---

- 

- API
- Actions
- update-linkOn this page
# update-link

### Description[​](#description)

Fires when updating a link

### Usage[​](#usage)

```javascript
"update-link": ({
  id:  string | number,
  link: Partial<ILink>
}) => boolean | void;

```

### Parameters[​](#parameters)

The callback of the **update-link** action can take an object with the following parameters:

- `id` - (required) the id of a link

- `link` - (required) the [links](/react/gantt/api/properties/links) object

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

In the example below we apply the [`api.exec`](/react/gantt/api/methods/exec) method to trigger the action with a button click:

```javascript
import { useRef } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";
import { Button } from "@svar-ui/react-core";

export const Example = () => {
  const data = getData();
  const apiRef = useRef(null);

  const updateLink = () => {
    // access the Gantt API via ref
    apiRef.current.exec("update-link", {
      id: 1,
      link: { type: 3 }
    });
  };

  return (
    <>
      <Button onClick={updateLink} type="primary">Update Link</Button>

      <Gantt
        tasks={data.tasks}
        links={data.links}
        ref={apiRef}
      />
    </>
  );
};

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previoussort-tasksNextupdate-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
