import { Tree } from '@angular-devkit/schematics';

export function CoerceFile(tree: Tree, filePath: string, content: string | Buffer): void {
  if (tree.exists(filePath)) {
    tree.overwrite(filePath, content);
  } else {
    tree.create(filePath, content);
  }
}
