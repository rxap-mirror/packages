import {
  DirEntry,
  Tree,
} from '@angular-devkit/schematics';

export function DeleteDirectory(tree: Tree, dir: DirEntry) {

  for (const subdir of dir.subdirs) {
    DeleteDirectory(tree, dir.dir(subdir));
  }

  for (const file of dir.subfiles) {
    tree.delete(dir.file(file)!.path);
  }

}
