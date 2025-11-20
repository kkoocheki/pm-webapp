# api.detach()

**Source:** https://docs.svar.dev/react/gantt/api/methods/detach

---

- 

- API
- Methods
- api.detach()On this page
# api.detach()

## Description[​](#description)

Allows removing/detaching action handlers

## Usage[​](#usage)

```javascript
api.detach(tag: number | string ): void;

```

## Parameters[​](#parameters)

- `tag` - the name of the action tag

## Example[​](#example)

In the example below we add an object with the **tag** property to the [`api.on()`](/react/gantt/api/methods/on) handler, and then we use the `api.detach()` method to stop logging the `open-task` action.

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function App() {
  function init(api) {
    api.on(
      "open-task",
      ({ id }) => {
        console.log("Opened: " + id);
      },
      { tag: "track" }
    );
  }

  function stop() {
    api.detach("track");
  }

  return (
    <div>
      <button onClick={stop}>Stop logging</button>
      <Gantt tasks={data.tasks} links={data.links} init={init} />
    </div>
  );
}

```

**Related articles:** [How to access Gantt API](/react/gantt/api/how_to_access_api)
PreviousGantt methodsNextapi.exec()
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
