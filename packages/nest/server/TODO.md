# Todo List for @rxap/nest-server

This document outlines the findings, critical bugs, architectural debt, and testing gaps identified during the project audit of `@rxap/nest-server` (located at `packages/nest/server`), along with recommendations for resolving them.

---

## 📦 Dependency & Packaging Issues

### 1. Undeclared Peer Dependency on `joi`
* **File:** `package.json`
* **Description:**
  The codebase imports `joi` in `src/lib/server-validation-schema.ts` and `src/lib/setup-cors.ts` (e.g., `import * as Joi from 'joi';`). However, `joi` is not listed under `dependencies` or `peerDependencies` in the library's `package.json`.
* **Impact:** The build passes in the monorepo only because `joi` is installed at the workspace root (via hoisting). Once published, external consumers who install `@rxap/nest-server` will encounter runtime crashes or compilation failures if they don't have `joi` installed in their own applications.
* **Recommended Fix:** Add `joi` to the `peerDependencies` (with an appropriate version range, e.g. `^17.0.0`) in `packages/nest/server/package.json`.

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Direct Mutation of NestJS internal private property (`internalConfig`)
* **Files:** `src/lib/monolithic.ts` (Lines 122, 129, 130), `src/lib/microservice.ts` (Line 27)
* **Description:**
  The library reads and directly writes to `(config as any).internalConfig` to inject values like `API_URL` and `API_BASE_URL` dynamically into the configuration:
  ```typescript
  (config as any).internalConfig.API_URL = apiUrl;
  (config as any).internalConfig.API_BASE_URL = apiBaseUrl;
  ```
* **Impact:** Highly fragile and tightly coupled to the internal implementation details of `@nestjs/config`'s `ConfigService`. If the internal representation changes or is renamed in a future NestJS release, the server will crash on start.
* **Recommended Fix:** Avoid mutating the internal state of `ConfigService`. Instead, use a custom config factory, custom providers, or use standard setting methods if supported, or design an intermediate custom config service layer.

### 2. Invalid Usage of `ConfigService.getOrThrow` with Default Value
* **File:** `src/lib/setup-cors.ts` (Line 29)
* **Description:**
  The CORS setup calls `getOrThrow` with a default value as the second argument:
  ```typescript
  allowedHeaders: config.getOrThrow('CORS_ALLOWED_HEADERS', [ 'sentry-trace', 'baggage' ]).split(',')
  ```
  However, in NestJS `@nestjs/config`, `getOrThrow`'s second parameter is an options object (`ConfigGetOptions`), NOT a fallback/default value.
* **Impact:** The default value array is ignored, and if `CORS_ALLOWED_HEADERS` is absent, the function will throw a runtime error rather than falling back. If `CORS_EXPOSED_HEADERS` or `CORS_METHODS` are also absent (which are also loaded via `getOrThrow`), the bootstrap will crash unless configured.
* **Recommended Fix:** Change `getOrThrow` to `get` if fallbacks are intended:
  ```typescript
  allowedHeaders: config.get<string>('CORS_ALLOWED_HEADERS', 'sentry-trace,baggage').split(',')
  ```
  Ensure all configurations are safely checked to prevent unexpected application crashes.

### 3. Physical File System Bypasses inside Virtual Nx Generator
* **File:** `src/generators/init/generator.ts`
* **Description:**
  The `initGenerator` contains logic that requires external generator modules from `node_modules` using raw Node `require` on absolute disk paths, and checks file existence on disk:
  ```typescript
  const initGenerator = require(join('node_modules', ...peer.split('/'), initGeneratorFilePath))?.default;
  ```
* **Impact:** This bypasses the virtualized `Tree` file system utilized by Nx. It makes dry-runs (`--dry-run`) unreliable and makes assumptions about a flat `node_modules` directory in the current working directory, which breaks under modern package managers (like pnpm, Yarn PnP) or hierarchical structures.
* **Recommended Fix:** Rely on virtual `Tree` APIs where possible, or use standard Node resolution algorithms (`require.resolve`) rather than hardcoding manual paths into `node_modules`.

### 4. Noisy Warning Level Logging for Optional `build.json`
* **File:** `src/lib/server.ts` (Line 261)
* **Description:**
  The server prints a warn log if `build.json` does not exist:
  ```typescript
  Logger.warn(`The build.json file does not exists in the path '${ buildJsonFilePath }'`, 'Bootstrap');
  ```
* **Impact:** `build.json` is typically only present in production environments as a result of CI/CD pipeline artifact creation. In local development environments, this warning will clutter startup logs every single time, confusing developers.
* **Recommended Fix:** Downgrade this warning to a verbose or debug log, as the file's absence is perfectly normal in development mode.

### 5. Inconsistent Use of Deprecated Properties
* **File:** `src/lib/monolithic.ts` (Line 136), `src/lib/setup-swagger.ts` (Lines 22, 27)
* **Description:**
  In `monolithic.ts`, the property `publicUrl` is marked as `@deprecated use apiUrl instead`. However, it is set to `apiBaseUrl` (which is different from `apiUrl`), and `setup-swagger.ts` actively uses `options.publicUrl` to set the Swagger server URL.
* **Recommended Fix:** Standardize on `apiUrl` / `apiBaseUrl` and fully deprecate or remove `publicUrl` to avoid confusion.

---

## 🧪 Testing & Code Coverage

### 1. Zero Unit and Integration Tests
* **Impact:** There are **zero** spec files in the entire `packages/nest/server` directory. Code coverage is currently **0%**. Any changes to core server bootstrap logic, generators, or validation schemas can easily introduce regressions that go completely unnoticed.
* **Recommended Actions:**
  * Create a comprehensive test suite in `packages/nest/server/src/lib` using Jest to cover:
    * `server-validation-schema` logic.
    * `SetupCors` parsing, regexp transformation, and error handling.
    * `Server` and `Monolithic` bootstrap lifecycle and option preparation.
  * Add unit tests for the `init` generator using Nx devkit mocks (`createTreeWithEmptyWorkspace`).
