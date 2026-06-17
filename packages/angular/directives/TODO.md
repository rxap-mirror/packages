# TODO: angular-directives Auditing & Improvements

This file lists the critical bugs, architectural debt, performance bottlenecks, and test coverage improvements identified during the project audit of `@rxap/directives`.

---

## 🚨 Critical & Severe Bugs

### 1. `ContenteditableDirective` — Hardcoded Length Restriction
- **File**: `packages/angular/directives/src/lib/contenteditable.directive.ts` (Lines 53-55)
- **Issue**: The guard `if (value && value.length >= 2)` prevents any updates or saving if the value is cleared (length 0) or consists of a single character. This makes it impossible for users to delete their content or write short text.
- **Recommended Fix**: Make this length guard configurable (via an `@Input()`) or remove the arbitrary `length >= 2` restriction.

### 2. `ShareService` — Non-SSR-Safe direct `navigator` reference (Server Crash Risk)
- **File**: `packages/angular/directives/src/lib/share-button.directive.ts` (Line 20)
- **Issue**: Class property `readonly isSupported = 'share' in navigator && ...` references the global `navigator` directly during instantiation. When running in Angular Server-Side Rendering (SSR) or Prerendering (Universal), `navigator` is `undefined`, causing a fatal crash of the rendering process.
- **Recommended Fix**: Use a getter or wrap the `navigator` check with a safe check for the platform type or existence of `navigator`:
  ```typescript
  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
  }
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

- **Status (2026-06)**: Improving. `ContenteditableDirective` (revert-on-save) and
  `IfTruthyDirective` (track-by churn) now have specs, and `background-image.directive.spec.ts`
  gained coverage for clearing and the load race condition.
- **Remaining Actions**:
  1. Un-skip and fix the disabled test in `background-image.directive.spec.ts`
     (`xit('should add background image to element'`).
  2. Implement unit test suites for the remaining directives:
     - `AvatarBackgroundImageDirective`
     - `IsDevModeDirective`
     - `MethodTemplateDirective`
     - `MethodDirective`
     - `MovableDividerDirective`
     - `ShareButtonDirective`
     - `StopPropagationDirective` / `StopImmediatePropagationDirective` / `PreventDefaultDirective`
