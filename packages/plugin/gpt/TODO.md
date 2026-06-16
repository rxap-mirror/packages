# TODO: Plugin GPT Audit & Improvements

This document lists the findings from the audit of the `plugin-gpt` package. It covers critical logic bugs, architectural debt, library anti-patterns, and recommended fixes to improve robustness, maintainability, and correctness.

---

## 🔴 Critical Bugs

### 1. Infinite Recursion / Stack Overflow in `composeContext`
- **Location:** `packages/plugin/gpt/src/generators/documentation/compose-context.ts` (lines 29–34)
- **Problem:** The function `getReferenced` recursively traverses import dependencies:
  ```typescript
  function getReferenced(sourceFile: SourceFile): SourceFile[] {
    return [
      ...sourceFile.getReferencedSourceFiles(),
      ...sourceFile.getReferencedSourceFiles().map(sf => getReferenced(sf)).flat()
    ];
  }
  ```
  If there is a circular reference among the files (e.g., `File A` imports `File B` and `File B` imports `File A`), this function will enter an infinite loop and crash with a `RangeError: Maximum call stack size exceeded`. Additionally, if multiple files reference a shared module, it is analyzed repeatedly, leading to exponential traversal times.
- **Recommended Fix:** Pass a `Set<string>` of visited file paths to avoid processing the same file multiple times:
  ```typescript
  function getReferenced(sourceFile: SourceFile, visited = new Set<string>()): SourceFile[] {
    const path = sourceFile.getFilePath();
    if (visited.has(path)) {
      return [];
    }
    visited.add(path);
    const referenced = sourceFile.getReferencedSourceFiles();
    return [
      ...referenced,
      ...referenced.flatMap(sf => getReferenced(sf, visited))
    ];
  }
  ```

### 2. Severe Logical Defect in `init` Generator
- **Location:** `packages/plugin/gpt/src/generators/init/generator.ts` (lines 45–58)
- **Problem:** The `if` condition intended to match the package name against schematic/plugin regexes is broken:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
  ```
  Since the array literal `[...]` is always truthy, `!isDevDependency && [...]` evaluates to truthy for *any* package that is not already in `devDependencies`. This incorrectly pushes every non-dev dependency package to `devDependencies` regardless of whether its name matches the regex.
- **Recommended Fix:** Use `.some()` to verify the pattern matches the package name:
  ```typescript
  if (
    !isDevDependency &&
    [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/].some((rx) => rx.test(packageName))
  ) {
  ```

### 3. Broken Inline Loop / Early Return in `documentation` Generator
- **Location:** `packages/plugin/gpt/src/generators/documentation/generator.ts` (lines 58–85)
- **Problem:** The generator includes a nested loop to process functions. However, there is a premature, unconditional `return;` inside the first function iteration:
  ```typescript
  for (const functionDeclaration of sourceFile.getFunctions()) {
    ...
    return; // <-- Closes the generator execution immediately!
  }
  ```
  This causes the generator to document at most **only one function in the first source file** and then terminate silently.
  Additionally, the helper function `processProject` is imported but completely unused.
- **Recommended Fix:** Either remove the premature `return;` or refactor the generator to call `processProject(options, projectName, tree)` which implements the correct non-inline traversal loop.

### 4. Missing Production Dependency (`tiktoken`)
- **Location:** `packages/plugin/gpt/package.json`
- **Problem:** `simple-prompt.ts` imports `tiktoken` to estimate token counts, but `tiktoken` is not declared as a dependency in the library's `package.json` (only in the monorepo root). This will cause execution to fail in environments where the package is installed as a published npm dependency.
- **Recommended Fix:** Add `"tiktoken"` to the `dependencies` block of `packages/plugin/gpt/package.json`.

---

## 🟡 Architectural Debt & Anti-Patterns

### 1. Complete Absence of Tests
- **Problem:** There are no `*.spec.ts` files in the package. Although Jest is configured in `jest.config.ts`, running `yarn nx run plugin-gpt:test` outputs "No tests found".
- **Recommended Fix:** Create unit tests in a `src/generators/.../*.spec.ts` file to test critical functions like `cleanupJsDoc`, `composeContext`, and `skipSourceFile`.

### 2. Unused Dependency (`gpt-3-encoder`)
- **Problem:** `"gpt-3-encoder": "^1.1.4"` is listed as a dependency in `package.json` but is never imported or used anywhere in the codebase.
- **Recommended Fix:** Remove `"gpt-3-encoder"` from `package.json`.

### 3. Prototype Pollution / Lack of Dependency Declaration (`colors`)
- **Problem:** `simple-prompt.ts` imports `'colors'` to add `.grey` / `.red` color properties directly to the global `String.prototype`. This is a library anti-pattern that can cause collisions or compatibility issues in modern environments. Furthermore, `colors` is not declared in `package.json` dependencies.
- **Recommended Fix:** Use standard ANSI escape sequences (e.g., `\x1b[31m` as done in `process-project.ts`) or use a safe, lightweight alternative like `picocolors` or `chalk` (and declare it in `package.json`).

### 4. Brittle Delimiter Cleanup in `cleanupJsDoc`
- **Location:** `packages/plugin/gpt/src/generators/documentation/cleanup-js-doc.ts` (line 14)
- **Problem:** The function unconditionally does `cleanJsDocArray.pop();`. If the LLM returns a single line of text or does not close with a newline or standard comment block, this will discard actual content or throw an error.
- **Recommended Fix:** Perform a check before popping to ensure the last line is indeed an empty string or a closing comment delimiter:
  ```typescript
  if (cleanJsDocArray.length > 0 && (cleanJsDocArray[cleanJsDocArray.length - 1] === '' || cleanJsDocArray[cleanJsDocArray.length - 1].includes('*/'))) {
    cleanJsDocArray.pop();
  }
  ```

### 5. Brittle Tiktoken Model Support
- **Location:** `packages/plugin/gpt/src/generators/documentation/simple-prompt.ts` (line 45)
- **Problem:** Calling `encoding_for_model(options.model)` with newer models (like `'o3-mini'`) might throw an error if the installed version of `tiktoken` does not support it natively.
- **Recommended Fix:** Add a try-catch fallback:
  ```typescript
  let enc;
  try {
    enc = encoding_for_model(options.model);
  } catch {
    enc = encoding_for_model('gpt-4o');
  }
  ```
