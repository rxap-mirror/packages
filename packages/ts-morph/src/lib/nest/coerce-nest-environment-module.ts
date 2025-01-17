import {
  CoerceImports,
  CoerceNestModuleImport,
} from '@rxap/ts-morph';
import { SourceFile } from 'ts-morph';

export function CoerceNestEnvironmentModule(sourceFile: SourceFile) {
  CoerceNestModuleImport(sourceFile, {
    moduleName: 'EnvironmentModule',
    importWriter: w => w.write('EnvironmentModule.register(environment)')
  });
  CoerceImports(sourceFile, [
    {
      moduleSpecifier: '@rxap/nest-utilities',
      namedImports: [ 'EnvironmentModule' ],
    },
    {
      namedImports: [ 'environment' ],
      moduleSpecifier: '../environments/environment',
    },
  ]);
}
