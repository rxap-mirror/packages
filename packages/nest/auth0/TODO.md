# TODO: nest-auth0 Project Audit & Improvements

This file lists the findings, bugs, and architectural debt identified during the project audit of the `@rxap/nest-auth0` library.

## 🔴 Critical & Functional Bugs

### 1. Broken Defaults Loop in Validation Schema
- **File:** `src/lib/auth0-validation-schema.ts`
- **Line Reference:** [L59-L63](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/lib/auth0-validation-schema.ts#L59-L63)
- **Description:** 
  The function `auth0ValidationSchema` iterates over defaults using `Object.keys(defaults)`:
  ```typescript
  for (const [ key, value ] of Object.keys(defaults)) {
    if (value) {
      schema[key] = schema[key].default(value);
    }
  }
  ```
  `Object.keys(defaults)` returns an array of strings (keys). When destructured as `[key, value]`, the key string is split into its individual characters (e.g. `'A'` and `'U'`), leading to a crash (`TypeError: Cannot read properties of undefined (reading 'default')`) if defaults are non-empty because `schema['A']` does not exist.
- **Recommended Fix:** Change `Object.keys(defaults)` to `Object.entries(defaults)`.

### 2. Typo in User Mocking within Guard
- **File:** `src/lib/auth0.guard.ts`
- **Line Reference:** [L67](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/lib/auth0.guard.ts#L67)
- **Description:** 
  When `AUTH0_DISABLED` is enabled, the mock user object is constructed with a typo:
  ```typescript
  user.usernane = request.headers['x-user-username'];
  ```
  This creates a non-standard `usernane` property and leaves `username` undefined.
- **Recommended Fix:** Rename `user.usernane` to `user.username`.

### 3. Faulty Dependency Category Evaluation in Generator
- **File:** `src/generators/init/generator.ts`
- **Line Reference:** [L45-L51](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/generators/init/generator.ts#L45-L51)
- **Description:** 
  The condition checking if a package belongs in `devDependencies` is missing a `.some` test:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  Since any non-empty array is truthy, this condition evaluates to `!isDevDependency && true`. It always passes if `!isDevDependency` is true, regardless of the package name. This conflicts with the `@rxap/nest` dependency logic directly above it, causing infinite flip-flopping or incorrect moving of the package to `devDependencies`.
- **Recommended Fix:** Add `.some((rx) => rx.test(packageName))` to the condition:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  )
  ```

### 4. Broken Peer Dependency Initialization in Generator
- **File:** `src/generators/init/generator.ts`
- **Line Reference:** [L83-L137](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/auth0/src/generators/init/generator.ts#L83-L137)
- **Description:** 
  The generator attempts to locate and run the `init` generator of newly added peer dependencies using `tree.exists(peerPackageJsonFilePath)`. Since these dependencies were missing and have only been added to memory, they are not physically installed in `node_modules` yet. Thus, `tree.exists` will always be false, and the generator silently skips executing their init generators.
- **Recommended Fix:** Run installation before calling peer generators, or delegate peer generator invocations to a post-install task or workspace-level generator.

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
