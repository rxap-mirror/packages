# TODO: Angular Memory Library Audit Findings

This document outlines the findings and recommended improvements identified during the audit of the `@rxap/ngx-memory` (`angular-memory`) project.

---

## 🚨 Critical Bugs

### 1. Silent Interception and Overwrite in `WebStorage` Decorator Setter
* **Location:** `src/lib/decorators/web-storage.ts` (Lines 36–45)
* **Problem:** 
  The setter in the `WebStorage` decorator intercepts the initial assignment if the internal `propertyValue` is `undefined`. It checks if `StorageHas(storage, storageKey)` is true. If it is, it loads the storage value and **returns immediately**, ignoring the newly assigned value:
  ```typescript
  set: (value: unknown) => {
    if (propertyValue === undefined) {
      if (StorageHas(storage, storageKey)) {
        propertyValue = StorageGet(storage, storageKey);
        return; // <--- SILENTLY IGNORES THE ASSIGNED VALUE!
      }
    }
    propertyValue = value;
    ...
  }
  ```
  While this was designed to stop TS property initializers (e.g., `@LocalStorage() prop = 'default'`) from overwriting existing storage values, it introduces a severe race condition and state-dependent bug.
  **If a property is declared without an initializer:**
  ```typescript
  @LocalStorage() myProperty?: string;
  ```
  The first call to `myComponent.myProperty = 'newValue'` will have `propertyValue === undefined`. If local storage already contains a value (e.g., `'oldValue'`), the setter will ignore `'newValue'`, set `propertyValue` to `'oldValue'`, and return. The assignment is silently dropped!
* **Recommended Fix:** 
  Instead of overloading the setter with state checks on `propertyValue === undefined`, use a unique Symbol or boolean flag (e.g. `isInitialized`) to track whether the property has been initialized, or avoid setter interception entirely. Let the getter resolve defaults when the underlying storage value is empty, and let the setter always write the value when called explicitly after construction.

---

## 📐 Architectural Debt & Anti-Patterns

### 1. Rigid/Incompatible Storage Format in `StorageGet`
* **Location:** `src/lib/storage-utility.ts` (Lines 20–35)
* **Problem:** 
  `StorageGet` expects every item in storage to be a JSON string representing an object with `_value` and optional `_expired` properties. If a value was set externally (by another library, standard Web APIs, or legacy code) as a plain string, number, or standard JSON object without a `_value` key:
  1. `parse(...)` catches the parse error and returns the original string or parsed object.
  2. The check `typeof value === 'object'` might fail (for strings) or succeed (for plain objects).
  3. But finally, it returns `value._value ?? null`. Since `value` doesn't have `_value`, it returns `null`!
  This makes the library completely incompatible with standard storage entries, reducing interoperability.
* **Recommended Fix:** 
  Make the storage format backward-compatible. If the parsed value is an object containing `_value`, extract it. Otherwise, return the parsed value (or the plain string) as-is. E.g.:
  ```typescript
  if (value && typeof value === 'object' && '_value' in value) {
    // Treat as wrapped rxap-memory item with optional expiry
    ...
    return value._value;
  }
  // Treat as a standard/external plain value
  return value;
  ```

---

## 🧪 Test Coverage & Diagnostics

* **Current Status:** All 29 unit tests pass.
* **Missing Tests:**
  * **No Initializer Setter Bug:** There is no unit test confirming that an uninitialized property decorated with `@WebStorage` can be set when local storage already has a value.
  * **Peer Dependency / Init Generator Tests:** There are no tests verifying `initGenerator` behavior, especially around dependency placement and routing.
* **Action Item:** Add a regression test to `src/lib/decorators/web-storage.spec.ts` demonstrating the setter override behavior when no initial value is defined on the class property.
