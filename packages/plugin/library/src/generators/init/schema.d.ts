export interface InitGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  /**
   * @deprecated use `targets.indexExport` instead
   */
  indexExport?: boolean;
  skipFormat?: boolean;
  targets?: {
    fixDependencies?: boolean;
    indexExport?: boolean;
  }
}
