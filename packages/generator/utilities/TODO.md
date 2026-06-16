# TODO: @rxap/generator-utilities

Here are the identified improvements and critical bug fixes for the `generator-utilities` library:

## 1. Dead Conditional Array Evaluation (Critical Logic Bug)
In `generator.ts` on lines 45-58, there is a major logic bug in the `if` statement:
```typescript
if (
  !isDevDependency && [
    /^@rxap\/plugin/,
    /^@rxap\/workspace/,
    /@rxap\/schematic/,
  ]
) {
  rootPackageJson.devDependencies ??= {};
  rootPackageJson.devDependencies[packageName] =
    rootPackageJson.dependencies[packageName];
  delete rootPackageJson.dependencies[packageName];
  isDevDependency = true;
  tree.write('package.json', JSON.stringify(rootPackageJson, null, 2));
}
```
- **Bug:** The array of regexes `[/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/]` is declared inside the `if` conditional expression but is **never evaluated** via `.some()` or `.test()`. In JavaScript, non-empty arrays evaluate to truthy. Therefore, this `if` block is equivalent to `!isDevDependency && true`. It will execute for **every** package that is not a devDependency, regardless of whether its name matches `@rxap/plugin`, `@rxap/workspace`, or `@rxap/schematic`!
- **Action:** Refactor the condition to correctly check the `packageName` against the regexes using `.some()`:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some((rx) => rx.test(packageName))
  ) {
  ```

## 2. Reading and Validating Virtualized Tree of `node_modules` (Nx Anti-Pattern)
On line 85 and subsequent lines:
```typescript
const peerPackageJsonFilePath = join(
  'node_modules',
  ...peer.split('/'),
  'package.json'
);
if (!tree.exists(peerPackageJsonFilePath)) { ... }
```
- **Issue:** Inside an Nx generator, the `Tree` represents the virtual workspace file system. `node_modules/` is typically gitignored and not virtualized inside the virtual tree. Attempting to run `tree.exists()` or `tree.read()` on `node_modules` paths during dry-runs or in a clean environment will fail or return `false`.
- **Action:** Use Node's standard module resolution API (`require.resolve`) to locate the physical `package.json` file of the peer dependency on disk, and read it using the standard `fs` module, rather than trying to look it up in the virtual `Tree`.
  ```typescript
  try {
    const peerPackageJsonPath = require.resolve(`${peer}/package.json`, { paths: [tree.root] });
    const peerPkg = JSON.parse(fs.readFileSync(peerPackageJsonPath, 'utf-8'));
    // ...
  } catch (err) {
    console.log(`Peer dependency ${peer} is not installed physically in node_modules`);
  }
  ```

## 3. Unit Test Coverage
- **Issue:** No tests were found.
- **Action:** Add unit tests using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify that `initGenerator` correctly moves dependencies to/from `devDependencies` depending on their names, and resolves/injects missing peer dependencies appropriately.
