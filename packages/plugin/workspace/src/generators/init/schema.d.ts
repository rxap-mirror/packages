export interface InitGeneratorSchema {
  applications: boolean;
  packages: boolean;
  overwrite?: boolean;
  skipProjects?: boolean;
  standalone?: boolean;
  skipLicense?: boolean;
}
