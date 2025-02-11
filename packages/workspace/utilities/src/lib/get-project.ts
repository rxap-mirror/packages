import {
  getProjects,
  ProjectConfiguration,
} from '@nx/devkit';
import {
  clone,
  equals,
} from '@rxap/utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { UpdateJsonFileOptions } from './json-file';
import { PackageJson } from './package-json';
import {
  GetPackageJson,
  HasPackageJson,
  UpdatePackageJson,
  UpdatePackageJsonOptions,
} from './package-json-file';
import { SearchFile } from './search-file';
import {
  IsGeneratorTreeLike,
  IsTreeLike,
  TreeAdapter,
  TreeLike,
} from './tree';
import { VisitTree } from './visit-tree';

export interface ProjectJson extends ProjectConfiguration, Record<string, any> {
  prefix?: string;
}

export const PROJECT_NAME_TO_PROJECT_LOCATION_CACHE = new Map<string, string>();
export const PROJECT_LOCATION_TO_PROJECT_NAME_CACHE = new Map<string, string>();

export const PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE = new Map<string, string>();

export const PROJECT_LOCATION_CACHE_LIST: string[] = [];

function buildProjectLocationCache(tree: TreeLike) {
  PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.clear();
  PROJECT_LOCATION_TO_PROJECT_NAME_CACHE.clear();
  const treeAdapter = new TreeAdapter(tree);
  for (const { path, isFile } of VisitTree(tree)) {
    if (isFile && path.endsWith('project.json')) {
      const project = treeAdapter.readJson(path) as ProjectJson;
      if (project.name) {
        PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.set(project.name, path);
        PROJECT_LOCATION_TO_PROJECT_NAME_CACHE.set(path, project.name);
      }
    }
  }
}

/**
 * Searches for a project within a given tree structure and returns its configuration in JSON format.
 *
 * This function attempts to locate a project by its name within a hierarchical tree-like structure. It supports
 * different strategies based on the type of tree provided:
 *
 * 1. If the tree is recognized as a generator tree (checked by `IsGeneratorTreeLike`), it retrieves a map of projects
 * directly and returns the project if found.
 * 2. If the project name is found in a global cache (`PROJECT_LOCATION_CACHE`), it reads the project configuration
 * from the cached location using a `TreeAdapter` to interface with the tree.
 * 3. As a fallback, it performs a file search within the tree (using `SearchFile`) for files named `project.json`,
 * parsing each found file as JSON and checking if the project name matches the desired one.
 *
 * If the project is found, it ensures the `root` property of the project configuration is set to the directory
 * containing the `project.json`, adjusting for any leading slashes in the path.
 *
 * @param tree - The tree structure to search within. Must conform to a `TreeLike` interface.
 * @param projectName - The name of the project to find.
 * @returns The project configuration as a `ProjectJson` object if the project is found, otherwise `null`.
 * @template Tree - A generic extending `TreeLike` which dictates the structure of the input tree.
 */
