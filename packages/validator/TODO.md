# TODO: @rxap/validator Audit Findings & Roadmap

This file contains the findings, architectural feedback, and prioritized improvements identified during the audit of the `@rxap/validator` library.

---

## 🟡 Functional Issues & Anti-Patterns

### 1. Virtualized Tree Anti-pattern / Broken Peer Initialization
* **Location:** `src/generators/init/generator.ts` (Lines 90-110)
* **Description:**
  The generator checks and reads files inside `node_modules` using the virtualized Nx `Tree` object:
  ```typescript
  const peerPackageJsonFilePath = join('node_modules', ...peer.split('/'), 'package.json');
  if (!tree.exists(peerPackageJsonFilePath)) {
    console.log(`Peer dependency ${peer} has no package.json`);
    continue;
  }
  ```
  `node_modules` is excluded from the virtualized `Tree` workspace file representation. As a result, `tree.exists(...)` will always return `false`, causing the generator to silently skip peer dependency initialization and print `"Peer dependency ... has no package.json"`.
* **Recommended Fix:**
  Since `node_modules` are physical files, perform physical file operations using standard Node.js `fs` module, or use `@nx/devkit`'s package/JSON reading helpers that bypass the virtual tree for external dependencies.
  ```typescript
  import * as fs from 'fs';
  import { join } from 'path';

  // Inside the loop:
  const physicalPath = join(tree.root, 'node_modules', ...peer.split('/'), 'package.json');
  if (!fs.existsSync(physicalPath)) {
    // fallback or continue
  }
  ```

### 2. Widespread `assertString` Hard Type Errors
* **Location:** Multiple files (e.g., `src/lib/isEmail.ts`, `src/lib/isURL.ts`, `src/lib/isJSON.ts`)
* **Description:**
  Validators uniformly invoke `assertString(str)` at their entry points. `assertString` throws a hard `TypeError` if the input is not a string (e.g. `null` or `undefined`). 
  In real-world applications (such as forms or API endpoints), empty or mismatched data types frequently occur. Throwing hard runtime `TypeError` exceptions instead of returning `false` is an anti-pattern that can crash client interfaces or API handlers unless wrapped in `try-catch` blocks.
* **Recommended Fix:**
  Refactor validation entry points to return `false` on non-string inputs rather than throwing, or provide a flag/config option to toggle hard assertions vs. soft boolean failure.
  ```typescript
  if (typeof str !== 'string') {
    return false;
  }
  ```

### 3. Incomplete Primitive Support in `isJSON`
* **Location:** `src/lib/isJSON.ts` (Lines 16-22)
* **Description:**
  When `allow_primitives` is `true`, `isJSON` only supports `null`, `false`, and `true`. Other valid JSON primitive values, such as numeric values (`123`) and string literals (`"abc"`), will incorrectly return `false` because they are not present in the hardcoded `primitives` array list.
* **Recommended Fix:**
  Ensure standard JSON primitive data types (numbers, strings) are included when `allow_primitives` is enabled:
  ```typescript
  const primitives: Array<any> = [];
  if (options.allow_primitives) {
    primitives.push(null, false, true);
    // Include number and string checks or type verification
  }
  ```

---

## 🔵 Test Coverage

### 4. Complete Absence of Tests (0% Coverage)
* **Location:** Entire project
* **Description:**
  Although a Jest configuration (`jest.config.ts`) exists, there are **0** test files (`*.spec.ts`) in the package.
  Validators are critical utility functions often relying on complex, edge-case-prone regular expressions. Having zero test coverage represents a high-risk area for regression, functional defects, or Regular Expression Denial of Service (ReDoS) vulnerabilities.
* **Recommended Fix:**
  Establish a unit testing suite under `src/lib/` using Jest to cover major validator functions (`isEmail`, `isURL`, `isIP`, etc.) with test suites detailing both positive and negative validation test cases.

---

## 🌐 Architectural Debt & Maintenance Overhead

### 5. Duplication of `validator.js`
* **Location:** Entire `src/lib/` folder
* **Description:**
  The library contains an extensive, manually ported/cloned suite of functions derived from the popular NPM library `validator` (or `validator.js`).
  Maintaining over 100 validator utilities in-house is a significant burden. It increases the risk of security vulnerabilities (ReDoS, parser bypasses) and leads to code bloat.
* **Recommended Fix:**
  Evaluate whether `@rxap/validator` can directly depend on or wrap the standard `validator` package. If special custom behavior is needed, wrap `validator` and extend it. If full customization is necessary, implement automated sync/port scripts and rigorous testing to ensure security parity with the upstream `validator` library.
