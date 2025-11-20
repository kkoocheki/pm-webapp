# api.exec()

**Source:** https://docs.svar.dev/react/gantt/api/methods/exec

---

- 

- API
- Methods
- api.exec()On this page
# api.exec()

## Description[​](#description)

Allows triggering Gantt actions

## Usage[​](#usage)

```javascript
api.exec(
   action: string,
   config: object
): void;

```

## Parameters[​](#parameters)

- `action` - (required) an action to be fired

- `config` - (required) the config object with parameters (see the action to be fired)

## Actions[​](#actions)

info
The full list of the Gantt actions can be found **here**

## Example[​](#example)

The example below shows how to clear the task text when opening the Editor dialog for it.

```javascript
import { useRef } from "react";
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

export default function Example() {
  const apiRef = useRef(null);

  function clearTaskText() {
    apiRef.current?.exec("update-task", { id: 3, task: { text: "" } });
  }

  return (
    <Gantt tasks={data.tasks} onShowEditor={clearTaskText} ref={apiRef} />
  );
}

```

**Related articles:**

- [Working with server](/react/gantt/guides/working_with_server)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousapi.detach()Nextapi.intercept()
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Actions](#actions)
- [Example](#example)
