export interface InitGeneratorSchema {
  packages: boolean;
  overwrite?: boolean;
  skipProjects?: boolean;
  standalone?: boolean;
  skipLicense?: boolean;
  repositoryUrl?: string;
  license?: 'mit' | 'gpl' | 'none';
  skipFormat?: boolean;
  fullStack?: boolean;
}
