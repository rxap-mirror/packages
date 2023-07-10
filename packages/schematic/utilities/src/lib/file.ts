import {
  DirEntry,
  Tree,
} from '@angular-devkit/schematics';
import { join } from 'path';

export function DeleteRecursive(tree: Tree, dir: DirEntry) {

  for (const subDir of dir.subdirs) {
    DeleteRecursive(tree, dir.dir(subDir));
  }

  for (const subFile of dir.subfiles) {
    tree.delete(join(dir.path, subFile));
  }

}
