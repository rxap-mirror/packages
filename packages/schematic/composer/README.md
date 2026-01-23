This package provides a schematic to compose and execute other schematics based on configuration files. It allows executing schematics for a specific project, feature, or the entire workspace. The configuration files can be in JSON or YAML format, defining the schematics to be executed and their options.

[![npm version](https://img.shields.io/npm/v/@rxap/schematic-composer?style=flat-square)](https://www.npmjs.com/package/@rxap/schematic-composer)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/schematic-composer)
![npm](https://img.shields.io/npm/dm/@rxap/schematic-composer)
![NPM](https://img.shields.io/npm/l/@rxap/schematic-composer)

- [Installation](#installation)
- [Guides](#guides)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/schematic-composer
```
# Guides

# Schematic Composer Guide

The `@rxap/schematic-composer` package allows you to orchestrate the execution of multiple Angular Schematics using declarative configuration files (YAML or JSON). This is particularly useful for complex generations where you want to define the state of your application code in a file rather than running long CLI commands.

## The `compose` Schematic

The core of this package is the `compose` schematic. It reads a configuration file and executes the defined schematics sequentially.

### Basic Usage

The most common way to use the composer is by pointing it to a specific configuration file:

```bash
yarn nx generate @rxap/schematic-composer:compose --file path/to/your/schematic.yaml
```

When you use the `--file` option, the composer receives the context of where the file is located. This allows it to automatically infer properties like `project` and `feature` if the schematics you are calling support them.

### Options

| Option | Description |
| :--- | :--- |
| `--file` | The direct path to a specific configuration file (e.g., `libs/feat/src/schematics.yaml`). This is the **recommended** usage for specific tasks. |
| `--directory` | A directory path. The composer will recursively search for all `schematic.yaml` (or `.json`) files within this directory and execute them. |
| `--filter` | When using `--directory`, this allows you to filter which files to execute based on their folder name. |
| `--overwrite` | Can be boolean, string or array of strings. Controls overwriting behavior. |
| `--replace` | Boolean. If true, it may replace existing files. |

## Configuration File Format

The configuration file (usually named `schematic.yaml`) expects an **array** of schematic definitions.

```yaml
# A list of schematics to execute
- package: "@rxap/schematic-angular" # The npm package name
  name: table-component              # The schematic name within that package
  options:                           # The inputs/options for that schematic
    name: "user-list"
    # ... other schematic-specific options
```

### Structure Reference

- **package** *(string, required)*: The name of the collection/package (e.g., `@schematics/angular`, `@rxap/schematic-angular`).
- **name** *(string, required)*: The name of the schematic to run (e.g., `component`, `service`).
- **options** *(object)*: Key-value pairs that map directly to the schematic's input options.

## Example: Generating an Angular Component

This example demonstrates how to use the composer to generate a table component using `@rxap/schematic-angular`.

### 1. Create the `schematics.yaml` file

Create a file at `libs/my-feature/src/lib/schematics.yaml`:

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    name: user-grid
    # The 'project' and 'feature' can often be inferred from the file path
    # if you run the composer with the --file argument.
    
    # Define columns for the table
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

    # Example of backend configuration (if supported by the schematic)
    backend:
      kind: nestjs
    nestModule: api-user
```

### 2. Run the Composer

Run the command pointing to the file:

```bash
yarn nx generate @rxap/schematic-composer:compose --file libs/my-feature/src/lib/schematics.yaml
```

The composer will:
1.  Read the YAML file.
2.  Resolve the `@rxap/schematic-angular:table-component` schematic.
3.  Execute it with the defined options (columns, names, etc.).

## Bulk Execution

You can define multiple schedulers in a project and run them all at once or filter them.

**Run all definitions in a library:**
```bash
yarn nx generate @rxap/schematic-composer:compose --directory libs/my-feature
```

**Run only definitions in 'tables' subfolders:**
```bash
yarn nx generate @rxap/schematic-composer:compose --directory libs/my-feature --filter tables
```

