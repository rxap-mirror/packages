# Form Component Guide

The `form-component` schematic generates a reactive Angular form component, which can be used as a standalone page, a dialog, or integrated into other components like tables.

## Basic Usage

To generate a form component, define it in your schematic configuration:

```yaml
- package: "@rxap/schematic-angular"
  name: form-component
  options:
    name: user-edit
    project: admin-panel
    feature: user
    controlList:
      - name: email
        kind: input
        label: Email Address
        required: true
      - name: role
        kind: select
        label: Role
        options:
          - value: admin
            label: Admin
          - value: user
            label: User
```

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of the form component. |
| `project` | `string` | The target project. |
| `feature` | `string` | The feature module. |
| `controlList` | `array` | [Control Definitions](./form-control.md) |
| `window` | `boolean` | If `true`, the form is designed to open in a window/dialog. |
| `role` | `string` | The role of the form (e.g., `form`, `search`). |
| `matFormFieldDefaultOptions` | `object` | Default options for Material form fields (e.g., `appearance`). |

## Usage in Tables

Forms are often used as actions within a [Table Component](./table-component.md). You can define a form inline using the `formOptions` property in a table action.

```yaml
actionList:
  - type: create
    kind: form
    icon: add
    formOptions:
      controlList:
        - name: title
          required: true
```

For more details on integrating forms with tables, see the [Table Action Guide](./table-action.md#form-actions).
