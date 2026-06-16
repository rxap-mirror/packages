# Header Button Guide

Header buttons are actions placed in the top section of the table component, typically used for global actions like "Create New", "Import", or "Export".

## Button Kinds

| Kind | Description |
| :--- | :--- |
| `default` | A standard button (default). |
| `form` | Opens a form (usually in a dialog) when clicked. |
| `navigation` | Navigates to a route when clicked. |
| `method` | Calls a specific method when clicked. |

## Configuration

Header buttons share common properties with table actions.

```yaml
headerButton:
  kind: form
  icon: add
  text: Create Project
  options:
    # Form configuration here
```

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `kind` | `string` | The type of button (alias: `role`). |
| `icon` | `string` | Material icon name. |
| `text` | `string` | The button label. |
| `disabled`| `boolean`| Whether the button is disabled. |
| `permission`| `string`| Required permission to see the button. |
| `color` | `string` | Material color (e.g., `primary`, `accent`). |
| `options` | `object` | Kind-specific configuration (e.g., form details). |

## Examples

### Navigation Header Button
```yaml
headerButton:
  kind: navigation
  icon: arrow_back
  text: Back to Dashboard
  route: /dashboard
```

### Method Header Button
```yaml
headerButton:
  kind: method
  icon: download
  text: Export CSV
  method: exportData
```
