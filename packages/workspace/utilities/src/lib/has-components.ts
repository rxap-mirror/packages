import { TreeLike } from './tree';
import { VisitTree } from './visit-tree';

/**
 * Determines if a given project tree contains any TypeScript component files.
 *
 * This function traverses a tree-like structure representing a project's files and directories,
 * starting from a specified root directory. It checks each file to see if it is a TypeScript
 * component file (files ending with `.component.ts`). The traversal stops as soon as a component
 * file is found.
 *
 * @param {TreeLike} tree - The tree-like structure of the project to be searched.
 * @param {string} projectRoot - The root directory of the project from which the search begins.
 * @returns {boolean} - Returns `true` if at least one TypeScript component file is found, otherwise `false`.
 */
export function HasComponents(tree: TreeLike, projectRoot: string) {
  for (const {
    path,
    isFile
  } of VisitTree(tree, projectRoot)) {
    if (isFile && path.endsWith('.component.ts')) {
      return true;
    }
  }
  return false;
}

