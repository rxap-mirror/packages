# TODO: workspace-ts-morph

This file contains the findings, architectural debt, critical bugs, and recommended fixes identified during the audit of the `@rxap/workspace-ts-morph` package.

---

## 1. Critical Bugs 🚨

### 🔴 Prettier/Styling Improvements Silently Ignored
* **File:** [`src/lib/apply-ts-morph-project.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/lib/apply-ts-morph-project.ts#L116-L123)
* **Description:** 
  The utility uses an AST-based leaf-node comparison (`areSame`) to decide if a file has changed before overwriting it:
  ```typescript
  if (!areSame(sourceFile, tmpProject.createSourceFile('/tmp.ts', currentContent))) {
    treeAdapter.overwrite(filePath, newContent);
  }
  ```
  Because AST leaf-node checks strictly analyze semantic syntax, layout-only changes (such as whitespace changes, indentation, semi-colon insertion/removal, and some comments) are completely ignored. When `prettier` runs and formats the file, `areSame` evaluates to `true` (since the AST matches) and standard file overwrites are **bypassed**. This causes all prettier-formatted output to be silently discarded.
* **Recommended Fix:** 
  Perform a fast, standard string comparison instead:
  ```typescript
  if (currentContent !== newContent) {
    treeAdapter.overwrite(filePath, newContent);
  }
  ```
  This eliminates the bug and avoids complex AST parsing overhead completely.

---

## 2. Architectural Debt & Anti-Patterns 🏛️

### ⚠️ Virtual Tree `node_modules` Queries (Dead Code)
* **File:** [`src/generators/init/generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/generators/init/generator.ts#L83-L93)
* **Description:** 
  The init generator attempts to query `node_modules` files inside the virtual `tree` object:
  ```typescript
  const peerPackageJsonFilePath = join('node_modules', ...peer.split('/'), 'package.json');
  if (!tree.exists(peerPackageJsonFilePath)) { ... }
  ```
  The Nx virtual `Tree` does **not** track or cache files inside `node_modules`. As a result, `tree.exists()` always returns `false` here. This makes the entire nested initialization cascade (running `init` generators of peer dependencies) dead code that is completely unreachable.
* **Recommended Fix:** 
  Query the physical file system (using standard Node `fs` module, or `require.resolve`) to look up paths inside `node_modules` since they are external to the virtual tree workspace code.

### ⚠️ Relative Physical Paths (`__dirname`) inside Generator
* **File:** [`src/generators/init/generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/generators/init/generator.ts#L11-L14)
* **Description:** 
  Using `__dirname` relative pathing to resolve the location of package.json files for a virtual tree operation:
  ```typescript
  const packageJsonFilePath = relative(tree.root, join(__dirname, '..', '..', '..', 'package.json'));
  ```
  This breaks if the generator is compiled or run under a customized layout / executor or inside distributed CI environments where the physical directory layout does not directly mirror the virtual workspace structure.
* **Recommended Fix:** 
  Reference the workspace-relative path of the package directly or fetch the project config root dynamically using `@nx/devkit` utilities.

### ⚠️ Massive Performance Overhead in File Verification
* **File:** [`src/lib/apply-ts-morph-project.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/lib/apply-ts-morph-project.ts#L116-L122)
* **Description:** 
  For every single source file, the code initializes a brand-new `ts-morph` project (`CreateProject()`), parses the existing disk content into a virtual file, and recursively traverses both files' AST trees to compare leaf nodes. In medium-to-large repositories, this results in significant performance degradation during generation/transformation tasks.
* **Recommended Fix:** 
  Replace the AST recursive lookup with a standard string check (`currentContent !== newContent`).

---

## 3. Cross-Platform Compatibility 💻

### ⚠️ Windows Platform Path Separator Issues
* **Files:** 
  * [`src/lib/add-dir.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/lib/add-dir.ts)
  * [`src/lib/ts-morph-transform.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/workspace/ts-morph/src/lib/ts-morph-transform.ts#L126-L130)
* **Description:** 
  The codebase uses standard `path.join` to build files and directory paths. On Windows, `join` introduces backslashes (`\\`).
  1. `ts-morph` expects normalized path names with forward slashes (`/`). Using platform-dependent backslashes causes duplicate file entries or lookup failures in `ts-morph`.
  2. Path comparison checks like:
     ```typescript
     include = filePath.map(f => f.replace(/\?$/, '')).some(f => fullPath.endsWith(f));
     ```
     will fail on Windows because `fullPath` uses `\\` whereas `f` uses `/` (e.g. matching `packages\\workspace\\ts-morph\\src\\index.ts` with `src/index.ts` returns `false`).
* **Recommended Fix:** 
  Use standard `@nx/devkit`'s `joinPathFragments` or manually normalize paths before passing them to `ts-morph` or conducting comparisons:
  ```typescript
  const normalizedPath = filePath.replace(/\\/g, '/');
  ```

---

## 4. Test Coverage Debt 🧪

### ⚠️ Zero Existing Unit Tests
* **Description:** 
  The project is configured with a test target (`jest`) and has complete spec-related infrastructure files (`jest.config.ts`, `tsconfig.spec.json`), but **no actual spec/test files are present in the project**.
* **Recommended Fix:** 
  Implement comprehensive unit test suites:
  1. **`add-dir.spec.ts`**: Verify `AddDir` correctly adds files using both Angular Schematic and Nx Generator Tree interfaces.
  2. **`apply-ts-morph-project.spec.ts`**: Verify formatting/whitespace and AST manipulations are correctly committed to the virtual tree.
  3. **`ts-morph-transform.spec.ts`**: Verify folder recursion, file filters, and Nest/Angular base-path-based transformations.
  4. **`init-generator.spec.ts`**: Verify peer dependency extraction, scope dependency movement, and init generator cascading.
