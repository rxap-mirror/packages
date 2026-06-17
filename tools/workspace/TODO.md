# TODO: Workspace Project Audit & Refactoring Plan

This document outlines the findings and recommended actions resulting from a comprehensive project audit of the `'workspace'` project (including the root monorepo utilities, Cypress extensions, OpenAPI generator tools, TS-Morph utilities, and workspace toolchains).

---

## 1. Architectural Debt & Anti-Patterns

### ⚠️ Heavy AST Parsing Performance Bottleneck
- **Location:** `packages/workspace/ts-morph/src/lib/apply-ts-morph-project.ts` (Lines 117–122)
- **Problem:**
  To check if the existing content differs from the newly generated source file content, the code instantiates a completely new, temporary ts-morph project object (`tmpProject`) and parses the entire current file contents into AST nodes just to do a recursive leaf-node comparison (`areSame(sourceFile, tmpProject.createSourceFile(...))`).
  This is extremely heavy and significantly slows down code-generation schematics in large monorepos. Furthermore, AST token matching ignores comments by default, meaning changes in comments may not be written to disk.
- **Recommended Fix:**
  Replace the AST leaf-node parser check with a formatted string comparison or prettier-diff comparison:
  ```typescript
  const currentContent = treeAdapter.read(filePath, 'utf-8')!;
  const newContent = await getFormatedFullText(sourceFile, filePath, prettier);
  if (currentContent.trim() !== newContent.trim()) {
    treeAdapter.overwrite(filePath, newContent);
  }
  ```

---

### ⚠️ Persistent Project Cache Invalidation
- **Location:** `packages/workspace/utilities/src/lib/get-project.ts` (Lines 35–41)
- **Problem:**
  Global project caches (`PROJECT_NAME_TO_PROJECT_LOCATION_CACHE`, etc.) are built on first demand and never cleared or updated. If a generator adds, renames, or deletes files/projects during execution, the cache becomes stale, leading to incorrect file-writes or missing references in long-running composed tasks.
- **Recommended Fix:**
  Implement a simple invalidation pattern or clear the caches upon virtual tree writes.

---

### ⚠️ Typo in Filename and Export
- **Location:** `packages/workspace/open-api/src/lib/utilities/get-reqeust-body.ts`
- **Problem:**
  The file and export path are misspelled as `get-reqeust-body` (notice the "eu" transposition in `reqeust`).
- **Recommended Fix:**
  Rename the file to `get-request-body.ts` and update the export in `packages/workspace/open-api/src/index.ts` to maintain consistent spelling.

---

### ⚠️ Documentation Mismatch
- **Location:** `packages/workspace/utilities/src/lib/is-project.ts` (Line 138)
- **Problem:**
  The JSDoc for `IsWorkspaceProject` states: *"True if the 'workspace' tag is found in the project's tags, otherwise false."*. However, the code actually checks if the `project.root` is empty, `/`, or `.`.
- **Recommended Fix:**
  Update the documentation to match the actual, root-based implementation.

---

## 2. Test Coverage & Configurations

- **Explicit test configurations:**
  The workspace project files do not define explicit `test` targets in their respective `project.json` files. Even though the Nx Jest plugin can infer them dynamically from `jest.config.ts`, declaring explicit `test` targets allows fine-grained controls, customized inputs/outputs, and better CI optimization.
- **Unused Jest configuration:**
  `tools/workspace` contains a `jest.config.ts` and `tsconfig.spec.json` but has 0 spec files. We should write unit tests for the README generator or remove the redundant test configurations to avoid empty test runners.

---

## Resolved (2026-06)
- `AddPackageJsonDependency` cleanup logic crash (stale `const` flags + `FATIAL` typo) — fixed in `workspace-utilities`.
- `ForEachProject` project duplication (missing `return`) — fixed in `workspace-utilities`.
- Schematic `isFile` returning true for non-existent files — fixed in `workspace-utilities`.
- The README executor no longer imports `readFile` from `@nx/plugin/testing`; it uses `fs.readFileSync`.
