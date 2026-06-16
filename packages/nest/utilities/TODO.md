# nest-utilities - Audit & Improvement TODO List

This document lists the findings and recommended actions resulting from a detailed code audit of the `@rxap/nest-utilities` package.

---

## 📊 Summary of Findings

| Category | Status / Count | Description |
| :--- | :--- | :--- |
| **Test Coverage** | 🔴 **0%** | Zero test files (`*.spec.ts`) exist in the package. |
| **Critical Bugs** | 🛑 **3** | Broken sorting/paging and global memory/CSP mutation leak. |
| **Logic & Functional Bugs** | ⚠️ **4** | Unhandled TypeErrors in `ApplyFilter`, Fastify/non-HTTP context crashes, and string coercion for Throttler limits. |
| **Architectural Debt** | ⚙️ **3** | Uninitialized global state for `IsDevMode`, hardcoded bypasses, and aggressive dependency injection of `Logger`. |
| **Anti-Patterns** | 🔍 **2** | `node_modules` file reads via virtualized Tree, and plain-object `validateSync` validation. |

---

## 🚀 1. Critical Bugs & Functional Fixes

### 🔴 Broken Sorting & Parameter Swapping in `ApplyPaging`
- **Location:** `src/lib/apply-paging.ts` & `src/lib/apply-sort.ts`
- **Issue:** In `ApplyPaging`, the parameters are swapped when calling `ApplySort`:
  - `ApplyPaging` call: `let rows = ApplySort(data, sortBy, sortDirection);`
  - `ApplySort` signature: `ApplySort<T>(rows: T[], sortDirection?: string, sortBy?: string)`
  - Consequently, `ApplySort` tries to sort by `'asc'` or `'desc'` as the property name, and treats the field name (e.g., `'name'`) as the sort direction. Sorting is completely broken inside paginated results.
- **Recommended Fix:** Correct the parameter order in the `ApplySort` call in `src/lib/apply-paging.ts`:
  ```typescript
  let rows = ApplySort(data, sortDirection, sortBy);
  ```

### 🔴 Memory Mutation & Side-Effect Leak in CSP Builder
- **Location:** `src/lib/content-security-policy.ts` (line 80)
- **Issue:** `buildContentSecurityPolicy` sets `csp = CSP_DEFAULTS` as the parameter default value. Since JavaScript objects are passed by reference, any modification to `csp` (like `csp['img-src'].push(...)` or `csp['connect-src'].push(...)`) directly mutates the global `CSP_DEFAULTS` constant. Subsequent calls will accumulate configurations from previous calls, creating a memory mutation leak and potential security/tenant isolation risks.
- **Recommended Fix:** Avoid direct mutation of default config. Use structured or shallow cloning before modifying:
  ```typescript
  export function buildContentSecurityPolicy({ 
    reportUri, 
    auth0IssueUrl, 
    minioEndPoint, 
    csp 
  }: ContentSecurityPolicyOptions = {}) {
    const activeCsp = csp ? { ...csp } : JSON.parse(JSON.stringify(CSP_DEFAULTS));
    // Perform mutations on `activeCsp` instead of `csp`
  ```

---

## 🛠️ 2. Logic & Robustness Issues

### ⚠️ Unhandled `TypeError` in `ApplyFilter`
- **Location:** `src/lib/apply-filter.ts`
- **Issue:** If a filter query item lacks a delimiter in `FilterQueryPipe`, the `filter` property is `undefined`. When `ApplyFilter` calls `query.filter.toLowerCase()`, it throws `TypeError: Cannot read properties of undefined`.
- **Issue 2:** If a column value is null, undefined, or missing index signature, `ApplyFilter` returns `true`, allowing the row to bypass all column filtering instead of being excluded.
- **Recommended Fix:** Add optional chaining/safeguards, and return `false` on missing column values when a filter is specified:
  ```typescript
  const filterVal = query.filter?.toLowerCase() ?? '';
  // exclude row if element is null/undefined but filter is set
  ```

