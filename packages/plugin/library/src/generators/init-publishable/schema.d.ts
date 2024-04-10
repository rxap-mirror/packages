export interface InitPublishableGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
}
