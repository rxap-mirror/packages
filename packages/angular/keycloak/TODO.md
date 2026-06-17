# TODO: Angular Keycloak Audit & Improvement Plan

This document outlines the findings and proposed improvements identified during the project audit of the `angular-keycloak` library package (`@rxap/keycloak`).

---

## 1. Critical Bugs

### 1.1. `KeycloakAuthGuard`: Stale/Undefined Roles during Access Validation
- **Location:** `src/lib/services/keycloak-auth-guard.ts` (Lines 54-61)
- **Problem:**
  The class-level property `this.roles` is only assigned **after** calling `await this.isAccessAllowed(route, state)`:
  ```typescript
  const result = await this.isAccessAllowed(route, state);
  if (result) {
    this.roles = this.keycloakAngular.getUserRoles(true);
  }
  ```
  However, the official JSDoc/documentation for `isAccessAllowed` explicitly claims:
  > *"Create your own customized authorization flow in this method. From here you already known if the user is authenticated (`this.authenticated`) and the user roles (`this.roles`)."*
  
  Because `this.roles` is populated *after* `isAccessAllowed` executes, any implementation of `isAccessAllowed` that relies on checking `this.roles` will see `undefined` (or outdated roles from a previous navigation on the singleton guard).
- **Recommended Fix:**
  Assign `this.roles` *before* invoking `this.isAccessAllowed(route, state)`. For example:
  ```typescript
  this.authenticated = await this.keycloakAngular.isLoggedIn();
  if (this.authenticated) {
    this.roles = this.keycloakAngular.getUserRoles(true);
  } else {
    this.roles = [];
  }
  const result = await this.isAccessAllowed(route, state);
  ```

---

## 2. Architectural Debt & Design Patterns

### 2.1. `KeycloakService`: Lack of Initialization Checks (Type Safety)
- **Location:** `src/lib/services/keycloak.service.ts`
- **Problem:**
  Several public methods (e.g. `isUserInRole`, `getUserRoles`, `isTokenExpired`, `loadUserProfile`) directly invoke properties/methods on `this._instance` without verifying that it is defined. If a client application calls any of these methods before `init()` completes successfully, the application will crash with a `TypeError: Cannot read properties of undefined`.
  Additionally, `isLoggedIn()` reads `this._instance.authenticated` without a defensive check (relying on a try/catch block to return `false`), and `updateToken()` checks `this._silentRefresh` (which triggers `this.isTokenExpired()`) before checking if `this._instance` exists.
- **Recommended Fix:**
  - Implement a uniform defensive check at the start of all methods requiring the adapter instance:
    ```typescript
    if (!this._instance) {
      throw new Error('Keycloak Angular library is not initialized.');
    }
    ```
  - Alternatively, make `isLoggedIn()` check `if (!this._instance) return false;` explicitly instead of throwing and catching a `TypeError`.

---

## 3. Code Quality & Linting

### 3.1. `KeycloakAuthGuard`: Async Promise Executor Anti-pattern
- **Location:** `src/lib/services/keycloak-auth-guard.ts` (Lines 51-65)
- **Problem:**
  The `canActivate` guard wraps its execution in a redundant `new Promise(async (resolve, reject) => ...)` executor block and uses an ESLint bypass comment `// eslint-disable-next-line no-async-promise-executor`. Using an async callback inside `new Promise` constructor is a well-known anti-pattern because errors thrown synchronously inside the executor are not caught or handled properly.
- **Recommended Fix:**
  Refactor the method to be a standard `async` method, which automatically handles promises natively:
  ```typescript
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    try {
      await this.keycloakAngular.isReady;
      this.authenticated = await this.keycloakAngular.isLoggedIn();
      if (this.authenticated) {
        this.roles = this.keycloakAngular.getUserRoles(true);
      } else {
        this.roles = [];
      }
      return await this.isAccessAllowed(route, state);
    } catch (error: any) {
      throw new Error('An error happened during access validation. Details: ' + error);
    }
  }
  ```

---

## 4. Test Coverage

- **Current Status:** All 4 tests in `keycloak.service.spec.ts` pass successfully.
- **Identified Gaps:**
  - **No Tests for `KeycloakAuthGuard`:** There are currently zero tests verifying the route guard authentication/authorization logic or verifying the order in which `roles` are set.
  - **No Tests for `KeycloakBearerInterceptor`:** The bearer token HTTP interceptor has zero test coverage.
  - **No Tests for `init` Generator:** There is no testing for the Nx generator. Tests could easily have caught the regular expression logic bug in the dependency sorting condition.
- **Recommended Fix:**
  - Write unit/integration tests for the `KeycloakAuthGuard` and `KeycloakBearerInterceptor` using `@angular/common/http/testing` / `HttpClientTestingModule`.
  - Add tests for the `init` generator to verify package.json peer dependency sorting and installation tasks under different conditions.
