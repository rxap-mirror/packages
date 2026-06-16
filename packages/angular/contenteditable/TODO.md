# TODO: angular-contenteditable

Detailed list of findings from the project audit of `angular-contenteditable`.

## Critical Bugs

### 1. Broken Conditional Logic in Init Generator
- **Location:** `src/generators/init/generator.ts` (Lines 45-51)
- **Problem:**
  The check for package types in the init generator is syntactically/logically broken:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  The array of regular expressions is evaluated as a truthy object. The array `.some(...)` check is completely missing. As a result, the statement simplifies to `if (!isDevDependency)`, meaning *any* package that is not currently in `devDependencies` will be forced to move to `devDependencies` regardless of whether its name matches any pattern.
- **Impact:** Calling the `init` generator on `@rxap/contenteditable` will incorrectly move it from `dependencies` to `devDependencies` in the root `package.json`, which breaks deployment behavior.
- **Recommended Fix:** Change to:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  )
  ```

### 2. Resource Leak / Dangling Timeout in Contenteditable Directive
- **Location:** `src/lib/contenteditable.directive.ts`
- **Problem:**
  The directive uses `@DebounceCall(1000)` on the `onInput` handler. This custom decorator sets up a `setTimeout` on the instance to debounce input events. However, there is no cleanup mechanism (no `ngOnDestroy` implementation) to clear the timeout when the directive is destroyed.
- **Impact:**
  - If a user types and then navigates away or destroys the element within 1 second, the pending `setTimeout` remains active in the JS runtime.
  - The timeout closure holds onto `this` (the directive instance), preventing garbage collection and causing a **memory/resource leak**.
  - When the timeout finally fires, it might try to call methods on a destroyed directive, leading to unexpected errors or behavior.
- **Recommended Fix:**
  - Implement `OnDestroy` in `ContenteditableDirective`.
  - In `ngOnDestroy()`, clear the pending timeout. Since `DebounceCall` stores the timeout ID on the instance using `__timeout__onInput`, we should clean it up:
    ```typescript
    ngOnDestroy() {
      if (Reflect.has(this, '__timeout__onInput')) {
        clearTimeout(Reflect.get(this, '__timeout__onInput'));
      }
    }
    ```
    Alternatively, rewrite the debounce using standard RXJS operators (`Subject`, `debounceTime`, `takeUntil`) which are much safer and idiomatic in Angular.

---

## Architectural Debt & Design Pattern Issues

### 3. Opinionated and Hardcoded `stopPropagation`
- **Location:** `src/lib/contenteditable.directive.ts` (Lines 45-48)
- **Problem:**
  The directive automatically intercepts `click` events and calls `$event.stopPropagation()`:
  ```typescript
  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }
  ```
- **Impact:**
  This side-effect is highly opinionated, undocumented, and hardcoded. It breaks bubbling of click events for any parent elements (e.g. if the editor is inside a click-to-select list, or if a global click handler expects to close dropdowns when clicking outside, or for analytics tracking).
- **Recommended Fix:**
  - Remove this hardcoded listener or make it configurable via an `@Input` flag (e.g., `stopClickPropagation: boolean = false`).

### 4. Reading Physical Files / Anti-pattern in Generator
- **Location:** `src/generators/init/generator.ts`
- **Problem:**
  - The generator reads files from `node_modules` paths using `tree.exists(...)` and `tree.read(...)`. The virtual `Tree` in Nx does not typically track files in `node_modules` or physical folders outside the workspace directory structure. While it might fall back to the physical disk, this is considered a generator anti-pattern.
  - Using `require(...)` with dynamic paths inside generators can bypass package import resolution and fail under certain monorepo executors (e.g., Yarn PnP).
- **Recommended Fix:**
  - Access `node_modules` using standard Node.js `fs` module, or use `require.resolve()` to determine file locations rather than hardcoding `join('node_modules', ...packageName.split('/'))`.

---

## Test Coverage

### 5. Zero Test Coverage
- **Location:** Whole project
- **Problem:**
  The project contains a `test-setup.ts` and Jest config, but has **no test files at all** (`*.spec.ts`).
- **Impact:**
  There is no automated verification that the directive behaves correctly, debounces appropriately, emits change events, handles disabled states, or interacts properly with `Method`.
- **Recommended Fix:**
  - Create `src/lib/contenteditable.directive.spec.ts` and write standard Angular component testing harness tests:
    - Test that an element with `rxapContenteditable` is editable.
    - Test that input triggers change event with debounce.
    - Test that input executes the bound `Method`.
    - Test that the disabled input toggles `contenteditable` attribute.
    - Test that `ngOnDestroy` cleans up pending timeouts.

---

## Documentation

### 6. Missing Guides and Getting Started Content
- **Location:** `GUIDES.md`, `GETSTARTED.md`
- **Problem:**
  These files are completely empty.
- **Recommended Fix:**
  - Populate `GETSTARTED.md` with a basic usage guide (e.g., importing `ContenteditableDirective`, template usage, and binding methods/changes).
  - Populate `GUIDES.md` with advanced use-cases (e.g., handling debounced saves, custom styling for contenteditable elements, integration with other RxAP packages).
