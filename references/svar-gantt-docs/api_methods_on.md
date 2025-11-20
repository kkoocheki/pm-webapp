# api.on()

**Source:** https://docs.svar.dev/react/gantt/api/methods/on

---

- 

- API
- Methods
- api.on()On this page
# api.on()

## Description[​](#description)

Allows attaching a handler to the inner events

## Usage[​](#usage)

```javascript
api.on(
   event: string,
   handler: function
): void;

```

## Parameters[​](#parameters)

- `event` - (required) an event to be fired

- `handler` - (required) a handler to be attached (the handler arguments will depend on the event to be fired)

info
The full list of actions can be found **here**.
Use the `api.on()` method if you want to listen to the actions without modifying them. To make changes to the actions, apply the `api.intercept()` method.

## Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function init(api) {
  api.on("delete-link", ev => {
    console.log("The id of the deleted link:", ev.id);
  });
}

<Gantt
  tasks={data.tasks}
  links={data.links}
  init={init} />

```

**Related articles:**

- [Working with server](/react/gantt/guides/working_with_server)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousapi.getReactiveState()Nextapi.setNext()
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
