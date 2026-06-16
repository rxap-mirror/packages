# TODO: n8n-nodes-file Project Audit & Roadmap

This document outlines the critical bugs, architectural debt, and test coverage improvements identified during the project audit of `n8n-nodes-file`.

---

## 1. Critical Bugs 🛑

### ❌ Incorrect Item Index Resolution in `Hash.node.ts`
- **Location:** [Hash.node.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/file/src/lib/Hash/Hash.node.ts#L87-L89)
- **Problem:** Inside the main item loop of the `execute` method, the code calls `this.getNodeParameter` with a hardcoded item index `0` instead of the loop variable `i`:
  ```typescript
  const operation = this.getNodeParameter('operation', 0, item) as string;
  const binaryProperty = this.getNodeParameter('binaryProperty', 0, item) as string;
  const outputHashField = this.getNodeParameter('outputHashField', 0, item) as string;
  ```
  Passing `0` prevents per-item expression evaluation when the node is processing a batch of multiple files. In batches, all items will evaluate parameters using the values of the first item (`items[0]`).
- **Fix:** Update the calls to use the loop index `i`:
  ```typescript
  const operation = this.getNodeParameter('operation', i, item) as string;
  const binaryProperty = this.getNodeParameter('binaryProperty', i, item) as string;
  const outputHashField = this.getNodeParameter('outputHashField', i, item) as string;
  ```

### ❌ Broken Regex Dependency Check in `generator.ts`
- **Location:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/file/src/generators/init/generator.ts#L46-L51)
- **Problem:** The block intended to check if the package name matches certain development regexes is missing the actual matching call:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) { ... }
  ```
  Because JavaScript arrays are always truthy, this condition evaluates to true for **any** non-dev-dependency, moving regular dependency packages into `devDependencies`. This also causes an infinite flip-flop when processing Angular/NestJS dependencies because they are moved into `dependencies` on line 38, but then immediately moved back to `devDependencies` by this broken condition.
- **Fix:** Add the `.some((rx) => rx.test(packageName))` check to match the pattern from line 36:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) { ... }
  ```

---

## 2. Architectural Debt & Anti-patterns 🏛️

### ⚠️ Virtualized Tree Access for `node_modules` Files
- **Location:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/file/src/generators/init/generator.ts#L90)
- **Problem:** The generator attempts to read and check the existence of files inside `node_modules` using the virtualized Nx `tree` (e.g. `tree.exists(peerPackageJsonFilePath)`). The virtualized `Tree` only maps the workspace source root and does **not** map `node_modules`. As a result, these checks will always return `false`, completely breaking the recursive initialization of peer dependency generators.
- **Fix:** Use standard Node.js filesystem methods (such as `fs.existsSync` or `require.resolve`) to inspect installed files inside `node_modules` instead of querying them from the virtualized `tree`.

### ⚠️ Production Dependencies Scope Pollution
- **Location:** [package.json](file:///mnt/mmuenker/Projects/rxap/packages/packages/n8n/nodes/file/package.json#L7)
- **Problem:** `@nx/devkit` is listed as a regular `dependency` rather than a `devDependency` or `peerDependency`. Because this package is published as an n8n community node, end-users installing this node will needlessly download `@nx/devkit` and its massive transitive dependency graph.
- **Fix:** Either move `@nx/devkit` to `devDependencies`, or strip/isolate generators from the final bundle during build/publish tasks.

---

## 3. Test Coverage & Quality Assurance 🧪

### ⚠️ Total Lack of Tests
- **Problem:** The project currently has zero tests. Running `yarn nx run n8n-nodes-file:test` executes Jest successfully but reports: `No tests found, exiting with code 0`.
- **Fix:** Implement unit tests for the node in `src/lib/Hash/Hash.node.spec.ts` using a mock `IExecuteFunctions` context to verify hash calculations across different algorithms (SHA-256, MD5, SHA-1, etc.) and validate batch execution handling.
