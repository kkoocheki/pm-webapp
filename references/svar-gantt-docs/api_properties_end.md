# end

**Source:** https://docs.svar.dev/react/gantt/api/properties/end

---

- 

- API
- Properties
- endOn this page
# end

### Description[​](#description)

Optional. Sets the end date of the timescale

### Usage[​](#usage)

```javascript
end?: Date;

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
      start={new Date(2022, 2, 1)}
      end={new Date(2023, 3, 1)}
    />
  );
}

```
PreviousdurationUnitNexthighlightTime
- [Description](#description)
- [Usage](#usage)
- [Example](#example)
