export interface InitGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  indexExport?: boolean;
  skipFormat?: boolean;
  targets?: {
    fixDependencies?: boolean;
  }
}
