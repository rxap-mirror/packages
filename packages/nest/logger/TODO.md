# TODO: nest-logger Audit and Refactoring Plan

This file outlines the findings from the audit of the `@rxap/nest-logger` package, including critical bugs, functional issues, architectural debt, and testing gaps, along with recommended solutions.

---

## 🐛 Logic & Functional Bugs

### 1. Missing `%JSON` Interpolation in Google Cloud Logging
* **File:** [google-logging-print-messages-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/lib/google-logging-print-messages-factory.ts#L69-L72)
* **Description:** When using `%JSON` placeholders with Google Cloud Logging, the `%JSON` string in the log message is never replaced with actual content in the final `message` payload. It remains as-is (e.g., `"test %JSON"`), and the arguments are just put into the `interpolates` payload property. This is highly inconsistent with local console output, which correctly interpolates the values.
* **Impact:** Reduced log readability in GCP Log Explorer.
* **Recommended Fix:** Ensure that when `%JSON` is present, the message string is interpolated properly before being written to the `message` property of the Google Cloud Log entry.

### 2. Blocked Interpolation Queue in `RxapLogger.interpolate`
* **File:** [logger.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/lib/logger.ts#L69-L95)
* **Description:** In `RxapLogger.interpolate`, when an unsupported parameter type (such as a `function`, `symbol`, or `bigint`) is matched against a `%JSON` placeholder, it fails all type checks and is unshifted back to the front of the `messages` array.
  * If there are multiple `%JSON` placeholders, the next placeholder's replacement will shift the exact same unsupported parameter again, unshift it again, and block any subsequent valid arguments from ever being processed or interpolated.
* **Impact:** Broken log formatting if developers pass unsupported types or callbacks.
* **Recommended Fix:** Do not unshift the parameter if it is unsupported. Instead, safely stringify it (e.g., `String(param)` or `param.toString()`) or replace it with a fallback representation like `"<unsupported type>"` so the queue is not blocked.

### 3. Copy-paste Error in 10.0.0 Migration
* **File:** [replace-setup-function-with-module-import.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/migrations/10.0.0/replace-setup-function-with-module-import/replace-setup-function-with-module-import.ts#L35)
* **Description:** The migration checks for `SentryModule` instead of `LoggerModule` before coercing the `LoggerModule` import:
  ```typescript
  if (!HasNestModuleImport(sourceFile, { moduleName: 'SentryModule' })) {
    CoerceNestModuleImport(sourceFile, {
      moduleName: 'LoggerModule',
      moduleSpecifier: '@rxap/nest-logger'
    });
  }
  ```
  If `SentryModule` is present, it will skip importing `LoggerModule`, which makes no sense and is clearly a copy-paste issue.
* **Impact:** Incomplete or failed migrations for applications that have Sentry configured.
* **Recommended Fix:** Update the condition to check for `LoggerModule`.

---

## 🧪 Test Coverage Gap

### 4. Limited Test Coverage for Google Cloud Logging Formatter
* **File:** `src/lib/google-logging-print-messages-factory.ts`
* **Status (2026-06):** A spec now covers the formatter for single-object, multi-argument and `%JSON` string cases, and verifies the input array is not mutated (added alongside the data-loss fix).
* **Remaining:** Extend coverage to the `%JSON` interpolation behavior (item 1) and severity mapping for all log levels once those are addressed.
