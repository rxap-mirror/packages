---
name: angular-table-component
description: Generate comprehensive Angular Material table components with sorting, filtering, pagination, and optional NestJS backend integration using the @rxap/schematic-angular package.
---

# Angular Table Component Skill

This skill helps you generate Angular Material table components using the `@rxap/schematic-angular:table-component` schematic.

## When to use

- When you need to display data in a data grid or table format.
- When you require features like **sorting**, **filtering**, **pagination**, or **row actions**.
- When you want to automatically generate a corresponding **NestJS controller** for the data.
- When you need to customize columns with specific types (Date, Boolean, Options, etc.).

## How to use

Define your table configuration in a `schematics.yaml` file (recommended) and execute it using the [schematic-composer](../schematic-composer/SKILL.md).

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    name: user-list
    project: admin-panel
    feature: user
    # ... component configuration
```

## Configuration Reference

### Top-Level Options

| Property | Description |
| :--- | :--- |
| `name` | **Required**. The name of the component (kebab-case). |
| `project` | The frontend project name. |
| `feature` | The feature module name. |
| `columnList` | Array of column definitions. |
| `actionList` | Array of action definitions. |
| `filterList` | Array of filter definitions. |
| `backend` | Backend configuration (e.g., `kind: nestjs`). |
| `selectColumn`| Boolean. Add a checkbox column for row selection. |

### Columns (`columnList`)

Each item in `columnList` defines a column.

| Kind | Description | Example Properties |
| :--- | :--- | :--- |
| `text` | Default. Plain text. | `name: string` |
| `date` | Date formatting. | `format: "dd.MM.yyyy"` |
| `options` | Map values to labels. | `optionList: [{value: "A", display: "Active"}]` |
| `boolean` | Check/Close icon. | `name: isActive` |
| `link` | Clickable link. | `name: customUrl` |
| `icon` | Material icon name. | `name: iconName` |
| `copy-to-clipboard` | Copy button. | `name: apiKey` |

**Example Column:**
```yaml
- name: status
  kind: options
  title: Status
  sortable: true
  optionList:
    - value: active
      display: Active
    - value: inactive
      display: Inactive
```

### Actions (`actionList`)

Actions can appear in the header or in a row column.

| Property | Description |
| :--- | :--- |
| `type` | Unique identifier/handler name. |
| `icon` | Material icon name. |
| `inHeader` | `true` for global actions (e.g., "Create"). |
| `confirm` | `true` to show a confirmation dialog. |
| `kind` | `navigation`, `operation`, `form`, `dialog`. |

**Example Action:**
```yaml
- type: delete
  icon: delete
  confirm: true
  tooltip: Delete User
  color: warn
```

### Filters (`filterList` or `columnList[].hasFilter`)

Filters allow server-side filtering. You can define them explicitly in `filterList` or enable them on columns.

**Inline Column Filter:**
```yaml
columnList:
  - name: email
    hasFilter: true
```

**Explicit Filter:**
```yaml
filterList:
  - name: status
    kind: select
    label: Filter Status
    options: [...]
```

### Backend Integration

Connect the table to a data source.

**NestJS (Auto-generate Controller):**
```yaml
backend:
  kind: nestjs
nestModule: api-user
```

**OpenAPI (Existing API):**
```yaml
backend:
  kind: open-api
openApi:
  operationId: listUsers
```

## Complete Example

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    name: user-grid
    project: admin-app
    feature: user
    
    # Enable NestJS controller generation
    backend:
      kind: nestjs
    nestModule: api-user

    columnList:
      - name: id
        title: ID
        modifiers: [primary-key]
        hidden: true
      - name: email
        kind: text
        sortable: true
        hasFilter: true
      - name: role
        kind: options
        optionList:
          - value: admin
            display: Admin
          - value: user
            display: Standard User
      - name: created
        kind: date
        format: "shortDate"

    actionList:
      # Header Action
      - type: create
        icon: add
        inHeader: true
        kind: form
        formOptions:
            controlList:
                - name: email
                  required: true
      # Row Action
      - type: delete
        icon: delete
        confirm: true
        color: warn

## References and Examples

- [Table Action Guide](references/ACTION_GUIDE.md)
- [Table Column Guide](references/COLUMN_GUIDE.md)
- [Table Filter Guide](references/FILTER_GUIDE.md)
- [Table Header Button Guide](references/HEADER_BUTTON_GUIDE.md)
- [Table Modifiers Guide](references/MODIFIERS_GUIDE.md)
- [Backend Configuration Guide](references/BACKEND_GUIDE.md)
- [Upstream Configuration Guide](references/UPSTREAM_GUIDE.md)
- [Complex User Table Example](assets/user-table.yaml)


```
