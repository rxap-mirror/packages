# TODO: nest-supabase Package Audit & Improvement Plan

This file lists the findings, architectural issues, and critical bugs identified during the project audit of the `@rxap/nest-supabase` package, along with recommended fixes.

---

## 🚨 Critical Bugs

### 1. Array Evaluation Logic Bug in `init` Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/generators/init/generator.ts#L46-L51)
* **Description:** Lines 46–51 contain a critical logic bug where an array of regular expressions is evaluated directly inside an `if` conditional without a matching method (like `.some()`):
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
  ```
  Since any non-empty array in JavaScript is truthy, this condition simplifies to `!isDevDependency && true`. The generator will execute this block for any package that is not a dev dependency, completely bypassing the intended regex filter.
* **Impact:** Broken package categorisation during schematic execution and initialization, leading to incorrect dependency updates in `package.json`.
* **Recommended Fix:** Change the code to use `.some(...)` identical to the preceding condition on line 36:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
  ```

---

## 🧪 Test Coverage

### 2. Zero Test Coverage / Missing Tests
* **Description:** The package has completely missing test coverage. No unit or integration test files (`.spec.ts`) exist in the codebase.
* **Impact:** Any changes to module resolution, option loading, or client initialization are highly prone to regressions.
* **Recommended Fix:** 
  - Create a test suite using Jest (configured under `tsconfig.spec.json` and `jest.config.ts`).
  - Add tests for `SupabaseService` to verify that the underling `SupabaseClient` is initialized correctly with injected URL and keys.
  - Add tests for `SupabaseOptionsFactory` and `SupabaseModuleOptionsLoader`.
  - Add tests for `SupabaseModule` registration (`register` and `registerAsync`).

---

## 🏛️ Architectural Debt & Coupling

### 3. Hardcoded Environment Keys in `SupabaseModuleOptionsLoader`
* **File:** [supabase-module-options-loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/lib/supabase-module-options-loader.ts#L17-L18)
* **Description:** `SupabaseModuleOptionsLoader` relies directly on the hardcoded environment keys `SUPABASE_URL` and `SUPABASE_KEY` from the `ConfigService`.
* **Impact:** Applications that use different environment naming conventions (e.g. `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_API_URL`) cannot use the automatic options loader without modifying their global environment variable names.
* **Recommended Fix:** Allow custom environment key overrides to be supplied to the loader, or configure option loading with key mappings.

### 4. Discarded `options` in `SupabaseModuleOptionsLoader`
* **File:** [supabase-module-options-loader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/lib/supabase-module-options-loader.ts#L15-L20)
* **Description:** The `create()` method only returns `supabaseUrl` and `supabaseKey`. It completely ignores/omits other client-specific configuration options (`SupabaseClientOptions` like `auth`, `db`, `global`, etc.).
* **Impact:** Consumers cannot supply extra configuration options dynamically when using the module options loader.
* **Recommended Fix:** Read additional `options` (e.g., from `ConfigService` under a sub-key like `SUPABASE_OPTIONS` or `SUPABASE_CLIENT_CONFIG`) inside the loader's `create()` method.

### 5. Single-Instance Restriction (Strictly Global Module)
* **File:** [supabase.module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/lib/supabase.module.ts#L34)
* **Description:** `SupabaseModule` is statically marked as `@Global()` and uses a hardcoded, single `SUPABASE_OPTIONS` injection token.
* **Impact:** This design severely limits applications to a single global Supabase client instance. If an application needs to connect to multiple Supabase databases/projects, it cannot do so easily using this module.
* **Recommended Fix:** Allow the module to opt-out of global registration or support multi-client configurations by using a "connection name" or feature-key to register and inject distinct, named instances of the client.

### 6. Extending `SupabaseClient` Directly in `SupabaseService`
* **File:** [supabase.service.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/lib/supabase.service.ts#L27)
* **Description:** `SupabaseService` extends `SupabaseClient` directly.
* **Impact:** Tight coupling with the external library's class structure. This makes mock-testing or swapping the service's implementation difficult, as any consumer interacts with full raw class signatures from `@supabase/supabase-js`.
* **Recommended Fix:** Wrap `SupabaseClient` in a service that exposes a `client` property (or getter), or make `SupabaseService` implement a custom interface to improve testability and mockability.

---

## 🧹 Code Quality & Anti-Patterns

### 7. Direct Mutation of Options in `SupabaseOptionsFactory`
* **File:** [supabase.module.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/supabase/src/lib/supabase.module.ts#L64-L70)
* **Description:** `SupabaseOptionsFactory` mutates the input parameter object directly to set default values:
  ```typescript
  export function SupabaseOptionsFactory(options: SupabaseModuleOptions) {
    options.options ??= {};
    options.options.auth ??= {};
    options.options.auth.autoRefreshToken ??= false;
    options.options.auth.persistSession ??= false;
    return options;
  }
  ```
* **Impact:** If the passed options object is frozen or shared across multiple contexts, direct mutation will throw runtime exceptions or cause unexpected side-effects.
* **Recommended Fix:** Deep clone or return a new merged options object instead of mutating the parameter directly:
  ```typescript
  export function SupabaseOptionsFactory(options: SupabaseModuleOptions): SupabaseModuleOptions {
    return {
      ...options,
      options: {
        ...options.options,
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          ...options.options?.auth,
        },
      },
    };
  }
  ```
