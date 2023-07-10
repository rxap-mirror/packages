import {Tree} from '@nx/devkit';

export function CoerceFile(tree: Tree, filePath: string, content = '', overwrite = false): string {
  if (tree.exists(filePath)) {
    if (overwrite) {
      tree.write(filePath, content);
    }
    const buffer = tree.read(filePath);
    if (!buffer) {
      throw new Error(`Can't read file: ${filePath}`);
    }
    return buffer.toString('utf-8');
  }
  tree.write(filePath, content);
  return content;
}
