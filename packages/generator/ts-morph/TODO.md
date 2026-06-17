# TODO: generator-ts-morph

This file tracks the outstanding bugs, architectural debt, testing gaps, and other improvements identified during the project audit of `@rxap/generator-ts-morph`.

## Testing & Coverage

### 1. Complete Lack of Unit Tests
* **Issue:** There are absolutely no `.spec.ts` files or integration tests in `@rxap/generator-ts-morph`, despite having a `jest.config.ts` configuration.
* **Recommended Fix:** Create an integration test in `src/generators/init/generator.spec.ts` using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify:
  1. The generator runs successfully when there are no peer dependencies.
  2. Peer dependencies are correctly added to the root `package.json`'s dependencies or devDependencies according to the package patterns.
  3. Dynamic loading and execution of peer dependency init generators behaves robustly.
