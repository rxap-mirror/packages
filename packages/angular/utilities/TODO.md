# TODO: @rxap/ngx-utilities Audit and Recommendations

This document outlines the findings, architectural debt, and recommended improvements identified during the project audit of `packages/angular/utilities`.

---

## 1. Critical Architectural Gotchas

### Asynchronous Injection Context Escape
* **Description:** Inside `ToMethodWithInjectionContext`, the `runInInjectionContext(injector, ...)` call runs synchronously. Any `inject(...)` executed synchronously during the initial call will succeed. However, if the wrapper function `call` is `async` and uses `await`, the execution resumes after the `await` in a new microtask outside the injection context. Any subsequent `inject()` calls will fail at runtime with an error like: `"inject() must be called from an active injection context"`.
* **Impact:** High possibility of hard-to-debug runtime errors when using asynchronous `Method`s with dependency injection.
* **Recommendation:** 
  1. Clearly document this limitation in the README or the function JSDoc.
  2. Educate developers to retrieve/inject all dependencies synchronously at the beginning of the `call` function before any async operations.
  3. Add a development/debug assertion to detect if `inject()` is used in an invalid context, or provide a safer alternate utility for asynchronous context-aware operations if possible.

---

## 2. Architectural Debt

### Unnecessary Async Overhead for Synchronous Functions
* **Description:** `ToMethodWithInjectionContext` always wraps the return value of `call` in a `new Promise()`. If the user-supplied function is completely synchronous, wrapping it in a Promise changes its signature and forces the consumer to handle it asynchronously (introducing microtask queueing overhead).
* **Impact:** Medium. Unnecessary asynchronous overhead and restriction of synchronous capabilities when executing methods inside a template or a synchronous workflow.
* **Recommendation:** Adjust `ToMethodWithInjectionContext` to dynamically return a Promise if `call` returns a Promise (as checked by `isPromise(result)`), or return the synchronous value directly if it is synchronous.
  ```typescript
  export function ToMethodWithInjectionContext<ReturnType = any, Parameter = any, MethodType extends Method<ReturnType, Parameter> = Method<ReturnType, Parameter>>(
    call: ((
      parameters?: Parameter,
      ...args: any[]
    ) => Promise<ReturnType> | ReturnType),
    injector: Injector,
    metadata: any = { id: 'to-method' }
  ): MethodType {
    return {
      call: (parameters, ...args) => {
        if (!injector) {
          throw new Error('The injector is not defined. Can not run the method in the injection context.');
        }
        return runInInjectionContext(injector, () => {
          const result = call(parameters, ...args);
          return result; // Bubbles up Promise or synchronous value naturally
        });
      },
      metadata
    } as MethodType;
  }
  ```

### Inconsistent Injector Validation
* **Description:** 
  - `ToMethodWithInjectionContext` checks if `injector` is defined *inside* the Promise execution block, which means a missing injector returns a rejected Promise.
  - `ToMethodWithInjectionContextFactory` checks if `injector` is defined *synchronously* when the factory is executed, throwing a synchronous Error.
* **Impact:** Low. Minor inconsistency in error-handling conventions across the library's main exports.
* **Recommendation:** Align the validator checks so that both functions throw error synchronously or consistently. Standardizing on synchronous check outside the promise in `ToMethodWithInjectionContext` is cleaner.

---

## 3. Test Coverage

### Absence of Prior Unit Tests
* **Description:** The project had `0` unit tests prior to the audit. The `jest` target reported no tests found.
* **Resolution:** Created a comprehensive test suite in `src/lib/to-method.spec.ts` covering:
  - Synchronous injection context execution and DI token lookup.
  - Asynchronous (Promise-based) resolution within injection context.
  - Error propagation (both synchronous throws and asynchronous promise rejections).
  - Missing injector handling.
  - Custom metadata preservation.
  - Factory pattern behavior.
* **Current Status:** 100% test coverage achieved with 8 test cases passing successfully.
* **Recommendation:** Ensure any future utilities added to the library have accompanying `.spec.ts` test files.

---

## 4. Maintenance and Documentation

### Missing Library JSDoc and Guides
* **Description:** The package has placeholder files `GETSTARTED.md` and `GUIDES.md` which are completely empty. JSDoc annotations on the main exported functions are missing.
* **Impact:** Low-Medium. Reduces library discoverability and makes correct usage (especially around the async DI context gotcha) harder for other developers.
* **Recommendation:** Populate `GETSTARTED.md` with concrete code examples, and document the injection context behavior.
