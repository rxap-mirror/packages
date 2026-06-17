# TODO: Angular Definition Package Audit & Improvement Plan

This document lists the findings and recommended actions resulting from a project audit of the `@rxap/definition` package (`packages/angular/definition`).

## 1. Architectural Debt & Anti-Patterns

### 🟡 Memory Leak Risks with Subject Cleanups
In `src/lib/definition.ts`:
* **Problem**:
  1. In `ngOnDestroy()`, the local `destroyed$` subject emits (`this.destroyed$?.next()`) but is never completed.
  2. The `initialised$` subject is never completed.
  3. The `interceptors` set containing `Subject<any>` is never cleaned up or completed.
* **Impact**: External components/services subscribing to these subjects can suffer from memory leaks if the subscription is not torn down properly via completion or if references are retained.
* **Recommended Fix**: Safely complete both subjects and clear any active interceptors inside `ngOnDestroy()`:
```typescript
  public ngOnDestroy() {
    this.destroyed$?.next();
    this.destroyed$?.complete();
    this.initialised$?.complete();
    if (this.interceptors) {
      for (const interceptor of this.interceptors) {
        interceptor.complete();
      }
      this.interceptors.clear();
    }
    BaseDefinition.remove(this);
  }
```

### 🟡 Angular Service "ngOnInit" lifecycle-hook Confusion
In `src/lib/definition.ts`:
```typescript
  public init(): void {
    ...
    if (typeof self['ngOnInit'] === 'function') {
      self.ngOnInit();
    }
    ...
  }
```
* **Problem**: Angular `@Injectable()` services do not natively support or run `ngOnInit()`.
* **Impact**: Triggering `ngOnInit` manually inside a class-level `.init()` call is misleading to developers. It creates the impression that Angular is managing the service's lifecycle, and might lead to issues if developers define `ngOnInit` without realizing it will only execute if `.init()` is manually invoked.
* **Recommended Fix**: Rename the custom initializer hooks to avoid collision with standard Angular lifecycle hooks (e.g. use `onInit()` or `initialize()`).

---

## 2. Design & Type Alignments

### 🟡 Type Misalignment in `DefinitionLoader`
In `src/lib/definition.loader.ts` and `src/lib/types.ts`:
* **Problem**: The type parameter `IdOrInstanceOrToken<T>` allows `string` (representing a definition ID). However, `DefinitionLoader.load` explicitly throws a hard error if a string is provided:
```typescript
    if (typeof definitionIdOrInstanceOrInjectionToken === 'string') {
      throw new RxapDefinitionError(
        'Creating a definition instance from the definition id is not supported by the DefinitionLoader service',
        '',
      );
    }
```
* **Impact**: Developers are misled into believing they can load definitions by string ID at compile-time, only to encounter runtime failures.
* **Recommended Fix**:
  * Either restrict the input type of `load` to exclude strings (e.g., introduce `InstanceOrToken<T>`), OR
  * Implement lookup by ID within the loader using the active `BaseDefinition.instances` map by searching for the corresponding definition metadata `id`.

### 🟢 Documentation Typo
In `src/lib/definition.ts`:
* Lines 38-42:
```typescript
  /**
   * Emits when a new Definition instance is initialised
   */
  public static readonly destroyed$: Subject<BaseDefinition> =
    new Subject<BaseDefinition>();
```
* **Recommended Fix**: Correct the comment to: `/** Emits when a Definition instance is destroyed */`.

---

## 3. Test Coverage

### 🔴 Zero Test Coverage
* **Problem**: There are zero Jest/unit test spec files (`*.spec.ts`) implemented for this package.
* **Impact**: Unchecked behavior increases regression risks, particularly given the critical importance of `BaseDefinition` as a base class for other critical packages (like `@rxap/data-source`, `@rxap/remote-method`, etc.).
* **Recommended Fix**: Introduce basic unit tests under `src/lib` covering:
  1. Class instantiation and metadata application.
  2. The custom `init` and `destroy` flows.
  3. Proper registration and removal in `BaseDefinition.instances`.
  4. Correct behavior of `DefinitionLoader.load`.
