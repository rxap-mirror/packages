export interface InitGeneratorSchema {
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  skipFormat?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** The prefix for the angular components */
  prefix?: string;
  /** Whether to add shared libraries */
  withSharedLibraries?: boolean;
}
