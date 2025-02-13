export enum PresetLicenseGeneratorSchemaEnum {
  NONE = 'none',
  MIT = 'mit',
  GPL = 'gpl'
}

export interface PresetGeneratorSchema {
  /** If true, the workspace will be initialized for package development */
  packages?: boolean;
  /** If true, the workspace will be initialized for standalone development */
  standalone?: boolean;
  license?: PresetLicenseGeneratorSchemaEnum;
  /** The URL of the repository */
  repositoryUrl?: string;
  skipInstall?: boolean;
}
