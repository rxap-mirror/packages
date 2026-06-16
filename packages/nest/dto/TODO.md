# TODO: `@rxap/nest-dto` Audit Findings & Improvements

This document lists the findings from the audit of the `@rxap/nest-dto` package, categorized by critical bugs, architectural debt, and recommended next steps.

---

## 🚨 Critical Logic & Functional Bugs

### 1. Swallowed Validation Errors in `ToDtoInstance` & `ToDtoInstanceList`
* **File:** [to-dto-instance.ts](src/lib/to-dto-instance.ts)
* **Description:** The utility functions `ToDtoInstance` and `ToDtoInstanceList` are designed to convert plain objects to DTO instances and perform validations on them. However, they call `validateSync` from `class-validator` but **ignore its return value** (which is an array of `ValidationError` objects).
* **Impact:** No validation errors are ever thrown or handled. Invalid data payloads silently pass validation, completely defeating the purpose of these validation helpers.
* **Code Location:**
  ```typescript
  export function ToDtoInstance<T>(...): T {
    const instance: T = plainToInstance(cls, plain, options);
    validateSync(instance as object, vOptions); // <--- Swallowed return value
    return instance;
  }
  ```
* **Recommended Fix:** Check if the returned array contains errors and throw an appropriate exception (e.g., a custom exception or a NestJS `BadRequestException`).
  ```typescript
  const errors = validateSync(instance as object, vOptions);
  if (errors.length > 0) {
    throw new ValidationErrorException(errors); // Or throw an error based on your framework rules
  }
  ```

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Mixing Virtual Tree with Physical File Paths
* **File:** [generator.ts](src/generators/init/generator.ts)
* **Description:** The init generator mixes virtual `Tree` checks with direct Node.js `require` calls inside `node_modules`. 
* **Impact:** `node_modules` is typically gitignored and excluded from virtual Tree index tracking. Checking `tree.exists` inside `node_modules` can fail or produce unpredictable behavior in some virtual tree environments, while the subsequent direct Node `require` might work.
* **Recommended Fix:** Avoid using the virtual `tree` to query or check paths inside `node_modules`. Instead, use standard Node.js path resolutions (such as `require.resolve`) to verify and import files in `node_modules`.

### 2. Implicit `rows` validation in `PageDto`
* **File:** [page.dto.ts](src/lib/page.dto.ts)
* **Description:** The `PageDto<RowType>` class defines `abstract rows: RowType[];` but lacks any `@Expose()` or validation decorators on the `rows` property.
* **Impact:** While `PageDto` is abstract and cannot be directly instantiated, subclasses must be extremely careful to explicitly redeclare and decorate `rows`. If subclasses omit this step, `rows` will be excluded or unvalidated.
* **Recommended Fix:** Add a JSDoc warning or establish a strict convention reminding developers that inheriting from `PageDto` requires decorating the `rows` field in the subclass.

---

## 🧪 Test Coverage & Quality Assurance

### 1. Zero Test Coverage
* **Status:** 🔴 **Critical Deficiency**
* **Description:** There are **zero test files** in this entire package. The test command runs but completes with `No tests found`.
* **Impact:** Critical issues like swallowed validation errors and generator logical mistakes went completely unnoticed because there are no tests to verify package behavior.
* **Recommended Fix:** Implement Jest unit tests:
  - Create `src/lib/to-dto-instance.spec.ts` to verify that `ToDtoInstance` and `ToDtoInstanceList` correctly transform plain objects, and crucially, that they throw errors when given invalid fields.
  - Create test coverage for each of the core DTO files (e.g. `IdDto`, `UuidDto`, `ValueDto`) to ensure class-transformer and class-validator schemas are robust.
