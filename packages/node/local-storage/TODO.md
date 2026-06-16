# TODO: Audit Findings & Improvements for `@rxap/node-local-storage`

This file documents the findings and recommended improvements identified during the project audit of `node-local-storage`. 

---

## 🚨 Critical Security Vulnerability

### Path / Directory Traversal in File Operations
- **Location**: `src/lib/local-storage.ts` (`getItem`, `setItem`, `removeItem`)
- **Description**: The class directly concatenates the user-supplied `key` with `this.storageFolder` using `join(this.storageFolder, key)`. Because the `key` parameter is never sanitized, keys like `../../etc/passwd` or absolute file system paths can be used to read, write, or delete arbitrary files outside of the intended storage directory.
- **Recommended Fix**: 
  1. Map keys to filenames safely by using `encodeURIComponent(key)`. This handles all special characters, slashes, and traversal sequences safely (e.g., `../` becomes `..%2F` which is a valid single file name within the storage folder, avoiding any traversal).
  2. In `populateCache()`, decode files back to original keys using `decodeURIComponent(file)`.
  3. Alternatively, resolve the absolute path and throw an error if the path traverses outside `this.storageFolder`.

---

## 🐛 Critical Logic & Functional Bugs

### 1. Immediate Dynamic `require()` in Generator for Missing Peer Dependencies
- **Location**: `src/generators/init/generator.ts` (lines 83-137)
- **Description**: The generator schedules package installation using `installPackagesTask(tree)` which runs asynchronously *after* the generator completes. However, immediately after scheduling this task, the generator loops over `missingPeerDependencies` and tries to `require()` and execute their init generators from `node_modules`. If a peer dependency is truly missing and was only just added to `package.json`, it will not be present in `node_modules`, causing the generator to crash.
- **Recommended Fix**: Avoid synchronously importing code from `node_modules` during generator execution if that dependency has not been installed yet. Alternatively, separate the setup into multiple steps or run execution in a post-install schematic/task.

---

## 🏛️ Architectural Debt & Reliability

### Container/Docker Mount Clearing Bug
- **Location**: `src/lib/local-storage.ts` (`clear()`)
- **Description**: The `clear()` method empties the storage by recursively deleting the entire `this.storageFolder` directory (`rmdirSync`) and then recreating it. In containerized environments (Docker, Kubernetes) or network filesystems (NFS, cloud volumes), `this.storageFolder` might be a mount point. Attempting to delete a mount point itself will fail with `EBUSY` or `EPERM`.
- **Recommended Fix**: Instead of deleting and recreating the directory, delete only the *contents* (files and subdirectories) inside the folder.
  ```typescript
  clear(): void {
    this.cache.clear();
    const files = readdirSync(this.storageFolder);
    for (const file of files) {
      const filePath = join(this.storageFolder, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        this.removeDirSync(filePath);
      } else {
        unlinkSync(filePath);
      }
    }
  }
  ```

---

## 🧪 Test Coverage & Tooling Improvements

### 1. Fully Skipped Test Suite (Fixed)
- **Location**: `src/lib/local-storage.spec.ts`
- **Description**: The entire unit test suite was marked as `describe.skip` due to compatibility issues with `mock-fs` in Jest/Node environments. This left the library with zero verified test coverage.
- **Action Taken**: We rewrote the spec file to remove the buggy `mock-fs` dependency, replacing it with a real temporary directory under `packages/node/local-storage/tmp-test-storage` that is cleaned up in `beforeEach` and `afterEach`. 
- **Results**: **All 15 tests now run and pass successfully!** Please keep these tests enabled to maintain continuous test coverage.

### 2. TypeScript Deprecation Notice
- **Description**: Running tests produces a deprecation warning:
  `[DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.`
  This indicates that one of the test tools or dependencies is invoking deprecated Node.js API constructors. It should be addressed by updating workspace devDependencies.
