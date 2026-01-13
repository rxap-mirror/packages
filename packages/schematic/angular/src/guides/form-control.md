# Form Control Guide

Form controls define the inputs and fields within a form.

## Base Configuration

All controls share these common properties (inheriting from `abstract-control`):

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The control name (key in the form value). |
| `label` | `string` | The label displayed to the user. |
| `kind` | `string` | The type of control (e.g., `input`, `select`). |
| `isRequired` | `boolean` | Whether the field is mandatory. |
| `isDisabled` | `boolean` | Whether the control is disabled by default. |
| `isReadonly` | `boolean` | Whether the control is read-only. |
| `state` | `any` | The initial value/state of the control. |
| `validatorList` | `array<string>` | List of Angular validators (e.g., `['required', 'email']`). |
| `cssClass` | `string` | Custom CSS classes for the control. |
| `template` | `string` | Path to a custom Handlebars template file. |

## Form Field Options

Controls that render within a Material Form Field (Input, Select, Date, etc.) support additional options:

| Property | Type | Description |
| :--- | :--- | :--- |
| `hasClearButton` | `boolean` | Adds a button to clear the input value. |
| `prefixButton` | `object` | Adds a button/icon to the start of the field. |
| `suffixButton` | `object` | Adds a button/icon to the end of the field. |

### Example: Input with Icon and Clear Button
```yaml
- name: search
  kind: input
  label: Search
  hasClearButton: true
  formField:
    prefixButton:
      icon: search
```

## Control Kinds

### Input

Standard text input field.

| Property | Type | Description |
| :--- | :--- | :--- |
| `inputType` | `string` | HTML input type (e.g., `text`, `password`, `email`). Default: `text`. |
| `placeholder` | `string` | Placeholder text. |

```yaml
- name: email
  kind: input
  inputType: email
  label: Email Address
  placeholder: Enter your email
  isRequired: true
```

### Select

Dropdown selection control.

| Property | Type | Description |
| :--- | :--- | :--- |
| `multiple` | `boolean` | Allow multiple selections. |
| `optionList` | `array` | Static list of options. |
| `upstream` | `object` | Load options from an API. See [Upstream Guide](./upstream.md). |

```yaml
- name: role
  kind: select
  label: User Role
  options:
    - value: admin
      display: Administrator
    - value: user
      display: Standard User
```


### Checkbox

Boolean checkbox control.

| Property | Type | Description |
| :--- | :--- | :--- |
| `labelPosition` | `string` | Valid values: `before`, `after`. |

```yaml
- name: isActive
  kind: checkbox
  label: Active
  state: true
```

### Textarea

Multi-line text input.

| Property | Type | Description |
| :--- | :--- | :--- |
| `minRows` | `number` | Minimum number of rows. |
| `maxRows` | `number` | Maximum number of rows. |

```yaml
- name: description
  kind: textarea
  label: Description
  autosize:
    minRows: 3
```

### Date

Date picker control.

| Property | Type | Description |
| :--- | :--- | :--- |
| `placeholder` | `string` | Placeholder text. |

```yaml
- name: birthday
  kind: date
  label: Birthday
  placeholder: Select a date
```

### Slide Toggle

Material design slide toggle.

| Property | Type | Description |
| :--- | :--- | :--- |
| `labelPosition` | `string` | Valid values: `before`, `after`. |

```yaml
- name: notifications
  kind: slide-toggle
  label: Enable Notifications
```

### Autocomplete

Input with autocomplete suggestions.

| Property | Type | Description |
| :--- | :--- | :--- |
| `upstream` | `object` | Source for suggestion data. See [Upstream Guide](./upstream.md). |
| `toDisplay` | `object` | Property to use for display label. |
| `toValue` | `object` | Property to use for the control value. |

```yaml
- name: city
  kind: autocomplete
  label: City
  upstream:
    kind: open-api
    operationId: searchCities
  toDisplay:
    property: name
  toValue:
    property: id
```

### Table Select

Opens a dialog with a table to select an item.

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Title of the selection window. |
| `columnList` | `array` | Columns to display in the selection table. |
| `upstream` | `object` | Data source for the table. See [Upstream Guide](./upstream.md). |

```yaml
- name: project
  kind: table-select
  label: Project
  upstream:
    kind: open-api
    operationId: listProjects
  columnList:
    - name: name
```

### Autocomplete Table Select

Combines autocomplete with table selection.

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Title of the selection window. |
| `columnList` | `array` | Columns to display in the selection table. |
| `upstream` | `object` | Data source. See [Upstream Guide](./upstream.md). |

```yaml
- name: manager
  kind: autocomplete-table-select
  upstream:
    kind: open-api
    operationId: listManagers
  columnList:
    - name: fullName
```

## Custom Templates

You can provide a custom Handlebars template for any control using the `template` property. This allows full control over the generated HTML for that specific form field.

```yaml
- name: customField
  kind: input
  template: libs/my-lib/src/templates/custom-input.hbs
```


## Validators

Validators are defined as a list of strings mapped to Angular validators.

```yaml
validatorList:
  - required
  - email
```
