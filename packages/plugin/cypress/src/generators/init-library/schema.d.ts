export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
  generateTests?: boolean;
  component?: boolean;
  buildTarget?: string;
}
