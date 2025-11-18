# request-data

**Source:** https://docs.svar.dev/react/gantt/api/actions/request-data

---

- 

- API
- Actions
- request-dataOn this page
# request-data

### Description[​](#description)

Fires when data for a task branch is requested

### Usage[​](#usage)

```javascript
"request-data": ({
  id: string | number
}) => boolean | void;

```

### Parameters[​](#parameters)

The callback of the **request-data** event can take an object with the following parameters:

- `id` - (required) the task ID for which data is requested

info
For handling the actions you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

```javascript
import { useEffect } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

export default function App() {
  function init(api) {
    api.on("request-data", ({ id }) => {
      console.log("Data request for: " + id);
    });
  }

  return <Gantt tasks={data.tasks} init={init} />;
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousrender-dataNextscroll-chart
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
