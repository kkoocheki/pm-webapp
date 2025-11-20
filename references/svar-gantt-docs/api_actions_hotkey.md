# hotkey

**Source:** https://docs.svar.dev/react/gantt/api/actions/hotkey

---

- 

- API
- Actions
- hotkeyOn this page
# hotkey

### Description[​](#description)

Fires when applying a hotkey

### Usage[​](#usage)

```javascript
hotkey:({
   key: string,
   event: object,
   eventSource?: string
}) => void;

```

### Parameters[​](#parameters)

The callback of the action takes an object with the following parameters:

- `key` - (required) a hotkey name, for the combination of hotkeys use "+", e.g. "shift+arrowup"

- `event` - (required) keyboard event

- `eventSource` - (optional) the source of the event call: it can be "grid" or "chart"; it`s required for "arrowup"/"arrowdown"

### Example[​](#example)

```javascript
import { Gantt } from "@svar-ui/react-gantt";
import { getData } from "./common/data";

const data = getData();

const init = (api) => {
  api.on("hotkey", (ev) => console.log(ev.key));
};

export default function App() {
  return <Gantt init={init} tasks={data.tasks} />;
}

```

**Related articles**:

- [Navigation keys](/react/gantt/guides/user-interface/#hotkeys)

- [How to access Gantt API](/react/gantt/api/how_to_access_api)

- [api.on()](/react/gantt/api/methods/on)
Previousdrag-taskNextexpand-scale
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
