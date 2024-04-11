export interface InitGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  dte?: boolean;
  skipFormat?: boolean;
  onlyPackages?: boolean;
}
