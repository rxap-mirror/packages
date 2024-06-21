import { ProjectConfiguration } from '@nx/devkit';
import { join } from 'path';
import { CoerceFile } from './coerce-file';
import { GetProject } from './get-project';
import { PackageJson } from './package-json';
import { GetPackageJson } from './package-json-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export interface PackageJsonWithGenerators extends PackageJson {
  generators: string;
}

/**
 * Checks if the provided `packageJson` object has a `generators` or `schematics` property.
 *
 * This function is a type guard that determines whether the passed `packageJson` object conforms to the `PackageJsonWithGenerators` interface, which includes optional `generators` or `schematics` properties.
 *
 * @param {PackageJson} packageJson - The `packageJson` object to check for generator properties.
 * @returns {boolean} - `true` if `packageJson` contains the `generators` or `schematics` properties, otherwise `false`.
 * @example
 * const myPackageJson = { name: "example", version: "1.0.0", generators: "./generators" };
 * if (HasGeneratorProperty(myPackageJson)) {
 * console.log("Package includes generators or schematics.");
 * } else {
 * console.log("No generators or schematics found.");
 * }
 */
export function HasGeneratorProperty(packageJson: PackageJson): packageJson is PackageJsonWithGenerators {
  return !!packageJson['generators'] || !!packageJson['schematics'];
}

/**
 * Retrieves the file path for the generators or schematics configuration from a given project's package.json.
 *
 * This function constructs the path to the generators or schematics configuration file based on the project root and the relevant property in package.json.
 * It checks for the existence of either a 'generators' or 'schematics' property in the package.json object. If neither property is present, it throws an error.
 *
 * @param {string} projectRoot - The root directory of the project.
 * @param {PackageJsonWithGenerators} packageJson - An object representing the package.json file which should include either a 'generators' or 'schematics' property.
 * @returns {string} The full path to the generators or schematics configuration file.
 * @throws {Error} If neither 'generators' nor 'schematics' properties are found in the packageJson object.
 */
export function GetGeneratorFilePath(projectRoot: string, packageJson: PackageJsonWithGenerators): string {

  if (!packageJson['generators'] && !packageJson['schematics']) {
    throw new Error(`The package.json of the project ${ projectRoot } does not contains a generators property!`);
  }

  return join(projectRoot, packageJson['generators'] ?? packageJson['schematics']);

}

/**
 * Checks if the generator file specified in the package.json exists in the given project tree.
 *
 * @param tree - The file structure representation where files and directories can be queried.
 * @param projectRoot - The root directory of the project as a string.
 * @param packageJson - An object representing the package.json file which includes a property for generators.
 * @returns `true` if the generator file exists in the tree, `false` otherwise.
 */
export function ExistsGeneratorFile(tree: TreeLike, projectRoot: string, packageJson: PackageJsonWithGenerators): boolean {
  return tree.exists(GetGeneratorFilePath(projectRoot, packageJson));
}

export interface GeneratorFile {
  generators: Record<string, { factory: string, schema: string, description: string }>;
  schematics?: Record<string, { factory: string, schema: string, description: string }>;
}

/**
 * Retrieves and parses the generator configuration file from a given project.
 *
 * This function is designed to fetch the generator configuration file specified in the `packageJson` from the project's root directory.
 * It uses a `TreeLike` interface to interact with the file system, allowing for abstraction over different file system implementations.
 *
 * @param {TreeLike} tree - An abstraction over the file system to read files.
 * @param {string} projectRoot - The root directory of the project where the generator file is located.
 * @param {PackageJsonWithGenerators} packageJson - An object containing the path to the generator file within the project.
 * @returns {GeneratorFile} The parsed generator file as a JSON object.
 * @throws {Error} Throws an error if the generator file does not exist or if it is not a valid JSON.
 *
 * The function first constructs a path to the generator file using the `projectRoot` and the path specified in `packageJson`.
 * It then attempts to read and parse the file. If the file cannot be read (i.e., it does not exist or is not accessible),
 * an error is thrown indicating that the file does not exist. If the file content is not valid JSON, an error is thrown specifying
 * that the file is not valid JSON along with the underlying JSON parsing error message.
 */
export function GetGeneratorFile(
  tree: TreeLike,
  projectRoot: string,
  packageJson: PackageJsonWithGenerators,
): GeneratorFile {
  const treeAdapter = new TreeAdapter(tree);
  const generatorFile = GetGeneratorFilePath(projectRoot, packageJson);

  const content = treeAdapter.read(generatorFile)?.toString('utf-8');

  if (!content) {
    throw new Error(`The generator file ${ generatorFile } does not exists!`);
  }
  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`The generator file ${ generatorFile } is not valid json!: ${ e.message }`);
  }

}

/**
 * Resolves the project root directory from a given input which can either be a direct root path, a project name, or a project configuration object.
 *
 * @param {TreeLike} tree - The tree structure representing the workspace or project files.
 * @param {string | ProjectConfiguration} projectRootOrNameOrConfiguration - The input which can either be a project root path, a project name, or a project configuration object.
 * @returns {string} The resolved project root path.
 * @throws {Error} Throws an error if the project name is provided but does not exist in the tree.
 *
 * ## Usage
 * - If a string is provided and it matches a path pattern, it is returned directly.
 * - If a string is provided and it does not match a path pattern, it is assumed to be a project name, and the function attempts to retrieve the corresponding project configuration from the tree to get the root path.
 * - If a `ProjectConfiguration` object is provided, the root path is extracted directly from the `root` property of the object.
 */
