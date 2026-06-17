# TODO: Mixin Package Audit & Refactoring Plan

This document outlines critical issues, architectural debt, and testing gaps discovered during the audit of the `@rxap/mixin` package.

---

## 🚨 Critical Bugs

### 1. `@use` Decorator Pollutes `Function.prototype`
- **Location:** `packages/packages/mixin/src/lib/mixin.ts` (Lines 182–186)
- **Problem:** The decorator is documented as a class decorator:
  ```typescript
  @use(DisableFeature)
  class MyComponent {}
  ```
  However, the implementation of `@use` delegates to `mix` with `target.constructor`:
  ```typescript
  export function use(...mixins: Array<Mixin<any>>) {
    return function (target: any) {
      mix(target.constructor, mixins.reverse());
    };
  }
  ```
  For a class decorator, `target` is the constructor function. Thus, `target.constructor` evaluates to the global `Function` constructor. This causes properties from the mixin to be injected directly onto `Function.prototype`, polluting the global runtime for **every single function and class** in the application and failing to apply the mixin to the actual target class prototype.
- **Recommended Fix:** Correct `@use` to behave similarly to `@mixin` or `@Mixin` depending on the intended behavior, or rewrite it to target `target.prototype` safely:
  ```typescript
  export function use(...mixins: Array<Mixin<any>>) {
    return function (target: any) {
      mix(target, mixins.reverse());
    };
  }
  ```

### 2. Recursion Crash in `GetPropertyDescriptor`
- **Location:** `packages/packages/mixin/src/lib/get-property-descriptor.ts` (Lines 29–42)
- **Problem:** If a prototype chain terminates or an object was created using `Object.create(null)`, `Object.getPrototypeOf(prototype)` will return `null`. The current safety check:
  ```typescript
  if (parentPrototype !== Object.prototype) {
    return GetPropertyDescriptor(parentPrototype, propertyKey);
  }
  ```
  evaluates `null !== Object.prototype` to `true`, recursively calling `GetPropertyDescriptor(null, propertyKey)`. In the next frame, `Object.getOwnPropertyDescriptor(null, propertyKey)` throws a fatal error: `TypeError: Object.getOwnPropertyDescriptor called on non-object`.
- **Recommended Fix:** Add a null-check for `parentPrototype`:
  ```typescript
  if (parentPrototype && parentPrototype !== Object.prototype) {
    return GetPropertyDescriptor(parentPrototype, propertyKey);
  }
  ```

### 3. Mutated In-Place Array Reversing side effects in `Mixin`
- **Location:** `packages/packages/mixin/src/lib/mixin.ts` (Lines 133–143)
- **Problem:** Array `.reverse()` mutates the original reference in place. In the `Mixin` decorator, `.reverse()` is called twice:
  ```typescript
  mix(target, mixins.reverse());
  for (const source of mixins.reverse()) { ... }
  ```
  The first call reverses the `mixins` parameter array to apply the mixins. The second call reverses it *again* (back to its original order). This results in properties/methods being mixed in reversed order, but metadata being processed in the original order. This logical inconsistency can cause hard-to-track bugs where methods override each other in one priority, but metadata merges in another.
- **Recommended Fix:** Avoid mutating the original parameter array. Instead, copy it before reversing:
  ```typescript
  const reversed = [...mixins].reverse();
  mix(target, reversed);
  for (const source of reversed) {
    CopyMetadata(source, target);
    if (typeof source === 'function') {
      CopyMetadata(source.prototype, target.prototype);
    }
  }
  ```

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Fragile Static Decoration in `@delegate`
- **Location:** `packages/packages/mixin/src/lib/delegate.ts` (Lines 27–31)
- **Problem:** The decorator uses `target.constructor.prototype[propertyKey] = method`. If `@delegate` is applied to a static method, `target` is the constructor function itself. `target.constructor` then refers to the global `Function` constructor, meaning the delegate pollutes `Function.prototype` instead of decorating the class's static method.
- **Recommended Fix:** Simply use `target[propertyKey] = method`, which correctly resolves to the prototype for instance methods, and the class constructor for static methods.

---

## 🧪 Test Coverage & Robustness Gaps

### 1. Missing Tests for `@use`
- There are currently no tests verifying the behavior of the `@use` decorator, which allowed its critical prototype pollution bug to pass undetected.

### 2. Missing Edge-Case Tests for Prototype Traversal
- Neither `GetPropertyDescriptor` nor `GetAllPropertyNames` have tests asserting their resilience to objects with `null` prototypes (e.g., objects created using `Object.create(null)`).

---

## 🚀 Recommended Action Plan

1. **Fix Critical Bugs:** Apply immediate fixes for the recursion crash, `@use` pollution, and array mutation in `Mixin`.
2. **Refactor `@delegate`:** Clean up target prototype access to avoid polluting `Function.prototype` on static properties.
3. **Implement Missing Tests:** Write extensive unit tests for `@use` and null prototype edge cases to prevent regressions.
