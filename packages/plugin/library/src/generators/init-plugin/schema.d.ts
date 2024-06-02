export interface InitPluginGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
  targets?: {
    fixDependencies?: boolean;
  }
}
