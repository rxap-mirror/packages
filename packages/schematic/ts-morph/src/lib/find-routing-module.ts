import { join } from 'path';
import { Tree } from '@angular-devkit/schematics';

export function FindRoutingModule(tree: Tree, basePath: string): string {
  const baseDir = tree.getDir(basePath);
  for (const file of baseDir.subfiles) {
    const filePath = join(basePath, file);
    if (tree.read(filePath)?.toString('utf-8').match(/routes:\s?Routes/i)) {
      return filePath;
    }
  }
  throw new Error('Could not find the routing module');
}
