# TODO - `@rxap/utilities` Audit Findings & Improvements

This document lists the findings and recommended refactoring steps identified during the project audit of the `@rxap/utilities` package (located at `packages/utilities`).

---

All audit items have been resolved (see below). New findings should be appended above this line.

---

## Resolved (2026-06)
The following audit items were fixed (with tests where applicable):
- `flattenObject` now guards `null` values.
- `CoerceArrayItems` no longer coerces arrays into plain objects when merging.
- `DeleteNullProperties` / `DeleteUndefinedProperties` only recurse into plain objects,
  preserving `Date`/`RegExp`/`Map`/`Set`/class instances.
- `deepMerge` and `SetToObject` block `__proto__` / `constructor` / `prototype` keys
  (prototype-pollution hardening).
- `clone` uses `typeof window !== 'undefined'` and no longer logs fallback tracebacks.
- The `@Deprecated` property decorator now stores values in a per-instance `WeakMap`
  instead of an own `__deprecated__<key>` property, so `Object.keys()` / `JSON.stringify()`
  are no longer corrupted by the prefixed key.
