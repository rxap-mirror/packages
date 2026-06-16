# Schematic Utilities - Audit TODO

This document outlines the findings and recommended actions resulting from an audit of the `schematic-utilities` package. Several critical logic/functional bugs, architectural debt, and low test coverage were identified.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Broken Regular Expression Matching in `initGenerator`
- **Location**: `src/generators/init/generator.ts` (lines 45–51)
- **Bug**: 
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) { ... }
  ```
  The array of regular expressions is evaluated as part of the condition directly. Since non-empty arrays are truthy, this condition evaluates to `!isDevDependency && true`, moving **all** non-devDependency packages into `devDependencies` regardless of whether they match the specified regexes.
- **Fix**: Apply `.some(...)` on the array to check against the package name:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) { ... }
  ```

### 2. No-op Package Checking in `CheckIfPackagesAreInstalled`
- **Location**: `src/lib/check-if-packages-are-installed.ts` (line 19)
- **Bug**: 
  ```typescript
  const notReferenced = [].filter(packageName => ...);
  ```
  The function filters on an empty array `[]` instead of the passed-in `packageList` parameter. As a result, it will never detect unreferenced or uninstalled packages.
- **Fix**: Use `packageList` instead of the empty array literal:
  ```typescript
  const notReferenced = packageList.filter(packageName => ...);
  ```

### 3. File Destruction on `MergeWithEnvFile`
- **Location**: `src/lib/env-file.ts` (lines 85–97)
- **Bug**: 
  The function `MergeWithEnvFile` executes `CoerceEnvFile(tree, content, filePath)` before calling `GetEnvFile(tree, filePath)`. Because `CoerceEnvFile` internally overwrites the `.env` file with the new incoming `content` map only, any existing contents are completely wiped out before they are read. `deepMerge` is then called on two identical objects, making the merge a no-op and resulting in the loss of all pre-existing env variables.
- **Fix**: Read and parse the existing `.env` file first (if it exists) before overwriting it:
  ```typescript
  export function MergeWithEnvFile(content: EnvFile, filePath = '.env'): Rule {
    return tree => {
      const existingContent = tree.exists(filePath) ? GetEnvFile(tree, filePath) : {};
      const newContent = deepMerge(existingContent, content);
      WriteEnvFile(tree, newContent, filePath);
    };
  }
  ```

### 4. Broken Peer Dependency Resolution in `InstallPeerDependencies`
- **Location**: `src/lib/install-peer-dependencies.ts` (lines 58–64)
- **Bug**: 
  ```typescript
  const peerCollectionJsonFilePath = join(peerPackageDirname, peerPackageJson['schematics']);
  if (tree.exists(peerCollectionJsonFilePath)) { ... }
  ```
  `peerCollectionJsonFilePath` is a physical absolute path to a file inside `node_modules`. Since `node_modules` is not part of the virtual workspace `Tree`, `tree.exists(...)` will always return `false`. Therefore, the automated execution of peer `ng-add` schematics will never occur.
- **Fix**: Since the files are in `node_modules`, read them using physical filesystem checks and parsing (`fs.existsSync` and `require()`) instead of checking the virtual `Tree`.

### 5. Incomplete Regex Escaping in `GuessProjectRoot`
- **Location**: `src/lib/guess-project-root.ts` (lines 47–56)
- **Bug**: 
  ```typescript
  if (path.match(new RegExp(projectRoot.replace('/', '\\/'))))
  ```
  `projectRoot.replace('/', '\\/')` only replaces the *first* occurrence of `/` inside the path. For deeply nested project roots (e.g. `packages/schematic/utilities`), the generated RegExp will have unescaped forward slashes, causing pattern matching errors.
- **Fix**: Use `replaceAll('/', '\\/')` or a global regular expression:
  ```typescript
  if (path.match(new RegExp(projectRoot.replace(/\//g, '\\/'))))
  ```
  *Alternative recommendation*: Avoid dynamic regex matching if standard string helpers like `path.startsWith(projectRoot)` can be used instead.

---

## 🏛️ Architectural Debt & Library Anti-Patterns

### 1. Insecure Comments Parsing in JSON Files
- **Impact**: Moderate/High
- **Anti-pattern**: 
  `json-file.ts` (and other files) use standard `JSON.parse` to read workspace JSON files (such as `tsconfig.json` or `project.json`). Since these files frequently contain comments (which standard `JSON.parse` rejects), reading such files can cause schematics to fail unexpectedly.
- **Fix**: Use JSON parsers from `@nx/devkit` (`readJson`, `parseJson`) or `@angular-devkit/core` which natively support stripping comments.

### 2. Operating System-Specific Path Helpers in Virtual `Tree`
- **Impact**: Moderate (Causes failures on Windows)
- **Anti-pattern**: 
  Imports from the Node.js native `'path'` module (such as `join` and `relative`) are used to construct paths for the virtual `Tree`. While these methods use OS-specific backslashes (`\`) on Windows, the virtual `Tree` always expects POSIX-style forward-slashes (`/`). This mismatch leads to broken path lookups, silent failures, or exceptions on Windows.
- **Fix**: Migrate path operations to use POSIX-compatible utilities, or use `@angular-devkit/core` path utilities (`join`, `normalize`).

### 3. Duplicate Directory Deletion Implementation
- **Impact**: Low (Maintenance Overhead)
- **Anti-pattern**: 
  `src/lib/delete-directory.ts` (`DeleteDirectory`) and `src/lib/file.ts` (`DeleteRecursive`) implement identical virtual tree directory deletion logic. Both are exported from the library.
- **Fix**: Deprecate one of the implementations and point it to the other to eliminate duplication.

### 4. Incorrect Key Typing in `GroupBy` Map
- **Impact**: Low (TypeScript Compile-time errors)
- **Anti-pattern**: 
  `src/lib/array/group-by.ts` returns a `Map<K, T[]>` where `K` is the name of the property key. However, the keys in the returned map are the values of that property (`item[propertyKey]`), which are of type `T[K]`, not `K`.
- **Fix**: Correct the generic typing:
  ```typescript
  export function GroupBy<T, K extends keyof T>(list: T[], propertyKey: K): Map<T[K], T[]>
  ```

### 5. Excessive Workspace Scanning in `SearchFile`
- **Impact**: Moderate (Performance degradation)
- **Anti-pattern**: 
  `SearchFile` checks `dir.path.startsWith('/.')` to ignore hidden directories. However, nested hidden directories (like `.git` or `.idea`) do not start with `/.` and will still be scanned, introducing extreme performance overhead or crashing memory limits.
- **Fix**: Check if any individual path segment of `dir.path` starts with a dot:
  ```typescript
  if (dir.path.split('/').some(segment => segment.startsWith('.'))) {
    return;
  }
  ```

---

## 🧪 Test Coverage Gap

- **Current Status**: Out of dozens of utility files (array, string, object, project, env-file, json-file, package-json-file, etc.), **only 3 tests are present**.
- **Issue**: Highly critical utility functions like `MergeWithEnvFile`, `CheckIfPackagesAreInstalled`, and `InstallPeerDependencies` are completely untested, which is why critical logic bugs went unnoticed.
- **Fix**: Write comprehensive unit tests for:
  - `env-file.ts` (`MergeWithEnvFile` and `GetEnvFile`)
  - `check-if-packages-are-installed.ts`
  - `install-peer-dependencies.ts`
  - `guess-project-root.ts`
  - `delete-directory.ts`
