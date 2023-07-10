export interface CliOptions {
  /** The default schematics collection to use. */
  defaultCollection?: string;
  /** Specify which package manager tool to use. */
  packageManager?: 'npm' | 'cnpm' | 'yarn' | 'pnpm';
  /** Control CLI specific console warnings */
  warnings?: {
    /** Show a warning when the global version is newer than the local one. */
    versionMismatch?: boolean;
  };
  /** Share anonymous usage data with the Angular Team at Google. */
  analytics?: boolean | string;
  analyticsSharing?: {
    /** Analytics sharing info tracking ID. */
    tracking?: string;
    /** Analytics sharing info universally unique identifier. */
    uuid?: string;
  };
}
