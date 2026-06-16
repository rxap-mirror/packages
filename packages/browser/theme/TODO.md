# TODO - @rxap/browser-theme

This document details findings, critical bugs, architectural debt, and recommended improvements for the `@rxap/browser-theme` library.

---

## 🚨 Critical Bugs & Logic Errors

### 1. Missing Validation / Crash Hazard on Missing `primary` Key
- **Location:** `ThemeColor.apply` ([theme-color.ts:L351-L371](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L351-L371))
- **Issue:** The bootstrap hook `applyThemeColorBootstrapHook` dynamically loads theme colors via config. If the config returns an empty object `{}` or is missing the `primary` key, `ThemeColor.apply` receives `primary = undefined`. Calling `primary.replace('#', 'FF')` immediately throws a `TypeError`, completely crashing the Angular application's bootstrap sequence.
- **Recommended Fix:** Add a safety check at the start of the `apply` method or check if `primary` exists. If not, log a clean error or fall back to a default primary color.
  ```typescript
  if (!primary) {
    console.error('[@rxap/browser-theme] Cannot apply theme: primary color is missing.');
    return;
  }
  ```

### 2. Lack of Support for Standard CSS Color Formats
- **Location:** `ThemeColor.apply` ([theme-color.ts:L351-L371](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L351-L371))
- **Issue:** The logic strictly expects a 7-character hexadecimal string with a `#` prefix (e.g., `"#6750A4"`), converting it via `.replace('#', 'FF')` and `parseInt(..., 16)`. It fails silently or produces incorrect color channels/transparencies under the following scenarios:
  - **No `#` Prefix:** `"6750A4"` -> remains `"6750A4"`. Parsing with `parseInt` results in a 24-bit value where the alpha channel is `0x00` (completely transparent/invisible).
  - **Shorthand CSS Hex:** `"#fff"` -> becomes `"FFfff"`. Parsed as `0x0FFFFF` instead of `0xFFFFFFFF`.
  - **CSS Color Names or RGB/RGBA:** `"red"` or `"rgb(255,0,0)"` -> parses to `NaN` or incorrect values.
- **Recommended Fix:** Add helper functions to normalize input colors into fully-formed 8-character ARGB integers before passing them to `CorePalette.fromColors`.
  ```typescript
  function normalizeToArgb(color: string): number {
    // 1. Handle shorthand hex e.g. #fff -> #ffffff
    // 2. Prepend Alpha channel "FF" if missing
    // 3. (Optional) Convert rgb/rgba or CSS names to Hex or ARGB
  }
  ```

### 3. Signed Integer Negative Hexadecimal Bug
- **Location:** `convertTonalPalette` ([theme-color.ts:L302](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L302))
- **Issue:** In JavaScript, bitwise operations force numbers to be treated as 32-bit signed integers. Since the alpha channel for opaque colors is `0xFF`, the high bit is always set, making the tone integers negative (e.g., `-15654349`). Converting negative integers with `toString(16)` prepends a minus sign (e.g., `"-eeddcd"`). The string replace `replace(/^ff/i, '#')` fails to match because of the minus sign, leading to invalid CSS color values (such as `"-eeddcd"`) injected into the DOM.
- **Recommended Fix:** Convert the signed integer to an unsigned 32-bit integer using the zero-fill right shift operator (`>>> 0`) before converting to string:
  ```typescript
  result[tone] = (tonalPalette.tone(tone) >>> 0).toString(16).replace(/^ff/i, '#');
  ```

---

## 🏛️ Architectural Debt & Anti-Patterns

### 1. Modern CSS `light-dark()` Function Compatibility
- **Location:** `mergeLightAndDarkVars` ([theme-color.ts:L326-L338](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L326-L338))
- **Issue:** The theme system uses the modern CSS `light-dark()` function to support dual themes. This function is a relatively recent addition to the CSS specification (Chrome 123+, Safari 17.5+). If the host application runs on older browsers, all theme variables will fail to parse, rendering the application completely unstyled.
- **Recommended Fix:** Provide a more compatible fallback strategy. Standard CSS variables split across a light class/selector and a `@media (prefers-color-scheme: dark)` / `.dark` class block is universally supported and much more resilient.

### 2. Missing `color-scheme` Property Declaration
- **Location:** `ThemeColor.apply` ([theme-color.ts:L379-L382](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L379-L382))
- **Issue:** The CSS `light-dark()` function *requires* that the `color-scheme` property be explicitly declared in CSS (e.g., `color-scheme: light dark;` on the `:root` or `html` element) for the browser to compute the correct values. If the host application does not set this property, the dark mode values inside `light-dark()` will never be evaluated.
- **Recommended Fix:** Explicitly set the `color-scheme` property on `document.documentElement` within the `apply` method:
  ```typescript
  document.documentElement.style.setProperty('color-scheme', 'light dark');
  ```

### 3. Dead / Unused Private Methods
- **Location:** `convertBasePaletteToCss` ([theme-color.ts:L340-L347](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/src/lib/theme-color.ts#L340-L347))
- **Issue:** The `convertBasePaletteToCss` method is a private helper that is never invoked anywhere in the codebase.
- **Recommended Fix:** Remove the dead method to keep the codebase clean and maintainable.

---

## 🧪 Test Coverage & Configuration Issues

### 1. Complete Absence of Unit Tests
- **Issue:** There are zero unit or integration tests written for `@rxap/browser-theme`. Given the complexity of hex parsing, negative bitwise outputs, and DOM manipulations, unit tests are critical.
- **Recommended Fix:** Add unit tests (`theme-color.spec.ts`) to verify:
  - Valid and invalid hex inputs (e.g., short hex, missing `#`, standard hex).
  - Proper generation of CSS variables.
  - Proper output of positive hex color strings instead of negative formats.

### 2. Misconfigured Jest `testEnvironment`
- **Location:** `jest.config.ts` ([jest.config.ts:L4](file:///mnt/mmuenker/Projects/rxap/packages/packages/browser/theme/jest.config.ts#L4))
- **Issue:** The `testEnvironment` is set to `'node'`. However, `ThemeColor` relies on the browser's DOM environment (`window.document`, `document.documentElement`). If any tests are written, they will immediately crash in Jest because the browser DOM is not available.
- **Recommended Fix:** Change `testEnvironment` from `'node'` to `'jsdom'` in `jest.config.ts`.
