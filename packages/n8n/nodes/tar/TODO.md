# TODO: n8n-nodes-tar Audit & Recommended Fixes

This document outlines the findings and recommended actions from the project audit of `@rxap/n8n-nodes-tar` (located at `packages/n8n/nodes/tar`).

---

## 1. Critical Functional Bugs

### 🔴 Promise Hang on Tar Extraction
- **Issue**: In `Tar.node.ts` (lines 105–122), the execution awaits a `Promise` that resolves on the `'end'` event of the `tar.extract` writable stream `x`.
  ```typescript
  bufferStream
    .pipe(x)
    .on('error', reject)
    .on('end', resolve);
  ```
- **Why it's a bug**: In Node.js, `Writable` streams (such as `tar.Unpack` returned by `tar.extract`) do not emit the `'end'` event—only `'finish'` or `'close'` are emitted. As a result, this promise never resolves, causing any execution of the node to hang indefinitely.
- **Recommended Fix**: Change the completion event listener from `'end'` to `'close'` (or `'finish'`). Since file extraction involves asynchronous disk writes, `'close'` is the most reliable event indicating that the extraction is complete and all files have been written.
  ```typescript
  bufferStream
    .pipe(x)
    .on('error', reject)
    .on('close', resolve);
  ```

### 🔴 `globalFilePathPrefix` Path Traversal & Crash (`ENOENT`)
- **Issue**: When `globalFilePathPrefix` is specified (e.g. `'subfolder/'`), the directory scanned for output files is calculated as `join(workDir, globalFilePathPrefix)` (line 134).
  ```typescript
  await addFilesToResults(join(workDir, globalFilePathPrefix), join(workDir, globalFilePathPrefix), result, this.helpers.prepareBinaryData.bind(this.helpers));
  ```
- **Why it's a bug**: During extraction, `extract` with `cwd: workDir` will extract files into `workDir`. If the tarball does not contain a nested directory matching `globalFilePathPrefix`, the path `join(workDir, globalFilePathPrefix)` will not exist on disk. When `addFilesToResults` attempts to call `readdirSync(dir)`, it throws an `ENOENT: no such file or directory` error and the node execution crashes.
- **Recommended Fix**: 
  - Ensure the target prefix directory is verified or created beforehand, OR 
  - If `globalFilePathPrefix` is meant to prefix the resulting keys/paths in the output binary data, do not pass it directly to `addFilesToResults` as the physical directory path. Instead, perform this prefix mapping in memory, or move extracted files into a subdirectory before scanning.

---

## 2. Logic & Configuration Errors

### 🟡 `fileList` is Incorrectly Marked as Required
- **Issue**: The parameter `fileList` (lines 63–72) has `"required": true` but also defines an empty array `[]` as its default value.
- **Why it's a bug**: Since `required: true` is enforced in the n8n UI, users are forced to enter at least one file path. This makes it impossible to extract the entire tarball. Additionally, this renders the `else` block (lines 112–117) where `fileList` is empty or undefined as dead code.
- **Recommended Fix**: Change `"required": false` so that users can leave the file list empty to extract the full archive.

---

## 3. Code Quality & Technical Debt

### 🟢 Copy-Paste Parameter Typos
- **Issue**: The binary property parameter `inputDateProperty` contains typos inherited from a copy-paste of a Zip node.
  - The parameter key is `inputDateProperty` (often misconstrued as "Date Property" instead of "Data Property").
  - The `displayName` is `"Input Date Property"`.
  - The `description` refers to a `"zip file"` rather than a `"tar file"`.
  - The `description` for `globalFilePathPrefix` also refers to `"root of the zip file"`.
- **Recommended Fix**: Rename the parameter to `inputDataProperty` or `inputBinaryProperty` (ensuring compatibility/migrations if needed), fix the displayName to `"Input Binary Property"`, and update descriptions to refer to `"tar file"` / `"tarball"`.
- *Note: These typos also exist in `@rxap/n8n-nodes-zip` (`inputDateProperty`).*

---

## 4. Test Coverage & CI/CD

### 🟡 Missing Test Coverage
- **Issue**: The library has `jest.config.ts` and `tsconfig.spec.json` configured, but there are **zero** test files (no `*.spec.ts` or `*.test.ts` files) inside the `src` directory.
- **Recommended Fix**:
  - Implement unit/integration tests (`Tar.node.spec.ts`) using a mocked/fake n8n execution context.
  - Test scenarios:
    1. Standard extraction of a small tarball buffer.
    2. Extraction with a specified list of files (`fileList`).
    3. Error handling (e.g. invalid tar buffers).
    4. Path handling with prefixes.
