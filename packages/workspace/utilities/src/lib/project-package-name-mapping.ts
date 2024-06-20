import {
  ProjectGraph,
  Tree,
} from '@nx/devkit';

const GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE: Record<string, string> = {};
const GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE: Record<string, string> = {};

/**
 * Populates mapping caches between package names and project names for library projects within a given project graph.
 *
 * This function iterates over all projects in the provided project graph. For each project that is identified as a library (`lib`),
 * it checks if a `package.json` file exists in the project's root directory. If the file exists, the function reads the package name
 * from the `package.json` and updates two caches: one mapping from package names to project names, and another from project names to package names.
 *
 * @param {Tree} tree - The file system abstraction that provides methods to read and check existence of files.
 * @param {ProjectGraph} projectGraph - An object representing the project graph which includes nodes where each node represents a project.
 *
 * Note: This function relies on global caches `GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE` and `GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE`
 * to store the mappings. It assumes these caches are already initialized and available in the global scope.
 */
export function LoadProjectToPackageMapping(tree: Tree, projectGraph: ProjectGraph) {
  const projectNames = Object.keys(projectGraph.nodes);
  for (const projectName of projectNames) {
    const project = projectGraph.nodes[projectName];
    if (project.type !== 'lib') {
      continue;
    }
    const projectRoot = project.data.root;
    if (!tree.exists(`${ projectRoot }/package.json`)) {
      continue;
    }
    const packageJSON = JSON.parse(tree.read(`${ projectRoot }/package.json`)!.toString('utf-8'));
    GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageJSON.name] = projectName;
    GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName] = packageJSON.name;
  }
}

/**
 * Converts a package name to a corresponding project name using a predefined cache.
 *
 * This function looks up a given package name in a cache to find the associated project name.
 * If the cache has not been initialized, it throws an error indicating that the cache is not loaded.
 * If the package name is not found in the cache, it throws an error specifying that the project
 * for the given package could not be found.
 *
 * @param {string} packageName - The name of the package to convert to a project name.
 * @returns {string} The project name associated with the given package name.
 * @throws {Error} If the cache is not loaded or if the package name is not found in the cache.
 */
export function PackageNameToProjectName(packageName: string): string {
  if (!GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName]) {
    return GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName];
  }
  throw new Error(`Could not find project for package '${ packageName }'`);
}

/**
 * Converts a given project name to its corresponding package name using a cached mapping.
 *
 * This function looks up a project name in a predefined cache (`GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE`).
 * If the cache has not been initialized, it throws an error indicating that the cache is not loaded.
 * If the project name is found in the cache, it returns the corresponding package name.
 * If the project name is not found in the cache, it throws an error stating that the package could not be found.
 *
 * @param {string} projectName - The name of the project to convert to a package name.
 * @returns {string} The package name associated with the given project name.
 * @throws {Error} If the cache is not loaded or if the project name is not found in the cache.
 */
export function ProjectNameToPackageName(projectName: string): string {
  if (!GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  if (GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName]) {
    return GENERATOR_PROJECT_NAME_TO_PACKAGE_NAME_CACHE[projectName];
  }
  throw new Error(`Could not find package for project '${ projectName }'`);
}

/**
 * Checks if there is a project associated with the given package name in the cache.
 *
 * This function verifies if a project corresponding to the specified package name exists in the global cache.
 * It throws an error if the cache has not been initialized or loaded prior to this check.
 *
 * @param {string} packageName - The name of the package to check in the project cache.
 * @returns {boolean} - Returns `true` if the project exists for the given package name, otherwise `false`.
 * @throws {Error} - Throws an error if the cache is not yet loaded.
 */
export function HasProjectWithPackageName(packageName: string) {
  if (!GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE) {
    throw new Error('The project to package name cache has not been loaded yet.');
  }
  return GENERATOR_PACKAGE_NAME_TO_PROJECT_NAME_CACHE[packageName] !== undefined;
}
