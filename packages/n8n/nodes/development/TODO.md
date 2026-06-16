# TODO: @rxap/n8n-nodes-development

Here are the identified improvements and recommendations for the `n8n-nodes-development` library:

## 1. Robust JSON Parsing (Critical Reliability)
Currently, both `ExecuteWorkflowTrigger.node.ts` and `ManualTrigger.node.ts` perform a direct `JSON.parse()` on node input parameters:
```typescript
JSON.parse(this.getNodeParameter('input') as string)
```
- **Risk:** If the user supplies empty input or invalid JSON, this statement will throw an uncaught exception, which can crash the entire execution block of the node.
- **Action:** Introduce a safe JSON parsing helper function. For example:
  ```typescript
  function safeParseJson(value: unknown): any {
    if (!value || typeof value !== 'string') return {};
    try {
      return JSON.parse(value);
    } catch {
      return {}; // Or throw a friendly n8n validation error
    }
  }
  ```

## 2. Address Typo in `ExecuteWorkflowTrigger.node.ts`
- **Issue:** On line 45 and 50 of `ExecuteWorkflowTrigger.node.ts`, there is a spelling typo: `'worklfow_call'` instead of `'workflow_call'`.
- **Note:** Because this value is saved into the workflow configuration in n8n database, changing it directly may break backwards-compatibility for existing workflows. 
- **Action:** Keep the existing string to maintain backwards compatibility but document it, or add support for both `'worklfow_call'` and `'workflow_call'` while deprecating the typoed version.

## 3. Unit Tests Coverage
- **Issue:** The test suite completed successfully but executed 0 tests.
- **Action:** Add basic unit tests in `src/lib/ManualTrigger/__tests__` and `src/lib/ExecuteWorkflowTrigger/__tests__` to ensure the nodes initialize correctly and parse their triggers without throwing errors.
