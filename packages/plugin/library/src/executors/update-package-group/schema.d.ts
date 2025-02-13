export interface UpdatePackageGroupExecutorSchema {
  /** List of regexes to match package name that should be added to the package group */
  packageGroupRegex?: Array<string>;
  /** If true, the package group will be merged with the existing package group. If false, the package group will be replaced. */
  merge?: boolean;
  /** List of package names that should be added to the package group */
  include?: Array<string>;
  /** If true, the dependencies of the included packages will be added to the package group */
  includeDependencies?: boolean;
}
