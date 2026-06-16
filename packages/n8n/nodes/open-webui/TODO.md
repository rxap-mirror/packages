# TODO - n8n-nodes-open-webui Project Audit

This document outlines the findings and recommended actions from the project audit of `n8n-nodes-open-webui`.

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Virtualized Tree vs. Physical Node Modules
*   **Location**: `src/generators/init/generator.ts` (Lines 83–137)
*   **Description**: The generator attempts to read and inspect `node_modules` file paths using the Nx virtual `Tree`:
    ```typescript
    const peerPackageJsonFilePath = join('node_modules', ...peer.split('/'), 'package.json');
    if (!tree.exists(peerPackageJsonFilePath)) { ... }
    ```
    Additionally, it dynamically requires code using Node's physical `require`:
    ```typescript
    const initGenerator = require(join('node_modules', ...peer.split('/'), initGeneratorFilePath))?.default;
    ```
*   **Impact**:
    1.  **Virtual Tree Mismatch**: Nx's `Tree` does not track `node_modules` (which is git-ignored and ignored by the workspace virtualizer). Thus, `tree.exists` will always return `false`, causing the loop to silently skip and making the entire peer generator execution block **dead code**.
    2.  **Dry-Run Violations**: Bypassing the virtual tree with a direct physical `require` causes physical side-effects and potential failures when running generators in dry-run mode (`--dry-run`).
*   **Recommended Fix**:
    - Avoid running peer generators dynamically from inside a nested `node_modules` path inside a workspace generator.
    - If reading peer packages is absolutely necessary, use standard physical file resolution (`require.resolve`) and physical file system methods (e.g., `fs.existsSync`, `fs.readFileSync`) instead of the virtualized `Tree`, and clearly document why the virtual tree is bypassed.

### 2. Empty Entry Point Export (`index.ts`)
*   **Location**: `src/index.ts`
*   **Description**: The entry point file `src/index.ts` contains only `export {};`.
*   **Impact**: While n8n loads the node and credential files using direct paths specified in `package.json`, this setup prevents other packages/tools in the monorepo from importing or referencing classes (`OpenWebUI`, `OpenWebUIAuth`) for testing, extending, or typing purposes.
*   **Recommended Fix**: Export the core classes from the entry point:
    ```typescript
    export * from './lib/OpenWebUI/OpenWebUI.node';
    export * from './lib/OpenWebUIAuth.credentials';
    ```

---

## 🧪 Test Coverage

### 3. Zero Unit and Integration Tests
*   **Location**: Entire project root / test config
*   **Description**: Running the test suite (`yarn nx run n8n-nodes-open-webui:test`) reports `No tests found`. There are no `.spec.ts` or `.test.ts` files.
*   **Impact**: Risks regression during updates of `@rxap/n8n-utilities` or `n8n-workflow`.
*   **Recommended Fix**:
    - Add unit tests for `OpenWebUIAuth.credentials.ts` to verify baseUrl defaults and authentication headers.
    - Add a basic test for `OpenWebUI.node.ts` to ensure it instantiates correctly and parses the `openapi.json` without throwing errors.
    - Write a unit test for `src/generators/init/generator.ts` to verify the dependencies migration logic works as expected.
