# Todo List - `@rxap/nest-vault`

This document outlines critical bugs, architectural debt, library anti-patterns, and test coverage improvements identified during the project audit of `packages/nest/vault`.

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

### 1. Low Test Coverage
* **Status (2026-06):** `vault.service.spec.ts` now covers the disabled-mode behavior
  (rejects instead of hanging) and the millisecond auto-renew timeout calculation.
* **Remaining gaps**:
  - **`vault.service.spec.ts`**: fallback/validation logic of `getToken()`.
  - **`vault.health-indicator.spec.ts`**: near-expiry handling (< 5 minutes) and
    throwing `HealthCheckError` when Vault is unreachable or returns empty data.
  - **`generator.spec.ts`**: validate dependency grouping into `dependencies` vs `devDependencies`.
