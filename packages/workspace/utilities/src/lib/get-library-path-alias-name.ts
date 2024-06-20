import {
  GetProjectPackageJson,
  HasProjectPackageJson,
} from '@rxap/workspace-utilities';
import { TreeLike } from './tree';

/**
 * Retrieves the alias name for a library path based on the project's `package.json` name field if available.
 * If the `name` field is not specified in `package.json`, the project name is used as the alias.
 *
 * @param {TreeLike} tree - The tree structure representing the file system or project structure.
 * @param {string} projectName - The name of the project for which to retrieve the path alias.
 * @returns {string} The alias name for the library path, derived either from the `package.json` name field or the provided project name.
 */
export function GetLibraryPathAliasName(tree: TreeLike, projectName: string) {

  let pathName = projectName;

  if (HasProjectPackageJson(tree, projectName)) {
    const packageJson = GetProjectPackageJson(tree, projectName);
    if (packageJson.name) {
      pathName = packageJson.name;
    }
  }

  return pathName;

}
