export type ExtraEntryPoint = {
  /** The file to include. */
  input: string;
  /** The bundle name for this extra entry point. */
  bundleName?: string;
  /** If the bundle will be referenced in the HTML file. */
  inject?: boolean;
} | string;
