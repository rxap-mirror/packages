# TODO: `@rxap/plugin-storybook` Audit & Improvement Plan

This document outlines the findings from an architectural and functional audit of the `@rxap/plugin-storybook` package. It provides actionable recommendations to address critical debt, test coverage, and code design.

---

## 1. Test Coverage & Quality Assurance

> [!IMPORTANT]
> **Priority:** High | **Impact:** Critical for Stability

### Findings
- **Zero Unit Tests:** The library contains complete Jest test configurations (`jest.config.ts`, `tsconfig.spec.json`) but **zero** unit test files (`*.spec.ts` or `*.test.ts`).
- AST modifications via `ts-morph` (`src/lib/coerce-main.ts`, `src/lib/coerce-preview.ts`, `src/lib/coerce-ts-config.ts`) are extremely fragile and susceptible to breakage during Nx, Angular, or TypeScript version upgrades.

### Recommendations
- **Implement Generator Unit Tests:** Create test files under `src/generators/init/generator.spec.ts`, `src/generators/init-library/generator.spec.ts`, and `src/generators/init-application/generator.spec.ts`.
- **Use Devkit Testing Utilities:** Use `createTreeWithEmptyWorkspace` from `@nx/devkit/testing` to mock a workspace, run the generators, and assert:
  - Correct packages are added to `package.json`.
  - Config files (`.storybook/main.ts`, `.storybook/preview.ts`) are correctly modified with the expected AST transformations.
  - Target configurations are correctly merged into `project.json`.

---

## 2. Dependency Management & Versioning

> [!WARNING]
> **Priority:** Medium-High | **Impact:** High (Risk of workspace mismatch)

### Findings
- **Hardcoded `'latest'` Versions:** In `src/generators/init/init-workspace.ts`, external Storybook packages and Compodoc are installed using the `'latest'` tag:
  ```typescript
  await AddPackageJsonDevDependency(tree, '@compodoc/compodoc', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@storybook/addon-themes', 'latest', { soft: true });
  ...
  ```
  While `{ soft: true }` prevents overwriting existing versions, new workspaces or clean setups will install the absolute latest versions. This introduces a high risk of mismatch with the version of `@nx/storybook` (which is correctly aligned via `GetNxVersion(tree)`).

### Recommendations
- **Align with Nx/Storybook Versions:** Resolve the version of Storybook that aligns with `@nx/storybook` and `@nx/angular`. Consider reading the compatible Storybook version dynamically or defining a mapping of supported versions instead of blindly using `'latest'`.

---

## 3. High Coupling & Rigidity (Hardcoded Defaults)

> [!NOTE]
> **Priority:** Medium | **Impact:** Medium (Flexibility & Reusability)

### Findings
- **Hardcoded Providers & Assets in `preview.ts`:** In `src/lib/coerce-preview.ts`, the generator injects highly specific configuration, providers, and assets into every project:
  - `ProvideIconAssetPath(['mdi.svg', 'custom.svg'])` from `@rxap/icon`
  - `ProvideEnvironment({app: '${projectName}-storybook', production: false})` from `@rxap/environment`
  - `@angular/localize/init` import.
  If a project does not have or need these exact assets, or doesn't use internationalization, these hardcoded options lead to noise, console errors, or broken builds.
- **Hardcoded Stylesheet:** In `src/lib/coerce-project-target.ts`, the stylesheet path `'shared/angular/styles/_index.scss'` is hardcoded for all library projects.

### Recommendations
- **Parameterize via Schema:** Expose options in `schema.json` to customize or disable specific providers or asset paths (e.g., `icons`, `environmentApp`, `localize`).
- **Conditional Setup:** Safely check if localization is configured before adding `@angular/localize/init` to the preview imports and `tsconfig` types.

---

## 4. Documentation & Entrypoint Completeness

> [!NOTE]
> **Priority:** Low | **Impact:** Medium (Developer Experience)

### Findings
- **Empty Documentation Files:** Both `GETSTARTED.md` and `GUIDES.md` are completely empty (0 bytes).
- **Empty Library Entrypoint:** The main library entrypoint `src/index.ts` is completely empty. Although Nx plugins/generators are primarily invoked via `generators.json`, exposing typescript interfaces, generator functions, and helper functions makes the package programmatically reusable.

### Recommendations
- **Expose API:** Export generator functions and schema types from `src/index.ts`.
- **Write Guides:** Complete `GETSTARTED.md` and `GUIDES.md` with usage examples and custom options description.
