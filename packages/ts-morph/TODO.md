# TODO: Audit Findings and Recommended Fixes for @rxap/ts-morph

This document outlines the findings of a comprehensive audit conducted on the `@rxap/ts-morph` project. It categorizes issues into **Critical Bugs**, **Architectural & Design Debt**, and **Missing Test Coverage**, providing concrete recommendations and code fixes.

---

## 1. Critical Bugs & Logic Errors

### 1.1. Invalid Regex Logic in `initGenerator`
* **File:** `src/generators/init/generator.ts` (Lines 45–58)
* **Problem:**
  The condition in the `if` block checks an array literal directly instead of matching the package name against the regex patterns:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) { ... }
  ```
  Since any array literal is a truthy value in JavaScript, `!isDevDependency && array` will always evaluate to the array (which is truthy). This causes the block to execute for **any** package when `!isDevDependency` is true, incorrectly moving libraries into `devDependencies` even if they do not match the patterns.
* **Fix:**
  Use `.some` to evaluate the package name against the array of patterns:
  ```typescript
  if (
    !isDevDependency &&
    [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ].some(rx => rx.test(packageName))
  ) { ... }
  ```

### 1.2. Boolean Quoting Logic Bug in `CoerceNestAppConfig`
* **File:** `src/lib/nest/coerce-nest-app-config.ts` (Line 138)
* **Problem:**
  The quote-wrapping check uses `||` instead of `&&`:
  ```typescript
  if ((!item.defaultValue.startsWith("'") && !item.defaultValue.endsWith("'")) || (!item.defaultValue.startsWith('"') && !item.defaultValue.endsWith('"')))
  ```
  For any already-quoted string like `'foo'`, the first operand evaluates to `false` but the second operand (checking double quotes) evaluates to `true`. Thus, the entire expression is always `true`. This causes already-quoted defaults to be double-wrapped, generating malformed code like `validationSchema['KEY'] = Joi.string().default("'foo'");`.
* **Fix:**
  Change the `||` operator to `&&` to ensure a string is only quoted if it is not already wrapped in single or double quotes:
  ```typescript
  if ((!item.defaultValue.startsWith("'") && !item.defaultValue.endsWith("'")) && (!item.defaultValue.startsWith('"') && !item.defaultValue.endsWith('"')))
  ```

### 1.3. Faulty Multi-Declaration Resolution in `CoerceVariableDeclaration`
* **File:** `src/lib/coerce-variable-declaration.ts` (Lines 46–50)
* **Problem:**
  When resolving an existing `VariableStatement`, the function retrieves the first declaration by default:
  ```typescript
  let variableDeclaration = variableStatement.getDeclarations()[0];
  ```
  If a statement contains multiple variable declarations (e.g., `export const A = 1, B = 2;`), attempting to coerce variable `'B'` will incorrectly return variable `'A'`.
* **Fix:**
  Specifically find the declaration matching the target `name`:
  ```typescript
  let variableDeclaration = variableStatement.getDeclarations().find(d => d.getName() === name);
  ```

### 1.4. Import Duplication and Mixed Type Pollution in `CoerceImports`
* **File:** `src/lib/coerce-imports.ts` (Lines 264–272 & 283–291)
* **Problem:**
  When checking existing import declarations, if both type-only (`import type { ... }`) and non-type-only declarations exist, the loops iterate over `normalizedNamedImports` (which includes both types) and push *all* imports to *both* declarations. This results in duplicate imports and can incorrectly insert non-type-only imports inside an `import type` declaration, causing TypeScript compilation errors.
* **Fix:**
  Only iterate over and add `nonTypeOnlyNamedImports` when processing non-type declarations, and only iterate over and add `typeOnlyNamedImports` when processing type-only declarations.

---

## 2. Architectural & Library Anti-Patterns

### 2.1. Reading Physical Disk Paths via the Virtualized `Tree`
* **File:** `src/generators/init/generator.ts` (Lines 85–110)
* **Problem:**
  The generator uses the virtualized `tree` to interact with files inside `node_modules` (e.g., `tree.exists(...)` and `tree.read(...)`). In standard Nx operations, `node_modules` is gitignored/excluded from the virtual Tree representation, meaning `tree.exists` will often falsely return `false`.
* **Fix:**
  Interact with `node_modules` using native Node.js filesystem modules (`fs.existsSync`, `fs.readFileSync`) or use `require.resolve` instead of routing these physical reads through the `Tree`.

### 2.2. Missing Getter for Setter Inputs in `CoerceComponentInput`
* **File:** `src/lib/angular/coerce-component-input.ts` (Lines 135–150)
* **Problem:**
  When `asSetAccessor` is enabled, the code generates a public setter (`set name(...)`) and a private backing field (`_name`), but completely neglects to generate the corresponding public getter (`get name()`). This makes the input property write-only and impossible to read from inside component code or templates, breaking standard Angular components.
* **Fix:**
  Automatically generate a getter accessor along with the setter:
  ```typescript
  classDeclaration.addGetAccessor({
    name,
    scope: Scope.Public,
    statements: `return this._${name};`,
    type: WriteType(type, sourceFile),
  });
  ```

### 2.3. Malformed Styles Array in `CoerceComponent`
* **File:** `src/lib/angular/coerce-component.ts` (Lines 107 & 144)
* **Problem:**
  1. If `styles` is a string containing inline CSS, it is written as `styles: 'css content'` instead of being wrapped in an array, which is a compilation error in Angular.
  2. If `styles` is undefined, it defaults to the string `'[]'`, which then gets quoted as a string (`styles: '[]'`), violating Angular's type definition requiring an array.
* **Fix:**
  Ensure styles is always generated as an array literal:
  ```typescript
  if (styles) {
    componentOptions['styles'] = `[${typeof styles === 'string' ? `'${styles}'` : styles}]`;
  }
  ```

---

## 3. Test Coverage Gaps

There are several critical utility files with **zero** test coverage, creating high risk for silent regressions.

* [ ] **Add Tests for:**
  - `src/lib/coerce-variable-declaration.ts` (specifically test multi-declaration statements)
  - `src/lib/angular/coerce-component-input.ts` (verify both property-based and set-accessor inputs with getters/seters)
  - `src/lib/angular/coerce-component.ts` (validate selector construction and `styles`/`styleUrls` array generation)
  - `src/lib/angular/coerce-route-guard.ts` (verify correct property assignment additions)
  - `src/lib/nest/coerce-nest-app-config.ts` (ensure already-quoted string defaults are not double-wrapped)
