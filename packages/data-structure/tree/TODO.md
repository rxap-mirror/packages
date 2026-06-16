# RxAP Tree Data Structure Audit - TODO

This document outlines the findings and recommended actions resulting from a comprehensive audit of the `@rxap/data-structure-tree` package located at `packages/data-structure/tree`.

The audit identified critical logic bugs, architectural inconsistencies, performance issues with recursive operations, and Nx generator anti-patterns.

---

## 1. Critical Logic Bugs

### 1.1 Contradictory Node Visibility Logic
- **Location**: `src/lib/node.ts` (Lines 100–112)
- **Description**:
  The logic defining node visibility states (`isHidden` and `isVisible`) contains severe logical contradictions:
  ```typescript
  public get isHidden(): boolean {
    return this.hidden || (
      this.hasChildren && !this.hasVisibleChildren
    );
  }

  public get isVisible(): boolean {
    if (this.hasChildren) {
      return !this.hidden || this.hasVisibleChildren;
    } else {
      return !this.hidden;
    }
  }
  ```
  If a node is not explicitly hidden (`hidden = false`), has children (`hasChildren = true`), but none of those children are visible (`hasVisibleChildren = false`):
  - `isHidden` resolves to `true` (`false || (true && !false)`).
  - `isVisible` resolves to `true` (`!false || false`).
  
  This creates a contradictory state where a node is **simultaneously hidden and visible**, leading to layout anomalies and unstable state tracking.
- **Recommendation**:
  Align `isVisible` and `isHidden` to be mutually exclusive. In most cases, `isVisible` should simply be:
  ```typescript
  public get isVisible(): boolean {
    return !this.isHidden;
  }
  ```

---

## 2. Performance & Functional Bugs in Traversals

### 2.1 Exponential Recursive Calls in `hide` and `show` (O(N²) Complexity)
- **Location**: `src/lib/node.ts` (Lines 283–328)
- **Description**:
  The helper `forEachChild(fn)` actually performs a **full-depth recursive traversal** of all descendants:
  ```typescript
  public forEachChild(fn: (child: Node<T>) => void) {
    for (const child of this.children) {
      fn(child);
      child.forEachChild(fn);
    }
  }
  ```
  When `hide` or `show` is triggered with `forEachChildren: true`, it calls `this.forEachChild(...)` and passes a callback that recursively invokes `child.hide(...)` with the same options.
  Because both `forEachChild` and `hide` recurse down the tree, the same child nodes are traversed multiple times. For a deep tree, this produces O(N²) execution complexity or worse, risking call stack overflows and application freezes.
- **Recommendation**:
  Rename `forEachChild` to `forEachDescendant` to accurately reflect its deep traversal behavior. Provide a separate, shallow `forEachChild` for direct children.

### 2.2 Functional Bug: `forEachChild` Option Propagates Deeply
- **Location**: `src/lib/node.ts` (Lines 285–291)
- **Description**:
  If a user requests `hide({ forEachChild: true })` (intended to only hide direct children of the node), the code triggers `this.forEachChild(...)`.
  Since `forEachChild` traverses the entire subtree, this incorrectly hides **all** descendants instead of only direct children.
- **Recommendation**:
  For shallow propagation, apply changes to `this.children` directly rather than invoking deep traversal callbacks:
  ```typescript
  public hide(options: ShowHideOptions = {}) {
    this.hidden = true;
    if (!options.onlySelf) {
      if (options.forEachChild) {
        this.children.forEach(child => child.hide({ onlySelf: true }));
      } else if (options.forEachChildren) {
        this.forEachDescendant(child => child.hide({ onlySelf: true }));
      }
      if (options.parent) {
        this.parent?.hide({ onlySelf: true });
      } else if (options.parents) {
        this.parent?.hide({ parents: true });
      }
    }
  }
  ```

---

## 3. Architectural Debt & Anti-Patterns

### 3.1 Blindly Overwriting Custom Event Handlers in `setChildren`
- **Location**: `src/lib/node.ts` (Lines 214–225)
- **Description**:
  Whenever children are registered/added via `setChildren` or `addChild`, the parent node forcefully overwrites the child node's own event handlers:
  ```typescript
  child.onCollapse = this.onCollapse;
  child.onExpand = this.onExpand;
  ```
  This prevents children from carrying their own custom or node-specific transition logic, breaking modularity and polymorhpism.
- **Recommendation**:
  Utilize parent handlers as a fallback, or dispatch events to parent handlers instead of overwriting the child properties directly.

### 3.2 Reading `node_modules` via Virtual Tree in Generator
- **Location**: `src/generators/init/generator.ts` (Lines 83–137)
- **Description**:
  The generator queries files inside `node_modules` using the virtual `Tree` abstraction (e.g., `tree.exists('node_modules/...')` and `tree.read('node_modules/...')`).
  In Nx, the virtual `Tree` is intended for workspace files and typically excludes the massive, gitignored `node_modules` directory. Relying on `tree` to access external dependencies will fail in virtualized or dry-run environments.
- **Recommendation**:
  To parse physical dependencies on disk, use standard Node `require.resolve()` or the native `fs` module rather than the virtual `tree`. Keep virtual `tree` operations isolated strictly to workspace source directories.

---

## 4. Test Coverage Gaps

### 4.1 Missing Unit/Integration Tests
- **Location**: `src/lib/node.spec.ts`
- **Description**:
  The existing test suite only checks basic tree instantiation and single-node appending (2 total tests). Entire critical capabilities remain completely untested:
  - Recursive and shallow hide/show operations.
  - Event options and visibility state contradictions.
  - Tree selection (`select`, `deselect`, `toggleSelect`).
  - Style, type, and custom parameters propagation.
- **Recommendation**:
  Create dedicated test suites to exercise:
  - Recursive state propagation of `hide` / `show` flags.
  - Selection states and custom callback invocations.
  - Asserting visibility outcomes for complex parent-child-descendant configurations.
