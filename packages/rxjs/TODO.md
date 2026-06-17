# TODO: @rxap/rxjs Package Audit & Improvements

This file documents the critical bugs, architectural debt, library anti-patterns, and test coverage gaps identified during the June 2026 project audit of the `@rxap/rxjs` library, along with actionable recommended fixes.

---

## 🚨 Critical Bugs & Memory Leaks

### 1. Callback Memory Leak in `ToggleSubject`
*   **File:** [toggle-subject.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/toggle-subject.ts)
*   **Issue:** The class registers standard functions in private arrays (`_onEnabledHandler` and `_onDisabledHandler`) using `registerOnEnabled` / `registerOnDisabled`, but provides **no** mechanism to unregister these handlers.
*   **Impact:** Long-lived `ToggleSubject` instances will leak handler closures of short-lived components/services that register callbacks, preventing those components from being garbage-collected.
*   **Recommended Fix:** Replace the manual callback registry with standard RxJS reactive streams to leverage RxJS's built-in subscription management and teardown:
    ```typescript
    public readonly enabled$ = this.pipe(filter(value => value));
    public readonly disabled$ = this.pipe(filter(value => !value));
    ```

---

## 🏛️ Architectural Debt & Library Anti-Patterns

### 1. Misleading Operator Naming (`throwIfEmpty`)
*   **File:** [throw-if-empty.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/operators/throw-if-empty.ts)
*   **Issue:** This custom operator is named exactly `throwIfEmpty`, which directly collides with the built-in RxJS `throwIfEmpty` operator. In RxJS, `throwIfEmpty` is used to throw an error if the *stream completes without emitting any values*. However, this custom operator checks if an *emitted value is nullish or empty string*.
*   **Impact:** Confuses developers and easily leads to subtle integration/logic bugs.
*   **Recommended Fix:** Rename the custom operator to `throwIfNullishOrEmpty` or `throwIfFalsy` to make its intent and behavior distinct.

### 2. Deprecated RxJS Architecture (`.lift` & Custom Subscribers)
*   **Files:**
    *   `src/lib/operators/has-property.ts`
    *   `src/lib/operators/is-defined.ts`
    *   `src/lib/operators/throw-if-empty.ts`
*   **Issue:** Custom operators are implemented using `.lift()` and manual subclasses of `Subscriber`. While this was standard in older RxJS versions, in modern RxJS (v7/v8) this design is deprecated.
*   **Impact:** Higher runtime overhead (unnecessary class instantiations), deprecation warnings, and compatibility issues with future RxJS upgrades.
*   **Recommended Fix:** Refactor custom operators using the standard `new Observable()` pattern or by leveraging pipeable operators (like `filter` or `map`). For example, `isDefined` can be rewritten as:
    ```typescript
    export function isDefined<T>(): OperatorFunction<T, NonNullable<T>> {
      return filter((value): value is NonNullable<T> => value !== null && value !== undefined);
    }
    ```

### 3. Packaging & Domain Separation Violation (`button.definition.ts`)
*   **File:** [button.definition.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/button.definition.ts)
*   **Issue:** The file contains definitions for UI components (e.g., `ButtonTypes`, `ButtonDefinition` with themes, palettes, tooltips, and icon config dependencies).
*   **Impact:** A foundational library dedicated to reactive utility operators (`@rxap/rxjs`) shouldn't be coupled with UI/Material design primitives.
*   **Recommended Fix:** Relocate UI-specific definitions to a dedicated component or layout library (e.g., `@rxap/components` or `@rxap/material`).

### 4. Dynamic Path & Node Modules Access in Init Generator
*   **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/generators/init/generator.ts)
*   **Issue:** The generator queries paths inside `node_modules` using the virtual `Tree` interface (`tree.exists('node_modules/...')`, `tree.read(...)`), but then loads them dynamically using a physical Node `require()`.
*   **Impact:** `node_modules` is normally gitignored/omitted from the virtual Tree, making tree-based queries unreliable. Mixing virtual `Tree` calls with physical `require()` can break `--dry-run` executions and general workspace hermeticity.
*   **Recommended Fix:** Access installed package schemas and generator scripts using standard node resolution pathways (such as `require.resolve`) instead of tree-based lookups inside `node_modules`.

---

## 🧪 Test Coverage Gaps

*   **Current Status:** Low, but improving. `ToggleSubject`, `CloneObservable`, and `hasProperty` now have specs (added alongside the bug fixes above).
*   **Missing Tests:**
    *   **Operators:** `toBoolean`, `throwIfEmpty`, `isDefined`, `isDeepEqual`, `isEqual`, `log` have no unit tests.
    *   **Subjects/behaviors:** `CounterSubject`, `RequestInProgressSubject` have no unit tests.
    *   **Init Generator:** The `init` generator has no specs.
*   **Action Item:** Create specs for each of the missing operators and subjects to guarantee long-term stability and prevent regression of the bugs identified above.
