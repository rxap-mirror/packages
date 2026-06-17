# TODO: Plugin GPT Audit & Improvements

This document lists the findings from the audit of the `plugin-gpt` package. It covers critical logic bugs, architectural debt, library anti-patterns, and recommended fixes to improve robustness, maintainability, and correctness.

---

## 🟡 Architectural Debt & Anti-Patterns

### 1. Complete Absence of Tests
- **Problem:** There are no `*.spec.ts` files in the package. Although Jest is configured in `jest.config.ts`, running `yarn nx run plugin-gpt:test` outputs "No tests found".
- **Recommended Fix:** Create unit tests in a `src/generators/.../*.spec.ts` file to test critical functions like `cleanupJsDoc`, `composeContext`, and `skipSourceFile`.

### 2. Prototype Pollution / Lack of Dependency Declaration (`colors`)
- **Problem:** `simple-prompt.ts` imports `'colors'` to add `.grey` / `.red` color properties directly to the global `String.prototype`. This is a library anti-pattern that can cause collisions or compatibility issues in modern environments. Furthermore, `colors` is not declared in `package.json` dependencies.
- **Recommended Fix:** Use standard ANSI escape sequences (e.g., `\x1b[31m` as done in `process-project.ts`) or use a safe, lightweight alternative like `picocolors` or `chalk` (and declare it in `package.json`).

### 3. Brittle Delimiter Cleanup in `cleanupJsDoc`
- **Location:** `packages/plugin/gpt/src/generators/documentation/cleanup-js-doc.ts` (line 14)
- **Problem:** The function unconditionally does `cleanJsDocArray.pop();`. If the LLM returns a single line of text or does not close with a newline or standard comment block, this will discard actual content or throw an error.
- **Recommended Fix:** Perform a check before popping to ensure the last line is indeed an empty string or a closing comment delimiter:
  ```typescript
  if (cleanJsDocArray.length > 0 && (cleanJsDocArray[cleanJsDocArray.length - 1] === '' || cleanJsDocArray[cleanJsDocArray.length - 1].includes('*/'))) {
    cleanJsDocArray.pop();
  }
  ```

### 4. Brittle Tiktoken Model Support
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

---

## Resolved (2026-06)
- `getReferenced` in `composeContext` now tracks visited source files, preventing infinite
  recursion / stack overflow on circular imports and redundant traversal.
- Removed the premature unconditional `return;` in the documentation generator so every
  function in every source file is processed.
- Added the missing `tiktoken` production dependency and removed the unused `gpt-3-encoder`.
