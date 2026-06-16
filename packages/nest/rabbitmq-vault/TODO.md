# TODO: nest-rabbitmq-vault Code Audit & Improvements

This document lists the findings and recommendations from the audit of the `@rxap/nest-rabbitmq-vault` project.

---

## 🔴 Critical & Major Bugs

### 1. Incorrect Regex Evaluation in `generator.ts`
- **File:** `src/generators/init/generator.ts` (Lines 45-51)
- **Description:** 
  The condition inside the dependency-coercion logic is currently broken:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  This does not test `packageName` against the regex array; instead, it checks if the array literal is truthy (which it always is). Consequently, any runtime package that is not a devDependency will be incorrectly moved to `devDependencies` in `package.json`.
- **Recommended Fix:**
  Use `.some` to correctly test the `packageName` against the regular expressions:
  ```typescript
  if (
    !isDevDependency &&
    [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/].some((rx) => rx.test(packageName))
  )
  ```

### 2. Node.js Process Crash Risk in Asynchronous Lease Renewal
- **File:** `src/lib/rabbitmq-vault.service.ts` (Lines 66-75)
- **Description:** 
  In the `autoRenewLease` method, the `.catch` block on `this.vault.renewLease` throws an error inside an asynchronous `setTimeout` context:
  ```typescript
  setTimeout(() => {
    ...
    this.vault.renewLease({
      lease_id,
    }).then(response => {
      ...
    }).catch(error => {
      throw this.handleError(error);
    });
  }, timeout);
  ```
  Throwing an exception inside an asynchronous callback or unhandled promise rejection outside the main stack is extremely hazardous. It will trigger an uncaught exception / unhandled rejection, leading directly to the termination (crash) of the entire Node.js application process.
- **Recommended Fix:**
  Do not throw unhandled exceptions in background timers. Handle the error gracefully by logging it (e.g., `this.logger.error(...)`), and optionally retry with an exponential backoff or raise an event so the hosting application can respond safely.

---

## 🟡 Resource Leaks & Safety Issues

### 3. Background Timer / Memory Leak in `autoRenewLease`
- **File:** `src/lib/rabbitmq-vault.service.ts` (Lines 59-76)
- **Description:**
  The `autoRenewLease` method schedules recursive `setTimeout` timers to handle lease renewals. However, these timeout handles are never stored, and the service does not implement NestJS lifecycle hooks (like `OnModuleDestroy`) to clean them up.
  When the NestJS application shuts down or the containing module is destroyed, the pending `setTimeout` calls will remain in the event loop, causing memory leaks, preventing clean process shutdowns, and potentially executing logic on destroyed services.
- **Recommended Fix:**
  - Store the timeout identifier: `private renewTimeout?: NodeJS.Timeout;`
  - Implement `OnModuleDestroy` in `RabbitmqVaultService` and clear the active timeout:
    ```typescript
    import { OnModuleDestroy } from '@nestjs/common';
    ...
    export class RabbitmqVaultService implements OnModuleDestroy {
      ...
      onModuleDestroy() {
        if (this.renewTimeout) {
          clearTimeout(this.renewTimeout);
        }
      }
    }
    ```

### 4. Vulnerable Parameter checks in `handleError`
- **File:** `src/lib/rabbitmq-vault.service.ts` (Lines 78-86)
- **Description:**
  The error handler checks properties on `error` without validating that `error` is an object:
  ```typescript
  if (error.status === 503)
  ```
  If `error` is passed as `null` or a primitive value, this will throw a `TypeError` (e.g., `Cannot read properties of null`), masking the original error and crashing the error handling logic.
- **Recommended Fix:**
  Safely inspect the error object:
  ```typescript
  private handleError(error: any) {
    if (error && typeof error === 'object' && error.status === 503) {
      if (error.message?.includes('Vault is sealed')) {
        this.logger.error('Vault is sealed', 'RabbitmqVaultService');
        return new Error('Vault is sealed');
      }
    }
    return error;
  }
  ```

### 5. Lack of `lease_duration` Safety Check
- **File:** `src/lib/rabbitmq-vault.service.ts` (Lines 64)
- **Description:**
  If the Vault backend returns a lease duration of `0` or a negative value, the calculated `timeout` will be `<= 0`. This will cause the `setTimeout` callback to fire immediately and recursively, causing a rapid infinite loop of lease renewal requests, flooding Vault, and pinning the CPU.
- **Recommended Fix:**
  Add a minimum lease duration validation:
  ```typescript
  if (lease_duration <= 0) {
    this.logger.error(`Invalid lease duration: ${lease_duration} for lease '${lease_id}'`, 'RabbitmqVaultService');
    return;
  }
  ```

---

## 🔵 Architectural Debt & Coupling

### 6. Generator Anti-patterns (Virtualized Tree Violations)
- **File:** `src/generators/init/generator.ts` (Lines 11-14, 85-91)
- **Description:**
  - The generator computes physical pathing relative to `__dirname` to access files in `tree`:
    ```typescript
    const packageJsonFilePath = relative(
      tree.root,
      join(__dirname, '..', '..', '..', 'package.json')
    );
    ```
  - It also attempts to check and read `node_modules` files using `tree.exists()` and `tree.read()`. In Nx, `node_modules` is excluded from the virtual file system tree. Any operations using `tree` on paths within `node_modules` will fail or return `null`.
- **Recommended Fix:**
  - Avoid using physical paths (`__dirname`) mixed with the virtual tree `tree.read`/`tree.write`. For accessing workspace files, use workspace-relative paths from devkit or utility helpers.
  - To inspect dependencies or run init tasks for peer dependencies, use physical filesystem helpers (e.g., standard `fs` module) for `node_modules` checks, or utilize the native `@nx/devkit` package/dependency helpers that bypass the virtual `tree` for non-workspace files.

### 7. Direct Coupling to Environment Keys
- **Files:** `src/lib/rabbitmq-vault.service.ts` and `src/lib/rabbitmq-vault-options-factory.ts`
- **Description:**
  The classes are hardcoded to fetch the role name from the exact environment key `'RABBITMQ_VAULT_ROLE'`. This tightly couples the library to a specific configuration structure, making it non-reusable across different services or multiple RabbitMQ configurations inside the same application.
- **Recommended Fix:**
  Accept the config key name or the vault options via NestJS dependency injection using a configuration token or dynamic module configuration.

### 8. Missing NestJS Module
- **Description:**
  The library provides `RabbitmqVaultService` and `RabbitmqVaultOptionsFactory` but does not provide a standard NestJS Module (e.g., `RabbitmqVaultModule`). Users must manually register these components inside their own application modules.
- **Recommended Fix:**
  Introduce a `RabbitmqVaultModule` that provides and exports these classes, simplifying the integration experience for consumers.

---

## 🟢 Test Coverage

### 9. Lack of Unit and Integration Tests
- **Description:**
  There are **no spec files** (`*.spec.ts`) in the entire library, resulting in **0% test coverage**. 
- **Recommended Fix:**
  Create robust test coverage for:
  - `RabbitmqVaultService` (mocking the `VaultService` and `ConfigService` to test credentials retrieval and lease renewals).
  - `autoRenewLease` (verifying that timers are created with the correct timeout, handled errors don't crash, and timers are correctly cleared upon destruction).
  - `generator.ts` (utilizing `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify dependency management behavior).
