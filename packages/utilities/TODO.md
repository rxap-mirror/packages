# TODO - `@rxap/utilities` Audit Findings & Improvements

This document lists the findings and recommended refactoring steps identified during the project audit of the `@rxap/utilities` package (located at `packages/utilities`).

---

## Serialization-Breaking Behaviors & Bad Practices

### ⚠️ Deprecated decorator breaks instance keys and serialization
* **File:** `packages/utilities/src/lib/decorators/deprecated.ts` (Line 34-43)
* **Problem:**
  The `@Deprecated` property decorator defines getter/setters on the prototype, which redirects value storage on the instance to a prefixed property: `this['__deprecated__' + propertyKey]`.
  This completely breaks property naming on the instance. Running `Object.keys()` or `JSON.stringify()` on a decorated instance will yield fields with `__deprecated__` prefixes, breaking contract agreements, API payload transfers, and DB serialization.
* **Recommended Fix:**
  Instead of rewriting the key on the instance, keep the original key but log a warning using a customized descriptor, or utilize standard TypeScript/ES decorators that log without mutating key naming.
* **Note (2026-06):** Deferred — this is a **breaking change** for any deployment whose
  serialized data already contains the `__deprecated__` prefix; it needs a migration
  decision (WeakMap-backed storage vs. metadata-only warning) rather than a quick fix.

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
