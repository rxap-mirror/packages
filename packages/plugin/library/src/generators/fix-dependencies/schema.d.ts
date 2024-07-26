export interface FixDependenciesGeneratorSchema {
  projects?: string[];
  reset?: boolean;
  resetAll?: boolean;
  verbose?: boolean;
  resolve?: boolean;
  strict?: boolean;
  onlyDependencies?: boolean;
  dependencies?: string[];
  peerDependencies?: string[];
}
