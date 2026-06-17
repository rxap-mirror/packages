# TODO: @rxap/nest-testing Project Audit & Improvement Plan

This document outlines the findings and recommended fixes from an audit of the `nest-testing` project. It covers Critical Bugs, Architectural Debt, and Test Coverage.

## Critical Bugs (High Priority)

### 1. Dead Code / Inoperative Init Generator due to Missing Peer Dependencies
- **Location**: [packages/nest/testing/package.json](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/package.json)
- **Problem**: The init generator exits early if there are no `peerDependencies` in the library's `package.json`. However, `packages/nest/testing/package.json` lists zero `peerDependencies`. As a result, the generator is completely dead code that does nothing.
- **Recommended Fix**: Identify the proper peer dependencies of this project (e.g., `@nestjs/common`, `@nestjs/config`, or others) and specify them under `peerDependencies` in `package.json`.

---

## Architectural Debt & Library Design (Medium Priority)

### 2. Lack of Dotted-Path Traversal in `MockConfigServiceFactory`
- **Location**: [packages/nest/testing/src/lib/mock-config-service-factory.ts:L15-L21](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-config-service-factory.ts#L15-L21)
- **Problem**: NestJS's standard `@nestjs/config` `ConfigService` supports retrieving nested properties using dot notation (e.g., `configService.get('database.host')`). The mock factory only retrieves exact keys on the flat object (`config[key]`). If the application under test relies on dotted notation, this mock will fail.
- **Recommended Fix**: Add deep dot-path lookup traversal inside `get` and `getOrThrow`.

### 3. Tight Coupling to Jest in `MockLoggerFactory`
- **Location**: [packages/nest/testing/src/lib/mock-logger-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-logger-factory.ts)
- **Problem**: The mock logger is hardcoded to return `jest.fn()`. If a consumer uses a different testing framework (like Vitest, Mocha, or the native Node.js test runner), this utility cannot be used and will crash. It also forces the library to include `"jest"` in its non-test compiler types under `tsconfig.lib.json`.
- **Recommended Fix**: Make the spies optional, generic, or check for the global `jest` object. If `jest` isn't present, return a generic mock or noop functions.

### 4. Missing `fatal` Method on Mock Logger
- **Location**: [packages/nest/testing/src/lib/mock-logger-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/testing/src/lib/mock-logger-factory.ts)
- **Problem**: Since NestJS v10+, the `LoggerService` interface includes the `fatal` method. The mock factory is missing this method, which could cause compilation errors or runtime crashes if a component uses `logger.fatal()`.
- **Recommended Fix**: Add `fatal: jest.fn()` to the mock logger object.

---

## Test Coverage (Low Priority)

### 5. Zero Unit Test Coverage
- **Location**: `packages/nest/testing` (no `.spec.ts` files)
- **Problem**: This project provides test helpers for NestJS applications but has absolutely no tests of its own.
- **Recommended Fix**: Implement unit tests for `MockConfigServiceFactory` (validating flat lookup, nested dotted path lookup, and mutations) and `MockLoggerFactory` to ensure they accurately match NestJS requirements and work as expected.
