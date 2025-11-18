# zoom

**Source:** https://docs.svar.dev/react/gantt/api/properties/zoom

---

- 

- API
- Properties
- zoomOn this page
# zoom

### Description[​](#description)

Enables zooming in Gantt

### Usage[​](#usage)

```javascript
zoom?: boolean | {
  level?: number,
  minCellWidth?: number,
  maxCellWidth?: number,
  levels?: {
    minCellWidth: number,
    maxCellWidth: number,
    scales: {
      unit: string,
      step: number,
      format?: ((date: Date, next?: Date) => string) | string,
      css?: (date: Date) => string,
    }[],
  }[];
};

```

### Parameters[​](#parameters)

- `zoom` - enables/disables zooming: **true** (default) enables default zoom settings and **false** disables zooming

It can also be an object with the next parameters:

- `level` - (optional) initial zoom level (from 0 to 5 by default); the number of levels depends on the number of the levels objects in the levels array below

- `minCellWidth` - (optional) minimum cell width that will be applied to all levels where the custom minCellWidth for a level is not set; if not set, the value of 50px is applied

- `maxCellWidth` - (optional) maximum cell width that will be applied to all levels where the custom maxCellWidth for a level is not set; if not set, the value of 300px is applied

- `levels` - (optional) an array of objects with the zoom data:

- `minCellWidth` - (optional) minimum cell width for a level; if not set, the value from minCellWidth parameter for a default level is taken

- `maxCellWidth` - (optional) maximum cell width for a level; if not set, maxCellWidth value for a default level is applied

- `scales` - (required) an array of objects with the scales data:

- `unit` - (required) the scale unit ("hour" | "day" | "week" | "month" | "quarter" | "year")

- `step` - (required) number of units per cell

- `format` - (required) defines the format for each scale unit; it can be defined as a string of the format supported by [date-fns](https://date-fns.org/v2.29.3/docs/format) and as a function for custom formatting. The function receives two parameters: the unit start and end dates. It should return the string with the formatted date

- `css` - (optional) css class for scales; a function receives the date and should return the string with the css class name for this date

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";
import { format } from "date-fns";

const data = getData();

const dayStyle = a => {
  const day = a.getDay() === 5 || a.getDay() === 6;
  return day ? "sday" : "";
};

const hoursTemplate = (a, b) => `${format(a, "HH:mm")} - ${format(b, "HH:mm")}`;

const zoomConfig = {
  level: 3,
  levels: [
    {
      minCellWidth: 200,
      maxCellWidth: 400,
      scales: [{ unit: "year", step: 1, format: "yyyy" }],
    },
    {
      minCellWidth: 150,
      maxCellWidth: 400,
      scales: [
        { unit: "year", step: 1, format: "yyyy" },
        { unit: "quarter", step: 1, format: "QQQQ" },
      ],
    },
    {
      minCellWidth: 250,
      maxCellWidth: 350,
      scales: [
        { unit: "quarter", step: 1, format: "QQQQ" },
        { unit: "month", step: 1, format: "MMMM yyy" },
      ],
    },
    {
      minCellWidth: 100,
      scales: [
        { unit: "month", step: 1, format: "MMMM yyy" },
        { unit: "week", step: 1, format: "&#x27;week&#x27; w" },
      ],
    },
    {
      maxCellWidth: 200,
      scales: [
        { unit: "month", step: 1, format: "MMMM yyy" },
        { unit: "day", step: 1, format: "d", css: dayStyle },
      ],
    },
    {
      minCellWidth: 25,
      maxCellWidth: 100,
      scales: [
        { unit: "day", step: 1, format: "MMM d", css: dayStyle },
        { unit: "hour", step: 6, format: hoursTemplate },
      ],
    },
    {
      maxCellWidth: 120,
      scales: [
        { unit: "day", step: 1, format: "MMM d", css: dayStyle },
        { unit: "hour", step: 1, format: "HH:mm" },
      ],
    },
  ],
};

export default function App() {
  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      zoom={zoomConfig}
    />
  );
}

```
PrevioustaskTypesNextActions
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
