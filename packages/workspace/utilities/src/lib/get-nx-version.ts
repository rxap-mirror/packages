import { parse } from 'semver';
import { GetRootPackageJson } from './package-json-file';
import {
  IsJsonObject,
  TreeLike,
} from './tree';
import 'colors';

/**
 * Retrieves the version of Nx specified in the `devDependencies` of the root `package.json`.
 *
 * This function searches for the Nx version by accessing the `devDependencies` section of the root `package.json` file.
 * It throws an error if the `devDependencies` property is missing, is not a valid JSON object, or does not contain the `nx` property.
 *
 * @param {TreeLike} [tree] - An optional parameter representing the file structure, used to locate the `package.json`.
 * @returns {string} The version of Nx as specified in the `devDependencies` of the root `package.json`.
 * @throws {Error} Throws an error if the `devDependencies` property is missing in the root `package.json`.
 * @throws {Error} Throws an error if the `devDependencies` property is not a valid JSON object.
 * @throws {Error} Throws an error if the `nx` property is missing from `devDependencies`.
 */
export function GetNxVersion(tree?: TreeLike) {
  const rootPackageJson = GetRootPackageJson(tree);

  if (!rootPackageJson['devDependencies']) {
    throw new Error('The root package.json file does not contain a devDependencies property');
  }

  if (!IsJsonObject(rootPackageJson['devDependencies'])) {
    throw new Error('The root package.json file devDependencies property is not a valid JSON object');
  }

  const devDependencies = rootPackageJson['devDependencies'] as Record<string, string>;

  if (!devDependencies['nx']) {
    console.log('The root package.json file does not contain a devDependencies "nx"'.red);
    return 'latest';
  }

  return devDependencies['nx'];

}

/**
 * Retrieves the major version number of Nx from the project's configuration.
 *
 * This function extracts the Nx version from the project's configuration file using the `GetNxVersion` function.
 * It then cleans the version string by removing any leading tilde (~) or caret (^) characters, which are typically
 * used in package.json files to indicate version ranges. After cleaning, it attempts to parse the version string
 * into a semantic versioning format.
 *
 * @param {TreeLike} [tree] - An optional parameter representing the project's file structure, used to locate and read the configuration file.
 * @returns {number} The major version number of Nx.
 * @throws {Error} Throws an error if the version string cannot be parsed into a valid semantic version.
 */
export function GetMajorNxVersion(tree?: TreeLike) {
  let nxVersion = GetNxVersion(tree);
  nxVersion = nxVersion.replace(/^[~^]/, '');
  const version = parse(nxVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ nxVersion }`);
  }
  return version.major;
}
