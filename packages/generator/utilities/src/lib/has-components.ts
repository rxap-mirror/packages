import { Tree } from '@nx/devkit';
import { VisitTree } from './visit-tree';

export function HasComponents(tree: Tree, projectRoot: string) {
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

