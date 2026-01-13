# Table Column Guide

Table columns define the data displayed in each column and how it's rendered.

## Base Configuration

All columns share these common properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The property name from the row data (Required). |
| `title` | `string` | The header label. Defaults to `name` if not provided. |
| `kind` | `string` | The type of column (e.g., `date`, `options`). Default: `text`. |
| `sortable` | `boolean` | Enable sorting for this column. |
| `hasFilter` | `boolean` | Enable filtering for this column. |
| `hidden` | `boolean` | Initially hide the column. |
| `nowrap` | `boolean` | Prevent text wrapping in cells. |
| `cssClass` | `string` | Custom CSS class for the cell. |
| `pipeList` | `array` | List of Angular pipes to apply to the value. |
| `modifiers` | `array` | List of column modifiers. |
| `template` | `string` | Path to a custom Handlebars template file. |

## Column Kinds

### Text (Default)

Renders the value as plain text. You can use pipes to format the text.

```yaml
- name: email
  title: Email Address
  sortable: true
```

### Date

Formats the value as a date.

| Property | Type | Description |
| :--- | :--- | :--- |
| `format` | `string` | The date format string (compatible with Angular's `date` pipe). |

```yaml
- name: createdAt
  kind: date
  title: Created Date
  format: "dd.MM.yyyy HH:mm"
```

### Options

Maps value codes to display labels. Useful for enums or status fields.

| Property | Type | Description |
| :--- | :--- | :--- |
| `optionList` | `array` | List of value-display pairs. |

**Option Structure:**
- `value`: The raw data value (string, number, boolean).
- `display`: Text to display.

```yaml
- name: status
  kind: options
  optionList:
    - value: ACTIVE
      display: Active
    - value: INACTIVE
      display: Inactive
```

### Boolean

Renders a standard check/close icon for boolean values.

```yaml
- name: verified
  kind: boolean
  title: Is Verified?
```

### Link

Renders the value as a clickable link.

```yaml
- name: website
  kind: link
```

### Icon

Renders the value as a Material icon name.
*Note: The value from the row data must be a valid icon name (e.g., 'home', 'settings').*

```yaml
- name: iconName
  kind: icon
```

### Copy to Clipboard

Renders the value with a button to copy it to the clipboard. Useful for IDs, tokens, or hashes.

```yaml
- name: apiKey
  kind: copy-to-clipboard
  title: API Key
```

### Component

Renders a custom Angular component within the cell.
*The component to be rendered is typically determined by convention or further configuration not detailed here.*

```yaml
- name: profile
  kind: component
```

### Spinner

Renders a loading spinner. Often used for columns tracking async operations or status.

```yaml
- name: isProcessing
  kind: spinner
```

### Tree

Used for the primary column in a Tree Table to display the hierarchy (expander icons/indentation).

```yaml
- name: name
  kind: tree
  title: Folder Name
```

### Custom

Allows you to provide a custom HTML template directly in the config.

| Property | Type | Description |
| :--- | :--- | :--- |
| `html` | `string` | The HTML content to render in the cell. |

```yaml
- name: details
  kind: custom
  html: "<span class='badge'>{{ element.status }}</span>"
```

### Custom Template File

For more complex customizations where inline HTML is insufficient, you can provide a path to a Handlebars template file.

```yaml
- name: fancyColumn
  template: libs/shared/templates/fancy-cell.hbs
```

## Advanced Usage

### Using Pipes

You can apply multiple pipes to any column.

```yaml
- name: amount
  pipeList:
    - name: currency
      args: ["EUR"]
```

### Column Modifiers

Modifiers change the behavior of how columns are generated or displayed.

```yaml
- name: id
  modifiers:
    - primary-key
```
