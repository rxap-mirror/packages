# Todo list - `@rxap/n8n-nodes-sanitize-html`

This document contains findings, architectural improvements, and recommendations arising from the Project Audit conducted on June 16, 2026.

## 🔴 Critical Bugs

### [FIXED] Global Configuration Mutation in `getAllowedAttributes`
- **Finding:** The helper function `getAllowedAttributes` was directly retrieving `sanitizeHtml.defaults.allowedAttributes` (which is a reference to the global default settings of the imported `sanitize-html` library) and mutating its entries in-place.
- **Impact:** Since this mutation happened within a global library default object, any configuration modifications (e.g., adding `custom-attr` to an `<a>` tag) would leak across all executions of the node, other workflows, or any other part of the application importing `sanitize-html`. This is a severe state-corruption/pollution bug.
- **Resolution:** Updated `getAllowedAttributes` and `getAllowedTags` to properly shallow/deep-clone the defaults into new objects/arrays instead of referencing or mutating the global defaults directly.
- **Unit Test:** Added a comprehensive regression test in `SanitizeHtml.node.spec.ts` asserting that `sanitizeHtml.defaults.allowedAttributes` remains unmutated after custom attribute configuration runs.

---

## 🟢 Test Coverage & Quality Assurance

### 1. Complete Absence of Tests (Prior to Audit)
- **Finding:** The project had an active Jest environment (`jest.config.ts`, `tsconfig.spec.json`) but had zero unit/integration tests configured.
- **Action Taken:** Created the package's first unit test suite under `src/lib/SanitizeHtml/SanitizeHtml.node.spec.ts` using Jest:
  - Verifies basic HTML sanitization logic.
  - Verifies that `allowedAttributes` are safely handled and that the global defaults are protected from regression mutations.
- **Recommended Action:**
  - Build upon this test suite to cover all edge cases, such as handling malformed HTML inputs, missing parameters, and different combinations of `allowedTags` (using `add`, `remove`, and `only`).

### 2. Parameter Extraction Robustness
- **Finding:** The parameter extraction was relying on `getNodeParameter` without default values in some calls, which can cause unexpected issues if fields are omitted or evaluation results are falsy.
- **Action Taken:** Integrated default parameters (`getNodeParameter('allowedTags', index, {})` and `getNodeParameter('allowedAttributes', index, { allowed: [] })`) to ensure n8n handles fallback configuration gracefully.
