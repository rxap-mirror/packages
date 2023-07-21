import { Rule } from '@angular-devkit/schematics';
import { classify } from '@rxap/schematics-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import {
  TsMorphNestProjectTransformOptions,
  TsMorphNestProjectTransformRule,
} from '../ts-morph-transform';
import { AddNestModuleImport } from './add-nest-module-import';

export interface AddNestModuleToAppModuleOptions extends TsMorphNestProjectTransformOptions {
  name: string;
  appModulePath?: string;
}

const DEFAULT_APP_MODULE_PATH = '/app/app.module.ts';

export function AddNestModuleToAppModule(options: AddNestModuleToAppModuleOptions): Rule {
  const { project, feature, shared, name, directory } = options;
  let { appModulePath } = options;
  appModulePath ??= DEFAULT_APP_MODULE_PATH;
  return TsMorphNestProjectTransformRule(
    {
      project,
      feature,
      shared,
    },
    (project, [ sourceFile ]) => {

      const cleanAppModulePath = dirname(appModulePath!.replace(/^\//, ''));
      const modulePath = join(directory ?? '', name + '.module');
      const relativePath = relative(cleanAppModulePath, modulePath);

      AddNestModuleImport(sourceFile, classify(name) + 'Module', [
        {
          namedImports: [ classify(name) + 'Module' ],
          moduleSpecifier: relativePath,
        },
      ]);

    },
    [ appModulePath ],
  );
}