export function ProjectRootOrNameOrConfigurationToProjectRoot(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
): string {
  if (typeof projectRootOrNameOrConfiguration === 'string') {
    if (projectRootOrNameOrConfiguration.match(/^\/?([^/]+\/)+[^/]+/)) {
      return projectRootOrNameOrConfiguration;
    } else {
      const project = GetProject(tree, projectRootOrNameOrConfiguration);
      if (project) {
        return project.root;
      } else {
        throw new Error(`The project ${ projectRootOrNameOrConfiguration } does not exists!`);
      }
    }
  } else {
    return projectRootOrNameOrConfiguration.root;
  }
}

/**
 * Retrieves the generator file from a specified project within a tree-like structure.
 *
 * This function first resolves the project root from the given `projectRootOrNameOrConfiguration` parameter,
 * which can either be a direct root path, a project name, or a project configuration object. It then fetches
 * the `package.json` file located at the resolved project root. If the `package.json` does not contain a
 * `generators` property, an error is thrown indicating the absence of this property. Additionally, if the
 * generator file specified in the `package.json` does not exist in the tree, an error is thrown.
 *
 * @param {TreeLike} tree - The tree-like structure containing the project files.
 * @param {string | ProjectConfiguration} projectRootOrNameOrConfiguration - The project root directory,
 * project name, or project configuration object used to locate the project within the tree.
 * @returns {GeneratorFile} The generator file as specified in the project's `package.json`.
 * @throws {Error} If the `package.json` does not include a `generators` property or if the specified
 * generator file does not exist.
 */
export function GetGenerators(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
): GeneratorFile {

  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    throw new Error(`The project ${ projectRoot } does not contains a generators property!`);
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    throw new Error(`The generator file ${ GetGeneratorFilePath(projectRoot, packageJson) } does not exists!`);
  }

  return GetGeneratorFile(tree, projectRoot, packageJson);
}

/**
 * Updates the generator configuration file for a specified project within a workspace tree structure.
 *
 * This function first resolves the project root directory from the provided project identifier or configuration.
 * It then retrieves the `package.json` file from the resolved project root. If the `package.json` does not have a
 * `generators` property, or if the generator file specified in `package.json` does not exist, the function will throw an error.
 *
 * If the generator file exists, the function applies the provided `update` function to modify the generator configurations.
 * The modifications are then written back to the generator file, ensuring the file content is properly formatted as JSON.
 *
 * @param {TreeLike} tree - The workspace tree structure containing all project files and configurations.
 * @param {string | ProjectConfiguration} projectRootOrNameOrConfiguration - The project root directory, name, or configuration object.
 * @param {(generators: GeneratorFile) => GeneratorFile} update - A function that takes the current generator file configuration and returns the updated configuration.
 * @throws {Error} Throws an error if the `package.json` does not contain a `generators` property or if the generator file does not exist.
 */
export function UpdateGenerators(
  tree: TreeLike,
  projectRootOrNameOrConfiguration: string | ProjectConfiguration,
  update: (generators: GeneratorFile) => GeneratorFile,
) {
  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    throw new Error(`The project ${ projectRoot } does not contains a generators property!`);
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    throw new Error(`The generator file ${ GetGeneratorFilePath(projectRoot, packageJson) } does not exists!`);
  }

  const generators = GetGeneratorFile(tree, projectRoot, packageJson);

  CoerceFile(tree, GetGeneratorFilePath(projectRoot, packageJson), JSON.stringify(update(generators), null, 2) + '\n', true);

}

/**
 * Determines if a project has configured generators.
 *
 * This function checks if a given project, identified by its root directory, name, or configuration,
 * has any generators configured and properly set up in its package.json and corresponding generator files.
 *
 * @param {TreeLike} tree - The file tree representation of the project.
 * @param {string | ProjectConfiguration} projectRootOrNameOrConfiguration - The project root directory, name, or configuration object.
 * @returns {boolean} Returns `true` if the project has at least one configured generator, otherwise returns `false`.
 */
export function HasGenerators(tree: TreeLike, projectRootOrNameOrConfiguration: string | ProjectConfiguration) {

  const projectRoot = ProjectRootOrNameOrConfigurationToProjectRoot(tree, projectRootOrNameOrConfiguration);

  const packageJson = GetPackageJson(tree, projectRoot);

  if (!HasGeneratorProperty(packageJson)) {
    return false;
  }

  if (!ExistsGeneratorFile(tree, projectRoot, packageJson)) {
    return false;
  }

  const { generators = {} } = GetGeneratorFile(tree, projectRoot, packageJson);

  if (!Object.keys(generators).length) {
    return false;
  }

  return true;

}

export function HasGenerator(tree: TreeLike, projectRootOrNameOrConfiguration: string | ProjectConfiguration, generatorName: string) {

  if (!HasGenerators(tree, projectRootOrNameOrConfiguration)) {
    return false;
  }

  const generators = GetGenerators(tree, projectRootOrNameOrConfiguration);

  return (!!generators.generators?.[generatorName] || !!generators.schematics?.[generatorName]);

}
