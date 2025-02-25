export interface InitGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  skipFormat?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** Whether to add the index-export target to the library */
  indexExport?: boolean;
  withInitGenerator?: boolean;
  targets?: {
      /** If set to false the target fix-dependencies will not be added to the project */
      fixDependencies?: boolean;
      /** If set to false the target index-export will not be added to the project */
      indexExport?: boolean;
    };
}
