export interface FixDependenciesGeneratorSchema {
  projects?: Array<string>;
  reset?: boolean;
  resolve?: boolean;
  resetAll?: boolean;
  /** If true, will fail if any dependency is not found */
  strict?: boolean;
  /** If true, will move all peer dependencies to dependencies */
  onlyDependencies?: boolean;
  /** List of packages that should always be added as dependencies */
  dependencies?: Array<string>;
  /** List of packages that should always be added as peerDependencies */
  peerDependencies?: Array<string>;
}
