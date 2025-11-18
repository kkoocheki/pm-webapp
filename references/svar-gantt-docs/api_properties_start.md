# start

**Source:** https://docs.svar.dev/react/gantt/api/properties/start

---

- 

- API
- Properties
- startOn this page
# start

### Description[​](#description)

Optional. Sets the start date of the timescale

### Usage[​](#usage)

```javascript
start?: Date;

```

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

const data = getData();

export default function App() {
  return (
    <Gantt
      tasks={data.tasks}
      start={new Date(2023, 2, 1)}
    />
  );
}

```
PreviousselectedNexttasks
- [Description](#description)
- [Usage](#usage)
- [Example](#example)
