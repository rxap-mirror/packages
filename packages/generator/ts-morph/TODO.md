# TODO: generator-ts-morph

This file tracks the outstanding bugs, architectural debt, testing gaps, and other improvements identified during the project audit of `@rxap/generator-ts-morph`.

## Architectural Debt & Anti-patterns

### 1. Mixing Physical (`__dirname`) and Virtual (`Tree`) Paths
In `src/generators/init/generator.ts` (lines 11–14):
```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
```
* **Issue:** Relying on physical filesystem location (`__dirname`) via `path.join` and converting it to a relative path against the virtual `tree.root` is highly fragile. When the generator is executed inside a consuming workspace (where this package is in `node_modules`), `__dirname` will point into the `node_modules` folder, which might not be tracked or accessible via the virtual `Tree`.
* **Recommended Fix:** Use standard workspace file querying, or use the physical `fs` module to check and read files when operating outside the virtual workspace tree scope. Alternatively, locate the package package.json using more robust Nx utilities.

### 2. Virtual Tree Operations inside `node_modules`
In `src/generators/init/generator.ts` (lines 85–124):
```typescript
  const peerPackageJsonFilePath = join(
    'node_modules',
    ...peer.split('/'),
    'package.json'
  );
  if (!tree.exists(peerPackageJsonFilePath)) { ... }
```
* **Issue:** Reading or checking paths within `node_modules` using the virtual `Tree` is a major anti-pattern. The virtual tree is designed to track changes to workspace source code, and `node_modules` is usually ignored or untracked. Additionally, `join` creates platform-dependent paths (with `\` on Windows), whereas the Nx virtual `Tree` expects normalized paths (always with `/`), which can lead to failures on non-Unix platforms.
* **Recommended Fix:** Since `node_modules` are read-only external dependencies, locate and read their package files using node's `require.resolve()` or the physical `fs` package (e.g., `fs.existsSync`, `fs.readFileSync`), rather than the virtual `tree.exists()` and `tree.read()`.

### 3. Dynamic `require` inside the Generator
In `src/generators/init/generator.ts` (lines 126–130):
```typescript
  const initGenerator = require(join(
    'node_modules',
    ...peer.split('/'),
    initGeneratorFilePath
  ))?.default;
```
* **Issue:** Dynamically importing/requiring peer dependency init generators directly from `node_modules` can fail if packages are not fully installed/hoisted or are compiled differently.
* **Recommended Fix:** Safely wrap the require block in a try-catch block and log useful debugging information, or use standard Nx generator/schematic invocation wrapper tasks instead of running the functions directly.

---

## Testing & Coverage

### 1. Complete Lack of Unit Tests
* **Issue:** There are absolutely no `.spec.ts` files or integration tests in `@rxap/generator-ts-morph`, despite having a `jest.config.ts` configuration.
* **Recommended Fix:** Create an integration test in `src/generators/init/generator.spec.ts` using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify:
  1. The generator runs successfully when there are no peer dependencies.
  2. Peer dependencies are correctly added to the root `package.json`'s dependencies or devDependencies according to the package patterns.
  3. Dynamic loading and execution of peer dependency init generators behaves robustly.
