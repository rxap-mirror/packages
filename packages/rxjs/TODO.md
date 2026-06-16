# TODO: @rxap/rxjs Package Audit & Improvements

This file documents the critical bugs, architectural debt, library anti-patterns, and test coverage gaps identified during the June 2026 project audit of the `@rxap/rxjs` library, along with actionable recommended fixes.

---

## 🚨 Critical Bugs & Memory Leaks

### 1. Silent Memory/Resource Leak in `CloneObservable`
*   **File:** [clone-observable.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/clone-observable.ts)
*   **Issue:** The inner subscription to the source observable is never returned or disposed of in the Observable constructor.
    ```typescript
    export function CloneObservable<T>(observable: Observable<T>): Observable<T> {
      return new Observable(observer => {
        observable.subscribe({ // <-- This subscription is leaked!
          next: value => observer.next(value),
          error: err => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    }
    ```
*   **Impact:** When the cloned observable is unsubscribed, the source stream subscription remains active in memory indefinitely (or until the source stream completes). For infinite or hot streams (such as event streams or subjects), this causes a severe memory/resource leak.
*   **Recommended Fix:** Return the subscription instance directly to handle automatic teardown on unsubscription, or simplify using standard RxJS patterns:
    ```typescript
    export function CloneObservable<T>(observable: Observable<T>): Observable<T> {
      return new Observable<T>(observer => observable.subscribe(observer));
    }
    ```

### 2. Logic Inversion in `ToggleSubject` (`alwaysEmit` Condition)
*   **File:** [toggle-subject.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/toggle-subject.ts)
*   **Issue:** The conditional statements in both `enable()` and `disable()` methods invert the meaning of the `alwaysEmit` parameter:
    ```typescript
    public enable(alwaysEmit = false): void {
      if (!alwaysEmit || !this.value) { // <-- Inverted!
        this.next(true);
      }
    }
    ```
    If `alwaysEmit` is `false` (the default), `!alwaysEmit` is `true`, causing it to emit `true` even if the current value is already `true`. If `alwaysEmit` is `true`, `!alwaysEmit` is `false`, so it only emits when `!this.value` is true (only on change).
*   **Impact:** The parameter behaves exactly opposite to its name and documentation, leading to unexpected behavior in downstream consumers.
*   **Recommended Fix:** Remove the logical negation of `alwaysEmit`:
    ```typescript
    public enable(alwaysEmit = false): void {
      if (alwaysEmit || !this.value) {
        this.next(true);
      }
    }

    public disable(alwaysEmit = false): void {
      if (alwaysEmit || this.value) {
        this.next(false);
      }
    }
    ```

### 3. Callback Memory Leak in `ToggleSubject`
*   **File:** [toggle-subject.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/toggle-subject.ts)
*   **Issue:** The class registers standard functions in private arrays (`_onEnabledHandler` and `_onDisabledHandler`) using `registerOnEnabled` / `registerOnDisabled`, but provides **no** mechanism to unregister these handlers.
*   **Impact:** Long-lived `ToggleSubject` instances will leak handler closures of short-lived components/services that register callbacks, preventing those components from being garbage-collected.
*   **Recommended Fix:** Replace the manual callback registry with standard RxJS reactive streams to leverage RxJS's built-in subscription management and teardown:
    ```typescript
    public readonly enabled$ = this.pipe(filter(value => value));
    public readonly disabled$ = this.pipe(filter(value => !value));
    ```

### 4. Logic Bug in `init` Generator (`package.json` Redirection)
*   **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/generators/init/generator.ts)
*   **Issue:** The check on lines 45-51 does not actually test the regex array:
    ```typescript
    if (
      !isDevDependency && [
        /^@rxap\/plugin/,
        /^@rxap\/workspace/,
        /@rxap\/schematic/,
      ]
    )
    ```
    In JavaScript, an array literal `[...]` is always truthy. Therefore, the `if` block is entered every time `isDevDependency` is false, regardless of the package name.
*   **Impact:** Regular packages will be incorrectly categorized and moved to `devDependencies` inside `package.json`.
*   **Recommended Fix:** Correctly chain with `.some()` to validate the package name:
    ```typescript
    if (
      !isDevDependency &&
      [
        /^@rxap\/plugin/,
        /^@rxap\/workspace/,
        /@rxap\/schematic/,
      ].some(rx => rx.test(packageName))
    )
    ```

### 5. Potential Crash on Null-prototype Objects in `hasProperty`
*   **File:** [has-property.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/rxjs/src/lib/operators/has-property.ts)
*   **Issue:** The check uses direct property accessor call `value.hasOwnProperty(this.propertyKey)`.
*   **Impact:** If the stream emits objects created via `Object.create(null)` or objects without `Object.prototype` in their chain, the operator will crash with a `TypeError: value.hasOwnProperty is not a function`.
*   **Recommended Fix:** Safely query the prototype:
    ```typescript
    Object.prototype.hasOwnProperty.call(value, this.propertyKey)
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

*   **Current Status:** Low. Currently, only 2 files (`is-teardown-logic.spec.ts` and `subscription-handler.spec.ts`) are tested.
*   **Missing Tests:**
    *   **100% of operators:** `toBoolean`, `throwIfEmpty`, `isDefined`, `isDeepEqual`, `isEqual`, `log`, `hasProperty` have no unit tests.
    *   **100% of subjects/behaviors:** `ToggleSubject`, `CounterSubject`, `RequestInProgressSubject` have no unit tests.
    *   **Clone Utilities:** `CloneObservable` has no unit tests (which would have easily caught the memory leak!).
    *   **Init Generator:** The `init` generator has no specs.
*   **Action Item:** Create specs for each of the missing operators and subjects to guarantee long-term stability and prevent regression of the bugs identified above.
