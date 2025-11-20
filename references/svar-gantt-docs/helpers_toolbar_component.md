# Toolbar

**Source:** https://docs.svar.dev/react/gantt/helpers/toolbar_component

---

- 

- Helpers
- ToolbarOn this page
# Toolbar

### Description[​](#description)

Toolbar helper

### Usage[​](#usage)

```javascript
<Toolbar items={items} />

```

You can import the component from *@svar-ui/react-gantt* .

Items array:

```javascript
items?: {
    id?: string | number,
    comp?: string | Component<any>,
    icon?: string,
    css?: string,
    handler?: (item: any, value?: any) => void,
    text?: string,
    menuText?: string,
    key?: string,
    spacer?: boolean,
    collapsed?: boolean,
    layout?: "column",
    items?: Array<any>,
    [key: string]: any
}[];

```

### Parameters[​](#parameters)

All parameters description see here: [Toolbar](https://docs.svar.dev/react/core/toolbar/api/props/items)

### Example[​](#example)

To configure the toolbar (the set of buttons in the toolbar and/or their appearance), import the **Toolbar** component of Gantt and make necessary changes to the **items** array. Do not forget to add the **items** attribute to the **Toolbar** tag. It&#x27;s also required to pass the `api` object to **Toolbar** (for more details, refer to [How to access Gantt API](/react/gantt/api/how_to_access_api)). Other usage examples see here: [Configuring Toolbar](/react/gantt/guides/configuration/toolbar)

```javascript
import { useEffect, useRef, useState } from "react";
import { getData } from "../data";
import { Gantt, Toolbar } from "@svar-ui/react-gantt";

export default function Example() {
  // Gantt exposes its API via ref (forwardRef). Hold a ref and copy to `api`.
  const [api, setApi] = useState(null);

  const data = getData();

  const items = [
    {
      id: "add-task",
      comp: "button",
      icon: "wxi-plus",
      text: "Add task",
      type: "primary",
    },
    {
      id: "edit-task",
      comp: "button",
      icon: "wxi-edit",
      text: "edit",
      type: "link",
    },
  ];

  return (
    <>
      <Toolbar api={api} items={items} />
      <Gantt init={setApi} tasks={data.tasks} />
    </>
  );
}

```

**Related articles**:

- [How to access Gantt API](/react/gantt/api/how_to_access_api)

- [Configuring Toolbar](/react/gantt/guides/configuration/toolbar)

- [defaultToolbarButtons](/react/gantt/helpers/defaulttoolbarbuttons)
PreviousHeadertMenuNextTooltip
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
