# TODO: n8n-nodes-gitlab Auditing Findings & Recommendations

This document outlines the findings and recommended improvements identified during the audit of the `@rxap/n8n-nodes-gitlab` library.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Infinite Recursion / Stack Overflow Risk in `ResolveRef`
- **Location**: `@rxap/n8n-utilities` (`src/lib/open-api-node.ts`) used by `Gitlab` and `GitlabTool` nodes.
- **Problem**: The `ResolveRef` function resolves `$ref` properties in the OpenAPI spec recursively but lacks tracking for circular references / visited nodes:
  ```typescript
  export function ResolveRef(openApiSpec: OpenAPIV3.Document, node: any, parent?: any, key?: string) {
    if (typeof node !== 'object' || node === null) { return; }
    if (node['$ref']) {
      // ...
      parent[key] = openApiSpec.components.schemas[name];
      ResolveRef(openApiSpec, parent[key], parent, key);
    } else {
      for (const [ k, v ] of Object.entries(node)) {
        ResolveRef(openApiSpec, v, node, k);
      }
    }
  }
  ```
  Since GitLab's OpenAPI spec is huge (2.7 MB) and highly self-referential/circular (e.g. issues reference projects, projects reference groups, groups reference parents/subgroups), this function will enter an infinite recursion loop and crash with a `RangeError: Maximum call stack size exceeded` during registration or instantiation.
- **Recommended Fix**:
  - Implement a visited `Set` or map tracking already-resolved schema paths or references in `ResolveRef` to skip processing them again.
  - Alternatively, replace this custom parser with an industry-standard, robust ref resolver like `@apidevtools/json-schema-ref-parser`.

### 2. Flawed Response Parsing in `OpenApiNode`
- **Location**: `@rxap/n8n-utilities` (`src/lib/open-api-node.ts`).
- **Problem**: When a request succeeds and returns an already-parsed JSON object, the parsing block throws an error:
  ```typescript
  let data = response instanceof Buffer ? JSON.parse(response.toString()) : response;
  let isJSON = false;
  try {
    data = JSON.parse(data); // Fails when data is already an object!
    isJSON = true;
  } catch (e) {}
  ```
  Since `data` is already parsed as an object, calling `JSON.parse(data)` implicitly converts it to `"[object Object]"` which fails JSON parsing. This sets `isJSON = false`, pushing the response into the `else` block:
  ```typescript
  results[i] = { json: { response: data } };
  ```
  This incorrectly wraps the JSON response under a nested `response` key instead of spreading/retaining it as standard JSON `{ json: data }`.
- **Recommended Fix**:
  - Check if `typeof data === 'object'` before attempting to call `JSON.parse`.
  ```typescript
  let isJSON = typeof data === 'object' && data !== null;
  if (!isJSON) {
    try {
      data = JSON.parse(data);
      isJSON = true;
    } catch (e) {}
  }
  ```

---

## 🏗️ Architectural Debt & Resource Consumption

### 1. Synchronous, Duplicated Spec Parsing during Startup
- **Location**: `Gitlab.node.ts` and `GitlabTool.node.ts`.
- **Problem**: Both nodes read, parse, and recursively dereference a 2.7 MB `openapi.json` synchronously in their constructors.
  - This blocks the single-threaded Node.js event loop on startup.
  - Because they are separate classes, this 2.7 MB parsing and heavy circular-resolution happens **twice** (duplicated execution and memory allocation).
- **Recommended Fix**:
  - Cache the parsed/dereferenced spec at the module or static class level so it is only processed once.
  - Consider pruning or pre-compiling the OpenAPI spec during build time to exclude unused endpoints or schemas, reducing the 2.7 MB runtime overhead.

### 2. Non-Portable `download-openapi` Target
- **Location**: `project.json`
- **Problem**: The `download-openapi` target relies on shell commands (`wget`, `python3`, `jq`, and `sponge`):
  ```json
  "commands": [
    "wget -O openapi.yaml https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/api/openapi/openapi_v2.yaml",
    "python3 -c 'import sys, yaml, json; print(json.dumps(yaml.safe_load(sys.stdin)))' < openapi.yaml > openapi.json",
    "jq '.servers = [{\"url\": \"https://gitlab.com\", \"description\": \"GitLab SaaS\"}]' openapi.json | sponge openapi.json"
  ]
  ```
  This makes development scripts brittle and non-portable for developers on other operating systems (e.g. Windows without WSL or macOS without `moreutils`).
- **Recommended Fix**:
  - Replace these commands with a portable Node.js script (e.g., using `axios`/`fetch` and `js-yaml` which are already in `node_modules` of the workspace) to perform the download, YAML parsing, and server block modification.

---

## 🧪 Test Coverage & Package Standards

### 1. Completely Missing Test Coverage
- **Location**: `jest.config.ts`, `tsconfig.spec.json`
- **Problem**: There are zero test files in this project. No automated checks exist to verify if the nodes instantiate successfully or if the GitLab OpenAPI spec causes runtime regressions.
- **Recommended Fix**:
  - Add simple unit tests (e.g., `src/lib/Gitlab/Gitlab.node.spec.ts`) that instantiate `Gitlab` and `GitlabTool` nodes to catch recursion crashes.

### 2. Empty Package Entrypoint
- **Location**: `src/index.ts`
- **Problem**: `src/index.ts` is currently an empty stub (`export {};`). While n8n loads nodes directly by referencing their JS paths in `package.json`, an empty entrypoint is an anti-pattern that can break dependency graphing and monorepo exports.
- **Recommended Fix**:
  - Export `Gitlab` and `GitlabTool` from `src/index.ts` for clean indexing and external usage.
