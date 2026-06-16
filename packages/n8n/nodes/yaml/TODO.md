# TODO - @rxap/n8n-nodes-yaml

This document lists the findings and recommendations resulting from the project audit of `n8n-nodes-yaml`. It covers functional bugs, usability/metadata inconsistencies, architectural debt, and test coverage gaps.

---

## 🔴 Critical Functional Bugs

### 1. Broken `continueOnFail` Behavior in Multiple Operations
* **Files:**
  - `packages/n8n/nodes/yaml/src/lib/actions/jsonToYaml.operation.ts` (Lines 60-71)
  - `packages/n8n/nodes/yaml/src/lib/actions/yamlToJson.operation.ts` (Lines 58-69)
  - `packages/n8n/nodes/yaml/src/lib/actions/setValue.operation.ts` (Lines 389-401)
* **Problem:** 
  When an exception occurs during the execution of these operations and the standard `continueOnFail()` option is active, the catch block mutates the input array (`items[itemIndex]`) with an error object but fails to push it onto `returnData`. Since only `returnData` is returned by the node, failed items are **silently omitted** from the final outputs of the execution instead of being returned as error objects.
* **Impact:** 
  Workflows with `continueOnFail` enabled will drop items silently, breaking downstream execution branches that expect the same number of items.
* **Recommended Fix:** 
  Modify the `catch` blocks in all three files to push the error item directly onto `returnData` instead of mutating the input array:
  ```typescript
  if (this.continueOnFail()) {
    returnData.push({
      json: {
        error: error.message,
      },
      pairedItem: {
        item: itemIndex,
      },
    });
    continue;
  }
  ```

### 2. Boolean Field Selection Issue in `setValue` Action
* **Files:**
  - `packages/n8n/nodes/yaml/src/lib/actions/setValue.operation.ts` (Lines 125-136)
  - `packages/n8n/nodes/yaml/src/lib/utils/set-value.ts` (Lines 23-40)
* **Problem:** 
  The "Fields to Set" boolean parameter configuration uses string values `'true'` and `'false'` instead of real boolean types:
  ```typescript
  options: [
    { name: 'True', value: 'true' },
    { name: 'False', value: 'false' }
  ]
  ```
  However, in `validateEntry` (`set-value.ts`), there is no parsing of string boolean values into actual booleans before calling `validateFieldType()`. If `ignoreConversionErrors` is disabled, strict validation of a field marked as a Boolean will fail because the runtime receives the string `'true'`/`'false'`, throwing a type mismatch error.
* **Impact:** 
  Users will get unexpected validation errors trying to set boolean values in YAML unless they manually enable "Ignore Type Conversion Errors".
* **Recommended Fix:** 
  Ensure string-to-boolean conversion is handled in `validateEntry` for the `'boolean'` type:
  ```typescript
  if (type === 'boolean' && typeof value === 'string') {
    value = value === 'true';
  }
  ```

---

## 🟡 Usability & Metadata Bugs

### 3. Copy-Paste Description & Placeholder Bugs
* **Files:**
  - `packages/n8n/nodes/yaml/src/lib/Yaml.node.ts` (Line 62)
  - `packages/n8n/nodes/yaml/src/lib/actions/convert.operation.ts` (Lines 64, 79)
* **Problem:**
  - In `Yaml.node.ts`, the `setValue` operation has a copy-pasted description: `"Converts data from YAML to JSON"`. It should describe its actual function: `"Set a value inside a YAML structure"`.
  - In `convert.operation.ts`, formatting description refers to JSON instead of YAML: `"Whether to format the JSON data for easier reading"`.
  - In `convert.operation.ts`, the fileName placeholder suggests a JSON extension: `placeholder: 'e.g. myFile.json'`.
* **Recommended Fix:**
  - Correct the operation description in `Yaml.node.ts` to reflect the Set Value feature.
  - Update description inside `convert.operation.ts` to refer to YAML, and change placeholder to `myFile.yaml` or `myFile.yml`.

---

## 🟡 Architectural Debt & Code Bloat

### 4. Massive Dead Code in `utilities.ts`
* **File:** `packages/n8n/nodes/yaml/src/lib/utils/utilities.ts`
* **Problem:**
  This utility file appears to be a full-scale copy-paste from a general n8n helpers library. It contains many complex unused functions including `chunk`, `shuffleArray`, `flattenKeys`, `flatten`, `compareItems`, `fuzzyCompare`, `keysToLowercase`, `formatPrivateKey`, `getResolvables`, `flattenObject`, and `capitalize`. Only `generatePairedItemData` is ever imported/used in this project.
* **Recommended Fix:**
  Clean up and remove all unused functions from `utilities.ts` to reduce bundle size, compile times, and code surface area.

### 5. Unused Declarations in `descriptions.ts`
* **File:** `packages/n8n/nodes/yaml/src/lib/utils/descriptions.ts`
* **Problem:**
  `oldVersionNotice` and `returnAllOrLimit` are defined but never imported or referenced.
* **Recommended Fix:**
  Remove these unused variables from `descriptions.ts`.

### 6. Bloated production dependency in `package.json`
* **File:** `packages/n8n/nodes/yaml/package.json`
* **Problem:**
  `@nx/devkit` is listed as a production `dependency` (Line 7). There is no runtime requirement for `@nx/devkit` in an n8n community node.
* **Recommended Fix:**
  Move `@nx/devkit` to `devDependencies` or remove it entirely if it is not used in the package's compilation process.

### 7. Redundant Logic inside `validateEntry` Helper
* **File:** `packages/n8n/nodes/yaml/src/lib/utils/set-value.ts` (Lines 24-33)
* **Problem:**
  `validateEntry` checks at line 17 if the value is null/undefined and returns early. Yet, inside `if (type === 'string')` (line 24), it checks again if `value === undefined || value === null`, which is completely unreachable.
* **Recommended Fix:**
  Remove the redundant nested null/undefined check.

---

## 🔵 Test Coverage & Infrastructure

### 8. 0% Test Coverage (No Tests Defined)
* **Problem:**
  The project is configured to run Jest tests under Nx (`yarn nx run n8n-nodes-yaml:test`), but there are **zero spec/test files** defined anywhere in the project. The tests pass simply because `--passWithNoTests=true` is set.
* **Recommended Fix:**
  Create a test suite using Jest to cover all operations. Unit tests should mock `IExecuteFunctions` to verify:
  - `extract`: Correctly reads and parses YAML files of different encodings (and strips BOM).
  - `convert`: Properly structures lists and single items into YAML output files.
  - `jsonToYaml` / `yamlToJson`: Handles standard parsing and stringification correctly, including testing `continueOnFail` behavior.
  - `setValue`: Sets scalar and nested values using dot-notation, verifying correct boolean conversion.
