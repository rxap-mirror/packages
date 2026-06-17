# TODO: n8n-nodes-firecrawl

This document outlines the identified critical bugs, logic errors, architectural debt, and library anti-patterns found during the project audit of `n8n-nodes-firecrawl`, along with recommended fixes.

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

---

## Resolved (2026-06)
- The `extract` operation in `ToolFirecrawl` now passes the resolved `finalUrl` instead of the
  raw `url` with unresolved placeholders. (The PostgreSQL/Keyv connection-pool leak remains open —
  deferred as it needs a connection-reuse/lifecycle design decision.)
