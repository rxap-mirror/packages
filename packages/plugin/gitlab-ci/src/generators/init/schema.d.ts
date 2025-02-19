export interface InitGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** If true, the gitlab ci will be initialized with components */
  components?: boolean;
  componentsSource?: 'component' | 'local';
  release?: 'none' | 'release-it' | 'schematic-release';
  /** The name of the helm chart project path with namespace where the app version should be automatically updated */
  helmChart?: string;
  skipFormat?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** If true, the gitlab ci will be initialized exclusively for package development */
  onlyPackages?: boolean;
  /** If true, the gitlab ci will be initialized with dte execution for the targets */
  dte?: boolean;
  /** The number of parallel agents started for the nx workspace run tasks to run in the pipeline */
  parallel?: number;
  /** If true, the gitlab ci will be initialized for a workspace with angular projects */
  angular?: boolean;
  /** If true, the gitlab ci will be initialized for a workspace with nest projects */
  nest?: boolean;
}
