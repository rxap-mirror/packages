# TODO - `@rxap/utilities` Audit Findings & Improvements

This document lists the findings and recommended refactoring steps identified during the project audit of the `@rxap/utilities` package (located at `packages/utilities`). 

These recommendations address critical logic bugs, memory/performance concerns, safety anti-patterns (prototype pollution), serialization-breaking behaviors, and console noise in Node/NestJS backend environments.

---

## 1. Critical Logic & Functional Bugs

### 🚨 Array-matching regex bypass in `initGenerator`
* **File:** `packages/utilities/src/generators/init/generator.ts` (Line 40)
* **Problem:** 
  The generator attempts to check if a package should be classified as a development dependency using:
  ```typescript
  if (!isDevDependency && [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/]) {
  ```
  In JavaScript/TypeScript, an array literal is always a truthy object. The regular expressions within the array are never actually tested against `packageName`. If `!isDevDependency` is true, this statement will **always** evaluate to true. As a result, non-rxap packages are incorrectly coerced into `devDependencies`.
* **Recommended Fix:** 
  Use the `.some()` function to test the regexes, matching the implementation style of the block above it:
  ```typescript
  if (!isDevDependency && [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/].some(rx => rx.test(packageName))) {
  ```

### 🚨 Crash on `null` properties in `flattenObject`
* **File:** `packages/utilities/src/lib/flatten-object.ts` (Line 23)
* **Problem:** 
  In JavaScript, `typeof null === 'object'`. When flattening an object, a property with a `null` value will pass the `typeof obj[k] === 'object'` check and recursively call `flattenObject(null, ...)`. This immediately throws `TypeError: Cannot convert undefined or null to object` upon calling `Object.keys(null)`.
* **Recommended Fix:** 
  Add a null check to ensure `null` values are treated as primitive leaf nodes:
  ```typescript
  if (obj[k] !== null && typeof obj[k] === 'object') {
  ```

### 🚨 Array-to-Plain-Object coercion in `CoerceArrayItems`
* **File:** `packages/utilities/src/lib/array/coerce-array-items.ts` (Line 71-80)
* **Problem:** 
  When options specify `{ merge: true }`, the utility merges objects of type `object`:
  ```typescript
  if (typeof existingItem === 'object' && typeof item === 'object') {
    array[index] = { ...existingItem, ...item };
  }
  ```
  Since JavaScript arrays are of type `'object'`, nested arrays (e.g., `[[1, 2]]` merged with `[[3, 4]]`) will satisfy this condition and be incorrectly spread into a plain object: `{ '0': 3, '1': 4 }`, ruining array structures.
* **Recommended Fix:** 
  Add an array check to skip plain-object-style spreading on arrays or merge them separately:
  ```typescript
  if (typeof existingItem === 'object' && typeof item === 'object' && !Array.isArray(existingItem) && !Array.isArray(item)) {
  ```

---

## 2. Serialization-Breaking Behaviors & Bad Practices

### ⚠️ Deprecated decorator breaks instance keys and serialization
* **File:** `packages/utilities/src/lib/decorators/deprecated.ts` (Line 34-43)
* **Problem:** 
  The `@Deprecated` property decorator defines getter/setters on the prototype, which redirects value storage on the instance to a prefixed property: `this['__deprecated__' + propertyKey]`.
  This completely breaks property naming on the instance. Running `Object.keys()` or `JSON.stringify()` on a decorated instance will yield fields with `__deprecated__` prefixes, breaking contract agreements, API payload transfers, and DB serialization.
* **Recommended Fix:** 
  Instead of rewriting the key on the instance, keep the original key but log a warning using a customized descriptor, or utilize standard TypeScript/ES decorators that log without mutating key naming.

### ⚠️ Recursive object clean-up utilities degrade class instances
* **Files:** 
  * `packages/utilities/src/lib/object/delete-null-properties.ts` (Line 48)
  * `packages/utilities/src/lib/object/delete-undefined-properties.ts` (Line 32)
* **Problem:** 
  Both recursive clean-up functions use `typeof value === 'object'` to find nested objects. This evaluates to true for non-plain objects such as `Date`, `RegExp`, `Map`, `Set`, and custom class instances. Consequently, a nested `Date` property will be recursively processed by calling `DeleteNullProperties(DateObj, true)`, resulting in its destruction and conversion into an empty plain object `{}`.
* **Recommended Fix:** 
  Incorporate a "plain object" check to prevent recursion into class instances and special built-ins:
  ```typescript
  function isPlainObject(val: any): boolean {
    return !!val && typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype;
  }
  ```

---

## 3. Security Vulnerabilities

### 🔒 Prototype Pollution Vulnerability in `deepMerge` and `SetToObject`
* **Files:**
  * `packages/utilities/src/lib/deep-merge.ts` (Line 55-76)
  * `packages/utilities/src/lib/object/set-to-object.ts` (Line 26-59)
* **Problem:**
  Both utilities recursively traverse objects and assign values based on keys without ignoring special JS keys like `__proto__`, `constructor`, or `prototype`. This allows malicious or untrusted inputs to inject fields into the global `Object.prototype`, which can cause Denial of Service (DoS) or Remote Code Execution (RCE) in running Node processes.
* **Recommended Fix:**
  Add key blocking to prevent traversal/assignment of forbidden keys:
  ```typescript
  const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

  // Inside loops/recursions:
  if (FORBIDDEN_KEYS.includes(key)) {
    continue;
  }
  ```

---

## 4. Console Noise & Environment Coupling

### 🔊 Server log pollution in backend Node environments (ReferenceError fallback)
* **File:** `packages/utilities/src/lib/clone.ts` (Line 83-95)
* **Problem:**
  The `clone` function accesses `window` directly:
  ```typescript
  if (window && 'structuredClone' in window) { ... }
  ```
  In Node/NestJS backend environments, referencing an undeclared global variable like `window` throws a `ReferenceError`. While this is caught inside the `try/catch` block, the error handler logs it using `console.error`.
  As a result, whenever a backend process clones an object that cannot be processed by Node's standard `structuredClone` (e.g. objects containing functions/observables/symbols), the console is flooded with noisy `ReferenceError: window is not defined` tracebacks, despite the custom fallback logic executing successfully.
* **Recommended Fix:**
  Avoid direct access to `window` and check its type first:
  ```typescript
  if (typeof window !== 'undefined' && 'structuredClone' in window) {
  ```
  Furthermore, the fallback is a standard operation; logging a full error traceback when `structuredClone` fails on functions or complex types is an anti-pattern. If the fallback runs successfully, it should fail over silently.

---

## Summary of Action Items
- [ ] Fix the array regex bug in `initGenerator`.
- [ ] Safeguard `flattenObject` against `null` inputs.
- [ ] Check for `Array.isArray` inside `CoerceArrayItems` to prevent merging arrays as plain objects.
- [ ] Replace property-prefix storage in `@Deprecated` with warning-only getter/setters.
- [ ] Restrict recursive object cleaners (`DeleteNullProperties`, `DeleteUndefinedProperties`) to plain objects to preserve `Date`, `RegExp`, `Map`, etc.
- [ ] Secure `deepMerge` and `SetToObject` from prototype pollution by blocking dangerous keys.
- [ ] Use `typeof window !== 'undefined'` in `clone.ts` and stop logging fallback tracebacks to the console.
