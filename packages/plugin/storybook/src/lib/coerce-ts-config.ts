import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ForEachSecondaryEntryPoint,
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { InitLibraryGeneratorSchema } from '../generators/init-library/schema';

export function coerceTsConfig(tree: Tree, projectName: string, options: InitLibraryGeneratorSchema) {

  const projectRoot = GetProjectRoot(tree, projectName);
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.include ??= [];
    tsConfig.compilerOptions ??= {};
    if (options.compodoc) {
      tsConfig.compilerOptions.resolveJsonModule = true;
      tsConfig.compilerOptions.allowSyntheticDefaultImports = true;
    }
    tsConfig.compilerOptions.types ??= [];
    if (options.compodoc) {
      CoerceArrayItems(tsConfig.include, [ '../src/**/*.component.ts' ]);
    }
    for (const path of ForEachSecondaryEntryPoint(tree, projectRoot)) {
      const folder = dirname(path);
      const entryPoint = relative(projectRoot, folder);
      CoerceArrayItems(tsConfig.include, [ `../${ entryPoint }/**/*.stories.ts` ]);
      if (options.compodoc) {
        CoerceArrayItems(tsConfig.include, [ `../${ entryPoint }/**/*.component.ts` ]);
      }
    }
    CoerceArrayItems(tsConfig.compilerOptions.types, [ '@angular/localize' ]);
  }, {
    basePath: join(projectRoot, '.storybook'),
  });

}
