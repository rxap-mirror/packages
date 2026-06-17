# TODO: Angular Pipes Package Audit & Improvements

This document lists the findings and recommended fixes resulting from the audit of the `@rxap/pipes` package (located at `packages/angular/pipes`). 

---

## 🚨 Critical Functional Bugs & Logic Errors

### 1. Runtime Crash Risks (Null/Undefined Vulnerabilities)
* **Files:** 
  * [join.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/join.pipe.ts#L13-L15)
  * [limit.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/limit.pipe.ts#L12-L14)
  * [slice.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/slice.pipe.ts#L12-L14)
* **Problem:** 
  These pipes directly call prototype methods (`list.join()`, `value.slice()`) without guarding against `null` or `undefined` inputs.
* **Impact:** 
  Since Angular templates often deal with asynchronous data streams (e.g., `observable$ | async | join`), values can start as `null` or `undefined` before resolving. These pipes will cause immediate runtime application crashes.
* **Recommended Fix:** 
  Implement safe optional-chaining and fallbacks:
  ```typescript
  // join.pipe.ts
  transform(list: any[] | null | undefined, separator?: string): string {
    return list ? list.join(separator) : '';
  }

  // limit.pipe.ts & slice.pipe.ts
  transform<T>(value: readonly T[] | null | undefined, limit: number): T[] {
    return value ? value.slice(0, limit) : [];
  }
  ```

---

## 🏛️ Architectural Debt & Design Patterns

### 1. Missing DI Provider in Standalone `RxapCurrencyPipe`
* **File:** [currency.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/currency.pipe.ts#L12-L68)
* **Problem:** 
  `RxapCurrencyPipe` is marked as a standalone pipe and injects `CurrencyPipe` (from `@angular/common`) into its constructor. However, `CurrencyPipe` is only registered in the `providers` array of `CurrencyPipeModule`.
* **Impact:** 
  If a developer attempts to import `RxapCurrencyPipe` directly into a standalone component (the modern Angular 19 convention), the application will crash with a runtime DI error: `No provider for CurrencyPipe!`.
* **Recommended Fix:** 
  Add `CurrencyPipe` directly to the `providers` of the pipe's `@Pipe` decorator:
  ```typescript
  @Pipe({
    name: 'currency',
    standalone: true,
    providers: [ CurrencyPipe ] // Ensure it is provided locally
  })
  export class RxapCurrencyPipe implements PipeTransform { ... }
  ```

### 2. Duplicate & Conflicting Pipe Name (`slice`)
* **File:** [slice.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/slice.pipe.ts#L7)
* **Problem:** 
  This pipe is registered with the selector name `slice`. However, Angular's `@angular/common` package already includes a standard `SlicePipe` registered as `slice`.
* **Impact:** 
  Name clashes in templates make imports and template compilation extremely confusing and error-prone. Additionally, Angular's built-in `slice` supports both arrays and strings, while this custom one only types `readonly T[]`.
* **Recommended Fix:** 
  Either rename the pipe selector to a unique name (e.g., `rxapSlice`), or deprecate and remove the pipe if it is redundant with the standard Angular `slice` pipe.

### 3. Typo in Public API Sub-Package (`santization`)
* **Files/Directories:** 
  * `packages/angular/pipes/santization`
  * `santization.pipe.ts`
  * `santization.service.ts`
  * `SantizationService` / `SantizationPipe`
* **Problem:** 
  The word **Sanitization** is misspelled as **Santization** (missing the "i" after "t") across all directory names, filenames, class names, and selectors.
* **Impact:** 
  This affects the public entry point import: `@rxap/pipes/santization`. Misspelled APIs lead to a poor developer experience and autocomplete confusion.
* **Recommended Fix:** 
  Rename the package entrypoint, classes, and files to `sanitization`. To prevent breaking downstream users:
  1. Create a deprecated entry point / alias `santization` pointing to `sanitization`.
  2. Deprecate the old names and plan to remove them in the next major version.

### 4. Direct Pipe Instantiation Anti-pattern
* **File:** [escape-quotation-mark.pipe.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/escape-quotation-mark.pipe.ts#L15-L17)
* **Problem:** 
  `EscapeQuotationMarkPipe` instantiates `new ReplacePipe()` directly inside its `transform` method on every call. 
* **Impact:** 
  Bypasses Angular's DI system and is highly inefficient during rapid template change detection cycles.
* **Recommended Fix:** 
  Replace direct instantiation with standard string replacement or utility calls, or inject the `ReplacePipe` properly if needed.

### 5. `SantizationService` Input Checks
* **File:** [santization.service.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/santization/src/lib/santization.service.ts#L23-L25)
* **Problem:** 
  The service guards against `value === null` but does not handle `undefined`. If `value` is `undefined`, it bypasses the null-check and attempts to call `bypassSecurityTrust...` on an undefined value.
* **Recommended Fix:** 
  Ensure both `null` and `undefined` are caught and early-returned as `null`:
  ```typescript
  if (value === null || value === undefined) {
    return null;
  }
  ```

---

## 🧪 Test Coverage & Test Suite Quality

### 1. Extremely Low Test Coverage
* **Status:** 
  Out of 11 pipes/services, **only 4 have spec files**.
* **Uncovered Code:** 
  * `currency.pipe.ts` (0% coverage)
  * `get-from-object.pipe.ts` (0% coverage)
  * `join.pipe.ts` (0% coverage)
  * `limit.pipe.ts` (0% coverage)
  * `slice.pipe.ts` (0% coverage)
  * `truncate.pipe.ts` (0% coverage)
  * `santization` (both Pipe and Service have 0% coverage)
* **Action Required:** 
  Write basic tests for all untargeted files, particularly verifying edge cases like `null`, `undefined`, empty inputs, and standard transforms.

### 2. Copy-Paste Error in Test Descriptions
* **File:** [replace.pipe.spec.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/pipes/src/lib/replace.pipe.spec.ts#L3)
* **Problem:** 
  The test suite is described as `describe('EscapePipe', ...)` instead of `describe('ReplacePipe', ...)`.
* **Action Required:** 
  Update the description string to match the class under test.

---

## 📋 Comprehensive Checklist for Next Steps

- [ ] **Add Null guards in pipes:** Add safety checks in `JoinPipe`, `LimitPipe`, and `SlicePipe`.
- [ ] **Add DI providers in CurrencyPipe:** Put `CurrencyPipe` under `providers` of `RxapCurrencyPipe`.
- [ ] **Rename/Deprecate `slice` pipe:** Resolve naming collision with standard Angular `slice` pipe.
- [ ] **Initiate API Renaming of `santization`:** Transition public APIs to `sanitization`.
- [ ] **Improve test coverage:** Add `.spec.ts` files for the remaining 7 uncovered files and write positive/negative/edge cases.
- [ ] **Fix test description typo:** Update `replace.pipe.spec.ts` description.
