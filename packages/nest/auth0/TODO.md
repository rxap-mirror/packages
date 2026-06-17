# TODO: nest-auth0 Project Audit & Improvements

This file lists the findings, bugs, and architectural debt identified during the project audit of the `@rxap/nest-auth0` library.

## 🔴 Critical & Functional Bugs

### 1. Broken Peer Dependency Initialization in Generator
- **File:** `src/generators/init/generator.ts`
- **Line Reference:** [L83-L137](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/generators/init/generator.ts#L83-L137)
- **Description:** 
  The generator adds missing peer dependencies via `addDependenciesToPackageJson` + `installPackagesTask`, then immediately attempts to locate and run their `init` generators in the same run. Since those dependencies are only installed on disk *after* the generator finishes, they are not yet present in `node_modules`, so the newly-added peers cannot be initialized in the same run.
- **Recommended Fix:** Run installation before calling peer generators, or delegate peer generator invocations to a post-install task or workspace-level generator.
- **Note:** (virtual-tree/physical-path access was fixed 2026-06; the install-ordering problem remains)

---

## 🟡 Architectural Debt & Code Smells

### 1. Unregistered and Duplicated `Auth0Service`
- **File:** `src/lib/auth0.service.ts`
- **Description:** 
  `Auth0Service` is an identical duplicate of `Auth0AuthenticationService`. It is not registered as a provider in `Auth0Module`, is not exported in `index.ts`, and is not used anywhere in the workspace.
- **Recommended Fix:** Remove `src/lib/auth0.service.ts` and remove its export from `src/index.ts`.

### 2. Hybrid Runtime/Build-Time Packaging
- **Description:** 
  The package mixes runtime NestJS code with build-time Nx generators and schematics. This forces `@nx/devkit` to be a runtime `dependency` in `package.json`, which bloats the production dependency graph of downstream applications.
- **Recommended Fix:** Split the generator and schematic into a separate package (e.g. `@rxap/plugin-nest-auth0` or `@rxap/schematic-nest-auth0`), keeping runtime packages lightweight and free of build tools.

### 3. Fallback to Real JWT Verification when Disabled
- **File:** `src/lib/auth0.guard.ts`
- **Line Reference:** [L70-L78](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/lib/auth0.guard.ts#L70-L78)
- **Description:** 
  If `AUTH0_DISABLED` is true but no mock headers are set, the guard falls back to bearer token authentication using `JwtService.verifyAsync()`. This service attempts to connect to the external Auth0 JWKS endpoint. If the issuer URL is missing or unreachable (which is likely if Auth0 is disabled for local/offline dev), it throws a runtime network error or times out.
- **Recommended Fix:** If `AUTH0_DISABLED` is true, reject the request with a clear 401/403 error immediately rather than attempting standard JWT verification against a potentially unconfigured/offline Auth0 issuer, or fall back to local/static key verification.

---

## 🟢 Test Coverage & Quality Assurance

### 1. Zero Test Coverage
- **Description:** 
  The project contains absolutely no test files (`.spec.ts` or `.test.ts`), resulting in 0% test coverage. While `jest` targets and `tsconfig.spec.json` are set up, they do not find any tests.
- **Recommended Fix:** 
  Create test suites under `src/lib/` to cover critical parts of the library:
  - `auth0-validation-schema.spec.ts`: Verify that the Joi validation schema correctly validates configuration options, and that passing custom `defaults` works without throwing.
  - `auth0.guard.ts.spec.ts`: Verify guard behavior when:
    - Auth0 is active and a valid/invalid token is provided.
    - Auth0 is disabled and mock headers (`x-user-id`, etc.) are set or missing.
    - Public and bypass decorators are applied.
  - `auth0-module-options.factory.spec.ts`: Test proper parsing of environment config variables.
  - `generator.spec.ts`: Unit test the schematic/generator with a mock Nx `Tree`.
