import { join } from 'path';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

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
 * @param ignoreFolders folders to ignore
 */
export function* VisitTree(tree: TreeLike, dir = '', ignoreFolders = ['node_modules', '.nx', 'dist', '.angular', 'tmp', 'coverage', /^\..+/]): Generator<VisitTreeItem, void, void> {
  if (dir.startsWith('/')) {
    dir = dir.slice(1);
  }
  const treeAdapter = new TreeAdapter(tree);
  for (const name of treeAdapter.children(dir)) {
    const path = join(dir, name);
    if (treeAdapter.isFile(path)) {
      yield {
        path,
        isFile: true,
      };
    } else {
      if (ignoreFolders.some((ignore) => typeof ignore === 'string' ? name === ignore : ignore.test(name))) {
        continue;
      }
      yield* VisitTree(tree, path);
    }
  }
}
