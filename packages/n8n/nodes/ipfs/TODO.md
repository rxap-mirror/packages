# TODO: n8n-nodes-ipfs

This document outlines the findings from the audit of the `@rxap/n8n-nodes-ipfs` project. It categorizes identified issues into Critical Bugs, Architectural Debt, and Test Coverage, and provides recommended fixes for each.

---

## 1. Critical Bugs

### 🚨 Broken Conditional Check in Init Generator
In `src/generators/init/generator.ts` (lines 45-51), the conditional check to determine if a non-devDependency package is an RxAP plugin/workspace/schematic is completely broken:
```typescript
if (
  !isDevDependency && [
    /^@rxap\/plugin/,
    /^@rxap\/workspace/,
    /@rxap\/schematic/,
  ]
) {
```
* **The Issue:** The expression evaluates an array of `RegExp` objects directly within the `if` condition. Since arrays are always truthy in JavaScript, the condition evaluates to `true` for *any* package that is not a devDependency, regardless of its name. This causes incorrect manipulation of `package.json` by moving standard dependencies to `devDependencies`.
* **Recommended Fix:** Change this to use `.some(...)` with `.test(packageName)`, matching the style used for `isDevDependency` logic on lines 34-37:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
  ```

### 🚨 Incorrect `getInputData` Usage in Node Post-Processing
In `src/lib/Download/Download.node.ts` (line 106), inside the `postReceive` action for `download-as-file`:
```typescript
input: this.getInputData(index),
```
* **The Issue:** `index` is the map index over the HTTP response `items`. However, `this.getInputData(inputIndex)` in `IExecuteSingleFunctions` expects the **input connection index** (which is always `0` since the node only has a single main input). If multiple items are being processed, or if `index >= 1`, passing `index` to `getInputData` will attempt to fetch data from a non-existent input connection (index 1, 2, etc.), which will either throw an error or return undefined/empty, failing the workflow.
* **Recommended Fix:** Since `IExecuteSingleFunctions` runs per-item, it should fetch the input data from connection index `0` (or omit the parameter):
  ```typescript
  input: this.getInputData(0),
  ```

### 🚨 Unhandled JSON Parse Errors
In `src/lib/Download/Download.node.ts` (line 134), inside the `postReceive` action for `download-as-json`:
```typescript
json: JSON.parse(data)
```
* **The Issue:** If the file downloaded from IPFS is not valid JSON (or is empty/malformed), `JSON.parse` will throw a syntax error that is not handled. This will abruptly crash the entire workflow execution instead of throwing a clean, informative user-facing error.
* **Recommended Fix:** Wrap `JSON.parse` in a `try-catch` block and throw a descriptive n8n-workflow error (e.g., `NodeOperationError` or `NodeApiError`).
  ```typescript
  try {
    return [
      {
        json: JSON.parse(data)
      }
    ];
  } catch (error) {
    throw new NodeOperationError(this.getNode(), 'Failed to parse IPFS content as JSON: ' + error.message);
  }
  ```

---

## 2. Architectural Debt & Anti-Patterns

### 🏛️ Hardcoded Gateway Options (Limited Usability)
The IPFS node gateway is defined as an `options` parameter but only provides a single option: Web3 Storage (`https://<<cid>>.ipfs.w3s.link`):
```typescript
options: [
  {
    name: 'Web3 Storage',
    value: 'https://<<cid>>.ipfs.w3s.link',
  }
]
```
* **The Issue:** IPFS is designed to be decentralized. Forcing users to only use Web3 Storage prevents the use of other public gateways (e.g., Pinata, Cloudflare, Infura, ipfs.io) or private/local IPFS gateways.
* **Recommended Fix:** Convert the gateway parameter to a `string` (or a combobox) field with `https://<<cid>>.ipfs.w3s.link` as the default value, allowing users to enter custom gateways while still keeping a default.

### 🏛️ Physical Path & Module Resolution in Workspace Generator
In `src/generators/init/generator.ts`, there are several instances of physical disk coupling:
* **The Issue:**
  1. Lines 11-14: It calculates `packageJsonFilePath` using `__dirname` and then queries `tree.exists(...)`.
  2. Lines 126-130: It uses `require(...)` with physical file paths in `node_modules` instead of querying the virtual `Tree`.
  
  While loading JS modules via `require` is standard for execution in generators, using physical paths to query or manipulate tree files violates the virtualized nature of Nx Trees, which can lead to unexpected behaviors when generators are run dry-run or in virtual filesystems.
* **Recommended Fix:** Where possible, reference paths relative to the workspace root directly (e.g. `packages/n8n/nodes/ipfs/package.json`) rather than calculating them dynamically using physical paths.

---

## 3. Test Coverage

### 🧪 Complete Lack of Tests
* **The Issue:** The project has a `jest.config.ts` file, but **zero test files** (`.spec.ts` or `.test.ts`). None of the custom logic, such as:
  - Mime-type parsing
  - File extension fallback logic
  - Init generator peer dependency coercion
  Is covered by unit or integration tests.
* **Recommended Fix:** Add Jest spec files under `src/lib/Download/__tests__/` to test:
  1. Mime-type parsing and file extension fallback logic.
  2. Error handling during JSON parsing.
  3. Proper response formatting.
