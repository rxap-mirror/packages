# Table Action Guide

Table actions allow users to perform operations on specific rows or on the table as a whole.

## Row Actions

Row actions are typically rendered in an "Actions" column at the end of the row.

```yaml
actionList:
  - type: edit
    icon: edit
    tooltip: Edit User
  - type: delete
    icon: delete
    confirm: true # Shows a confirmation dialog before executing
```

## Action Types

The `type` property defines the behavior of the action.

| Type | Description |
| :--- | :--- |
| `operation` | Generic operation, often linked to a backend method. |
| `dialog` | Opens a dialog component. |
| `navigation` | Navigates to a different route. |
| `form` | Opens a form (often in a dialog) to edit/create data. |
| `open-api` | Directly calls an OpenAPI operation. |

## Common Properties

| Property | Description |
| :--- | :--- |
| `icon` | Material icon name. |
| `tooltip` | Text shown on hover. |
| `confirm` | If `true`, requires user confirmation. |
| `refresh` | If `true`, refreshes the table after completion. |
| `inHeader` | If `true`, the action is placed in the table header (global action). |
| `permission` | (Optional) Permission string required to see/execute the action. |
| `checkFunction` | JavaScript expression string to dynamically check visibility (e.g. `!element.archived`). |
| `color` | Angular Material color palette name (e.g. `primary`, `accent`, `warn`). |
| `role` | (Alias: `kind`) The role of the action (e.g. `method`, `navigation`). |

## Examples

### Navigation Action
```yaml
- type: details
  icon: visibility
  role: navigation
  options:
    route: "/users/user/{{uuid}}/details"

```

### Header Action (e.g., Create New)
```yaml
- type: create
  icon: add
  inHeader: true
  role: form
```

### Action with Confirmation
```yaml
- type: archive
  icon: archive
  confirm: true
  color: warn
  permission: user.archive
  checkFunction: "!element.archived"
  successMessage: "Item archived successfully"

```

## Form Actions

You can use the `form` kind (or role) to open a form when an action is triggered. This is commonly used for "Create" or "Edit" actions.

### Defining the Form

You can define the form structure directly within the action using `formOptions`.

```yaml
- type: create
  kind: form
  icon: add
  formOptions:
    controlList:
      - name: name
        label: Name
        required: true
```

### Pre-filling Data

Use the `loadFrom` property to pre-fill the form with data from the row or an API call.

- **From Row**: The form is automatically populated with the row data if `formInitial` is true.
- **From API**:

```yaml
- type: edit
  kind: form
  icon: edit
  loadFrom:
    operationId: getUserDetails
    parameters: true # Uses row data as parameters
```

### Saving Data

The form submission is handled by an `operationId` (if connected to an API).

```yaml
formOptions:
  submit:
    operationId: updateUser
```
