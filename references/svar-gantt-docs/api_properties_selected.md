# selected

**Source:** https://docs.svar.dev/react/gantt/api/properties/selected

---

- 

- API
- Properties
- selectedOn this page
# selected

### Description[​](#description)

Optional. Marks tasks as selected

### Usage[​](#usage)

```javascript
selected?: number | string;

```

### Parameters[​](#parameters)

- `selected` - an array of tasks IDs

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

export default function App() {
  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      selected={[1, 2, 3]}
    />
  );
}

```
PreviousscalesNextstart
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Example](#example)
