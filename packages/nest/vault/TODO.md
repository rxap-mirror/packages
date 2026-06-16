# Todo List - `@rxap/nest-vault`

This document outlines critical bugs, architectural debt, library anti-patterns, and test coverage improvements identified during the project audit of `packages/nest/vault`.

---

## 🔴 Critical Bugs

### 1. Vault Token Auto-Renew Mismatch in Timeout Units (Seconds vs. Milliseconds)
* **File & Lines**: [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L183) & [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L212)
* **Problem**: 
  - `response.lease_duration` from the Vault API is in **seconds**. 
  - Inside `tokenRenewSelf()`, `this.triggerAutoRenewIn(response.lease_duration * 0.6, ...)` is called, passing the calculated renew time in **seconds**.
  - However, `triggerAutoRenewIn()` treats its first parameter as **milliseconds**. It compares it to `minTimeout = 600000ms` (10 minutes in ms) and schedules the renewal using `setTimeout(..., timeout)`.
  - Because `seconds` is passed, the value (e.g. `2160` for a 1-hour lease) is almost always smaller than `600000`. This triggers a warning and forces the timeout to `10 minutes` regardless of lease duration.
  - If a token's actual lease duration is short (e.g., less than 10 minutes), the token will expire before the 10-minute timeout fires, causing API auth failures.
* **Recommended Fix**: Multiply the lease duration by `1000` to convert to milliseconds in `tokenRenewSelf()`, matching the correct pattern used in `kubernetesLogin()`:
  ```typescript
  this.triggerAutoRenewIn(response.lease_duration * 0.6 * 1000, increment, autoRenew);
  ```

