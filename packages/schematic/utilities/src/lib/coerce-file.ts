import { Tree } from '@angular-devkit/schematics';

export function CoerceFile(tree: Tree, filePath: string, content: string | Buffer, overwrite = true): string {
  if (tree.exists(filePath)) {
    if (overwrite) {
      tree.overwrite(filePath, content);
    }
  } else {
    tree.create(filePath, content);
  }
  return tree.read(filePath)!.toString('utf-8');
}
