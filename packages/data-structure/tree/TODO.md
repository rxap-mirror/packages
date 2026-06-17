# RxAP Tree Data Structure Audit - TODO

This document outlines the findings and recommended actions resulting from a comprehensive audit of the `@rxap/data-structure-tree` package located at `packages/data-structure/tree`.

---

## 1. Architectural Debt & Anti-Patterns

### 1.1 Blindly Overwriting Custom Event Handlers in `setChildren`
- **Location**: `src/lib/node.ts` (`setChildren`)
- **Description**:
  Whenever children are registered/added via `setChildren` or `addChild`, the parent node forcefully overwrites the child node's own event handlers:
  ```typescript
  child.onCollapse = this.onCollapse;
  child.onExpand = this.onExpand;
  ```
  This prevents children from carrying their own custom or node-specific transition logic, breaking modularity and polymorphism.
- **Recommendation**:
  Utilize parent handlers as a fallback, or dispatch events to parent handlers instead of overwriting the child properties directly.
- **Note (2026-06):** Deferred — the current test suite explicitly asserts that
  `addChild` propagates the parent handlers to the child (`child.onCollapse === node.onCollapse`),
  so this change requires first introducing a way to mark a child's own handler
  and updating that contract. Treat as a small refactor, not a quick fix.

### 1.2 Reading `node_modules` via Virtual Tree in Generator
- **Location**: `src/generators/init/generator.ts` (Lines 83–137)
- **Description**:
  The generator queries files inside `node_modules` using the virtual `Tree` abstraction (e.g., `tree.exists('node_modules/...')` and `tree.read('node_modules/...')`).
  In Nx, the virtual `Tree` is intended for workspace files and typically excludes the massive, gitignored `node_modules` directory. Relying on `tree` to access external dependencies will fail in virtualized or dry-run environments.
- **Recommendation**:
  To parse physical dependencies on disk, use standard Node `require.resolve()` or the native `fs` module rather than the virtual `tree`. Keep virtual `tree` operations isolated strictly to workspace source directories.

---

## 2. Test Coverage Gaps

### 2.1 Missing Unit/Integration Tests
- **Location**: `src/lib/node.spec.ts`
- **Status (2026-06):** Improved — specs now cover shallow vs deep traversal
  (`forEachChild` / `forEachDescendant`), the `isHidden`/`isVisible` invariant, and
  recursive/shallow `hide`/`show` propagation.
- **Remaining gaps**:
  - Tree selection (`select`, `deselect`, `toggleSelect`).
  - Style, type, and custom parameters propagation.
  - Expand/collapse callback invocation.
- **Recommendation**:
  Extend the suite to exercise selection states, custom callback invocations, and
  style/type/parameter propagation across parent-child-descendant configurations.
