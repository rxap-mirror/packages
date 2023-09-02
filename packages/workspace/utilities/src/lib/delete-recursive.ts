import { join } from 'path';
import {
  DirEntryLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  TreeLike,
} from './tree';

export function DeleteRecursive(tree: TreeLike, path: string | DirEntryLike) {

  if (IsSchematicTreeLike(tree)) {
    const dir = typeof path === 'string' ? tree.getDir(path) : path;
    for (const subDir of dir.subdirs) {
      DeleteRecursive(tree, dir.dir(subDir));
    }

    for (const subFile of dir.subfiles) {
      tree.delete(join(dir.path, subFile));
    }
  } else if (IsGeneratorTreeLike(tree)) {
    if (typeof path !== 'string') {
      throw new Error('GeneratorTreeLike requires path to be a string');
    }
    for (const sub of tree.children(path)) {
      if (tree.isFile(join(path, sub))) {
        tree.delete(join(path, sub));
      } else {
        DeleteRecursive(tree, join(path, sub));
      }
    }
  } else {
    throw new Error('Unknown tree type');
  }

}