### ⚠️ Fastify & Non-HTTP Context Compatibility Crashes
- **Location:** `src/lib/accept-language.decorator.ts`, `src/lib/host.decorator.ts`, `src/lib/http-exception-filter.ts`, and `src/lib/validator.interceptor.ts`
- **Issue:** All request extraction calls assume an Express request environment (e.g. `request.acceptsLanguages()`, `request.host`, `request.method`, `request.path`). 
  - If used with **Fastify**, these will crash (`host` is `.hostname` in Fastify; `.acceptsLanguages()` doesn't exist by default).
  - If used in **Microservices**, **GraphQL**, or **WebSockets** contexts, `switchToHttp().getRequest()` is undefined or not standard, leading to crash.
- **Recommended Fix:** Add guards and check context type before calling HTTP-specific getters/methods:
  ```typescript
  if (ctx.getType() !== 'http') return;
  ```

### ⚠️ Aggressive `ConfigService.getOrThrow` Calls
- **Location:** `src/lib/throttler-module-options-loader.ts`
- **Issue:** Calls `this.config.getOrThrow('THROTTLER_TTL')` and `THROTTLER_LIMIT`. If they are not specified in the environment config, the application will crash during bootstrap, creating friction for local development and unit tests.
- **Recommended Fix:** Provide sensible fallback defaults instead of using `getOrThrow`, or handle missing keys gracefully:
  ```typescript
  ttl: this.config.get<number>('THROTTLER_TTL', 60),
  limit: this.config.get<number>('THROTTLER_LIMIT', 10),
  ```

### ⚠️ Coerced String Types in `defaultValidationSchema`
- **Location:** `src/lib/default-validation-schema.ts` (lines 22-23)
- **Issue:** `THROTTLER_LIMIT` and `THROTTLER_TTL` are defined as `Joi.string().default(throttlerLimit)`. This coerces numerical TTL and limit settings into string values (e.g. `'10'`), which are subsequently passed as strings to the throttler options, whereas `@nestjs/throttler` expects `number` types.
- **Recommended Fix:** Use `Joi.number()` for numeric properties:
  ```typescript
  schema['THROTTLER_LIMIT'] = Joi.number().default(throttlerLimit);
  schema['THROTTLER_TTL'] = Joi.number().default(throttlerTTL);
  ```

### ⚠️ Unsafe Decoding in `DecodeURIComponentPipe`
- **Location:** `src/lib/pipe/decodeURIComponent.pipe.ts`
- **Issue:** Directly calls `decodeURIComponent(value)` on any incoming value. If `value` is undefined, null, or an object containing specific character sequences, it coerces to a string (like `"undefined"`) or throws a malformed URI error.
- **Recommended Fix:** Ensure value is a string and check if it is defined:
  ```typescript
  if (typeof value !== 'string') return value;
  ```

---

## 🏛️ 3. Architectural Debt & Coupling

### ⚙️ Fragile Global State Mutation for `IsDevMode`
- **Location:** `src/lib/is-dev-mode.ts`
- **Issue:** `IsDevMode()` checks `RXAP_GLOBAL_STATE.environment`. This variable is never populated inside `nest-utilities` itself; instead, it relies on external packages like `@rxap/nest-server` or `@rxap/nest-open-api` to mutate this variable. If a consumer uses this package without those companion packages, `IsDevMode` silently fails or returns `null` permanently.
- **Recommended Fix:** Provide standard dependency injection or environment resolution (e.g., standard Node `process.env.NODE_ENV` fallback) instead of hard coupling through global variable mutation.

### ⚙️ Inflexible / Hardcoded Controller Bypasses
- **Location:** `src/lib/validator.interceptor.ts` & `src/lib/logging.interceptor.ts`
- **Issue:** Hardcoded class name checks:
  ```typescript
  if (classType.name === 'HealthController' || classType.name === 'AppController') {
    return next.handle();
  }
  ```
  This is a major architectural debt. It tightly couples the utility package to specific class names, which makes it non-reusable.
- **Recommended Fix:** Use custom decorators or metadata keys (e.g. `@Public()` or `@BypassInterceptor()`) to skip interceptor logic instead of hardcoding class names.

### ⚙️ Fragile Dependency Injection of `Logger`
- **Location:** `src/lib/http-exception-filter.ts`, `src/lib/validator.interceptor.ts`, `src/lib/logging.interceptor.ts`
- **Issue:** `@Inject(Logger) private readonly logger: Logger` will fail Nest's DI resolution at bootstrap unless the consumer has explicitly registered a `Logger` provider under that exact token. 
- **Recommended Fix:** Use standard non-injected instantiation `new Logger(Context)` or make the dependency optional with a fallback, or inject `LOGGER_PROVIDER` token if a custom logging library is expected.

---

## 🔍 4. Tooling & Anti-Patterns

### ⚡ Reading `node_modules` via Virtualized Tree in Generator
- **Location:** `src/generators/init/generator.ts` (lines 90–120)
- **Issue:** Using `tree.exists()` and `tree.read()` to inspect package.json and config files inside `node_modules`. Physical packages are typically not indexed in the virtualized workspace tree, and reading them in this manner will fail in certain sandbox/dry-run execution modes.
- **Recommended Fix:** Use native Node file system modules (`fs` or standard `require.resolve()`) for reading physical files inside `node_modules` during generator execution.

### ⚡ Invalid `validateSync` on Plain Response Objects
- **Location:** `src/lib/validator.interceptor.ts`
- **Issue:** `ValidatorInterceptor` passes the response `body` directly to `class-validator`'s `validateSync`. However, `validateSync` only validates class instances decorated with class-validator decorators. Plain objects returned by standard controllers will bypass all validation since they do not have structural class decorator metadata at runtime.
- **Recommended Fix:** Use `plainToInstance` from `class-transformer` to cast the response body to its appropriate class type before running validation.

---

## 📝 5. Inconsistencies & Typographical Issues

### 🔍 Typo in `mimeType-to-file-extanson.ts`
- **Location:** `src/lib/mimeType-to-file-extanson.ts` (Filename and export)
- **Issue:** Typo in filename `"extanson"` instead of `"extension"`. The internal function is correctly named `mimeTypeToFileExtension`.
- **Recommended Fix:** Rename file to `mimeType-to-file-extension.ts` and update the export statement in `src/index.ts`.

### 🔍 Inconsistent Metadata Keys
- **Location:** `src/lib/is-internal.ts` & `src/lib/is-public.ts`
- **Issue:** `IS_INTERNAL_KEY` uses a Symbol, whereas `IS_PUBLIC_KEY` uses a simple string. They should be consistently defined.
