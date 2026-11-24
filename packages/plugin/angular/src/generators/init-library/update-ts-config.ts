import { Tree } from '@nx/devkit';
import { join } from 'path';
import {
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function updateTsConfig(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  for (const infix of [ 'lib', 'spec' ]) {
    // a library generated without unit tests has no tsconfig.spec.json
    if (!tree.exists(join(projectRoot, `tsconfig.${ infix }.json`))) {
      continue;
    }
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
