import { GetRootPackageJson } from './package-json-file';
import { TreeLike } from './tree';
import { parse } from 'semver';

/**
 * Retrieves the major version number of Angular from a project's root package.json file.
 *
 * This function searches for the Angular core version listed under dependencies or the Angular CLI version under
 * devDependencies in the root package.json of the provided tree-like structure. It parses the version number to
 * extract and return the major version component.
 *
 * @param {TreeLike} [tree] - An optional parameter representing the tree-like structure of the project files,
 * typically used in schematic or workspace utilities.
 * @returns {number} The major version number of Angular.
 * @throws {Error} Throws an error if neither '@angular/core' nor '@angular/cli' are found in the dependencies
 * or devDependencies of the root package.json, or if the version number cannot be parsed.
 */
export function GetMajorAngularVersion(tree?: TreeLike): number {
  const rootPackageJson = GetRootPackageJson(tree);

  let targetVersion = rootPackageJson.dependencies?.['@angular/core'] ??
                      rootPackageJson.devDependencies?.['@angular/cli'];

  if (!targetVersion) {
    throw new Error(`The package @angular/core and @angular/cli are not installed in the root package.json`);
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ targetVersion }`);
  }

  return version.major;
}

/**
 * Retrieves the major version number of the `@angular-devkit/schematics` package from the project's root `package.json`.
 *
 * This function examines the `devDependencies` section of the root `package.json` file for the `@angular-devkit/schematics` package
 * and extracts its major version number. It throws an error if the package is not found or the version number cannot be parsed.
 *
 * @param {TreeLike} [tree] - An optional parameter representing the file structure, used to locate the `package.json`.
 * @returns {number} The major version number of the `@angular-devkit/schematics` package.
 * @throws {Error} Throws an error if the `@angular-devkit/schematics` package is not found in `devDependencies`.
 * @throws {Error} Throws an error if the version number cannot be parsed.
 */
export function GetMajorAngularSchematicDevkitVersion(tree?: TreeLike): number {
  const rootPackageJson = GetRootPackageJson(tree);

  let targetVersion = rootPackageJson.devDependencies?.['@angular-devkit/schematics'];

  if (!targetVersion) {
    throw new Error(`The package @angular-devkit/schematics is not installed in the root package.json`);
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ targetVersion }`);
  }

  return version.major;
}
