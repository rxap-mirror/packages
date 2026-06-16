# TODO: nest-jwt Project Audit & Enhancements

This file documents the findings and recommended actions from the project audit of `@rxap/nest-jwt`.

## 🚨 Critical Bugs & Logic Errors

### 1. Unbounded Memory Leak & Stale Data in Singleton Guard Cache
* **Location:** `src/lib/user.guard.ts` (Lines 33, 52-56)
* **Issue:** `UserGuard` is an injectable class (typically registered as a singleton provider). It uses a private member `_userCache = new Map<string, User>()` to cache user objects.
  - **Memory Leak:** Since there is no cache eviction, expiration, or maximum size policy, this map will grow indefinitely in memory with every unique user (`sub`) that makes a request, eventually leading to Out Of Memory (OOM) issues in production.
  - **Stale Context / Security Vulnerability:** Cached user roles and permissions will never be re-fetched. If a user's permissions or profile is updated, they will continue using the stale cached data indefinitely.
* **Fix:** 
  - Since this guard is marked as `@deprecated`, recommend phasing it out completely in favor of standard request-scoped parameter extraction or standard NestJS execution context pattern.
  - If it must be retained, replace the raw `Map` with a short-lived cache (e.g., using `@nestjs/cache-manager` or an LRU cache with an expiration/TTL), or make the guard `Scope.REQUEST` scoped so that the cache is discarded at the end of the request.

---

## 🏛️ Architectural Debt & Library Anti-patterns

### 1. Virtual Tree vs. Physical Path Anti-pattern in Generator
* **Location:** `src/generators/init/generator.ts` (Lines 11-14)
* **Issue:** The generator uses physical path resolution (`__dirname` combined with `path.relative`) inside an Nx virtual `Tree` context:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
  This is an anti-pattern as Nx virtual Trees are abstracted from the physical file system. This will fail or behave unpredictably under dry-runs, tests, or when bundled.
* **Fix:** Resolve the library's workspace root dynamically from the workspace configuration or locate the path using workspace-relative layout helpers (e.g., using `@nx/devkit` workspace context or standard virtual path utilities like `joinPathFragments`).

### 2. Self-Referential Package Imports
* **Locations:**
  - `src/lib/user-id.factory.ts` (Lines 4-7)
  - `src/lib/user.context.ts` (Lines 2-5)
* **Issue:** Both files import functions (`isRequestWithUser`, `isRequestWithUserSub`) using the package's external npm name:
  ```typescript
  import { isRequestWithUser, isRequestWithUserSub } from '@rxap/nest-jwt';
  ```
  This is a self-referential import. It can cause circular compilation dependencies, break local bundling, or resolve to an older version of the package installed in `node_modules` instead of the local source files.
* **Fix:** Use relative imports to reference types/utilities in the same package:
  ```typescript
  import { isRequestWithUser, isRequestWithUserSub } from './types';
  ```

### 3. Non-Standard Logger Injection in Guards
* **Location:** `src/lib/permission.guard.ts` (Line 15)
* **Issue:** Injecting raw `Logger` via dependency injection (`@Inject(Logger)`) expects a custom logger provider to be registered in the NestJS dependency container under the token `Logger`. If the consuming application does not have a global custom logger provider, NestJS will throw a dependency resolution error and fail to start.
* **Fix:** Use the standard NestJS logger instantiation approach instead of dependency injection:
  ```typescript
  private readonly logger = new Logger(PermissionsGuard.name);
  ```

### 4. Direct HTTP Adapter Assumption
* **Location:** `src/lib/jwt.guard.ts` (Line 60)
* **Issue:** The guard assumes an Express request object and calls `request.header(...)`. This will cause a runtime crash with a `TypeError` if this package is used in a NestJS application running with the Fastify adapter (where request headers are accessed via `request.headers` instead).
* **Fix:** Implement robust, adapter-agnostic header retrieval:
  ```typescript
  const headers = request.headers || {};
  const authHeader = request.header ? request.header(this.authHeaderName) : headers[this.authHeaderName.toLowerCase()];
  ```

---

## 🧪 Test Coverage & Quality Assurance

### 1. Complete Lack of Test Coverage
* **Issue:** There are **no unit or integration tests** (`*.spec.ts`) in the entire repository for `@rxap/nest-jwt`. Crucial authentication and authorization features like `JwtGuard`, `PermissionsGuard`, and `userIdFactory` are completely untested, presenting high security and functional risk.
* **Fix:** 
  - Create standard NestJS unit tests in a `src/lib/specs/` or parallel `.spec.ts` files.
  - Implement comprehensive mock-based testing for:
    - `JwtGuard` (testing valid JWT, invalid JWT, missing header, and public route scenarios).
    - `PermissionsGuard` (testing matching and mismatching permission checks).
    - `userIdFactory` (testing both `Request` and `AsyncContext` request sources).
    - `initGenerator` (testing package resolution and correct peer dependencies installations under mock `Tree`).
