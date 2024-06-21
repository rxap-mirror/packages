import {
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { Assets } from '@rxap/workspace-utilities';
import { join } from 'path';

export interface NgPackageJson {
  assets?: Assets;
  allowedNonPeerDependencies?: string[];
}

/**
 * Reads and parses the `ng-package.json` file from a specified project within a workspace tree.
 *
 * This function is designed to retrieve the configuration details specific to Angular libraries
 * from the `ng-package.json` file located in the project's root directory. It ensures that the
 * file exists before attempting to read it, throwing an error if the file is not found.
 *
 * @param {Tree} tree - The abstract representation of the file system within a workspace.
 * @param {ProjectConfiguration} project - The configuration object for the specific project.
 * @returns {NgPackageJson} The parsed JSON object from the `ng-package.json` file.
 * @throws {Error} Throws an error if the `ng-package.json` file does not exist in the project's root directory.
 */
export function ReadNgPackageJson(tree: Tree, project: ProjectConfiguration): NgPackageJson {
  if (!tree.exists(join(project.root, 'ng-package.json'))) {
    throw new Error(`The project ${ project.name } has no ng-package.json file.`);
  }
  return readJson(tree, join(project.root, 'ng-package.json'));
}

/**
 * Writes the Angular package configuration file (`ng-package.json`) to the specified project directory.
 *
 * @param tree - The abstract representation of the file tree used for performing file operations.
 * @param project - The configuration object containing details about the project, including the root directory.
 * @param ngPackageJson - The JSON object representing the contents to be written to the `ng-package.json` file.
 */
export function WriteNgPackageJson(tree: Tree, project: ProjectConfiguration, ngPackageJson: NgPackageJson) {
  writeJson(tree, join(project.root, 'ng-package.json'), ngPackageJson);
}
