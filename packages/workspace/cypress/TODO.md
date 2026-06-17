# TODO: workspace-cypress

This file documents critical issues, architectural debt, and test coverage gaps identified during the project audit of `@rxap/workspace-cypress`, along with recommended fixes.

---

## 🚨 Critical & Functional Bugs

### 1. Broken Library Entrypoint (`src/index.ts`)
* **Problem**: Cypress custom commands (implemented in `src/lib/angular-material.ts`) are side-effect-only scripts. They register commands on the global `Cypress` object when evaluated. However, `src/index.ts` only contains `export {};` and does not import or reference `src/lib/angular-material.ts`.
* **Impact**: When users follow the installation instructions and add `import '@rxap/workspace-cypress'` to their Cypress support/e2e file, **no commands are actually registered**. Users will receive runtime errors like `cy.matFormField is not a function`.
* **Recommendation**: Update `src/index.ts` to explicitly import the side-effect file:
  ```typescript
  import './lib/angular-material';
  ```
  *(Note: Since `index-export` automatically regenerates `src/index.ts` based on named exports, configure `index-export` to exclude this package or manually manage `src/index.ts` without automatic rewriting, as side-effect libraries do not fit standard named-export automation.)*

### 2. Selector Specificity Restricts Custom Commands to `<input>` Elements
* **Location**: `src/lib/angular-material.ts` (Line 66)
* **Problem**: The `matFormField` custom command is hardcoded to look for `<input>` elements inside the form field:
  ```typescript
  Cypress.Commands.add('matFormField', (formControlName: string) => {
    return cy.get(`mat-form-field input[formcontrolname="${ formControlName }"]`).parents('mat-form-field').first();
  });
  ```
* **Impact**: In Angular Material applications, form fields frequently contain other elements like `<textarea>`, `<select>`, `<mat-select>`, or custom components. Because of the hardcoded `input`, `cy.matFormField('description')` will completely fail if it is a `<textarea>`.
* **Recommendation**: Make the selector tag-agnostic:
  ```typescript
  Cypress.Commands.add('matFormField', (formControlName: string) => {
    return cy.get(`mat-form-field [formcontrolname="${ formControlName }"]`).parents('mat-form-field').first();
  });
  ```

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Early Return Short-Circuits Coercion Logic
* **Location**: `src/generators/init/generator.ts` (Lines 24–27)
* **Problem**: The generator exits early if there are no peer dependencies:
  ```typescript
  if (!peerDependencies || !Object.keys(peerDependencies).length) {
    console.log('No peer dependencies found');
    return;
  }
  ```
* **Impact**: `@rxap/workspace-cypress` has no peer dependencies in its `package.json`. Consequently, running `yarn nx g @rxap/workspace-cypress:init` prints `"No peer dependencies found"` and immediately exits. The dependency coercion logic on lines 30–58 (designed to move `@rxap/workspace-cypress` to `devDependencies` in the root `package.json`) is **never executed**.
* **Recommendation**: Reorder the execution flow so that package coercion happens before checking for peer dependencies.

### 2. Redundant Chain Wrapping in `matInput`
* **Location**: `src/lib/angular-material.ts` (Lines 79–84)
* **Problem**: The custom `matInput` command wraps the found input in unnecessary `.then` nesting:
  ```typescript
  Cypress.Commands.add('matInput', { prevSubject: true }, (subject) => {
    return cy.wrap(subject).find('input').then(($input: JQuery<HTMLElement>) => {
      return cy.wrap($input);
    });
  });
  ```
* **Recommendation**: Simplify and utilize Cypress's standard chaining:
  ```typescript
  Cypress.Commands.add('matInput', { prevSubject: true }, (subject) => {
    return cy.wrap(subject).find('input');
  });
  ```

---

## 🧪 Test Coverage & Configuration

### 1. Zero Test Coverage
* **Problem**: Running `yarn nx run workspace-cypress:test` displays:
  ```text
  No tests found, exiting with code 0
  ```
  The package currently contains **zero test or spec files**, meaning that neither the Cypress commands nor the init generator is covered by tests.
* **Recommendation**: 
  - Add unit tests for the init generator under `src/generators/init/generator.spec.ts` using `@nx/devkit/testing`'s `createTreeWithEmptyWorkspace` to mock the Tree and verify dependency coercion and peer dependency processing.
  - Create simple Cypress component/e2e test examples to verify that custom commands like `matFormField`, `matError`, and `matInput` operate correctly against custom Angular Material components.
