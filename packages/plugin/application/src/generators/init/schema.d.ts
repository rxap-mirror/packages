export interface InitGeneratorSchema {
  project?: string;
  dockerImageRegistry?: string;
  dockerImageSuffix?: string;
  dockerImageName?: string;
  projects?: string[];
  overwrite?: boolean;
  skipProjects?: boolean;
  authentik?: boolean;
  minio?: boolean;
  standalone?: boolean;
}
