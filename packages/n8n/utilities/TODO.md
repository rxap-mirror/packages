# TODO: n8n-utilities Audit & Improvements

This file lists the critical bugs, architectural debt, library anti-patterns, and test coverage gaps identified during the project audit of `n8n-utilities`.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Silent Failures & TypeError in `cached.ts`
- **Location:** `src/lib/cached.ts` (Lines 22-25)
- **Problem:** After fetching from `keyv`, the code attempts to mutate the cached response:
  ```typescript
  const cached = (await keyv.get(key))!;
  cached['__cache__'] = key;
  return cached;
  ```
  If the cached function returns a primitive value (e.g., `string`, `number`, `boolean`) or `null`, attempting to set a property on it will throw a `TypeError` (e.g., `TypeError: Cannot create property '__cache__' on string '...'`) in strict mode, or fail silently in non-strict mode.
- **Remedy:** Only set the `__cache__` property if `cached` is a non-null object. Alternatively, wrap the cached value in a container object or avoid mutating the result altogether.

### 2. Double-Parsing & Unhandled JSON Parsing in `open-api-node.ts`
- **Location:** `src/lib/open-api-node.ts` (Lines 338-345)
- **Problem:**
  - **Unhandled Crash on Non-JSON Buffers:**
    ```typescript
    let data = response instanceof Buffer ? JSON.parse(response.toString()) : response;
    ```
    If the response is a Buffer containing non-JSON content (e.g., plain text, HTML error page, binary data), `JSON.parse` will throw and crash the entire execution block.
  - **Implicit Object-to-String Cast Bug:**
    ```typescript
    try {
      data = JSON.parse(data);
      isJSON = true;
    } catch (e) {
      // ignore
    }
    ```
    If `data` is already a parsed object (either parsed from Buffer or because `helpers.request` already returned a parsed object), calling `JSON.parse(data)` implicitly converts the object to `"[object Object]"`. This always throws an error, making `isJSON` false.
    Consequently, valid JSON responses are never recognized as such, and are wrapped inside a nested `response` key (`{ json: { response: data } }`) rather than returned directly at the root (`{ json: data }`), violating n8n node conventions.
- **Remedy:** Use robust content-type checking and safe parsing helpers. If `response` is already an object/array, do not attempt to parse it again. Use safe error catching around the first parse.

### 3. Shadowing & Unsafe Property Access in `CaptureExecutionError` Decorator
- **Location:** `src/lib/capture-execution-error.decorator.ts` (Lines 24-25)
- **Problem:**
  ```typescript
  if (output.some(item => item?.some(item => item?.error))) {
    throw output.find(item => item.some(item => item.error))!.find(item => item.error)!.error;
  }
  ```
  - **Variable Shadowing:** The inner parameter name `item` shadows the outer `item` parameter.
  - **Unsafe Access / Potential Crash:** While the check in line 24 uses optional chaining (`item?.some`), the resolution block in line 25 uses `item.some` and `item.error` without optional chaining. If any row inside the `output` array is null or undefined, this will crash with a `TypeError: Cannot read properties of null (reading 'some')` instead of propagating the actual underlying execution error.
  - **Synchronous Exception Gap:** The decorator only handles asynchronous exceptions (returned promises). If the decorated method throws synchronously, it bypasses the error-handling logic and `continueOnFail()` check entirely.
- **Remedy:** Rename inner parameters to avoid shadowing (e.g., use `subItem`), add optional chaining on all lookups, and wrap the original method invocation in a `try...catch` block to handle synchronous errors.

### 4. Broken Condition in `init` Generator
- **Location:** `src/generators/init/generator.ts` (Lines 46-51)
- **Problem:**
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  The array literal `[...]` is always truthy. Thus, if `isDevDependency` is false, this condition evaluates to true for *any* package name. This incorrectly moves any regular runtime dependency to `devDependencies`!
- **Remedy:** Add the missing `.some(rx => rx.test(packageName))` call as is correctly done on line 36.

---

## 🏗️ Architectural Debt & Library Anti-Patterns

### 1. Physical Disk Queries via Virtual `Tree` in Generator
- **Location:** `src/generators/init/generator.ts` (Lines 83-118)
- **Problem:** The generator uses the virtualized `Tree` (e.g., `tree.exists()`, `tree.read()`) to look up and read files inside `node_modules`. Since `node_modules` is a physical, non-git-tracked directory that should not exist in the virtual tree representation, this is an Nx generator anti-pattern.
- **Remedy:** Resolve package paths using Node's standard module resolution (e.g., `require.resolve`) and read package files directly from the physical filesystem using `fs` when accessing external `node_modules` libraries.

### 2. Risk of Infinite Recursion/Stack Overflow in Schema Resolver
- **Location:** `src/lib/open-api-node.ts` (Lines 68-85)
- **Problem:** `ResolveRef` recursively resolves `$ref` schemas in the OpenAPI document in-place. If the OpenAPI specification contains circular references (which is very common in complex API schemas), the resolver will loop infinitely and crash the Node process with `RangeError: Maximum call stack size exceeded`.
- **Remedy:** Implement cycle detection by tracking visited references/nodes during resolution, and break the recursion if a cycle is detected.

### 3. Hardcoded Environment Keys in Library Code
- **Location:** `src/lib/Oauth2ProxyAuth.credentials.ts` (Line 28)
- **Problem:** A specific, environment-dependent organization ID uuid (`'ea5dc87a-9c4a-48d4-8a0a-ccea1474498f'`) is hardcoded as the default value in the credentials class. Shared library code should not contain hardcoded environment-specific keys.
- **Remedy:** Remove the hardcoded default or replace it with an empty string, prompting the user to supply their actual Organization ID in the credentials setup.

### 4. Platform-Specific Path Splitting
- **Location:** `src/lib/add-files-to-results.ts` (Line 42)
- **Problem:** The utility splits relative paths using `/`:
  ```typescript
  const name = shortPath.split('/').join('_').split('.').join('_');
  ```
  On Windows systems, relative paths returned by `path.relative` use backslashes `\`. This causes the split to fail, resulting in names containing backslashes and unexpected behavior.
- **Remedy:** Use a regex matching both slashes (e.g., `/[\\/]/`) or split on `path.sep` to ensure cross-platform compatibility.

### 5. Blocking Synchronous File I/O
- **Location:** `src/lib/add-files-to-results.ts` (Lines 35-44)
- **Problem:** This async function uses synchronous, blocking operations (`readdirSync`, `statSync`, `readFileSync`) inside a loop. This blocks the single-threaded Node.js event loop, which can cause severe performance degradation in high-volume n8n environments.
- **Remedy:** Use asynchronous non-blocking alternatives (`fs.promises.readdir`, `fs.promises.stat`, `fs.promises.readFile`) inside the loop.

---

## 🧪 Test Coverage Gap

### 1. Absolute Zero Test Coverage
- **Status:** **CRITICAL GAP**
- **Problem:** Running the project's tests (`yarn nx run n8n-utilities:test`) output:
  ```
  No tests found, exiting with code 0
  ```
  There are literally zero spec or test files in the entire project, leaving all of the critical logic errors and edge cases completely untested.
- **Remedy:**
  - Create spec files for all utility functions:
    - `src/lib/cached.spec.ts` (testing primitives, null, and object caching)
    - `src/lib/capture-execution-error.decorator.spec.ts` (testing promise/sync error capturing with/without `continueOnFail`)
    - `src/lib/add-files-to-results.spec.ts` (testing recursive file additions with buffer outputs)
  - Add tests for OpenAPI schema loading, parsing, and parameter/body generation in `open-api-node.spec.ts`.
