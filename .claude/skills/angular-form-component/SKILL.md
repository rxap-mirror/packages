---
name: angular-form-component
description: Generate reactive Angular form components with comprehensive control types, validation, and layout options using the @rxap/schematic-angular package.
---

# Angular Form Component Skill

This skill helps you generate Angular form components using the `@rxap/schematic-angular:form-component` schematic.

## When to use

- When you need to create a **form** to collect user input.
- When you need a form to be used within a **dialog** or as a **standalone page**.
- When you need complex form controls like **autocomplete**, **date pickers**, or **table-select**.
- When you want to define validations and layouts declaratively.

## How to use

Define your form configuration in a `schematics.yaml` file (recommended) and execute it using the [schematic-composer](../schematic-composer/SKILL.md).

```yaml
- package: "@rxap/schematic-angular"
  name: form-component
  options:
    name: user-edit
    project: admin-panel
    feature: user
    controlList:
      # ... list of controls
```

## Configuration Reference

### Top-Level Options

| Property | Description |
| :--- | :--- |
| `name` | **Required**. The component name. |
| `project` | The target project. |
| `controlList` | Array of control definitions. |
| `window` | `true` if this form is intended to be shown in a dialog/window. |

### Controls (`controlList`)

Each item in `controlList` defines a form field.

#### Common Properties
| Property | Description |
| :--- | :--- |
| `name` | Field name (key). |
| `kind` | Type of control (see below). |
| `label` | Display label. |
| `required` | Boolean (shorthand for validator). |
| `validatorList` | List of validators (e.g. `['email']`). |

#### Control Kinds

| Kind | Description | Specific Options |
| :--- | :--- | :--- |
| `input` | Text/Email/Password input. | `inputType`, `placeholder`, `hasClearButton` |
| `select` | Dropdown. | `optionList`, `multiple` |
| `checkbox` | Boolean checkbox. | `labelPosition` |
| `textarea` | Multiline text. | `minRows`, `maxRows` |
| `date` | Date picker. | `placeholder` |
| `slide-toggle` | Toggle switch. | - |
| `autocomplete` | Input with suggestions. | `upstream` (data source), `toDisplay`, `toValue` |
| `table-select` | Select via a table dialog. | `columnList`, `upstream` |

### Example Controls

**Simple Input:**
```yaml
- name: email
  kind: input
  inputType: email
  label: Email Address
  required: true
```

**Select with Static Options:**
```yaml
- name: role
  kind: select
  label: Role
  optionList:
    - value: admin
      display: Administrator
    - value: user
      display: User
```

**Autocomplete (from API):**
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

## Integrating with Tables

Forms are often generated inline within a Table Action to create "Add" or "Edit" dialogs.

```yaml
# Inside table-component > actionList
- type: create
  kind: form
  icon: add
  formOptions:
    controlList:
      - name: name
        kind: input
        required: true

## References and Examples

- [Form Control Guide](references/CONTROL_GUIDE.md)
- [Backend Configuration Guide](references/BACKEND_GUIDE.md)
- [Upstream Configuration Guide](references/UPSTREAM_GUIDE.md)
- [Complex Controls Example](assets/complex-controls.yaml)


```
