export interface InitFeatureLibraryGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  skipFormat?: boolean;
  /** Whether the library exposes routes */
  routes?: boolean;
  targets?: {
      /** If set to false the target fix-dependencies will not be added to the project */
      fixDependencies?: boolean;
      /** If set to false the target index-export will not be added to the project */
      indexExport?: boolean;
    };
}
