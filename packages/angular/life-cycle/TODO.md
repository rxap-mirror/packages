# TODO: Angular Life Cycle Library Audit & Refactoring Plan

This document outlines the findings from an audit of the `@rxap/life-cycle` project (`packages/angular/life-cycle`). It details critical logic bugs, architectural technical debt, development tool anti-patterns, and suggestions for improving overall stability and test coverage.

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Shared Static State Leakage (Potential Memory / Isolation Leaks)
In `LifeCycleService` (`src/lib/life-cycle.service.ts`), the lifecycle hooks map is defined as `private static`:

```typescript
private static hooks = new Map<string, LifeCycleHook>();
```

* **Issue**: Static properties persist on the class definition and survive across instantiations of the service.
  - In a testing environment where the service is re-created in `beforeEach` for different tests, the static map `hooks` is **not** cleared.
  - In server-side rendering (SSR) environments or micro-frontend configurations where multiple platforms or injector trees might be created/destroyed, static state leaks from one application/request context to another.
* **Fix**: Shift the `hooks` Map to be an instance property instead of a static property, unless there is an explicit, documented reason for cross-platform/cross-instance sharing. If static sharing is absolutely required, provide a static `reset()` helper and call it in `beforeEach()` test setup blocks.

### 2. Deprecated Class-Based Route Guard
`IsAppReadyGuard` is defined as a class-based route guard implementing the `canActivate` method:

```typescript
@Injectable({
  providedIn: 'root',
})
export class IsAppReadyGuard { ... }
```

* **Issue**: Since Angular 14+, class-based route guards are deprecated in favor of modern **functional guards** using `inject()`.
* **Fix**: Add and export a functional guard wrapper in `src/lib/is-app-ready.guard.ts` (and expose it in `index.ts`):
  ```typescript
  import { inject } from '@angular/core';
  import { CanActivateFn } from '@angular/router';
  import { LifeCycleService } from './life-cycle.service';

  export const isAppReadyGuard: CanActivateFn = (route, state) => {
    console.debug('[isAppReadyGuard] checking app stability', state.url);
    return inject(LifeCycleService).whenReady(() => true);
  };
  ```

---

## 🧪 Test Coverage & Quality Assurance

### 1. Missing Tooling / Generator Tests
* **Problem**: There are zero tests written for the `init` generator (`src/generators/init`).
* **Impact**: Critical bugs (like the regex array truthiness issue) are easily introduced and missed because the linter parses the syntax correctly and there are no unit tests verifying generator output.
* **Action**: Create a `generator.spec.ts` under `src/generators/init/` to verify that peer dependencies are correctly resolved, sorted, and coerced into the appropriate `package.json` sections (dependencies vs. devDependencies) under different conditions.

### 2. Strengthen Service Integration Tests
* **Current Coverage**: The unit tests in `life-cycle.service.spec.ts` are high-quality and verify basic `whenReady` behavior with several subscription models.
* **Improvement**: Expand the unit tests to explicitly verify behavior when:
  - Multiple different hooks are added to the service.
  - `whenReady` is called with functions that throw errors.
  - Ensure static hooks map isolation tests are executed (or test instance boundaries).
