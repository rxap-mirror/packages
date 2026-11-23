import { TreeLike } from './tree';
import { VisitTree } from './visit-tree';

/**
 * Determines if a given project tree contains any TypeScript directive files (files ending with `.directive.ts`).
 *
 * The traversal stops as soon as a directive file is found.
 *
 * @param {TreeLike} tree - The tree-like structure of the project to be searched.
 * @param {string} projectRoot - The root directory of the project from which the search begins.
 * @returns {boolean} - Returns `true` if at least one TypeScript directive file is found, otherwise `false`.
 */
export function HasDirectives(tree: TreeLike, projectRoot: string) {
  for (const {
    path,
    isFile
  } of VisitTree(tree, projectRoot)) {
    if (isFile && path.endsWith('.directive.ts')) {
      return true;
    }
  }
  return false;
}
