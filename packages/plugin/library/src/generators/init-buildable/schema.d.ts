export interface InitBuildableGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  skipFormat?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
}
