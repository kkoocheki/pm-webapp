# scroll-chart

**Source:** https://docs.svar.dev/react/gantt/api/actions/scroll-chart

---

- 

- API
- Actions
- scroll-chartOn this page
# scroll-chart

### Description[​](#description)

Fires when a chart is scrolled

### Usage[​](#usage)

```javascript
"scroll-chart": ({
   left?: number,
   top?: number
}) => boolean | void;

```

### Parameters[​](#parameters)

The callback of the **scroll-chart** event can take an object with the following parameters:

- `left` - (optional) specifies the number of pixels the chart is scrolled to the left

- `top` - (optional) specifies the number of pixels the chart is scrolled to the top

info
For handling the events you can use the [Event Bus methods](/react/gantt/api/overview/methods_overview)

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

function init(api) {
  api.on("scroll-chart", ev => {
    console.log("The chart is scrolled");
  });
}

export default function App() {
  return <Gantt tasks={data.tasks} init={init} />;
}

```

**Related articles**: [How to access Gantt API](/react/gantt/api/how_to_access_api)
Previousrequest-dataNextselect-task
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
