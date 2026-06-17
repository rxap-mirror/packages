# TODO - nest-open-api Audit Results & Recommended Fixes

An audit of `@rxap/nest-open-api` has identified several critical logic bugs, architectural issues, and library anti-patterns. Below is the list of identified issues, categorized by severity, along with actionable instructions for fixing them.

---

## 🔴 Critical Bugs

### 1. NestJS Dependency Injection Token Overwrite in `open-api.module.ts`
* **File:** [open-api.module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/open-api/src/lib/open-api.module.ts#L79-L101)
* **Description:**
  In `updateProviders()`, the token `OPEN_API_UPSTREAM_INTERCEPTOR` is pushed to the `providers` array twice:
  1. Once with `Scope.REQUEST` and dependency on `DefaultUpstreamInterceptor`:
     ```typescript
     module.providers.push({
       provide: OPEN_API_UPSTREAM_INTERCEPTOR,
       useFactory: OpenApiUpstreamInterceptorFactory,
       scope: Scope.REQUEST,
       inject: [ MODULE_OPTIONS_TOKEN, DefaultUpstreamInterceptor, ...interceptors ],
     });
     ```
  2. Pushed again as a singleton scope provider (without `DefaultUpstreamInterceptor`).

  In NestJS, standard provider registration overrides duplicate keys; it does not merge them. The second registration **completely overrides** the first.
* **Impact:**
  The request-scoped interceptor config (which enables `DefaultUpstreamInterceptor` to automatically forward JWT authorization headers) is **never used**. This breaks the automatic authentication header propagation.
* **Recommended Fix:**
  Conditionally register the provider based on requirements, or use different tokens for request-scoped vs. singleton interceptors.
* **Note (2026-06):** Deferred — needs a design decision on the scope strategy
  (distinct tokens vs. conditional registration vs. a unified request-aware provider).

---

## 🟡 Architectural Debt & Library Anti-Patterns

### 2. Ineffective Class Validation on Plain Objects in `ValidatorInterceptor`
* **File:** [validator.interceptor.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/open-api/src/lib/validator.interceptor.ts)
* **Description:**
  `ValidatorInterceptor` runs `validateSync` (from `class-validator`) on response bodies. `validateSync` only validates real class instances with class-validator metadata; NestJS controllers usually return plain objects, so it is a no-op providing a false sense of security.
* **Recommended Fix:**
  Transform plain response objects to class instances via `class-transformer`'s `plainToInstance` (using the controller handler's return DTO metadata), or restrict validation to known DTO instances.

---

## 🟢 Code Quality & Test Coverage

### 3. Low Test Coverage
* **Description:**
  There is only one test suite (`open-api-module-options-loader.spec.ts`) with a single test case.
* **Recommended Fix:**
  Write unit tests for:
  - `LoggingInterceptor` and `ValidatorInterceptor` verifying context guards and validation behaviour.
  - `OpenApiOperationCommand` verifying header and parameter construction.
  - `OpenApiModule` verifying correct registration and scopes of providers.

---

## Resolved (2026-06)
- Fixed the request-id log line in `open-api-operation.command.ts` (single-quote literal with an
  undefined `id` → backtick template using `requestId`).
- Added `context.getType() !== 'http'` guards to `LoggingInterceptor` and `ValidatorInterceptor`
  so they no longer crash in WS/RPC/GraphQL contexts.
- Replaced the `axios/index` import with `axios` in `open-api-operation-command-exception.ts`.
