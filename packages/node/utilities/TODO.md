# TODO: Audit Findings for node-utilities

This document outlines the findings of the comprehensive project audit for the `@rxap/node-utilities` package. It details critical functional bugs, logic errors, architectural debt, and recommended improvements.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Resolution Tag Bug in `GetPackagePeerDependencies`
* **File:** [get-package-peer-dependencies.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/get-package-peer-dependencies.ts#L13-L19)
* **Description:**
  By default, `GetPackagePeerDependencies` attempts to fetch peer dependencies for a version defaulting to `'latest'`:
  ```typescript
  return info?.versions[version]?.peerDependencies ?? {};
  ```
  However, the registry `versions` record maps concrete version numbers (e.g. `'1.0.0'`) and does not have a key named `'latest'`. The `'latest'` tag must be resolved via the `dist-tags['latest']` property of the package info.
* **Impact:** Querying for `'latest'` (the default case) always returns `{}` even if peer dependencies exist.
* **Recommended Fix:**
  ```typescript
  const resolvedVersion = info?.['dist-tags']?.[version] ?? version;
  return info?.versions[resolvedVersion]?.peerDependencies ?? {};
  ```

---

### 2. Risk of Boot Crashing via Unhandled `JSON.parse` in Top-Level IIFE
* **Files:**
  * [get-latest-package-version.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/get-latest-package-version.ts#L18-L23)
  * [get-package-info.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/get-package-info.ts#L25-L34)
* **Description:**
  Both files load localized caches during module compilation time using synchronous IIFEs that execute `JSON.parse` on files stored inside `tmpdir()`. 
  If any cache file is corrupted, empty, or interrupted during writing, `JSON.parse` will throw an unhandled SyntaxError at boot time.
* **Impact:** Any workspace/application importing `@rxap/node-utilities` will instantly crash on startup if temporary files get corrupted.
* **Recommended Fix:** Wrap synchronous cache loading and parsing in `try { ... } catch` blocks to gracefully fall back to an empty cache `{}`.

---

### 3. Flawed Retry Logic in `jsonFileWithRetry`
* **File:** [json-file.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/json-file.ts#L62-L65)
* **Description:**
  The `jsonFileWithRetry` helper is designed to retry reading a JSON file if it is in the process of being written or temporarily locked. However, the check `if (!existsSync(path))` is executed *outside* the retry loop:
  ```typescript
  if (!existsSync(path)) {
    throw new Error(`Cannot parse json object. File ${ path } not found`);
  }
  ```
* **Impact:** If the file is temporarily missing (which is a valid state during lock/write transitions), it throws an error immediately, bypassing the retry loop entirely.
* **Recommended Fix:** Move the existence check inside the `try-catch` block inside the loop so that missing files can also be retried.

---

## 🏛️ Architectural Debt & Library Anti-Patterns

### 1. Querying Physical Files via Virtual Tree inside Generator
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/generators/init/generator.ts#L90-L110)
* **Description:**
  The generator checks and reads package information in `node_modules` using the virtual `tree.exists(...)` and `tree.read(...)`. In Nx, `node_modules` is not a part of the workspace virtual tree (it is excluded by default and listed in `.nxignore`).
* **Impact:** The `tree.exists(...)` check always returns `false` inside the generator, skipping peer dependency init generators entirely.
* **Recommended Fix:** Use physical file system operations (from Node's `fs` module) rather than the virtual `Tree` when querying installed packages inside `node_modules`.

---

### 2. Re-implementing File System Recursion (Anti-Pattern)
* **Files:**
  * [remove-dir-sync.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/remove-dir-sync.ts)
  * [copy-folder-sync.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/copy-folder-sync.ts)
* **Description:**
  Custom recursion utilizing basic `statSync`, `readdirSync`, and `unlinkSync` is utilized to implement directory copy and deletion.
  * In `remove-dir-sync.ts`, `rmdirSync` is deprecated in modern Node versions for recursive deletions. If the target folder is already missing, it throws an error.
  * In `copy-folder-sync.ts`, if the parent of the destination directory does not exist, `mkdirSync` throws a nested error.
* **Recommended Fix:** Use native modern Node.js equivalents:
  * Replace the contents of `RemoveDirSync` with `rmSync(dirPath, { recursive: true, force: true })`.
  * Replace the contents of `CopyFolderSync` with `cpSync(src, dest, { recursive: true })` or at least ensure `mkdirSync` has `{ recursive: true }` enabled.

---

### 3. Faulty Gitignore Matching
* **File:** [search-file-in-directory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/node/utilities/src/lib/search-file-in-directory.ts#L21-L23)
* **Description:**
  The basename of the file/directory is passed directly to `gitignore.ignores(file)`:
  ```typescript
  if (gitignore && gitignore.ignores(file)) { ... }
  ```
  The `ignore` package expects relative paths from the ignore root. Checking only the bare filename ignores path structure-specific rules (e.g., rules nested under subfolders), leading to skipped files or ignored files being scanned.
* **Recommended Fix:** Pass the relative file path to `gitignore.ignores(...)`.

---

## 🧪 Test Coverage & Developer Experience

### 1. Minimal Test Coverage
* Currently, the only file with unit tests is `file-with-scope.ts`. Crucial logic helpers (`json-file`, `get-package-info`, `get-package-peer-dependencies`, and the `init` generator) lack any test files.
* **Recommendation:**
  * Add unit tests for `GetPackagePeerDependencies` to assert correct resolution of tags like `'latest'`.
  * Add unit tests for `jsonFileWithRetry` to mock temporarily missing or locked files.
  * Add dry-run tests for `initGenerator` to ensure correct classification of peer dependencies.
