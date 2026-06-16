# TODO: angular-directives Auditing & Improvements

This file lists the critical bugs, architectural debt, performance bottlenecks, and test coverage improvements identified during the project audit of `@rxap/directives`.

---

## 🚨 Critical & Severe Bugs

### 1. `BackgroundImageDirective` — Falsy `imageUrl` Change Bug
- **File**: `packages/angular/directives/src/lib/background-image.directive.ts` (Lines 100-103)
- **Issue**: In `ngOnChanges`, `this.imageUrlChange` is only called if `changes['imageUrl'].currentValue` is truthy:
  ```typescript
  case 'imageUrl':
    if (changes['imageUrl'].currentValue) {
      this.imageUrlChange(changes['imageUrl'].currentValue);
    }
    break;
  ```
  If `imageUrl` is dynamically changed to `null`, `undefined`, or an empty string, the change is ignored, and the previous background image remains visible on the element.
- **Recommended Fix**: Allow falsy values to pass through to `imageUrlChange` so the directive can clear or reset the background style:
  ```typescript
  case 'imageUrl':
    this.imageUrlChange(changes['imageUrl'].currentValue);
    break;
  ```

### 2. `BackgroundImageDirective` — Image Load Race Condition
- **File**: `packages/angular/directives/src/lib/background-image.directive.ts` (Lines 140-160)
- **Issue**: `imageUrlChange` is an `async` method using `await this.imageLoader.load(imageUrl)`. Since multiple image requests can be active concurrently, if an older image finishes loading *after* a newer image, the older image will overwrite the newer one on the element style.
- **Recommended Fix**: Track the latest requested image URL and only apply the loaded background image if the resolved image matches the latest request:
  ```typescript
  private _latestImageUrl: string | null = null;
  
  private async imageUrlChange(imageUrl: string): Promise<void> {
    this._latestImageUrl = imageUrl;
    // ... apply placeholder ...
    if (imageUrl) {
      await this.imageLoader.load(imageUrl);
      if (this._latestImageUrl === imageUrl) {
        this.renderer.setStyle(this.host.nativeElement, 'background-image', `url("${ imageUrl }")`);
      }
    }
  }
  ```

### 3. `ContenteditableDirective` — Revert-On-Save Bug
- **File**: `packages/angular/directives/src/lib/contenteditable.directive.ts` (Lines 53-68)
- **Issue**: When a user types, `onInput` invokes the bound method `await this.method?.call(event)`. If the save method returns `void` or `Promise<void>` (which is standard for saving), `result` is falsy. This causes the fallback condition `else if (this.initial)` to execute, resetting the input's `innerText` to the `initial` value and discarding the user's edits immediately after the 1000ms debounce!
- **Recommended Fix**: Do not revert to `this.initial` if the save method executes successfully without returning a new value. Only revert if the save method throws an error, or if a specific validation fails:
  ```typescript
  try {
    const result = await this.method?.call(event);
    if (result && typeof result === 'string') {
      this.initial = this.elementRef.nativeElement.innerText = result;
    }
  } catch (error) {
    if (this.initial) {
      this.elementRef.nativeElement.innerText = this.initial;
    }
  }
  ```

### 4. `ContenteditableDirective` — Hardcoded Length Restriction
- **File**: `packages/angular/directives/src/lib/contenteditable.directive.ts` (Lines 53-55)
- **Issue**: The guard `if (value && value.length >= 2)` prevents any updates or saving if the value is cleared (length 0) or consists of a single character. This makes it impossible for users to delete their content or write short text.
- **Recommended Fix**: Make this length guard configurable (via an `@Input()`) or remove the arbitrary `length >= 2` restriction.

### 5. `IfTruthyDirective` — Total DOM Churn due to Unassigned State (`_last` is never set)
- **File**: `packages/angular/directives/src/lib/if-truthy.directive.ts`
- **Issue**: The private variable `_last?: Data` is declared but **never** assigned a value anywhere in the file. Since `_last` remains `undefined`, the comparison `this._last !== undefined` in `hasChanged(current)` is always false, meaning `hasChanged` always returns `true`. The directive clears and recreates the embedded DOM template on **every** execution, destroying component states and causing severe DOM churn.
- **Recommended Fix**: Assign the current value to `_last` when the change is applied:
  ```typescript
  protected async execute() {
    const result = await this.method.call(this.parameters);
    if (this.hasChanged(result)) {
      this.viewContainerRef.clear();
      if (result) {
        this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: result });
      }
      this._last = result; // <-- Fix: Update _last!
    }
    this.cdr.detectChanges();
  }
  ```

### 6. `ShareService` — Non-SSR-Safe direct `navigator` reference (Server Crash Risk)
- **File**: `packages/angular/directives/src/lib/share-button.directive.ts` (Line 20)
- **Issue**: Class property `readonly isSupported = 'share' in navigator && ...` references the global `navigator` directly during instantiation. When running in Angular Server-Side Rendering (SSR) or Prerendering (Universal), `navigator` is `undefined`, causing a fatal crash of the rendering process.
- **Recommended Fix**: Use a getter or wrap the `navigator` check with a safe check for the platform type or existence of `navigator`:
  ```typescript
  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
  }
  ```

