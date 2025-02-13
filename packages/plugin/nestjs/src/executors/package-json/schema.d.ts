export interface PackageJsonExecutorSchema {
  dependencies?: Array<string>;
  /** Include local projects in the package.json file, if they have a package.json file */
  includeLocalProjects?: boolean;
}