export function FindProject<Tree extends TreeLike>(tree: Tree, projectName: string): ProjectJson | null {
  if (IsGeneratorTreeLike(tree)) {
    const projects = getProjects(tree);
    if (projects.has(projectName)) {
      return projects.get(projectName)!;
    }
  }
  if (PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.size === 0) {
    // console.log(`The project location cache is empty. Build cache.`.yellow);
    buildProjectLocationCache(tree);
  }
  if (PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.has(projectName)) {
    const path = PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.get(projectName)!;
    const treeAdapter = new TreeAdapter(tree);
    const project = JSON.parse(treeAdapter.read(path)!.toString('utf-8')) as ProjectJson;
    project.root ??= dirname(path).replace(/^\//, '');
    return project;
  }
  console.log(`Not a nx generator tree. Fall back to search file. for project ${projectName}`.yellow);
  for (const fileEntry of SearchFile(tree)) {
    if (!fileEntry.path.endsWith('project.json')) {
      continue;
    }
    const project = JSON.parse(fileEntry.content.toString('utf-8')) as ProjectJson;
    if (project.name === projectName) {
      project.root ??= dirname(fileEntry.path).replace(/^\//, '');
      PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.set(projectName, fileEntry.path);
      return project;
    }
  }
  return null;
}

export function FindProjectByPath<Tree extends TreeLike>(tree: Tree, projectPath: string, recursive = false): ProjectJson | null {
  if (IsGeneratorTreeLike(tree)) {
    const projects = getProjects(tree);
    let currentPath = projectPath;
    do {
      for (const project of projects.values()) {
        if (project.root === currentPath) {
          return project;
        }
      }
      currentPath = join(currentPath, '..');
    } while (currentPath && recursive);
  }
  if (PROJECT_LOCATION_TO_PROJECT_NAME_CACHE.size === 0) {
    // console.log(`The project location cache is empty. Build cache.`.yellow);
    buildProjectLocationCache(tree);
  }
  let currentPath = projectPath;
  let projectName: string | null = null;
  do {
    projectName = PROJECT_LOCATION_TO_PROJECT_NAME_CACHE.get(join(currentPath, 'project.json')) ?? null;
    currentPath = join(currentPath, '..');
  } while (currentPath && !projectName && recursive);
  if (projectName) {
    return FindProject(tree, projectName);
  }
  return null;
}

/**
 * Iterates over projects within a given tree structure, yielding each project's JSON representation.
 * This generator function is designed to handle different sources and caching mechanisms for project data.
 *
 * The function first checks if the tree conforms to a GeneratorTreeLike structure. If true, it retrieves
 * and yields each project from the generator. Next, it checks a global cache list for project locations,
 * reading and yielding each cached project. Finally, it searches the tree for files named 'project.json',
 * parsing and yielding their content as project data, while caching their paths for future reference.
 *
 * @param tree - A tree-like structure that contains project data. Must conform to the TreeLike interface.
 * @yields {ProjectJson} - The JSON representation of a project, enhanced with a 'root' property derived from the project's path.
 *
 * @template Tree - A generic type extending TreeLike, representing the structure containing project data.
 */
export function* ForEachProject<Tree extends TreeLike>(tree: Tree): Generator<ProjectJson> {
  if (IsGeneratorTreeLike(tree)) {
    const projects = getProjects(tree);
    for (const project of projects.values()) {
      yield project;
    }
  }
  if (PROJECT_LOCATION_CACHE_LIST.length > 0) {
    for (const path of PROJECT_LOCATION_CACHE_LIST) {
      const treeAdapter = new TreeAdapter(tree);
      const project = JSON.parse(treeAdapter.read(path)!.toString('utf-8')) as ProjectJson;
      project.root ??= dirname(path).replace(/^\//, '');
      yield project;
    }
  }
  for (const fileEntry of SearchFile(tree)) {
    if (!fileEntry.path.endsWith('project.json')) {
      continue;
    }
    const project = JSON.parse(fileEntry.content.toString('utf-8')) as ProjectJson;
    project.root ??= dirname(fileEntry.path).replace(/^\//, '');
    PROJECT_LOCATION_CACHE_LIST.push(fileEntry.path);
    yield project;
  }
}

/**
 * Retrieves the configuration for a specific project from a given tree structure.
 *
 * This function searches the tree for a project with the specified name. If the project is found,
 * it returns the project's configuration. If the project is not found, it throws an error.
 *
 * @param {Tree} tree - The tree-like structure containing project configurations.
 * @param {string} projectName - The name of the project to retrieve.
 * @returns {ProjectJson} The configuration of the specified project.
 * @throws {Error} Throws an error if the project does not exist in the tree.
 *
 * @template Tree - A generic type that extends TreeLike, representing the structure containing projects.
 */
export function GetProject<Tree extends TreeLike>(tree: Tree, projectName: string): ProjectJson {
  const projectConfiguration: ProjectJson | null = FindProject(tree, projectName);

  if (!projectConfiguration) {
    throw new Error(`The project '${ projectName }' does not exists`);
  }
  projectConfiguration.name ??= projectName;
  return projectConfiguration;
}

export function GetWorkspaceProject<Tree extends TreeLike>(tree: Tree): ProjectJson {
  if (!HasWorkspaceProject(tree)) {
    throw new Error(`The workspace does not have a workspace project located at /project.json`);
  }
  return new TreeAdapter(tree).readJson('project.json');
}

export function GetWorkspaceProjectName<Tree extends TreeLike>(tree: Tree): string {
  if (!HasWorkspaceProject(tree)) {
    throw new Error(`The workspace does not have a workspace project located at /project.json`);
  }
  return new TreeAdapter(tree).readJson<any>('project.json')!.name;
}

/**
 * Determines whether a specified project exists within a given tree-like structure.
 *
 * This function checks if the project with the specified name can be found within the provided tree structure.
 * It utilizes the `FindProject` function to search through the tree. If `FindProject` returns a non-null value,
 * it indicates that the project exists, and thus the function returns `true`. If `FindProject` returns `null`,
 * it signifies that the project does not exist in the tree, and the function returns `false`.
 *
 * @param tree - The tree-like structure to search within. This structure must conform to the `TreeLike` interface.
 * @param projectName - The name of the project to search for within the tree.
 * @returns `true` if the project is found in the tree; otherwise, `false`.
 * @template Tree - The type of the tree structure that extends the `TreeLike` interface.
 */
export function HasProject<Tree extends TreeLike>(tree: Tree, projectName: string): boolean {
  return FindProject(tree, projectName) !== null;
}

export function HasWorkspaceProject<Tree extends TreeLike>(tree: Tree): boolean {
  return tree.exists('project.json');
}

/**
 * Retrieves the prefix associated with a specific project within a given tree structure.
 * If the project does not have a defined prefix, an optional default prefix can be used as a fallback.
 *
 * @param {Tree} tree - The tree-like structure containing the project data.
 * @param {string} projectName - The name of the project for which the prefix is to be retrieved.
 * @param {string} [defaultPrefix] - An optional default prefix to use if the project does not have a prefix defined.
 * @returns {string} The prefix of the project.
 * @throws {Error} Throws an error if the project does not have a prefix and no default prefix is provided.
 *
 * @template Tree - A generic type extending TreeLike, which defines the structure expected for the tree parameter.
 */
export function GetProjectPrefix<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  defaultPrefix?: string,
): string {

  const project = GetProject(tree, projectName);
  let prefix = project.prefix;

  if (!prefix) {
    if (!defaultPrefix) {
      throw new Error(`The project '${ projectName }' does not have a prefix`);
    }
    prefix = defaultPrefix;
  }

  return prefix;

}

/**
 * Retrieves a project configuration as `ProjectJson` by the specified package name from a given tree structure.
 * This function searches for a project within a tree-like structure that matches the given package name.
 * If found, it returns the project's JSON configuration; otherwise, it returns null.
 *
 * The function utilizes a cache to store and retrieve the path of the project configuration file for known package names
 * to optimize subsequent searches. If the package name is not found in the cache, the function iterates over each project
 * in the tree. It filters out projects without a name, not of type 'library', or without a corresponding `package.json`.
 * If a matching project is found during the iteration, its path is cached and returned.
 *
 * ### Type Parameters
 * - `Tree`: A generic type that must conform to `TreeLike`, representing the structure containing the projects.
 *
 * ### Parameters
 * - `tree`: An instance of `Tree`, representing the tree-like structure to search within.
 * - `packageName`: A string representing the name of the package to find the project for.
 *
 * ### Returns
 * - `ProjectJson | null`: Returns the project configuration as `ProjectJson` if found; otherwise, returns null.
 *
 * ### Example Usage
 *
 * const projectConfig = GetProjectByPackageName(myTree, 'my-package-name');
 * if (projectConfig) {
 * console.log('Project found:', projectConfig);
 * } else {
 * console.log('Project not found.');
 * }
 * ```
 */
export function GetProjectByPackageName<Tree extends TreeLike>(tree: Tree, packageName: string): ProjectJson | null {
  if (PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE.has(packageName)) {
    const path = PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE.get(packageName)!;
    const treeAdapter = new TreeAdapter(tree);
    const project = JSON.parse(treeAdapter.read(path)!.toString('utf-8')) as ProjectJson;
    project.root ??= dirname(path).replace(/^\//, '');
    return project;
  }
  for (const project of ForEachProject(tree)) {
    if (!project.name) {
      console.warn('The project does not have a name', project);
      continue;
    }
    if (project.projectType !== 'library') {
      continue;
    }
    if (!HasProjectPackageJson(tree, project.name)) {
      continue;
    }
    const packageJson = GetProjectPackageJson(tree, project.name);
    if (packageJson.name === packageName) {
      PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE.set(packageName, join(project.root, 'project.json'));
      return project;
    }
  }
  return null;
}

/**
 * Retrieves the root path of a specified project within a given tree-like structure.
 *
 * This function searches the tree-like structure for a project by name and returns its root path.
 * If the project does not have a root path defined, it throws an error.
 *
 * @param {Tree} tree - The tree-like structure containing the project data.
 * @param {string} projectName - The name of the project for which the root path is to be retrieved.
 * @returns {string} The root path of the specified project.
 * @throws {Error} Throws an error if the project does not have a root path.
 *
 * @template Tree - A generic type extending TreeLike, which defines the structure expected for the tree parameter.
 */
export function GetProjectRoot(project: { root?: string }): string;
export function GetProjectRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string;
export function GetProjectRoot<Tree extends TreeLike>(treeOrProject: Tree | { root?: string }, projectName?: string): string {

  let root: string | undefined;
  if (IsTreeLike(treeOrProject)) {
    if (!projectName) {
      throw new Error(`Ensure the parameter projectName is defined`);
    }
    const project = GetProject(treeOrProject, projectName);
    root = project.root;
  } else {
    root = treeOrProject.root;
  }

  if (!root) {
    throw new Error(`The project '${ projectName }' does not have a root path`);
  }

  return root;

}

/**
 * Retrieves the type of a specified project within a given tree structure.
 *
 * This function determines whether a project is classified as a 'library' or an 'application'.
 * It throws an error if the project type is undefined or does not match the expected types.
 *
 * @param tree - A tree-like structure containing project data.
 * @param projectName - The name of the project for which the type is to be determined.
 * @returns The type of the project, either 'library' or 'application'.
 * @throws {Error} If the project does not have a type or if the type is not recognized.
 *
 * @template Tree - The generic type parameter that extends TreeLike, representing the structure containing the projects.
 */
export function GetProjectType<Tree extends TreeLike>(tree: Tree, projectName: string): 'library' | 'application' {

  const project = GetProject(tree, projectName);
  const projectType = project.projectType;

  if (!projectType) {
    throw new Error(`The project '${ projectName }' does not have a project type`);
  }

  if (projectType !== 'library' && projectType !== 'application') {
    throw new Error(`The project '${ projectName }' has unknown type '${ projectType }'`);
  }

  return projectType;

}

/**
 * Retrieves the source root path of a specified project within a given tree-like structure.
 *
 * This function searches for a project by its name within a tree structure and returns the source root path associated with it.
 * If the project does not have a source root defined, the function throws an error.
 *
 * @param {Tree} tree - The tree-like structure containing the project data.
 * @param {string} projectName - The name of the project for which the source root path is to be retrieved.
 * @returns {string} The source root path of the specified project.
 * @throws {Error} Throws an error if the project does not have a source root path defined.
 * @template Tree - A generic type that extends TreeLike, representing the structure containing project data.
 */
export function GetProjectSourceRoot(project: { sourceRoot?: string }): string;
export function GetProjectSourceRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string;
export function GetProjectSourceRoot<Tree extends TreeLike>(treeOrProject: Tree | { sourceRoot?: string }, projectName?: string): string {
  let sourceRoot: string | undefined;
  if (IsTreeLike(treeOrProject)) {
    if (!projectName) {
      throw new Error(`Ensure the parameter projectName is defined`);
    }
    const project = GetProject(treeOrProject, projectName);
    sourceRoot = project.sourceRoot;
  } else {
    sourceRoot = treeOrProject.sourceRoot;
  }

  if (!sourceRoot) {
    throw new Error(`The project '${ projectName }' does not have a source root path`);
  }

  return sourceRoot;

}

export function HasProjectSourceRoot<Tree extends TreeLike>(tree: Tree, projectName: string): boolean {
  return HasProject(tree, projectName) && !!GetProject(tree, projectName).sourceRoot;
}

/**
 * Generates a relative path from the project root to the root directory.
 *
 * This function computes the relative path from the root directory of a specified project within a tree-like structure to the root directory of the tree. It utilizes a helper function `GetProjectRoot` to first determine the absolute path of the project's root within the tree.
 *
 * @param tree - A tree-like structure containing the project. The structure must conform to the `TreeLike` interface.
 * @param projectName - The name of the project for which the relative path is to be determined.
 * @returns The relative path from the project's root directory to the tree's root directory as a string.
 * @template Tree - A generic type that extends the `TreeLike` interface, representing the structure of the tree.
 */
export function GetRelativePathToProjectRoot<Tree extends TreeLike>(tree: Tree, projectName: string): string {

  const projectRoot = GetProjectRoot(tree, projectName);

  return relative('/' + projectRoot, '/');

}

/**
 * Retrieves the `package.json` file as a `PackageJson` object for a specified project within a workspace.
 *
 * This function first determines the root directory of the project by using the `GetProjectRoot` function.
 * It then retrieves the `package.json` file located at the project's root directory using the `GetPackageJson` function.
 *
 * @param tree - The file structure/tree that represents the entire workspace.
 * @param projectName - The name of the project for which the `package.json` is to be retrieved.
 * @returns The `PackageJson` object containing the configuration and metadata of the specified project.
 * @template Tree - A generic type that extends `TreeLike`, representing the structure of the workspace.
 */
export function GetProjectPackageJson<Tree extends TreeLike>(tree: Tree, projectName: string): PackageJson {

  const projectRoot = GetProjectRoot(tree, projectName);

  return GetPackageJson(tree, projectRoot);

}

/**
 * Determines if a specified project within a tree-like structure has a `package.json` file.
 *
 * This function checks for the existence of a `package.json` file at the root of a given project.
 * It utilizes the `GetProjectRoot` function to find the root directory of the project within the tree,
 * and then uses `HasPackageJson` to check for the presence of the `package.json` file in that directory.
 *
 * @param {Tree} tree - The tree-like structure containing the project directories and files.
 * @param {string} projectName - The name of the project for which to check the presence of `package.json`.
 * @returns {boolean} Returns `true` if the `package.json` file exists at the project root, otherwise returns `false`.
 * @template Tree - A generic type representing the structure that holds the project directories and files.
 */
export function HasProjectPackageJson<Tree extends TreeLike>(tree: Tree, projectName: string): boolean {
  const projectRoot = GetProjectRoot(tree, projectName);
  return HasPackageJson(tree, projectRoot);
}

/**
 * Determines if the specified project within a tree-like structure matches a given project type.
 *
 * @param tree - The tree-like structure containing project data.
 * @param projectName - The name of the project to check.
 * @param type - The type of the project to match ('library' or 'application').
 * @returns `true` if the project type matches the specified type, otherwise `false`.
 * @typeparam Tree - The generic type extending TreeLike that represents the structure containing the project data.
 *
 * @example
 *
 * const result = IsProjectType(myProjectTree, 'myProject', 'library');
 * console.log(result); // Outputs: true or false based on the project type
 * ```
 */
export function IsProjectType<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  type: 'library' | 'application',
): boolean {
  return GetProjectType(tree, projectName) === type;
}

/**
 * Asserts that a given project within a tree-like structure matches the specified type.
 * Throws an error if the project type does not match the expected type.
 *
 * @param tree - The tree-like structure containing the project data.
 * @param projectName - The name of the project to validate.
 * @param type - The expected type of the project, either 'library' or 'application'.
 * @throws {Error} - Throws an error if the project type does not match the expected type.
 * @template Tree - A generic type extending TreeLike, representing the structure containing project data.
 */
export function AssertProjectType<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
  type: 'library' | 'application',
): void {
  if (!IsProjectType(tree, projectName, type)) {
    throw new Error(`The project '${ projectName }' has not the type '${ type }'.`);
  }
}

/**
 * Retrieves the peer dependencies of a specified project within a given tree structure.
 *
 * This function fetches the `package.json` of the specified project using the `GetProjectPackageJson` function,
 * and then extracts the `peerDependencies` object from it. If the project does not have any peer dependencies,
 * an empty object is returned.
 *
 * @param tree - The tree structure containing the project data, conforming to a `TreeLike` interface.
 * @param projectName - The name of the project for which to retrieve peer dependencies.
 * @returns A record object where each key is a peer dependency name and each value is the version requirement.
 * @template Tree - A generic type extending `TreeLike` that represents the structure of the data tree.
 */
export function GetProjectPeerDependencies<Tree extends TreeLike>(
  tree: Tree,
  projectName: string,
): Record<string, string> {

  const projectPackageJson = GetProjectPackageJson(tree, projectName);

  return projectPackageJson.peerDependencies ?? {};

}

export interface UpdateProjectOptions extends Omit<UpdateJsonFileOptions, 'basePath'> {
  projectName: string;
}

/**
 * Asynchronously updates the configuration of a project within a given tree structure.
 *
 * This function retrieves the current project configuration, applies an update via the provided updater function,
 * and if changes are detected between the original and updated configurations, it overwrites the existing project
 * configuration file in the tree.
 *
 * @param tree - A tree-like structure containing the project files and configurations.
 * @param updater - A function that takes the current project configuration and the tree, and updates the project configuration.
 * This function can perform asynchronous operations and should modify the project configuration directly.
 * @param options - Options that specify which project to update, including the project name.
 * @template Tree - A generic type that extends TreeLike, representing the structure that contains the project configurations.
 *
 * @remarks
 * The function uses a deep clone of the project configuration to detect changes after the updater function is applied.
 * If changes are detected, it serializes the updated project configuration and overwrites the existing configuration file
 * in the specified project's root directory.
 *
 * @example
 *
 * const tree = new FileSystemTree('/path/to/projects');
 * const updater = (config, tree) => {
 * config.settings = { newSetting: 'value' };
 * };
 * const options = { projectName: 'myProject' };
 *
 * await UpdateProjectConfiguration(tree, updater, options);
 * ```
 */
export async function UpdateProjectConfiguration<Tree extends TreeLike>(
  tree: Tree,
  updater: (project: ProjectConfiguration, tree: Tree) => void | PromiseLike<void>,
  options: UpdateProjectOptions,
) {
  const project = GetProject(tree, options.projectName);
  const deepClone = clone(project);

  await updater(project, tree);

  if (!equals(deepClone, project)) {
    const projectRoot = project.root;
    delete (project as any).root;
    const treeAdapter = new TreeAdapter(tree);
    treeAdapter.overwrite(join(projectRoot, 'project.json'), JSON.stringify(project, undefined, 2));
  }
}

export interface UpdateProjectPackageJsonOptions extends Omit<UpdatePackageJsonOptions, 'basePath'> {
  projectName: string;
}

/**
 * Updates the `package.json` file of a specific project within a workspace.
 *
 * This function retrieves the root directory of the specified project, then applies an update function to the `package.json` file located at that root. The update is performed by passing the `package.json` content to the provided `updater` function, which can modify the contents synchronously or asynchronously.
 *
 * @param tree - An abstraction representing the file structure, typically used in workspace tools like Angular CLI or Nx.
 * @param updater - A function that takes the `package.json` object as an argument and modifies it. This function can return void or a Promise that resolves to void, supporting both synchronous and asynchronous operations.
 * @param options - Configuration options for updating the `package.json`, including the name of the project to target.
 * @returns A Promise that resolves when the `package.json` update is completed, reflecting any asynchronous operations within the `updater` function.
 *
 * @template Tree - A generic type that extends `TreeLike`, representing the structure of the file system or project workspace.
 *
 * @example
 *
 * UpdateProjectPackageJson(tree, (packageJson) => {
 * packageJson.version = '2.0.0';
 * }, { projectName: 'my-app' });
 * ```
 */
export function UpdateProjectPackageJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (packageJson: PackageJson) => void | PromiseLike<void>,
  options: UpdateProjectPackageJsonOptions,
) {
  const projectRoot = GetProjectRoot(tree, options.projectName);

  return UpdatePackageJson(tree, updater, {
    ...options,
    basePath: projectRoot,
  });

}
