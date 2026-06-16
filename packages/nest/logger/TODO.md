# TODO: nest-logger Audit and Refactoring Plan

This file outlines the findings from the audit of the `@rxap/nest-logger` package, including critical bugs, functional issues, architectural debt, and testing gaps, along with recommended solutions.

---

## 🚨 Critical Bugs (Data Loss)

### 1. Object Logging Data Loss in `googleLoggingPrintMessagesFactory`
* **File:** [google-logging-print-messages-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/lib/google-logging-print-messages-factory.ts#L58-L91)
* **Description:** If the first argument passed to the logger is an object (or any non-string), it is shifted from the `messages` array and completely discarded from the log output under most circumstances.
  * **Scenario A:** If a single object is logged, e.g., `logger.log({ userId: 1, event: 'login' })`:
    * `firstMessage` receives the object, and `messages` becomes empty.
    * It falls into the `else` block because `firstMessage` is not a string.
    * Since `messages.length` is `0`, it falls into the inner `else` block: `jsonPayload = { messages }` (which evaluates to `{ messages: [] }`).
    * The logged object in `firstMessage` is never referenced again, resulting in complete loss of the logged object data.
  * **Scenario B:** If multiple objects are logged, e.g., `logger.log({ a: 1 }, { b: 2 })`:
    * `firstMessage` is `{ a: 1 }`. `messages` is `[{ b: 2 }]`.
    * It goes to the `else` block. Since `messages.length === 1`, it sets `jsonPayload = messages[0]` (which is `{ b: 2 }`).
    * The first object `{ a: 1 }` is completely lost.
* **Impact:** High probability of silent data loss in production environments using Google Cloud Logging.
* **Recommended Fix:** Refactor the message parsing logic to ensure `firstMessage` is never discarded. If `firstMessage` is not a string, it should be serialized or included as part of the JSON payload. Copy the `messages` array instead of mutating the argument directly (mutating arguments is an anti-pattern and can cause side effects).

---

## 🐛 Logic & Functional Bugs

### 2. Missing `%JSON` Interpolation in Google Cloud Logging
* **File:** [google-logging-print-messages-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/lib/google-logging-print-messages-factory.ts#L69-L72)
* **Description:** When using `%JSON` placeholders with Google Cloud Logging, the `%JSON` string in the log message is never replaced with actual content in the final `message` payload. It remains as-is (e.g., `"test %JSON"`), and the arguments are just put into the `interpolates` payload property. This is highly inconsistent with local console output, which correctly interpolates the values.
* **Impact:** Reduced log readability in GCP Log Explorer.
* **Recommended Fix:** Ensure that when `%JSON` is present, the message string is interpolated properly before being written to the `message` property of the Google Cloud Log entry.

### 3. Blocked Interpolation Queue in `RxapLogger.interpolate`
* **File:** [logger.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/lib/logger.ts#L69-L95)
* **Description:** In `RxapLogger.interpolate`, when an unsupported parameter type (such as a `function`, `symbol`, or `bigint`) is matched against a `%JSON` placeholder, it fails all type checks and is unshifted back to the front of the `messages` array.
  * If there are multiple `%JSON` placeholders, the next placeholder's replacement will shift the exact same unsupported parameter again, unshift it again, and block any subsequent valid arguments from ever being processed or interpolated.
* **Impact:** Broken log formatting if developers pass unsupported types or callbacks.
* **Recommended Fix:** Do not unshift the parameter if it is unsupported. Instead, safely stringify it (e.g., `String(param)` or `param.toString()`) or replace it with a fallback representation like `"<unsupported type>"` so the queue is not blocked.

### 4. Copy-paste Error in 10.0.0 Migration
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

## 🏗️ Architectural Debt & Anti-patterns

### 5. Physical Path Usage in Nx Init Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/logger/src/generators/init/generator.ts#L11-L14)
* **Description:** The generator uses physical disk paths via `__dirname` to locate `package.json` and interact with the virtualized `Tree`:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
  Generators should rely solely on the virtualized `Tree` structure and virtual paths. Directly reading physical paths or requiring files from `node_modules` during dry-runs can cause unexpected discrepancies between dry-run and actual runs, and can break tests.
* **Recommended Fix:** Query package resources relative to workspace root or use devkit utilities. Avoid physical disk resolutions where virtual counterparts are available.

---

## 🧪 Test Coverage Gap

### 6. Zero Test Coverage for Google Cloud Logging Formatter
* **File:** `src/lib/google-logging-print-messages-factory.ts` has **0% test coverage**.
* **Description:** While the overall test suite passes, there are zero unit tests verifying `googleLoggingPrintMessagesFactory` behavior. This is why major data loss bugs went undetected.
* **Recommended Fix:** Add comprehensive test suites for `googleLoggingPrintMessagesFactory`, simulating both string messages, single object messages, multiple object messages, and `%JSON` interpolation.
