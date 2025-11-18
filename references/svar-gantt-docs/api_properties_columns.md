# columns

**Source:** https://docs.svar.dev/react/gantt/api/properties/columns

---

- 

- API
- Properties
- columnsOn this page
# columns

### Description[​](#description)

Optional. An array of objects with configuration parameters for columns in the grid area

### Usage[​](#usage)

```javascript
columns?: false | {
  id?: string;
  width?: number;
  align?: "left" | "right" | "center";
  flexgrow?: number;
  resize?: boolean;
  sort?: boolean;

  header?: string | IHeaderCellConfig | (string | IHeaderCellConfig)[];
  footer?: string | IHeaderCellConfig | (string | IHeaderCellConfig)[];
  cell?: Component<ICellProps>;
  template?: (value: any, row: IRow, col: IColumn) => string;
  editor?: TEditorType | IColumnEditorConfig | TEditorHandlerConfig;
  options?: IOption[];
}[];

```

Expanded signature:

```javascript
columns?: false | {
  // column id
  id?: string;

  // width of the column
  width?: number | string; // CSS width (default "120px")

  // text alignment
  align?: "left" | "right" | "center"; // default "left"

  // flex grow factor 
  flexgrow?: number;

  // enable/disable resize by drag handle
  resize?: boolean; // default true

  // enable/disable sorting
  sort?: boolean; // default true

  // header configuration
  header?: 
    | string 
    | {                  
      // IHeaderCellConfig
      id?: string;
      text?: string;
      cell?: any;
      css?: string;
      rowspan?: number;
      colspan?: number;
      collapsible?: boolean | "first" | "header";
      collapsed?: boolean;
    }
    | (string | {
      id?: string;
      text?: string;
      cell?: any;
      css?: string;
      rowspan?: number;
      colspan?: number;
      collapsible?: boolean | "first" | "header";
      collapsed?: boolean;
    })[];

  // footer (same as header)
  footer?: 
    | string 
    | {
      id?: string;
      text?: string;
      cell?: any;
      css?: string;
      rowspan?: number;
      colspan?: number;
      collapsible?: boolean | "first" | "header";
      collapsed?: boolean;
    }
    | (string | {
      id?: string;
      text?: string;
      cell?: any;
      css?: string;
      rowspan?: number;
      colspan?: number;
      collapsible?: boolean | "first" | "header";
      collapsed?: boolean;
    })[];

  // template function for cell rendering
  template?: (value: any, row: IRow, col: IColumn) => string;

  // custom React component for cell rendering
  cell?: React.ComponentType<{
    api: IApi;
    row: IRow;
    column: IColumn;
    onAction: (ev: { action?: any; data?: { [key: string]: any } }) => void;
  }>;

  // editor configuration
  // IColumnEditorConfig | TEditorHandlerConfig | TEditorType
  editor?: 
    | "text"
    | "combo"
    | "datepicker"
    | "richselect"
    | {
      type: "text" | "combo" | "datepicker" | "richselect";
      config?: {
        template?: (v: any) => string;
        cell?: any | React.ComponentType<{
          data: any;
          onAction: (ev: {
            action?: any;
            data?: { [key: string]: any };
          }) => void;
        }>;
        options?: { id: string | number; label: string }[];
        buttons?: ("clear" | "today")[];
      };
    }
    | ((
      row?: IRow,
      column?: IColumn
    ) => "text" | "combo" | "datepicker" | "richselect" | {
      type: "text" | "combo" | "datepicker" | "richselect";
      config?: {
        template?: (v: any) => string;
        cell?: any | React.ComponentType<{
          data: any;
          onAction: (ev: {
            action?: any;
            data?: { [key: string]: any };
          }) => void;
        }>;
        options?: { id: string | number; label: string }[];
        buttons?: ("clear" | "today")[];
      };
    } | null);

  // predefined options for editors (combo, richselect)
  // IOption
  options?: { id: string | number; label: string }[];
}[];

```

### Parameters[​](#parameters)

