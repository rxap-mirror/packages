import { Rule } from '@angular-devkit/schematics';
import { classify } from '@rxap/schematics-utilities';
import { TsMorphNestProjectTransform } from '../ts-morph-transform';
import { AddNestModuleImport } from './add-nest-module-import';

export interface AddNestModuleToAppModuleOptions {
  project: string;
  feature?: string;
  shared?: boolean;
  name: string;
}

export function AddNestModuleToAppModule(options: AddNestModuleToAppModuleOptions): Rule {
  const { name } = options;
  return TsMorphNestProjectTransform(
    options,
    project => {

      const sourceFile = project.getSourceFileOrThrow('/app/app.module.ts');
      AddNestModuleImport(sourceFile, classify(name) + 'Module', [{
        namedImports: [classify(name) + 'Module'],
        moduleSpecifier: `../${name}/${name}.module`,
      }]);

    },
  );
}
