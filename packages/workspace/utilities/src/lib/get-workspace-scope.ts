import { GetRootPackageJson } from './package-json-file';
import { TreeLike } from './tree';

/**
 * Retrieves the workspace scope from the root package.json file.
 *
 * This function extracts the 'name' property from the root package.json and determines the scope of the workspace.
 * If the 'name' property starts with '@', it is assumed to be a scoped package name, and the function returns the scope.
 * If the 'name' does not start with '@', the function prepends '@' to the name and returns it as the scope.
 *
 * @param {TreeLike} [tree] - Optional parameter that represents the project's file structure, used to locate the root package.json.
 * @returns {string} The workspace scope derived from the 'name' property in the root package.json.
 * @throws {Error} Throws an error if the 'name' property is not found or is not a string in the root package.json.
 */
export function GetWorkspaceScope(tree?: TreeLike) {
  const rootPackageJson = GetRootPackageJson(tree);

  const name = rootPackageJson['name'];

  if (typeof name !== 'string') {
    throw new Error('The root package.json file does not contain a name property');
  }

  if (name.startsWith('@')) {
    return name.split('/')[0];
  }

  return `@${ name }`;

}
