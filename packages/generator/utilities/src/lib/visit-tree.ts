import { Tree } from '@nx/devkit';
import { join } from 'path';

export type VisitTreeItem = { path: string, isFile: boolean };

/**
 * Visit all files in a tree.
 *
 * usage example:
 *
 * for (const {path, isFile} of VisitTree(tree, projectRoot)) {
 *   if (isFile && path.endsWith('.component.ts')) {
 *      return true;
 *   }
 * }
 *
 * @param tree nx Tree instance
 * @param dir directory to start the visits default to the root of the tree
 */
export function* VisitTree(tree: Tree, dir: string = tree.root): Generator<VisitTreeItem, void, void> {
  for (const name of tree.children(dir)) {
    const path = join(dir, name);
    if (tree.isFile(path)) {
      yield {
        path,
        isFile: true,
      };
    } else {
      yield* VisitTree(tree, path);
    }
  }
}
