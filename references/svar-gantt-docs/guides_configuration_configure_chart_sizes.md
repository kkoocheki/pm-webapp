# Configuring chart sizes

**Source:** https://docs.svar.dev/react/gantt/guides/configuration/configure_chart_sizes

---

- 

- Guides
- Configuration
- Configuring chart sizesOn this page
# Configuring chart sizes

How to configure scales, see [Configuring scales](/react/gantt/guides/configuration/configure_scales)

### Setting the cell width and height[​](#setting-the-cell-width-and-height)

To set the cell width, use the [`cellWidth`](/react/gantt/api/properties/cellwidth) property. The default value is 100.

```javascript
import { useState } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

export default function CellWidthExample() {
  const data = getData();
  const [cellWidth, setCellWidth] = useState(150);

  return (
    <Gantt tasks={data.tasks} scales={data.scales} cellWidth={cellWidth} />
  );
}

```

To set the cell height, use the [`cellHeight`](/react/gantt/api/properties/cellheight) property. The default value is 38.

```javascript
import { useState } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

export default function CellHeightExample() {
  const data = getData();
  const [cellHeight, setCellHeight] = useState(38);

  return (
    <Gantt tasks={data.tasks} scales={data.scales} cellHeight={cellHeight} />
  );
}

```

### Setting the task length unit[​](#setting-the-task-length-unit)

You can use the [`lengthUnit`](/react/gantt/api/properties/lengthunit) property to set the minimal unit of task length displayed in a chart, which is *day* by default.
The **lengthUnit** should be equal to or smaller than the scales unit. Possible `lengthUnit` values: hour, day, week, month, quarter.

Example:

```javascript
import { useState } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

export default function LengthUnitExample() {
  const data = getData();
  const [lengthUnit, setLengthUnit] = useState("hour");

  return (
    <Gantt tasks={data.tasks} lengthUnit={lengthUnit} />
  );
}

```
PreviousConfiguring context menuNextConfiguring task editor
- [Setting the cell width and height](#setting-the-cell-width-and-height)
- [Setting the task length unit](#setting-the-task-length-unit)
