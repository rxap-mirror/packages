# TODO - angular-icon

This document outlines the findings, critical bugs, logic errors, architectural debt, and recommended improvements identified during the project audit of `angular-icon`.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Async Package Installation & Lifecycle Race Condition in Generator
* **Location:** `packages/angular/icon/src/generators/init/generator.ts` (Lines 74–137)
* **Description:**
  The generator dynamically adds missing peer dependencies to `package.json` and invokes `installPackagesTask(tree)`. However, `installPackagesTask` is a post-generation callback registered to run *after* the generator successfully finishes execution. It does *not* run synchronously.
  Directly after registering the installation task, the code loops through `missingPeerDependencies`, checks for their existence in `node_modules`, and attempts to `require()` and run their `init` generators. Because the installation task hasn't actually run, these packages are not yet installed in `node_modules` during the generator's execution.
  This leads to the files being missed/skipped, or throwing errors if the developer does not already have them globally/locally installed.
* **Recommended Fix:** Refactor peer dependency generator triggering. Instead of executing nested generators dynamically during the initial run of this generator:
  - Register peer init generator tasks as separate, post-install processes or custom schematics.
  - Or, instruct developers to run initialization commands in a multi-step workflow.

---

## 🏛️ Architectural Debt

### 1. `@NgModule` Environment Provider Anti-Pattern
* **Location:** `packages/angular/icon/src/lib/icon.module.ts` (Line 18)
* **Description:**
  `IconModule` registers `provideHttpClient(withInterceptorsFromDi())` directly in its `@NgModule` providers list:
  ```typescript
  @NgModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
  ```
  `provideHttpClient` is designed to configure the environment-scoped HTTP client (introduced in Angular 15+ for standalone APIs). Registering environment-scoped providers inside an `@NgModule` metadata block is an anti-pattern that can lead to unexpected behaviors, duplicate provider configurations, or issues with isolation.
* **Recommended Fix:** Refactor `IconModule` to import `HttpClientModule` (since it is an NgModule-based approach), or deprecate the module entirely in favor of the standalone provider function `ProvideIconAssetPath`.

### 2. Multi-Instantiation Race Conditions in Module
* **Location:** `packages/angular/icon/src/lib/icon.module.ts` (Lines 21–25)
* **Description:**
  The `IconModule` constructor eagerly loads the icon sets:
  ```typescript
  constructor(
    iconLoaderService: IconLoaderService,
  ) {
    iconLoaderService.load();
  }
  ```
  If `IconModule` is imported in multiple modules (e.g., lazy-loaded feature modules or shared sub-modules), the icon sets will be loaded repeatedly. While the `MatIconRegistry` mitigates duplicate network requests to some extent, redundant security sanitizations and registry calls still occur.
* **Recommended Fix:** Ensure `IconModule` is only imported once at the root, or shift completely to `ProvideIconAssetPath` inside the `ApplicationConfig` provider array to ensure the initialization runs exactly once as part of `provideAppInitializer`.

---

## 🧪 Test Coverage & Configuration

### 1. Zero Test Coverage
* **Location:** Whole project (`packages/angular/icon`)
* **Description:**
  There are absolutely zero unit or integration test files (`*.spec.ts`) in the entire project. The `test` target in `project.json` is configured with `"passWithNoTests": true`, which masks the complete absence of tests.
* **Recommended Fix:**
  - Implement basic unit tests for the core service (`icon-loader.service.spec.ts`) to verify that icon sets are properly registered with the `MatIconRegistry`.
  - Add test coverage for the provider function `ProvideIconAssetPath` (`provide-icon-asset-path.spec.ts`).
  - Add test coverage for the initialization generator (`src/generators/init/generator.spec.ts`) to prevent future regressions in dependency/devDependency sorting.
