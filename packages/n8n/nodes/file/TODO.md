# TODO: n8n-nodes-file Project Audit & Roadmap

This document outlines the critical bugs, architectural debt, and test coverage improvements identified during the project audit of `n8n-nodes-file`.

---

## 1. Architectural Debt & Anti-patterns 🏛️

### ⚠️ Production Dependencies Scope Pollution
- **Location:** [package.json](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/file/package.json#L7)
- **Problem:** `@nx/devkit` is listed as a regular `dependency` rather than a `devDependency` or `peerDependency`. Because this package is published as an n8n community node, end-users installing this node will needlessly download `@nx/devkit` and its massive transitive dependency graph.
- **Fix:** Either move `@nx/devkit` to `devDependencies`, or strip/isolate generators from the final bundle during build/publish tasks.

---

## 2. Test Coverage & Quality Assurance 🧪

### ⚠️ Total Lack of Tests
- **Problem:** The project currently has zero tests. Running `yarn nx run n8n-nodes-file:test` executes Jest successfully but reports: `No tests found, exiting with code 0`.
- **Fix:** Implement unit tests for the node in `src/lib/Hash/Hash.node.spec.ts` using a mock `IExecuteFunctions` context to verify hash calculations across different algorithms (SHA-256, MD5, SHA-1, etc.) and validate batch execution handling.
