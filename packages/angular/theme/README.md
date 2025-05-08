This package provides an Angular theme service that allows you to manage and customize the look and feel of your application. It includes features such as dark mode support, theme density control, typography settings, and color palette management. The service also provides utilities for computing color palettes and observing theme density changes.

[![npm version](https://img.shields.io/npm/v/@rxap/ngx-theme?style=flat-square)](https://www.npmjs.com/package/@rxap/ngx-theme)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/ngx-theme)
![npm](https://img.shields.io/npm/dm/@rxap/ngx-theme)
![NPM](https://img.shields.io/npm/l/@rxap/ngx-theme)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/ngx-theme
```
**Install peer dependencies:**
```bash
yarn add @angular/cdk @angular/core @rxap/config @rxap/ngx-pub-sub @rxap/rxjs @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/ngx-theme:init
```
# Guides

# Dark and Light mode with tailwind and angular material 3

This guide provides the setup steps for configuring Tailwind CSS and Angular Material for the light/dark/system theme switching mechanism, using the approaches we discussed previously.

## 1. Configure Tailwind with the Variant Strategy

Update your tailwind.config.js to use the variant strategy. This allows Tailwind to react to both the system preference (prefers-color-scheme) and specific classes (.light, .dark) for manual overrides.

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other configurations
  darkMode: 'selector',
  theme: {
    extend: {
      // ... your theme extensions
    },
  },
  plugins: [],
  // ...
};
```

This configuration tells Tailwind to apply dark: variants if EITHER the system preference is dark (and not overridden by .light) OR if the .dark class is explicitly set on an ancestor element.

## 2. Integrate with Angular Material (Modern MDC Approach)

Use the modern Angular Material Sass API (mat.theme) to define your theme once and emit CSS variables. Then, use CSS to control the color-scheme property based on the .light and .dark classes applied by the ThemeService. Material components will react automatically to the computed color-scheme.

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ));
}

// --- Tailwind Integration ---
@tailwind base;
@tailwind components;
@tailwind utilities;

// --- Color Scheme Control & Base Styles ---
html { // Setting on html or :root is fine
  // Default: Let the browser choose light/dark based on system preference.
  // Material components & Tailwind's media query variant will react to this.
  color-scheme: light dark;

  // Apply base background/text colors (Tailwind handles dark via variants).
  // Add transitions for smoother switching.
  @apply bg-white text-gray-800 transition-colors duration-200 ease-in-out;
}

// Force light mode when .light class is present on an ancestor (e.g., body)
// Use :where to keep specificity low, preventing conflicts.
:where(html.light, body.light, .light) {
  color-scheme: light;
  // Ensure light background/text if overriding system dark mode
  @apply bg-white text-gray-800;
}

// Force dark mode when .dark class is present on an ancestor (e.g., body)
// Use :where to keep specificity low.
:where(html.dark, body.dark, .dark) {
  color-scheme: dark;
  // Apply dark background/text (complements Tailwind's dark: variants)
  @apply bg-gray-900 text-gray-200;
}

// Other global styles can go here
body {
  // Ensure body takes full height if needed, etc.
  @apply min-h-screen m-0; // Added margin reset
}
```

This setup provides the configuration for Tailwind and the recommended SCSS structure for Angular Material theming that integrates with the ThemeService managing the .light and .dark classes.

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/ngx-theme:init
```
