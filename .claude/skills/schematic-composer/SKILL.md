---
name: schematic-composer
description: Orchestrate and execute multiple Angular Schematics using declarative YAML/JSON configuration files. Use this to generate complex code structures like tables, forms, and backend controllers without running multiple long CLI commands.
---

# Schematic Composer Skill

The `@rxap/schematic-composer` allows you to define the state of your application code in a file and execute multiple schematics sequentially.

## When to use

- When you need to generate complex components (e.g., Tables, Forms) that require many options.
- When you want to generate both Frontend (Angular) and Backend (NestJS) code together.
- When you want to document the generation configuration in a file (`schematics.yaml`) for reproducibility.

## How to use

### 1. Create a Configuration File

Create a `schematics.yaml` (or `.json`) file in the directory where you want the code to be related (e.g., `libs/feature/src/lib/schematics.yaml`).

The file expects an **array** of schematic definitions:

```yaml
- package: "@rxap/schematic-angular" # The npm package name
  name: table-component              # The schematic name within that package
  options:                           # Input options for the schematic
    name: "user-list"
    # ... other options
```

### 2. Execute the Composer

Use the `compose` schematic to execute the configuration file.

**Single File Execution (Recommended):**

```bash
yarn nx generate @rxap/schematic-composer:compose --file path/to/schematics.yaml
```

**Bulk Execution:**

To run all `schematics.yaml` files in a directory:

```bash
yarn nx generate @rxap/schematic-composer:compose --directory libs/my-feature
```

## Example: Generating a Table Component

### Configuration (`libs/my-feature/src/lib/schematics.yaml`)

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    name: user-grid
    # The 'project' and 'feature' are inferred from the file path
    
    # Define columns
    columnList:
      - name: id
        kind: text
        label: User ID
      - name: email
        kind: text
        label: Email Address
      - name: created_at
        kind: date
        label: Registration Date

    # Backend configuration (generates NestJS controller)
    backend:
      kind: nestjs
    nestModule: api-user
```

### Execution Command

```bash
yarn nx generate @rxap/schematic-composer:compose --file libs/my-feature/src/lib/schematics.yaml
```

## Options Reference

| Option | Description |
| :--- | :--- |
| `--file` | Path to a specific configuration file. **Recommended**. |
| `--directory` | Recursively search and execute all config files in this directory. |
| `--filter` | Filter files by folder name when using `--directory`. |
| `--dry-run` | Run without making changes to verify the output. |