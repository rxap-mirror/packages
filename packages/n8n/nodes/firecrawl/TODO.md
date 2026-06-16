# TODO: n8n-nodes-firecrawl

This document outlines the identified critical bugs, logic errors, architectural debt, and library anti-patterns found during the project audit of `n8n-nodes-firecrawl`, along with recommended fixes.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Incorrect `if` Check in `init` Generator
* **Location:** [generator.ts:L45-L51](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/generators/init/generator.ts#L45-L51)
* **Description:**
  The check to see if a package is a plugin, workspace, or schematic is missing a `.some(...)` evaluation:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  Since any non-empty array is truthy in JavaScript/TypeScript, this condition evaluates to `true` for *all* packages when `!isDevDependency` is true, regardless of their actual package name. This causes non-dev dependencies to be incorrectly moved to `devDependencies` in the root `package.json`.
* **Recommended Fix:**
  Add the `.some((rx) => rx.test(packageName))` evaluation, similar to the pattern used on line 36:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  )
  ```

### 2. Parameterized URL Bug in AI Tool (Extract Operation)
* **Location:** [ToolFirecrawl.node.ts:L456](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/lib/Firecrawl/ToolFirecrawl.node.ts#L456)
* **Description:**
  For the `extract` operation in `ToolFirecrawl`, the node executes the `extract` call with the original `url` parameter (containing unresolved placeholders like `{url}`) instead of the resolved `finalUrl` which has placeholders replaced with the LLM's query arguments:
  ```typescript
  case 'extract':
    return JSON.stringify(await cached({
        keyv,
        ttl: cacheTTL > 0 ? cacheTTL : undefined,
      }, extract, url, { // <--- Bug: 'url' should be 'finalUrl'
        prompt,
        schema,
        systemPrompt,
        enableWebSearch,
        showSources,
      }), undefined, 2);
  ```
  This causes the API request to fail because the raw URL string with unresolved placeholders is passed directly to the Firecrawl client.
* **Recommended Fix:**
  Change `url` to `finalUrl` in the `cached` call:
  ```typescript
  }, extract, finalUrl, {
  ```

---

## 🧹 Library Anti-Patterns

### 1. Reading `node_modules` via virtualized `Tree`
* **Location:** [generator.ts:L83-L137](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/generators/init/generator.ts#L83-L137)
* **Description:**
  The `init` generator attempts to check for the existence and content of package config files in `node_modules` using the virtualized Nx `Tree` object:
  ```typescript
  const peerPackageJsonFilePath = join('node_modules', ...peer.split('/'), 'package.json');
  if (!tree.exists(peerPackageJsonFilePath)) { ... }
  ```
  In an Nx workspace, the virtual `Tree` is designed to represent and track source files of the workspace under version control and excludes `node_modules/` by default. Therefore, `tree.exists(...)` inside `node_modules` will always return `false`. As a result, the peer dependency generator execution loop is silently bypassed for every peer.
* **Recommended Fix:**
  Since `node_modules` are physical dependencies on disk, use the standard Node.js `fs` module to check and read physical paths in `node_modules`, or load them via Node's `require.resolve()` mechanisms rather than using the virtual `Tree` object.

---

## 🏛️ Architectural Debt & Resource Leaks

### 1. PostgreSQL Database Connection Leaks
* **Locations:**
  * [Firecrawl.node.ts:L278-L298](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/lib/Firecrawl/Firecrawl.node.ts#L278-L298)
  * [ToolFirecrawl.node.ts:L330-L349](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/lib/Firecrawl/ToolFirecrawl.node.ts#L330-L349)
* **Description:**
  Every time the Firecrawl regular node executes or the AI tool supplies data/executes, it instantiates a new `KeyvPostgres` client/connection pool under the hood:
  ```typescript
  keyv = new Keyv(
    new KeyvPostgres({
      uri: `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=${ssl}`,
      useUnloggedTable: true
    })
  );
  ```
  However, these connection pools are never disconnected, closed, or cleaned up. In a busy workflow, this causes a new PostgreSQL connection pool to be opened and leaked on every single execution, eventually exhausting the database server's connection limit and causing it to crash or reject new connections.
* **Recommended Fix:**
  * Implement connection sharing or cache the `KeyvPostgres` instance globally (or at least within a static/singleton cache provider) to reuse the connection pool across executions.
  * Alternatively, implement proper lifecycle management to disconnect the `Keyv` / `KeyvPostgres` instance (e.g., using `await keyv.disconnect()`) once the execution scope is complete.

### 2. Hardcoded SaaS Endpoint in Credentials
* **Location:** [Firecrawl.credentials.ts:L36-L40](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/firecrawl/src/lib/Firecrawl.credentials.ts#L36-L40)
* **Description:**
  The credential definition hardcodes the default SaaS API endpoint `https://api.firecrawl.dev/v1/team/credit-usage` for its testing and defaults:
  ```typescript
  test = {
    request: {
      url: 'https://api.firecrawl.dev/v1/team/credit-usage'
    }
  };
  ```
  Since Firecrawl is an open-source tool that can be self-hosted, users should be able to supply a custom base URL. Hardcoding this domain makes it impossible for users of self-hosted Firecrawl instances to test credentials or direct their queries to their own instances.
* **Recommended Fix:**
  Add a `baseUrl` option to the credential properties (defaulting to `https://api.firecrawl.dev`) and use it dynamically for testing and node operations.

---

## 🧪 Test Coverage

### 1. Missing Test Coverage (0%)
* **Description:**
  While Jest is properly configured in `project.json` and `jest.config.ts`, there are **zero** unit or integration tests written for this package (`No tests found, exiting with code 0`).
* **Recommended Fix:**
  Write core unit tests for:
  * **Placeholder utilities (`utils.ts`)** to verify correct parsing and parameterization of URLs.
  * **The Init Generator (`generator.ts`)** to assert correct dependency partitioning between `dependencies` and `devDependencies` on a mock `Tree`.
  * **The AI tool / Regular node** using mocked Firecrawl client outputs.
