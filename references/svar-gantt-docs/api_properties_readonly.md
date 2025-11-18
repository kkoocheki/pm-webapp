# readonly

**Source:** https://docs.svar.dev/react/gantt/api/properties/readonly

---

- 

- API
- Properties
- readonlyOn this page
# readonly

### Description[​](#description)

Optional. Prevents making changes to the data in Gantt

### Usage[​](#usage)

```javascript
readonly?: boolean;

```

### Parameters[​](#parameters)

readonly - (optional) if it&#x27;s set to *true*, it enables the readonly mode of Gantt; if *false*, the mode is disabled (default)

### Example[​](#example)

```javascript
import { useState } from "react";
import { getData } from "./data";
import { Gantt } from "@svar-ui/react-gantt";

export const ReadonlyExample = () => {
  const { scales, tasks, links } = getData();

  const [readonly, setReadonly] = useState(true); // readonly mode is enabled

  return <Gantt tasks={tasks} scales={scales} links={links} readonly={readonly} />;
};

```
PreviouslinksNextscaleHeight
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
