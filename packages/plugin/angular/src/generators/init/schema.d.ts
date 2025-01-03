export interface InitGeneratorSchema {
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  skipFormat?: boolean;
  prefix?: string;
  withSharedLibraries?: boolean;
}
