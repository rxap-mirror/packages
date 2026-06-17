# TODO: n8n-nodes-cache

This document outlines the findings, critical bugs, architectural debt, and testing improvements required for the `@rxap/n8n-nodes-cache` package.

---

## 🚨 Critical Bugs

### 1. Broken / Incomplete Binary Data Caching
* **Problem:**
  During `write` operations, if an item contains binary data (`item.binary`), the node uploads each binary attachment to MinIO under the key path `${hash}/${file.fileName}`.
  However, during `read` operations, the binary data is **completely ignored and never retrieved or reconstructed**. The node only downloads the JSON payload from `${workflowId}/${hash}/item.json` and returns `{ json }`, losing all binary data. Any downstream node expecting binary files will fail.
* **Inconsistent S3 Paths:**
  - JSON objects are saved under `${this.getWorkflow().id ?? 'unknown'}/${hash}/item.json`.
  - Binary files are saved under `${hash}/${file.fileName}` (missing the workflow ID prefix). This inconsistency makes cleanup difficult and increases collision risks across different workflows.
* **Loss of Binary Keys:**
  In n8n, binary attachments are keyed (e.g., `item.binary.data_key`). When caching binary files, the dictionary key is completely discarded, making it impossible to restore them to the correct keys during reads.
* **Recommended Fix:**
  1. **Persist Binary Metadata:** Modify the cached JSON object to store metadata about the binary attachments (e.g., an array containing original keys, filenames, mimetypes, and size).
  2. **Consistent S3 Prefixing:** Save binary files under a consistent path that includes the workflow ID, e.g., `${workflowId}/${hash}/binary/${key}_${file.fileName}`.
  3. **Restore Binary on Read:** During the `read` operation, fetch the JSON first. If binary metadata is present, fetch each binary attachment from MinIO, buffer its content, and reconstruct the `item.binary` dictionary before pushing the item to `withCache`.

---

## 📐 Architectural Debt & Code Quality

### 1. N+1 S3 Bucket Existence Checks (Performance Anti-pattern)
* **Problem:**
  Inside the main execution loop for items, `client.bucketExists(bucket)` is invoked sequentially:
  ```typescript
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    throw new NodeOperationError(this.getNode(), 'Bucket does not exist');
  }
  ```
  For workflows processing hundreds or thousands of items, this generates an N+1 query pattern on MinIO/S3, severely degrading performance and loading the S3 service unnecessarily.
* **Recommended Fix:**
  Perform the bucket existence check **once** per node execution rather than inside the per-item loop. If the bucket name varies dynamically per item, cache the check results in a local `Set` or `Map` to ensure each bucket is checked at most once.

### 2. Unsafe Stream Chunk-to-String Decoding
* **Problem:**
  The `getObject` stream chunk reading is implemented as follows:
  ```typescript
  let data = '';
  for await (const chunk of dataStream) {
    data += chunk.toString();
  }
  ```
  Since `chunk` is a raw buffer, calling `.toString()` on partial stream chunks can slice multi-byte characters (like UTF-8 non-ASCII characters or emojis) across chunk boundaries, resulting in corrupted string decoding.
* **Recommended Fix:**
  Accumulate raw buffers in an array and join them at the end, or use Node's `'string_decoder'` module:
  ```typescript
  const chunks: Buffer[] = [];
  for await (const chunk of dataStream) {
    chunks.push(chunk as Buffer);
  }
  const data = Buffer.concat(chunks).toString('utf-8');
  ```

### 3. Unhandled JSON Parsing Failures
* **Problem:**
  If a cached file on S3 is corrupted, empty, or truncated, calling `JSON.parse(data)` directly will throw a syntax error and crash the execution.
* **Recommended Fix:**
  Wrap `JSON.parse(data)` in a `try/catch` block. On parsing failure, treat it as a cache miss (falling back to `noCache`), log a warning, or throw a clear, structured `NodeOperationError`.

---

## 🧪 Test Coverage

### 1. Complete Absence of Tests (0% Coverage)
* **Problem:**
  The package contains a `jest.config.ts` but has absolutely zero `.spec.ts` or `.test.ts` files. The node is completely untested.
* **Recommended Fix:**
  Implement a suite of unit/integration tests under `src/lib/Cache/Cache.node.spec.ts` using Jest.
  - Mock the `minio` client (`bucketExists`, `getObject`, `putObject`).
  - Verify that the node correctly splits execution paths into `Cache` (main channel 0) and `No Cache` (main channel 1).
  - Verify that the `disabled` flag bypasses caching entirely.
  - Verify error handling (e.g., bucket not found, cache connection error).
