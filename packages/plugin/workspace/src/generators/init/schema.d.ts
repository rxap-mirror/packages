export interface InitGeneratorSchema {
  /** If true, the workspace will be initialized for package development */
  packages?: boolean;
  /** If true, the workspace will be initialized for full stack application development */
  fullStack?: boolean;
  /** If true, the workspace will be initialized for standalone development */
  standalone?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  skipFormat?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** Whether to skip adding a license file */
  skipLicense?: boolean;
  license?: 'none' | 'mit' | 'gpl';
  /** The URL of the repository */
  repositoryUrl?: string;
  withHusky?: boolean;
}
