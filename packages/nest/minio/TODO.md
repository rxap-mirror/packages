# TODO: nest-minio Refactoring & Fixes

This file tracks the identified bugs, architectural debt, and testing gaps in `@rxap/nest-minio` along with recommended action items to resolve them.

---

## 🚨 Critical Bugs & Functional Issues

### 1. Misleading "Not yet implemented!" Error in Health Indicator
* **File:** [minio.health-indicator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/minio/src/lib/minio.health-indicator.ts#L44-L47)
* **Description:** When the `MinioHealthIndicator` fails to fetch the bucket list, it catches the error and then throws a `HealthCheckError` with a generic and misleading message `'Not yet implemented!'`. This is highly confusing during monitoring/debugging as it masks the true connection or permission issue.
* **Fix:** Provide a meaningful error message that reflects the actual connection state:
  ```typescript
  throw new HealthCheckError(
    `Minio health check failed: ${error?.message || 'Unable to list buckets'}`,
    this.getStatus('minio', false),
  );
  ```

### 2. NestJS Dependency Injection Crash via `@Inject(Logger)`
* **Files:**
  - [minio-module-options-loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/minio/src/lib/minio-module-options-loader.ts#L19-L20)
  - [minio.health-indicator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/minio/src/lib/minio.health-indicator.ts#L28-L29)
* **Description:** Both classes attempt to inject the NestJS `Logger` class using `@Inject(Logger)`. In standard NestJS configurations, `Logger` is not a registered token in the DI container. Unless the consuming application explicitly defines a custom provider for `Logger`, this injection will crash during application bootstrapping.
* **Fix:** Instantiate the standard logger directly:
  ```typescript
  private readonly logger = new Logger(MinioHealthIndicator.name);
  ```
  And remove `@Inject(Logger)` completely.

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Peer Dependency Install Ordering in Init Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/minio/src/generators/init/generator.ts#L81-L137)
* **Description:**
  - The generator schedules a package install via `installPackagesTask(tree)`, which is only executed *after* the current generator successfully runs.
  - Immediately afterward, it loops over `missingPeerDependencies` and tries to initialize them. Since they have not actually been installed on disk yet, newly-added peers cannot be initialized in the same run.
* **Fix:**
  - Run installation before invoking peer generators, or document peer dependency requirements clearly and rely on the workspace package manager to install peers upfront.
* **Note:** (virtual-tree/physical-path access was fixed 2026-06; the install-ordering problem remains)

### 2. Blocking Synchronous Disk Reads
* **File:** [minio-module-options-loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/minio/src/lib/minio-module-options-loader.ts#L30)
* **Description:** Using `readFileSync` blocks the Node.js event loop during initialization.
* **Fix:** Consider converting CA certificate reading to an asynchronous load, or keep it synchronous only if initialization is guaranteed to run once during bootstrapping (which should be documented).

---

## 🧪 Test Coverage Gap

* **Current Status:** **0% coverage (No tests found)**
* **Description:** There are no `*.spec.ts` files or tests of any kind for `MinioService`, `MinioHealthIndicator`, or `MinioModuleOptionsLoader`.
* **Action Items:**
  - [ ] Add unit tests for `MinioService` to verify options loading and client configuration.
  - [ ] Add unit tests for `MinioHealthIndicator` verifying that it returns `getStatus('minio', true)` when list succeeds, and throws `HealthCheckError` when it fails.
  - [ ] Add unit tests for `MinioModuleOptionsLoader` to test parsing of environment variables.
  - [ ] Add unit tests for the `init` generator verifying package-type classifications and dependency-moving logic.
