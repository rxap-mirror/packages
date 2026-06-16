# TODO: @rxap/reflect-metadata Project Improvements

This document lists critical bugs, architectural issues, and missing test coverage identified during the audit of the `@rxap/reflect-metadata` package.

---

## 🚨 Critical Bugs

### 1. Prototype Mutation / Memory Reference Leak in Nested Metadata Maps
**Location:** [packages/reflect-metadata/src/lib/meta-data.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/reflect-metadata/src/lib/meta-data.ts)
- **Problem:** In both `setMetadataMapSet` and `setMetadataMapMap`, when copy-on-write is triggered to inherit parent/prototype class metadata, the code performs a shallow copy of the parent map (`new Map(parentMap.entries())`). This copies the nested `Set` or `Map` instances by reference. When a child class subsequently adds or sets values in these nested structures, it directly mutates the parent class's shared collections, violating class metadata encapsulation.
- **Impact:** Child classes will leak their metadata configurations into parent classes, leading to unpredictable runtime behavior, security issues, or incorrect configuration overrides across the application.
- **Recommended Fix:** 
  In `setMetadataMapSet`, deep-copy nested `Set` instances:
  ```typescript
  if (!map) {
    const parentMap: Map<K, Set<V>> | null = getMetadata(metadataKey, target, propertyKey);
    if (parentMap) {
      map = new Map();
      for (const [k, s] of parentMap.entries()) {
        map.set(k, new Set(s));
      }
    } else {
      map = new Map<K, Set<V>>();
    }
  }
  ```
  In `setMetadataMapMap`, deep-copy nested `Map` instances:
  ```typescript
  if (!map) {
    const parentMap: Map<K, Map<K2, V>> | null = getMetadata(metadataKey, target, propertyKey);
    if (parentMap) {
      map = new Map();
      for (const [k, m] of parentMap.entries()) {
        map.set(k, new Map(m.entries()));
      }
    } else {
      map = new Map<K, Map<K2, V>>();
    }
  }
  ```

### 2. Always-True Condition in Init Generator's DevDependency Check
**Location:** [packages/reflect-metadata/src/generators/init/generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/reflect-metadata/src/generators/init/generator.ts)
- **Problem:** The condition checking whether to migrate a package to `devDependencies` is implemented as:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
  ```
  Since any non-empty array in JavaScript is truthy, the expression `!isDevDependency && [...]` is equivalent to `!isDevDependency`. It completely misses checking the package name against the regular expressions using `.some()`.
- **Impact:** EVERY library initialized via this generator that is not already in `devDependencies` is incorrectly forced into `devDependencies`, regardless of its name or type.
- **Recommended Fix:**
  Add `.some((rx) => rx.test(packageName))` to the array, matching the implementation of the preceding block:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
  ```

### 3. Broken Initialization Check in Proxy Change Detection Handler
**Location:** [packages/reflect-metadata/src/lib/change.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/reflect-metadata/src/lib/change.ts)
- **Problem:** The `set` trap in `handler` checks:
  ```typescript
  if (!this.hasOwnProperty('initialized') || instance.initialized === true) {
  ```
  Inside proxy handler traps, `this` refers to the handler object (`handler`), NOT the target object (`instance`). Since the `handler` object has no `initialized` property, `!this.hasOwnProperty('initialized')` always evaluates to `true`.
- **Impact:** Change detection runs unconditionally, even during initialization phases when the object has `initialized: false`.
- **Recommended Fix:**
  Inspect the `instance` instead of `this`:
  ```typescript
  if (!('initialized' in instance) || instance.initialized === true) {
  ```

---

## 📐 Architectural Debt

### 1. Dead Code / Unused Change Detection Utilities
- **Observation:** `ProxyChangeDetection`, `RxapDetectChanges`, and related utilities are exported from `@rxap/reflect-metadata` but are not consumed anywhere else in the monorepo workspace.
- **Recommendation:** If these utilities are part of an obsolete or incomplete feature, consider deprecating them or removing them entirely to decrease the library's footprint and maintenance overhead. If they are intended for future use, write comprehensive test suites for them.

---

## 🧪 Test Coverage & Inconsistencies

### 1. Inaccurate Test Suite Labeling
- **Observation:** The root test suite describe block in `meta-data.spec.ts` is labeled as `@rxap/utilities` instead of `@rxap/reflect-metadata`.
- **Recommended Fix:** Rename the outer block to match the package name:
  ```typescript
  describe('@rxap/reflect-metadata', () => {
  ```

### 2. Missing Tests for Nested Map Reference Leak Cases
- **Observation:** Although there are tests checking that parent metadata maps aren't mutated when adding new keys to child maps, there are no tests validating the inner collections (i.e. mutating a nested `Set` or `Map` under an inherited parent key).
- **Recommended Fix:** Add tests specifically verifying that modifying a pre-existing key's nested `Set` (in `setMetadataMapSet`) or nested `Map` (in `setMetadataMapMap`) on a child class does NOT alter the parent class's metadata.

### 3. Zero Test Coverage for Change Detection Utilities
- **Observation:** `change.ts` has exactly 0% test coverage.
- **Recommended Fix:** Create `change.spec.ts` and write tests for `ProxyChangeDetection`, `RxapDetectChanges`, and the custom change tracking behavior.
