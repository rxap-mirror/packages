# TODO: @rxap/generator-utilities

Here are the identified improvements and critical bug fixes for the `generator-utilities` library:

## 1. Unit Test Coverage
- **Issue:** No tests were found.
- **Action:** Add unit tests using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify that `initGenerator` correctly moves dependencies to/from `devDependencies` depending on their names, and resolves/injects missing peer dependencies appropriately.
