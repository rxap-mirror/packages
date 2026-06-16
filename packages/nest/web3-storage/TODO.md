# TODO: nest-web3-storage Audit Findings & Action Items

This document outlines the findings and recommended actions resulting from the audit of the `nest-web3-storage` package.

---

## 🚨 Critical Bugs & Logic Issues

### 1. Broken Regex Dependency Logic in Init Generator
- **Location:** `src/generators/init/generator.ts` (Lines 45-51)
- **Problem:**
  The check to determine whether a package should be moved to `devDependencies` is missing a `.some(...)` evaluation over the array of regex patterns:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  Since an array literal `[...]` in JavaScript is always truthy, this condition evaluates to true for *any* dependency when `!isDevDependency` is true (even if the package name is completely unrelated, such as `@rxap/nest-web3-storage`). This causes any standard dependency to be incorrectly removed from `dependencies` and added to `devDependencies`.
- **Recommended Fix:**
  Add the `.some(...)` array method to evaluate the patterns against the package name, matching the pattern used earlier in the file:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  )
  ```

### 2. Virtualized Tree Bypass & Dead Code in Init Generator
- **Location:** `src/generators/init/generator.ts` (Lines 83-137)
- **Problem:**
  The loop checking peer-dependency init generators relies on:
  ```typescript
  const peerPackageJsonFilePath = join(
    'node_modules',
    ...peer.split('/'),
    'package.json'
  );
  if (!tree.exists(peerPackageJsonFilePath)) { ... }
  ```
  Since the virtualized `Tree` representation in Nx excludes the `node_modules` directory, `tree.exists()` on paths inside `node_modules` will **always** return `false`. This makes the entire block of code starting at line 83 dead code that never executes.
  Furthermore, the dynamic loading of generator scripts using `require(...)` with physical filesystem paths directly inside `node_modules` is an anti-pattern:
  - It bypasses Nx's dry-run safety.
  - It assumes a physical, flat `node_modules` structure, which fails under strict package managers (pnpm) and virtualized/bundled setups (Yarn PnP).
- **Recommended Fix:**
  - Remove the manual traversal and dynamic require of peer dependencies inside the generator.
  - Instead, declare these init actions using high-level generator orchestration (e.g. leveraging Nx's schematic composition or generator dependency configs in `generators.json` / `schematics.yaml`).

---

## 🏛️ Architectural & Configuration Debt

### 3. Redundant Global Module Configuration (Class `@Global()` vs Builder `isGlobal`)
- **Location:** `src/lib/web3-storage.module.ts`
- **Problem:**
  The module class is statically decorated with `@Global()`:
  ```typescript
  @Global()
  @Module({ ... })
  export class Web3StorageModule extends ConfigurableModuleClass {
  ```
  At the same time, the `ConfigurableModuleClass` is defined with dynamic extras:
  ```typescript
  .setExtras({
    isGlobal: true,
  })
  ```
  Because of the static `@Global()` decorator, NestJS will always register the module globally, making the `isGlobal` dynamic extra redundant. Consumers cannot override the global scope (e.g., they cannot register the module locally by setting `isGlobal: false`).
- **Recommended Fix:**
  Remove `@Global()` from the module class definition and let the `ConfigurableModuleBuilder` dynamically control global registration based on the dynamic options:
  ```typescript
  export const {
    ConfigurableModuleClass,
    MODULE_OPTIONS_TOKEN,
    OPTIONS_TYPE,
    ASYNC_OPTIONS_TYPE,
  } = new ConfigurableModuleBuilder<Web3StorageModuleOptions>()
    .setExtras({
      isGlobal: true,
    }, (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }))
    .build();
  ```

### 4. Hardcoded Environment Variable / Configuration Key
- **Location:** `src/lib/web3-storage-module-options-loader.ts`
- **Problem:**
  The `ConfigService` key `'WEB3_STORAGE_TOKEN'` is hardcoded inside the loader file:
  ```typescript
  token: this.config.getOrThrow('WEB3_STORAGE_TOKEN'),
  ```
  This creates a tight coupling between the library and a specific environment variable name. It prevents multiple instances of the module or different configuration keys from being used.
- **Recommended Fix:**
  Provide a configurable prefix/key option, or document this hardcoded key prominently in the `README.md`/`GETSTARTED.md` so that users are aware of the required naming convention.

### 5. Deprecated Base Library Dependency
- **Location:** `package.json` (Lines 10-14)
- **Problem:**
  The library relies on `web3.storage` (specifically version `^4.5.5` as a peer dependency). The original, legacy key-based client (`web3.storage`) is deprecated in favor of the decentralized w3up API and agent-based clients (such as `@web3-storage/w3up-client`). Using deprecated gateways/clients may lead to runtime API failures or connection issues.
- **Recommended Fix:**
  Refactor the library to support the modern Web3.Storage w3up architecture or clearly document the limitations/legacy status of the current package.

---

## 🧪 Test Coverage & Quality Debt

### 6. Zero Test Coverage (0%)
- **Problem:**
  The project contains **zero** test files (no `*.spec.ts` files exist). The tests pass only because `--passWithNoTests=true` is set.
- **Recommended Fix:**
  - Implement unit tests for `Web3StorageService` utilizing mock configurations and mock `web3.storage` clients.
  - Implement a generator test using the `@nx/devkit/testing` `createTreeWithEmptyWorkspace` workspace helper to verify the generator's behavior without relying on real `node_modules` disk state.
