# Table Modifiers Guide

Modifiers are strings that tweak the behavior or appearance of the table component.

## Available Modifiers

| Modifier | Description |
| :--- | :--- |
| `navigation-back-header` | Adds a back button to the table header. |
| `without-title` | Hides the table title. |
| `show-archived-slide` | Adds a slide toggle to show/hide archived items. |
| `with-header` | Ensures the table has a header section. |

## Usage

Define modifiers as an array of strings in your schematic configuration.

```yaml
modifiers:
  - navigation-back-header
  - show-archived-slide
```
