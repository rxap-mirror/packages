# TODO List for @rxap/services

This document outlines the findings from the project audit of `packages/angular/services`. It highlights critical bugs, architectural debt, library anti-patterns, and areas for improvement to align the package with modern Angular 19+ best practices and robust monorepo configurations.

---

## 1. Critical & Functional Bugs

### 🚨 Old Component Instance Resource Leak in `WindowContainerSidenavService`
*   **File:** [`packages/angular/services/src/lib/window-container-sidenav.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/window-container-sidenav.service.ts#L25-L31)
*   **Issue:** In the `add` method, if a component with the same `id` is already registered, the service correctly triggers a `remove$` event before overwriting it. However, it incorrectly emits the **new** component instance reference via the `remove$` stream rather than the **old** stored reference:
    ```typescript
    public add(component: ContainerComponent): void {
      if (this.components.has(component.id)) {
        this.remove$.next(component); // <-- BUG: Emits the new component instance instead of the old one
      }
      this.components.set(component.id, component);
      this.add$.next(component);
    }
    ```
    This results in clean-up mechanisms (which listen to `remove$`) trying to destroy or clean up references on a component that hasn't even been initialized yet, while the actual old component's references (e.g., `viewContainerRef`, `injector`) are lost and leaked.
*   **Recommended Fix:** Emit the old stored component instance prior to overwriting it in the map:
    ```typescript
    public add(component: ContainerComponent): void {
      const existing = this.components.get(component.id);
      if (existing) {
        this.remove$.next(existing);
      }
      this.components.set(component.id, component);
      this.add$.next(component);
    }
    ```

---

## 2. Architectural Debt & Design Anti-Patterns

### ⚠️ SSR Compatibility Issues (Browser-Only Globals)
*   **File:** [`packages/angular/services/src/lib/image-loader.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/image-loader.service.ts#L20)
*   **Issue:** `ImageLoaderService.load()` directly instantiates `new Image()`, which is a browser-only global API. During Server-Side Rendering (SSR) or Static Site Generation (Prerendering), this code will crash with a `ReferenceError: Image is not defined`.
*   **Recommended Fix:** Inject Angular's `PLATFORM_ID` and use `isPlatformBrowser(platformId)` from `@angular/common` to bypass image instantiation on the server side:
    ```typescript
    import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
    import { isPlatformBrowser } from '@angular/common';

    @Injectable({ providedIn: 'root' })
    export class ImageLoaderService {
      constructor(@Inject(PLATFORM_ID) private platformId: object) {}

      public load(imageSrc: string): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
          return Promise.resolve();
        }
        // ... browser-only image loading logic ...
      }
    }
    ```

### ⚠️ Deprecated Angular Features
*   **File:** [`packages/angular/services/src/lib/window-container-sidenav.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/window-container-sidenav.service.ts#L10-L16)
*   **Issue:** The service and `ContainerComponent` interface refer to `ComponentFactoryResolver` which has been deprecated since Angular 13.
*   **Recommended Fix:** In modern Angular (19+), dynamic components should be instantiated directly via `ViewContainerRef.createComponent(ComponentClass)` without needing to resolve factories manually. Clean up the interface and remove references to `ComponentFactoryResolver`.

### ⚠️ Encapsulation Leaks (Exposing Raw Subjects)
*   **Files:**
    *   `ResetService` (`view$`, `dataSource$`)
    *   `WindowContainerSidenavService` (`add$`, `remove$`)
*   **Issue:** Exposing raw `Subject` instances as `public` fields allows external consumers to bypass encapsulation and call `next()`, `error()`, or `complete()` directly.
*   **Recommended Fix:** Keep subjects `private` (prefix with `_`) and expose them as read-only Observables via `.asObservable()`:
    ```typescript
    private readonly _view$ = new Subject<void>();
    public readonly view$ = this._view$.asObservable();
    ```

### ⚠️ Context Loss Risks in Subscription Callbacks
*   **File:** [`packages/angular/services/src/lib/loading-indicator.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/loading-indicator.service.ts#L28)
*   **Issue:** Passing `this.loading$.next` directly as a subscription callback can lead to execution context (`this`) loss under certain JavaScript environments, as standard RxJS Subject methods are not pre-bound:
    ```typescript
    loading$.pipe(map(Boolean), delay(0)).subscribe(this.loading$.next)
    ```
*   **Recommended Fix:** Wrap it in a safe arrow function or use `.bind`:
    ```typescript
    loading$.pipe(map(Boolean), delay(0)).subscribe((val) => this.loading$.next(val))
    ```

### ⚠️ Reliance on Deferral Hacks (`setTimeout` & `delay`)
*   **File:** [`packages/angular/services/src/lib/loading-indicator.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/loading-indicator.service.ts#L36-L46)
*   **Issue:** `LoadingIndicatorService` uses `setTimeout` inside `disable()` and `enable()`, and `delay(0)` inside `attachLoading` to avoid ExpressionChangedAfterItHasBeenCheckedError. In a modern zoneless or Signal-driven Angular application, relying heavily on macrotasks/microtasks is a code smell that should be replaced with native reactive flow structures or scheduler bindings.

---

## 3. Lack of Modern Angular Features (Angular 19+)

### 💡 Implement Signals-based APIs
*   **Issue:** Modern Angular apps heavily rely on Signals (`signal`, `computed`, `readonly`) for state management, as it avoids complex RxJS subscriptions and simplifies `OnPush` change detection and zone-less rendering.
*   **Opportunities:**
    *   **`LoadingIndicatorService`**: Provide a read-only Signal representing the current loading state (`isLoading = signal(true).asReadonly()`).
    *   **`WindowContainerSidenavService`**: Store registered components in a Signal (`components = signal<ContainerComponent[]>([])`) so templates can render lists reactively and seamlessly without pipe async or manual subscription boilerplate.

---

## 4. Generator-Specific Anti-Patterns

### ⚠️ Fragile Path Resolution and Disk Access via Virtual Tree
*   **File:** [`packages/angular/services/src/generators/init/generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/generators/init/generator.ts#L11-L20)
*   **Issue:** Resolving the virtual path of `package.json` using Node's `__dirname` combined with `relative(tree.root, ...)` is fragile. When the generator is executed inside a compiled/cached `node_modules` package, `__dirname` will resolve to a physical path outside the workspace, causing `tree.read` and `tree.exists` to throw an out-of-tree error.
*   **Recommended Fix:** Read package-specific static configurations directly from the physical disk using `fs` or `require` (which is standard and robust for compiler files), or resolve paths using `joinPathFragments` within the virtual tree from known workspace anchors.

### ⚠️ Virtual Tree Checks on `node_modules`
*   **File:** [`packages/angular/services/src/generators/init/generator.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/generators/init/generator.ts#L90-L110)
*   **Issue:** The generator performs check operations such as `tree.exists(peerPackageJsonFilePath)` where the path is within `node_modules`. Since `node_modules` is typically omitted or ignored by the Nx virtual `Tree`, these checks are highly likely to return `false` in normal runs, preventing peer dependency initialization.
*   **Recommended Fix:** Use the physical Node file system/module resolution (e.g. `require.resolve()`) to check for existence of physical files in `node_modules` rather than using the virtual `Tree`.

---

## 5. Test Coverage & Incomplete Implementation

### 🧪 Improve Test Coverage for `ImageLoaderService`
*   **File:** [`packages/angular/services/src/lib/image-loader.service.spec.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/image-loader.service.spec.ts)
*   **Issue:** The `ImageLoaderService` has only a placeholder test verifying instantiation. The `load()` method has zero coverage, leaving critical state management and potential error conditions untested.
*   **Recommended Fix:** Implement tests for `ImageLoaderService.load()`, mocking the global `Image` constructor to verify loading state logic (handling parallel loads, resolution caching, and error rejections).

### 🚧 Incomplete Feature in `ResetService`
*   **File:** [`packages/angular/services/src/lib/reset.service.ts`](file:///mnt/mmuenker/Projects/rxap/packages/packages/angular/services/src/lib/reset.service.ts#L15)
*   **Issue:** Contains a `// TODO : iterate over the list of active DataSources` comment and does not actually perform the data source reset on individual instances.
*   **Recommended Fix:** Introduce a mechanism for active DataSources to register themselves in `ResetService` so that calling `resetDataSource()` can invoke their individual reset hooks.