### 7. `init` Generator — Broken Boolean Operator in Dependency Classification
- **File**: `packages/angular/directives/src/generators/init/generator.ts` (Lines 45-51)
- **Issue**:
  ```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  )
  ```
  The literal array is truthy, meaning this statement evaluates as `!isDevDependency && true` (or simply `!isDevDependency`). This logic bug causes all dependencies (not already devDependencies) to get incorrectly classified as devDependencies and moved, bypassing the regex checks entirely.
- **Recommended Fix**: Add `.some(rx => rx.test(packageName))` to correctly match the array of regexes:
  ```typescript
  if (
    !isDevDependency &&
    [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/].some((rx) => rx.test(packageName))
  )
  ```

---

## 📐 Architectural & Design Debt

### 1. Directive Selector Collision (`[rxapMethod]`)
- **Files**:
  - `packages/angular/directives/src/lib/method.directive.ts`
  - `packages/angular/directives/src/lib/method-template.directive.ts`
- **Issue**: Both `MethodDirective` and `MethodTemplateDirective` share the identical selector `[rxapMethod]` and exportAs `rxapMethod`. This can cause Angular's compiler to apply both directives simultaneously to an element, leading to unintended side-effects and confusion.
- **Recommended Fix**: Give them unique, expressive selectors (e.g. `[rxapMethod]` and `[rxapMethodTemplate]`).

### 2. `MovableDividerDirective` — Huge `mousemove` Change Detection Overhead
- **File**: `packages/angular/directives/src/lib/movable-divider.directive.ts` (Lines 56-87)
- **Issue**: It subscribes to `mousemove` on the `containerElement` inside Angular's zone for its entire lifecycle. This triggers application-wide Angular change detection on *every single mouse movement* inside that container, even when the user is not actively dragging the divider!
- **Recommended Fix**: Either run the events outside Angular zone using `NgZone.runOutsideAngular` or register the `mousemove` and `mouseup` subscriptions dynamically inside the `mousedown` handler, and unsubscribe immediately upon `mouseup`:
  ```typescript
  @HostListener('mousedown')
  public onMousedown() {
    this._moveDivider = true;
    
    // Dynamically register dragging listeners outside Angular Zone
    this.ngZone.runOutsideAngular(() => {
      const moveSub = fromEvent<MouseEvent>(this.containerElement, 'mousemove').subscribe(($event) => {
        if (this._moveDivider) {
          // ... calculate width ...
          this.renderer.setStyle(this.fixedElement, 'max-width', width);
        }
      });
      
      const upSub = fromEvent(this.containerElement, 'mouseup').subscribe(() => {
        this._moveDivider = false;
        moveSub.unsubscribe();
        upSub.unsubscribe();
      });
    });
  }
  ```

### 3. Dead Code in `MethodTemplateDirective`
- **File**: `packages/angular/directives/src/lib/method-template.directive.ts`
- **Issue**: `@Input() public immediately = false;` is declared but never referenced or implemented in the class.
- **Recommended Fix**: Either implement the immediate execution logic in `ngOnInit` or remove the dead property.

### 4. Incorrect Decorator on Base Class `ConfirmClick`
- **File**: `packages/angular/directives/src/lib/confirm-click.ts`
- **Issue**: `ConfirmClick` is an abstract base class declaring Angular features (inputs, host listeners) but is decorated with `@Injectable()` instead of `@Directive()`.
- **Recommended Fix**: Change `@Injectable()` to `@Directive()` (with no selector) to comply with Ivy inheritance guidelines:
  ```typescript
  import { Directive } from '@angular/core';
  // ...
  @Directive()
  export abstract class ConfirmClick { ... }
  ```

---

## 🧪 Test Coverage Debt

- **Current Status**: **Extremely Poor / Critical Coverage Gap**
  - Out of 15 directive and logic files, **only 1** has a spec file (`background-image.directive.spec.ts`).
  - The only spec file has its primary test case (`xit('should add background image to element'`) **skipped (disabled)**.
  - This results in effectively **0% functional test coverage** across all directives in the library.
- **Required Actions**:
  1. Fix the skipped test in `background-image.directive.spec.ts`.
  2. Implement unit test suites for all remaining directives:
     - `AvatarBackgroundImageDirective`
     - `ContenteditableDirective`
     - `IfTruthyDirective`
     - `IsDevModeDirective`
     - `MethodTemplateDirective`
     - `MethodDirective`
     - `MovableDividerDirective`
     - `ShareButtonDirective`
     - `StopPropagationDirective` / `StopImmediatePropagationDirective` / `PreventDefaultDirective`
