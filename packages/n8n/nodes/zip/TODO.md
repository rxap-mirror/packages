# TODO: @rxap/n8n-nodes-zip

This file documents the findings and recommended actions from the project audit conducted on the `@rxap/n8n-nodes-zip` package.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Typo in Parameter Names & UI Labels
In `src/lib/Zip/Zip.node.ts` (and propagated to sister node `Tar.node.ts`):
* **Issue:** The binary data property parameter is incorrectly named `inputDateProperty` and labeled as `"Input Date Property"`.
* **Impact:** Confuses users because zip/tar operations deal with **binary data**, not date properties.
* **Fix:** Rename the parameter to `inputDataProperty` (or `inputBinaryProperty`) and update the `displayName` to `"Input Data Property"` (or `"Binary Property Name"`).

---

## 📐 Architectural Debt & Inconsistencies

### 1. Inconsistent Error Handling & Robustness
* **Issue:** Unlike the sister package `@rxap/n8n-nodes-tar`, the `execute` method in `Zip.node.ts` lacks individual `try-catch` blocks per iteration. Furthermore, the class/method is not decorated with `@CaptureExecutionError()`.
* **Impact:** If zip extraction fails for a single item (due to bad zip, wrong password, or missing property), the entire execution loop fails immediately. No partial results are returned, crashing the whole workflow.
* **Fix:**
  * Wrap loop operations in a per-item `try-catch` block.
  * Integrate `@CaptureExecutionError()` from `@rxap/n8n-utilities`.
  * Return execution error objects for failed items instead of throwing outright, matching the pattern implemented in `Tar.node.ts`.

### 2. Synchronous/Blocking Event Loop Operations
* **Issue:** The node utilizes `AdmZip`'s synchronous `zip.extractAllTo(workDir, ...)` method.
* **Impact:** Because Node.js is single-threaded, synchronous compression/extraction of large files blocks the entire event loop, making the n8n application process completely unresponsive during execution.
* **Fix:** Consider delegating CPU-heavy extractions to a child process, or use a streaming / Promise-based extraction library to avoid blocking the main event loop.

### 3. Production Dependencies Misclassification
* **Issue:** `@nx/devkit` is defined under `dependencies` in `package.json`.
* **Impact:** `@nx/devkit` is exclusively used by the generator/schematic configuration scripts and is not required by n8n at runtime. Adding it to `dependencies` inflates the production package size.
* **Fix:** Move `@nx/devkit` to `devDependencies`.

---

## 🧪 Test Coverage & CI

### 1. Complete Lack of Unit/Integration Tests
* **Issue:** While a test runner is configured (`jest.config.ts`, `tsconfig.spec.json`), the package contains **0% test coverage** with no actual `*.spec.ts` or `*.test.ts` files present.
* **Fix:**
  * Add unit tests in `src/lib/Zip/Zip.node.spec.ts` targeting:
    * Standard extraction from a mock zip buffer.
    * Error handling on incorrect or missing passwords.
    * Graceful handling when the specified binary property does not exist on the node.
