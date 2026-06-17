# TODO: Project Audit Results & Action Items

This file outlines the findings from the audit of the `@rxap/json-schema-to-typescript` project. It categorizes identified issues into **Critical Bugs**, **Architectural Debt & Code Quality**, and **Test Coverage & Quality Gaps**, with recommended fixes for each.

---

## 1. Critical Bugs & Logic Errors

### 🛑 Over-inclusive Named Import Coercion in `CoerceImports`
* **File:** `src/lib/coerce-imports.ts` (Lines 246 and 265)
* **Description:** In the `coerceNamedImports` helper, there are two loops that iterate over `normalizedNamedImports` (which contains both type-only and non-type-only named imports) instead of their respective filtered lists:
  ```typescript
  // For non-type-only import declarations:
  for (const named of normalizedNamedImports) { // <-- BUG: should be nonTypeOnlyNamedImports
    if (!existingImports.some((existing) => existing.getName() === named.name)) {
      const namedImport = importDeclaration.addNamedImport(named);
      namedImport.setIsTypeOnly(named.isTypeOnly ?? false);
    }
  }
  ```
* **Impact:** Mixed imports (both type-only and normal) are incorrectly appended to both the type-only and non-type-only import blocks. This can lead to duplicate imports, invalid TypeScript syntax, or type compilation failures.
* **Recommended Fix:** Ensure the loops only process their respective subsets:
  - In the `nonTypeOnlyImportDeclarations` loop, iterate over `nonTypeOnlyNamedImports`.
  - In the `typeOnlyImportDeclarations` loop, iterate over `typeOnlyNamedImports`.

---

## 2. Architectural Debt & Design Flaws

### 🏛️ Fragile `$ref` Reference Resolution in `TypescriptInterfaceGenerator`
* **File:** `src/lib/typescript-interface-generator.ts` (Lines 612 and 623)
* **Description:**
  - `resolveRefName` parses `$ref` strings with a trailing-slash regex: `ref.match(/\/([^/]+)$/)`. If a ref has no slash (e.g. `"$ref": "MyType"`), it crashes.
  - `resolveRef` shifts off the first segment assuming it is `#`. If a reference is a relative path or an absolute URI, the path lookup will break or become corrupt.
  - **Dot-split limitation**: Ref components are joined into dot-notation paths for `getFromObject`. Any schema key containing a dot (e.g., `#/components/schemas/My.Schema.Name`) will fail to resolve because `getFromObject` splits on every dot.
* **Recommended Fix:** Transition to a standard JSON Schema pointer library, or refactor reference resolution to respect standard URI schemes and avoid path-mangling with dots.

---

### 🧹 Deprecated Method Usage
* **File:** `src/lib/strings.ts` (Line 128)
* **Description:** `capitalize` uses `String.prototype.substr()`, which is deprecated:
  ```typescript
  return str.charAt(0).toUpperCase() + str.substr(1);
  ```
* **Recommended Fix:** Replace with modern equivalent `slice(1)` or `substring(1)`:
  ```typescript
  return str.charAt(0).toUpperCase() + str.slice(1);
  ```

---

## 3. Test Coverage & Quality Gaps

### 🧪 Very Low Test Coverage
* **Status:** Only **2 tests** exist for the entire package (`typescript-interface-generator.spec.ts`).
* **Missing Coverage:**
  - No tests for the `init` and `generate` Nx generators.
  - No tests for `coerce-imports.ts` (highly critical due to the mixed-import bug identified during the audit).
  - No tests for edge cases in `getFromObject` (e.g. keys containing dots, falsy/0/null properties, etc.).
* **Recommended Actions:**
  1. Add unit tests for `CoerceImports` to verify type-only vs. non-type-only imports behave as expected.
  2. Add unit tests for the generators, ensuring the correct dependencies/devDependencies are added.
  3. Add test cases for `$ref` schemas that do not conform to standard `#/components/schemas` patterns or have dots in their names.
