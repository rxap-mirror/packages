import { Tree } from '@nx/devkit';
import {
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function updateTsConfig(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  for (const infix of [ 'lib', 'spec' ]) {
    UpdateTsConfigJson(tree, tsConfig => {
      tsConfig.compilerOptions ??= {};
      tsConfig.compilerOptions.types ??= [];
      if (!tsConfig.compilerOptions.types.includes('@angular/localize')) {
        tsConfig.compilerOptions.types.push('@angular/localize');
      }
    }, {
      basePath: projectRoot,
      infix,
    });
  }

}
