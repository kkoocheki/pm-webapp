# add-link

**Source:** https://docs.svar.dev/react/gantt/api/actions/add-link

---

- 

- API
- Actions
- add-linkOn this page
# add-link

### Description[​](#description)

Fires when adding a link

### Usage[​](#usage)

```javascript
"add-link": (ev: {
  id?: string | number,
  link: {
    source: string | number,
    target: string | number,
    type: "e2s" | "s2s" | "e2e" | "s2e"
  };
}) => boolean | void;

```

### Parameters[​](#parameters)

The callback of the **add-link** action takes the next parameters:

- `id` - (optional) the id of a link that is automatically generated

- `link` - (required) the **link** object with the following parameters:

- `source` - (required) the source task ID

- `target` - (required) the target task ID

- `type` - (required) the link type; possible link type values:

- e2s - "End-to-start"

- s2s - "Start-to-start"

- e2e - "End-to-end"

- s2e - "Start-to-end"

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

In the example below we use the [`api.intercept()`](/react/gantt/api/methods/intercept) method to change the **link** variable value replacing it with the relevant data from the **add-link** action:

```javascript
import { useState } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

export default function Example() {
  const data = getData();
  const [link, setLink] = useState(null);

  function init(api) {
    api.intercept("add-link", ev => {
      setLink(ev.link);
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

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
PreviousActionsNextadd-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
