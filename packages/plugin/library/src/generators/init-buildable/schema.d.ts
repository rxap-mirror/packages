export interface InitBuildableGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
}
