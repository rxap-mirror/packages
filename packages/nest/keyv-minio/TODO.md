# TODO: nest-keyv-minio Audit Findings & Improvements

This document lists the findings from the project audit of `nest-keyv-minio`. It includes critical logic bugs, architectural debt, testing gaps, and recommended fixes.

---

## 1. Critical Bugs 🚨

### A. Platform-Dependent S3 Keys (Medium Severity)
- **File:** `src/lib/keyv-minio.ts` (Lines 30, 47, 52)
- **Problem:**
  ```typescript
  const filePath = join(this.options.pathPrefix ?? '', key + '.json');
  ```
  The `join` function from the native Node `path` module is platform-dependent. On Windows systems, it uses backslashes (`\`) instead of forward slashes (`/`). S3 and MinIO expect forward slashes as directory separators. Using `path.join` causes malformed object keys on Windows development or server environments, breaking compatibility and cache prefix routing.
- **Recommended Fix:** Use `path/posix`'s `join`, or manual string concatenation:
  ```typescript
  const prefix = this.options.pathPrefix ? `${this.options.pathPrefix}/` : '';
  const filePath = `${prefix}${key}.json`;
  ```

### B. Swallowed Errors in `delete()` (Medium Severity)
- **File:** `src/lib/keyv-minio.ts` (Lines 51-61)
- **Problem:**
  ```typescript
  try {
    await this.client.removeObject(this.bucketName, filePath);
  } catch (error: any) {
    if (error.code === 'NoSuchKey') {
      return false;
    }
  }
  return true;
  ```
  If `removeObject` fails due to critical network, credential, or permission errors, the catch block swallows the error entirely and returns `true` (indicating successful deletion). This can lead to silent cache failures where values are never deleted but the application believes they were.
- **Recommended Fix:** Propagate unexpected errors or return `false`:
  ```typescript
  try {
    await this.client.removeObject(this.bucketName, filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'NoSuchKey') {
      return false;
    }
    throw new Error(`Failed to delete key ${key}: ${error.message}`);
  }
  ```

---

## 2. Architectural Debt & Anti-patterns 🏛️

### A. Resource Exhaustion & Missing Batch Deletion in `clear()` (High Risk)
- **File:** `src/lib/keyv-minio.ts` (Lines 63-94)
- **Problem:**
  The `clear()` method collects deletion promises for every object in the stream and executes them concurrently using `Promise.allSettled`:
  ```typescript
  const deletePromises: Array<Promise<any>> = [];
  stream.on('data', (obj) => {
    deletePromises.push(this.client.removeObject(this.bucketName, obj.name));
  });
  stream.on('end', async () => {
    await Promise.allSettled(deletePromises);
    resolve();
  });
  ```
  For large buckets or prefixes containing thousands of files, this will attempt to fire thousands of concurrent HTTP requests. This leads to socket exhaustion, connection timeouts, heap out-of-memory crashes, or API rate-limiting.
  Furthermore, because `Promise.allSettled` is resolved without checking the results, failures to delete items are silently ignored.
- **Recommended Fix:**
  Use MinIO's native plural `removeObjects` method to delete objects in batches of up to 1000, which is highly optimized and S3-standard:
  ```typescript
  // Collect object names in an array and use removeObjects in chunks of 1000
  ```

---

## 3. Test Coverage 🧪

- **Current Status:** **0% Test Coverage**.
- **Problem:**
  The project contains setup for Jest (`jest.config.ts`, `tsconfig.spec.json`) but does not contain a single `.spec.ts` test file. Running `yarn nx run nest-keyv-minio:test` runs successfully but executes 0 tests.
- **Recommended Fix:**
  Create a test suite (e.g. `src/lib/keyv-minio.spec.ts`) that mocks the MinIO `Client` and verifies:
  1. `get()` retrieves and parses valid JSON.
  2. `get()` handles `NoSuchKey` and returns `undefined`.
  3. `set()` saves JSON wrapped with expiration.
  4. `delete()` deletes keys and handles errors appropriately.
  5. `clear()` lists and deletes files correctly.
