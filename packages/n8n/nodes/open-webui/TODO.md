# TODO - n8n-nodes-open-webui Project Audit

This document outlines the findings and recommended actions from the project audit of `n8n-nodes-open-webui`.

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Empty Entry Point Export (`index.ts`)
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

### 2. Zero Unit and Integration Tests
*   **Location**: Entire project root / test config
*   **Description**: Running the test suite (`yarn nx run n8n-nodes-open-webui:test`) reports `No tests found`. There are no `.spec.ts` or `.test.ts` files.
*   **Impact**: Risks regression during updates of `@rxap/n8n-utilities` or `n8n-workflow`.
*   **Recommended Fix**:
    - Add unit tests for `OpenWebUIAuth.credentials.ts` to verify baseUrl defaults and authentication headers.
    - Add a basic test for `OpenWebUI.node.ts` to ensure it instantiates correctly and parses the `openapi.json` without throwing errors.
    - Write a unit test for `src/generators/init/generator.ts` to verify the dependencies migration logic works as expected.
