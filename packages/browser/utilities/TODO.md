# TODO: browser-utilities Auditing & Refactoring

This document outlines the findings, critical bugs, architectural debt, and testing improvements identified during the audit of the `@rxap/browser-utilities` library.

---

## 🟡 Timing & Architectural Issues

### 1. Peer Dependency Init Generator Execution Race Condition
* **File**: `packages/browser/utilities/src/generators/init/generator.ts` (Lines 83-137)
* **Description**:
  The generator schedules missing peer dependencies for installation via `installPackagesTask(tree)` and then immediately attempts to run their nested `init` generators.
  Since `installPackagesTask` only executes **after** the generator run is fully completed, the newly-added peer dependencies are **not** present in `node_modules` during the generator execution, so their nested init generators cannot be located in the same run.
  *(virtual-tree/physical-path access was fixed 2026-06; the install-ordering problem remains)*
* **Impact**:
  The nested init generators of newly added peer dependencies are never executed during the first run.
* **Recommended Fix**:
  Acknowledge this standard Nx/schematics limitation. Split the generation into two separate steps (e.g., adding to `package.json` vs executing nested generators), or advise users to run the generator twice (once to add and install, and a second time to execute the secondary generators).

### 2. Suboptimal DOM Height Observation
* **File**: `packages/browser/utilities/src/lib/observe-element-height.ts`
* **Description**:
  `ObserveElementHeight` uses a `MutationObserver` on the parent node to detect changes. `MutationObserver` is designed to detect DOM structure changes (child node additions/removals) and attribute mutations. It is highly unreliable for size/height tracking:
  - Text wrapping due to container size changes, image loading, font loading, or CSS media queries will modify element height but do **not** trigger `MutationObserver`.
  - Conversely, arbitrary attribute changes can trigger the observer unnecessarily, causing performance overhead.
* **Impact**:
  The observable might miss genuine height changes or emit excessively.
* **Recommended Fix**:
  Refactor the function to use the standard web `ResizeObserver` API, which is specifically designed to performant-ly observe size changes. Modern browser support is 100% as of current standards.
  ```typescript
  export function ObserveElementHeight(parent: HTMLElement, selector: string) {
    return new Observable<number | null>(subscriber => {
      const el = parent.querySelector(selector);
      if (!el) {
        subscriber.next(null);
        return;
      }
      
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          subscriber.next(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(el);
      
      return () => {
        resizeObserver.disconnect();
      };
    });
  }
  ```

### 3. Missing SSR (Server-Side Rendering) Guards
* **Files**: 
  - `packages/browser/utilities/src/lib/click-on-link.ts`
  - `packages/browser/utilities/src/lib/observe-element-height.ts`
* **Description**:
  Both browser utility functions directly reference global browser APIs (`document`, `document.createElement`, `MutationObserver`).
  If these files are imported or resolved during SSR (Server-Side Rendering) inside Angular or NestJS, they can trigger unhandled reference errors (e.g., `ReferenceError: document is not defined`).
* **Recommended Fix**:
  Add safety checks to ensure global variables are defined before using them:
  ```typescript
  if (typeof document === 'undefined') { ... }
  ```
  Or advise consumers to wrap calls inside Angular `isPlatformBrowser` checks.

---

## 🔵 Test Coverage & Quality Assurance

### 4. Absence of Unit Tests
* **Status**: 🔴 **0% Coverage** (Zero test files found in the project)
* **Description**:
  The project is configured with Jest, but contains no actual spec files to verify the logic of `ClickOnLink`, `ObserveElementHeight`, or the `initGenerator`.
* **Recommended Actions**:
  Create the following unit test suites to ensure robustness:
  - `click-on-link.spec.ts`: Mock `document.createElement` and assert element attribute assignment, body appending, click triggering, and deletion.
  - `observe-element-height.spec.ts`: Verify emissions of element clientHeight by mock triggering `MutationObserver` or `ResizeObserver`.
  - `generator.spec.ts`: Test the `initGenerator` with a mock Nx virtual tree (`createTreeWithEmptyWorkspace`), validating:
    - Proper peer dependencies are identified and added.
    - Correction of the `devDependencies` coercion regular expression logic.
