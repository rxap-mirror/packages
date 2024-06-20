import { GetRootPackageJson } from './package-json-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';


/**
 * Extracts and returns the workspace name from a given tree structure.
 *
 * This function first adapts the provided tree structure to a more manageable format using `TreeAdapter`.
 * It then retrieves the root package.json file from the adapted tree. The `name` field from this package.json
 * is extracted and analyzed to determine the workspace name based on specific naming conventions.
 *
 * If the `name` field contains a scoped package name (e.g., "@scope/project"), the function will further
 * parse this to extract meaningful parts. For scoped names ending with "/source", it returns the scope
 * as the workspace name. Otherwise, it returns the project part of the scoped name.
 *
 * If the name does not follow the scoped pattern, it returns the `name` as is.
 *
 * @param {TreeLike} tree - The tree structure representing files and directories, typically of a project.
 * @returns {string} The determined workspace name based on the root package.json's `name` field.
 */
export function GetWorkspaceName(tree: TreeLike): string {
  const treeAdapter = new TreeAdapter(tree);
  const rootPackageJson = GetRootPackageJson(treeAdapter);
  const name = rootPackageJson.name!;
  const match = name?.match(/@([^/]+)\/(.+)$/);
  if (match) {
    if (match[2] === 'source') {
      return match[1];
    }
    return match[2];
  }
  return name;
}
