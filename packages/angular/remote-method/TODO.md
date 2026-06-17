# TODO: @rxap/remote-method Auditing & Refactoring Plan

This file outlines the critical bugs, architectural debt, library anti-patterns, and test coverage improvements identified during the project audit of `@rxap/remote-method`.

---

## 🛠️ Design Issues & Library Anti-Patterns

### 1. Hardcoded limits and Falsy Ignores in `ContenteditableDirective`
* **File:** [contenteditable.directive.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/remote-method/http/directive/src/lib/contenteditable.directive.ts#L48-L54)
* **Description:** The directive limits input saves based on arbitrary checks:
  - `value.length > 3` is hardcoded. It prevents saving short inputs (e.g. `UK`, `ID`, `Yes`, `No`).
  - If the input is cleared (`value` is empty), it is treated as falsy, meaning the cleared state is never synchronized with the backend.
  - `@DebounceCall(1000)` modifies the class prototype and may share debouncing queues/timers across all directive instances on the page instead of debouncing per-element.
* **Recommended Fix:** Convert the input listener to an RxJS stream (`Subject` or modern Angular signals / Reactive forms integration) where the debounce is instance-specific, and allow clearing values or configuration of the minimum length.

### 2. Implicit Click Capturing in `RemoteMethodDirective`
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
