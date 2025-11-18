# render-data

**Source:** https://docs.svar.dev/react/gantt/api/actions/render-data

---

- 

- API
- Actions
- render-dataOn this page
# render-data

### Description[​](#description)

Fires when data is rendered when scrolling

### Usage[​](#usage)

```javascript
onRenderData: ({ 
   from: number,
   start: number,
   end: number
}) => boolean | void;

```

### Parameters[​](#parameters)

The callback of the event handler prop receives an object with the following parameters:

- `from` - (required) the point in pixels where visible rows start

- `start` - (required) the ID of the first visible row

- `end` - (required) the ID of the last row within the visible area

info
For handling the events you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

```javascript
import { getData } from "../data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function App() {
  const handleRenderData = (ev) => {
    console.log("The ID of the last visible row", ev.end);
  };

  return (
    <Gantt
      onRenderData={handleRenderData}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
    />
  );
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousprovide-dataNextrequest-data
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