### 2. Faulty Array/Regex Evaluation in `init` Generator
* **File & Lines**: [`generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/generators/init/generator.ts#L45-L51)
* **Problem**: 
  - The conditional statement evaluates:
    ```typescript
    if (
      !isDevDependency && [
        /^@rxap\/plugin/,
        /^@rxap\/workspace/,
        /@rxap\/schematic/,
      ]
    ) { ... }
    ```
  - In JavaScript/TypeScript, an array literal `[...]` is always truthy. The regular expressions are never executed or tested against the `packageName`.
  - This simplifies to `!isDevDependency && true`, causing **any** non-dev-dependency packages passing through this generator to be incorrectly shifted to `devDependencies` of the root `package.json`.
* **Recommended Fix**: Append `.some(...)` check to verify if the packageName matches any of the regex patterns, similar to the preceding block:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) { ... }
  ```

### 3. Indefinite Hang when Vault is Disabled
* **File & Lines**: [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L118-L121)
* **Problem**: 
  - If `VAULT_DISABLED` is active, `this.initialized` is assigned to a promise that delays for 24 hours: `new Promise<void>(resolve => setTimeout(resolve, 24 * 60 * 60))`.
  - All public client methods (e.g., `read`, `write`, `help`, `list`, `delete`) await `this.initialized`.
  - This causes any request/invocation to hang indefinitely (up to 24 hours) without throwing an error or returning early.
  - Additionally, this `setTimeout` is not unreferenced (`unref()`), keeping the Node.js event loop unnecessarily open and blocking graceful application exit.
* **Recommended Fix**: 
  - Replace the 24-hour hang promise. If Vault is disabled, service methods should immediately throw a descriptive error or return `null`/`undefined` gracefully depending on use-cases.
  - Store a `vaultDisabled` boolean flag and check it in the API methods.

### 4. Direct Truthiness Boolean Parsing of Environment Variables
* **File & Lines**: [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L118), [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L257)
* **Problem**: 
  - The configuration checks `if (this.config.get('VAULT_DISABLED'))` and `this.config.get('VAULT_KUBERNETES_AUTO_RENEW') !== undefined`.
  - Environment variables are read as strings from `process.env`. If the user sets `VAULT_DISABLED=false`, the string `"false"` is returned, which is **truthy** in JavaScript, leading to Vault being disabled.
* **Recommended Fix**: Explicitly check for boolean equivalence, such as:
  ```typescript
  const disabled = this.config.get('VAULT_DISABLED');
  if (disabled === true || disabled === 'true') { ... }
  ```

---

## 🟡 Architectural Debt & Anti-Patterns

### 1. Resource Leak via Unmanaged Auto-Renewal `setTimeout`
* **File & Lines**: [`vault.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.service.ts#L212-L221)
* **Problem**: 
  - `triggerAutoRenewIn()` spins up a `setTimeout` but does not retain its handle (`NodeJS.Timeout`).
  - There is no mechanism to clear this timeout. If the NestJS application is destroyed or shut down (such as during test executions, serverless container recycles, or hot reloads), the timeout remains active. This leaks resources and blocks the Node event loop from exiting gracefully.
* **Recommended Fix**: 
  - Implement `OnModuleDestroy` on `VaultService`.
  - Store the active timer handle in a private property: `private autoRenewTimeout?: NodeJS.Timeout`.
  - Clear the timeout in `onModuleDestroy()`:
    ```typescript
    onModuleDestroy() {
      if (this.autoRenewTimeout) {
        clearTimeout(this.autoRenewTimeout);
      }
    }
    ```

### 2. Missing Logger Injection Provider inside `VaultHealthIndicator`
* **File & Lines**: [`vault.health-indicator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.health-indicator.ts#L23-L24)
* **Problem**: 
  - `VaultHealthIndicator` uses `@Inject(Logger) private readonly logger!: Logger`. 
  - NestJS does not provide standard `Logger` as an injectable class token by default in user modules.
  - Consumers attempting to resolve `VaultHealthIndicator` will encounter a DI resolution error: `Nest can't resolve dependencies of the VaultHealthIndicator (?, Logger)`.
* **Recommended Fix**: Instantiate the Logger class directly rather than relying on Dependency Injection:
  ```typescript
  private readonly logger = new Logger(VaultHealthIndicator.name);
  ```

### 3. Incomplete `VaultModule` Declarations
* **File & Lines**: [`vault.module.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/lib/vault.module.ts)
* **Problem**: 
  - `VaultHealthIndicator` is implemented but is not registered or exported in `VaultModule`.
  - Consumers must manually add `VaultHealthIndicator` to their providers, running into the `Logger` injection bug described above.
* **Recommended Fix**: Provide and export `VaultHealthIndicator` within `VaultModule` to make it easily accessible to consumers.

### 4. Nx Generator Lifecycle & Virtual Tree Anti-patterns
* **File & Lines**: [`generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/vault/src/generators/init/generator.ts)
* **Problem**: 
  - **Lifecycle Issue**: The generator uses `addDependenciesToPackageJson()` and registers `installPackagesTask()`, then immediately loops through and tries to `require()` them from `node_modules` in the same execution run. Because package installation occurs as a *post-generator task*, these directories and files do not yet exist on disk, causing peer initialization to fail.
  - **Virtual Tree Read on Ignored Paths**: Checking files inside `node_modules` via `tree.exists()` is an anti-pattern. `node_modules` is physical, gitignored, and not tracked by the virtual `Tree`. This check always returns `false`, skipping peer init generators.
  - **Physical Path Resolver**: Resolving `packageJsonFilePath` via `relative(tree.root, join(__dirname, ...))` assumes specific file structures that can break when running transpiled outputs.
* **Recommended Fix**: 
  - Retrieve peer dependency `generators` config via standard Node.js module resolution rather than the virtual `tree`.
  - Perform peer init generators checks using physical path checks or guide the developer to run those separately, as installing packages on disk and requiring them inside the same generator execution phase is an invalid workflow in Nx.

---

## 🟢 Test Coverage Debt

### 1. 0% Test Coverage
* **Problem**: 
  - There are absolutely no `.spec.ts` test files in the library.
  - Running `yarn nx run nest-vault:test` executes Jest successfully but returns `No tests found, exiting with code 0`.
* **Recommended Action**: Implement comprehensive test suites under `src/lib/`:
  - **`vault.service.spec.ts`**:
    - Mock the `node-vault` client using Jest mocks.
    - Assert `tokenRenewSelf` handles lease conversions correctly.
    - Test correct fallback and validation logic of `getToken()`.
    - Test that `VAULT_DISABLED` does not result in hanging promises.
  - **`vault.health-indicator.spec.ts`**:
    - Verify `isHealthy` correctly handles near-expiry cases (< 5 minutes).
    - Assert it throws `HealthCheckError` when Vault is unreachable or responds with empty data.
  - **`generator.spec.ts`**:
    - Validate regex checking on package types to ensure dependencies are properly grouped into `dependencies` vs. `devDependencies`.
