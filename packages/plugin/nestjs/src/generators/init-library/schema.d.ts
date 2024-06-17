export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
  targets?: {
    indexExport?: boolean;
    fixDependencies?: boolean;
  }
}
