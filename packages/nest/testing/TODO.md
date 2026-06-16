# TODO: @rxap/nest-testing Project Audit & Improvement Plan

This document outlines the findings and recommended fixes from an audit of the `nest-testing` project. It covers Critical Bugs, Architectural Debt, and Test Coverage.

## Critical Bugs (High Priority)

### 1. Broken Dependency Checking Logic in Init Generator
- **Location**: [packages/nest/testing/src/generators/init/generator.ts:L45-L51](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/generators/init/generator.ts#L45-L51)
- **Problem**: The conditional statement `!isDevDependency && [ /^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/ ]` contains an array literal that evaluates to `true` inside the `if` block, instead of calling `.some(...)` to test the regular expressions against `packageName`. This means that if `isDevDependency` is `false`, the code will always execute, incorrectly moving packages into `devDependencies` regardless of their prefix.
- **Recommended Fix**: Update the condition to use `.some(...)`:
  ```typescript
  !isDevDependency && [
    /^@rxap\/plugin/,
    /^@rxap\/workspace/,
    /@rxap\/schematic/,
  ].some((rx) => rx.test(packageName))
  ```

### 2. Relative `require` Failures in Generator Context
- **Location**: [packages/nest/testing/src/generators/init/generator.ts:L126-L130](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/generators/init/generator.ts#L126-L130)
- **Problem**: The code attempts to load dependency generators using a relative path from the current directory, e.g., `require(join('node_modules', ...))`. Since `require()` in Node.js resolves relative to `__dirname` (which points deep inside `packages/nest/testing/src/generators/init/`), this path resolution will fail (looking for `packages/nest/testing/src/generators/init/node_modules/...`) and crash with a `ModuleNotFoundError`.
- **Recommended Fix**: Use `require.resolve()` to locate the module's root path or resolve from the workspace root directory.

### 3. Querying `node_modules` and Project Files via Virtual `Tree` Anti-pattern
- **Location**: [packages/nest/testing/src/generators/init/generator.ts:L85-L93](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/generators/init/generator.ts#L85-L93), [L11-L15](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/generators/init/generator.ts#L11-L15)
- **Problem**: 
  - The generator uses the virtual workspace `Tree` (`tree.exists(...)`, `tree.read(...)`) to inspect files inside `node_modules`. Because `node_modules` is gitignored and external to active workspace source directories, it is not tracked in the Nx virtual tree. Thus, `tree.exists(...)` will always return `false`, meaning peer init generators are always skipped.
  - Additionally, locating the package's own `package.json` relative to `__dirname` and querying it in the virtual tree (`tree.exists(packageJsonFilePath)`) is fragile and fails when run from compiled outputs (e.g. from `/dist`), because `dist` files are also excluded from the virtual tree.
- **Recommended Fix**: Use Node's physical filesystem methods (`fs.existsSync`, `fs.readFileSync`) or direct imports/requires to inspect `node_modules` and its own `package.json` file.

### 4. Dead Code / Inoperative Init Generator due to Missing Peer Dependencies
- **Location**: [packages/nest/testing/package.json](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/package.json)
- **Problem**: The init generator exits early if there are no `peerDependencies` in the library's `package.json`. However, `packages/nest/testing/package.json` lists zero `peerDependencies`. As a result, the generator is completely dead code that does nothing.
- **Recommended Fix**: Identify the proper peer dependencies of this project (e.g., `@nestjs/common`, `@nestjs/config`, or others) and specify them under `peerDependencies` in `package.json`.

---

## Architectural Debt & Library Design (Medium Priority)

### 5. Lack of Dotted-Path Traversal in `MockConfigServiceFactory`
- **Location**: [packages/nest/testing/src/lib/mock-config-service-factory.ts:L15-L21](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-config-service-factory.ts#L15-L21)
- **Problem**: NestJS's standard `@nestjs/config` `ConfigService` supports retrieving nested properties using dot notation (e.g., `configService.get('database.host')`). The mock factory only retrieves exact keys on the flat object (`config[key]`). If the application under test relies on dotted notation, this mock will fail.
- **Recommended Fix**: Add deep dot-path lookup traversal inside `get` and `getOrThrow`.

### 6. Tight Coupling to Jest in `MockLoggerFactory`
- **Location**: [packages/nest/testing/src/lib/mock-logger-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-logger-factory.ts)
- **Problem**: The mock logger is hardcoded to return `jest.fn()`. If a consumer uses a different testing framework (like Vitest, Mocha, or the native Node.js test runner), this utility cannot be used and will crash. It also forces the library to include `"jest"` in its non-test compiler types under `tsconfig.lib.json`.
- **Recommended Fix**: Make the spies optional, generic, or check for the global `jest` object. If `jest` isn't present, return a generic mock or noop functions.

### 7. Missing `fatal` Method on Mock Logger
- **Location**: [packages/nest/testing/src/lib/mock-logger-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-logger-factory.ts)
- **Problem**: Since NestJS v10+, the `LoggerService` interface includes the `fatal` method. The mock factory is missing this method, which could cause compilation errors or runtime crashes if a component uses `logger.fatal()`.
- **Recommended Fix**: Add `fatal: jest.fn()` to the mock logger object.

---

## Test Coverage (Low Priority)

### 8. Zero Unit Test Coverage
- **Location**: `packages/nest/testing` (no `.spec.ts` files)
- **Problem**: This project provides test helpers for NestJS applications but has absolutely no tests of its own.
- **Recommended Fix**: Implement unit tests for `MockConfigServiceFactory` (validating flat lookup, nested dotted path lookup, and mutations) and `MockLoggerFactory` to ensure they accurately match NestJS requirements and work as expected.
