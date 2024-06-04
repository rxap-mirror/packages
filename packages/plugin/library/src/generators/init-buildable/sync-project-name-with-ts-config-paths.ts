import { Tree } from '@nx/devkit';
import {
  GetLibraryPathAliasName,
  GetProjectSourceRoot,
  UpdateTsConfigPaths,
} from '@rxap/workspace-utilities';

export function syncProjectNameWithTsConfigPaths(tree: Tree, projectName: string) {

  UpdateTsConfigPaths(tree, paths => {
    if (paths[projectName]) {
      delete paths[projectName];
    }
    paths[GetLibraryPathAliasName(tree, projectName)] = [
      `${GetProjectSourceRoot(tree, projectName)}/index.ts`,
    ];
  }, { infix: 'base' });


}
