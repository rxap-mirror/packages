# TODO - nest-oauth2-proxy Audit Findings & Recommended Fixes

This document outlines the findings of the comprehensive project audit for `@rxap/nest-oauth2-proxy` (`packages/nest/oauth2-proxy`). It identifies critical bugs, architectural debt, anti-patterns, and test coverage gaps, along with recommended action items.

---

## 1. Critical Bugs & Logic Errors

### 🔴 Virtual Tree check for `node_modules` file existence
- **Location**: `src/generators/init/generator.ts` (Line 90, 102, 118)
- **Code**:
  ```typescript
  if (!tree.exists(peerPackageJsonFilePath)) {
  ```
- **Issue**: The virtual `Tree` in Nx does not track files inside `node_modules` (as it is excluded/ignored by default). Therefore, any call to `tree.exists(...)` targeting `node_modules/...` will always return `false`.
- **Impact**: The peer dependency initialization loop (lines 83–137) is completely broken. It logs `Peer dependency {peer} has no package.json` and skips the peer initialization, meaning peer generator configurations are never executed.
- **Recommended Fix**: Use the physical filesystem (Node.js `fs` module) to check for existence and read files in `node_modules`, rather than querying the virtual `Tree`.
  ```typescript
  import { existsSync, readFileSync } from 'fs';
  // Use existsSync instead of tree.exists for node_modules paths
  ```

---

## 2. Anti-Patterns & Code Quality Issues

### 🟡 Virtual Tree path calculation using physical `__dirname`
- **Location**: `src/generators/init/generator.ts` (Lines 11-14)
- **Code**:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
- **Issue**: Resolving the virtual `tree`'s file path using a relative offset from the physical `__dirname` is highly fragile. If the generator is run from compiled bundle code or in virtualized setups (like dry-runs), the physical `__dirname` might point to a path that does not map cleanly into the virtual workspace root.
- **Recommended Fix**: Locate files in a more robust workspace-agnostic manner or avoid reading the local `package.json` dynamically via the `Tree` if a static configuration can be used.

### 🟡 Spelling Typo in Code & Directory Structure
- **Location**: `src/lib/decotators/` (Directory Name) and `src/index.ts` (Import Paths / Comments)
- **Issue**: The directory is named `decotators` instead of `decorators`. The index file imports from `./lib/decotators/...` and uses `// region decotators`.
- **Impact**: Code readability, aesthetic standards, and searchability are negatively affected. While deep imports from this folder might be used, all exports are re-exported in `src/index.ts`.
- **Recommended Fix**: Rename the folder to `decorators`, update the imports in `src/index.ts` and update any configurations referencing it. (Note: Ensure no external packages depend on deep path imports before renaming).

---

## 3. Architectural Debt

### 🟡 Hardcoded Headers & Lack of Customization
- **Location**: Decorators inside `src/lib/decotators/`
- **Issue**: Header names like `x-auth-request-access-token` are hardcoded inside the decorators.
- **Impact**: If a consumer's OAuth2 proxy is configured to use different header names (e.g. `X-Auth-Token` or `X-User-Email`), these decorators are unusable.
- **Recommended Fix**: Provide a way to configure custom header names (e.g., through a dynamic NestJS Module configuration or a configurable utility), or support a custom header mapping system.

---

## 4. Test Coverage Gaps

### 🔴 Zero Test Coverage
- **Issue**: The library has `tsconfig.spec.json` and `jest.config.ts` configured, but has **0 tests** (no `.spec.ts` files exist).
- **Impact**: Untested code is highly prone to regression, especially with NestJS version upgrades.
- **Recommended Fix**: Implement unit tests for all param decorators using NestJS mock execution contexts. Test scenarios should cover:
  1. Header presence and extraction.
  2. Throwing `BadRequestException` on missing headers.
  3. Throwing `BadRequestException` on multiple duplicate headers.
  4. Correct splitting of comma-separated values in `AuthRequestGroups`.
