export type ExcludeDefinition = {
  /** Specifies a list of files to be excluded from compilation. The 'exclude' property only affects the files included via the 'include' property and not the 'files' property. Glob patterns require TypeScript version 2.0 or later. */
  exclude?: Array<string>;
};
