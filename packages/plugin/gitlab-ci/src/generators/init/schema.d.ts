export interface InitGeneratorSchema {
  project?: string;
  projects?: string[];
  overwrite?: boolean;
  dte?: boolean;
  skipFormat?: boolean;
  onlyPackages?: boolean;
  angular?: boolean;
  nest?: boolean;
  release?: 'none' | 'release-it' | 'semantic-release';
  helmChart?: string;
  components?: boolean;
}