- `flexgrow` (optional) specifies how much space (width) relative to the grid width the column will take (it will take no effect on columns with the set width); the property is specified as a number (if `flexgrow` is set to 1 in one column only, the column will take the full available width)

- `width` - (optional) the column width value from [here](https://developer.mozilla.org/en-US/docs/Web/CSS/width); the default value is "120px"

- `align` - (optional) the text align value from [here](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align); the default value is "left"

- `resize` - (optional) enables ("true" - default) or disables ("false") a drag handle for column resizing

- `header` - (optional) `IColumnHeader` object can be one of the following:

- string - a plain text label for the column header

- `IHeaderCell` - an object with the following parameters:

- `id?: string` - identifier of the header cell (useful for referencing or merging)

- `text?: string` - the text displayed in the header cell

- `cell?: any` - a custom cell renderer or configuration object

- `css?: string` - CSS class name(s) applied to the header cell

- `rowspan?: number` - number of rows the header cell should span

- `colspan?: number` - number of columns the header cell should span

- `collapsible?: boolean | "first" | "header"` - whether the header group can be collapsed

- `collapsed?: boolean` - defines whether the header is initially collapsed

- `(string | IHeaderCell)[]` - an array of either plain strings or header cell objects, useful for creating multi-row headers

- `sort` - (optional) if set to **true** (default), enables sorting in a column; if **false**, the sorting is disabled

- `template?: (value: any, row: IRow, col: IColumn) => string;` - (optional) applies a template to a column;

- `value` - the value of the current cell

- `row` - the row object of type IRow

- `col` - the column object of type [IColumn](https://docs.svar.dev/react/grid/api/properties/columns/)

- `cell` - (optional) the name of a custom React component to be applied inside a cell; e.g., *cell: CheckboxCell*

- `editor` - (optional) enables inline editing in a grid column cell.

It can be either:

- a string with the editor type (one of: `"text" | "combo" | "datepicker" | "richselect"`), or

- an object with the following parameters:

- `type` (string) - the editor type

- `config` (optional) - an object with editor configuration settings (for all editor types except `"text"`):

- `cell` - (optional) a custom component used inside the editor

- `template` - (optional) a function that takes an option value and returns a string to display: `template?: (v: any) => string;`

- `options` - (optional) an array of selectable options for `"combo"` or `"richselect"` editors

- `buttons` - (optional) an array of extra buttons, e.g. `["clear" | "today"]` (used in `"datepicker"`)

- `options` - (optional) property provides the list of selectable values for editors like "combo" or "richselect". Each option object has the following structure:

- `id: string|number` - unique identifier of the option

- `label: string` - display text for the option

The `columns` property can be set to **false** to hide the tasks tree area.

### Default config[​](#default-config)

```javascript
[
   { id: "text", header: "Task name", flexgrow: 1, sort: true },
   { id: "start", header: "Start date", align: "center", sort: true },
   { id: "duration", header: "Duration", width: 90, align: "center", sort: true },
   { id: "add-task", header: "", width: 50, align: "center" },
];

```

### Example[​](#example)

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

function Example() {
  const data = getData();

  const columns = [
   { id: "text", header: "Task name", flexgrow: 2 },
   {
    id: "start",
    header: "Start date",
    flexgrow: 1,
    align: "center",
   },
   {
    id: "duration",
    header: "Duration",
    align: "center",
    flexgrow: 1,
   },
   {
    id: "add-task",
    header: "",
    width: 50,
    align: "center",
   },
  ];

  return (
    <Gantt tasks={data.tasks} links={data.links} scales={data.scales} columns={columns} />
  );
}

```

In the next example the area with tasks tree is hidden by setting `columns` to **false**:

```javascript
import { getData } from "./common/data";
import { Gantt } from "@svar-ui/react-gantt";

function ExampleHidden() {
  const data = getData();

  return (
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={false}
    />
  );
}

```
PreviouscellWidthNextdurationUnit
- [Description](#description)
- [Usage](#usage)
- [Parameters](#parameters)
- [Default config](#default-config)
- [Example](#example)
