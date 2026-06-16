# Table Filter Guide

Table filters provide a way for users to narrow down the data shown in the table through various input controls.

## Filter Configuration

Filters are defined in the `filterList` array. Each filter corresponds to a form control.

```yaml
filterList:
  - name: status
    kind: select
    label: Filter by Status
    options:
      - label: Active
        value: active
      - label: Inactive
        value: inactive
  - name: search
    kind: input
    label: Search by Name
```

## Filter Kinds

The `kind` property specifies the type of form control used for the filter.

| Kind | Description |
| :--- | :--- |
| `input` | Standard text input. |
| `select` | Dropdown selection. |
| `checkbox` | Boolean toggle. |
| `textarea` | multi-line text input. |
| `date` | Date picker. |
| `slide-toggle` | Material slide toggle. |
| `autocomplete` | Input with autocomplete suggestions. |
| `table-select` | Opens a table for selection. |

## Common Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The parameter name used in the API call. |
| `label` | `string` | The label shown to the user. |
| `kind` | `string` | The type of control. |
| `default` | `any` | Initial value for the filter. |
| `placeholder`| `string` | Placeholder text for inputs. |

## Inline Column Filters

You can also enable filters directly on columns using the `hasFilter` property in `columnList`.

```yaml
columnList:
  - name: email
    hasFilter: true
```

When `hasFilter` is true, the schematic automatically adds a filter control for that column. You can customize this control using `filterControl`.

```yaml
columnList:
  - name: createdAt
    kind: date
    hasFilter: true
    filterControl:
      kind: date
      label: Created After
```
