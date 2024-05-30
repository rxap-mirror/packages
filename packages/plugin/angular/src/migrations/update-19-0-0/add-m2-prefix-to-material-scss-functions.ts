import { Tree } from '@nx/devkit';
import { join } from 'path';
import { migrateM2ThemingApiUsages } from './migration';

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
export function* VisitTree(tree: Tree, dir: string, ignoreFolders = ['node_modules', '.nx', 'dist', '.angular', 'tmp', 'coverage', /^\..+/]): Generator<VisitTreeItem, void, void> {
  const treeAdapter = tree;
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

export default async function (tree: Tree) {

  const potentialThemes: Array<{ path: string, content: string }> = [];

  for (const {
    path,
    isFile
  } of VisitTree(tree, '/')) {
    if (isFile && path.endsWith('.scss')) {
      const content = tree.read(path)!.toString('utf-8');
      if (content.includes('@angular/material')) {
        potentialThemes.push({
          path,
          content,
        });
      }
    }
  }

  for (const theme of potentialThemes) {
    const migrated = migrateM2ThemingApiUsages(theme.content);

    if (migrated !== theme.content) {
      tree.write(theme.path, migrated);
    }
  }

}
