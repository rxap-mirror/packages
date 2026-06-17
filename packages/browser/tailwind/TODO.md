# TODO - @rxap/browser-tailwind Audit Findings & Action Items

This document outlines the findings and recommended actions from the project audit of `@rxap/browser-tailwind`. It highlights critical logic bugs, architectural debt, and testing coverage gaps that should be addressed to improve stability, reliability, and usability.

---

## 🏛️ Architectural Debt & Package Configuration Issues

### 1. Missing `peerDependencies` Definition
- **Location:** [package.json](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/tailwind/package.json)
- **Problem:**
  The package description states that the library's `init` generator adds missing peer dependencies to the host project's `package.json` and runs their respective init generators. However, `@rxap/browser-tailwind` defines **no** `peerDependencies` inside its own `package.json` (only regular `dependencies` like `tailwindcss` and `@tailwindcss/typography`).
  Consequently, the generator terminates immediately on line 26:
  ```typescript
  if (!peerDependencies || !Object.keys(peerDependencies).length) {
    console.log('No peer dependencies found');
    return;
  }
  ```
  The generator is currently a no-op because of this misconfiguration.
- **Recommended Fix:**
  Redefine the core runtime and configuration dependencies (e.g. `tailwindcss` and `@tailwindcss/typography`) as `peerDependencies` in `package.json` so that the `init` generator can detect and install them in host applications.

---

## 🧪 Testing & Validation

### 2. Zero Test Coverage
- **Location:** Whole project
- **Problem:**
  There are absolutely no test files (`*.spec.ts` or integration tests) inside this package. The Tailwind configuration has no checks to ensure colors and fonts are correctly resolved or parsed. The `init` generator has zero unit/integration tests to verify peer dependency coercion or package.json manipulations.
- **Recommended Fix:**
  1. Add unit tests for the `init` generator under `src/generators/init/generator.spec.ts` using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to verify that dependencies are correctly moved/added.
  2. Add validation tests for the exported `RXAP_TAILWIND_CONFIG` to confirm it exports standard properties and handles CSS variable mappings correctly.
