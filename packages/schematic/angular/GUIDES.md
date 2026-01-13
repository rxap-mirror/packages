# Developer Guide: Generating Angular Material Tables & NestJS Controllers with @rxap/schematics

This guide explains how to use `@rxap/schematic-composer` in conjunction with `@rxap/schematic-angular` to auto-generate an Angular Material table component and its corresponding NestJS controller.

## Overview

The process involves creating a declarative configuration file (`schematic.yaml`) that defines the table structure and backend requirements. The `@rxap/schematic-composer:compose` generator reads this file and executes the `@rxap/schematic-angular:table-component` schematic with the provided options.

> [!TIP]
> For more detailed information on all available options, check out the [Detailed Table Component Guide](./src/guides/table-component.md).

> [!TIP]
> Need to create forms? Check out the [Form Component Guide](./src/guides/form-component.md) and [Form Control Guide](./src/guides/form-control.md).


## Prerequisites

Ensure you have the following packages in your Nx workspace:
- `@rxap/schematic-composer`
- `@rxap/schematic-angular`

## step 1: Create `schematic.yaml`

Create a `schematic.yaml` file in your feature directory (e.g., `libs/feature/user/src/lib/schematic.yaml`). This file tells the composer which schematics to run.

### File Structure

The file expects an array of schematic definitions. Each definition contains:

- **package**: The npm package containing the schematic (e.g., `@rxap/schematic-angular`).
- **name**: The name of the schematic to run (e.g., `table-component`).
- **options**: The configuration object passed to the schematic.

## Step 2: Configure the Table Component

To generate both the **Angular Table** and the **NestJS Controller**, you must configure the `table-component` options correctly.

### Key Options

| Option | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `name` | The name of the component/entity. | Yes | `user-list` |
| `project` | The name of the *frontend* project. | Inferred* | `admin-panel` |
| `feature` | The feature module name where the component belongs. | Inferred* | `user` |
| `nestModule` | The name of the **NestJS module** where the controller should be created. | **Yes** (for backend) | `api-user` |
| `backend` | Configuration for data handling. Setup for NestJS generation. | **Yes** | `{ kind: 'nestjs' }` |
| `columnList` | Array of columns to display. | Yes | `[{ name: 'email', kind: 'text' }]` |

*\*Inferred when using the `--file` option with the composer generator.*


### Backend Configuration (Critical)

To trigger the generation of a NestJS controller, you must set the `backend` option to `nestjs` and provide the `nestModule`.

```yaml
backend:
  kind: nestjs
  # Optional: Specify backend project if different from context
  # project: api-app 
  # Optional: OpenAPI server ID
  # serverId: main 
nestModule: api-user
# controllerName: user # Optional: overrides default controller name
```

This configuration tells the schematic to:
1.  Create a standard Angular Material Table.
2.  Generate/Update a NestJS Controller in the specified `nestModule` (`api-user`).
3.  Create a `getPage` method in the controller to handle pagination, sorting, and filtering.
4.  Connect the Angular table data source to this backend endpoint automatically.

## Example `schematic.yaml`

Here is a complete example that generates a "User Table" with:
-   Columns: ID, Email, Name
-   Backend: NestJS Controller in `api-user` module
-   Frontend: `admin-panel` project, `user` feature

```yaml
- package: "@rxap/schematic-angular"
  name: table-component
  options:
    # --- Frontend Location ---
    project: admin-panel
    feature: user
    name: user-list
    
    # --- Backend Configuration ---
    # This triggers the NestJS controller generation
    backend:
      kind: nestjs
    nestModule: api-user
    # Optional: explicitly set controller name if different from 'name'
    # controllerName: user 
    
    # --- Table Structure ---
    columnList:
      - name: id
        kind: text
        label: ID
      - name: email
        kind: text
        label: Email Address
      - name: name
        kind: text
        label: Full Name
    
    # --- Optional: Filters & Actions ---
    filterList:
      - name: email
        kind: input
        label: Filter by Email
    
    actionList:
      - name: edit
        type: icon
        icon: edit
        tooltip: Edit User
```

## Step 3: Run the Generator

The easiest and recommended way to execute your `schematic.yaml` is by using the `--file` option. This allows the generator to automatically infer the **project**, **feature**, and **target directory** from the file's location.

```bash
yarn nx generate @rxap/schematic-composer:compose --file libs/feature/user/src/lib/schematic.yaml
```

> [!NOTE]
> When using the `--file` option, you can typically omit `project`, `feature`, and `directory` from your `schematic.yaml` file, as they will be detected based on the path provided.

### Alternative: Search by Directory

If you want the generator to search for all `schematic.yaml` files within a directory tree:

```bash
yarn nx generate @rxap/schematic-composer:compose --directory libs/feature/user/src/lib
```

**Arguments:**
-   `--file`: (Primary) The direct path to your `schematic.yaml`.
-   `--directory`: A starting directory to search for one or more `schematic.yaml` files.
-   `--filter`: (Optional) If searching via directory, filter for schematic files within a specific sub-folder name.


## Important Notes for AI Agents

When generating code for users:

1.  **Prefer the `--file` option:** When executing the composer, always use the `--file` argument with the path to the `schematic.yaml` you just created.
2.  **Target Locations:** Even though `--file` infers locations, ensure the `schematic.yaml` itself is placed in the correct logical feature directory of the workspace.
3.  **Identify the Backend Module:** Ask the user or search for the NestJS module (`nestModule`) that should own the backend logic.
4.  **Backend Integration:** Ensure `backend: { kind: 'nestjs' }` and `nestModule` are correctly set to enable controller generation.


## Troubleshooting

-   **Controller not generated?** Check if `backend.kind` is set to `nestjs` and `nestModule` is specified and exists.
-   **"Module not found" errors?** Ensure the `nestModule` name matches the library name in `nx.json` or `project.json`.
