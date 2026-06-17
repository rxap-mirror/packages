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

## 2. Test Coverage & CI/CD

### 🟡 Zero Test Coverage
- **Issue**: The project contains a valid `jest.config.ts` but has zero unit or integration test files (`No tests found, exiting with code 0`).
- **Recommendation**:
  - Add test files (e.g. `src/lib/neo4j.node.spec.ts`) to verify correct class initialization, credential loading, and query-building behaviors.
