---
name: nx-generator-creator
description: Create new Nx workspace plugin generators using RxAP utilities. Use this skill when you need to scaffold and implement generators for creating application code (NestJS services, Angular components, etc.).
---

# Nx Generator Creator

This skill guides you through the process of creating a new Nx workspace generator. The goal is to create generators that produce application code using standard patterns and utilities.

## Process

### 1. Scaffold the Generator

Use the Nx CLI to create the initial generator structure.

```bash
nx generate @nx/plugin:generator --name=<generator-name> --project=<plugin-project>
```

### 2. Implementation Strategy

Your generator should primarily use `ts-morph` for code generation and modification. Avoid using string templates (`.template` files) for complex TypeScript files.

**Core Pattern:**
1.  **Read/Check:** Use `@rxap/workspace-utilities` to check for project existence, read configuration, etc.
2.  **Dependencies:** Use `AddPackageJsonDependency` to add required packages.
3.  **Transform:** Use `@rxap/workspace-ts-morph` to modify or create TypeScript files via AST.

### 3. Using Utilities

Refer to [Utilities Reference](references/UTILITIES.md) for a comprehensive list of available functions.

#### Common Workflow

**Example: Creating a NestJS Module**

```typescript
import { Tree } from '@nx/devkit';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { CoerceNestModule } from '@rxap/ts-morph';

export default async function (tree: Tree, options: any) {
  // 1. Add Dependencies
  // ...

  // 2. Transform / Create Files
  await TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined // or { kind: 'postgres', ... }
    },
    (project, [moduleSourceFile]) => {
      // 'project' is the ts-morph Project
      // 'moduleSourceFile' is the SourceFile for the matched path

      // Ensure the module class exists and is decorated
      CoerceNestModule(moduleSourceFile, {
        name: options.name
      });
    },
    ['src/app/my-feature/my-feature.module.ts'] // File(s) to target
  );
}
```

**Example: Creating an Angular Component**

```typescript
import { Tree } from '@nx/devkit';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { CoerceComponent } from '@rxap/ts-morph';

export default async function (tree: Tree, options: any) {
  await TsMorphAngularProjectTransform(
    tree,
    { project: options.project },
    (project, [sourceFile]) => {
      CoerceComponent(sourceFile, options.name, {
        selector: 'app-' + options.name,
        templateUrl: true, // Auto-generates ./name.component.html
        styleUrls: true    // Auto-generates ./name.component.scss
      });
    },
    [`src/app/${options.name}/${options.name}.component.ts`]
  );
}
```

## Best Practices

-   **Coercion:** Prefer `Coerce...` functions over `Add...` functions. Coercion implies "create if missing, update if exists", which is idempotent and safer.
-   **Exact Imports:** When using `CoerceImports`, provide the exact `namedImports` and `moduleSpecifier`.
-   **AST over Templates:** Use `ts-morph` for logic, imports, and class structures. Use templates only for static assets (HTML, SCSS, JSON).
