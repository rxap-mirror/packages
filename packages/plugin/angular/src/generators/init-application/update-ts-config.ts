import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function updateTsConfig(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);
  for (const tsConfigName of [ 'app', 'editor', 'spec' ]) {
    UpdateTsConfigJson(tree, tsConfig => {
      tsConfig.compilerOptions ??= {};
      tsConfig.compilerOptions.types ??= [];
      if (!tsConfig.compilerOptions.types.includes('@angular/localize')) {
        tsConfig.compilerOptions.types.push('@angular/localize');
      }
      if ([ 'app', 'spec' ].includes(tsConfigName)) {
        tsConfig.exclude ??= [];
        CoerceArrayItems(tsConfig.exclude, [
          'src/**/*.stories.ts',
          'src/**/*.cy.ts',
        ]);
      }
    }, {
      infix: tsConfigName,
      basePath: projectRoot,
    });
  }

}
