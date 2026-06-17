# TODO: `@rxap/nest-openfga` Audit Findings & Improvements

This document lists the findings and recommended actions identified during the audit of the `@rxap/nest-openfga` project. The findings are categorized into critical bugs, architectural/design debt, and testing/coverage considerations.

---

## 🚨 Critical Bugs & Functional Defects

### 1. Missing Peer Dependency: `@nestjs/terminus` (`package.json`)
*   **Issue:** `OpenfgaHealthIndicator` (in `src/lib/openfga.health-indicator.ts`) imports and uses classes and decorators from `@nestjs/terminus`. However, `@nestjs/terminus` is not listed in `dependencies` or `peerDependencies` of `@rxap/nest-openfga`'s `package.json`.
*   **Consequence:** Downstream applications installing `@rxap/nest-openfga` will encounter compilation or runtime errors due to missing `@nestjs/terminus` package, unless they happen to have it installed manually.
*   **Recommended Fix:** Add `@nestjs/terminus` with appropriate version range (e.g., `^10.0.0` or `^11.0.0` matching NestJS version) to `peerDependencies` in `packages/nest/openfga/package.json`.

---

## 🏛️ Architectural Debt & Design Anti-Patterns

### 1. Inconsistent Configuration Defaults (Joi Schema vs. Module Bootstrap)
*   **Issue:** There is a significant discrepancy between the defaults defined in the Joi validation schema and the hardcoded fallbacks inside `OpenFgaModule.onApplicationBootstrap()`.
    *   `FGA_INITIAL_CONNECTION_RETRY_INTERVAL` defaults to `100`ms in `openFgaValidationSchema`.
    *   If not configured, the retry interval falls back to `10,000`ms (`10s`) inside `onApplicationBootstrap`.
*   **Consequence:** This discrepancy leads to unpredictable behavior based on whether the Joi schema validation is active. Furthermore, a `100`ms retry interval is extremely aggressive and could flood the OpenFGA instance with requests during startup.
*   **Recommended Fix:** Standardize on a single, reasonable default (e.g., `1000`ms or `2000`ms) across both the configuration schema and the fallback parameters.

### 2. Swallowed Errors in `OpenFgaGuard` Batch Checks
*   **Issue:** In `open-fga.guard.ts`, the guard performs authorization checks via `this.fga.clientBatchCheck(tuples)`. It checks if every item is allowed:
    `if (result.every((item) => item.allowed))`
    However, if an individual check within the batch fails with an API error (e.g. invalid type, relation, schema mismatch), the `@openfga/sdk` returns that item with `allowed: undefined` and an `error` property. The guard currently logs a generic warning `FGA check: some tuples are not allowed` and returns `false`, completely swallowing the actual error.
*   **Consequence:** Developers will find it extremely difficult to troubleshoot authorization rule issues, typos in `@OpenFGA` decorators, or schema-related FGA bugs since the underlying error from the FGA server is completely lost.
*   **Recommended Fix:** Inspect the `result` array for any items containing an `error` property, log those errors using `this.logger.error(...)`, and handle them properly (either throwing an exception or providing clear debug information).

### 3. Coupling to Express Adapter
*   **Issue:** In `open-fga.decorator.ts` and `open-fga.guard.ts`, the typing imports `Request` directly from `'express'`.
*   **Consequence:** In a Fastify-based NestJS application, the request object passed to the guard and decorators is a Fastify request rather than an Express request. This hardcoded dependency limits the framework's portability.
*   **Recommended Fix:** Generalize request typings to use `any` or generic interfaces, or leverage NestJS types (like `ExecutionContext.switchToHttp().getRequest()`) without importing Express-specific types directly in non-adapter-specific code.

### 4. Limited Authentication Support in `OpenFgaModuleOptionsFactory`
*   **Issue:** The options factory only maps `FGA_API_TOKEN` to `CredentialsMethod.ApiToken`.
*   **Consequence:** Production setups requiring OAuth2 Client Credentials flow (OIDC) cannot utilize the `OpenFgaModuleOptionsFactory` directly and must write custom factory code.
*   **Recommended Fix:** Extend the factory and the validation schema to support OIDC credentials config (e.g., client ID, client secret, and token issuer).

---

## 🧪 Test Coverage & Diagnostics

### 1. Minimal Test Coverage
*   **Issue:** Only the Joi validation schema has a unit test (`src/lib/open-fga-validation-schema.spec.ts`). Key logic in `OpenFgaGuard`, `ResolveFgaChecks`, and `OpenFgaModule`'s bootstrap behavior is completely untested.
*   **Recommended Fix:** Introduce unit/integration tests using NestJS `@nestjs/testing` utilities:
    *   Test `ResolveFgaChecks` with various user/object tuple structures to verify it correctly parses parameters (such as `userModifier`, request-derived functions, etc.).
    *   Test `OpenFgaGuard` with mocked `OpenFgaService` and custom controllers decorated with `@OpenFGA()`.
