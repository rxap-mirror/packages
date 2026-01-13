import {
  IsGeneratorTreeLike,
  TreeLike,
} from './tree';

/**
 * Retrieves the root directory of the workspace.
 *
 * @param {TreeLike} [tree] - An optional object representing the tree structure of the workspace. If provided and determined to be a generator-like tree, its root property will be returned.
 * @return {string} The root directory of the workspace. If a valid `tree` is provided, its `root` property will be returned. Otherwise, the current working directory of the process will be returned.
 */
export function getWorkspaceRoot(tree?: TreeLike) {

  if (tree) {
    if (IsGeneratorTreeLike(tree)) {
      return tree.root;
    }
  }

  return process.cwd();

}