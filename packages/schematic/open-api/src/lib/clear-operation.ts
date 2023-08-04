import { Rule } from '@angular-devkit/schematics';
import { DeleteDirectory } from '@rxap/schematics-utilities';
import { join } from 'path';

export function ClearOperation(
  pathList: string[],
  basePath = '',
): Rule {
  return tree => {
    console.debug(`clear operation for base path '${ basePath }' with pathList '${ pathList }'`);
    for (const path of pathList) {
      const fullPath = join(basePath, path);
      DeleteDirectory(tree, tree.getDir(fullPath));
    }
  };
}
