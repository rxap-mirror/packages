import { PackageExportsEntryOrFallback } from './package-exports-entry-or-fallback';

export interface PackageExportsEntryObject {
  /** The module path that is resolved when this specifier is imported as a CommonJS module using the `require(...)` function. */
  require?: PackageExportsEntryOrFallback;
  /** The module path that is resolved when this specifier is imported as an ECMAScript module using an `import` declaration or the dynamic `import(...)` function. */
  import?: PackageExportsEntryOrFallback;
  /** The module path that is resolved when this environment is Node.js. */
  node?: PackageExportsEntryOrFallback;
  /** The module path that is resolved when no other export type matches. */
  default?: PackageExportsEntryOrFallback;
}
