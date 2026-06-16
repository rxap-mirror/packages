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

### 1.2. `init` Generator: Invalid Regular Expression Evaluation
- **Location:** `src/generators/init/generator.ts` (Lines 45-58)
- **Problem:**
  There is a critical logical bug in the condition checking whether the package should be categorized as a devDependency:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
    ...
  }
  ```
  This is a JavaScript syntax/logic error. The second part of the condition is an array literal (`[...]`), which evaluates as a truthy value. It does not perform any tests against `packageName`. Consequently, the condition simplifies to `!isDevDependency` and will evaluate to `true` for **all** package names (including non-plugin/non-schematic runtime packages) that are not already in `devDependencies`.
- **Recommended Fix:**
  Add a `.some(...)` check to execute the regular expressions against `packageName` (similar to the first `if` statement in the generator):
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
    ...
  }
  ```

---

## 2. Architectural Debt & Design Patterns

### 2.1. `init` Generator: Virtual Tree Abstraction Violations (Nx Anti-patterns)
- **Location:** `src/generators/init/generator.ts`
- **Problem 1 (Physical File Paths):**
  The generator attempts to resolve the package's local `package.json` relative to the physical physical file path of the generator via `__dirname`:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
  Relying on `__dirname` and physical paths inside Nx generators breaks the virtual tree abstraction and causes failures if the workspace root is virtualized, running in different containerized environments, or executed during custom Dry-run CLI invocations.
- **Problem 2 (Querying `node_modules` via Virtual Tree):**
  The generator checks and reads files inside the `node_modules/` folder using the virtualized Nx `tree` object (e.g., `tree.exists(peerPackageJsonFilePath)`). `node_modules` is usually ignored by the Nx virtual file system. Standard virtual Tree objects do not track files inside ignored directories like `node_modules`.
- **Recommended Fix:**
  - For package.json, use standard workspace-relative target paths (e.g., `'packages/angular/keycloak/package.json'`) or parse the workspace layout configuration.
  - For reading peer dependencies in `node_modules`, use Node's native `require.resolve` or `fs` directly to query third-party libraries instead of violating the virtual tree abstraction.

### 2.2. `KeycloakService`: Lack of Initialization Checks (Type Safety)
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
