# Table Component Schematic Guide

The `table-component` schematic is used to generate a comprehensive Angular Material table component, optionally connected to a NestJS backend.

## Basic Usage

To generate a table component, you define it in a `schematic.yaml` or `schematic.json` file.

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    name: user-list
    project: admin-panel
    feature: user
    columnList:
      - name: email
      - name: name
```

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of the component and entity. |
| `project` | `string` | The target project (frontend). |
| `feature` | `string` | The feature module name. |
| `nestModule` | `string` | (Optional) The NestJS module name for backend generation. |
| `backend` | `object \| string` | [Backend Configuration](./backend.md) |
| `columnList` | `array` | [Column Definitions](./table-column.md) |
| `actionList` | `array` | [Action Definitions](./table-action.md) |
| `filterList` | `array` | [Filter Definitions](./table-filter.md) |
| `headerButton` | `object` | [Header Button Configuration](./header-button.md) |
| `modifiers` | `array` | [Table Modifiers](./table-modifiers.md) |
| `upstream` | `object` | [Upstream Configuration](./upstream.md) |
| `sortable` | `boolean \| object` | Whether the table is sortable and its default state. |
| `cssClass` | `string \| array \| object` | Custom CSS classes for the table. |
| `selectColumn` | `boolean` | Whether to add a checkbox selection column. |
| `fullWidth` | `boolean` | Whether the table should take the full width of its container. |

## Detailed Guides

Dive into specific options for more advanced configurations:

- [**Table Columns**](./table-column.md): Learn about different column types (text, date, custom, etc.).
- [**Table Actions**](./table-action.md): Add row actions like edit, delete, or custom operations.
- [**Backend Configuration**](./backend.md): Connect your table to a NestJS or OpenAPI-based API.
- [**Table Filters**](./table-filter.md): Add search and filter controls to your table.
- [**Header Buttons**](./header-button.md): Add buttons to the table header for actions like "Create".
- [**Table Modifiers**](./table-modifiers.md): Tweak the table behavior and appearance with modifiers.
- [**Upstream Data**](./upstream.md): Configure data mapping and pagination for complex data sources.
