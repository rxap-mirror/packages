# TODO: n8n-nodes-neo4j Audit & Refactoring

This document outlines the findings, critical bugs, architectural debt, and functional gaps identified during the audit of the `@rxap/n8n-nodes-neo4j` package, along with recommended fixes.

---

## 1. Critical Functional Gaps (Skeleton Implementation)

### 🔴 Empty Node Definition & Action Handlers
- **File**: `src/lib/neo4j.node.ts`
- **File**: `src/lib/actions/create.operation.ts`
- **File**: `src/lib/actions/detach-delete.operation.ts`
- **File**: `src/lib/actions/execute-query.operation.ts`
- **File**: `src/lib/actions/match.operation.ts`
- **File**: `src/lib/actions/set.operation.ts`
- **Issue**: These files are completely empty placeholder files (0 bytes). Consequently, this community node package provides no functionality beyond defining basic authentication credentials (`neo4j-basic-auth.credentials.ts`). 
- **Impact**: Any attempt to load this node in n8n will fail or do nothing because `src/lib/neo4j.node.js` is registered as a node file in `package.json` but contains no export or class implementation.
- **Recommendation**:
  - Implement the `Neo4j` class in `neo4j.node.ts` implementing `INodeType` from `n8n-workflow`.
  - Implement each operation (Create, Detach & Delete, Execute Query, Match, Set) under `src/lib/actions/` to connect to a Neo4j database using a neo4j driver, execute Cypher queries, and process the results.

---

## 2. Architectural Debt & Anti-Patterns

### 🟡 Virtual Tree & Physical Disk Coupling
- **File**: `src/generators/init/generator.ts` (Lines 11–20)
- **Issue**: The generator calculates a workspace-relative path using the physical disk's `__dirname`:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
  And then tries to read it from the virtual `Tree`:
  ```typescript
  tree.read(packageJsonFilePath, 'utf-8')
  ```
- **Impact**: When this generator is executed in a consumer workspace where `@rxap/n8n-nodes-neo4j` is installed as an npm dependency inside `node_modules`, `__dirname` points inside the physical `node_modules` directory on disk. Since `node_modules` is not typically part of the virtualized Nx `Tree` (or is ignored), `tree.exists(packageJsonFilePath)` will return `false`, aborting generator initialization.
- **Recommendation**:
  - Read the library's own `package.json` using Node's native physical disk methods (`require` or `fs.readFileSync`) rather than the virtualized `Tree`, as the virtualized `Tree` should only be used to read or modify files belonging to the host workspace itself.

### 🟡 Incompatible Direct `node_modules` Traversal
- **File**: `src/generators/init/generator.ts` (Lines 83–110)
- **Issue**: The init generator manually traverses the filesystem checking for `node_modules/` folders and trying to read peer package configs via `tree.read()`:
  ```typescript
  const peerPackageJsonFilePath = join(
    'node_modules',
    ...peer.split('/'),
    'package.json'
  );
  ```
- **Impact**: 
  - **Virtual Tree Failures**: Files inside `node_modules` are ignored by Nx's virtual tree, so `tree.exists()` and `tree.read()` checks will return false or null.
  - **Yarn PnP & Modern Layout Incompatibility**: Hardcoding the structure `node_modules/<peer-name>/package.json` breaks completely in environments using Yarn Plug'n'Play (PnP) or other modern package layouts (like pnpm symlinks) where dependencies do not reside in direct nested `node_modules` folders.
- **Recommendation**:
  - Locate peer packages and their configurations using Node's standard module resolution engine via `require.resolve(...)` (e.g. `require.resolve(`${peer}/package.json`)`).
  - Read their contents using physical `fs` APIs, avoiding virtual `Tree` calls for external library artifacts.

---

## 3. Test Coverage & CI/CD

### 🟡 Zero Test Coverage
- **Issue**: The project contains a valid `jest.config.ts` but has zero unit or integration test files (`No tests found, exiting with code 0`).
- **Recommendation**:
  - Add test files (e.g. `src/lib/neo4j.node.spec.ts`) to verify correct class initialization, credential loading, and query-building behaviors.
