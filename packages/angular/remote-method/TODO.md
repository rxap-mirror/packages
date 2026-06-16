# TODO: @rxap/remote-method Auditing & Refactoring Plan

This file outlines the critical bugs, architectural debt, library anti-patterns, and test coverage improvements identified during the project audit of `@rxap/remote-method`.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Copy-Paste Memory/State Bug in `RemoteMethodTemplateCollectionDirective`
* **File:** [remote-method-template-collection.directive.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/directive/src/lib/remote-method-template-collection.directive.ts#L294-L298)
* **Description:** When the remote method response is no longer empty, the directive attempts to detach and destroy the empty template view. However, it sets `this._errorTemplateViewRef = null` instead of resetting the empty template reference:
  ```typescript
  if (this._emptyTemplateViewRef) {
    this._emptyTemplateViewRef.detach();
    this._emptyTemplateViewRef.destroy();
    this._errorTemplateViewRef = null; // <-- BUG!
  }
  ```
* **Impact:** `this._emptyTemplateViewRef` remains populated with a reference to a destroyed view, leading to potential subsequent runtime crashes or double-detaches.
* **Recommended Fix:** Correct the reassignment:
  ```typescript
  if (this._emptyTemplateViewRef) {
    this._emptyTemplateViewRef.detach();
    this._emptyTemplateViewRef.destroy();
    this._emptyTemplateViewRef = null;
  }
  ```

### 2. Broken Conditional Block in `init` Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/src/generators/init/generator.ts#L45-L51)
* **Description:** The generator checks if a package is a devDependency using a completely broken conditional statement:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
  ```
  Since any non-empty array literal is always truthy, this condition evaluates to true for ANY package name as long as `isDevDependency` is false. It is missing the `.some` array check.
* **Impact:** Packages that are not plugins, workspaces, or schematics will be incorrectly classified and rewritten in the root `package.json` dependencies block.
* **Recommended Fix:** Use `.some()` like in the previous block:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
  ```

### 3. Missing Safeties on Response Types in `RemoteMethodTemplateCollectionDirective`
* **File:** [remote-method-template-collection.directive.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/directive/src/lib/remote-method-template-collection.directive.ts#L250)
* **Description:** The directive directly reads `.length` from the API response:
  ```typescript
  .then(response => {
    this._empty = response.length === 0;
    // ...
  })
  ```
* **Impact:** If the remote method fails, returns a non-array, or returns `null`/`undefined` due to unexpected network payloads, the application will crash with a TypeError.
* **Recommended Fix:** Ensure `response` is valid and is an iterable/array:
  ```typescript
  .then(response => {
    const isArray = Array.isArray(response);
    this._empty = !isArray || response.length === 0;
    this._data = isArray ? response : [];
    this.cdr.detectChanges();
  })
  ```

---

## 🛠️ Design Issues & Library Anti-Patterns

### 1. Physical Path Manipulation & Disk require inside NX Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/src/generators/init/generator.ts)
* **Description:** The generator uses standard Node APIs like `__dirname`, physical `require()`, and raw physical path joins to dynamically load files from the local filesystem and `node_modules` directory:
  ```typescript
  const packageJsonFilePath = relative(tree.root, join(__dirname, '..', '..', '..', 'package.json'));
  // ...
  const initGenerator = require(join('node_modules', ...peer.split('/'), initGeneratorFilePath))?.default;
  ```
* **Impact:** This violates virtual tree isolation principles of Nx and Angular schematics. It breaks virtual runs (dry-runs) and breaks entirely under strict package managers (like pnpm or Yarn PnP) where physical `node_modules` path lookups are invalid or structured differently.
* **Recommended Fix:** Read all package.json files via `tree.read()` if they exist inside the workspace, or use standard Nx utility methods to resolve generator factories in a container-safe manner.

### 2. Hardcoded limits and Falsy Ignores in `ContenteditableDirective`
* **File:** [contenteditable.directive.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/http/directive/src/lib/contenteditable.directive.ts#L48-L54)
* **Description:** The directive limits input saves based on arbitrary checks:
  - `value.length > 3` is hardcoded. It prevents saving short inputs (e.g. `UK`, `ID`, `Yes`, `No`).
  - If the input is cleared (`value` is empty), it is treated as falsy, meaning the cleared state is never synchronized with the backend.
  - `@DebounceCall(1000)` modifies the class prototype and may share debouncing queues/timers across all directive instances on the page instead of debouncing per-element.
* **Recommended Fix:** Convert the input listener to an RxJS stream (`Subject` or modern Angular signals / Reactive forms integration) where the debounce is instance-specific, and allow clearing values or configuration of the minimum length.

### 3. Implicit Click Capturing in `RemoteMethodDirective`
* **File:** [remote-method.directive.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/directive/src/lib/remote-method.directive.ts#L100-L107)
* **Description:** The directive listens to clicks on whatever element it is attached to via `@HostListener('click')`.
* **Impact:** If `rxapRemoteMethod` is placed on a parent container to expose its context via `exportAs="rxapRemoteMethod"`, clicking *anywhere* inside that container will unexpectedly trigger the remote method. There is no flag to disable the automatic click binding.
* **Recommended Fix:** Add a configuration input like `@Input() rxapClickTrigger = true` and check it inside the `onClick()` listener before executing.

---

## 📉 Code Quality, Deprecations & Modernization

### 1. Deprecated `InjectFlags` Usage
* **Files:** 
  - [base.remote-method.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/src/lib/base.remote-method.ts#L112)
  - [remote-method-loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/src/lib/remote-method-loader.ts#L24)
  - [http-remote-method.loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/http/src/lib/http-remote-method.loader.ts#L31)
* **Description:** Uses `InjectFlags.Optional` inside `injector.get()`.
* **Recommended Fix:** Replace with modern options object syntax: `{ optional: true }`.

### 2. Deprecated RxJS `timeout` Signatures
* **File:** [http.remote-method.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/http/src/lib/http.remote-method.ts#L81)
* **Description:** `timeout(this.timeout)` is deprecated in RxJS 7+.
* **Recommended Fix:** Convert to object syntax: `timeout({ each: this.timeout })`.

### 3. Modernize Output Emitters with Angular 19+ Signal APIs
* **Files:** `RemoteMethodDirective` and `RemoteMethodTemplateDirective`.
* **Description:** Replace standard `@Output() x = new EventEmitter()` with modern Angular 19 `output()` APIs or `outputFromObservable()`.

### 4. Typo in Error Messages
* **File:** [base-http.remote-method.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/http/src/lib/base-http.remote-method.ts#L78)
* **Description:** "HttpClinent" instead of "HttpClient".

---

## 🧪 Test Coverage Gap

* **Status:** Extremely Low Test Coverage (only 1 test in the entire project).
* **Missing Tests:**
  - `BaseRemoteMethod`: Lifecycle, execution counts, pause/resume behavior, refresh triggers.
  - `ProxyRemoteMethod`: Parameter mapping and execution routing.
  - `RemoteMethodLoader`: Dynamic loading mechanics.
  - `RemoteMethodTemplateDirective` / `RemoteMethodTemplateCollectionDirective`: Renders, error templates, loading states, list diffs.
  - `HttpRemoteMethod` / `HttpRemoteMethodLoader`: Event routing, parameter translation, response transforming.
  - `ContenteditableDirective`: Debounce logic, saving, ignored inputs.
