# How to access Gantt API

**Source:** https://docs.svar.dev/react/gantt/api/how_to_access_api

---

- 

- API
- How to access Gantt APIOn this page
# How to access Gantt API

You can use either of the two ways below to get access to the Gantt API:

- apply the **init** handler function with **api** as the parameter

- use a React ref to store the **api** object

## Apply the init handler[​](#apply-the-init-handler)

You can access Gantt API using the **init** handler function that takes **api** as the parameter.

The example below shows how to use the `init` function and output to the console the current zoom level by listening to the [`zoom-scale`](/react/gantt/api/actions/zoom-scale) action with the help of the [`api.on()`](/react/gantt/api/methods/on) method and getting the state of the zoom level via the [`api.getState()`](/react/gantt/api/methods/getstate) method.

Example:

```javascript
import { getData } from "../data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

export const ExampleWithInit = () => {
  const init = (api) => {
    api.on("zoom-scale", () => {
      console.log("The current zoom level is", api.getState().zoom);
    });
  };

  return (
    <>
      <h4>Point over Gantt chart, then hold Ctrl and use mouse wheel to zoom</h4>

      <Gantt init={init} tasks={data.tasks} links={data.links} zoom />
    </>
  );
};

```

## Bind to api[​](#bind-to-api)

You can access Gantt API via the **api** gateway object by using a React ref. Create a ref with `useRef`, pass it to the Gantt component via `ref={apiRef}`, and then use `apiRef.current` (or store it in state).

```javascript
import { useRef } from "react";
import { getData } from "./common/data";
import { Gantt, Toolbar } from "@svar-ui/react-gantt";

export const ExampleBindApi = () => {
  const data = getData();

  // ref that will receive the Gantt API instance
  const apiRef = useRef(null);

  return (
    <>
      <button onClick={() => apiRef.current?.exec("show-editor", { id: "task1" })}>Show Editor</button>
      {/* Gantt assigns its API instance to the ref */}
      <Gantt tasks={data.tasks} ref={apiRef} />
    </>
  );
};

```

## api methods[​](#api-methods)

- [`api.detach()`](/react/gantt/api/methods/detach)

- [`api.exec()`](/react/gantt/api/methods/exec)

- [`api.getReactiveState()`](/react/gantt/api/methods/getreactivestate)

- [`api.getState()`](/react/gantt/api/methods/getstate)

- [`api.getStores()`](/react/gantt/api/methods/getstores)

- [`api.getTask(id)`](/react/gantt/api/methods/gettask)

- [`api.intercept()`](/react/gantt/api/methods/intercept)

- [`api.on()`](/react/gantt/api/methods/on)

- [`api.setNext()`](/react/gantt/api/methods/setnext)

See each method description in the next sections.
PreviousAPI overviewNextGantt methods
- [Apply the init handler](#apply-the-init-handler)
- [Bind to api](#bind-to-api)
- [api methods](#api-methods)
