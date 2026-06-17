# TODO - nest-oauth2-proxy Audit Findings & Recommended Fixes

This document outlines the findings of the comprehensive project audit for `@rxap/nest-oauth2-proxy` (`packages/nest/oauth2-proxy`). It identifies critical bugs, architectural debt, anti-patterns, and test coverage gaps, along with recommended action items.

---

## 1. Anti-Patterns & Code Quality Issues

### 🟡 Spelling Typo in Code & Directory Structure
- **Location**: `src/lib/decotators/` (Directory Name) and `src/index.ts` (Import Paths / Comments)
- **Issue**: The directory is named `decotators` instead of `decorators`. The index file imports from `./lib/decotators/...` and uses `// region decotators`.
- **Impact**: Code readability, aesthetic standards, and searchability are negatively affected. While deep imports from this folder might be used, all exports are re-exported in `src/index.ts`.
- **Recommended Fix**: Rename the folder to `decorators`, update the imports in `src/index.ts` and update any configurations referencing it. (Note: Ensure no external packages depend on deep path imports before renaming).

---

## 2. Architectural Debt

### 🟡 Hardcoded Headers & Lack of Customization
- **Location**: Decorators inside `src/lib/decotators/`
- **Issue**: Header names like `x-auth-request-access-token` are hardcoded inside the decorators.
- **Impact**: If a consumer's OAuth2 proxy is configured to use different header names (e.g. `X-Auth-Token` or `X-User-Email`), these decorators are unusable.
- **Recommended Fix**: Provide a way to configure custom header names (e.g., through a dynamic NestJS Module configuration or a configurable utility), or support a custom header mapping system.

---

## 3. Test Coverage Gaps

### 🔴 Zero Test Coverage
- **Issue**: The library has `tsconfig.spec.json` and `jest.config.ts` configured, but has **0 tests** (no `.spec.ts` files exist).
- **Impact**: Untested code is highly prone to regression, especially with NestJS version upgrades.
- **Recommended Fix**: Implement unit tests for all param decorators using NestJS mock execution contexts. Test scenarios should cover:
  1. Header presence and extraction.
  2. Throwing `BadRequestException` on missing headers.
  3. Throwing `BadRequestException` on multiple duplicate headers.
  4. Correct splitting of comma-separated values in `AuthRequestGroups`.
