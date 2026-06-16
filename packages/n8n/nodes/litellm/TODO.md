# TODO: n8n-nodes-litellm

This document outlines identified issues, architectural debt, and recommended improvements for the `@rxap/n8n-nodes-litellm` package based on a comprehensive project audit.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Concurrency Race Condition in LLM Tracing
* **File:** [N8nLlmTracing.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/N8nLlmTracing.ts)
* **Description:** 
  The tracing handler class `N8nLlmTracing` stores the prompt tokens estimate as an instance property:
  ```typescript
  this.promptTokensEstimate = estimatedTokens;
  ```
  Since a single instance of `N8nLlmTracing` may process multiple requests concurrently, parallel/overlapping execution of `handleLLMStart` will overwrite `this.promptTokensEstimate` with the latest run's value. When `handleLLMEnd` runs subsequently for an earlier run, it will read the wrong (overwritten) token estimate.
* **Impact:** Inaccurate token estimation logging/reporting for concurrent workflows.
* **Recommended Fix:** 
  Store `estimatedTokens` directly inside the run-specific details object `runsMap` under the unique `runId` key in `handleLLMStart`:
  ```typescript
  this.runsMap[runId] = {
    index,
    options,
    messages: prompts,
    promptTokensEstimate: estimatedTokens, // Store here
  };
  ```
  Then, in `handleLLMEnd`, retrieve it using the `runId`:
  ```typescript
  const runDetails = this.runsMap[runId];
  tokenUsageEstimate.promptTokens = runDetails?.promptTokensEstimate ?? 0;
  ```

### 2. Disk Space / Temporary File Leak in Binary Loader
* **File:** [N8nBinaryLoader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/utils/N8nBinaryLoader.ts)
* **Description:** 
  In `getLoader()`, when processing `application/epub+zip` mimetype with a Blob input, a temporary file is created:
  ```typescript
  const tmpFileData = await tmpFile({ prefix: 'epub-loader-' });
  ```
  This creates a temporary file on disk. The method returns `EPubLoader`, but the `cleanup` callback returned by `tmpFile` is completely ignored and lost. 
  In `processItemByKey()`, the local cleanup callback `cleanupTmpFile` is hardcoded to `undefined` and remains so:
  ```typescript
  const cleanupTmpFile: DirectoryResult['cleanup'] | undefined = undefined;
  ...
  await this.cleanupTmpFileIfNeeded(cleanupTmpFile);
  ```
* **Impact:** Every epub document processed leaks a temporary file on disk, potentially causing disk exhaustion over time on long-running self-hosted instances.
* **Recommended Fix:** 
  Modify `getLoader()` to return an object or tuple containing both the loader and an optional cleanup callback:
  ```typescript
  // In getLoader:
  return { loader: new EPubLoader(tmpFileData.path), cleanup: tmpFileData.cleanup };
  ```
  Then in `processItemByKey()`, capture and call the cleanup callback after loading completes:
  ```typescript
  const { loader, cleanup } = await this.getLoader(mimeType, filePathOrBlob, itemIndex);
  const loadedDoc = await this.loadDocuments(loader);
  ...
  if (cleanup) {
    await cleanup();
  }
  ```

---

## 📐 Architectural Debt & Code Smells

### 1. Missing Reference Parameter in Embeddings Router
* **File:** [Embeddings.node.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/Embeddings/Embeddings.node.ts)
* **Description:** 
  The model property loading routing URL uses an expression referencing a parameter that does not exist:
  ```typescript
  url: '={{ $parameter.options?.baseURL?.split("/").slice(-1).pop() || "v1"  }}/models',
  ```
  There is no `baseURL` option defined inside the `options` collection of the `Embeddings` node. Thus, `$parameter.options?.baseURL` is always `undefined`, falling back to `"v1"`.
* **Impact:** Inconsistent API path construction if custom baseURL layouts are expected.
* **Recommended Fix:** Align the routing config with `Chat.node.ts` (using `/v1/models`) or route the request dynamically through `$credentials.baseURL`.

### 2. OpenAI Default Host for LiteLLM Credentials
* **File:** [LiteLLM.credentials.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/LiteLLM.credentials.ts)
* **Description:** 
  The default `baseURL` in the LiteLLM credentials is hardcoded to `https://api.openai.com`.
* **Impact:** LiteLLM is typically self-hosted as a proxy. Hardcoding the default to OpenAI's official endpoint is misleading to users setting up a LiteLLM integration.
* **Recommended Fix:** Change the default value to an empty string or a standard LiteLLM default endpoint like `http://localhost:4000` to clarify its purpose.

---

## 🔒 Type-Safety & Code Quality Issues

### 1. Overly Restrictive Return Type in `getMetadataFiltersValues`
* **File:** [helpers.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/utils/helpers.ts)
* **Description:** 
  The function `getMetadataFiltersValues` has the return type signature:
  ```typescript
  Record<string, never> | undefined
  ```
  A type of `Record<string, never>` means the object keys cannot have any type values associated with them, which is conceptually equivalent to an empty object. However, the function returns a reduction of key-value pairs (which are strings/any).
* **Impact:** Causes TypeScript compilers to complain or infer type of metadata values incorrectly.
* **Recommended Fix:** Change signature to:
  ```typescript
  Record<string, any> | undefined
  ```

### 2. Arrays as Object-Spread Fallbacks
* **File:** [N8nJsonLoader.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/litellm/src/lib/utils/N8nJsonLoader.ts)
* **Description:** 
  The metadata loading utilizes an array fallback for a record:
  ```typescript
  const metadata = getMetadataFiltersValues(this.context, itemIndex) ?? [];
  ```
  This is subsequently used in object-spreading:
  ```typescript
  doc.metadata = {
    ...doc.metadata,
    ...metadata,
  };
  ```
  While spreading an empty array `[]` into an object works in modern JavaScript runtimes without throwing (resulting in no properties added), it is an anti-pattern when an empty object fallback `{}` is intended.
* **Impact:** Confusing type safety and code readability.
* **Recommended Fix:** Use `{}` instead of `[]` as the fallback value.

---

## 🧪 Test Coverage & CI

* **Status:** 🔴 **0% Coverage (No tests found)**
* **Details:** 
  Although `jest.config.ts` and `tsconfig.spec.json` are present, there are **no** unit test or integration test files (`*.spec.ts` or `*.test.ts`) inside the package. Running `yarn nx run n8n-nodes-litellm:test` completes with `No tests found`.
* **Action Required:**
  - Implement basic Jest tests for both `Chat.node.ts` and `Embeddings.node.ts`.
  - Add unit tests for utility files: `N8nLlmTracing.ts`, `N8nBinaryLoader.ts`, and `N8nJsonLoader.ts`.
