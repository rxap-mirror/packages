export interface InitGeneratorSchema {
  dockerImageRegistry?: string;
  dockerImageSuffix?: string;
  dockerImageName?: string;
  projects?: string[];
  overwrite?: boolean;
}
