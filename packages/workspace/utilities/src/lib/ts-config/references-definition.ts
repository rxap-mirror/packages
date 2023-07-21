export type ReferencesDefinition = {
  /** Referenced projects. Requires TypeScript version 3.0 or later. */
  references?: Array<{
    /** Path to referenced tsconfig or to folder containing tsconfig. */
    path?: string;
  }>;
};
