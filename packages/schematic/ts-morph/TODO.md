# TODO: @rxap/schematics-ts-morph Audit Findings & Action Plan

This file documents critical bugs, functional issues, platform-compatibility bugs, and architectural debt found during the audit of the `@rxap/schematics-ts-morph` project.

---

## 🚨 Critical Bugs & Functional Issues

### 1. Virtual Tree read/exists Anti-Pattern on `node_modules`
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/schematic/ts-morph/src/generators/init/generator.ts#L85-L110)
* **Problem:** 
  The `init` generator attempts to use `tree.exists()` and `tree.read()` on files inside `node_modules` to recursively check and run peer dependency init generators.
  The virtualized workspace `Tree` does not track or load files inside `node_modules` because they are gitignored and read-only. Consequently, `tree.exists(...)` will always return `false`, preventing any peer dependency initializers from ever being invoked.
* **Recommended Fix:** 
  Use Node's physical filesystem module (`fs.existsSync`, `fs.readFileSync`) to inspect `node_modules` files instead of relying on the virtualized `Tree` instance.

---

## 💻 Platform Compatibility & Path Normalization Issues

### 2. Windows-Incompatible Backslash Import Specifiers
* **Files:** 
  * [add-nest-module-to-app-module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/schematic/ts-morph/src/lib/nest/add-nest-module-to-app-module.ts#L36)
  * [coerce-nest-module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/schematic/ts-morph/src/lib/nest/coerce-nest-module.ts#L126)
* **Problem:** 
  Node's `'path'` module functions (`join` and `relative`) are used to compute relative paths for module specifiers. On Windows platforms, these resolve with backslashes (`\`) (e.g., `..\foo\bar.module`). When written as TypeScript import specifiers, this causes syntax/compilation errors.
* **Recommended Fix:** 
  Normalize generated module specifiers to always use forward slashes (`/`), either via `@angular-devkit/core`'s `normalize` function or replacing backslashes:
  ```typescript
  const relativePath = relative(cleanAppModulePath, modulePath).replace(/\\/g, '/');
  ```

### 3. File-to-File Relative Path Resolution Bug
* **File:** [coerce-nest-module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/schematic/ts-morph/src/lib/nest/coerce-nest-module.ts#L126)
* **Problem:**
  Calling `relative(moduleFile, moduleFilePath)` where both parameters are file paths causes two issues:
  1. `relative` treats the first file path as a folder path, leading to an extra incorrect parent traversal (`../` instead of `./`).
  2. Relative path calculation does not prepend `./` for files in the same directory, which makes compilers resolve the import from `node_modules` instead of the local folder.
* **Recommended Fix:**
  Extract the directory name of the source file first before calling `relative`, and ensure the output starts with `./` or `../`:
  ```typescript
  import { dirname } from 'path';
  ...
  let relativePath = relative(dirname(moduleFile), moduleFilePath).replace(/\\/g, '/');
  if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
    relativePath = './' + relativePath;
  }
  ```

---

## 🏛️ Architectural Debt & Duplicate Logic

### 4. Local Redundant `ts-morph` Helpers
* **Folder:** `src/lib/ts-morph/`
* **Problem:** 
  A massive collection of typescript-manipulation helpers (like `CoerceDecorator`, `CoerceImports`, `CoerceClassProperty`, `CoerceInterface`) are duplicated in this project and marked as `@deprecated import from @rxap/ts-morph`. However, the local library code inside `lib/angular/` and `lib/nest/` still imports and uses these local deprecated copies instead of using `@rxap/ts-morph` directly.
* **Recommended Fix:** 
  1. Update all relative imports pointing to `./ts-morph/` or `../ts-morph/` to import from `@rxap/ts-morph` instead.
  2. Delete the redundant files in `packages/schematic/ts-morph/src/lib/ts-morph/` to eliminate duplicate maintenance.

### 5. Loose Equality in Handlebars Helpers
* **File:** [coerce-component.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/schematic/ts-morph/src/lib/angular/coerce-component.ts#L104-L117)
* **Problem:** 
  Custom Handlebars helper functions `ifeq` and `ifnoteq` use loose equality (`==` and `!=`), which is an anti-pattern and can cause unexpected type-coercion bugs.
* **Recommended Fix:** 
  Refactor helpers to use strict equality (`===` and `!==`).
